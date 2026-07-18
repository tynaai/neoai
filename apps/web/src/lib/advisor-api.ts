import { readNdjsonLines } from './ndjson-stream'

const API_BASE = import.meta.env.VITE_ADVISOR_API_URL ?? 'http://localhost:4112'

export interface AdvisorFacts {
  capacityLiters: number | null
  householdSize: number | null
  powerKwhYear: number | null
  isInverter: boolean
}

export type TopRole = 'best_fit' | 'cheapest_above_threshold' | 'model_choice'

export interface AdvisorProduct {
  id: string
  title: string
  brand: string | null
  priceCurrent: number | null
  priceOriginal: number | null
  productUrl: string | null
  thumbnailUrl: string | null
  promotions: string[]
  role: TopRole
  score: number
  facts: AdvisorFacts
}

// Arrives as the first NDJSON line, before any text, so the product panel can render immediately.
export interface AdvisorResponse {
  products: AdvisorProduct[]
  needMoreInfo: boolean
  repairMode: boolean
  widenedBudget: boolean
  done: boolean
}

export interface AdvisorStreamCallbacks {
  onMeta: (meta: AdvisorResponse) => void
  onTextDelta: (delta: string) => void
  onDone?: () => void
}

// Reads the NDJSON stream: {"type":"meta",...} first, then {"type":"text-delta","delta":"..."}
// repeated, then {"type":"done"}.
export async function sendAdvisorMessage(
  conversationId: string,
  message: string,
  history: string,
  callbacks: AdvisorStreamCallbacks,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/advisor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, message, history }),
  })
  if (!res.ok) {
    throw new Error(`Advisor API lỗi ${res.status}`)
  }

  await readNdjsonLines(res, (parsed) => {
    if (parsed.type === 'meta') {
      const { type: _type, ...meta } = parsed
      callbacks.onMeta(meta as unknown as AdvisorResponse)
    } else if (parsed.type === 'text-delta') {
      callbacks.onTextDelta(parsed.delta as string)
    } else if (parsed.type === 'error') {
      throw new Error((parsed.message as string) ?? 'Advisor stream lỗi')
    }
  })
  callbacks.onDone?.()
}

export const ROLE_BADGE: Record<TopRole, { label: string; icon: string }> = {
  best_fit: { label: 'Phù hợp nhất', icon: 'Crown' },
  cheapest_above_threshold: { label: 'Rẻ nhất đạt yêu cầu', icon: 'PiggyBank' },
  model_choice: { label: 'Nổi bật riêng', icon: 'Sparkles' },
}
