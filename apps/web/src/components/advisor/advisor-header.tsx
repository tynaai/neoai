import { motion } from 'motion/react'
import { MessageCircle } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

export function AdvisorHeader({ onOpenChat }: { onOpenChat?: () => void }) {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto flex h-16 w-full items-stretch justify-between gap-2 pr-3 sm:pr-5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative h-full w-[220px] shrink-0 sm:w-[248px]">
            <svg
              viewBox="0 0 493 110"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <defs>
                <linearGradient id="dmx-blue" x1="0" y1="0" x2="1" y2="0.35">
                  <stop offset="0" stopColor="#2A34C0" />
                  <stop offset="0.5" stopColor="#1B45C6" />
                  <stop offset="1" stopColor="#0062D8" />
                </linearGradient>
              </defs>
              <path
                d="M0 0 L492 0 C488.5 1 476.5 4 471 6 C465.5 8 462.2 10 459 12 C455.8 14 454.2 16 452 18 C449.8 20 447.8 22 446 24 C444.2 26 442.5 28 441 30 C439.5 32 438.2 34 437 36 C435.8 38 435 40 434 42 C433 44 431.8 46 431 48 C430.2 50 429.7 52 429 54 C428.3 56 427.8 58 427 60 C426.2 62 425 64 424 66 C423 68 421.8 70 421 72 C420.2 74 420 76 419 78 C418 80 416.3 82 415 84 C413.7 86 412.8 88 411 90 C409.2 92 407 94 404 96 C401 98 396.5 99.7 393 102 C389.5 104.3 384.7 108.7 383 110 L0 110 Z"
                fill="url(#dmx-blue)"
              />
            </svg>
            <img
              src="/dmx_logo.png"
              alt="Điện Máy Xanh"
              className="absolute left-[3%] top-1/2 h-[140%] w-auto max-w-none -translate-y-1/2 object-contain"
            />
          </div>
          <Badge className="bg-brand-accent text-brand-accent-foreground">Beta</Badge>
        </div>

        <nav aria-label="Điều hướng" className="flex shrink-0 items-center gap-2 sm:gap-3">
          {onOpenChat && (
            <Button className="h-9 rounded-full" onClick={onOpenChat}>
              <MessageCircle aria-hidden />
              <span className="hidden sm:inline">Tư vấn AI</span>
              <span className="sr-only sm:hidden">Tư vấn AI</span>
            </Button>
          )}
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </motion.header>
  )
}
