import { useRef } from 'react'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

import { Button } from '~/components/ui/button'
import type { StoreProduct } from '~/lib/products-api'
import { StorefrontProductCard, StorefrontProductCardSkeleton } from './product-card'

export function ProductCarousel({
  products,
  loading,
  compareIds,
  onToggleCompare,
}: {
  products: StoreProduct[]
  loading: boolean
  compareIds: string[]
  onToggleCompare: (product: StoreProduct) => void
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollByCards = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-carousel-item]')
    const step = (card?.offsetWidth ?? 280) + 16
    el.scrollBy({ left: direction * step * 2, behavior: 'smooth' })
  }

  if (!loading && products.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="mb-4 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-accent to-brand-accent/60 text-brand-accent-foreground shadow-sm">
            <Sparkles className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="font-heading text-xl tracking-wide sm:text-2xl">Máy lạnh nổi bật</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">Gợi ý cho bạn từ catalog Điện Máy Xanh</p>
          </div>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Xem sản phẩm trước"
            onClick={() => scrollByCards(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Xem sản phẩm tiếp theo"
            onClick={() => scrollByCards(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </motion.div>

      <div
        ref={scrollerRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} data-carousel-item className="w-[68vw] shrink-0 snap-start sm:w-[280px]">
                <StorefrontProductCardSkeleton />
              </div>
            ))
          : products.map((product) => (
              <div key={product.id} data-carousel-item className="w-[68vw] shrink-0 snap-start sm:w-[280px]">
                <StorefrontProductCard
                  product={product}
                  isComparing={compareIds.includes(product.id)}
                  onToggleCompare={onToggleCompare}
                />
              </div>
            ))}
      </div>
    </section>
  )
}
