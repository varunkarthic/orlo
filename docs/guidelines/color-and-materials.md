# Color & Materials Guidelines

_Orlo Design Guidelines – Semantic Roles, Frosted Glass Vibrancy & Contrast_

---

## 1. Color & Materials Philosophy

In Orlo: **color imparts vitality, provides cognitive cues, and enhances navigation without distracting from content; materials provide physical depth, orientation, and context through realistic translucency.**

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   MATERIAL ELEVATION LAYERS:                                           │
│                                                                        │
│   Layer 4: OVERLAY (Dialogs, Sheets, Tooltips)                         │
│            Shadow-4, backdrop-filter: blur(24px)                       │
│                                                                        │
│   Layer 3: RAISED (Sticky Headers, Floating Capsule Tab Bars)          │
│            Shadow-2, backdrop-filter: blur(20px) saturate(180%)        │
│                                                                        │
│   Layer 2: SURFACE (Cards, Panels, Field Containers)                   │
│            Shadow-1, opaque surface token                              │
│                                                                        │
│   Layer 1: CANVAS (Window Background, Base Reading Surface)            │
│            Flat canvas token                                           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Semantic Abstraction:** Colors are never hardcoded by hex values in components. Every color resolves through a semantic role token (`--orlo-color-canvas`, `--orlo-color-surface`, `--orlo-color-border`, `--orlo-color-fg`), guaranteeing effortless light/dark mode adaptation.
2. **Signature Persimmon Accent:** Orlo is anchored by a warm, vibrant persimmon red-orange (`#A8370A` in light mode, `#FF7A45` in dark mode). It is purposefully distinct from generic tech blues and purples, exuding warmth and craftsmanship.
3. **Materials & Vibrancy:** Translucent frosted glass materials allow underlying content and ambient lighting to subtly shine through, providing spatial continuity and a lightweight feel.
4. **Non-Color Reliance:** Status (error, warning, success, info) is **NEVER** conveyed by color alone. Every colored cue is redundantly reinforced with an icon glyph and descriptive text.

---

## 2. Semantic Color Scale

The color system in [`packages/tokens/src/tokens.ts`](file:///Users/varun/Library/CloudStorage/OneDrive-Personal/orlo/packages/tokens/src/tokens.ts) provides precise functional roles:

| Semantic Role | Token Variable | Light Mode Value | Dark Mode Value | Function & Application |
|---|---|---|---|---|
| **Canvas** | `--orlo-color-canvas` | `#FAFAF9` (warm white) | `#121212` (deep graphite) | Root application background, page canvas |
| **Surface** | `--orlo-color-surface` | `#FFFFFF` (pure white) | `#1E1E1E` (elevated gray) | Standard cards, panels, list groups |
| **Sunken Surface** | `--orlo-color-surface-sunken` | `#F4F4F3` | `#181818` | Code blocks, input wells, preview trays |
| **Raised Surface** | `--orlo-color-surface-raised` | `#FFFFFF` | `#242424` | Floating action sheets, popovers, dropdown menus |
| **Foreground (Primary)**| `--orlo-color-fg` | `#1C1917` (graphite black)| `#F5F5F4` (near white) | Primary headings, body copy, active labels |
| **Foreground (Muted)** | `--orlo-color-fg-muted` | `#78716C` (warm stone) | `#A8A29E` (cool stone) | Secondary captions, helper text, inactive tabs |
| **Border (Subtle)** | `--orlo-color-border` | `#E7E5E4` | `#2E2E2E` | Container outlines, card borders, section dividers |
| **Border (Control)** | `--orlo-color-border-control` | `#D6D3D1` | `#404040` | Interactive input borders, button outlines |
| **Accent (Primary)** | `--orlo-color-accent` | `#A8370A` (persimmon) | `#FF7A45` (electric persimmon) | Primary call-to-action buttons, active indicators |
| **Accent Text** | `--orlo-color-accent-text` | `#8A2C08` | `#FF8F5E` | Accessible high-contrast text on neutral surfaces |
| **Success** | `--orlo-color-success` | `#15803D` (emerald) | `#4ADE80` (mint) | Completed tasks, positive validation confirmation |
| **Warning** | `--orlo-color-warning` | `#B45309` (amber) | `#FBBF24` (gold) | Non-blocking alerts, cautionary prompts |
| **Error / Destructive** | `--orlo-color-error` | `#B91C1C` (crimson) | `#F87171` (coral) | Validation errors, destructive action triggers |

---

## 3. Materials & Frosted Glass Vibrancy

Translucency in Orlo is implemented with strict material vibrancy standards:

```css
/* Frosted Glass Vibrancy Surface */
.orlo-material-vibrancy {
  background: rgba(var(--orlo-canvas-rgb, 255, 255, 255), 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-block-end: 1px solid var(--orlo-color-border);
}
```

### Material Hierarchy
1. **Ultra Thin:** Used for floating toolbars and segmented control tracks (`blur(16px)`).
2. **Regular / Vibrancy:** Used for sticky navigation headers and floating command palettes (`blur(20px) saturate(180%)`).
3. **Thick / Heavy Scrim:** Used for modal backdrops and dimming sheets (`rgba(0, 0, 0, 0.45)` with `blur(8px)`).
4. **Fallback for Reduced Transparency:** When users enable "Reduce Transparency" at the OS level (`prefers-reduced-transparency: reduce`), Orlo automatically replaces translucent glass with solid opaque tokens (`--orlo-color-canvas` and `--orlo-color-surface`).

---

## 4. Contrast & Accessibility Standards

Orlo strictly complies with **WCAG 2.2 Level AA** contrast criteria:
- **Body & Headline Text:** Minimum contrast ratio of **4.5:1** against underlying surface colors.
- **Large Text (≥ 24px) & Graphical Objects:** Minimum contrast ratio of **3:1** against adjacent colors.
- **Control Boundaries:** Form inputs, checkboxes, and buttons maintain at least **3:1** contrast against page canvas.
- **Windows Forced Colors Mode:** Components declare high-contrast fallback borders and outline properties using `CanvasText` and `Highlight` system keywords.

---

## 5. Comparative Do's and Don'ts

| Do | Don't |
|---|---|
| Reference semantic tokens (`var(--orlo-color-surface)`) for all styling declarations. | Hardcode raw hex or RGB values (`#FFF`, `#333`) in component styles. |
| Always pair color indicators with an icon and clear text description. | Rely on red/green colors alone to convey error or success status. |
| Provide a high-contrast focus ring (`var(--orlo-ring)`) on interactive elements. | Remove outline focus rings without providing an accessible alternative. |
| Use frosted glass vibrancy (`backdrop-filter`) for elevated navigation rails. | Use raw 100% transparent backgrounds that make text illegible over scrolled content. |
| Ensure dark mode tokens provide equivalent legibility and visual hierarchy to light mode. | Invert colors naively with CSS filters or harsh pure `#000000` pitch black surfaces. |
