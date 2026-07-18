import { chatRoute } from '@mastra/ai-sdk'
import { MastraAuthBetterAuth } from '@mastra/auth-better-auth'
import { Mastra } from '@mastra/core/mastra'
import { registerApiRoute } from '@mastra/core/server'
import { createAuth } from '../auth'
import { env } from '../env'
import { runAdvisorPipelineStream } from './advisor/pipeline'
import { createConversationAgent } from './agents/conversation'
import { createIntentIdentifierAgent } from './agents/intent-identifier'
import { conversationClarificationScorer } from './evals/conversation'
import { fetchProductsByIds, streamCompareReply } from './products/compare'
import { listProductBrands, listProducts, MAY_LANH_CATEGORY_CODE } from './products/list'
import { createMastraStorage } from './storage'
import {
  Observability,
  MastraStorageExporter,
  SensitiveDataFilter,
} from '@mastra/observability'

// `credentials: true` forbids echoing back a literal "*" — and Hono's cors() only treats
// `origin: '*'` as a wildcard when it's the exact string, not one array entry. So instead of
// reflecting "*", resolve it to an explicit safelist (env-configured origins + local dev ports).
const resolveCorsOrigins = (origins: string) =>
  Array.from(
    new Set(
      origins
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin && origin !== '*')
        .concat(['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']),
    ),
  )

const cors = {
  origin: resolveCorsOrigins(env.CORS_ORIGIN),
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'x-mastra-client-type',
    'x-mastra-dev-playground',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
}

const auth = createAuth(env)

export const mastra = new Mastra({
  agents: {
    conversationAgent: createConversationAgent(),
    intentIdentifierAgent: createIntentIdentifierAgent(),
  },
  // Register for Studio/API dataset experiments only. It is intentionally not
  // attached to the agent, so production chat requests never trigger scoring.
  scorers: { conversationClarification: conversationClarificationScorer },
  storage: createMastraStorage(env),
  server: {
    // Pinned to match apps/web/src/auth/auth-client.ts's dev port map (FE :5173 -> API :4111) —
    // `mastra dev` otherwise falls back to whatever port is free, which drifts between runs.
    port: 4111,
    apiPrefix: '/api/mastra',
    auth: new MastraAuthBetterAuth({
      auth,
    }),
    cors,
    apiRoutes: [
      registerApiRoute('/api/auth/*', {
        method: 'ALL',
        requiresAuth: false,
        handler: (c) => auth.handler(c.req.raw),
      }),
      registerApiRoute('/api/me', {
        method: 'GET',
        requiresAuth: false,
        handler: async (c) => {
          const session = await auth.api.getSession({
            headers: c.req.raw.headers,
          })

          if (!session) {
            return c.body(null, 401)
          }

          return c.json({ user: session.user, session: session.session })
        },
      }),
      // Plain paginated catalog listing for the storefront grid — defaults to máy lạnh.
      registerApiRoute('/api/products', {
        method: 'GET',
        requiresAuth: false,
        handler: async (c) => {
          const result = await listProducts({
            categoryCode: c.req.query('category') ?? MAY_LANH_CATEGORY_CODE,
            page: Number(c.req.query('page') ?? '1'),
            pageSize: Number(c.req.query('pageSize') ?? '24'),
            brand: c.req.query('brand'),
            search: c.req.query('search'),
          })
          return c.json(result)
        },
      }),
      registerApiRoute('/api/products/brands', {
        method: 'GET',
        requiresAuth: false,
        handler: async (c) => {
          const brands = await listProductBrands(c.req.query('category') ?? MAY_LANH_CATEGORY_CODE)
          return c.json({ brands })
        },
      }),
      {
        ...chatRoute({
          path: '/api/chat',
          agent: 'conversation-agent',
          version: 'v6',
        }),
        requiresAuth: false,
      },
      // Streams NDJSON: a "meta" line first (products/needMoreInfo/... already computed, before
      // the LLM renders anything), then "text-delta" lines as the agent streams, then "done".
      registerApiRoute('/api/advisor/chat', {
        method: 'POST',
        requiresAuth: false,
        handler: async (c) => {
          const body = await c.req.json<{ conversationId?: string; message?: string; history?: string }>()
          if (!body.conversationId || !body.message) {
            return c.json({ error: 'conversationId và message là bắt buộc' }, 400)
          }

          const { meta, textStream } = await runAdvisorPipelineStream(
            body.conversationId,
            body.message,
            body.history ?? '',
          )

          const encoder = new TextEncoder()
          const line = (obj: unknown) => encoder.encode(`${JSON.stringify(obj)}\n`)

          const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
              controller.enqueue(line({ type: 'meta', ...meta }))
              try {
                for await (const delta of textStream) {
                  controller.enqueue(line({ type: 'text-delta', delta }))
                }
                controller.enqueue(line({ type: 'done' }))
              } catch (err) {
                controller.enqueue(line({ type: 'error', message: err instanceof Error ? err.message : String(err) }))
              } finally {
                controller.close()
              }
            },
          })

          return c.body(stream, 200, {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-cache',
            'X-Content-Type-Options': 'nosniff',
          })
        },
      }),
      // Single-shot "ask/compare about these specific product ids" — fetch-by-id + 1 LLM call,
      // no retrieval/scoring. Same NDJSON shape as /api/advisor/chat (meta, text-delta*, done).
      registerApiRoute('/api/products/compare', {
        method: 'POST',
        requiresAuth: false,
        handler: async (c) => {
          const body = await c.req.json<{ productIds?: string[]; message?: string }>()
          const productIds = Array.isArray(body.productIds)
            ? body.productIds.filter((id): id is string => typeof id === 'string')
            : []
          if (productIds.length === 0) {
            return c.json({ error: 'Cần ít nhất 1 productId để so sánh/hỏi' }, 400)
          }

          const compareProducts = await fetchProductsByIds(productIds)
          if (compareProducts.length === 0) {
            return c.json({ error: 'Không tìm thấy sản phẩm nào khớp productIds' }, 404)
          }

          const textStream = await streamCompareReply(compareProducts, body.message ?? '')

          const encoder = new TextEncoder()
          const line = (obj: unknown) => encoder.encode(`${JSON.stringify(obj)}\n`)

          const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
              controller.enqueue(line({ type: 'meta', products: compareProducts }))
              try {
                for await (const delta of textStream) {
                  controller.enqueue(line({ type: 'text-delta', delta }))
                }
                controller.enqueue(line({ type: 'done' }))
              } catch (err) {
                controller.enqueue(line({ type: 'error', message: err instanceof Error ? err.message : String(err) }))
              } finally {
                controller.close()
              }
            },
          })

          return c.body(stream, 200, {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-cache',
            'X-Content-Type-Options': 'nosniff',
          })
        },
      }),
    ],
  },
  studio: {
    auth: new MastraAuthBetterAuth({
      auth,
    }),
  },
  // Mastra automatically emits spans, metrics, and logs for agent runs. The
  // platform exporter makes those signals available in Mastra Observability,
  // independently of whether they originated from the API or Studio.
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'neoai-api',
        exporters: [new MastraStorageExporter()],
        logging: { enabled: true, level: 'info' },
        spanOutputProcessors: [new SensitiveDataFilter()],
      },
    },
  }),
})
