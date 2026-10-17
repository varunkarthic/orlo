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

/** 4px base scale. */
export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const;
export const radius = { sm: 4, md: 8, lg: 12, xl: 20, full: 9999 } as const;

export const type = {
  family: {
    sans: '"Inter Variable", Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
  },
  // fluid: clamp(min, preferred, max)
  size: {
    xs: "0.75rem", sm: "0.875rem", md: "1rem", lg: "1.25rem",
    xl: "clamp(1.5rem, 1.2rem + 1.2vw, 2rem)", "2xl": "clamp(2rem, 1.4rem + 2.4vw, 3.25rem)",
  },
  leading: { tight: 1.15, snug: 1.35, normal: 1.55 },
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
