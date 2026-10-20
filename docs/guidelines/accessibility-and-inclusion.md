# Accessibility & Inclusion Guidelines

_Orlo Design Guidelines – Universal Design, Assistive Technologies & WCAG 2.2 AA_

---

## 1. Accessibility Philosophy

In Orlo, accessibility is not a compliance checklist or an afterthought – it is the foundational architecture of the library: **great design is inclusive design; software should empower everyone, regardless of physical, sensory, or cognitive differences.**

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   FOUR PILLARS OF UNIVERSAL DESIGN (POUR):                             │
│                                                                        │
│   1. PERCEIVABLE     High contrast, redundant status indicators,       │
│                      and scalable dynamic typography.                  │
│                                                                        │
│   2. OPERABLE        Full keyboard control, focus trapping, and        │
│                      minimum 44×44pt touch hitboxes.                   │
│                                                                        │
│   3. UNDERSTANDABLE  Clear error messages, predictable navigation,      │
│                      and coherent tab and heading hierarchies.         │
│                                                                        │
│   4. ROBUST          Built upon semantic HTML5, verified with          │
│                      axe-core, and validated with screen readers.      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Focus Orchestration & Primitives

Orlo manages modal interactions, popovers, and layered surfaces using dedicated internal primitives:

- **`useFocusScope`:** Traps keyboard focus within active modal dialogs, drawers, and full-screen sheets. When the surface opens, focus moves automatically to the first interactive element or designated autofocus target. Upon dismissal, focus returns precisely to the trigger button that launched it.
- **`useDismiss`:** Enables frictionless dismissal via the `Escape` key or clicks outside the active surface container.
- **`useScrollLock`:** Locks background page scrolling while a modal dialog or drawer is visible, preventing disorienting background scroll jumps.
- **`useInertOutside`:** Applies the HTML `inert` attribute to all background sibling nodes outside the active modal container, ensuring screen readers (VoiceOver, NVDA, TalkBack) cannot escape into background content.
- **`Portal`:** Renders floating overlays directly into `document.body` or a designated root container after client hydration, ensuring predictable z-index stacking and eliminating clipping by parent overflow containers.

---

## 3. Touch Affordance & Tap Target Sizing

Accessible touch interfaces must accommodate natural finger pads:

- **44 × 44 pt Minimum Target:** Every interactive control (including checkboxes, radio inputs, switch thumbs, pagination pills, and icon buttons) must provide an effective hit-testing boundary of at least **44 × 44 CSS pixels** on touch viewports (`@media (pointer: coarse)`).
- **Hit-Box Expansion:** For small visual indicators (such as a 16px checkbox or 20px status dot), the touch target is invisibly expanded using pseudo-elements (`::before` / `::after` with negative margins) to satisfy the 44px hitbox requirement without altering visual aesthetics.
- **Adjacent Clearance:** Interactive touch elements must maintain at least **8px** of separation to prevent accidental adjacent activation.

---

## 4. Keyboard Navigation Contracts

Every interactive widget in Orlo is 100% operable via keyboard alone:

| Component Type | Standard Keyboard Model | Navigation Keys | Action Keys |
|---|---|---|---|
| **Buttons & Toggles** | Single Tab stop | `Tab` / `Shift+Tab` | `Enter` or `Space` to activate |
| **Segmented Tabs** | Roving `tabindex="0"` | `ArrowLeft` / `ArrowRight` (auto-activates) | `Home` (first), `End` (last) |
| **Dropdown Menus** | Roving `tabindex="0"` | `ArrowDown` / `ArrowUp` | `Enter` / `Space` to select, `Escape` to close |
| **Select & Combobox** | Listbox with active descendant | `ArrowDown` / `ArrowUp` | `Enter` to select, typing filters items |
| **Modal Dialogs** | Focus trapped scope | `Tab` cycles within dialog | `Escape` cancels and closes |
| **Sliders** | Continuous range thumb | `ArrowLeft` / `ArrowDown` (step down), `ArrowRight` / `ArrowUp` (step up) | `PageUp` / `PageDown` (large jump) |
| **Tree Views** | Hierarchical roving index | `ArrowDown` / `ArrowUp` (vertical), `ArrowRight` (expand), `ArrowLeft` (collapse) | `Enter` to open node |

---

## 5. Screen Readers & Non-Visual Semantics

Visual design must always have an equivalent non-visual expression:

1. **Multi-Channel Status:** Status indicators (such as error alerts, offline banners, and success confirmation toasts) never use color alone. They combine:
   - A semantic SVG icon with appropriate `aria-hidden="true"`.
   - Clear text copy describing the condition.
   - Screen reader announcements via `role="alert"` or `aria-live="polite"`.
2. **Form Labels & Error Associations:** Every input field is explicitly associated with its `<label>` via `htmlFor` / `id`, and connected to helper text and error messages using `aria-describedby` and `aria-errormessage`.
3. **Progress & Loading States:** Asynchronous buttons and loaders communicate progress via `aria-busy="true"` and informative `aria-live` region updates (e.g., "Uploading 45%...").

---

## 6. High Contrast & Forced Colors Mode

Orlo supports high-contrast viewing environments without visual breakdown:

- **Windows High Contrast Mode (Forced Colors):** Transparent borders and focus rings are declared using CSS system colors:
  ```css
  @media (forced-colors: active) {
    .orlo-button {
      border: 1px solid ButtonText;
    }
    .orlo-control:focus-visible {
      outline: 2px solid Highlight;
    }
  }
  ```
- **Focus Rings:** Orlo's `--orlo-ring` uses a dual-layer box-shadow (inner white gap + outer high-contrast accent ring) that remains vividly distinct on both dark and light surfaces.

---

## 7. Comparative Do's and Don'ts

| Do | Don't |
|---|---|
| Trap and return focus properly in all modal dialogs using `useFocusScope`. | Allow keyboard focus to slip into background content behind open modals. |
| Maintain a minimum 44×44pt tap target on all interactive controls for touch screens. | Create tiny 16px click targets that frustrate touch users. |
| Use `:focus-visible` to render crisp focus rings for keyboard users without cluttering mouse clicks. | Suppress focus outlines completely with `outline: none;` without replacement. |
| Pair every status color with a distinct icon glyph and explanatory text. | Indicate validation errors solely by turning an input border red. |
| Provide informative `aria-label` or `aria-labelledby` attributes for icon-only buttons. | Render icon buttons with empty accessible names (e.g. `<button><svg/></button>`). |
