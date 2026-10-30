# Brand profile: FDC Medical Group — Bác sĩ Gia đình (clinic) and Viện điều dưỡng FDC (nursing home), Hanoi

Load this profile whenever the work is for FDC: the family-medicine clinic (Công ty cổ phần Trung tâm bác sĩ gia đình Hà Nội, bacsigiadinhhanoi.vn, 75 đường Hồ Mễ Trì, Phường Đại Mỗ, Hà Nội, minhhb@bacsigiadinhhanoi.vn) or its nursing home (Điều dưỡng FDC, fdcmedical.vn, Thôn Long Phú, Phú Cát, Hà Nội, fdc@bacsigiadinhhanoi.vn; tagline "Khơi nguồn sức khỏe, san sẻ âu lo"). Business registration: SĐKKD 0105378374 (Sở KH&ĐT Hà Nội, 24/6/2011); representative Hoàng Thị Mai Phương. It supplies the brand values and local rules; the method comes from the other references.

## Contents
1. Where the system lives (read first)
2. Audiences
3. Themes and color
4. Typography and sizing
5. Locale rules (vi-VN)
6. Voice and sample copy
7. Inventory

---

## 1. Where the system lives (read first)

- **Master: Claude Design system "FDC Medical Group"** — https://claude.ai/artifact/EZhBJY8xppjGRBpCyPV1PG. Tokens (`project/tokens.json`), the brand book (`project/README.md`), component guidelines and previews, logos, icons and service/specialty images live there. Read its README and tokens before designing anything; they win over this profile if they differ.
- **Code mirror: `minhhoangico-dot/fdc-ui`** (React + TypeScript + CSS Modules + Storybook). `design/fdc-medical-group/tokens.json` is a copy of the master; `npm run tokens` generates `src/tokens/tokens.css`. Components are built there and published back to the master as `components/bundle.js` (`window.FDC`) with `npm run build:design`. fdc-ui carries a copy of this skill and the `design-review` agent in `.claude/` plus a `CLAUDE.md`, so opening that repo in Claude Code is enough; `npm run check` and `npm run review:visual` run every check.
- **Sync directions.** Tokens and guidelines: Claude Design → code (copy tokens.json, regenerate, re-run contrast in both themes). Component behavior: code → Claude Design (build, `node scripts/check-design-previews.mjs`, then publish the changed `project/` files and, last, the index with a new `lastChange`).
- **Token names are unprefixed** and identical everywhere (`--brand-600`, `--space-15`, `--font-body`), because Claude Design compiles `tokens.json` to those names. Components use the semantic names (§3).

## 2. Audiences

| Surface | Users | Defaults |
|---|---|---|
| Public websites, booking, patient/family portal | Patients of all ages, many 60+; adult children booking for parents | `body` 18px, 48px controls, 44px targets, one question per page, hotline on every page |
| Nursing-home family view | Families checking on a resident, mostly on phones | Same as public; reassuring tone; clear dates and times |
| Staff tools (FDC Manager, reception, nurses, carers) | Trained daily users, often on tablets | `body-sm` 16px, 48px controls, denser tables, 24-hour times |

## 3. Themes and color

Two themes share every token name; set `data-theme="clinic"` (default, blue) or `data-theme="nursing-home"` (orange) on the page root. The nursing-home theme overrides only `brand-50…800` and `leaf-500`; semantic aliases are re-declared in each theme block so nested themes work.

| Token | Clinic | Nursing home | Use |
|---|---|---|---|
| `brand-600` | #1c75bc (white text 4.86:1) | #bf540d (4.7:1) | Primary actions, links, key headings |
| `brand-700` / `brand-800` | #0b62a7 / #0a5896 | #9d4719 / #7d3812 | Hover, pressed, footer; text on tints |
| `brand-200` | #bfd6e8 | #ffdcaa | Section tints (ink text only) |
| `brand-300` | #84c8f9 | #ffa234 | Bright bands, avatar ring (dark text only) |
| `group-600` | #1c75bc | #1c75bc | Group blue in every theme |
| `leaf-500` / `leaf-700` | #8cc63f / #4f7419 | #93c2ac / #4f7419 | Leaf decorative only / success text ≥ 5.0:1 on every surface |
| `accent-600`, `accent-cta` | #db227c, #db1f7a | same | **Hotline only** (number, icon, call button) |
| `ink`, `ink-soft`, `ink-subtle` | #333, #595959, #767676 | same | Text, secondary text, placeholders |
| `danger` | #b42318 | same | Errors (6.6:1); never pink for errors |
| `status-info-bg` / `-border` / `-text` | info-50 / info-600 / info-800 (#eff8ff / #1c75bc / #0a5896) | same, fixed | Pending work and info tags ("Chờ gửi · còn 27 giây"); never green for pending |
| `status-warning-bg` / `-border` / `-text` | warning-50 / -600 / -800 (#fff6d6 / #a16a00 / #6b4500) | same, fixed | Warnings and abnormal values (StatusTag `attention`: "Cao", "Thấp"); amber, never the nursing-home orange |
| `status-success-bg` / `status-error-bg` | success-50 #edf7e2 / danger-50 #fdeeec (v2.4) | same, fixed | Tinted success and error tags, subtle success panel, boxed notices |
| `border-control` | #767676 | same | Field and tile borders (3:1+) |

Semantic aliases components must use: `action-primary-bg`, `action-primary-bg-hover`, `text-on-action`, `text-default`, `text-muted` (→ ink-soft), `text-link`, `focus-ring`, `status-success-text`, `status-error-text`, `status-info-bg`, `status-info-border`, `status-info-text`, `hotline`. Contrast pairs live in fdc-ui `design/contrast-pairs.json`; run `contrast.mjs` with and without `--scope "[data-theme='nursing-home']"` after any color change.

Rules: one primary action per view; pink means "call us", red means "something needs fixing", and they never appear as each other; green never carries white text; logos only on white or `surface-alt`. `text-link` is `brand-700` since 2.2 (5.8:1 on `surface-alt`); `brand-600` failed there (4.498:1). Components use role tokens only (`text-link`, `surface-selected`, `action-secondary-edge`, `group-accent`…), never `brand-*`; fdc-ui's `lint:tokens` enforces it, and `contrast` checks every role × allowed surface. Density: `data-density="compact"` on staff tools (16px text, 44px controls).

## 4. Typography and sizing

- **Headings: Montserrat** 600/700, line-height ≥ 1.3, sentence case (the old site's uppercase is dropped).
- **Everything else: Be Vietnam Pro** 400/500/600, line-height ≥ 1.5. Its stacked tone marks get ~0.40em above capitals vs ~0.24em in Montserrat — clearer for older readers.
- Type styles: `heading-xl` 32 · `heading-lg` 26 · `heading-md` 22 · `heading-sm` 20 · `body` 18 · `body-sm` 16 (staff) · `label` 16 · `label-button` 18 · `caption` 14 (metadata only).
- Sizes: `control-height` 48px, `target-min` 44px, `focus-ring-width` 3px + `focus-ring-offset` 2px, `measure` 40rem. Spacing keeps the site's 5/10/15/20/30/40/50 steps, in rem.
- Font files are in the master (`fonts/`); apps load Google Fonts with `subset=vietnamese`. Check changes with `assets/vi-glyph-test.html`. Normalize typed text to NFC.

## 5. Locale rules (vi-VN)

| What | Format | Code |
|---|---|---|
| Money | `1.250.000 ₫` | `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })` |
| Short date | `24/10/2026` | `{ day: '2-digit', month: '2-digit', year: 'numeric' }` |
| Long date | `Thứ Bảy, 24 tháng 10, 2026` | `{ dateStyle: 'full' }` |
| Time | `14:05`, time zone `Asia/Ho_Chi_Minh` | `{ hour: '2-digit', minute: '2-digit' }` |
| Sorting names | Anh, Ăn, Ân, Bình, Dũng, Đặng | `Intl.Collator('vi').compare` |

- **Names:** one field "Họ và tên"; never split; keep diacritics in storage and search.
- **Date of birth:** DateInput — Ngày / Tháng / Năm, hint "Ví dụ: 27 3 1950".
- **Phone:** PhoneInput — accepts spaces, dots, dashes, +84; shows `0912 345 678`. Hotlines: clinic **024 35 430 430**, nursing home **096 583 7777**, always also as visible text.
- **Emergency:** 115 ("Gọi 115 ngay").

## 6. Voice and sample copy

Warm, calm, respectful, like a trusted family doctor. "Bạn" in public copy; elders addressed respectfully ("các Cụ" on nursing-home pages). Plain words first, medical term in brackets.

| Purpose | Vietnamese |
|---|---|
| Primary CTA | Đặt lịch khám |
| Continue / Back | Tiếp tục / Quay lại |
| Who is it for | Bạn đặt lịch cho ai? Cho tôi / Cho người thân |
| Error summary title | Vui lòng kiểm tra lại thông tin |
| Name / phone / DOB errors | Nhập họ và tên · Nhập số điện thoại gồm 10 chữ số, ví dụ 0912 345 678 · Ngày sinh phải là một ngày trong quá khứ |
| Taken slot / full day | Đã kín · Ngày này đã kín lịch. Vui lòng chọn ngày khác hoặc gọi tổng đài. |
| System failure | Chúng tôi chưa gửi được. Vui lòng thử lại hoặc gọi 024 35 430 430. |
| Sent | Đã gửi. Chúng tôi sẽ gọi lại cho bạn sớm. |
| Help line label | Cần giúp? Gọi tổng đài |

### Staff tools (version 2.1, from the hoso app)
- **Buttons**
  - One primary button per screen state.
  - Secondary buttons are white with a brand edge.
  - An unavailable button has a dashed edge and always says why (Button `disabledReason`).
  - Labels say exactly what will happen ("Dùng người và lượt khám này", "Nhờ Minh kiểm tra").
- **Empty and invalid fields**
  - An empty field is neutral: grey "Chưa điền · ví dụ 78".
  - Show red only when a typed value is wrong, or after check/review.
  - A choice group reports one error with one red bar.
- **Counts**
  - Keep "mục còn thiếu" (to do) and "ô chưa lưu" (unsaved) as separate counts.
- **Codes and emphasis**
  - Name first, code after it, lighter: "Tăng huyết áp (I10)".
  - Green only for success; pending work uses `status-info`.
  - Values outside the normal range are amber (`attention`), not red; red is for what must be fixed. Ranges and any confirmation step are set by a doctor.
  - Status tags are tinted words with a dot, never outlined boxes; notices carry a sign ("!", "i", "✓") as well as a color.
  - Bold only emphasizes values; attention gets a StatusTag word label.
- **Shortcuts**
  - Ctrl combinations only, shown with Kbd. Single letters misfire with Telex.
- **Layout**
  - Use the compact one-row Header; on phones it collapses to a bar with the person's name, date of birth and record code.
  - Long lists page clearly: "Hiển thị 1–50 trong 2.033 · ‹ Trước · Sau ›".
  - Build staff pages on StaffLayout (version 2.3): grey work surface, white blocks with edges (no shadows), sticky action bar with SaveStatus.
  - One bar holds the top: PatientContextBar sticky from 1024px up; below it the Header's thin bar. Focused fields never hide under a sticky bar.
- **Moments (versions 2.3–2.4)**
  - The main button follows the moment: unsaved → "Lưu" (after a failure "Lưu lại"); saved but missing → "Đến mục còn thiếu"; complete → "Xem lại trước khi gửi". It never turns into a real send.
  - SaveStatus never says "Đã lưu" while a conflict ("Cần xử lý 1 giá trị trước khi lưu") or unsaved change is open.
  - Sending never blocks the next person: during "Chờ gửi" staff move on; the waiting record stays findable with "Hủy gửi".
  - Send outcomes: "Sở đã tiếp nhận" (code), "Bị từ chối" (reason, fix, resend), "Chưa rõ kết quả" (check status or ask Minh; never "Gửi lại" — it may already be received).
  - The send button names who is sent ("Gửi lên Sở: Ngô Văn Nam"); after it, an undo window in `status-info` ("Chờ gửi · còn 30 giây", "Hủy gửi").
  - Search accepts text without tone marks (`foldVi`); an empty result says why and how to get back; a failed load keeps the filters and offers "Tải lại".
  - Measurements use NumberField (unit in the box, decimal comma, range checked on leaving, "Cao"/"Thấp" word tags); coded items use Combobox (name first, code after); several coded items for one question (all diseases found) use CodeList, next to a free-text field for the doctor's own words.
  - Keyboard shortcut hints show on computers only (StaffLayout `shortcuts`).
- **Phones (version 2.4):** long forms use FormPartNav in StaffLayout's aside (one "4. Thể lực · còn 2" toggle on phones); record lists use DataTable `stackBelow="phone"` with search before filters and the filter as a Select; filters on desktop are RadioGroup `variant="pills"`; facts are set apart by space, not "·".
- **Usability test:** `docs/usability-test-v2.4.md` in fdc-ui (Vietnamese, 60–75 minutes per staff member). Run it before building real hoso screens.
- **Sample screens:** fdc-ui Storybook › Pages › Nhân viên (record list, result entry, review before sending) with mock data in `src/fixtures/ksk.ts`. Start new hoso or FDC Manager screens from them.

## 7. Inventory

In the master and fdc-ui today (48 components, version 2.4):
- **Layout:** Stack, Inline, FieldRow (aligned multi-column fields: TextField, NumberField, Combobox, Select).
- **Atoms:** Button (neutral = white secondary / primary / hotline; `disabledReason`), TextField (`unit`, `after`, read-only look), Select, Checkbox, Icon (24 FDC glyphs), Avatar, TextLink, SkipLink, StatusTag (7 tones incl. `attention`, tinted with a dot, `sm`), Kbd.
- **Molecules:** DateInput, PhoneInput, TimeSlotPicker, RadioGroup (`layout="row"` or `"wrap"`, `density="compact"`, `variant="pills"` for list filters, one error per group), SummaryList (read-only `details` per row), CareCard (non-urgent = group blue, urgent = red, emergency = red + dark with "Gọi 115 ngay"), ConfirmationPanel (`tone="pending"`, `emphasis="subtle"` on staff screens, `steps` with explicit states: done ✓, waited-for step outlined), HotlineCard, WorkingHours, ServiceCard, SpecialtyTile, ValueCard, TestimonialCard, NewsCard, ServiceAccordion, FormNotice (`boxed`, `warning`, type signs); staff: NumberField, Combobox, CodeList, FormPartNav, SaveStatus (incl. `conflict`), Pagination, Breadcrumb.
- **Organisms:** Header (site: menu with tap/keyboard sub-menus, hotline, hours, CTA; `compact` for staff tools with `tools`, `collapseOnScroll`, `compactBar`), Dialog (`wide`, `scrollBody`), Footer (contacts as text, legal lines), IdleTimeoutDialog, ErrorSummary (`layout="inline"` on staff forms), ResultLookupForm, ContactForm; staff: DataTable (row-header link covers the cell, states keep the header, Pagination under the rows, `stackBelow="phone"`), PatientContextBar (facts without dots; actions share a row on phones).
- **Templates:** SiteLayout (the only `<main>`), BookingStep, StaffLayout (compact; context, aside, action bar, shortcuts).
- **Pages (fdc-ui Storybook):** full booking flow (service → who → time → details → check answers → confirmation, with idle timeout) a care-advice page, and three staff pages (Nhân viên); fixtures in `src/fixtures/site.ts` hold both sites' real menus and footers.

Still needed: the nursing-home logo as a file in code (only the clinic logo is in fdc-ui), the results of the staff usability test, doctor-approved normal ranges for vital signs and labs, ImportReview once a real file import exists, and doctor-approved care-advice wording. Nursing-home recipes (ResidentCard, CareScheduleRow, MedicationAdministrationRow, FamilyUpdateCard) stay in the product until the clinic also needs them.
