import { useEffect, useState } from 'react'
import { GameScreen } from './pages/GameScreen.jsx'
import { AdminDialogScreen } from './pages/AdminDialogScreen.jsx'
import { useScene } from './hooks/useScene.js'
import { getSceneDialogs } from './api/dialogApi.js'

const FALLBACK_NAV_STEPS_BY_PART = {
  1: [
    { stepIndex: 0, type: 'intro' },
    { stepIndex: 2, type: 'intro' },
    { stepIndex: 5, type: 'intro' },
    { stepIndex: 7, type: 'transition' },
  ],
  2: [
    { stepIndex: 0, type: 'intro' },
    { stepIndex: 1, type: 'example' },
    { stepIndex: 2, type: 'example' },
    { stepIndex: 3, type: 'activity' },
    { stepIndex: 4, type: 'activity' },
    { stepIndex: 5, type: 'summary' },
    { stepIndex: 52, type: 'transition' },
  ],
  3: [
    { stepIndex: 0, type: 'intro' },
    { stepIndex: 1, type: 'example' },
    { stepIndex: 2, type: 'example' },
    { stepIndex: 3, type: 'activity' },
    { stepIndex: 4, type: 'activity' },
    { stepIndex: 5, type: 'summary' },
    { stepIndex: 52, type: 'transition' },
  ],
  4: [
    { stepIndex: 0, type: 'intro' },
    { stepIndex: 1, type: 'example' },
    { stepIndex: 2, type: 'example' },
    { stepIndex: 3, type: 'activity' },
    { stepIndex: 4, type: 'activity' },
    { stepIndex: 5, type: 'summary' },
    { stepIndex: 53, type: 'transition' },
  ],
  5: [
    { stepIndex: 0, type: 'intro' },
    { stepIndex: 1, type: 'summary' },
    { stepIndex: 5, type: 'transition' },
    { stepIndex: 6, type: 'transition' },
  ],
}

const PART1_SUBCHAPTERS = [
  { stepIndex: 0, label: 'Intro' },
  { stepIndex: 2, label: 'Fallakten' },
  { stepIndex: 5, label: 'Aufstieg' },
  { stepIndex: 7, label: 'Host-Auswahl' },
]

function buildSubchapters(steps = [], part = null) {
  if (Number(part) === 1) {
    const availableStepIndexes = new Set(
      (steps || [])
        .filter((step) => Number.isFinite(step?.stepIndex))
        .map((step) => step.stepIndex)
    )

    const entries = PART1_SUBCHAPTERS.filter((entry) =>
      availableStepIndexes.has(entry.stepIndex)
    )
    return entries.map((entry, index) => ({ ...entry, chapterIndex: index }))
  }

  const sortedSteps = [...steps]
    .filter((step) => Number.isFinite(step?.stepIndex))
    .sort((a, b) => a.stepIndex - b.stepIndex)

  const primarySteps = sortedSteps.filter((step) => {
    const type = String(step.type || 'dialog').toLowerCase()
    return (
      step.stepIndex < 10 ||
      (type === 'transition' && Number(step.stepIndex) >= 50)
    )
  })
  const entries = []
  let introAdded = false
  let exampleCount = 0
  let activityCount = 0
  let hasSummary = false
  let transitionAdded = false

  for (const step of primarySteps) {
    const type = String(step.type || 'dialog').toLowerCase()

    if (type === 'intro') {
      if (!introAdded) {
        entries.push({ stepIndex: step.stepIndex, label: 'Intro' })
        introAdded = true
      }
      continue
    }

    if (type === 'example') {
      exampleCount += 1
      entries.push({
        stepIndex: step.stepIndex,
        label: `Beispiel ${exampleCount}`,
      })
      continue
    }

    if (type === 'activity') {
      activityCount += 1
      entries.push({
        stepIndex: step.stepIndex,
        label: `Aktivität ${activityCount}`,
      })
      continue
    }

    if (type === 'summary') {
      if (!hasSummary) {
        entries.push({ stepIndex: step.stepIndex, label: 'Summary' })
        hasSummary = true
      }
      continue
    }

    if (type === 'transition') {
      const transitionLabel =
        Number(part) === 5 && Number(step.stepIndex) === 6
          ? 'Ende'
          : 'Transition'
      if (!hasSummary) {
        entries.push({ stepIndex: step.stepIndex, label: transitionLabel })
        transitionAdded = true
      } else if (!transitionAdded) {
        entries.push({ stepIndex: step.stepIndex, label: transitionLabel })
        transitionAdded = true
      } else if (Number(part) === 5 && Number(step.stepIndex) === 6) {
        entries.push({ stepIndex: step.stepIndex, label: 'Ende' })
      }
      continue
    }

    entries.push({
      stepIndex: step.stepIndex,
      label: `Schritt ${step.stepIndex}`,
    })
  }

  return entries.map((entry, index) => ({ ...entry, chapterIndex: index }))
}

function resolveActiveChapterStep(currentStepIndex, subchapters, steps = []) {
  if (!subchapters.length) return 0

  const chapterByStep = new Map(
    subchapters.map((chapter) => [chapter.stepIndex, chapter.stepIndex])
  )
  if (chapterByStep.has(currentStepIndex)) return currentStepIndex

  const step = steps.find((item) => item.stepIndex === currentStepIndex)
  if (step && Number(currentStepIndex) >= 10) {
    const type = String(step.type || 'dialog').toLowerCase()
    if (type === 'intro') {
      const introEntry = subchapters.find(
        (chapter) => chapter.label === 'Intro'
      )
      if (introEntry) return introEntry.stepIndex
    }
    if (type === 'example') {
      const exampleEntries = subchapters
        .filter((chapter) => String(chapter.label || '').startsWith('Beispiel'))
        .sort((a, b) => a.stepIndex - b.stepIndex)
      const lastExampleEntry = exampleEntries[exampleEntries.length - 1]
      if (lastExampleEntry) return lastExampleEntry.stepIndex
    }
    if (type === 'transition') {
      const transitionEntries = subchapters
        .filter(
          (chapter) =>
            chapter.label === 'Transition' || chapter.label === 'Ende'
        )
        .sort((a, b) => a.stepIndex - b.stepIndex)
      const matchingTransitionEntry = transitionEntries
        .filter((chapter) => chapter.stepIndex <= Number(currentStepIndex))
        .sort((a, b) => b.stepIndex - a.stepIndex)[0]
      if (matchingTransitionEntry) return matchingTransitionEntry.stepIndex
      const summaryEntry = subchapters.find(
        (chapter) => chapter.label === 'Summary'
      )
      if (summaryEntry) return summaryEntry.stepIndex
    }
  }

  if (step?.options?.length) {
    const candidateChapterSteps = step.options
      .map((option) => option?.nextStep)
      .filter(
        (nextStep) => Number.isFinite(nextStep) && chapterByStep.has(nextStep)
      )
      .sort((a, b) => a - b)
    if (candidateChapterSteps.length) return candidateChapterSteps[0]
  }

  const fallback = subchapters
    .map((chapter) => chapter.stepIndex)
    .filter((stepIndex) => stepIndex <= currentStepIndex)
    .sort((a, b) => b - a)[0]

  return fallback ?? subchapters[0].stepIndex
}

function getInternshipProgress({
  currentPart,
  dialogsByPart,
  activeStepByPart,
}) {
  const progressParts = [2, 3, 4, 5]
  if (!progressParts.includes(Number(currentPart))) return null

  const milestones = progressParts.flatMap((part) => {
    const steps = dialogsByPart[part]?.steps?.length
      ? dialogsByPart[part].steps
      : FALLBACK_NAV_STEPS_BY_PART[part] || []
    const subchapters = buildSubchapters(steps, part)
    return subchapters.map((chapter) => ({
      part,
      stepIndex: chapter.stepIndex,
    }))
  })

  if (milestones.length <= 1) {
    return {
      label: 'Praktikums-Fortschritt',
      percent: 0,
    }
  }

  const currentSteps = dialogsByPart[currentPart]?.steps?.length
    ? dialogsByPart[currentPart].steps
    : FALLBACK_NAV_STEPS_BY_PART[currentPart] || []
  const currentSubchapters = buildSubchapters(currentSteps, currentPart)
  const currentChapterStepIndex = resolveActiveChapterStep(
    activeStepByPart[currentPart] ?? 0,
    currentSubchapters,
    currentSteps
  )

  const currentMilestoneIndex = milestones.findIndex(
    (entry) =>
      entry.part === Number(currentPart) &&
      entry.stepIndex === Number(currentChapterStepIndex)
  )

  const normalizedIndex =
    currentMilestoneIndex >= 0 ? currentMilestoneIndex : 0
  const percent = Math.round(
    (normalizedIndex / (milestones.length - 1)) * 100
  )

  return {
    label: 'Praktikums-Fortschritt:',
    percent,
  }
}

function getVisibleAwardBadges(currentPart, activeChapterStepIndex) {
  const part = Number(currentPart)
  const step = Number(activeChapterStepIndex ?? 0)
  const badges = []

  if (part < 2) return badges

  if (part === 2) {
    if (step >= 52) {
      badges.push('/backgrounds/badge-junior-analyst-v2.png')
    }
    return badges
  }

  badges.push('/backgrounds/badge-junior-analyst-v2.png')

  if (part === 3) {
    if (step >= 52) {
      badges.push('/backgrounds/badge-specialist-v1.png')
    }
    return badges
  }

  badges.push('/backgrounds/badge-specialist-v1.png')

  if (part === 4) {
    if (step >= 53) {
      badges.push('/backgrounds/badge-debate-architect-v1.png')
    }
    return badges
  }

  badges.push('/backgrounds/badge-debate-architect-v1.png')
  return badges
}

export function App() {
  const { currentPart, setCurrentPart } = useScene(-1)
  const [selectedAvatarId, setSelectedAvatarId] = useState(null)
  const [selectedHostId, setSelectedHostId] = useState(() => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('selectedHostId') || null
  })
  const [viewMode, setViewMode] = useState('game')
  const [dialogsByPart, setDialogsByPart] = useState({})
  const [dialogApiStatus, setDialogApiStatus] = useState({
    ok: true,
    failedParts: [],
    lastError: '',
  })
  const [activeStepByPart, setActiveStepByPart] = useState({})
  const [showNavigation, setShowNavigation] = useState(false)
  const [stepJumpRequest, setStepJumpRequest] = useState({
    part: -1,
    stepIndex: 0,
    nonce: 0,
  })

  const handlePartChange = (part) => {
    setCurrentPart(part)
    setStepJumpRequest({ part, stepIndex: 0, nonce: Date.now() })
  }
  const handleSelectOption = (index, option, part) => {
    console.log('Antwort gewählt:', option?.label, 'Teil:', part)
  }
  const gameNavItems = [
    { id: -1, label: 'Start' },
    { id: 0, label: '0' },
    { id: 1, label: '1' },
    { id: 2, label: '2' },
    { id: 3, label: '3' },
    { id: 4, label: '4' },
    { id: 5, label: '5' },
  ]

  const activeSteps = dialogsByPart[currentPart]?.steps?.length
    ? dialogsByPart[currentPart].steps
    : FALLBACK_NAV_STEPS_BY_PART[currentPart] || []
  const activeSubchapters = buildSubchapters(activeSteps, currentPart)
  const activeChapterStepIndex = resolveActiveChapterStep(
    activeStepByPart[currentPart] ?? 0,
    activeSubchapters,
    activeSteps
  )
  const internshipProgress = getInternshipProgress({
    currentPart,
    dialogsByPart,
    activeStepByPart,
  })
  const visibleAwardBadges =
    viewMode === 'game' && !showNavigation
      ? getVisibleAwardBadges(currentPart, activeChapterStepIndex)
      : []

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (selectedHostId) {
      window.localStorage.setItem('selectedHostId', selectedHostId)
    } else {
      window.localStorage.removeItem('selectedHostId')
    }
  }, [selectedHostId])

  useEffect(() => {
    let active = true

    async function loadDialogsForNavigation() {
      const parts = [0, 1, 2, 3, 4, 5]
      const loaded = {}
      const failedParts = []
      let lastError = ''

      await Promise.all(
        parts.map(async (part) => {
          try {
            const data = await getSceneDialogs(part)
            loaded[part] = data
          } catch (error) {
            loaded[part] = null
            failedParts.push(part)
            lastError = error?.message || String(error || '')
            console.error(
              `[Dialog API] Teil ${part} konnte nicht geladen werden.`,
              error
            )
          }
        })
      )

      if (!active) return
      setDialogsByPart(loaded)
      setDialogApiStatus({
        ok: failedParts.length === 0,
        failedParts,
        lastError,
      })
    }

    loadDialogsForNavigation()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setActiveStepByPart((prev) => ({
      ...prev,
      [currentPart]: prev[currentPart] ?? 0,
    }))
  }, [currentPart])

  useEffect(() => {
    if (typeof window === 'undefined' || !document.documentElement) return
    function detectMobile() {
      const ua = navigator.userAgent || ''
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(ua)
      const isNarrow = window.matchMedia('(max-width: 640px)').matches
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isMobile = isMobileUA || (isNarrow && hasTouch)
      document.documentElement.dataset.mobile = isMobile ? 'true' : ''
    }
    detectMobile()
    window.addEventListener('resize', detectMobile)
    return () => window.removeEventListener('resize', detectMobile)
  }, [])

  return (
    <div className="app">
      <header className="app__header">
        {!dialogApiStatus.ok && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginBottom: '0.75rem',
              color: '#8b0000',
              fontWeight: 600,
            }}
          >
            Backend-Dialoge nicht erreichbar (Teile:{' '}
            {dialogApiStatus.failedParts.join(', ')}). Letzter Fehler:{' '}
            {dialogApiStatus.lastError || 'unbekannt'}
          </div>
        )}
        <button
          type="button"
          className={`app__settings-btn ${showNavigation ? 'app__settings-btn--active' : ''}`}
          onClick={() => setShowNavigation((prev) => !prev)}
          aria-pressed={showNavigation}
          aria-label="Navigation ein- oder ausblenden"
          title="Navigation ein- oder ausblenden"
        >
          ⚙
        </button>
        <nav className="app__nav">
          {viewMode === 'game' && (internshipProgress || visibleAwardBadges.length) ? (
            <div className="app__header-game-row">
              {internshipProgress && (
                <div
                  className="app__progress"
                  aria-label={`${internshipProgress.label}: ${internshipProgress.percent} Prozent`}
                >
                  <div className="app__progress-meta">
                    <span className="app__progress-label">
                      {internshipProgress.label}
                    </span>
                    <strong className="app__progress-value">
                      {internshipProgress.percent}%
                    </strong>
                  </div>
                  <div className="app__progress-track" aria-hidden="true">
                    <div
                      className="app__progress-fill"
                      style={{ width: `${internshipProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}
              {!!visibleAwardBadges.length && (
                <div className="app__award-strip" aria-label="Erreichte Abzeichen">
                  <span className="app__award-label">
                    Gesammelte Karriere-Abzeichen
                  </span>
                  <div className="app__award-badges">
                    {visibleAwardBadges.map((src, index) => (
                      <img
                        key={src}
                        className="app__award-badge"
                        src={src}
                        alt={`Abzeichen ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
          {showNavigation && (
            <div className="app__nav-controls">
              <button
                type="button"
                className={`app__mode-btn ${viewMode === 'game' ? 'app__mode-btn--active' : ''}`}
                onClick={() => setViewMode('game')}
              >
                Spiel
              </button>
              <button
                type="button"
                className={`app__mode-btn ${viewMode === 'admin' ? 'app__mode-btn--active' : ''}`}
                onClick={() => setViewMode('admin')}
              >
                Admin
              </button>
              {viewMode === 'game' &&
                gameNavItems.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={`app__nav-btn ${label === 'Start' ? 'app__nav-btn--label' : ''} ${currentPart === id ? 'app__nav-btn--active' : ''}`}
                    onClick={() => handlePartChange(id)}
                    aria-pressed={currentPart === id}
                    aria-label={label === 'Start' ? 'Start' : `Teil ${id}`}
                  >
                    {label}
                  </button>
                ))}
            </div>
          )}
        </nav>
        {showNavigation &&
          viewMode === 'game' &&
          currentPart > 0 &&
          activeSubchapters.length > 0 && (
            <nav
              className="app__subnav"
              aria-label={`Unterkapitel Teil ${currentPart}`}
            >
              {activeSubchapters.map((chapter) => (
                <button
                  key={`${currentPart}.${chapter.chapterIndex}`}
                  type="button"
                  className={`app__subnav-btn ${activeChapterStepIndex === chapter.stepIndex ? 'app__subnav-btn--active' : ''}`}
                  onClick={() =>
                    setStepJumpRequest({
                      part: currentPart,
                      stepIndex: chapter.stepIndex,
                      nonce: Date.now(),
                    })
                  }
                  aria-pressed={activeChapterStepIndex === chapter.stepIndex}
                  aria-label={`Teil ${currentPart}.${chapter.chapterIndex}: ${chapter.label}`}
                >
                  <span className="app__subnav-index">
                    {currentPart}.{chapter.chapterIndex}
                  </span>
                  <span className="app__subnav-label">{chapter.label}</span>
                </button>
              ))}
            </nav>
          )}
      </header>
      <main className={`app__main ${showNavigation ? '' : 'app__main--compact'}`}>
        {viewMode === 'game' ? (
          <GameScreen
            currentPart={currentPart}
            onPartChange={handlePartChange}
            onSelectOption={handleSelectOption}
            stepJumpRequest={
              stepJumpRequest.part === currentPart ? stepJumpRequest : null
            }
            onStepChange={(part, stepIndex) => {
              setActiveStepByPart((prev) =>
                prev[part] === stepIndex ? prev : { ...prev, [part]: stepIndex }
              )
            }}
            selectedAvatarId={selectedAvatarId}
            onSelectAvatar={setSelectedAvatarId}
            selectedHostId={selectedHostId}
            onSelectHost={setSelectedHostId}
          />
        ) : (
          <AdminDialogScreen />
        )}
      </main>
    </div>
  )
}
