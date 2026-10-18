import type { HTMLAttributes } from "react";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "accent" | "success" | "warning" | "error" | "info";
  /** A small status dot before the label (shape cue in addition to colour). */
  dot?: boolean;
  /** Compact numeric count; values above `max` render as "max+". */
  count?: number;
  max?: number;
};

/** Quiet status label. Tone is never the only signal: pair it with words, a dot, or a count. */
export function Badge({ tone = "neutral", dot, count, max = 99, className, children, ...rest }: BadgeProps) {
  const isCount = typeof count === "number";
  return (
    <span className={["orlo-badge", className].filter(Boolean).join(" ")} data-tone={tone} data-dot={dot || undefined} data-count={isCount || undefined} {...rest}>
      {isCount ? (count > max ? `${max}+` : count) : children}
    </span>
  );
}
