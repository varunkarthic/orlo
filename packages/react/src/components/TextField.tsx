import { useId, type InputHTMLAttributes, type ReactNode } from "react";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: ReactNode;
  help?: ReactNode;
  /** Error text. Invalid state is announced and styled, never colour alone. */
  error?: ReactNode;
};

/** Message area always reserves one line when help/error exist so validation does not shift layout unpredictably. */
export function TextField({ label, help, error, id, className, ...rest }: TextFieldProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const msgId = `${inputId}-msg`;
  const message = error ?? help;
  return (
    <div className={["orlo-field", className].filter(Boolean).join(" ")} data-invalid={error ? "" : undefined}>
      <label className="orlo-field__label" htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className="orlo-field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? msgId : undefined}
        {...rest}
      />
      {message !== undefined && (
        <p id={msgId} className="orlo-field__msg" role={error ? "alert" : undefined}>
          {error ? <svg className="orlo-field__status" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 4.75v3.75M8 11h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg> : null}{message}
        </p>
      )}
    </div>
  );
}
