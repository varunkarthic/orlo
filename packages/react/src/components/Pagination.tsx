import { Icons } from "../internal/icons.tsx";

/** Page list with ellipses: always first, last, current and its neighbours. Pure, so it is unit-tested. */
export function pageRange(page: number, count: number, siblings = 1): (number | "…")[] {
  const out: (number | "…")[] = [];
  for (let p = 1; p <= count; p++) {
    if (p === 1 || p === count || Math.abs(p - page) <= siblings) out.push(p);
    else if (out[out.length - 1] !== "…") out.push("…");
  }
  return out;
}

export type PaginationProps = { page: number; count: number; onPageChange: (p: number) => void; label?: string };

export function Pagination({ page, count, onPageChange, label = "Pagination" }: PaginationProps) {
  return (
    <nav aria-label={label} className="orlo-pagination">
      <button type="button" className="orlo-icon-button" data-variant="ghost" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><Icons.ChevronLeft size={18} /></button>
      <ul>
        {pageRange(page, count).map((p, i) => (
          <li key={i} data-far={p !== "…" && p !== 1 && p !== count && Math.abs(p - page) > 0 ? true : undefined}>
            {p === "…" ? <span className="orlo-pagination__gap" aria-hidden="true">…</span> : (
              <button type="button" className="orlo-pagination__page" aria-current={p === page ? "page" : undefined} aria-label={`Page ${p}`} onClick={() => onPageChange(p)}>{p}</button>
            )}
          </li>
        ))}
      </ul>
      <button type="button" className="orlo-icon-button" data-variant="ghost" aria-label="Next page" disabled={page >= count} onClick={() => onPageChange(page + 1)}><Icons.ChevronRight size={18} /></button>
    </nav>
  );
}
