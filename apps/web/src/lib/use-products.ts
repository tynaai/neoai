import { useEffect, useState } from 'react'
import { fetchProductBrands, fetchProducts, type FetchProductsParams, type ProductListResponse } from './products-api'

export function useProducts(params: FetchProductsParams) {
  const [data, setData] = useState<ProductListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchProducts(params)
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.pageSize, params.brand, params.search])

  return { data, loading, error }
}

export function useProductBrands() {
  const [brands, setBrands] = useState<string[]>([])

  useEffect(() => {
    fetchProductBrands()
      .then(setBrands)
      .catch(() => setBrands([]))
  }, [])

  return brands
}
