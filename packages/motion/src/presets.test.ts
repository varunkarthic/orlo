import { describe, expect, it } from "vitest";
import { EXPRESSIVE_CEILING, OVERSHOOT_CEILING, purposes, simulate, spring, springMetrics, springs } from "./presets.ts";
import { createVelocityTracker, projectSnap, rubberband } from "./gesture.ts";

describe("spring tokens", () => {
  for (const scheme of ["standard", "expressive"] as const) {
    for (const [family, speeds] of Object.entries(springs[scheme])) {
      for (const [speed, sp] of Object.entries(speeds)) {
        it(`${scheme}.${family}.${speed} respects its ceiling and settles`, () => {
          const m = springMetrics(sp);
          const ceiling = family === "effects" ? 0 : scheme === "expressive" ? EXPRESSIVE_CEILING : OVERSHOOT_CEILING;
          expect(m.overshoot).toBeLessThanOrEqual(ceiling + 1e-9);
          expect(m.settleMs).toBeLessThan(family === "spatial" && speed === "slow" ? 900 : 700);
        });
      }
    }
  }
  it("effects springs are critically damped", () => {
    for (const sp of Object.values(springs.standard.effects)) expect(springMetrics(sp).zeta).toBeCloseTo(1, 1);
  });
  it("speeds are ordered: fast settles sooner than slow", () => {
    const f = springMetrics(springs.standard.spatial.fast).settleMs, d = springMetrics(springs.standard.spatial.default).settleMs, sl = springMetrics(springs.standard.spatial.slow).settleMs;
    expect(f).toBeLessThan(d); expect(d).toBeLessThan(sl);
  });
  it("every purpose resolves", () => { for (const p of Object.keys(purposes)) expect(spring(p as keyof typeof purposes).type).toBe("spring"); });
  it("velocity carries into the response (overshoots further, then settles)", () => {
    const sp = springs.standard.spatial.default;
    const still = Math.max(...simulate(sp).map((p) => p[1]));
    const flung = Math.max(...simulate(sp, { velocity: 8 }).map((p) => p[1]));
    expect(flung).toBeGreaterThan(still);
    const end = simulate(sp, { velocity: 8, ms: 1500 }).at(-1)![1];
    expect(end).toBeCloseTo(1, 2);
  });
});

describe("gesture helpers", () => {
  it("tracks velocity in px/s", () => { const v = createVelocityTracker(); v.add(0, 0); v.add(50, 50); v.add(100, 100); expect(v.velocity()).toBeCloseTo(1000); });
  it("rubberband resists more as you pull", () => { expect(rubberband(100, 300)).toBeLessThan(100); expect(rubberband(200, 300) - rubberband(100, 300)).toBeLessThan(rubberband(100, 300)); });
  it("projects momentum to the right snap point", () => { expect(projectSnap(120, 0, [0, 200, 400])).toBe(200); expect(projectSnap(100, 2000, [0, 200, 400, 1200])).toBeGreaterThan(200); expect(projectSnap(100, -2000, [0, 200, 400])).toBe(0); });
});
