# Orlo Human Interface Guidelines

Welcome to the **Orlo Human Interface Guidelines (HIG)**. Orlo is an accessible, expressive, and unstyled-by-default React design system built for professional multi-platform applications.

These guidelines define the normative design principles, spatial systems, material physics, typographic scales, and accessibility contracts that govern all 127 components and user interfaces built with Orlo.

---

## Core Design Principles

Orlo's philosophy is rooted in the three fundamental pillars of Apple's Human Interface Guidelines, elevated by Google's Material 3 Expressive motion and physics:

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   1. CLARITY              2. DEFERENCE             3. DEPTH            │
│   ──────────              ────────────             ────────            │
│   Content is legible      UI supports content      Layered materials,  │
│   at any scale, text is   without competing        translucent glass,  │
│   crisp, icons are        for attention. Calm      and realistic       │
│   precise, and spatial    canvas, purposeful       harmonic spring     │
│   hierarchy guides        accents, zero            physics convey      │
│   the user's eye.         visual clutter.          hierarchy.          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Clarity**: Text is legible at every viewport scale and magnification level up to 400%. Icons are precise and purposeful. Controls convey their affordance instantly, and errors are communicated through redundant channels (text, iconography, and tone)—never color alone.
2. **Deference**: The interface defers to the user's content. Fluid transitions, subtle translucent materials, and uncluttered surfaces keep the user focused on their task. Orlo components never draw attention to themselves unnecessarily.
3. **Depth & Physicality**: Realistic physics and layered translucent materials establish spatial orientation. Surfaces cast subtle ambient shadows, modal sheets slide on natural spring trajectories, and buttons respond with tactile Material 3 expressive squash on active press.

---

## Guidelines Directory

### Foundations
- [Spacing, Rhythm & Layout](guidelines/spacing-and-layout.md) — The 8pt macro-grid, 4pt micro-subgrid, safe areas, container queries, and 44×44pt touch targets.
- [Typography](guidelines/typography.md) — Dynamic type scale, relative line heights, optical weights, letter-spacing tokens, and tabular figures.
- [Color & Materials](guidelines/color-and-materials.md) — Semantic color tokens, signature persimmon accent, frosted glass materials, dark mode adaptivity, and WCAG contrast.
- [Motion & Physics](guidelines/motion-and-physics.md) — Damped harmonic oscillators ($m \cdot x'' + c \cdot x' + k \cdot x = 0$), spring presets, tactile squash, and reduced-motion policy.
- [Accessibility & Inclusion](guidelines/accessibility-and-inclusion.md) — WCAG 2.2 Level AA compliance, focus management primitives, screen readers, and high-contrast modes.
- [Inputs & Interaction](guidelines/inputs-and-interaction.md) — Direct manipulation, fine pointer vs coarse touch targeting, focus ring architecture, and tactile feedback.

### Patterns & Architecture
- [Navigation & Hierarchy](guidelines/navigation-and-hierarchy.md) — Segmented pill tabs, hierarchical navigation, sheets, modal dialogs, and the spotlight command palette (`⌘K`).
- [Feedback & Status](guidelines/feedback-and-status.md) — Multi-channel status communication, callout banners (`info`, `tip`, `warning`), inline validation, and non-blocking notices.

### Research & Decisions
- [Architecture Decision Records (ADRs)](research/decisions.md) — Comprehensive technical rationale for all architectural choices.
- [Motion & Oscillator Study](research/motion-study.md) — Mathematical derivation of damping ratios, overshoot bounds, and settling times.
- [Accessibility Audit Matrix](research/accessibility-matrix.md) — Automated and manual verification matrix across WCAG 2.2 AA criteria.
- [Component Coverage & Catalogue](research/component-coverage.md) — Functional families and maturity classifications for all 127 components.
- [Attributions & Licences](research/attributions.md) — Open-source licensing and intellectual property disclosures.

### Audits & Status
- [Project Verification Status](PROJECT_STATUS.md) — Current build status, test verification gates, and release milestones.
- [Design Refinement Audit](audits/orlo-design-audit.md) — Historical audit log of design improvements, evidence, and verified dispositions.
- [v3 Redesign Plan](audits/v3-redesign-plan.md) — Architectural roadmap and implementation specifications.

---

## Source of Truth

The Orlo design system enforces strict single-source-of-truth governance:
- **Design Tokens**: Defined in [`packages/tokens/src/tokens.ts`](file:///Users/varun/Library/CloudStorage/OneDrive-Personal/orlo/packages/tokens/src/tokens.ts) and compiled to CSS variables. No arbitrary hardcoded colors, radii, or durations are permitted in application code.
- **Component Manifest**: Maintained in [`packages/react/src/manifest.ts`](file:///Users/varun/Library/CloudStorage/OneDrive-Personal/orlo/packages/react/src/manifest.ts). The build rejects any undocumented or unverified component.
- **Animation Constants**: Animated exclusively via [`useOrloMotion()`](file:///Users/varun/Library/CloudStorage/OneDrive-Personal/orlo/packages/motion/src/presets.ts) spring presets or motion tokens.
