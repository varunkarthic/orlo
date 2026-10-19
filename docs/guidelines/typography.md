# Typography Guidelines

_Orlo Human Interface Guidelines — Typographic Hierarchy & Dynamic Type_

---

## 1. Typographic Philosophy

Typography in Orlo follows Apple's Human Interface Guidelines core mandate: **text must be effortlessly legible at any scale, harmonious across platforms, and clearly structured to guide comprehension.**

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   TYPOGRAPHIC PRINCIPLES:                                              │
│                                                                        │
│   1. HIERARCHY       Visual weight communicates reading order.        │
│   2. PROPORTION      Line height and tracking scale with type size.    │
│   3. READABILITY     Tabular numerals align numbers; generous leading │
│                      prevents eye strain in long-form prose.           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Hierarchy Without Noise:** Distinct typographic levels (Large Title, Title, Headline, Body, Caption) establish instant scanning order without requiring heavy borders or busy decorative elements.
2. **System Font Continuity:** Orlo uses native system font stacks (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...`). This ensures zero network font overhead, instant first paint, and visual consistency with the host operating system.
3. **Dynamic Scaling:** Font sizes and line heights are expressed via semantic tokens with fluid clamp sizing on display headings, ensuring seamless scaling from 320px mobile screens to large desktop monitors.

---

## 2. Typographic Scale & Token Mappings

The Orlo typographic scale provides a comprehensive hierarchy mapped to Apple HIG classifications:

| HIG Style Role | Token | Font Size | Relative Line Height | Weight Token | Tracking Token | Intended Use Case |
|---|---|---|---|---|---|---|
| **Large Title** | `--orlo-text-3xl` | `32px – 48px` (fluid) | `1.1` (`--orlo-leading-tight`) | `semibold` (`600`) | `-0.045em` | Hero titles, landing page headlines |
| **Title 1** | `--orlo-text-2xl` | `24px – 32px` | `1.2` (`--orlo-leading-tight`) | `semibold` (`600`) | `-0.035em` | Primary page headings (`h1`), modal titles |
| **Title 2** | `--orlo-text-xl` | `20px` | `1.25` | `semibold` (`600`) | `-0.025em` | Major section headers (`h2`), card titles |
| **Title 3** | `--orlo-text-lg` | `18px` | `1.3` | `semibold` (`600`) | `-0.015em` | Subsection titles (`h3`), dialog prompts |
| **Headline** | `--orlo-text-base` | `16px` | `1.4` | `semibold` (`600`) | `0` | Lead paragraphs, emphasized list items |
| **Body** | `--orlo-text-base` | `16px` | `1.5` (`--orlo-leading-normal`) | `normal` (`400`) | `0` | Standard body copy, form input text, table rows |
| **Callout** | `--orlo-text-sm` | `14px` | `1.4` | `medium` (`500`) | `0` | Callout boxes, button labels, tabs, menu items |
| **Subheadline** | `--orlo-text-sm` | `14px` | `1.45` | `normal` (`400`) | `0` | Helper text, secondary descriptions, metadata |
| **Footnote** | `--orlo-text-xs` | `12px` | `1.35` | `normal` / `semibold` | `+0.01em` | Badges, timestamps, secondary captions |
| **Caption / Eyebrow**| `--orlo-text-2xs` | `10px – 11px`| `1.2` | `bold` (`700`) | `+0.08em` (`--orlo-tracking-caps`) | Uppercase category eyebrows, status badges |

---

## 3. Optical Weights & Tracking

Letter spacing (tracking) and optical weights are calibrated to maintain optimal legibility across varying type sizes:

### Tracking Rules
- **Display Headings (`--orlo-text-2xl` & above):** Negative tracking (`-0.035em` to `-0.055em`) tightens word contours, preventing headline text from looking sparse.
- **Body & Controls (`--orlo-text-base`, `--orlo-text-sm`):** Neutral tracking (`0` to `0.01em`) ensures letters remain distinct during rapid reading.
- **Caps & Eyebrows (`--orlo-tracking-caps`):** Generous positive tracking (`+0.06em` to `+0.1em`) with `text-transform: uppercase` prevents small capitalized text from appearing congested.

### Font Weight System
- `--orlo-weight-normal`: `400` (Body copy, form inputs, secondary descriptions).
- `--orlo-weight-medium`: `500` (Action labels, navigation items, interactive buttons).
- `--orlo-weight-semibold`: `600` (Section headings, titles, active tabs, strong emphasis).
- `--orlo-weight-bold`: `700` (Uppercase eyebrows, key metric numerals).

---

## 4. Tabular Figures & Numeric Alignment

In data-heavy interfaces—such as financial dashboards, timers, progress counters, and data tables—proportional numerals cause jumping text as numbers fluctuate.

Orlo enforces tabular numeric formatting:
```css
.metric-value, .data-cell--numeric, .timer {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}
```
- **Alignment:** Numeric columns in tables and lists MUST align to the end (`text-align: end`) so decimal points and digit positions align vertically.
- **Monospace Stack:** Code snippets, IDs, and cryptographic hashes use `--orlo-font-mono` (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`).

---

## 5. Comparative Do's and Don'ts

| Do | Don't |
|---|---|
| Use semantic heading tags (`h1`, `h2`, `h3`) with matching Orlo typography tokens. | Skip heading levels (e.g., jumping from `h1` to `h4`) solely for visual sizing. |
| Apply `font-variant-numeric: tabular-nums` to timers, tables, and counters. | Allow numbers to fluctuate and jitter during real-time value updates. |
| Use `--orlo-tracking-caps` whenever rendering small uppercase eyebrow labels. | Display uppercase text with default tight tracking, reducing legibility. |
| Maintain generous leading (`--orlo-leading-normal`, 1.5) on multi-line body paragraphs. | Squeeze multi-line prose with tight line heights under 1.3. |
| Keep paragraph line lengths between 45 and 75 characters for optimal reading ergonomics. | Allow body text to stretch edge-to-edge across wide desktop viewports. |
