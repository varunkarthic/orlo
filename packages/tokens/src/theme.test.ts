import { describe, expect, it } from "vitest";
import { createTheme, hexToHsl, hslToHex } from "./theme.ts";
import { contrast, semantic } from "./tokens.ts";

describe("createTheme", () => {
  it("round-trips colours", () => expect(hslToHex(hexToHsl("#A8370A"))).toBe("#A8370A"));
  for (const hex of ["#FFE600", "#00C2FF", "#7C3AED", "#16A34A", "#FF0000", "#000000", "#FFFFFF", "#808080", "#C2410C"]) {
    it(`${hex} yields AA accent roles in both schemes`, () => {
      const t = createTheme(hex);
      expect(contrast(t.light.accent, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.light["accent-text"], semantic.light.canvas)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.dark.accent, t.dark["accent-fg"])).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.dark["accent-text"], semantic.dark.canvas)).toBeGreaterThanOrEqual(4.5);
    });
  }
});
