import { readFile, stat, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { buildSeedDialogs } from './dialogSeed.js'
import { validateDialogsData } from './dialogValidation.js'
import { SCENES } from '../../src/data/scenes.js'

const DATA_FILE = fileURLToPath(new URL('../data/dialogs.json', import.meta.url))
let writeQueue = Promise.resolve()

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function normalizeScenes(scenes) {
  const sceneMap = new Map(
    (scenes || []).map((scene) => [Number(scene.sceneId), clone(scene)])
  )

  for (const scene of SCENES) {
    if (!sceneMap.has(scene.id)) {
      sceneMap.set(scene.id, { sceneId: scene.id, steps: [] })
    }
  }

  return [...sceneMap.values()].sort(
    (a, b) => Number(a.sceneId) - Number(b.sceneId)
  )
}

async function writeValidatedData(nextData) {
  const scenes = normalizeScenes(nextData.scenes)
  const validated = { scenes }
  validateDialogsData(validated)
  const content = `${JSON.stringify(validated, null, 2)}\n`
  await writeFile(DATA_FILE, content, 'utf-8')
  return validated
}

async function readData() {
  try {
    const raw = await readFile(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    const normalized = { scenes: normalizeScenes(parsed?.scenes) }
    validateDialogsData(normalized)
    return normalized
  } catch (error) {
    if (error?.code === 'ENOENT') {
      const seeded = { scenes: buildSeedDialogs() }
      return writeValidatedData(seeded)
    }
    throw error
  }
}

function queueWrite(nextData) {
  writeQueue = writeQueue.then(async () => {
    await writeValidatedData(nextData)
  })
  return writeQueue
}

export async function getAllSceneDialogs() {
  const data = await readData()
  const scenes = normalizeScenes(data.scenes)

  const dataStat = await stat(DATA_FILE).catch(() => null)
  if (dataStat && scenes.length !== data.scenes.length) {
    await queueWrite({ scenes })
  }

  return scenes
}

export async function getSceneDialogs(sceneId) {
  const all = await getAllSceneDialogs()
  return all.find((entry) => entry.sceneId === Number(sceneId)) ?? null
}

export async function updateSceneDialogs(sceneId, updater) {
  const data = await readData()
  const index = data.scenes.findIndex(
    (entry) => entry.sceneId === Number(sceneId)
  )

  if (index === -1) {
    data.scenes.push({ sceneId: Number(sceneId), steps: [] })
  }

  const effectiveIndex = index === -1 ? data.scenes.length - 1 : index
  const current = clone(data.scenes[effectiveIndex])
  const updated = updater(current)

  data.scenes[effectiveIndex] = {
    sceneId: Number(sceneId),
    steps: Array.isArray(updated.steps)
      ? [...updated.steps].sort((a, b) => a.stepIndex - b.stepIndex)
      : [],
  }

  await queueWrite(data)
  return clone(data.scenes[effectiveIndex])
}

export async function replaceAllSceneDialogs(nextScenes) {
  const data = await readData()
  data.scenes = Array.isArray(nextScenes)
    ? [...nextScenes].sort((a, b) => Number(a.sceneId) - Number(b.sceneId))
    : []

  await queueWrite(data)
  return clone(data.scenes)
}
