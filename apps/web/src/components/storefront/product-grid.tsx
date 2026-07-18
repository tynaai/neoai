import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'

import { Button } from '~/components/ui/button'
import type { StoreProduct } from '~/lib/products-api'
import { useProductBrands, useProducts } from '~/lib/use-products'
import { StorefrontProductCard, StorefrontProductCardSkeleton } from './product-card'

const PAGE_SIZE = 24

export function ProductGrid({
  compareIds,
  onToggleCompare,
}: {
  compareIds: string[]
  onToggleCompare: (product: StoreProduct) => void
}) {
  const [page, setPage] = useState(1)
  const [activeBrand, setActiveBrand] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const brands = useProductBrands()
  const { data, loading, error } = useProducts({ page, pageSize: PAGE_SIZE, brand: activeBrand })

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-brand-primary-soft text-primary">
            <LayoutGrid className="size-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-bold sm:text-xl">Tất cả máy lạnh</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {data ? `${data.total.toLocaleString('vi-VN')} sản phẩm chính hãng` : 'Đang tải...'}
            </p>
          </div>
        </div>
      </div>

      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        <Button
          size="sm"
          variant={activeBrand === null ? 'default' : 'outline'}
          className="shrink-0 rounded-full"
          onClick={() => changeBrand(null)}
        >
          Tất cả
        </Button>
        {brands.map((brand) => (
          <Button
            key={brand}
            size="sm"
            variant={activeBrand === brand ? 'default' : 'outline'}
            className="shrink-0 rounded-full"
            onClick={() => changeBrand(brand)}
          >
            {brand}
          </Button>
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
