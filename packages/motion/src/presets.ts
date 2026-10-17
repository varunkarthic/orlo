export type Spring = { type: "spring"; stiffness: number; damping: number; mass: number };

const s = (stiffness: number, damping: number, mass = 1): Spring => ({ type: "spring", stiffness, damping, mass });

/**
 * Initial design hypotheses, tuned by eye and checked by `springMetrics`.
 * Not published Apple/Google values. See docs/research/motion-study.md.
 */
export const presets = {
  press: s(700, 45),
  focus: s(700, 45),
  reveal: s(380, 34),
  dismiss: s(600, 48),
  expand: s(300, 30),
  shift: s(400, 36),
  shared: s(260, 28),
  overlay: s(520, 40),
  page: s(240, 30),
  drag: s(420, 30),
  success: s(340, 26),
  error: s(380, 34),
  loading: s(380, 34),
  stagger: s(380, 34),
} as const satisfies Record<string, Spring>;

export type PresetName = keyof typeof presets;

/** Overshoot ceiling (fraction of travel) for any preset not explicitly expressive. */
export const OVERSHOOT_CEILING = 0.05;

/** Analytic metrics for m x'' + c x' + k x = 0 (unit step response). */
export function springMetrics({ stiffness: k, damping: c, mass: m }: Pick<Spring, "stiffness" | "damping" | "mass">) {
  const omega = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));
  const overshoot = zeta < 1 ? Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta)) : 0;
  // 2% settling time, in ms. Underdamped: 4/(zeta*omega). Critically/over-damped: dominated by the slow pole.
  const slow = zeta < 1 ? zeta * omega : omega * (zeta - Math.sqrt(zeta * zeta - 1));
  return { omega, zeta, overshoot, settleMs: (4 / slow) * 1000 };
}
