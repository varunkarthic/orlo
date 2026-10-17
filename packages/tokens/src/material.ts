import { contrast, semantic } from "./tokens.ts";

export type Material = "solid" | "glass" | "tinted";
export type GlassOptions = {
  /** Backdrop blur in px. Default 20. */
  blur?: number;
  /** Surface opacity 0–1 before the readability guard. Default 0.72. */
  opacity?: number;
  /** Backdrop saturation multiplier. Default 1.6. */
  saturation?: number;
  /** Tint strength 0–1 for tinted glass. Default 0.22. */
  tintStrength?: number;
  /** Elevation level 0–5 for the material's shadow. Default 3. */
  depth?: number;
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
const mix = (a: string, b: string, t: number) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v * (1 - t) + y[i] * t)); };

/**
 * Readability guard for translucent surfaces. Text sits on `alpha·surface + (1−alpha)·backdrop`.
 * The backdrop is unknown, so we test the worst cases (pure black and pure white behind) and raise alpha
 * until body text meets 4.5:1 against both. Returns the minimum safe alpha (≥ the requested one).
 */
export function safeGlassAlpha(surface: string, fg: string, requested: number) {
  for (let a = Math.max(0, Math.min(1, requested)); a <= 1.0001; a += 0.01) {
    const onBlack = mix("#000000", surface, a), onWhite = mix("#FFFFFF", surface, a);
    if (contrast(fg, onBlack) >= 4.5 && contrast(fg, onWhite) >= 4.5) return +a.toFixed(2);
  }
  return 1;
}

/** Resolved CSS variables for a material in one scheme. */
export function materialVars(material: Material, scheme: "light" | "dark", opts: GlassOptions = {}, tint = "#A8370A") {
  const t = semantic[scheme];
  const { blur = 20, opacity = 0.72, saturation = 1.6, tintStrength = 0.22, depth = 3 } = opts;
  if (material === "solid") return { "--orlo-material-bg": t["surface-raised"], "--orlo-material-blur": "0px", "--orlo-material-saturation": "1", "--orlo-material-depth": String(depth) };
  // Tint strength steps down until the tinted surface itself keeps body text at 4.5:1 (light tints on dark, dark tints on light).
  let strength = material === "tinted" ? Math.min(0.4, Math.max(0, tintStrength)) : 0;
  let base = mix(t["surface-raised"], tint, strength);
  while (strength > 0 && contrast(t.fg, base) < 4.6) { strength = Math.max(0, strength - 0.02); base = mix(t["surface-raised"], tint, strength); }
  const alpha = safeGlassAlpha(base, t.fg, opacity);
  const [r, g, b] = hex(base);
  return {
    "--orlo-material-bg": `rgb(${r} ${g} ${b} / ${alpha})`,
    "--orlo-material-blur": `${blur}px`,
    "--orlo-material-saturation": String(saturation),
    "--orlo-material-depth": String(depth),
    "--orlo-material-alpha": String(alpha),
    "--orlo-material-tint-strength": String(+strength.toFixed(2)),
  };
}

export { mix as mixHex };
