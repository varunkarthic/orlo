# Motion & Physics Guidelines

_Orlo Design Guidelines – Damped Harmonic Springs & Motion Dynamics_

---

## 1. Motion Philosophy

Motion in Orlo is grounded in physical reality. Interfaces feel responsive, alive, and predictable when digital objects possess weight, momentum, and elasticity rather than mechanical, linear timing curves.

In Orlo's motion model, spring physics and tactile feedback guide attention naturally without causing visual fatigue.

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   PHYSICAL FOUNDATIONS:                                                │
│                                                                        │
│   1. HARMONIC SPRINGS    Transitions model physical springs with      │
│                          stiffness, damping, and mass. No robotic      │
│                          linear curves or arbitrary second durations.  │
│                                                                        │
│   2. TACTILE SQUASH      Buttons, tabs, and interactive controls       │
│                          compress under touch/press (scale: 0.96-0.98) │
│                          and snap back upon release.                   │
│                                                                        │
│   3. SPATIAL CONTINUITY  Elements preserve geometry and expand from    │
│                          their trigger coordinates. No jarring pops.   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Physical Continuity:** Elements do not appear or disappear arbitrarily. Modal sheets slide smoothly up from screen bounds, popovers emerge from their anchor targets, and expanding cards morph continuously.
2. **Tactile Feedback:** Interactive surfaces acknowledge pointer down and touch press events through immediate physical compression (`scale(0.97)` to `scale(0.98)`), followed by an elastic release.
3. **Respect for Reduced Motion:** Every animation respects the user's sensory preferences. When `prefers-reduced-motion: reduce` is active, spatial travel is replaced by a gentle 150ms opacity fade.

---

## 2. Mathematical Foundation: Damped Harmonic Oscillators

All Orlo animation presets are mathematically derived from the classic second-order differential equation of a damped harmonic oscillator:

$$m \cdot \frac{d^2 x}{dt^2} + c \cdot \frac{dx}{dt} + k \cdot (x - x_{\text{target}}) = 0$$

Where:
- $m$: Mass of the object (normalized to $1.0$).
- $k$: Spring stiffness (elastic restoring force).
- $c$: Damping coefficient (viscous resistance).

From these parameters, the helper `springMetrics` derives:
- **Damping Ratio ($\zeta$):** $\zeta = \frac{c}{2\sqrt{k \cdot m}}$. Values between $0.70$ and $0.90$ yield crisp settling with minimal, natural overshoot.
- **Percent Overshoot:** $\text{Overshoot} = \exp\left(-\frac{\pi \zeta}{\sqrt{1 - \zeta^2}}\right) \times 100\%$.
- **2% Settling Time ($t_s$):** The time required for oscillations to settle within $\pm 2\%$ of the target position.

---

## 3. Normative Spring Presets

Orlo provides seven calibrated harmonic spring presets in [`packages/motion/src/presets.ts`](file:///Users/varun/Library/CloudStorage/OneDrive-Personal/orlo/packages/motion/src/presets.ts):

| Preset | Stiffness ($k$) | Damping ($c$) | Damping Ratio ($\zeta$) | Overshoot | 2% Settle Time | Recommended Interaction |
|---|---|---|---|---|---|---|
| **`press`** | `700` | `45` | `0.85` | `0.6%` | `~178 ms` | Button press, segmented tab selection, switch toggle |
| **`reveal`** | `380` | `34` | `0.87` | `0.4%` | `~235 ms` | Dropdown menus, tooltips, combobox popover reveals |
| **`overlay`** | `520` | `40` | `0.88` | `0.4%` | `~200 ms` | Modal dialogs, backdrop scrims, toast notifications |
| **`expand`** | `300` | `30` | `0.87` | `0.5%` | `~267 ms` | Accordion panels, collapsible drawers, details disclosure |
| **`shared`** | `260` | `28` | `0.87` | `0.5%` | `~286 ms` | Shared-element morphing, card expansion to full screen |
| **`drag`** | `420` | `30` | `0.73` | `3.6%` | `~267 ms` | Slider thumb release, carousel swipe snaps, bottom sheets |
| **`success`** | `340` | `26` | `0.71` | `4.4%` | `~308 ms` | Task completion badges, celebration icons, confirmation checks |

---

## 4. Tactile Physics & Active States

In CSS and React component implementations, interactive elements feature calibrated hover elevations and active compression:

```css
/* Button & Tab Active Tactile Compression */
.orlo-control {
  transition: transform var(--orlo-duration-spatial-fast) cubic-bezier(0.2, 0, 0, 1),
              box-shadow var(--orlo-duration-spatial-fast) cubic-bezier(0.2, 0, 0, 1);
}

@media (hover: hover) and (pointer: fine) {
  .orlo-control:hover {
    transform: translateY(-2px);
    box-shadow: var(--orlo-shadow-2);
  }
}

.orlo-control:active {
  transform: scale(0.97);
  box-shadow: var(--orlo-shadow-1);
}
```

### Spatial Travel Boundaries
- **Micro-controls (buttons, chips):** Travel is bounded between `1px` and `3px`.
- **Medium cards & popovers:** Travel is bounded between `4px` and `8px`.
- **Large dialogs & sheets:** Enter smoothly from edge bounds (`20px – 100%`) without excessive velocity.

---

## 5. Reduced-Motion Policy & Fallbacks

Orlo provides four motion tiers via `OrloProvider`:
- **`system` (Default):** Strictly respects the operating system's `prefers-reduced-motion` media query.
- **`reduced`:** Disables all spatial translations, transforms, and bounce. Converts all state changes into a subtle **150ms opacity crossfade**.
- **`off`:** Disables all animation completely (`duration: 0`). Useful for high-throughput headless testing and extreme vestibular sensitivities.
- **`full`:** Explicitly enables spring physics regardless of OS defaults (only when opted-in by user interface setting).

---

## 6. Comparative Do's and Don'ts

| Do | Don't |
|---|---|
| Use `useOrloMotion()` presets (`press`, `reveal`, `overlay`) for component animations. | Hardcode arbitrary duration strings like `transition: all 0.35s ease-in-out;`. |
| Add subtle tactile squash (`scale(0.97)`) on active button and tab press states. | Make buttons feel dead and unresponsive to user interaction. |
| Test and guarantee that every motion path resolves cleanly when reduced-motion is active. | Animate large surfaces across the screen when the user requested reduced motion. |
| Reserve geometry prior to asset loading to prevent layout shifts during animation. | Allow images to pop in and violently shove existing layout elements down. |
| Keep settling times under 350ms to ensure the interface never feels sluggish. | Create prolonged, self-indulgent animations that delay user productivity. |
