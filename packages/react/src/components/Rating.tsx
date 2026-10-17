import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useControllable } from "../internal/hooks.ts";
import { Icons } from "../internal/icons.tsx";

export type RatingProps = {
  label: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (v: number) => void;
  max?: number;
  /** Display-only. Fractions render as partial stars. */
  readOnly?: boolean;
  /** Selecting the current value again clears it. */
  allowClear?: boolean;
  labels?: string[];
};

/** Star rating as a radiogroup: arrows change, hover previews on fine pointers, read-only mode shows fractions exactly. */
export function Rating({ label, value: v, defaultValue = 0, onValueChange, max = 5, readOnly, allowClear = true, labels }: RatingProps) {
  const [value, setValue] = useControllable(v, defaultValue, onValueChange);
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const name = (n: number) => labels?.[n - 1] ?? `${n} of ${max}`;
  if (readOnly) {
    return (
      <span className="orlo-rating" data-readonly="" role="img" aria-label={`${typeof label === "string" ? label + ": " : ""}${value} out of ${max}`}>
        {Array.from({ length: max }, (_, i) => {
          const fill = Math.max(0, Math.min(1, value - i));
          return <span key={i} className="orlo-rating__star" style={{ "--fill": `${fill * 100}%` } as React.CSSProperties}><Icons.Star size={20} /><Icons.Star size={20} /></span>;
        })}
      </span>
    );
  }
  const shown = hover ?? value;
  const onKey = (e: KeyboardEvent) => {
    const rtl = getComputedStyle(ref.current!).direction === "rtl";
    const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = Math.max(allowClear ? 0 : 1, Math.min(max, value + d * (rtl && (e.key === "ArrowLeft" || e.key === "ArrowRight") ? -1 : 1)));
    setValue(n);
    ref.current?.querySelectorAll<HTMLElement>("[role=radio]")[Math.max(0, n - 1)]?.focus();
  };
  return (
    <div className="orlo-rating-wrap">
      <span id={id} className="orlo-field__label">{label}</span>
      <div ref={ref} className="orlo-rating" role="radiogroup" aria-labelledby={id} onKeyDown={onKey} onPointerLeave={() => setHover(null)}>
        {Array.from({ length: max }, (_, i) => {
          const n = i + 1;
          return (
            <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={name(n)} tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
              className="orlo-rating__star" data-on={shown >= n || undefined}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(n)}
              onClick={() => setValue(allowClear && value === n ? 0 : n)}>
              <Icons.Star size={24} />
            </button>
          );
        })}
        <span className="orlo-hint orlo-rating__text" aria-hidden="true">{shown ? name(shown) : "No rating"}</span>
      </div>
    </div>
  );
}
