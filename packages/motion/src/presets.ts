export type Spring = { type: "spring"; stiffness: number; damping: number; mass: number; velocity?: number; restDelta?: number };

const s = (stiffness: number, damping: number, mass = 1): Spring => ({ type: "spring", stiffness, damping, mass });

/**
 * Orlo spring tokens. Two schemes × two families × three speeds.
 * - spatial: position, size, scale, morph. May overshoot slightly (standard ≤ 5 %, expressive ≤ 12 %).
 * - effects: opacity, colour, blur, shadow. Always critically damped (ζ = 1): no overshoot on things that can't overshoot.
 * Values are Orlo's own hypotheses, tuned in the MotionLab and bounded by tests — not published Apple/Google numbers.
 */
export const springs = {
  standard: {
    spatial: { fast: s(800, 52), default: s(420, 38), slow: s(220, 28) },
    effects: { fast: s(900, 60), default: s(400, 40), slow: s(196, 28) },
  },
  expressive: {
    spatial: { fast: s(700, 34), default: s(380, 24), slow: s(200, 17) },
    effects: { fast: s(900, 60), default: s(400, 40), slow: s(196, 28) },
  },
} as const;

export type Scheme = keyof typeof springs;
export type Speed = "fast" | "default" | "slow";
export type Family = "spatial" | "effects";

/** Purposes components ask for. Each maps to a family and speed, so every animation in Orlo is related. */
export const purposes = {
  press: ["spatial", "fast"],       // pointer down compression
  release: ["spatial", "fast"],     // spring back on release
  focus: ["effects", "fast"],       // focus halo
  hover: ["effects", "fast"],       // hover tint / lift
  tooltip: ["spatial", "fast"],     // small reveal
  thumb: ["spatial", "fast"],       // slider / switch thumb settle
  reveal: ["spatial", "default"],   // appear in place
  dismiss: ["effects", "fast"],     // leave: quick, never bouncy
  expand: ["spatial", "default"],   // accordion, disclosure, size change
  collapse: ["spatial", "fast"],
  shift: ["spatial", "default"],    // siblings yielding space, indicators travelling
  morph: ["spatial", "default"],    // one shape becoming another (button → progress)
  shared: ["spatial", "slow"],      // element continuity between views
  overlay: ["spatial", "default"],  // popover, menu, dialog entrance
  page: ["spatial", "slow"],        // route-level change
  drag: ["spatial", "default"],     // settle after a gesture (carries velocity)
  snap: ["spatial", "fast"],        // snap points
  success: ["spatial", "default"],
  error: ["spatial", "fast"],
  fade: ["effects", "default"],
  shadow: ["effects", "default"],   // elevation changes
  blur: ["effects", "slow"],        // progressive blur, backdrop changes
  loading: ["effects", "slow"],
  stagger: ["spatial", "default"],
} as const satisfies Record<string, readonly [Family, Speed]>;

export type PresetName = keyof typeof purposes;

export function spring(name: PresetName, scheme: Scheme = "standard", velocity?: number): Spring {
  const [family, speed] = purposes[name];
  const base = springs[scheme][family][speed];
  return velocity === undefined ? base : { ...base, velocity };
}

/** Back-compatible map of standard presets. */
export const presets = Object.fromEntries(Object.keys(purposes).map((k) => [k, spring(k as PresetName)])) as Record<PresetName, Spring>;

/** Overshoot ceilings (fraction of travel). */
export const OVERSHOOT_CEILING = 0.05;
export const EXPRESSIVE_CEILING = 0.12;

/** Analytic metrics for m x'' + c x' + k x = 0 (unit step response, starting at rest). */
export function springMetrics({ stiffness: k, damping: c, mass: m }: Pick<Spring, "stiffness" | "damping" | "mass">) {
  const omega = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));
  const overshoot = zeta < 1 ? Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta)) : 0;
  const slow = zeta < 1 ? zeta * omega : omega * (zeta - Math.sqrt(zeta * zeta - 1));
  return { omega, zeta, overshoot, settleMs: (4 / slow) * 1000 };
}

/**
 * Numeric step response (semi-implicit Euler at 240 Hz), including an initial velocity in units of
 * travel per second. Used by the MotionLab chart and to verify velocity hand-off in tests.
 */
export function simulate({ stiffness: k, damping: c, mass: m }: Pick<Spring, "stiffness" | "damping" | "mass">, { from = 0, to = 1, velocity = 0, ms = 1000 } = {}) {
  const out: [number, number][] = [];
  let x = from, v = velocity;
  const dt = 1 / 240;
  for (let t = 0; t <= ms / 1000 + 1e-9; t += dt) {
    out.push([t * 1000, x]);
    v += ((-k * (x - to) - c * v) / m) * dt;
    x += v * dt;
  }
  return out;
}
