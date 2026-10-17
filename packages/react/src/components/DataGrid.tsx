import { useLocale } from "../provider.tsx";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icons } from "../internal/icons.tsx";
import { useControllable } from "../internal/hooks.ts";

export type GridColumn<T> = {
  key: keyof T & string;
  header: string;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  align?: "start" | "end" | "center";
  /** Keep this column visible while scrolling horizontally (first column only). */
  pin?: boolean;
  render?: (row: T) => ReactNode;
  /** Value used for sorting when different from the raw cell. */
  sortValue?: (row: T) => string | number;
};

export type DataGridProps<T> = {
  label: string;
  columns: GridColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  selection?: string[];
  defaultSelection?: string[];
  onSelectionChange?: (keys: string[]) => void;
  onRowActivate?: (row: T) => void;
  rowHeight?: number;
  height?: number;
  loading?: boolean;
  empty?: ReactNode;
};

type Sort = { key: string; dir: "ascending" | "descending" } | null;

/** Rows to render for a scroll position: visible window plus overscan. Exported for tests. */
export function windowRange(scrollTop: number, viewport: number, rowHeight: number, count: number, overscan = 6) {
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(count, Math.ceil((scrollTop + viewport) / rowHeight) + overscan);
  return [start, end] as const;
}

/**
 * Data grid for large sets. Virtualised rows (only the visible window is in the DOM), sticky header, optional pinned
 * first column, sorting, selection with Shift-range, column resize (pointer, or Alt+←/→ on a header), and the
 * WAI-ARIA grid keyboard model with a single tab stop. Focus survives virtualisation: the focused cell is scrolled
 * into the window before it receives focus.
 */
export function DataGrid<T>({ label, columns, rows, rowKey, selectable, selection, defaultSelection = [], onSelectionChange, onRowActivate, rowHeight = 44, height = 440, loading, empty = "No rows" }: DataGridProps<T>) {
  const [selected, setSelected] = useControllable(selection, defaultSelection, onSelectionChange);
  const locale = useLocale();
  const collator = useMemo(() => new Intl.Collator(locale ?? "en-US", { numeric: true, sensitivity: "base" }), [locale]);
  const [sort, setSort] = useState<Sort>(null);
  const [widths, setWidths] = useState<number[]>(() => columns.map((c) => c.width ?? 160));
  const [scroll, setScroll] = useState({ top: 0, left: 0 });
  const [focus, setFocus] = useState<[number, number]>([0, 0]); // [row (0 = header), col]
  const anchor = useRef<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const wantFocus = useRef(false);
  const sel = useMemo(() => new Set(selected), [selected]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key)!;
    const v = (r: T) => (col.sortValue ? col.sortValue(r) : (r[col.key] as unknown as string | number));
    const m = sort.dir === "ascending" ? 1 : -1;
    return [...rows].sort((a, b) => { const x = v(a), y = v(b); return m * (typeof x === "number" && typeof y === "number" ? x - y : collator.compare(String(x ?? ""), String(y ?? ""))); });
  }, [rows, sort, columns, collator]);

  const cols = selectable ? [{ key: "__select", header: "Select", width: 48 } as unknown as GridColumn<T>, ...columns] : columns;
  const colWidths = selectable ? [48, ...widths] : widths;
  const template = colWidths.map((w) => `${w}px`).join(" ");
  const total = colWidths.reduce((a, b) => a + b, 0);
  const viewport = height - rowHeight;
  const [start, end] = windowRange(scroll.top, viewport, rowHeight, sorted.length);

  const toggleSort = (key: string) => setSort((s) => (s?.key !== key ? { key, dir: "ascending" } : s.dir === "ascending" ? { key, dir: "descending" } : null));
  const toggleRow = (i: number, range: boolean) => {
    const k = rowKey(sorted[i]);
    if (range && anchor.current !== null) {
      const [a, b] = [Math.min(anchor.current, i), Math.max(anchor.current, i)];
      const keys = sorted.slice(a, b + 1).map(rowKey);
      setSelected([...new Set([...selected, ...keys])]);
    } else setSelected(sel.has(k) ? selected.filter((x) => x !== k) : [...selected, k]);
    anchor.current = i;
  };
  const allSelected = sorted.length > 0 && sorted.every((r) => sel.has(rowKey(r)));
  const someSelected = !allSelected && sorted.some((r) => sel.has(rowKey(r)));
  const toggleAll = () => setSelected(allSelected ? selected.filter((k) => !sorted.some((r) => rowKey(r) === k)) : [...new Set([...selected, ...sorted.map(rowKey)])]);

  // Keep the focused cell inside the rendered window, then move DOM focus to it.
  const ensureVisible = useCallback((r: number) => {
    const el = box.current; if (!el || r === 0) return;
    const top = (r - 1) * rowHeight, bottom = top + rowHeight;
    if (top < el.scrollTop) el.scrollTop = top;
    else if (bottom > el.scrollTop + viewport) el.scrollTop = bottom - viewport;
  }, [rowHeight, viewport]);
  useEffect(() => {
    if (!wantFocus.current) return;
    const raf = requestAnimationFrame(() => box.current?.querySelector<HTMLElement>(`[data-cell="${focus[0]}-${focus[1]}"]`)?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [focus, start]);

  const move = (r: number, c: number) => {
    const nr = Math.max(0, Math.min(sorted.length, r)), nc = Math.max(0, Math.min(cols.length - 1, c));
    wantFocus.current = true; ensureVisible(nr); setFocus([nr, nc]);
  };
  const onKey = (e: KeyboardEvent) => {
    const [r, c] = focus;
    const rtl = getComputedStyle(box.current!).direction === "rtl";
    const page = Math.max(1, Math.floor(viewport / rowHeight) - 1);
    const colIdx = selectable ? c - 1 : c;
    if (e.altKey && r === 0 && colIdx >= 0 && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault(); const d = (e.key === "ArrowRight") !== rtl ? 16 : -16;
      setWidths((w) => w.map((x, i) => (i === colIdx ? Math.max(columns[i].minWidth ?? 64, x + d) : x))); return;
    }
    const map: Record<string, () => void> = {
      ArrowDown: () => move(r + 1, c), ArrowUp: () => move(r - 1, c),
      ArrowRight: () => move(r, c + (rtl ? -1 : 1)), ArrowLeft: () => move(r, c + (rtl ? 1 : -1)),
      Home: () => (e.ctrlKey || e.metaKey ? move(1, 0) : move(r, 0)), End: () => (e.ctrlKey || e.metaKey ? move(sorted.length, cols.length - 1) : move(r, cols.length - 1)),
      PageDown: () => move(r + page, c), PageUp: () => move(Math.max(1, r - page), c),
    };
    if (map[e.key]) { e.preventDefault(); map[e.key](); return; }
    if (e.key === " " && selectable && r > 0) { e.preventDefault(); toggleRow(r - 1, e.shiftKey); }
    else if (e.key === " " && selectable && r === 0 && c === 0) { e.preventDefault(); toggleAll(); }
    else if (e.key === "Enter" && r === 0 && cols[c]?.sortable) { e.preventDefault(); toggleSort(cols[c].key); }
    else if (e.key === "Enter" && r > 0) { e.preventDefault(); onRowActivate?.(sorted[r - 1]); }
    else if ((e.key === "a" || e.key === "A") && (e.ctrlKey || e.metaKey) && selectable) { e.preventDefault(); toggleAll(); }
  };

  const resizeStart = (i: number) => (e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    const x0 = e.clientX, w0 = widths[i], rtl = getComputedStyle(box.current!).direction === "rtl";
    const mv = (ev: PointerEvent) => setWidths((w) => w.map((x, j) => (j === i ? Math.max(columns[i].minWidth ?? 64, w0 + (rtl ? x0 - ev.clientX : ev.clientX - x0)) : x)));
    const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  };

  const cell = (r: number, c: number) => ({ "data-cell": `${r}-${c}`, tabIndex: focus[0] === r && focus[1] === c ? 0 : -1, "aria-colindex": c + 1, onFocus: () => { setFocus([r, c]); }, onClick: () => { wantFocus.current = true; setFocus([r, c]); } });
  const pinned = (c: number) => (cols[c]?.pin || (selectable && c === 0) ? { position: "sticky" as const, insetInlineStart: c === 0 ? 0 : colWidths[0], zIndex: 1 } : undefined);

  return (
    <div className="orlo-grid" data-scrolled-x={scroll.left > 0 || undefined} suppressHydrationWarning>
      <div ref={box} role="grid" aria-label={label} aria-rowcount={sorted.length + 1} aria-colcount={cols.length} aria-multiselectable={selectable || undefined} aria-busy={loading || undefined}
        className="orlo-grid__viewport" style={{ blockSize: height }} onKeyDown={onKey} onScroll={(e) => setScroll({ top: e.currentTarget.scrollTop, left: e.currentTarget.scrollLeft })}>
        <div role="rowgroup" className="orlo-grid__head" style={{ inlineSize: total }}>
          <div role="row" aria-rowindex={1} className="orlo-grid__row" style={{ gridTemplateColumns: template, blockSize: rowHeight }}>
            {cols.map((col, c) => {
              if (selectable && c === 0) return (
                <div key="sel" role="columnheader" className="orlo-grid__cell orlo-grid__th" {...cell(0, 0)} style={pinned(0)}>
                  <input type="checkbox" aria-label="Select all rows" className="orlo-grid__check" checked={allSelected} ref={(el) => { if (el) el.indeterminate = someSelected; }} onChange={toggleAll} tabIndex={-1} />
                </div>
              );
              const s = sort?.key === col.key ? sort.dir : undefined;
              const i = selectable ? c - 1 : c;
              return (
                <div key={col.key} role="columnheader" aria-sort={col.sortable ? s ?? "none" : undefined} className="orlo-grid__cell orlo-grid__th" data-align={col.align} {...cell(0, c)} style={pinned(c)}
                  onClick={() => { wantFocus.current = true; setFocus([0, c]); if (col.sortable) toggleSort(col.key); }}>
                  <span className="orlo-grid__th-label">{col.header}</span>
                  {col.sortable && <span className="orlo-grid__sort" aria-hidden="true">{s === "ascending" ? <Icons.ArrowUp size={14} /> : s === "descending" ? <Icons.ArrowDown size={14} /> : <Icons.ChevronsUpDown size={14} />}</span>}
                  <span className="orlo-grid__resize" onPointerDown={resizeStart(i)} aria-hidden="true" />
                </div>
              );
            })}
          </div>
        </div>
        <div role="rowgroup" style={{ blockSize: Math.max(sorted.length, loading ? 6 : 1) * rowHeight, inlineSize: total, position: "relative" }}>
          {loading && sorted.length === 0 && Array.from({ length: 6 }, (_, i) => (
            <div key={i} role="row" aria-hidden="true" className="orlo-grid__row" style={{ gridTemplateColumns: template, blockSize: rowHeight, transform: `translateY(${i * rowHeight}px)` }}>
              {cols.map((_, c) => <div key={c} className="orlo-grid__cell"><span className="orlo-skeleton" style={{ inlineSize: `${50 + ((i * 7 + c * 13) % 40)}%`, blockSize: 12 }} /></div>)}
            </div>
          ))}
          {!loading && sorted.length === 0 && <div className="orlo-grid__empty" role="row"><div role="gridcell">{empty}</div></div>}
          {sorted.slice(start, end).map((row, k) => {
            const i = start + k, r = i + 1, key = rowKey(row), isSel = sel.has(key);
            return (
              <div key={key} role="row" aria-rowindex={r + 1} aria-selected={selectable ? isSel : undefined} className="orlo-grid__row orlo-grid__body-row" data-selected={isSel || undefined}
                style={{ gridTemplateColumns: template, blockSize: rowHeight, transform: `translateY(${i * rowHeight}px)` }} onDoubleClick={() => onRowActivate?.(row)}>
                {cols.map((col, c) => (
                  <div key={col.key} role="gridcell" className="orlo-grid__cell" data-align={col.align} {...cell(r, c)} style={pinned(c)}>
                    {selectable && c === 0
                      ? <input type="checkbox" className="orlo-grid__check" aria-label={`Select row ${r}`} checked={isSel} tabIndex={-1} onChange={() => {}} onClick={(e) => { e.stopPropagation(); toggleRow(i, e.shiftKey); }} />
                      : <span className="orlo-grid__value">{col.render ? col.render(row) : String(row[col.key] ?? "—")}</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="orlo-grid__foot">
        <span className="orlo-hint" aria-live="polite">{loading ? "Loading rows…" : `${sorted.length.toLocaleString(locale)} rows${selectable ? ` · ${selected.length.toLocaleString(locale)} selected` : ""}`}</span>
        <span className="orlo-hint orlo-grid__keys">Arrows move · Space selects · Enter opens · Alt+←/→ resizes</span>
      </div>
    </div>
  );
}
