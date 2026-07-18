import { useMemo, useState } from 'react'
import { Box, Sparkles } from 'lucide-react'
import type { PreviewProduct } from './types'
import { demoProducts } from './mock-products'
import { ProductCard } from './ProductCard'
import { ProductPreviewModal } from './ProductPreviewModal'

export function Product3DPreviewPage() {
  const [activeProduct, setActiveProduct] = useState<PreviewProduct | null>(null)

  const previewCount = useMemo(
    () => demoProducts.filter((product) => product.supportsRoomPreview).length,
    [],
  )

  return (
    <main className="min-h-svh bg-[#F7F9FC] text-[#111827]">
      <section className="border-b border-[#D8DEE8] bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FFF8CC] px-4 py-2 text-sm font-bold text-[#1F2937]">
            <Sparkles className="size-4 text-[#B45309]" />
            Demo 3D preview bằng model-viewer.dev
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-[-0.025em] text-[#111827] sm:text-4xl">
                Thử sản phẩm trong không gian của bạn trước khi mua
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#4B5563]">
                AI tạo sẵn 10 sản phẩm demo. Các sản phẩm phù hợp không gian như TV, máy lạnh, tủ lạnh và máy giặt có thể mở modal 3D, xoay, zoom và dùng AR nếu thiết bị hỗ trợ.
              </p>
            </div>
            <div className="rounded-[20px] border border-[#D8DEE8] bg-[#EAF3FF] p-4 text-sm text-[#0B63CE]">
              <div className="flex items-center gap-2 font-bold">
                <Box className="size-4" />
                {previewCount} sản phẩm hỗ trợ “Thử trong phòng tôi”
              </div>
              <p className="mt-2 leading-6 text-[#4B5563]">
                `model-viewer` chỉ được tải khi người dùng bấm thử 3D để giảm tài nguyên tải ban đầu.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {demoProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPreview={setActiveProduct}
            />
          ))}
        </div>
      </section>

      <ProductPreviewModal
        open={Boolean(activeProduct)}
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
      />
    </main>
  )
}
