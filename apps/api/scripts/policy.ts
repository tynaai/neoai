// One-off seed script for policy docs. Default dry-run; set CONFIRM_SEED=yes to write for real.
//
// Unlike products, policy docs have no structured/quantitative fields to filter on — pure RAG,
// so this only writes to a vector index, no Drizzle table.

import 'dotenv/config'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ModelRouterEmbeddingModel } from '@mastra/core/llm'
import { PgVector } from '@mastra/pg'
import { MDocument } from '@mastra/rag'
import { embedMany } from 'ai'

const __dirname = dirname(fileURLToPath(import.meta.url))

const POLICY_DIR = process.argv[2] ?? resolve(__dirname, '../../data/policy')

// Index name must differ from `product_embeddings`/`products` — separate corpus, separate retrieval tool.
const VECTOR_INDEX_NAME = 'policy_embeddings'
const EMBEDDING_MODEL = 'openai/text-embedding-3-small'
const EMBEDDING_DIMENSION = 1536
const EMBED_BATCH_SIZE = 100

const DRY_RUN = process.env.CONFIRM_SEED !== 'yes'

// Friendly display name per file — first line of each doc is inconsistent (sometimes
// a section header, not a title), so map explicitly rather than guess.
const POLICY_TITLES: Record<string, string> = {
  'chinh_sach_bao_hanh_doi_tra.md': 'Chính sách bảo hành, đổi trả',
  'chinh_sach_giao_hang_lap_dat.md': 'Chính sách giao hàng, lắp đặt',
  'chinh_sach_xu_ly_du_lieu_ca_nhan.md': 'Chính sách xử lý dữ liệu cá nhân',
  'chinh_sach_khui_hop_apple.md': 'Chính sách khui hộp sản phẩm Apple',
  'dieu-khoang-su-dung.md': 'Điều khoản sử dụng website',
  'noi_quy_cua_hang.md': 'Nội quy cửa hàng',
  'chat_luong_phuc_vu.md': 'Chính sách chất lượng phục vụ khách hàng online',
}

interface ParsedPolicyDoc {
  fileName: string
  policyName: string
  content: string
}

function parsePolicyDocs(dir: string): ParsedPolicyDoc[] {
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  return files.map((fileName) => ({
    fileName,
    policyName: POLICY_TITLES[fileName] ?? fileName.replace(/\.md$/, ''),
    content: readFileSync(resolve(dir, fileName), 'utf-8').trim(),
  }))
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  console.log(`Đọc policy docs từ: ${POLICY_DIR}`)
  const docs = parsePolicyDocs(POLICY_DIR)
  console.log(`Tìm thấy ${docs.length} file policy: ${docs.map((d) => d.fileName).join(', ')}`)

  if (DRY_RUN) {
    console.log('\nDRY RUN (mặc định) — chưa gọi embedding API, chưa ghi gì vào Neon.')
    console.log('Set CONFIRM_SEED=yes để chạy thật (tốn phí OpenAI embedding).')
    for (const doc of docs) {
      console.log(`\n--- ${doc.fileName} (${doc.policyName}) — ${doc.content.length} ký tự ---`)
      console.log(doc.content.slice(0, 200).replace(/\n/g, ' '), '...')
    }
    return
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('Thiếu DATABASE_URL trong .env')

  console.log('\nChunking + embedding...')
  const vectorStore = new PgVector({ id: 'pg-vector-policy', connectionString: databaseUrl })
  await vectorStore.createIndex({
    indexName: VECTOR_INDEX_NAME,
    dimension: EMBEDDING_DIMENSION,
    metric: 'cosine',
  })

  type VectorRow = { id: string; text: string; metadata: Record<string, unknown> }
  const vectorRows: VectorRow[] = []

  for (const doc of docs) {
    const mDoc = MDocument.fromText(doc.content, { fileName: doc.fileName })
    const docChunks = await mDoc.chunk({ strategy: 'recursive', maxSize: 1500, overlap: 100 })
    docChunks.forEach((c, i) => {
      const baseId = doc.fileName.replace(/\.md$/, '')
      vectorRows.push({
        id: docChunks.length > 1 ? `${baseId}#${i}` : baseId,
        text: c.text,
        metadata: { policyName: doc.policyName, sourceFile: doc.fileName, chunkIndex: i },
      })
    })
  }
  console.log(`Tổng ${vectorRows.length} chunk cần embed (từ ${docs.length} file).`)

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
