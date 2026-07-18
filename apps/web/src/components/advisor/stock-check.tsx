import { CircleCheck, CircleHelp, CircleX, MapPin } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { cn } from '~/lib/utils'
import { isUnavailable, type Product, type StockStatus } from '~/lib/mock-data'
import { SourceTag } from './source-tag'

const statusStyles: Record<
  StockStatus,
  { label: string; className: string; icon: typeof CircleCheck }
> = {
  in: {
    label: 'Còn hàng',
    className: 'text-brand-success',
    icon: CircleCheck,
  },
  out: {
    label: 'Hết hàng',
    className: 'text-destructive',
    icon: CircleX,
  },
  // The honest third state: the system has NO stock reading for this store, so
  // we say so explicitly rather than showing 0 or guessing.
  unknown: {
    label: 'Chưa có dữ liệu tồn kho',
    className: 'text-muted-foreground',
    icon: CircleHelp,
  },
}

// Region-aware stock across nearby DMX stores. Demonstrates the anti-fabrication
// guardrail: quantities are shown only when sourced; the 'unknown' state never
// invents a number.
export function StockCheck({
  product,
  className,
}: {
  product: Product
  className?: string
}) {
  return (
    <Card className={cn('gap-0 py-0 shadow-none', className)}>
      <CardHeader className="px-4 py-3">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          <MapPin className="size-4 text-primary" aria-hidden />
          Tồn kho gần bạn
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-4">
        <ul className="flex flex-col gap-3">
          {product.stockByStore.map((s) => {
            const style = statusStyles[s.status]
            const Icon = style.icon
            const qtySourced =
              s.status === 'in' && s.qty && !isUnavailable(s.qty)
            return (
              <li
                key={s.store}
                className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {s.store}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cách bạn ~{s.distanceKm} km
                  </p>
                  {qtySourced ? (
                    <SourceTag
                      source={s.qty!.source}
                      updatedAt={s.qty!.updatedAt}
                      className="mt-0.5"
                    />
                  ) : null}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'h-auto shrink-0 gap-1 whitespace-normal text-right text-xs',
                    style.className,
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  <span className="text-right">
                    {style.label}
                    {qtySourced ? (
                      <span className="ml-1 tabular-nums">
                        · còn {s.qty!.value}
                      </span>
                    ) : null}
                  </span>
                </Badge>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
