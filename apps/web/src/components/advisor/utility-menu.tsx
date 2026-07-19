import { useEffect, useMemo, useRef, useState } from 'react'
import { AirVent, Check, ChevronRight, LayoutGrid, Refrigerator, Search, Sparkles } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { cn } from '~/lib/utils'
import { STORE_CATEGORIES } from '~/lib/products-api'

interface UtilityEntry {
  id: string
  label: string
  description: string
  keywords: string
  icon: typeof Sparkles
  iconBg: string
  iconColor: string
  active?: boolean
  onSelect: () => void
}

export function UtilityMenu({
  category,
  onCategoryChange,
  onOpenChat,
}: {
  category: string
  onCategoryChange: (code: string) => void
  onOpenChat?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setQuery('')
  }

  const neoAiEntry: UtilityEntry = {
    id: 'neoai',
    label: 'NeoAI',
    description: 'Trợ lý AI tư vấn máy lạnh, tủ lạnh theo nhu cầu của bạn',
    keywords: 'neoai tro ly ai tu van chat',
    icon: Sparkles,
    iconBg: 'bg-gradient-to-br from-brand-primary/15 to-brand-accent/25',
    iconColor: 'text-primary',
    onSelect: () => {
      handleOpenChange(false)
      onOpenChat?.()
    },
  }

  const categoryEntries: UtilityEntry[] = STORE_CATEGORIES.map((c) => {
    const isAirCon = c.code === '2002'
    return {
      id: c.code,
      label: c.label,
      description: isAirCon ? 'Máy lạnh Inverter chính hãng, đủ công suất' : 'Tủ lạnh nhiều dung tích, tiết kiệm điện',
      keywords: c.label,
      icon: isAirCon ? AirVent : Refrigerator,
      iconBg: isAirCon ? 'bg-sky-500/10' : 'bg-emerald-500/10',
      iconColor: isAirCon ? 'text-sky-600 dark:text-sky-400' : 'text-emerald-600 dark:text-emerald-400',
      active: c.code === category,
      onSelect: () => {
        onCategoryChange(c.code)
        handleOpenChange(false)
      },
    }
  })

  const allEntries = useMemo(() => [neoAiEntry, ...categoryEntries], [category])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allEntries
    return allEntries.filter((entry) => entry.keywords.toLowerCase().includes(q))
  }, [allEntries, query])

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <LayoutGrid className="size-3.5" aria-hidden />
        Tiện ích
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogHeader className="sr-only">
          <DialogTitle>Tiện ích</DialogTitle>
          <DialogDescription>Tìm kiếm danh mục hoặc mở trợ lý NeoAI</DialogDescription>
        </DialogHeader>
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-black/80"
          className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-3xl border border-border/50 p-0 sm:max-w-2xl"
        >
          <div className="border-b p-4">
            <div className="relative flex items-center gap-3 rounded-xl border border-transparent bg-muted/60 px-4 py-3 transition-shadow focus-within:border-primary/30 focus-within:shadow-[0_0_0_3px_var(--brand-primary-soft)]">
              <Search className="size-4.5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filtered.length > 0) filtered[0].onSelect()
                }}
                placeholder="Tìm danh mục, tiện ích..."
                className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="ml-auto shrink-0 rounded bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                Enter
              </kbd>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {query ? (
              <div className="space-y-1 px-2 py-2">
                {filtered.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                      Không tìm thấy kết quả
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">Thử tìm với từ khóa khác.</p>
                  </div>
                ) : (
                  filtered.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={entry.onSelect}
                      className="group flex w-full items-center gap-4 rounded-2xl border border-transparent bg-muted/40 p-4 text-left transition-all hover:border-border hover:bg-muted"
                    >
                      <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', entry.iconBg, entry.iconColor)}>
                        <entry.icon className="size-5" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-sm font-bold text-foreground">{entry.label}</h3>
                          {entry.active && <Check className="size-4 shrink-0 text-primary" aria-hidden />}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{entry.description}</p>
                      </div>
                      <ChevronRight
                        className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                        aria-hidden
                      />
                    </button>
                  ))
                )}
              </div>
            ) : (
              <>
                <div className="mb-6 p-2">
                  <button
                    type="button"
                    onClick={neoAiEntry.onSelect}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-transparent bg-muted/40 p-4 text-left transition-all hover:border-border hover:bg-muted"
                  >
                    <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105', neoAiEntry.iconBg, neoAiEntry.iconColor)}>
                      <Sparkles className="size-6" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-foreground">NeoAI</h3>
                        <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Mở ngay</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{neoAiEntry.description}</p>
                    </div>
                  </button>
                </div>

                <div className="mb-2 px-4">
                  <h4 className="mb-4 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">Danh mục</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryEntries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={entry.onSelect}
                        className={cn(
                          'group flex items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-border hover:bg-muted/60',
                          entry.active ? 'border-primary/30 bg-primary/10' : 'border-transparent bg-muted/40',
                        )}
                      >
                        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', entry.iconBg, entry.iconColor)}>
                          <entry.icon className="size-5" aria-hidden />
                        </div>
                        <span className={cn('flex-1 text-xs font-bold', entry.active ? 'text-primary' : 'text-foreground')}>
                          {entry.label}
                        </span>
                        {entry.active && <Check className="size-4 shrink-0 text-primary" aria-hidden />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t bg-muted/40 p-4">
            <div className="flex items-center gap-2">
              <div className="rounded bg-primary p-1 text-primary-foreground">
                <Sparkles className="size-3" aria-hidden />
              </div>
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground">Điện Máy Xanh • NeoAI</span>
            </div>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="text-[10px] font-black tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Đóng
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
