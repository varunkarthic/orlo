import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useControllable } from "../internal/hooks.ts";

export type PinInputProps = {
  label: ReactNode;
  /** Configurable length 1–16 digits (presets: 3, 4, 6, 8, 12, 16). Default is 6. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  onComplete?: (v: string) => void;
  /** Digits only (default) or any alphanumeric. */
  type?: "numeric" | "alphanumeric";
  mask?: boolean;
  error?: ReactNode;
  onErrorClear?: () => void;
  disabled?: boolean;
  /** Group size for visual separator (e.g. 3 for 3-3, 4 for 4-4). Defaults to 4 for >=12, 3 for >=6, 0 otherwise. */
  groupSize?: number;
};

/**
 * One-time code entry. Typing advances, Backspace steps back, arrows move, paste fills every box at once,
 * and the first box offers the platform's one-time-code autofill. Automatically clears stale validation error on edit.
 */
export function PinInput({ label, length = 6, value: v, defaultValue = "", onValueChange, onComplete, type = "numeric", mask, error, onErrorClear, disabled, groupSize }: PinInputProps) {
  const safeLength = Math.max(1, Math.min(16, length));
  const [value, setValue] = useControllable(v, defaultValue, onValueChange);
  const [clearedError, setClearedError] = useState(false);
  const activeError = clearedError ? undefined : error;

  useEffect(() => {
    setClearedError(false);
  }, [error]);

  const clearStaleError = () => {
    if (!clearedError && error) {
      setClearedError(true);
      onErrorClear?.();
    }
  };

  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const id = useId();
  const ok = type === "numeric" ? /\d/ : /[a-z0-9]/i;
  const chars = Array.from({ length: safeLength }, (_, i) => value[i] ?? "");
  const group = groupSize !== undefined ? groupSize : safeLength >= 12 ? 4 : safeLength >= 6 ? 3 : 0;

  const write = (next: string, focus: number) => {
    clearStaleError();
    const clean = next.slice(0, safeLength);
    setValue(clean);
    refs.current[Math.min(focus, safeLength - 1)]?.focus();
    if (clean.length === safeLength && !clean.includes(" ")) onComplete?.(clean);
  };

  const setAt = (i: number, ch: string) => {
    const arr = chars.slice();
    arr[i] = ch;
    return arr.join("").replace(/\s+$/, "");
  };

  return (
    <fieldset className="orlo-pin" disabled={disabled} data-invalid={activeError ? "" : undefined} aria-describedby={activeError ? `${id}-e` : undefined}>
      <legend className="orlo-field__label">{label}</legend>
      <div className="orlo-pin__boxes">
        {chars.map((c, i) => {
          const showSep = group > 0 && i > 0 && i % group === 0;
          return (
            <span key={i} className="orlo-pin__cell">
              {showSep && <span className="orlo-pin__sep" aria-hidden="true">−</span>}
              <input
                ref={(el) => { refs.current[i] = el; }}
                className="orlo-pin__box"
                value={c}
                inputMode={type === "numeric" ? "numeric" : "text"}
                type={mask ? "password" : "text"}
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={safeLength}
                aria-label={`Character ${i + 1} of ${safeLength}`}
                aria-invalid={activeError ? true : undefined}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const typed = e.target.value.split("").filter((x) => ok.test(x));
                  if (typed.length > 1) return write((value.slice(0, i) + typed.join("")).slice(0, safeLength), i + typed.length);
                  if (typed[0]) write(setAt(i, type === "numeric" ? typed[0] : typed[0].toUpperCase()), i + 1);
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const t = e.clipboardData.getData("text").split("").filter((x) => ok.test(x)).join("");
                  if (t) write((value.slice(0, i) + t).slice(0, safeLength), i + t.length);
                }}
                onKeyDown={(e) => {
                  clearStaleError();
                  if (e.key === "Backspace") {
                    e.preventDefault();
                    if (c) write(setAt(i, " ").trimEnd(), i);
                    else if (i > 0) write(setAt(i - 1, " ").trimEnd(), i - 1);
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    refs.current[i - 1]?.focus();
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    refs.current[i + 1]?.focus();
                  }
                }}
              />
            </span>
          );
        })}
      </div>
      {activeError && (
        <p id={`${id}-e`} className="orlo-field__msg" role="alert" style={{ color: "var(--orlo-color-error)" }}>
          <svg className="orlo-field__status" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
            <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.75v3.75M8 11h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {activeError}
        </p>
      )}
    </fieldset>
  );
}

