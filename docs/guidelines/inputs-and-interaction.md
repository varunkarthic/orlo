# Inputs & Interaction Guidelines

_Orlo Design Guidelines – Direct Manipulation, Pointer Ergonomics & Focus Rings_

---

## 1. Interaction Philosophy

Interaction in Orlo is grounded in **direct manipulation, immediate tactile feedback, and ergonomic input handling.**

In Orlo: **controls should behave predictably, acknowledge user intent instantly, and gracefully adapt between high-precision desktop pointers and natural finger touch gestures.**

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   INTERACTION PRINCIPLES:                                              │
│                                                                        │
│   1. IMMEDIATE ACKNOWLEDGEMENT                                         │
│      Every click, tap, or keystroke produces instant tactile feedback │
│      (tactile squash: scale 0.98, focus ring, or active highlight).   │
│                                                                        │
│   2. DUAL POINTER ERGONOMICS                                           │
│      Fine desktop pointers enjoy hover elevation; touch devices receive│
│      generous 44×44pt hitboxes with zero reliance on hover cues.       │
│                                                                        │
│   3. REVERSIBLE ACTIONS                                                │
│      Destructive actions require confirmation; modal interactions can  │
│      always be cancelled cleanly with Escape or an outside dismiss.    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dual Pointer Architecture: Fine vs. Coarse

Modern web applications run on everything from high-precision desktop trackpads to smartphones and tablets. Orlo styles interactions using CSS Media Queries Level 4 interaction features:

### Fine Pointers (`@media (hover: hover) and (pointer: fine)`)
- **Applies to:** Mouse, trackpad, digital stylus.
- **Affordances:**
  - Micro-elevations on hover: `transform: translateY(-2px);` with `box-shadow: var(--orlo-shadow-2)`.
  - Compact control heights: `32px` to `40px` (`var(--orlo-control-h)`).
  - Contextual tooltips on deliberate mouse dwell.

### Coarse Pointers (`@media (pointer: coarse)`)
- **Applies to:** Touchscreens (smartphones, tablets, kiosk displays).
- **Affordances:**
  - Mandatory **44 × 44 pt** minimum tap target dimensions.
  - **Zero reliance on hover:** Critical information and actions are never hidden behind hover states.
  - Tooltips open via explicit tap and dismiss automatically upon outside touch.

---

## 3. Focus Ring Architecture

Focus indicators are vital for keyboard users, switch controllers, and accessibility navigators. In Orlo, focus rings are prominent, aesthetically refined, and non-intrusive for mouse users:

```css
/* Orlo Accessible Dual-Layer Focus Ring */
.orlo-control:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--orlo-color-canvas),
              0 0 0 4px var(--orlo-color-accent);
}
```

- **`:focus-visible` Only:** The focus ring appears exclusively when navigated via keyboard (`Tab`, `Arrow` keys) or assistive hardware. Clicking with a mouse or tapping with a finger activates the control without leaving an unwanted persistent focus ring.
- **Dual-Layer Gap:** The inner 2px shadow matches `--orlo-color-canvas`, creating an optical gap that ensures the outer 2px accent ring is clearly legible against both dark and light surrounding surfaces.

---

## 4. Form Control Ergonomics & States

Form controls in Orlo are designed to reduce cognitive friction and input errors:

### Standard States
1. **Resting:** Clear border (`--orlo-color-border-control`), legible placeholder text, clean background.
2. **Hover:** Border darkens subtly (`--orlo-color-fg-muted`) on fine pointer hover.
3. **Focus:** Dual-layer focus ring (`var(--orlo-ring)`) highlights active input.
4. **Active / Pressed:** Immediate tactile compression (`scale(0.98)`).
5. **Invalid / Error:** Red border (`--orlo-color-error`), paired with an inline error message and icon directly beneath the field.
6. **Disabled:** Explicit muted foreground and border tokens. **Never use raw opacity (such as `opacity: 0.4`)**, which washes out into glass backgrounds and violates WCAG contrast guidelines.

---

## 5. Comparative Do's and Don'ts

| Do | Don't |
|---|---|
| Use `@media (hover: hover) and (pointer: fine)` to isolate hover elevations. | Apply hover styles globally, causing sticky hover artifacts on touch screens. |
| Provide immediate tactile squash (`scale(0.97)`) on button and control press. | Leave buttons unresponsive to pointer-down events. |
| Use `:focus-visible` to render crisp focus rings for keyboard navigators. | Remove focus outlines with `outline: none;` without providing a replacement. |
| Ensure disabled controls retain sufficient contrast to remain legible. | Fade disabled controls to near-invisible opacity (`opacity: 0.3`). |
| Support standard keyboard shortcuts (`Enter` to submit, `Escape` to cancel). | Hijack or disable standard browser navigation keys. |
