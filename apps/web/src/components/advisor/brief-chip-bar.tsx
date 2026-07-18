import { useEffect, useState } from 'react'
import { Check, Pencil, Sparkles } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Separator } from '~/components/ui/separator'
import { cn } from '~/lib/utils'
import type { NeedField } from '~/lib/mock-data'
import { DynamicIcon } from './icon'

export function BriefChipBar({
  fields,
  highlightId,
  onEdit,
}: {
  fields: NeedField[]
  highlightId?: string | null
  onEdit: (fieldId: string, value: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">
        <span className="grid size-8 place-items-center rounded-full bg-brand-primary-soft">
          <Sparkles className="size-4" aria-hidden />
        </span>
        AI hiểu bạn cần
      </div>
      <Separator orientation="vertical" className="hidden h-6 xl:block" />
      <ul
        className="flex flex-wrap items-center gap-2"
        aria-label="Tóm tắt nhu cầu có thể chỉnh sửa"
      >
        {fields
          .filter((field) => field.id !== 'priority')
          .map((field) => (
            <li key={field.id}>
              <EditableChip
                field={field}
                highlighted={field.id === highlightId}
                onSave={onEdit}
              />
            </li>
          ))}
      </ul>
    </div>
  )
}

function EditableChip({
  field,
  highlighted,
  onSave,
}: {
  field: NeedField
  highlighted: boolean
  onSave: (id: string, value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(field.value)
  useEffect(() => setValue(field.value), [field.value])

  function save() {
    const next = value.trim()
    if (!next) return
    onSave(field.id, next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={`Sửa ${field.label}: ${field.value}`}
          className={cn(
            'group h-auto min-h-8 rounded-full px-3 py-1.5 text-xs shadow-xs',
            !field.confirmed &&
              'border-dashed border-primary/50 bg-brand-primary-soft/60',
            highlighted &&
              'border-primary bg-brand-primary-soft text-primary ring-2 ring-primary/20 animate-in zoom-in-95',
          )}
        >
          <DynamicIcon name={field.icon} className="size-3.5 text-primary" />
          <span className="text-muted-foreground">{field.label}:</span>
          <span className="max-w-48 truncate font-semibold">{field.value}</span>
          <Pencil
            className="size-3 text-muted-foreground group-hover:text-primary"
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div>
          <p className="text-sm font-semibold">
            Chỉnh {field.label.toLowerCase()}
          </p>
          <p className="text-xs text-muted-foreground">
            Thay đổi sẽ cập nhật hồ sơ tư vấn ngay.
          </p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
          className="flex gap-2"
        >
          <Input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label={field.label}
          />
          <Button type="submit" size="icon" aria-label="Lưu thay đổi">
            <Check />
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
