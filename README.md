# ARK-56 Design System

A white-label design system for client projects: a two-tier token pipeline (`@ark-56/tokens`)
feeding a React component library (`@ark-56/ui`). Components never hardcode a brand — they only
ever consume semantic tokens — so re-skinning for a new client is a token swap, not a rewrite.

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
pnpm storybook        # browse every component at localhost:6006
```

## How the token pipeline works

`packages/tokens/tokens/` has two files:

- **`primitives.json`** - raw scales with no meaning: `color.neutral.900`, `space.4`, `radius.md`.
  Never referenced directly by components.
- **`semantic.json`** - the layer components actually consume: `color.bg.canvas`,
  `color.text.primary`, `color.brand.default`. Each value points at a primitive.

`pnpm tokens:build` (Style Dictionary) turns those into:

- `build/css/variables.css` - CSS custom properties. Semantic vars reference primitive vars
  (`--color-text-primary: var(--color-neutral-900)`), so overriding a primitive cascades everywhere
  automatically.
- `build/tailwind/theme.cjs` - a `theme.extend` object consumed by `packages/ui/tailwind.config.js`,
  mapping clean Tailwind class names (`bg-surface`, `text-foreground`, `bg-brand`) to those same CSS
  variables.
- `build/js/*` / `build/ts/*` - the same tokens as plain JS/TS, for anything that needs raw values
  outside of CSS (e.g. generating a PDF, or a canvas/chart library that can't read CSS variables).

## Re-theming for a new client

Two levers, depending on how permanent the change is:

1. **Rebuild (the primary lever, for a real client project).** Edit
   `packages/tokens/tokens/primitives.json` (new brand colors, radius, type scale) — and
   `semantic.json` too, if the client's IA genuinely differs (e.g. no "warning" state). Run
   `pnpm build`. Every component picks up the new look with zero component-code changes, because
   components only ever reference semantic classes/vars, never raw hex values.
2. **Runtime override (for previews, or multiple brands in one running app).** Wrap a subtree in
   `<ThemeProvider theme={{ "color-brand-default": "#0f766e", ... }}>`. This sets scoped CSS variable
   overrides and doesn't require a rebuild - handy for a sales demo or a multi-tenant app, but the
   rebuild path above is the one to use for a real client ship.

## Components (v0.1)

Button, Input, Checkbox, Card, Badge, Dialog, Tabs, Toast. Interactive/accessible behavior comes
from Radix UI primitives; visual styling comes entirely from the token-driven Tailwind classes above.
Variants are defined with `class-variance-authority` (see any component's `*Variants` export).

The default theme in `primitives.json` is a deep teal (`#178c81`) on true greys — a deliberate
default rather than a generic SaaS-indigo or warm-terracotta placeholder, chosen to suit a
technical/engineering identity. (I couldn't pull an exact color from your GitHub avatar directly —
`avatars.githubusercontent.com` isn't reachable from this sandbox — so this is a considered
placeholder, not a color sampled from it.) Swap it out per client using the re-theming workflow
above — nothing in the component layer references these values directly.

Storybook (`pnpm storybook`) is both the working documentation and something you can point a
prospective client at directly.

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

If the package isn't published to a registry yet, use a `workspace:*`/`file:` or git dependency
until it is (see "Publishing" below).

## Versioning & publishing

Not wired up yet - recommended next step is
[Changesets](https://github.com/changesets/changesets) (`pnpm add -Dw @changesets/cli`) so each
client-facing change ships as a proper semver bump, and a private registry (GitHub Packages or
npm) so client Next.js projects can `pnpm add @ark-56/ui` like any other dependency instead of
pointing at this repo directly.

## Known follow-ups (fast-follow, not blocking v0.1)

- The Tailwind color/spacing mapping in `packages/tokens/scripts/build.js` is hand-written for
  clarity (`bg-surface` instead of the auto-derived, redundant `bg-bg-surface`). If the semantic
  token *names* change, update that mapping in the same commit.
- No visual regression testing yet (Chromatic recommended once the component set stabilizes).
- No dark-mode token set yet - `darkMode: ["class"]` is already wired in `tailwind.config.js`, but
  `semantic.json` only defines one (light) value per token today.
