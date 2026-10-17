import type { HTMLAttributes } from "react";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "accent" | "success" | "warning" | "error" | "info" };

/** Tone is never the only signal: pass meaningful text. */
export function Badge({ tone = "neutral", className, ...rest }: BadgeProps) {
  return <span className={["orlo-badge", className].filter(Boolean).join(" ")} data-tone={tone} {...rest} />;
}
