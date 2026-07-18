import { readNdjsonLines } from './ndjson-stream'
import type { StoreProduct } from './products-api'

const API_BASE = import.meta.env.VITE_ADVISOR_API_URL ?? 'http://localhost:4111'

export interface CompareStreamCallbacks {
  onMeta?: (products: StoreProduct[]) => void
  onTextDelta: (delta: string) => void
  onDone?: () => void
}

// Single-shot "ask/compare about these specific product ids" — no conversation history, no
// slot-filling; the backend just fetches these ids and answers in one LLM call.
export async function sendCompareMessage(
  productIds: string[],
  message: string,
  callbacks: CompareStreamCallbacks,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/products/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productIds, message }),
  })
  if (!res.ok) {
    throw new Error(`Compare API lỗi ${res.status}`)
  }

  await readNdjsonLines(res, (parsed) => {
    if (parsed.type === 'meta') {
      callbacks.onMeta?.(parsed.products as StoreProduct[])
    } else if (parsed.type === 'text-delta') {
      callbacks.onTextDelta(parsed.delta as string)
    } else if (parsed.type === 'error') {
      throw new Error((parsed.message as string) ?? 'Compare stream lỗi')
    }
  })
  callbacks.onDone?.()
}
