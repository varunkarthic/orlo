# Navigation & Hierarchy Guidelines

_Orlo Human Interface Guidelines — Structural Architecture, Segmented Tabs & Modal Layers_

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

## 2. Segmented Pill Tab Bars (Apple HIG)

For switching between parallel, co-equal views (such as the Overview, API, Styles, and Code tabs of a component), Orlo utilizes floating segmented pill controls:

- **Geometry:** A continuous pill track (`border-radius: var(--orlo-radius-full)`) containing an inset active pill indicator.
- **Active State:** The selected tab displays an opaque background (`--orlo-color-surface`), subtle elevation drop-shadow (`0 1px 3px rgba(0,0,0,0.08)`), and bold/semibold typography.
- **Inactive State:** Unselected tabs display muted foreground text (`--orlo-color-fg-muted`) with subtle hover highlight.
- **Deep Linking:** Every tab in documentation corresponds to an actual prerendered URL route (e.g., `/components/button/api/`), ensuring that refreshing or sharing a link opens the exact requested tab.

---

## 3. Modal Dialogs, Sheets & Popovers

Layered navigation must match the urgency and scope of the task:

| Surface Pattern | Modal? | Dismissal Behaviour | Primary Use Case |
|---|---|---|---|
| **Modal Dialog** | Yes (focus trapped, inert background) | `Escape`, Cancel button, Scrim click (if non-critical) | Destructive action confirmation, critical alerts, high-stakes decisions |
| **Sliding Sheet / Drawer**| Contextual | `Escape`, swipe gesture, outside tap | Mobile navigation menus, complex filter drawers, inspector sidebars |
| **Popover** | No | Outside click, `Escape`, trigger toggle | Contextual menu actions, color pickers, date picker calendars |
| **Command Palette (`⌘K`)** | Yes | `Escape`, selecting an item | Global spotlight search, quick-action runner, recent history jump |

---

## 4. Spotlight Command Palette (`⌘K`)

The command palette provides high-velocity keyboard navigation across the entire application:

- **Trigger:** Accessible via global hotkey (`⌘K` on macOS, `Ctrl+K` on Windows/Linux) or a persistent search pill button in the top navigation bar.
- **Instant Filtering:** Real-time fuzzy filtering over components, guideline pages, foundations, and external links.
- **Focus Hand-Off:** Opening the palette immediately focuses the search input. Up/Down arrow keys highlight results; `Enter` executes the navigation.
- **Visual Presentation:** Floats centrally over a frosted glass backdrop scrim with Apple HIG rounded corners (`var(--orlo-radius-xl, 20px)`).

---

## 5. Comparative Do's and Don'ts

| Do | Don't |
|---|---|
| Provide a persistent, visible navigation bar with clear active indicator highlights. | Hide top-level navigation behind obscure, multi-layered burger menus on desktop. |
| Use modal dialogs sparingly for disruptive, high-consequence tasks. | Interrupt users with modal dialogs for routine, non-critical status updates. |
| Support `Escape` and outside click dismissal on all floating popovers and drawers. | Trap users in an overlay without an obvious, immediate escape hatch. |
| Ensure deep-linkable URLs for every top-level tab and view state. | Trap state in ephemeral React local state that resets when the page refreshes. |
| Position primary action triggers predictably (e.g. top-right or bottom-end of sheets). | Randomly scatter action buttons across disparate corners of the viewport. |
