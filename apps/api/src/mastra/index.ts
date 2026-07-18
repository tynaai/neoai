import { chatRoute } from '@mastra/ai-sdk'
import { MastraAuthBetterAuth } from '@mastra/auth-better-auth'
import { Mastra } from '@mastra/core/mastra'
import { registerApiRoute } from '@mastra/core/server'
import { createAuth } from '../auth'
import { env } from '../env'
import { createConversationAgent } from './agents/conversation'
import { conversationClarificationScorer } from './evals/conversation'
import { createMastraStorage } from './storage'
import {
  Observability,
  MastraStorageExporter,
  SensitiveDataFilter,
} from '@mastra/observability'

const cors = {
  origin: [...env.CORS_ORIGIN.split(','), 'http://localhost:3000'],
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
