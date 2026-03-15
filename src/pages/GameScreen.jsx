import { useEffect, useRef, useState } from 'react'
import { Scene } from '../components/scene/Scene.jsx'
import { MonitorActivityScene } from '../components/scene/MonitorActivityScene.jsx'
import { SceneBackground } from '../components/scene/SceneBackground.jsx'
import { getSceneById } from '../data/scenes.js'
import { getPart1Step } from '../data/conversations/part1.js'
import { getSceneDialogs } from '../api/dialogApi.js'

const PART0_FALLBACK_STEPS = [
  {
    stepIndex: 0,
    type: 'intro',
    speechBubbles: [
      {
        hostId: 'ambassador',
        text: 'Willkommen in Regelreich.\n\nIn dieser Stadt entstehen Regeln nicht hinter verschlossenen Türen – sie entstehen im Gespräch.',
      },
      {
        hostId: 'ambassador',
        text: 'Neue Vorschläge werden veröffentlicht. Bürger und Bürgerinnen kommentieren. Ideen werden diskutiert, verändert, manchmal verworfen.',
      },
      {
        hostId: 'ambassador',
        text: 'Der Mittelpunkt dieser Debatten ist TikTalk.\n\nEine Plattform, auf der aus Meinungen Trends werden – und aus Trends mitunter offizielle Entscheidungen.',
      },
    ],
    options: [
      { id: 'plausible', label: 'Klingt vernünftig.', nextStep: 1 },
      { id: 'tiktalk_ernst', label: 'TikTalk – dein Ernst?', nextStep: 1 },
    ],
  },
  {
    stepIndex: 1,
    type: 'intro',
    speechBubbles: [
      {
        hostId: 'ambassador',
        text: 'Lange Zeit galt TikTalk als lebhaft, aber berechenbar.\n\nMan wusste: Es wird diskutiert, es wird kommentiert – und irgendwann kehrt wieder Ordnung ein.',
      },
      {
        hostId: 'ambassador',
        text: 'Doch in den letzten Monaten hat sich etwas verschoben.\n\nBestimmte Diskussionen eskalieren schneller.\n\nEinige Beiträge verbreiten sich ungewöhnlich stark.\n\nUnd manchmal wirkt es, als würde sich eine Richtung durchsetzen, noch bevor jemand gefragt hat, ob es überhaupt eine Richtung braucht.',
      },
    ],
    options: [{ id: 'zufall', label: 'Zufall?', nextStep: 2 }],
  },
  {
    stepIndex: 2,
    type: 'intro',
    speechBubbles: [
      {
        hostId: 'ambassador',
        text: 'Im Media Lab spricht man inzwischen von drei besonders aktiven Profilen.\n\nSie treten unter Pseudonymen auf.\n\nSie behaupten, sie würden Debatten nur ‚beschleunigen‘.\n\nIntern werden sie ‘Die notorischen Drei’ genannt.',
      },
    ],
    options: [{ id: 'wer_sie', label: 'Wer sind sie?', nextStep: 3 }],
  },
  {
    stepIndex: 3,
    type: 'intro',
    speechBubbles: [
      {
        hostId: 'ambassador',
        text: 'Emma Pör. Konrad Sens. Didi Fam.\n\nSie arbeiten verdeckt – und sie haben ein bemerkenswertes Talent.',
      },
    ],
    options: [{ id: 'welches_talent', label: 'Welches Talent?', nextStep: 4 }],
  },
  {
    stepIndex: 4,
    type: 'intro',
    speechBubbles: [
      {
        hostId: 'ambassador',
        text: 'Diskussionen in eine Richtung zu lenken.\n\nMal lauter, mal leiser – aber selten zufällig.',
      },
      {
        hostId: 'ambassador',
        text: 'Du bist hier, um bei einem Sommerpraktikum bei der Aufklärung zu helfen.\n\nDeine Aufgabe: Herausfinden, wie sie das tun.',
      },
    ],
    options: [
      { id: 'spannend', label: 'Klingt spannend.', nextStep: 5 },
      {
        id: 'hoffe_unbekannt',
        label: 'Ich hoffe, sie wissen nicht, dass ich komme.',
        nextStep: 5,
      },
    ],
  },
  {
    stepIndex: 5,
    type: 'transition',
    speechBubbles: [
      {
        hostId: 'ambassador',
        text: 'Stark. Neugier ist hier ein Vorteil.\n\nDann legen wir direkt los.',
        showOnOptionId: 'spannend',
      },
      {
        hostId: 'ambassador',
        text: 'Keine Sorge.\n\nSie wissen nur, dass jemand kommt – nicht, wer.',
        showOnOptionId: 'hoffe_unbekannt',
      },
    ],
    options: [{ id: 'continue', label: 'Zum Media Lab gehen', nextPart: 1 }],
  },
]
const PART2_ACTIVITY1_FALLBACK_CONFIG = {
  sentences: [
    {
      id: 's1',
      text: 'Die Stadt plant, fuer oeffentliche Veranstaltungen eine einheitliche Regenschirmfarbe vorzuschlagen.',
    },
    {
      id: 's2',
      text: 'Gestern stand eine aeltere Dame im Regen, weil ihr alter Schirm nicht mehr erlaubt war.',
    },
    {
      id: 's3',
      text: 'Der Vorschlag soll naechste Woche abgestimmt werden.',
    },
    {
      id: 's4',
      text: 'Schon wieder werden die normalen Leute im Stich gelassen.',
    },
    {
      id: 's5',
      text: 'Wenn das so weitergeht, ist bald nichts Alltaegliches mehr sicher.',
    },
  ],
  correctSentenceIds: ['s2', 's4', 's5'],
  success: { id: 'rightA', nextStep: 32 },
  failure: { id: 'wrongA', nextStep: 31 },
}
const PART2_ACTIVITY2_FALLBACK_CONFIG = {
  mode: 'intensity-choice',
  title: 'Aktivität 2: Intensitätswahl',
  topic:
    'Thema: Farbverlauf in den Wartebereichen des Hauptbahnhofs',
  choices: [
    {
      id: 'a',
      text: '„Die Stadt plant einen einheitlichen Farbverlauf für Wartebereiche im Hauptbahnhof.“',
    },
    {
      id: 'b',
      text: '„Der geplante Farbverlauf im Wartebereich sorgt für Diskussionen. Manche halten ihn für eine überflüssige Dramatisierung des Bahnalltags.“',
    },
    {
      id: 'c',
      text: '„Jetzt soll uns sogar vorgeschrieben werden, wie wir uns beim Warten fühlen. Was kommt als Nächstes – eine Pflichtstimmung im Abteil?“',
    },
  ],
  correctChoiceId: 'c',
  success: { id: 'rightB', nextStep: 42 },
  failure: { id: 'wrongB', nextStep: 41 },
}
const PART3_ACTIVITY1_FALLBACK_CONFIG = {
  mode: 'intensity-choice',
  title: 'Aktivität 1: Trend-Detektor',
  topic: 'Thema: Einfuehrung eines verpflichtenden Wochenmottos',
  randomizeChoices: true,
  choices: [
    {
      id: 'p1',
      text: '„Die Stadt prüft die Einführung eines wöchentlichen Mottos für öffentliche Einrichtungen.“',
    },
    {
      id: 'p2',
      text: '„Immer mehr Menschen sprechen sich für ein Wochenmotto aus.“',
    },
    {
      id: 'p3',
      text: '„Inzwischen sind sich alle einig: Ein Wochenmotto bringt endlich klare Linie ins Stadtleben.”',
    },
  ],
  correctChoiceId: 'p3',
  success: { id: 'rightA', nextStep: 32 },
  failure: { id: 'wrongA', nextStep: 31 },
}
const PART3_ACTIVITY2_FALLBACK_CONFIG = {
  mode: 'consensus-boosters',
  title: 'Aktivität 2: Konsens-Verstärker',
  topic: 'Thema: Einführung einer offiziellen Geh-Richtung in Fußgängerzonen',
  prompt:
    'Aktivität 2: Welche Ergänzungen lassen den Beitrag so wirken, als gäbe es bereits breiten Konsens?',
  neutralPost:
    '„Die Stadt prüft die Einführung einer festen Geh-Richtung in Fußgängerzonen. Der Vorschlag wird kommende Woche diskutiert.“',
  choices: [
    { id: 'a', text: '„Ich finde die Idee interessant.“' },
    { id: 'b', text: '„Mein Nachbar unterstützt das inzwischen auch.“' },
    {
      id: 'c',
      text: '„89 % sprechen sich laut einer aktuellen Umfrage dafür aus.“',
    },
    { id: 'd', text: '„#EndlichOrdnung“' },
    { id: 'e', text: '„Dieser Beitrag hat bereits mehr als 4.200 Likes.“' },
    { id: 'f', text: '„Mal sehen, was daraus wird.“' },
  ],
  correctChoiceIds: ['c', 'e'],
  success: { id: 'rightB', nextStep: 5 },
  failure: { id: 'wrongB', nextStep: 41 },
}
const PART4_ACTIVITY1_FALLBACK_CONFIG = {
  mode: 'bucket-sort',
  title: 'Aktivität 1: Sache oder Angriff',
  topic: 'Thema: Einheitliche Aufzugmusik in Verwaltungsgebäuden',
  prompt:
    'Ordne die Aussagen ein: Was ist Kritik am Inhalt und was ist ein Angriff auf Personen?',
  unassignedLabel: 'Beiträge',
  bucketDefinitions: [
    { id: 'content', label: 'Kritik am Inhalt' },
    { id: 'person', label: 'Angriff auf Person' },
  ],
  items: [
    {
      id: 'a1',
      text: '„Die neue Aufzugmusik ist deutlich lauter als bisher und überdeckt Gespräche.“',
    },
    {
      id: 'a2',
      text: '„Wer diese Musik gut findet, hat offenbar keinen Geschmack.“',
    },
    {
      id: 'a3',
      text: '„Die Entscheidung wurde ohne ausreichende Rückmeldung der Nutzer getroffen.“',
    },
    {
      id: 'a4',
      text: '„Typisch für diese Entscheidungsträger - immer am Alltag vorbei.“',
    },
  ],
  correctAssignments: {
    a1: 'content',
    a2: 'person',
    a3: 'content',
    a4: 'person',
  },
  success: { id: 'rightA', nextStep: 4 },
  failure: { id: 'wrongA', nextStep: 31 },
}
const PART4_ACTIVITY2_FALLBACK_CONFIG = {
  mode: 'intensity-choice',
  title: 'Aktivität 2: Figurentest',
  topic: 'Thema: Offizielle Stadtfarbe',
  randomizeChoices: true,
  choices: [
    {
      id: 'a',
      text: '„Ich bezweifle, dass man Beige aus dem All wirklich gut erkennt.“',
    },
    {
      id: 'b',
      text: '„Beige als Leuchtsignal für Außerirdische - das muss man sich erstmal trauen.“',
    },
    {
      id: 'c',
      text: '„Kein Wunder, dass so ein Vorschlag von jemandem kommt, der offensichtlich keine Ahnung von Gestaltung hat.“',
    },
  ],
  correctChoiceId: 'c',
  success: { id: 'rightB', nextStep: 5 },
  failure: { id: 'wrongB', nextStep: 41 },
}

function resolveSentenceMarkingConfig(config, fallback) {
  if (!config || typeof config !== 'object') return fallback
  return {
    ...fallback,
    ...config,
    sentences:
      Array.isArray(config.sentences) && config.sentences.length
        ? config.sentences
        : fallback.sentences,
    correctSentenceIds:
      Array.isArray(config.correctSentenceIds) &&
      config.correctSentenceIds.length
        ? config.correctSentenceIds
        : fallback.correctSentenceIds,
    success:
      config.success && typeof config.success === 'object'
        ? config.success
        : fallback.success,
    failure:
      config.failure && typeof config.failure === 'object'
        ? config.failure
        : fallback.failure,
  }
}

function resolveIntensityChoiceConfig(config, fallback) {
  if (!config || typeof config !== 'object') return fallback
  return {
    ...fallback,
    ...config,
    choices:
      Array.isArray(config.choices) && config.choices.length
        ? config.choices
        : fallback.choices,
    success:
      config.success && typeof config.success === 'object'
        ? config.success
        : fallback.success,
    failure:
      config.failure && typeof config.failure === 'object'
        ? config.failure
        : fallback.failure,
    correctChoiceId: config.correctChoiceId || fallback.correctChoiceId,
  }
}

function resolveBoosterChoiceConfig(config, fallback) {
  if (!config || typeof config !== 'object') return fallback
  return {
    ...fallback,
    ...config,
    choices:
      Array.isArray(config.choices) && config.choices.length
        ? config.choices
        : fallback.choices,
    correctChoiceIds:
      Array.isArray(config.correctChoiceIds) && config.correctChoiceIds.length
        ? config.correctChoiceIds
        : fallback.correctChoiceIds,
    success:
      config.success && typeof config.success === 'object'
        ? config.success
        : fallback.success,
    failure:
      config.failure && typeof config.failure === 'object'
        ? config.failure
        : fallback.failure,
  }
}

function resolveBucketSortConfig(config, fallback) {
  if (!config || typeof config !== 'object') return fallback
  return {
    ...fallback,
    ...config,
    bucketDefinitions:
      Array.isArray(config.bucketDefinitions) && config.bucketDefinitions.length
        ? config.bucketDefinitions
        : fallback.bucketDefinitions,
    items:
      Array.isArray(config.items) && config.items.length
        ? config.items
        : fallback.items,
    correctAssignments:
      config.correctAssignments && typeof config.correctAssignments === 'object'
        ? config.correctAssignments
        : fallback.correctAssignments,
    success:
      config.success && typeof config.success === 'object'
        ? config.success
        : fallback.success,
    failure:
      config.failure && typeof config.failure === 'object'
        ? config.failure
        : fallback.failure,
  }
}

function shuffleArray(items = []) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function isAvatarOption(option) {
  const id = String(option?.id || '').toLowerCase()
  return (
    option?.kind === 'avatar' ||
    id === 'avatar1' ||
    id === 'avatar2' ||
    id === 'avatar3'
  )
}

function getHostFullName(hostId) {
  if (hostId === 'ambassador') return 'Botschafterin Regelreich'
  if (hostId === 'clara') return 'Klara Blick'
  if (hostId === 'uwe') return 'Uwe R. Blick'
  if (hostId === 'emma') return 'Emma Pör'
  if (hostId === 'konrad') return 'Konrad Sens'
  if (hostId === 'didi') return 'Didi Fam'
  return 'Host'
}

function normalizeHostId(raw, selectedHostId) {
  const id = String(raw || 'selected').toLowerCase()
  if (id === 'ambassador') return 'ambassador'
  if (
    id === 'clara' ||
    id === 'uwe' ||
    id === 'emma' ||
    id === 'konrad' ||
    id === 'didi'
  ) {
    return id
  }
  if (id === 'selected') return selectedHostId || 'selected'
  return selectedHostId || 'selected'
}

function buildDialogsVersionId(steps = []) {
  const payload = JSON.stringify(steps)
  let hash = 0
  for (let i = 0; i < payload.length; i += 1) {
    hash = (hash * 31 + payload.charCodeAt(i)) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

function getStepZeroPreview(entry) {
  const zeroStep =
    (entry?.steps || []).find((step) => Number(step?.stepIndex) === 0) ||
    (entry?.steps || [])[0]
  const firstBubble = (zeroStep?.speechBubbles || [])[0]
  return String(firstBubble?.text || '')
    .replace(/\s+/g, ' ')
    .slice(0, 40)
}

function getFallbackStep(scene, currentPart, stepIndex) {
  if (currentPart === 0) {
    return (
      PART0_FALLBACK_STEPS.find((step) => step.stepIndex === stepIndex) ||
      PART0_FALLBACK_STEPS[0]
    )
  }

  if (currentPart === 1) {
    const step = getPart1Step(stepIndex)
    return {
      stepIndex: step.stepIndex,
      speechBubbles: (step.speechBubbles || []).map((bubble) => ({
        hostId: bubble.characterId === 'uwe' ? 'uwe' : 'clara',
        text: bubble.text,
        showOnOptionId: bubble.showOnOptionId,
      })),
      options: step.options || [],
    }
  }

  return {
    stepIndex: 0,
    speechBubbles: (scene.speechBubbles || []).map((bubble) => ({
      hostId: bubble.characterId === 'host' ? 'selected' : bubble.characterId,
      text: bubble.text,
    })),
    options: scene.interaction?.options || [],
  }
}

function createTransitionFlags(overrides = {}) {
  return {
    resetOnPart2Activity2: false,
    resetOnPart3Activity2: false,
    resetOnPart3Summary: false,
    resetOnPart4Activity2: false,
    resetOnPart4Summary: false,
    ...overrides,
  }
}

function isSingleButtonTransitionStep(currentPart, stepIndex) {
  return (
    (Number(currentPart) === 2 && Number(stepIndex) === 52) ||
    (Number(currentPart) === 3 && Number(stepIndex) === 52) ||
    (Number(currentPart) === 4 && Number(stepIndex) === 53)
  )
}

function getSingleButtonTransitionConfig(currentPart, stepIndex) {
  if (Number(currentPart) === 2 && Number(stepIndex) === 52) {
    return {
      backgroundImage: '/backgrounds/treppenhaus_keller.png',
      label: 'Auf ins Tageslicht!',
      nextPart: 3,
    }
  }

  if (Number(currentPart) === 3 && Number(stepIndex) === 52) {
    return {
      backgroundImage: '/backgrounds/lift_aussen_grossraum.png',
      label: 'Zum Glück gibt es einen Lift.',
      nextPart: 4,
    }
  }

  if (Number(currentPart) === 4 && Number(stepIndex) === 53) {
    return {
      backgroundImage: '/backgrounds/lift_innen.png',
      label: 'Auf in die Chefetage',
      nextPart: 5,
    }
  }

  return null
}

function getResolvedFlowTarget(config, type, fallbackId, fallbackNextStep) {
  const target = config?.[type]
  return {
    id: target?.id || fallbackId,
    nextStep: target?.nextStep ?? fallbackNextStep,
  }
}

function buildStepHostMessages({
  currentPart,
  effectiveStepIndex,
  speechBubbles,
  lastSelectedOptionId,
  selectedHostId,
}) {
  const visibleBubbles = speechBubbles.some((bubble) => bubble.showOnOptionId)
    ? speechBubbles.filter(
        (bubble) =>
          !bubble.showOnOptionId || bubble.showOnOptionId === lastSelectedOptionId
      )
    : speechBubbles

  return visibleBubbles.map((bubble, index) => {
    const resolvedHostId = normalizeHostId(bubble.hostId, selectedHostId)
    return {
      id: `${currentPart}:${effectiveStepIndex}:host:${index}`,
      speakerType: 'host',
      hostId: resolvedHostId,
      speakerName: getHostFullName(resolvedHostId),
      text: bubble.text,
      imageSrc: bubble.imageSrc,
      imageAlt: bubble.imageAlt,
      imageScale: bubble.imageScale,
      presentation: bubble.presentation,
      placement: bubble.placement,
    }
  })
}

function getStepTypeForIndex(steps = [], stepIndex) {
  const step = steps.find(
    (entry) => Number(entry?.stepIndex) === Number(stepIndex)
  )
  return String(step?.type || '').toLowerCase()
}

function shouldSuppressTransitionPlayerMessage({
  option,
  currentType,
  sortedSteps,
  options,
  currentPart,
  currentStepIndex,
}) {
  if (!option || option.kind || isAvatarOption(option)) {
    return false
  }

  if (Number(currentPart) === 1 && Number(currentStepIndex) === 8) {
    return true
  }

  if ([2, 3, 4].includes(Number(currentPart))) {
    const optionId = String(option?.id || '')
    if (
      optionId.startsWith('retry') ||
      optionId === 'continue_to_activity2' ||
      optionId === 'continue_to_summary' ||
      optionId === 'career_unlock'
    ) {
      return true
    }
  }

  const normalizedOptions = (options || []).filter(
    (entry) => entry && !entry.kind && !isAvatarOption(entry)
  )
  if (!normalizedOptions.length) return false

  const selectedTarget =
    option.nextPart != null ? `part:${option.nextPart}` : `step:${option.nextStep}`
  if (!selectedTarget || selectedTarget.endsWith('undefined')) return false

  const allOptionsLeadToSameTarget = normalizedOptions.every((entry) => {
    const target =
      entry.nextPart != null ? `part:${entry.nextPart}` : `step:${entry.nextStep}`
    return target === selectedTarget
  })
  if (!allOptionsLeadToSameTarget) return false

  if (option.nextPart != null) return true
  if (option.nextStep == null) return false

  const targetType = getStepTypeForIndex(sortedSteps, option.nextStep)
  if (!targetType) return false
  if (targetType === 'activity' && currentType !== 'activity') return true
  if (currentType === 'activity' && targetType === 'summary') return true
  if (currentType === 'summary' && targetType === 'activity') return true

  return false
}

function buildPlayerMessage(currentPart, index, option) {
  if (!option?.label || isAvatarOption(option)) return null

  return {
    id: `player:${currentPart}:${Date.now()}:${index}`,
    speakerType: 'player',
    speakerName: 'Du',
    text: option.label,
  }
}

function resolveSentenceMarkingSubmission(config, selectedSentenceIndexes) {
  const correctSentenceIds = config?.correctSentenceIds || []
  const selectedCorrectCount = selectedSentenceIndexes.filter((item) =>
    correctSentenceIds.includes(item)
  ).length
  const selectedWrongCount = selectedSentenceIndexes.length - selectedCorrectCount
  const isCorrect =
    selectedSentenceIndexes.length === correctSentenceIds.length &&
    correctSentenceIds.every((item) => selectedSentenceIndexes.includes(item))

  const failureTarget = getResolvedFlowTarget(config, 'failure', 'wrongA', 31)
  const successTarget = getResolvedFlowTarget(config, 'success', 'rightA', 32)
  const selectedIds = [...selectedSentenceIndexes].sort()
  const selectedOnly = (...ids) =>
    selectedIds.length === ids.length &&
    ids.every((id) => selectedIds.includes(id))
  const mappedOption = isCorrect
    ? successTarget
    : selectedOnly('s5')
      ? { ...failureTarget, id: 'wrongOnlyEscalation' }
      : selectedOnly('s2')
        ? { ...failureTarget, id: 'wrongOnlyIncident' }
        : selectedOnly('s4')
          ? { ...failureTarget, id: 'wrongOnlyOutrage' }
          : selectedWrongCount === 0 && selectedCorrectCount === 2
            ? { ...failureTarget, id: 'wrongTwoCorrect' }
            : selectedCorrectCount === 0
              ? { ...failureTarget, id: 'wrongOnlyFalse' }
              : selectedWrongCount > 0
                ? { ...failureTarget, id: 'wrongOvermarked' }
                : failureTarget

  return {
    isCorrect,
    mappedOption,
    lastSubmittedSentenceIndexes: selectedSentenceIndexes,
  }
}

function resolveSingleChoiceSubmission(config, selectedChoiceId, defaults) {
  const correctChoiceId = String(config?.correctChoiceId || defaults.correctChoiceId)
  const isCorrect = selectedChoiceId === correctChoiceId
  return {
    isCorrect,
    mappedOption: isCorrect
      ? getResolvedFlowTarget(
          config,
          'success',
          defaults.successId,
          defaults.successNextStep
        )
      : getResolvedFlowTarget(
          config,
          'failure',
          defaults.failureId,
          defaults.failureNextStep
        ),
  }
}

function resolveBoosterSubmission(config, selectedBoosterChoiceIds) {
  const correctChoiceIds = config?.correctChoiceIds || []
  const selectedCorrectCount = selectedBoosterChoiceIds.filter((item) =>
    correctChoiceIds.includes(item)
  ).length
  const selectedWrongCount =
    selectedBoosterChoiceIds.length - selectedCorrectCount
  const isCorrect =
    selectedBoosterChoiceIds.length === correctChoiceIds.length &&
    correctChoiceIds.every((item) => selectedBoosterChoiceIds.includes(item))

  const failureTarget = getResolvedFlowTarget(config, 'failure', 'wrongB', 41)
  const successTarget = getResolvedFlowTarget(config, 'success', 'rightB', 42)
  const mappedOption = isCorrect
    ? successTarget
    : selectedCorrectCount === 0
      ? { ...failureTarget, id: 'wrongBWeak', nextStep: 43 }
      : selectedWrongCount === 0
        ? { ...failureTarget, id: 'wrongBSingle', nextStep: 44 }
        : { ...failureTarget, id: 'wrongBMixed', nextStep: 41 }

  return {
    isCorrect,
    mappedOption,
    lastSubmittedBoosterChoiceIds: selectedBoosterChoiceIds,
  }
}

function resolveBucketSortSubmission(config, bucketAssignments) {
  const items = config?.items || []
  const correctAssignments = config?.correctAssignments || {}
  const selectedAssignments = bucketAssignments || {}
  const contentIds = items
    .filter((item) => selectedAssignments[item.id] === 'content')
    .map((item) => item.id)
    .sort()
  const personIds = items
    .filter((item) => selectedAssignments[item.id] === 'person')
    .map((item) => item.id)
    .sort()
  const sameIds = (actual, expected) =>
    actual.length === expected.length &&
    expected.every((id) => actual.includes(id))

  const s1 = 'a1'
  const a1 = 'a2'
  const s2 = 'a3'
  const a2 = 'a4'
  const isTwoByTwo = contentIds.length === 2 && personIds.length === 2
  const isCorrect =
    sameIds(contentIds, [s1, s2]) && sameIds(personIds, [a1, a2])

  const failureTarget = getResolvedFlowTarget(config, 'failure', 'wrongA', 31)
  const successTarget = getResolvedFlowTarget(config, 'success', 'rightA', 32)
  const mappedOption = isCorrect
    ? successTarget
    : sameIds(contentIds, [a1, a2]) && sameIds(personIds, [s1, s2])
      ? { ...failureTarget, id: 'wrongAAllWrong' }
      : contentIds.includes(a1) && contentIds.includes(a2) && !isTwoByTwo
        ? { ...failureTarget, id: 'wrongAOnlyContent' }
        : personIds.includes(s1) && personIds.includes(s2) && !isTwoByTwo
          ? { ...failureTarget, id: 'wrongAIncomplete' }
          : { ...failureTarget, id: 'wrongAMixed' }

  return {
    isCorrect,
    mappedOption,
    lastSubmittedBucketAssignments: selectedAssignments,
  }
}

export function GameScreen({
  currentPart,
  onPartChange,
  onSelectOption,
  stepJumpRequest,
  onStepChange,
  selectedAvatarId,
  onSelectAvatar,
  selectedHostId,
  onSelectHost,
}) {
  const scene = getSceneById(currentPart)
  const isStartScreen = Number(currentPart) === -1
  const [stepIndex, setStepIndex] = useState(0)
  const [lastSelectedOptionId, setLastSelectedOptionId] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [sceneDialogs, setSceneDialogs] = useState(null)
  const [dialogLoadError, setDialogLoadError] = useState('')
  const [selectedSentenceIndexes, setSelectedSentenceIndexes] = useState([])
  const [lastSubmittedSentenceIndexes, setLastSubmittedSentenceIndexes] =
    useState([])
  const [selectedIntensityChoiceId, setSelectedIntensityChoiceId] = useState('')
  const [lastSubmittedIntensityChoiceId, setLastSubmittedIntensityChoiceId] =
    useState('')
  const [intensityChoiceOrder, setIntensityChoiceOrder] = useState([])
  const [
    lastSubmittedIntensityChoiceOrder,
    setLastSubmittedIntensityChoiceOrder,
  ] = useState([])
  const [selectedTrendChoiceId, setSelectedTrendChoiceId] = useState('')
  const [lastSubmittedTrendChoiceId, setLastSubmittedTrendChoiceId] =
    useState('')
  const [trendChoiceOrder, setTrendChoiceOrder] = useState([])
  const [lastSubmittedTrendChoiceOrder, setLastSubmittedTrendChoiceOrder] =
    useState([])
  const [selectedBoosterChoiceIds, setSelectedBoosterChoiceIds] = useState([])
  const [lastSubmittedBoosterChoiceIds, setLastSubmittedBoosterChoiceIds] =
    useState([])
  const [bucketAssignments, setBucketAssignments] = useState({})
  const [lastSubmittedBucketAssignments, setLastSubmittedBucketAssignments] =
    useState({})
  const [selectedPart4ChoiceId, setSelectedPart4ChoiceId] = useState('')
  const [lastSubmittedPart4ChoiceId, setLastSubmittedPart4ChoiceId] =
    useState('')
  const [part4ChoiceOrder, setPart4ChoiceOrder] = useState([])
  const [lastSubmittedPart4ChoiceOrder, setLastSubmittedPart4ChoiceOrder] =
    useState([])
  const appendedStepKeysRef = useRef(new Set())
  const transitionTimerRef = useRef(null)
  const previousStepMetaRef = useRef({
    part: null,
    type: null,
    stepIndex: null,
  })

  function resetFlowState({
    clearMessages = false,
    resetLastSelectedOptionId = false,
    resetSentence = false,
    resetIntensity = false,
    resetTrend = false,
    resetBooster = false,
    resetBucket = false,
    resetPart4Choice = false,
  } = {}) {
    if (clearMessages) {
      setChatMessages([])
      appendedStepKeysRef.current = new Set()
    }
    if (resetLastSelectedOptionId) {
      setLastSelectedOptionId(null)
    }
    if (resetSentence) {
      setSelectedSentenceIndexes([])
      setLastSubmittedSentenceIndexes([])
    }
    if (resetIntensity) {
      setSelectedIntensityChoiceId('')
      setLastSubmittedIntensityChoiceId('')
      setIntensityChoiceOrder([])
      setLastSubmittedIntensityChoiceOrder([])
    }
    if (resetTrend) {
      setSelectedTrendChoiceId('')
      setLastSubmittedTrendChoiceId('')
      setTrendChoiceOrder([])
      setLastSubmittedTrendChoiceOrder([])
    }
    if (resetBooster) {
      setSelectedBoosterChoiceIds([])
      setLastSubmittedBoosterChoiceIds([])
    }
    if (resetBucket) {
      setBucketAssignments({})
      setLastSubmittedBucketAssignments({})
    }
    if (resetPart4Choice) {
      setSelectedPart4ChoiceId('')
      setLastSubmittedPart4ChoiceId('')
      setPart4ChoiceOrder([])
      setLastSubmittedPart4ChoiceOrder([])
    }
  }

  useEffect(() => {
    setStepIndex(0)
    setSceneDialogs(null)
    setDialogLoadError('')
    resetFlowState({
      clearMessages: true,
      resetLastSelectedOptionId: true,
      resetSentence: true,
      resetIntensity: true,
      resetTrend: true,
      resetBooster: true,
      resetBucket: true,
      resetPart4Choice: true,
    })
  }, [currentPart])

  useEffect(() => {
    if (!stepJumpRequest) return

    setStepIndex(stepJumpRequest.stepIndex ?? 0)
    setDialogLoadError('')
    resetFlowState({
      clearMessages: true,
      resetLastSelectedOptionId: true,
      resetBooster: true,
      resetBucket: true,
      resetPart4Choice: true,
    })
  }, [stepJumpRequest])

  useEffect(() => {
    let active = true

    if (isStartScreen) {
      setSceneDialogs(null)
      setChatMessages([])
      appendedStepKeysRef.current = new Set()
      setDialogLoadError('')
      return () => {
        active = false
      }
    }

    async function loadDialogs() {
      try {
        const data = await getSceneDialogs(currentPart)
        if (!active) return
        if (Number(data?.sceneId) !== Number(currentPart)) {
          setSceneDialogs(null)
          setDialogLoadError(
            `Ungültige Dialogantwort für Teil ${currentPart} (sceneId mismatch).`
          )
          console.warn(
            `[Dialogs] part=${currentPart} source=fallback reason=scene-id-mismatch`
          )
          return
        }
        setSceneDialogs(data)
        setChatMessages([])
        appendedStepKeysRef.current = new Set()
        setDialogLoadError('')
        console.info(
          `[Dialogs] part=${currentPart} source=api version=${buildDialogsVersionId(data?.steps || [])} preview="${getStepZeroPreview(data)}"`
        )
      } catch (error) {
        if (!active) return
        setSceneDialogs(null)
        setDialogLoadError(
          error?.message || 'Dialoge konnten nicht geladen werden.'
        )
        const fallbackStep = getFallbackStep(scene, currentPart, 0)
        const fallbackPreview = String(
          fallbackStep?.speechBubbles?.[0]?.text || ''
        )
          .replace(/\s+/g, ' ')
          .slice(0, 40)
        console.warn(
          `[Dialogs] part=${currentPart} source=fallback preview="${fallbackPreview}"`
        )
      }
    }

    loadDialogs()
    return () => {
      active = false
    }
  }, [currentPart, isStartScreen])

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
    }
  }, [])

  const effectiveSceneDialogs =
    Number(sceneDialogs?.sceneId) === Number(currentPart) ? sceneDialogs : null
  const sortedBackendSteps = [...(effectiveSceneDialogs?.steps || [])].sort(
    (a, b) => a.stepIndex - b.stepIndex
  )
  const requiresBackendDialogs = currentPart >= 0 && currentPart <= 5
  const backendUnavailableForPart =
    requiresBackendDialogs && !sortedBackendSteps.length
  const backendErrorStep = {
    stepIndex: 0,
    type: 'error',
    speechBubbles: [
      {
        hostId: 'ambassador',
        text: `Backend-Dialoge für Teil ${currentPart} konnten nicht geladen werden.\n${dialogLoadError || 'Bitte Backend/API prüfen und neu laden.'}`,
      },
    ],
    options: [],
  }
  const stepData =
    sortedBackendSteps.find((step) => step.stepIndex === stepIndex) ||
    sortedBackendSteps[0] ||
    (backendUnavailableForPart
      ? backendErrorStep
      : getFallbackStep(scene, currentPart, stepIndex))
  const isSingleButtonTransition = isSingleButtonTransitionStep(
    currentPart,
    stepData.stepIndex
  )
  const singleButtonTransitionConfig = getSingleButtonTransitionConfig(
    currentPart,
    stepData.stepIndex
  )
  const isFinalInternshipState =
    Number(currentPart) === 5 &&
    Number(stepData.stepIndex) === 6

  const options = stepData.options || []
  const isPart2Activity1InputStep =
    currentPart === 2 && Number(stepData.stepIndex) === 3
  const isPart2Activity1Context =
    currentPart === 2 && [3, 31, 32].includes(Number(stepData.stepIndex))
  const part2Activity1Config = isPart2Activity1Context
    ? resolveSentenceMarkingConfig(
        stepData.activityConfig,
        PART2_ACTIVITY1_FALLBACK_CONFIG
      )
    : PART2_ACTIVITY1_FALLBACK_CONFIG
  const isPart2Activity2InputStep =
    currentPart === 2 && Number(stepData.stepIndex) === 4
  const isPart2Activity2Context =
    currentPart === 2 && [4, 41, 42, 43].includes(Number(stepData.stepIndex))
  const part2Activity2Config = isPart2Activity2Context
    ? resolveIntensityChoiceConfig(
        stepData.activityConfig,
        PART2_ACTIVITY2_FALLBACK_CONFIG
      )
    : PART2_ACTIVITY2_FALLBACK_CONFIG
  const isPart3Activity1InputStep =
    currentPart === 3 && Number(stepData.stepIndex) === 3
  const isPart3Activity1Context =
    currentPart === 3 && [3, 31, 32, 33].includes(Number(stepData.stepIndex))
  const part3Activity1Config = isPart3Activity1Context
    ? resolveIntensityChoiceConfig(
        stepData.activityConfig,
        PART3_ACTIVITY1_FALLBACK_CONFIG
      )
    : PART3_ACTIVITY1_FALLBACK_CONFIG
  const isPart3Activity2InputStep =
    currentPart === 3 && Number(stepData.stepIndex) === 4
  const isPart3Activity2Context =
    currentPart === 3 && [4, 41, 42, 43, 44].includes(Number(stepData.stepIndex))
  const part3Activity2Config = isPart3Activity2Context
    ? resolveBoosterChoiceConfig(
        stepData.activityConfig,
        PART3_ACTIVITY2_FALLBACK_CONFIG
      )
    : PART3_ACTIVITY2_FALLBACK_CONFIG
  const isPart4Activity1InputStep =
    currentPart === 4 && Number(stepData.stepIndex) === 3
  const isPart4Activity1Context =
    currentPart === 4 && [3, 31, 32].includes(Number(stepData.stepIndex))
  const part4Activity1Config = isPart4Activity1Context
    ? resolveBucketSortConfig(
        stepData.activityConfig,
        PART4_ACTIVITY1_FALLBACK_CONFIG
      )
    : PART4_ACTIVITY1_FALLBACK_CONFIG
  const isPart4Activity2InputStep =
    currentPart === 4 && Number(stepData.stepIndex) === 4
  const isPart4Activity2Context =
    currentPart === 4 && [4, 41, 43].includes(Number(stepData.stepIndex))
  const part4Activity2Config = isPart4Activity2Context
    ? resolveIntensityChoiceConfig(
        stepData.activityConfig,
        PART4_ACTIVITY2_FALLBACK_CONFIG
      )
    : PART4_ACTIVITY2_FALLBACK_CONFIG
  const isMonitorActivityMode =
    [2, 3, 4].includes(currentPart) &&
    String(stepData.type || '').toLowerCase() === 'activity'
  const activityVariantByPart = { 2: 'monitor', 3: 'tablet', 4: 'hologram' }
  const currentStepType = String(stepData.type || '').toLowerCase()
  const hasAvatarOptionInCurrentStep = options.some((option) =>
    isAvatarOption(option)
  )
  const visibleOptions = options.some((option) => option?.showOnOptionId)
    ? options.filter(
        (option) =>
          !option?.showOnOptionId ||
          option.showOnOptionId === lastSelectedOptionId
      )
    : options
  const displayOptions = visibleOptions.map((option) => {
    if (
      currentPart === 0 &&
      String(option?.id || '').toLowerCase() === 'continue' &&
      hasAvatarOptionInCurrentStep
    ) {
      return { ...option, disabled: !selectedAvatarId }
    }

    return option
  })
  const effectiveSentenceSelection = isPart2Activity1InputStep
    ? selectedSentenceIndexes
    : lastSubmittedSentenceIndexes
  const sentenceOptions = isPart2Activity1Context
    ? (part2Activity1Config?.sentences || []).map((sentence, index) => ({
        id: sentence.id || `sentence-${index + 1}`,
        kind: 'sentence',
        label: sentence.text,
        selected: effectiveSentenceSelection.includes(sentence.id),
        disabled: !isPart2Activity1InputStep,
        sentenceId: sentence.id,
        postAuthorName: 'Emma Pör',
        postAuthorAvatar: '/backgrounds/emma-poer.png',
        hideTitle: true,
      }))
    : []
  const effectiveIntensityChoiceId = isPart2Activity2InputStep
    ? selectedIntensityChoiceId
    : lastSubmittedIntensityChoiceId
  const part2ChoiceOrder = isPart2Activity2InputStep
    ? intensityChoiceOrder
    : lastSubmittedIntensityChoiceOrder
  const orderedPart2Choices = (() => {
    const choices = part2Activity2Config?.choices || []
    if (!part2ChoiceOrder.length) return choices
    const byId = new Map(choices.map((choice) => [choice.id, choice]))
    return part2ChoiceOrder.map((id) => byId.get(id)).filter(Boolean)
  })()
  const intensityChoiceOptions = isPart2Activity2Context
    ? orderedPart2Choices.map((choice) => ({
        id: choice.id,
        kind: 'choice',
        text: choice.text,
        selected: effectiveIntensityChoiceId === choice.id,
        disabled: !isPart2Activity2InputStep,
        choiceId: choice.id,
        groupTitle: part2Activity2Config?.title || 'Aktivität 2',
        topic: part2Activity2Config?.topic || '',
        postAuthorName: 'Emma Pör',
        postAuthorAvatar: '/backgrounds/emma-poer.png',
        hideTitle: true,
        hideTopic: true,
      }))
    : []
  const effectiveTrendChoiceId = isPart3Activity1InputStep
    ? selectedTrendChoiceId
    : lastSubmittedTrendChoiceId
  const part3ChoiceOrder = isPart3Activity1InputStep
    ? trendChoiceOrder
    : lastSubmittedTrendChoiceOrder
  const orderedPart3Choices = (() => {
    const choices = part3Activity1Config?.choices || []
    if (!part3ChoiceOrder.length) return choices
    const byId = new Map(choices.map((choice) => [choice.id, choice]))
    return part3ChoiceOrder.map((id) => byId.get(id)).filter(Boolean)
  })()
  const trendChoiceOptions = isPart3Activity1Context
    ? orderedPart3Choices.map((choice) => ({
        id: choice.id,
        kind: 'choice',
        text: choice.text,
        selected: effectiveTrendChoiceId === choice.id,
        disabled: !isPart3Activity1InputStep,
        choiceId: choice.id,
        groupTitle: part3Activity1Config?.title || 'Aktivität 1',
        topic: part3Activity1Config?.topic || '',
        postAuthorName: 'Konrad Sens',
        postAuthorAvatar: '/backgrounds/konrad_sens.png',
        hideTitle: true,
        hideTopic: true,
      }))
    : []
  const effectiveBoosterChoiceIds = isPart3Activity2InputStep
    ? selectedBoosterChoiceIds
    : lastSubmittedBoosterChoiceIds
  const boosterChoiceOptions = isPart3Activity2Context
    ? (part3Activity2Config?.choices || []).map((choice) => ({
        id: choice.id,
        kind: 'booster',
        text: choice.text,
        selected: effectiveBoosterChoiceIds.includes(choice.id),
        disabled: !isPart3Activity2InputStep,
        choiceId: choice.id,
        groupTitle: part3Activity2Config?.title || 'Aktivität 2',
        topic: part3Activity2Config?.topic || '',
        prompt: part3Activity2Config?.prompt || '',
        neutralPost: part3Activity2Config?.neutralPost || '',
        postAuthorName: 'Konrad Sens',
        postAuthorAvatar: '/backgrounds/konrad_sens.png',
        hideTitle: true,
        hideTopic: false,
        promptAfterNeutralPost: true,
        promptHostId: selectedHostId || 'selected',
        promptSpeakerName: getHostFullName(selectedHostId || 'selected'),
        renderNeutralPostAsMessage: true,
        neutralPostHostId: 'konrad',
      }))
    : []
  const effectiveBucketAssignments = isPart4Activity1InputStep
    ? bucketAssignments
    : lastSubmittedBucketAssignments
  const bucketAssignmentOptions = isPart4Activity1Context
    ? (part4Activity1Config?.items || []).map((item) => ({
        id: item.id,
        itemId: item.id,
        kind: 'bucket-assignment',
        text: item.text,
        assignedBucketId: effectiveBucketAssignments[item.id] || '',
        disabled: !isPart4Activity1InputStep,
        groupTitle: part4Activity1Config?.title || 'Aktivität 1',
        topic: part4Activity1Config?.topic || '',
        prompt: part4Activity1Config?.prompt || '',
        unassignedLabel: part4Activity1Config?.unassignedLabel || 'Beiträge',
        bucketDefinitions: part4Activity1Config?.bucketDefinitions || [],
        postAuthorName: 'Didi Fam',
        postAuthorAvatar: '/backgrounds/didi-fam.png',
        hideTitle: true,
        hideTopic: true,
      }))
    : []
  const effectivePart4ChoiceId = isPart4Activity2InputStep
    ? selectedPart4ChoiceId
    : lastSubmittedPart4ChoiceId
  const part4ChoiceOrderSource = isPart4Activity2InputStep
    ? part4ChoiceOrder
    : lastSubmittedPart4ChoiceOrder
  const orderedPart4Choices = (() => {
    const choices = part4Activity2Config?.choices || []
    if (!part4ChoiceOrderSource.length) return choices
    const byId = new Map(choices.map((choice) => [choice.id, choice]))
    return part4ChoiceOrderSource.map((id) => byId.get(id)).filter(Boolean)
  })()
  const part4ChoiceOptions = isPart4Activity2Context
    ? orderedPart4Choices.map((choice) => ({
        id: choice.id,
        kind: 'choice',
        text: choice.text,
        selected: effectivePart4ChoiceId === choice.id,
        disabled: !isPart4Activity2InputStep,
        choiceId: choice.id,
        groupTitle: part4Activity2Config?.title || 'Aktivität 2',
        topic: part4Activity2Config?.topic || '',
        postAuthorName: 'Didi Fam',
        postAuthorAvatar: '/backgrounds/didi-fam.png',
        hideTitle: true,
        hideTopic: true,
      }))
    : []
  const backendSubmitOptions = options
    .filter(
      (item) => item.id === 'submit_confident' || item.id === 'submit_unsure'
    )
    .map((item) => ({
      ...item,
      kind: 'submit',
      disabled: selectedSentenceIndexes.length === 0,
    }))
  const backendActivity2SubmitOptions = options
    .filter((item) => item.id === 'submit_easy' || item.id === 'submit_unsure2')
    .map((item) => ({
      ...item,
      kind: 'submit',
      disabled: !selectedIntensityChoiceId,
    }))
  const backendTrendSubmitOptions = options
    .filter(
      (item) => item.id === 'submit_easy3' || item.id === 'submit_unsure3'
    )
    .map((item) => ({
      ...item,
      kind: 'submit',
      disabled: !selectedTrendChoiceId,
    }))
  const backendBoosterSubmitOptions = options
    .filter(
      (item) => item.id === 'submit_confident4' || item.id === 'submit_unsure4'
    )
    .map((item) => ({
      ...item,
      kind: 'submit',
      disabled: !selectedBoosterChoiceIds.length,
    }))
  const totalBucketItems = (part4Activity1Config?.items || []).length
  const assignedBucketItemsCount = Object.keys(bucketAssignments || {}).filter(
    (id) => Boolean(bucketAssignments[id])
  ).length
  const backendBucketSubmitOptions = options
    .filter(
      (item) => item.id === 'submit_sorted5' || item.id === 'submit_unsure5'
    )
    .map((item) => ({
      ...item,
      kind: 'submit',
      disabled: assignedBucketItemsCount < totalBucketItems,
    }))
  const backendPart4SubmitOptions = options
    .filter((item) => item.id === 'submit_ouch6' || item.id === 'submit_far6')
    .map((item) => ({
      ...item,
      kind: 'submit',
      disabled: !selectedPart4ChoiceId,
    }))
  const submitOptions = isPart2Activity1InputStep
    ? backendSubmitOptions.length
      ? backendSubmitOptions
      : [
          {
            id: 'submit_confident',
            label: 'Ich bin mir sicher.',
            kind: 'submit',
            disabled: selectedSentenceIndexes.length === 0,
          },
          {
            id: 'submit_unsure',
            label: 'Ich hoffe, es stimmt.',
            kind: 'submit',
            disabled: selectedSentenceIndexes.length === 0,
          },
        ]
    : isPart2Activity2InputStep
      ? backendActivity2SubmitOptions.length
        ? backendActivity2SubmitOptions
        : [
            {
              id: 'submit_easy',
              label: 'Das ist einfach.',
              kind: 'submit',
              disabled: !selectedIntensityChoiceId,
            },
            {
              id: 'submit_unsure2',
              label: 'Ich habe eigentlich keine Ahnung.',
              kind: 'submit',
              disabled: !selectedIntensityChoiceId,
            },
          ]
      : isPart3Activity1InputStep
        ? backendTrendSubmitOptions.length
          ? backendTrendSubmitOptions
          : [
              {
                id: 'submit_easy3',
                label: 'Das schreit nach Konrad!',
                kind: 'submit',
                disabled: !selectedTrendChoiceId,
              },
              {
                id: 'submit_unsure3',
                label: 'Konrad - bist du es?',
                kind: 'submit',
                disabled: !selectedTrendChoiceId,
              },
            ]
        : isPart3Activity2InputStep
          ? backendBoosterSubmitOptions.length
            ? backendBoosterSubmitOptions
            : [
                {
                  id: 'submit_confident4',
                  label: 'Das wirkt nach echtem Konsens.',
                  kind: 'submit',
                  disabled: !selectedBoosterChoiceIds.length,
                },
                {
                  id: 'submit_unsure4',
                  label: 'Ich bin unsicher.',
                  kind: 'submit',
                  disabled: !selectedBoosterChoiceIds.length,
                },
              ]
          : isPart4Activity1InputStep
            ? backendBucketSubmitOptions.length
              ? backendBucketSubmitOptions
              : [
                  {
                    id: 'submit_sorted5',
                    label: 'Einsortiert. Didi kann kommen.',
                    kind: 'submit',
                    disabled: assignedBucketItemsCount < totalBucketItems,
                  },
                  {
                    id: 'submit_unsure5',
                    label: 'Ich hoffe, ich habe niemanden falsch beschuldigt.',
                    kind: 'submit',
                    disabled: assignedBucketItemsCount < totalBucketItems,
                  },
                ]
            : isPart4Activity2InputStep
              ? backendPart4SubmitOptions.length
                ? backendPart4SubmitOptions
                : [
                    {
                      id: 'submit_ouch6',
                      label: 'Autsch. Unter die Gürtellinie.',
                      kind: 'submit',
                      disabled: !selectedPart4ChoiceId,
                    },
                    {
                      id: 'submit_far6',
                      label: 'Geht das schon zu weit?',
                      kind: 'submit',
                      disabled: !selectedPart4ChoiceId,
                    },
                  ]
              : displayOptions
  const monitorOptions = isPart2Activity1Context
    ? [...sentenceOptions, ...submitOptions]
    : isPart2Activity2Context
      ? [...intensityChoiceOptions, ...submitOptions]
      : isPart3Activity1Context
        ? [...trendChoiceOptions, ...submitOptions]
        : isPart3Activity2Context
          ? [...boosterChoiceOptions, ...submitOptions]
          : isPart4Activity1Context
            ? [...bucketAssignmentOptions, ...submitOptions]
            : isPart4Activity2Context
              ? [...part4ChoiceOptions, ...submitOptions]
              : displayOptions

  useEffect(() => {
    if (!isPart2Activity2InputStep) return
    if (intensityChoiceOrder.length) return
    const ids = (part2Activity2Config?.choices || []).map((choice) => choice.id)
    if (!ids.length) return
    const randomized =
      part2Activity2Config?.randomizeChoices === false ? ids : shuffleArray(ids)
    setIntensityChoiceOrder(randomized)
  }, [
    isPart2Activity2InputStep,
    intensityChoiceOrder.length,
    part2Activity2Config,
  ])

  useEffect(() => {
    if (!isPart3Activity1InputStep) return
    if (trendChoiceOrder.length) return
    const ids = (part3Activity1Config?.choices || []).map((choice) => choice.id)
    if (!ids.length) return
    const randomized =
      part3Activity1Config?.randomizeChoices === false ? ids : shuffleArray(ids)
    setTrendChoiceOrder(randomized)
  }, [isPart3Activity1InputStep, trendChoiceOrder.length, part3Activity1Config])

  useEffect(() => {
    if (!isPart4Activity2InputStep) return
    if (part4ChoiceOrder.length) return
    const ids = (part4Activity2Config?.choices || []).map((choice) => choice.id)
    if (!ids.length) return
    const randomized =
      part4Activity2Config?.randomizeChoices === false ? ids : shuffleArray(ids)
    setPart4ChoiceOrder(randomized)
  }, [isPart4Activity2InputStep, part4ChoiceOrder.length, part4Activity2Config])

  useEffect(() => {
    if (!isPart2Activity1Context && selectedSentenceIndexes.length) {
      setSelectedSentenceIndexes([])
    }
    if (!isPart2Activity1Context && lastSubmittedSentenceIndexes.length) {
      setLastSubmittedSentenceIndexes([])
    }
    if (!isPart2Activity2Context && selectedIntensityChoiceId) {
      setSelectedIntensityChoiceId('')
    }
    if (!isPart2Activity2Context && lastSubmittedIntensityChoiceId) {
      setLastSubmittedIntensityChoiceId('')
    }
    if (!isPart2Activity2Context && intensityChoiceOrder.length) {
      setIntensityChoiceOrder([])
    }
    if (!isPart2Activity2Context && lastSubmittedIntensityChoiceOrder.length) {
      setLastSubmittedIntensityChoiceOrder([])
    }
    if (!isPart3Activity1Context && selectedTrendChoiceId) {
      setSelectedTrendChoiceId('')
    }
    if (!isPart3Activity1Context && lastSubmittedTrendChoiceId) {
      setLastSubmittedTrendChoiceId('')
    }
    if (!isPart3Activity1Context && trendChoiceOrder.length) {
      setTrendChoiceOrder([])
    }
    if (!isPart3Activity1Context && lastSubmittedTrendChoiceOrder.length) {
      setLastSubmittedTrendChoiceOrder([])
    }
    if (!isPart3Activity2Context && selectedBoosterChoiceIds.length) {
      setSelectedBoosterChoiceIds([])
    }
    if (!isPart3Activity2Context && lastSubmittedBoosterChoiceIds.length) {
      setLastSubmittedBoosterChoiceIds([])
    }
    if (!isPart4Activity1Context && Object.keys(bucketAssignments).length) {
      setBucketAssignments({})
    }
    if (
      !isPart4Activity1Context &&
      Object.keys(lastSubmittedBucketAssignments).length
    ) {
      setLastSubmittedBucketAssignments({})
    }
    if (!isPart4Activity2Context && selectedPart4ChoiceId) {
      setSelectedPart4ChoiceId('')
    }
    if (!isPart4Activity2Context && lastSubmittedPart4ChoiceId) {
      setLastSubmittedPart4ChoiceId('')
    }
    if (!isPart4Activity2Context && part4ChoiceOrder.length) {
      setPart4ChoiceOrder([])
    }
    if (!isPart4Activity2Context && lastSubmittedPart4ChoiceOrder.length) {
      setLastSubmittedPart4ChoiceOrder([])
    }
  }, [
    isPart2Activity1Context,
    selectedSentenceIndexes.length,
    lastSubmittedSentenceIndexes.length,
    isPart2Activity2Context,
    selectedIntensityChoiceId,
    lastSubmittedIntensityChoiceId,
    intensityChoiceOrder.length,
    lastSubmittedIntensityChoiceOrder.length,
    isPart3Activity1Context,
    selectedTrendChoiceId,
    lastSubmittedTrendChoiceId,
    trendChoiceOrder.length,
    lastSubmittedTrendChoiceOrder.length,
    isPart3Activity2Context,
    selectedBoosterChoiceIds.length,
    lastSubmittedBoosterChoiceIds.length,
    isPart4Activity1Context,
    bucketAssignments,
    lastSubmittedBucketAssignments,
    isPart4Activity2Context,
    selectedPart4ChoiceId,
    lastSubmittedPart4ChoiceId,
    part4ChoiceOrder.length,
    lastSubmittedPart4ChoiceOrder.length,
  ])

  useEffect(() => {
    onStepChange?.(currentPart, stepData.stepIndex ?? 0)
  }, [currentPart, stepData.stepIndex, onStepChange])

  useEffect(() => {
    const currentType = String(stepData.type || '').toLowerCase()
    const prev = previousStepMetaRef.current
    const samePart = prev.part === currentPart
    const enteredActivity =
      samePart && prev.type !== 'activity' && currentType === 'activity'
    const enteredSummary =
      samePart && prev.type === 'activity' && currentType === 'summary'
    const enteredPart3Activity1 =
      currentPart === 3 &&
      Number(stepData.stepIndex) === 3 &&
      Number(prev.stepIndex) !== 3

    // For monitor activities: start with a clean thread when entering activity sections.
    if (
      (currentPart === 2 && (enteredActivity || enteredSummary)) ||
      (currentPart === 3 && (enteredActivity || enteredPart3Activity1)) ||
      (currentPart === 4 && enteredActivity)
    ) {
      resetFlowState({ clearMessages: true })
    }

    previousStepMetaRef.current = {
      part: currentPart,
      type: currentType,
      stepIndex: stepData.stepIndex ?? 0,
    }
  }, [currentPart, stepData.stepIndex, stepData.type])

  useEffect(() => {
    const effectiveStepIndex = stepData.stepIndex ?? stepIndex
    const key = `${currentPart}:${effectiveStepIndex}`
    if (appendedStepKeysRef.current.has(key)) return

    appendedStepKeysRef.current.add(key)
    const hostMessages = buildStepHostMessages({
      currentPart,
      effectiveStepIndex,
      speechBubbles: stepData.speechBubbles || [],
      lastSelectedOptionId,
      selectedHostId,
    })

    setChatMessages((prev) => [...prev, ...hostMessages])
  }, [currentPart, stepData, stepIndex, selectedHostId, lastSelectedOptionId])

  const handleSelectOption = (index, option) => {
    let transitionFlags = createTransitionFlags()

    if (isPart2Activity1InputStep && option?.kind === 'sentence') {
      const sentenceId = String(option.sentenceId || '')
      setSelectedSentenceIndexes((prev) =>
        prev.includes(sentenceId)
          ? prev.filter((item) => item !== sentenceId)
          : [...prev, sentenceId].sort()
      )
      return
    }

    if (isPart2Activity1InputStep && option?.kind === 'submit') {
      const submission = resolveSentenceMarkingSubmission(
        part2Activity1Config,
        selectedSentenceIndexes
      )
      transitionFlags = createTransitionFlags({
        resetOnPart2Activity2: submission.isCorrect,
      })
      setLastSubmittedSentenceIndexes(submission.lastSubmittedSentenceIndexes)
      option = { ...submission.mappedOption, label: option.label }
    }

    if (isPart2Activity2InputStep && option?.kind === 'choice') {
      setSelectedIntensityChoiceId(String(option.choiceId || ''))
      return
    }

    if (isPart2Activity2InputStep && option?.kind === 'submit') {
      const submission = resolveSingleChoiceSubmission(
        part2Activity2Config,
        selectedIntensityChoiceId,
        {
          correctChoiceId: 'c',
          successId: 'rightB',
          successNextStep: 42,
          failureId: 'wrongB',
          failureNextStep: 41,
        }
      )
      setLastSubmittedIntensityChoiceId(selectedIntensityChoiceId)
      setLastSubmittedIntensityChoiceOrder(intensityChoiceOrder)
      option = submission.isCorrect
        ? { ...submission.mappedOption, label: option.label }
        : {
            ...submission.mappedOption,
            id:
              selectedIntensityChoiceId === 'b'
                ? 'wrongBMedium'
                : selectedIntensityChoiceId === 'a'
                  ? 'wrongBLow'
                  : submission.mappedOption.id,
            nextStep:
              selectedIntensityChoiceId === 'b'
                ? 41
                : selectedIntensityChoiceId === 'a'
                  ? 43
                  : submission.mappedOption.nextStep,
            label: option.label,
          }
    }

    if (isPart3Activity1InputStep && option?.kind === 'choice') {
      setSelectedTrendChoiceId(String(option.choiceId || ''))
      return
    }

    if (isPart3Activity1InputStep && option?.kind === 'submit') {
      const submission = resolveSingleChoiceSubmission(
        part3Activity1Config,
        selectedTrendChoiceId,
        {
          correctChoiceId: 'p3',
          successId: 'rightA',
          successNextStep: 32,
          failureId: 'wrongA',
          failureNextStep: 31,
        }
      )
      setLastSubmittedTrendChoiceId(selectedTrendChoiceId)
      setLastSubmittedTrendChoiceOrder(trendChoiceOrder)
      option = submission.isCorrect
        ? { ...submission.mappedOption, label: option.label }
        : {
            ...submission.mappedOption,
            id:
              selectedTrendChoiceId === 'p2'
                ? 'wrongAMedium'
                : selectedTrendChoiceId === 'p1'
                  ? 'wrongALow'
                  : submission.mappedOption.id,
            nextStep:
              selectedTrendChoiceId === 'p2'
                ? 31
                : selectedTrendChoiceId === 'p1'
                  ? 33
                  : submission.mappedOption.nextStep,
            label: option.label,
          }
    }

    if (isPart3Activity2InputStep && option?.kind === 'booster') {
      const choiceId = String(option.choiceId || '')
      setSelectedBoosterChoiceIds((prev) =>
        prev.includes(choiceId)
          ? prev.filter((item) => item !== choiceId)
          : [...prev, choiceId].sort()
      )
      return
    }

    if (isPart3Activity2InputStep && option?.kind === 'submit') {
      const submission = resolveBoosterSubmission(
        part3Activity2Config,
        selectedBoosterChoiceIds
      )
      transitionFlags = createTransitionFlags({
        resetOnPart3Summary: submission.isCorrect,
      })
      setLastSubmittedBoosterChoiceIds(submission.lastSubmittedBoosterChoiceIds)
      option = { ...submission.mappedOption, label: option.label }
    }

    if (isPart4Activity1InputStep && option?.kind === 'bucket-drop') {
      const itemId = String(option.itemId || '')
      const bucketId = String(option.bucketId || '')
      if (!itemId) return
      setBucketAssignments((prev) => {
        const next = { ...prev }
        if (!bucketId) {
          delete next[itemId]
        } else {
          next[itemId] = bucketId
        }
        return next
      })
      return
    }

    if (isPart4Activity1InputStep && option?.kind === 'submit') {
      const submission = resolveBucketSortSubmission(
        part4Activity1Config,
        bucketAssignments
      )
      transitionFlags = createTransitionFlags({
        resetOnPart4Activity2: submission.isCorrect,
      })
      setLastSubmittedBucketAssignments(
        submission.lastSubmittedBucketAssignments
      )
      option = { ...submission.mappedOption, label: option.label }
    }

    if (isPart4Activity2InputStep && option?.kind === 'choice') {
      setSelectedPart4ChoiceId(String(option.choiceId || ''))
      return
    }

    if (isPart4Activity2InputStep && option?.kind === 'submit') {
      const submission = resolveSingleChoiceSubmission(
        part4Activity2Config,
        selectedPart4ChoiceId,
        {
          correctChoiceId: 'c',
          successId: 'rightB',
          successNextStep: 43,
          failureId: 'wrongB',
          failureNextStep: 41,
        }
      )
      transitionFlags = createTransitionFlags({
        resetOnPart4Summary: submission.isCorrect,
      })
      setLastSubmittedPart4ChoiceId(selectedPart4ChoiceId)
      setLastSubmittedPart4ChoiceOrder(part4ChoiceOrder)
      option = submission.isCorrect
        ? { ...submission.mappedOption, label: option.label }
        : {
            ...submission.mappedOption,
            id:
              selectedPart4ChoiceId === 'a'
                ? 'wrongBLow'
                : selectedPart4ChoiceId === 'b'
                  ? 'wrongB'
                  : submission.mappedOption.id,
            nextStep: 41,
            label: option.label,
          }
    }

    onSelectOption?.(index, option, currentPart)
    setLastSelectedOptionId(option?.id ?? null)

    if (currentPart === 0 && isAvatarOption(option)) {
      onSelectAvatar?.(String(option.id).toLowerCase())
    }

    const selectedFromPart1 =
      currentPart === 1 && (option?.id === 'clara' || option?.id === 'uwe')
    if (selectedFromPart1) {
      onSelectHost?.(option.id)
    }

    const suppressPlayerMessage = shouldSuppressTransitionPlayerMessage({
      option,
      currentType: currentStepType,
      sortedSteps: sortedBackendSteps,
      options,
      currentPart,
      currentStepIndex: stepData.stepIndex,
    })
    const playerMessage = suppressPlayerMessage
      ? null
      : buildPlayerMessage(currentPart, index, option)
    if (playerMessage) {
      setChatMessages((prev) => [...prev, playerMessage])
    }

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)

    const shouldNavigate = option?.nextPart != null || option?.nextStep != null
    if (!shouldNavigate) return

    const resetOnRetryPart2 =
      currentPart === 2 && String(option?.id || '').startsWith('retry')
    const resetOnRetryPart3 =
      currentPart === 3 && String(option?.id || '').startsWith('retry')
    const resetOnRetryPart4 =
      currentPart === 4 && String(option?.id || '').startsWith('retry')

    transitionTimerRef.current = setTimeout(() => {
      if (option?.nextPart != null && onPartChange) {
        onPartChange(option.nextPart)
        setStepIndex(0)
        return
      }

      if (option?.nextStep != null) {
        if (
          transitionFlags.resetOnPart2Activity2 &&
          currentPart === 2 &&
          Number(option.nextStep) === 4
        ) {
          resetFlowState({ clearMessages: true, resetSentence: true })
        }

        if (
          currentPart === 2 &&
          Number(stepData.stepIndex) === 32 &&
          Number(option.nextStep) === 4
        ) {
          resetFlowState({ clearMessages: true, resetSentence: true })
        }

        if (
          transitionFlags.resetOnPart3Activity2 &&
          currentPart === 3 &&
          Number(option.nextStep) === 4
        ) {
          resetFlowState({
            clearMessages: true,
            resetTrend: true,
            resetBooster: true,
          })
        }

        if (
          transitionFlags.resetOnPart3Summary &&
          currentPart === 3 &&
          Number(option.nextStep) === 5
        ) {
          resetFlowState({ clearMessages: true, resetBooster: true })
        }

        if (
          currentPart === 3 &&
          Number(stepData.stepIndex) === 42 &&
          Number(option.nextStep) === 5
        ) {
          resetFlowState({ clearMessages: true, resetBooster: true })
        }

        if (
          currentPart === 3 &&
          Number(stepData.stepIndex) === 32 &&
          Number(option.nextStep) === 4
        ) {
          resetFlowState({ clearMessages: true, resetTrend: true })
        }

        if (
          transitionFlags.resetOnPart4Activity2 &&
          currentPart === 4 &&
          Number(option.nextStep) === 4
        ) {
          resetFlowState({
            clearMessages: true,
            resetBucket: true,
            resetPart4Choice: true,
          })
        }

        if (
          currentPart === 4 &&
          Number(stepData.stepIndex) === 32 &&
          Number(option.nextStep) === 4
        ) {
          resetFlowState({
            clearMessages: true,
            resetBucket: true,
            resetPart4Choice: true,
          })
        }

        if (
          transitionFlags.resetOnPart4Summary &&
          currentPart === 4 &&
          Number(option.nextStep) === 5
        ) {
          resetFlowState({
            clearMessages: true,
            resetPart4Choice: true,
          })
        }

        if (
          currentPart === 4 &&
          Number(stepData.stepIndex) === 43 &&
          Number(option.nextStep) === 5
        ) {
          resetFlowState({
            clearMessages: true,
            resetPart4Choice: true,
          })
        }

        if (resetOnRetryPart2) {
          resetFlowState({
            clearMessages: true,
            resetLastSelectedOptionId: true,
            resetSentence: true,
            resetIntensity: true,
          })
        }

        if (resetOnRetryPart3) {
          resetFlowState({
            clearMessages: true,
            resetLastSelectedOptionId: true,
            resetTrend: true,
            resetBooster: true,
          })
        }

        if (resetOnRetryPart4) {
          resetFlowState({
            clearMessages: true,
            resetLastSelectedOptionId: true,
            resetBucket: true,
            resetPart4Choice: true,
          })
        }

        setStepIndex(option.nextStep)
      }
    }, 220)
  }

  if (isMonitorActivityMode) {
    const part2SelectMode = isPart2Activity1Context || isPart2Activity2Context
    const part3SelectMode = isPart3Activity1Context || isPart3Activity2Context
    const part4SelectMode = isPart4Activity1Context || isPart4Activity2Context
    const monitorVariant = part2SelectMode
      ? 'keller-monitor-select'
      : part3SelectMode
        ? 'grossraum-monitor-select'
        : part4SelectMode
          ? 'einzelbuero-tablet-select'
          : activityVariantByPart[currentPart] || 'monitor'

    return (
      <MonitorActivityScene
        messages={chatMessages}
        options={monitorOptions}
        onSelectOption={handleSelectOption}
        variant={monitorVariant}
        backgroundImage={
          part2SelectMode
            ? '/backgrounds/keller-monitor.png'
            : part3SelectMode
              ? '/backgrounds/grossraum_monitor.png'
              : part4SelectMode
                ? '/backgrounds/einzelbuero_tablet.png'
                : null
        }
      />
    )
  }

  const hostSpecificBackground = (() => {
    if (selectedHostId !== 'clara' && selectedHostId !== 'uwe')
      return scene.backgroundImage
    const hostGenderBackground =
      selectedHostId === 'uwe'
        ? '/backgrounds/grossraum_mann.png'
        : '/backgrounds/grossraum_frau.png'
    const currentStepIndex = Number(stepData?.stepIndex ?? stepIndex ?? 0)
    if (currentPart === 2) {
      return selectedHostId === 'clara'
        ? '/backgrounds/keller-klara.png'
        : '/backgrounds/keller-uwe.png'
    }
    if (currentPart === 3) {
      if ([0, 1, 2, 5, 10, 11, 12, 13, 51].includes(currentStepIndex))
        return hostGenderBackground
      if (currentStepIndex === 52) return '/backgrounds/lift_aussen_grossraum.png'
      return '/backgrounds/grossraum_monitor.png'
    }
    if (currentPart === 4) {
      const part4HostBackground =
        selectedHostId === 'uwe'
          ? '/backgrounds/einzelbuero_mann.png'
          : '/backgrounds/einzelbuero_frau.png'
      if ([0, 1, 2, 5, 10, 11, 12, 20, 51, 52].includes(currentStepIndex))
        return part4HostBackground
      if (currentStepIndex === 53) return '/backgrounds/lift_innen.png'
      return '/backgrounds/einzelbuero_tablet.png'
    }
    if (currentPart === 5) {
      return '/backgrounds/kuppelsaal.png'
    }
    return scene.backgroundImage
  })()

  if (isSingleButtonTransition && singleButtonTransitionConfig) {
    return (
      <div className="scene">
        <SceneBackground
          backgroundImage={singleButtonTransitionConfig.backgroundImage}
          backgroundPlaceholder={scene.backgroundPlaceholder}
        />
        <div className="start-screen">
          <button
            type="button"
            className="start-screen__button"
            onClick={() => onPartChange?.(singleButtonTransitionConfig.nextPart)}
          >
            {singleButtonTransitionConfig.label}
          </button>
        </div>
      </div>
    )
  }

  const sceneForRender = [2, 3, 4, 5].includes(currentPart)
    ? {
        ...scene,
        backgroundImage: hostSpecificBackground,
        hideChatPanel: isFinalInternshipState,
      }
    : scene

  if (isStartScreen) {
    return (
      <div className="scene">
        <SceneBackground
          backgroundImage={scene.backgroundImage}
          backgroundPlaceholder={scene.backgroundPlaceholder}
        />
        <div className="start-screen">
          <button
            type="button"
            className="start-screen__button"
            onClick={() => onPartChange?.(0)}
          >
            Start
          </button>
        </div>
      </div>
    )
  }

  if (isFinalInternshipState) {
    return (
      <div className="scene">
        <SceneBackground
          backgroundImage={sceneForRender.backgroundImage}
          backgroundPlaceholder={sceneForRender.backgroundPlaceholder}
        />
        <div className="start-screen">
          <button
            type="button"
            className="start-screen__button start-screen__button--static"
            disabled
          >
            Praktikum erfolgreich beendet
          </button>
        </div>
      </div>
    )
  }

  return (
    <Scene
      scene={sceneForRender}
      messages={chatMessages}
      options={displayOptions}
      onSelectOption={handleSelectOption}
      selectedAvatarId={selectedAvatarId}
      selectedHostId={selectedHostId}
    />
  )
}
