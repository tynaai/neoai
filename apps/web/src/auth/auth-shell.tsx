import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { Sparkles } from 'lucide-react'

type AuthShellProps = {
  children: ReactNode
  title: string
}

export function AuthShell({ children, title }: AuthShellProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--hero-gradient-from)] via-[var(--hero-gradient-from)] to-[var(--hero-gradient-to)] px-5 py-10 text-brand-primary-foreground sm:px-8">
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

      <Link
        aria-label="Điện máy XANH — về trang chủ"
        to="/"
        className="group absolute top-6 left-5 z-10 inline-flex items-center gap-1 rounded-full bg-white/15 px-3.5 py-2 text-sm font-heading tracking-wide text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:top-8 sm:left-8"
      >
        Điện máy <span className="text-brand-accent">XANH</span>
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[460px]"
      >
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            <Sparkles className="size-3.5" /> Truy cập bảo mật
          </span>
          <h1 className="mt-4 font-heading text-3xl tracking-wide text-white sm:text-4xl">{title}</h1>
        </div>

        <div className="rounded-3xl border border-white/15 bg-card p-7 text-card-foreground shadow-2xl sm:p-9">
          {children}
        </div>
      </motion.section>
    </main>
  )
}
