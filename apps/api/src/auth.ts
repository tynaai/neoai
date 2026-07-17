import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { neon } from '@neondatabase/serverless'
import { betterAuth } from 'better-auth/minimal'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './db/schema'

export const createAuth = (env: CloudflareBindings) => {
  const client = neon(env.DATABASE_URL)
  const db = drizzle({ client, schema })

  return betterAuth({
    appName: 'NeoAI',
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: env.CORS_ORIGIN ? [env.CORS_ORIGIN] : [],
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
  })
}

export type Auth = ReturnType<typeof createAuth>
