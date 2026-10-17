import { describe, expect, it } from "vitest";
import { contrast, semantic, tints } from "./tokens.ts";

const pairs: [string, string, number][] = [
  ["fg", "canvas", 4.5], ["fg", "surface", 4.5], ["fg-muted", "canvas", 4.5], ["fg-muted", "surface", 4.5],
  ["accent-fg", "accent", 4.5], ["accent-text", "canvas", 4.5], ["accent-text", "surface", 4.5],
  ["border-control", "canvas", 3], ["focus", "canvas", 3], ["focus", "surface", 3],
  ["success", "canvas", 4.5], ["warning", "canvas", 4.5], ["error", "canvas", 4.5], ["info", "canvas", 4.5],
];

describe("contrast (WCAG 2.2 AA)", () => {
  for (const scheme of ["light", "dark"] as const) {
    for (const [a, b, min] of pairs) {
      it(`${scheme}: ${a} on ${b} >= ${min}`, () => {
        const t = semantic[scheme] as Record<string, string>;
        expect(contrast(t[a], t[b])).toBeGreaterThanOrEqual(min);
      });
    }
  }
});

describe("identity tints", () => {
  for (const scheme of ["light", "dark"] as const) {
    tints[scheme].forEach(([bg, fg], i) => it(`${scheme} tint ${i} >= 4.5`, () => expect(contrast(bg, fg)).toBeGreaterThanOrEqual(4.5)));
  }
});
