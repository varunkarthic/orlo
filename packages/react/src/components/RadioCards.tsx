import type { ReactNode } from "react";

export type RadioCardsProps = {
  legend: ReactNode;
  name: string;
  options: { value: string; title: ReactNode; description?: ReactNode; icon?: ReactNode; meta?: ReactNode; disabled?: boolean }[];
  value?: string; defaultValue?: string; onValueChange?: (v: string) => void;
  columns?: number;
};

/** Larger choice targets for decisions that need explanation (plans, shipping, roles). Native radios underneath. */
export function RadioCards({ legend, name, options, value, defaultValue, onValueChange, columns }: RadioCardsProps) {
  return (
    <fieldset className="orlo-radio-cards" style={columns ? ({ "--cols": columns } as React.CSSProperties) : undefined}>
      <legend className="orlo-field__label">{legend}</legend>
      <div className="orlo-radio-cards__grid">
        {options.map((o) => (
          <label key={o.value} className="orlo-radio-card" data-disabled={o.disabled || undefined}>
            <input type="radio" name={name} value={o.value} disabled={o.disabled} {...(value !== undefined ? { checked: value === o.value } : { defaultChecked: defaultValue === o.value })} onChange={(e) => e.target.checked && onValueChange?.(o.value)} />
            {o.icon && <span className="orlo-radio-card__icon" aria-hidden="true">{o.icon}</span>}
            <span className="orlo-radio-card__title">{o.title}</span>
            {o.description && <span className="orlo-hint">{o.description}</span>}
            {o.meta && <span className="orlo-radio-card__meta">{o.meta}</span>}
            <span className="orlo-radio-card__check" aria-hidden="true" />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
