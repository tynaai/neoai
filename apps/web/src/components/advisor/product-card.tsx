import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, ShoppingBag, Star } from 'lucide-react'

import { cn, formatVnd } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'
import { isUnavailable, rankRoles, type ScoredProduct } from '~/lib/mock-data'
import { DynamicIcon } from './icon'

// Pinterest-style masonry only reads as "masonry" when tiles actually differ
// in height — with near-identical text lengths, a row of same-shaped image
// tiles still looks like a rigid grid. Real Pinterest gets this from photo
// dimensions, so we fake the same signal: each card's image tile gets an
// aspect ratio cycled by its position, guaranteeing rank 1/2/3 (a visual row)
// never share a shape. Kept intentionally close together (all landscape-ish,
// ~0.7-0.85 height/width) — a wide spread (e.g. a portrait tile next to a
// short one) reads as a jarring height gap rather than organic variety.
const IMAGE_ASPECTS = [
  'aspect-[4/3]',
  'aspect-[7/6]',
  'aspect-[3/2]',
  'aspect-[5/4]',
  'aspect-[8/5]',
]

function imageAspectFor(rank: number) {
  return IMAGE_ASPECTS[(rank - 1) % IMAGE_ASPECTS.length]
}

export function ProductCard({
  scored,
  rank,
  onViewDetail,
  onCheckStock,
}: {
  scored: ScoredProduct
  rank: number
  onViewDetail: (id: string) => void
  onCheckStock: (id: string) => void
}) {
  const { product, total } = scored
  const isTop = rank === 1
  const role = rankRoles[product.id] ?? {
    badge: isTop ? 'PHÙ HỢP NHẤT' : `GỢI Ý #${rank}`,
    icon: isTop ? 'Crown' : 'Sparkles',
  }
  const prevRank = useRef(rank)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (prevRank.current !== rank) {
      prevRank.current = rank
      setFlash(true)
      const timer = window.setTimeout(() => setFlash(false), 900)
      return () => window.clearTimeout(timer)
    }
  }, [rank])

  return (
    <Card
      data-flip-id={product.id}
      style={{ animationDelay: `${(rank - 1) * 90}ms` }}
      className={cn(
        // Masonry tile: a natural-height flex column (not a fixed-row grid) so
        // cards vary in height with their content, like Pinterest / AI Shopping.
        // Each card sits in its own independent column stack (see
        // ResultsPanel), so there's never a shared row height to stretch to.
        'group w-full gap-3 overflow-hidden p-3 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md',
        'fill-mode-both animate-in fade-in slide-in-from-bottom-3',
        isTop ? 'border-primary/50 ring-2 ring-primary/10' : 'border-border',
        flash && 'shadow-md ring-2 ring-primary/60',
      )}
    >
      <CardHeader className="flex-row items-center justify-between gap-1.5 p-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black tabular-nums',
              isTop
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {String(rank).padStart(2, '0')}
          </span>
          <Badge
            variant={isTop ? 'brand' : 'muted'}
            className="min-w-0 gap-1 truncate px-2 py-0.5 text-[10px]"
          >
            <DynamicIcon name={role.icon} className="size-3 shrink-0" />
            {role.badge}
          </Badge>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
            total >= 75
              ? 'bg-emerald-50 text-emerald-700'
              : total >= 60
                ? 'bg-blue-50 text-primary'
                : 'bg-amber-50 text-amber-700',
          )}
        >
          {rank === 1
            ? 'Rất hợp'
            : rank <= 3
              ? 'Khá hợp'
              : total >= 60
                ? 'Khá hợp'
                : 'Tạm hợp'}
        </span>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-0">
        <div
          className={cn(
            'flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-slate-100 ring-1 ring-blue-100',
            imageAspectFor(rank),
          )}
        >
          {product.imageHint.startsWith('http') ? (
            <img
              src={product.imageHint}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain p-4 mix-blend-multiply"
            />
          ) : (
            <span className="text-5xl" aria-hidden>
              {product.imageHint}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="font-bold leading-tight text-foreground">
            {product.name}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {product.capacity} · {product.type}
          </p>
          {!isUnavailable(product.rating) &&
          !isUnavailable(product.reviewCount) ? (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star
                className="size-3 fill-brand-accent text-brand-accent"
                aria-hidden
              />
              <span className="font-medium text-foreground">
                {product.rating.value}
              </span>
              ({product.reviewCount.value} đánh giá)
            </p>
          ) : null}
        </div>

        <Separator />
        <div>
          {isUnavailable(product.price) ? (
            <p className="text-sm font-semibold text-muted-foreground">
              Chưa có giá trong dữ liệu
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <span className="text-lg font-black tracking-tight text-destructive">
                  {formatVnd(product.price.value)}
                </span>
                {!isUnavailable(product.originalPrice) &&
                product.originalPrice.value > product.price.value ? (
                  <span className="text-[10px] text-muted-foreground line-through">
                    {formatVnd(product.originalPrice.value)}
                  </span>
                ) : null}
                {!isUnavailable(product.discountPercent) &&
                product.discountPercent.value > 0 ? (
                  <Badge
                    variant="warning"
                    className="rounded-full px-1.5 py-0 text-[10px] font-bold"
                  >
                    -{product.discountPercent.value}%
                  </Badge>
                ) : null}
              </div>
              <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] leading-tight text-brand-success">
                <BadgeCheck className="size-3 shrink-0" aria-hidden />
                Giá hôm nay · Nguồn: {product.price.source}
              </span>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-[0.8fr_1.2fr] gap-1.5 p-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetail(product.id)}
          className="h-9 rounded-full border-primary/20 px-3 text-xs font-semibold text-primary hover:bg-brand-primary-soft"
        >
          Chi tiết
        </Button>
        <Button
          size="sm"
          onClick={() => onCheckStock(product.id)}
          className="h-9 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <ShoppingBag />
          Kiểm tra tồn kho
        </Button>
      </CardFooter>
    </Card>
  )
}
