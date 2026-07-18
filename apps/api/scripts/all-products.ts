// One-off seed script. Default dry-run; set CONFIRM_SEED=yes to write for real.
//
// Processes multiple category sources (each its own markdown file, same frontmatter+section
// shape) into the shared `products` table + `product_embeddings` vector index. Sources so far
// differ in coverage, not shape — see per-source notes below.

import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ModelRouterEmbeddingModel } from '@mastra/core/llm'
import { PgVector } from '@mastra/pg'
import { MDocument } from '@mastra/rag'
import { embedMany } from 'ai'
import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import { products } from '../src/db/schema'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface DataSource {
  file: string
  // Used when the file's own frontmatter `category_code` is empty (e.g. airCondition-products.md
  // has category_code: "" for every product) — arbitrary but must stay distinct per category and
  // match whatever the advisor pipeline filters on (see TU_LANH_CATEGORY_CODE in retrieval.ts).
  categoryCodeFallback: string
  categoryLabel: string // logging only
}

// A single positional arg still works for ad-hoc one-off files (categoryCodeFallback empty —
// relies on the file's own frontmatter field in that case).
const DATA_SOURCES: DataSource[] = process.argv[2]
  ? [{ file: resolve(process.argv[2]), categoryCodeFallback: '', categoryLabel: 'custom' }]
  : [
      { file: resolve(__dirname, '../../data/freezer-products.md'), categoryCodeFallback: '38', categoryLabel: 'Tủ lạnh' },
      {
        file: resolve(__dirname, '../../data/airCondition-products.md'),
        categoryCodeFallback: '2002',
        categoryLabel: 'Máy lạnh',
      },
    ]

const SEPARATOR = '<!-- rag-document-separator -->'
// Must differ from Drizzle table `products` or index creation fails (no `embedding` column there).
const VECTOR_INDEX_NAME = 'product_embeddings'
const EMBEDDING_MODEL = 'openai/text-embedding-3-small'
const EMBEDDING_DIMENSION = 1536
const EMBED_BATCH_SIZE = 100
const DB_INSERT_BATCH_SIZE = 200

const DRY_RUN = process.env.CONFIRM_SEED !== 'yes'

// Raw/bookkeeping fields excluded from embed text (see SPEC.md). Only present in the tủ lạnh
// source (freezer-products.md) — airCondition-products.md has no dmx_* bookkeeping fields at
// all, so this set simply never matches there, which is fine.
const EXCLUDED_SPEC_KEYS = new Set([
  'model_code',
  'sku',
  'productidweb',
  'dmx_lookup_source',
  'dmx_resolved',
  'dmx_og_image',
  'dmx_current_price',
  'dmx_original_price',
  'dmx_gallery_count',
  'dmx_gallery_images',
  'dmx_specs_json',
  'dmx_detail_status',
])

interface ParsedProduct {
  id: string
  title: string
  brand: string | null
  categoryCode: string | null
  priceCurrent: number | null
  priceOriginal: number | null
  productUrl: string | null
  thumbnailUrl: string | null
  specs: Record<string, unknown> | null
  promotions: string[]
  embeddingText: string
}

function parseVndPrice(raw: string | undefined | null): number | null {
  if (!raw) return null
  const digits = raw.replace(/[^\d]/g, '')
  return digits ? Number.parseInt(digits, 10) : null
}

function extractFrontmatterField(frontmatter: string, key: string): string | null {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*"([^"]*)"`, 'm'))
  return match ? match[1] : null
}

// Top-level "- **key:** value" bullets, skipping excluded keys and their nested sub-bullets.
function extractEmbeddingFacts(specsSection: string): string[] {
  const lines = specsSection.split('\n')
  const out: string[] = []
  let skipping = false

  for (const raw of lines) {
    if (!raw.trim()) continue
    const indent = raw.match(/^(\s*)/)?.[1].length ?? 0
    const topBullet = indent === 0 ? raw.match(/^-\s+\*\*([^*]+):\*\*\s*(.*)$/) : null

    if (topBullet) {
      const key = topBullet[1].trim()
      const value = topBullet[2].trim()
      if (EXCLUDED_SPEC_KEYS.has(key)) {
        skipping = true
        continue
      }
      skipping = false
      out.push(value ? `${key}: ${value}` : `${key}:`)
      continue
    }

    if (skipping) continue // nested under an excluded key

    const subBullet = raw.match(/^\s*-\s+(.*)$/)
    if (subBullet) out.push(subBullet[1].trim())
  }

  return out
}

// Not every source has a "## Khuyến mãi" section (airCondition-products.md doesn't) — returns
// [] when absent, same as "no promotions data" rather than an error.
function extractPromotions(block: string): string[] {
  const sectionMatch = block.match(/## Khuyến mãi\n([\s\S]*?)(?:\n## |$)/)
  if (!sectionMatch) return []
  return sectionMatch[1]
    .split('\n')
    .map((line) => line.match(/^\s*-\s+(.*)$/)?.[1]?.trim())
    .filter((line): line is string => Boolean(line) && !line.startsWith('**Khuyến mãi'))
}

function parseProductBlock(block: string, categoryCodeFallback: string): ParsedProduct | null {
  // Block starts with a comment line before frontmatter, so don't anchor ^.
  const frontmatterMatch = block.match(/---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) return null
  const frontmatter = frontmatterMatch[1]

  const id = extractFrontmatterField(frontmatter, 'id')
  const title = extractFrontmatterField(frontmatter, 'title')
  if (!id || !title) return null

  const brand = extractFrontmatterField(frontmatter, 'brand')
  const categoryCodeRaw = extractFrontmatterField(frontmatter, 'category_code')
  const categoryCode = categoryCodeRaw && categoryCodeRaw.trim() !== '' ? categoryCodeRaw : (categoryCodeFallback || null)
  const productUrl = extractFrontmatterField(frontmatter, 'product_url')
  const thumbnailUrl = extractFrontmatterField(frontmatter, 'thumbnail_url')

  // Price section is absent entirely in airCondition-products.md — both regexes just won't
  // match, priceCurrent/priceOriginal stay null rather than fabricated.
  const promoPriceRaw = block.match(/-\s+\*\*Giá khuyến mãi:\*\*\s*([^\n]+)/)?.[1]
  const originalPriceRaw = block.match(/-\s+\*\*Giá gốc:\*\*\s*([^\n]+)/)?.[1]
  const priceOriginal = parseVndPrice(originalPriceRaw)
  // Prefer promo price as current, fallback to original
  const priceCurrent = parseVndPrice(promoPriceRaw) ?? priceOriginal

  // dmx_specs_json is a freezer-products.md-only bonus field — absent in airCondition source.
  const specsJsonRaw = block.match(/-\s+\*\*dmx_specs_json:\*\*\s*(\{.*\})\s*$/m)?.[1]
  let specs: Record<string, unknown> | null = null
  if (specsJsonRaw) {
    try {
      specs = JSON.parse(specsJsonRaw)
    } catch {
      specs = null // malformed JSON, skip without failing the whole product
    }
  }

  const specsSectionMatch = block.match(/## Thông số và tính năng\n([\s\S]*?)(?:\n## |$)/)
  const facts = specsSectionMatch ? extractEmbeddingFacts(specsSectionMatch[1]) : []
  // Dynamic field (expires/changes) — structured only, not embedded
  const promotions = extractPromotions(block)

  const embeddingText = [title, brand ? `Thương hiệu: ${brand}` : null, ...facts]
    .filter(Boolean)
    .join('\n')

  return {
    id,
    title,
    brand,
    categoryCode,
    priceCurrent,
    priceOriginal,
    productUrl,
    thumbnailUrl,
    specs,
    promotions,
    embeddingText,
  }
}

function parseSource(source: DataSource): { source: DataSource; products: ParsedProduct[] } {
  const content = readFileSync(source.file, 'utf-8')
  const blocks = content.split(SEPARATOR)
  const parsed: ParsedProduct[] = []
  let skipped = 0

  for (const block of blocks) {
    const product = parseProductBlock(block, source.categoryCodeFallback)
    if (product) parsed.push(product)
    else if (block.trim()) skipped++
  }

  const withPrice = parsed.filter((p) => p.priceCurrent !== null).length
  console.log(
    `[${source.categoryLabel}] ${source.file}\n  parsed ${parsed.length}, bỏ qua ${skipped} block không parse được, ${withPrice}/${parsed.length} có giá.`,
  )
  return { source, products: parsed }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  const parsedBySource = DATA_SOURCES.map(parseSource)
  const parsedProducts = parsedBySource.flatMap((s) => s.products)

  const withPrice = parsedProducts.filter((p) => p.priceCurrent !== null).length
  console.log(`\nTổng: ${parsedProducts.length} sản phẩm (${DATA_SOURCES.length} nguồn), ${withPrice} có giá.`)

  if (DRY_RUN) {
    console.log('\nDRY RUN (mặc định) — chưa ghi gì vào DB, chưa gọi embedding API.')
    console.log('Set CONFIRM_SEED=yes để chạy thật (sẽ tốn phí OpenAI embedding + ghi vào Neon).')
    console.log('\nVí dụ sản phẩm đầu tiên mỗi nguồn:')
    for (const { source, products: sourceProducts } of parsedBySource) {
      console.log(`\n--- ${source.categoryLabel} ---`)
      console.log(JSON.stringify(sourceProducts[0], null, 2).slice(0, 1200))
    }
    return
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('Thiếu DATABASE_URL trong .env')

  // Save DB (structured)
  const db = drizzle({ client: neon(databaseUrl) })
  console.log('\nGhi bảng `products` (structured)...')
  for (const batch of chunk(parsedProducts, DB_INSERT_BATCH_SIZE)) {
    await db
      .insert(products)
      .values(batch)
      .onConflictDoUpdate({
        target: products.id,
        // Upsert: overwrite all fields on re-run via Postgres `excluded` pseudo-table
        set: {
          title: sql`excluded.title`,
          brand: sql`excluded.brand`,
          categoryCode: sql`excluded.category_code`,
          priceCurrent: sql`excluded.price_current`,
          priceOriginal: sql`excluded.price_original`,
          productUrl: sql`excluded.product_url`,
          thumbnailUrl: sql`excluded.thumbnail_url`,
          specs: sql`excluded.specs`,
          promotions: sql`excluded.promotions`,
          embeddingText: sql`excluded.embedding_text`,
          updatedAt: new Date(),
        },
      })
  }
  console.log(`Đã ghi ${parsedProducts.length} sản phẩm vào bảng products.`)

  // Chunking + embedding
  console.log('\nChunking + embedding...')
  const vectorStore = new PgVector({ id: 'pg-vector-products', connectionString: databaseUrl })
  await vectorStore.createIndex({
    indexName: VECTOR_INDEX_NAME,
    dimension: EMBEDDING_DIMENSION,
    metric: 'cosine',
  })

  type VectorRow = { id: string; text: string; metadata: Record<string, unknown> }
  const vectorRows: VectorRow[] = []

  for (const product of parsedProducts) {
    const doc = MDocument.fromText(product.embeddingText, { productId: product.id })
    const docChunks = await doc.chunk({ strategy: 'recursive', maxSize: 1500, overlap: 100 })
    docChunks.forEach((c, i) => {
      vectorRows.push({
        id: docChunks.length > 1 ? `${product.id}#${i}` : product.id,
        text: c.text,
        metadata: { productId: product.id, title: product.title, brand: product.brand },
      })
    })
  }
  console.log(`Tổng ${vectorRows.length} chunk cần embed (từ ${parsedProducts.length} sản phẩm).`)

  for (const batch of chunk(vectorRows, EMBED_BATCH_SIZE)) {
    const { embeddings } = await embedMany({
      model: new ModelRouterEmbeddingModel(EMBEDDING_MODEL),
      values: batch.map((r) => r.text),
    })
    await vectorStore.upsert({
      indexName: VECTOR_INDEX_NAME,
      vectors: embeddings,
      metadata: batch.map((r) => r.metadata),
      ids: batch.map((r) => r.id),
    })
    console.log(`  embedded + upserted ${batch.length} chunk`)
  }

  await vectorStore.disconnect()
  console.log('\nHoàn tất.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
