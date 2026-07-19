// Plain functions rather than a Mastra Workflow DSL, but the same separation holds: every
// decision step below is rule-based (no LLM); only filter extraction and final rendering call it.
import { z } from 'zod'

import { createAdvisorAgent } from '../agents/advisor'
import { parseTuLanhFacts } from './facts'
import { detectRepair } from './repair'
import { retrieveCandidates } from './retrieval'
import {
  getState,
  mergeFilters,
  saveState,
  type ConversationState,
} from './session-state'
import { resolveNextSlot, type SearchFilters } from './slot-schema'
import { findUpsellCandidate } from './upsell'
import { pickTop3, scoreAll, type TopRole } from './wsum'

const agent = createAdvisorAgent()

const extractionModel = {
  id: 'openai/gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY,
} as const

const ExtractionSchema = z.object({
  budgetMin: z
    .number()
    .nullable()
    .describe('Ngân sách tối thiểu VND, null nếu không đề cập'),
  budgetMax: z
    .number()
    .nullable()
    .describe('Ngân sách tối đa VND, null nếu không đề cập'),
  householdSize: z
    .number()
    .nullable()
    .describe('Số người trong nhà, null nếu không đề cập'),
  priority: z
    .enum(['tiet_kiem_dien', 'dung_tich_lon', 'gia_tot'])
    .nullable()
    .describe('Ưu tiên khách vừa nêu, null nếu không đề cập'),
  isRejection: z
    .boolean()
    .describe(
      'true nếu khách đang chê/từ chối sản phẩm vừa gợi ý ở lượt trước',
    ),
})

export interface AdvisorProductView {
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
  facts: ReturnType<typeof parseTuLanhFacts>
}

// Structured side of the response — computed BEFORE any text is streamed, so the client can
// render panel phải (product cards) immediately without waiting for the LLM to finish talking.
export interface AdvisorMeta {
  products: AdvisorProductView[]
  needMoreInfo: boolean
  repairMode: boolean
  widenedBudget: boolean
  done: boolean
}

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

async function extractFilters(
  userMessage: string,
  historyText: string,
  current: SearchFilters,
) {
  const prompt = `Lịch sử hội thoại gần đây:
${historyText || '(chưa có)'}

Thông tin đã biết trước lượt này: ${JSON.stringify(current)}

Câu khách vừa nhắn: "${userMessage}"

Chỉ trích thông tin MỚI xuất hiện trong câu vừa nhắn — nếu câu không đề cập field nào thì để null cho field đó,
KHÔNG lặp lại giá trị đã biết trước đó. Quy đổi tiền: "20 triệu" = 20000000. Nếu khách nói "dưới X" thì chỉ set
budgetMax=X, budgetMin=null. Nếu nói "trên X" thì chỉ set budgetMin=X. Nếu nói "khoảng X" thì set
budgetMin=round(X*0.85), budgetMax=round(X*1.15).`

  const result = await agent.generate(prompt, {
    // Use the smaller model for the entire extraction request. Setting
    // structuredOutput.model would add a second structuring-model request.
    model: extractionModel,
    structuredOutput: { schema: ExtractionSchema },
  })
  return result.object
}

function describeFilters(f: SearchFilters): string {
  const parts: string[] = []
  if (f.budgetMin !== null || f.budgetMax !== null) {
    if (f.budgetMin !== null && f.budgetMax !== null)
      parts.push(
        `ngân sách ${formatVnd(f.budgetMin)}–${formatVnd(f.budgetMax)}`,
      )
    else if (f.budgetMax !== null)
      parts.push(`ngân sách dưới ${formatVnd(f.budgetMax)}`)
    else if (f.budgetMin !== null)
      parts.push(`ngân sách trên ${formatVnd(f.budgetMin)}`)
  }
  if (f.householdSize !== null) parts.push(`gia đình ${f.householdSize} người`)
  if (f.priority !== null) {
    const label = {
      tiet_kiem_dien: 'ưu tiên tiết kiệm điện',
      dung_tich_lon: 'ưu tiên dung tích lớn',
      gia_tot: 'ưu tiên giá tốt',
    }[f.priority]
    parts.push(label)
  }
  return parts.length > 0 ? parts.join(', ') : '(chưa có tiêu chí nào)'
}

const ROLE_LABEL: Record<TopRole, string> = {
  best_fit: 'phù hợp nhất',
  cheapest_above_threshold: 'rẻ nhất trong nhóm đạt yêu cầu',
  model_choice: 'nổi bật ở 1 tiêu chí riêng',
}

function buildRepairPrompt(
  userMessage: string,
  filters: SearchFilters,
): string {
  return `Khách vừa nói: "${userMessage}" — đây là tín hiệu khách đang sửa lại điều bot hiểu sai.

Hiện tại bot đang hiểu yêu cầu là: ${describeFilters(filters)}.

Hãy trả lời theo ĐÚNG 2 bước, không hơn không kém:
1. Nhắc lại ngắn gọn đang hiểu gì (1 câu).
2. Đưa 2-3 lựa chọn CỤ THỂ để khách chọn nhanh (không hỏi mở lại, không xin lỗi nhiều lần).`
}

interface RenderContext {
  userMessage: string
  filters: SearchFilters
  nextSlotHint: string | null
  products: AdvisorProductView[]
  needMoreInfo: boolean
  widenedBudget: boolean
  upsellText: string | null
}

function buildRenderPrompt(ctx: RenderContext): string {
  if (ctx.needMoreInfo) {
    return `Không tìm thấy tủ lạnh nào khớp yêu cầu: ${describeFilters(ctx.filters)}.
Hãy báo khách biết nhẹ nhàng và hỏi khách có muốn nới ngân sách hoặc điều chỉnh tiêu chí không — 1 câu hỏi duy nhất,
không xin lỗi dài dòng.`
  }

  const productLines = ctx.products
    .map((p, i) => {
      const factsLine = [
        p.facts.capacityLiters !== null
          ? `dung tích ${p.facts.capacityLiters} lít`
          : null,
        p.facts.powerKwhYear !== null
          ? `điện năng ${p.facts.powerKwhYear} kWh/năm`
          : null,
        p.facts.isInverter ? 'có Inverter' : null,
      ]
        .filter(Boolean)
        .join(', ')
      const priceLine =
        p.priceCurrent !== null
          ? formatVnd(p.priceCurrent)
          : 'chưa có dữ liệu giá'
      return `${i + 1}. "${p.title}" (${p.brand ?? 'không rõ hãng'}) — vai trò: ${ROLE_LABEL[p.role]} — giá: ${priceLine} — ${factsLine || 'chưa có thông số chi tiết'}`
    })
    .join('\n')

  const parts = [
    ctx.nextSlotHint
      ? `Đồng thời (KHÔNG dừng ở đây), hỏi thêm đúng 1 câu theo hướng dẫn sau: ${ctx.nextSlotHint}`
      : 'Đã đủ tiêu chí, không cần hỏi thêm gì nữa.',
    ctx.widenedBudget
      ? 'LƯU Ý: không có sản phẩm nào khớp đúng ngân sách khách nêu — đây là các lựa chọn GẦN nhất, phải nói rõ điều này, không được giả vờ là khớp đúng.'
      : null,
    ctx.upsellText
      ? `Sau khi giới thiệu xong top sản phẩm, thêm 1 câu mồi thêm (upsell) DUY NHẤT dựa đúng dữ liệu sau, không thêm gì khác: ${ctx.upsellText}`
      : null,
  ].filter(Boolean)

  return `Khách vừa nhắn: "${ctx.userMessage}"
Yêu cầu hiện tại: ${describeFilters(ctx.filters)}

Dữ liệu sản phẩm THẬT (CHỈ được dùng đúng số liệu dưới đây, không thêm/đoán số liệu nào khác):
${productLines}

Viết 1 đoạn ngắn giới thiệu các sản phẩm trên bằng ngôn ngữ phổ thông (không liệt kê thô), nêu rõ ưu điểm/trade-off
theo đúng vai trò từng sản phẩm. ${parts.join(' ')}`
}

export interface PreparedAdvisorReply {
  meta: AdvisorMeta
  prompt: string
  stateToSave: ConversationState | null
}

// Computes the grounded response before opening the LLM stream. The workflow owns streaming and
// commits `stateToSave` only once the stream completes, so a failed/disconnected reply does not
// advance the conversation state.
export async function prepareAdvisorReply(
  conversationId: string,
  userMessage: string,
  historyText = '',
): Promise<PreparedAdvisorReply> {
  const state = await getState(conversationId)

  if (detectRepair(userMessage)) {
    return {
      meta: {
        products: [],
        needMoreInfo: false,
        repairMode: true,
        widenedBudget: false,
        done: resolveNextSlot(state.filters) === null,
      },
      prompt: buildRepairPrompt(userMessage, state.filters),
      stateToSave: null,
    }
  }

  // 1 combined structured-output call: extract this turn's delta filters + rejection check.
  const extraction = await extractFilters(
    userMessage,
    historyText,
    state.filters,
  )

  let excludedIds = state.excludedIds
  if (extraction.isRejection && state.lastShownIds.length > 0) {
    excludedIds = Array.from(new Set([...excludedIds, ...state.lastShownIds]))
  }
  const filters = mergeFilters(state.filters, extraction)
  const nextSlot = resolveNextSlot(filters)
  const { candidates: retrieved, widenedBudget } = await retrieveCandidates(
    filters,
    excludedIds,
  )

  // Soft filter, not a hard one in retrieveCandidates — only ~40% of products have this field,
  // so we exclude a candidate only when we KNOW it's too small, never when data is missing.
  // Falls back to the unfiltered set if this would empty the pool entirely.
  const candidates =
    filters.householdSize !== null
      ? (() => {
          const fit = retrieved.filter(
            (c) =>
              c.facts.householdSize === null ||
              c.facts.householdSize >= (filters.householdSize as number),
          )
          return fit.length > 0 ? fit : retrieved
        })()
      : retrieved

  const needMoreInfo = candidates.length === 0
  const scored = scoreAll(candidates, filters.priority)
  const picks = pickTop3(scored)

  const products: AdvisorProductView[] = picks.map((p) => ({
    id: p.scored.candidate.id,
    title: p.scored.candidate.title,
    brand: p.scored.candidate.brand,
    priceCurrent: p.scored.candidate.priceCurrent,
    priceOriginal: p.scored.candidate.priceOriginal,
    productUrl: p.scored.candidate.productUrl,
    thumbnailUrl: p.scored.candidate.thumbnailUrl,
    promotions: p.scored.candidate.promotions,
    role: p.role,
    score: p.scored.total,
    facts: p.scored.candidate.facts,
  }))

  // Only consider upselling once all slots are filled and we haven't upsold yet this conversation.
  let upsellText: string | null = null
  let hasUpsold = state.hasUpsold
  const bestFit = picks.find((p) => p.role === 'best_fit')
  if (nextSlot === null && !state.hasUpsold && bestFit) {
    const usedIds = new Set(products.map((p) => p.id))
    const upsell = findUpsellCandidate(
      scored,
      bestFit.scored.candidate,
      usedIds,
    )
    if (upsell) {
      upsellText = `"${upsell.candidate.title}" giá cao hơn ${formatVnd(upsell.priceDiff)} — ${upsell.diffFacts.join('; ')}.`
      hasUpsold = true
    }
  }

  const stateToSave = {
    filters,
    excludedIds,
    lastShownIds: products.map((p) => p.id),
    hasUpsold,
  }

  return {
    meta: {
      products,
      needMoreInfo,
      repairMode: false,
      widenedBudget,
      done: nextSlot === null,
    },
    prompt: buildRenderPrompt({
      userMessage,
      filters,
      nextSlotHint: nextSlot?.questionHint ?? null,
      products,
      needMoreInfo,
      widenedBudget,
      upsellText,
    }),
    stateToSave,
  }
}

export async function streamAdvisorReply(
  prompt: string,
  abortSignal?: AbortSignal,
) {
  return agent.stream(prompt, { abortSignal })
}

export async function commitAdvisorReply(
  conversationId: string,
  state: ConversationState | null,
): Promise<void> {
  if (state) await saveState(conversationId, state)
}
