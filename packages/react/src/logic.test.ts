import { describe, expect, it } from "vitest";
import { computePosition } from "./internal/position.ts";
import { pageRange } from "./components/Pagination.tsx";
import { score } from "./components/CommandPalette.tsx";
import { initials, hueFor } from "./components/Avatar.tsx";

const vp = { width: 1000, height: 800 };
describe("computePosition", () => {
  it("places below and aligned to start when there is room", () => {
    const p = computePosition({ x: 100, y: 100, width: 80, height: 32 }, { width: 200, height: 150 }, vp, "bottom-start");
    expect(p).toMatchObject({ x: 100, y: 138, side: "bottom" });
  });
  it("flips to top near the bottom edge", () => {
    const p = computePosition({ x: 100, y: 740, width: 80, height: 32 }, { width: 200, height: 150 }, vp, "bottom-start");
    expect(p.side).toBe("top");
    expect(p.y + 150).toBeLessThanOrEqual(740);
  });
  it("shifts inward at the right edge and keeps origin on the anchor", () => {
    const p = computePosition({ x: 950, y: 100, width: 40, height: 32 }, { width: 200, height: 150 }, vp, "bottom-start");
    expect(p.x + 200).toBeLessThanOrEqual(vp.width - 8);
    const ox = parseFloat(p.origin);
    expect(p.x + ox).toBeCloseTo(970, 0);
  });
  it("reports remaining space so long menus scroll", () => {
    const p = computePosition({ x: 10, y: 380, width: 80, height: 32 }, { width: 200, height: 2000 }, vp, "bottom-start");
    expect(p.maxHeight).toBeLessThan(800);
  });
});

describe("pageRange", () => {
  it("collapses distant pages", () => expect(pageRange(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]));
  it("shows everything when small", () => expect(pageRange(1, 3)).toEqual([1, 2, 3]));
});

describe("command score", () => {
  it("rejects non-subsequences", () => expect(score("xz", "Button")).toBe(-1));
  it("prefers word starts", () => expect(score("dl", "Details Lab")).toBeGreaterThan(score("dl", "Middle")));
});

describe("avatar helpers", () => {
  it("derives initials safely", () => { expect(initials("Ada Lovelace")).toBe("AL"); expect(initials("  ")).toBe("?"); expect(initials("Émile Zola")).toBe("ÉZ"); });
  it("keeps a stable tint per name", () => expect(hueFor("Ada")).toBe(hueFor("Ada")));
});
