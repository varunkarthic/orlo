# Project status

_Last updated: 2026-10-18_

## Verified locally

- **Library:** 121 beta components are listed in the source manifest. Each documented component has a generated route and lifecycle contract; the build rejects a missing registry entry.
- **Documentation:** `npm run build:rtd` prerendered 645 routes. Deep links, refresh, no-JavaScript content, 404 behaviour, keyboard search, selected accessibility matrix checks, and 320 CSS px / 400% zoom coverage run in Playwright.
- **Framework contracts:** overlays manage focus, inertness and scroll locking; image loading reserves geometry and now communicates loading, retrying, loaded, failed and image-off states; responsive content is constrained against page-level overflow.
- **Design system:** semantic tokens, motion preferences, density, direction, image policy, material (`solid` or `glass`; tinted glass was removed in v3), and locale are exposed through `OrloProvider`. Press feedback preserves component geometry; the library no longer applies a squircle override.
- **v3 "quiet precision" redesign:** in progress per [the v3 plan](audits/v3-redesign-plan.md). Before and after screenshots are in `docs/media/v3-before/` (live site) and `docs/media/v3-after/` (local build).
- **Checks run for the current local working tree:** `npm run typecheck`, `npm test` (168 tests), `npm run build:rtd` (645 routes) and `npm run e2e` (66 passed, 22 skipped because they are desktop-only or mobile-only) completed successfully.

## Needs remote or manual verification

- **Public CI:** GitHub Actions passed on commit "test: update header/theme assertions…" (run 39112614915). Later commits need their own run.
- **Read the Docs:** the site is live at https://orlo-react.readthedocs.io/en/latest/. The floating RTD flyout is hidden with CSS; the docs opt in to the addons data event (`readthedocs-addons-api-version`) and show the version in the footer. This footer line has not yet been seen on the hosted build. The flyout position itself can only be changed in the RTD dashboard, not from the repository.
- **Accessibility:** automated axe and browser checks do not replace manual VoiceOver, NVDA, or TalkBack validation. No component is marked `stable`.
- **Not yet implemented:** the audit records catalog-scale v3 work still outside this focused release increment, including the requested visual-regression service, complete advanced-chart replacement, and extra catalog families.
- **Publishing:** packages are not published to npm.

## Source of truth

See [the v3 design refinement audit](audits/orlo-design-audit.md) for evidence, classifications, and scope boundaries. The manifest and component registry, not a hand-maintained count, define the public component catalogue.
