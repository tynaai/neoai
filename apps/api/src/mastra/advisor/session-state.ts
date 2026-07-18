import { eq, sql } from 'drizzle-orm'

import { db } from '../../db/client'
import { conversationState } from '../../db/schema'
import { emptyFilters, type SearchFilters } from './slot-schema'

export interface ConversationState {
  filters: SearchFilters
  excludedIds: string[]
  lastShownIds: string[]
  hasUpsold: boolean
}

export async function getState(conversationId: string): Promise<ConversationState> {
  const [row] = await db.select().from(conversationState).where(eq(conversationState.id, conversationId))
  if (!row) return { filters: { ...emptyFilters }, excludedIds: [], lastShownIds: [], hasUpsold: false }
  return {
    filters: { ...emptyFilters, ...(row.searchFilters as Partial<SearchFilters>) },
    excludedIds: row.excludedIds,
    lastShownIds: row.lastShownIds,
    hasUpsold: row.hasUpsold,
  }
}

export async function saveState(conversationId: string, state: ConversationState): Promise<void> {
  await db
    .insert(conversationState)
    .values({
      id: conversationId,
      searchFilters: state.filters,
      excludedIds: state.excludedIds,
      lastShownIds: state.lastShownIds,
      hasUpsold: state.hasUpsold,
    })
    .onConflictDoUpdate({
      target: conversationState.id,
      set: {
        searchFilters: state.filters,
        excludedIds: state.excludedIds,
        lastShownIds: state.lastShownIds,
        hasUpsold: state.hasUpsold,
        updatedAt: sql`now()`,
      },
    })
}

// Only overwrites fields the LLM actually extracted this turn (non-null); leaves the rest as-is.
export function mergeFilters(current: SearchFilters, delta: Partial<SearchFilters>): SearchFilters {
  const merged = { ...current }
  for (const key of Object.keys(delta) as (keyof SearchFilters)[]) {
    const value = delta[key]
    if (value !== null && value !== undefined) {
      // biome-ignore lint: generic merge across a small known union of value types
      ;(merged as any)[key] = value
    }
  }
  return merged
}
