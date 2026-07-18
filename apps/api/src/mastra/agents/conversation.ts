import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { conversationModel } from './model'

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
