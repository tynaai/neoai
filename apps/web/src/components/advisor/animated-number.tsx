import { useEffect, useRef, useState } from 'react'

// Tweens from the previous value to the next whenever `value` changes, so a
// recomputed match score visibly ticks up/down instead of snapping — a small
// cue that the AI just re-scored. Respects prefers-reduced-motion (jumps
// straight to the final value).
export function AnimatedNumber({
  value,
  durationMs = 600,
  className,
  suffix,
}: {
  value: number
  durationMs?: number
  className?: string
  suffix?: string
}) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const from = fromRef.current
    const to = value
    if (from === to) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      fromRef.current = to
      setDisplay(to)
      return
    }

    const start = performance.now()
    // easeOutCubic for a snappy settle.
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const current = Math.round(from + (to - from) * ease(t))
      setDisplay(current)
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      fromRef.current = to
    }
  }, [value, durationMs])

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  )
}
