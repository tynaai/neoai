// Single-shot "compare/ask about these specific product ids" flow — no retrieval, no scoring,
// just fetch-by-id + 1 LLM call. Separate from advisor/pipeline.ts, which does slot-filling +
// SQL retrieval + weighted-sum ranking for an open-ended "find me a product" conversation.
import { inArray } from 'drizzle-orm'

import { db } from '../../db/client'
import { products } from '../../db/schema'
import { createCompareAgent } from '../agents/compare'

const MAX_COMPARE_PRODUCTS = 4

export interface CompareProduct {
  id: string
  title: string
  brand: string | null
  priceCurrent: number | null
  priceOriginal: number | null
  productUrl: string | null
  thumbnailUrl: string | null
  promotions: string[]
}

function formatVnd(n: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(n)}đ`
}

export async function fetchProductsByIds(ids: string[]): Promise<CompareProduct[]> {
  const uniqueIds = Array.from(new Set(ids)).slice(0, MAX_COMPARE_PRODUCTS)
  if (uniqueIds.length === 0) return []

  const rows = await db.select().from(products).where(inArray(products.id, uniqueIds))
  const byId = new Map(rows.map((row) => [row.id, row]))

  // Preserve the caller's order (roughly "order tags were added") rather than DB return order.
  return uniqueIds
    .map((id) => byId.get(id))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .map((row) => ({
      id: row.id,
      title: row.title,
      brand: row.brand,
      priceCurrent: row.priceCurrent,
      priceOriginal: row.priceOriginal,
      productUrl: row.productUrl,
      thumbnailUrl: row.thumbnailUrl,
      promotions: row.promotions ?? [],
    }))
}

function describeProduct(product: CompareProduct, index: number): string {
  const price = product.priceCurrent !== null ? formatVnd(product.priceCurrent) : 'chưa có dữ liệu giá'
  const discount =
    product.priceOriginal !== null && product.priceCurrent !== null && product.priceOriginal > product.priceCurrent
      ? ` (giảm từ ${formatVnd(product.priceOriginal)})`
      : ''
  const promos = product.promotions.length > 0 ? ` — khuyến mãi: ${product.promotions.slice(0, 3).join('; ')}` : ''
  return `${index + 1}. "${product.title}" (${product.brand ?? 'không rõ hãng'}) — giá: ${price}${discount}${promos}`
}

export async function streamCompareReply(
  compareProducts: CompareProduct[],
  userMessage: string,
): Promise<AsyncIterable<string>> {
  const agent = createCompareAgent()
  const productLines = compareProducts.map(describeProduct).join('\n')

  const prompt = `Khách đang chọn các sản phẩm sau để hỏi/so sánh — dữ liệu THẬT, chỉ được dùng đúng số liệu này,
không thêm/đoán số liệu nào khác:
${productLines}

Câu hỏi/yêu cầu của khách: "${userMessage || 'So sánh giúp mình các sản phẩm này, cái nào đáng mua hơn?'}"

Trả lời theo đúng vai trò nhân viên sale đã hướng dẫn.`

  const stream = await agent.stream(prompt)
  return stream.textStream
}
