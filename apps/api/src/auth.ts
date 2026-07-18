import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { neon } from '@neondatabase/serverless'
import { betterAuth, type BetterAuthOptions } from 'better-auth/minimal'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './db/schema'
import type { AppEnv } from './env'

const mastraStudioOrigin = 'http://localhost:3000'

export const createAuth = (env: AppEnv) => {
  const client = neon(env.DATABASE_URL)
  const db = drizzle({ client, schema })

  return betterAuth<BetterAuthOptions>({
    appName: 'NeoAI',
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [...env.CORS_ORIGIN.split(','), mastraStudioOrigin],
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
