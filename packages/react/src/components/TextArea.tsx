import { useId, type ReactNode, type TextareaHTMLAttributes } from "react";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: ReactNode; help?: ReactNode; error?: ReactNode; showCount?: boolean };

/** Grows with its content (CSS field-sizing where supported). Optional live character count against maxLength. */
export function TextArea({ label, help, error, showCount, id, className, maxLength, value, ...rest }: TextAreaProps) {
  const auto = useId();
  const tid = id ?? auto;
  const message = error ?? help;
  const count = typeof value === "string" ? value.length : undefined;
  return (
    <div className={["orlo-field", className].filter(Boolean).join(" ")} data-invalid={error ? "" : undefined}>
      <label className="orlo-field__label" htmlFor={tid}>{label}</label>
      <textarea id={tid} className="orlo-field__input orlo-textarea" maxLength={maxLength} value={value} aria-invalid={error ? true : undefined} aria-describedby={message ? `${tid}-msg` : undefined} {...rest} />
      <div className="orlo-field__foot">
        <p id={`${tid}-msg`} className="orlo-field__msg" role={error ? "alert" : undefined}>{error ? <span aria-hidden="true">! </span> : null}{message}</p>
        {showCount && count !== undefined && <span className="orlo-hint" aria-live="polite">{count}{maxLength ? ` / ${maxLength}` : ""}</span>}
      </div>
    </div>
  );
}
