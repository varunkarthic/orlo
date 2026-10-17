# Project status

_Last updated: 2026-10-18_

## Verified
- Repository exists at github.com/varunkarthic/orlo (public); `main` pushed.
- Contrast ratios and motion-preset overshoot/settling are covered by unit tests (`npm test`).

## In progress
- Dependency install and first local build of the docs site (npm registry was very slow in the authoring environment).
- Base UI based components (Dialog, Tooltip, Tabs, Switch).

## Not done / not verified
- No Read the Docs project has been connected, so no hosted URL exists. `.readthedocs.yaml` is untested in the real service.
- No browser, screen-reader, visual-regression or performance testing yet.
- No component is `stable`. Nothing is published to npm.
- Search, timeline scrubber in Details Lab, Theme Studio, ResponsiveLab, page-transition flows are planned.

## Next
Verify local build and tests, connect Read the Docs, add overlay components, add Playwright + axe.
