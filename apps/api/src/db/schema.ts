import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

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

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  brand: text('brand'),
  categoryCode: text('category_code'),
  priceCurrent: integer('price_current'),
  priceOriginal: integer('price_original'),
  productUrl: text('product_url'),
  thumbnailUrl: text('thumbnail_url'),
  specs: jsonb('specs'),
  promotions: text('promotions').array(),
  embeddingText: text('embedding_text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// id = Mastra Memory threadId (1-1). Separate from `products`, not touched by seeding.
export const conversationState = pgTable('conversation_state', {
  id: text('id').primaryKey(),
  searchFilters: jsonb('search_filters').notNull().default({}),
  excludedIds: text('excluded_ids')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  // Rejected-product-in-current-panel ids, distinct from excludedIds (permanently dismissed).
  lastShownIds: text('last_shown_ids')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  hasUpsold: boolean('has_upsold').notNull().default(false),
  lastCategory: text('last_category'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
