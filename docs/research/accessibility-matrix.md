# Accessibility matrix

| Area | Automated | Manual |
|---|---|---|
| Token contrast (light/dark) | Vitest, all pairs | n/a |
| Keyboard models (tabs, menu, select, tree, calendar, segmented) | Vitest + Playwright | not yet |
| Focus trap / return / inert | Vitest + Playwright (real browser) | not yet |
| axe-core WCAG 2.2 A/AA (10 doc pages × desktop/mobile) | Playwright, passing | n/a |
| VoiceOver + Safari (macOS, iOS) | — | **not tested** |
| NVDA + Firefox/Chrome | — | **not tested** |
| TalkBack | — | **not tested** |
| 400% zoom | partial (no overflow at 390 px) | not yet |
| Forced colours | CSS provided | not yet verified |

Known limitations: the WAI-ARIA tooltip pattern is still a work in progress upstream. The HoldToConfirm pattern may be hard for some motor impairments, and its docs recommend offering an alternative.
