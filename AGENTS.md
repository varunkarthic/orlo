# Agent guide

Orlo is the design source of truth. If a requirement can't be met with existing components, extend Orlo or document the exception; don't scatter hardcoded colours, radii or animation constants. Read `ORLO_DESIGN_RULES.md` first.

## Build and verify
- Install: `npm install` (the committed `.npmrc` points at `registry.yarnpkg.com`, a mirror of the npm registry).
- Verify everything: `npm run typecheck && npm test && npm run build:rtd && npm run e2e`.
- The docs build fails if a component in `packages/react/src/manifest.ts` has no entry in `apps/docs/src/registry/`.

## Adding a component
1. Write it in `packages/react/src/components/`, using the internal primitives: `useControllable`, `useDismiss`, `useFocusScope`, `useScrollLock`, `useInertOutside`, `useAnchoredPosition`, `Portal`, `Icons`.
2. Put styles in `packages/react/src/extended.css`, reading only tokens. Hover styles go inside `@media (hover: hover) and (pointer: fine)`. Use logical properties.
3. Export it from `packages/react/src/index.ts` and add it to `manifest.ts` with an honest maturity and `tested` list.
4. Add a docs entry: demo, code, notes, keyboard, semantics, and anatomy/specs where useful.
5. Test real behaviour (keyboard, focus, ARIA state) in `packages/react/src/*.test.tsx`.

## Rules
- Animation goes through `useOrloMotion()` (`transition(name)`, `distance(px)`). Never hardcode durations.
- Errors and status are never conveyed by colour alone.
- Only components listed in `components.json` exist. Don't reference or demo anything else.
- Never claim a push, deploy, test pass or accessibility conformance that didn't happen.
- Don't force-push or rewrite history.
