# Orlo v3 design refinement audit

Audited 2026-10-18 against the package source, the generated documentation configuration, local Chromium, and the public GitHub Actions result for commit `3ef9402`.

## Evidence and classification

| ID | Area | Classification | Evidence | Disposition |
| --- | --- | --- | --- | --- |
| R-CI-001 | Responsive containment | R | Public CI reported 27 CSS px horizontal overflow on `/components/dialog/` at 320 CSS px / 400% zoom. Local macOS Chromium did not reproduce it. | Add defensive containment and re-run CI; keep platform variance explicit. |
| R-CI-002 | Command palette | R | The public CI search-shortcut test did not find the focused Search combobox after Ctrl/Cmd+K. Linux Chromium can reserve Ctrl+K for browser chrome. | Make hotkey registration stable and test focus hand-off; use the visible trigger for the cross-platform browser journey. |
| R-CI-003 | SSR hydration | R | Public CI reported React hydration error #418 for Timeline, RelativeTime, and DataGrid docs. `Intl` used host defaults and DateTimeFormat used the host time zone; the virtual grid can also derive its viewport after hydration. | Make initial server/client formatting deterministic, then mount the documentation grid only after its identical SSR/client skeleton hydrates. |
| R-SRC-001 | Interaction geometry | R | `styles.css` changed a button’s corner radius while pressed and supplied a `corner-shape: squircle` override. | Remove the squircle override and preserve geometry through press. |
| U-IMG-001 | Image retry lifecycle | U | Image loading had `loading` and `failed` but no visible retrying state; retry remained actionable while a new request was in flight. | Add a distinct retrying state, busy semantics, and disabled retry control. |
| U-TGL-001 | Disabled Toggle visibility | U | Disabled Toggles relied on `opacity: .45`, which can recede into glass/surface treatments. | Use explicit muted foreground, border, and surface tokens instead. |
| U-CAR-001 | Carousel text selection | U | Native scroll-snap carousel did not express whether slide content is selectable. | Make selection intentional with an opt-in prop and data attribute. |
| E-DOC-001 | Documentation status | E | `docs/PROJECT_STATUS.md` still claims 91 components and 490 routes; the current manifest/build reports 121 and 645. | Update only after the implementation and verification pass. |
| N-RTD-001 | Hosted docs / version switcher | N | The configured static Read the Docs build was inspected, but hosted pages were not reachable from this environment. | Do not claim deployment or dashboard configuration; retain as a deployment verification task. |

## Scope decision

The master prompt describes a multi-milestone program. This change set addresses the verified release blockers and reusable framework contracts first: deterministic SSR behaviour, input feedback geometry, image retry lifecycle, disabled Toggle contrast, carousel selection intent, responsive containment, and documentation accuracy. It does not claim the unimplemented catalog-scale additions, chart replacement, hosted Read the Docs configuration, or visual-regression service as complete.

## Verification gates

- Typecheck, unit tests, RTD build, and the full Playwright suite must pass locally.
- The public CI failure above must be re-run after the fixes; local success is not evidence that the hosted run has passed.
- Documentation copy must describe implemented behaviour only.
