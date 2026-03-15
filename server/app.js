import express from 'express'
import cors from 'cors'
import { SCENES } from '../src/data/scenes.js'
import {
  ensureSceneExists,
  ensureStepNotReferenced,
  normalizeStepPayload,
  validateSceneDialogLogic,
} from './lib/dialogValidation.js'
import {
  getAllSceneDialogs,
  getSceneDialogs,
  replaceAllSceneDialogs,
  updateSceneDialogs,
} from './lib/dialogStore.js'
import { buildSeedDialogs, buildSeedSceneDialogs } from './lib/dialogSeed.js'

const app = express()

function getActivityBranchEdges(step) {
  const activityConfig = step.activityConfig
  if (!activityConfig || typeof activityConfig !== 'object') return []

  const edges = []
  for (const label of ['success', 'failure']) {
    const result = activityConfig[label]
    if (result?.nextStep == null) continue

    const branchIds = [
      result.id,
      ...(Array.isArray(result.branchIds) ? result.branchIds : []),
    ]
      .map((branchId) => String(branchId ?? '').trim())
      .filter(Boolean)

    for (const branchId of branchIds) {
      edges.push({
        fromStepIndex: step.stepIndex,
        toStepIndex: result.nextStep,
        optionId: branchId,
        optionLabel: label,
        target: 'step',
      })
    }
  }

  return edges
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      const isLocalhost = /^https?:\/\/localhost(?::\d+)?$/i.test(origin)
      const isLoopback = /^https?:\/\/127(?:\.\d{1,3}){3}(?::\d+)?$/i.test(
        origin
      )
      const isPrivateLan =
        /^https?:\/\/(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?::\d+)?$/i.test(
          origin
        )
      if (isLocalhost || isLoopback || isPrivateLan) return callback(null, true)
      return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
  })
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'regelreich-dialog-backend' })
})

app.post('/api/dialogs/seed', async (_req, res, next) => {
  try {
    const seeded = buildSeedDialogs()
    await replaceAllSceneDialogs(seeded)
    res.json({
      message: 'Dialoge aus dem Spielstand wurden in die Datenbank übernommen.',
      scenes: seeded.length,
      steps: seeded.reduce((sum, scene) => sum + (scene.steps?.length || 0), 0),
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/scenes/:sceneId/dialogs/seed', async (req, res, next) => {
  try {
    const sceneId = Number(req.params.sceneId)
    ensureSceneExists(sceneId)

    const seededScene = buildSeedSceneDialogs(sceneId)
    const updated = await updateSceneDialogs(sceneId, () => {
      validateSceneDialogLogic(seededScene)
      return seededScene
    })

    res.json({
      message: `Szene ${sceneId} wurde mit Seed-Dialogen befüllt.`,
      sceneId,
      stepCount: updated.steps.length,
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/scenes', async (_req, res, next) => {
  try {
    const dialogs = await getAllSceneDialogs()
    const byId = new Map(dialogs.map((entry) => [entry.sceneId, entry]))

    const result = SCENES.map((scene) => {
      const entry = byId.get(scene.id) ?? { sceneId: scene.id, steps: [] }
      return {
        sceneId: scene.id,
        name: scene.name,
        stepCount: entry.steps.length,
      }
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
})

app.get('/api/scenes/:sceneId/dialogs', async (req, res, next) => {
  try {
    const sceneId = Number(req.params.sceneId)
    ensureSceneExists(sceneId)

    const entry = await getSceneDialogs(sceneId)
    res.json(entry ?? { sceneId, steps: [] })
  } catch (error) {
    next(error)
  }
})

app.get('/api/scenes/:sceneId/dialogs/:stepIndex', async (req, res, next) => {
  try {
    const sceneId = Number(req.params.sceneId)
    const stepIndex = Number(req.params.stepIndex)

    ensureSceneExists(sceneId)

    const entry = await getSceneDialogs(sceneId)
    const step = entry?.steps?.find((item) => item.stepIndex === stepIndex)

    if (!step) {
      return res.status(404).json({
        message: `Step ${stepIndex} in Szene ${sceneId} nicht gefunden.`,
      })
    }

    return res.json(step)
  } catch (error) {
    return next(error)
  }
})

app.get('/api/scenes/:sceneId/flow', async (req, res, next) => {
  try {
    const sceneId = Number(req.params.sceneId)
    ensureSceneExists(sceneId)

    const entry = await getSceneDialogs(sceneId)
    const steps = [...(entry?.steps ?? [])].sort(
      (a, b) => a.stepIndex - b.stepIndex
    )
    const stepSet = new Set(steps.map((step) => step.stepIndex))

    const nodes = steps.map((step) => ({
      id: `step-${step.stepIndex}`,
      stepIndex: step.stepIndex,
      type: step.type ?? 'dialog',
      label: `Step ${step.stepIndex}`,
      optionCount: step.options?.length ?? 0,
    }))

    const edges = []
    for (const step of steps) {
      for (const opt of step.options ?? []) {
        if (opt.nextStep != null) {
          edges.push({
            fromStepIndex: step.stepIndex,
            toStepIndex: opt.nextStep,
            optionId: opt.id,
            optionLabel: opt.label,
            target: 'step',
            dangling: !stepSet.has(opt.nextStep),
          })
          continue
        }

        if (opt.nextPart != null) {
          edges.push({
            fromStepIndex: step.stepIndex,
            toSceneId: opt.nextPart,
            optionId: opt.id,
            optionLabel: opt.label,
            target: 'scene',
            dangling: false,
          })
          continue
        }

        edges.push({
          fromStepIndex: step.stepIndex,
          optionId: opt.id,
          optionLabel: opt.label,
          target: 'end',
          dangling: false,
        })
      }

      for (const edge of getActivityBranchEdges(step)) {
        edges.push({
          ...edge,
          dangling: !stepSet.has(edge.toStepIndex),
        })
      }
    }

    res.json({ sceneId, nodes, edges })
  } catch (error) {
    next(error)
  }
})

app.post('/api/scenes/:sceneId/dialogs', async (req, res, next) => {
  try {
    const sceneId = Number(req.params.sceneId)
    ensureSceneExists(sceneId)

    const current = await getSceneDialogs(sceneId)
    const maxStep = Math.max(
      -1,
      ...(current?.steps ?? []).map((step) => step.stepIndex)
    )
    const normalized = normalizeStepPayload(req.body, maxStep + 1)

    const updated = await updateSceneDialogs(sceneId, (entry) => {
      const exists = entry.steps.some(
        (step) => step.stepIndex === normalized.stepIndex
      )
      if (exists) {
        const error = new Error(
          `Step ${normalized.stepIndex} existiert bereits.`
        )
        error.status = 409
        throw error
      }

      const next = { ...entry, steps: [...entry.steps, normalized] }
      validateSceneDialogLogic(next)
      return next
    })

    res.status(201).json(updated)
  } catch (error) {
    next(error)
  }
})

app.put('/api/scenes/:sceneId/dialogs/:stepIndex', async (req, res, next) => {
  try {
    const sceneId = Number(req.params.sceneId)
    const stepIndex = Number(req.params.stepIndex)

    ensureSceneExists(sceneId)
    const normalized = normalizeStepPayload(req.body, stepIndex)

    const updated = await updateSceneDialogs(sceneId, (entry) => {
      const exists = entry.steps.some((step) => step.stepIndex === stepIndex)
      if (!exists) {
        const error = new Error(`Step ${stepIndex} existiert nicht.`)
        error.status = 404
        throw error
      }

      const nextSteps = entry.steps.map((step) =>
        step.stepIndex === stepIndex ? { ...normalized, stepIndex } : step
      )

      const next = { ...entry, steps: nextSteps }
      validateSceneDialogLogic(next)
      return next
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

app.delete(
  '/api/scenes/:sceneId/dialogs/:stepIndex',
  async (req, res, next) => {
    try {
      const sceneId = Number(req.params.sceneId)
      const stepIndex = Number(req.params.stepIndex)

      ensureSceneExists(sceneId)

      const updated = await updateSceneDialogs(sceneId, (entry) => {
        const exists = entry.steps.some((step) => step.stepIndex === stepIndex)
        if (!exists) {
          const error = new Error(`Step ${stepIndex} existiert nicht.`)
          error.status = 404
          throw error
        }

        ensureStepNotReferenced(entry, stepIndex)

        const next = {
          ...entry,
          steps: entry.steps.filter((step) => step.stepIndex !== stepIndex),
        }

        validateSceneDialogLogic(next)
        return next
      })

      res.json(updated)
    } catch (error) {
      next(error)
    }
  }
)

app.use((error, _req, res, _next) => {
  const status = error.status ?? 500
  res.status(status).json({
    message: error.message ?? 'Unbekannter Fehler',
    status,
  })
})

export { app }
