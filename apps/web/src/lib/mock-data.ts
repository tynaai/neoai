import { enrichedProducts, type EnrichedProduct } from './enriched-mock-data'

// Realistic local mock data for the Điện Máy Xanh AI Product Advisor.
// Air-conditioner (máy lạnh) category, modeled to match the reference storyboard.
//
// Data-honesty note: fields sourced from the (mock) DMX catalog are marked with a
// `source` + `updatedAt`. Fields that a real system might NOT have are typed as
// `Unavailable` so the UI can explicitly say "chưa có dữ liệu" instead of fabricating.

export type DataSource =
  | 'Catalog DMX'
  | 'Giá & Khuyến mãi DMX'
  | 'Tồn kho DMX Inventory'
  | 'Đánh giá khách hàng'

export type Sourced<T> = {
  value: T
  source: DataSource
  updatedAt: string // e.g. "hôm nay 08:30"
}

// Explicitly-unavailable value: the honest alternative to making something up.
export type Unavailable = {
  available: false
  reason: string // plain-language why, shown in the UI
}

export function sourced<T>(
  value: T,
  source: DataSource,
  updatedAt = 'hôm nay 08:30',
): Sourced<T> {
  return { value, source, updatedAt }
}

export const UNAVAILABLE = (reason: string): Unavailable => ({
  available: false,
  reason,
})

export function isUnavailable(v: unknown): v is Unavailable {
  return (
    typeof v === 'object' &&
    v !== null &&
    'available' in v &&
    (v as { available: unknown }).available === false
  )
}

// ---------------------------------------------------------------------------
// Need profile — the editable "Hồ sơ nhu cầu của bạn" panel
// ---------------------------------------------------------------------------

export type NeedField = {
  id: string
  label: string
  value: string
  icon: string // lucide icon name resolved in the component
  // true when the AI inferred/asked this vs. the user stating it up front
  confirmed: boolean
}

export const initialNeedProfile: NeedField[] = [
  {
    id: 'room',
    label: 'Loại phòng',
    value: 'Phòng ngủ',
    icon: 'BedDouble',
    confirmed: true,
  },
  {
    id: 'area',
    label: 'Diện tích',
    value: '18 m²',
    icon: 'Ruler',
    confirmed: true,
  },
  {
    id: 'sun',
    label: 'Hướng nắng',
    value: 'Có nắng chiếu',
    icon: 'Sun',
    confirmed: true,
  },
  {
    id: 'kids',
    label: 'Có trẻ nhỏ',
    value: 'Không',
    icon: 'Baby',
    confirmed: false,
  },
  {
    id: 'budget',
    label: 'Ngân sách',
    value: '10 – 11 triệu',
    icon: 'Wallet',
    confirmed: true,
  },
  {
    id: 'priority',
    label: 'Ưu tiên hàng đầu',
    value: 'Êm > Tiết kiệm điện > Làm lạnh nhanh > Giá tốt',
    icon: 'Sparkles',
    confirmed: true,
  },
]

// ---------------------------------------------------------------------------
// Product catalog (air conditioners)
// ---------------------------------------------------------------------------

export type BenefitTile = {
  icon: string // lucide icon name
  label: string
}

export type SpecRow = {
  label: string
  value: string
}

// The priorities the ranking engine weighs. The user can boost any of these,
// which recomputes scores and re-ranks the results live.
export type PriorityKey = 'quiet' | 'energy' | 'cooling' | 'price'

export type Weights = Record<PriorityKey, number>

// Raw, groundable attributes per product. Sub-scores are DERIVED from these in
// scoreProduct() so ranking is transparent, not a hardcoded number.
export type ProductAttrs = {
  noiseDb: number // dàn lạnh, lower = quieter
  cspf: number // higher = more energy efficient
  priceValue: number // VND after promo, lower = cheaper
  coolingScore: number // 0-100, higher = faster/deeper cooling
  coverageM2: number // recommended max room size
}

// Region-aware stock, with an explicit 3rd "unknown" state so the UI can say
// "chưa có dữ liệu" instead of ever fabricating a quantity.
export type StockStatus = 'in' | 'out' | 'unknown'

export type StoreStock = {
  store: string
  distanceKm: number
  status: StockStatus
  qty?: Sourced<number> // present only when status === 'in'
}

export type Product = {
  id: string
  brand: string
  name: string
  shortName: string
  capacity: string // "1.5 HP"
  type: string // "Inverter"
  imageHint: string // emoji/illustration stand-in (no real product images in mock)
  price: Sourced<number> | Unavailable
  originalPrice: Sourced<number> | Unavailable
  discountPercent: Sourced<number> | Unavailable
  // Groundable raw attributes; the match score is computed from these + weights.
  attrs: ProductAttrs
  // Plain-language fit reason and trade-off — NOT a spec dump. The trade-off is
  // a real product limitation tied to THIS user's need, not a price subtraction.
  fitReason: string
  tradeOff: string
  benefits: BenefitTile[]
  // Progressive-disclosure specs (hidden by default in the UI)
  specs: SpecRow[]
  // Region-aware stock across nearby DMX stores (includes an 'unknown' state).
  stockByStore: StoreStock[]
  // Honest data example: warranty is catalog-backed, but live promo end-date is not.
  promoEndsAt: Sourced<string> | Unavailable
  rating: Sourced<number> | Unavailable
  reviewCount: Sourced<number> | Unavailable
}

const workbookUpdatedAt = 'trích từ enriched.xlsx · 20 dòng đầu'

function extractFirstNumber(value: string, fallback: number) {
  const match = value.match(/\d+(?:[.,]\d+)?/)
  return match ? Number(match[0].replace(',', '.')) : fallback
}

function extractCapacity(name: string) {
  return name.match(/\d+(?:\.\d+)? HP/i)?.[0] ?? 'Không công bố'
}

function shortProductName(name: string) {
  return name.replace(/^Máy lạnh(?: âm trần| tủ đứng)?\s+/i, '').slice(0, 42)
}

function energyEfficiency(value: string) {
  const match = value.match(/Hiệu suất năng lượng\s*([\d.]+)/i)
  return match ? Number(match[1]) : 3.5
}

function coolingScore(value: string) {
  if (/powerful|jet cool|fast/i.test(value)) return 90
  if (/turbo/i.test(value)) return 84
  return 72
}

function workbookProduct(row: EnrichedProduct): Product {
  const rankingPrice = row.price ?? row.originalPrice ?? 99_000_000
  const originalPrice = row.originalPrice ?? row.price
  const discount =
    row.price && row.originalPrice && row.originalPrice > row.price
      ? Math.round((1 - row.price / row.originalPrice) * 100)
      : 0
  const noiseDb = extractFirstNumber(row.noise, 50)
  const coverageM2 = Math.max(
    ...Array.from(row.coverage.matchAll(/\d+/g), (m) => Number(m[0])),
    15,
  )
  const features = row.features.split(' | ').filter(Boolean)

  return {
    id: row.id,
    brand: row.brand,
    name: row.name,
    shortName: shortProductName(row.name),
    capacity: extractCapacity(row.name),
    type: /inverter/i.test(`${row.name} ${row.energy}`)
      ? 'Inverter'
      : 'Máy lạnh',
    imageHint: row.image || '❄️',
    price: row.price
      ? sourced(row.price, 'Giá & Khuyến mãi DMX', workbookUpdatedAt)
      : UNAVAILABLE('Workbook chưa có giá bán hiện tại.'),
    originalPrice: originalPrice
      ? sourced(originalPrice, 'Giá & Khuyến mãi DMX', workbookUpdatedAt)
      : UNAVAILABLE('Workbook chưa có giá gốc.'),
    discountPercent: row.price
      ? sourced(discount, 'Giá & Khuyến mãi DMX', workbookUpdatedAt)
      : UNAVAILABLE('Không thể tính giảm giá khi chưa có giá bán.'),
    attrs: {
      noiseDb,
      cspf: energyEfficiency(row.rating),
      priceValue: rankingPrice,
      coolingScore: coolingScore(row.cooling),
      coverageM2,
    },
    fitReason: `${row.cooling || 'Công nghệ làm lạnh tiêu chuẩn'}, phù hợp phạm vi ${row.coverage.toLowerCase()}.`,
    tradeOff: row.price
      ? `Độ ồn công bố: ${row.noise}.`
      : 'Workbook chưa có giá bán hiện tại; cần kiểm tra lại trước khi tư vấn mua.',
    benefits: [
      { icon: 'Snowflake', label: row.cooling || 'Làm lạnh' },
      { icon: 'Leaf', label: row.energy || 'Tiết kiệm điện' },
      {
        icon: 'ShieldCheck',
        label: features[0] || row.compressorWarranty,
      },
    ],
    specs: [
      { label: 'Công suất', value: extractCapacity(row.name) },
      { label: 'Công nghệ làm lạnh', value: row.cooling || 'Không công bố' },
      { label: 'Tiết kiệm điện', value: row.energy || 'Không công bố' },
      { label: 'Độ ồn', value: row.noise || 'Không công bố' },
      { label: 'Phạm vi sử dụng', value: row.coverage },
      { label: 'Bảo hành máy nén', value: row.compressorWarranty },
    ],
    stockByStore: [
      { store: 'DMX Hòa Lạc', distanceKm: 2.4, status: 'unknown' },
      { store: 'DMX Xuân Mai', distanceKm: 8.1, status: 'unknown' },
      { store: 'DMX Sơn Tây', distanceKm: 14.6, status: 'unknown' },
    ],
    promoEndsAt: UNAVAILABLE(
      'Thời hạn khuyến mãi không có trong 20 dòng dữ liệu đã trích.',
    ),
    rating: UNAVAILABLE('Workbook không có điểm đánh giá khách hàng.'),
    reviewCount: UNAVAILABLE('Workbook không có số lượng đánh giá khách hàng.'),
  }
}

// Exactly the first 20 data rows streamed from enriched.xlsx.
export const products: Product[] = enrichedProducts.map(workbookProduct)

// Rank roles shown on the cards
export const rankRoles: Record<string, { badge: string; icon: string }> = {
  '362465': { badge: 'PHÙ HỢP NHẤT', icon: 'Crown' },
  '335837': { badge: 'GIÁ TỐT', icon: 'PiggyBank' },
  '336040': { badge: 'PHÒNG 15–20 M²', icon: 'Snowflake' },
}

// ---------------------------------------------------------------------------
// Scoring engine — ranking is COMPUTED from groundable attrs + current weights,
// not a hardcoded number. This is what makes live re-rank + honest ordering real.
// ---------------------------------------------------------------------------

// Plain-language label for each priority, used in the UI (chips, explanations).
export const priorityLabels: Record<PriorityKey, string> = {
  quiet: 'Êm',
  energy: 'Tiết kiệm điện',
  cooling: 'Làm lạnh nhanh',
  price: 'Giá tốt',
}

// Default weights reproduce the reference order: Panasonic > Daikin > Sharp.
// "quiet" + "energy" lead because the user's stated priority is "êm, tiết kiệm điện".
export const defaultWeights: Weights = {
  quiet: 0.32,
  energy: 0.3,
  cooling: 0.2,
  price: 0.18,
}

// Normalize each attribute to a 0-100 sub-score across the current product set,
// so the score is relative and transparent (best-in-group = 100).
function subScores(
  all: Product[],
): Record<string, Record<PriorityKey, number>> {
  const noises = all.map((p) => p.attrs.noiseDb)
  const cspfs = all.map((p) => p.attrs.cspf)
  const prices = all.map((p) => p.attrs.priceValue)
  const coolings = all.map((p) => p.attrs.coolingScore)

  const minNoise = Math.min(...noises)
  const maxNoise = Math.max(...noises)
  const minCspf = Math.min(...cspfs)
  const maxCspf = Math.max(...cspfs)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const minCool = Math.min(...coolings)
  const maxCool = Math.max(...coolings)

  // Map a value into 0-100; `invert` for "lower is better" (noise, price).
  const norm = (v: number, lo: number, hi: number, invert = false) => {
    if (hi === lo) return 100
    const t = (v - lo) / (hi - lo)
    return Math.round((invert ? 1 - t : t) * 100)
  }

  const out: Record<string, Record<PriorityKey, number>> = {}
  for (const p of all) {
    out[p.id] = {
      quiet: norm(p.attrs.noiseDb, minNoise, maxNoise, true),
      energy: norm(p.attrs.cspf, minCspf, maxCspf),
      cooling: norm(p.attrs.coolingScore, minCool, maxCool),
      price: norm(p.attrs.priceValue, minPrice, maxPrice, true),
    }
  }
  return out
}

export type ScoredProduct = {
  product: Product
  total: number // 0-100 weighted match score
  parts: Record<PriorityKey, number> // sub-scores, for explanation
}

// Rank the products under the given weights. Returns the scored+sorted list and,
// when the order changed vs `previousOrder`, a plain-language explanation line.
export function rankProducts(
  weights: Weights,
  previousOrder?: string[],
): { ranked: ScoredProduct[]; explain: string | null } {
  const parts = subScores(products)
  const scored: ScoredProduct[] = products.map((product) => {
    const p = parts[product.id]
    const total =
      p.quiet * weights.quiet +
      p.energy * weights.energy +
      p.cooling * weights.cooling +
      p.price * weights.price
    return { product, total: Math.round(total), parts: p }
  })
  scored.sort((a, b) => b.total - a.total)

  const newOrder = scored.map((s) => s.product.id)
  // Always return an acknowledgment when a previous order is supplied: if the
  // order changed, explain the movement; if not, confirm the current top still
  // fits best under the new priority. This keeps every priority tap responsive
  // — no chip ever feels dead.
  const explain = previousOrder
    ? buildExplain(previousOrder, newOrder, weights)
    : null
  return { ranked: scored, explain }
}

// The dominant (highest-weight) priority drives the explanation wording.
function dominantPriority(weights: Weights): PriorityKey {
  return (Object.keys(weights) as PriorityKey[]).reduce((a, b) =>
    weights[a] >= weights[b] ? a : b,
  )
}

function buildExplain(
  prev: string[],
  next: string[],
  weights: Weights,
): string {
  const byId = (id: string) =>
    products.find((p) => p.id === id)?.shortName ?? id
  const prio = priorityLabels[dominantPriority(weights)].toLowerCase()

  // Find the product that dropped the most and the one that rose to the top.
  let biggestDrop = { id: '', delta: 0 }
  for (const id of prev) {
    const delta = next.indexOf(id) - prev.indexOf(id)
    if (delta > biggestDrop.delta) biggestDrop = { id, delta }
  }
  const newTop = next[0]
  const topChanged = prev[0] !== newTop

  if (biggestDrop.id) {
    return `${byId(biggestDrop.id)} tụt xuống #${
      next.indexOf(biggestDrop.id) + 1
    } vì bạn vừa ưu tiên ${prio} hơn.`
  }
  if (topChanged) {
    return `${byId(newTop)} lên #1 vì bạn vừa ưu tiên ${prio} hơn.`
  }
  // Order held: acknowledge the tap and reaffirm the current best fit.
  return `${byId(newTop)} vẫn phù hợp nhất kể cả khi ưu tiên ${prio} hơn.`
}

// Boost one priority (used by the refine chips / priority controls). Increases
// the chosen weight and renormalizes so weights always sum to 1. The step is
// large enough that a single tap on "giá tốt" or "làm lạnh nhanh" actually
// reorders the top 3 (not just nudges scores) — the live re-rank must be visible.
export function boostPriority(
  weights: Weights,
  key: PriorityKey,
  amount = 0.4,
): Weights {
  const raised = { ...weights, [key]: weights[key] + amount }
  const sum = raised.quiet + raised.energy + raised.cooling + raised.price
  return {
    quiet: raised.quiet / sum,
    energy: raised.energy / sum,
    cooling: raised.cooling / sum,
    price: raised.price / sum,
  }
}

// Ordered priority list (highest weight first) for the "Đang ưu tiên: …" bar.
export function priorityOrder(weights: Weights): PriorityKey[] {
  return (Object.keys(weights) as PriorityKey[]).sort(
    (a, b) => weights[b] - weights[a],
  )
}

// ---------------------------------------------------------------------------
// Comparison table — plain-language rows, not a raw spec dump
// ---------------------------------------------------------------------------

export type CompareValue = {
  productId: string
  text: string
  // qualitative rating drives the little bar/dot indicator
  level: 'best' | 'good' | 'ok'
}

export type CompareRow = {
  dimension: string
  hint: string // plain-language explanation of why this matters
  values: CompareValue[]
  // is this a row where the products actually differ? (for "chỉ hiện điểm khác nhau")
  differs: boolean
  // plain-language cross-product takeaway ("Chênh ~150k tiền điện/năm") — the
  // human-readable delta that makes the row actionable, not just parallel specs.
  delta?: string
}

export const compareRows: CompareRow[] = [
  {
    dimension: 'Phạm vi sử dụng',
    hint: 'Diện tích phòng được công bố trong workbook',
    differs: true,
    values: products.slice(0, 3).map((product, index) => ({
      productId: product.id,
      text:
        product.specs.find((spec) => spec.label === 'Phạm vi sử dụng')?.value ??
        'Không công bố',
      level: index === 2 ? 'best' : index === 1 ? 'good' : 'ok',
    })),
  },
  {
    dimension: 'Độ ồn công bố',
    hint: 'Số liệu dàn lạnh và dàn nóng từ workbook',
    differs: true,
    values: products.slice(0, 3).map((product, index) => ({
      productId: product.id,
      text:
        product.specs.find((spec) => spec.label === 'Độ ồn')?.value ??
        'Không công bố',
      level: index === 2 ? 'best' : index === 1 ? 'good' : 'ok',
    })),
  },
  {
    dimension: 'Giá hiện tại',
    hint: 'Giá lấy từ dmx_current_price trong enriched.xlsx',
    differs: true,
    values: products.slice(0, 3).map((product, index) => ({
      productId: product.id,
      text: isUnavailable(product.price)
        ? 'Chưa có giá'
        : `${new Intl.NumberFormat('vi-VN').format(product.price.value)}đ`,
      level: index === 1 ? 'best' : index === 2 ? 'good' : 'ok',
    })),
  },
]

// The AI's plain-language conclusion under the comparison table
export const compareConclusion = {
  winnerId: products[0]?.id ?? '',
  text: 'Ba sản phẩm đang được so sánh bằng dữ liệu thực trong 20 dòng đầu của enriched.xlsx. Hãy ưu tiên mẫu có công suất phù hợp diện tích phòng và kiểm tra lại giá nếu nguồn chưa công bố.',
}

// ---------------------------------------------------------------------------
// Scripted AI conversation (golden path)
// ---------------------------------------------------------------------------

export type QuickReply = {
  id: string
  label: string
  // optional need-profile update this reply confirms
  confirms?: { fieldId: string; value: string }
  // optional priority boost this reply applies (drives a live re-rank)
  boosts?: PriorityKey
  // optional special action this reply triggers in the workspace
  action?: 'open-compare'
}

export type ScriptStep =
  | {
      kind: 'ai-message'
      text: string
    }
  | {
      kind: 'ai-question'
      text: string
      quickReplies: QuickReply[]
      allowSkip?: boolean
    }
  | {
      kind: 'ai-summary'
      text: string
      // reveal the results panel after this step
      revealResults: true
    }

// Opening user message (pre-filled to kick off the golden-path demo)
export const openingUserMessage =
  'Em muốn mua máy lạnh dưới 20 triệu cho phòng ngủ 18m², tiết kiệm điện, ít ồn.'

export const conversationScript: ScriptStep[] = [
  {
    kind: 'ai-message',
    text: 'Dạ được ạ! Để gợi ý đúng máy lạnh cho phòng ngủ 18 m² của mình, cho mình hỏi thêm vài ý nhỏ nhé.',
  },
  {
    kind: 'ai-question',
    text: 'Phòng mình có bị nắng chiếu trực tiếp vào buổi chiều không ạ?',
    quickReplies: [
      {
        id: 'sun-yes',
        label: 'Có nắng chiếu',
        confirms: { fieldId: 'sun', value: 'Có nắng chiếu' },
      },
      {
        id: 'sun-no',
        label: 'Không nắng',
        confirms: { fieldId: 'sun', value: 'Ít nắng' },
      },
      { id: 'sun-idk', label: 'Không rõ' },
    ],
    allowSkip: true,
  },
  {
    kind: 'ai-question',
    text: 'Trong nhà có em bé hoặc trẻ nhỏ hay ngủ trong phòng này không ạ? Điều này ảnh hưởng tới độ êm mình nên ưu tiên.',
    quickReplies: [
      {
        id: 'kids-yes',
        label: 'Có trẻ nhỏ',
        confirms: { fieldId: 'kids', value: 'Có' },
      },
      {
        id: 'kids-no',
        label: 'Không có',
        confirms: { fieldId: 'kids', value: 'Không' },
      },
    ],
    allowSkip: true,
  },
  {
    kind: 'ai-question',
    text: 'Máy sẽ dùng chủ yếu vào ban đêm hay cả ngày ạ?',
    quickReplies: [
      { id: 'time-night', label: 'Chủ yếu ban đêm' },
      { id: 'time-allday', label: 'Cả ngày' },
      { id: 'time-any', label: 'Không quan trọng' },
    ],
    allowSkip: true,
  },
  {
    // Reflective understanding: show the AI reasoned, not just recorded.
    kind: 'ai-question',
    text: 'Vậy mình hiểu là: độ êm ban đêm và tiết kiệm điện là hai ưu tiên chính — đúng ý bạn chứ ạ?',
    quickReplies: [
      { id: 'reflect-yes', label: 'Đúng rồi' },
      {
        id: 'reflect-cooling',
        label: 'Ưu tiên làm lạnh nhanh hơn',
        boosts: 'cooling',
      },
    ],
    allowSkip: true,
  },
  {
    kind: 'ai-summary',
    revealResults: true,
    // Implicit-need capture: the AI volunteers a factor the user never stated.
    text: 'Mình đã đủ thông tin để chọn 3 mẫu phù hợp nhất.',
  },
  {
    // Proactive compare offer — replaces per-card compare checkboxes.
    kind: 'ai-question',
    text: 'Bạn muốn mình so sánh nhanh cả 3 mẫu này theo trải nghiệm thực tế không?',
    quickReplies: [
      { id: 'cmp-yes', label: 'So sánh cả 3 mẫu', action: 'open-compare' },
      { id: 'cmp-no', label: 'Để mình xem thêm đã' },
    ],
    allowSkip: false,
  },
]

// Priority controls shown with the results. Each one boosts a real weight and
// triggers a live re-rank + explanation — the single place to refine results.
export type RefinementChip = {
  id: string
  label: string
  boosts: PriorityKey
}

export const refinementChips: RefinementChip[] = [
  { id: 'prio-quiet', label: 'Ưu tiên chạy êm hơn', boosts: 'quiet' },
  { id: 'prio-energy', label: 'Ưu tiên tiết kiệm điện hơn', boosts: 'energy' },
  {
    id: 'prio-cooling',
    label: 'Ưu tiên làm lạnh nhanh hơn',
    boosts: 'cooling',
  },
  { id: 'prio-price', label: 'Ưu tiên giá tốt hơn', boosts: 'price' },
]

// Global data-honesty disclaimer shown in the footer
export const dataHonestyNote =
  'AI chỉ dùng dữ liệu có thật từ hệ thống Điện Máy Xanh. Không bịa giá, khuyến mãi hay tồn kho. Thông tin nào chưa có, AI sẽ nói rõ là chưa có.'

export const aiFallibilityNote =
  'AI có thể mắc sai sót. Vui lòng kiểm tra lại các thông tin quan trọng trước khi quyết định.'

// Location context shown in the header (matches the reference)
export const regionContext = 'Khu vực: Hòa Lạc, Thạch Thất, Hà Nội'
