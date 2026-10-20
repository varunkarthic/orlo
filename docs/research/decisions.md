# Architecture Decision Records (ADRs)

_Orlo Design System – Formal Architecture Decision Records_

---

## ADR-001: Monorepo Structure via npm Workspaces

- **Status:** Accepted (2026-10-18)
- **Context:** Orlo contains multiple packages (`@orlo/tokens`, `@orlo/motion`, `@orlo/react`, and `@orlo/docs`). We needed a lightweight workspace orchestration tool that builds reliably across local macOS machines, GitHub Actions Ubuntu runners, and Read the Docs build containers.
- **Decision:** Use standard `npm workspaces` rather than `pnpm` or `yarn berry`.
- **Rationale:** Node.js and npm are pre-installed universally in modern CI and hosting environments without requiring external package manager boot-strapping (`corepack`), ensuring maximum build reliability.

---

## ADR-002: Author All Primitives In-House

- **Status:** Accepted (2026-10-18)
- **Context:** Many modern React design systems wrap Radix UI, Base UI, or React Aria. The project mandate requires Orlo to be a genuine, first-party design system, not a derivative compilation of existing component kits.
- **Decision:** Author all low-level interaction primitives directly in `@orlo/react`:
  - `useFocusScope` (keyboard focus trapping & restoration)
  - `useDismiss` (Escape key and outside interaction dismissal)
  - `useScrollLock` (background viewport scroll lock)
  - `useInertOutside` (background node DOM inertness)
  - `useAnchoredPosition` (floating popover and tooltip calculation)
  - `Portal` (deterministic post-hydration body portal)
- **Rationale:** Full ownership of keyboard models, ARIA attributes, and DOM mechanics eliminates third-party bundle bloat, prevents upstream breaking changes, and guarantees total alignment with Orlo design tokens.

---

## ADR-003: Motion for React (`motion`) as the Physics Engine

- **Status:** Accepted (2026-10-18)
- **Context:** Fluid, physics-based motion requires spring equations rather than hardcoded bezier timing curves.
- **Decision:** Standardize on `motion` (Motion for React) as the sole runtime animation dependency.
- **Rationale:** `motion` provides battle-tested spring physics, exit animations (`AnimatePresence`), layout animations, and declarative `MotionConfig` for global reduced-motion overrides while maintaining a small bundle footprint.

---

## ADR-004: TypeScript-First Token Engine with Zero Build Overhead

- **Status:** Accepted (2026-10-18)
- **Context:** Design tokens must be typed in TypeScript for React consumers while simultaneously generating standard CSS custom properties for styling.
- **Decision:** Define tokens in `packages/tokens/src/tokens.ts` and compile them using a tiny standalone Node script (`build.mjs`) utilizing Node's native type stripping.
- **Rationale:** Eliminates heavy token compilers (Style Dictionary, PostCSS). Generates pure, zero-dependency `orlo.css` custom properties in under 50ms.

---

## ADR-005: Static HTML Prerendering for Read the Docs Hosting

- **Status:** Accepted (2026-10-18)
- **Context:** Read the Docs serves documentation from static file directories under `/en/<version>/` without client-side single-page app (SPA) URL rewriting.
- **Decision:** Prerender all 677 documentation routes to static `index.html` files during `npm run build:rtd`.
- **Rationale:** Guarantees that deep links work on any static hosting environment (Read the Docs, GitHub Pages, Netlify) with instantaneous first-paint and perfect SEO.

---

## ADR-006: Apple HIG Aesthetic Fused with Material 3 Expressive Motion

- **Status:** Accepted (2026-10-19)
- **Context:** The documentation and component library needed a distinctive, world-class aesthetic that feels calm, elegant, and modern.
- **Decision:** Combine the visual elegance and material translucency of **Apple Human Interface Guidelines** with the tactile physics and squash-feedback of **Google Material 3 Expressive**.
- **Rationale:** Apple HIG delivers visual clarity through frosted glass materials, floating capsule navigation, and spacious typography; Material 3 provides lively tactile responsiveness (`scale(0.97)` on press, fluid hover elevations), creating a delightful, premium user experience.

---

## ADR-007: Signature Persimmon Accent Palette (`#A8370A`)

- **Status:** Accepted (2026-10-18)
- **Context:** Modern design systems often default to cold corporate blues or saturated purples.
- **Decision:** Choose a rich persimmon red-orange (`#A8370A` in light mode, `#FF7A45` in dark mode) as Orlo's signature accent.
- **Rationale:** Persimmon communicates warmth, craft, and distinct identity while achieving full WCAG 2.2 AA contrast compliance against both light and dark backgrounds.

---

## ADR-008: Deep-Linkable Component Tab Routes

- **Status:** Accepted (2026-10-18)
- **Context:** Component documentation pages have multiple sections (Overview, API, Accessibility, Styles, Code). Trapping these in local React tab state breaks browser back/forward buttons and makes sharing links impossible.
- **Decision:** Map every tab to a unique static URL path (e.g., `/components/dialog/accessibility/`).
- **Rationale:** Ensures every tab can be bookmarked, shared, and crawled independently, while maintaining the responsive feel of a single unified page.

---

## ADR-009: Strict Multi-Channel Status Communication

- **Status:** Accepted (2026-10-18)
- **Context:** Millions of users experience some form of color vision deficiency or view screens in bright sunlight.
- **Decision:** Enforce the rule that status, errors, and system states must NEVER be conveyed by color alone.
- **Rationale:** Mandatory pairing of color with distinct SVG icons and explicit text labels ensures universal comprehensibility and complies with WCAG 1.4.1 (Use of Color).

---

## ADR-010: Permissive MIT Open-Source Licensing

- **Status:** Accepted (2026-10-18)
- **Context:** The library is designed for broad adoption across commercial and open-source projects.
- **Decision:** Release all packages under the permissive MIT license.
- **Rationale:** Unrestricted usage encourages developer adoption and enterprise integration without legal friction.
