import { useState } from 'react'
import { Sparkles } from 'lucide-react'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { RealChatPanel } from '~/components/advisor/real-chat-panel'
import { RealResultsPanel } from '~/components/advisor/real-results-panel'
import type { AdvisorResponse } from '~/lib/advisor-api'
import type { StoreProduct } from '~/lib/products-api'

export function ChatSidebar({
  open,
  onOpenChange,
  compareItems,
  onRemoveCompareItem,
  onClearCompare,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  compareItems: StoreProduct[]
  onRemoveCompareItem: (id: string) => void
  onClearCompare: () => void
}) {
  const [response, setResponse] = useState<AdvisorResponse | null>(null)

  return (
    // Non-modal: tagging a 2nd/3rd product for compare needs to click cards behind the sidebar
    // while it stays open, so the overlay must not block or dim the page underneath.
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="left"
        overlayClassName="pointer-events-none bg-transparent"
        // Radix still dismisses on outside pointer events even with modal={false} — but here
        // "outside" is the product grid the user is actively tagging from, so keep it open.
        onInteractOutside={(e) => e.preventDefault()}
        className="gap-0 p-0 data-[side=left]:w-full data-[side=left]:sm:max-w-lg data-[side=left]:lg:max-w-xl"
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

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="h-[42%] min-h-[300px] border-b">
            <RealChatPanel
              onResponse={setResponse}
              compareItems={compareItems}
              onRemoveCompareItem={onRemoveCompareItem}
              onClearCompare={onClearCompare}
            />
          </div>
          <div className="chat-scroll flex-1 overflow-y-auto px-3 py-4 sm:px-4">
            <RealResultsPanel response={response} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
