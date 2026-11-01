import { useEffect, useRef, useState } from 'react'
import AmbientBackground from './AmbientBackground.jsx'

// Original looping footage rendered for this app (see public/media). There is one
// light and one dark version; the right one follows the active theme.
const sources = {
  light: { webm: '/media/ambient-light.webm', mp4: '/media/ambient-light.mp4', poster: '/media/ambient-light-poster.webp' },
  dark: { webm: '/media/ambient-dark.webm', mp4: '/media/ambient-dark.mp4', poster: '/media/ambient-dark-poster.webp' },
}

const currentTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

// Decorative video behind the app.
//   - muted, looping and inline, so browsers allow it to autoplay
//   - the poster image shows first, and stays if the person prefers reduced motion
//     or has data saver on (the video is then never downloaded)
//   - pauses while the tab is hidden
//   - if the video cannot play, the canvas scene is used instead
function VideoBackground() {
  const videoRef = useRef(null)
  const [theme, setTheme] = useState(currentTheme)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [still, setStill] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || Boolean(navigator.connection?.saveData),
  )

  // Follow the theme switch.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setReady(false)
      setTheme(currentTheme())
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  // Follow "reduce motion" changes made while the app is open.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setStill(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Pause while the tab is hidden, resume when it is back.
  useEffect(() => {
    const video = videoRef.current
    if (!video || still) return undefined
    const onVisibility = () => {
      if (document.hidden) video.pause()
      else video.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [still, theme])

  if (failed) return <AmbientBackground />

  const media = sources[theme]
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <img src={media.poster} alt="" className="absolute inset-0 size-full object-cover" />
      {!still && (
        <video
          key={theme}
          ref={videoRef}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          tabIndex={-1}
          onPlaying={() => setReady(true)}
          onError={() => setFailed(true)}
        >
          <source src={media.webm} type="video/webm" />
          <source src={media.mp4} type="video/mp4" />
        </video>
      )}
    </div>
  )
}

export default VideoBackground
