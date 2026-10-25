# Design tokens

Read this when creating or changing tokens, theming, or choosing colors. Template: `assets/tokens.template.css`. Tools: `scripts/ramp.mjs`, `scripts/contrast.mjs`.

## Contents
1. Three tiers and who may use them
2. Naming grammar
3. Source format (DTCG) and pipeline
4. Color: ramps and the accessible step
5. Type, space, size, radius, motion
6. Themes and user preferences
7. Checks

---

## 1. Three tiers and who may use them

| Tier | Example | Purpose | Used by |
|---|---|---|---|
| 1 Primitive | `--ds-color-blue-600`, `--ds-space-400` | Raw palette and scales, no intent | Only other tokens |
| 2 Semantic | `--ds-color-bg-brand-emphasis`, `--ds-color-fg-critical`, `--ds-space-inset-md` | Intent; re-declared per theme | All component CSS |
| 3 Component | `--button-bgColor` | A knob scoped to one component, set per variant | Only that component's CSS module |

Rules:
- Components never reference primitives. If no semantic token fits, add one; that is a system decision, not a local one.
- Pick tokens by **meaning**, not by matching color: "Don't use a token just because the colors appear to match. This can break the experience in other themes" (Atlassian).
- Start lean (primitives + semantic). Add component tokens only where a component genuinely needs a themable knob (Frost: three tiers "may be overkill" early).
- Component tokens are declared inside the component's CSS and point at semantic tokens:
  ```css
  .Button { --button-bgColor: var(--ds-color-bg-neutral-muted); background: var(--button-bgColor); }
  .Button:where([data-variant='primary']) { --button-bgColor: var(--ds-color-bg-brand-emphasis); }
  ```

## 2. Naming grammar

`--{namespace}-{category}-{property}-{role}-{emphasis}-{state}` — drop parts that do not apply.

| Part | Values |
|---|---|
| namespace | short brand prefix: `ds`, `fdc` |
| category | `color`, `space`, `size`, `radius`, `font`, `line-height`, `shadow`, `duration`, `easing`, `z` |
| property (color) | `bg`, `fg`, `border` |
| role | `neutral`, `brand`, `accent`, `success`, `warning`, `critical`, `info` |
| emphasis | `muted`, `default`, `emphasis` (`fg-on-emphasis` = text placed on an emphasis background) |
| state | `hover`, `active`, `focus`, `disabled`, `selected`, `invalid` |
| scale | primitives: numeric steps (`100…900`); semantic sizes: `xs sm md lg xl` |

Examples: `--fdc-color-bg-brand-emphasis-hover`, `--fdc-color-fg-muted`, `--fdc-color-border-focus`, `--fdc-space-stack-lg`, `--fdc-size-control-md`.

Mature systems differ in spelling (Primer `bgColor-danger-muted`, Polaris `--p-color-bg-fill-brand-active`, Carbon `$layer-01`, Atlassian `color.background.danger.hovered`) but agree on the shape: property + role + emphasis + state. Choose one grammar and never mix. Avoid names that differ only by case. Never name semantic tokens after a color (`--blue-button`) — the value may change per theme.

## 3. Source format (DTCG) and pipeline

The W3C Design Tokens Community Group format reached its first stable version (2025.10). Use it when tokens must travel between tools (Figma plugins, Style Dictionary v4+, Terrazzo):

```json
{
  "color": {
    "$type": "color",
    "blue": { "600": { "$value": "#1C75BC", "$description": "Brand source" } },
    "bg": { "brand": { "emphasis": { "$value": "{color.blue.600}" } } }
  }
}
```
- A token is any object with `$value`; `$type` may be set on a group and is inherited; aliases use `{group.token}`; `$deprecated: "Use {color.bg.brand.emphasis}"` marks retirement. Files: `*.tokens.json`.
- Pipeline: `tokens/*.tokens.json` → Style Dictionary → `tokens.css` (`:root` + theme blocks) + `tokens.ts` (typed names) + JSON for docs.
- **Small projects may author `tokens.css` directly** (as in the template). Move to DTCG + a build step when a second consumer appears (design tool sync, native app, email templates). `ramp.mjs --json` emits DTCG-style output.

## 4. Color: ramps and the accessible step

1. Generate a 50–950 ramp per brand color: `node scripts/ramp.mjs '#RRGGBB' --name blue --prefix ds`. It works in OKLCH (perceptually even steps), anchors the exact brand hex at its nearest step, and prints contrast of every step against white and black.
2. **The logo color is a primitive, not automatically the button color.** Point the semantic token at whichever step passes its pairing:
   - text and essential icons: ≥ 4.5:1 against their background (large text ≥ 24px or ≥ 18.66px bold: 3:1);
   - borders of inputs, focus rings, icons that convey state: ≥ 3:1 against adjacent colors;
   - for an older audience, aim for 7:1 on body text.
3. Light, high-chroma brand colors (yellow-greens, ambers, cyans) rarely carry white text. Use them as fills with dark text, as decoration, or use a darker step for text.
4. Role mapping that works for most ramps: 50–100 tinted backgrounds; 200–300 hover/selected tints and subtle borders; 500 decorative; 600–700 solid fills and links on white; 800–900 text on tints; dark theme inverts (300–400 become fills and links).
5. Status colors (success, warning, critical, info) need their own small ramps; never reuse brand colors for status — users must be able to tell "brand" from "error". Never use color as the only signal (add icon + text).
6. Neutrals: one gray ramp; body text ≥ 12:1 on surface is comfortable; muted text still ≥ 4.5:1.

## 5. Type, space, size, radius, motion

- **Units:** rem for font sizes, spacing and control sizes so everything scales with the user's browser font setting (WCAG 1.4.4). px only for hairline borders.
- **Type scale:** ratio ~1.2 (minor third) for dense apps, ~1.25 for content. Body 16px minimum; 18px for audiences with many older readers. Line-height ≥ 1.5 for body (WCAG 1.4.12) and ≥ 1.3 for headings; languages with stacked diacritics (Vietnamese) need these minimums, never 1.0. Line length ≤ 70–80 characters.
- **Font families as tokens:** `--ds-font-family-heading`, `--ds-font-family-body`, with fallbacks. Load only needed weights and the right language subset.
- **Space:** 4px base expressed in rem (`0.25rem` steps). Semantic aliases: `inset-*` (padding), `stack-*` (vertical gap), `inline-*` (horizontal gap).
- **Sizes:** control heights and minimum target size as tokens (`--ds-size-control-md: 2.75rem`, `--ds-size-target-min`). WCAG 2.5.8 minimum is 24×24 CSS px; 44×44 is the comfortable default for touch and older users.
- **Radius, shadow, z-index, duration, easing** as tokens.
- **Motion.** Every animation should answer something the user did or show a change of state; nothing moves on its own.
  - Split durations by job: `duration-fast` / `duration-base` (120–200ms) for feedback (color, opacity, shadow), and `duration-move` (200–300ms) for things that travel (transform).
  - Animate only `transform` and `opacity`, plus color for feedback. Never `transition: all`, and never width, height, top, left, margin or padding (they reflow the page and stutter on cheap phones). `lint-tokens.mjs` flags both.
  - Animations must be interruptible: a second click mid-animation goes to the new state. Anything that plays more than 5 seconds needs pause/stop (WCAG 2.2.2). Nothing flashes more than 3 times a second.
  - **Reduced motion removes movement, not feedback.** Under `prefers-reduced-motion: reduce`, set `duration-move` to 0 (or swap the slide for a short fade) and keep the short color and opacity fades. A global `* { transition-duration: 0 !important; animation-duration: 0 !important }` is wrong: spinners freeze, so the page looks stuck, and state changes become hard to notice.

## 6. Themes and user preferences

- Same token names, different values: `:root` holds the default theme; `[data-theme='dark']` re-declares only semantic tokens.
- **Follow the OS setting without duplicating the dark block.** Copying dark values into an `@media (prefers-color-scheme: dark)` block as well means two lists to keep in sync. Instead, set `data-theme` before first paint and keep one dark block in CSS:
  ```html
  <script>
    // In <head>, before stylesheets render: saved choice wins, else the OS setting.
    (function () {
      var root = document.documentElement, mq = matchMedia('(prefers-color-scheme: dark)'), saved;
      try { saved = localStorage.getItem('theme'); } catch (e) {}
      var apply = function () { root.dataset.theme = saved === 'light' || saved === 'dark' ? saved : mq.matches ? 'dark' : 'light'; };
      apply();
      mq.addEventListener('change', apply);
    })();
  </script>
  ```
  If the page must work with JavaScript disabled, duplicate the block under `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { … } }` and check both with `contrast.mjs`.
- **Large-text / senior scale:** `[data-scale='large']` remaps body size, control size and target size. Do not use CSS `zoom`.
- `@media (prefers-contrast: more)`: stronger borders and muted text. `@media (forced-colors: active)`: keep real borders/outlines (system colors replace yours; backgrounds may disappear).
- Nested surfaces (card in panel) need distinct layer tokens (`bg-surface`, `bg-inset`, or Carbon-style layer-01/02/03) so contrast holds at each depth.

## 7. Checks

- Contrast for every semantic pair in every theme:
  `node scripts/contrast.mjs --css tokens.css --pairs pairs.json` then `--scope "[data-theme='dark']"` and `--media "@media (prefers-contrast: more)"`. Check stacked states with repeated `--layer` flags, applied in order like the cascade: `--layer "[data-theme='dark']" --layer "@media (prefers-contrast: more) { [data-theme='dark'] }"`. Start pairs from `assets/contrast-pairs.template.json`.
- No raw values in components: `node scripts/lint-tokens.mjs src/components` (hex, rgb(), named colors, literal fonts, px other than 0/1).
- Document tokens in Storybook (`Tokens/Colors`, `Tokens/Typography`) generated from the same source so docs cannot drift.
