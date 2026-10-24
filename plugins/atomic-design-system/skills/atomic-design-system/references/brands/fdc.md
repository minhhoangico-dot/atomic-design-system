# Brand profile: FDC — Bác sĩ Gia đình (Family Doctor Centre, Hanoi)

Load this profile whenever the work is for FDC: the family-medicine clinic (Phòng khám Đa khoa Bác sĩ Gia đình Hà Nội, bacsigiadinhhanoi.vn) or its nursing home. It supplies the brand values and local rules; the method itself comes from the other references. Namespace: `fdc`.

## Contents
1. Audiences
2. Color (sources and accessible steps)
3. Typography
4. Locale rules (vi-VN)
5. Voice and sample copy
6. Inventory seeds (core vs recipes)

---

## 1. Audiences

| Surface | Users | Defaults |
|---|---|---|
| Public website, booking, patient/family portal | Patients of all ages, many older; family members booking for parents | 18px body, 44px+ targets, one question per page, large-text mode available |
| Nursing-home family view | Adult children checking on a parent; often on phones | Same as public; reassuring tone; clear timestamps |
| Staff tools (doctors, nurses, reception, carers) | Trained daily users, often on tablets during care rounds | 16px body, 40px controls (24px absolute minimum), denser tables, 24-hour times |

## 2. Color

Sources: logo (sampled from the artwork) and the website stylesheet (bacsigiadinhhanoi.vn, WordPress theme "fdcmedical"): `#1C75BC` is the dominant custom color (links, menu, titles, page headers); `#0B62A7` footer; `#DF3386`/`#E03287` hotline text and footer stripe; `#BFD6E8` and `#D2E4F2` pale section backgrounds and form borders; white header; text `#333`.

Ramps generated with `node scripts/ramp.mjs <hex>`; contrast is WCAG 2.x against white (#FFFFFF) and black.

**Blue — primary brand** (logo + site `#1C75BC`, anchored at 600)
| step | hex | white text on it | use |
|---|---|---|---|
| 50 | #F1F8FF | — | page tint |
| 100 | #DCEEFF | — | selected row, info background |
| 200 | #B8DCFF | — | hover tint |
| 300 | #87C4FE | — | dark-theme links/focus |
| 500 | #3E8ED5 | 3.48 | decorative only |
| **600** | **#1C75BC** | **4.86 AA** | primary buttons, header bar, brand fills |
| 700 | #0061A3 | 6.48 AA | hover, links, focus ring, brand text on tints |
| 800 | #004A7F | 9.19 AAA | footer (site uses #0B62A7), text on blue tints |

**Green — accent** (logo leaf `#8BC63F`, anchored at 300)
| step | hex | white text on it | use |
|---|---|---|---|
| 50 | #EBFFD8 | — | success tint |
| **300** | **#8BC63F** | **2.05 fail** | decorative leaf, illustrations, fills **with dark text only** (black on it 10.25) |
| 600 | #548300 | 4.54 AA (barely) | avoid for text — no margin |
| **700** | **#446B00** | **6.27 AA** | green text, success icons, success buttons |

**Pink — attention** (site hotline `#DF3386`, anchored at 500)
| step | hex | white text on it | use |
|---|---|---|---|
| **500** | **#DF3386** | **4.24** (AA large text/UI only) | hotline numbers ≥ 24px or bold ≥ 18.66px, decorative stripe |
| **600** | **#CA1975** | **5.37 AA** | pink text on white at normal size, pink buttons |
| 700 | #AA0060 | 7.30 AAA | pink text on pink tints |

Rules:
- Primary action = blue 600 with white text. One primary per view.
- **Pink is for the hotline and urgent attention, not for errors.** Errors use a dedicated red (`--fdc-color-red-700` ≈ #B42318) so users never confuse "call us" with "something is wrong". Never use pink and red side by side.
- Green never carries white text. Success messages: green-700 text on green-50 background.
- Semantic mapping starts from `assets/tokens.template.css` with the `ds` prefix replaced by `fdc` and the `brand` ramp replaced by the blue ramp above; add `--fdc-color-bg-accent-*` (green) and `--fdc-color-fg-attention` (pink 600).

## 3. Typography

- **Headings: Montserrat** (600/700) — matches the website and logo feel. Line-height ≥ 1.3. Avoid all-caps headings (the site uses some; don't carry that into apps).
- **Body, labels, inputs, tables: Be Vietnam Pro** (400/500/600) — designed by Vietnamese type designers; its stacked marks (Ẫ, Ể, Ợ) get ~0.40em of space above capitals vs ~0.24em in Montserrat, so tone marks stay legible for older readers. Line-height ≥ 1.5.
- Load with the Vietnamese subset: `https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap&subset=vietnamese`.
- Tokens: `--fdc-font-family-heading: 'Montserrat', 'Be Vietnam Pro', system-ui, sans-serif;` `--fdc-font-family-body: 'Be Vietnam Pro', system-ui, sans-serif;`
- Body size: 18px (`1.125rem`) on patient/family surfaces, 16px on staff tools. Never below 14px. In FDC's `tokens.css` make the patient size the default (`--fdc-font-size-body: var(--fdc-font-size-300)`, same for `--fdc-font-size-label`) and let staff apps opt into density with `[data-density='compact'] { --fdc-font-size-body: var(--fdc-font-size-200); }` — the safe default protects the most vulnerable readers.
- Check with `assets/vi-glyph-test.html` after any font or line-height change. Test string: "ẪỄỖẲỰẬ — Nguyễn Thị Ánh Tuyết, Trường Sơn".
- Normalize text input to Unicode NFC (`value.normalize('NFC')`): Telex/VNI keyboards can produce decomposed characters that break search and matching.

## 4. Locale rules (vi-VN)

Verified with Node `Intl`:
| What | Format | Code |
|---|---|---|
| Money | `1.250.000 ₫` (no decimals; non-breaking space) | `new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })` |
| Numbers | `1.250.000,5` (dot thousands, comma decimal) | `Intl.NumberFormat('vi-VN')` |
| Short date | `24/10/2026` (dd/mm/yyyy) | `{ day: '2-digit', month: '2-digit', year: 'numeric' }` |
| Long date | `Thứ Bảy, 24 tháng 10, 2026` | `{ dateStyle: 'full' }` |
| Time | `14:05` (24-hour) | `{ hour: '2-digit', minute: '2-digit' }`; time zone `Asia/Ho_Chi_Minh` |
| Relative | `Ngày mai` | `Intl.RelativeTimeFormat('vi', { numeric: 'auto' })` |
| Sorting names | Anh, Ăn, Ân, Bình, Dũng, Đặng | `Intl.Collator('vi').compare` |

- **Names:** one field "Họ và tên". Order is family name → middle → given name (Nguyễn Văn Quyết); compound family names exist (Tôn Thất…), so never split automatically. Address people by given name with a kinship/respect term in copy for patients ("Bác Lan", "Ông Minh") only when the product knows the right term; otherwise use the full name. Keep diacritics everywhere, including search keys (Đoàn ≠ Doãn).
- **Date of birth:** three inputs **Ngày / Tháng / Năm** in that order; hint "Ví dụ: 27 3 1950".
- **Phone:** mobile numbers are 10 digits starting 03, 05, 07, 08, 09; display `0912 345 678`; accept spaces, dots, dashes and `+84`. Hotline numbers like `1900 xxxx` are shown as `tel:` links.
- **Emergency:** 115 (cấp cứu / ambulance). Emergency care cards and interruption pages say "Gọi 115 ngay".
- **Address:** free text lines (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố); don't force a dropdown lookup.

## 5. Voice and sample copy

Tone: warm, respectful, calm, like a trusted family doctor. Use "bạn" for general public copy; "Quý khách" sounds commercial — avoid in care contexts. Plain Vietnamese over Sino-Vietnamese medical terms where possible, with the medical term in brackets: "huyết áp cao (tăng huyết áp)".

| Purpose | Vietnamese | English |
|---|---|---|
| Primary CTA | Đặt lịch khám | Book an appointment |
| Continue | Tiếp tục | Continue |
| Back | Quay lại | Back |
| Optional marker | (không bắt buộc) | (optional) |
| Error summary title | Vui lòng kiểm tra lại thông tin | There is a problem |
| Name error | Nhập họ và tên của bạn | Enter your full name |
| Phone error | Nhập số điện thoại gồm 10 chữ số, ví dụ 0912 345 678 | Enter a 10-digit phone number, like 0912 345 678 |
| DOB error | Ngày sinh phải là một ngày trong quá khứ | Date of birth must be in the past |
| System error | Chúng tôi chưa thể đặt lịch cho bạn. Vui lòng thử lại hoặc gọi hotline 1900 xxxx. | We could not book your appointment. Try again or call 1900 xxxx. |
| Confirmation | Đã đặt lịch khám | Appointment booked |
| Who is booking | Bạn đặt lịch cho ai? Cho tôi / Cho người thân | Who is this appointment for? Me / A family member |
| Loading | Đang tải… | Loading… |
| Close (aria-label) | Đóng | Close |

Hotline placement: same position in the header on every page (WCAG 3.2.6), pink 500 at ≥ 24px or pink 600 at body size.

## 6. Inventory seeds (core vs recipes)

Core (shared, content-agnostic): Button, IconButton, Link, TextInput, Textarea, Select, Checkbox, Radio, Switch, Label, Hint, ErrorMessage, Badge, Tag, Avatar, Icon, Spinner, Heading, Text, Divider · Stack, Inline, Grid, Box, Container · FormField, DateInput (Ngày/Tháng/Năm), PhoneInput, SearchField, Alert, Toast, Tabs, Breadcrumb, Pagination, TimeSlotPicker · Header (with hotline slot), Footer, Dialog, ErrorSummary, SummaryList ("check answers"), CareCard (non-urgent/urgent/emergency), DataTable, EmptyState, IdleTimeoutDialog · FormStepTemplate, DashboardTemplate, DetailTemplate.

Recipes (FDC-specific compositions; promote to core only when the clinic *and* the nursing home both need them): DoctorCard, ServiceCard, AppointmentSummary, BookingFlow pages · ResidentCard, CareScheduleRow, MedicationAdministrationRow, VitalsPanel, FamilyContactCard, DailyUpdateCard (nursing home).
