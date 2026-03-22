/**
 * Vollflächiges Hintergrundbild der Szene.
 * Nutzt backgroundImage-URL oder Fallback-Gradient (backgroundPlaceholder).
 * Default: background always fully visible (contain). Set backgroundFit="cover" to allow cropping.
 */
export function SceneBackground({
  backgroundImage,
  backgroundImageMobile,
  backgroundPlaceholder,
  backgroundFit = 'cover',
}) {
  const isEinzelbueroTablet = String(backgroundImage || '').includes('einzelbuero_tablet')
  const isWelcomeScene = String(backgroundImage || '').includes('/backgrounds/regelreich-city-highres.png')
  const size = backgroundFit === 'cover' ? 'cover' : 'contain'
  const className = [
    'scene-background',
    isEinzelbueroTablet ? 'scene-background--einzelbuero-tablet' : '',
  ].filter(Boolean).join(' ')
  
  const desktopStyle = {
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

  // If mobile background is provided, we can render two divs and use CSS to show/hide them.
  // Actually, since we want inline styles, let's just render a single div and use a <style> tag or two divs.
  if (backgroundImageMobile) {
    return (
      <>
        <div className={`${className} hidden-on-mobile`} style={desktopStyle} aria-hidden="true" />
        <div 
          className={`${className} hidden-on-desktop`} 
          style={{
            ...desktopStyle,
            backgroundImage: `url(${backgroundImageMobile})`,
            backgroundSize: undefined, // Let CSS handle it
            backgroundPosition: isWelcomeScene ? 'center top' : 'center',
          }} 
          aria-hidden="true" 
        />
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 768px) {
            .hidden-on-mobile { display: none !important; }
          }
          @media (min-width: 769px) {
            .hidden-on-desktop { display: none !important; }
          }
        `}} />
      </>
    )
  }

  return <div className={className} style={desktopStyle} aria-hidden="true" />
}
