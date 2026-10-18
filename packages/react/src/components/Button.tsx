import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Spinner } from "./Spinner.tsx";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "accent" | "tonal" | "subtle" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  /** Icon before the label (decorative). */
  start?: ReactNode;
  /** Icon after the label (decorative). */
  end?: ReactNode;
  /** Holds geometry, announces busy, and blocks repeat activation without dropping focus. */
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "solid", size = "md", start, end, loading = false, loadingLabel = "Working", fullWidth, className, onClick, disabled, children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={["orlo-button", className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      data-full={fullWidth || undefined}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={(e) => (loading ? e.preventDefault() : onClick?.(e))}
      {...rest}
    >
      <span className="orlo-button__label">
        {start && <span className="orlo-button__icon" aria-hidden="true">{start}</span>}
        {children}
        {end && <span className="orlo-button__icon" aria-hidden="true">{end}</span>}
      </span>
      {loading && (
        <span className="orlo-button__busy" role="status">
          <Spinner size="sm" label={loadingLabel} />
        </span>
      )}
    </button>
  );
});

/** Visually joins related buttons; keeps each a separate tab stop. */
export function ButtonGroup({ children, label, attached = true }: { children: ReactNode; label: string; attached?: boolean }) {
  return <div role="group" aria-label={label} className="orlo-button-group" data-attached={attached || undefined}>{children}</div>;
}
