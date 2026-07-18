import { useState } from 'react'
import { motion } from 'motion/react'
import { ExternalLink, GitCompareArrows, ImageOff } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter } from '~/components/ui/card'
import { cn, formatVnd } from '~/lib/utils'
import type { StoreProduct } from '~/lib/products-api'

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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <Card className="h-full gap-0 overflow-hidden py-0 shadow-sm transition-shadow group-hover:shadow-lg">
        <div className="relative w-full overflow-hidden bg-muted aspect-square">
          {showImage ? (
            <img
              src={product.thumbnailUrl ?? undefined}
              alt={product.title}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground/60">
              <ImageOff className="size-8" aria-hidden />
              <span className="text-[11px]">Chưa có ảnh</span>
            </div>
          )}

          {discountPercent !== null && discountPercent > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground shadow-sm">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col gap-1.5 px-3 py-2.5">
          <h3 className="line-clamp-2 min-h-9 text-sm font-semibold leading-snug" title={product.title}>
            {product.title}
          </h3>
          {product.brand && <p className="text-[11px] text-muted-foreground">{product.brand}</p>}

          <div className="flex items-baseline gap-1.5">
            {product.priceCurrent !== null ? (
              <>
                <span className="text-base font-bold text-primary">{formatVnd(product.priceCurrent)}</span>
                {product.priceOriginal !== null && product.priceOriginal > product.priceCurrent && (
                  <span className="text-[11px] text-muted-foreground line-through">
                    {formatVnd(product.priceOriginal)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Chưa có dữ liệu giá</span>
            )}
          </div>

          {product.promotions.length > 0 && (
            <p className="text-[11px] text-muted-foreground">🎁 {product.promotions.length} ưu đãi</p>
          )}
        </CardContent>

        <CardFooter className="items-center justify-between border-t px-3 py-2">
          {product.productUrl ? (
            <a
              href={product.productUrl}
              target="_blank"
              rel="noreferrer"
              className={cn('inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline')}
            >
              Xem trên ĐMX <ExternalLink className="size-3" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">Chưa có link</span>
          )}
          {onToggleCompare && (
            <Button
              type="button"
              size="xs"
              variant={isComparing ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => onToggleCompare(product)}
            >
              <GitCompareArrows className="size-3" />
              {isComparing ? 'Đã chọn' : 'So sánh'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export function StorefrontProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden rounded-xl border bg-card p-0 shadow-sm">
      <div className="aspect-square w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-2 px-3 pb-3">
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
