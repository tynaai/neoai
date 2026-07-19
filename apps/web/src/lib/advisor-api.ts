export const ADVISOR_API_BASE =
  import.meta.env.VITE_ADVISOR_API_URL ?? 'http://localhost:4112'

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

export const ROLE_BADGE: Record<TopRole, { label: string; icon: string }> = {
  best_fit: { label: 'Phù hợp nhất', icon: 'Crown' },
  cheapest_above_threshold: { label: 'Rẻ nhất đạt yêu cầu', icon: 'PiggyBank' },
  model_choice: { label: 'Nổi bật riêng', icon: 'Sparkles' },
}
