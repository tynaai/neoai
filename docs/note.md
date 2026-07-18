- landing page clone web

- nhiều từ ít lại
- tag: rẻ nhất, mua nhiều nhất
- relevance với giá nhất (cao tối đa hơn 10%) thấp hơn 5% 


- feature so sánh click chọn các sản phẩm để so sánh( thông số, tính năng theo ngôn ngữ nhân viên sale ngọt ngào)


## Brainstorm: viết lại phần "Giải pháp" trong README (văn phong business, ít kỹ thuật)

**Vấn đề với bản cũ**: bảng Giải pháp trong README đang liệt kê theo tên kỹ thuật (Hybrid Retrieval, NDJSON streaming, WSUM Ranking, data honesty...) — đúng với dev đọc code, nhưng BGK/người dùng không phải dev sẽ không hình dung được nó giải quyết gì cho họ. Cần viết lại theo *lợi ích* (khách hàng/doanh nghiệp được gì) thay vì *cơ chế* (làm bằng công nghệ gì).

**Nguyên tắc viết lại**:
- Mỗi dòng = 1 câu chuyện ngắn, dễ hình dung, không thuật ngữ (bỏ SQL, RAG, LLM, rule-based, slot, NDJSON...).
- Câu ngắn, "nhiều từ ít lại" (đã note ở trên) — ưu tiên gạch đầu dòng hơn đoạn văn dài.
- Vẫn phải đúng với những gì đã build thật (đối chiếu code, không phóng đại) — tên kỹ thuật cũ được giữ lại ở phần Tech Stack cho ai muốn đọc sâu, phần Giải pháp chỉ nói "được gì".

**Đối chiếu tính năng thật ↔ cách kể chuyện business** (map 1-1 với bảng cũ trong README):

| Tên kỹ thuật (cũ) | Kể theo business (mới) |
|---|---|
| Chat bot Recommend (SPIN slot-filling) | Tư vấn như một nhân viên sale — hỏi đúng, hỏi từng câu một, không dồn dập |
| Hybrid Retrieval | Gợi ý đúng hàng thật, đúng giá thật — lấy thẳng từ kho & bảng giá Điện Máy Xanh, không có hàng ảo |
| 2-panel streaming UI | Thấy sản phẩm ngay trong lúc đang trò chuyện, không phải đợi AI trả lời xong mới thấy |
| So sánh sản phẩm (Compare) | So sánh sản phẩm chỉ với 1 cú chạm — chọn vài món ưng ý, AI so sánh giúp bằng giọng nhân viên tư vấn, không phải bảng thông số khô khan |
| Data honesty / chống hallucination | Không bao giờ bịa thông tin — thiếu giá/thông số thì nói thẳng "chưa có dữ liệu", không đoán để chốt đơn |
| Upsell có kiểm soát | Gợi ý nâng cấp đúng lúc, không ép mua — chỉ mồi khi thực sự đáng tiền hơn, không lặp lại nếu khách từ chối |

**Ý tưởng ghi nhận thêm nhưng CHƯA triển khai (không đưa vào README, chỉ note lại để làm sau)**:
- Tag "rẻ nhất" / "mua nhiều nhất" trên card sản phẩm — hiện chỉ có badge role (phù hợp nhất / rẻ nhất đạt yêu cầu / nổi bật riêng) từ advisor pipeline, chưa có "mua nhiều nhất" (best-seller) vì chưa có dữ liệu lượt mua thật.
- Gợi ý phương án rẻ hơn ~5% (song song với upsell +10% đã có) — mới có chiều "mắc hơn nhưng đáng", chưa có chiều "rẻ hơn nhưng vẫn ổn".

→ Đã áp dụng bảng "Kể theo business (mới)" vào `README.md` mục Giải pháp.



Điện Máy Xanh - nền tảng bán lẻ


## Đối chiếu README với đề bài (Enterprise Problem Brief — Vietnam Innovation Challenge 2026, track 🏢 Năng Suất SME)

**Việc đã làm trong lượt này**:
- Sửa mô tả dòng "Gợi ý đúng nhu cầu và giá trị mong muốn" cho khớp lại với title mới (title đã đổi trước đó nhưng mô tả bên dưới vẫn là bản cũ, lệch ý).
- Đổi "Điện Máy Xanh" → "nền tảng bán lẻ" trong câu mô tả của bảng Giải pháp (mục Problem/Target User vẫn giữ nguyên "Điện Máy Xanh" vì đó là đối tác thật theo Part A đề bài, không cần generalize — chỉ generalize ở chỗ mô tả *năng lực sản phẩm* để không đọc như bị khoá cứng vào 1 khách hàng).
- Thêm mục mới `## 🧭 Phạm vi hiện tại & Lộ trình Pilot` vào README — vì đề bài Part D (Pilot Pathway) + rubric tổng có "Deployment 15%" và "Feasibility 15%", mà README bản trước hoàn toàn không có chỗ nào nói về roadmap/pilot — thiếu sót rõ.

**Đối chiếu từng phần đề bài với hiện trạng code thật (đã verify, không đoán)**:

| Yêu cầu đề bài | Hiện trạng | Đánh giá |
|---|---|---|
| Part F — Hiểu nhu cầu & hỏi ngược thông minh (10%) | SPIN slot schema thật (`slot-schema.ts`), hỏi budget → household_size → priority, dịch thuật ngữ kỹ thuật sang hoàn cảnh dùng thật (system prompt agent advisor) | ✅ khớp tốt |
| Part F — So sánh sản phẩm có giải thích trade-off (10%) | Compare feature (tag sản phẩm + 1 LLM call, giọng sale, giải thích ưu/nhược) + WSUM top-3 role (phù hợp nhất/rẻ nhất/nổi bật riêng) | ✅ khớp tốt, đã test qua browser thật |
| Part F — Tính đúng dữ liệu & chống hallucination (10%) | Prompt ép chỉ dùng data truyền vào, nói "chưa có dữ liệu" khi thiếu — đã verify thật qua test (AI tự nói "chưa có dữ liệu giá cụ thể" thay vì bịa) | ✅ khớp tốt, đúng anti-pattern I2 đề bài cảnh báo tránh |
| H1 — Tiếng Việt tự nhiên, có dấu/không dấu, viết tắt, địa phương | Chưa có eval/test riêng cho việc này — chỉ dựa vào khả năng ngôn ngữ chung của LLM, không có bộ test tiếng Việt lệch chuẩn | ⚠️ chưa verify, rủi ro nếu BGK test câu gõ tắt/sai chính tả |
| H2 — Hiểu trả góp, khuyến mãi, đơn vị đo (m², HP, BTU...) | Có xử lý giá/khuyến mãi; **chưa có slot hỏi trả góp** | ⚠️ thiếu 1 phần nhỏ, dễ bổ sung |
| I1 — Truy xuất catalog, giá, khuyến mãi, **tồn kho**, **review** | Schema `products` KHÔNG có cột tồn kho hay review — đã confirm trực tiếp trong `schema.ts` | ❌ thiếu thật, đề bài nhắc tồn kho/review nhiều lần (I1, H3, E1) |
| Đa ngành hàng (điện thoại, tivi, laptop... theo E1/D3) | Chỉ có tủ lạnh (đủ) + máy lạnh (thiếu giá) — kiến trúc generalize được nhưng chưa build thêm category nào khác | ⚠️ phạm vi hẹp hơn đề bài liệt kê, nhưng đúng tinh thần "demo 1-2 ngành hàng" của Part D |
| H3 — Tốc độ phản hồi <3s gợi ý / <5s so sánh top-3 | Có ghi mục tiêu này trong `docs/SPEC.md` Metric, nhưng **chưa đo/log thời gian phản hồi thật** | ⚠️ chưa verify bằng số liệu, chỉ có target |
| H3 — Môi trường triển khai: đề bài tick "☑ On-premise" nhưng đồng thời tick "☑ Bắt buộc có internet cho demo web/API" và "☑ Web browser" | 2 ý này mâu thuẫn nhau trên bản PDF (có thể lỗi OCR/tick nhầm khi điền form) — sản phẩm hiện tại là web app cần internet (Cloudflare Workers + Neon), không phải on-premise | ⚠️ cần hỏi lại ban tổ chức/đối tác để chắc chắn, không tự đoán |
| Anti-pattern I2 — "Demo chỉ là mockup, không có AI thực sự truy xuất catalog" | Có AI thật truy vấn DB thật (SQL) + LLM thật, đã test qua Playwright trên browser thật, không phải giả lập | ✅ không dính anti-pattern này |
| Rubric chung — Deployment 15%, Feasibility 15% | Trước lượt này README không có mục roadmap/pilot nào — đã bổ sung mục "Phạm vi hiện tại & Lộ trình Pilot" | ✅ đã bổ sung trong lượt này |

**Ưu tiên nên làm tiếp theo (xếp theo mức ảnh hưởng tới điểm rubric)**:
1. Thêm cột `tồn kho` (stock) vào schema + wire vào câu trả lời — đề bài nhắc tồn kho ở cả I1, E1, H3, D3 (điều kiện ký hợp đồng pilot), là gap bị nhắc nhiều nhất.
2. Đo & log thời gian phản hồi thật, đối chiếu với mốc <3s/<5s đã tự đặt trong SPEC.md — hiện đang là "lời hứa" chưa có số liệu chứng minh.
3. Thêm slot hỏi trả góp (nhanh, tận dụng schema SPIN có sẵn).
4. Cân nhắc thêm 1 ngành hàng thứ 2 có giá thật (vd điện thoại) nếu còn thời gian — chứng minh kiến trúc generalize được thật, không chỉ nói suông.


## Đổi font: Anta/Genos → Chakra Petch/Be Vietnam Pro

**Lý do**: bị báo là "lỗi". Kiểm tra kỹ thì build/deploy local không lỗi (font file lên đúng, @font-face render đúng trong test cô lập) — nhưng nguyên nhân gốc rễ nhiều khả năng nhất là **Anta không có bảng chữ tiếng Việt** (chỉ có latin/latin-ext/math/symbols, xác nhận qua metadata @fontsource) — toàn bộ dấu tiếng Việt phải fallback sang font khác giữa chữ, nhìn không đồng nhất/"gãy". Site live (`neoai.tynaai.tech`) tại thời điểm kiểm tra còn đang chạy bản build cũ hơn (chưa deploy đợt đổi font này), nên không loại trừ một phần là do đang xem bản chưa cập nhật.

**Đã research + so sánh trực quan** (screenshot) các lựa chọn thay thế, ưu tiên tiêu chí: có sẵn tiếng Việt native + nhiều weight thật (không phải giả lập):
- Loại: Rajdhani (không có subset vietnamese), Orbitron (chỉ latin), Sora (chỉ latin/latin-ext, không có vietnamese).
- Chọn **Chakra Petch** thay Anta — cùng phong cách vuông vức/kỹ thuật, có sẵn subset `vietnamese`, 5 weight thật (300-700).
- Chọn **Be Vietnam Pro** thay Genos — font thiết kế riêng cho tiếng Việt (tên đã nói lên điều đó), nét tròn dễ đọc gần giống Genos, subset vietnamese đầy đủ, weight 100-900.

Đã đổi trong `apps/web/src/index.css` (`--font-heading`, `--font-sans`) + `package.json`/`pnpm-lock.yaml`. Verify: `getComputedStyle` xác nhận đúng font áp dụng, không có request nào fail khi tải font, screenshot cho thấy dấu tiếng Việt hiển thị liền mạch không lệch font giữa chữ.
