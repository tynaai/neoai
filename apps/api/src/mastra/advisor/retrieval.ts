// SQL filters on price (the only normalized numeric column on `products`); other numeric facts
// are parsed from `specs` jsonb in JS instead (see facts.ts).
import { and, eq, gte, isNotNull, lte, notInArray } from 'drizzle-orm'

import { db } from '../../db/client'
import { products } from '../../db/schema'
import { parseTuLanhFacts, type TuLanhFacts } from './facts'
import type { SearchFilters } from './slot-schema'

export interface Candidate {
  id: string
  title: string
  brand: string | null
  priceCurrent: number | null
  priceOriginal: number | null
  productUrl: string | null
  thumbnailUrl: string | null
  promotions: string[]
  facts: TuLanhFacts
}

export interface RetrievalResult {
  candidates: Candidate[]
  // true when the budget filter produced 0 rows and we dropped it to show near-fits instead.
  widenedBudget: boolean
}

const TU_LANH_CATEGORY_CODE = '38'

type ProductCandidateRow = Pick<
  typeof products.$inferSelect,
  | 'id'
  | 'title'
  | 'brand'
  | 'priceCurrent'
  | 'priceOriginal'
  | 'productUrl'
  | 'thumbnailUrl'
  | 'promotions'
  | 'specs'
>

const candidateFields = {
  id: products.id,
  title: products.title,
  brand: products.brand,
  priceCurrent: products.priceCurrent,
  priceOriginal: products.priceOriginal,
  productUrl: products.productUrl,
  thumbnailUrl: products.thumbnailUrl,
  promotions: products.promotions,
  specs: products.specs,
}

function toCandidate(row: ProductCandidateRow): Candidate {
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    priceCurrent: row.priceCurrent,
    priceOriginal: row.priceOriginal,
    productUrl: row.productUrl,
    thumbnailUrl: row.thumbnailUrl,
    promotions: row.promotions ?? [],
    facts: parseTuLanhFacts(row.specs),
  }
}

async function queryWithBudget(filters: SearchFilters, excludedIds: string[]) {
  const conditions = [eq(products.categoryCode, TU_LANH_CATEGORY_CODE)]

  const hasBudget = filters.budgetMin !== null || filters.budgetMax !== null
  if (hasBudget) {
    // Only match against products with a real price (~15% of the dataset) — never guess.
    conditions.push(isNotNull(products.priceCurrent))
    if (filters.budgetMin !== null)
      conditions.push(gte(products.priceCurrent, filters.budgetMin))
    if (filters.budgetMax !== null)
      conditions.push(lte(products.priceCurrent, filters.budgetMax))
  }
  if (excludedIds.length > 0)
    conditions.push(notInArray(products.id, excludedIds))

  return db
    .select(candidateFields)
    .from(products)
    .where(and(...conditions))
}

export async function retrieveCandidates(
  filters: SearchFilters,
  excludedIds: string[],
): Promise<RetrievalResult> {
  const rows = await queryWithBudget(filters, excludedIds)
  if (
    rows.length > 0 ||
    (filters.budgetMin === null && filters.budgetMax === null)
  ) {
    return { candidates: rows.map(toCandidate), widenedBudget: false }
  }

  // Empty result — retry without the price constraint so we show near-fits instead of nothing.
  const widened = await db
    .select(candidateFields)
    .from(products)
    .where(
      and(
        eq(products.categoryCode, TU_LANH_CATEGORY_CODE),
        isNotNull(products.priceCurrent),
        excludedIds.length > 0
          ? notInArray(products.id, excludedIds)
          : undefined,
      ),
    )
  return { candidates: widened.map(toCandidate), widenedBudget: true }
}
