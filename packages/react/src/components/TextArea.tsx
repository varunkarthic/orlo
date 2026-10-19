import { useId, type CSSProperties, type ReactNode, type TextareaHTMLAttributes } from "react";

export type TextAreaResize = "none" | "horizontal" | "vertical" | "both";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  showCount?: boolean;
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  resize?: TextAreaResize;
};

/** Grows with its content (CSS field-sizing where supported). Optional live character count and independent resize bounds. */
export function TextArea({ label, help, error, showCount, id, className, maxLength, value, minWidth, maxWidth, minHeight, maxHeight, resize, style: userStyle, ...rest }: TextAreaProps) {
  const auto = useId();
  const tid = id ?? auto;
  const message = error ?? help;
  const count = typeof value === "string" ? value.length : undefined;

  const style: CSSProperties = {
    ...(minWidth !== undefined ? { minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth, minInlineSize: typeof minWidth === "number" ? `${minWidth}px` : minWidth } : {}),
    ...(maxWidth !== undefined ? { maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth, maxInlineSize: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth } : {}),
    ...(minHeight !== undefined ? { minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight, minBlockSize: typeof minHeight === "number" ? `${minHeight}px` : minHeight } : {}),
    ...(maxHeight !== undefined ? { maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight, maxBlockSize: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight } : {}),
    ...(resize !== undefined ? { resize } : {}),
    ...userStyle,
  };

  return (
    <div className={["orlo-field", className].filter(Boolean).join(" ")} data-invalid={error ? "" : undefined}>
      <label className="orlo-field__label" htmlFor={tid}>{label}</label>
      <textarea id={tid} className="orlo-field__input orlo-textarea" data-resize={resize} maxLength={maxLength} value={value} aria-invalid={error ? true : undefined} aria-describedby={message ? `${tid}-msg` : undefined} style={style} {...rest} />
      <div className="orlo-field__foot">
        <p id={`${tid}-msg`} className="orlo-field__msg" role={error ? "alert" : undefined}>{error ? <svg className="orlo-field__status" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 4.75v3.75M8 11h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg> : null}{message}</p>
        {showCount && count !== undefined && <span className="orlo-hint" aria-live="polite">{count}{maxLength ? ` / ${maxLength}` : ""}</span>}
      </div>
    </div>
  );
}

