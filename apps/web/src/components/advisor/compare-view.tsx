import { useState } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { cn, formatVnd } from '~/lib/utils'
import {
  compareConclusion,
  compareRows,
  isUnavailable,
  products,
  rankRoles,
  type CompareValue,
} from '~/lib/mock-data'
import { DynamicIcon } from './icon'

const levelStyles: Record<CompareValue['level'], string> = {
  best: 'bg-brand-success-soft text-brand-success',
  good: 'bg-brand-primary-soft text-primary',
  ok: 'bg-muted text-muted-foreground',
}

const levelDots: Record<CompareValue['level'], number> = {
  best: 3,
  good: 2,
  ok: 1,
}

export function CompareView({
  onBack,
  hasKids,
}: {
  onBack: () => void
  hasKids: boolean
}) {
  // Default ON: the whole point of comparison is surfacing where they differ.
  const [onlyDiff, setOnlyDiff] = useState(true)
  const sourceRows = compareRows.map((row) => {
    if (row.dimension === 'Phù hợp với nhu cầu') {
      return {
        ...row,
        hint: hasKids
          ? 'Mức khớp với phòng ngủ 18 m², có nắng, có trẻ nhỏ'
          : 'Mức khớp với phòng ngủ 18 m², có nắng, không có trẻ nhỏ',
        delta: hasKids
          ? 'Panasonic và Daikin khớp tốt hơn nhờ chạy êm cho phòng có trẻ nhỏ.'
          : 'Panasonic và Daikin khớp tốt hơn nhờ chạy êm và tiết kiệm điện.',
      }
    }
    if (row.dimension === 'Độ êm khi chạy') {
      return {
        ...row,
        hint: hasKids
          ? 'Quan trọng với phòng ngủ có trẻ nhỏ'
          : 'Quan trọng khi dùng ban đêm trong phòng ngủ',
      }
    }
    return row
  })
  const rows = onlyDiff ? sourceRows.filter((r) => r.differs) : sourceRows
  const comparedProducts = products.slice(0, 3)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft />
          Quay lại tư vấn
        </Button>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground select-none">
          <Checkbox
            checked={onlyDiff}
            onCheckedChange={(checked) => setOnlyDiff(checked === true)}
            aria-label="Chỉ hiện điểm khác nhau"
          />
          Chỉ hiện điểm khác nhau
        </label>
      </div>

      <Card className="mb-5 gap-1 border-primary/15 py-4 shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl">So sánh 3 mẫu phù hợp nhất</CardTitle>
          <CardDescription>
            So sánh theo trải nghiệm thực tế, không chỉ liệt kê thông số.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="gap-0 overflow-hidden py-0 shadow-sm">
        <CardContent className="p-0">
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="sticky left-0 z-10 w-44 min-w-44 bg-muted px-3 py-3 text-muted-foreground">
                  Tiêu chí
                </TableHead>
                {comparedProducts.map((p) => {
                  const role = rankRoles[p.id]
                  return (
                    <TableHead
                      key={p.id}
                      className="min-w-52 px-3 py-3 align-top"
                    >
                      <div className="flex flex-col gap-1">
                        {role ? (
                          <Badge variant="brand" className="w-fit">
                            <DynamicIcon name={role.icon} className="size-3" />
                            {role.badge}
                          </Badge>
                        ) : null}
                        <span className="font-semibold">{p.shortName}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {p.capacity} · {p.type}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {isUnavailable(p.price)
                            ? 'Chưa có giá'
                            : formatVnd(p.price.value)}
                        </span>
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.dimension}>
                  <TableCell className="sticky left-0 z-10 whitespace-normal bg-background px-3 py-3 align-top">
                    <span className="font-medium">{row.dimension}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {row.hint}
                    </span>
                    {row.delta ? (
                      <span className="mt-1.5 flex items-start gap-1 text-xs text-primary">
                        <Sparkles
                          className="mt-0.5 size-3 shrink-0 text-primary"
                          aria-hidden
                        />
                        {row.delta}
                      </span>
                    ) : null}
                  </TableCell>
                  {comparedProducts.map((p) => {
                    const cell = row.values.find((v) => v.productId === p.id)
                    if (!cell)
                      return <TableCell key={p.id} className="px-3 py-3" />
                    const isWinner = cell.level === 'best'
                    return (
                      <TableCell
                        key={p.id}
                        className={cn(
                          'whitespace-normal px-3 py-3 align-top',
                          isWinner && 'bg-brand-success-soft/40',
                        )}
                      >
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
                            levelStyles[cell.level],
                          )}
                        >
                          <span className="flex gap-0.5" aria-hidden>
                            {[1, 2, 3].map((d) => (
                              <span
                                key={d}
                                className={cn(
                                  'size-1.5 rounded-full',
                                  d <= levelDots[cell.level]
                                    ? 'bg-current'
                                    : 'bg-current/25',
                                )}
                              />
                            ))}
                          </span>
                          {cell.text}
                        </span>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI conclusion */}
      <Alert className="mt-5 border-primary/20 bg-brand-primary-soft p-4">
        <Sparkles className="text-primary" aria-hidden />
        <AlertTitle className="text-primary">AI kết luận</AlertTitle>
        <AlertDescription className="text-foreground">
          {hasKids
            ? compareConclusion.text.replace(
                'cho phòng ngủ,',
                'cho phòng ngủ có trẻ nhỏ,',
              )
            : compareConclusion.text}
        </AlertDescription>
      </Alert>
    </div>
  )
}
