# Storybook as the workshop

Read this when setting up Storybook or writing stories. Storybook is where components are built (story first), not a documentation chore at the end. Examples target Storybook 8 (CSF3); the ideas carry to other versions.

## Sidebar = atomic levels

```ts
// .storybook/preview.ts
parameters: {
  options: { storySort: { order: ['Introduction', 'Tokens', 'Layout', 'Atoms', 'Molecules', 'Organisms', 'Templates', 'Pages'] } },
  a11y: { test: 'error' },        // axe violations fail story tests
},
tags: ['autodocs'],
```
Titles: `'Atoms/Button'`, `'Molecules/FormField'`, `'Organisms/Header'`, `'Templates/FormStep'`, `'Pages/Booking/Step 2 – Choose time'`, `'Tokens/Colors'`.

Add toolbar globals for theme and scale and apply them in a decorator (`<div data-theme={…} data-scale={…}>`) so every story can be checked in light/dark and normal/large text.

## Story file shape (CSF3 + TypeScript)

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs', 'stable'],
  args: { children: 'Đặt lịch khám' },
  argTypes: { variant: { control: 'inline-radio' }, onClick: { action: 'clicked' } },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Primary: Story = { args: { variant: 'primary' } };
export const Loading: Story = { args: { variant: 'primary', loading: true } };
export const LongLabel: Story = { args: { children: 'Xác nhận và gửi yêu cầu đặt lịch khám tại nhà cho người thân' } };

export const KeyboardActivates: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: /đặt lịch/i });
    button.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalled();
  },
};
```
- `satisfies Meta<typeof X>` gives type errors for missing required args.
- Query by role and accessible name, not test IDs — that also tests accessibility.

## Required stories per component

1. **Default** — the most common use.
2. **Each variant and size** (or one "All variants" grid story for visual testing).
3. **Each state** — hover/focus (pseudo-states addon or play), disabled, loading, invalid/error, empty, selected.
4. **Stress** — long text in the target language, many items, missing optional data, 320px viewport.
5. **At least one `play` interaction test** for interactive components (keyboard path included).

Status tags: `alpha`, `beta`, `stable`, `deprecated` (custom tags, shown in the sidebar and filterable).

## Templates and pages in Storybook

Frost: teams that skip templates and pages "build design systems in isolation". Add them:
- Template stories render layout + slots with placeholder content showing limits (max characters, image ratios).
- Page stories render the template with realistic fixtures and **variations**: first-time user, many records, long names, error, loading, role differences (patient vs family vs staff). Keep fixtures in `src/fixtures/` or `.storybook/fixtures/`.
- Page stories carry page-level `play` tests (fill a form, submit, see the error summary).
- Keep page stories out of the published package.

## Token documentation (MDX)

```mdx
import { Meta, ColorPalette, ColorItem, Typeset } from '@storybook/blocks';
<Meta title="Tokens/Colors" />
<ColorPalette>
  <ColorItem title="Brand blue" subtitle="--ds-color-blue-*" colors={{ 600: '#1C75BC', 700: '#0061A3' }} />
</ColorPalette>
<Typeset fontFamily="var(--ds-font-family-body)" fontSizes={[16, 18, 20, 24, 30]} sampleText="Phòng khám Bác sĩ Gia đình" />
```
Generate these from the token source where possible, and include a semantic-to-primitive mapping table per theme.

## Testing layers

| Layer | Tool | Catches |
|---|---|---|
| Unit | Vitest + Testing Library (`*.test.tsx`) | Props → attributes, events, controlled/uncontrolled, ref forwarding, className merge |
| Story/interaction | `play` functions; Storybook test addon or test-runner in CI | Behavior in a real browser, keyboard paths |
| Accessibility | `@storybook/addon-a11y` with `a11y.test: 'error'` | axe-detectable violations (contrast, names, roles) — about a third of real issues; still do manual keyboard + screen-reader passes |
| Visual | Chromatic, Playwright `toHaveScreenshot` against built Storybook, or Percy | Unintended visual changes, per theme |
