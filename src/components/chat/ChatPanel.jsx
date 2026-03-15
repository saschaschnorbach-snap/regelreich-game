import { useLayoutEffect, useRef } from 'react'
import { HostAvatar } from '../layout/HostAvatar.jsx'
import { getPlayerAvatarComponent } from '../layout/PlayerAvatars.jsx'

function isAvatarOption(option) {
  const id = String(option?.id || '').toLowerCase()
  return (
    option?.kind === 'avatar' ||
    id === 'avatar1' ||
    id === 'avatar2' ||
    id === 'avatar3'
  )
}

function getHostDisplayName(hostId, speakerName, selectedHostId) {
  const id = String(hostId || '').toLowerCase()
  const name = String(speakerName || '').toLowerCase()

  // If a specific non-host speaker label is provided (e.g. "Botschafter Regelreich"),
  // prefer it over dynamic host resolution from selectedHostId.
  if (speakerName && id !== 'selected') {
    if (
      !name.includes('clara') &&
      !name.includes('uwe') &&
      !name.includes('host')
    ) {
      return speakerName
    }
  }

  if (id === 'ambassador') return 'Botschafter Regelreich'
  if (id === 'host' && selectedHostId === 'clara') return 'Klara Blick'
  if (id === 'host' && selectedHostId === 'uwe') return 'Uwe R. Blick'
  if (id === 'selected' && selectedHostId === 'clara') return 'Klara Blick'
  if (id === 'selected' && selectedHostId === 'uwe') return 'Uwe R. Blick'
  if (id === 'clara' || name.includes('clara')) return 'Klara Blick'
  if (id === 'uwe' || name.includes('uwe')) return 'Uwe R. Blick'
  return speakerName || 'Host'
}

function getImageMaxWidth(message) {
  return message.imageScale
    ? `${Math.max(1, Math.min(100, message.imageScale * 100))}%`
    : '100%'
}

export function renderMessageParagraphs(
  text,
  { className = 'chat-message__paragraph', style } = {}
) {
  const normalized = String(text ?? '').replace(/\r\n?/g, '\n')
  const paragraphs = normalized.split(/\n\s*\n+/)

  return paragraphs.map((paragraph, index) => (
    <p
      key={`p-${index}`}
      className={className}
      style={
        style ?? {
          whiteSpace: 'pre-wrap',
          margin: index === 0 ? 0 : '0.8em 0 0 0',
        }
      }
    >
      {paragraph}
    </p>
  ))
}

export function ChatPanel({
  messages = [],
  options = [],
  onSelectOption,
  selectedHostId,
  selectedAvatarId,
  title = 'Media Lab Luminara',
}) {
  const scrollRef = useRef(null)
  const previousSnapshotRef = useRef({
    firstMessageId: null,
    lastMessageId: null,
    length: 0,
  })
  const avatarOptions = options.filter((option) => isAvatarOption(option))
  const textOptions = options.filter((option) => !isAvatarOption(option))

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
  }, [messages, options])

  function handleMessageImageLoad() {
    const container = scrollRef.current
    if (!container) return

    const hasOverflow = container.scrollHeight > container.clientHeight
    if (hasOverflow) {
      container.scrollTop = container.scrollHeight
    }
  }

  return (
    <section className="chat-panel" aria-label="Konversationsfenster">
      <header className="chat-panel__header">
        <h2 className="chat-panel__title">{title}</h2>
      </header>

      <div className="chat-panel__messages" ref={scrollRef}>
        {messages.map((message) => {
          const isBadgeImage = message.presentation === 'badge'
          const isJuniorBadge = String(message.imageSrc || '').includes(
            'badge-junior-analyst-v2.png'
          )
          const isImageOnlyMessage = Boolean(
            message.imageSrc && !message.text && !message.speakerName
          )
          const hostDisplayName =
            message.speakerType === 'player'
              ? message.speakerName
              : getHostDisplayName(
                  message.hostId ?? message.characterId,
                  message.speakerName,
                  selectedHostId
                )

          return (
            <article
              key={message.id}
              className={`chat-message chat-message--${message.speakerType === 'player' ? 'player' : 'host'} ${isBadgeImage ? 'chat-message--badge-only' : ''}`}
            >
              {message.speakerType !== 'player' && !isBadgeImage && (
                <HostAvatar
                  characterId={message.hostId ?? message.characterId}
                  speakerName={hostDisplayName}
                />
              )}
              <div
                className={`chat-message__bubble ${isImageOnlyMessage ? 'chat-message__bubble--image-only' : ''} ${isBadgeImage ? 'chat-message__bubble--badge-only' : ''}`}
              >
                {message.speakerName &&
                  message.speakerType !== 'player' &&
                  !isBadgeImage &&
                  !message.imageSrc && (
                  <strong className="chat-message__speaker">
                    {hostDisplayName}
                  </strong>
                )}
                {!!message.imageSrc && (
                  isJuniorBadge ? (
                    <span
                      style={{
                        position: 'relative',
                        display: 'block',
                        width: getImageMaxWidth(message),
                        margin: '0 auto',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          left: '17%',
                          top: '9%',
                          width: '66%',
                          height: '52%',
                          background: '#ffffff',
                          borderRadius: '45% 45% 34% 34%',
                          zIndex: 0,
                        }}
                      />
                      <img
                        src={message.imageSrc}
                        alt={message.imageAlt || ''}
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          display: 'block',
                          width: '100%',
                          height: 'auto',
                        }}
                        onLoad={handleMessageImageLoad}
                      />
                    </span>
                  ) : (
                    <img
                      src={message.imageSrc}
                      alt={message.imageAlt || ''}
                      style={{
                        display: 'block',
                        margin: '0 auto',
                        maxWidth: getImageMaxWidth(message),
                        height: 'auto',
                      }}
                      onLoad={handleMessageImageLoad}
                    />
                  )
                )}
                {message.text ? renderMessageParagraphs(message.text) : null}
              </div>
            </article>
          )
        })}
      </div>

      <footer
        className="chat-panel__options"
        role="group"
        aria-label="Antwortoptionen"
      >
        {!!avatarOptions.length && (
          <div
            className="chat-panel__avatar-options"
            role="group"
            aria-label="Avatar-Auswahl"
          >
            {avatarOptions.map((option, index) => {
              const avatarId =
                option.avatarId || String(option.id || '').toLowerCase()
              const AvatarComponent = getPlayerAvatarComponent(avatarId)
              const isSelected = avatarId === selectedAvatarId

              return (
                <button
                  key={option.id ?? `avatar-${index}`}
                  type="button"
                  className={`chat-panel__avatar-option ${isSelected ? 'chat-panel__avatar-option--selected' : ''}`}
                  onClick={() => onSelectOption?.(index, option)}
                  aria-label={`Avatar ${index + 1} auswählen`}
                  aria-pressed={isSelected}
                >
                  <AvatarComponent className="chat-panel__avatar-image" />
                </button>
              )
            })}
          </div>
        )}

        {textOptions.map((option, index) => (
          <button
            key={option.id ?? index}
            type="button"
            className="chat-panel__option"
            onClick={() =>
              onSelectOption?.(index + avatarOptions.length, option)
            }
            disabled={Boolean(option.disabled)}
          >
            {option.label}
          </button>
        ))}
      </footer>
    </section>
  )
}
