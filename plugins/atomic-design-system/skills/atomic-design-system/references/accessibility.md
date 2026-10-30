# Accessibility (WCAG 2.2 AA) for component libraries

Read this when building or auditing any interactive component, form, or color decision. Accessibility built into atoms scales to every screen; bolted on later it has to be fixed screen by screen.

## Contents
1. WCAG 2.2 criteria that land on components
2. ARIA patterns per component
3. Older users: concrete numbers
4. Manual checks automation misses

---

## 1. WCAG 2.2 criteria that land on components

| SC | Level | Requirement | Component consequence |
|---|---|---|---|
| 1.3.1 Info and relationships | A | Structure is in markup | Real headings, lists, `<label for>`, fieldset/legend for groups |
| 1.3.5 Identify input purpose | AA | Personal data fields expose purpose | `autocomplete="name" / "tel" / "email" / "bday-day" / "street-address"` |
| 1.4.1 Use of color | A | Color is not the only signal | Error = icon + text + border, not red alone |
| 1.4.3 Contrast (minimum) | AA | Text 4.5:1; large text 3:1 | Check every semantic pair in every theme (`contrast.mjs`) |
| 1.4.4 Resize text | AA | 200% zoom without loss | rem units; containers grow |
| 1.4.10 Reflow | AA | No 2-D scrolling at 320 CSS px | Stack at narrow widths; tables scroll inside their own container |
| 1.4.11 Non-text contrast | AA | UI boundaries, state indicators, focus rings 3:1 | Input borders, checkbox/radio outlines, switch tracks, selected tab markers |
| 1.4.12 Text spacing | AA | Survive line-height 1.5, paragraph 2×, letter 0.12em, word 0.16em | No fixed heights or clipping on text |
| 1.4.13 Content on hover/focus | AA | Dismissible (Esc), hoverable, persistent | Tooltips, popovers |
| 2.1.1 Keyboard | A | Everything works by keyboard | Native elements or APG keyboard patterns |
| 2.2.1 Timing adjustable | A | Turn off, adjust ≥10×, or warn with ≥20 s to extend | Session-timeout dialog |
| 2.2.2 Pause, stop, hide | A | Moving/auto-updating content > 5 s can be paused | No auto-advancing carousels |
| 2.4.3 Focus order | A | Logical order | DOM order = visual order |
| 2.4.7 Focus visible | AA | Visible focus indicator | `:focus-visible` ring on every interactive atom |
| 2.4.11 Focus not obscured (min) | AA | Focused element not fully hidden by sticky UI | `scroll-padding-top` = sticky header height; banners don't cover focus |
| 2.4.13 Focus appearance | AAA | ≥ 2px perimeter, 3:1 change | Adopt as house rule: 2–3px outline + offset |
| 2.5.3 Label in name | A | Accessible name contains visible label | Icon+text buttons: don't override with a different aria-label |
| 2.5.7 Dragging movements | AA | Single-pointer alternative to drag | Sortable lists, sliders, schedulers |
| 2.5.8 Target size (min) | AA | ≥ 24×24 CSS px or enough spacing | Floor for dense staff UIs; 44×44 for public/older users (2.5.5 AAA) |
| 3.2.6 Consistent help | A | Help in the same relative place on every page | Fixed slot for hotline/contact |
| 3.3.1 Error identification | A | Errors described in text | ErrorMessage atom + ErrorSummary organism |
| 3.3.2 Labels or instructions | A | Every input labeled | Persistent visible label; placeholder is never the label |
| 3.3.3 Error suggestion | AA | Say how to fix it | Message formula in `content-patterns.md` |
| 3.3.4 Error prevention | AA | Review/confirm/undo for legal, financial, data-changing actions | "Check your answers" step; confirm destructive actions |
| 3.3.7 Redundant entry | A | Don't make users re-enter info in the same process | Prefill; "same as patient" options |
| 3.3.8 Accessible authentication (min) | AA | No memory/puzzle tests without alternative | Allow paste; OTP with `autocomplete="one-time-code"`; magic links |
| 4.1.2 Name, role, value | A | Custom controls expose role/state | ARIA patterns below |
| 4.1.3 Status messages | AA | Announced without focus move | Toast `role="status"`; urgent errors `role="alert"` |

## 2. ARIA patterns per component (WAI-ARIA Authoring Practices)

Prefer native HTML; use ARIA only to fill gaps. "No ARIA is better than bad ARIA."

- **Button** — `<button>`. Enter and Space activate. Toggle: `aria-pressed`. Unavailable but explainable: `aria-disabled="true"` (stays focusable). Opens a dialog → focus moves into it; closing returns focus to the button.
- **Link vs button** — navigates → link; does something → button.
- **Text input / FormField** — `<label for>`; hint and error linked with `aria-describedby`; invalid → `aria-invalid="true"`; required → `required` plus visible "(bắt buộc)" / "(required)" text or mark the optional ones, whichever is the minority.
- **Checkbox / radio group** — native inputs inside `<fieldset><legend>`. Radios: arrows move and select; Tab enters at the checked radio.
- **Switch** — `role="switch"` + `aria-checked` (or native checkbox); Space toggles; the label states what is on, not "on/off".
- **Select / combobox** — native `<select>` first. Custom: `role="combobox"`, `aria-expanded`, `aria-controls` → `listbox`, `aria-activedescendant` for the highlighted option; Down opens, Esc closes, Enter selects.
- **Modal dialog** — native `<dialog>` with `showModal()`, or `role="dialog"` + `aria-modal="true"` + `aria-labelledby` (title). Tab cycles inside; Esc closes; initial focus on first field (or least destructive button for confirmations); focus returns to the trigger on close.
- **Tabs** — `tablist` (labelled) / `tab` (`aria-selected`, `aria-controls`) / `tabpanel` (`aria-labelledby`). Left/Right move between tabs; Home/End optional.
- **Alert / status** — `role="alert"` for urgent errors (don't move focus, don't auto-dismiss); `role="status"` for confirmations.
- **Breadcrumb** — `<nav aria-label="Breadcrumb">` with an ordered list; current page `aria-current="page"`.
- **Accordion / details** — native `<details><summary>` or button with `aria-expanded` + `aria-controls`.
- **Tooltip** — supplementary only (never the only place for essential info); shows on hover and focus; Esc dismisses.
- **Skip link** — first focusable element, jumps to `<main>`.
- **Icons** — decorative: `aria-hidden="true"`; meaningful standalone: accessible name on the parent control.

## 3. Older users: concrete numbers

Research basis: W3C WAI "older users" guidance; NN/g studies of users 65+ (they were 43% slower, succeeded 55% vs 75% of the time, and 90% blamed themselves for errors).

| Aspect | Public / older users | Staff / dense UI |
|---|---|---|
| Body text | 18px (never < 16px) | 16px (14px only for secondary metadata) |
| Line height | 1.5–1.6 | ≥ 1.5 body, ≥ 1.3 headings |
| Text contrast | aim 7:1, minimum 4.5:1 | 4.5:1 |
| Targets | ≥ 44×44px with ≥ 8px gaps | ≥ 24×24px minimum, 32–40px preferred |
| Focus ring | 3px + 2px offset | 2–3px |
| Line length | ≤ 70 characters | ≤ 80 |
| Motion | none automatic; honor reduced motion | same |
| Timeouts | warn, ≥ 20 s to extend, prefer 10× default | same |

Behavior: let people **type** dates and times rather than forcing pickers; accept spaces, dots, dashes and country codes in phone numbers; keep labels and hints visible (no placeholder-only fields); no hover-only menus; primary actions are text buttons, not icon-only; visited links look different; avoid ALL CAPS; keep navigation identical across pages; make errors forgiving and specific.

## 4. Manual checks automation misses

Automated axe checks find roughly a third of issues. Before marking a component `stable`:
1. Keyboard only: reach, operate and leave every part; focus always visible and never trapped (except inside modals).
2. Screen reader pass (NVDA + Firefox/Chrome on Windows, VoiceOver + Safari on macOS/iOS, TalkBack on Android for mobile-heavy audiences): name, role, state and changes are announced.
3. 200% and 400% zoom; 320px width; text-spacing bookmarklet.
4. Windows High Contrast / forced colors.
5. Long and translated content; the language's hardest glyphs.
