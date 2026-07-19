const API_BASE = import.meta.env.VITE_ADVISOR_API_URL ?? 'http://localhost:4111'

export interface StoreCategory {
  code: string
  label: string
}

// Only the 2 categories actually seeded with real data right now (see docs/note.md) — the
// backend accepts any category code, but the header switcher should only offer working ones.
export const STORE_CATEGORIES: StoreCategory[] = [
  { code: '2002', label: 'Máy lạnh' },
  { code: '38', label: 'Tủ lạnh' },
]

export const DEFAULT_CATEGORY_CODE = STORE_CATEGORIES[0].code

export interface StoreProduct {
  id: string
  title: string
  brand: string | null
  priceCurrent: number | null
  priceOriginal: number | null
  productUrl: string | null
  thumbnailUrl: string | null
  promotions: string[]
}

export interface ProductListResponse {
  items: StoreProduct[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface FetchProductsParams {
  page?: number
  pageSize?: number
  brand?: string | null
  search?: string | null
  category?: string | null
}

export async function fetchProducts(params: FetchProductsParams = {}): Promise<ProductListResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.brand) query.set('brand', params.brand)
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category', params.category)

  const res = await fetch(`${API_BASE}/api/products?${query.toString()}`)
  if (!res.ok) throw new Error(`Products API lỗi ${res.status}`)
  return res.json()
}

export async function fetchProductBrands(category?: string | null): Promise<string[]> {
  const query = new URLSearchParams()
  if (category) query.set('category', category)

  const res = await fetch(`${API_BASE}/api/products/brands?${query.toString()}`)
  if (!res.ok) throw new Error(`Products API lỗi ${res.status}`)
  const data = (await res.json()) as { brands: string[] }
  return data.brands
}
