import type { StoreProduct } from '~/lib/products-api'

// Custom MIME type so drop targets can tell "a product card" apart from any other drag (e.g.
// browser default text/image drags) via `dataTransfer.types` before even reading the payload.
export const PRODUCT_DND_MIME = 'application/x-neoai-product'

export function writeDraggedProduct(event: React.DragEvent, product: StoreProduct) {
  event.dataTransfer.setData(PRODUCT_DND_MIME, JSON.stringify(product))
  event.dataTransfer.effectAllowed = 'copy'
}

export function readDraggedProduct(event: React.DragEvent): StoreProduct | null {
  const raw = event.dataTransfer.getData(PRODUCT_DND_MIME)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoreProduct
  } catch {
    return null
  }
}
