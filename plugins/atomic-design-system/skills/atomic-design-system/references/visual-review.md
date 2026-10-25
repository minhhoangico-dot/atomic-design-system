# Visual review: render, measure, then judge

Read this for Mode E: whenever UI must be checked as people will see it, not only as code. Code review and story-level axe miss what only shows up when the page is drawn: a hotline banner that pushes the page sideways on a phone, a focus ring painted under a sticky header, three cards nested inside each other, a "Đã kín" label too small for a 70-year-old to read.

## Contents
1. The loop
2. What `shots.mjs` measures, and what it cannot
3. Severity
4. Judging the screenshots: heuristics (0–4)
5. Cognitive load
6. Taste for product screens ("Operate mode")
7. Report format
8. Pitfalls

---

## 1. The loop

1. **Build what users will see.** `npm run build-storybook` (or start the app). Review the built output, not a dev server that may be mid-reload.
2. **Measure.** `node scripts/shots.mjs --storybook storybook-static --themes <every theme>`, or `--page <file|url>` for plain pages. Default widths are 320 (equal to 400% zoom on a 1280px screen), 390 (a common phone), 768 and 1280. For staff tools pass `--target-min 24`; for patient and family screens keep 44. It writes `report.md`, `report.json` and screenshots under `visual-review/`. **No browser means no review**: if Playwright is missing, say so and stop. Do not substitute guesses.
3. **Look before you read the numbers.** Open the screenshots of the page stories and the main components at 390 and 1280 in each theme. Write your own observations using §4–§6 *before* opening `report.md`, so the measurements don't narrow what you notice.
4. **Merge.** On anything measurable (size, overflow, contrast, focus), the measurement wins over the eye. Your eyes cover what scripts cannot: hierarchy, grouping, nesting, emphasis, copy, and whether the screen feels calm.
5. **Confirm each Blocker and High.** Open its screenshot or re-run with `--filter <story-id> --shots all`, and check it is real: not a story-only artifact, not a deliberately decorative element. Note anything you dismissed and why.
6. **Report** (§7), ranked by severity, with evidence. Fixes go through Modes B and C. After fixing, run the script again; the review is done when it reports 0 Blockers.

## 2. What `shots.mjs` measures, and what it cannot

| Check | How it is measured | Severity |
|---|---|---|
| `overflow` | page scrolls sideways at a width (WCAG 1.4.10); names the elements past the edge | Blocker |
| `target-size` | the real hit area, found by hit-testing (labels, padded wrappers and `::after` overlays count) | Blocker if under 24px with no spacing (WCAG 2.5.8); High if under `--target-min` |
| `text-size` | computed font size of visible text | High if under 12px; Medium if under `--min-font` (16) |
| `text-clip` | text cut off by `overflow: hidden`, ellipsis or a line clamp | Medium |
| `focus` | Tab to each stop; screenshot it focused and blurred; identical pixels mean nothing visible changed (WCAG 2.4.7) | Blocker |
| `story` | Storybook render or `play` function failed | Blocker |
| `console` | console errors and uncaught exceptions | High |
| `axe` | axe-core on the rendered page, contrast included (critical → Blocker, serious → High, moderate → Medium, minor → Nit) | as mapped |

It **cannot** judge hierarchy, nesting, emphasis, reading order versus visual order, wording, whether a truncation is acceptable, motion quality, or screen-reader output. Those are §4–§6, plus the manual checks in `accessibility.md` §4. Contrast is computed by axe per rendered pixel pair, and by `contrast.mjs` per token pair; never estimate it from a screenshot.

## 3. Severity

| Level | Meaning | Examples |
|---|---|---|
| **Blocker** | Someone cannot finish the task, or a WCAG A/AA failure with no workaround | Sideways scroll at 320px; invisible focus; crowded tiny targets; a broken story; "Tiếp tục" hidden under the keyboard |
| **High** | The task is slower or error-prone for the real audience | 36px buttons for 60+ patients; serious axe issues; error links 23px tall; console errors |
| **Medium** | Inconsistent, off-system, or harder to understand | 14px status text; two primary buttons; clipped names; card-in-card nesting |
| **Nit** | Polish | Uneven gaps; icon slightly off-center |

Rank by what the user experiences, not by how hard the fix is.

## 4. Judging the screenshots: heuristics (0–4)

Score each of Nielsen's ten heuristics per screen or flow: **4** no problems · **3** minor · **2** noticeable friction · **1** serious · **0** blocks the task. Each line gives what to look for on clinic and nursing-home screens.

1. **Visibility of status.** "Bước 2 trên 5"; a sending state on submit; the confirmation shows a booking code and what happens next; a selected time slot is obviously selected.
2. **Match with the real world.** Plain Vietnamese, with the medical term in brackets; dates as 24/10/2026 and times as 14:05; words patients use ("Đã kín", not "Unavailable").
3. **User control and freedom.** "Quay lại" on every step; "Thay đổi" on the check-answers page; a way to cancel; the session timeout offers more time.
4. **Consistency and standards.** The same component for the same job; pink only for the hotline, red only for errors; one primary button per view; the same header and menu on every page.
5. **Error prevention.** Taken slots shown as taken, not hidden; dates typed, not forced through a picker; a check-answers step before submitting.
6. **Recognition over recall.** Labels and hints stay visible; the summary repeats every answer; the chosen service and time stay in view on later steps.
7. **Flexibility.** Staff tools: density and keyboard paths. Patient flows: the hotline as a parallel path on every step.
8. **Aesthetic and minimalist design.** One question per page; nothing competes with the primary action; no decoration that carries no meaning.
9. **Recover from errors.** An error summary at the top linked to each field; inline messages say how to fix, not just "Sai"; typed data is kept.
10. **Help.** Hints next to fields; the hotline number visible as text; a help line on every form.

## 5. Cognitive load

At each decision point:
- **Count the visible options.** More than 4 at once, without grouping or a recommended default, slows older users down. Group them, or split across steps.
- **Count the things asking for attention**: filled buttons, brand-colored blocks, badges. More than one per view means none of them stands out.
- **Check the words.** Instructions in one short sentence, verb first; no paragraph before the first field; no jargon without a plain version.
- **Check memory.** Nothing on this step should require remembering something from a previous one.

## 6. Taste for product screens ("Operate mode")

Clinic and nursing-home software is used to *get something done*, often by worried people. Scanability, consistency and calm come before expression. Marketing-style boldness belongs on campaign pages, not in booking, results or care records.

- **One level of container.** A card inside a card inside a card is the most common sign that structure was added instead of designed. Use one surface, then headings, spacing and dividers inside it.
- **One emphasis per view.** One primary button and one brand-colored block. Everything else is neutral.
- **Color carries meaning, not decoration.** Brand color for actions and links, status colors for status, neutrals for everything else. No gradients, glass effects or colored side-stripes on product screens.
- **Type does the hierarchy.** Steps from the type scale, sentence case, no ALL-CAPS labels, and no small "eyebrow" label above every heading.
- **Alignment and proximity.** One left edge per column; gaps from the space scale; related things closer together than unrelated things.
- **Real content.** Long Vietnamese names and addresses, real prices, real opening hours. No lorem ipsum, invented statistics, testimonials or doctor photos.
- **The generic "AI-made" look to avoid:**
  - a grid of identical rounded cards with soft shadows for every kind of content;
  - a gradient hero;
  - emoji as icons;
  - "01 / 02 / 03" on things that are not a sequence;
  - every section fading up on scroll;
  - centered text for everything.
- **Calm.** Generous space; nothing moves on its own or blinks; red appears only when something needs fixing.

The brand profile wins over this list whenever they differ.

## 7. Report format

```markdown
# Visual review — <scope>, <date>
Measured: <n> stories × <themes> at 320/390/768/1280. Blocker <n> · High <n> · Medium <n> · Nit <n>.
Verdict: <one sentence: ship / fix blockers first / rework>.

## Findings
| # | Severity | Where (story/page · theme · width) | What the user experiences | Evidence | Rule | Direction |
|---|---|---|---|---|---|---|
| 1 | Blocker | Pages/Đặt lịch › Chọn giờ · clinic · 320 | The page slides sideways; "Tiếp tục" is off screen | shots/…-320.png; page 437px wide in 320px | WCAG 1.4.10 | Let the hotline banner wrap |

## Heuristics (0–4)
| Heuristic | Score | Why |

## What works (keep it)
- 2–3 specific strengths, so fixes don't break them.

## Dismissed
- Measured findings judged not real, with the reason.
```

Describe the problem in the user's terms ("an older patient cannot tell which time is selected"), not as an order ("change the color to blue"). The direction column is one line; the fix itself happens in Mode B or C.

## 8. Pitfalls

- **Stories are fragments.** Landmark rules (`region`, `landmark-one-main`, `page-has-heading-one`) are switched off for stories and on for pages. Check those on page stories or the real app.
- **Play functions change state.** A story whose `play` function completes a flow shows the final step. Review the starting state through a story without one.
- **Line clamps can be deliberate.** A clamped excerpt that links to the full article is fine. A clamped name, price or instruction is not.
- **Staff vs public.** Use `--target-min 24 --min-font 14` only for trained staff screens; patient and family screens keep 44 and 16.
- **Fonts.** Screenshots taken before web fonts load mislead. Story iframes wait for network idle; for a slow app, re-run any finding that looks font-related.
- **Themes.** Review every theme the product ships (FDC: clinic and nursing-home). One theme passing says nothing about the other.
