/** Orlo design tokens: primitive -> semantic -> component. Single source of truth. */

export const primitive = {
  neutral: {
    50: "#F7F5F0", 100: "#EFEBE3", 200: "#E2DDD2", 300: "#CBC5B8", 400: "#A39D90",
    500: "#7A7467", 600: "#5C574C", 700: "#433F37", 800: "#2C2A25", 900: "#1C1B18", 950: "#121110",
  },
  accent: { 100: "#FBE3D3", 300: "#F08A57", 400: "#E2672F", 500: "#C2410C", 600: "#A8370A", 700: "#8A2D08" },
  green: { 600: "#1F7A4D", 300: "#6CCB9A" },
  amber: { 700: "#8A5A00", 300: "#F0B94D" },
  red: { 600: "#B42318", 300: "#F59A91" },
  blue: { 600: "#1F5FA8", 300: "#8DB8EB" },
} as const;

const n = primitive.neutral;

/** Semantic roles per scheme. Keys become `--orlo-color-<key>`. */
export const semantic = {
  light: {
    canvas: n[50], surface: "#FCFBF8", "surface-raised": "#FFFFFF", "surface-selected": primitive.accent[100],
    fg: n[900], "fg-muted": n[600], "fg-inverse": n[50],
    border: n[200], "border-control": n[500],
    accent: primitive.accent[600], "accent-fg": "#FFFFFF", "accent-text": primitive.accent[600],
    focus: primitive.blue[600], scrim: "rgb(18 17 16 / 0.48)",
    success: primitive.green[600], warning: primitive.amber[700], error: primitive.red[600], info: primitive.blue[600],
  },
  dark: {
    canvas: n[950], surface: n[900], "surface-raised": n[800], "surface-selected": "#3A2418",
    fg: n[100], "fg-muted": n[400], "fg-inverse": n[900],
    border: n[800], "border-control": n[500],
    accent: primitive.accent[400], "accent-fg": n[950], "accent-text": primitive.accent[300],
    focus: primitive.blue[300], scrim: "rgb(0 0 0 / 0.6)",
    success: primitive.green[300], warning: primitive.amber[300], error: primitive.red[300], info: primitive.blue[300],
  },
} as const;

/** Identity tints (avatars, tags): [background, foreground], each pair >= 4.5:1. */
export const tints = {
  light: [["#F3DCCB", "#6B2A06"], ["#DDE7D6", "#2B4A22"], ["#D9E3F0", "#1E3D63"], ["#EADCEC", "#522A57"], ["#F1E6C4", "#5A4405"], ["#D8E9E6", "#1D4A44"]],
  dark: [["#4A2614", "#F6C9A9"], ["#26381F", "#C3DDB5"], ["#1E3049", "#BDD2EE"], ["#3C2440", "#E5C6EA"], ["#40330D", "#EBD796"], ["#183632", "#B3DDD6"]],
} as const;

/**
 * Chart palette: ordered so neighbours stay distinguishable under the common colour-vision deficiencies;
 * charts also vary dash and marker shape, so colour is never the only cue. Each ≥ 3:1 against the surface.
 */
export const chart = {
  light: ["#1F5FA8", "#C2410C", "#1F7A4D", "#7C3AED", "#A16207", "#0E7490", "#BE185D", "#4B5563"],
  dark: ["#8DB8EB", "#F59E6B", "#6CCB9A", "#B794F6", "#E8B44A", "#67C8DC", "#F38BB6", "#A3A9B5"],
} as const;

/** 4px base scale. */
export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const;
export const radius = { xs: 4, sm: 6, md: 10, lg: 14, xl: 20, "2xl": 28, full: 9999 } as const;

export const type = {
  family: {
    sans: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Helvetica Neue", Arial, sans-serif',
    display: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    /** Script-specific fallbacks appended per language (see styles: :lang()). */
    cjk: '"PingFang SC", "Hiragino Sans", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif',
    arabic: '"SF Arabic", "Noto Sans Arabic", "Segoe UI", Tahoma, sans-serif',
    devanagari: '"Kohinoor Devanagari", "Noto Sans Devanagari", "Nirmala UI", sans-serif',
  },
  /** Major-third-ish scale; display sizes are fluid between 360 px and 1440 px viewports. */
  size: {
    "2xs": "0.6875rem", xs: "0.75rem", sm: "0.875rem", md: "1rem", lg: "1.125rem", xl: "1.375rem",
    "2xl": "clamp(1.625rem, 1.4rem + 1vw, 2.125rem)", "3xl": "clamp(2rem, 1.55rem + 2vw, 3rem)",
    "4xl": "clamp(2.5rem, 1.7rem + 3.6vw, 4.25rem)", "5xl": "clamp(3rem, 1.8rem + 5.4vw, 6rem)",
  },
  leading: { none: 1, tight: 1.1, snug: 1.3, normal: 1.55, relaxed: 1.7 },
  tracking: { tighter: "-0.035em", tight: "-0.02em", normal: "0", wide: "0.02em", caps: "0.06em" },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  measure: { narrow: "45ch", base: "68ch", wide: "85ch" },
} as const;

/**
 * Elevation: layered, warm-tinted shadows (a tight contact shadow plus a soft ambient one).
 * Dark mode relies more on surface tone and less on shadow, which barely reads on dark canvases.
 */
export const shadow = {
  light: [
    "none",
    "0 1px 2px rgb(44 30 20 / 0.06), 0 1px 1px rgb(44 30 20 / 0.04)",
    "0 2px 4px rgb(44 30 20 / 0.06), 0 4px 12px -2px rgb(44 30 20 / 0.08)",
    "0 4px 8px -2px rgb(44 30 20 / 0.08), 0 12px 28px -6px rgb(44 30 20 / 0.14)",
    "0 8px 16px -4px rgb(44 30 20 / 0.10), 0 24px 48px -12px rgb(44 30 20 / 0.22)",
    "0 12px 24px -6px rgb(44 30 20 / 0.12), 0 40px 80px -20px rgb(44 30 20 / 0.32)",
  ],
  dark: [
    "none",
    "0 1px 2px rgb(0 0 0 / 0.4)",
    "0 2px 6px rgb(0 0 0 / 0.4), 0 0 0 1px rgb(255 255 255 / 0.03)",
    "0 6px 16px -4px rgb(0 0 0 / 0.5), 0 0 0 1px rgb(255 255 255 / 0.04)",
    "0 12px 32px -8px rgb(0 0 0 / 0.6), 0 0 0 1px rgb(255 255 255 / 0.05)",
    "0 24px 64px -16px rgb(0 0 0 / 0.7), 0 0 0 1px rgb(255 255 255 / 0.06)",
  ],
} as const;

/** Control geometry per density. `touch` meets >= 44px; `compact` stays >= 24px (WCAG 2.2 AA 2.5.8). */
export const density = {
  comfortable: { control: 40, pad: 16, gap: 12 },
  compact: { control: 32, pad: 12, gap: 8 },
  touch: { control: 48, pad: 20, gap: 16 },
} as const;

/** Named stacking layers; the only z-index values Orlo uses. */
export const layer = { base: 0, sticky: 100, floating: 200, popover: 300, menu: 400, modal: 500, alert: 600, toast: 700, tooltip: 800 } as const;

/** CSS-side motion fallbacks. Spring presets live in @orlo/motion. */
export const motionCss = {
  "duration-instant": "90ms", "duration-quick": "160ms", "duration-base": "240ms", "duration-slow": "360ms",
  "ease-out": "cubic-bezier(0.2, 0, 0, 1)", "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
} as const;

/** WCAG relative luminance contrast ratio for two #RRGGBB colours. */
export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
