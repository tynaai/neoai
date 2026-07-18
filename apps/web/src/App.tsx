import { useState } from 'react'
import { useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { MessageCircleMore } from 'lucide-react'

import { AdvisorHeader } from '~/components/advisor/advisor-header'
import { RealChatPanel } from '~/components/advisor/real-chat-panel'
import { RealResultsPanel } from '~/components/advisor/real-results-panel'
import type { AdvisorResponse } from '~/lib/advisor-api'

function App() {
  const [response, setResponse] = useState<AdvisorResponse | null>(null)
import { BriefChipBar } from '~/components/advisor/brief-chip-bar'
import { AiChatPanel } from '~/components/advisor/ai-chat-panel'
import { ResultsPanel } from '~/components/advisor/results-panel'
import { ProductDetail } from '~/components/advisor/product-detail'
import { StockCheck } from '~/components/advisor/stock-check'
import { CompareView } from '~/components/advisor/compare-view'
import {
  ForgotPasswordPage,
  LoginPage,
  ProtectedRoute,
  RegisterPage,
} from './auth'

type View = 'advisor' | 'compare'

function AdvisorApp() {
  const [view, setView] = useState<View>('advisor')
  const [needFields, setNeedFields] = useState<NeedField[]>(initialNeedProfile)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [resultsRevealed, setResultsRevealed] = useState(false)
  const [weights, setWeights] = useState<Weights>(defaultWeights)
  const [order, setOrder] = useState<string[]>(products.map((p) => p.id))
  const [explain, setExplain] = useState<string | null>(null)
  const [activePriority, setActivePriority] = useState<PriorityKey | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [stockId, setStockId] = useState<string | null>(null)

  const ranked = useMemo(() => rankProducts(weights).ranked, [weights])
  const syncedNeedFields = useMemo(() => {
    const priorityText = priorityOrder(weights)
      .map((key) => priorityLabels[key])
      .join(' > ')
    return needFields.map((field) =>
      field.id === 'priority' ? { ...field, value: priorityText } : field,
    )
  }, [needFields, weights])

  function handleConfirmNeed(fieldId: string, value: string) {
    setNeedFields((prev) =>
      prev.map((f) =>
        f.id === fieldId ? { ...f, value, confirmed: true } : f,
      ),
    )
    setHighlightId(fieldId)
    window.setTimeout(() => setHighlightId(null), 1800)
  }

  function handlePriority(key: PriorityKey) {
    const next = boostPriority(weights, key)
    const result = rankProducts(next, order)
    setWeights(next)
    setOrder(result.ranked.map((s) => s.product.id))
    setActivePriority(key)
    if (result.explain) {
      setExplain(result.explain)
      window.setTimeout(() => setExplain(null), 5000)
    }
  }

  function handleEditNeed(fieldId: string, value: string) {
    handleConfirmNeed(fieldId, value)
  }

  const detailProduct = detailId
    ? (products.find((p) => p.id === detailId) ?? null)
    : null
  const hasKids =
    syncedNeedFields.find((field) => field.id === 'kids')?.value === 'Có'
  const stockProduct = stockId
    ? (products.find((p) => p.id === stockId) ?? null)
    : null

  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <AdvisorHeader />
      <main className="flex-1">
        <div className="grid w-full gap-0 lg:grid-cols-[440px_minmax(0,1fr)] xl:grid-cols-[500px_minmax(0,1fr)] 2xl:grid-cols-[540px_minmax(0,1fr)]">
          <div className="h-[560px] border-b bg-card lg:sticky lg:top-16 lg:h-[calc(100svh-64px)] lg:self-start lg:border-r lg:border-b-0">
            <RealChatPanel onResponse={setResponse} />
          </div>
          <div className="flex min-w-0 flex-col gap-5 px-3 py-4 sm:px-5 lg:px-6 lg:py-6">
            <RealResultsPanel response={response} />
          </div>
        </div>
      </main>
    </div>
  )
}

function StockCheckOverlay({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pr-8">
          <DialogTitle>Kiểm tra tồn kho</DialogTitle>
          <DialogDescription>
            {product?.name ?? 'Sản phẩm đã chọn'}
          </DialogDescription>
        </DialogHeader>
        {product ? <StockCheck product={product} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function ResultsPlaceholder() {
  return (
    <Card className="min-h-[420px] flex-1 justify-center border-dashed bg-card/70 text-center shadow-none">
      <CardHeader className="items-center">
        <span className="grid size-14 place-items-center rounded-full bg-brand-primary-soft text-primary">
          <MessageCircleMore className="size-6" aria-hidden />
        </span>
        <CardTitle className="text-base">
          Đang hoàn thiện hồ sơ nhu cầu
        </CardTitle>
        <CardDescription className="max-w-md">
          Trả lời vài câu hỏi trong khung tư vấn để nhận top 3 sản phẩm phù hợp
          nhất.
        </CardDescription>
      </CardHeader>
      <CardContent className="mx-auto grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="space-y-3 rounded-xl border bg-background p-3 text-left"
          >
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<AdvisorApp />} path="/" />
        </Route>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
        <Route element={<ForgotPasswordPage />} path="/forgot-password" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
