# Motion study

Orlo models motion as a damped oscillator, `m·x'' + c·x' + k·(x − target) = 0`. Presets are expressed as stiffness (k), damping (c) and mass (m). `springMetrics` derives the damping ratio ζ = c / (2√(km)), the overshoot exp(−πζ/√(1−ζ²)) and the 2% settling time.

| Preset | k | c | ζ | Overshoot | Settle |
|---|---|---|---|---|---|
| press | 700 | 45 | 0.85 | 0.6% | ~178 ms |
| reveal | 380 | 34 | 0.87 | 0.4% | ~235 ms |
| overlay | 520 | 40 | 0.88 | 0.4% | ~200 ms |
| expand | 300 | 30 | 0.87 | 0.5% | ~267 ms |
| shared | 260 | 28 | 0.87 | 0.5% | ~286 ms |
| drag | 420 | 30 | 0.73 | 3.6% | ~267 ms |
| success | 340 | 26 | 0.71 | 4.4% | ~308 ms |

These values are Orlo's own hypotheses, tuned by eye in the MotionLab and bounded by a unit test (overshoot ≤ 5%, settle < 700 ms). They are not Apple or Google values. They have not been studied on real low-end hardware.

Policy: `system` follows prefers-reduced-motion. `reduced` turns travel into a 150 ms fade. `off` is instant. `full` overrides the OS and is reserved for explicit user choice.
