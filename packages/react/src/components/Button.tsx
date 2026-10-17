import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner.tsx";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "subtle" | "ghost" | "danger";
  /** Holds geometry, announces busy, and blocks repeat activation without dropping focus. */
  loading?: boolean;
  loadingLabel?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "solid", loading = false, loadingLabel = "Working", className, onClick, disabled, children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={["orlo-button", className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-loading={loading || undefined}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={(e) => (loading ? e.preventDefault() : onClick?.(e))}
      {...rest}
    >
      <span className="orlo-button__label">{children}</span>
      {loading && (
        <span className="orlo-button__busy" role="status">
          <Spinner size="sm" label={loadingLabel} />
        </span>
      )}
    </button>
  );
});
