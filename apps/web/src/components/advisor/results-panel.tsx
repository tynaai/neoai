import { useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  GitCompare,
  Info,
  Sparkles,
} from 'lucide-react'

import { cn } from '~/lib/utils'
import { useFlip } from '~/lib/use-flip'
import { useColumnCount } from '~/lib/use-column-count'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import {
  dataHonestyNote,
  priorityLabels,
  priorityOrder,
  refinementChips,
  type PriorityKey,
  type ScoredProduct,
  type Weights,
} from '~/lib/mock-data'
import { ProductCard } from './product-card'

// The workspace results view. Ranking is computed and lives in App state; this
// panel renders the current order, the "đang ưu tiên" bar, an inline re-rank
// explanation (replacing the old floating toast), and a single AI-offered
// compare action. Refinement chips flip real priority weights → live re-rank.
export function ResultsPanel({
  ranked,
  weights,
  explain,
  activePriority,
  onRefine,
  onViewDetail,
  onCheckStock,
  onOpenCompare,
}: {
  ranked: ScoredProduct[]
  weights: Weights
  explain: string | null
  activePriority: PriorityKey | null
  onRefine: (key: PriorityKey) => void
  onViewDetail: (id: string) => void
  onCheckStock: (id: string) => void
  onOpenCompare: () => void
}) {
  const [showAll, setShowAll] = useState(false)
  const order = priorityOrder(weights)
  const visibleProducts = showAll ? ranked : ranked.slice(0, 3)
  const hiddenCount = Math.max(ranked.length - 3, 0)
  // FLIP: cards glide to their new rank whenever the computed order changes.
  const rankKey = ranked.map((s) => s.product.id).join(',')
  const flipRef = useFlip<HTMLDivElement>(rankKey)

  // True masonry: bucket cards round-robin into `columnCount` independent
  // vertical stacks (rank 1 starts column 1, rank 2 starts column 2, …) so
  // items 1..N always form the top row, but each column then packs its own
  // cards back-to-back with no shared row height — no CSS grid, so no gap
  // reserved under a shorter card while its row-mate is still tall.
  const columnCount = useColumnCount()
  const columns: { scored: ScoredProduct; rank: number }[][] = Array.from(
    { length: columnCount },
    () => [],
  )
  visibleProducts.forEach((scored, index) => {
    columns[index % columnCount].push({ scored, rank: index + 1 })
  })

  return (
    <section aria-label="Kết quả gợi ý" className="flex flex-col gap-4">
      {/* Header row: title + AI-offered compare (no per-card checkboxes) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
          {showAll ? `${ranked.length} mẫu phù hợp` : 'Top 3 mẫu phù hợp nhất'}
          <Badge
            variant="muted"
            className="rounded-full bg-brand-primary-soft px-2.5 text-primary"
          >
            Đã lọc từ {ranked.length} mẫu
          </Badge>
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCompare}
          className="h-9 rounded-full border-primary/20 bg-background px-4 font-semibold text-primary shadow-sm hover:bg-brand-primary-soft"
        >
          <GitCompare />
          So sánh cả 3 mẫu
        </Button>
      </div>

      {/* Priority bar — shows the live weighting order and doubles as controls */}
      <Card className="gap-0 border-primary/15 bg-gradient-to-r from-card to-brand-primary-soft/50 py-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-medium text-muted-foreground">
              Đang ưu tiên:
            </span>
            {order.map((key, i) => (
              <span key={key} className="flex items-center gap-2">
                <span
                  className={cn(
                    'font-semibold transition-colors duration-300',
                    i === 0 ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {priorityLabels[key]}
                </span>
                {i < order.length - 1 && (
                  <ArrowRight
                    className="size-3 text-muted-foreground/50"
                    aria-hidden
                  />
                )}
              </span>
            ))}
          </div>

          {/* Inline re-rank explanation — the cause-and-effect, in place */}
          {explain && (
            <p
              key={explain}
              role="status"
              className="mt-2 flex items-start gap-1.5 rounded-lg bg-brand-primary-soft px-2.5 py-1.5 text-xs text-primary duration-300 animate-in fade-in slide-in-from-top-1"
            >
              <Sparkles className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {explain}
            </p>
          )}

          {/* Refinement chips — the single place to steer results */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {refinementChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => onRefine(chip.boosts)}
                aria-pressed={activePriority === chip.boosts}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95',
                  activePriority === chip.boosts
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background text-foreground hover:border-brand-primary/40 hover:bg-brand-primary-soft/50',
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pinterest/Google-AI-Shopping style masonry: real independent column
          stacks (bucketed in JS above), not CSS grid or `columns-*`. Grid (even
          with `items-start`) still reserves a shared row height for every
          card in a row, leaving a gap under shorter cards before the next row
          starts. Plain CSS multi-column avoids that gap but doesn't guarantee
          cards 1/2/3 land in the same visual row. Bucketing ourselves gets
          both: rank 1..columnCount seed the top of each column (so they're
          level), and every column then flows tightly with no reserved gaps. */}
      <div ref={flipRef} className="flex gap-4">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-4">
            {column.map(({ scored, rank }) => (
              <ProductCard
                key={scored.product.id}
                scored={scored}
                rank={rank}
                onViewDetail={onViewDetail}
                onCheckStock={onCheckStock}
              />
            ))}
          </div>
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="flex justify-center py-1">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setShowAll((current) => !current)}
            aria-expanded={showAll}
            className="h-11 rounded-full border-primary/20 bg-background px-6 font-semibold text-primary shadow-sm hover:border-primary/40 hover:bg-brand-primary-soft"
          >
            {showAll ? (
              <>
                Thu gọn
                <ChevronUp />
              </>
            ) : (
              <>
                Xem thêm {hiddenCount} sản phẩm
                <ChevronDown />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Data-honesty footer */}
      <Alert className="bg-muted/50 text-muted-foreground">
        <Info aria-hidden />
        <AlertDescription className="text-xs">
          {dataHonestyNote}
        </AlertDescription>
      </Alert>
    </section>
  )
}
