import { describe, expect, it } from "vitest";
import { OVERSHOOT_CEILING, presets, springMetrics } from "./presets.ts";

describe("motion presets", () => {
  for (const [name, p] of Object.entries(presets)) {
    it(`${name} stays under the overshoot ceiling and settles within 700ms`, () => {
      const m = springMetrics(p);
      expect(m.overshoot).toBeLessThanOrEqual(OVERSHOOT_CEILING);
      expect(m.settleMs).toBeLessThan(700);
    });
  }
  it("matches a known critically damped spring", () => {
    const m = springMetrics({ stiffness: 100, damping: 20, mass: 1 });
    expect(m.zeta).toBeCloseTo(1);
    expect(m.overshoot).toBe(0);
  });
});
