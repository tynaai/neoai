// Plain paginated catalog listing — no LLM, no scoring, just SQL. Backs the storefront grid,
// separate from the advisor's retrieval+scoring pipeline in ../advisor/retrieval.ts.
import { and, asc, count, eq, ilike, sql } from 'drizzle-orm'

import { db } from '../../db/client'
import { products } from '../../db/schema'

export const MAY_LANH_CATEGORY_CODE = '2002'

export interface ProductListItem {
  id: string
  title: string
  brand: string | null
  priceCurrent: number | null
  priceOriginal: number | null
  productUrl: string | null
  thumbnailUrl: string | null
  promotions: string[]
}

export interface ProductListResult {
  items: ProductListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ListProductsParams {
  categoryCode: string
  page?: number
  pageSize?: number
  brand?: string | null
  search?: string | null
}

const DEFAULT_PAGE_SIZE = 24
const MAX_PAGE_SIZE = 60

export async function listProducts({
  categoryCode,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  brand = null,
  search = null,
}: ListProductsParams): Promise<ProductListResult> {
  const safePage = Math.max(1, Math.trunc(page) || 1)
  const safePageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(pageSize) || DEFAULT_PAGE_SIZE))

  const conditions = [eq(products.categoryCode, categoryCode)]
  if (brand) conditions.push(eq(products.brand, brand))
  if (search) conditions.push(ilike(products.title, `%${search}%`))
  const where = and(...conditions)

  const [{ value: total }] = await db.select({ value: count() }).from(products).where(where)

  const rows = await db
    .select({
      id: products.id,
      title: products.title,
      brand: products.brand,
      priceCurrent: products.priceCurrent,
      priceOriginal: products.priceOriginal,
      productUrl: products.productUrl,
      thumbnailUrl: products.thumbnailUrl,
      promotions: products.promotions,
    })
    .from(products)
    .where(where)
    // Priced items first — most products in this dataset have no price_current (DMX shows
    // "liên hệ báo giá" for them), so plain alphabetical order buried real prices deep in the
    // list. Title/id stay as the stable order within each group.
    .orderBy(sql`${products.priceCurrent} IS NULL`, asc(products.title), asc(products.id))
    .limit(safePageSize)
    .offset((safePage - 1) * safePageSize)

  return {
    items: rows.map((row) => ({ ...row, promotions: row.promotions ?? [] })),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  }
}

export async function listProductBrands(categoryCode: string): Promise<string[]> {
  const rows = await db
    .selectDistinct({ brand: products.brand })
    .from(products)
    .where(eq(products.categoryCode, categoryCode))

  return rows
    .map((row) => row.brand)
    .filter((brand): brand is string => Boolean(brand))
    .sort((a, b) => a.localeCompare(b, 'vi'))
}
