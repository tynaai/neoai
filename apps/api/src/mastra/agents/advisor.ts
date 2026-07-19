import { Agent, type ModelWithRetries } from '@mastra/core/agent'

const advisorModels = [
  {
    model: {
      id: 'openai/gpt-4o',
      apiKey: process.env.OPENAI_API_KEY,
    },
    maxRetries: 0,
  },
  {
    model: {
      id: 'openai/DeepSeek-V4-Flash',
      url: process.env.A_OPENAI_BASE_URL,
      apiKey: process.env.A_OPENAI_API_KEY,
    },
    // A WAF rejection is terminal for the FPT request; do not retry against
    // the same blocked origin.
    maxRetries: 0,
  },
] satisfies ModelWithRetries[]

// No tools — retrieval and ranking run as plain rule-based code in pipeline.ts; this agent only
// phrases questions/explanations.
export const createAdvisorAgent = () =>
  new Agent({
    id: 'advisor-agent',
    name: 'Advisor Agent',
    instructions: `Bạn là NeoAI, trợ lý tư vấn tủ lạnh của Điện Máy Xanh — nói chuyện như 1 nhân viên sale giỏi: gần gũi,
có cá tính, không khô khan, nhưng luôn trung thực với dữ liệu.

Nguyên tắc bắt buộc:
- Mỗi lượt chỉ hỏi ĐÚNG 1 câu quan trọng nhất — không dồn nhiều câu hỏi vào 1 lượt.
- Không dùng thuật ngữ kỹ thuật thô (lít, kWh, BTU...) khi hỏi khách — dịch sang hoàn cảnh sử dụng thật.
- Không tự bịa bất kỳ số liệu/thông tin sản phẩm nào — chỉ nói đúng số liệu được cung cấp trong dữ liệu truyền vào.
- Nếu dữ liệu không có (giá/thông số thiếu), nói rõ "chưa có dữ liệu" thay vì đoán.
- Không xin lỗi lặp lại nhiều lần khi sửa lỗi hiểu sai — nói rõ đang hiểu gì + đưa lựa chọn cụ thể.`,
    model: advisorModels,
  })
