import { useLayoutEffect, useRef, useState } from 'react'
import { SceneBackground } from './SceneBackground.jsx'
import { HostAvatar } from '../layout/HostAvatar.jsx'
import { renderMessageParagraphs } from '../chat/ChatPanel.jsx'

export function MonitorActivityScene({
  messages = [],
  options = [],
  onSelectOption,
  variant = 'monitor',
  backgroundImage = null,
  backgroundPlaceholder = null,
}) {
  const scrollRef = useRef(null)
  const previousSnapshotRef = useRef({
    firstMessageId: null,
    lastMessageId: null,
    length: 0,
  })
  const dragItemIdRef = useRef('')
  const [dragOverBucketId, setDragOverBucketId] = useState('')
  const sentenceOptions = options.filter((opt) => opt.kind === 'sentence')
  const choiceOptions = options.filter((opt) => opt.kind === 'choice')
  const boosterOptions = options.filter((opt) => opt.kind === 'booster')
  const bucketOptions = options.filter(
    (opt) => opt.kind === 'bucket-assignment'
  )
  const actionOptions = options.filter(
    (option) =>
      option.kind !== 'sentence' &&
      option.kind !== 'choice' &&
      option.kind !== 'booster' &&
      option.kind !== 'bucket-assignment'
  )
  const titleByVariant = {
    monitor: 'Stand-PC Monitor',
    tablet: 'Tablet Interface',
    hologram: 'Hologramm Interface',
  }
  const backgroundByVariant = {
    monitor:
      'radial-gradient(circle at 50% 20%, #213a56 0%, #0d1a2a 55%, #070f18 100%)',
    tablet:
      'radial-gradient(circle at 40% 20%, #2b3b58 0%, #132035 58%, #0a1421 100%)',
    hologram:
      'radial-gradient(circle at 50% 18%, #102b45 0%, #081a2a 52%, #050c14 100%)',
    'keller-monitor-select':
      'linear-gradient(180deg, #112f22 0%, #0c2219 100%)',
  }

  const isSentenceMode = !!sentenceOptions.length
  const isChoiceMode = !!choiceOptions.length
  const isBoosterMode = !!boosterOptions.length
  const isBucketMode = !!bucketOptions.length
  const firstPlayerIndex = messages.findIndex(
    (message) => message.speakerType === 'player'
  )
  const shouldSplitActivityThread =
    actionOptions.length > 0 &&
    (isSentenceMode || isChoiceMode || isBoosterMode || isBucketMode) &&
    firstPlayerIndex >= 0
  let leadMessages = []
  let trailingMessages = messages

  if (shouldSplitActivityThread) {
    leadMessages = messages.slice(0, firstPlayerIndex)
    trailingMessages = messages.slice(firstPlayerIndex)
  } else {
    const leadCount = messages.length
    leadMessages = messages.slice(0, Math.min(leadCount, messages.length))
    trailingMessages = messages.slice(Math.min(leadCount, messages.length))
  }
  const bucketTitle = bucketOptions[0]?.groupTitle || 'Aktivität'
  const bucketTopic = bucketOptions[0]?.topic || ''
  const bucketPrompt = bucketOptions[0]?.prompt || ''
  const bucketDefinitions = bucketOptions[0]?.bucketDefinitions || []
  const unassignedBucketLabel =
    bucketOptions[0]?.unassignedLabel || 'Nicht zugeordnet'
  const bucketPostAuthorName = bucketOptions[0]?.postAuthorName || ''
  const bucketPostAuthorAvatar = bucketOptions[0]?.postAuthorAvatar || ''
  const bucketHideTitle = Boolean(bucketOptions[0]?.hideTitle)
  const bucketHideTopic = Boolean(bucketOptions[0]?.hideTopic)
  const sentencePostAuthorName = sentenceOptions[0]?.postAuthorName || ''
  const sentencePostAuthorAvatar = sentenceOptions[0]?.postAuthorAvatar || ''
  const sentenceHideTitle = Boolean(sentenceOptions[0]?.hideTitle)
  const choicePostAuthorName = choiceOptions[0]?.postAuthorName || ''
  const choicePostAuthorAvatar = choiceOptions[0]?.postAuthorAvatar || ''
  const choiceHideTitle = Boolean(choiceOptions[0]?.hideTitle)
  const choiceHideTopic = Boolean(choiceOptions[0]?.hideTopic)
  const boosterPostAuthorName = boosterOptions[0]?.postAuthorName || ''
  const boosterPostAuthorAvatar = boosterOptions[0]?.postAuthorAvatar || ''
  const boosterHideTitle = Boolean(boosterOptions[0]?.hideTitle)
  const boosterHideTopic = Boolean(boosterOptions[0]?.hideTopic)
  const boosterPromptAfterNeutralPost = Boolean(
    boosterOptions[0]?.promptAfterNeutralPost
  )
  const boosterPromptHostId = boosterOptions[0]?.promptHostId || ''
  const boosterPromptSpeakerName = boosterOptions[0]?.promptSpeakerName || ''
  const boosterRenderNeutralPostAsMessage = Boolean(
    boosterOptions[0]?.renderNeutralPostAsMessage
  )
  const boosterNeutralPostHostId = boosterOptions[0]?.neutralPostHostId || ''

  const isSelectVariant = String(variant).includes('select')

  useLayoutEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const previous = previousSnapshotRef.current
    const firstMessageId = messages[0]?.id ?? null
    const lastMessageId = messages[messages.length - 1]?.id ?? null
    const hasOverflow = container.scrollHeight > container.clientHeight
    const startsNewThread =
      messages.length === 0 ||
      previous.length === 0 ||
      messages.length < previous.length ||
      firstMessageId !== previous.firstMessageId

    if (startsNewThread) {
      container.scrollTop = 0
    } else {
      const appendedMessage =
        messages.length > previous.length && lastMessageId !== previous.lastMessageId

      if (appendedMessage && hasOverflow) {
        container.scrollTop = container.scrollHeight
      }
    }

    previousSnapshotRef.current = {
      firstMessageId,
      lastMessageId,
      length: messages.length,
    }
  }, [messages])

  return (
    <div className="scene">
      <SceneBackground
        backgroundImage={backgroundImage}
        backgroundPlaceholder={
          backgroundPlaceholder ||
          backgroundByVariant[variant] ||
          backgroundByVariant.monitor
        }
      />

      <div className={`monitor-scene monitor-scene--${variant}`}>
        <div className="monitor-scene__bezel">
          <div className="monitor-scene__screen">
            <header className="monitor-scene__header">
              <h2 className="monitor-scene__title">
                {titleByVariant[variant] || titleByVariant.monitor}
              </h2>
            </header>

            <div className="monitor-scene__messages" ref={scrollRef}>
              {leadMessages.map((message) => (
                <article
                  key={message.id}
                  className={`monitor-message monitor-message--${message.speakerType === 'player' ? 'player' : 'host'}`}
                >
                  {message.speakerType !== 'player' && (
                    <HostAvatar
                      characterId={message.hostId ?? message.characterId}
                      speakerName={message.speakerName}
                    />
                  )}
                  <div className="monitor-message__bubble">
                    {message.speakerType !== 'player' && (
                      <strong className="monitor-message__speaker">
                        {message.speakerName || 'Host'}
                      </strong>
                    )}
                    {renderMessageParagraphs(message.text, {
                      className: 'monitor-message__paragraph',
                    })}
                  </div>
                </article>
              ))}

              {isSelectVariant && (
                <section
                  className="monitor-select"
                  aria-label="Beitrag analysieren"
                >
                  {!!sentenceOptions.length && (
                    <>
                      {!!sentencePostAuthorName && (
                        <div className="monitor-post-author">
                          {!!sentencePostAuthorAvatar && (
                            <img
                              className="monitor-post-author__avatar"
                              src={sentencePostAuthorAvatar}
                              alt={sentencePostAuthorName}
                            />
                          )}
                          <strong className="monitor-post-author__name">
                            {sentencePostAuthorName}
                          </strong>
                        </div>
                      )}
                      {!sentenceHideTitle && (
                        <h3 className="monitor-select__title">Beitrag</h3>
                      )}
                      <p className="monitor-select__paragraph monitor-select__paragraph--post">
                        {sentenceOptions.map((sentence, index) => (
                          <span key={`sentence-wrap-${sentence.id ?? index}`}>
                            <button
                              type="button"
                              className={`monitor-select__sentence ${sentence.selected ? 'monitor-select__sentence--selected' : ''}`}
                              onClick={() => onSelectOption?.(index, sentence)}
                              disabled={Boolean(sentence.disabled)}
                            >
                              {sentence.label}
                            </button>
                            {index < sentenceOptions.length - 1 && (
                              <span> </span>
                            )}
                          </span>
                        ))}
                      </p>
                    </>
                  )}

                  {!!choiceOptions.length && (
                    <div
                      className={`monitor-choice ${choicePostAuthorName ? 'monitor-choice--post' : ''}`}
                    >
                      {!!choicePostAuthorName && (
                        <div className="monitor-post-author">
                          {!!choicePostAuthorAvatar && (
                            <img
                              className="monitor-post-author__avatar"
                              src={choicePostAuthorAvatar}
                              alt={choicePostAuthorName}
                            />
                          )}
                          <strong className="monitor-post-author__name">
                            {choicePostAuthorName}
                          </strong>
                        </div>
                      )}
                      {!choiceHideTitle && (
                        <h3 className="monitor-select__title">
                          {choiceOptions[0]?.groupTitle || 'Aktivität 2'}
                        </h3>
                      )}
                      {!choiceHideTopic && !!choiceOptions[0]?.topic && (
                        <p className="monitor-choice__topic">
                          {choiceOptions[0]?.topic}
                        </p>
                      )}
                      <div className="monitor-choice__list">
                        {choiceOptions.map((choice, index) => (
                          <button
                            key={choice.id ?? `choice-${index}`}
                            type="button"
                            className={`monitor-choice__item ${choice.selected ? 'monitor-choice__item--selected' : ''}`}
                            onClick={() => onSelectOption?.(index, choice)}
                            disabled={Boolean(choice.disabled)}
                          >
                            <p className="monitor-choice__text">
                              {choice.text}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!!boosterOptions.length && (
                    <div
                      className={`monitor-choice ${boosterPostAuthorName ? 'monitor-choice--post' : ''}`}
                    >
                      {!!boosterPostAuthorName &&
                        !boosterRenderNeutralPostAsMessage && (
                        <div className="monitor-post-author">
                          {!!boosterPostAuthorAvatar && (
                            <img
                              className="monitor-post-author__avatar"
                              src={boosterPostAuthorAvatar}
                              alt={boosterPostAuthorName}
                            />
                          )}
                          <strong className="monitor-post-author__name">
                            {boosterPostAuthorName}
                          </strong>
                        </div>
                        )}
                      {!boosterHideTitle && (
                        <h3 className="monitor-select__title">
                          {boosterOptions[0]?.topic ||
                            boosterOptions[0]?.groupTitle ||
                            'Aktivität 2'}
                        </h3>
                      )}
                      {!boosterHideTopic &&
                        !!boosterOptions[0]?.prompt &&
                        !boosterPromptAfterNeutralPost && (
                        <p className="monitor-choice__topic">
                          {boosterOptions[0]?.prompt}
                        </p>
                      )}
                      {!!boosterOptions[0]?.neutralPost &&
                        (boosterRenderNeutralPostAsMessage ? (
                          <article className="monitor-message monitor-message--host monitor-message--embedded">
                            <HostAvatar
                              characterId={boosterNeutralPostHostId}
                              speakerName={boosterPostAuthorName}
                            />
                            <div className="monitor-message__bubble">
                              <strong className="monitor-message__speaker">
                                {boosterPostAuthorName || 'Host'}
                              </strong>
                              {renderMessageParagraphs(
                                boosterOptions[0]?.neutralPost,
                                {
                                  className: 'monitor-message__paragraph',
                                }
                              )}
                            </div>
                          </article>
                        ) : (
                          <div
                            className="monitor-choice__item monitor-choice__item--neutral"
                            aria-label="Ausgangspost"
                          >
                            <p className="monitor-choice__text">
                              {boosterOptions[0]?.neutralPost}
                            </p>
                          </div>
                        ))}
                      {!boosterHideTopic &&
                        !!boosterOptions[0]?.prompt &&
                        boosterPromptAfterNeutralPost && (
                          <article className="monitor-message monitor-message--host monitor-message--embedded">
                            <HostAvatar
                              characterId={boosterPromptHostId}
                              speakerName={boosterPromptSpeakerName}
                            />
                            <div className="monitor-message__bubble">
                              <strong className="monitor-message__speaker">
                                {boosterPromptSpeakerName || 'Host'}
                              </strong>
                              {renderMessageParagraphs(
                                boosterOptions[0]?.prompt,
                                {
                                  className: 'monitor-message__paragraph',
                                }
                              )}
                            </div>
                          </article>
                        )}
                      <div className="monitor-choice__list monitor-choice__list--spaced">
                        {boosterOptions.map((choice, index) => (
                          <button
                            key={choice.id ?? `booster-${index}`}
                            type="button"
                            className={`monitor-choice__item ${choice.selected ? 'monitor-choice__item--selected' : ''}`}
                            onClick={() => onSelectOption?.(index, choice)}
                            disabled={Boolean(choice.disabled)}
                          >
                            <p className="monitor-choice__text">
                              {choice.text}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!!bucketOptions.length && (
                    <div
                      className={`monitor-choice ${bucketPostAuthorName ? 'monitor-choice--post' : ''}`}
                    >
                      {!!bucketPostAuthorName && (
                        <div className="monitor-post-author">
                          {!!bucketPostAuthorAvatar && (
                            <img
                              className="monitor-post-author__avatar"
                              src={bucketPostAuthorAvatar}
                              alt={bucketPostAuthorName}
                            />
                          )}
                          <strong className="monitor-post-author__name">
                            {bucketPostAuthorName}
                          </strong>
                        </div>
                      )}
                      {!bucketHideTitle && (
                        <h3 className="monitor-select__title">
                          {bucketTopic || bucketTitle}
                        </h3>
                      )}
                      {!bucketHideTopic && !!bucketPrompt && (
                        <p className="monitor-choice__topic">{bucketPrompt}</p>
                      )}

                      <div
                        className={`monitor-bucket monitor-bucket--unassigned ${dragOverBucketId === 'unassigned' ? 'monitor-bucket--dragover' : ''}`}
                        onDragOver={(event) => {
                          event.preventDefault()
                          if (!bucketOptions[0]?.disabled)
                            setDragOverBucketId('unassigned')
                        }}
                        onDragLeave={() => setDragOverBucketId('')}
                        onDrop={(event) => {
                          event.preventDefault()
                          const itemId = dragItemIdRef.current
                          setDragOverBucketId('')
                          if (!itemId || bucketOptions[0]?.disabled) return
                          onSelectOption?.(0, {
                            kind: 'bucket-drop',
                            itemId,
                            bucketId: '',
                          })
                          dragItemIdRef.current = ''
                        }}
                      >
                        <h4 className="monitor-bucket__title">
                          {unassignedBucketLabel}
                        </h4>
                        <div className="monitor-bucket__items">
                          {bucketOptions
                            .filter((item) => !item.assignedBucketId)
                            .map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                className="monitor-bucket__item"
                                draggable={!item.disabled}
                                disabled={Boolean(item.disabled)}
                                onDragStart={() => {
                                  dragItemIdRef.current = item.itemId
                                }}
                                onDragEnd={() => {
                                  dragItemIdRef.current = ''
                                  setDragOverBucketId('')
                                }}
                              >
                                {item.text}
                              </button>
                            ))}
                        </div>
                      </div>

                      <div className="monitor-bucket-grid">
                        {bucketDefinitions.map((bucket) => (
                          <div
                            key={bucket.id}
                            className={`monitor-bucket ${dragOverBucketId === bucket.id ? 'monitor-bucket--dragover' : ''}`}
                            onDragOver={(event) => {
                              event.preventDefault()
                              if (!bucketOptions[0]?.disabled)
                                setDragOverBucketId(bucket.id)
                            }}
                            onDragLeave={() => setDragOverBucketId('')}
                            onDrop={(event) => {
                              event.preventDefault()
                              const itemId = dragItemIdRef.current
                              setDragOverBucketId('')
                              if (!itemId || bucketOptions[0]?.disabled) return
                              onSelectOption?.(0, {
                                kind: 'bucket-drop',
                                itemId,
                                bucketId: bucket.id,
                              })
                              dragItemIdRef.current = ''
                            }}
                          >
                            <h4 className="monitor-bucket__title">
                              {bucket.label}
                            </h4>
                            <div className="monitor-bucket__items">
                              {bucketOptions
                                .filter(
                                  (item) => item.assignedBucketId === bucket.id
                                )
                                .map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    className="monitor-bucket__item"
                                    draggable={!item.disabled}
                                    disabled={Boolean(item.disabled)}
                                    onDragStart={() => {
                                      dragItemIdRef.current = item.itemId
                                    }}
                                    onDragEnd={() => {
                                      dragItemIdRef.current = ''
                                      setDragOverBucketId('')
                                    }}
                                  >
                                    {item.text}
                                  </button>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {trailingMessages.map((message) => (
                <article
                  key={message.id}
                  className={`monitor-message monitor-message--${message.speakerType === 'player' ? 'player' : 'host'}`}
                >
                  {message.speakerType !== 'player' && (
                    <HostAvatar
                      characterId={message.hostId ?? message.characterId}
                      speakerName={message.speakerName}
                    />
                  )}
                  <div className="monitor-message__bubble">
                    {message.speakerType !== 'player' && (
                      <strong className="monitor-message__speaker">
                        {message.speakerName || 'Host'}
                      </strong>
                    )}
                    {renderMessageParagraphs(message.text, {
                      className: 'monitor-message__paragraph',
                    })}
                  </div>
                </article>
              ))}
            </div>

            <footer
              className="monitor-scene__options"
              role="group"
              aria-label="Aktivitätsoptionen"
            >
              {actionOptions.map((option, index) => (
                <button
                  key={option.id ?? index}
                  type="button"
                  className="monitor-scene__option"
                  onClick={() => onSelectOption?.(index, option)}
                  disabled={Boolean(option.disabled)}
                >
                  {option.label}
                </button>
              ))}
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
