---
name: atomic-design-system
description: Builds, extends, and audits UI design systems using Brad Frost's atomic design (design tokens, atoms, molecules, organisms, templates, pages) with React, TypeScript, CSS Modules and Storybook, including WCAG 2.2 accessibility, healthcare and older-adult UX, and brand profiles (FDC family-doctor clinic and nursing home in Vietnam included). Use whenever the user wants to create a design system, component library, style guide or UI kit; define or theme design tokens or brand colors; add, refactor or review a button, form field, card, header or any reusable component; decide whether something is an atom, molecule or organism; set up Storybook; build a screen or flow from existing components; check how screens actually look in a browser (phones, themes, focus, touch targets); or make UI accessible, elderly-friendly or Vietnamese-language — even if they don't say "atomic design" or "design system".
---

# Atomic Design System

Design systems fail in two ways: they drift (every screen invents its own button) or they are built in isolation and break on real content. This skill prevents both by keeping every visual decision in tokens, every reusable piece in a leveled component library, and every component proven inside real templates and pages.

Atomic design is a **mental model, not a sequence**: think in parts (tokens → atoms → molecules → organisms) and wholes (templates → pages) at the same time, and fix problems found in a page at the lowest level that causes them.

## Pick the mode

| Situation | Mode |
|---|---|
| No system yet; user wants one (from a logo, website, brand guide, screenshots, or an existing product) | **A. Build the system** |
| A system exists; user needs a new or changed component | **B. Add or change a component** |
| A system exists; user needs a screen, page or flow | **C. Build a screen** |
| User asks whether UI/code is accessible, consistent or on-system | **D. Audit** (code) |
| UI was built or changed and must be checked as rendered: phones, themes, focus, targets, look | **E. Visual review** |

Before anything else, look for an existing system: a `DESIGN.md`, `tokens.css`/`*.tokens.json`, a `src/components/{atoms,molecules,…}` tree, or Storybook config. Extend what exists; never silently start a second system.

**Brand profiles.** If the work is for a brand that has a profile in `references/brands/` (currently `fdc.md` — FDC Bác sĩ Gia đình clinic and nursing home), read it first; it supplies colors, fonts, locale and copy rules. For any other brand, derive the profile in Mode A step 2 and offer to save it as `references/brands/<brand>.md`.

## Rules that hold in every mode

These carry the most weight; each has a reason, and the scripts check most of them.

1. **Tokens are the only source of visual values.** Components use semantic tokens (`--ns-color-bg-brand-emphasis`), never primitives (`--ns-color-blue-600`) or raw hex/px/font names. Why: one change re-themes everything, and dark/large-text modes work for free. Check: `node scripts/lint-tokens.mjs <components-dir> --forbid '<palette globs>'` (e.g. `'blue-*,gray-*'`) so a component naming a palette token fails the build.
2. **The logo color is a primitive, not automatically the button color.** Semantic tokens point at the ramp step that passes contrast: text 4.5:1, large text and UI boundaries/focus rings 3:1 (aim 7:1 body text for older audiences). Check every text role against **every surface it may sit on**, in every theme, as a matrix (`{"fg": [roles…], "bg": [surfaces…]}` in pairs.json): a hand-picked pair list misses the pair nobody thought of. Never round a ratio up (4.498 fails). `node scripts/contrast.mjs --css tokens.css --pairs pairs.json [--scope "[data-theme='dark']"]`. Generate ramps with `node scripts/ramp.mjs '#hex'`.
3. **Atoms have no outer margin; parents own spacing.** Layout primitives (Stack, Inline, Grid, Box, Container) and `gap` place things. Why: a margin assumes where a component sits, which breaks reuse.
4. **Import only from your own level or lower** (tokens < layout = atoms < molecules < organisms < templates < pages). Check: `node scripts/lint-levels.mjs <components-dir>`. A violation means something is at the wrong level.
5. **Components are presentational.** No data fetching, routing imports, global stores, analytics or business rules; pass data, handlers and link components in as props. Why: the same component must serve every product and test in isolation.
6. **Accessible by construction.** Native elements first; WAI-ARIA patterns for custom widgets; visible `:focus-visible` ring ≥ 2px with 3:1 contrast; targets ≥ 24px (staff) / ≥ 44px (public and older users); labels always visible; errors in text, not color alone; everything works by keyboard and at 200% zoom and 320px width.
7. **Every user-visible string is a prop with a default**, including aria-labels; numbers, dates, money and phones go through `Intl`. Text must wrap — no fixed heights or clipping — and be tested with the target language's longest words and hardest glyphs.
8. **Prove components in templates and pages.** Each component gets stories for default, variants, states and stress content; screens get page stories with realistic and worst-case data. Why: isolation hides the breakage real content causes.
9. **No one-offs in the core.** Domain-specific compositions (DoctorCard, MedicationRow) are *recipes* in the product until a second screen or product needs them. If you are unsure of a level, pick the lower one and move it later — consumers import from the package root, so moves are free. The same holds for written rules: one product's workflow and wording go in that product's docs, not the system's guide (`references/governance.md` §5).

## Mode A — Build the system

Copy this checklist and work through it:
```
- [ ] 1. Scope: product(s), audiences, platforms, stack, existing brand assets
- [ ] 2. Intake → brand profile (palette with roles, type, shape, density, voice)
- [ ] 3. Tokens: primitives + semantic, light/dark/large-text; contrast passes
- [ ] 4. Foundations in Storybook (Tokens/Colors, Typography, Spacing)
- [ ] 5. Layout primitives + core atoms
- [ ] 6. Molecules and organisms needed by 2–3 pilot screens
- [ ] 7. Templates + page stories for the pilot screens (real + stress data)
- [ ] 8. Fix what pages break at the lowest level; re-run checks
- [ ] 9. Docs: README/DESIGN.md usage guide, Definition of Done, changelog
```
1. **Scope.** Ask at most three questions about what is genuinely unclear (who uses it, which 2–3 screens matter first, stack). Default stack: React + TypeScript + Vite + CSS Modules + Storybook + Vitest. Record assumptions.
2. **Intake.** For a live product, run an interface inventory (`references/methodology.md` §7). For a brand: measure logo colors from the image (code, not eyeballing), read the website's CSS for its real palette and fonts, note conflicts and resolve them (brand docs > website > logo sampling). Write the result as a brand profile.
3. **Tokens.** Start from `assets/tokens.template.css`; replace the `ds` prefix; generate ramps with `ramp.mjs`; map semantic tokens to accessible steps; copy `assets/contrast-pairs.template.json` and run `contrast.mjs` for each theme until all pass. Details: `references/tokens.md`.
4. **Storybook.** Sidebar ordered Tokens → Layout → Atoms → Molecules → Organisms → Templates → Pages; a11y addon set to fail on violations; toolbar for theme and text scale. Details: `references/storybook.md`.
5–7. **Components and screens together.** Scaffold each with `node scripts/scaffold.mjs <Name> --level <level> --dir src/components --prefix <ns>`, then implement per `references/components.md`. Build the pilot templates and pages alongside the atoms, not after.
8. **Loop.** Run tests, `lint-tokens`, `lint-levels`, `contrast`, and the a11y addon; fix and repeat until clean.
9. **Docs and governance** per `references/governance.md`.

## Mode B — Add or change a component

1. **Search first.** Does an existing component, a composition of existing ones, or a variant cover it? Prefer composition over a new prop; prefer a new prop over a new component.
2. **Decide the level** with `references/level-decision.md` (token? layout? atom? molecule? organism? recipe?). State the decision and the reason in one line.
3. **Scaffold** with `scripts/scaffold.mjs`, then implement: semantic tokens only, `data-*` variants, `forwardRef`, rest props on root, strings as props, APG keyboard pattern (`references/accessibility.md`).
4. **Stories and tests:** default, every variant and state, stress (long target-language text, 320px), at least one `play` keyboard test; unit tests for props, events and ref.
5. **Validate:** tests + `lint-tokens` + `lint-levels` + a11y addon (+ `contrast` if tokens changed). Fix and re-run until clean.
6. **Record:** status tag (alpha/beta/stable), changelog entry with semver bump, deprecations with a named replacement.

## Mode C — Build a screen

1. Read the system's tokens, component index (barrel exports / Storybook) and brand profile.
2. Plan top-down before coding, by name: template → organisms → molecules → atoms. Reuse in that order. List any gaps.
3. Fill gaps by composing existing parts; if something genuinely new is needed, build it as a recipe in the product (Mode B rules apply) and flag it as a candidate for the core.
4. Write copy with `references/content-patterns.md` (plain language, error formula, form patterns) and the brand profile's voice.
5. Add a page story with realistic data plus at least two stress variations (empty, long names, many items, error, role differences).
6. Review against the checklist below; list the components used and any proposed additions.

## Mode D — Audit

Run the scripts on the code (`lint-tokens`, `lint-levels`, `contrast` on the token file), then review by reading against: rules 1–9 above, the WCAG table and ARIA patterns in `references/accessibility.md`, and the Definition of Done in `references/governance.md`. Report findings ranked by user impact (blocks a task > causes errors > inconsistency > polish), each with the file/line, the rule, and the concrete fix. For how the UI renders (phones, themes, focus, look), follow with Mode E.

## Mode E — Visual review

Code can be on-system and still look wrong or fail on a phone. Render it, measure it, then judge it — `references/visual-review.md` has the loop, severity scale, heuristics and report format.
1. Build Storybook (or start the app); review the built output.
2. Measure in a real browser: `node scripts/shots.mjs --storybook storybook-static --themes <every theme>` (or `--page <file|url>`). It checks sideways scroll, real touch-target size, text size, clipped text, visible focus, story and console errors, and axe, at 320/390/768/1280, and saves screenshots. No browser, no review: never guess instead.
3. Look at the screenshots and note hierarchy, nesting, emphasis, copy and calm *before* reading the measured report; then merge — measurements win on anything measurable.
4. Confirm each Blocker and High against its screenshot; score the ten heuristics; check cognitive load.
5. Report ranked by severity with evidence (`visual-review.md` §7); fix through Modes B/C; re-run until 0 Blockers.

In Claude Code the plugin's **`design-review`** subagent runs this loop read-only, which keeps the reviewer independent of whoever wrote the code; use it after Modes B and C.

## Review checklist (before calling any UI work done)

- [ ] Every element maps to an existing component or a named recipe/proposal.
- [ ] `lint-tokens`, `lint-levels` and tests pass; no raw colors, sizes or fonts.
- [ ] Contrast passes in every theme; focus visible; keyboard path works; labels visible.
- [ ] Works at 320px, 200% zoom, large-text mode, and with long target-language text — `shots.mjs` reports 0 Blockers in every theme.
- [ ] Copy follows the content rules and brand voice; one primary action per view.
- [ ] Stories exist for states and stress cases; page story for screens.

## Reference index — read only what the task needs

| File | Read when |
|---|---|
| `references/methodology.md` | Explaining atomic design, running an inventory, planning the workflow, answering "why" |
| `references/level-decision.md` | Deciding where a component belongs; spotting wrong-level components |
| `references/tokens.md` | Creating/changing tokens, color ramps, themes, naming |
| `references/components.md` | Writing or reviewing component code and APIs |
| `references/storybook.md` | Setting up Storybook, writing stories and interaction tests |
| `references/accessibility.md` | Any interactive component, form, color, or audit; older-user sizing |
| `references/content-patterns.md` | UI copy, error messages, forms, dates/phones/names, healthcare flows |
| `references/governance.md` | Definition of Done, statuses, versioning, deprecation, contributions |
| `references/visual-review.md` | Mode E: render-measure-judge loop, severity, heuristics, product-screen taste, report format |
| `references/brands/<brand>.md` | Work for that brand (e.g. `fdc.md`) |

## Scripts and assets (Node ≥ 18, no dependencies except Playwright for `shots.mjs`; run, don't read)

| Command | Does |
|---|---|
| `node scripts/ramp.mjs '#1C75BC' [--name blue --prefix ns --css\|--json]` | OKLCH 50–950 ramp anchored on the brand hex, with contrast vs white/black per step |
| `node scripts/contrast.mjs <fg> <bg> [--min 3]` or `--css tokens.css --pairs pairs.json [--scope sel] [--media query] [--layer spec]…` | WCAG contrast; exit 1 on failure |
| `node scripts/lint-tokens.mjs <dir> [--strict]` | Raw colors/fonts/px and atom margins in CSS; exit 1 on errors |
| `node scripts/lint-levels.mjs <dir>` | Upward imports between atomic levels; exit 1 on violations |
| `node scripts/scaffold.mjs <Name> --level <level> --dir src/components --prefix <ns>` | Component + CSS module + stories + test + index from `assets/component-template/` |
| `node scripts/shots.mjs --storybook <dir\|url> \| --page <file\|url> [--themes a,b] [--target-min 44] [--filter re]` | Visual review in a real browser: overflow, target size, text size, clipping, focus visibility, axe; report + screenshots; exit 1 on Blockers (needs Playwright; axe-core optional) |
| `assets/tokens.template.css`, `assets/contrast-pairs.template.json` | Starting token file (3 tiers, themes, preferences) and the pairs that must pass |
| `assets/vi-glyph-test.html` | Visual check of Vietnamese stacked diacritics per font and line-height |

Script paths are relative to this skill's directory (`${CLAUDE_SKILL_DIR}` in Claude Code).

## Companion skills

For creative surfaces (a campaign page, a new brand's first landing page), Anthropic's official `frontend-design` skill adds strong guidance on taste and on avoiding the generic AI look. When the two disagree, the brand profile and the rules above win: product screens favor calm, consistent and accessible over bold. Install third-party UI skills only after reading what their scripts download, which hooks they add, and what they send off the machine.
