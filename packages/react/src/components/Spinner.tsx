export function Spinner({ size = "md", label = "Loading" }: { size?: "sm" | "md"; label?: string }) {
  return (
    <span className="orlo-spinner" data-size={size}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle className="orlo-spinner__track" cx="12" cy="12" r="9" />
        <circle className="orlo-spinner__arc" cx="12" cy="12" r="9" pathLength="100" />
      </svg>
      <span className="orlo-visually-hidden">{label}</span>
    </span>
  );
}
