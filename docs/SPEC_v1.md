# NEOAI
- version: 1.0
> Trợ lý AI ví như 1 bạn sale so sánh và tư vấn sản phẩm theo nhu cầu thật của khách hàng

##  context
> Điện Máy Xanh có số lượng lớn sản phẩm thuộc nhiều ngành hàng như điện thoại, laptop, tivi, máy lạnh, tủ lạnh và thiết bị gia dụng. Mỗi sản phẩm có nhiều thông số, mức giá, chương trình khuyến mãi và điều kiện sử dụng khác nhau.
Khi mua hàng, phần lớn khách hàng không thực sự muốn biết sản phẩm nào có nhiều thông số hơn. Điều
họ cần biết là:
- Sản phẩm nào phù hợp nhất với hoàn cảnh của mình.
- Sản phẩm nào đáp ứng được ngân sách.
- Sản phẩm nào nên chọn nếu phải ưu tiên một nhu cầu cụ thể.
- Họ phải đánh đổi điều gì giữa các lựa chọn.
- Có lựa chọn nào gần phù hợp hơn nếu không có sản phẩm đáp ứng toàn bộ yêu cầu.
Tuy nhiên, trải nghiệm hiện tại vẫn buộc khách hàng phải tự tìm kiếm, đọc bảng thông số, sử dụng bộ lọc
hoặc hỏi nhân viên tư vấn. Điều này đặc biệt khó với khách hàng không am hiểu công nghệ.


## Goal
- Smart Follow-up question
- Recommendation when chat & Ranking (ưu tiên làm luôn sau khi có data) - (Nâng cao lên là mồi bán thêm sản phẩm mới giá cao hơn hoặc các sản phảm được giảm giá)
- Gợi ý sản phẩm theo thói quen
- Nice to have feature: tìm kiếm qua hình ảnh và kéo thả

## Comparision
Chatbot hiện tại của địên máy xanh:
> Là SaaS bên thứ ba, dùng chung cho nhiều retailer khác (Viettel Store, Rạng Đông, Erado...) — không phải hệ thống riêng cho ĐMX
> Backend (engine.geteasy.ai) tách biệt hoàn toàn khỏi catalog/CRM/order gốc của MWG — gỡ widget đi thì web vẫn chạy bình thường

## Paintpoint

### Chatbot chưa phải AI-Native — vẫn là lớp phủ AI bên ngoài

**Vấn đề**
- Chatbot hiện tại của ĐMX là AI-enabled, không phải AI-native
- Litmus test AI-native: gỡ AI ra khỏi sản phẩm thì nó còn hoạt động bình thường không? Nếu còn -> AI-enabled (AI là lớp phủ). Nếu sụp/mất chức năng lõi -> AI-native.

Tham khảo: [Google AI Mode Shopping](https://blog.google/products-and-platforms/products/shopping/google-shopping-ai-mode-virtual-try-on-update/) — 2 panel: trái chat, phải panel sản phẩm cập nhật động, nuôi bởi "query fan-out" (tách 1 câu hỏi mơ hồ thành nhiều truy vấn con chạy song song để suy ra tiêu chí, trước khi gợi ý)

### User không biết hỏi gì, hỏi mơ hồ, thiếu ngữ cảnh

**Vấn đề**
- User vừa tech vừa non-tech; dùng từ địa phương/lóng khó đoán (vd "pin trâu"), không phải ai cũng biết hỏi đúng thuật ngữ/thông số
- Là pain point có số liệu, không phải giả định: 30-40% phiên search bắt đầu mơ hồ/quá rộng; 51% search chỉ 1-2 từ; Baymard đo được 37-43% website xử lý kém các câu dạng "theo hoàn cảnh dùng/theo nhiều tiêu chí gộp" (đúng kiểu câu ĐMX hay gặp: "máy lạnh dưới 20tr, phòng 18m², ít ồn")
- Mơ hồ có nhiều biến thể, không chỉ 1 dạng: người hỏi không phải người dùng cuối (mua hộ/mua tặng), chưa rõ nên mua ngành hàng nào, so sánh mập mờ với đồ đang dùng ở nhà, ngại nói thẳng ngân sách, đổi ý giữa chừng hội thoại, ngại gõ nhiều chữ, hoặc hỏi gộp nhiều nhu cầu trong 1 câu

**Giải pháp**

1. **Cách hỏi (SPIN — đúc kết từ 35.000 cuộc bán hàng thật):** hỏi từng lớp một, mỗi lượt 1 câu, không dồn hết. Thứ tự ưu tiên: **Ngân sách (universal, hỏi đầu tiên nếu khách chưa tự nói)** — vì khách bước vào 1 gian hàng cụ thể thường đã có sẵn khoảng ngân sách trong đầu, và đây là đòn bẩy thu hẹp catalog mạnh nhất → **"Dùng hay tặng"** (ưu tiên 2, chỉ với ngành hàng hay mua tặng như laptop/điện thoại — vì câu này rẽ nhánh cả cấu trúc câu hỏi phía sau) → Tình hình chung (dễ trả lời) → Vấn đề cụ thể → Hệ quả nếu chọn sai → Điều khách ưu tiên nhất (để khách tự nói ra, không đoán hộ). Luôn dịch thông số kỹ thuật thành câu hỏi hoàn cảnh sử dụng thật: máy lạnh hỏi diện tích phòng (không hỏi BTU), laptop hỏi mục đích công việc (không hỏi RAM/GB). Nếu khách đã tự nói ngân sách ngay trong câu đầu (vd "máy lạnh dưới 20tr, phòng 18m²") thì bỏ qua bước hỏi này — chỉ hỏi slot còn thiếu.
   Tông giọng: gần gũi, có cá tính, không khô khan thuần túy — tận dụng lợi thế "hiểu đúng + nói chuyện tự nhiên" thay vì chỉ đúng số liệu (không đổi kiến trúc, chỉ là guideline khi viết prompt/few-shot).

2. **Search sớm, tinh chỉnh liên tục — theo đúng mô hình 2 panel (Gemini/ChatGPT/Perplexity Shopping đang làm):** không chờ gom đủ thông tin rồi mới xác nhận trước khi search, mà search ngay khi có chút thông tin và hiển thị luôn (panel phải), song song tiếp tục hỏi gợi mở (panel trái), lặp lại mỗi khi có câu trả lời mới. VD mua laptop: hỏi "mua tặng ai hay dùng ạ?" (như nhân viên sale) → search và hiện ngay 1 lô sản phẩm ban đầu bên phải → đồng thời hỏi tiếp bên trái ("dùng cho việc học hay công việc gì ạ?") → user trả lời → search lại, cập nhật panel phải → tiếp tục hỏi câu kế tiếp, lặp đến khi đủ rõ.

3. **Mỗi câu trả lời đều search lại để cập nhật kết quả:** không đợi đủ slot bắt buộc mới search — chỉ cần có ngành hàng là đã search được, các câu hỏi sau dùng để tinh chỉnh/thu hẹp dần kết quả đang hiện. Vẫn phải kiểm tra kết quả mỗi lần trước khi hiển thị — nếu rỗng hoặc lệch hẳn so với câu vừa hỏi thì ưu tiên hỏi thêm/điều chỉnh filter thay vì hiện danh sách sai hoặc để AI tự "chữa cháy" bằng câu trả lời chung chung.

4. **Khi bot hiểu sai (repair):** nhận diện qua tín hiệu phủ định/sửa lời ("không phải", "ý em là...") hoặc khách lặp lại yêu cầu theo cách khác. Sửa hiệu quả nhất là đưa lựa chọn cụ thể để khách chọn nhanh + nói rõ bot đang hiểu gì để khách biết chỗ cần đính chính; tránh xin lỗi lặp lại nhiều lần hoặc chỉ nói "không hiểu, thử lại" mà không có hành động cụ thể. Lưu ý LLM mặc định có xu hướng hỏi lại ÍT hơn con người nên phải chủ động ép hành vi này trong prompt.

5. **Cơ chế kỹ thuật:** tách "quyết định hỏi gì" khỏi "diễn đạt câu hỏi ra sao" — quyết định hỏi gì nên là 1 slot schema có thứ tự ưu tiên định nghĩa sẵn theo từng ngành hàng (rule/config, không để AI tự quyết lúc chạy để tránh hỏi thiếu nhất quán), LLM chỉ lo diễn đạt tự nhiên, thích ứng ngữ cảnh dựa trên slot ưu tiên cao nhất còn thiếu.

6. **Mồi thêm sản phẩm (upsell):** đặt sau cùng, sau khi đã gợi ý đúng nhu cầu — tối đa 1 lần/hội thoại, phải có lý do cụ thể đo lường được ("thêm 2tr được RAM 16GB, mượt hơn khi mở nhiều app"), không lặp lại nếu khách từ chối, luôn để lựa chọn ban đầu là phương án hợp lệ.

**Giải Pháp Kĩ Thuật**

1. **SPIN -> Slot schema config:** file config (JSON) định nghĩa theo từng category: `{category: [{slot, priority, question_hint}]}`. **Quy ước mặc định**: slot `budget` (ngân sách) luôn có priority cao nhất trong MỌI category (universal, không cần lặp lại cấu hình riêng từng category); slot `buyer_type` (dùng/tặng) priority kế tiếp, chỉ bật cho category hay mua tặng (laptop, điện thoại, tai nghe, đồng hồ...). Mỗi lượt gọi `resolveNextSlot(state, schema)` — quét từ priority cao nhất, trả về slot đầu tiên chưa có giá trị -> đưa cho LLM diễn đạt tự nhiên (kèm few-shot ví dụ tông giọng như mẫu máy lạnh/laptop đã có). State lưu theo session (in-memory/session store là đủ cho demo, không cần DB phức tạp).

2. **2 panel search-refine -> 1 LLM call, output có cấu trúc:** mỗi lượt LLM trả về JSON gồm `search_filters` (dùng query catalog trực tiếp, không phải LLM tự viết truy vấn) + `next_question` (hiển thị panel trái) + `reasoning` (tùy chọn, để debug/log). `search_filters` map thẳng vào query có cấu trúc (SQL/filter) -> kết quả đổ ra panel phải. Không cần 2 lần gọi LLM riêng cho 2 panel, 1 lần đủ cho cả hai.

3. **Check kết quả trước khi show (retrieval evaluator rule-based, không cần model riêng):** sau search, chạy rule đơn giản — `count(results) == 0` hoặc kết quả không thỏa hard filter (giá/category) đã trích ra từ câu trả lời -> set `needMoreInfo = true`, chuyển sang nhánh hỏi thêm/nới lỏng filter thay vì render panel phải rỗng hoặc để LLM tự "chữa cháy" bằng văn bản chung chung.

4. **Repair — detect bằng rule trước khi vào LLM:** danh sách keyword/regex phủ định phổ biến ("không phải", "sai rồi", "ý em là", "em nói lại...") match trước mỗi lượt xử lý. Match -> set `repairMode = true`, dùng prompt template riêng ép LLM trả lời theo đúng 2 bước đã chốt: (1) nhắc lại đang hiểu gì, (2) đưa 2-3 lựa chọn cụ thể để khách chọn nhanh — không để LLM tự chọn cách xin lỗi.

5. **Tách "quyết định hỏi gì" khỏi "diễn đạt":** chính là `resolveNextSlot()` ở mục 1 — lớp quyết định luôn là rule/config, LLM chỉ nhận slot đã được quyết định sẵn + ngữ cảnh hội thoại hiện tại để render thành câu hỏi tự nhiên, không tự chọn slot.

6. **Upsell — rule tìm candidate, LLM chỉ diễn giải diff có sẵn:** chỉ trigger nếu đã có kết quả search hợp lệ VÀ session chưa từng upsell (`hasUpsold = false`). Tìm candidate bằng rule: cùng category, giá cao hơn sản phẩm đang đề xuất **tối đa +10%** (config, không vượt ngưỡng này để tránh cảm giác bị ép mua) trong tập đã retrieve; diff spec giữa 2 sản phẩm tính bằng so sánh field-by-field (không để LLM đoán khác biệt) -> đưa diff đã tính sẵn cho LLM diễn giải thành câu tự nhiên kèm đúng số tiền chênh lệch thật.

**Lưu ý**:
- Hiểu nhu cầu, ngân sách, ưu tiên và ràng buộc.
- Xử lý từ viết tắt, sai chính tả, thiếu dấu, từ ngữ địa phương
- Khi đang hỏi máy lạnh nhảy sang hỏi tủ lạnh

**Metric**
-> Xem mục `## Metric` ở cuối file (đã gộp theo 3 nhóm tiêu chí chấm điểm track, không để rời rạc theo từng pain point nữa)

### Recommend

**Vấn đề**
- Không biết chọn sản phẩm nào — là nguyên nhân bỏ giỏ hàng hàng đầu, có số liệu: Baymard 2024 đo được 42% case bỏ giỏ hàng liên quan trực tiếp đến decision fatigue; bỏ giỏ hàng tổng thể ~70%
- Choice overload được đo lặp lại ở nhiều nghiên cứu độc lập: chỉ 3% mua khi có nhiều lựa chọn vs 30% khi lựa chọn giới hạn; vượt quá 24 lựa chọn giảm 90% khả năng mua (Iyengar & Lepper 2000 + Columbia). 73% người tiêu dùng cảm thấy quá tải lựa chọn, 74% từng bỏ hẳn việc mua vì quyết định quá nặng nề
- Điện máy là đúng nhóm hàng bị buyer's remorse nặng nhất (TV, điện thoại, laptop) — do thiếu đánh giá trước khi mua + quyết định vội; return rate trung bình ~16% online, thiệt hại lớn
- Gap cần lưu ý: chưa có số liệu riêng cho thị trường VN, toàn bộ số liệu trên là dữ liệu toàn cầu — cần thận trọng khi trình bày, không khẳng định quá chắc cho hành vi người Việt
- 5 biến thể của vấn đề: (1) quá tải lựa chọn thuần túy, (2) thiếu tin tưởng/thiếu social proof, (3) bị đánh lừa bởi vị trí hiển thị (position bias) — chọn sản phẩm đầu không hẳn vì tốt nhất, (4) mua xong hối hận (buyer's remorse), (5) không đăng nhập nên không được "nhớ" gu, phải chọn lại từ đầu mỗi lần

**Giải pháp**
- Gợi ý sản phảm theo khi brainstorm với AI: Lọc và xếp hạng sản phẩm, Đề xuất top 3, Giải thích ưu điểm, nhược điểm và trade-off bằng ngôn ngữ phổ thông.

- Gợi ý sản phẩm theo thói quen(chưa triển khai): -> Nhưng vấn đề thường các trang web đó thường ko cho đăng nhập thì làm biết khách nào có thói ra sao

**Lưu ý**:
- Khi out rank thì sao (chưa triển khai)-> Gợi ý các sản phẩm gần
- Truy xuất catalog, giá, khuyến mãi, tồn kho, review và chính sách. (chưa triển khai)
- Không tự bịa bất kỳ thông tin sản phẩm nào. (chưa triển khai)

**Giải Pháp Kĩ Thuật**

- Gợi ý sản phảm theo khi brainstorm với AI:
1. **Hybrid retrieval — tool-calling DB (structured) + RAG (vector), không dùng 1 mình RAG:** trường định lượng (category, giá, diện tích, RAM...) trích từ hội thoại rồi query có cấu trúc (SQL/filter) trực tiếp vào catalog — không dùng vector search cho phần này vì dễ trả sai lệch (vd hỏi "dưới 20tr" nhưng vector search vẫn trả về sản phẩm 22tr vì "gần giống ngữ nghĩa"). RAG chỉ dùng cho phần dữ liệu không có cấu trúc rõ: mô tả sản phẩm, tóm tắt review, câu hỏi so sánh mập mờ với đồ đang dùng ("giống cái đang dùng nhưng to hơn"), policy/FAQ.

2. **Quy tắc chia field khi đưa vào vector DB — ĐÃ TRIỂN KHAI THẬT** (`apps/api/scripts/all-products.ts`, seed 1692 sản phẩm tủ lạnh thật từ ĐMX):
   - Field text/mô tả (tên, thương hiệu, thông số mô tả) -> ghép thành 1 đoạn văn bản rồi mới embed, không embed từng field rời rạc
   - Field số liệu (giá, RAM, diện tích, tồn kho...) -> để làm metadata/cột structured đi kèm, KHÔNG đưa vào text để embed (số liệu không mang ý nghĩa ngữ nghĩa, embed vào sẽ làm loãng vector). Vector DB hiện đại (Qdrant, Weaviate, Pinecone, pgvector...) hỗ trợ sẵn "filtered vector search" — lọc theo metadata trước/sau khi tính độ tương đồng, không cần tách hẳn 2 hệ thống riêng biệt
   - **Field ĐỘNG (khuyến mãi, tồn kho, giá...) cũng phải loại khỏi text embed** — không chỉ vì lý do ngữ nghĩa, mà vì field này thay đổi liên tục theo thời gian: bake vào text rồi embed thì vector sẽ stale ngay khi field đổi, phải tốn phí embed lại. Field động nên nằm ở cột structured, query real-time, không phụ thuộc vector cũ.
     Bài học thực tế khi code: bản đầu tiên của script từng vô tình nhúng `Khuyến mãi` (field động, hết hạn/đổi liên tục) vào text embed — đã sửa, bỏ khỏi `embeddingText`, chỉ giữ ở cột `promotions` structured trong bảng `products`.
   - Không nhúng nguyên JSON thô của cả sản phẩm vào 1 embedding (`dmx_specs_json` và field bookkeeping như `sku`, `model_code`, `dmx_gallery_images`... bị loại khỏi text, chỉ lưu structured)

   *Field embedding thật đang dùng (thay ví dụ giả định trước đây — giờ đã có dữ liệu hackathon thật, không cần suy đoán nữa):* title + thương hiệu + các dòng mô tả/thông số dạng "key: value" trong section thông số kỹ thuật. KHÔNG gồm giá, KHÔNG gồm khuyến mãi.
**Metric**
-> Xem mục `## Metric` ở cuối file (đã gộp theo 3 nhóm tiêu chí chấm điểm track, không để rời rạc theo từng pain point nữa)

## Metric — tổ chức theo 3 tiêu chí chấm điểm track (30% tổng điểm, Phần F đề bài gốc)

### Nhóm 1 — Hiểu nhu cầu & hỏi ngược thông minh (10%)
*Nguồn: mục "User không biết hỏi gì, hỏi mơ hồ, thiếu ngữ cảnh"*
- **Độ chính xác slot hỏi** (rule-based): % câu hỏi bot đưa ra đúng slot ưu tiên cao nhất còn thiếu so với `hint` kỳ vọng trong `question_lowContextFromUser.json`
- **Độ nhất quán / stability** (rule-based): chạy cùng 1 câu hỏi nhiều lần, % lần bot hỏi đúng cùng 1 slot ưu tiên
- **Tỷ lệ dùng ngôn ngữ đời sống** (rule-based): % câu hỏi không chứa thuật ngữ kỹ thuật thô (BTU, RAM, GB, mAh...) — keyword blacklist
- **Số lượt hội thoại trung bình đến khi đủ rõ** (rule-based): đếm turn tới khi `resolveNextSlot()` trả về null; so sánh case mơ hồ (9 case đầu test set) vs case đủ ngữ cảnh (case Đà Lạt, kỳ vọng 0 lượt hỏi thêm)
- **Độ phù hợp câu hỏi ngược** (LLM-as-Judge hoặc con người): câu hỏi có tự nhiên, đúng trọng tâm không
- **Tỷ lệ phát hiện đúng tín hiệu hiểu sai** (rule-based): chèn chủ đích câu phủ định vào test set, đo precision/recall của bộ regex detect repair

### Nhóm 2 — So sánh sản phẩm có giải thích trade-off (10%)
*Nguồn: mục "Recommend"*
- **Precision@3** (rule-based): % sản phẩm trong top-3 thỏa đúng hard filter (giá/category) đã trích từ hội thoại
- **Slot-assignment accuracy** (rule-based): kiểm tra riêng từng vai trò trong top-3 (phù hợp nhất/rẻ nhất/tiêu chí model tự chọn) — sản phẩm gán vào slot đó có đúng là tốt nhất theo tiêu chí của slot trong candidate pool không
- **Intra-List Diversity** (rule-based): đo độ khác biệt giữa 3 sản phẩm trong top-3, tránh 3 sản phẩm gần giống hệt nhau
- **Explanation quality** (LLM-as-Judge): giải thích có nhân-quả rõ ràng, dùng ngôn ngữ phổ thông không
- **Tỷ lệ có kết quả ngay lượt đầu** (rule-based): % câu hỏi mơ hồ vẫn search ra ít nhất 1 sản phẩm ở lượt đầu tiên

### Nhóm 3 — Tính đúng dữ liệu & chống hallucination (10%)
*Nguồn: cả 2 mục*
- **Faithfulness — claim định lượng** (rule-based): trích số liệu (giá, thông số) từ câu trả lời, so khớp trực tiếp với field catalog thật
- **Faithfulness — claim định tính** (RAGAS/DeepEval): claim decomposition + NLI/LLM-judge verdict cho câu mô tả cảm nhận ("chạy êm", "dễ vệ sinh")
- **Tỷ lệ kết quả rỗng xử lý đúng** (rule-based): % lượt `count(results)==0` chuyển đúng sang hỏi thêm/nới filter, không để LLM tự viết câu trả lời chung chung
- **Độ khớp dữ liệu upsell** (rule-based): % lần upsell có số tiền chênh lệch và tính năng nêu ra khớp 100% với catalog thật

### Nhóm phụ — Kỹ thuật/UX chung (không thuộc 30% track, vẫn cần đo)
- **Thời gian phản hồi**: panel phải cập nhật < 3s mỗi lượt, so sánh/tổng hợp < 5s (theo mốc đề bài gốc)
- **Tỷ lệ vi phạm giới hạn upsell**: % hội thoại có upsell xuất hiện quá 1 lần hoặc lặp lại sau khi khách từ chối (mục tiêu = 0%) — đo tránh "ép mua" (anti-pattern I2 đề bài gốc), không phải hallucination
