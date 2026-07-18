// WSUM (Weighted Sum Model) scoring + top-3 role assignment — 100% rule-based, no LLM.
import type { Candidate } from './retrieval'
import type { SearchFilters } from './slot-schema'

type Criterion = 'price' | 'power' | 'capacity'

const CRITERIA_WEIGHTS: Record<NonNullable<SearchFilters['priority']> | 'default', Record<Criterion, number>> = {
  tiet_kiem_dien: { power: 0.6, price: 0.25, capacity: 0.15 },
  dung_tich_lon: { capacity: 0.6, price: 0.25, power: 0.15 },
  gia_tot: { price: 0.6, power: 0.2, capacity: 0.2 },
  default: { price: 0.4, power: 0.3, capacity: 0.3 },
}

function criterionValue(c: Candidate, criterion: Criterion): number | null {
  if (criterion === 'price') return c.priceCurrent
  if (criterion === 'power') return c.facts.powerKwhYear
  return c.facts.capacityLiters
}

// price/power: lower is better. capacity: higher is better.
const LOWER_IS_BETTER: Record<Criterion, boolean> = { price: true, power: true, capacity: false }

function normalize(candidates: Candidate[], criterion: Criterion): Map<string, number> {
  const values = candidates
    .map((c) => ({ id: c.id, v: criterionValue(c, criterion) }))
    .filter((x): x is { id: string; v: number } => x.v !== null)

  const scores = new Map<string, number>()
  if (values.length === 0) {
    for (const c of candidates) scores.set(c.id, 50) // no data at all — neutral
    return scores
  }

  const min = Math.min(...values.map((x) => x.v))
  const max = Math.max(...values.map((x) => x.v))
  const withData = new Set(values.map((x) => x.id))

  for (const c of candidates) {
    if (!withData.has(c.id)) {
      scores.set(c.id, 50) // missing this field on this product — neutral, don't fabricate
      continue
    }
    const v = criterionValue(c, criterion) as number
    if (max === min) {
      scores.set(c.id, 100)
      continue
    }
    const t = (v - min) / (max - min)
    scores.set(c.id, Math.round((LOWER_IS_BETTER[criterion] ? 1 - t : t) * 100))
  }
  return scores
}

export interface ScoredCandidate {
  candidate: Candidate
  total: number
  parts: Record<Criterion, number>
}

export function scoreAll(candidates: Candidate[], priority: SearchFilters['priority']): ScoredCandidate[] {
  const weights = CRITERIA_WEIGHTS[priority ?? 'default']
  const priceScores = normalize(candidates, 'price')
  const powerScores = normalize(candidates, 'power')
  const capacityScores = normalize(candidates, 'capacity')

  return candidates.map((c) => {
    const parts: Record<Criterion, number> = {
      price: priceScores.get(c.id) ?? 50,
      power: powerScores.get(c.id) ?? 50,
      capacity: capacityScores.get(c.id) ?? 50,
    }
    const total =
      parts.price * weights.price + parts.power * weights.power + parts.capacity * weights.capacity
    return { candidate: c, total: Math.round(total), parts }
  })
}

export type TopRole = 'best_fit' | 'cheapest_above_threshold' | 'model_choice'

export interface TopPick {
  role: TopRole
  scored: ScoredCandidate
  // which criterion this pick's label should talk about, when relevant
  highlightCriterion: Criterion | null
}

const CHEAPEST_THRESHOLD_RATIO = 0.6 // % of the best score

// Returns up to 3 picks — fewer if the candidate pool is too small (never forces a duplicate
// product into two roles).
export function pickTop3(scored: ScoredCandidate[]): TopPick[] {
  if (scored.length === 0) return []

  const byScoreDesc = [...scored].sort((a, b) => b.total - a.total)
  const picks: TopPick[] = []
  const used = new Set<string>()

  const best = byScoreDesc[0]
  picks.push({ role: 'best_fit', scored: best, highlightCriterion: null })
  used.add(best.candidate.id)

  const maxScore = best.total
  const threshold = maxScore * CHEAPEST_THRESHOLD_RATIO
  const cheapestCandidate = byScoreDesc
    .filter((s) => !used.has(s.candidate.id) && s.total >= threshold && s.candidate.priceCurrent !== null)
    .sort((a, b) => (a.candidate.priceCurrent as number) - (b.candidate.priceCurrent as number))[0]

  if (cheapestCandidate) {
    picks.push({ role: 'cheapest_above_threshold', scored: cheapestCandidate, highlightCriterion: 'price' })
    used.add(cheapestCandidate.candidate.id)
  }

  const remaining = byScoreDesc.filter((s) => !used.has(s.candidate.id))
  if (remaining.length > 0) {
    // Criterion not already used as a label (avoids repeating "price" from the cheapest slot).
    const usedCriteria = new Set<Criterion>(picks.map((p) => p.highlightCriterion).filter(Boolean) as Criterion[])
    const candidateCriteria = (['power', 'capacity', 'price'] as Criterion[]).filter((c) => !usedCriteria.has(c))

    let bestCriterion: Criterion = candidateCriteria[0] ?? 'power'
    let bestRange = -1
    for (const criterion of candidateCriteria) {
      const values = remaining.map((s) => criterionValue(s.candidate, criterion)).filter((v): v is number => v !== null)
      if (values.length < 2) continue
      const range = Math.max(...values) - Math.min(...values)
      if (range > bestRange) {
        bestRange = range
        bestCriterion = criterion
      }
    }

    const modelChoice = [...remaining].sort((a, b) => {
      const av = criterionValue(a.candidate, bestCriterion)
      const bv = criterionValue(b.candidate, bestCriterion)
      if (av === null) return 1
      if (bv === null) return -1
      return LOWER_IS_BETTER[bestCriterion] ? av - bv : bv - av
    })[0]

    if (modelChoice) {
      picks.push({ role: 'model_choice', scored: modelChoice, highlightCriterion: bestCriterion })
    }
  }

  return picks
}
