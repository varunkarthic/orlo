import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icons } from "../internal/icons.tsx";
import { useControllable } from "../internal/hooks.ts";
import { Popover } from "./Popover.tsx";

// All dates are local, pinned to noon so DST shifts never move a day.
export const day = (y: number, m: number, d: number) => new Date(y, m, d, 12);
export const sameDay = (a?: Date | null, b?: Date | null) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const addDays = (d: Date, n: number) => day(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const addMonths = (d: Date, n: number) => { const t = day(d.getFullYear(), d.getMonth() + n, 1); const last = day(t.getFullYear(), t.getMonth() + 1, 0).getDate(); return day(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), last)); };
const cmp = (a: Date, b: Date) => day(a.getFullYear(), a.getMonth(), a.getDate()).getTime() - day(b.getFullYear(), b.getMonth(), b.getDate()).getTime();

/** First day of the week for a locale (1 = Monday … 7 = Sunday), via Intl.Locale week info where supported. */
export function weekStart(locale?: string): number {
  try {
    const l = new Intl.Locale(locale ?? navigator.language) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    return l.getWeekInfo?.().firstDay ?? l.weekInfo?.firstDay ?? 1;
  } catch { return 1; }
}

/** 6×7 grid of dates covering `month`, starting on the locale's first weekday. */
export function monthGrid(month: Date, firstDay: number): Date[] {
  const first = day(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() - (firstDay % 7) + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => addDays(first, i - offset));
}

export type DateRange = { start: Date | null; end: Date | null };
type Single = { mode?: "single"; value?: Date | null; defaultValue?: Date | null; onValueChange?: (d: Date | null) => void };
type Range = { mode: "range"; value?: DateRange; defaultValue?: DateRange; onValueChange?: (r: DateRange) => void };
export type CalendarProps = (Single | Range) & {
  locale?: string;
  min?: Date; max?: Date;
  isDateDisabled?: (d: Date) => boolean;
  autoFocus?: boolean;
  label?: string;
};

/**
 * Month grid (WAI-ARIA date grid). Arrows move by day/week (mirrored in RTL), Home/End to week edges,
 * PageUp/PageDown by month, Shift+PageUp/PageDown by year. Locale decides week start, names and digits.
 */
export function Calendar(props: CalendarProps) {
  const { locale, min, max, isDateDisabled, autoFocus, label = "Choose date" } = props;
  const range = props.mode === "range";
  const [single, setSingle] = useControllable<Date | null>(range ? undefined : props.value, range ? null : props.defaultValue ?? null, range ? undefined : props.onValueChange);
  const [rng, setRng] = useControllable<DateRange>(range ? props.value : undefined, range ? props.defaultValue ?? { start: null, end: null } : { start: null, end: null }, range ? props.onValueChange : undefined);
  const today = useMemo(() => { const n = new Date(); return day(n.getFullYear(), n.getMonth(), n.getDate()); }, []);
  const anchor = range ? rng.start : single;
  const [focus, setFocus] = useState<Date>(anchor ?? today);
  const [hover, setHover] = useState<Date | null>(null);
  const grid = useRef<HTMLTableElement>(null);
  const wantFocus = useRef(!!autoFocus);
  const id = useId();
  const first = useMemo(() => weekStart(locale), [locale]);
  const days = monthGrid(focus, first);
  const fmtMonth = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const fmtDay = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fmtWeek = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const fmtNum = new Intl.DateTimeFormat(locale, { day: "numeric" });
  const disabled = (d: Date) => (min && cmp(d, min) < 0) || (max && cmp(d, max) > 0) || !!isDateDisabled?.(d);

  useEffect(() => {
    if (!wantFocus.current) return;
    const raf = requestAnimationFrame(() => grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus());
    return () => cancelAnimationFrame(raf);
  }, [focus]);

  const select = (d: Date) => {
    if (disabled(d)) return;
    if (!range) return setSingle(d);
    if (!rng.start || rng.end) setRng({ start: d, end: null });
    else setRng(cmp(d, rng.start) < 0 ? { start: d, end: rng.start } : { start: rng.start, end: d });
  };
  const inRange = (d: Date) => {
    if (!range || !rng.start) return false;
    const end = rng.end ?? hover; if (!end) return false;
    const [a, b] = cmp(rng.start, end) <= 0 ? [rng.start, end] : [end, rng.start];
    return cmp(d, a) >= 0 && cmp(d, b) <= 0;
  };
  const onKey = (e: KeyboardEvent) => {
    const rtl = getComputedStyle(grid.current!).direction === "rtl";
    const dow = (focus.getDay() - (first % 7) + 7) % 7;
    const map: Record<string, () => Date> = {
      ArrowRight: () => addDays(focus, rtl ? -1 : 1), ArrowLeft: () => addDays(focus, rtl ? 1 : -1), ArrowDown: () => addDays(focus, 7), ArrowUp: () => addDays(focus, -7),
      Home: () => addDays(focus, -dow), End: () => addDays(focus, 6 - dow),
      PageUp: () => addMonths(focus, e.shiftKey ? -12 : -1), PageDown: () => addMonths(focus, e.shiftKey ? 12 : 1),
    };
    if (map[e.key]) { e.preventDefault(); wantFocus.current = true; setFocus(map[e.key]()); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(focus); }
  };

  return (
    <div className="orlo-calendar" role="group" aria-labelledby={`${id}-m`}>
      <div className="orlo-calendar__head">
        <button type="button" className="orlo-icon-button" data-variant="ghost" data-size="sm" aria-label="Previous month" onClick={() => setFocus(addMonths(focus, -1))}><Icons.ChevronLeft size={18} /></button>
        <h2 id={`${id}-m`} className="orlo-calendar__title" aria-live="polite">{fmtMonth.format(focus)}</h2>
        <button type="button" className="orlo-icon-button" data-variant="ghost" data-size="sm" aria-label="Next month" onClick={() => setFocus(addMonths(focus, 1))}><Icons.ChevronRight size={18} /></button>
      </div>
      <table ref={grid} role="grid" className="orlo-calendar__grid" aria-label={label} onKeyDown={onKey}>
        <thead><tr>{days.slice(0, 7).map((d) => <th key={d.getDay()} scope="col" abbr={new Intl.DateTimeFormat(locale, { weekday: "long" }).format(d)}>{fmtWeek.format(d)}</th>)}</tr></thead>
        <tbody>
          {Array.from({ length: 6 }, (_, w) => (
            <tr key={w}>
              {days.slice(w * 7, w * 7 + 7).map((d) => {
                const out = d.getMonth() !== focus.getMonth();
                const sel = range ? sameDay(d, rng.start) || sameDay(d, rng.end) : sameDay(d, single);
                const dis = disabled(d);
                return (
                  <td key={d.getTime()} role="gridcell" aria-selected={sel || undefined} data-outside={out || undefined} data-in-range={inRange(d) || undefined}
                    data-range-start={range && sameDay(d, rng.start) || undefined} data-range-end={range && sameDay(d, rng.end ?? hover) || undefined}>
                    <button type="button" tabIndex={sameDay(d, focus) ? 0 : -1} aria-label={fmtDay.format(d)} aria-current={sameDay(d, today) ? "date" : undefined}
                      aria-disabled={dis || undefined} aria-pressed={sel} className="orlo-calendar__day"
                      onClick={() => { setFocus(d); select(d); }} onPointerEnter={() => setHover(d)} onFocus={() => setHover(d)}>
                      {fmtNum.format(d)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type DatePickerProps = { label: ReactNode; value?: Date | null; defaultValue?: Date | null; onValueChange?: (d: Date | null) => void; locale?: string; min?: Date; max?: Date; placeholder?: string; help?: ReactNode };

/** Button-shaped field that opens a Calendar in a popover (a docked sheet on phones). Selecting closes it and returns focus. */
export function DatePicker({ label, value: v, defaultValue = null, onValueChange, locale, min, max, placeholder = "Select a date", help }: DatePickerProps) {
  const [value, setValue] = useControllable<Date | null>(v, defaultValue, onValueChange);
  const [open, setOpen] = useState(false);
  const id = useId();
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  return (
    <div className="orlo-field">
      <span className="orlo-field__label" id={`${id}-l`}>{label}</span>
      <Popover label="Choose date" open={open} onOpenChange={setOpen} trigger={
        <button type="button" className="orlo-field__input orlo-select" aria-labelledby={`${id}-l ${id}-v`} aria-describedby={help ? `${id}-h` : undefined}>
          <span id={`${id}-v`} data-placeholder={!value || undefined}>{value ? fmt.format(value) : placeholder}</span><Icons.Calendar size={18} />
        </button>}>
        <Calendar value={value} onValueChange={(d) => { setValue(d); setOpen(false); }} locale={locale} min={min} max={max} autoFocus />
      </Popover>
      {help && <p id={`${id}-h`} className="orlo-field__msg">{help}</p>}
    </div>
  );
}
