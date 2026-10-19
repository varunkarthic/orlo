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

export type StatusKind = "online" | "offline" | "busy" | "away" | "pending";

export type StatusDotProps = HTMLAttributes<HTMLSpanElement> & {
  status?: StatusKind;
  /** Alias for status. */
  tone?: StatusKind;
  label?: string;
  /** Whether to render a visible text label alongside the dot. */
  showLabel?: boolean;
  ping?: boolean;
  size?: "sm" | "md" | "lg";
};

const statusTone: Record<StatusKind, "success" | "neutral" | "error" | "warning" | "accent"> = {
  online: "success",
  offline: "neutral",
  busy: "error",
  away: "warning",
  pending: "accent",
};

/**
 * Status indicator dot with tone mapping, accessible label, and optional subtle pulse ring.
 */
export function StatusDot({
  status,
  tone: toneProp,
  label,
  showLabel = false,
  ping = false,
  size = "md",
  className,
  ...rest
}: StatusDotProps) {
  const currentStatus = status ?? toneProp ?? "online";
  const tone = statusTone[currentStatus];
  const accessibleName = label ?? currentStatus[0].toUpperCase() + currentStatus.slice(1);
  return (
    <span
      className={["orlo-status-dot", className].filter(Boolean).join(" ")}
      data-status={currentStatus}
      data-tone={tone}
      data-size={size}
      role="status"
      aria-label={showLabel ? undefined : accessibleName}
      {...rest}
    >
      <span className="orlo-status-dot__indicator">
        {ping && <span className="orlo-status-dot__ping" aria-hidden="true" />}
        <span className="orlo-status-dot__core" aria-hidden="true" />
      </span>
      {showLabel ? (
        <span className="orlo-status-dot__label">{accessibleName}</span>
      ) : (
        <span className="orlo-visually-hidden">{accessibleName}</span>
      )}
    </span>
  );
}

