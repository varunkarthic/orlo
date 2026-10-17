import { useLocale } from "../provider.tsx";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useControllable } from "../internal/hooks.ts";
import { Icons } from "../internal/icons.tsx";

/** Parses a number typed in the user's locale ("1.234,5" in de, "1,234.5" in en). Returns null when not a number. */
export function parseLocaleNumber(text: string, locale?: string): number | null {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const norm = text.trim().replace(/[\s  ]/g, "").split(group).join("").replace(decimal, ".").replace(/[^\d.+-]/g, "");
  if (!norm || norm === "-" || norm === ".") return null;
  const n = Number(norm);
  return Number.isFinite(n) ? n : null;
}

export type NumberFieldProps = {
  label: ReactNode;
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (v: number | null) => void;
  min?: number; max?: number; step?: number;
  /** Intl options for display, e.g. { style: "currency", currency: "EUR" }. */
  format?: Intl.NumberFormatOptions;
  locale?: string;
  help?: ReactNode;
  disabled?: boolean;
  name?: string;
};

/** Spinbutton with locale-aware parsing and formatting, clamping on commit, PageUp/PageDown ×10, and hold-to-repeat steppers. */
export function NumberField({ label, value: v, defaultValue = null, onValueChange, min = -Infinity, max = Infinity, step = 1, format, locale: localeProp, help, disabled, name }: NumberFieldProps) {
  const [value, setValue] = useControllable<number | null>(v, defaultValue, onValueChange);
  const locale = useLocale(localeProp);
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 20, ...format }), [locale, format]);
  const [text, setText] = useState(value === null ? "" : fmt.format(value));
  const [editing, setEditing] = useState(false);
  const id = useId();
  const repeat = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => { if (!editing) setText(value === null ? "" : fmt.format(value)); }, [value, editing, fmt]);
  useEffect(() => () => clearTimeout(repeat.current), []);
  const clamp = (n: number) => Math.min(max, Math.max(min, +n.toFixed(10)));
  const commit = (n: number | null) => { const c = n === null ? null : clamp(n); setValue(c); setText(c === null ? "" : fmt.format(c)); };
  const bump = (d: number) => commit((value ?? (min > -Infinity ? min : 0)) + d);
  const hold = (d: number) => {
    bump(d);
    const go = (delay: number) => { repeat.current = setTimeout(() => { bump(d); go(Math.max(40, delay * 0.85)); }, delay); };
    go(400);
  };
  const stop = () => clearTimeout(repeat.current);
  return (
    <div className="orlo-field">
      <label className="orlo-field__label" htmlFor={id}>{label}</label>
      <div className="orlo-input-group orlo-number-field">
        <button type="button" tabIndex={-1} aria-label="Decrease" className="orlo-input-group__action" disabled={disabled || (value ?? 0) <= min}
          onPointerDown={(e) => { e.preventDefault(); hold(-step); }} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}><Icons.Minus size={18} /></button>
        <input id={id} className="orlo-field__input" role="spinbutton" inputMode="decimal" autoComplete="off" disabled={disabled} name={name}
          aria-valuenow={value ?? undefined} aria-valuemin={Number.isFinite(min) ? min : undefined} aria-valuemax={Number.isFinite(max) ? max : undefined}
          aria-valuetext={value === null ? "Empty" : fmt.format(value)} aria-describedby={help ? `${id}-h` : undefined}
          value={text}
          onFocus={() => setEditing(true)}
          onChange={(e) => { setText(e.target.value); const n = parseLocaleNumber(e.target.value, locale); if (n !== null && n >= min && n <= max) setValue(n); }}
          onBlur={() => { setEditing(false); commit(parseLocaleNumber(text, locale)); }}
          onKeyDown={(e) => {
            const big = step * 10;
            const map: Record<string, () => void> = { ArrowUp: () => bump(step), ArrowDown: () => bump(-step), PageUp: () => bump(big), PageDown: () => bump(-big), Home: () => Number.isFinite(min) && commit(min), End: () => Number.isFinite(max) && commit(max), Enter: () => commit(parseLocaleNumber(text, locale)) };
            if (map[e.key]) { e.preventDefault(); map[e.key](); }
          }} />
        <button type="button" tabIndex={-1} aria-label="Increase" className="orlo-input-group__action" disabled={disabled || (value ?? 0) >= max}
          onPointerDown={(e) => { e.preventDefault(); hold(step); }} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}><Icons.Plus size={18} /></button>
      </div>
      {help && <p id={`${id}-h`} className="orlo-field__msg">{help}</p>}
    </div>
  );
}
