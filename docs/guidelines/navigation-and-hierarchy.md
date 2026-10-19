# Navigation & Hierarchy Guidelines

_Orlo Human Interface Guidelines — Structural Architecture, Navigation Bars, Hover Physics & Modal Layers_

---

## 1. Navigation Philosophy

Navigation in Orlo is designed to **keep users oriented, minimize cognitive load, and provide predictable pathways between views.**

Following Apple's Human Interface Guidelines on Navigation: **an app’s structure should feel natural and effortless; users should always know where they are, how they got there, and how to return.**

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   THREE CORE NAVIGATION PARADIGMS:                                     │
│                                                                        │
│   1. HIERARCHICAL        Drill-down structures (Category -> Item).    │
│                          Always provide a clear return pathway.        │
│                                                                        │
│   2. FLAT / PARALLEL     Co-equal views switched via Apple HIG         │
│                          Segmented Pill Tabs or persistent Rails.      │
│                                                                        │
│   3. CONTENT-DRIVEN      Spotlight Command Palette (⌘K) and deep links │
│                          for rapid direct access to any destination.   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Top Navigation Bar (Global Header)

The top navigation bar provides the primary architectural orientation across the application. Grounded in Apple HIG translucent materials and Google Material 3 expressive physics, it anchors the page hierarchy while remaining visually unobtrusive.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] [HIG]    ╭─ (✦) Start  (▤) Foundations  (🎨) Styles  (▦) Components  (⌨) Develop ─╮   [🔍] [⚙] │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Anatomy & Surface Geometry
- **Translucent Backdrop:** The bar floats with `position: sticky; inset-block-start: 0;`, utilizing frosted acrylic materials (`backdrop-filter: blur(20px) saturate(180%)`) with `color-mix(in srgb, var(--orlo-color-canvas) 80%, transparent)`.
- **Capsule Navigation Track:** Desktop navigation links are housed inside a unified capsule container (`border-radius: var(--orlo-radius-full); background: color-mix(in srgb, var(--orlo-color-surface) 60%, transparent); border: 1px solid var(--orlo-color-border)`).
- **Interface Icons:** Every top-level destination is paired with a distinct 15–18px interface icon (`Compass`, `Layers`, `Palette`, `Grid`, `Code`, `Sparkles`) to enhance visual scanning and universal recognition.
- **Action Endcap:** Houses global utilities: Spotlight Command Palette search pill (`⌘K`), Theme mode cycle toggle, and the Preferences / Display Control Center popover.

---

## 3. Hover Animations & Selection Physics

Navigation links must feel responsive, tactile, and physically grounded. Rather than abrupt binary color snaps, Orlo employs damped harmonic micro-interactions:

### 3.1 Hover Micro-Interactions
- **Elevation Lift:** On pointer hover (`@media (hover: hover) and (pointer: fine)`), the target nav link elevates slightly (`transform: translateY(-1px)`) while fading in a subtle tint background (`color-mix(in srgb, var(--orlo-color-fg) 8%, transparent)`).
- **Icon Micro-Dynamics:** The associated icon subtly scales (`transform: scale(1.15)`) and rotates (`rotate(4deg)`), providing an immediate tactile cue that the element is reactive.
- **Physics Curve:** All hover transitions utilize Orlo's spatial spring bezier `cubic-bezier(0.34, 1.56, 0.64, 1)` with a fast duration (`var(--orlo-duration-spatial-fast)`).
- **Reduced Motion Safety:** Under `prefers-reduced-motion: reduce`, spatial transforms and rotations are disabled; the state change is conveyed strictly through instantaneous color contrast.

### 3.2 Active Selection Indicator
- **Solid Inset Pill:** The currently active route is highlighted by an opaque surface pill (`background: var(--orlo-color-surface)`), an inset border glow, and a subtle drop shadow (`0 1px 3px rgba(0, 0, 0, 0.08)`).
- **Typography Shift:** Active link text transitions to bold/semibold (`font-weight: 600`), and its icon illuminates with the system accent tone (`var(--orlo-color-accent-text)`).
- **Press State:** Pointer depression (`:active`) triggers a gentle scale down (`transform: scale(0.96)`), mimicking physical button travel.

---

## 4. Responsive Collapse & Mobile Sheet Handoff

When the viewport narrows below the primary breakpoint (`< 1100px`):
1. **Desktop Capsule Hide:** The inline capsule navigation track and GitHub icon button gracefully tuck away.
2. **Search Pill Compact:** The search bar collapses from an expansive text input into a compact 40×40pt circular icon button.
3. **Menu Trigger Reveal:** A high-contrast `IconButton` with `Icons.Menu` appears in the header.
4. **Sliding Sheet Navigation:** Tapping the menu button slides out a modal sheet (`<Sheet side="end">`). The navigation list inside (`.mnav`) retains full icon fidelity, ample touch targets (minimum 44×44pt), and clear `aria-current="true"` selected states.

---

## 5. Segmented Pill Tab Bars (Apple HIG)

For switching between parallel, co-equal views (such as the Overview, API, Styles, and Code tabs of a component), Orlo utilizes floating segmented pill controls:

- **Geometry:** A continuous pill track (`border-radius: var(--orlo-radius-full)`) containing an inset active pill indicator.
- **Active State:** The selected tab displays an opaque background (`--orlo-color-surface`), subtle elevation drop-shadow (`0 1px 3px rgba(0,0,0,0.08)`), and bold/semibold typography.
- **Inactive State:** Unselected tabs display muted foreground text (`--orlo-color-fg-muted`) with subtle hover highlight.
- **Deep Linking:** Every tab in documentation corresponds to an actual prerendered URL route (e.g., `/components/button/api/`), ensuring that refreshing or sharing a link opens the exact requested tab.

---

## 6. Modal Dialogs, Sheets & Popovers

Layered navigation must match the urgency and scope of the task:

| Surface Pattern | Modal? | Dismissal Behaviour | Primary Use Case |
|---|---|---|---|
| **Modal Dialog** | Yes (focus trapped, inert background) | `Escape`, Cancel button, Scrim click (if non-critical) | Destructive action confirmation, critical alerts, high-stakes decisions |
| **Sliding Sheet / Drawer**| Contextual | `Escape`, swipe gesture, outside tap | Mobile navigation menus, complex filter drawers, inspector sidebars |
| **Popover** | No | Outside click, `Escape`, trigger toggle | Contextual menu actions, color pickers, date picker calendars |
| **Command Palette (`⌘K`)** | Yes | `Escape`, selecting an item | Global spotlight search, quick-action runner, recent history jump |

---

## 7. Spotlight Command Palette (`⌘K`)

The command palette provides high-velocity keyboard navigation across the entire application:

- **Trigger:** Accessible via global hotkey (`⌘K` on macOS, `Ctrl+K` on Windows/Linux) or a persistent search pill button in the top navigation bar.
- **Instant Filtering:** Real-time fuzzy filtering over components, guideline pages, foundations, and external links.
- **Focus Hand-Off:** Opening the palette immediately focuses the search input. Up/Down arrow keys highlight results; `Enter` executes the navigation.
- **Visual Presentation:** Floats centrally over a frosted glass backdrop scrim with Apple HIG rounded corners (`var(--orlo-radius-xl, 20px)`).

---

## 8. Comparative Do's and Don'ts

| Do | Don't |
|---|---|
| Provide a persistent, visible navigation bar with clear active indicator highlights and semantic interface icons. | Hide top-level navigation behind obscure, multi-layered burger menus on desktop. |
| Use smooth, damped harmonic micro-animations on hover and active selection (`translateY(-1px)`, icon rotation). | Use linear or jarring, un-eased animations that feel jittery or distract from reading. |
| Honor `prefers-reduced-motion` by neutralizing all spatial transforms and rotations on navigation items. | Force continuous spinning or bouncy animations when the user has requested reduced motion. |
| Ensure minimum 44×44pt tap targets on mobile sheet items and navigation links. | Crowd navigation items together with zero finger clearance on touch screens. |
| Support `Escape` and outside click dismissal on all floating popovers and drawers. | Trap users in an overlay without an obvious, immediate escape hatch. |
| Ensure deep-linkable URLs for every top-level tab and view state. | Trap state in ephemeral React local state that resets when the page refreshes. |
| Use clear `aria-current="page"` (or `"true"`) on the currently selected navigation link. | Rely purely on subtle color shifts without accessible ARIA semantics for screen readers. |
