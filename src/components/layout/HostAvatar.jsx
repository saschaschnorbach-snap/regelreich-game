function resolveHostId(characterId, speakerName) {
  const id = String(characterId || '').toLowerCase()
  if (
    id === 'clara' ||
    id === 'uwe' ||
    id === 'ambassador' ||
    id === 'emma' ||
    id === 'konrad' ||
    id === 'didi'
  ) {
    return id
  }

  const name = String(speakerName || '').toLowerCase()
  if (name.includes('clara')) return 'clara'
  if (name.includes('uwe')) return 'uwe'
  if (name.includes('botschafterin')) return 'ambassador'
  if (name.includes('emma')) return 'emma'
  if (name.includes('konrad')) return 'konrad'
  if (name.includes('didi')) return 'didi'
  return 'host'
}

function ClaraAvatar() {
  return <img src="/backgrounds/avatar-klara.png" className="host-avatar__img" alt="Klara Blick" />
}

function UweAvatar() {
  return <img src="/backgrounds/avatar-uwe.png" className="host-avatar__img" alt="Uwe R. Blick" />
}

function AmbassadorAvatar() {
  return <img src="/backgrounds/botschafterin.png" className="host-avatar__img" alt="Botschafterin Regelreich" />
}

function KonradAvatar() {
  return <img src="/backgrounds/konrad_sens.png" className="host-avatar__img" alt="Konrad Sens" />
}

function EmmaAvatar() {
  return <img src="/backgrounds/emma-poer.png" className="host-avatar__img" alt="Emma Pör" />
}

function DidiAvatar() {
  return <img src="/backgrounds/didi-fam.png" className="host-avatar__img" alt="Didi Fam" />
}

function GenericHostAvatar() {
  return (
    <svg viewBox="0 0 96 96" className="host-avatar__svg" role="img" aria-label="Host">
      <circle cx="48" cy="48" r="47" fill="#d9c7ff" />
      <ellipse cx="48" cy="76" rx="23" ry="14" fill="#4a4a66" />
      <circle cx="48" cy="41" r="17" fill="#f0d3ba" />
      <path d="M31 37 Q39 24 48 24 Q58 24 65 37" fill="#3d4c7d" />
      <circle cx="42" cy="41" r="2" fill="#293457" />
      <circle cx="54" cy="41" r="2" fill="#293457" />
      <path d="M41 48 Q48 53 55 48" stroke="#293457" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function HostAvatar({ characterId, speakerName }) {
  const hostId = resolveHostId(characterId, speakerName)

  return (
    <div className="host-avatar" aria-label={speakerName || 'Host'}>
      {hostId === 'clara' && <ClaraAvatar />}
      {hostId === 'uwe' && <UweAvatar />}
      {hostId === 'ambassador' && <AmbassadorAvatar />}
      {hostId === 'emma' && <EmmaAvatar />}
      {hostId === 'konrad' && <KonradAvatar />}
      {hostId === 'didi' && <DidiAvatar />}
      {hostId === 'host' && <GenericHostAvatar />}
    </div>
  )
}
