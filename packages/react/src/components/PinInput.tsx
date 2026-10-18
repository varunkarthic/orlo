import { useRef, useId, type ReactNode } from "react";
import { useControllable } from "../internal/hooks.ts";

export type PinInputProps = {
  label: ReactNode;
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  onComplete?: (v: string) => void;
  /** Digits only (default) or any alphanumeric. */
  type?: "numeric" | "alphanumeric";
  mask?: boolean;
  error?: ReactNode;
  disabled?: boolean;
};

/**
 * One-time code entry. Typing advances, Backspace steps back, arrows move, paste fills every box at once,
 * and the first box offers the platform's one-time-code autofill.
 */
export function PinInput({ label, length = 6, value: v, defaultValue = "", onValueChange, onComplete, type = "numeric", mask, error, disabled }: PinInputProps) {
  const [value, setValue] = useControllable(v, defaultValue, onValueChange);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const id = useId();
  const ok = type === "numeric" ? /\d/ : /[a-z0-9]/i;
  const chars = Array.from({ length }, (_, i) => value[i] ?? "");
  const write = (next: string, focus: number) => {
    const clean = next.slice(0, length);
    setValue(clean);
    refs.current[Math.min(focus, length - 1)]?.focus();
    if (clean.length === length && !clean.includes(" ")) onComplete?.(clean);
  };
  const setAt = (i: number, ch: string) => { const arr = chars.slice(); arr[i] = ch; return arr.join("").replace(/\s+$/, ""); };
  return (
    <fieldset className="orlo-pin" disabled={disabled} data-invalid={error ? "" : undefined} aria-describedby={error ? `${id}-e` : undefined}>
      <legend className="orlo-field__label">{label}</legend>
      <div className="orlo-pin__boxes">
        {chars.map((c, i) => (
          <input key={i} ref={(el) => { refs.current[i] = el; }} className="orlo-pin__box" value={c} inputMode={type === "numeric" ? "numeric" : "text"}
            type={mask ? "password" : "text"} autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={length} aria-label={`Character ${i + 1} of ${length}`}
            aria-invalid={error ? true : undefined}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const typed = e.target.value.split("").filter((x) => ok.test(x));
              if (typed.length > 1) return write((value.slice(0, i) + typed.join("")).slice(0, length), i + typed.length); // autofill or paste into one box
              if (typed[0]) write(setAt(i, type === "numeric" ? typed[0] : typed[0].toUpperCase()), i + 1);
            }}
            onPaste={(e) => { e.preventDefault(); const t = e.clipboardData.getData("text").split("").filter((x) => ok.test(x)).join(""); if (t) write((value.slice(0, i) + t).slice(0, length), i + t.length); }}
            onKeyDown={(e) => {
              if (e.key === "Backspace") { e.preventDefault(); if (c) write(setAt(i, " ").trimEnd(), i); else if (i > 0) write(setAt(i - 1, " ").trimEnd(), i - 1); }
              else if (e.key === "ArrowLeft") { e.preventDefault(); refs.current[i - 1]?.focus(); }
              else if (e.key === "ArrowRight") { e.preventDefault(); refs.current[i + 1]?.focus(); }
            }} />
        ))}
      </div>
      {error && <p id={`${id}-e`} className="orlo-field__msg" role="alert" style={{ color: "var(--orlo-color-error)" }}><svg className="orlo-field__status" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 4.75v3.75M8 11h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>{error}</p>}
    </fieldset>
  );
}
