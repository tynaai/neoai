import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createAuth, type Auth } from './auth'

type Variables = {
  auth: Auth
  session: Auth['$Infer']['Session']['session'] | null
  user: Auth['$Infer']['Session']['user'] | null
}

const app = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>()

app.use('/api/auth/*', async (c, next) => {
  const allowedOrigin = c.env.CORS_ORIGIN

  return cors({
    origin: allowedOrigin ?? new URL(c.env.BETTER_AUTH_URL).origin,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
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

export default app
