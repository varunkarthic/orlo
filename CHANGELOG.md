# Changelog

## Unreleased

### v3 "quiet precision" redesign (in progress, not released)
- **Breaking:** the tinted-glass material is removed. `Material` is now `"solid" | "glass"`; the `tint` provider prop and the `tintStrength` glass option are gone.
- **Breaking:** `Button variant="solid"` is now an ink (foreground) fill. The new `variant="accent"` is the brand-colour fill for a single brand moment per view.
- Tokens: neutral-first surfaces (`surface-sunken`, `surface-selected`, `fg-subtle`), lighter shadows, `radius.sm` 8px, relaxed display tracking. New contrast tests cover the new roles.
- Controls: flat fills without gradients, circular icon buttons, one focus ring, press = scale(0.98) without radius change, disabled states that stay visible (never faded out), quieter skeleton.
- Forms: validation messages use a small status icon instead of a "!" prefix.
- Badge: `dot` and `count` / `max`. Avatar: deterministic generated art (`variant="marble" | "geometric" | "initials"`) that is identical on server and client.
- Fixes: the checkbox box no longer intercepts pointer events; buttons use system colours in forced-colours mode; select placeholder meets 4.5:1; empty tab panels add no padding; the slider thumb skips no-op animations.
- Docs: "Search components and guides", a circular theme button cycling Light → Dark → Auto, compact grouped Preferences with a More section, neutral navigation and TOC, no beta badges on titles, plain demo stages, a single coherent settings app on the home page, Materials (solid vs glass), a Theme Studio workshop with four scenes, and a MotionLab race that only moves dots not already at their target.
- Brand: adopted the supplied lowercase "orlo" logo as vectors, with transparent variants, favicons (SVG, ICO, PNG), PWA icons and a social card.
- Components: 91 in-house components across 11 families, including pickers (Calendar, DatePicker, TimeField, ColorPicker, FileDropzone) and specialty components (Knob, HoldToConfirm, SignaturePad, ShortcutRecorder, ReorderableList, Heatmap, JsonTree, DiffViewer, CodeBlock, Countdown, Marquee).
- Primitives: collision-aware positioning, a layer stack, focus scopes, reference-counted scroll lock and inert backgrounds.
- Tokens: `createTheme` / `themeToCss` produce AA-compliant accent roles from any colour; identity tints are tokenised.
- Docs: a Material-style information architecture with five tabs per component (490 prerendered routes), Theme Studio, MotionLab, Details Lab, State Lab, ⌘K search, `components.json` and `llms.txt`.
- Testing: Vitest (112 tests) and Playwright with axe (40 browser tests) in CI.
- Removed: CONTRIBUTING, CODE_OF_CONDUCT and SECURITY (the project doesn't accept contributions).
