import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, MessageCircleMore, Sparkles } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import type { AdvisorResponse } from '~/lib/advisor-api'
import { RealProductCard } from './real-product-card'

export function RealResultsPanel({ response }: { response: AdvisorResponse | null }) {
  if (!response || (response.products.length === 0 && !response.needMoreInfo)) {
    return <ResultsPlaceholder />
  }

  return (
    <div className="@container flex flex-col gap-4">
      {response.widenedBudget && (
        <Alert className="border-brand-warning/30 bg-brand-warning-soft text-brand-warning">
          <AlertTriangle />
          <AlertTitle>Không có sản phẩm khớp đúng ngân sách</AlertTitle>
          <AlertDescription className="text-brand-warning/90">
            Đây là các lựa chọn gần nhất trong catalog thật, không phải khớp tuyệt đối.
          </AlertDescription>
        </Alert>
      )}

      {response.needMoreInfo ? (
        <Card className="border-dashed bg-card/70 text-center shadow-none">
          <CardHeader className="items-center">
            <span className="grid size-12 place-items-center rounded-full bg-brand-warning-soft text-brand-warning">
              <AlertTriangle className="size-5" aria-hidden />
            </span>
            <CardTitle className="text-base">Chưa tìm thấy sản phẩm phù hợp</CardTitle>
            <CardDescription>Thử nới ngân sách hoặc điều chỉnh tiêu chí ở khung chat bên trái nhé.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <motion.div layout className="grid items-start gap-4 @sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {response.products.map((product) => (
              <RealProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!response.done && response.products.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" /> Bot vẫn đang hỏi thêm để tinh chỉnh gợi ý — kết quả trên có thể đổi khi bạn trả lời tiếp.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        AI chỉ dùng dữ liệu thật từ catalog Điện Máy Xanh (1692 tủ lạnh). Không bịa giá, khuyến mãi hay thông số.
      </p>
    </div>
  )
}

function ResultsPlaceholder() {
  return (
    <Card className="@container min-h-[420px] flex-1 justify-center border-dashed bg-card/70 text-center shadow-none">
      <CardHeader className="items-center">
        <span className="grid size-14 place-items-center rounded-full bg-brand-primary-soft text-primary">
          <MessageCircleMore className="size-6" aria-hidden />
        </span>
        <CardTitle className="text-base">Bắt đầu trò chuyện để nhận gợi ý</CardTitle>
        <CardDescription className="max-w-md">
          Nói cho mình biết nhu cầu của bạn (vd: "tủ lạnh gia đình 4 người, dưới 10 triệu") để nhận top sản phẩm phù hợp.
        </CardDescription>
      </CardHeader>
      <CardContent className="mx-auto grid w-full max-w-2xl gap-3 @sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="space-y-3 rounded-xl border bg-background p-3 text-left">
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
