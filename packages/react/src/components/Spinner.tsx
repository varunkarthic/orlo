export function Spinner({ size = "md", label = "Loading" }: { size?: "sm" | "md"; label?: string }) {
  return (
    <span className="orlo-spinner" data-size={size}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="42 100" strokeLinecap="butt" />
      </svg>
      <span className="orlo-visually-hidden">{label}</span>
    </span>
  );
}
