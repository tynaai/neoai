import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, BadgeCheck, Leaf, Sparkles, Wind } from 'lucide-react'

import { Button } from '~/components/ui/button'

const highlights = [
  { icon: Leaf, label: 'Inverter tiết kiệm điện' },
  { icon: BadgeCheck, label: 'Chính hãng, bảo hành đến 5 năm' },
  { icon: Wind, label: 'Làm lạnh nhanh, vận hành êm' },
]

const QUICK_PROMPTS = ['Máy lạnh dưới 15 triệu', 'Phòng 20m² nên chọn máy nào?', 'So sánh Inverter với thường']

// Second half of Điện Máy Xanh's storefront tagline — rotates through completions that each
// pair meaningfully with the fixed "Mua sắm thả ga" opener (typed, held, deleted, repeat).
const ROTATING_PHRASES = ['Không lo về giá', 'Đến Điện Máy Xanh', 'Giá tốt mỗi ngày', 'Hàng chính hãng, an tâm']
const TYPE_MS = 55
const DELETE_MS = 28
const HOLD_MS = 1700

function useRotatingTypewriter(phrases: string[]) {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [mode, setMode] = useState<'typing' | 'holding' | 'deleting'>('typing')

  useEffect(() => {
    const current = phrases[phraseIndex]

    if (mode === 'typing') {
      if (text.length < current.length) {
        const id = window.setTimeout(() => setText(current.slice(0, text.length + 1)), TYPE_MS)
        return () => window.clearTimeout(id)
      }
      const id = window.setTimeout(() => setMode('holding'), HOLD_MS)
      return () => window.clearTimeout(id)
    }

    if (mode === 'holding') {
      const id = window.setTimeout(() => setMode('deleting'), HOLD_MS)
      return () => window.clearTimeout(id)
    }

    // deleting
    if (text.length > 0) {
      const id = window.setTimeout(() => setText(text.slice(0, -1)), DELETE_MS)
      return () => window.clearTimeout(id)
    }
    setPhraseIndex((i) => (i + 1) % phrases.length)
    setMode('typing')
    return undefined
  }, [text, mode, phraseIndex, phrases])

  return text
}

export function Hero({
  chatOpen,
  onToggleChat,
  onOpenChat,
}: {
  chatOpen: boolean
  onToggleChat: () => void
  onOpenChat: () => void
}) {
  const rotatingText = useRotatingTypewriter(ROTATING_PHRASES)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--hero-gradient-from)] via-[var(--hero-gradient-from)] to-[var(--hero-gradient-to)] text-brand-primary-foreground">
      <motion.div
        aria-hidden
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -24, 0], y: [0, 16, 0] }}
        transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-brand-accent/20 blur-3xl"
      />

      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-4 py-14 text-center sm:gap-6 sm:px-6 sm:py-20">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm"
        >
          <Sparkles className="size-3.5" /> Bộ sưu tập Máy lạnh 2026
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex min-h-[84px] flex-col items-center justify-center gap-1 sm:min-h-[104px] lg:min-h-[124px]"
        >
          <h1 className="font-heading text-3xl leading-tight tracking-wide text-white sm:text-4xl lg:text-6xl">
            Mua sắm thả ga
          </h1>
          <p className="font-heading text-2xl leading-tight tracking-wide text-brand-accent sm:text-3xl lg:text-5xl">
            {rotatingText}
            <motion.span
              aria-hidden
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
              className="ml-0.5 inline-block h-[0.85em] w-[3px] translate-y-[0.1em] rounded-full bg-current align-middle"
            />
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="max-w-lg text-sm text-white/85 sm:text-base"
        >
          Hàng chính hãng từ Panasonic, LG, Daikin, Gree, Toshiba... Để AI tư vấn công suất phù hợp diện tích
          phòng, ngân sách và nhu cầu tiết kiệm điện của bạn.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            size="lg"
            aria-pressed={chatOpen}
            onClick={onToggleChat}
            className="h-11 rounded-full bg-white px-5 text-brand-primary hover:bg-white/90"
          >
            <Sparkles className="size-4" />
            Tư vấn cùng AI
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-full border-white/40 bg-white/5 px-5 text-white hover:bg-white/15 hover:text-white"
          >
            <a href="#products">
              Xem sản phẩm <ArrowRight className="size-4" />
            </a>
          </Button>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {highlights.map(({ icon: Icon, label }, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 + i * 0.08 }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/85 sm:text-sm"
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </motion.span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={onOpenChat}
              className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 transition-colors hover:border-white/40 hover:bg-white/15"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
