# PROJECT_RULES.md

**NOCTURNE — Investigation System**
The single source of truth for every screen, component, and future feature.
If a decision is not covered here, follow the closest existing pattern and then
add the rule you settled on. All future work MUST comply with this document.

---

## 1. Product Vision

NOCTURNE is the **digital investigation system that accompanies a physical
detective board game**. It is never the main event — the board game on the table
is. The app is the confiscated-evidence terminal the detectives pick up beside
the board to unlock devices, read messages, listen to recordings, follow GPS
trails, collect intelligence ("Trace"), and request graded hints.

It must feel like a **real police / secret-intelligence operating system**:
grounded, cinematic, and believable. Never playful, never a game HUD.

**Experience pillars**
- Immersion over decoration — every element reads as part of a real system.
- Mystery over exposition — reveal only what the investigation has earned.
- Calm authority — the OS is confident and quiet, not loud or gamified.

---

## 2. UX Principles

1. **One screen, one job.** Each route answers a single investigative question.
2. **Thumb-first.** Primary actions live in the lower two-thirds of the screen.
3. **State is always legible.** Locked / active / solved / collected /
   flagged states are shown explicitly, never implied.
4. **No dead ends.** Empty and locked states explain how to progress.
5. **Diegetic language.** Copy uses in-world terms: *case file, confiscated
   device, recovered evidence, clearance, badge* — not *page, item, score*.
6. **Progress is sacred.** Never fake destructive actions; backend-dependent
   controls are visibly disabled with a short reason until wired up.

---

## 3. Mobile-First Rules

- **Portrait only.** Design and verify at ~390–430px width. Desktop is a
  centered portrait column (`max-w-[30rem]`), never a widened layout.
- **Persistent bottom navigation** is the primary wayfinding. Keep it to
  **4–5 thumb-reachable targets** (see `lib/navigation.ts`).
- **Touch targets ≥ 44px.** Interactive rows are `h-14`/`p-3` or taller.
- **Respect safe areas.** Use `env(safe-area-inset-*)` — helpers: `.pb-safe`
  for bottom nav, `pt-[calc(env(safe-area-inset-top)+…)]` for headers.
- **Sticky chrome.** System header sticks to top, bottom nav sticks to bottom,
  content scrolls between them.
- Never introduce a desktop-first grid, sidebar, or hover-only interaction.

---

## 4. Design Language

Theme: **Neo-noir · crime investigation · secret intelligence · detective
workstation · premium board game.**

- **Surfaces are dossiers.** Cards are flat, matte `bg-card` panels with a
  hairline border and generous internal padding — like paper in an evidence bag.
- **Amber is meaning, not decoration.** The evidence-amber accent marks the
  *active, important, or actionable*. Never use it as a fill for large areas.
- **Mono = machine.** Monospace is reserved for system data: codes, timestamps,
  IDs, labels, and status tags. Prose uses the sans body font.
- **Texture is subtle.** Scan-lines (`.noir-scanlines`) and the interrogation
  spotlight (`.noir-spotlight`) stay low-opacity and always `pointer-events-none`.

**Hard bans:** bright/saturated colors, cartoon UI, gaming HUD, cyberpunk neon,
fantasy motifs, purple/violet, gradients as primary fills, emoji as icons,
hand-drawn decorative blobs/SVG shapes.

---

## 5. Color Palette

The app is **always dark**; light mode is intentionally disabled. All colors are
defined as tokens in `app/globals.css`. **Only ever use semantic token classes**
(`bg-background`, `text-foreground`, `text-primary`, `bg-card`, `text-muted-foreground`,
`text-destructive`, `border-border`…). Never use raw `text-white`, `bg-black`,
`text-red-500`, or arbitrary hex/oklch values in components.

Five-color system:

| Role | Token | Meaning |
| --- | --- | --- |
| Background | `--background` | Deep charcoal investigation room |
| Foreground | `--foreground` | Bone-white document text |
| Steel gray | `--muted` / `--muted-foreground` | Metadata, timestamps, secondary |
| **Evidence amber** | `--primary` | Active / important / actionable accent |
| Classified crimson | `--destructive` | Urgent, flagged, restricted |

`--card`, `--secondary`, `--accent`, `--border` are tonal steps of the charcoal
base and do not count as new colors. If a new hue is ever needed, add it as a
token here first — never inline it in a component.

---

## 6. Typography

Two families only, wired in `app/layout.tsx` and exposed as `font-sans` /
`font-mono`:

- **Geist (`font-sans`)** — all prose, headings, body, buttons.
- **Geist Mono (`font-mono`)** — system data and labels only.

**Type roles**
- Screen title (`ScreenHeader`): `text-2xl font-semibold tracking-tight`.
- Card / section title: `text-lg` or `text-sm font-semibold`.
- Body: `text-sm leading-relaxed` (line-height 1.4–1.6). Body never below 14px.
- Balance headlines with `text-balance`; balance long prose with `text-pretty`.

**Uppercase mono labels — use the shared utilities, never hand-roll:**
- `.label-system` — section eyebrows / metadata. Mono, `0.65rem`, uppercase,
  `tracking-[0.2em]`, `text-muted-foreground` (override color when needed, e.g.
  `text-primary` on an active eyebrow).
- `.label-tag` — inline status pills & micro-tags (Locked, Open, Flagged,
  progress eyebrows). Mono, `0.65rem`, uppercase, `tracking-[0.15em]`; color set
  by context.
- `.label-brand` — the NOCTURNE wordmark. Mono, `0.75rem`, uppercase,
  semibold, `tracking-[0.3em]`.

Do **not** invent new `font-mono … uppercase tracking-[…]` combinations inline.
If you need a new label style, add a utility here.

---

## 7. Spacing System

- Use the **Tailwind spacing scale only** — no arbitrary `p-[17px]`.
- Use **`gap-*`** for spacing between siblings. Never mix `margin`/`padding`
  with `gap` on the same element, and never use `space-*` utilities.
- **Screen gutters:** `px-4`.
- **Screen header:** `pt-5 pb-3` (via `ScreenHeader`).
- **Between stacked cards / rows:** `gap-2` (dense lists) or `gap-3` (cards).
- **Between sections:** `mt-6`.
- **Card internal padding:** `p-4` (compact rows `p-3`, feature panels `p-5`).
- **Bottom of scroll content:** `pb-6` so the last item clears the nav.

---

## 8. Component Philosophy

- **Composition over repetition.** A visual pattern used 2+ times becomes a
  component in `components/investigation/`. Do not copy row/card markup between
  screens — reuse or extract.
- **Server by default.** Components are React Server Components unless they need
  state, effects, or browser APIs; only then add `'use client'`.
- **Data comes from `lib/mock-data.ts` via the async accessors** (`getCases`,
  `getEvidence`, …). Pages await these; they never import raw fixture arrays.
  This keeps the Supabase swap a one-file change.
- **Types live in `lib/types.ts`** and are the shared contract between data and
  UI. Extend types there, not inline.
- **Icons:** `lucide-react` only, sized `size-3 / size-4 / size-5`, always
  `aria-hidden="true"` when decorative. Never emoji.
- **shadcn/ui** primitives (`Button`, `Input`, …) are the base. This project's
  `Button` is Base-UI-based: use the **`render` prop** for polymorphism
  (`<Button render={<Link href="…" />}>`), never `asChild`.
- Keep `app/globals.css`, `app/layout.tsx`, and other scaffold files intact
  unless a rule here requires the change.

---

## 9. Animation Rules

- **Restrained and physical.** Motion confirms state; it never performs.
- Default to **`transition-colors`** for interactive feedback. Use
  **`active:` states** (e.g. `active:bg-accent/60`) rather than hover for touch.
- Durations stay short (~150–200ms) and easing is standard. No bounce, spring,
  parallax, or looping ambient animation.
- The active nav marker and progress bars animate width/opacity only.
- Respect `prefers-reduced-motion`: never rely on motion to convey meaning.

---

## 10. Accessibility Rules

- **Semantic HTML:** `main`, `header`, `nav`, `section`, `article`, `ul/li`,
  real `<button>`/`<a>`. Headings descend in order (`h1` per screen via
  `ScreenHeader`, then `h2`…).
- **Labels:** every icon-only control has `aria-label`; decorative icons/overlays
  are `aria-hidden="true"`. Inputs have a real `<label>` (may be `sr-only`).
- **Nav state:** active item exposes `aria-current="page"`.
- **Non-text meaning has a text/aria equivalent** (e.g. difficulty dots carry an
  `aria-label`; status is never color-only — pair it with an icon + word).
- **Contrast:** maintain AA. When overriding a background, override text color too.
- **Focus:** keep visible focus (`outline-ring/50` from base layer); never
  remove outlines without an equivalent replacement.

---

## 11. Naming Conventions

- **Files:** kebab-case (`case-card.tsx`, `system-header.tsx`).
- **Components:** PascalCase (`CaseCard`, `ScreenHeader`, `BottomNav`).
- **Routes:** lowercase folders under `app/`. Shell screens live in the
  `(investigation)` route group; the activation gateway is outside it.
- **Feature components:** `components/investigation/`. Generic shadcn primitives:
  `components/ui/`. Shared logic/data/types: `lib/`.
- **Types:** PascalCase interfaces/types (`Case`, `EvidenceKind`).
- **Constants:** UPPER_SNAKE_CASE (`NAV_ITEMS`, `CASES`, `DEVICE_ICON`).
- **Data accessors:** `get*` and Promise-returning (`getActiveCase`).
- **Booleans:** `is*` / `has*` (`isLocked`, `isActive`).
- **In-world copy** uses the diegetic vocabulary from §2.

---

## 12. Storyline & Investigation Design Rules

Rules for writing and designing cases in `docs/08_CASES/`:

1. **The 3-File Case Package:** Every case folder must contain exactly 3 files:
   - `STORYLINE.md`: The complete, realistic detective story walkthrough from start to finish.
   - `CASE_DESIGN.md`: The game design matrix, proof graph, and interactive mechanics.
   - `case.json`: The machine-readable Zod JSON payload for Next.js.

2. **Logic Vật Lý & Vật Dụng Gây Án (Physical & Tool Realism):**
   - Hung thủ không thể tự nhiên có sẵn vũ khí chuyên dụng trong tình huống bộc phát. Vũ khí phải có nguồn gốc chuẩn bị logic hoặc là vật dụng sẵn có ở hiện trường.
   - Mọi chi tiết ngành nghề (y tế, âm nhạc, hội họa, kỹ thuật...) phải đúng 100% thực tế vận hành.

3. **Chuẩn Pháp Y & Khám Nghiệm (Forensic Integrity):**
   - Không hạ thấp năng lực khám nghiệm pháp y (nhầm ngạt thở siết cổ thành ngừng tim tự nhiên do bỏ qua vết bầm).
   - Vết bầm, dấu vết sinh học và tư thế hiện trường phải đúng giải phẫu học và không gian vật lý thực tế.

4. **Tâm Lý Hành Vi Tội Phạm (Offender Psychology Realism):**
   - Dù là hung thủ có tính toán hay phạm tội lần đầu trong hoảng loạn, mọi hành vi, sơ hở và phản ứng tâm lý phải nhất quán với bản chất, độ tuổi và địa vị nhân vật.

5. **Manh Mối Lạc Hướng Có Ý Nghĩa (Meaningful Red Herrings):**
   - Cấm manh mối rác vô nghĩa. Mọi manh mối lạc hướng khi bị bóc tách đều phải có động cơ tâm lý/hành vi cá nhân thỏa đáng.

7. **Bộ Rubric 8 Chỉ Số Định Lượng Khắt Khe (Bắt buộc dùng Bảng Tiếng Việt Thuần Túy - Không dùng Icon Emoji):**
   Mọi tệp `STORYLINE.md` bắt buộc phải có khối Bảng 8 chỉ số định lượng ở ngay đầu trang (chỉ dùng văn bản Tiếng Việt, không dùng icon emoji):
   - **1. Độ sâu câu chuyện (Story Depth):** Số tầng bí mật (1-4 Tầng). Tầng 4 = Đa tầng Động cơ & Âm mưu dài hạn.
   - **2. Độ nhiễu manh mối (Clue Noise Ratio):** Tỷ lệ % chứng cứ nhiễu có động cơ riêng (Điểm ngọt: 30-40%).
   - **3. Độ kinh dị (Psychological Dread):** Mức độ rợn người, lạnh gáy, u uất ám ảnh (/10). Không tính máu me đâm chém.
   - **4. Độ độc đáo Motif (Motif Uniqueness):** Mức độ biến tấu nghịch lý logic/alibi mới lạ (/10).
   - **5. Độ kịch tính tâm lý (Psychological Drama):** Độ giằng xé nội tâm, bi kịch nhân văn hoặc phản diện thuần túy (/10).
   - **6. Độ thỏa mãn Eureka (Deduction Eureka):** Mức độ sảng khoái từ tư duy loại trừ logic (/10).
   - **7. Độ tương tác vật lý (Physical Interaction):** Thao tác 2D, xoay EXIF, soi UV, giả lập Lab (/10).
   - **8. Độ phức tạp Alibi Clash (Alibi Clash Complexity):** Độ tinh vi của chứng cứ dùng để bẻ gãy lời khai (/10).



9. **Mô Tả Nhân Vật Tinh Gọn & Khai Quật Tâm Lý Qua Manh Mối (Clue-Driven Character Psychology):**
   - **Phần Danh Mục Nhân Vật ở đầu:** Chỉ ghi các thông tin căn bản (Key Profiles) bao gồm: *Họ tên, Tuổi, Chức danh/Quan hệ* và cụm ngắn **`Lý do nghi vấn`** (khoanh vùng khách quan ban đầu: chìa khóa phụ, dấu vết vật lý, lịch sử cuộc gọi). **CẤM viết trước diễn biến tâm lý, động cơ ẩn hay bí mật cá nhân.**
   - **Phần Khai Quật Tâm Lý:** Diễn biến tâm lý giằng xé, nợ nần, lòng tham hay động cơ diệt khẩu của mỗi nhân vật **bắt buộc phải được người chơi tự bóc tách qua từng giai đoạn phá án** thông qua bằng chứng thu được.

---

## 13. Agent Workflow & Interaction Rules

1. **Strict Commit Control (Quy tắc Git Commit):**
   - Agent **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG CHẠY `git commit`** sau khi thực hiện công việc.
   - Chỉ thực hiện `git commit` khi người dùng phát lệnh hoặc yêu cầu trực tiếp (Ví dụ: "commit", "commit đi", "hãy commit cho tôi").

2. **Consultative & Proposal-First Workflow (Quy tắc Thảo luận & Đề xuất trước khi thực thi):**
   - Khi người dùng đặt vấn đề, đưa ra yêu cầu mới hoặc thắc mắc: Agent **bắt buộc phải giải thích, phân tích vấn đề và đưa ra các phương án/đề xuất** trước.
   - **CHỈ TIẾN HÀNH VIẾT CODE HOẶC CHỈNH SỬA FILE KHI NGƯỜI DÙNG ĐÃ CHỌN/ĐỒNG Ý (BẤM/NÓI "OKE" HOẶC CHỌN PHƯƠNG ÁN)**.
   - Không tự ý thực thi viết mã hoặc sửa file hàng loạt trước khi có phản hồi đồng ý của người dùng.

---

## 14. Automated LaTeX Compilation & Directory Cleanliness

- Thư mục `docs/cases/case_000/documents/latex/` chỉ chứa duy nhất các file nguồn `.tex`.
- Mọi thao tác cập nhật/chỉnh sửa `.tex` bắt buộc đi kèm tự động chạy biên dịch `pdflatex`.
- Output `.pdf` tự động được chuyển đè vào thư mục `public/documents/case_000/<phase>/`.
- File nhật ký biên dịch `.log` tự động gom vào `.vscode/latex_logs/`.
- Xóa sạch các file phụ rác (`.aux`, `.out`, `.fls`, `.fdb_latexmk`) ngay sau khi biên dịch xong.
