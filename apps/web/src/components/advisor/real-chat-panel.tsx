import { useCallback, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import { AnimatePresence, motion } from 'motion/react'
import { Sparkles } from 'lucide-react'

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
import { sendAdvisorMessage, type AdvisorResponse } from '~/lib/advisor-api'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const GREETING =
  'Chào bạn! Mình là NeoAI — trợ lý tư vấn tủ lạnh của Điện Máy Xanh. Bạn đang cần tìm tủ lạnh như thế nào ạ?'

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

export function RealChatPanel({ onResponse }: { onResponse: (r: AdvisorResponse) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'greeting', role: 'assistant', text: GREETING }])
  const [status, setStatus] = useState<ChatStatus>('ready')
  const conversationId = useRef(nanoid())
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const handleSubmit = useCallback(async (message: PromptInputMessage) => {
    const text = message.text?.trim()
    if (!text) return

    const userMsg: ChatMessage = { id: nanoid(), role: 'user', text }
    const assistantId = nanoid()
    // Empty placeholder now — text gets appended delta by delta as the stream arrives.
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', text: '' }])
    setStatus('submitted')

    const historyText = messagesRef.current
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Khách' : 'Bot'}: ${m.text}`)
      .join('\n')

    const appendDelta = (delta: string) => {
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + delta } : m)))
    }

    try {
      await sendAdvisorMessage(conversationId.current, text, historyText, {
        // Meta arrives before any text — update the product panel right away.
        onMeta: (meta) => {
          onResponse(meta)
          setStatus('streaming')
        },
        onTextDelta: appendDelta,
        onDone: () => setStatus('ready'),
      })
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, text: 'Xin lỗi, có lỗi kết nối tới máy chủ. Bạn thử lại giúp mình nhé.' } : m,
        ),
      )
      setStatus('error')
    }
  }, [onResponse])

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
                  </Message>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="shrink-0 border-t bg-card p-4">
        <PromptInput
          onSubmit={handleSubmit}
          className="rounded-2xl border-border bg-background shadow-sm transition-colors focus-within:border-primary/50 focus-within:shadow-md"
        >
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Nhập nhu cầu của bạn... (vd: tủ lạnh cho gia đình 4 người, dưới 10 triệu)"
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
