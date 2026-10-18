import { useId } from "react";
import { motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { useImagePolicy } from "../provider.tsx";
import { useImageState } from "./useImageState.ts";

export type AvatarVariant = "marble" | "geometric" | "initials";
export type AvatarProps = {
  /** Accessible name. Also the default seed for generated art. */
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "away" | "offline";
  /** Generated art style when there is no photo (or it fails). Default "marble". */
  variant?: AvatarVariant;
  /** Stable, non-sensitive seed (e.g. a user ID hash). Never pass an email address. Defaults to `name`. */
  seed?: string;
};

export const initials = (name: string) =>
  name.trim().split(/\s+/).filter(Boolean).map((p) => [...p][0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";

/** FNV-1a 32-bit hash: deterministic across server and browser. */
export function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (const ch of s) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
/** Stable tint index per name (kept for initials avatars). */
export const hueFor = (name: string) => hashSeed(name) % 6;

/** Orlo's avatar palette: warm neutrals, persimmon, ink and two quiet cool tones. */
const PALETTE = ["#E9DFD1", "#C2410C", "#F0B48C", "#3D5A73", "#4F6B57", "#1C1B18", "#D8CBB8", "#8A5A3C"];

/** Deterministic art parameters for a seed. Exported for tests. */
export function avatarArt(seed: string) {
  const h = hashSeed(seed);
  const pick = (n: number) => PALETTE[(h >>> (n * 3)) % PALETTE.length];
  let c = [pick(0), pick(1), pick(2)];
  if (c[1] === c[0]) c[1] = PALETTE[(PALETTE.indexOf(c[0]) + 3) % PALETTE.length];
  if (c[2] === c[0] || c[2] === c[1]) c[2] = PALETTE[(PALETTE.indexOf(c[1]) + 2) % PALETTE.length];
  const r = (n: number, span: number) => ((h >>> n) % 1000) / 1000 * span;
  return { colors: c, rot: r(4, 360), x: r(7, 40) - 20, y: r(11, 40) - 20, s: 0.8 + r(13, 0.6), shape: h % 3 };
}

function Art({ seed, variant }: { seed: string; variant: Exclude<AvatarVariant, "initials"> }) {
  const id = useId().replace(/:/g, "");
  const a = avatarArt(seed);
  if (variant === "geometric") {
    return (
      <svg viewBox="0 0 80 80" className="orlo-avatar__art" aria-hidden="true">
        <rect width="80" height="80" fill={a.colors[0]} />
        <g transform={`rotate(${a.rot.toFixed(1)} 40 40)`}>
          {a.shape === 0 && <rect x={18 + a.x / 3} y={10} width="44" height="44" rx="10" fill={a.colors[1]} />}
          {a.shape === 1 && <circle cx={40 + a.x / 2} cy={34} r="22" fill={a.colors[1]} />}
          {a.shape === 2 && <path d={`M${12 + a.x / 3} 62 L40 ${14 + a.y / 4} L${68 + a.x / 3} 62Z`} fill={a.colors[1]} />}
          <circle cx={40 - a.x / 2} cy={58 + a.y / 6} r={14 * a.s} fill={a.colors[2]} />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 80" className="orlo-avatar__art" aria-hidden="true">
      <defs><filter id={`b${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter></defs>
      <rect width="80" height="80" fill={a.colors[0]} />
      <g filter={`url(#b${id})`} transform={`rotate(${a.rot.toFixed(1)} 40 40)`}>
        <path d={`M${10 + a.x} ${48 + a.y / 2} C 20 ${8 + a.y}, 62 ${10 - a.y / 2}, 72 46 S 40 ${86 - a.y / 3}, ${10 + a.x} ${48 + a.y / 2}Z`} fill={a.colors[1]} />
        <ellipse cx={46 - a.x / 2} cy={50 + a.y / 3} rx={18 * a.s} ry={12 * a.s} fill={a.colors[2]} />
      </g>
    </svg>
  );
}

/**
 * Circle avatar. Photo when it loads (revealed after decode); otherwise deterministic generated art from a non-sensitive seed,
 * identical on server and client. Initials are available as an explicit variant.
 */
export function Avatar({ name, src, size = "md", status, variant = "marble", seed }: AvatarProps) {
  const { state } = useImageState(src, { enabled: useImagePolicy() === "on", maxRetries: 1 });
  const { transition } = useOrloMotion();
  const label = status ? `${name} (${status})` : name;
  return (
    <span className="orlo-avatar" data-size={size} data-variant={variant} data-hue={variant === "initials" ? hueFor(name) : undefined} role="img" aria-label={label}>
      {variant === "initials" ? <span className="orlo-avatar__initials" aria-hidden="true">{initials(name)}</span> : <Art seed={seed ?? name} variant={variant} />}
      {state === "loaded" && src && <motion.img key={src} src={src} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: transition("reveal") }} />}
      {status && <span className="orlo-avatar__status" data-status={status} aria-hidden="true" />}
    </span>
  );
}

export function AvatarGroup({ people, max = 4, size = "md", variant }: { people: { name: string; src?: string; seed?: string }[]; max?: number; size?: AvatarProps["size"]; variant?: AvatarVariant }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className="orlo-avatar-group" role="group" aria-label={`${people.length} people`}>
      {shown.map((p) => <Avatar key={p.seed ?? p.name} {...p} size={size} variant={variant} />)}
      {rest > 0 && <span className="orlo-avatar" data-size={size} data-variant="more" role="img" aria-label={`and ${rest} more`}><span className="orlo-avatar__initials" aria-hidden="true">+{rest}</span></span>}
    </span>
  );
}
