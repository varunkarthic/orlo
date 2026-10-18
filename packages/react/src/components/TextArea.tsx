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
        <p id={`${tid}-msg`} className="orlo-field__msg" role={error ? "alert" : undefined}>{error ? <svg className="orlo-field__status" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 4.75v3.75M8 11h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg> : null}{message}</p>
        {showCount && count !== undefined && <span className="orlo-hint" aria-live="polite">{count}{maxLength ? ` / ${maxLength}` : ""}</span>}
      </div>
    </div>
  );
}
