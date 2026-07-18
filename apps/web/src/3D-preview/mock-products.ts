import type { PreviewProduct, ProductCategory } from './types'

export const roomPreviewCategories = new Set<ProductCategory>([
  'TV',
  'Máy lạnh',
  'Tủ lạnh',
  'Máy giặt',
])

const placeholderModels: Record<string, string> = {
  TV: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  'Máy lạnh': 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
  'Tủ lạnh': 'https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb',
  'Máy giặt': 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
}

export const getModelUrl = (product: PreviewProduct) =>
  product.modelUrl ?? placeholderModels[product.category] ?? placeholderModels.TV

export const demoProducts: PreviewProduct[] = [
  {
    id: 'tv-oled-55',
    name: 'Smart TV OLED DMX Vision 55 inch',
    category: 'TV',
    image:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80',
    specs: ['55 inch', 'OLED 4K', '120Hz', 'Google TV'],
    price: 24990000,
    rating: 4.8,
    buyLabel: 'Mua ngay',
    supportsRoomPreview: true,
    dimensions: {
      widthCm: 123,
      recommendedViewingDistanceMin: 2.1,
      recommendedViewingDistanceMax: 3.2,
    },
  },
  {
    id: 'air-inverter-1hp',
    name: 'Máy lạnh Inverter DMX Cool 1 HP',
    category: 'Máy lạnh',
    image:
      'https://images.unsplash.com/photo-1631545806609-b3cdfb38e85b?auto=format&fit=crop&w=900&q=80',
    specs: ['1 HP', 'Inverter', 'Lọc bụi mịn', 'Tiết kiệm điện'],
    price: 8990000,
    rating: 4.7,
    buyLabel: 'Mua ngay',
    supportsRoomPreview: true,
    dimensions: { widthCm: 80, recommendedAreaMin: 10, recommendedAreaMax: 15 },
  },
  {
    id: 'fridge-340l',
    name: 'Tủ lạnh Multi Door DMX Fresh 340L',
    category: 'Tủ lạnh',
    image:
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=80',
    specs: ['340L', 'Ngăn đông mềm', 'Inverter', 'Khử mùi'],
    price: 13990000,
    rating: 4.6,
    buyLabel: 'Mua ngay',
    supportsRoomPreview: true,
    dimensions: { widthCm: 70 },
  },
  {
    id: 'washer-10kg',
    name: 'Máy giặt cửa trước DMX Wash 10kg',
    category: 'Máy giặt',
    image:
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=80',
    specs: ['10kg', 'Giặt hơi nước', 'Inverter', 'Êm ái'],
    price: 10990000,
    rating: 4.5,
    buyLabel: 'Mua ngay',
    supportsRoomPreview: true,
    dimensions: { widthCm: 60 },
  },
  {
    id: 'phone-pro',
    name: 'Điện thoại DMX Phone Pro 256GB',
    category: 'Điện thoại',
    image:
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80',
    specs: ['6.7 inch', '256GB', 'Camera 48MP', 'Sạc nhanh'],
    price: 18990000,
    rating: 4.7,
    buyLabel: 'Mua ngay',
    supportsRoomPreview: false,
    dimensions: { widthCm: 8 },
  },
  {
    id: 'laptop-ultra',
    name: 'Laptop DMX UltraBook 14',
    category: 'Laptop',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    specs: ['14 inch', '16GB RAM', 'SSD 512GB', '1.25kg'],
    price: 21990000,
    rating: 4.6,
    buyLabel: 'Mua ngay',
    supportsRoomPreview: false,
    dimensions: { widthCm: 32 },
  },
  {
    id: 'tv-qled-65',
    name: 'Smart TV QLED DMX Cinema 65 inch',
    category: 'TV',
    image:
      'https://images.unsplash.com/photo-1601944179066-29786cb9d32a?auto=format&fit=crop&w=900&q=80',
    specs: ['65 inch', 'QLED 4K', 'HDR10+', 'Âm thanh vòm'],
    price: 29990000,
    rating: 4.9,
    buyLabel: 'Mua ngay',
    supportsRoomPreview: true,
    dimensions: {
      widthCm: 145,
      recommendedViewingDistanceMin: 2.5,
      recommendedViewingDistanceMax: 3.8,
    },
  },
  {
    id: 'air-2hp',
    name: 'Máy lạnh Inverter DMX Cool 2 HP',
    category: 'Máy lạnh',
    image:
      'https://images.unsplash.com/photo-1604709177225-055f99402ea3?auto=format&fit=crop&w=900&q=80',
    specs: ['2 HP', 'Làm lạnh nhanh', 'Wi-Fi', 'Tự vệ sinh'],
    price: 16990000,
    rating: 4.8,
    buyLabel: 'Mua ngay',
    supportsRoomPreview: true,
    dimensions: { widthCm: 98, recommendedAreaMin: 20, recommendedAreaMax: 30 },
  },
  {
    id: 'fridge-500l',
    name: 'Tủ lạnh Side by Side DMX Fresh 500L',
    category: 'Tủ lạnh',
    image:
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=900&q=80',
    specs: ['500L', 'Side by Side', 'Lấy nước ngoài', 'Inverter'],
    price: 22990000,
    rating: 4.7,
    buyLabel: 'Mua ngay',
    supportsRoomPreview: true,
    dimensions: { widthCm: 91 },
  },
  {
    id: 'washer-dryer-12kg',
    name: 'Máy giặt sấy DMX Wash Pro 12kg',
    category: 'Máy giặt',
    image:
      'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=900&q=80',
    specs: ['12kg giặt', '8kg sấy', 'AI Wash', 'Khử khuẩn'],
    price: 18990000,
    rating: 4.6,
    buyLabel: 'Mua ngay',
    supportsRoomPreview: true,
    dimensions: { widthCm: 60 },
  },
]
