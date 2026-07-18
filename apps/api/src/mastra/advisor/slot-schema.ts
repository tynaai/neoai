// SPIN slot schema — resolveNextSlot() scans deterministically, the LLM never picks its own slot.
// Only tủ lạnh has real data right now.

export interface SearchFilters {
  budgetMin: number | null // VND
  budgetMax: number | null // VND
  householdSize: number | null
  priority: 'tiet_kiem_dien' | 'dung_tich_lon' | 'gia_tot' | null
}

export const emptyFilters: SearchFilters = {
  budgetMin: null,
  budgetMax: null,
  householdSize: null,
  priority: null,
}

export type SlotName = 'budget' | 'household_size' | 'priority'

interface SlotDef {
  slot: SlotName
  priority: number // higher = asked first
  questionHint: string // few-shot tone guide for the render step, NOT the literal question
  isFilled: (f: SearchFilters) => boolean
}

// budget is always highest priority (universal). No buyer_type slot — tủ lạnh isn't a
// gift-purchase category.
export const tuLanhSlotSchema: SlotDef[] = [
  {
    slot: 'budget',
    priority: 100,
    questionHint:
      'Hỏi ngân sách dự kiến, giọng gần gũi như nhân viên sale, không hỏi khô khan. VD: "Dạ nhà mình dự tính chi khoảng bao nhiêu cho tủ lạnh ạ?"',
    isFilled: (f) => f.budgetMin !== null || f.budgetMax !== null,
  },
  {
    slot: 'household_size',
    priority: 90,
    questionHint:
      'KHÔNG hỏi thẳng số lít/dung tích — dịch sang hoàn cảnh sử dụng thật: hỏi số người trong nhà. VD: "Nhà mình khoảng mấy người ăn chung ạ?"',
    isFilled: (f) => f.householdSize !== null,
  },
  {
    slot: 'priority',
    priority: 80,
    questionHint:
      'Need-payoff — để khách TỰ nói ra ưu tiên, không đoán hộ. VD: "Giữa tiết kiệm điện, dung tích rộng rãi, hay giá tốt — mình ưu tiên điều gì nhất ạ?"',
    isFilled: (f) => f.priority !== null,
  },
]

// Deterministic, no LLM call. Returns the highest-priority unfilled slot, or null when done.
export function resolveNextSlot(filters: SearchFilters): SlotDef | null {
  const sorted = [...tuLanhSlotSchema].sort((a, b) => b.priority - a.priority)
  return sorted.find((slot) => !slot.isFilled(filters)) ?? null
}
