import { useLayoutEffect, useRef } from 'react'

// FLIP (First-Last-Invert-Play) list re-order animation, done with plain CSS
// transforms — no animation library needed. Give each animatable child a
// `data-flip-id` attribute and pass a `key` that changes whenever the order
// changes. On each order change the hook measures where every child was, lets
// React paint the new order, then transforms each child back to its old spot
// and releases it so it glides to its new rank.
//
// Respects prefers-reduced-motion: when set, it never applies transforms.
export function useFlip<T extends HTMLElement>(orderKey: string) {
  const containerRef = useRef<T>(null)
  const prevRects = useRef<Map<string, DOMRect>>(new Map())

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const nodes = Array.from(
      container.querySelectorAll<HTMLElement>('[data-flip-id]'),
    )
    const newRects = new Map<string, DOMRect>()
    for (const node of nodes) {
      const id = node.dataset.flipId
      if (id) newRects.set(id, node.getBoundingClientRect())
    }

    if (!reduce) {
      for (const node of nodes) {
        const id = node.dataset.flipId
        if (!id) continue
        const prev = prevRects.current.get(id)
        const next = newRects.get(id)
        if (!prev || !next) continue

        const dx = prev.left - next.left
        const dy = prev.top - next.top
        if (dx === 0 && dy === 0) continue

        // Invert: jump back to the old position with no transition…
        node.style.transition = 'none'
        node.style.transform = `translate(${dx}px, ${dy}px)`

        // …then play: on the next frame, release to the new position.
        requestAnimationFrame(() => {
          node.style.transition =
            'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)'
          node.style.transform = ''
          const clear = () => {
            node.style.transition = ''
            node.removeEventListener('transitionend', clear)
          }
          node.addEventListener('transitionend', clear)
        })
      }
    }

    prevRects.current = newRects
  }, [orderKey])

  return containerRef
}
