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
          {error ? <span aria-hidden="true">! </span> : null}{message}
        </p>
      )}
    </div>
  );
}
