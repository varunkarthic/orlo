# Project status

_Last updated: 2026-10-18_

## Verified locally

- **Library:** 121 beta components are listed in the source manifest. Each documented component has a generated route and lifecycle contract; the build rejects a missing registry entry.
- **Documentation:** `npm run build:rtd` prerendered 645 routes. Deep links, refresh, no-JavaScript content, 404 behaviour, keyboard search, selected accessibility matrix checks, and 320 CSS px / 400% zoom coverage run in Playwright.
- **Framework contracts:** overlays manage focus, inertness and scroll locking; image loading reserves geometry and now communicates loading, retrying, loaded, failed and image-off states; responsive content is constrained against page-level overflow.
- **Design system:** semantic tokens, motion preferences, density, direction, image policy, material, and locale are exposed through `OrloProvider`. Press feedback preserves component geometry; the library no longer applies a squircle override.
- **Checks run for the current local working tree:** `npm run typecheck`, `npm test` (161 tests), `npm run build:rtd`, and `npm run e2e` (86 tests; 2 environment-skipped cases) completed successfully.

## Needs remote or manual verification

- **Public CI:** the latest checked GitHub Actions run for the prior commit failed on Linux with responsive overflow, command-palette focus, and hydration reports. Those code paths were corrected locally in this working tree, but the hosted run has not yet been re-run for these changes.
- **Read the Docs:** `.readthedocs.yaml` is present and its build is reproduced locally. No hosted URL, version-flyout configuration, or deployment result is confirmed from this environment.
- **Accessibility:** automated axe and browser checks do not replace manual VoiceOver, NVDA, or TalkBack validation. No component is marked `stable`.
- **Not yet implemented:** the audit records catalog-scale v3 work still outside this focused release increment, including the requested visual-regression service, complete advanced-chart replacement, extra catalog families, and hosted-docs version configuration.
- **Publishing:** packages are not published to npm.

## Source of truth

See [the v3 design refinement audit](audits/orlo-design-audit.md) for evidence, classifications, and scope boundaries. The manifest and component registry, not a hand-maintained count, define the public component catalogue.
