import { useEffect, useState } from 'react'

// Counts from 0 up to `target` over a short time, easing out. With "reduce motion"
// on, it shows the final number straight away. The animation frame is cancelled
// when the component goes away or the target changes.
export function useCountUp(target, duration = 800) {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [value, setValue] = useState(reduce ? target : 0)

  useEffect(() => {
    if (reduce || target === 0) {
      setValue(target)
      return undefined
    }
    let frame = 0
    const start = performance.now()
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1)
      setValue(Math.round(target * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, reduce])

  return value
}
