import { useState } from 'react'
import { motion } from 'motion/react'
import { ExternalLink, ImageOff } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardFooter } from '~/components/ui/card'
import { cn, formatVnd } from '~/lib/utils'
import { ROLE_BADGE, type AdvisorProduct } from '~/lib/advisor-api'
import { DynamicIcon } from './icon'

const ROLE_BADGE_VARIANT = {
  best_fit: 'brand',
  cheapest_above_threshold: 'success',
  model_choice: 'warning',
} as const

// Vary image aspect ratio per role — staggered heights instead of 3 uniform boxes, and doubles
// as an emphasis cue: the recommended pick (best_fit) reads as the tallest, most prominent card.
const ROLE_ASPECT = {
  best_fit: 'aspect-[3/4]',
  cheapest_above_threshold: 'aspect-square',
  model_choice: 'aspect-[4/3]',
} as const

export function RealProductCard({ product }: { product: AdvisorProduct }) {
  const badge = ROLE_BADGE[product.role]
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = product.thumbnailUrl && !imgFailed

  const discountPercent =
    product.priceCurrent !== null && product.priceOriginal !== null && product.priceOriginal > product.priceCurrent
      ? Math.round((1 - product.priceCurrent / product.priceOriginal) * 100)
      : null

  const chips = [
    product.facts.capacityLiters !== null ? `${product.facts.capacityLiters}L` : null,
    product.facts.householdSize !== null ? `${product.facts.householdSize} người` : null,
    product.facts.powerKwhYear !== null ? `${product.facts.powerKwhYear} kWh/năm` : null,
    product.facts.isInverter ? 'Inverter' : null,
  ].filter((c): c is string => c !== null)

  return (
    <motion.div
      layout
      layoutId={product.id}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card
        className={cn(
          'h-full gap-0 overflow-hidden py-0 shadow-sm transition-shadow group-hover:shadow-lg',
          product.role === 'best_fit' && 'ring-1 ring-primary/30',
        )}
      >
        <div className={cn('relative w-full overflow-hidden bg-muted', ROLE_ASPECT[product.role])}>
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

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-1 p-2">
            <Badge variant={ROLE_BADGE_VARIANT[product.role]} className="shadow-sm backdrop-blur-sm">
              <DynamicIcon name={badge.icon} />
              {badge.label}
            </Badge>
            {discountPercent !== null && discountPercent > 0 && (
              <Badge className="bg-destructive text-destructive-foreground shadow-sm">-{discountPercent}%</Badge>
            )}
          </div>
        </div>

        <CardContent className="flex flex-col gap-1.5 px-3 py-2.5">
          <h3 className="line-clamp-1 text-sm font-semibold leading-snug" title={product.title}>
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

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-between border-t px-3 py-2">
          {product.productUrl ? (
            <a
              href={product.productUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline',
              )}
            >
              Xem trên ĐMX <ExternalLink className="size-3" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">Chưa có link</span>
          )}
          {product.promotions.length > 0 && (
            <span className="text-[11px] text-muted-foreground">🎁 {product.promotions.length} ưu đãi</span>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
