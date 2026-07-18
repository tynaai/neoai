## Kỹ thuật công nghệ

**Monorepo**: Turborepo 2.10 + pnpm workspace (pnpm 10.16.1) — `apps/api` (BE), `apps/web` (FE), `packages/` hiện trống.

**Backend (`apps/api`)**:
- Framework: **Mastra** (`@mastra/core` 1.51) — server HTTP layer của Mastra dựa trên Hono bên trong (không thấy `hono` là dependency trực tiếp)
- Agent placeholder cũ `conversation-agent` (`src/mastra/agents/conversation.ts`) vẫn còn nguyên, dùng cho `/api/chat` generic — **KHÔNG đụng tới**.
- **Advisor pipeline tủ lạnh — ĐÃ TRIỂN KHAI THẬT** (`src/mastra/advisor/*`, agent riêng `agents/advisor.ts`), route `POST /api/advisor/chat` — **stream NDJSON thật** (đã đổi từ JSON 1 khối sang stream, dùng `Agent.stream()` của Mastra): dòng đầu tiên `{"type":"meta",...}` chứa data đã tính xong (products/needMoreInfo/widenedBudget/done) — gửi TRƯỚC khi gọi LLM render, để panel phải hiện ngay không cần đợi text; sau đó các dòng `{"type":"text-delta","delta":"..."}` stream dần câu trả lời (STEP 7); cuối cùng `{"type":"done"}`. `pipeline.ts` export `runAdvisorPipelineStream()` trả `{ meta, textStream }` (`textStream` lấy từ `stream.textStream` của `Agent.stream()`), route handler ở `mastra/index.ts` tự ghép NDJSON qua `ReadableStream` + `c.body()`. Test qua cả curl (xác nhận đúng thứ tự dòng) và browser thật (product card hiện ngay khi bong bóng chat còn đang gõ "...", không phải đợi cả câu xong):
  - `slot-schema.ts` — SPIN slot config cho tủ lạnh (budget → household_size → priority), `resolveNextSlot()` deterministic
  - `repair.ts` — regex detect rule-based (đã sửa 1 bug thật: `\b` của JS coi ký tự có dấu tiếng Việt là non-word char, làm boundary sai lệch — phải dùng lookaround `\p{L}` + flag `u`)
  - `facts.ts` — parse số liệu chuẩn hóa (dung tích/số người/điện năng/inverter) từ `specs` jsonb tại query-time bằng JS (không đụng schema `products`); phát hiện 2 bug dữ liệu thật khi test: (1) "Dung tích sử dụng" đôi khi gộp cả lít lẫn số người trong 1 string, lấy max ẩu sẽ ra nhầm số lít; (2) field điện năng lẫn lộn đơn vị (kWh/năm vs kW/ngày vs W vs sao) giữa các hãng — chỉ tin đúng "kWh/năm", còn lại trả null thay vì đoán
  - `retrieval.ts` — hybrid retrieval: SQL filter giá (cột `priceCurrent` có sẵn) + widen tự động khi rỗng (out-of-budget → gợi ý gần nhất)
  - `wsum.ts` — WSUM 100% rule-based, 3 vai trò top-3, tiêu chí theo priority khách chọn
  - `upsell.ts` — rule tìm candidate +10%, chỉ mồi khi có diff đo lường được thật
  - `pipeline.ts` — orchestrator nối toàn bộ STEP 1→7 bằng function thuần (không dùng Mastra Workflow DSL, đơn giản hóa cho kịp thời gian — vẫn giữ đúng nguyên tắc tách rule-based khỏi LLM)
  - `session-state.ts` — đọc/ghi bảng `conversation_state` mới (xem dưới)
  - Đã test thật qua browser thật (Playwright + Chrome hệ thống), không chỉ curl — bắt được 2 bug chỉ lộ khi chạy UI thật: CORS (origin `*` + `credentials:true` bị Hono từ chối, sửa bằng reflect-origin function) và household_size không thực sự lọc kết quả (đã sửa, xem `pipeline.ts`)
- LLM: model id `openai/DeepSeek-V4-Flash` qua FPT Cloud — endpoint này **không hỗ trợ `strictJsonSchema`** (lỗi `Unsupported parameter(s)`), phải dùng `structuredOutput: { jsonPromptInjection: true }` thay vì response_format mặc định
- Memory: `@mastra/memory` cho `conversation-agent` cũ; advisor pipeline dùng **bảng riêng** `conversation_state` (Postgres, migration `0002`/`0003`) chứ không dùng Mastra Memory — vì cần structured state (`searchFilters` jsonb, `excludedIds`/`lastShownIds` text[], `hasUpsold` bool) mà Memory mặc định không có
- DB: PostgreSQL qua Neon serverless + Drizzle — schema (`src/db/schema.ts`) có bảng auth + **`products`** (1692 tủ lạnh, **giữ nguyên, KHÔNG đổi schema/data phase này** — mở rộng 119 category từ `products_detail.json` để phase sau) + **`conversation_state`** (mới, cho advisor pipeline) + vector index `product_embeddings` và `policy_embeddings` (đã seed thật, chưa dùng trong pipeline — để phase sau)
- Auth: `better-auth` + `@better-auth/drizzle-adapter`
- Observability: `@mastra/observability` có sẵn sensitive-data filter
- Route: `/api/auth/*`, `/api/me`, `/api/chat` (agent cũ) + **`/api/advisor/chat` (mới, thật)**
- **CORS đã sửa bug thật**: cors config cũ dùng `origin: [array chứa '*', ...]` — Hono chỉ hiểu `'*'` là wildcard khi nó là string thuần, không phải 1 phần tử trong array, nên browser thật bị chặn (`credentials:true` + không match origin). Đã sửa bằng function reflect-origin. Bug này tồn tại từ trước, chỉ lộ ra khi FE lần đầu gọi API thật qua browser (trước đó `AiChatPanel` toàn mock, không có request cross-origin nào).

**Frontend (`apps/web`)**:
- Vite 8 + React 19 + TypeScript, deploy qua Cloudflare Workers (Wrangler)
- **`App.tsx` đã thay hoàn toàn mock flow bằng real flow** — `RealChatPanel` (trái) + `RealResultsPanel` (phải), không còn dùng `mock-data.ts`/`enriched-mock-data.ts`/`AiChatPanel`/`ResultsPanel` cũ (các file cũ vẫn còn trong repo, không xoá, chỉ không import nữa). `CompareView`/`ProductDetail`/`StockCheck` (gắn với mock `Product` type máy lạnh) tạm thời không còn wired vào main flow — cần rebuild với data thật nếu muốn dùng lại.
- `lib/advisor-api.ts` — client đọc NDJSON stream từ `/api/advisor/chat` (base URL qua `VITE_ADVISOR_API_URL`, mặc định `http://localhost:4112`) qua `res.body.getReader()` + `TextDecoder`, tách từng dòng, gọi callback `onMeta`/`onTextDelta`/`onDone` tương ứng — không còn `await res.json()` 1 khối như trước
- `components/advisor/real-chat-panel.tsx` — chat thật dùng lại `ai-elements/{conversation,message,prompt-input}.tsx` có sẵn (trước đó build xong nhưng chưa wire vào đâu) + `motion/react` cho animation bubble/typing-indicator. Bong bóng assistant hiện ngay (rỗng) khi gửi câu hỏi, nối dần text theo từng `text-delta` (hiệu ứng gõ chữ thật, không phải giả lập timer); `onResponse` (cập nhật panel phải) gọi ngay tại `onMeta` — TRƯỚC khi text stream xong
- `components/advisor/real-product-card.tsx` + `real-results-panel.tsx` — panel phải hiển thị top-3 tủ lạnh thật (role badge, giá/dung tích/số người/điện năng/inverter, khuyến mãi, link thật), `motion` cho enter/exit/reorder (thay `useFlip` cũ)
- Animation: **`motion`** (rebrand của framer-motion) — dùng thật cho card xuất hiện/re-rank ở panel phải + typing indicator + message bubble entrance. Không thêm icon lib riêng (iconify) hay `react-markdown` riêng — `lucide-react` và `streamdown`/`ai-elements` đã cover đủ.

**3 công cụ nền tảng nên dùng đúng theo stack thật (thay vì tự viết tay):**
- **Mastra Workflow**: hỗ trợ sẵn việc tách step deterministic (code thuần) và step agent (gọi LLM) trong cùng 1 workflow — đúng nguyên tắc "tách quyết định khỏi diễn đạt" đã chốt nhiều lần trong SPEC.md. Khuyến nghị chính thức của Mastra: *"start with deterministic code and only introduce an agent at the specific points where human-like reasoning is required."* ([Mastra Docs — Agents and tools](https://mastra.ai/docs/workflows/agents-and-tools))
- **Vercel AI SDK `generateObject` + Zod**: ép LLM trả đúng cấu trúc JSON (search_filters, next_slot render, is_rejection...), tự validate + retry nếu sai format — không cần tự viết parser/regex để bóc JSON từ text LLM trả về.
- **`@mastra/rag`** (2.4.1, **ĐÃ THÊM vào `package.json` của `apps/api`**) — package RAG riêng của Mastra, tự triển khai toàn bộ pipeline bằng API riêng: chunking (recursive/sliding window), embedding qua `ModelRouterEmbeddingModel`, vector store abstraction dùng chung 1 interface cho nhiều backend (pgvector, Pinecone, Qdrant, MongoDB, LibSQL), `createVectorQueryTool` (biến truy vấn vector thành tool cho agent tự gọi kèm filter/rerank), có cả GraphRAG. ([Mastra Docs — RAG Overview](https://mastra.ai/docs/rag/overview), [npm @mastra/rag](https://www.npmjs.com/package/@mastra/rag?activeTab=readme))
  - **Gợi ý hạ tầng**: nên chọn **pgvector** làm vector store vì project đã sẵn Postgres qua Neon (`@neondatabase/serverless`) + Drizzle — gộp chung 1 DB cho cả catalog (structured) lẫn vector (RAG), không cần thêm service Qdrant/Weaviate riêng như từng liệt kê trong SPEC.md, đơn giản hạ tầng đáng kể cho 48h hackathon.

**Kết luận nhanh**: **Đã triển khai thật + test end-to-end (backend qua curl, frontend qua browser thật với Playwright)** toàn bộ pipeline SPIN + hybrid retrieval + WSUM cho category tủ lạnh (Paintpoint 2 gần như trọn vẹn, Paintpoint 3 phần lõi — trừ upsell mới test rule logic chưa test qua hội thoại thật, và review/policy/RAG chưa nối vào pipeline). Còn thiếu/chưa làm: mở rộng đa category (119 category từ `products_detail.json`, đã có data + backup plan, chưa migrate), nối `product_embeddings`/`policy_embeddings` vào retrieval (hiện chỉ dùng SQL filter, chưa dùng vector search cho mô tả/policy), CompareView/ProductDetail/StockCheck chưa rebuild với data thật, RAGAS/DeepEval faithfulness check (Nhóm 3 Metric) chưa làm.

---

## Pipeline tổng thể — RAG + Tool Calling, kèm vị trí từng Paintpoint lớn trong flow

```mermaid
flowchart TD
    Start(["User nhập câu hỏi - turn N"]) --> S1

    S1["STEP 1 — Repair detection<br/>rule-based, KHÔNG gọi LLM<br/>regex/keyword phủ định quét trước"]:::pp2
    S1 -->|match| Repair["Nhánh repair riêng<br/>nhắc lại đang hiểu gì + đưa 2-3 lựa chọn cụ thể"]:::pp2
    Repair --> S7
    S1 -->|không match| S2

    S2["STEP 2 — Extract delta filter<br/>generateObject + Zod<br/>chỉ trích PHẦN MỚI từ câu hỏi hiện tại"]:::pp2
    S2 --> S2b

    S2b["STEP 2b — Rejection check<br/>generateObject riêng: is_rejection boolean<br/>true -> append excluded_ids"]:::pp3
    S2b --> S3

    S3["STEP 3 — Session append (code thuần)<br/>merge search_filters mới vào session cũ<br/>check tín hiệu đổi category -> reset nếu có"]:::pp2
    S3 --> S4

    S4["STEP 4 — resolveNextSlot deterministic<br/>KHÔNG gọi LLM<br/>quét slot ưu tiên cao nhất còn thiếu theo config category"]:::pp2
    S4 --> S5

    S5["STEP 5 — Tool calling: Hybrid Retrieval<br/>structured query SQL cho giá/RAM/category (excluded_ids nhét vào WHERE)<br/>RAG vector search cho mô tả/review/policy"]:::pp3
    S5 --> S6

    S6{"STEP 6 — Check kết quả (rule-based)<br/>count==0 hoặc lệch hard filter?"}:::pp2
    S6 -->|rỗng hoặc lệch| S4
    S6 -->|có kết quả| S6b

    S6b["STEP 6b — WSUM scoring + gán top-3<br/>3 vai trò: phù hợp nhất / rẻ nhất đạt ngưỡng / tiêu chí model tự chọn<br/>100% rule-based, không LLM"]:::pp3
    S6b --> S7

    S7["STEP 7 — Render 2 panel<br/>trái: LLM render câu hỏi từ slot đã chọn ở STEP 4<br/>phải: product card + trade-off (re-generate nếu lặp lại) + upsell tối đa 1 lần"]:::pp1
    S7 --> Next(["User trả lời tiếp / chê sản phẩm"])
    Next --> S1

    classDef pp1 fill:#f9e79f,stroke:#b7950b,color:#000
    classDef pp2 fill:#aed6f1,stroke:#2874a6,color:#000
    classDef pp3 fill:#a9dfbf,stroke:#1e8449,color:#000
```

**Chú giải màu**: 🟨 vàng = Paintpoint 1 (AI-Native, cross-cutting — không nằm ở 1 step riêng, mà là thuộc tính của cả pipeline này có tồn tại hay không; đúng litmus test đã note, gỡ pipeline này ra là chatbot sụp hoàn toàn, không phải lớp phủ) · 🟦 xanh dương = Paintpoint 2 (Hỏi mơ hồ) · 🟩 xanh lá = Paintpoint 3 (Recommend)

---

# Paintpoint 1 — Chatbot chưa phải AI-Native

Đây là paintpoint tổng quát/framing, không tách thành vấn đề nhỏ riêng — thể hiện xuyên suốt toàn bộ pipeline ở trên (xem STEP 7 — Render), không nằm ở 1 step cụ thể. Nếu làm đủ 4 tiêu chí AI-native đã note trong SPEC.md (data architecture riêng, AI có quyền ghi/hành động, quyết định nằm trong vòng lặp AI tách khỏi model, tích hợp xuyên chức năng), chatbot sẽ tự động đạt được, không cần giải pháp kỹ thuật độc lập cho riêng paintpoint này.

**Chưa có trong SPEC.md**: không có mục "Giải Pháp Kĩ Thuật" riêng cho paintpoint này (đã bị lược bớt trong 1 lần user tự sửa file) — chỉ còn litmus test + tham khảo Google AI Mode.

---

# Paintpoint 2 — User không biết hỏi gì, hỏi mơ hồ, thiếu ngữ cảnh

### Vấn đề nhỏ 1: Không biết hỏi câu gì đúng trọng tâm, dễ hỏi dồn hết 1 lần
→ **ĐÃ TRIỂN KHAI THẬT** (`src/mastra/advisor/slot-schema.ts`) — 3 slot cho tủ lạnh: `budget` (100) → `household_size` (90, dịch từ "dung tích" sang "số người trong nhà") → `priority` (80). `resolveNextSlot()` deterministic, test qua browser thật hỏi đúng thứ tự.
→ **Giải quyết bằng** (thiết kế gốc, tách thành **2 step riêng biệt trong Mastra Workflow**):
- **Step deterministic** (code thuần, KHÔNG gọi LLM): `resolveNextSlot(state, schema)` quét slot ưu tiên cao nhất còn thiếu, theo config JSON định nghĩa sẵn theo từng category. **Quy ước ưu tiên**: `budget` (ngân sách) luôn priority cao nhất — universal cho mọi category, vì khách vào 1 gian hàng cụ thể thường đã có sẵn khoảng ngân sách trong đầu và đây là đòn bẩy thu hẹp catalog mạnh nhất (bỏ qua nếu khách đã tự nói ngân sách trong câu đầu); `buyer_type` (dùng/tặng) priority kế tiếp, chỉ bật cho category hay mua tặng (laptop, điện thoại...) vì rẽ nhánh cả cấu trúc câu hỏi phía sau
- **Step agent** (có gọi LLM): nhận slot đã được quyết định sẵn từ step trên, chỉ render thành câu hỏi tự nhiên — không tự chọn slot. Tông giọng: gần gũi, có cá tính, không khô khan thuần túy (guideline khi viết prompt/few-shot, không đổi kiến trúc)

### Vấn đề nhỏ 2: Phải chờ đủ thông tin mới có kết quả, trải nghiệm chậm/khô khan
→ **ĐÃ TRIỂN KHAI THẬT** (`src/mastra/advisor/pipeline.ts` STEP 2/5) — search ngay từ câu đầu tiên (chỉ cần category, ở đây fixed = tủ lạnh), hiện panel phải mỗi lượt, không chờ đủ 3 slot.
→ **Giải quyết bằng** (thiết kế gốc): Search sớm, tinh chỉnh liên tục. Extract `search_filters` bằng **`generateObject` (Vercel AI SDK) + Zod schema** — ép LLM trả đúng cấu trúc, tự validate/retry nếu sai format, không tự viết parser JSON thủ công. Đây là step RIÊNG với step render câu hỏi ở Vấn đề nhỏ 1, search lại catalog mỗi lượt để cập nhật panel phải.

### Vấn đề nhỏ 3: Search ra kết quả rỗng/sai lệch nhưng vẫn trả lời bừa
→ **ĐÃ TRIỂN KHAI THẬT** (`retrieval.ts` + `pipeline.ts` STEP 6) — test thật với "dưới 500 nghìn" (không sản phẩm nào khớp): tự động widen bỏ ràng buộc giá, trả sản phẩm gần nhất kèm `widenedBudget=true`, LLM được ép nói rõ "không khớp đúng ngân sách" thay vì giả vờ khớp.
→ **Giải quyết bằng** (thiết kế gốc): Check kết quả trước khi show (retrieval evaluator rule-based) — `count(results)==0` hoặc lệch hard filter thì set `needMoreInfo=true`, chuyển hỏi thêm thay vì để LLM "chữa cháy" bằng câu trả lời chung chung.

### Vấn đề nhỏ 4: Bot hiểu sai ý khách mà không tự phát hiện/sửa
→ **ĐÃ TRIỂN KHAI THẬT** (`src/mastra/advisor/repair.ts`) — regex rule-based, set `repairMode=true`, ép LLM trả đúng 2 bước (nhắc lại hiểu gì + 2-3 lựa chọn cụ thể). Test qua 8 case (kể cả case "không phải chạy êm mà cần công suất mạnh" — đúng như lo ngại của PLAN.md, KHÔNG trigger repair) — pass hết.
**Bug thật đã gặp và sửa**: JS `\b` coi ký tự có dấu tiếng Việt (ý, đ, ế...) là non-word character → boundary đặt sai vị trí → `/\bý em là/` không bao giờ match "ý em là" dù đúng cụm từ. Sửa bằng lookaround Unicode-aware (`(?<![\p{L}\p{N}])`/`(?![\p{L}\p{N}])` + flag `u`) thay cho `\b`.
→ **Giải quyết bằng** (thiết kế gốc): Repair — detect bằng regex/keyword phủ định trước khi vào LLM (`"không phải"`, `"sai rồi"`...), set `repairMode=true`, ép LLM trả lời theo đúng 2 bước: nhắc lại đang hiểu gì + đưa 2-3 lựa chọn cụ thể.

### Vấn đề nhỏ 5: AI tự quyết định hỏi gì → thiếu nhất quán qua nhiều lần chạy
→ **ĐÃ TRIỂN KHAI THẬT** — cùng cơ chế Vấn đề nhỏ 1, `resolveNextSlot()` không phải LLM nên luôn nhất quán.
→ **Giải quyết bằng** (thiết kế gốc): Tách "quyết định hỏi gì" (rule/config, chính là `resolveNextSlot()` ở Vấn đề nhỏ 1) khỏi "diễn đạt câu hỏi" (LLM) — LLM không có quyền tự chọn slot để hỏi. Đây là cùng 1 cơ chế với Vấn đề nhỏ 1, không phải giải pháp riêng.

### Vấn đề nhỏ 6: Bỏ lỡ cơ hội tăng giá trị đơn hàng, hoặc mồi thêm gây khó chịu nếu làm ẩu
→ **ĐÃ TRIỂN KHAI THẬT** (`src/mastra/advisor/upsell.ts`) — field-diff cho tủ lạnh: dung tích/Inverter/điện năng (3 field ảnh hưởng quyết định thật, không diff toàn bộ spec). Rule +10%, chỉ mồi khi có diff đo được, `hasUpsold` lưu trong `conversation_state` để không lặp. **Chưa test qua hội thoại thật dài đủ để trigger case này** — mới verify logic qua code review, chưa thấy trong browser test.
→ **Giải quyết bằng** (thiết kế gốc): Upsell rule tìm candidate (cùng category, giá cao hơn **tối đa +10%** so với sản phẩm đang đề xuất — siết từ mức +10-20% ban đầu để giảm cảm giác bị ép mua) + diff spec tính bằng so sánh field-by-field, LLM chỉ diễn giải diff có sẵn. Giới hạn tối đa 1 lần/hội thoại, không lặp lại nếu khách từ chối.

### Vấn đề nhỏ 7: Xử lý từ viết tắt, sai chính tả, thiếu dấu, từ ngữ địa phương
→ **Giải quyết bằng**: chưa có, cần bổ sung.

### Vấn đề nhỏ 8: Phát hiện đổi category giữa chừng hội thoại (vd đang hỏi máy lạnh nhảy sang hỏi tủ lạnh)
→ **Chưa áp dụng được** — hiện chỉ có 1 category thật (tủ lạnh), không có category thứ 2 để đổi sang. Cần data đa category (đã có sẵn `products_detail.json`, 119 category, chưa migrate — xem phần Backend ở trên) mới triển khai được cơ chế reset session này.
→ **Giải quyết bằng** (thiết kế gốc): chỉ coi là đổi category khi từ khóa trích được là 1 category khác (tủ lạnh, máy lạnh, laptop...) — tên hãng (Panasonic, Dell...) hay thuộc tính khác luôn được hiểu là filter thêm vào category hiện tại, KHÔNG kích hoạt reset session.

---

# Paintpoint 3 — Recommend (Không biết chọn sản phẩm nào)

### Vấn đề nhỏ 1: Filter số liệu (giá, RAM, diện tích...) dễ sai lệch nếu chỉ dùng vector search/RAG
→ **ĐÃ TRIỂN KHAI THẬT (1 phần)** (`src/mastra/advisor/retrieval.ts` + `facts.ts`) — giá filter bằng SQL (`priceCurrent` cột thật); dung tích/số người/điện năng/inverter KHÔNG filter bằng vector search mà parse trực tiếp từ `specs` jsonb bằng JS tại query-time (products schema đóng băng, không thêm cột) — vẫn đúng tinh thần "không dùng vector cho số liệu", chỉ khác chỗ thực thi (JS thay vì SQL). **Chưa dùng `product_embeddings`/vector search** cho phần mô tả/review/so sánh mập mờ — RAG chưa nối vào pipeline.
→ **Giải quyết bằng** (thiết kế gốc): Hybrid retrieval — trường định lượng query có cấu trúc (SQL/filter) trực tiếp vào catalog qua tool-calling, không dùng vector search cho phần này. RAG chỉ dùng cho dữ liệu không có cấu trúc rõ (mô tả, tóm tắt review, so sánh mập mờ với đồ đang dùng, policy/FAQ).

### Vấn đề nhỏ 2: Dữ liệu catalog không có cấu trúc rõ, dễ embed sai cách làm loãng vector
→ **Giải quyết bằng**: Quy tắc chia field khi đưa vào vector DB — field text/mô tả ghép thành 1 đoạn văn bản rồi mới embed; field số liệu VÀ field động (giá, tồn kho, khuyến mãi...) để làm metadata/cột structured đi kèm, không đưa vào text để embed (số liệu làm loãng ngữ nghĩa vector, field động khiến vector bị stale khi dữ liệu đổi); không nhúng nguyên JSON thô cả sản phẩm.

**ĐÃ TRIỂN KHAI THẬT** — `apps/api/scripts/all-products.ts`, seed 1692 sản phẩm tủ lạnh thật từ ĐMX (`apps/data/all-products.md`), chạy 1 lần qua `bun run seed:products` (mặc định dry-run, cần `CONFIRM_SEED=yes` mới ghi thật/tốn phí OpenAI):
- Bảng `products` (Drizzle) đã tạo thật trên Neon qua migration `0001_young_big_bertha.sql`
- Vector index `product_embeddings` (PgVector qua `@mastra/rag` + `text-embedding-3-small`, 1536 chiều) — đặt tên KHÁC bảng Drizzle `products` để tránh trùng
- 3 bug thực tế đã gặp và sửa khi test (không phải lý thuyết, đây là bug thật đã chạy ra lỗi thật):
  1. **Regex frontmatter neo `^` vào đầu chuỗi** trong khi mỗi block markdown có dòng `<!-- rag-document: ... -->` đứng trước `---` → parse fail 100% (0/1692) → sửa: bỏ neo `^`, chỉ tìm `---...---` xuất hiện đầu tiên trong block
  2. **Đặt trùng tên** `VECTOR_INDEX_NAME = 'products'` với bảng Drizzle `products` (không có cột `embedding`) → PgVector tưởng bảng đã tồn tại, tạo index lên cột không có thật → lỗi `column "embedding" does not exist` → sửa: đổi tên index thành `product_embeddings`
  3. **Text embed vô tình nhúng field động** (`Khuyến mãi`) — vi phạm chính quy tắc đã đặt ra ở trên → sửa: bỏ khỏi `embeddingText`, chỉ giữ ở cột `promotions` structured
- Dữ liệu thật phát hiện được: chỉ ~15% sản phẩm (252/1692) có giá trong dataset gốc — xác nhận nguyên tắc "không tự bịa dữ liệu" (Vấn đề nhỏ 7 bên dưới) là nhu cầu thật trong dữ liệu thật, không phải giả định lý thuyết.

### Vấn đề nhỏ 3: Sản phẩm hợp lệ lặp lại qua nhiều lượt hội thoại dễ bị hiểu nhầm là lỗi/duplicate
→ **ĐÃ TRIỂN KHAI THẬT** (`session-state.ts` + bảng `conversation_state` mới, cột `excluded_ids`/`last_shown_ids`) — test thật qua browser: chê sản phẩm → `excludedIds` append → không xuất hiện lại. Explanation luôn re-generate mỗi lượt (không cache) vì `renderMessage()` luôn build lại từ dữ liệu candidate hiện tại, không lưu text cũ.
→ **Giải quyết bằng** (thiết kế gốc): Session state append theo từng lượt — LLM chỉ trích phần MỚI từ câu hỏi hiện tại, BE tự append vào `search_filters` (từ nội dung hội thoại) và `excluded_ids` qua **1 step LLM structured-output riêng biệt** (`generateObject` trả `{ is_rejection: boolean }`, tách hẳn khỏi step trích `search_filters` chính). `excluded_ids` áp trực tiếp vào điều kiện query DB (`WHERE id NOT IN`) ở STEP 5 của pipeline.

Phân biệt rõ 2 loại dedup, không nhầm lẫn:
- Loại bỏ sản phẩm bị chê (session exclusion) → xử lý ở bước query DB
- Chặn trùng giữa các slot trong CÙNG 1 response (2 slot cùng trỏ 1 product_id) → lỗi logic ranking thật, chặn ở bước gán tiering (STEP 6b — xem Vấn đề nhỏ 4)

**Không nên làm**: FE tự lọc bỏ product_id đã từng hiển thị ở lượt trước — sản phẩm hợp lệ vẫn thỏa điều kiện mới thì NÊN xuất hiện lại (đúng nguyên tắc "không đảo lộn danh sách mỗi lần tinh chỉnh"), lọc mù quáng theo lịch sử hiển thị có thể giấu mất đúng sản phẩm phù hợp nhất.

Khi sản phẩm lặp lại hợp lệ qua nhiều turn: bắt buộc re-generate explanation theo context mới (không cache lời giải thích cũ) + bot chủ động báo continuity ("mẫu này em đã gợi ý ở trên, giờ vẫn phù hợp với yêu cầu mới").

### Vấn đề nhỏ 4: Cách chọn top-3 theo 3 vai trò (phù hợp nhất/rẻ nhất/tiêu chí model tự chọn)
→ **ĐÃ TRIỂN KHAI THẬT** (`src/mastra/advisor/wsum.ts`) — đúng thuật toán bên dưới (chuẩn hóa min-max, trọng số theo priority, 3 vai trò, validate không trùng product_id/graceful degradation). Test qua nhiều kịch bản thật (đủ 3 slot, thiếu slot, ngân sách quá thấp) — ra kết quả hợp lý, không trùng sản phẩm giữa 3 slot.
→ **Giải quyết bằng** (thiết kế gốc): thuật toán WSUM (Weighted Sum Model) — 100% rule-based, không LLM, chạy tại STEP 6b:
1. **Chuẩn hóa**: đưa từng tiêu chí (giá, hiệu suất, độ ồn...) về cùng thang [0,1] dựa trên min/max của chính candidate pool hiện tại — tiêu chí "càng thấp càng tốt" dùng `(max-value)/(max-min)`, "càng cao càng tốt" dùng `(value-min)/(max-min)`
2. **Gán trọng số**: theo priority khách đã nêu qua SPIN (vd "ưu tiên tiết kiệm điện" → tăng trọng số tiêu chí hiệu suất năng lượng), cấu hình sẵn theo category
3. **Tính điểm tổng**: `score = Σ(norm_i × weight_i) / Σ(weight_i)`
4. **Slot 1 "phù hợp nhất"** = candidate có score cao nhất toàn pool
5. **Slot 2 "rẻ nhất đạt ngưỡng"** = trong các candidate còn lại có score ≥ ngưỡng tối thiểu (config được), chọn giá thấp nhất
6. **Slot 3 "tiêu chí model tự chọn"** = trong các candidate còn lại, tính độ chênh lệch (range) từng tiêu chí trên giá trị đã chuẩn hóa, loại các tiêu chí đã dùng làm nhãn ở Slot 1/2 (tránh lặp câu chuyện), chọn tiêu chí có chênh lệch lớn nhất làm nhãn, rồi chọn candidate tốt nhất theo đúng tiêu chí đó
7. **Validate không trùng**: check 3 slot có 3 `product_id` khác nhau — nếu candidate pool quá nhỏ khiến 2 slot trùng nhau, không ép trùng mà hiện ít hơn 3 card (graceful degradation)

### Vấn đề nhỏ 5: Khi out rank thì sao (không có sản phẩm đáp ứng toàn bộ yêu cầu)
→ **ĐÃ TRIỂN KHAI THẬT** (`retrieval.ts` — widen tự động khi query có ràng buộc giá trả về 0 dòng) — test thật "tủ lạnh dưới 500 nghìn": trả về 3 sản phẩm gần nhất + `widenedBudget=true`, LLM báo rõ đây không phải khớp đúng ngân sách.
→ **Giải quyết bằng** (thiết kế gốc): gợi ý sản phẩm gần đạt yêu cầu nhất.

### Vấn đề nhỏ 6: Truy xuất đầy đủ giá, khuyến mãi, tồn kho, review và chính sách
→ **Giải quyết bằng**: giá + khuyến mãi đã nối vào pipeline thật (cột `priceCurrent`/`promotions` của `products`). Tồn kho không có trong nguồn dữ liệu (không phải chưa làm — API tồn kho thật không nằm trong dataset hackathon). Review/rating + policy: **có data thật rồi nhưng CHƯA nối vào pipeline** — `products_detail.json` (119 category) có `rating_vote`/`quantity_sold`, và `policy_embeddings` (7 file chính sách) đã seed thật qua `scripts/policy.ts` — cả 2 đều là việc phase sau.

### Vấn đề nhỏ 7: Không tự bịa thông tin sản phẩm
→ **ĐÃ TRIỂN KHAI THẬT (claim định lượng)** — `renderMessage()` trong `pipeline.ts` chỉ được truyền đúng field thật đã tính sẵn (giá, dung tích, điện năng, inverter), prompt ép rõ "CHỈ được dùng đúng số liệu dưới đây". `facts.ts` còn chủ động trả `null` thay vì đoán khi đơn vị dữ liệu không rõ ràng (vd điện năng lẫn đơn vị kWh/năm vs kW/ngày giữa các hãng) — thà thiếu còn hơn sai. FE hiện `UnavailableTag` ("Chưa có dữ liệu") khi field null thay vì che giấu.
→ **Giải quyết bằng** (thiết kế gốc): tách theo loại claim —
- Claim định lượng (giá, thông số): rule-based so khớp trực tiếp với catalog thật, chạy live trong pipeline
- Claim định tính ("chạy êm", "dễ vệ sinh"): RAGAS/DeepEval (claim decomposition + NLI/LLM-judge) — xem mục `## Test` ở cuối file, không bắt buộc chạy đồng bộ mỗi request live vì tốn latency, phù hợp làm công cụ đo lường định kỳ hơn. **Chưa làm** — claim định tính không được kiểm tra tự động.

---

## Test — cần validate độc lập trước khi coi là guardrail chính thức

**Faithfulness / grounding check (claim định tính)**
- Input: câu giải thích trade-off đã sinh ra cho từng sản phẩm trong top-3 (từ STEP 7)
- Cần test: claim định tính ("chạy êm", "dễ vệ sinh") qua RAGAS/DeepEval (claim decomposition + NLI/LLM-judge) — claim định lượng đã có rule-based chạy live, không cần test riêng ở đây
- Lý do để offline, không bắt buộc chạy live mỗi request: RAGAS/DeepEval dùng NLI/LLM-judge khá tốn latency nếu chạy trên MỌI request — hợp lý hơn khi coi đây là công cụ đo lường chất lượng định kỳ (chạy trên tập test), không phải guardrail đồng bộ mỗi lượt
- Đo bằng: Faithfulness score (đã có trong Metric Nhóm 3 của SPEC.md)
