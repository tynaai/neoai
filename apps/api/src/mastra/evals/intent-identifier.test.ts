import type { Agent } from '@mastra/core/agent'
import { runEvals } from '@mastra/core/evals'
import { expect, test } from 'vitest'
import { createIntentIdentifierAgent } from '../agents/intent-identifier'
import { intentIdentifierAccuracyScorer } from './intent-identifier'

const vietnameseIntentCases = [
  { input: 'Màn hình OLED là gì?', groundTruth: 'question' },
  { input: 'Tìm iPhone 15 256GB màu đen', groundTruth: 'search' },
  {
    input: 'So sánh iPhone 15 và Galaxy S24',
    groundTruth: 'comparison',
  },
  {
    input: 'Điện thoại pin tốt dưới 10 triệu nên mua gì?',
    groundTruth: 'recommend',
  },
  { input: 'Viết cho tôi một bài thơ', groundTruth: 'general' },
  {
    input: 'So sánh iPhone 15 và Galaxy S24 rồi chọn giúp tôi',
    groundTruth: 'recommend',
  },
  { input: '...', groundTruth: 'general' },
]

test('phân loại đúng các ý định thương mại bằng tiếng Việt', async () => {
  // runEvals currently constrains targets to the default Agent output type,
  // although its runtime supports agents with structured output.
  const target = createIntentIdentifierAgent() as unknown as Agent
  const result = await runEvals({
    target,
    data: vietnameseIntentCases,
    gates: [intentIdentifierAccuracyScorer],
    concurrency: 1,
  })

  expect(result.summary.totalItems).toBe(vietnameseIntentCases.length)
  expect(result.verdict).toBe('passed')
  expect(result.gateResults).toEqual([
    {
      id: intentIdentifierAccuracyScorer.id,
      passed: true,
      score: 1,
    },
  ])
}, 30_000)
