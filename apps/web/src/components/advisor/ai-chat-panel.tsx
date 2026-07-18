import { useEffect, useRef, useState } from 'react'
import { SendHorizontal, Sparkles, SkipForward } from 'lucide-react'

import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { Button } from '~/components/ui/button'
import {
  aiFallibilityNote,
  conversationScript,
  type NeedField,
  type QuickReply,
  type ScoredProduct,
  type ScriptStep,
} from '~/lib/mock-data'

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | {
      id: string
      role: 'ai'
      text: string
      quickReplies: QuickReply[]
      allowSkip: boolean
    }

let messageSeq = 0
function nextMessageId() {
  messageSeq += 1
  return `msg-${messageSeq}`
}

export function AiChatPanel({
  needFields,
  ranked,
  onConfirmNeed,
  onRevealResults,
  onOpenCompare,
  resultsRevealed,
}: {
  needFields: NeedField[]
  ranked: ScoredProduct[]
  onConfirmNeed: (fieldId: string, value: string) => void
  onRevealResults: () => void
  onOpenCompare: () => void
  resultsRevealed: boolean
}) {
  // Full conversation history — every AI turn and user reply stays visible
  // instead of being replaced by the latest one, like a real chat thread.
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [typing, setTyping] = useState(false)
  const [awaitingReply, setAwaitingReply] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const needsRef = useRef(needFields)
  const scrollRef = useRef<HTMLDivElement>(null)
  // Tracks pending timers so a StrictMode dev-only mount→cleanup→mount cycle
  // cancels the FIRST run's in-flight timers instead of letting both runs'
  // timers fire and duplicate messages. The second (real) mount then starts
  // its own fresh advance(0) normally — no extra "already started" guard,
  // since that would also suppress the second mount's real timer.
  const pendingTimers = useRef<Set<number>>(new Set())

  useEffect(() => {
    needsRef.current = needFields
  }, [needFields])

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector<HTMLElement>(
      '[data-slot=scroll-area-viewport]',
    )
    viewport?.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  function advance(nextIndex: number) {
    if (nextIndex >= conversationScript.length) return
    const step = conversationScript[nextIndex]
    setTyping(true)
    setAwaitingReply(false)
    const delay = 500 + Math.min(step.text.length * 5, 700)
    const timerId = window.setTimeout(() => {
      pendingTimers.current.delete(timerId)
      const turn = toTurn(step, needsRef.current)
      setTyping(false)
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId(),
          role: 'ai',
          text: turn.text,
          quickReplies: turn.quickReplies,
          allowSkip: turn.allowSkip,
        },
      ])
      setStepIndex(nextIndex)
      if (step.kind === 'ai-question') {
        setAwaitingReply(true)
      } else if (step.kind === 'ai-summary') {
        onRevealResults()
        advance(nextIndex + 1)
      } else {
        advance(nextIndex + 1)
      }
    }, delay)
    pendingTimers.current.add(timerId)
  }

  useEffect(() => {
    advance(0)

    return () => {
      for (const timerId of pendingTimers.current) window.clearTimeout(timerId)
      pendingTimers.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleQuickReply(reply: QuickReply) {
    if (!awaitingReply) return
    if (reply.confirms) {
      const nextNeeds = needsRef.current.map((field) =>
        field.id === reply.confirms?.fieldId
          ? { ...field, value: reply.confirms.value, confirmed: true }
          : field,
      )
      needsRef.current = nextNeeds
      onConfirmNeed(reply.confirms.fieldId, reply.confirms.value)
    }
    setMessages((current) => [
      ...current,
      { id: nextMessageId(), role: 'user', text: reply.label },
    ])
    setAwaitingReply(false)
    if (reply.action === 'open-compare') {
      onOpenCompare()
      return
    }
    advance(stepIndex + 1)
  }

  // "Bỏ qua" — user doesn't want to answer more questions; jump straight to
  // the nearest ai-summary step so the product list appears right away.
  function handleSkip() {
    if (!awaitingReply) return
    setMessages((current) => [
      ...current,
      { id: nextMessageId(), role: 'user', text: 'Bỏ qua, xem đề xuất ngay' },
    ])
    setAwaitingReply(false)
    const summaryIndex = conversationScript.findIndex(
      (step, index) => index >= stepIndex && step.kind === 'ai-summary',
    )
    advance(summaryIndex === -1 ? stepIndex + 1 : summaryIndex)
  }

  // Free-text send: lets the user type instead of only tapping quick-reply
  // chips. Mid-flow it simply advances the script (as an open-ended answer);
  // once results are shown it gives a lightweight acknowledgement reply.
  function handleSend() {
    const text = inputValue.trim()
    if (!text) return
    setInputValue('')
    setMessages((current) => [
      ...current,
      { id: nextMessageId(), role: 'user', text },
    ])

    if (awaitingReply) {
      setAwaitingReply(false)
      advance(stepIndex + 1)
      return
    }

    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId(),
          role: 'ai',
          text: resultsRevealed
            ? 'Mình đã ghi nhận câu hỏi của bạn. Bạn có thể xem các gợi ý sản phẩm bên phải hoặc bấm "So sánh" để xem chi tiết hơn nhé.'
            : 'Mình đã ghi nhận. Mình sẽ tiếp tục hỏi thêm vài ý nhỏ để gợi ý đúng máy lạnh nhất cho bạn.',
          quickReplies: [],
          allowSkip: false,
        },
      ])
    }, 500)
  }

  const lastMessage = messages[messages.length - 1]
  const lastIsAi = lastMessage?.role === 'ai'

  return (
    <Card className="h-full min-h-0 gap-0 rounded-none border-0 bg-card py-0 shadow-none">
      <section aria-label="AI Tư vấn" className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="flex-row items-center gap-3 border-b px-4 py-3">
          <Avatar className="size-9 bg-primary text-primary-foreground">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold text-primary">AI tư vấn</h2>
            <p className="text-xs text-muted-foreground">
              Một câu hỏi tại một thời điểm
            </p>
          </div>
        </CardHeader>

        <ScrollArea ref={scrollRef} className="min-h-0 flex-1">
          <CardContent className="flex flex-col gap-2.5 p-4">
            {messages.map((message) => {
              if (message.role === 'user') {
                return (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground shadow-sm duration-200 animate-in fade-in slide-in-from-bottom-1">
                      {message.text}
                    </div>
                  </div>
                )
              }
              const isLastAi = lastIsAi && message.id === lastMessage.id
              return (
                <div key={message.id} className="flex flex-col gap-2.5">
                  <p className="max-w-[96%] pr-2 text-sm leading-normal text-foreground duration-300 animate-in fade-in">
                    {message.text}
                  </p>

                  {isLastAi && awaitingReply ? (
                    <div className="flex flex-wrap gap-2">
                      {message.quickReplies.slice(0, 2).map((reply) => (
                        <Button
                          key={reply.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(reply)}
                          className="h-auto rounded-full px-3.5 py-2 text-xs text-primary hover:bg-brand-primary-soft"
                        >
                          {reply.label}
                        </Button>
                      ))}
                      {message.allowSkip ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSkip}
                          className="h-auto rounded-full border-dashed px-3.5 py-2 text-xs text-muted-foreground"
                        >
                          <SkipForward className="size-3.5" aria-hidden />
                          Bỏ qua, xem đề xuất ngay
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )
            })}

            {typing ? <TypingIndicator /> : null}

            {resultsRevealed ? (
              <TopProductTradeoffs ranked={ranked.slice(0, 3)} />
            ) : null}
          </CardContent>
        </ScrollArea>

        <Separator />
        <CardFooter className="block px-3 py-3">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={
                resultsRevealed
                  ? 'Hỏi thêm hoặc tinh chỉnh nhu cầu…'
                  : 'Nhập trả lời của bạn…'
              }
              aria-label="Nhập tin nhắn"
              className="h-10 rounded-full bg-muted/50 px-4 text-sm"
            />
            <Button
              type="submit"
              size="icon-lg"
              disabled={!inputValue.trim()}
              className="shrink-0 rounded-full"
              aria-label="Gửi"
            >
              <SendHorizontal className="size-4" aria-hidden />
            </Button>
          </form>
          <p className="mt-2 px-1 text-center text-[11px] leading-relaxed text-muted-foreground">
            {aiFallibilityNote}
          </p>
        </CardFooter>
      </section>
    </Card>
  )
}

function toTurn(
  step: ScriptStep,
  needs: NeedField[],
): { text: string; quickReplies: QuickReply[]; allowSkip: boolean } {
  const hasKids = needs.find((field) => field.id === 'kids')?.value === 'Có'
  let text = step.text
  if (text.startsWith('Vậy mình hiểu là:')) {
    text = hasKids
      ? 'Phòng ngủ có trẻ nhỏ nên độ êm ban đêm rất quan trọng — đúng ý bạn chứ ạ?'
      : 'Phòng ngủ không có trẻ nhỏ; mình vẫn ưu tiên chạy êm và tiết kiệm điện — đúng ý bạn chứ ạ?'
  }
  return {
    text,
    quickReplies: step.kind === 'ai-question' ? step.quickReplies : [],
    allowSkip: step.kind === 'ai-question' ? Boolean(step.allowSkip) : false,
  }
}

function TopProductTradeoffs({ ranked }: { ranked: ScoredProduct[] }) {
  return (
    <section
      aria-label="Đánh đổi giữa ba sản phẩm hàng đầu"
      className="mt-1 border-t pt-4 duration-300 animate-in fade-in"
    >
      <p className="text-sm leading-6 text-foreground">
        Ba lựa chọn đầu đều phù hợp, nhưng mỗi mẫu có một đánh đổi khác nhau:
      </p>
      <ol className="mt-3 space-y-3">
        {ranked.map(({ product }, index) => (
          <li key={product.id} className="grid grid-cols-[1.5rem_1fr] gap-2">
            <span className="mt-0.5 text-xs font-semibold tabular-nums text-primary">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-5 text-foreground">
                {product.shortName}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {product.tradeOff}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
      <Sparkles className="size-4 animate-pulse text-primary" aria-hidden />
      AI đang chuẩn bị câu hỏi tiếp theo…
    </div>
  )
}
