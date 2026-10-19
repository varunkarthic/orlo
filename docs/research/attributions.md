# Attributions & Intellectual Property

_Orlo Design System — Open Source Licences, Origins & Attributions_

---

## 1. Originality of Implementation

- **In-House Primitives:** Every component, hook, utility, and primitive in `@orlo/react` is an original implementation authored specifically for this repository.
- **Zero Wrapped Libraries:** Orlo does not wrap, vendor, or re-export Radix UI, Base UI, Chakra UI, Ant Design, or React Aria. All DOM mechanics, keyboard models, focus scoping, and ARIA attributes are native to Orlo.

---

## 2. Runtime Dependencies & Licences

Orlo deliberately minimizes runtime dependencies to eliminate supply-chain vulnerabilities and keep bundles lean:

| Dependency | Package | Licence | Purpose |
|---|---|---|---|
| **React** | `react`, `react-dom` | MIT Licence | Core component rendering engine |
| **Motion** | `motion` (Motion for React) | MIT Licence | Damped harmonic spring physics and animation orchestrator |

---

## 3. Design Inspiration & Standards

Orlo acknowledges the profound influence of two industry-defining design systems:

1. **Apple Human Interface Guidelines (HIG):**
   - Inspired the design principles of **Clarity, Deference, and Depth**.
   - Informed the layout spatial system, frosted glass vibrancy materials (`backdrop-filter: blur(20px) saturate(180%)`), floating segmented capsule tab bars, callout banners, and the 44×44pt touch target standard.
   - *Notice:* Orlo is an independent open-source project and is not affiliated with, endorsed by, or sponsored by Apple Inc.
2. **Google Material 3 Expressive:**
   - Informed the tactile press physics (`scale(0.96) - scale(0.98)` on active controls), fluid hover elevations, and multi-channel status communication.
   - *Notice:* Orlo is not affiliated with Google LLC. No proprietary Material 3 assets, code, or trademarks are incorporated.

---

## 4. Visual Assets, Typography & Artwork

- **Logo:** The lowercase "orlo" wordmark with leaf terminals and the signature "o" ring emblem are based on original maintainer-supplied artwork, cleanly vectorized for this project.
- **Iconography:** The icon set in [`packages/react/src/components/Icons.tsx`](file:///Users/varun/Library/CloudStorage/OneDrive-Personal/orlo/packages/react/src/components/Icons.tsx) is an original 24×24 pixel grid vector set drawn for Orlo.
- **Typography:** Orlo utilizes native operating system font stacks (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...`). No commercial font binaries or third-party web fonts are redistributed.

---

## 5. Software Licence

The Orlo design system and all accompanying packages are distributed under the **MIT Licence**:

```
Copyright (c) 2026 Orlo Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
