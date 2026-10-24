# Building components (React + TypeScript + CSS Modules)

Read this before writing or reviewing component code. `scripts/scaffold.mjs` creates the file set below from `assets/component-template/`. Adapt the shape to another stack (Vue, Web Components, plain HTML) by keeping the rules and changing the syntax.

## Contents
1. File structure and exports
2. Component skeleton
3. CSS rules
4. API conventions
5. Layout primitives (why atoms have no margins)
6. State: controlled and uncontrolled
7. Polymorphism
8. Strings, i18n and content
9. What does not belong in a component

---

## 1. File structure and exports

```
src/components/{layout|atoms|molecules|organisms|templates}/Button/
  Button.tsx            component (PascalCase folder = component name)
  Button.module.css     styles, tokens only
  Button.stories.tsx    Default + variants/states + stress stories
  Button.test.tsx       Vitest + Testing Library
  index.ts              export { Button }; export type { ButtonProps }
src/index.ts            barrel: export * from './components/atoms/Button'; …
```
- Consumers import only from the package root (`import { Button } from '@org/ui'`), so moving a component between level folders never breaks them. Many mature systems keep a flat `components/` folder and express the level only in Storybook titles; either works.
- Subcomponents: `BreadcrumbItem.tsx` exposed as `Breadcrumb.Item`.
- Replacing a component: `Breadcrumb2`, not `NewBreadcrumb`; deprecate the old one first (`governance.md`).
- Export the props type. Set `displayName`. In `package.json`, mark CSS as side effects (`"sideEffects": ["**/*.css"]`) so tree-shaking keeps styles.

## 2. Component skeleton

```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonProps = {
  /** Emphasis. One primary per view. */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  /** Icon before the label; colored by variant. */
  leadingIcon?: ReactNode;
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'medium', leadingIcon, loading, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      className={[styles.Button, className].filter(Boolean).join(' ')}
      data-component="Button"
      data-variant={variant}
      data-size={size}
      aria-busy={loading || undefined}
    >
      {leadingIcon && <span className={styles.Icon} aria-hidden="true">{leadingIcon}</span>}
      {children}
    </button>
  );
});
Button.displayName = 'Button';
```
Why each piece:
- `forwardRef` + `...rest` on the root DOM node: consumers can focus it, measure it, and add `aria-*`/`data-*`/event props. (React 19 passes `ref` as a prop; keep `forwardRef` while on React 18.)
- `{...rest}` before `className`, and `className` merged on the root only. Deeper customization goes through CSS custom properties, not `labelClassName` props.
- `type="button"` default: prevents accidental form submits.
- Variants as `data-*` attributes: readable in DevTools, styleable with zero specificity, testable.
- `data-component`: a stable hook for tests and analytics; renaming it is a breaking change.
- Disabled vs loading: prefer `aria-disabled` + explanation over silently disabled submit buttons (users can't learn why); never disable a form's submit button just because fields are empty.

## 3. CSS rules

- Class names PascalCase matching the component (`.Button`, `.Icon`). One root class.
- **Tokens only.** No hex, rgb(), named colors, literal font names; px only for 0 and 1px hairlines. `scripts/lint-tokens.mjs` checks this.
- States via pseudo-classes (`:hover`, `:focus-visible`, `:disabled`, `[aria-invalid='true']`, `[aria-selected='true']`), variants via `:where([data-variant='…'])` to keep specificity at 0.
- **Focus:** every interactive element gets a visible `:focus-visible` ring ≥ 2px (3px recommended) with offset and ≥ 3:1 contrast, using `--ds-color-border-focus`. Never `outline: none` without a replacement.
- Minimum target size: `min-block-size: var(--ds-size-target-min)` and matching inline size for icon buttons.
- Text must wrap: no fixed heights on text containers, no `overflow: hidden` on labels, no `white-space: nowrap` on anything that holds user or translated content.
- Respect `prefers-reduced-motion`; keep borders/outlines meaningful under `forced-colors: active`.
- Avoid deep nesting and `!important`. Use logical properties (`padding-inline`, `margin-block`) so right-to-left or vertical layouts don't need rewrites.

## 4. API conventions

Keep a small, closed vocabulary and reuse it everywhere:

| Prop | Meaning | Values |
|---|---|---|
| `variant` | emphasis/role | `primary` `secondary` `danger` `ghost` (button); `info` `success` `warning` `critical` (feedback) |
| `size` | control size | `small` `medium` `large` |
| `tone` | semantic color family where variant is taken | `neutral` `brand` `success` `warning` `critical` |
| `disabled`, `loading`, `invalid`, `required`, `readOnly` | state booleans | — |

- Mutually exclusive styles are **one union prop**, not several booleans (`variant="danger"`, not `danger primary`).
- **Children vs props vs compound components:** content goes in `children`; design decisions the system controls go in strict slot props (`leadingIcon`, so the icon color follows the variant); when consumers must arrange parts, use compound components (`Card.Header`, `Card.Body`, `Card.Footer`). "Make the right thing easy and the wrong thing hard."
- **Composition over configuration:** if a component is growing a 10th boolean, split it or give it slots.
- Responsive props, when needed, take an object keyed by breakpoint (`padding={{ narrow: 'sm', wide: 'lg' }}`).
- Events: `onX` callbacks with values, not DOM events, for custom controls (`onValueChange(value)`).

## 5. Layout primitives (why atoms have no margins)

Margins leak out of a component and assume where it will sit, which breaks reuse. Spacing belongs to the parent. Ship layout primitives that own spacing via `gap`:

- `Stack` — vertical, `gap` from space tokens, `align`.
- `Inline` — horizontal, wraps, `gap`, `align`, `justify`.
- `Grid` — columns/min column width, `gap`.
- `Box` — padding, background, radius from tokens.
- `Container` — max width + side gutter (16px minimum on phones).

Molecules and organisms arrange their children with these (or with `gap` in their own CSS). Templates define the page grid only. Do not use `flex-direction: *-reverse` or CSS `order` to reorder content — visual order must match DOM/tab order.

## 6. State: controlled and uncontrolled

Stateful components support both, using the Radix naming triple:
- `value` / `defaultValue` / `onValueChange`
- `open` / `defaultOpen` / `onOpenChange`
- `checked` / `defaultChecked` / `onCheckedChange`

Implement with a small `useControllableState(prop, defaultProp, onChange)` hook. Uncontrolled is easier to use; controlled lets the app own the state. Prefer native elements (`<input type="checkbox">`, `<select>`, `<dialog>`) whenever they meet the need — they bring keyboard and assistive-technology behavior for free.

## 7. Polymorphism

- `as` for text/layout primitives with a **narrow union** (`as?: 'h1' | 'h2' | 'h3' | 'h4'`, `'p' | 'span' | 'div'`); TypeScript cannot infer arbitrary target props well.
- `asChild` (Radix Slot pattern) when an interactive atom must render as something else, e.g. a router link styled as a button: `<Button asChild><Link to="/dat-lich">Đặt lịch</Link></Button>`. The child must accept and spread props and forward refs.
- Changing the element makes you responsible for semantics: a `div` is not a button.

## 8. Strings, i18n and content

- Every user-visible string — including `aria-label`s like "Close", "Loading", "Error:" prefixes — is a prop with a default in the system's primary language. No hard-coded copy inside components.
- Numbers, dates, currency and phone numbers are formatted with `Intl` (`Intl.NumberFormat`, `Intl.DateTimeFormat`) using the locale, not string concatenation.
- Test every text-bearing component with long strings, the language's hardest glyphs, and 200% zoom.

## 9. What does not belong in a component

- Data fetching, global stores, routing imports, analytics calls, permission checks — pass data and callbacks in.
- Business rules ("patients over 65 get…") — the app decides; the component renders.
- Page-specific spacing or positioning — the parent decides.
- A one-off variant for one screen — that screen composes existing parts, or the need goes through the contribution process.
