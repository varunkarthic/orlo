<p align="center"><img src="assets/brand/wordmark-light.svg#gh-light-mode-only" alt="Orlo" height="64"><img src="assets/brand/wordmark-dark.svg#gh-dark-mode-only" alt="" height="64"></p>

# Orlo

**Nothing is an afterthought.**

Orlo is a design framework for React, built around the idea that a great interface is shaped as much by what happens *between* moments as by what appears on screen. Every press, transition, boundary, loading state and recovery moment is part of the design.

The name is inspired by the Italian word *orlo*: an edge, rim or hem. Pronounced **OR-loh**. A hem is the careful finish that holds the whole together, even when it is barely noticed. The mark is an O whose rim is left deliberately open.

> **Status: pre-release.** Eight components exist at `beta`. Nothing is stable, nothing is published to npm, and no hosted documentation URL has been verified yet. The table below is the source of truth.

## What makes it different

**Finished edges.** The hard part of an interface is the part nobody screenshots: the frame between two states, the image that never arrives, the paragraph a growing card cuts in half. Orlo designs those on purpose. The [Details Lab](apps/docs/src/pages/DetailsLab.tsx) shows the half-clipped text problem flawed beside fixed.

**Motion with a reason.** One spring-based grammar (`press`, `reveal`, `overlay`, `shared`, …) rather than per-component tweening. Presets are checked analytically: every standard preset stays under 5% overshoot and settles inside 700 ms, enforced by a unit test. Under reduced motion, travel becomes a short fade; `off` is instant. Interrupted animations redirect from their current velocity.

**Failure is designed.** `OrloImage` reserves its geometry, decodes before it reveals, retries a bounded number of times, and falls back to a fixed-size placeholder with an explicit retry, never a broken-image icon. `images="off"` turns every managed image into a designed replacement and makes no requests.

**Quiet, accessible by default.** Hover styles only on hover-capable pointers. Touch density for coarse pointers. Errors are never colour alone. Contrast ratios are computed from the tokens and tested.

**Tokens, not magic numbers.** Primitive → semantic → component. One TypeScript source generates the CSS custom properties; light, dark, density and forced-colour variants are layered, with no flash of the wrong theme.

## Principles

1. Every transition has a reason.
2. Nothing is half-finished: inspect entry, midpoint, exit, interruption, failure.
3. Content stays in control of the effect.
4. Quiet by default; expressive motion is opt-in.
5. Touch, keyboard, pen and screen reader are first-class.
6. Accessible is beautiful.

## Components

| Component | Maturity | Verified |
|---|---|---|
| Button, TextField, Alert, OrloImage | beta | unit tests |
| Badge, Card, Spinner, Skeleton | beta | none yet |

Dialog, Tooltip, Tabs, Switch, menus, tables, pickers and the rest of the planned inventory are **planned**. They are tracked in [`docs/research/component-coverage.md`](docs/research/component-coverage.md) and are not installable.

## Use it

Not on npm yet. From a clone:

```bash
npm install
npm run dev          # docs + live demos at http://localhost:5173
npm test             # tokens contrast, motion presets, image lifecycle
npm run build:rtd    # static site → apps/docs/dist
```

```tsx
import { OrloProvider, Button, OrloImage } from "@orlo/react";
import "@orlo/tokens/css";
import "@orlo/react/styles.css";

<OrloProvider theme="system" motion="system" images="on">
  <OrloImage src="/harbour.jpg" alt="Harbour at dusk" ratio="4 / 3" />
  <Button loading={saving} onClick={save}>Save changes</Button>
</OrloProvider>
```

## Repository

```
packages/tokens   design tokens → CSS custom properties
packages/motion   springs, presets, reduced-motion policy (wraps Motion)
packages/react    components and provider
apps/docs         statically prerendered docs + labs (Read the Docs custom build)
assets/brand      wordmark and mark (SVG)
docs/             research notes, decisions, project status
```

Documentation is built as plain static HTML per route (no server needed) and configured for Read the Docs in [`.readthedocs.yaml`](.readthedocs.yaml). See [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) for what is verified today.

## Inspirations

Motion physics and principles are studied from Apple's Human Interface Guidelines and Material 3 Expressive; implementation builds on [Motion for React](https://motion.dev/docs/react) and, as components arrive, [Base UI](https://base-ui.com). Orlo borrows ideas, not visual identities, and is **not affiliated with Apple, Google, Framer, MUI or any other vendor**. Details and licences: [`docs/research/`](docs/research).

## Contributing and licence

See [CONTRIBUTING.md](CONTRIBUTING.md). Agents: read [AGENTS.md](AGENTS.md). Licensed under the [MIT License](LICENSE).
