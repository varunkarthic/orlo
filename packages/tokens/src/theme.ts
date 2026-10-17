import { contrast, primitive, semantic } from "./tokens.ts";

type HSL = [number, number, number];

export function hexToHsl(hex: string): HSL {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
}

export function hslToHex([h, s, l]: HSL): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/** Walks lightness in `step` until `ok` holds; returns the first passing colour (or the extreme). */
function seek([h, s, l]: HSL, step: number, ok: (hex: string) => boolean) {
  for (let x = l; x >= 0 && x <= 100; x += step) { const hex = hslToHex([h, s, x]); if (ok(hex)) return hex; }
  return hslToHex([h, s, step < 0 ? 0 : 100]);
}

export type OrloTheme = { light: Record<string, string>; dark: Record<string, string> };

/**
 * Builds accent roles from any brand colour, adjusting lightness (never hue) until every
 * accent pairing meets WCAG 2.2 AA in both schemes. The input colour is kept when it already passes.
 */
export function createTheme(accent: string): OrloTheme {
  const hsl = hexToHsl(accent);
  const L = semantic.light, D = semantic.dark;
  const lightAccent = seek(hsl, -1, (c) => contrast(c, "#FFFFFF") >= 4.5 && contrast(c, L.canvas) >= 4.5 && contrast(c, L.surface) >= 4.5);
  const darkAccent = seek(hsl, 1, (c) => contrast(c, D["accent-fg"]) >= 4.5 && contrast(c, D.canvas) >= 3);
  const darkText = seek(hsl, 1, (c) => contrast(c, D.canvas) >= 4.5 && contrast(c, D.surface) >= 4.5);
  return {
    light: { accent: lightAccent, "accent-fg": "#FFFFFF", "accent-text": lightAccent, "surface-selected": hslToHex([hsl[0], Math.min(hsl[1], 70), 92]) },
    dark: { accent: darkAccent, "accent-fg": primitive.neutral[950], "accent-text": darkText, "surface-selected": hslToHex([hsl[0], Math.min(hsl[1], 40), 18]) },
  };
}

/** CSS that applies a theme to `selector` (default :root), respecting the scheme attributes Orlo uses. */
export function themeToCss(t: OrloTheme, selector = ":root") {
  const v = (o: Record<string, string>) => Object.entries(o).map(([k, x]) => `  --orlo-color-${k}: ${x};`).join("\n");
  return `${selector}, ${selector}[data-orlo-theme="light"] {\n${v(t.light)}\n}\n@media (prefers-color-scheme: dark) {\n  ${selector}:not([data-orlo-theme="light"]) {\n${v(t.dark)}\n  }\n}\n${selector}[data-orlo-theme="dark"], [data-orlo-theme="dark"] ${selector} {\n${v(t.dark)}\n}`;
}
