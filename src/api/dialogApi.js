import { SCENES } from '../data/scenes.js'

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '')
  .trim()
  .replace(/\/$/, '')

let staticDialogsPromise = null

async function loadStaticDialogs() {
  if (!staticDialogsPromise) {
    staticDialogsPromise = fetch('/dialogs.json', { cache: 'no-store' }).then(
      async (response) => {
        if (!response.ok) {
          throw new Error(`Statische Dialoge konnten nicht geladen werden (${response.status}).`)
        }

        return response.json()
      }
    )
  }

  return staticDialogsPromise
}

function getStaticSceneEntry(dialogs, sceneId) {
  return dialogs?.scenes?.find((entry) => Number(entry?.sceneId) === Number(sceneId))
}

function buildStaticFlow(entry, sceneId) {
  const steps = [...(entry?.steps || [])].sort((a, b) => a.stepIndex - b.stepIndex)
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
  }

  return { sceneId: Number(sceneId), nodes, edges }
}

async function requestStatic(path) {
  const dialogs = await loadStaticDialogs()

  if (path === '/api/scenes') {
    return SCENES.map((scene) => {
      const entry = getStaticSceneEntry(dialogs, scene.id) ?? {
        sceneId: scene.id,
        steps: [],
      }
      return {
        sceneId: scene.id,
        name: scene.name,
        stepCount: entry.steps.length,
      }
    })
  }

  const sceneDialogsMatch = path.match(/^\/api\/scenes\/(-?\d+)\/dialogs$/)
  if (sceneDialogsMatch) {
    const sceneId = Number(sceneDialogsMatch[1])
    return getStaticSceneEntry(dialogs, sceneId) ?? { sceneId, steps: [] }
  }

  const sceneStepMatch = path.match(/^\/api\/scenes\/(-?\d+)\/dialogs\/(\d+)$/)
  if (sceneStepMatch) {
    const sceneId = Number(sceneStepMatch[1])
    const stepIndex = Number(sceneStepMatch[2])
    const entry = getStaticSceneEntry(dialogs, sceneId)
    const step = entry?.steps?.find((item) => Number(item?.stepIndex) === stepIndex)

    if (!step) {
      throw new Error(`Step ${stepIndex} in Szene ${sceneId} nicht gefunden.`)
    }

    return step
  }

  const sceneFlowMatch = path.match(/^\/api\/scenes\/(-?\d+)\/flow$/)
  if (sceneFlowMatch) {
    const sceneId = Number(sceneFlowMatch[1])
    const entry = getStaticSceneEntry(dialogs, sceneId) ?? { sceneId, steps: [] }
    return buildStaticFlow(entry, sceneId)
  }

  throw new Error(`Kein statischer Fallback für ${path}.`)
}

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    })

    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json') ? await response.json() : null

    if (!response.ok) {
      const isReadRequest = String(options.method || 'GET').toUpperCase() === 'GET'
      if (isReadRequest && [404, 500].includes(response.status)) {
        return requestStatic(path)
      }

      const message = payload?.message || `API-Fehler (${response.status})`
      throw new Error(message)
    }

    return payload
  } catch (error) {
    const isReadRequest = String(options.method || 'GET').toUpperCase() === 'GET'
    if (isReadRequest) {
      return requestStatic(path)
    }

    throw error
  }
}

export function getScenes() {
  return request('/api/scenes')
}

export function getSceneDialogs(sceneId) {
  return request(`/api/scenes/${sceneId}/dialogs`)
}

export function createSceneDialogStep(sceneId, stepPayload) {
  return request(`/api/scenes/${sceneId}/dialogs`, {
    method: 'POST',
    body: JSON.stringify(stepPayload),
  })
}

export function updateSceneDialogStep(sceneId, stepIndex, stepPayload) {
  return request(`/api/scenes/${sceneId}/dialogs/${stepIndex}`, {
    method: 'PUT',
    body: JSON.stringify(stepPayload),
  })
}

export function deleteSceneDialogStep(sceneId, stepIndex) {
  return request(`/api/scenes/${sceneId}/dialogs/${stepIndex}`, {
    method: 'DELETE',
  })
}

export function getSceneFlow(sceneId) {
  return request(`/api/scenes/${sceneId}/flow`)
}

export function seedDialogsFromGame() {
  return request('/api/dialogs/seed', {
    method: 'POST',
  })
}

export function seedSceneDialogs(sceneId) {
  return request(`/api/scenes/${sceneId}/dialogs/seed`, {
    method: 'POST',
  })
}
