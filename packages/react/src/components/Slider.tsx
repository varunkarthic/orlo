import { useId, type ReactNode } from "react";
import { useControllable } from "../internal/hooks.ts";

export type SliderProps = {
  label: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  name?: string;
  disabled?: boolean;
  /** Formats the visible and announced value, e.g. v => `${v}%`. */
  format?: (v: number) => string;
};

/** Native range input, styled: keyboard, touch, pen and assistive tech behave as the platform intends. */
export function Slider({ label, value: v, defaultValue = 50, onValueChange, min = 0, max = 100, step = 1, name, disabled, format = String }: SliderProps) {
  const [value, setValue] = useControllable(v, defaultValue, onValueChange);
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="orlo-slider">
      <div className="orlo-slider__head">
        <label htmlFor={id} className="orlo-field__label">{label}</label>
        <output htmlFor={id} className="orlo-slider__value">{format(value)}</output>
      </div>
      <input
        id={id} type="range" name={name} min={min} max={max} step={step} value={value} disabled={disabled}
        aria-valuetext={format(value)}
        style={{ "--orlo-fill": `${pct}%` } as React.CSSProperties}
        onChange={(e) => setValue(+e.target.value)}
      />
    </div>
  );
}
