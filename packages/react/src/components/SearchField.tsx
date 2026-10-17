import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useControllable } from "../internal/hooks.ts";
import { Icons } from "../internal/icons.tsx";
import { Spinner } from "./Spinner.tsx";

export type SearchFieldProps = {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  /** Debounced; never fires mid-IME composition. */
  onSearch?: (v: string) => void;
  debounce?: number;
  loading?: boolean;
  placeholder?: string;
  /** Hide the visible label (still announced). */
  hideLabel?: boolean;
  results?: ReactNode;
};

/** Search input with clear button, Escape to clear, a debounced IME-safe onSearch and an in-place busy state. */
export function SearchField({ label, value: v, defaultValue = "", onValueChange, onSearch, debounce = 250, loading, placeholder = "Search", hideLabel }: SearchFieldProps) {
  const [value, setValue] = useControllable(v, defaultValue, onValueChange);
  const [composing, setComposing] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();
  const cb = useRef(onSearch); cb.current = onSearch;
  useEffect(() => {
    if (composing) return;
    const t = setTimeout(() => cb.current?.(value), debounce);
    return () => clearTimeout(t);
  }, [value, composing, debounce]);
  return (
    <div className="orlo-field" role="search">
      <label className={hideLabel ? "orlo-visually-hidden" : "orlo-field__label"} htmlFor={id}>{label}</label>
      <div className="orlo-input-group orlo-search">
        <span className="orlo-input-group__icon" aria-hidden="true">{loading ? <Spinner size="sm" label="" /> : <Icons.Search size={18} />}</span>
        <input ref={ref} id={id} type="search" className="orlo-field__input" placeholder={placeholder} value={value} aria-busy={loading || undefined}
          onChange={(e) => setValue(e.target.value)} onCompositionStart={() => setComposing(true)} onCompositionEnd={(e) => { setComposing(false); setValue(e.currentTarget.value); }}
          onKeyDown={(e) => { if (e.key === "Escape" && value) { e.preventDefault(); e.stopPropagation(); setValue(""); } }} />
        {value && <button type="button" className="orlo-input-group__action" aria-label="Clear search" onMouseDown={(e) => e.preventDefault()} onClick={() => { setValue(""); ref.current?.focus(); }}><Icons.X size={16} /></button>}
      </div>
      {loading && <span className="orlo-visually-hidden" role="status">Searching</span>}
    </div>
  );
}
