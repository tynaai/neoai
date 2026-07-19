import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'

import { Button } from '~/components/ui/button'
import type { StoreProduct } from '~/lib/products-api'
import { useProductBrands, useProducts } from '~/lib/use-products'
import { StorefrontProductCard, StorefrontProductCardSkeleton } from './product-card'

const PAGE_SIZE = 24

export function ProductGrid({
  category,
  categoryLabel,
  compareIds,
  onToggleCompare,
}: {
  category: string
  categoryLabel: string
  compareIds: string[]
  onToggleCompare: (product: StoreProduct) => void
}) {
  const [page, setPage] = useState(1)
  const [activeBrand, setActiveBrand] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const brands = useProductBrands(category)
  const { data, loading, error } = useProducts({ page, pageSize: PAGE_SIZE, brand: activeBrand, category })

  // Switching category makes the old page/brand selection stale (may not exist there at all).
  useEffect(() => {
    setPage(1)
    setActiveBrand(null)
  }, [category])

  const changeBrand = (brand: string | null) => {
    setActiveBrand(brand)
    setPage(1)
  }

  const changePage = (next: number) => {
    setPage(next)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="products" ref={sectionRef} className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="mb-4 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-primary-soft text-primary">
            <LayoutGrid className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="font-heading text-xl tracking-wide sm:text-2xl">Tất cả {categoryLabel.toLowerCase()}</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {data ? `${data.total.toLocaleString('vi-VN')} sản phẩm chính hãng` : 'Đang tải...'}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => changeBrand(null)}
          className={
            activeBrand === null
              ? 'inline-flex h-8 shrink-0 items-center rounded-full bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-sm'
              : 'inline-flex h-8 shrink-0 items-center rounded-full border border-border bg-background px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted'
          }
        >
          Tất cả
        </motion.button>
        {brands.map((brand) => (
          <motion.button
            key={brand}
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => changeBrand(brand)}
            className={
              activeBrand === brand
                ? 'inline-flex h-8 shrink-0 items-center rounded-full bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-sm'
                : 'inline-flex h-8 shrink-0 items-center rounded-full border border-border bg-background px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted'
            }
          >
            {brand}
          </motion.button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Không tải được danh sách sản phẩm: {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => <StorefrontProductCardSkeleton key={i} />)
          : data?.items.map((product) => (
              <StorefrontProductCard
                key={product.id}
                product={product}
                isComparing={compareIds.includes(product.id)}
                onToggleCompare={onToggleCompare}
              />
            ))}
      </div>

      {!loading && data && data.items.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">Không tìm thấy sản phẩm phù hợp.</p>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            aria-label="Trang trước"
            onClick={() => changePage(page - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {data.page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= data.totalPages}
            aria-label="Trang sau"
            onClick={() => changePage(page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </section>
  )
}
