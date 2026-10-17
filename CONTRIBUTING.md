# Contributing

Orlo is early. Open an issue before large changes.

- `npm install`, then `npm test` and `npm run typecheck` must pass.
- New components need: a manifest entry (`packages/react/src/manifest.ts`) with honest maturity, a docs demo, keyboard/touch/reduced-motion behaviour, and at least one test of real behaviour.
- Motion values come from `@orlo/motion` presets, never inline constants. Colours and spacing come from tokens.
- Do not copy third-party component source without checking its licence and recording it in `docs/research/attributions.md`.
- Never mark something `stable` without evidence recorded in `docs/PROJECT_STATUS.md`.
