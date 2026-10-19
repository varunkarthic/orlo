# Project status

_Last updated: 2026-10-18_

## Verified locally

- **Library:** 127 beta components are listed in the source manifest (expanded with `Callout`, `AspectRatio`, `Collapsible`, `StatusDot`, `DateRangePicker`, and pill `Tabs`). Each documented component has a generated route and lifecycle contract; the build rejects any missing registry entry.
- **Documentation:** `npm run build:rtd` prerendered 676 routes. Features Apple HIG-inspired frosted glass segmented pill tab navigation, refreshed tactile stage previews, and a dedicated Spacing & Layout guidelines page.
- **Framework contracts:** overlays manage focus, inertness and scroll locking; image loading reserves geometry; animations use `useOrloMotion` presets; responsive content is constrained against page-level overflow.
- **Design system:** semantic tokens, 8pt spatial grid with 4pt subgrid (`--orlo-space-*`, `--orlo-gap-tab`, `--orlo-inset-tab`), motion preferences, density, direction, image policy, material, and locale are exposed through `OrloProvider`.
- **Guidelines:** Full normative spatial specification published in `docs/guidelines/spacing-and-layout.md` and interactive documentation under `styles/spacing`.
- **Checks run for the current local working tree:** `npm run typecheck`, `npm test` (181 tests), `npm run build:rtd` (676 routes) completed with zero errors.

## Needs remote or manual verification

- **Public CI:** GitHub Actions passed on commit "test: update header/theme assertions…" (run 39112614915). Later commits need their own run.
- **Read the Docs:** the site is live at https://orlo-react.readthedocs.io/en/latest/. The floating RTD flyout is hidden with CSS; the docs opt in to the addons data event (`readthedocs-addons-api-version`) and show the version in the footer. The flyout position itself can only be changed in the RTD dashboard, not from the repository.
- **Accessibility:** automated axe and browser checks do not replace manual VoiceOver, NVDA, or TalkBack validation. No component is marked `stable`.
- **Not yet implemented:** the audit records catalog-scale v3 work still outside this focused release increment, including the requested visual-regression service, complete advanced-chart replacement, and extra catalog families.
- **Publishing:** packages are not published to npm.

## Source of truth

See [the v3 design refinement audit](audits/orlo-design-audit.md) for evidence, classifications, and scope boundaries. The manifest and component registry, not a hand-maintained count, define the public component catalogue.
