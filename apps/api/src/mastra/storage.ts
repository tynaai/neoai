import { PostgresStore } from '@mastra/pg'
import type { AppEnv } from '../env'

export const createMastraStorage = (env: AppEnv) =>
  new PostgresStore({
    id: 'neoai-mastra-storage',
    connectionString: env.DATABASE_URL,
    schemaName: 'mastra',
    max: 5,
    idleTimeoutMillis: 10_000,
  })
