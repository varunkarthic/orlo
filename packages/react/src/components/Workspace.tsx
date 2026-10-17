import { useLocale } from "../provider.tsx";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Icons } from "../internal/icons.tsx";
import { useControllable } from "../internal/hooks.ts";
import { Sparkline } from "./Data2.tsx";

export type AppShellProps = { header?: ReactNode; sidebar?: ReactNode; inspector?: ReactNode; status?: ReactNode; children: ReactNode; sidebarLabel?: string; defaultSidebarWidth?: number; height?: number | string };

/**
 * Application frame: header, collapsible + resizable sidebar, main area, optional inspector and status bar.
 * The sidebar handle is a keyboard separator; collapsing animates width but keeps contents unmounted only after
 * the animation, so nothing pops.
 */
export function AppShell({ header, sidebar, inspector, status, children, sidebarLabel = "Sidebar", defaultSidebarWidth = 248, height = 520 }: AppShellProps) {
  const [w, setW] = useState(defaultSidebarWidth);
  const [open, setOpen] = useState(true);
  const { transition } = useOrloMotion();
  const drag = useRef<{ x: number; w: number } | null>(null);
  return (
    <div className="orlo-shell" style={{ blockSize: height }}>
      {header && <header className="orlo-shell__header">
        {sidebar && <button type="button" className="orlo-icon-button" data-variant="ghost" data-size="sm" aria-label={open ? `Hide ${sidebarLabel.toLowerCase()}` : `Show ${sidebarLabel.toLowerCase()}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}><Icons.Sidebar size={18} /></button>}
        {header}
      </header>}
      <div className="orlo-shell__body">
        <AnimatePresence initial={false}>
          {sidebar && open && (
            <motion.nav aria-label={sidebarLabel} className="orlo-shell__side" initial={{ width: 0, opacity: 0 }} animate={{ width: w, opacity: 1, transition: transition("expand") }} exit={{ width: 0, opacity: 0, transition: transition("collapse") }}>
              <div className="orlo-shell__side-inner" style={{ inlineSize: w }}>{sidebar}</div>
            </motion.nav>
          )}
        </AnimatePresence>
        {sidebar && open && (
          <div role="separator" tabIndex={0} aria-orientation="vertical" aria-label={`Resize ${sidebarLabel.toLowerCase()}`} aria-valuenow={w} aria-valuemin={180} aria-valuemax={420} className="orlo-shell__handle"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, w }; }}
            onPointerMove={(e) => { if (drag.current) setW(Math.max(180, Math.min(420, drag.current.w + (e.clientX - drag.current.x) * (getComputedStyle(e.currentTarget).direction === "rtl" ? -1 : 1)))); }}
            onPointerUp={() => (drag.current = null)}
            onKeyDown={(e) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); setW((x) => Math.max(180, Math.min(420, x + (e.key === "ArrowRight" ? 16 : -16)))); } else if (e.key === "Enter") setOpen(false); }} />
        )}
        <main className="orlo-shell__main">{children}</main>
        {inspector && <aside className="orlo-shell__inspector" aria-label="Inspector">{inspector}</aside>}
      </div>
      {status && <footer className="orlo-shell__status">{status}</footer>}
    </div>
  );
}

export type DocTab = { id: string; title: string; dirty?: boolean; icon?: ReactNode };
export type TabStripProps = { tabs: DocTab[]; active?: string; defaultActive?: string; onActiveChange?: (id: string) => void; onClose?: (id: string) => void; onReorder?: (tabs: DocTab[]) => void; label?: string };

/**
 * Editor-style tabs: close buttons, unsaved dots (also announced), scroll on overflow with the active tab kept in view,
 * keyboard reorder (Ctrl+Shift+←/→) and close (Delete). Closing the active tab activates its neighbour.
 */
export function TabStrip({ tabs, active: a, defaultActive, onActiveChange, onClose, onReorder, label = "Open files" }: TabStripProps) {
  const [active, setActive] = useControllable(a, defaultActive ?? tabs[0]?.id ?? "", onActiveChange);
  const list = useRef<HTMLDivElement>(null);
  const { transition } = useOrloMotion();
  const id = useId();
  const focusTab = (tid: string) => requestAnimationFrame(() => { const el = list.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(tid)}"]`); el?.focus(); el?.scrollIntoView({ block: "nearest", inline: "nearest" }); });
  const close = (tid: string) => {
    const i = tabs.findIndex((t) => t.id === tid);
    if (tid === active) { const n = tabs[i + 1] ?? tabs[i - 1]; if (n) { setActive(n.id); focusTab(n.id); } }
    onClose?.(tid);
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    const rtl = getComputedStyle(list.current!).direction === "rtl";
    const fwd = (e.key === "ArrowRight") !== rtl;
    if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && e.ctrlKey && e.shiftKey && onReorder) {
      e.preventDefault(); const j = i + (fwd ? 1 : -1); if (j < 0 || j >= tabs.length) return;
      const next = tabs.slice(); [next[i], next[j]] = [next[j], next[i]]; onReorder(next); focusTab(tabs[i].id);
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); const n = tabs[(i + (fwd ? 1 : -1) + tabs.length) % tabs.length]; setActive(n.id); focusTab(n.id); }
    else if (e.key === "Home") { e.preventDefault(); setActive(tabs[0].id); focusTab(tabs[0].id); }
    else if (e.key === "End") { e.preventDefault(); const n = tabs[tabs.length - 1]; setActive(n.id); focusTab(n.id); }
    else if (e.key === "Delete" && onClose) { e.preventDefault(); close(tabs[i].id); }
  };
  return (
    <div ref={list} className="orlo-tabstrip" role="tablist" aria-label={label}>
      <AnimatePresence initial={false}>
        {tabs.map((t, i) => {
          const on = t.id === active;
          return (
            <motion.div key={t.id} layout className="orlo-tabstrip__tab" data-active={on || undefined} initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto", transition: transition("shift") }} exit={{ opacity: 0, width: 0, transition: transition("collapse") }}>
              <button type="button" role="tab" data-id={t.id} id={`${id}-${t.id}`} aria-selected={on} tabIndex={on ? 0 : -1} className="orlo-tabstrip__label" onClick={() => setActive(t.id)} onKeyDown={(e) => onKey(e, i)} onAuxClick={(e) => { if (e.button === 1 && onClose) close(t.id); }}>
                {t.icon && <span aria-hidden="true">{t.icon}</span>}<span className="orlo-tabstrip__title">{t.title}</span>{t.dirty && <span className="orlo-tabstrip__dirty" aria-label="unsaved changes" />}
              </button>
              {onClose && <button type="button" className="orlo-tabstrip__close" tabIndex={-1} aria-label={`Close ${t.title}`} onClick={() => close(t.id)}><Icons.X size={14} /></button>}
              {on && <motion.span className="orlo-tabstrip__indicator" layoutId={`${id}-ind`} transition={transition("shift")} />}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/** Compact status bar for app footers: left and right regions, items separated, live region for transient messages. */
export function StatusBar({ start, end, message }: { start?: ReactNode; end?: ReactNode; message?: string }) {
  return <div className="orlo-statusbar" role="status"><div className="orlo-statusbar__group">{start}</div><span className="orlo-statusbar__msg" aria-live="polite">{message}</span><div className="orlo-statusbar__group">{end}</div></div>;
}

export type KanbanCard = { id: string; title: string; meta?: ReactNode };
export type KanbanColumn = { id: string; title: string; cards: KanbanCard[]; limit?: number };

/**
 * Board with pointer drag between columns and a complete keyboard path: Space picks a card up, arrows move it
 * within and across columns, Space drops, Escape cancels. Every move is announced with column and position.
 */
export function Kanban({ columns, onChange, label = "Board" }: { columns: KanbanColumn[]; onChange: (c: KanbanColumn[]) => void; label?: string }) {
  const [grab, setGrab] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [over, setOver] = useState<string | null>(null);
  const origin = useRef<KanbanColumn[] | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const { transition } = useOrloMotion();
  const find = (cid: string) => { for (let c = 0; c < columns.length; c++) { const i = columns[c].cards.findIndex((k) => k.id === cid); if (i >= 0) return [c, i] as const; } return [-1, -1] as const; };
  const moveTo = (cid: string, col: number, idx: number) => {
    const [c, i] = find(cid); if (c < 0) return;
    const next = columns.map((x) => ({ ...x, cards: x.cards.slice() }));
    const [card] = next[c].cards.splice(i, 1);
    const at = Math.max(0, Math.min(next[col].cards.length, idx));
    next[col].cards.splice(at, 0, card);
    onChange(next);
    setMsg(`${card.title}: ${next[col].title}, position ${at + 1} of ${next[col].cards.length}`);
    requestAnimationFrame(() => root.current?.querySelector<HTMLElement>(`[data-card="${CSS.escape(cid)}"]`)?.focus());
  };
  return (
    <div ref={root} className="orlo-kanban" role="group" aria-label={label}>
      <p id="orlo-kanban-help" className="orlo-visually-hidden">Press Space to pick up a card, arrow keys to move it, Space to drop, Escape to cancel.</p>
      {columns.map((col, c) => (
        <section key={col.id} className="orlo-kanban__col" data-over={over === col.id || undefined} aria-label={`${col.title}, ${col.cards.length} cards`}
          onPointerEnter={() => grab && setOver(col.id)} onPointerUp={() => { if (grab && over === col.id && find(grab)[0] !== c) moveTo(grab, c, col.cards.length); }}>
          <header className="orlo-kanban__head"><strong>{col.title}</strong><span className="orlo-hint" data-over-limit={col.limit !== undefined && col.cards.length > col.limit || undefined}>{col.cards.length}{col.limit !== undefined ? ` / ${col.limit}` : ""}</span></header>
          <ul className="orlo-kanban__list">
            <AnimatePresence initial={false}>
              {col.cards.map((card, i) => (
                <motion.li key={card.id} layout transition={transition("shift")} className="orlo-kanban__card" data-grabbed={grab === card.id || undefined} tabIndex={0} data-card={card.id} aria-describedby="orlo-kanban-help" aria-pressed={grab === card.id}
                  onPointerDown={(e) => { if (e.button !== 0) return; setGrab(card.id); origin.current = columns; const up = () => { setGrab(null); setOver(null); window.removeEventListener("pointerup", up); }; window.addEventListener("pointerup", up); }}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (grab === card.id) { setGrab(null); setMsg(`${card.title} dropped in ${col.title}`); } else { setGrab(card.id); origin.current = columns; setMsg(`${card.title} picked up from ${col.title}`); } }
                    else if (grab === card.id) {
                      const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
                      if (e.key === "ArrowUp") { e.preventDefault(); moveTo(card.id, c, i - 1); }
                      else if (e.key === "ArrowDown") { e.preventDefault(); moveTo(card.id, c, i + 1); }
                      else if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); const nc = c + ((e.key === "ArrowRight") !== rtl ? 1 : -1); if (nc >= 0 && nc < columns.length) moveTo(card.id, nc, Math.min(i, columns[nc].cards.length)); }
                      else if (e.key === "Escape") { e.preventDefault(); if (origin.current) onChange(origin.current); setGrab(null); setMsg("Move cancelled"); }
                    }
                  }}>
                  <span className="orlo-kanban__title">{card.title}</span>{card.meta && <span className="orlo-kanban__meta">{card.meta}</span>}
                </motion.li>
              ))}
            </AnimatePresence>
            {col.cards.length === 0 && <li className="orlo-kanban__empty" aria-hidden="true">Drop cards here</li>}
          </ul>
        </section>
      ))}
      <span className="orlo-visually-hidden" aria-live="assertive">{msg}</span>
    </div>
  );
}

export type StatCardProps = { label: string; value: ReactNode; delta?: number; deltaLabel?: string; trend?: (number | null)[]; positive?: "up" | "down"; footnote?: ReactNode };

/** KPI tile. Change is shown with direction icon, sign and words ("up 12% vs last week"), never colour alone. */
export function StatCard({ label, value, delta, deltaLabel = "vs previous period", trend, positive = "up", footnote }: StatCardProps) {
  const dir = delta === undefined ? null : delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const good = dir === "flat" || dir === null ? null : dir === positive;
  const locale = useLocale();
  return (
    <div className="orlo-stat orlo-card">
      <span className="orlo-stat__label">{label}</span>
      <span className="orlo-stat__value">{value}</span>
      {dir && (
        <span className="orlo-stat__delta" data-good={good === null ? undefined : String(good)}>
          {dir === "up" ? <Icons.TrendingUp size={16} /> : dir === "down" ? <Icons.TrendingDown size={16} /> : <Icons.Minus size={16} />}
          <span>{dir === "flat" ? "No change" : `${dir === "up" ? "Up" : "Down"} ${Math.abs(delta!).toLocaleString(locale, { maximumFractionDigits: 1 })}%`}</span>
          <span className="orlo-hint" style={{ display: "inline" }}>{deltaLabel}</span>
        </span>
      )}
      {trend && <Sparkline label={`${label} trend`} data={trend} width={200} height={36} />}
      {footnote && <span className="orlo-hint">{footnote}</span>}
    </div>
  );
}
