const API_BASE = import.meta.env.VITE_ADVISOR_API_URL ?? 'http://localhost:4111'

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
}

export async function fetchProducts(params: FetchProductsParams = {}): Promise<ProductListResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.brand) query.set('brand', params.brand)
  if (params.search) query.set('search', params.search)

  const res = await fetch(`${API_BASE}/api/products?${query.toString()}`)
  if (!res.ok) throw new Error(`Products API lỗi ${res.status}`)
  return res.json()
}

export async function fetchProductBrands(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/products/brands`)
  if (!res.ok) throw new Error(`Products API lỗi ${res.status}`)
  const data = (await res.json()) as { brands: string[] }
  return data.brands
}
