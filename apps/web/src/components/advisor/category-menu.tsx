import { Check, LayoutGrid } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { STORE_CATEGORIES } from '~/lib/products-api'

export function CategoryMenu({
  category,
  onCategoryChange,
}: {
  category: string
  onCategoryChange: (code: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <LayoutGrid className="size-3.5" aria-hidden />
          Tiện ích
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {STORE_CATEGORIES.map((c) => (
          <DropdownMenuItem key={c.code} onSelect={() => onCategoryChange(c.code)}>
            <span className="flex-1">{c.label}</span>
            {c.code === category && <Check className="size-3.5 text-primary" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
