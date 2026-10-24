# Deciding a component's level

Read this when adding a component or when unsure where something belongs. The goal is a fast, defensible decision — not a perfect taxonomy. If two levels both seem right after these tests, pick the lower one and move on; a later move costs little when imports go through a barrel.

## The tests, in order

**0. Is it a value, not a component?** → **Token.** Colors, spacing, type sizes, radii, shadows, durations. Tokens are never atoms.

**1. Is it about placing things, not drawing them?** → **Layout primitive** (ranks with atoms). Box, Stack (vertical gap), Inline (horizontal, wraps), Grid, Container, Bleed. They own spacing between children so nothing else needs margins.

**2. Atom?** All must be true:
- Wraps roughly one native element or control (button, input, label, img, svg icon, heading).
- Splitting it further would make it stop functioning.
- Composes no other design-system components (an internal icon or visually-hidden text is fine).
- Fully content- and context-agnostic.
Examples: Button, IconButton, Link, TextInput, Textarea, Select, Checkbox, Radio, Switch, Label, Icon, Badge, Tag, Avatar, Spinner, Heading, Text, Divider, VisuallyHidden.

**3. Molecule?**
- A small group of atoms with **one job** (single responsibility).
- Portable: it makes sense dropped into many different sections.
- You can name the job in a short phrase ("ask one question", "search", "pick a time slot").
Examples: FormField (Label + control + Hint + ErrorMessage), SearchField, DateInput (day/month/year), PhoneInput, Pagination, Breadcrumb, Tabs, Alert, Toast, Tooltip, StatItem, MenuItem, TimeSlotPicker.

**4. Organism?**
- A **distinct section** of an interface that could stand on its own region of a screen.
- Combines molecules/atoms/organisms, or repeats one molecule (list, grid).
- May hold local UI state (open/closed, selected tab) but **never fetches data**.
Examples: Header, Footer, SideNav, Dialog, DataTable, FormSection, Card grid, EmptyState, ErrorSummary.

**5. Template?** Layout + slots + content structure (character limits, image ratios, which organisms fill which region), with placeholder content and no real data. Examples: DashboardLayout, FormStepTemplate, DetailTemplate.

**6. Page?** A template filled with representative data and variations (empty, long text, many items, role differences, error, loading). Pages live in Storybook (and in the app); they are not exported from the component package.

## Placement rules

- **Agnostic-name test.** Blur the content. If the name only makes sense with domain content ("MedicationCard", "DoctorCard"), it is a **recipe** composed from a generic part (Card + slots). Recipes sit in the product layer, not the core.
- **Second-use rule.** Assume a one-off ("snowflake") until a second screen or product says "I want that." Only then promote it into the core. Promote downward deliberately; never add speculative core components.
- **Logic rule.** Look, semantics, accessibility and simple interaction (open/close, roving focus) belong in the system. Data fetching, validation wiring, permissions, analytics and routing belong in the app or a "smart" layer. Pass data and handlers as props; accept a link component instead of importing a router.
- **Dependency rule.** A component imports only from its own level or lower: tokens < layout = atoms < molecules < organisms < templates < pages. `scripts/lint-levels.mjs` enforces this. A violation means the "lower" component is really higher, or a shared piece should move down.
- **Distinct-section rule.** Could it be its own region of a screen? Organism. Is it a reusable unit *inside* such a region? Molecule.
- **Don't-agonize rule.** "Atomic Design should be a solution, not another problem… just put it anywhere. After you realize what it is, just move the component folder" (ARc wiki). Export everything from `src/index.ts` so a move never changes consumers' imports.

## Worked examples

| Thing | Level | Why |
|---|---|---|
| Brand blue `#1C75BC` | Token (primitive) | A value, not functional alone |
| "Primary action background" | Token (semantic) | Intent that themes can remap |
| Button with leading icon | Atom | One control; the icon is an internal slot |
| Label + input + hint + error | Molecule (FormField) | One job: ask one question |
| Day / Month / Year date entry | Molecule (DateInput) | One job; three inputs in one fieldset |
| Search form | Molecule | Frost's canonical example |
| Site header with logo, nav, hotline | Organism | Distinct section |
| Appointment time-slot grid | Molecule if just slot buttons; organism if it includes day navigation + legend + slots | Count the jobs |
| Doctor profile card | Recipe (organism-sized) built on Card | Domain-specific name fails the agnostic test |
| Error summary at top of form | Organism | Distinct region with links to fields |
| Booking step layout (title, progress, form slot, actions) | Template | Structure with slots |
| Booking step with real clinic data and long Vietnamese names | Page (story) | Content + variations |

## Signs a component is at the wrong level

- An atom needs margins or knows where it sits → spacing belongs to the parent or a layout primitive.
- A molecule has two unrelated jobs → split it.
- An organism fetches data or reads a global store → move the logic to the app; pass data in.
- A template contains real copy → that is a page story.
- Ten "variants" props on one component → it is several components, or it needs composition (children/slots) instead of configuration.
