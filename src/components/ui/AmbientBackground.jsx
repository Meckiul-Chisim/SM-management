import { useEffect, useRef } from 'react'
import { createScene, drawScene } from '../../utils/ambientScene.js'

// Reads the theme colours from CSS variables, so the scene always matches the
// current theme (light or dark) without any extra configuration.
function readPalette() {
  const styles = getComputedStyle(document.documentElement)
  return {
    accent: styles.getPropertyValue('--color-brand-700').trim() || '#2e6b4f',
    star: styles.getPropertyValue('--color-ink').trim() || '#eaf1ec',
    dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  }
}

/**
 * A decorative animated background: a slowly turning network globe with
 * drifting particles, drawn on a canvas behind the page content.
 *
 * - Sits behind everything and never receives clicks.
 * - Hidden from screen readers (purely decorative).
 * - Pauses when the tab is hidden or the page is scrolled out of use.
 * - Respects "reduce motion": it draws one still frame and stops.
 * - Frame rate is capped, and the canvas is capped at 2x pixel density.
 */
function AmbientBackground({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    const scene = createScene()
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

    let width = 0
    let height = 0
    let palette = readPalette()
    let frameId = 0
    let lastDraw = 0
    let running = false
    const pointer = { x: 0, y: 0 }
    const smoothPointer = { x: 0, y: 0 }

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      render(performance.now())
    }

    function render(time) {
      if (!width || !height) return
      // Ease the pointer so the parallax glides instead of snapping.
      smoothPointer.x += (pointer.x - smoothPointer.x) * 0.06
      smoothPointer.y += (pointer.y - smoothPointer.y) * 0.06
      drawScene(context, scene, {
        width,
        height,
        time,
        pointer: reducedMotionQuery.matches ? { x: 0, y: 0 } : smoothPointer,
        palette,
        intensity: width < 700 ? 0.8 : 1,
      })
    }

    function loop(time) {
      frameId = requestAnimationFrame(loop)
      if (time - lastDraw < 33) return // about 30 frames per second is plenty
      lastDraw = time
      render(time)
    }

    function start() {
      if (running || reducedMotionQuery.matches || document.hidden) return
      running = true
      frameId = requestAnimationFrame(loop)
    }

    function stop() {
      running = false
      cancelAnimationFrame(frameId)
    }

    function handleVisibility() {
      if (document.hidden) stop()
      else start()
    }

    function handleMotionChange() {
      if (reducedMotionQuery.matches) {
        stop()
        render(performance.now())
      } else {
        start()
      }
    }

    function handleThemeChange() {
      palette = readPalette()
      render(performance.now())
    }

    function handlePointer(event) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    start()

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pointermove', handlePointer, { passive: true })
    reducedMotionQuery.addEventListener('change', handleMotionChange)
    darkQuery.addEventListener('change', handleThemeChange)

    return () => {
      stop()
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pointermove', handlePointer)
      reducedMotionQuery.removeEventListener('change', handleMotionChange)
      darkQuery.removeEventListener('change', handleThemeChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
    />
  )
}

export default AmbientBackground
