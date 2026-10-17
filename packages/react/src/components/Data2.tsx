import { useLocale } from "../provider.tsx";
import { Fragment, useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { Icons } from "../internal/icons.tsx";
import { useControllable } from "../internal/hooks.ts";

export type ChipProps = { children: ReactNode; icon?: ReactNode; selected?: boolean; defaultSelected?: boolean; onSelectedChange?: (s: boolean) => void; onRemove?: () => void; disabled?: boolean; kind?: "filter" | "assist" | "input" };

/**
 * Compact choices. `filter` toggles (aria-pressed) and shows a check; `assist` is a plain action;
 * `input` represents a value and can be removed with its own labelled button or Backspace/Delete.
 */
export function Chip({ children, icon, selected: s, defaultSelected = false, onSelectedChange, onRemove, disabled, kind = "filter" }: ChipProps) {
  const [selected, setSelected] = useControllable(s, defaultSelected, onSelectedChange);
  if (kind === "input") {
    return (
      <span className="orlo-chip" data-kind="input" tabIndex={0} onKeyDown={(e) => { if ((e.key === "Backspace" || e.key === "Delete") && onRemove) { e.preventDefault(); onRemove(); } }}>
        {icon && <span aria-hidden="true" className="orlo-chip__icon">{icon}</span>}<span>{children}</span>
        {onRemove && <button type="button" className="orlo-chip__remove" aria-label={`Remove ${typeof children === "string" ? children : ""}`.trim()} onClick={onRemove} tabIndex={-1}><Icons.X size={14} /></button>}
      </span>
    );
  }
  return (
    <button type="button" className="orlo-chip" data-kind={kind} aria-pressed={kind === "filter" ? selected : undefined} disabled={disabled} onClick={() => kind === "filter" && setSelected(!selected)}>
      {kind === "filter" && selected ? <span className="orlo-chip__icon" aria-hidden="true"><Icons.Check size={14} /></span> : icon ? <span aria-hidden="true" className="orlo-chip__icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}

export type TimelineItem = { title: ReactNode; time?: Date | string; body?: ReactNode; tone?: "neutral" | "accent" | "success" | "warning" | "error"; icon?: ReactNode };

/** Chronological events as an ordered list with machine-readable times. */
export function Timeline({ items, locale: localeProp }: { items: TimelineItem[]; locale?: string }) {
  const locale = useLocale(localeProp);
  // UTC makes the server-rendered fallback deterministic. Consumers that want
  // visitor-local time can opt in after hydration with their own formatted text.
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
  return (
    <ol className="orlo-timeline">
      {items.map((it, i) => (
        <li key={i} className="orlo-timeline__item" data-tone={it.tone ?? "neutral"}>
          <span className="orlo-timeline__dot" aria-hidden="true">{it.icon}</span>
          <div className="orlo-timeline__content">
            <div className="orlo-timeline__title">{it.title}</div>
            {it.time && <time className="orlo-hint" dateTime={it.time instanceof Date ? it.time.toISOString() : it.time}>{it.time instanceof Date ? fmt.format(it.time) : it.time}</time>}
            {it.body && <div className="orlo-timeline__body">{it.body}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Key–value pairs as a real description list. Long values wrap; missing values say so instead of collapsing. */
export function DataList({ items, layout = "side" }: { items: { label: ReactNode; value?: ReactNode }[]; layout?: "side" | "stacked" }) {
  return (
    <dl className="orlo-datalist" data-layout={layout}>
      {items.map((it, i) => <div key={i} className="orlo-datalist__row"><dt>{it.label}</dt><dd>{it.value ?? <span className="orlo-hint">Not set</span>}</dd></div>)}
    </dl>
  );
}

export type SparklineProps = { data: (number | null)[]; label: string; width?: number; height?: number; format?: (n: number) => string; area?: boolean };

/**
 * Tiny inline trend. Gaps (null) break the line instead of being drawn as zero. Screen readers get the label,
 * range and latest value; the full series is available as a visually hidden table.
 */
export function Sparkline({ data, label, width = 120, height = 32, format = String, area = true }: SparklineProps) {
  const nums = data.filter((d): d is number => d !== null && Number.isFinite(d));
  const id = useId();
  if (!nums.length) return <span className="orlo-hint">{label}: no data</span>;
  const lo = Math.min(...nums), hi = Math.max(...nums), span = hi - lo || 1;
  const x = (i: number) => (data.length === 1 ? width / 2 : (i / (data.length - 1)) * (width - 4) + 2);
  const y = (v: number) => height - 3 - ((v - lo) / span) * (height - 6);
  const segs: string[] = []; let cur = "";
  data.forEach((d, i) => { if (d === null || !Number.isFinite(d)) { if (cur) segs.push(cur); cur = ""; } else cur += `${cur ? "L" : "M"}${x(i).toFixed(1)} ${y(d).toFixed(1)}`; });
  if (cur) segs.push(cur);
  const lastI = data.map((d, i) => (d === null ? -1 : i)).filter((i) => i >= 0).pop()!;
  const last = data[lastI] as number;
  return (
    <span className="orlo-sparkline">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={id}>
        <title id={id}>{`${label}: from ${format(lo)} to ${format(hi)}, latest ${format(last)}`}</title>
        {area && segs.map((s, i) => <path key={`a${i}`} d={`${s}V${height}H${s.match(/M([\d.]+)/)![1]}Z`} className="orlo-sparkline__area" />)}
        {segs.map((s, i) => <path key={i} d={s} className="orlo-sparkline__line" />)}
        <circle cx={x(lastI)} cy={y(last)} r="2.5" className="orlo-sparkline__dot" />
      </svg>
      <table className="orlo-visually-hidden"><caption>{label}</caption><tbody>{data.map((d, i) => <tr key={i}><td>{i + 1}</td><td>{d === null ? "no data" : format(d)}</td></tr>)}</tbody></table>
    </span>
  );
}

export type MeterProps = { label: ReactNode; value: number; min?: number; max?: number; low?: number; high?: number; optimum?: "low" | "high"; format?: (n: number) => string; variant?: "bar" | "gauge" };

/** A measurement within a known range (disk use, battery, score) with semantic zones. Not a progress bar. */
export function Meter({ label, value, min = 0, max = 100, low, high, optimum = "low", format = (n) => `${Math.round(n)}`, variant = "bar" }: MeterProps) {
  const f = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const zone = high !== undefined && value >= high ? (optimum === "low" ? "bad" : "good") : low !== undefined && value <= low ? (optimum === "low" ? "good" : "bad") : "ok";
  const id = useId();
  const words = { good: "good", ok: "fair", bad: "critical" } as const;
  if (variant === "gauge") {
    const a = -120 + f * 240; const r = 40;
    const p = (deg: number) => `${50 + r * Math.sin((deg * Math.PI) / 180)} ${55 - r * Math.cos((deg * Math.PI) / 180)}`;
    return (
      <div className="orlo-meter" data-zone={zone} data-variant="gauge" role="meter" aria-labelledby={id} aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} aria-valuetext={`${format(value)}, ${words[zone]}`}>
        <svg viewBox="0 0 100 80" aria-hidden="true"><path d={`M${p(-120)}A${r} ${r} 0 1 1 ${p(120)}`} className="orlo-meter__track" />{f > 0.005 && <path d={`M${p(-120)}A${r} ${r} 0 ${a > 60 ? 1 : 0} 1 ${p(a)}`} className="orlo-meter__fill" />}</svg>
        <span className="orlo-meter__value">{format(value)}</span>
        <span id={id} className="orlo-hint">{label}</span>
      </div>
    );
  }
  return (
    <div className="orlo-meter" data-zone={zone}>
      <div className="orlo-progress__head"><span id={id} className="orlo-field__label">{label}</span><span className="orlo-hint">{format(value)} <span className="orlo-meter__word">· {words[zone]}</span></span></div>
      <div className="orlo-progress__track" role="meter" aria-labelledby={id} aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} aria-valuetext={`${format(value)}, ${words[zone]}`}>
        <span className="orlo-progress__bar orlo-meter__fill-bar" style={{ width: `${f * 100}%` }} />
      </div>
    </div>
  );
}

export type HeatmapProps = { data: Record<string, number>; end?: Date; weeks?: number; label: string; locale?: string; unit?: string };

/**
 * Calendar heatmap (activity over time). Five intensity steps that also differ in pattern density for low-vision users,
 * roving keyboard focus across days, and a readable label for every cell.
 */
export function Heatmap({ data, end = new Date(), weeks = 20, label, locale: localeProp, unit = "contributions" }: HeatmapProps) {
  const days = useMemo(() => {
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 12);
    const startOffset = e.getDay() + (weeks - 1) * 7;
    return Array.from({ length: startOffset + 1 }, (_, i) => new Date(e.getFullYear(), e.getMonth(), e.getDate() - startOffset + i, 12));
  }, [end, weeks]);
  const max = Math.max(1, ...Object.values(data));
  const [focus, setFocus] = useState(days.length - 1);
  const locale = useLocale(localeProp);
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" });
  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const level = (n: number) => (n <= 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)));
  const total = days.reduce((s, d) => s + (data[key(d)] ?? 0), 0);
  return (
    <div className="orlo-heatmap">
      <div role="grid" aria-label={`${label}: ${total} ${unit}`} className="orlo-heatmap__grid" style={{ gridTemplateRows: "repeat(7, 1fr)" }}
        onKeyDown={(e) => {
          const d = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 }[e.key];
          if (d !== undefined) { e.preventDefault(); const n = Math.max(0, Math.min(days.length - 1, focus + d)); setFocus(n); (e.currentTarget.children[n] as HTMLElement)?.focus(); }
        }}>
        {days.map((d, i) => {
          const n = data[key(d)] ?? 0;
          return <span key={i} role="gridcell" tabIndex={i === focus ? 0 : -1} className="orlo-heatmap__cell" data-level={level(n)} aria-label={`${fmt.format(d)}: ${n} ${unit}`} title={`${fmt.format(d)}: ${n}`} onFocus={() => setFocus(i)} />;
        })}
      </div>
      <div className="orlo-heatmap__legend" aria-hidden="true"><span className="orlo-hint">Less</span>{[0, 1, 2, 3, 4].map((l) => <span key={l} className="orlo-heatmap__cell" data-level={l} />)}<span className="orlo-hint">More</span></div>
    </div>
  );
}

/** Highlights every match of `query` in `text` with <mark>. Case- and accent-insensitive; regex characters are safe. */
export function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const t = norm(text), q = norm(query.trim());
  const out: ReactNode[] = []; let i = 0, k = 0;
  // Normalised and original strings align when diacritics are stripped per character; map by walking both.
  const map: number[] = []; for (let j = 0; j < text.length; j++) { const n = norm(text[j]).length; for (let m = 0; m < n; m++) map.push(j); }
  map.push(text.length);
  let at = t.indexOf(q);
  while (at >= 0) {
    const a = map[at], b = map[at + q.length] ?? text.length;
    if (a > i) out.push(text.slice(i, a));
    out.push(<mark key={k++} className="orlo-mark">{text.slice(a, b)}</mark>);
    i = b; at = t.indexOf(q, at + q.length);
  }
  out.push(text.slice(i));
  return <>{out.map((x, j) => <Fragment key={j}>{x}</Fragment>)}</>;
}

/** "3 minutes ago" that stays current (updating less often as it ages) with the exact time in a tooltip and datetime attribute. */
export function RelativeTime({ date, locale: localeProp }: { date: Date; locale?: string }) {
  const locale = useLocale(localeProp);
  const [now, setNow] = useState(() => date.getTime());
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setNow(Date.now()); setMounted(true); }, []);
  const diff = (date.getTime() - now) / 1000;
  const abs = Math.abs(diff);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), abs < 60 ? 1000 : abs < 3600 ? 30000 : 600000); return () => clearInterval(t); }, [abs]);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const [n, u]: [number, Intl.RelativeTimeFormatUnit] = abs < 45 ? [Math.round(diff), "second"] : abs < 2700 ? [Math.round(diff / 60), "minute"] : abs < 79200 ? [Math.round(diff / 3600), "hour"] : abs < 2592000 ? [Math.round(diff / 86400), "day"] : abs < 31536000 ? [Math.round(diff / 2592000), "month"] : [Math.round(diff / 31536000), "year"];
  const exact = new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short", timeZone: "UTC" }).format(date);
  // Before mount, show the absolute date: the server can't know "now", so relative text would mismatch on hydration.
  return <time dateTime={date.toISOString()} title={exact} className="orlo-reltime">{mounted ? rtf.format(n, u) : new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(date)}</time>;
}

/** Live countdown. Ticks visually every second but announces only at meaningful moments, and never goes negative. */
export function Countdown({ to, label, onDone }: { to: Date; label: string; onDone?: () => void }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    setLeft(Math.max(0, to.getTime() - Date.now()));
    const t = setInterval(() => { const l = Math.max(0, to.getTime() - Date.now()); setLeft(l); if (l === 0) { clearInterval(t); onDone?.(); } }, 1000);
    return () => clearInterval(t);
  }, [to, onDone]);
  if (left === null) return <div className="orlo-countdown" role="timer" aria-label={label}>{["days", "hours", "minutes", "seconds"].slice(1).map((n) => <span key={n} className="orlo-countdown__unit"><span className="orlo-countdown__num">––</span><span className="orlo-hint">{n}</span></span>)}</div>;
  const s = Math.floor(left / 1000), parts = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
  const names = ["days", "hours", "minutes", "seconds"];
  const announce = s === 0 ? `${label}: time is up` : s % 60 === 0 && s <= 600 ? `${label}: ${Math.floor(s / 60)} minutes left` : "";
  return (
    <div className="orlo-countdown" role="timer" aria-label={label}>
      {parts.map((p, i) => (i === 0 && p === 0 ? null : <span key={i} className="orlo-countdown__unit"><span className="orlo-countdown__num">{String(p).padStart(2, "0")}</span><span className="orlo-hint">{names[i]}</span></span>))}
      <span className="orlo-visually-hidden" aria-live="polite">{announce}</span>
    </div>
  );
}
