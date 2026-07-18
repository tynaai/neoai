import type { Candidate } from './retrieval'
import type { ScoredCandidate } from './wsum'

const MAX_UPSELL_PRICE_RATIO = 1.1 // max +10% vs. the recommended product

export interface UpsellCandidate {
  candidate: Candidate
  priceDiff: number
  diffFacts: string[]
}

// Returns null when there's no valid candidate OR no measurable reason to upsell — never
// upsell just for the sake of it.
export function findUpsellCandidate(
  allScored: ScoredCandidate[],
  bestFit: Candidate,
  usedIds: Set<string>,
): UpsellCandidate | null {
  if (bestFit.priceCurrent === null) return null
  const maxPrice = bestFit.priceCurrent * MAX_UPSELL_PRICE_RATIO

  const candidate = allScored
    .map((s) => s.candidate)
    .filter(
      (c) =>
        !usedIds.has(c.id) &&
        c.priceCurrent !== null &&
        c.priceCurrent > (bestFit.priceCurrent as number) &&
        (c.priceCurrent as number) <= maxPrice,
    )
    .sort((a, b) => (a.priceCurrent as number) - (b.priceCurrent as number))[0]

  if (!candidate) return null

  const diffFacts: string[] = []
  if (
    candidate.facts.capacityLiters !== null &&
    bestFit.facts.capacityLiters !== null &&
    candidate.facts.capacityLiters > bestFit.facts.capacityLiters
  ) {
    diffFacts.push(`Dung tích ${candidate.facts.capacityLiters} lít thay vì ${bestFit.facts.capacityLiters} lít`)
  }
  if (candidate.facts.isInverter && !bestFit.facts.isInverter) {
    diffFacts.push('Có công nghệ Inverter tiết kiệm điện hơn')
  }
  if (
    candidate.facts.powerKwhYear !== null &&
    bestFit.facts.powerKwhYear !== null &&
    candidate.facts.powerKwhYear < bestFit.facts.powerKwhYear
  ) {
    diffFacts.push(`Tiêu thụ điện ${candidate.facts.powerKwhYear} kWh/năm, thấp hơn`)
  }

  if (diffFacts.length === 0) return null

  return {
    candidate,
    priceDiff: (candidate.priceCurrent as number) - (bestFit.priceCurrent as number),
    diffFacts,
  }
}
