import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'

const conversationModel = {
  id: 'openai/DeepSeek-V4-Flash',
  url: process.env.A_OPENAI_BASE_URL,
  apiKey: process.env.A_OPENAI_API_KEY,
} as const

export const createConversationAgent = () =>
  new Agent({
    id: 'conversation-agent',
    name: 'Conversation Agent',
    instructions:
      'You are NeoAI, a concise and helpful assistant. Give accurate answers and clearly state when you are uncertain.',
    model: conversationModel,
    memory: new Memory({
      options: {
        lastMessages: 20,
        generateTitle: true,
        observationalMemory: {
          model: 'openai/gpt-5-mini',
        },
      },
    }),
    maxRetries: 0,
  })
