import { chatRoute } from '@mastra/ai-sdk'
import { MastraAuthBetterAuth } from '@mastra/auth-better-auth'
import { Mastra } from '@mastra/core/mastra'
import { registerApiRoute } from '@mastra/core/server'
import { createAuth } from '../auth'
import { env } from '../env'
import { runAdvisorPipelineStream } from './advisor/pipeline'
import { createConversationAgent } from './agents/conversation'
import { conversationClarificationScorer } from './evals/conversation'
import { createMastraStorage } from './storage'
import {
  Observability,
  MastraStorageExporter,
  SensitiveDataFilter,
} from '@mastra/observability'

// `credentials: true` forbids echoing back a literal "*" — and Hono's cors() only treats
// `origin: '*'` as a wildcard when it's the exact string, not one array entry. So when
// CORS_ORIGIN="*", reflect back whatever Origin the browser sent instead.
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim())
const isWildcard = allowedOrigins.includes('*')
const explicitOrigins = new Set([...allowedOrigins, 'http://localhost:3000'])

const cors = {
  origin: isWildcard ? (origin: string) => origin : (origin: string) => (explicitOrigins.has(origin) ? origin : undefined),
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
  agents: { conversationAgent: createConversationAgent() },
  // Register for Studio/API dataset experiments only. It is intentionally not
  // attached to the agent, so production chat requests never trigger scoring.
  scorers: { conversationClarification: conversationClarificationScorer },
  storage: createMastraStorage(env),
  server: {
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
