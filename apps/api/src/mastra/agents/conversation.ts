import { Agent } from '@mastra/core/agent'
import { env } from 'cloudflare:workers'

export const conversationAgent = new Agent({
  id: 'conversation-agent',
  name: 'Conversation Agent',
  instructions:
    'You are NeoAI, a concise and helpful assistant. Give accurate answers and clearly state when you are uncertain.',
  model: {
    id: 'openai/gpt-5-nano',
    // apiKey: env.OPENAI_API_KEY,
    // url: env.OPENAI_BASE_URL,
  },
  maxRetries: 0,
})
