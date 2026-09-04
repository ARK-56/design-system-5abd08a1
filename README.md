# ARK-56 Design System

An internal, white-label design system used to build client sites: a two-tier token pipeline
(`@ark-56/tokens`) feeding a React component library (`@ark-56/ui`). Components never hardcode a
brand — they only ever consume semantic tokens — so standing up a new client is a token swap rather
than a rewrite.

This is a private studio asset. It is not distributed to clients, though it is built so other
people, and their coding agents, can work from it later.

## Packages

```
packages/
  tokens/   @ark-56/tokens   - source of truth: JSON tokens -> CSS vars, JS/TS, Tailwind theme
  ui/       @ark-56/ui       - React components + Storybook, styled entirely from tokens
```

## Requirements

- Node >= 18
- pnpm 9 (`corepack enable && corepack prepare pnpm@9 --activate`)

## Getting started

```bash
pnpm install
pnpm build            # builds tokens, then ui, in the right order (via Turborepo)
pnpm test             # 131 tests: token contract, CSS contract, behaviour, a11y
pnpm lint
pnpm storybook        # browse every component at localhost:6006
```

## Branching and phases

`main` holds the live, tested code. Work arrives through phase branches, never directly.

```bash
git checkout main && git pull
git checkout -b phase-1-structure     # one branch per phase
# ...work, with tests for whatever the phase introduces...
git merge main                        # pick up any tests main gained meanwhile
pnpm lint && pnpm test                # must be green
```

A phase branch inherits the entire existing suite automatically — there is nothing to copy across.
It adds its own tests on top, and both have to pass. That is the whole safety property: a phase
cannot merge while it breaks anything that already worked.

CI (`.github/workflows/ci.yml`) runs `build`, `lint` and `test` on every push to a `phase-*` branch
and again on the pull request, so a phase is judged by the same gate twice. Merge with `--no-ff`
so phase boundaries stay legible in history.

Two habits that keep this honest:

- **Merge `main` into the phase before merging back.** Otherwise the phase is validated against the
  tests that existed when it started, not the ones that exist now.
- **A phase that adds a constraint adds the test for it.** New colour pairing → add it to `PAIRINGS`
  in `packages/tokens/test/tokens.test.mjs`. New rule about what components may do → add it to
  `packages/ui/test/source-hygiene.test.ts`. A constraint no test knows about is a convention, and
  conventions do not survive contact with a coding agent.

> CI reports status but cannot block a merge on its own. Turn on branch protection for `main` in the
> repository settings — require the `verify` check and a pull request — or the gate is advisory.

## The rules

These are the constraints the whole thing rests on. All four are enforced by
`packages/ui/test/source-hygiene.test.ts`, so breaking one fails `pnpm test` rather than shipping
quietly.

1. **Components consume the semantic layer only.** Never a primitive utility (`bg-neutral-200`),
   never a raw hex. The Tailwind theme does expose the raw `neutral` scale, but that escape hatch
   is for consuming apps, not for components here.
2. **Spacing stays on the token scale.** Whole steps `0`–`20` plus half steps `0.5`, `1.5`, `2.5`.
   Anything else falls through to Tailwind's own defaults, where no re-theme can reach it.
3. **No invented z-index.** Use the named layers: `z-dropdown`, `z-sticky`, `z-overlay`, `z-modal`,
   `z-toast`.
4. **Every foreground/background pairing clears WCAG.** New pairings go in the `PAIRINGS` table in
   `packages/tokens/test/tokens.test.mjs`, which fails if one drops below its threshold.

### Component API conventions

- **Anything that renders a host element forwards its ref and sets a `displayName`.** Enforced by
  `packages/ui/test/ref-forwarding.test.tsx`, which also fails when a new export is neither
  ref-forwarding nor listed in its `NO_HOST_ELEMENT` table with a stated reason — so adding an
  export forces the decision rather than allowing it to be skipped.
- **`className` is always accepted and merged last** through `cn()`, so a consumer can override any
  style without fighting specificity.
- **Variants go through `cva` and are exported as `*Variants`.** Components with a single style use
  `cn()` directly; `cva` earns its place only where there are variants worth naming.
- **`asChild` is offered where a component may need to become another element** — a `Button` that is
  really a link. When the component renders children of its own alongside the consumer's, wrap the
  consumer's in Radix `<Slottable>`, or Slot sees more than one child and throws.

## How the token pipeline works

`packages/tokens/tokens/` has three files:

- **`primitives.json`** — raw scales with no meaning: `color.neutral.900`, `space.4`, `radius.md`,
  `z.300`. Never referenced directly by components.
- **`semantic.json`** — the layer components actually consume. Each value points at a primitive.
- **`semantic.dark.json`** — a sparse override redefining only what a dark ground changes. See
  [Dark mode](#dark-mode).

`pnpm tokens:build` (Style Dictionary) turns those into:

- `build/css/variables.css` — CSS custom properties. Semantic vars reference primitive vars
  (`--color-text-primary: var(--color-neutral-900)`), so overriding a primitive cascades everywhere.
- `build/tailwind/theme.cjs` — a `theme.extend` object consumed by `packages/ui/tailwind.config.js`,
  mapping clean class names (`bg-surface`, `text-foreground`, `bg-brand`) to those same CSS vars.
- `build/js/*` / `build/ts/*` — the same tokens as plain JS/TS, for anything that can't read CSS
  variables (a PDF generator, a canvas or chart library).

## Semantic token vocabulary

The full list components are allowed to use, with the Tailwind class each produces.

| Token | Class | Use |
| --- | --- | --- |
| `color.bg.canvas` | `bg-canvas` | the page ground |
| `color.bg.surface` | `bg-surface` | cards, inputs, anything sitting on the canvas |
| `color.bg.surface-sunken` | `bg-surface-sunken` | wells and insets — tab strips, secondary buttons |
| `color.bg.surface-sunken-hover` | `bg-surface-sunken-hover` | hover state for the above |
| `color.bg.surface-raised` | `bg-surface-raised` | modals and popovers |
| `color.bg.overlay` | `bg-overlay` | modal scrim |
| `color.text.primary` | `text-foreground` | body text |
| `color.text.secondary` | `text-foreground-secondary` | hints, descriptions, captions |
| `color.text.disabled` | `text-foreground-disabled` | disabled labels and placeholders |
| `color.text.on-brand` / `on-danger` | `text-on-brand` / `text-on-danger` | text on a filled button |
| `color.text.link` | `text-link` | inline links |
| `color.border.default` | `border-border` | decorative edges — cards, dividers |
| `color.border.control` | `border-border-control` | edges that *identify* a form field (clears 3:1) |
| `color.border.focus` | `border-border-focus`, `ring-border-focus` | focus indication |
| `color.{brand,danger}.{default,hover,active}` | `bg-brand`, `bg-danger-hover`, … | filled interactive surfaces |
| `color.{brand,danger,warning,success}.subtle` | `bg-brand-subtle`, … | tinted status backgrounds |
| `color.{brand,danger,warning,success}.on-subtle` | `text-brand-on-subtle`, … | text **on** those tints |
| `z.{dropdown,sticky,overlay,modal,toast}` | `z-modal`, … | stacking order |
| `component.icon.{size-sm,size-md,size-lg,stroke}` | via `<Icon size>` | icon metrics |
| `component.*` | `h-[var(--component-control-height-md)]`, … | per-component metrics |

The `subtle` / `on-subtle` split matters: a foreground chosen to sit on white does not clear
contrast on a tinted wash. Use `on-subtle` whenever the background is a `subtle`.

## Dark mode

`semantic.json` is the light set; `semantic.dark.json` is a sparse override that redefines only the
colour tokens, pointing them at different primitive steps. The build emits both into one stylesheet:

```css
:root  { --color-brand-default: var(--color-brand-600); }   /* teal, white text */
.dark  { --color-brand-default: var(--color-brand-400); }   /* bright teal, dark text */
```

Add `class="dark"` to `<html>` and everything follows, because every component reads the same
variables. No component knows a mode exists. Storybook has a Mode toggle in the toolbar.

Two rules the tests enforce. Every colour token must have a dark value — a missing one would
silently inherit the light value and break on a dark ground. And `.dark` may only redefine
variables, never set a property a utility owns, or the mode would fight the utilities instead of
feeding them.

Dark inverts the fill/text relationship for filled buttons: light mode is a dark fill with white
text, dark mode is a bright fill with dark text. That is why `text.on-brand` and `text.on-danger`
exist as tokens rather than being hardcoded to white. All 20 pairings are checked in both modes.

## Breakpoints

`breakpoint.{sm,md,lg,xl,2xl}` feed Tailwind's `screens`. These are the one token category that
**cannot** flow through CSS custom properties — a media query condition cannot read `var()` — so
they are emitted as raw values. Changing them needs a rebuild, and a runtime `ThemeProvider`
override cannot reach them.

## Re-theming for a new client

Two levers, depending on how permanent the change is.

1. **Rebuild — the primary lever.** Edit `packages/tokens/tokens/primitives.json` (new brand colours,
   radius, type scale) and `semantic.json` too, if the client's IA genuinely differs — e.g. no
   warning state. Run `pnpm build`. Every component picks up the new look with no component-code
   changes, because components only reference semantic classes.
2. **Runtime override — for previews or multi-tenant apps.** Wrap a subtree in
   `<ThemeProvider theme={{ "color-brand-default": "#0f766e" }}>`. Scoped CSS variable overrides,
   no rebuild. Good for a demo; use the rebuild path for a real ship.

This has been exercised once end-to-end, with a deliberately unlike second theme — violet brand,
warm neutrals, serif type, square corners, hard offset shadows. It built clean, and the two
stylesheets differed only inside the `:root` token block, meaning no theme value is baked into a
utility class. `pnpm test` now asserts that property permanently.

## The default theme

The ramp is a deep teal on true greys — a deliberate choice for a technical identity rather than a
generic SaaS indigo. `brand.500` (`#178c81`) anchors it and is used for the focus ring.

Text-bearing surfaces use `brand.600` (`#0f7067`) instead, because white on `brand.500` measures
4.11:1 and normal text needs 4.5:1. The same shift applies to danger. Swap the whole thing per
client using the workflow above.

## Components (v0.1)

Button, Input, Checkbox, Card, Badge, Dialog, Tabs, Toast, plus `Heading`/`Text` and `Icon`.
Interactive and accessible behaviour comes from Radix UI primitives; visual styling comes entirely
from token-driven Tailwind classes. Variants are defined with `class-variance-authority` (see any
component's `*Variants` export).

`Heading` and `Text` exist so consuming code never hardcodes `text-500 font-semibold` — once those
literals spread through client codebases the scale can no longer be changed. On `Heading`, `level`
and `size` are separate: the tag belongs to the document outline, the size to the layout.

`Icon` is the icon *contract*, not an icon set: a 24-unit viewBox, `currentColor`, token-driven size
and stroke. The library ships only the three icons its own components need; wrap any other path data
— or a third-party set — in `<Icon>` and it renders consistently. A test fails the build on any
inline `<svg>` outside `Icon/`.

Storybook is the working documentation.

## Using `@ark-56/ui` in a client's Next.js app

```bash
pnpm add @ark-56/ui @ark-56/tokens
```

```tsx
// app/layout.tsx
import "@ark-56/ui/styles.css";
```

```tsx
import { Button, Card, CardHeader, CardTitle } from "@ark-56/ui";
```

The bundle carries a `"use client"` banner, so it can be imported from a server component without
the App Router complaining. Nothing is published to a registry yet — use a `workspace:*`, `file:` or
git dependency.

## Testing

`pnpm test` runs three layers, in `packages/tokens/test` and `packages/ui/test`:

- **Token contract** (node) — every semantic reference resolves to a primitive that exists, no
  semantic token hardcodes a hex, status families keep a consistent shape, and every pairing the
  components compose clears WCAG.
- **CSS contract** (reads `dist/`) — asserts against the *built* stylesheet, catching bugs that
  live between source and output: a utility Tailwind never generated, or one it generated with the
  wrong meaning. jsdom applies no stylesheet, so nothing else can see these.
- **Behaviour and a11y** (jsdom) — rendering, labelling, keyboard interaction, and `axe` across
  representative components. `color-contrast` is disabled there because jsdom has no layout engine;
  the token layer covers contrast far more precisely.

## Versioning & publishing

Deliberately not wired up. Changesets and a private registry exist to protect consumers you do not
control, and right now there are none. The trigger to add them is the first consumer you cannot
personally fix — not a date. Publishing before the component API conventions settle would turn
every convention fix into a breaking change.

## Known follow-ups

Three lists are hand-maintained and must track the tokens. Nothing enforces the first two, so update
them in the same commit as any token rename:

- the Tailwind colour/spacing map in `packages/tokens/scripts/build.js`, written explicitly so class
  names stay clean (`bg-surface`, not `bg-bg-surface`)
- the font-size class group in `packages/ui/src/lib/utils.ts`, which teaches `tailwind-merge` that
  the numeric scale is a font size and not a colour
- the `PAIRINGS` table in `packages/tokens/test/tokens.test.mjs` (this one does fail loudly if a
  pairing regresses, but it cannot know about a pairing you never added)

Not yet built:

- **A thin component set.** Eight components plus typography and icons does not cover a real site.
  The control layer comes first — Select, Radio group, Switch, Textarea, Tooltip, Popover,
  DropdownMenu, Table, Alert, Avatar, Skeleton — because a marketing contact form and a dashboard
  filter panel are built from the same parts.
- **No form abstraction.** `Input` hand-rolls its label, hint, error and `aria-describedby` wiring.
  Extract a `Field` wrapper before Textarea, Select and Radio copy that block.
- **Nothing agent-readable yet.** No `AGENTS.md` shipped in the package, no generated component
  manifest. The rules above are enforced by tests but not stated anywhere an agent reads first.
- **No visual regression testing.** Chromatic once the component set stabilises — snapshots taken
  before then are snapshots you will re-approve.
- **Nothing has been visually reviewed.** The tests check values, not appearance. They would pass on
  an ugly system.
