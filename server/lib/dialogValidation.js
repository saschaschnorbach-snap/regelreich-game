import { SCENES } from '../../src/data/scenes.js'
const HOST_IDS = new Set([
  'selected',
  'clara',
  'uwe',
  'ambassador',
  'emma',
  'konrad',
  'didi',
])
const STEP_TYPES = new Set([
  'intro',
  'example',
  'activity',
  'summary',
  'transition',
  'dialog',
])

function assert(condition, message, status = 400) {
  if (!condition) {
    const error = new Error(message)
    error.status = status
    throw error
  }
}

function normalizeDialogText(rawText) {
  return String(rawText).replace(/\r\n?/g, '\n').trim()
}

function normalizeBranchId(rawId, message) {
  const branchId = String(rawId ?? '').trim()
  assert(branchId, message)
  return branchId
}

function collectResultBranchIds(resultConfig, label, stepIndex) {
  if (resultConfig == null) return []

  assert(
    resultConfig && typeof resultConfig === 'object',
    `activityConfig.${label} in Step ${stepIndex} muss ein Objekt sein.`
  )

  const ids = [
    normalizeBranchId(
      resultConfig.id,
      `activityConfig.${label}.id in Step ${stepIndex} ist erforderlich.`
    ),
  ]
  assert(
    Number.isInteger(resultConfig.nextStep) && resultConfig.nextStep >= 0,
    `activityConfig.${label}.nextStep in Step ${stepIndex} muss eine ganze Zahl >= 0 sein.`
  )

  if (resultConfig.branchIds != null) {
    assert(
      Array.isArray(resultConfig.branchIds),
      `activityConfig.${label}.branchIds in Step ${stepIndex} muss ein Array sein.`
    )
    for (const [index, branchId] of resultConfig.branchIds.entries()) {
      ids.push(
        normalizeBranchId(
          branchId,
          `activityConfig.${label}.branchIds[${index}] in Step ${stepIndex} darf nicht leer sein.`
        )
      )
    }
  }

  return ids
}

function getStepBranchTargets(step) {
  const targets = []

  for (const option of step.options ?? []) {
    if (option.nextStep != null) {
      targets.push({ nextStep: option.nextStep, branchIds: [option.id] })
    }
  }

  const activityConfig = step.activityConfig
  if (activityConfig && typeof activityConfig === 'object') {
    for (const label of ['success', 'failure']) {
      const resultConfig = activityConfig[label]
      if (resultConfig?.nextStep != null) {
        targets.push({
          nextStep: resultConfig.nextStep,
          branchIds: collectResultBranchIds(
            resultConfig,
            label,
            step.stepIndex
          ),
        })
      }
    }
  }

  return targets
}

export function ensureSceneExists(sceneId) {
  const exists = SCENES.some((scene) => scene.id === Number(sceneId))
  assert(exists, `Szene ${sceneId} existiert nicht.`, 404)
}

export function normalizeStepPayload(payload, fallbackStepIndex = null) {
  assert(
    payload && typeof payload === 'object',
    'Request-Body muss ein Objekt sein.'
  )

  const stepIndex = payload.stepIndex ?? fallbackStepIndex
  assert(
    Number.isInteger(stepIndex) && stepIndex >= 0,
    'stepIndex muss eine ganze Zahl >= 0 sein.'
  )
  const type = String(payload.type ?? 'dialog').toLowerCase()
  assert(
    STEP_TYPES.has(type),
    'type muss einer der Werte intro, example, activity, summary, transition oder dialog sein.'
  )

  const speechBubbles = payload.speechBubbles ?? []
  assert(Array.isArray(speechBubbles), 'speechBubbles muss ein Array sein.')

  const options = payload.options ?? []
  assert(Array.isArray(options), 'options muss ein Array sein.')
  const activityConfig =
    payload.activityConfig == null ? null : payload.activityConfig
  assert(
    activityConfig == null || typeof activityConfig === 'object',
    'activityConfig muss ein Objekt sein.'
  )

  const normalizedBubbles = speechBubbles.map((bubble, index) => {
    assert(
      bubble && typeof bubble === 'object',
      `speechBubbles[${index}] muss ein Objekt sein.`
    )
    const normalizedText = normalizeDialogText(bubble.text ?? '')
    assert(normalizedText, `speechBubbles[${index}].text ist erforderlich.`)
    const hostId = String(
      bubble.hostId ?? bubble.characterId ?? 'selected'
    ).toLowerCase()
    assert(
      HOST_IDS.has(hostId),
      `speechBubbles[${index}].hostId muss einer der bekannten Sprecherwerte sein.`
    )
    const showOnOptionId =
      bubble.showOnOptionId == null
        ? null
        : String(bubble.showOnOptionId).trim()
    assert(
      showOnOptionId == null || showOnOptionId.length > 0,
      `speechBubbles[${index}].showOnOptionId darf nicht leer sein.`
    )

    return {
      hostId,
      text: normalizedText,
      ...(showOnOptionId ? { showOnOptionId } : {}),
    }
  })

  const normalizedOptions = options.map((option, index) => {
    assert(
      option && typeof option === 'object',
      `options[${index}] muss ein Objekt sein.`
    )
    assert(
      typeof option.label === 'string' && option.label.trim(),
      `options[${index}].label ist erforderlich.`
    )
    const id = normalizeBranchId(
      option.id ?? `opt-${stepIndex}-${index}`,
      `options[${index}].id darf nicht leer sein.`
    )

    const normalized = {
      id,
      label: option.label.trim(),
    }

    assert(
      option.nextStep == null || option.nextPart == null,
      `options[${index}] darf nicht gleichzeitig nextStep und nextPart setzen.`
    )

    if (option.nextStep != null) {
      assert(
        Number.isInteger(option.nextStep) && option.nextStep >= 0,
        `options[${index}].nextStep muss eine ganze Zahl >= 0 sein.`
      )
      normalized.nextStep = option.nextStep
    }

    if (option.nextPart != null) {
      assert(
        Number.isInteger(option.nextPart),
        `options[${index}].nextPart muss eine ganze Zahl sein.`
      )
      normalized.nextPart = option.nextPart
    }

    return normalized
  })

  return {
    stepIndex,
    type,
    speechBubbles: normalizedBubbles,
    options: normalizedOptions,
    ...(activityConfig ? { activityConfig } : {}),
  }
}

export function validateSceneDialogLogic(sceneEntry) {
  const steps = sceneEntry.steps ?? []
  const stepIds = new Set(steps.map((step) => step.stepIndex))
  assert(
    stepIds.size === steps.length,
    `Szene ${sceneEntry.sceneId}: stepIndex muss eindeutig sein.`
  )
  const inboundBranchIdsByStep = new Map()

  for (const step of steps) {
    assert(
      Number.isInteger(step.stepIndex) && step.stepIndex >= 0,
      `Szene ${sceneEntry.sceneId}: ungültiger stepIndex ${step.stepIndex}.`
    )
    const type = String(step.type ?? 'dialog').toLowerCase()
    assert(
      STEP_TYPES.has(type),
      `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: ungültiger type ${type}.`
    )
    assert(
      Array.isArray(step.speechBubbles),
      `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: speechBubbles muss ein Array sein.`
    )
    assert(
      Array.isArray(step.options),
      `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: options muss ein Array sein.`
    )
    const optionIds = new Set()

    for (const option of step.options) {
      assert(
        option && typeof option === 'object',
        `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: option muss ein Objekt sein.`
      )
      const optionId = normalizeBranchId(
        option.id,
        `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: option.id ist erforderlich.`
      )
      assert(
        !optionIds.has(optionId),
        `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: option.id ${optionId} ist doppelt.`
      )
      optionIds.add(optionId)
      assert(
        option.nextStep == null || option.nextPart == null,
        `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: option.id ${optionId} darf nicht gleichzeitig nextStep und nextPart setzen.`
      )
    }

    for (const bubble of step.speechBubbles) {
      const hostId = String(bubble?.hostId ?? '').toLowerCase()
      assert(
        HOST_IDS.has(hostId),
        `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: ungültiger hostId ${hostId}.`
      )
    }

    for (const option of step.options) {
      if (option.nextStep != null) {
        assert(
          stepIds.has(option.nextStep),
          `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: nextStep ${option.nextStep} existiert nicht.`
        )
      }

      if (option.nextPart != null) {
        const targetSceneExists = SCENES.some(
          (scene) => scene.id === option.nextPart
        )
        assert(
          targetSceneExists,
          `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: nextPart ${option.nextPart} existiert nicht.`
        )
      }
    }

    for (const target of getStepBranchTargets(step)) {
      const branchIds = inboundBranchIdsByStep.get(target.nextStep) ?? new Set()
      for (const branchId of target.branchIds) {
        assert(
          !branchIds.has(branchId),
          `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: Branch-ID ${branchId} verweist mehrfach auf Step ${target.nextStep}.`
        )
        branchIds.add(branchId)
      }
      inboundBranchIdsByStep.set(target.nextStep, branchIds)
    }
  }

  for (const step of steps) {
    const inboundBranchIds =
      inboundBranchIdsByStep.get(step.stepIndex) ?? new Set()
    for (const [index, bubble] of step.speechBubbles.entries()) {
      if (bubble?.showOnOptionId == null) continue
      const branchId = normalizeBranchId(
        bubble.showOnOptionId,
        `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: speechBubbles[${index}].showOnOptionId darf nicht leer sein.`
      )
      assert(
        inboundBranchIds.has(branchId),
        `Szene ${sceneEntry.sceneId}, Step ${step.stepIndex}: showOnOptionId ${branchId} hat keinen eingehenden Branch auf diesen Step.`
      )
    }
  }
}

export function validateDialogsData(data) {
  assert(
    data && typeof data === 'object',
    'Dialogdaten müssen ein Objekt sein.'
  )
  assert(
    Array.isArray(data.scenes),
    'dialogs.json muss ein scenes-Array enthalten.'
  )

  const seenSceneIds = new Set()
  for (const [index, sceneEntry] of data.scenes.entries()) {
    assert(
      sceneEntry && typeof sceneEntry === 'object',
      `scenes[${index}] muss ein Objekt sein.`
    )
    assert(
      Number.isInteger(sceneEntry.sceneId),
      `scenes[${index}].sceneId muss eine ganze Zahl sein.`
    )
    assert(
      !seenSceneIds.has(sceneEntry.sceneId),
      `sceneId ${sceneEntry.sceneId} ist doppelt.`
    )
    seenSceneIds.add(sceneEntry.sceneId)
    ensureSceneExists(sceneEntry.sceneId)
    assert(
      Array.isArray(sceneEntry.steps),
      `Szene ${sceneEntry.sceneId}: steps muss ein Array sein.`
    )
    validateSceneDialogLogic(sceneEntry)
  }
}

export function ensureStepNotReferenced(sceneEntry, stepIndex) {
  const source = sceneEntry.steps.find((step) =>
    (step.options ?? []).some((option) => option.nextStep === stepIndex)
  )

  assert(
    !source,
    `Step ${stepIndex} kann nicht gelöscht werden, weil Step ${source?.stepIndex} darauf verweist.`,
    409
  )
}
