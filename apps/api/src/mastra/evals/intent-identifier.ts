import { createScorer } from '@mastra/core/evals'
import { intentIdentifierOutputSchema } from '../agents/intent-identifier'

export const intentIdentifierAccuracyScorer = createScorer({
  id: 'intent-identifier-accuracy',
  name: 'Intent identifier accuracy',
  description:
    'Returns 1 when the classified intent exactly matches the expected intent, otherwise 0.',
  type: 'agent',
})
  .preprocess(({ run }) => {
    const structuredOutput = run.output.find(
      (message) => message.role === 'assistant',
    )?.content.metadata?.structuredOutput
    const actual = intentIdentifierOutputSchema.safeParse(structuredOutput)
    const expected = intentIdentifierOutputSchema.shape.intent.safeParse(
      run.groundTruth,
    )

    return {
      actual: actual.success ? actual.data.intent : undefined,
      expected: expected.success ? expected.data : undefined,
    }
  })
  .generateScore(({ results }) => {
    const { actual, expected } = results.preprocessStepResult

    return actual !== undefined && actual === expected ? 1 : 0
  })
  .generateReason(({ results, score }) => {
    const { actual, expected } = results.preprocessStepResult

    return score === 1
      ? `Intent matched: ${actual}`
      : `Intent mismatch: expected ${expected ?? 'invalid'}, received ${actual ?? 'invalid'}`
  })
