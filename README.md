# Atomic Design System — a Claude skill

A Claude Code plugin that teaches Claude to **build, extend and audit design systems** using Brad Frost's [atomic design](https://atomicdesign.bradfrost.com/): design tokens → atoms → molecules → organisms → templates → pages. It is opinionated about the parts that usually go wrong (token discipline, component level, accessibility, real-content testing), and ships small scripts that check them.

It is generic, with a plug-in **brand profile** mechanism. The first profile is **FDC — Bác sĩ Gia đình** (family-doctor clinic and nursing home, Hanoi): brand colors with accessible shades, Montserrat + Be Vietnam Pro typography, vi-VN formats, and Vietnamese UI copy.

## Install

In Claude Code:

```
/plugin marketplace add minhhoangico-dot/atomic-design-system
/plugin install atomic-design-system@atomic-design-system
```

Or copy `plugins/atomic-design-system/skills/atomic-design-system/` into a project's `.claude/skills/` folder (or `~/.claude/skills/` for all projects).

## Use

Just describe the work; the skill activates on design-system and UI-component requests. Examples:

- "Set up a design system for our clinic from the logo and website colors."
- "Add an appointment time-slot picker to fdc-ui."
- "Is this booking form accessible for elderly patients?"
- "Check how the booking flow looks on phones in both themes."
- "Thiết kế màn hình đặt lịch khám cho người cao tuổi bằng các component có sẵn."

It works in five modes: **build the system**, **add or change a component**, **build a screen** from existing parts, **audit** the code, and **visual review**: render every story in a real browser at phone-to-desktop widths and in every theme, measure what matters (sideways scroll, real touch-target size, text size, visible focus, axe), then judge the screenshots against usability heuristics.

The plugin also ships a read-only **`design-review` subagent** that runs the visual review independently of whoever wrote the code:

```
> Use the design-review agent on storybook-static for both themes
```

## What's inside

```
plugins/atomic-design-system/
  agents/design-review.md      read-only visual-review subagent
plugins/atomic-design-system/skills/atomic-design-system/
  SKILL.md                     modes, the 9 rules, workflows, checklists
  references/                  loaded only when needed
    methodology.md             Frost's book ch1–5 + later posts, Pattern Lab → Storybook
    level-decision.md          is it a token, atom, molecule, organism, recipe…?
    tokens.md                  3 tiers, naming, DTCG, ramps, themes, large-text mode
    components.md              React + TS + CSS Modules conventions
    storybook.md               CSF3, a11y tests, templates & pages as stories
    accessibility.md           WCAG 2.2 AA, ARIA patterns, older-user numbers
    content-patterns.md        plain language, errors, forms, healthcare patterns
    governance.md              Definition of Done, status, semver, contributions
    visual-review.md           render → measure → judge loop, severity, heuristics, report format
    brands/fdc.md              FDC brand profile
  scripts/                     Node ≥ 18, no dependencies (shots.mjs needs Playwright)
    ramp.mjs                   OKLCH color ramp + contrast per step
    contrast.mjs               WCAG contrast for token pairs per theme (CI-friendly)
    lint-tokens.mjs            no raw hex/px/fonts, no margins on atoms
    lint-levels.mjs            no upward imports between atomic levels
    scaffold.mjs               component + CSS module + stories + test + index
    shots.mjs                  visual review in a browser: overflow, targets, text, focus, axe + screenshots
  assets/                      token template, contrast pairs, component template, Vietnamese glyph test
  evals/                       test cases for `claude plugin eval`
```

Try the scripts directly:

```bash
cd plugins/atomic-design-system/skills/atomic-design-system
node scripts/ramp.mjs '#1C75BC'
node scripts/contrast.mjs '#FFFFFF' '#8BC63F'      # 2.05:1 — fails, use dark text
node scripts/contrast.mjs --css assets/tokens.template.css --pairs assets/contrast-pairs.template.json
```

## Using it with other UI skills

For creative pages, Anthropic's official [`frontend-design`](https://github.com/anthropics/skills/tree/main/skills/frontend-design) skill pairs well: it covers taste, while this skill keeps the system consistent and checked. The brand profile wins where they differ. The visual-review loop borrows ideas, rewritten here rather than copied, from [OneRedOak/claude-code-workflows](https://github.com/OneRedOak/claude-code-workflows) (a reviewer working in a live browser at three widths, Blocker-to-Nit triage) and from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (heuristic scoring, an "Operate" mode for product screens, and judging before reading the detector's output).

## Adding a brand profile

Copy `references/brands/fdc.md` to `references/brands/<brand>.md` and replace the sections: audiences, color sources and accessible ramp steps (from `ramp.mjs`), typography, locale, voice and sample copy, inventory seeds. Or ask Claude to "build a design system for <brand>" and let it draft the profile.

## Sources

Brad Frost, *Atomic Design* (ch1–5) and bradfrost.com posts 2013–2025; W3C WCAG 2.2 and WAI-ARIA Authoring Practices; W3C Design Tokens Community Group format 2025.10; Storybook 8 docs; GitHub Primer, IBM Carbon, Adobe Spectrum, Shopify Polaris, Atlassian, Radix, Salesforce Lightning; GOV.UK, NHS, VA.gov and CMS design systems; Nielsen Norman Group research on older users; vietnamesetypography.com and Google Fonts metadata; Anthropic's skill-authoring guidance; Nielsen's ten usability heuristics; the review workflows credited above.

## License

MIT
