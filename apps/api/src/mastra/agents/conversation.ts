import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'

export const createConversationAgent = () =>
  new Agent({
    id: 'conversation-agent',
    name: 'Conversation Agent',
    instructions:
      'You are NeoAI, a concise and helpful assistant. Give accurate answers and clearly state when you are uncertain.',
    model: {
      id: 'openai/DeepSeek-V4-Flash',
      url: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    },
    memory: new Memory({
      options: {
        lastMessages: 20,
        generateTitle: true,
        // observationalMemory: {
        //   model: 'openai/DeepSeek-V4-Flash',
        // },
      },
    }),
    maxRetries: 0,
  })
