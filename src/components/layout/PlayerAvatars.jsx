/**
 * Spieler-Avatare als generierte Bilder (Mädchen, Junge, Hund).
 */

export function GenericAvatar({ className = '' }) {
  // Fallback, falls noch nichts gewählt ist (wir nehmen hier einfach den Jungen als Default)
  return <img src="/backgrounds/avatar_boy.png" alt="Generischer Avatar" className={`avatar-img ${className}`} />
}

export function Avatar1({ className = '' }) {
  return <img src="/backgrounds/avatar_girl.png" alt="Avatar Mädchen" className={`avatar-img ${className}`} />
}

export function Avatar2({ className = '' }) {
  return <img src="/backgrounds/avatar_boy.png" alt="Avatar Junge" className={`avatar-img ${className}`} />
}

export function Avatar3({ className = '' }) {
  return <img src="/backgrounds/avatar_dog.png" alt="Avatar Hund" className={`avatar-img ${className}`} />
}

const AVATAR_MAP = {
  avatar1: Avatar1,
  avatar2: Avatar2,
  avatar3: Avatar3,
}

export function getPlayerAvatarComponent(avatarId) {
  return (avatarId && AVATAR_MAP[avatarId]) || GenericAvatar
}
