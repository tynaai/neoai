import { motion } from 'motion/react'
import { ArrowRight, BadgeCheck, Leaf, Sparkles, Wind } from 'lucide-react'

import { Button } from '~/components/ui/button'
import type { StoreProduct } from '~/lib/products-api'
import { formatVnd } from '~/lib/utils'

const highlights = [
  { icon: Leaf, label: 'Inverter tiết kiệm điện' },
  { icon: BadgeCheck, label: 'Chính hãng, bảo hành đến 5 năm' },
  { icon: Wind, label: 'Làm lạnh nhanh, vận hành êm' },
]

export function Hero({
  onOpenChat,
  featuredProduct,
}: {
  onOpenChat: () => void
  featuredProduct?: StoreProduct | null
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary to-[#0062D8] text-brand-primary-foreground">
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-white/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start gap-4"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Sparkles className="size-3.5" /> Bộ sưu tập Máy lạnh 2026
          </span>
          <h1 className="text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-5xl">
            Mát chuẩn ý, tiết kiệm điện
            <br /> chọn máy lạnh cùng AI
          </h1>
          <p className="max-w-lg text-sm text-white/85 sm:text-base">
            Hàng chính hãng từ Panasonic, LG, Daikin, Gree, Toshiba... Để AI của Điện Máy Xanh tư vấn công suất
            phù hợp diện tích phòng, ngân sách và nhu cầu tiết kiệm điện của bạn.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={onOpenChat}
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
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {highlights.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-xs font-medium text-white/85 sm:text-sm">
                <Icon className="size-4" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="absolute inset-6 rounded-full bg-white/15 blur-2xl" aria-hidden />
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-sm">
            {featuredProduct?.thumbnailUrl ? (
              <img
                src={featuredProduct.thumbnailUrl}
                alt={featuredProduct.title}
                className="size-full rounded-2xl object-cover"
              />
            ) : (
              <div className="size-full animate-pulse rounded-2xl bg-white/10" />
            )}
          </div>
          {featuredProduct && (
            <div className="absolute -bottom-4 left-1/2 w-[85%] -translate-x-1/2 rounded-xl border bg-card px-4 py-2.5 text-card-foreground shadow-lg">
              <p className="line-clamp-1 text-xs font-semibold">{featuredProduct.title}</p>
              <p className="text-sm font-bold text-primary">
                {featuredProduct.priceCurrent !== null ? formatVnd(featuredProduct.priceCurrent) : 'Liên hệ'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
