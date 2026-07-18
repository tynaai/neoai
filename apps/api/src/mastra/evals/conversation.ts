import { createScorer, filterRun } from '@mastra/core/evals'
import { z } from 'zod'

const clarificationAnalysisSchema = z.object({
  decisionScore: z.number().min(0).max(1),
  clarificationCoverageScore: z.number().min(0).max(1),
  inferenceScore: z.number().min(0).max(1),
  responseQualityScore: z.number().min(0).max(1),
  reason: z.string(),
})

export const conversationClarificationScorer = createScorer({
  id: 'conversation-clarification',
  name: 'Conversation clarification quality',
  description:
    'Evaluates whether the conversation agent asks for missing shopping context or proceeds when the request already contains enough information.',
  type: 'agent',
  prepareRun: filterRun({
    partTypes: ['text'],
    maxRememberedMessages: 4,
    maxOutputMessages: 2,
    dropRequestContext: true,
  }),
  judge: {
    model: {
      id: 'openai/gpt-5',
      apiKey: process.env.OPENAI_API_KEY,
      url: process.env.OPENAI_BASE_URL,
    },
    instructions:
      'You are a strict bilingual Vietnamese-English evaluator. Judge only the assistant response against the user request and supplied ground truth. Do not answer the user request yourself.',
  },
})
  .analyze({
    description: 'Evaluate clarification and recommendation behavior',
    outputSchema: clarificationAnalysisSchema,
    createPrompt: ({
      run,
    }) => `Evaluate the assistant response using these dimensions:

1. decisionScore: Did it choose the expected action: ask a focused clarifying question when essential context is missing, or proceed directly when context is sufficient?
2. clarificationCoverageScore: If clarification is expected, did it cover the required clarification topics without asking unnecessary questions? Use 1 when clarification is not applicable.
3. inferenceScore: If a required inference is supplied, did the response apply it correctly? Use 1 when no inference is required.
4. responseQualityScore: Is the response concise, relevant, helpful, and written naturally for the user?

Use the dataset ground truth when present. Otherwise infer the expected behavior from the conversation. Return scores from 0 to 1 and a concise reason.

Conversation input:
${JSON.stringify(run.input)}

Assistant output:
${JSON.stringify(run.output)}

Ground truth:
${JSON.stringify(run.groundTruth ?? null)}`,
  })
  .generateScore(({ results }) => {
    const analysis = results.analyzeStepResult

    return (
      analysis.decisionScore * 0.45 +
      analysis.clarificationCoverageScore * 0.3 +
      analysis.inferenceScore * 0.15 +
      analysis.responseQualityScore * 0.1
    )
  })
  .generateReason(({ results }) => results.analyzeStepResult.reason)
