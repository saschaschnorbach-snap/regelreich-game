import { readFileSync } from 'node:fs'
import path from 'node:path'
import { SCENES } from '../../src/data/scenes.js'

const DATA_FILE = path.resolve(process.cwd(), 'server/data/dialogs.json')

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function buildEmptySeedDialogs() {
  return SCENES.map((scene) => ({ sceneId: scene.id, steps: [] })).sort(
    (a, b) => a.sceneId - b.sceneId
  )
}

function loadSeedDialogsFromDisk() {
  const raw = readFileSync(DATA_FILE, 'utf-8')
  const parsed = JSON.parse(raw)
  if (!parsed || !Array.isArray(parsed.scenes)) {
    throw new Error('Ungültiges Datenformat in dialogs.json')
  }

  return parsed.scenes
}

const BOOTSTRAP_DIALOGS = (() => {
  try {
    return clone(loadSeedDialogsFromDisk())
  } catch {
    return buildEmptySeedDialogs()
  }
})()

export function buildSeedDialogs() {
  try {
    return clone(loadSeedDialogsFromDisk())
  } catch {
    return clone(BOOTSTRAP_DIALOGS)
  }
}

export function buildSeedSceneDialogs(sceneId) {
  const id = Number(sceneId)
  return (
    buildSeedDialogs().find((scene) => scene.sceneId === id) ?? {
      sceneId: id,
      steps: [],
    }
  )
}
