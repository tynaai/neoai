import { Box, ShoppingCart, Star } from 'lucide-react'
import { Button } from '~/components/ui/button'
import type { PreviewProduct } from './types'

type ProductCardProps = {
  product: PreviewProduct
  onPreview: (product: PreviewProduct) => void
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)

export function ProductCard({ product, onPreview }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-[20px] border border-[#D8DEE8] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#0B63CE]/30 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#EEF2F7]">
        <img
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          src={product.image}
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0B63CE] shadow-sm">
          {product.category}
        </span>
      </div>
      <div className="grid gap-4 p-4">
        <div>
          <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-snug text-[#111827]">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#B45309]">
            <Star className="size-4 fill-[#FFD400] text-[#FFD400]" />
            {product.rating.toFixed(1)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.specs.map((spec) => (
            <span
              className="rounded-full bg-[#EAF3FF] px-2.5 py-1 text-xs font-semibold text-[#0B63CE]"
              key={spec}
            >
              {spec}
            </span>
          ))}
        </div>

        <div className="text-lg font-extrabold text-[#111827]">
          {formatPrice(product.price)}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button className="rounded-full bg-[#0B63CE] text-white hover:bg-[#084EA6]">
            <ShoppingCart className="size-4" />
            Mua
          </Button>
          {product.supportsRoomPreview ? (
            <Button
              className="rounded-full border-[#D8DEE8] bg-white text-[#0B63CE] hover:bg-[#EAF3FF]"
              onClick={() => onPreview(product)}
              type="button"
              variant="outline"
            >
              <Box className="size-4" />
              Thử trong phòng tôi
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
