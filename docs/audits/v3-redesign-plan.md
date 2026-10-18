# Orlo v3 redesign — plan of action

_Written 2026-10-18 after reading `context/ORLO_MASTER_BUILD_PROMPT.md`, `context/ORLO_V3_DESIGN_REFINEMENT_MASTER_PROMPT.md`, `context/PLAN.md`, the current source at `22e76d7`, and screenshots of the live site (`docs/media/v3-before/`)._

## 0. Owner direction (overrides the brief where they conflict)

1. **Orlo is a minimalistic base theme with a layer of perfection and elegance on top.** Minimal first; the craft is in spacing, type, geometry, states and motion, not in decoration.
2. **Remove the tinted-glass option.** Materials become `solid` and `glass` (frosted), each in light and dark. The V3 brief asked to improve tint; the owner has since decided against it, so it is deleted from the API, tokens, docs and tests rather than hidden.
3. Everything else in the V3 brief stands: framework before docs, honest status, no squircles, circular icon controls, no global beta pill, “Search components and guides”, no-op motion guard, visible disabled toggles, refined validation, image retry, Theme Studio, MotionLab, RTD flyout.

## 1. Baseline findings (live site, 2026-10-18)

| ID | Finding | Class | Evidence |
| --- | --- | --- | --- |
| B1 | Accent persimmon is used for links, TOC, eyebrows, sidebar selection, badges, buttons and chart lines at once; the page has no quiet baseline. | D | `v3-before/home-light.png`, `button-dark.png` |
| B2 | Solid buttons use a gradient + inner highlight + shadow; reads heavy against a minimal canvas. | D | `button-dark.png` |
| B3 | Demo stages use a dotted grid background and a “LIVE EXAMPLE” toolbar on every example: visual noise. | D | `button-dark.png`, `calendar-light.png` |
| B4 | `beta` pill beside every component title; search placeholder “Search the Orlo library”. | R | all component shots |
| B5 | Preferences is nine full-width segmented rows (theme, material, transparency, motion, spring, images, density, direction). | R | `preferences-open.png` |
| B6 | Home right side: six unrelated floating cards (buttons, switch, budget, knob+rating, calendar, images) with uneven heights. | R | `home-light.png` |
| B7 | Read the Docs “latest” flyout floats bottom-right over content. | E | all shots |
| B8 | Hero headline tracking is very tight (-0.045em); display type feels compressed. | D | `home-light.png` |
| B9 | Uppercase accent eyebrows (“ACTIONS”, “PICKERS”) + coloured TOC compete with the H1. | D | `calendar-light.png` |
| B10 | Tinted glass material exists in provider, tokens, docs prefs and Materials page. | Owner | source |
| B11 | Field errors prefixed with “! ”; error text styled bold red. | R | `TextField.tsx`, `TextArea.tsx`, `PinInput.tsx` |
| B12 | MotionLab “Race all six” replays every dot even when already at target (no-op guard missing). | R | `MotionLab.tsx` |
| B13 | Icon buttons are rounded squares; header theme switch is a pill; geometry mixes. | R | header |
| B14 | Avatars are initials only; no generated art. | N | `Avatar.tsx` |

## 2. Design direction — “Quiet precision”

**Keep:** the warm neutral palette, the persimmon accent hue, the type families, the glass appearance the owner likes, the motion engine, every component’s behaviour and API.

**Change:**

- **Colour restraint.** Neutrals carry the UI. Accent appears only for: primary action fill, selection/active indicator, focus ring partner, links inside prose. Navigation, TOC, eyebrows and secondary text become neutral. One accent moment per region.
- **Flat, exact surfaces.** Buttons and controls are flat fills (no gradients, no inner highlight). Depth comes from a 1 px hairline + a very soft, low shadow only where a surface floats (menus, dialogs, popovers, toasts). Cards at rest have no shadow; they lift on hover only when interactive.
- **Geometry.** Radius roles: `xs 4` (badges, keycaps), `sm 8` (chips, small controls, menu items), `md 10` (buttons, fields), `lg 14` (cards, menus, popovers), `xl 20` (dialogs, sheets), `full` (icon buttons, avatars, switches, pills). Icon-only buttons are **circles** with circular hover/press/focus. No `corner-shape`. Press = `scale(0.98)` + darker fill; radius never changes.
- **Typography.** Display tracking relaxed to −0.025em (hero −0.03em), weights 650/600 for headings, 1.6 body leading in docs prose, sentence-case section labels instead of uppercase eyebrows, tabular numerals in data.
- **Space.** 4 px grid, larger section rhythm (56–72 px between doc sections), 24–32 px inside stages, consistent 12 px label→control, 6 px control→message.
- **Focus.** One focus treatment everywhere: 2 px focus colour ring offset by 2 px from the control’s own edge (box-shadow ring for rounded controls so it follows the radius).
- **States.** Disabled = muted foreground + muted surface + border, never opacity < 0.6, never invisible. Hover only on fine pointers. Validation = thin error border + calm sentence, no glyph prefix, message area reserved.
- **Materials.** `solid` and `glass` only. Glass used for top bar, menus, popovers, dialogs, toasts, sheets. Readability guard (≥ 4.5:1 over worst-case backdrops) kept.
- **Motion.** Standard scheme stays quiet; expressive optional. No-op guard: animations never restart when already at target.

## 3. Framework work (Phase 1)

### M1 — Foundations
1. Tokens: neutral-first semantic roles (`fg`, `fg-muted`, `fg-subtle`, `canvas`, `surface`, `surface-raised`, `surface-sunken`, `border`, `border-strong`, `accent`, `accent-subtle`, `accent-text`), lighter shadow scale, radius roles above, type scale tracking update. Contrast tests extended for new roles.
2. Remove tinted material: `Material = "solid" | "glass"`; delete tint handling from `material.ts`, `provider.tsx`, styles, tests; keep `tint` prop out of the public API (breaking change noted in CHANGELOG).
3. Base stylesheet rewrite: flat buttons, circular icon buttons, focus ring, disabled tokens, hairline borders, remove squircle code, remove gradient/inner highlights, quieter skeleton.
4. Motion: `useNoopGuard`-style rule built into components (`useThumbMotion` already skips when equal; add epsilon check), MotionLab race fixed.

### M2 — Controls and forms
5. Button family (solid/tonal/subtle/ghost/danger) flat; AsyncButton keeps morph; ToggleButton/ToggleGroup disabled visible; SegmentedControl quieter track.
6. Fields: label/hint/message rhythm, calm error copy without “!”, success state optional, reserved message line with smooth height.
7. Switch/Checkbox/Radio/Slider polish (accent only when on/checked).
8. Badge redesign: subtle filled tag, dot variant, count variant; no outline+tint double.
9. Avatar: deterministic generated SVG art (`variant="marble" | "beam" | "initials"`), SSR-stable hash, photo failure → art.

### M3 — Surfaces and feedback
10. Card (flat at rest, interactive lift), Menu/Popover/Dialog/Toast glass with hairline and soft shadow; Tooltip neutral.
11. Calendar typography + selected circle + range strip; month change crossfade.
12. Image retry verified visibly; empty/failure copy calm.

## 4. Documentation work (Phase 2)

13. Header: “Search components and guides”, no count, no beta; circular icon buttons; theme control becomes a single circular button cycling Light → Dark → Auto with an animated icon and tooltip.
14. Preferences: compact panel, two groups (Appearance: theme + material; Motion & accessibility: motion, images, transparency) + “More” disclosure (density, direction, spring). Tinted removed.
15. Shell: neutral nav and TOC, accent only on active item marker; sentence-case section labels; remove repeated beta badges (maturity stays on the Code tab and the components index filter).
16. Component pages: plain demo stage (no dotted grid, no toolbar by default; preview mode moved to a small menu), more whitespace.
17. Home: left column kept (tightened); right side recomposed as **one coherent mini application** (a settings panel: profile row with generated avatar, two switches, a slider, a segmented control, a primary action) on a single glass/solid surface.
18. Materials page: solid vs glass only.
19. Theme Studio: rebuild as a workshop — controls column (appearance, material, accent, density, motion) + scene picker (Settings, Dashboard, Calendar, Feedback) + export.
20. RTD flyout: integrate version info into Orlo’s footer and request flyout position via the documented addons configuration where supported; document the limitation if it can’t be disabled from the repository.

## 5. Verification (Phase 3)

- Unit tests for tokens (new roles), material without tint, avatar determinism, no-op guard.
- Playwright: existing suite + header copy, preferences, disabled toggle visibility (computed opacity ≥ 0.6), validation copy, MotionLab no-op, avatar SSR match, hydration sweep, a11y matrix.
- Before/after screenshots in `docs/media/v3-after/` matching `docs/media/v3-before/`.
- Status/README/CHANGELOG updated with real numbers from the manifest and build.
- No GitHub Release marked stable; a pre-release only if the owner asks and gates pass.

## 6. Commit batches

1. `docs(audit): v3 plan + baseline screenshots`
2. `design(tokens)!: quiet-precision tokens; remove tinted material`
3. `design(react): flat controls, circular icon buttons, focus, disabled, validation`
4. `feat(avatar): generated deterministic art`
5. `docs(shell): header, preferences, nav, stages, home showcase`
6. `docs(studio): theme studio workshop; materials; motionlab no-op`
7. `test: v3 assertions + after screenshots; docs status`

## 7. Owner-complaint traceability (initial)

| Complaint | Plan item | Status |
| --- | --- | --- |
| Look better; minimal + elegant | §2, M1–M3, docs 13–19 | in progress: tokens, controls, shell, home, studio done |
| Remove tint option | M1.2, docs 14, 18 | done (API, tokens, provider, docs, tests) |
| Beta badge / count in search | docs 13, 15 | done |
| Dense preferences | docs 14 | done (grouped + More) |
| Square hover beside circular theme switch | M1.3, docs 13 | done (circular icon buttons + cycle button) |
| Disabled toggle disappears | M2.5 | done (CSS + Playwright opacity check) |
| Ugly validation “!” | M2.6 | done |
| MotionLab reset/race replays unchanged | M1.4 | done |
| Right-side home showcase | docs 17 | done |
| Theme Studio too simple | docs 19 | done (workshop, 4 scenes) |
| RTD “latest” flyout | docs 20 | done; verified on the hosted site |
| Default initials avatars | M2.9 | done (marble default) |
