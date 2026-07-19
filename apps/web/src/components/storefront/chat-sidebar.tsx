import { Layers, PanelRightClose, Sparkles } from 'lucide-react'

import { RealChatPanel } from '~/components/advisor/real-chat-panel'
import { RealResultsPanel } from '~/components/advisor/real-results-panel'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import type { AdvisorResponse } from '~/lib/advisor-api'
import type { StoreProduct } from '~/lib/products-api'
import { cn } from '~/lib/utils'

export function ChatSidebar({
  open,
  onOpenChange,
  onResponse,
  response,
  compareItems,
  onRemoveCompareItem,
  onClearCompare,
  onCompareSubmit,
  onDropProduct,
  expanded,
  onExpandedChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResponse: (r: AdvisorResponse) => void
  response: AdvisorResponse | null
  compareItems: StoreProduct[]
  onRemoveCompareItem: (id: string) => void
  onClearCompare: () => void
  onCompareSubmit: () => void
  onDropProduct: (product: StoreProduct) => void
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
}) {
  return (
    // Non-modal: the product grid behind stays clickable so users can keep tagging/dragging
    // more items in while this stays open.
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="left"
        overlayClassName="pointer-events-none bg-transparent"
        onInteractOutside={(e) => e.preventDefault()}
        className={cn(
          'gap-0 overflow-visible p-0',
          expanded
            ? 'data-[side=left]:w-full data-[side=left]:sm:max-w-none'
            : 'data-[side=left]:w-full data-[side=left]:sm:max-w-lg data-[side=left]:lg:max-w-2xl',
        )}
      >
        {/* Sits right next to the sheet's own built-in "X" close button — one icon closes the
            whole panel, the other just collapses back to the compact chat-only view. */}
        {expanded && (
          <button
            type="button"
            onClick={() => onExpandedChange(false)}
            aria-label="Thu gọn sản phẩm & so sánh"
            className="absolute top-3 right-12 z-10 grid size-7 place-items-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <PanelRightClose className="size-4" aria-hidden />
          </button>
        )}

        <div className="flex h-full min-h-0">
          <div
            className={cn(
              'relative flex min-h-0 flex-col',
              expanded ? 'w-full max-w-lg shrink-0 border-r' : 'w-full',
            )}
          >
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" aria-hidden />
                NeoAI
              </SheetTitle>
              <SheetDescription className="sr-only">
                Trò chuyện với AI để nhận gợi ý máy lạnh phù hợp nhu cầu và ngân sách của bạn.
              </SheetDescription>
            </SheetHeader>

            <RealChatPanel
              onResponse={onResponse}
              compareItems={compareItems}
              onRemoveCompareItem={onRemoveCompareItem}
              onClearCompare={onClearCompare}
              onCompareSubmit={onCompareSubmit}
              onDropProduct={onDropProduct}
            />

            {/* Attached to the chat panel's own right edge (not the screen's) — pull it out to
                reveal the product/results column next to the chat, wherever that edge currently
                sits. Only meaningful while compact; once expanded this would land off-screen, so
                the icon button next to the sheet's close "X" takes over collapsing. */}
            {!expanded && (
              <button
                type="button"
                onClick={() => onExpandedChange(true)}
                aria-label="Mở sản phẩm gợi ý và so sánh"
                className="absolute top-1/2 left-full z-10 flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-r-2xl bg-primary py-4 pr-2.5 pl-2 text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:translate-x-1"
              >
                <Layers className="size-5" aria-hidden />
                {compareItems.length > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-brand-accent text-[11px] font-bold text-brand-accent-foreground">
                    {compareItems.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {expanded && (
            <div className="hidden min-h-0 flex-1 flex-col sm:flex">
              <div className="border-b px-4 py-3">
                <span className="flex items-center gap-2 font-heading text-base font-medium">
                  <Layers className="size-4 text-primary" aria-hidden />
                  Sản phẩm & So sánh
                </span>
              </div>
              <div className="chat-scroll flex-1 overflow-y-auto p-4 sm:p-5">
                <RealResultsPanel response={response} />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
