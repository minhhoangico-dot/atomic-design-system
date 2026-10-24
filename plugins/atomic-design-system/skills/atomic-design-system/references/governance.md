# Governance: keeping the system alive

Read this when releasing, deprecating, reviewing a contribution, or setting up the team process. "A design system is a living, funded product with a roadmap & backlog, serving an ecosystem" (Nathan Curtis). "The biggest existential threat to any system is neglect" (Alex Schleifer, Airbnb).

## Contents
1. Component Definition of Done
2. Status labels
3. Versioning and changelog
4. Deprecation
5. Contribution flow
6. Makers, users and communication
7. The "make it…" list (Frost ch5)

---

## 1. Component Definition of Done

Merged from Carbon, Primer and GOV.UK checklists. Copy into the PR template.

**Design**
- [ ] Uses only semantic tokens; no new raw values.
- [ ] All states designed: rest, hover, focus-visible, active, selected, disabled, read-only, invalid, loading, empty.
- [ ] Long content, wrapping, and 320px width behave.
- [ ] Contrast passes in every theme (text 4.5:1, UI 3:1) — `contrast.mjs` output attached.

**Code**
- [ ] File set and exports per `components.md`; props type exported; `displayName`; `data-component`.
- [ ] `forwardRef`, rest props on root, `className` merged on root only.
- [ ] Variants via `data-*` + `:where()`; no outer margin; `lint-tokens.mjs` and `lint-levels.mjs` pass.
- [ ] Controlled + uncontrolled where stateful.
- [ ] All strings are props with defaults; numbers/dates via `Intl`.
- [ ] Semantics and keyboard follow the APG pattern (`accessibility.md`).
- [ ] Changelog entry with the correct version bump.

**Tests**
- [ ] Unit tests: render, props → attributes, events, ref, className merge, controlled/uncontrolled.
- [ ] Stories: Default, variants, states, stress; ≥ 1 `play` interaction test.
- [ ] a11y addon passes with `test: 'error'`.
- [ ] Manual keyboard + screen-reader pass recorded.
- [ ] Visual baseline per theme (if visual testing is set up).

**Docs**
- [ ] Autodocs with prop JSDoc; when to use / when not to use; level and status tag; related components; "composed of / used in".

## 2. Status labels

| Status | Meaning | Breaking changes |
|---|---|---|
| `alpha` | Experimental; may change in any release | Allowed in minor releases |
| `beta` | API frozen pending feedback from real use | Avoided; announced |
| `stable` | Complete across code, docs, tests, design | Major release + migration notes only |
| `deprecated` | Do not use in new work; replacement named | Removed in the next major |

GOV.UK promotes "trial" components to stable after ~6 months without negative feedback; pick a similar window.

## 3. Versioning and changelog (semver)

| Change | Bump |
|---|---|
| Bug fix, visual fix with same intent, token value tweak with same intent | patch |
| New component, new prop, new variant, broadened prop type, deprecation added, new token | minor |
| Removed component/prop/token, narrowed prop type, renamed `data-component`, changed default behavior, changed element receiving rest props | **major** |
| Changed DOM structure, display, landmark roles, or which CSS custom properties a component reads | review: often major |

Tooling: Changesets (`npx changeset` in each PR) generates `CHANGELOG.md` and versions. Release minors/patches on a steady cadence; bundle majors (e.g., twice a year) with migration guides and codemods where practical.

## 4. Deprecation

1. Mark it: JSDoc `@deprecated Use X instead`, Storybook `deprecated` tag, `$deprecated` on tokens.
2. Warn once in development (`console.warn` guarded by `process.env.NODE_ENV !== 'production'`).
3. Name the replacement and a migration example.
4. Remove only in the next major, after a stated period.

## 5. Contribution flow

```
Need on a screen
  └─ Does an existing page/template/organism/molecule/atom cover it? ── yes → use it
        └─ no → Can it be composed from existing parts in the product? ── yes → build a recipe in the product
              └─ no / used by 2+ screens or products → Proposal
Proposal (issue): problem, evidence of need (screenshots, 2+ uses), proposed level, why existing parts don't fit
  → Triage (weekly): useful? unique? → accept / redirect to existing / keep as recipe
  → Spec: tokens only, all states, content rules, a11y pattern
  → Build as alpha with stories + tests → Review against Definition of Done → beta → stable
```
GOV.UK criteria: **useful** (evidence many teams need it) and **unique** (doesn't duplicate) to accept; **usable** (tested with real users including disabled users), **consistent** (reuses styles and patterns), **versatile** (works across contexts and devices) to publish.

Three kinds of change (Frost): **modification** (fixes, improvements), **addition** (assume a one-off until a second team says "I want that"), **removal** (deprecate with an alternative). Fix problems found on a product screen **in the system** when they are system problems ("friendly friction"), so every screen benefits.

## 6. Makers, users and communication

- **Makers** create, maintain and govern; in small organizations they are senior people with authority to enforce. **Users** build products with the system. "The Design System informs our Product Design. Our Product Design informs the Design System" (Jina Bolton).
- Make it visible: changelog, roadmap, release notes in the team chat, short demos, office hours, a "state of the system" review each quarter.
- Training: pairing, onboarding walkthrough of the Storybook, "how to build a screen" guide.
- Support channel and issue template for bugs and proposals.

## 7. The "make it…" list (Frost ch5)

Make it **official** (time, budget, owner), **adaptable** (a written governance plan answering: what if a pattern doesn't fit, how are requests handled, how are patterns retired, who approves, who deploys, how do people hear about changes), **maintainable**, **cross-disciplinary**, **approachable**, **visible**, **bigger** (voice and tone, writing and brand guidelines live in it too), **context-agnostic** (name by structure: "card", not "homepage card"), **contextual** (show components in real screens), and built to **last**.
