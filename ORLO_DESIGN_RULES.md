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

## Input and layout
- Hover styles go only under `(hover: hover) and (pointer: fine)`. Touch targets are at least 24 px, and 44 px in touch density.
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
