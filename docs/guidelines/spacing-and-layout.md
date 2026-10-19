# Spacing, Rhythm and Layout Guidelines

_Orlo Design System Normative Specification — Aligned with Apple Human Interface Guidelines and Google Material Design 3._

---

## 1. Spatial Philosophy

Orlo treats space as a first-class design material. Meaning, functional relationships, and cognitive hierarchy are communicated through physical proximity before text is read.

1. **The 8pt Primary Grid:** All macro-layout dimensions, gutters, container padding, and sectional intervals align to an 8pt spatial grid (`8px`, `16px`, `24px`, `32px`, `40px`, `48px`, `64px`).
2. **The 4pt Subgrid:** Micro-interactions, dense data tables, optical icon centering, borders, and segmented control track insets align to a 4pt subgrid (`4px`, `12px`, `20px`).
3. **Gestalt Proximity:** Functional proximity dictates physical distance. Related elements sit tightly together; conceptual breaks demand generous clearance.
4. **No Arbitrary Values:** Every spacing declaration must resolve to an Orlo token (`--orlo-space-*` or semantic `--orlo-gap-*`), ensuring predictable scaling across screen densities.

---

## 2. Token Scale & Mappings

| Token | Pixels | Subgrid | Primary Purpose | Examples |
|---|---|---|---|---|
| `--orlo-space-0` | `0px` | - | Reset / flush alignment | Flush sheet headers, edge dividers |
| `--orlo-space-1` | `4px` | 4pt | Micro-spacing, segmented insets | Badge inner padding, icon-to-label gap in buttons, segmented control track inset (`--orlo-inset-tab`) |
| `--orlo-space-2` | `8px` | 8pt | Intra-component rhythm | Icon button padding, chip gaps, table cell vertical padding, button group gap (`--orlo-gap-control`) |
| `--orlo-space-3` | `12px` | 4pt | Compact stacks & helper margins | Form label-to-input gap, compact card insets, list item vertical padding |
| `--orlo-space-4` | `16px` | 8pt | Standard component rhythm | Card padding (`--orlo-gap-card`), modal content clearance, standard button horizontal padding |
| `--orlo-space-5` | `20px` | 4pt | Relaxed component padding | Metric tile padding, relaxed list group gaps |
| `--orlo-space-6` | `24px` | 8pt | Field flow & panel clearance | Vertical gap between consecutive form fields, tab panel top clearance, dialog body padding |
| `--orlo-space-8` | `32px` | 8pt | Group & card grid rhythm | Form fieldset divisions, card-to-card grid gutters, modal container padding (`--orlo-gap-panel`) |
| `--orlo-space-10` | `40px` | 8pt | Page subheader clearance | Distance below page hero titles, intermediate section divides on tablets |
| `--orlo-space-12` | `48px` | 8pt | Sectional divisions | Distance between major thematic sections on desktop screens |
| `--orlo-space-16` | `64px` | 8pt | Major landmark clearance | Page header to main landmark clearance, footer separation |

---

## 3. Spatial Hierarchy & Rhythm

Spatial hierarchy enforces visual calm and rapid scanning:

### A. Intra-Component Level (4px – 8px)
- **Token:** `--orlo-space-1` (4px), `--orlo-space-2` (8px).
- **Rule:** Never exceed 8px between an icon and its text label, or between a status dot and its label.
- **Example:** In a `Button`, the glyph and text are separated by `--orlo-space-2` (8px). In `StatusDot`, `--orlo-space-2` separates the indicator and caption.

### B. Inter-Component & Control Clusters (8px – 12px)
- **Token:** `--orlo-gap-control` (8px), `--orlo-space-3` (12px).
- **Rule:** Actions operating on the same object (e.g. "Save", "Cancel") or filter chips in a single bar sit 8px apart.
- **Example:** Filter chip lists use `gap: var(--orlo-gap-control)`.

### C. Field-to-Field Flow (20px – 24px)
- **Token:** `--orlo-space-6` (24px).
- **Rule:** In form designs, the vertical space between consecutive field controls must be 20px–24px. Helper text or validation errors must sit within 4px–6px of the input, clearly grouped with their field.

### D. Containers, Cards & Panels (16px – 32px)
- **Token:** `--orlo-gap-card` (16px), `--orlo-gap-panel` (24px), `--orlo-space-8` (32px).
- **Rule:** Cards use 16px internal padding on mobile, expanding to 24px on desktop. Dialogs and sheets use 24px to 32px padding.

### E. Section-to-Section Rhythm (48px – 72px)
- **Token:** `--orlo-space-12` (48px) to `--orlo-space-16` (64px).
- **Rule:** Landmark divisions and major content bands must provide generous breathing room to mark topic changes.

---

## 4. Tab Bars & Segmented Navigation (Apple HIG & Material 3)

Tabs represent top-level content switching and must follow strict geometric guidelines:

### Segmented Pill Tabs (Apple HIG Style)
- **Container Geometry:** Rounded pill track (`border-radius: var(--orlo-radius-full)`), frosted glass surface (`backdrop-filter: blur(20px)`), with an internal inset of exactly `4px` (`--orlo-inset-tab`).
- **Inter-Tab Gap:** `4px` (`--orlo-gap-tab`).
- **Tab Padding:** `0 16px` (`--orlo-space-4`) horizontal padding, height `34px` (pointer) to `44px` (touch).
- **Active Pill Indicator:** Full pill border-radius with solid surface fill and subtle elevation shadow (`0 1px 3px rgba(0,0,0,0.08)`).
- **Panel Clearance:** Content panels sit at least `24px` (`--orlo-space-6`) below the segmented control track.

### Line Tabs (Material 3 Style)
- **Indicator:** Continuous bottom border (`1px solid var(--orlo-color-border)`) with a 2px–3px active accent bar (`--orlo-color-accent`) aligned to the active tab.
- **Inter-Tab Gap:** At least `8px` (`--orlo-space-2`).
- **Tab Padding:** `8px 16px` minimum.
- **Panel Clearance:** Content panel sits `24px` below the indicator line.

### Touch Affordance & Tap Targets
- **Mobile / Touch Coarse Pointers:** Interactive tab buttons and controls must enforce a minimum target size of **44 × 44 pt** per Apple Human Interface Guidelines and WCAG 2.5.5 Target Size.
- **Fine Pointers (Mouse / Trackpad):** Control height comfortably settles between **32px and 40px** with generous hit-testing padding.

---

## 5. Do's and Don'ts

| Do | Don't |
|---|---|
| Ground every layout in 8pt/4pt tokens (`--orlo-space-*`). | Scatter hardcoded pixel margins (e.g. `margin-top: 13px`). |
| Group related fields tightly (8px) and separate fieldsets generously (32px). | Use uniform spacing across all elements regardless of conceptual relationship. |
| Provide at least 24px clearance between navigation tabs and tab content. | Allow content to crowd the bottom edge of a tab bar. |
| Maintain minimum 44×44pt tap targets on touch devices. | Squeeze touch targets below 32px on mobile viewports. |
| Use logical properties (`padding-inline`, `margin-block-start`) for automatic RTL support. | Hardcode `margin-left` or `padding-right` that break in right-to-left scripts. |
