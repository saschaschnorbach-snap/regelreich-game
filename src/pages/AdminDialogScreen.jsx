import { useEffect, useMemo, useState } from 'react'
import {
  createSceneDialogStep,
  deleteSceneDialogStep,
  getSceneDialogs,
  getSceneFlow,
  getScenes,
  updateSceneDialogStep,
} from '../api/dialogApi.js'

const HOST_CHOICES = [
  { id: 'ambassador', label: 'Botschafter Regelreich' },
  { id: 'selected', label: 'Gewählter Host (aus Teil 1)' },
  { id: 'clara', label: 'Klara Blick' },
  { id: 'uwe', label: 'Uwe R. Blick' },
  { id: 'emma', label: 'Emma Pör' },
  { id: 'konrad', label: 'Konrad Sens' },
  { id: 'didi', label: 'Didi Fam' },
]

const STEP_TYPES = [
  { id: 'intro', label: 'Einführung' },
  { id: 'example', label: 'Beispiel' },
  { id: 'activity', label: 'Aktivität' },
  { id: 'summary', label: 'Zusammenfassung' },
  { id: 'transition', label: 'Übergang' },
  { id: 'dialog', label: 'Dialog' },
]

function emptyForm(stepIndex = 0) {
  return {
    stepIndex,
    type: 'dialog',
    speechBubbles: [{ hostId: 'selected', text: '', showOnOptionId: '' }],
    options: [{ id: '', label: '', nextStep: '', nextPart: '' }],
    activityConfigText: '',
  }
}

function toNumberOrNull(value) {
  if (value === '' || value == null) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

function normalizeForApi(formData) {
  const activityConfigRaw = formData.activityConfigText?.trim()
  let parsedActivityConfig = null
  if (activityConfigRaw) {
    try {
      parsedActivityConfig = JSON.parse(activityConfigRaw)
    } catch {
      throw new Error('activityConfig ist kein gültiges JSON.')
    }

    if (
      !parsedActivityConfig ||
      typeof parsedActivityConfig !== 'object' ||
      Array.isArray(parsedActivityConfig)
    ) {
      throw new Error('activityConfig muss ein JSON-Objekt sein.')
    }
  }

  return {
    stepIndex: Number(formData.stepIndex),
    type: formData.type || 'dialog',
    speechBubbles: formData.speechBubbles
      .filter((item) => item.text && item.text.trim())
      .map((item) => ({
        hostId: item.hostId || 'selected',
        text: item.text.trim(),
        ...(item.showOnOptionId?.trim()
          ? { showOnOptionId: item.showOnOptionId.trim() }
          : {}),
      })),
    options: formData.options
      .filter((item) => item.label && item.label.trim())
      .map((item, index) => {
        const out = {
          id: item.id?.trim() || `opt-${formData.stepIndex}-${index}`,
          label: item.label.trim(),
        }

        const nextStep = toNumberOrNull(item.nextStep)
        const nextPart = toNumberOrNull(item.nextPart)

        if (nextStep != null) out.nextStep = nextStep
        if (nextPart != null) out.nextPart = nextPart

        return out
      }),
    ...(parsedActivityConfig ? { activityConfig: parsedActivityConfig } : {}),
  }
}

function fromStep(step) {
  return {
    stepIndex: step.stepIndex,
    type: step.type ?? 'dialog',
    speechBubbles: (step.speechBubbles || []).map((item) => ({
      hostId: item.hostId ?? 'selected',
      text: item.text ?? '',
      showOnOptionId: item.showOnOptionId ?? '',
    })),
    options: (step.options || []).map((item) => ({
      id: item.id ?? '',
      label: item.label ?? '',
      nextStep: item.nextStep ?? '',
      nextPart: item.nextPart ?? '',
    })),
    activityConfigText: step.activityConfig
      ? JSON.stringify(step.activityConfig, null, 2)
      : '',
  }
}

export function AdminDialogScreen() {
  const [scenes, setScenes] = useState([])
  const [selectedSceneId, setSelectedSceneId] = useState(null)
  const [sceneDialogs, setSceneDialogs] = useState({ sceneId: null, steps: [] })
  const [sceneFlow, setSceneFlow] = useState({ nodes: [], edges: [] })
  const [editingStepIndex, setEditingStepIndex] = useState(null)
  const [formData, setFormData] = useState(emptyForm(0))
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const sortedSteps = useMemo(
    () =>
      [...(sceneDialogs.steps || [])].sort((a, b) => a.stepIndex - b.stepIndex),
    [sceneDialogs.steps]
  )

  const flowItems = useMemo(() => {
    const edgesByStep = new Map()
    for (const edge of sceneFlow.edges || []) {
      const key = edge.fromStepIndex
      const list = edgesByStep.get(key) || []
      list.push(edge)
      edgesByStep.set(key, list)
    }

    return (sceneFlow.nodes || []).map((node) => {
      const edges = edgesByStep.get(node.stepIndex) || []
      const links = edges.map((edge) => {
        if (edge.target === 'step')
          return `${edge.optionLabel} -> Step ${edge.toStepIndex}`
        if (edge.target === 'scene')
          return `${edge.optionLabel} -> Teil ${edge.toSceneId}`
        return `${edge.optionLabel} -> Ende`
      })

      return {
        stepIndex: node.stepIndex,
        type: node.type,
        links,
      }
    })
  }, [sceneFlow])

  async function loadScenes() {
    setLoading(true)
    setError('')
    try {
      const data = await getScenes()
      setScenes(data)
      const firstSceneId =
        data.find((scene) => scene.sceneId === 1)?.sceneId ??
        data[0]?.sceneId ??
        null
      if (selectedSceneId == null && firstSceneId != null) {
        setSelectedSceneId(firstSceneId)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadDialogs(sceneId) {
    if (sceneId == null) return

    setLoading(true)
    setError('')
    try {
      const [dialogData, flowData] = await Promise.all([
        getSceneDialogs(sceneId),
        getSceneFlow(sceneId),
      ])
      setSceneDialogs(dialogData)
      setSceneFlow(flowData)
      setEditingStepIndex(null)
      const nextIndex =
        Math.max(
          -1,
          ...(dialogData.steps || []).map((step) => step.stepIndex)
        ) + 1
      setFormData(emptyForm(nextIndex))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadScenes()
  }, [])

  useEffect(() => {
    if (selectedSceneId != null) {
      loadDialogs(selectedSceneId)
    }
  }, [selectedSceneId])

  function updateBubble(index, field, value) {
    setFormData((prev) => {
      const next = [...prev.speechBubbles]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, speechBubbles: next }
    })
  }

  function updateOption(index, field, value) {
    setFormData((prev) => {
      const next = [...prev.options]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, options: next }
    })
  }

  function selectStep(stepIndex) {
    const step = sortedSteps.find((item) => item.stepIndex === stepIndex)
    if (!step) return
    setEditingStepIndex(stepIndex)
    setFormData(fromStep(step))
    setStatus('')
  }

  function startNewStep() {
    const nextIndex =
      Math.max(-1, ...sortedSteps.map((step) => step.stepIndex)) + 1
    setEditingStepIndex(null)
    setFormData(emptyForm(nextIndex))
    setStatus('Neuer Dialogschritt vorbereitet.')
  }

  async function saveStep() {
    if (selectedSceneId == null) return

    setLoading(true)
    setError('')
    setStatus('')

    try {
      const payload = normalizeForApi(formData)

      if (editingStepIndex == null) {
        await createSceneDialogStep(selectedSceneId, payload)
        setStatus(`Dialogschritt ${payload.stepIndex} erstellt.`)
      } else {
        await updateSceneDialogStep(selectedSceneId, editingStepIndex, payload)
        setStatus(`Dialogschritt ${editingStepIndex} aktualisiert.`)
      }

      await loadDialogs(selectedSceneId)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function removeStep() {
    if (selectedSceneId == null || editingStepIndex == null) return

    setLoading(true)
    setError('')
    setStatus('')

    try {
      await deleteSceneDialogStep(selectedSceneId, editingStepIndex)
      setStatus(`Dialogschritt ${editingStepIndex} gelöscht.`)
      await loadDialogs(selectedSceneId)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="admin">
      <div className="admin__header">
        <h1 className="admin__title">Dialogverwaltung</h1>
        <p className="admin__subtitle">
          Szenen 0-5 mit kompletter Dialoglogik und Verzweigungen.
        </p>
      </div>

      <div className="admin__layout">
        <aside className="admin__panel">
          <h2>Szenen</h2>
          <div className="admin__list">
            {scenes.map((scene) => (
              <button
                key={scene.sceneId}
                type="button"
                className={`admin__list-btn ${scene.sceneId === selectedSceneId ? 'admin__list-btn--active' : ''}`}
                onClick={() => setSelectedSceneId(scene.sceneId)}
              >
                <span>Teil {scene.sceneId}</span>
                <small>{scene.name}</small>
                <small>{scene.stepCount} Schritte</small>
              </button>
            ))}
          </div>
        </aside>

        <aside className="admin__panel">
          <div className="admin__panel-head">
            <h2>Konversation</h2>
            <button
              type="button"
              className="admin__action"
              onClick={startNewStep}
            >
              Neu
            </button>
          </div>
          <div className="admin__list">
            {sortedSteps.map((step) => (
              <button
                key={step.stepIndex}
                type="button"
                className={`admin__list-btn ${editingStepIndex === step.stepIndex ? 'admin__list-btn--active' : ''}`}
                onClick={() => selectStep(step.stepIndex)}
              >
                <span>Step {step.stepIndex}</span>
                <small>Typ: {step.type ?? 'dialog'}</small>
                <small>{step.options?.length || 0} Verzweigungen</small>
              </button>
            ))}
            {!sortedSteps.length && (
              <p className="admin__hint">Keine Dialogschritte vorhanden.</p>
            )}
          </div>

          <h3 className="admin__flow-title">Flow / Verzweigungen</h3>
          <div className="admin__flow">
            {flowItems.map((item) => (
              <div key={`flow-${item.stepIndex}`} className="admin__flow-step">
                <strong>
                  Step {item.stepIndex} ({item.type})
                </strong>
                {item.links.length ? (
                  item.links.map((line, index) => (
                    <div key={`flow-${item.stepIndex}-${index}`}>{line}</div>
                  ))
                ) : (
                  <div>Keine ausgehende Verzweigung</div>
                )}
              </div>
            ))}
            {!flowItems.length && <div>Kein Flow vorhanden.</div>}
          </div>
        </aside>

        <div className="admin__editor">
          <div className="admin__panel-head">
            <h2>
              {editingStepIndex == null
                ? 'Neuer Dialogschritt'
                : `Step ${editingStepIndex} bearbeiten`}
            </h2>
          </div>

          <label className="admin__field">
            <span>Step Index</span>
            <input
              type="number"
              value={formData.stepIndex}
              disabled={editingStepIndex != null}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  stepIndex: Number(event.target.value),
                }))
              }
            />
          </label>

          <label className="admin__field">
            <span>Step Typ</span>
            <select
              value={formData.type}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, type: event.target.value }))
              }
            >
              {STEP_TYPES.map((choice) => (
                <option key={choice.id} value={choice.id}>
                  {choice.label}
                </option>
              ))}
            </select>
          </label>

          <h3>Host-Nachrichten</h3>
          {(formData.speechBubbles || []).map((bubble, index) => (
            <div key={`bubble-${index}`} className="admin__block">
              <label className="admin__field">
                <span>Sprecher</span>
                <select
                  value={bubble.hostId}
                  onChange={(event) =>
                    updateBubble(index, 'hostId', event.target.value)
                  }
                >
                  {HOST_CHOICES.map((choice) => (
                    <option key={choice.id} value={choice.id}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin__field admin__field--full">
                <span>Text</span>
                <textarea
                  rows="3"
                  value={bubble.text}
                  onChange={(event) =>
                    updateBubble(index, 'text', event.target.value)
                  }
                />
              </label>
              <label className="admin__field admin__field--full">
                <span>Anzeigen wenn Option-ID gewählt wurde (optional)</span>
                <input
                  value={bubble.showOnOptionId}
                  onChange={(event) =>
                    updateBubble(index, 'showOnOptionId', event.target.value)
                  }
                  placeholder="z. B. ok, skeptisch, rightA"
                />
              </label>
              <button
                type="button"
                className="admin__link"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    speechBubbles: prev.speechBubbles.filter(
                      (_, i) => i !== index
                    ),
                  }))
                }
                disabled={formData.speechBubbles.length <= 1}
              >
                Nachricht entfernen
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin__action"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                speechBubbles: [
                  ...prev.speechBubbles,
                  { hostId: 'selected', text: '', showOnOptionId: '' },
                ],
              }))
            }
          >
            Nachricht hinzufügen
          </button>

          <h3>Antwortoptionen / Branches</h3>
          {(formData.options || []).map((optionItem, index) => (
            <div key={`option-${index}`} className="admin__block">
              <label className="admin__field">
                <span>ID</span>
                <input
                  value={optionItem.id}
                  onChange={(event) =>
                    updateOption(index, 'id', event.target.value)
                  }
                />
              </label>
              <label className="admin__field admin__field--full">
                <span>Label</span>
                <input
                  value={optionItem.label}
                  onChange={(event) =>
                    updateOption(index, 'label', event.target.value)
                  }
                />
              </label>
              <label className="admin__field">
                <span>nextStep</span>
                <input
                  value={optionItem.nextStep}
                  onChange={(event) =>
                    updateOption(index, 'nextStep', event.target.value)
                  }
                />
              </label>
              <label className="admin__field">
                <span>nextPart</span>
                <input
                  value={optionItem.nextPart}
                  onChange={(event) =>
                    updateOption(index, 'nextPart', event.target.value)
                  }
                />
              </label>
              <button
                type="button"
                className="admin__link"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    options: prev.options.filter((_, i) => i !== index),
                  }))
                }
                disabled={formData.options.length <= 1}
              >
                Option entfernen
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin__action"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                options: [
                  ...prev.options,
                  { id: '', label: '', nextStep: '', nextPart: '' },
                ],
              }))
            }
          >
            Option hinzufügen
          </button>

          <h3>Activity Config (JSON, optional)</h3>
          <label className="admin__field admin__field--full">
            <span>activityConfig</span>
            <textarea
              rows="10"
              value={formData.activityConfigText}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  activityConfigText: event.target.value,
                }))
              }
              placeholder='{"mode":"sentence-marking","sentences":[...]}'
            />
          </label>
          <p className="admin__hint">
            Aenderungen werden mit Speichern uebernommen.
          </p>

          <div className="admin__actions">
            <button
              type="button"
              className="admin__action"
              onClick={saveStep}
              disabled={loading}
            >
              Speichern
            </button>
            <button
              type="button"
              className="admin__danger"
              onClick={removeStep}
              disabled={loading || editingStepIndex == null}
            >
              Löschen
            </button>
          </div>

          {loading && <p className="admin__hint">Lade...</p>}
          {status && <p className="admin__success">{status}</p>}
          {error && <p className="admin__error">{error}</p>}
        </div>
      </div>
    </section>
  )
}
