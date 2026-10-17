# Project status

_Last updated: 2026-10-18_

## Verified
- Repository exists at github.com/varunkarthic/orlo (public); `main` pushed.
- Contrast ratios and motion-preset overshoot/settling are covered by unit tests (`npm test`).

- Token CSS generates (`node packages/tokens/build.mjs`); the same contrast and preset assertions as the unit tests were run directly under Node and pass.

## Blocked
- `npm install` fails in the authoring environment: the network presents a certificate for registry.npmjs.org that is not trusted (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`). Until dependencies install, **the React components, docs app and Vitest suite have been written but never compiled, type-checked or run.** Treat them as unverified.

## In progress
- Base UI based components (Dialog, Tooltip, Tabs, Switch), blocked on the same install problem.

## Not done / not verified
- No Read the Docs project has been connected, so no hosted URL exists. `.readthedocs.yaml` is untested in the real service.
- No browser, screen-reader, visual-regression or performance testing yet.
- No component is `stable`. Nothing is published to npm.
- Search, timeline scrubber in Details Lab, Theme Studio, ResponsiveLab, page-transition flows are planned.

## Next
Verify local build and tests, connect Read the Docs, add overlay components, add Playwright + axe.
