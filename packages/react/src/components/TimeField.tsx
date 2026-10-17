import { useId, useMemo, useRef, type KeyboardEvent, type ReactNode } from "react";
import { useControllable } from "../internal/hooks.ts";

export type TimeFieldProps = { label: ReactNode; value?: string | null; defaultValue?: string | null; onValueChange?: (v: string | null) => void; locale?: string; minuteStep?: number; help?: ReactNode };

/**
 * Segmented time entry ("HH:MM", 24-hour value) that displays the locale's 12- or 24-hour convention.
 * Each segment is a spinbutton: type digits (auto-advance), arrows step and wrap, Backspace clears.
 */
export function TimeField({ label, value: v, defaultValue = null, onValueChange, locale, minuteStep = 1, help }: TimeFieldProps) {
  const [value, setValue] = useControllable<string | null>(v, defaultValue, onValueChange);
  const hour12 = useMemo(() => new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hour12 ?? false, [locale]);
  const id = useId();
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const buf = useRef("");
  const [h, m] = value ? value.split(":").map(Number) : [null, null];
  const emit = (hh: number | null, mm: number | null) => setValue(hh === null && mm === null ? null : `${String(hh ?? 0).padStart(2, "0")}:${String(mm ?? 0).padStart(2, "0")}`);
  const pm = h !== null && h >= 12;
  const dispH = h === null ? "––" : String(hour12 ? ((h + 11) % 12) + 1 : h).padStart(2, "0");
  const dispM = m === null ? "––" : String(m).padStart(2, "0");
  const dayPeriod = (p: "am" | "pm") => new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true }).formatToParts(new Date(2000, 0, 1, p === "am" ? 9 : 21)).find((x) => x.type === "dayPeriod")?.value ?? p.toUpperCase();

  const seg = (i: number, kind: "h" | "m" | "p") => (e: KeyboardEvent) => {
    const next = () => refs.current[i + 1]?.focus();
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault(); const d = e.key === "ArrowUp" ? 1 : -1;
      if (kind === "h") emit(((h ?? 0) + d + 24) % 24, m);
      else if (kind === "m") emit(h, ((m ?? 0) + d * minuteStep + 60) % 60);
      else emit(((h ?? 0) + 12) % 24, m);
    } else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); refs.current[i - 1]?.focus(); }
    else if (e.key === "Backspace") { e.preventDefault(); buf.current = ""; kind === "h" ? emit(null, m) : emit(h, null); }
    else if (kind === "p" && /^[ap]$/i.test(e.key)) { e.preventDefault(); const wantPm = e.key.toLowerCase() === "p"; if (h !== null && wantPm !== pm) emit((h + 12) % 24, m); }
    else if (/^\d$/.test(e.key)) {
      e.preventDefault(); buf.current = (buf.current + e.key).slice(-2); const n = Number(buf.current);
      if (kind === "h") {
        const hh = hour12 ? (n === 12 ? 0 : n % 12) + (pm ? 12 : 0) : n;
        if ((hour12 ? n >= 1 && n <= 12 : n <= 23)) emit(hh, m);
        if (buf.current.length === 2 || n > (hour12 ? 1 : 2)) { buf.current = ""; next(); }
      } else if (kind === "m") {
        if (n <= 59) emit(h, n);
        if (buf.current.length === 2 || n > 5) { buf.current = ""; next(); }
      }
    }
  };
  const common = (i: number) => ({ ref: (el: HTMLSpanElement | null) => { refs.current[i] = el; }, tabIndex: 0, className: "orlo-time__seg", onFocus: () => (buf.current = ""), onBlur: () => (buf.current = "") });
  return (
    <div className="orlo-field">
      <span id={`${id}-l`} className="orlo-field__label">{label}</span>
      <div className="orlo-field__input orlo-time" role="group" aria-labelledby={`${id}-l`} aria-describedby={help ? `${id}-h` : undefined}>
        <span {...common(0)} role="spinbutton" aria-label="Hours" aria-valuenow={h ?? undefined} aria-valuetext={h === null ? "Empty" : dispH} aria-valuemin={hour12 ? 1 : 0} aria-valuemax={hour12 ? 12 : 23} data-empty={h === null || undefined} onKeyDown={seg(0, "h")}>{dispH}</span>
        <span aria-hidden="true">:</span>
        <span {...common(1)} role="spinbutton" aria-label="Minutes" aria-valuenow={m ?? undefined} aria-valuetext={m === null ? "Empty" : dispM} aria-valuemin={0} aria-valuemax={59} data-empty={m === null || undefined} onKeyDown={seg(1, "m")}>{dispM}</span>
        {hour12 && <span {...common(2)} role="spinbutton" aria-label="AM/PM" aria-valuetext={pm ? dayPeriod("pm") : dayPeriod("am")} onKeyDown={seg(2, "p")}>{pm ? dayPeriod("pm") : dayPeriod("am")}</span>}
      </div>
      {help && <p id={`${id}-h`} className="orlo-field__msg">{help}</p>}
    </div>
  );
}
