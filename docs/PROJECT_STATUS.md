# Project status

_Last updated: 2026-10-18_

## Done and verified
- Repository: github.com/varunkarthic/orlo (public). Work is pushed to `main`; GitHub Actions CI runs typecheck, unit tests, the docs build and Playwright with axe on every push.
- **Brand:** the supplied logo has been traced to vectors and committed with transparent SVG/PNG variants, favicon.svg, favicon.ico (16/32/48), the Apple touch icon, PWA icons and a social card (`assets/brand/`).
- **Tokens:** contrast is unit-tested for all semantic pairs and identity tints in light and dark. `createTheme` is tested on extreme inputs (yellow, cyan, white, black and others).
- **Motion:** every preset is tested to stay under 5% overshoot and settle within 700 ms.
- **Components:** 91, all `beta`. Behaviour tests cover focus return, inert backgrounds, and the keyboard models for tabs, menu, select, tree, calendar and the segmented control, plus image retry limits, number parsing, tag/PIN input, combobox, diff and highlight.
- **Docs:**
  - 490 prerendered routes, verified under an `/en/latest/` prefix: deep links, refresh, the 404 page, and content without JavaScript.
  - axe reports no serious or critical violations on 10 key pages at desktop and mobile widths.
  - No horizontal overflow at 390 px on the pages tested.

## Not done / not verified
- **Read the Docs:** the maintainer needs to import the repository at readthedocs.org. `.readthedocs.yaml` has been validated by reproducing the build locally only, so no hosted URL is confirmed.
- **Accessibility:** no manual screen-reader passes yet (VoiceOver, NVDA, TalkBack). No component is `stable`.
- **Not automated:** visual regression snapshots and performance traces.
- **Bundle size:** the docs JS bundle is about 690 KB minified (one bundle for all pages). Route-level code splitting is planned.
- **Not built yet:** menu submenus, virtualised table rows, charts beyond Sparkline/Meter/Heatmap, and a Kanban board.
- **Publishing:** packages are not published to npm.

## Environment notes
- The authoring network intercepts TLS to registry.npmjs.org (Fortinet). The committed `.npmrc` uses `registry.yarnpkg.com`, which serves the same packages, and npm still verifies integrity hashes.

## Next
Connect Read the Docs, run manual screen-reader passes on Dialog, Menu, Select, Combobox, Calendar and TreeView, add visual snapshots, then split the docs bundle per route.
