import { Mastra } from '@mastra/core/mastra'
import {
  MastraPlatformExporter,
  Observability,
  SensitiveDataFilter,
} from '@mastra/observability'
import { env } from 'cloudflare:workers'
import { conversationAgent } from './agents/conversation'

// TODO: setup observable
export const mastra = new Mastra({
  agents: { conversationAgent },
  // Mastra automatically emits spans, metrics, and logs for agent runs. The
  // platform exporter makes those signals available in Mastra Observability,
  // independently of whether they originated from the API or Studio.
  // observability: new Observability({
  //   configs: {
  //     default: {
  //       serviceName: 'neoai-api',
  //       // A Worker can be reclaimed as soon as it sends the response. Flush each
  //       // event immediately instead of relying on the exporter's timer.
  //       exporters: [
  //         new MastraPlatformExporter({
  //           accessToken: env.MASTRA_PLATFORM_ACCESS_TOKEN,
  //           projectId: env.MASTRA_PROJECT_ID,
  //           maxBatchSize: 1,
  //         }),
  //       ],
  //       logging: { enabled: true, level: 'info' },
  //       spanOutputProcessors: [new SensitiveDataFilter()],
  //     },
  //   },
  // }),
})
