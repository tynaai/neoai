import { useCallback, useRef, useState } from 'react'
import { nanoid } from 'nanoid'

import { sendAdvisorMessage, type AdvisorResponse } from '~/lib/advisor-api'
import { sendCompareMessage } from '~/lib/compare-api'
import type { StoreProduct } from '~/lib/products-api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  // Snapshot of the products being compared at the moment this message was sent — lets the
  // transcript show which products a "so sánh" question was actually about.
  attachedProducts?: StoreProduct[]
}

export const GREETING =
  'Chào bạn! Mình là NeoAI — trợ lý tư vấn tủ lạnh của Điện Máy Xanh. Bạn đang cần tìm tủ lạnh như thế nào ạ?'

export const DEFAULT_COMPARE_PROMPT = 'So sánh giúp mình các sản phẩm này, cái nào đáng mua hơn?'

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

// Shared conversation state — lifted out of the chat panel so the results drawer's "So sánh
// ngay" button can submit into the same conversation (and the left chat panel can react to it)
// without the two panels needing a parent-child relationship.
export function useAdvisorChat(compareItems: StoreProduct[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'greeting', role: 'assistant', text: GREETING }])
  const [status, setStatus] = useState<ChatStatus>('ready')
  const [response, setResponse] = useState<AdvisorResponse | null>(null)
  const conversationId = useRef(nanoid())
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const compareItemsRef = useRef(compareItems)
  compareItemsRef.current = compareItems

  const submitMessage = useCallback(async (text: string, attachedProducts?: StoreProduct[]) => {
    if (!text) return

    const userMsg: ChatMessage = { id: nanoid(), role: 'user', text, attachedProducts }
    const assistantId = nanoid()
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', text: '' }])
    setStatus('submitted')

    const appendDelta = (delta: string) => {
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + delta } : m)))
    }

    const compareIds = compareItemsRef.current.map((p) => p.id)

    try {
      if (compareIds.length > 0) {
        await sendCompareMessage(compareIds, text, {
          onTextDelta: appendDelta,
          onDone: () => setStatus('ready'),
        })
      } else {
        const historyText = messagesRef.current
          .slice(-6)
          .map((m) => `${m.role === 'user' ? 'Khách' : 'Bot'}: ${m.text}`)
          .join('\n')

        await sendAdvisorMessage(conversationId.current, text, historyText, {
          onMeta: (meta) => {
            setResponse(meta)
            setStatus('streaming')
          },
          onTextDelta: appendDelta,
          onDone: () => setStatus('ready'),
        })
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, text: 'Xin lỗi, có lỗi kết nối tới máy chủ. Bạn thử lại giúp mình nhé.' } : m,
        ),
      )
      setStatus('error')
    }
  }, [])

  return { messages, status, response, submitMessage }
}
