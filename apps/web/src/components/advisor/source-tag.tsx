import type { ReactNode } from 'react'
import { CircleAlert, Info } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'
import { isUnavailable, type Sourced, type Unavailable } from '~/lib/mock-data'

// Small "Nguồn: ... · cập nhật ..." tag that grounds a catalog-backed value.
// This is the core data-honesty affordance: every real number carries its source.
export function SourceTag({
  source,
  updatedAt,
  className,
}: {
  source: string
  updatedAt: string
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'h-auto gap-1 whitespace-normal border-border/70 px-1.5 py-0.5 text-[10px] font-normal leading-tight text-muted-foreground',
        className,
      )}
    >
      <Info className="size-3 shrink-0" aria-hidden />
      Nguồn: {source} · cập nhật {updatedAt}
    </Badge>
  )
}

// The honest alternative when data is missing: say so explicitly, never fabricate.
export function UnavailableTag({
  reason,
  className,
}: {
  reason: string
  className?: string
}) {
  return (
    <Badge
      variant="muted"
      className={cn(
        'h-auto gap-1 whitespace-normal px-1.5 py-0.5 text-[10px] font-normal leading-tight',
        className,
      )}
    >
      <CircleAlert className="size-3 shrink-0" aria-hidden />
      Chưa có dữ liệu — {reason}
    </Badge>
  )
}

// Render a Sourced<string|number> value with its source tag, or the honest
// "chưa có dữ liệu" fallback when the field is Unavailable.
export function SourcedValue({
  field,
  render,
  className,
}: {
  field: Sourced<string | number> | Unavailable
  render: (value: string | number) => ReactNode
  className?: string
}) {
  if (isUnavailable(field)) {
    return <UnavailableTag reason={field.reason} className={className} />
  }
  return (
    <span className={cn('inline-flex flex-col gap-0.5', className)}>
      <span>{render(field.value)}</span>
      <SourceTag source={field.source} updatedAt={field.updatedAt} />
    </span>
  )
}
