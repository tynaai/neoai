import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '~/lib/utils'

interface PromoSlide {
  id: string
  src: string
  alt: string
}

// Real ĐMX promo banners — a compact, self-playing carousel, separate from the hero.
const SLIDES: PromoSlide[] = [
  {
    id: 'weekly',
    src: '/carousel/carousel_weekly.jpg',
    alt: 'Khuyến mãi World Cup — bỏ nhỏ lấy tivi to, cơ hội trúng 1 tỷ',
  },
  {
    id: 'fridge',
    src: '/carousel/carousel_fridge.png',
    alt: 'Toshiba JAPANDi Series — hai dàn lạnh độc lập, giữ trọn tươi ngon',
  },
  {
    id: 'panasonic',
    src: '/carousel/carousel_Panasonic.jpg',
    alt: 'Tủ lạnh Panasonic trợ giá sốc, giá chỉ từ 17.000.000đ',
  },
  {
    id: 'worldcup',
    src: '/carousel/carousel_worldCup.jpg',
    alt: 'Lễ hội World Cup — online giảm to, quà tặng miễn phí',
  },
]

const AUTOPLAY_MS = 4500

export function PromoCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const goTo = useCallback((index: number) => {
    const clamped = ((index % SLIDES.length) + SLIDES.length) % SLIDES.length
    const scroller = scrollerRef.current
    const target = slideRefs.current[clamped]
    if (!scroller || !target) return
    // scrollIntoView walks every scrollable ancestor (including the page) — scrollTo on the
    // container itself keeps this purely horizontal, so autoplay never yanks vertical scroll.
    scroller.scrollTo({ left: target.offsetLeft, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const root = scrollerRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!mostVisible) return
        const idx = Number((mostVisible.target as HTMLElement).dataset.slideIndex)
        if (!Number.isNaN(idx)) setActiveIndex(idx)
      },
      { root, threshold: [0.6] },
    )

    slideRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => goTo(activeIndex + 1), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [activeIndex, goTo])

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl shadow-sm">
        <div
          ref={scrollerRef}
          className="no-scrollbar flex h-40 snap-x snap-mandatory overflow-x-auto scroll-smooth sm:h-56"
        >
          {SLIDES.map((slide, i) => (
            <div
              key={slide.id}
              ref={(el) => {
                slideRefs.current[i] = el
              }}
              data-slide-index={i}
              className="h-full w-full shrink-0 snap-start"
            >
              <img
                src={slide.src}
                alt={slide.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Banner trước"
          onClick={() => goTo(activeIndex - 1)}
          className="absolute top-1/2 left-2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Banner sau"
          onClick={() => goTo(activeIndex + 1)}
          className="absolute top-1/2 right-2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
        >
          <ChevronRight className="size-4" />
        </button>

        <div className="absolute inset-x-0 bottom-2.5 z-10 flex items-center justify-center gap-1.5">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Đến banner ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
