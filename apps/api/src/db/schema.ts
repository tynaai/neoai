import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
    withTimezone: true,
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})

// Catalog sản phẩm — nguồn: data/Spec_cate_gia_tu_lanh-rag/all-products.md (seed 1 lần qua scripts/all-products.ts)
// Trường định lượng/lọc chính xác nằm ở đây (đúng "Hybrid retrieval" trong SPEC.md) — phần embedding/RAG
// nằm riêng trong PgVector index "products", nối lại qua id.
export const products = pgTable('products', {
  id: text('id').primaryKey(), // slug, vd "tu-lanh-samsung-inverter-307-lit-rb30n4190b1-sv"
  title: text('title').notNull(),
  brand: text('brand'),
  categoryCode: text('category_code'),
  // Nhiều sản phẩm trong dataset thô không có giá (chỉ ~15% có "Giá gốc", ~13% có "Giá khuyến mãi") -> để nullable, không giả định luôn có
  priceCurrent: integer('price_current'), // VND — ưu tiên "Giá khuyến mãi", fallback "Giá gốc" nếu thiếu
  priceOriginal: integer('price_original'), // VND — "Giá gốc"
  productUrl: text('product_url'),
  thumbnailUrl: text('thumbnail_url'),
  specs: jsonb('specs'), // toàn bộ dmx_specs_json thô (nếu có) — dự phòng field chưa normalize
  promotions: text('promotions').array(), // từng dòng khuyến mãi trong section "## Khuyến mãi", rỗng nếu không có
  embeddingText: text('embedding_text').notNull(), // đoạn text đã ghép để đưa vào embedding — lưu lại để audit/debug
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
