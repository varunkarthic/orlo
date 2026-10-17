# Agent guide

Orlo is the design source of truth. If a requirement cannot be met with existing components, extend Orlo or document the exception; do not scatter hardcoded colours, radii or animation constants.

- Install: `npm install`. Verify: `npm run typecheck && npm test && npm run build:rtd`.
- Tokens live in `packages/tokens/src/tokens.ts`; `dist/orlo.css` is generated. Motion presets live in `packages/motion/src/presets.ts` and are consumed via `useOrloMotion().transition(name)`.
- Always respect `useOrloMotion()` (`distance()` collapses travel to a fade under reduced motion).
- Hover styles only inside `@media (hover: hover) and (pointer: fine)`. Use logical CSS properties. Errors are never colour alone.
- Only `components` listed in `packages/react/src/manifest.ts` exist. Do not reference or demo anything else. Keep maturity honest.
- Never claim a push, deploy, test pass or accessibility conformance that did not happen.
- Do not force-push or rewrite history.
