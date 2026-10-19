# Orlo design rules

Short and normative. Agents and people building with Orlo follow these.

## Principles
1. Every transition has a reason (hierarchy, cause, destination, continuity), or it doesn't happen.
2. Inspect entry, midpoint, exit, interruption and failure, not just the final frame.
3. Content stays in control: no clipped glyphs, lost focus or inoperable controls for the sake of an effect.
4. Quiet by default. Overshoot over 5% needs a written reason.
5. Touch, pointer, pen, keyboard and screen reader each get a complete path. Never assume hover.

## Tokens
- Use semantic tokens (`--orlo-color-fg`, `--orlo-color-accent`, `--orlo-space-4`, `--orlo-radius-md`), never ramp steps or raw hex.
- Use the radii as follows: sm for badges and chips, md for controls, lg for cards and menus, xl for dialogs and sheets.
- The z-index scale is `--orlo-layer-*` only.

## Motion
- Use the presets: press, focus, reveal, dismiss, expand, shift, shared, overlay, page, drag, success, error, loading, stagger.
- Under reduced motion, travel becomes a fade. Under `off`, changes are instant. Never override the OS setting silently.
- Animate transform and opacity. Interruptions redirect; they never restart.

## Spacing, rhythm and layout
- Ground all spatial layout in an 8pt primary grid with a 4pt subgrid. Use tokens `--orlo-space-*`, never random pixel values.
- Respect spatial hierarchy and Gestalt proximity:
  - Intra-control: 4–8px (`--orlo-space-1`, `--orlo-space-2`) between glyphs, badges, and text.
  - Inter-control: 8–12px (`--orlo-gap-control`) between buttons, chips, and toolbar items.
  - Field-to-field: 20–24px (`--orlo-space-6`) for vertical form flow.
  - Card & panel padding: 16–24px (`--orlo-gap-card`, `--orlo-gap-panel`).
  - Section breaks: 48–72px (`--orlo-space-12`, `--orlo-space-16`).
- Tab bars & segmented navigation (Apple HIG & Material 3):
  - Segmented pill tabs enforce 4px container inset (`--orlo-inset-tab`) and 4px tab gap (`--orlo-gap-tab`).
  - Panels must sit at least 24px (`--orlo-space-6`) clear of the tab navigation.
  - Target sizing: ≥ 44×44pt on touch interfaces per Apple HIG / WCAG 2.5.5; 32–40px on fine pointers.
- Hover styles go only under `(hover: hover) and (pointer: fine)`.
- Prefer container queries over viewport breakpoints for components. Use logical properties so RTL works.
- Overlays dock to a bottom sheet on narrow screens without remounting.

## States
- Loading keeps geometry and focus. Don't flash a spinner for operations that finish almost instantly.
- Errors sit near their cause, use calm words, and say what happened, what is safe and what to do next. Never shake.
- Empty states explain what will appear and offer the next step.
- Images reserve space, decode before they appear, retry a bounded number of times, and support `images="off"`.

## Anti-patterns
- Colour as the only signal. Placeholder text as the label. Tooltips with interactive content.
- Hardcoded durations or easings. Purposeless bounce. Scroll-jacking. Autoplay without pause.
- Confirmshaming, fake urgency, forced consent.
