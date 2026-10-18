import { useLocale } from "../provider.tsx";
import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { svgOrigin } from "../internal/svg-origin.ts";

/** "Nice" axis ticks (1, 2, 2.5, 5 × 10ⁿ) covering [min, max]; always includes 0 when the range crosses it. Exported for tests. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) { const d = Math.abs(min) || 1; min -= d / 2; max += d / 2; }
  const raw = (max - min) / Math.max(1, count);
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(10));
  return out;
}

export type Series = { name: string; data: (number | null)[] };
const MARKERS = ["circle", "square", "triangle", "diamond", "circle", "square", "triangle", "diamond"] as const;
const DASHES = [undefined, "6 3", "2 3", "8 3 2 3", undefined, "6 3", "2 3", "8 3 2 3"];
const color = (i: number) => `var(--orlo-chart-${(i % 8) + 1})`;

function Marker({ kind, x, y, i, r = 3.5 }: { kind: (typeof MARKERS)[number]; x: number; y: number; i: number; r?: number }) {
  const s = { fill: color(i), stroke: "var(--orlo-color-surface)", strokeWidth: 1.5 };
  if (kind === "square") return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} {...s} />;
  if (kind === "triangle") return <path d={`M${x} ${y - r * 1.2}L${x + r * 1.1} ${y + r * 0.8}H${x - r * 1.1}Z`} {...s} />;
  if (kind === "diamond") return <path d={`M${x} ${y - r * 1.3}L${x + r * 1.1} ${y}L${x} ${y + r * 1.3}L${x - r * 1.1} ${y}Z`} {...s} />;
  return <circle cx={x} cy={y} r={r} {...s} />;
}

type FrameProps = { title: string; description?: string; labels: string[]; series: Series[]; format: (n: number) => string; hidden: Set<number>; toggle: (i: number) => void; children: ReactNode; showTable: boolean; setShowTable: (b: boolean) => void; empty?: boolean; loading?: boolean; legendSwatch?: "line" | "box" };

function ChartFrame({ title, description, labels, series, format, hidden, toggle, children, showTable, setShowTable, empty, loading, legendSwatch = "line" }: FrameProps) {
  const id = useId();
  return (
    <figure className="orlo-chart" aria-labelledby={`${id}-t`} aria-describedby={description ? `${id}-d` : undefined}>
      <figcaption className="orlo-chart__head">
        <div><strong id={`${id}-t`}>{title}</strong>{description && <p id={`${id}-d`} className="orlo-hint" style={{ margin: 0 }}>{description}</p>}</div>
        <button type="button" className="orlo-button" data-variant="ghost" data-size="sm" aria-pressed={showTable} onClick={() => setShowTable(!showTable)}>{showTable ? "Show chart" : "Show data table"}</button>
      </figcaption>
      {loading ? <div className="orlo-chart__state" role="status"><span className="orlo-skeleton" style={{ inlineSize: "100%", blockSize: "100%", borderRadius: 8 }} /><span className="orlo-visually-hidden">Loading chart</span></div>
        : empty ? <div className="orlo-chart__state"><p className="orlo-hint">No data for this period.</p></div>
        : showTable ? (
          <div className="orlo-chart__table" tabIndex={0} role="region" aria-label={`${title} data`}>
            <table><thead><tr><th scope="col">Label</th>{series.map((s) => <th key={s.name} scope="col">{s.name}</th>)}</tr></thead>
              <tbody>{labels.map((l, i) => <tr key={l + i}><th scope="row">{l}</th>{series.map((s) => <td key={s.name}>{s.data[i] === null || s.data[i] === undefined ? "No data" : format(s.data[i] as number)}</td>)}</tr>)}</tbody></table>
          </div>
        ) : children}
      {series.length > 1 && !showTable && (
        <ul className="orlo-chart__legend" aria-label="Series">
          {series.map((s, i) => (
            <li key={s.name}><button type="button" aria-pressed={!hidden.has(i)} onClick={() => toggle(i)} className="orlo-chart__key">
              <svg width="22" height="12" aria-hidden="true">{legendSwatch === "line" ? <><line x1="1" y1="6" x2="21" y2="6" stroke={color(i)} strokeWidth="2.5" strokeDasharray={DASHES[i]} /><Marker kind={MARKERS[i]} x={11} y={6} i={i} r={3} /></> : <rect x="5" y="1" width="12" height="10" rx="2" fill={color(i)} />}</svg>
              {s.name}
            </button></li>
          ))}
        </ul>
      )}
    </figure>
  );
}

export type LineChartProps = { title: string; description?: string; labels: string[]; series: Series[]; area?: boolean; height?: number; format?: (n: number) => string; loading?: boolean; curve?: boolean };

/**
 * Line and area charts. Nulls break the line (never drawn as zero), each series has a distinct colour, dash and marker,
 * the crosshair works by pointer and by keyboard (← →), values are announced, and a data table is one click away.
 */
export function LineChart({ title, description, labels, series, area, height = 260, format: fmtProp, loading, curve = true }: LineChartProps) {
  const locale = useLocale();
  const format = fmtProp ?? ((n: number) => n.toLocaleString(locale));
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const { transition } = useOrloMotion();
  const W = 640, H = height, pad = { l: 52, r: 16, t: 14, b: 30 };
  const visible = series.filter((_, i) => !hidden.has(i));
  const vals = visible.flatMap((s) => s.data.filter((v): v is number => v !== null && Number.isFinite(v)));
  const ticks = niceTicks(Math.min(0, ...(vals.length ? vals : [0])), Math.max(...(vals.length ? vals : [1])));
  const y0 = ticks[0], y1 = ticks[ticks.length - 1];
  const x = (i: number) => pad.l + (labels.length <= 1 ? (W - pad.l - pad.r) / 2 : (i / (labels.length - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - (v - y0) / (y1 - y0 || 1)) * (H - pad.t - pad.b);
  const path = (data: (number | null)[]) => {
    let d = "", prev: [number, number] | null = null;
    data.forEach((v, i) => {
      if (v === null || !Number.isFinite(v)) { prev = null; return; }
      const p: [number, number] = [x(i), y(v)];
      if (!prev) d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
      else if (curve) { const mx = (prev[0] + p[0]) / 2; d += `C${mx.toFixed(1)} ${prev[1].toFixed(1)} ${mx.toFixed(1)} ${p[1].toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`; }
      else d += `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
      prev = p;
    });
    return d;
  };
  /** One closed area per contiguous run of values, so gaps stay gaps. */
  const areaPath = (data: (number | null)[]) => {
    const base = y(Math.max(y0, Math.min(0, y1)));
    const runs: [number, number][] = []; let s0 = -1;
    data.forEach((v, i) => { const ok = v !== null && Number.isFinite(v); if (ok && s0 < 0) s0 = i; if (!ok && s0 >= 0) { runs.push([s0, i - 1]); s0 = -1; } });
    if (s0 >= 0) runs.push([s0, data.length - 1]);
    return runs.map(([a, b]) => { const seg = data.map((v, i) => (i >= a && i <= b ? v : null)); return `${path(seg)}V${base.toFixed(1)}H${x(a).toFixed(1)}Z`; }).join("");
  };
  const onMove = (e: React.PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(labels.length - 1, Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (labels.length - 1)))));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); setHover((h) => Math.max(0, Math.min(labels.length - 1, (h ?? -1) + (e.key === "ArrowRight" ? 1 : -1)))); }
    else if (e.key === "Home") setHover(0); else if (e.key === "End") setHover(labels.length - 1); else if (e.key === "Escape") setHover(null);
  };
  const tip = hover !== null ? `${labels[hover]}: ${visible.map((s) => `${s.name} ${s.data[hover] === null || s.data[hover] === undefined ? "no data" : format(s.data[hover] as number)}`).join(", ")}` : "";
  return (
    <ChartFrame title={title} description={description} labels={labels} series={series} format={format} hidden={hidden} toggle={(i) => setHidden((h) => { const n = new Set(h); n.has(i) ? n.delete(i) : n.add(i); return n; })} showTable={showTable} setShowTable={setShowTable} empty={!labels.length || !vals.length && !loading} loading={loading}>
      <div className="orlo-chart__plot">
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="orlo-chart__svg" role="img" aria-label={`${title}. Use arrow keys to read values.`} tabIndex={0} onKeyDown={onKey} onPointerMove={onMove} onPointerLeave={() => setHover(null)} onBlur={() => setHover(null)}>
          {ticks.map((t) => <g key={t}><line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className={t === 0 ? "orlo-chart__zero" : "orlo-chart__grid"} /><text x={pad.l - 8} y={y(t)} className="orlo-chart__ytick" dy="0.32em">{format(t)}</text></g>)}
          {labels.map((l, i) => (labels.length <= 12 || i % Math.ceil(labels.length / 8) === 0) && <text key={l + i} x={x(i)} y={H - 8} className="orlo-chart__xtick">{l}</text>)}
          {series.map((s, i) => hidden.has(i) ? null : (
            <g key={s.name}>
              {area && <path d={areaPath(s.data)} fill={color(i)} opacity={0.12} className="orlo-chart__morph" style={{ d: `path("${areaPath(s.data)}")` } as React.CSSProperties} />}
              <motion.path d={path(s.data)} fill="none" stroke={color(i)} strokeWidth={2.4} strokeDasharray={DASHES[i]} strokeLinecap="round" className="orlo-chart__morph" style={{ d: `path("${path(s.data)}")` } as React.CSSProperties} initial={DASHES[i] ? false : { pathLength: 0 }} animate={DASHES[i] ? undefined : { pathLength: 1 }} transition={transition("page")} />
              {s.data.map((v, j) => v === null || !Number.isFinite(v) ? null : (labels.length <= 16 || j === hover) && <Marker key={j} kind={MARKERS[i]} x={x(j)} y={y(v)} i={i} r={j === hover ? 5 : 3.2} />)}
            </g>
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} className="orlo-chart__crosshair" />}
        </svg>
        {hover !== null && (
          <div className="orlo-chart__tip" style={{ insetInlineStart: `${(x(hover) / W) * 100}%`, translate: hover > labels.length / 2 ? "-105% 0" : "5% 0" }} aria-hidden="true">
            <strong>{labels[hover]}</strong>
            {visible.map((s) => { const i = series.indexOf(s); const v = s.data[hover]; return <span key={s.name}><i style={{ background: color(i) }} />{s.name}<b>{v === null || v === undefined ? "—" : format(v)}</b></span>; })}
          </div>
        )}
        <span className="orlo-visually-hidden" aria-live="polite">{tip}</span>
      </div>
    </ChartFrame>
  );
}

export type BarChartProps = { title: string; description?: string; labels: string[]; series: Series[]; stacked?: boolean; height?: number; format?: (n: number) => string; loading?: boolean };

/** Grouped or stacked bars with a true zero baseline (negative values hang below it), value focus by keyboard, and a data table. */
export function BarChart({ title, description, labels, series, stacked, height = 260, format: fmtProp, loading }: BarChartProps) {
  const locale = useLocale();
  const format = fmtProp ?? ((n: number) => n.toLocaleString(locale));
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [showTable, setShowTable] = useState(false);
  const [focus, setFocus] = useState<[number, number] | null>(null);
  const { transition } = useOrloMotion();
  const W = 640, H = height, pad = { l: 52, r: 12, t: 14, b: 30 };
  const vis = series.map((s, i) => ({ s, i })).filter(({ i }) => !hidden.has(i));
  const sums = labels.map((_, j) => vis.reduce((a, { s }) => [a[0] + Math.min(0, s.data[j] ?? 0), a[1] + Math.max(0, s.data[j] ?? 0)], [0, 0]));
  const all = stacked ? sums.flat() : vis.flatMap(({ s }) => s.data.filter((v): v is number => v !== null));
  const ticks = niceTicks(Math.min(0, ...(all.length ? all : [0])), Math.max(0, ...(all.length ? all : [1])));
  const y0 = ticks[0], y1 = ticks[ticks.length - 1];
  const y = (v: number) => pad.t + (1 - (v - y0) / (y1 - y0 || 1)) * (H - pad.t - pad.b);
  const band = (W - pad.l - pad.r) / Math.max(1, labels.length), inner = band * 0.72;
  const bw = stacked ? inner : inner / Math.max(1, vis.length);
  const live = focus ? `${labels[focus[0]]}, ${series[focus[1]].name}: ${series[focus[1]].data[focus[0]] === null ? "no data" : format(series[focus[1]].data[focus[0]] as number)}` : "";
  return (
    <ChartFrame title={title} description={description} labels={labels} series={series} format={format} hidden={hidden} toggle={(i) => setHidden((h) => { const n = new Set(h); n.has(i) ? n.delete(i) : n.add(i); return n; })} showTable={showTable} setShowTable={setShowTable} empty={!labels.length && !loading} loading={loading} legendSwatch="box">
      <div className="orlo-chart__plot">
        <svg viewBox={`0 0 ${W} ${H}`} className="orlo-chart__svg" role="img" aria-label={`${title}. Use arrow keys to read values.`} tabIndex={0}
          onKeyDown={(e) => {
            const [j, i] = focus ?? [0, vis[0]?.i ?? 0];
            const vi = vis.findIndex((v) => v.i === i);
            if (e.key === "ArrowRight") { e.preventDefault(); setFocus([Math.min(labels.length - 1, focus ? j + 1 : 0), i]); }
            else if (e.key === "ArrowLeft") { e.preventDefault(); setFocus([Math.max(0, j - 1), i]); }
            else if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); setFocus([j, vis[(vi + (e.key === "ArrowDown" ? 1 : -1) + vis.length) % vis.length].i]); }
            else if (e.key === "Escape") setFocus(null);
          }} onBlur={() => setFocus(null)}>
          {ticks.map((t) => <g key={t}><line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className={t === 0 ? "orlo-chart__zero" : "orlo-chart__grid"} /><text x={pad.l - 8} y={y(t)} className="orlo-chart__ytick" dy="0.32em">{format(t)}</text></g>)}
          {labels.map((l, j) => {
            let pos = 0, neg = 0;
            return (
              <g key={l + j}>
                <text x={pad.l + band * j + band / 2} y={H - 8} className="orlo-chart__xtick">{l}</text>
                {vis.map(({ s, i }, k) => {
                  const v = s.data[j]; if (v === null || v === undefined) return null;
                  let top: number, bottom: number, bx: number;
                  if (stacked) { if (v >= 0) { bottom = pos; top = pos += v; } else { top = neg; bottom = neg += v; } bx = pad.l + band * j + (band - inner) / 2; }
                  else { top = Math.max(0, v); bottom = Math.min(0, v); bx = pad.l + band * j + (band - inner) / 2 + k * bw; }
                  const yt = y(top), h = Math.max(1, y(bottom) - yt);
                  const isF = focus?.[0] === j && focus?.[1] === i;
                  return <motion.rect key={s.name} x={bx + 1} width={Math.max(1, bw - 2)} rx={Math.min(4, bw / 4)} fill={color(i)} className="orlo-chart__bar" data-focus={isF || undefined}
                    initial={{ y: y(0), height: 0 }} animate={{ y: yt, height: h }} transition={transition("expand")} />;
                })}
              </g>
            );
          })}
        </svg>
        <span className="orlo-visually-hidden" aria-live="polite">{live}</span>
      </div>
    </ChartFrame>
  );
}

export type DonutChartProps = { title: string; description?: string; data: { label: string; value: number }[]; format?: (n: number) => string; centerLabel?: string };

/** Part-to-whole for a handful of categories. Segments are focusable (Tab, then ← →), percentages are spelled out, and a table is one click away. */
export function DonutChart({ title, description, data, format: fmtProp, centerLabel = "Total" }: DonutChartProps) {
  const locale = useLocale();
  const format = fmtProp ?? ((n: number) => n.toLocaleString(locale));
  const [active, setActive] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const { transition } = useOrloMotion();
  const total = data.reduce((a, d) => a + Math.max(0, d.value), 0);
  const arcs = useMemo(() => {
    let a0 = -Math.PI / 2;
    return data.map((d) => { const a = total ? (Math.max(0, d.value) / total) * Math.PI * 2 : 0; const r = { a0, a1: a0 + a }; a0 += a; return r; });
  }, [data, total]);
  const R = 80, r = 52;
  const arc = (a0: number, a1: number, rad = R) => {
    if (a1 - a0 >= Math.PI * 2 - 1e-6) a1 = a0 + Math.PI * 2 - 1e-4;
    const p = (a: number, rr: number) => `${100 + rr * Math.cos(a)} ${100 + rr * Math.sin(a)}`;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${p(a0, rad)}A${rad} ${rad} 0 ${large} 1 ${p(a1, rad)}L${p(a1, r)}A${r} ${r} 0 ${large} 0 ${p(a0, r)}Z`;
  };
  const series = [{ name: "Value", data: data.map((d) => d.value) }];
  const pct = (v: number) => (total ? `${Math.round((v / total) * 1000) / 10}%` : "0%");
  const shown = active !== null ? data[active] : null;
  return (
    <ChartFrame title={title} description={description} labels={data.map((d) => d.label)} series={series} format={format} hidden={new Set()} toggle={() => {}} showTable={showTable} setShowTable={setShowTable} empty={!total}>
      <div className="orlo-donut">
        <svg viewBox="0 0 200 200" className="orlo-donut__svg" role="list" aria-label={title}>
          {arcs.map((a, i) => (
            <motion.path key={data[i].label} role="listitem" tabIndex={0} aria-label={`${data[i].label}: ${format(data[i].value)}, ${pct(data[i].value)}`} d={arc(a.a0 + 0.012, a.a1 - 0.012, active === i ? R + 5 : R)}
              fill={color(i)} className="orlo-donut__seg" onFocus={() => setActive(i)} onBlur={() => setActive(null)} onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: active === null || active === i ? 1 : 0.45, scale: 1 }} transition={{ ...transition("reveal"), delay: i * 0.04 }} style={svgOrigin(100, 100)} />
          ))}
          <text x="100" y="94" className="orlo-donut__label">{shown ? shown.label : centerLabel}</text>
          <text x="100" y="118" className="orlo-donut__value">{shown ? pct(shown.value) : format(total)}</text>
        </svg>
        <ul className="orlo-donut__legend">{data.map((d, i) => <li key={d.label} data-active={active === i || undefined}><i style={{ background: color(i) }} /><span>{d.label}</span><b>{pct(d.value)}</b></li>)}</ul>
      </div>
    </ChartFrame>
  );
}
