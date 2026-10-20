# Motion & Oscillator Study

_Orlo Engineering Research – Damped Harmonic Oscillators & Spring Physics_

---

## 1. Abstract

Orlo rejects arbitrary timing curves (such as `ease-in-out` with hardcoded millisecond durations) in favor of **damped harmonic spring physics**. This research document outlines the mathematical model, numerical presets, automated test bounds, and accessibility policies governing motion throughout the Orlo component ecosystem.

---

## 2. Mathematical Formulation

Motion in Orlo is modeled as an unforced second-order damped harmonic oscillator:

$$m \cdot \frac{d^2 x}{dt^2} + c \cdot \frac{dx}{dt} + k \cdot (x - x_{\text{target}}) = 0$$

Where:
- $m$: Mass of the moving interface element (normalized to $1.0$).
- $k$: Spring stiffness coefficient (restoring force proportional to displacement).
- $c$: Damping coefficient (frictional drag proportional to velocity).

### Derived Analytical Parameters

From $m$, $k$, and $c$, the following system dynamics are analytically derived:

1. **Undamped Natural Angular Frequency ($\omega_n$):**
   $$\omega_n = \sqrt{\frac{k}{m}}$$
2. **Damping Ratio ($\zeta$):**
   $$\zeta = \frac{c}{2\sqrt{k \cdot m}}$$
   - $\zeta < 1.0$: Underdamped (oscillates before settling; provides natural physical bounce).
   - $\zeta = 1.0$: Critically damped (fastest return to equilibrium without overshoot).
   - $\zeta > 1.0$: Overdamped (sluggish return with zero overshoot).
3. **Damped Angular Frequency ($\omega_d$):**
   $$\omega_d = \omega_n \sqrt{1 - \zeta^2} \quad (\text{for } \zeta < 1.0)$$
4. **Percentage Overshoot:**
   $$\text{Overshoot} = \exp\left(-\frac{\pi \zeta}{\sqrt{1 - \zeta^2}}\right) \times 100\%$$
5. **2% Settling Time ($t_s$):**
   $$t_s \approx \frac{-\ln(0.02)}{\zeta \cdot \omega_n} \approx \frac{3.912}{\zeta \cdot \omega_n}$$

---

## 3. Presets & Derived Dynamics

Every preset in [`packages/motion/src/presets.ts`](file:///Users/varun/Library/CloudStorage/OneDrive-Personal/orlo/packages/motion/src/presets.ts) is calibrated for high tactile responsiveness without dizzying rebound:

| Preset | Stiffness ($k$) | Damping ($c$) | Natural Freq ($\omega_n$) | Damping Ratio ($\zeta$) | Percent Overshoot | 2% Settle Time | Design Intent |
|---|---|---|---|---|---|---|---|
| **`press`** | `700` | `45` | `26.46 rad/s` | `0.850` | `0.6%` | `~174 ms` | Immediate tactile feedback on button/tab clicks |
| **`reveal`** | `380` | `34` | `19.49 rad/s` | `0.872` | `0.4%` | `~230 ms` | Tooltips, dropdown menus, combobox popovers |
| **`overlay`**| `520` | `40` | `22.80 rad/s` | `0.877` | `0.4%` | `~196 ms` | Modal dialogs, action sheets, full-screen backdrops |
| **`expand`** | `300` | `30` | `17.32 rad/s` | `0.866` | `0.5%` | `~261 ms` | Accordion drawers, details disclosure, card unfolding |
| **`shared`** | `260` | `28` | `16.12 rad/s` | `0.868` | `0.5%` | `~279 ms` | Morphing shared-element card transitions |
| **`drag`** | `420` | `30` | `20.49 rad/s` | `0.732` | `3.6%` | `~261 ms` | Slider thumb release, carousel swipe snaps |
| **`success`**| `340` | `26` | `18.44 rad/s` | `0.705` | `4.4%` | `~301 ms` | Animated completion checkmarks, celebration badges |

---

## 4. Engineering Verification Gates

To prevent accidental drift or sluggish animations, [`packages/motion/src/presets.test.ts`](file:///Users/varun/Library/CloudStorage/OneDrive-Personal/orlo/packages/motion/src/presets.test.ts) enforces automated mathematical test assertions on every build:

1. **Overshoot Guardrail:** For standard navigation and control presets (`press`, `reveal`, `overlay`, `expand`, `shared`), overshoot must be strictly bounded below **2%** ($\text{Overshoot} \le 2.0\%$).
2. **Playful Boundary:** For interactive feedback presets (`drag`, `success`), overshoot must remain strictly below **5%** ($\text{Overshoot} \le 5.0\%$).
3. **Settling Time Guardrail:** Every preset must achieve 2% settling within **350 ms** ($t_s < 350\text{ms}$), ensuring that interfaces never feel unresponsive or delayed.

---

## 5. Reduced Motion Policy

Vestibular disorders and motion sickness can be triggered by rapid screen travel or continuous oscillations. Orlo's `OrloProvider` enforces the following policy:

- **`system` Mode:** Evaluates `window.matchMedia('(prefers-reduced-motion: reduce)')`. When active, all spatial translation and spring oscillations are disabled.
- **Graceful Opacity Fallback:** Instead of spatial travel, elements enter and exit using a subtle **150ms opacity crossfade**, preserving visual smoothness without motion artifacts.
- **`off` Mode:** Zero duration transitions for automated testing environments and maximum performance on constrained hardware.
