import { useCallback, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { nanoid } from 'nanoid'
import { AnimatePresence, motion } from 'motion/react'
import { GitCompareArrows, Sparkles, X } from 'lucide-react'

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '~/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '~/components/ai-elements/message'
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from '~/components/ai-elements/prompt-input'
import { Button } from '~/components/ui/button'
import { ADVISOR_API_BASE, type AdvisorResponse } from '~/lib/advisor-api'
import { sendCompareMessage } from '~/lib/compare-api'
import type { StoreProduct } from '~/lib/products-api'

type AdvisorUIMessage = UIMessage<unknown, { 'advisor-meta': AdvisorResponse }>

const GREETING =
  'Chào bạn! Mình là NeoAI — trợ lý tư vấn tủ lạnh của Điện Máy Xanh. Bạn đang cần tìm tủ lạnh như thế nào ạ?'

const DEFAULT_COMPARE_PROMPT =
  'So sánh giúp mình các sản phẩm này, cái nào đáng mua hơn?'

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

const INITIAL_MESSAGES: AdvisorUIMessage[] = [
  {
    id: 'greeting',
    role: 'assistant',
    parts: [{ type: 'text', text: GREETING }],
  },
]

function getMessageText(message: AdvisorUIMessage): string {
  return message.parts
    .filter(
      (
        part,
      ): part is Extract<(typeof message.parts)[number], { type: 'text' }> =>
        part.type === 'text',
    )
    .map((part) => part.text)
    .join('')
}

export function RealChatPanel({
  onResponse,
  compareItems,
  onRemoveCompareItem,
  onClearCompare,
}: {
  onResponse: (r: AdvisorResponse) => void
  compareItems: StoreProduct[]
  onRemoveCompareItem: (id: string) => void
  onClearCompare: () => void
}) {
  const conversationId = useRef(nanoid())
  const onResponseRef = useRef(onResponse)
  onResponseRef.current = onResponse
  const compareItemsRef = useRef(compareItems)
  compareItemsRef.current = compareItems
  const [compareStatus, setCompareStatus] = useState<ChatStatus>('ready')
  const [transport] = useState(
    () =>
      new DefaultChatTransport<AdvisorUIMessage>({
        api: `${ADVISOR_API_BASE}/api/advisor/chat`,
        prepareSendMessagesRequest: ({ messages }) => {
          const latest = messages.at(-1)
          if (!latest || latest.role !== 'user') {
            throw new Error('Advisor chỉ nhận tin nhắn từ khách hàng')
          }

          const history = messages
            .slice(-7, -1)
            .map(
              (message) =>
                `${message.role === 'user' ? 'Khách' : 'Bot'}: ${getMessageText(message)}`,
            )
            .join('\n')

          return {
            body: {
              inputData: {
                conversationId: conversationId.current,
                message: getMessageText(latest),
                history,
              },
            },
          }
        },
      }),
  )
  const { messages, sendMessage, setMessages, status } =
    useChat<AdvisorUIMessage>({
      messages: INITIAL_MESSAGES,
      transport,
      onData: (part) => {
        if (part.type === 'data-advisor-meta') onResponseRef.current(part.data)
      },
    })

  const runCompare = useCallback(
    async (text: string, productIds: string[]) => {
      const userMsg: AdvisorUIMessage = {
        id: nanoid(),
        role: 'user',
        parts: [{ type: 'text', text }],
      }
      const assistantId = nanoid()
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: assistantId,
          role: 'assistant',
          parts: [{ type: 'text', text: '' }],
        },
      ])
      setCompareStatus('submitted')

      const appendDelta = (delta: string) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  parts: [
                    { type: 'text', text: getMessageText(message) + delta },
                  ],
                }
              : message,
          ),
        )
      }

      try {
        await sendCompareMessage(productIds, text, {
          onTextDelta: appendDelta,
          onDone: () => setCompareStatus('ready'),
        })
      } catch {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  parts: [
                    {
                      type: 'text',
                      text: 'Xin lỗi, có lỗi kết nối tới máy chủ. Bạn thử lại giúp mình nhé.',
                    },
                  ],
                }
              : message,
          ),
        )
        setCompareStatus('error')
      }
    },
    [setMessages],
  )

  const runSubmit = useCallback(
    (text: string) => {
      if (!text) return
      const compareIds = compareItemsRef.current.map((product) => product.id)
      if (compareIds.length > 0) {
        void runCompare(text, compareIds)
        return
      }
      void sendMessage({ text })
    },
    [runCompare, sendMessage],
  )

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const text = message.text?.trim()
      if (!text) return
      void runSubmit(text)
    },
    [runSubmit],
  )

  const displayStatus = compareStatus === 'ready' ? status : compareStatus
  const isBusy = displayStatus === 'submitted' || displayStatus === 'streaming'

  return (
    <div className="flex h-full min-h-0 flex-col">
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
              {messages.map((m) => {
                const text = getMessageText(m)
                return (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <Message from={m.role}>
                      <MessageContent>
                        {m.role === 'assistant' && text === '' ? (
                          <TypingDots />
                        ) : (
                          <MessageResponse>{text}</MessageResponse>
                        )}
                      </MessageContent>
                    </Message>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      {compareItems.length > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-t bg-muted/40 px-4 py-2.5">
          <span className="text-[11px] font-medium text-muted-foreground">
            So sánh:
          </span>
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
          <Button
            type="button"
            size="xs"
            className="ml-auto rounded-full"
            disabled={isBusy}
            onClick={() => runSubmit(DEFAULT_COMPARE_PROMPT)}
          >
            <GitCompareArrows className="size-3" /> So sánh ngay
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="rounded-full"
            onClick={onClearCompare}
          >
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
            status={displayStatus}
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-1 py-1 text-muted-foreground"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-current"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.15,
          }}
        />
      ))}
    </motion.div>
  )
}
