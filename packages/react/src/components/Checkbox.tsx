import { forwardRef, useEffect, useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode } from "react";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode; indeterminate?: boolean; description?: ReactNode; hideLabel?: boolean };

/** A native checkbox, styled. Native semantics, forms and autofill keep working. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, indeterminate, description, className, id, hideLabel, ...rest }, ref) {
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current!);
  useEffect(() => { if (inner.current) inner.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <label className={["orlo-check", className].filter(Boolean).join(" ")}>
      <input ref={inner} type="checkbox" className="orlo-check__input" aria-label={hideLabel && typeof label === "string" ? label : undefined} aria-checked={indeterminate ? "mixed" : undefined} id={id} {...rest} />
      <span className="orlo-check__box" aria-hidden="true">
        <svg viewBox="0 0 16 16"><path className="tick" d="M3.5 8.5l3 3 6-7" /><path className="dash" d="M4 8h8" /></svg>
      </span>
      <span className={hideLabel ? "orlo-visually-hidden" : "orlo-check__text"}>{label}{description && <span className="orlo-hint">{description}</span>}</span>
    </label>
  );
});

export type RadioGroupProps = {
  legend: ReactNode;
  name: string;
  options: { value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  orientation?: "vertical" | "horizontal";
};

/** Native radios in a fieldset: arrow keys, form submission and screen-reader grouping come from the platform. */
export function RadioGroup({ legend, name, options, value, defaultValue, onValueChange, orientation = "vertical" }: RadioGroupProps) {
  return (
    <fieldset className="orlo-radio-group" data-orientation={orientation}>
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o.value} className="orlo-check" data-radio="">
          <input
            type="radio" name={name} value={o.value} disabled={o.disabled} className="orlo-check__input"
            {...(value !== undefined ? { checked: value === o.value } : { defaultChecked: defaultValue === o.value })}
            onChange={(e) => e.target.checked && onValueChange?.(o.value)}
          />
          <span className="orlo-check__box" aria-hidden="true"><span className="dot" /></span>
          <span className="orlo-check__text">{o.label}{o.description && <span className="orlo-hint">{o.description}</span>}</span>
        </label>
      ))}
    </fieldset>
  );
}
