---
version: 'alpha'
name: 'DMX AI Buying Mode'
description: 'Desktop-first, full-screen AI-native buying workspace that helps Vietnamese consumers choose an air conditioner through visible needs, adaptive recommendations, side-by-side comparison, grounded data, and local stock checks.'
colors:
  primary: '#0B63CE'
  primary-hover: '#084EA6'
  primary-soft: '#EAF3FF'
  on-primary: '#FFFFFF'
  accent: '#FFD400'
  accent-soft: '#FFF8CC'
  on-accent: '#1F2937'
  surface: '#FFFFFF'
  surface-subtle: '#F7F9FC'
  surface-muted: '#EEF2F7'
  surface-raised: '#FFFFFF'
  text-primary: '#111827'
  text-secondary: '#4B5563'
  text-tertiary: '#6B7280'
  border: '#D8DEE8'
  border-strong: '#AAB4C3'
  success: '#147D45'
  success-soft: '#E8F7EE'
  warning: '#B45309'
  warning-soft: '#FFF4E5'
  danger: '#C62828'
  danger-soft: '#FDECEC'
  info: '#2563EB'
  unknown: '#6B7280'
typography:
  display-lg:
    fontFamily: 'Inter'
    fontSize: '2.25rem'
    fontWeight: '700'
    lineHeight: '1.18'
    letterSpacing: '-0.025em'
  h1:
    fontFamily: 'Inter'
    fontSize: '1.75rem'
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: '-0.02em'
  h2:
    fontFamily: 'Inter'
    fontSize: '1.375rem'
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: '-0.015em'
  h3:
    fontFamily: 'Inter'
    fontSize: '1.125rem'
    fontWeight: '650'
    lineHeight: '1.35'
  body-lg:
    fontFamily: 'Inter'
    fontSize: '1rem'
    fontWeight: '400'
    lineHeight: '1.55'
  body-md:
    fontFamily: 'Inter'
    fontSize: '0.9375rem'
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: 'Inter'
    fontSize: '0.8125rem'
    fontWeight: '400'
    lineHeight: '1.45'
  label-lg:
    fontFamily: 'Inter'
    fontSize: '0.875rem'
    fontWeight: '650'
    lineHeight: '1.25'
  label-md:
    fontFamily: 'Inter'
    fontSize: '0.75rem'
    fontWeight: '650'
    lineHeight: '1.25'
    letterSpacing: '0.01em'
  price:
    fontFamily: 'Inter'
    fontSize: '1.125rem'
    fontWeight: '750'
    lineHeight: '1.2'
rounded:
  none: '0px'
  xs: '6px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '20px'
  pill: '999px'
spacing:
  none: '0px'
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  2xl: '32px'
  3xl: '48px'
  4xl: '64px'
components:
  app-shell:
    backgroundColor: '{colors.surface-subtle}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.none}'
    padding: '0px'
    height: '100vh'
    width: '100vw'
  top-bar:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.none}'
    padding: '0 24px'
    height: '64px'
    width: '100%'
  conversation-rail:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.none}'
    padding: '20px'
    width: '360px'
  workspace:
    backgroundColor: '{colors.surface-subtle}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.none}'
    padding: '24px'
    width: 'auto'
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.label-lg}'
    rounded: '{rounded.pill}'
    padding: '12px 18px'
    height: '44px'
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
    textColor: '{colors.on-primary}'
    typography: '{typography.label-lg}'
    rounded: '{rounded.pill}'
    padding: '12px 18px'
    height: '44px'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.primary}'
    typography: '{typography.label-lg}'
    rounded: '{rounded.pill}'
    padding: '11px 17px'
    height: '44px'
  button-quiet:
    backgroundColor: '{colors.surface-muted}'
    textColor: '{colors.text-secondary}'
    typography: '{typography.label-lg}'
    rounded: '{rounded.pill}'
    padding: '10px 16px'
    height: '40px'
  input-prompt:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-primary}'
    typography: '{typography.body-lg}'
    rounded: '{rounded.xl}'
    padding: '14px 52px 14px 16px'
    height: '52px'
    width: '100%'
  chip-need:
    backgroundColor: '{colors.primary-soft}'
    textColor: '{colors.primary}'
    typography: '{typography.label-md}'
    rounded: '{rounded.pill}'
    padding: '7px 10px'
  chip-followup:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-primary}'
    typography: '{typography.label-lg}'
    rounded: '{rounded.pill}'
    padding: '9px 14px'
    height: '38px'
  card-product:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.lg}'
    padding: '16px'
    width: '100%'
  card-product-selected:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.lg}'
    padding: '15px'
    width: '100%'
  card-brief:
    backgroundColor: '{colors.surface-subtle}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.md}'
    padding: '14px'
    width: '100%'
  badge-best:
    backgroundColor: '{colors.primary-soft}'
    textColor: '{colors.primary}'
    typography: '{typography.label-md}'
    rounded: '{rounded.pill}'
    padding: '5px 8px'
  badge-success:
    backgroundColor: '{colors.success-soft}'
    textColor: '{colors.success}'
    typography: '{typography.label-md}'
    rounded: '{rounded.pill}'
    padding: '5px 8px'
  badge-warning:
    backgroundColor: '{colors.warning-soft}'
    textColor: '{colors.warning}'
    typography: '{typography.label-md}'
    rounded: '{rounded.pill}'
    padding: '5px 8px'
  badge-unknown:
    backgroundColor: '{colors.surface-muted}'
    textColor: '{colors.text-secondary}'
    typography: '{typography.label-md}'
    rounded: '{rounded.pill}'
    padding: '5px 8px'
  compare-bar:
    backgroundColor: '{colors.text-primary}'
    textColor: '{colors.surface}'
    rounded: '{rounded.lg}'
    padding: '12px 16px'
    height: '68px'
    width: 'auto'
  detail-drawer:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.xl}'
    padding: '20px'
    width: '400px'
  alert-near-match:
    backgroundColor: '{colors.warning-soft}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.md}'
    padding: '14px 16px'
    width: '100%'
  alert-data-missing:
    backgroundColor: '{colors.surface-muted}'
    textColor: '{colors.text-secondary}'
    rounded: '{rounded.md}'
    padding: '12px 14px'
    width: '100%'
---

## Overview

### Product identity

**DMX AI Buying Mode** is a full-screen buying workspace inside the Điện Máy Xanh website. It is not a floating chatbot, a FAQ panel, a traditional filter page, or a linear questionnaire. AI is the core interaction model: it turns natural Vietnamese conversation into a visible buying brief, continuously updates a shortlist, explains trade-offs, compares products side by side, and helps the customer check local stock.

The initial category is **air conditioners (máy lạnh)**. The primary user is a Vietnamese consumer who already has a reasonably clear real-world need but does not understand enough technical specifications to confidently select a model.

### Product promise

> “Chỉ cần mô tả căn phòng và điều bạn quan tâm. AI sẽ tìm những máy lạnh phù hợp, giải thích điểm đánh đổi và giúp bạn chọn nhanh hơn.”

### Desired feeling

The experience should feel:

- **Competent and calm:** like a skilled store advisor who listens and does not pressure the customer.
- **Transparent:** users can see what the AI understood, what data is known, what is missing, and why rankings changed.
- **Visual and decision-oriented:** the product workspace is more prominent than the chat transcript.
- **Fast and flexible:** the system starts showing useful provisional results immediately and asks only the most valuable clarification.
- **Familiar but elevated:** retain Điện Máy Xanh brand recognition while using a modern, neutral, premium workspace rather than a promotional retail page.

### Core UX model

Use a split-screen composition inspired by modern AI shopping workspaces:

1. **Left conversation rail:** visible buying brief, concise transcript, optional follow-up chips, and sticky prompt input.
2. **Main decision workspace:** dynamic product cards, recommendation state, comparison view, and saved items.
3. **Right detail drawer:** product details and stock without navigating away or losing the current decision context.

The visual product canvas must dominate the screen. Chat is an input and explanation channel, not the product itself.

### Non-negotiable behaviors

- **Answer first, clarify alongside.** Show provisional results as soon as there is enough information to make a safe initial retrieval. Never force the user through several questions before revealing products.
- **Visible memory.** Convert all known needs into editable chips or fields in the Buying Brief so the user can verify and correct the AI.
- **One high-value follow-up at a time.** A follow-up may refine ranking, but skipping it must not block the experience.
- **No dead ends.** When nothing satisfies every constraint, show the nearest safe alternatives and explicitly name the violated constraint.
- **Trade-offs over spec dumps.** Lead with real-life effects: room fit, nighttime comfort, expected cooling performance, budget impact, and data certainty.
- **Grounded commerce data.** Price, promotion, stock, ratings, specifications, and policy claims must come from catalog or API data. Missing data must be labeled “Chưa có dữ liệu”, never guessed.
- **User control.** Users may refine by typing, editing the Buying Brief, dismissing a product, pinning it for comparison, or changing priority directly.

### Language and content

All visible UI copy must be in natural Vietnamese. Support realistic shopping language, abbreviations, missing diacritics, and mixed technical terms, for example:

> “phòng ngủ 18m2 nắng tây, có bé ngủ, tầm 11 củ, cần êm với tiết kiệm điện”

The AI tone is respectful, plain, and concise. Avoid sales pressure, exaggerated claims, excessive honorifics, and long technical explanations.

## Colors

The palette combines recognizable Điện Máy Xanh blue and yellow with a large neutral surface system designed for scanning complex decisions.

- **Primary blue (`#0B63CE`)** is used for primary actions, active navigation, links, selection outlines, and the AI identity. White text on this blue is the default high-contrast CTA treatment.
- **Brand yellow (`#FFD400`)** is an accent, not the main interface background. Use it for small promotional markers, selected highlights, or moments of delight with dark text. Never use white text on yellow.
- **Neutral surfaces** should cover at least 80% of the screen. The workspace background is cool off-white; cards and the conversation rail are white.
- **Green** means a confirmed positive state such as “Có hàng”, “Đáp ứng”, or “Phù hợp”.
- **Amber** means a visible trade-off, near-match, or condition that needs attention. It is not an error.
- **Red** is reserved for true constraint violations, destructive actions, or serious data errors. Do not use it merely because a product ranks lower.
- **Gray** means unavailable, secondary, or unknown. “Chưa có dữ liệu” must have a neutral gray treatment, distinct from “Hết hàng”.

Never use saturated color across large panels. Avoid gradients except for extremely subtle skeleton shimmer. Do not use glassmorphism, neon AI glows, or decorative rainbow effects.

## Typography

Use **Inter** throughout because it remains legible at dense desktop sizes and supports Vietnamese diacritics well.

### Hierarchy

- Use `display-lg` only for the empty-state question or major decision moment.
- Use `h1` for the current buying task, such as “Máy lạnh cho phòng ngủ”.
- Use `h2` for workspace sections and final recommendation headings.
- Use `h3` for product names, comparison groups, and drawer section titles.
- Use `body-lg` for user prompts and the AI’s primary summary.
- Use `body-md` for product reasons and trade-offs.
- Use `body-sm` for metadata, sources, stock timestamps, and secondary specs.
- Use the `price` style for current prices only.

### Vietnamese copy rules

- Preserve all Vietnamese diacritics correctly.
- Use sentence case, not title case, for Vietnamese labels.
- Avoid long all-uppercase strings. Uppercase may be used only for very short brand or status labels.
- Keep a normal AI response to one heading and one or two short paragraphs, ideally fewer than 70 words.
- Avoid paragraphs wider than 68 characters in the conversation rail.
- Use plain-language labels before raw specs. Example: “Chạy êm khi ngủ — 19 dB” rather than only “19 dB”.
- Format prices with Vietnamese separators and the `đ` symbol: `11.490.000đ`.
- Never show an unexplained confidence percentage such as “92% phù hợp”. Use defensible labels such as “Phù hợp nhất”, “Êm nhất”, or “Giá tốt nhất”.

## Layout

### Reference viewport

Design desktop-first for a **1440 × 900 px laptop viewport**. The app occupies the full browser content area.

### App shell

- Top bar: `64px` high, fixed.
- Left conversation rail: `360px` wide, fixed below the top bar.
- Main workspace: fills remaining width and height, scrolls independently.
- Detail drawer: `400px` wide, overlays from the right; the user remains in the same workspace.
- Main workspace padding: `24px`.
- Standard grid gap: `16px`.
- Product grid: three equal columns for the top three recommendations.

### Top bar structure

Left:

- Điện Máy Xanh logo or compact wordmark.
- Back action: `← Máy lạnh`.

Center:

- View switcher: `Khám phá` · `So sánh` · `Đã lưu`.
- Active view uses blue text and a subtle blue indicator, not a large filled tab.

Right:

- Location selector: `Khu vực: Hòa Lạc`.
- Session history icon.
- More menu.
- Close/exit Buying Mode.

### Conversation rail structure

The rail has three vertical zones:

1. **Buying Brief, sticky at top**
   - Compact heading: `AI đang hiểu`.
   - Editable chips: `Phòng ngủ 18 m²`, `Nắng chiều`, `Có trẻ nhỏ`, `Tối đa 11 triệu`, `Ưu tiên chạy êm`.
   - Link: `Sửa nhu cầu`.
   - Collapsible after the user scrolls deeply, but never completely hidden.

2. **Conversation transcript, scrollable**
   - Avoid large speech bubbles.
   - AI messages use a plain transcript layout with a small AI icon or label.
   - User messages may use a light neutral rounded container.
   - Product cards never live inside chat bubbles.

3. **Prompt composer, sticky at bottom**
   - Placeholder: `Nói thêm điều bạn quan tâm…`.
   - Send icon button.
   - Optional voice icon may be shown but is not a core feature.

### Main workspace hierarchy

1. Concise AI summary.
2. Optional single follow-up question with answer chips and `Bỏ qua`.
3. Top three recommendation cards.
4. Alternative products or near matches.
5. Persistent comparison tray when two or more products are selected.

### Density

This is a decision workspace, not a promotional landing page. Use generous spacing around major groups, but keep product information compact enough to compare without excessive scrolling. A top-three product card should be approximately `300–330px` wide and `430–500px` tall at the reference viewport.

### Responsive scope

For the hackathon prototype, optimize only for laptop/desktop. At widths below `1180px`, the left rail may collapse into a drawer, but do not spend primary design effort on mobile comparison screens.

## Elevation & Depth

Use elevation only to clarify layers and interactive focus.

- Top bar: subtle bottom border, no heavy shadow.
- Cards: 1px neutral border plus a very soft shadow.
- Selected product card: 2px primary-blue outline and a slightly stronger shadow.
- Detail drawer: stronger left-side shadow to communicate overlay depth.
- Floating compare bar: medium shadow and dark neutral background.
- Chips and inline alerts: no shadow.

Avoid dramatic floating cards, deep drop shadows, glow effects, or multiple competing elevation levels.

## Shapes

- Product cards and major panels: `16px` radius.
- Buying Brief and inline alerts: `12px` radius.
- Prompt composer and detail drawer: `20px` radius where visually appropriate.
- Buttons and chips: pill radius.
- Product image containers: `12–16px` radius with a very light neutral background.
- Comparison table cells are mostly rectangular; use subtle row separators rather than placing every value in a separate rounded box.

Keep shapes clean and moderately rounded. Do not create a toy-like interface with excessive bubbles.

## Components

### 1. Buying Brief

Purpose: make the AI’s memory visible, editable, and trustworthy.

Content groups:

- **Không gian:** room type, room size, sun exposure.
- **Người dùng:** children, elderly users, sleep sensitivity.
- **Ngân sách:** preferred and maximum budget.
- **Ưu tiên:** quietness, energy saving, fast cooling, brand preference.
- **Khu vực:** location for stock and installation.

Every item must be editable. Distinguish:

- Hard constraint: a small lock icon or label `Bắt buộc`.
- Soft preference: normal blue chip.
- Assumption: dashed neutral chip with label `AI đang giả định`.

When the AI learns a new fact, animate the corresponding chip gently for 300–500 ms. Do not use a celebratory animation.

### 2. AI response block

The AI response should be compact and structured:

**Heading:** one clear conclusion.

**Body:** one or two sentences explaining what is currently prioritized.

Example:

> **Tôi đã có thể bắt đầu với thông tin hiện tại**  
> Tôi đang ưu tiên máy 1.5 HP, chạy êm và đủ tải cho phòng 18 m² có nắng chiều. Hiện có 6 mẫu gần với ngân sách của bạn.

Do not repeat the Buying Brief verbatim. Do not include a long list of specifications in the transcript.

### 3. Follow-up question

Ask no more than one question at a time. It appears below the AI summary, not as a modal and not as a required wizard step.

Example:

> **Bạn dùng máy chủ yếu vào ban đêm hay cả ngày?**

Chips:

- `Chủ yếu ban đêm`
- `Cả ngày`
- `Không quan trọng`
- `Bỏ qua`

The top-three products remain visible while the question is unanswered.

### 4. Product recommendation card

Each card contains, in this order:

1. Role badge: `Phù hợp nhất`, `Êm nhất`, or `Giá tốt nhất`.
2. Product image in a neutral image area.
3. Brand and product name, maximum two lines.
4. Current price and optional crossed-out old price.
5. Promotion and local stock status.
6. **Vì sao hợp với bạn:** one concise sentence.
7. **Điểm phải đổi:** one concise sentence.
8. Two or three need-specific attributes, not a full spec table.
9. Actions: `So sánh`, `Xem chi tiết`, and a quiet dismiss action.

Example copy:

> **Vì sao hợp:** Đủ công suất cho phòng có nắng chiều và êm khi dùng ban đêm.  
> **Đánh đổi:** Giá cao hơn lựa chọn tiết kiệm khoảng 900.000đ.

If demo data is not connected, visibly label the screen `Dữ liệu minh họa`. Never present invented stock, price, rating, or promotion as live data.

### 5. Product feedback interaction

A quiet action such as `Không hợp` opens a compact reason menu:

- `Quá đắt`
- `Không thích thương hiệu`
- `Chưa đủ êm`
- `Thiếu tính năng`
- `Lý do khác`

After selection, the list reranks and a short explanation appears. The user should not need to phrase every preference as a sentence.

### 6. Ranking-change explanation

When a product moves, show a temporary inline notice near the result header:

> **LG DualCool đã lên từ #3 → #1**  
> Vì bạn ưu tiên độ êm cao hơn tốc độ làm lạnh nhanh.

Animation:

- Cards reposition smoothly in 250–350 ms.
- The rank-change badge appears for 2–3 seconds.
- Respect reduced-motion preferences by replacing movement with a simple highlight.

This explanation reveals decision factors and data, not private chain-of-thought.

### 7. No-exact-match state

Never show only `Không tìm thấy sản phẩm phù hợp`.

Use an amber near-match alert:

> **Chưa có mẫu nào đáp ứng đủ cả 4 yêu cầu**  
> Tôi đã giữ nguyên các tiêu chí bắt buộc và tìm 3 lựa chọn gần nhất. Mỗi lựa chọn bên dưới ghi rõ điều bạn cần đánh đổi.

Show:

- `0 mẫu khớp hoàn toàn · 5 mẫu gần nhất`.
- The conflicting constraint on every product card.
- Safe relaxation actions such as:
  - `Tăng ngân sách tối đa thêm 1 triệu`
  - `Xem cửa hàng lân cận`
  - `Chấp nhận độ ồn cao hơn một mức`

Never silently remove a constraint. Never recommend underpowered capacity as an equivalent match; show a clear safety/fit warning if such a product is displayed for context.

### 8. Persistent compare tray

Appears when at least two products are selected.

Contents:

- Small thumbnails and abbreviated names for up to three products.
- Remove action on each item.
- Text: `Đã chọn 3 sản phẩm`.
- Primary CTA: `So sánh ngay`.

Position near the bottom center of the main workspace, above page content. Do not cover the prompt composer.

### 9. Side-by-side comparison

The comparison view is the main differentiator and must be visually excellent.

#### Sticky product headers

Each of the three product columns keeps visible:

- Image thumbnail.
- Product name.
- Price.
- Recommendation badge.
- Local stock state.
- `Chọn sản phẩm này` action.

#### AI recommendation summary

Place a summary above the table:

> **Tôi nghiêng về Panasonic X cho trường hợp của bạn**
>
> Đủ công suất cho phòng 18 m² có nắng chiều, êm hơn khi ngủ và đang có hàng tại khu vực đã chọn.  
> **Bạn phải đánh đổi:** giá cao hơn LG Y khoảng 900.000đ.

Actions:

- `Chọn sản phẩm này`
- `Ưu tiên giá thấp hơn`
- `Ưu tiên tiết kiệm điện hơn`
- `Tôi vẫn chưa chắc`

#### Comparison controls

- Toggle enabled by default: `Chỉ hiện điểm khác nhau`.
- Secondary option: `Hiện thông số gốc`.
- Allow replacing one product without leaving the comparison view.

#### Comparison groups

Use this order and plain-language labels:

1. **Phù hợp với căn phòng của bạn**
   - Đủ công suất không?
   - Phù hợp phòng có nắng chiều không?
   - Phù hợp dùng ban đêm không?

2. **Trải nghiệm sử dụng**
   - Độ êm.
   - Làm lạnh nhanh.
   - Luồng gió dễ chịu.
   - Điều khiển và tiện ích.

3. **Chi phí**
   - Giá hiện tại.
   - Khuyến mãi.
   - Trả góp.
   - Mức tiết kiệm điện or energy label, only when data exists.
   - Lắp đặt, only when data exists.

4. **Sở hữu lâu dài**
   - Bảo hành.
   - Vệ sinh/bảo trì.
   - Dữ liệu còn thiếu.

#### Table styling

- Hide identical rows by default.
- Keep product headers visible while scrolling.
- Group attributes with clear section headings.
- Use subtle alternating or bordered rows to help the eye track horizontally.
- Highlight the best value for the current user with a light blue tint and a small reason label.
- Do not paint an entire winning column bright blue or green.
- Missing values read `Chưa có dữ liệu`, never `—` without explanation.

### 10. Product detail drawer

The drawer slides from the right and preserves the shortlist underneath.

Contents:

1. Large product image.
2. Product name, capacity variant, price, promotion.
3. Stock status and selected location.
4. `Vì sao phù hợp với bạn`.
5. `Điểm cần cân nhắc`.
6. Need-specific highlights.
7. Source/data section with timestamp.
8. Actions: `Thêm vào so sánh`, `Chọn sản phẩm`, `Kiểm tra cửa hàng`.

Use a clear close button at the top right. The drawer should feel like a focused inspection layer, not a separate product page squeezed into a sidebar.

### 11. Local stock state

Differentiate these states visually and semantically:

- `Có hàng tại 3 cửa hàng gần bạn` — green.
- `Còn ít hàng` — amber.
- `Hết hàng tại khu vực đã chọn` — neutral/amber, with nearby-store action.
- `Chưa có dữ liệu tồn kho` — gray, with a source-status explanation.

Never infer “Hết hàng” from missing data.

### 12. Grounding and source status

Every factual commerce section should support a compact source indicator, for example:

- `Giá cập nhật 14:32 hôm nay`
- `Nguồn: Catalog sản phẩm`
- `Tồn kho: API khu vực Hòa Lạc`
- `Chưa có dữ liệu độ ồn từ catalog`

Keep source information available but secondary. Use a small `Xem nguồn dữ liệu` disclosure rather than cluttering every card.

### 13. Loading and latency states

The target experience must feel responsive.

- Immediately echo the user request into the Buying Brief.
- Show product-card skeletons while retrieving.
- Stream the concise AI summary independently from product results.
- Avoid full-screen spinners.
- Preserve previous results while reranking, using a subtle updating state.
- Loading copy: `Đang đối chiếu nhu cầu với dữ liệu sản phẩm…`.

### 14. Guest-session persistence

The UI should signal that the current decision can survive a page reload without implying a permanent personal profile.

Use subtle copy in the session menu:

> `Phiên tư vấn này được lưu trên thiết bị để bạn tiếp tục sau khi tải lại trang.`

Provide `Xóa phiên tư vấn` as a clear action.

### 15. Empty state

The empty state is not a blank chat page.

Left area:

> **Bạn đang cần máy lạnh cho không gian nào?**  
> Mô tả căn phòng, ngân sách và điều bạn quan tâm. Bạn không cần biết thông số kỹ thuật.

Large input example:

> `Ví dụ: phòng ngủ 18m², nắng chiều, có trẻ nhỏ, khoảng 11 triệu, ưu tiên chạy êm`

Right workspace:

Show three visual starter cards:

- `Phòng ngủ 15–20 m²`
- `Phòng khách nhiều nắng`
- `Ưu tiên tiết kiệm điện`

Include a subtle statement of trust:

> `Giá, khuyến mãi và tồn kho chỉ hiển thị khi có dữ liệu từ hệ thống.`

### 16. Optional checkout prototype

Only add this after the discovery, comparison, detail, and stock flows are polished.

If included, use a safe order-summary drawer or modal with explicit confirmation. Do not imply that the AI completed a real transaction. Label it `Thanh toán mô phỏng` in the hackathon demo.

### Screen generation priority for Stitch

Generate a cohesive desktop web application, not a marketing landing page. Produce the following screens in this order:

1. **Discovery — populated state:** conversation rail, visible Buying Brief, concise AI summary, optional follow-up, and top-three product grid.
2. **No exact match:** same layout with amber near-match explanation, three transparent trade-off cards, and constraint-relaxation actions.
3. **Comparison:** side-by-side three-column decision table with sticky product headers and `Chỉ hiện điểm khác nhau` enabled.
4. **Product detail + local stock:** discovery workspace with the right-side detail drawer open.
5. **Empty state:** natural-language entry point with starter scenarios.

Use consistent content and the same three sample products across screens so the flow feels like one real session.

## Do's and Don'ts

### Do

- Make the product canvas visually dominant and the conversation rail secondary.
- Show useful product results before the user answers every follow-up.
- Keep the Buying Brief visible and editable throughout the journey.
- Use one concise recommendation summary and move detail into structured UI.
- Explain ranking changes using confirmed needs and product data.
- Present a clear best-fit choice, but keep alternatives and trade-offs visible.
- Offer graceful near matches instead of a dead-end zero-results screen.
- Keep price, stock, promotion, and source timestamps easy to verify.
- Use keyboard-visible focus states and logical tab order.
- Use a minimum interactive target of approximately 44 × 44 px.
- Maintain at least WCAG AA contrast for body text and controls.
- Pair every status color with text or an icon; color must never be the only signal.
- Respect reduced-motion preferences.
- Make every Vietnamese label readable, natural, and correctly accented.

### Don't

- Do not create a full-screen page that is merely a larger chatbot.
- Do not place product cards inside conversation bubbles.
- Do not use long walls of AI-generated text.
- Do not lock the user behind a multi-step questionnaire or wizard.
- Do not ask again for information already visible in the Buying Brief.
- Do not return only “Không tìm thấy” when constraints conflict.
- Do not silently relax hard constraints.
- Do not fabricate prices, stock, promotions, ratings, specifications, or review claims.
- Do not use fake precision such as “92% phù hợp” unless a validated score exists.
- Do not confuse missing stock data with out-of-stock.
- Do not make every card equally positive; each recommendation needs a visible trade-off.
- Do not use yellow as a large background or with white text.
- Do not use excessive gradients, glassmorphism, neon glows, or generic AI sparkle decoration.
- Do not create dense raw specification tables as the first layer of information.
- Do not create mobile screens as the primary deliverable for this prototype.
