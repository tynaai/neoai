import { useState } from 'react'
import { motion } from 'motion/react'
import { ExternalLink, GitCompareArrows, ImageOff, Tag } from 'lucide-react'

import { Card, CardContent, CardFooter } from '~/components/ui/card'
import { writeDraggedProduct } from '~/lib/product-dnd'
import type { StoreProduct } from '~/lib/products-api'
import { cn, formatVnd } from '~/lib/utils'

export function StorefrontProductCard({
  product,
  isComparing = false,
  onToggleCompare,
}: {
  product: StoreProduct
  isComparing?: boolean
  onToggleCompare?: (product: StoreProduct) => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = product.thumbnailUrl && !imgFailed

  const discountPercent =
    product.priceCurrent !== null && product.priceOriginal !== null && product.priceOriginal > product.priceCurrent
      ? Math.round((1 - product.priceCurrent / product.priceOriginal) * 100)
      : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      whileHover={{ y: -6 }}
      className="group h-full"
    >
      <Card
        draggable={Boolean(onToggleCompare)}
        onDragStart={onToggleCompare ? (e) => writeDraggedProduct(e, product) : undefined}
        className={cn(
          'h-full gap-0 overflow-hidden rounded-3xl border-border/50 py-0 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/10',
          onToggleCompare && 'cursor-grab active:cursor-grabbing',
          isComparing && 'border-primary/40 ring-2 ring-primary/40',
        )}
      >
        <div className="relative p-3 pb-0 sm:p-4 sm:pb-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
            {showImage ? (
              <img
                src={product.thumbnailUrl ?? undefined}
                alt={product.title}
                loading="lazy"
                onError={() => setImgFailed(true)}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground/50">
                <ImageOff className="size-8" aria-hidden />
                <span className="text-[11px]">Chưa có ảnh</span>
              </div>
            )}

            {discountPercent !== null && discountPercent > 0 && (
              <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-bold text-destructive-foreground shadow-sm">
                <Tag className="size-3" /> -{discountPercent}%
              </span>
            )}
          </div>

          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(product)}
              aria-label={isComparing ? `Bỏ ${product.title} khỏi so sánh` : `Thêm ${product.title} vào so sánh`}
              className={cn(
                'absolute top-5 right-5 grid size-8 place-items-center rounded-full shadow-md ring-1 ring-black/5 transition-all sm:top-6 sm:right-6',
                isComparing
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/90 text-foreground backdrop-blur hover:bg-background',
              )}
            >
              <GitCompareArrows className="size-4" />
            </button>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col gap-1 px-4 pt-3 pb-2">
          {product.brand && (
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{product.brand}</p>
          )}
          <h3 className="line-clamp-2 min-h-9 text-sm font-semibold leading-snug" title={product.title}>
            {product.title}
          </h3>

          <div className="mt-1 flex items-baseline gap-1.5">
            {product.priceCurrent !== null ? (
              <>
                <span className="font-heading text-lg font-bold text-primary">
                  {formatVnd(product.priceCurrent)}
                </span>
                {product.priceOriginal !== null && product.priceOriginal > product.priceCurrent && (
                  <span className="text-[11px] text-muted-foreground line-through">
                    {formatVnd(product.priceOriginal)}
                  </span>
                )}
              </>
            ) : (
              <span className="inline-flex rounded-full bg-brand-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                Liên hệ báo giá
              </span>
            )}
          </div>

          {product.promotions.length > 0 && (
            <p className="text-[11px] text-muted-foreground">🎁 {product.promotions.length} ưu đãi</p>
          )}
        </CardContent>

        <CardFooter className="px-4 pt-0 pb-4">
          {product.productUrl ? (
            <a
              href={product.productUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-brand-primary-soft hover:text-primary"
            >
              Xem trên ĐMX <ExternalLink className="size-3.5" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">Chưa có link</span>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export function StorefrontProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/50 bg-card p-0 shadow-sm">
      <div className="p-3 pb-0 sm:p-4 sm:pb-0">
        <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="flex flex-col gap-2 px-4 pt-3 pb-4">
        <div className="h-2.5 w-1/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-8 w-full animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  )
}
