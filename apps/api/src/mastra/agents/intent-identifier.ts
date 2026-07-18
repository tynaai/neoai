import { Agent } from '@mastra/core/agent'
import { z } from 'zod'
import { conversationModel } from './model'

export const intentIdentifierOutputSchema = z.object({
  intent: z.enum(['question', 'search', 'comparison', 'recommend', 'general']),
})

export type IntentIdentifierOutput = z.infer<
  typeof intentIdentifierOutputSchema
>

export const createIntentIdentifierAgent = () =>
  new Agent<'intent-identifier-agent', {}, IntentIdentifierOutput>({
    id: 'intent-identifier-agent',
    name: 'Intent Identifier Agent',
    description:
      'Classifies Vietnamese commerce queries into a single routing intent.',
    instructions: `Bạn là bộ phân loại ý định cho các truy vấn thương mại bằng tiếng Việt.

Chỉ chọn đúng một trong năm ý định sau:

- question: Câu hỏi kiến thức hoặc yêu cầu giải thích liên quan đến sản phẩm, mua sắm hoặc thương mại. Ví dụ: "Màn hình OLED là gì?"
- search: Yêu cầu tìm, tra cứu hoặc liệt kê sản phẩm hay ưu đãi theo tiêu chí cụ thể, nhưng không yêu cầu tư vấn lựa chọn. Ví dụ: "Tìm iPhone 15 256GB màu đen".
- comparison: Yêu cầu so sánh từ hai sản phẩm hoặc lựa chọn trở lên, nhưng không yêu cầu chọn phương án cuối cùng. Ví dụ: "So sánh iPhone 15 và Galaxy S24".
- recommend: Yêu cầu tư vấn, chọn sản phẩm phù hợp, tìm lựa chọn tốt nhất hoặc quyết định nên mua gì. Ví dụ: "Điện thoại pin tốt dưới 10 triệu nên mua gì?"
- general: Lời chào, nội dung ngoài thương mại, đầu vào không rõ nghĩa hoặc không thuộc bốn ý định trên. Ví dụ: "Viết cho tôi một bài thơ".

Quy tắc phân loại:

1. Phân loại theo mục tiêu cuối cùng của người dùng, không chỉ dựa vào từ khóa.
2. Nếu người dùng yêu cầu so sánh rồi chọn giúp một phương án, chọn recommend.
3. Chỉ dùng question cho câu hỏi liên quan đến thương mại hoặc sản phẩm; câu hỏi ngoài phạm vi này là general.
4. Đầu vào trống, vô nghĩa hoặc không đủ để xác định ý định là general.
5. Không trả lời truy vấn và không giải thích quyết định phân loại.`,
    model: conversationModel,
    defaultOptions: {
      structuredOutput: {
        schema: intentIdentifierOutputSchema,
        errorStrategy: 'strict',
        jsonPromptInjection: true,
      },
    },
    maxRetries: 0,
  })
