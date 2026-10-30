# Atomic design methodology

Distilled from Brad Frost, *Atomic Design* (2016, free at atomicdesign.bradfrost.com) and his later posts (2013–2025). Read this when you need to explain the method, run an interface inventory, or justify a structural decision to stakeholders.

## Contents
1. The idea in one paragraph
2. The five stages (plus tokens below them)
3. It is a mental model, not a sequence
4. Templates vs pages: structure vs content
5. Pattern Lab principles → Storybook practice
6. The atomic workflow (how a team actually works)
7. Interface inventory: how to run one
8. Later refinements (2018–2025)
9. Criticisms and how to avoid them

---

## 1. The idea in one paragraph

"We're not designing pages, we're designing systems of components" (Stephen Hay, quoted in ch1). Interfaces, like matter, break down into a finite set of building blocks that combine into larger wholes. Atomic design names five stages — atoms, molecules, organisms, templates, pages — so a team can move between abstract parts and the concrete whole, and share a vocabulary that implies hierarchy (words like "module" or "component" do not). Effort is estimated by components, not page count: "those 30,000 pages may consist of three content types and two overarching layouts."

## 2. The five stages (plus tokens below them)

| Stage | Frost's definition | Canonical example | What it proves |
|---|---|---|---|
| **Tokens** (added 2019) | "Subatomic particles" — `color-brand-blue` "is a critical ingredient… but it's not exactly functional on its own. It needs to be applied to an atom." | color, space, type, radius, motion values | Visual consistency, theming |
| **Atoms** | Basic HTML elements "that can't be broken down any further without ceasing to be functional." They have intrinsic properties (font size, image dimensions). | label, input, button, icon, heading | Base styles at a glance |
| **Molecules** | "Relatively simple groups of UI elements functioning together as a unit." Built on the **single-responsibility principle**: "do one thing and do it well." | label + input + button = search form. "The label atom now defines the input atom. Clicking the button atom now submits the form." | Portable, reusable units |
| **Organisms** | "Relatively complex UI components composed of groups of molecules and/or atoms and/or other organisms" forming **distinct sections of an interface**. Two kinds: dissimilar parts (header = logo + nav + search) or repeated parts (product grid = product item × n). | header, footer, product grid, data table | Sections that work in context |
| **Templates** | "Page-level objects that place components into a layout and articulate the design's underlying **content structure**" — image sizes, character lengths, slots. The chemistry analogy stops here on purpose. | homepage template with grey image boxes | Layout + content skeleton |
| **Pages** | "Specific instances of templates that show what a UI looks like with real representative content in place." They test the system and articulate **variations**. | homepage with real copy; cart with 1 vs 10 items; 40- vs 340-character headline; admin vs member view | Whether the system holds up |

Atomic design applies to any interface (Frost decomposes Instagram's native app), not just the web; "it has nothing to do with web-specific subjects like CSS or JavaScript architecture."

## 3. It is a mental model, not a sequence

- "Atomic design is not a linear process, but rather a mental model to help us think of our user interfaces as both a cohesive whole and a collection of parts at the same time."
- Do not read it as "Step 1 atoms, Step 2 molecules…". "It would be foolish to design buttons and other elements in isolation, then cross our fingers and hope everything comes together."
- Part and whole influence each other (Frank Chimero's painter at the easel, stepping back to see the canvas). Build pilot templates and pages *while* building components.
- "By assembling rather than deconstructing, we're crafting a system right out of the gate instead of cherry-picking patterns after the fact."
- Naming is flexible: "atomic design is not rigid dogma." GE renamed the levels Principles / Basics / Components / Templates / Features / Applications. Keep the team's labels if they already have working ones.

## 4. Templates vs pages: structure vs content

- Templates show "what your content is made from, not what your content is" (Mark Boulton). Use placeholder content that respects real constraints: character limits, image ratios, list lengths.
- Pages replace placeholders with real representative content and add variations. When a page breaks — a person's name wraps to five lines inside a card — **fix it at the lowest level that causes it** (often the atom or molecule), not with a page-level patch.
- Design for worst-case data, not only "Sara Smith" best-case data: no profile photo, 87 items, a 400-character name, empty states, permission differences.

## 5. Pattern Lab principles → Storybook practice

Frost's chapter 3 is about "the characteristics of well-constructed pattern libraries, not … any one specific tool." Translate each to Storybook:

| Principle | Storybook practice |
|---|---|
| Russian-doll includes — change a pattern once, it updates everywhere | Components import lower-level components; never re-implement a lower pattern inside a higher one |
| Folder taxonomy you can rename | Story `title: 'Atoms/Button'`, `'Molecules/FormField'`, `'Templates/Booking'` |
| Default data vs page-specific data ("an ad hoc CMS", "a blueprint for back-end developers") | Template stories use placeholder args; page stories pass realistic fixtures |
| Pseudo-patterns (`dashboard~admin`) | One story per state; spread base args: `args: { ...Default.args, isAdmin: true }` |
| Pattern states | Variant/size/state stories and controls |
| Viewport resizer: test "the entire resolution spectrum" | Viewport addon; fluid components; container queries |
| Code view showing usage, not raw HTML | Autodocs source panel shows the import + JSX |
| Descriptions & annotations from every discipline | MDX docs, prop JSDoc, a11y panel |
| Lineage (what it contains, where it is used) | "Composed of / Used in" section in docs; this tells you what to re-test after a change |

Frost's 2022 Storybook advice: Storybook is "the workshop environment where all UI code gets built" — write the story first, as a development tool, not as documentation chores at the end. Build **templates and pages in Storybook** too; teams that skip them build systems in isolation. Pages are interactive comps that back-end developers wire to real data, and the place for page-level interaction tests. Keep demo-only stories (pages, icon grids, token swatches) out of the published package (e.g., in `.storybook/` or a `stories/` folder).

## 6. The atomic workflow (chapter 4)

- **When to start: now.** Piggyback on a redesign or replatform. Pitch it as "Do you like saving time and money?": consistency, speed, shared vocabulary, easier testing ("baking things like accessibility into a living design system scales those best practices"), a future-friendly foundation.
- **Cross-disciplinary from day one.** Designers, developers, content, product, QA, business owners work in parallel and keep consulting each other ("death to the waterfall").
- **Establish direction lo-fi first:** content/display-pattern spreadsheets per template; a 20-second gut test of reference sites (20–30 sites, vote 1–10, discuss top/bottom/contentious); style tiles (color, type, texture without layout); element collages (real UI elements in the chosen style, no layout).
- **Development is design.** Get into the browser early; static comps are hypotheses. "Once the designs are in the browser, they should stay in the browser." Designers make spot comps at organism level; developers act as "prep chefs" setting up the repo and stubbing patterns from day one.
- **Iterate like sculpture:** fidelity rises in loops; "rolling updates are preferable to big reveals." As each pattern matures, every template that includes it matures too.

## 7. Interface inventory: how to run one

Use it to start a system for a product that already exists ("show, don't tell").

1. **Round up the troops** — every discipline in the room; the goal is a shared vocabulary.
2. **Prepare** — one shared slide deck or board, one slide per category.
3. **Screenshot exercise** — one instance of each *unique* pattern (not every instance), 30–90 minutes, categories assigned to people. Dig into neglected corners: help pages, 404, legal, emails, print forms.
4. **Present** — 5–10 minutes per category. Expect naming collisions ("utility bar" vs "admin nav"); note them, don't resolve yet.
5. **Regroup** — decide keep / merge / remove and agree names. "You don't need to be a designer to recognize that having 37 unique button styles probably isn't a good idea."

Categories: global elements, navigation, image types, icons, forms, buttons (all states), headings, blocks/media objects, lists, interactive components (accordion, tabs, carousel), media, third-party components, advertising, messaging (alerts, validation, loaders, tooltips), colors, animation.

For a **new** product with no UI yet, run an *inspiration intake* instead: collect references (brand guide, logo, website, competitor and admired products), extract a palette with roles, type, shape, density and voice, and note conflicts and how they were resolved.

## 8. Later refinements (2018–2025)

- **Tokens below atoms**, in up to three tiers: definitions (raw values) → semantic/usage (intent, swapped per theme) → component. Frost's caution: the full three tiers "may be overkill" at first — "start with a leaner variable structure, then introduce additional tiers once the dust has settled." Details: `tokens.md`.
- **Themeable systems:** core + brand theme + sub-brand/campaign theme stacked; the same mechanism handles light/dark, density and legacy-vs-new looks.
- **Ecosystem layers (2023):** core system (tokens, icons, components, reference site) → optional framework layer → optional **recipe** layer (product-specific compositions; a "pressure release valve") → optional **smart components** (validation, data tables, analytics wiring) → product. Gall's Law: make the architecture "only as complex as it needs to be."
- **Components, recipes, snowflakes (2021):** design-system components are shared and content-/context-agnostic; recipes are compositions used consistently within one product ("Recipes are often organisms in atomic design speak"); snowflakes are one-offs. Things move *down* into the core only when proven; keep core cards as boxes with slots and build specific cards as recipes.
- **Front-of-the-front-end vs back-of-the-front-end:** the design system owns look, semantics, accessibility and component APIs; the app owns what happens on click. "A directly-consumable UI component library can serve as a healthy handshake."
- **Global design system (2024):** commodity components (dialogs, tabs, date pickers) are rebuilt everywhere and often inaccessible (WebAIM finds ~50 errors per page on average). Don't reinvent accessible primitives — follow the WAI-ARIA Authoring Practices or a proven headless library.
- **The system is a product,** not a project: "a living, funded product with a roadmap & backlog, serving an ecosystem" (Nathan Curtis). Governance: `governance.md`.

## 9. Criticisms and how to avoid them

| Criticism | Mitigation |
|---|---|
| Atom/molecule/organism boundaries are fuzzy; teams burn hours debating | Use the tests in `level-decision.md`; if still unsure, pick one and move it later ("do not worry"). Keep the level out of import paths (barrel exports) so moves are free |
| Folder structure mistaken for the methodology | Levels are a thinking tool and a Storybook taxonomy; code structure is secondary |
| Business logic leaks into components (fetching, routing, app state) | Components stay presentational; inject data, handlers and link components via props |
| Core library polluted with product-specific parts ("product card") | Name by structure, not content; product-specific compositions are recipes until a second product needs them |
| Built in isolation, breaks on real content | Build templates and pages in Storybook with real and worst-case data from the start |
| Mature systems (GOV.UK, Carbon, Primer, Atlassian) don't use the chemistry words publicly | Fine: keep atomic vocabulary internally if it helps; consumers care about clear names and docs, not taxonomy |
