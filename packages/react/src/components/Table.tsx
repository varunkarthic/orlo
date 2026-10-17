import { useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Icons } from "../internal/icons.tsx";

export type Column<T> = {
  key: keyof T & string;
  header: ReactNode;
  sortable?: boolean;
  align?: "start" | "end";
  render?: (row: T) => ReactNode;
};
export type TableProps<T> = {
  caption: ReactNode;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
  /** Row movement is animated only while the set is small enough to follow by eye. */
  animateBelow?: number;
};

type Sort = { key: string; dir: "ascending" | "descending" } | null;
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

/** Semantic table with sortable headers (aria-sort + visible arrow + text), sticky head and a designed empty state. */
export function Table<T>({ caption, columns, rows, rowKey, empty = "Nothing to show yet.", animateBelow = 50 }: TableProps<T>) {
  const [sort, setSort] = useState<Sort>(null);
  const { transition } = useOrloMotion();
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const m = sort.dir === "ascending" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = a[sort.key as keyof T], y = b[sort.key as keyof T];
      return m * (typeof x === "number" && typeof y === "number" ? x - y : collator.compare(String(x ?? ""), String(y ?? "")));
    });
  }, [rows, sort]);
  const animate = rows.length <= animateBelow;
  const cycle = (key: string) => setSort((s) => (s?.key !== key ? { key, dir: "ascending" } : s.dir === "ascending" ? { key, dir: "descending" } : null));

  return (
    <div className="orlo-table-wrap" tabIndex={0} role="region" aria-label={typeof caption === "string" ? caption : undefined}>
      <table className="orlo-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => {
              const s = sort?.key === c.key ? sort.dir : undefined;
              return (
                <th key={c.key} scope="col" aria-sort={c.sortable ? s ?? "none" : undefined} data-align={c.align}>
                  {c.sortable ? (
                    <button type="button" className="orlo-table__sort" onClick={() => cycle(c.key)}>
                      {c.header}
                      <span aria-hidden="true">{s === "ascending" ? <Icons.ArrowUp size={14} /> : s === "descending" ? <Icons.ArrowDown size={14} /> : <Icons.Sort size={14} />}</span>
                      <span className="orlo-visually-hidden">{s ? `, sorted ${s}` : ", sortable"}</span>
                    </button>
                  ) : c.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length} className="orlo-table__empty">{empty}</td></tr>
          ) : (
            <AnimatePresence initial={false}>
              {sorted.map((r) => (
                <motion.tr key={rowKey(r)} layout={animate ? "position" : false} transition={transition("shift")} exit={{ opacity: 0, transition: transition("dismiss") }}>
                  {columns.map((c) => <td key={c.key} data-align={c.align}>{c.render ? c.render(r) : String(r[c.key] ?? "—")}</td>)}
                </motion.tr>
              ))}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </div>
  );
}
