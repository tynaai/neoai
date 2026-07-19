import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GitCompareArrows, PackagePlus, Sparkles, X } from 'lucide-react'

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '~/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '~/components/ai-elements/message'
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from '~/components/ai-elements/prompt-input'
import { Button } from '~/components/ui/button'
import { PRODUCT_DND_MIME, readDraggedProduct } from '~/lib/product-dnd'
import type { StoreProduct } from '~/lib/products-api'
import type { ChatMessage, ChatStatus } from '~/lib/use-advisor-chat'
import { cn } from '~/lib/utils'

export function RealChatPanel({
  messages,
  status,
  onSubmit,
  compareItems,
  onRemoveCompareItem,
  onClearCompare,
  onCompareNow,
  onDropProduct,
}: {
  messages: ChatMessage[]
  status: ChatStatus
  onSubmit: (text: string) => void
  compareItems: StoreProduct[]
  onRemoveCompareItem: (id: string) => void
  onClearCompare: () => void
  onCompareNow: () => void
  onDropProduct: (product: StoreProduct) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const isBusy = status === 'submitted' || status === 'streaming'

  const handleSubmit = useCallback((message: PromptInputMessage) => {
    const text = message.text?.trim()
    if (!text) return
    onSubmit(text)
  }, [onSubmit])

  return (
    <div
      className="relative flex h-full min-h-0 flex-col"
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(PRODUCT_DND_MIME)) return
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return
        setIsDragOver(false)
      }}
      onDrop={(e) => {
        setIsDragOver(false)
        const product = readDraggedProduct(e)
        if (product) onDropProduct(product)
      }}
    >
      {isDragOver && (
        <div className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary bg-primary/10 text-sm font-semibold text-primary backdrop-blur-sm">
          <PackagePlus className="size-5" aria-hidden />
          Thả vào đây để thêm vào so sánh
        </div>
      )}

      <Conversation className="min-h-0">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<Sparkles className="size-6" />}
              title="Bắt đầu tư vấn"
              description="Hỏi mình về tủ lạnh phù hợp với nhu cầu của bạn"
            />
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Message from={m.role}>
                    <MessageContent>
                      {m.role === 'assistant' && m.text === '' ? <TypingDots /> : <MessageResponse>{m.text}</MessageResponse>}
                    </MessageContent>
                    {m.attachedProducts && m.attachedProducts.length > 0 && (
                      <div className={cn('flex w-fit max-w-full flex-wrap gap-1.5', m.role === 'user' && 'ml-auto justify-end')}>
                        {m.attachedProducts.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1.5 rounded-full border bg-background py-1 pr-2.5 pl-1 text-[11px]"
                          >
                            <span className="grid size-5 shrink-0 place-items-center overflow-hidden rounded-full bg-muted">
                              {p.thumbnailUrl && <img src={p.thumbnailUrl} alt="" className="size-full object-cover" />}
                            </span>
                            <span className="max-w-32 truncate">{p.title}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </Message>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {compareItems.length > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-t bg-muted/40 px-4 py-2.5">
          <span className="text-[11px] font-medium text-muted-foreground">So sánh:</span>
          {compareItems.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 rounded-full border bg-background py-1 pr-1 pl-2 text-[11px]"
            >
              <span className="max-w-28 truncate">{p.title}</span>
              <button
                type="button"
                onClick={() => onRemoveCompareItem(p.id)}
                aria-label={`Bỏ ${p.title} khỏi so sánh`}
                className="grid size-4 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <Button type="button" size="xs" className="ml-auto rounded-full" disabled={isBusy} onClick={onCompareNow}>
            <GitCompareArrows className="size-3" /> So sánh ngay
          </Button>
          <Button type="button" size="xs" variant="ghost" className="rounded-full" onClick={onClearCompare}>
            Xoá
          </Button>
        </div>
      )}

      <div className="shrink-0 border-t bg-card p-4">
        <PromptInput
          onSubmit={handleSubmit}
          className="rounded-2xl border-border bg-background shadow-sm transition-colors focus-within:border-primary/50 focus-within:shadow-md"
        >
          <PromptInputBody>
            <PromptInputTextarea
              placeholder={
                compareItems.length > 0
                  ? 'Hỏi về các sản phẩm đã chọn... (vd: cái nào tiết kiệm điện hơn?)'
                  : 'Nhập nhu cầu của bạn... (vd: tủ lạnh cho gia đình 4 người, dưới 10 triệu)'
              }
              className="min-h-24 resize-none border-0 bg-transparent px-4 pt-3.5 pb-12 text-base leading-relaxed shadow-none ring-0 focus-visible:ring-0"
            />
          </PromptInputBody>
          <PromptInputSubmit
            status={status}
            className="absolute right-3 bottom-3 size-9 rounded-full shadow-sm transition-transform hover:scale-105 active:scale-95"
          />
        </PromptInput>
      </div>
    </div>
  )
}

// Inline placeholder shown inside the assistant bubble while its text is still empty — covers
// both the gap before the first NDJSON line arrives and the (usually tiny) gap between "meta"
// and the first text-delta chunk.
function TypingDots() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 py-1 text-muted-foreground">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-current"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: i * 0.15 }}
        />
      ))}
    </motion.div>
  )
}
