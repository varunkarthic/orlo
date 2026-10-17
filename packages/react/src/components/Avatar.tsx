import { motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { useImagePolicy } from "../provider.tsx";
import { useImageState } from "./useImageState.ts";

export type AvatarProps = { name: string; src?: string; size?: "sm" | "md" | "lg"; status?: "online" | "away" | "offline" };

export const initials = (name: string) =>
  name.trim().split(/\s+/).filter(Boolean).map((p) => [...p][0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";

/** Stable tint per name, so the same person keeps the same fallback colour everywhere. */
export const hueFor = (name: string) => [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 6;

/** Photo when it loads; otherwise initials on a stable tint. Never a broken image, never a stale photo from a previous src. */
export function Avatar({ name, src, size = "md", status }: AvatarProps) {
  const { state } = useImageState(src, { enabled: useImagePolicy() === "on", maxRetries: 1 });
  const { transition } = useOrloMotion();
  return (
    <span className="orlo-avatar" data-size={size} data-hue={hueFor(name)} role="img" aria-label={status ? `${name} (${status})` : name}>
      <span className="orlo-avatar__initials" aria-hidden="true">{initials(name)}</span>
      {state === "loaded" && src && <motion.img key={src} src={src} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: transition("reveal") }} />}
      {status && <span className="orlo-avatar__status" data-status={status} aria-hidden="true" />}
    </span>
  );
}

export function AvatarGroup({ people, max = 4, size = "md" }: { people: { name: string; src?: string }[]; max?: number; size?: AvatarProps["size"] }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className="orlo-avatar-group" role="group" aria-label={`${people.length} people`}>
      {shown.map((p) => <Avatar key={p.name} {...p} size={size} />)}
      {rest > 0 && <span className="orlo-avatar" data-size={size} data-hue="more" role="img" aria-label={`and ${rest} more`}><span className="orlo-avatar__initials" aria-hidden="true">+{rest}</span></span>}
    </span>
  );
}
