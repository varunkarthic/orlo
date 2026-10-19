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

/**
 * Semantic roles per scheme. Keys become `--orlo-color-<key>`.
 * Quiet precision: neutrals carry the interface; the accent is reserved for primary actions,
 * selection indicators and links in prose.
 */
export const semantic = {
  light: {
    canvas: "#FAF9F6", surface: "#FFFFFF", "surface-raised": "#FFFFFF", "surface-sunken": "#F2F0EB", "surface-selected": "#EEECE6",
    fg: n[900], "fg-muted": n[600], "fg-subtle": "#8A8478", "fg-inverse": n[50],
    border: "#E6E3DC", "border-control": "#8C867A",
    accent: primitive.accent[600], "accent-fg": "#FFFFFF", "accent-text": primitive.accent[600], "accent-subtle": "#FBEEE6",
    focus: primitive.blue[600], scrim: "rgb(18 17 16 / 0.36)",
    success: primitive.green[600], warning: primitive.amber[700], error: primitive.red[600], info: primitive.blue[600],
  },
  dark: {
    canvas: "#131211", surface: "#1A1917", "surface-raised": "#22211F", "surface-sunken": "#0E0D0C", "surface-selected": "#2B2926",
    fg: "#EFEBE3", "fg-muted": "#A8A296", "fg-subtle": "#7C776D", "fg-inverse": n[900],
    border: "#2C2A27", "border-control": "#76716A",
    accent: primitive.accent[400], "accent-fg": n[950], "accent-text": primitive.accent[300], "accent-subtle": "#33221A",
    focus: primitive.blue[300], scrim: "rgb(0 0 0 / 0.55)",
    success: primitive.green[300], warning: primitive.amber[300], error: primitive.red[300], info: primitive.blue[300],
  },
} as const;

/** Fixed badge identity colours. Embeddable badges do not inherit the host page's theme. */
export const brandBadge = {
  dark: { bg: primitive.neutral[950], fg: semantic.light.canvas, border: primitive.neutral[700] },
  light: { bg: semantic.light.surface, fg: primitive.neutral[900], border: semantic.light.border },
  accent: { bg: primitive.accent[600], fg: semantic.light.surface, border: primitive.accent[700] },
  outline: { bg: semantic.light.canvas, fg: primitive.neutral[900], border: primitive.neutral[500] },
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
/**
 * Spacing standards. Every gap in Orlo names one of these roles instead of a raw number.
 * - icon-sm / icon / icon-lg: between an icon and the text beside it (small, default, large controls).
 * - label: label to its control. message: control to its hint or error.
 * - inline: sibling controls in a row. field: between form fields. group: between groups in a panel.
 * - section: between page sections. inset-sm / inset / inset-lg: padding inside small, default and large surfaces.
 */
export const rhythm = {
  "icon-sm": 6, icon: 8, "icon-lg": 10,
  label: 8, message: 6,
  inline: 12, field: 24, group: 32, section: 72,
  "inset-sm": 16, inset: 24, "inset-lg": 32,
} as const;
/** The icon size that pairs with each text size: about 1.15 to 1.25 times the font size, so strokes match text weight. */
export const iconSize = { xs: 14, sm: 16, md: 20, lg: 22, xl: 24 } as const;

/** Radius roles: xs badges/keycaps · sm chips, menu items · md buttons, fields · lg cards, menus · xl dialogs, sheets · full icon buttons, avatars, switches. */
export const radius = { xs: 4, sm: 8, md: 10, lg: 14, xl: 20, "2xl": 28, full: 9999 } as const;

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
  tracking: { tighter: "-0.025em", tight: "-0.015em", normal: "0", wide: "0.02em", caps: "0.06em" },
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
    "0 1px 2px rgb(28 27 24 / 0.05)",
    "0 1px 2px rgb(28 27 24 / 0.04), 0 4px 12px -4px rgb(28 27 24 / 0.08)",
    "0 2px 4px -2px rgb(28 27 24 / 0.06), 0 12px 24px -8px rgb(28 27 24 / 0.12)",
    "0 4px 8px -4px rgb(28 27 24 / 0.08), 0 20px 40px -12px rgb(28 27 24 / 0.16)",
    "0 8px 16px -8px rgb(28 27 24 / 0.10), 0 32px 64px -16px rgb(28 27 24 / 0.22)",
  ],
  dark: [
    "none",
    "0 1px 2px rgb(0 0 0 / 0.35)",
    "0 2px 6px rgb(0 0 0 / 0.35)",
    "0 6px 16px -4px rgb(0 0 0 / 0.45)",
    "0 12px 32px -8px rgb(0 0 0 / 0.55)",
    "0 24px 64px -16px rgb(0 0 0 / 0.65)",
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
