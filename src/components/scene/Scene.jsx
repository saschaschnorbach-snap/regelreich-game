import { SceneBackground } from './SceneBackground.jsx'
import { ChatPanel } from '../chat/ChatPanel.jsx'
import { getPlayerAvatarComponent } from '../layout/PlayerAvatars.jsx'

/**
 * Container: Hintergrund + Chatbox rechts + Spieler-Avatar links unten.
 */
export function Scene({ scene, messages = [], options = [], onSelectOption, selectedAvatarId, selectedHostId }) {
  if (!scene) return null

  const { backgroundImage, backgroundPlaceholder } = scene
  const AvatarComponent = getPlayerAvatarComponent(selectedAvatarId)
  const hideChatPanel = scene?.hideChatPanel === true

  return (
    <div className="scene">
      <SceneBackground
        backgroundImage={backgroundImage}
        backgroundPlaceholder={backgroundPlaceholder}
      />

      {!hideChatPanel && (
        <div className="scene__chat-wrap">
          <ChatPanel
            messages={messages}
            options={options}
            onSelectOption={onSelectOption}
            selectedHostId={selectedHostId}
            selectedAvatarId={selectedAvatarId}
            title={scene?.id === 0 ? 'Regelreich' : 'Media Lab Luminara'}
          />
        </div>
      )}

      {scene?.id !== 0 && (
        <div className="scene__player-dock" aria-hidden="true">
          <div className="scene__player-avatar">
            <AvatarComponent className="scene__player-avatar-img" />
          </div>
        </div>
      )}
    </div>
  )
}
