/**
 * Vollflächiges Hintergrundbild der Szene.
 * Nutzt backgroundImage-URL oder Fallback-Gradient (backgroundPlaceholder).
 * Default: background always fully visible (contain). Set backgroundFit="cover" to allow cropping.
 */
export function SceneBackground({
  backgroundImage,
  backgroundPlaceholder,
  backgroundFit = 'contain',
}) {
  const isEinzelbueroTablet = String(backgroundImage || '').includes('einzelbuero_tablet')
  const isWelcomeScene = String(backgroundImage || '').includes('/backgrounds/Willkommen.png')
  const size = backgroundFit === 'cover' ? 'cover' : 'contain'
  const style = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    backgroundSize: size,
    backgroundPosition: isWelcomeScene ? 'center top' : 'center',
    backgroundRepeat: 'no-repeat',
    ...(isEinzelbueroTablet ? { backgroundColor: '#0b1420' } : {}),
    ...(backgroundImage
      ? { backgroundImage: `url(${backgroundImage})` }
      : { background: backgroundPlaceholder || 'var(--scene-bg-fallback, #e0e8f0)' }),
  }
  return <div className="scene-background" style={style} aria-hidden="true" />
}
