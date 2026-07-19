import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'

import {
  commitAdvisorReply,
  prepareAdvisorReply,
  streamAdvisorReply,
} from '../advisor/pipeline'

const advisorInputSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1),
  history: z.string().optional(),
})

const renderAdvisorReply = createStep({
  id: 'render-advisor-reply',
  description:
    'Builds grounded refrigerator recommendations and streams the advisor response.',
  inputSchema: advisorInputSchema,
  outputSchema: z.object({ completed: z.literal(true) }),
  execute: async ({ inputData, writer, abortSignal }) => {
    const reply = await prepareAdvisorReply(
      inputData.conversationId,
      inputData.message,
      inputData.history,
    )

    // The product panel consumes this typed UI data part before the model starts rendering prose.
    await writer.custom({
      type: 'data-advisor-meta',
      data: reply.meta,
      transient: true,
    })

    const response = await streamAdvisorReply(reply.prompt, abortSignal)
    await response.fullStream.pipeTo(writer)

    // Do not advance state when rendering fails or the client aborts the stream.
    await commitAdvisorReply(inputData.conversationId, reply.stateToSave)
    return { completed: true as const }
  },
})

export const advisorWorkflow = createWorkflow({
  id: 'advisor-workflow',
  description:
    'Grounded refrigerator advisor workflow with deterministic retrieval and ranking.',
  inputSchema: advisorInputSchema,
  outputSchema: z.object({ completed: z.literal(true) }),
})
  .then(renderAdvisorReply)
  .commit()
