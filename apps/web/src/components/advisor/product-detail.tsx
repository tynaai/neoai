import { CheckCircle2, Star, TriangleAlert } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'
import { formatVnd } from '~/lib/utils'
import { isUnavailable, rankRoles, type Product } from '~/lib/mock-data'
import { DynamicIcon } from './icon'
import { SourceTag, UnavailableTag } from './source-tag'
import { StockCheck } from './stock-check'

export function ProductDetail({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const role = product ? rankRoles[product.id] : undefined
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full gap-0 sm:max-w-lg"
        aria-label={product ? `Chi tiết ${product.name}` : 'Chi tiết sản phẩm'}
      >
        <SheetHeader className="border-b bg-primary p-5 pr-12 text-primary-foreground">
          <SheetDescription className="text-primary-foreground/75">
            {product?.brand ?? 'Sản phẩm'}
          </SheetDescription>
          <SheetTitle className="text-primary-foreground">
            {product?.name ?? 'Chi tiết sản phẩm'}
          </SheetTitle>
        </SheetHeader>
        {product ? (
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-5 p-5">
              <Card className="gap-0 border-primary/15 bg-brand-primary-soft py-0 shadow-none">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-background text-4xl shadow-sm">
                    {product.imageHint.startsWith('http') ? (
                      <img
                        src={product.imageHint}
                        alt={product.name}
                        className="h-full w-full object-contain p-1 mix-blend-multiply"
                      />
                    ) : (
                      product.imageHint
                    )}
                  </div>
                  <div>
                    {role ? (
                      <Badge variant="brand" className="mb-1">
                        <DynamicIcon name={role.icon} className="size-3" />
                        {role.badge}
                      </Badge>
                    ) : null}
                    <p className="text-sm text-muted-foreground">
                      {product.capacity} · {product.type}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="gap-0 py-0 shadow-none">
                <CardContent className="p-4">
                  {isUnavailable(product.price) ? (
                    <UnavailableTag reason={product.price.reason} />
                  ) : (
                    <>
                      <div className="flex flex-wrap items-end gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {formatVnd(product.price.value)}
                        </span>
                        {!isUnavailable(product.originalPrice) &&
                        product.originalPrice.value > product.price.value ? (
                          <span className="mb-1 text-sm text-muted-foreground line-through">
                            {formatVnd(product.originalPrice.value)}
                          </span>
                        ) : null}
                        {!isUnavailable(product.discountPercent) &&
                        product.discountPercent.value > 0 ? (
                          <Badge variant="warning" className="mb-1">
                            -{product.discountPercent.value}%
                          </Badge>
                        ) : null}
                      </div>
                      <SourceTag
                        source={product.price.source}
                        updatedAt={product.price.updatedAt}
                        className="mt-2"
                      />
                    </>
                  )}
                  <Separator className="my-3" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Thời hạn khuyến mãi
                  </p>
                  {isUnavailable(product.promoEndsAt) ? (
                    <UnavailableTag
                      reason={product.promoEndsAt.reason}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm">{product.promoEndsAt.value}</p>
                  )}
                </CardContent>
              </Card>

              <Alert className="border-brand-success/20 bg-brand-success-soft">
                <CheckCircle2 className="text-brand-success" />
                <AlertTitle className="text-brand-success">
                  Vì sao phù hợp với bạn?
                </AlertTitle>
                <AlertDescription className="text-foreground">
                  {product.fitReason}
                </AlertDescription>
              </Alert>
              <Alert className="border-brand-warning/20 bg-brand-warning-soft">
                <TriangleAlert className="text-brand-warning" />
                <AlertTitle className="text-brand-warning">
                  Điểm cần cân nhắc
                </AlertTitle>
                <AlertDescription className="text-foreground">
                  {product.tradeOff}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-2">
                {product.benefits.map((benefit) => (
                  <Card
                    key={benefit.label}
                    className="gap-2 px-2 py-3 text-center shadow-none"
                  >
                    <DynamicIcon
                      name={benefit.icon}
                      className="mx-auto size-5 text-primary"
                    />
                    <span className="text-[11px] leading-tight text-muted-foreground">
                      {benefit.label}
                    </span>
                  </Card>
                ))}
              </div>

              <Card className="gap-0 py-0 shadow-none">
                <CardContent className="p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Đánh giá khách hàng
                  </p>
                  {isUnavailable(product.rating) ? (
                    <UnavailableTag reason={product.rating.reason} />
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-sm font-semibold">
                        <Star
                          className="size-4 fill-brand-accent text-brand-accent"
                          aria-hidden
                        />
                        {product.rating.value}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isUnavailable(product.reviewCount)
                          ? ''
                          : `(${product.reviewCount.value} đánh giá)`}
                      </span>
                      <SourceTag
                        source={product.rating.source}
                        updatedAt={product.rating.updatedAt}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div>
                <h3 className="mb-2 text-sm font-semibold">
                  Thông số kỹ thuật
                </h3>
                <dl className="divide-y overflow-hidden rounded-xl border">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between gap-4 px-3 py-2 text-sm odd:bg-muted/30"
                    >
                      <dt className="text-muted-foreground">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Nguồn thông số: Catalog Điện Máy Xanh · cập nhật hôm nay 08:30
                </p>
              </div>
              <StockCheck product={product} />
            </div>
          </ScrollArea>
        ) : null}
        <SheetFooter className="grid grid-cols-2 border-t bg-background p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Quay lại tư vấn
          </Button>
          <Button>Đặt giữ máy (Giả lập)</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
