import type { ReactNode } from 'react'
import { Link } from 'react-router'

type AuthShellProps = {
  children: ReactNode
  title: string
}

export function AuthShell({ children, title }: AuthShellProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#F7F9FC] px-5 py-8 text-[#111827] sm:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(#D8DEE8_1px,transparent_1px),linear-gradient(90deg,#D8DEE8_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
      <div className="absolute inset-x-0 top-0 h-1 bg-[#0B63CE]" />
      <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#EAF3FF] opacity-55 blur-3xl" />
      <div className="absolute -right-20 top-16 h-40 w-40 rounded-[32px] border border-[#FFD400]/40 bg-[#FFF8CC]/80 rotate-12" />
      <div className="absolute -left-24 bottom-16 h-48 w-48 rounded-[40px] border border-[#0B63CE]/15 bg-white/70 -rotate-12" />

      <Link
        aria-label="Điện máy XANH home"
        className="group absolute left-5 top-6 z-10 inline-flex items-center gap-2 rounded-full border border-[#D8DEE8] bg-white/90 px-3 py-2 text-sm font-bold text-[#111827] shadow-[0_10px_28px_rgba(17,24,39,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0B63CE]/30 sm:left-8"
        to="/"
      >
        <span className="grid size-7 place-items-center rounded-full bg-[#FFD400] text-xs font-black text-[#111827] shadow-[0_0_0_3px_rgba(255,212,0,0.24)]">
          ĐM
        </span>
        <span>Điện máy</span>
        <span className="text-[#0B63CE]">XANH</span>
      </Link>

      <section className="relative w-full max-w-[500px] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B63CE]">
            Truy cập bảo mật
          </p>
          <h1 className="mt-3 text-[2.125rem] font-bold leading-tight tracking-normal text-[#111827]">
            {title}
          </h1>
        </div>

        <div className="rounded-[24px] border border-[#D8DEE8] bg-white/90 p-1.5 shadow-[0_28px_80px_rgba(17,24,39,0.14)] backdrop-blur-xl">
          <div className="rounded-[18px] border border-white bg-white px-7 py-8 sm:px-10 sm:py-10">
            {children}
          </div>
        </div>
      </section>
    </main>
  )
}
