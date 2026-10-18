import { describe, expect, it } from "vitest";
import { materialVars, mixHex, safeGlassAlpha } from "./material.ts";
import { contrast, semantic } from "./tokens.ts";

describe("glass readability guard", () => {
  for (const scheme of ["light", "dark"] as const) {
    for (const opacity of [0.2, 0.5, 0.72, 0.95]) {
      it(`${scheme} glass at ${opacity} keeps body text ≥ 4.5:1 over black and white backdrops`, () => {
        const v = materialVars("glass", scheme, { opacity });
        const alpha = Number(v["--orlo-material-alpha"]);
        const [r, g, b] = v["--orlo-material-bg"].match(/\d+/g)!.map(Number);
        const base = "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
        const fg = semantic[scheme].fg;
        expect(contrast(fg, mixHex("#000000", base, alpha))).toBeGreaterThanOrEqual(4.5);
        expect(contrast(fg, mixHex("#FFFFFF", base, alpha))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
  it("never lowers the requested opacity", () => expect(safeGlassAlpha("#FFFFFF", "#1C1B18", 0.9)).toBeGreaterThanOrEqual(0.9));
  it("solid has no blur", () => expect(materialVars("solid", "light")["--orlo-material-blur"]).toBe("0px"));
  it("only solid and glass exist", () => {
    // @ts-expect-error tinted was removed in v3
    expect(materialVars("tinted", "light")["--orlo-material-blur"]).toBe("0px");
  });
});
