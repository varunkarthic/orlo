# Spacing, Rhythm & Layout Guidelines

_Orlo Human Interface Guidelines — Normative Spatial Specification_

---

## 1. Spatial Philosophy

Space is not emptiness; in Orlo, space is an active design material. Proximity and visual rhythm communicate cognitive relationships, grouping, and hierarchy before a single word is read.

Following Apple's Human Interface Guidelines and Google's Material 3 specifications:

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   GESTALT PROXIMITY RULE:                                              │
│   Distance is inversely proportional to functional relationship.       │
│                                                                        │
│   [Icon] 8px [Label]   <-- Related elements form a cohesive unit       │
│                                                                        │
│   [Form Field A]                                                       │
│   │ 24px                                                               │
│   ▼                                                                    │
│   [Form Field B]       <-- Distinct conceptual steps have breathing    │
│                            room to prevent cognitive overload.         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **The 8pt Macro-Grid:** All structural containers, card grids, section intervals, page margins, and dialog bounds snap to multiples of **8px** (`8`, `16`, `24`, `32`, `40`, `48`, `64px`).
2. **The 4pt Micro-Subgrid:** Fine-grained alignment—such as segmented pill tab insets, optical icon alignment, badge paddings, and control borders—snaps to a **4px** subgrid (`4`, `12`, `20px`).
3. **No Arbitrary Numbers:** All layout rules MUST reference an Orlo token (`var(--orlo-space-*)` or semantic `--orlo-gap-*`). Ad-hoc values like `margin-top: 13px` are strictly prohibited.
4. **Logical Properties for Internationalization:** All directional spacing uses CSS logical properties (`margin-block`, `margin-inline`, `padding-block`, `padding-inline`) to ensure automatic, seamless adaptation across left-to-right (LTR) and right-to-left (RTL) locales.

---

## 2. Token Scale & System Mappings

Every token in [`packages/tokens/src/tokens.ts`](file:///Users/varun/Library/CloudStorage/OneDrive-Personal/orlo/packages/tokens/src/tokens.ts) is mapped to its exact physical dimension and intended layout context:

| Token | Dimension | Grid Tier | Semantic Purpose | Typical Usage |
|---|---|---|---|---|
| `--orlo-space-0` | `0px` | Reset | Edge flush alignment | Flush sheet headers, edge dividers |
| `--orlo-space-1` | `4px` | 4pt Subgrid | Micro-clearance, track insets | Segmented tab track inset (`--orlo-inset-tab`), badge padding, status dot gap |
| `--orlo-space-2` | `8px` | 8pt Macro-grid | Intra-component rhythm | Icon-to-text gap in Button, chip list gap (`--orlo-gap-control`), vertical table cell padding |
| `--orlo-space-3` | `12px` | 4pt Subgrid | Compact stacks & helper margins | Form label-to-input gap, compact card insets, list item vertical padding |
| `--orlo-space-4` | `16px` | 8pt Macro-grid | Standard component padding | Card internal padding (`--orlo-gap-card`), modal content clearance, standard button padding |
| `--orlo-space-5` | `20px` | 4pt Subgrid | Relaxed component spacing | Metric tile internal insets, relaxed list item gaps |
| `--orlo-space-6` | `24px` | 8pt Macro-grid | Field flow & panel clearance | Distance between consecutive form fields, dialog body padding, panel clearance |
| `--orlo-space-8` | `32px` | 8pt Macro-grid | Container & card grid rhythm | Form fieldset divisions, card grid gutters, modal container padding (`--orlo-gap-panel`) |
| `--orlo-space-10` | `40px` | 8pt Macro-grid | Subheader clearance | Distance below page hero titles, intermediate section divides on tablets |
| `--orlo-space-12` | `48px` | 8pt Macro-grid | Sectional divisions | Distance between major thematic sections on desktop screens |
| `--orlo-space-16` | `64px` | 8pt Macro-grid | Landmark divisions | Distance between page header and main landmark, major footer clearance |

---

## 3. Spatial Hierarchy & Rhythm

Consistent rhythm creates visual calm and allows users to scan complex interfaces effortlessly:

### A. Intra-Component Level (4px – 8px)
- **Tokens:** `--orlo-space-1` (4px), `--orlo-space-2` (8px).
- **Rule:** Elements that form a single atomic control must never be separated by more than 8px.
- **Example:** In a `Button`, the leading icon and text label sit exactly 8px apart. In a `StatusDot`, the indicator circle and descriptive status text sit 8px apart.

### B. Inter-Component & Control Clusters (8px – 12px)
- **Tokens:** `--orlo-gap-control` (8px), `--orlo-space-3` (12px).
- **Rule:** Controls that act upon the same target entity (e.g., "Submit" and "Cancel" buttons, or a filter chip bar) sit 8px apart.
- **Example:** Button groups use `display: flex; gap: var(--orlo-gap-control)`.

### C. Form Field-to-Field Flow (20px – 24px)
- **Token:** `--orlo-space-6` (24px).
- **Rule:** In forms, vertical clearance between distinct fields must be 20px–24px. Field labels, helper descriptions, and validation error messages must sit within 4px–6px of the input, visibly bound to their respective input.

### D. Containers, Cards & Panels (16px – 32px)
- **Tokens:** `--orlo-gap-card` (16px), `--orlo-gap-panel` (24px), `--orlo-space-8` (32px).
- **Rule:** Cards use 16px internal padding on compact mobile screens, expanding to 24px on desktop. Modal dialogs and sliding sheets use 24px to 32px padding.

### E. Section-to-Section Rhythm (48px – 64px)
- **Tokens:** `--orlo-space-12` (48px), `--orlo-space-16` (64px).
- **Rule:** Major content bands and thematic topic changes require generous vertical separation to give the user cognitive breathing room.

---

## 4. Segmented Navigation & Floating Pill Tabs (Apple HIG)

Segmented tab controls provide primary view-switching and must adhere to exact geometric parameters:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Track: border-radius: 9999px; padding: 4px; backdrop-filter: blur()   │
│  ┌───────────────────┐ 4px ┌───────────────────┐                      │
│  │  [ Overview ]     │     │    Components     │                      │
│  │  Active White     │     │    Muted Text     │                      │
│  │  Pill Indicator   │     │                   │                      │
│  └───────────────────┘     └───────────────────┘                      │
└────────────────────────────────────────────────────────────────────────┘
```

- **Track Geometry:** Enclosed in a continuous rounded pill track (`border-radius: var(--orlo-radius-full)`), frosted glass surface (`backdrop-filter: blur(20px) saturate(180%)`), with an inner inset of exactly `4px` (`--orlo-inset-tab`).
- **Inter-Tab Gap:** `4px` (`--orlo-gap-tab`).
- **Tab Dimensions:** Horizontal padding `16px` (`--orlo-space-4`), control height `34px` on pointer devices, scaling to `44px` on touch screens.
- **Active Pill Indicator:** Full pill border-radius with solid surface fill, subtle elevation shadow, and smooth spring physics upon tab transition.
- **Content Clearance:** Associated content panels must sit at least `24px` (`--orlo-space-6`) below the segmented control track.

---

## 5. Touch Affordance & Tap Target Sizing

Touch interactions are inherently less precise than pointer cursors. Orlo strictly enforces Apple HIG touch target guidelines:

- **Touch Viewports (`@media (pointer: coarse)`):** Every interactive button, tab, checkbox, toggle, and icon trigger MUST provide a minimum hit-testing dimension of **44 × 44 pt** (CSS px) per Apple HIG and WCAG 2.5.5 Target Size.
- **Fine Pointers (`@media (pointer: fine)`):** On desktop viewports with mice or trackpads, compact control heights between **32px and 40px** are permitted, backed by generous bounding box margins.
- **Target Separation:** Adjacent touch targets must maintain at least **8px** clearance to prevent accidental touches.

---

## 6. Safe Areas & Responsive Adaptation

Orlo layouts adapt seamlessly across diverse display configurations:

- **Safe Area Insets:** Fixed headers, floating toolbars, and bottom action bars incorporate CSS environment variables:
  ```css
  padding-block-start: max(var(--orlo-space-4), env(safe-area-inset-top));
  padding-block-end: max(var(--orlo-space-4), env(safe-area-inset-bottom));
  padding-inline-start: max(var(--orlo-space-4), env(safe-area-inset-left));
  padding-inline-end: max(var(--orlo-space-4), env(safe-area-inset-right));
  ```
- **Zoom & Viewport Tolerance:** All components are defensively styled to prevent horizontal page scrolling down to **320 CSS px** at **400% zoom** (WCAG 1.4.10 Reflow).

---

## 7. Comparative Do's and Don'ts

| Do | Don't |
|---|---|
| Ground every layout dimension in 8pt/4pt tokens (`var(--orlo-space-*)`). | Scatter ad-hoc hardcoded pixel numbers (e.g. `margin: 17px;`). |
| Group related fields tightly (8px) and separate distinct fieldsets generously (32px). | Apply uniform spacing across all elements regardless of their conceptual relationship. |
| Maintain at least 24px clearance between navigation tab bars and content panels. | Allow tab content to crowd directly against the bottom edge of a tab bar. |
| Enforce minimum 44×44pt tap targets on touch devices. | Compress touch targets below 32px on mobile viewports. |
| Use logical properties (`padding-inline`, `margin-block`) for automatic RTL support. | Hardcode directional properties (`margin-left`, `padding-right`) that break in RTL scripts. |
| Align micro-adjustments and icon insets to the 4pt subgrid. | Break the spatial rhythm with arbitrary fractional padding. |
