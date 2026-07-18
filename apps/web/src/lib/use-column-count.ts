import { useEffect, useState } from 'react'

// Mirrors the `sm`/`xl` breakpoints used for the results masonry so the JS
// column-bucketing (see ResultsPanel) always matches how many columns are
// actually visible on screen.
const BREAKPOINTS: { minWidth: number; columns: number }[] = [
  { minWidth: 1280, columns: 3 }, // xl
  { minWidth: 640, columns: 2 }, // sm
]

function resolveColumnCount(): number {
  if (typeof window === 'undefined') return 1
  const hit = BREAKPOINTS.find(
    (bp) => window.matchMedia(`(min-width: ${bp.minWidth}px)`).matches,
  )
  return hit?.columns ?? 1
}

// True masonry (unlike CSS grid) needs to know the column count in JS so
// items can be bucketed into independent vertical stacks — that's what makes
// items pack tight instead of being locked to a shared row height.
export function useColumnCount() {
  const [columns, setColumns] = useState(resolveColumnCount)

  useEffect(() => {
    const queries = BREAKPOINTS.map((bp) =>
      window.matchMedia(`(min-width: ${bp.minWidth}px)`),
    )
    const update = () => setColumns(resolveColumnCount())
    update()
    for (const query of queries) query.addEventListener('change', update)
    return () => {
      for (const query of queries) query.removeEventListener('change', update)
    }
  }, [])

  return columns
}
