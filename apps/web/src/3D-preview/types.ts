export type ProductCategory = 'TV' | 'Máy lạnh' | 'Tủ lạnh' | 'Máy giặt' | 'Điện thoại' | 'Laptop'

export type FitStatus = 'good' | 'warning' | 'unknown'

export type RoomProfile = {
  roomArea: string
  placementWidth: string
  viewingDistance: string
  unsure: boolean
}

export type PreviewProduct = {
  id: string
  name: string
  category: ProductCategory
  image: string
  specs: string[]
  price: number
  rating: number
  buyLabel: string
  supportsRoomPreview: boolean
  dimensions: {
    widthCm: number
    recommendedAreaMin?: number
    recommendedAreaMax?: number
    recommendedViewingDistanceMin?: number
    recommendedViewingDistanceMax?: number
  }
  modelUrl?: string
}
