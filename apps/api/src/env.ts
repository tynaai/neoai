import { z } from 'zod'

const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  CORS_ORIGIN: z.string().min(1),
  DATABASE_URL: z.string().min(1),
})

export const env = envSchema.parse(process.env)

export type AppEnv = z.infer<typeof envSchema>
