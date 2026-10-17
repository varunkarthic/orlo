import { describe, expect, it } from "vitest";
import { materialVars, mixHex, safeGlassAlpha } from "./material.ts";
import { contrast, semantic } from "./tokens.ts";

describe("glass readability guard", () => {
  for (const scheme of ["light", "dark"] as const) {
    for (const tint of ["#FFE600", "#00C2FF", "#7C3AED", "#FF0000", "#000000", "#FFFFFF"]) {
      it(`${scheme} tinted ${tint} keeps body text ≥ 4.5:1 over black and white backdrops`, () => {
        const v = materialVars("tinted", scheme, { opacity: 0.3, tintStrength: 0.4 }, tint);
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
});
