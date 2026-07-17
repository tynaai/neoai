import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { MastraAuthBetterAuth } from '@mastra/auth-better-auth'
import { MastraServer } from '@mastra/hono'
import { createAuth, type Auth } from './auth'
import { mastra } from './mastra'

type Variables = {
  auth: Auth
  session: Auth['$Infer']['Session']['session'] | null
  user: Auth['$Infer']['Session']['user'] | null
}

const app = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>()

app.use('/api/auth/*', async (c, next) => {
  return cors({
    origin: (origin) => {
      const allowedOrigins = [c.env.CORS_ORIGIN, 'http://localhost:3000']

      return allowedOrigins.includes(origin) ? origin : null
    },
    allowHeaders: [],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })(c, next)
})

app.use('/api/mastra/*', async (c, next) => {
  return cors({
    origin: (origin) => {
      const allowedOrigins = [c.env.CORS_ORIGIN, 'http://localhost:3000']

      return allowedOrigins.includes(origin) ? origin : null
    },
    // With no static list, Hono reflects the browser's preflight request headers.
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'x-mastra-client-type',
      'x-mastra-dev-playground',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Requested-With'],
    credentials: true,
  })(c, next)
})

app.use('*', async (c, next) => {
  const auth = createAuth(c.env)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  c.set('auth', auth)
  c.set('session', session?.session ?? null)
  c.set('user', session?.user ?? null)

  await next()
})

app
  .on(['GET', 'POST'], '/api/auth/*', (c) => c.get('auth').handler(c.req.raw))
  .get('/me', (c) => {
    const user = c.get('user')

    if (!user) {
      return c.body(null, 401)
    }

    return c.json({ user, session: c.get('session') })
  })

let mastraInitialization: Promise<void> | undefined

const initializeMastra = (env: CloudflareBindings) => {
  if (!mastraInitialization) {
    const mastraAuth = new MastraAuthBetterAuth({
      auth: createAuth(env),
    })

    mastra.setServer({ auth: mastraAuth })
    mastra.setStudio({ auth: mastraAuth })

    const mastraServer = new MastraServer({
      app,
      mastra,
      prefix: '/api/mastra',
      mcpOptions: { serverless: true },
    })

    mastraInitialization = mastraServer.init().catch((error: unknown) => {
      mastraInitialization = undefined
      throw error
    })
  }

  return mastraInitialization
}

export default {
  async fetch(request, env) {
    await initializeMastra(env)
    return app.fetch(request, env)
  },
} satisfies ExportedHandler<CloudflareBindings>
