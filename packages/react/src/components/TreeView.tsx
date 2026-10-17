import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Icons } from "../internal/icons.tsx";
import { useControllable } from "../internal/hooks.ts";

export type TreeNode = { id: string; label: string; icon?: ReactNode; children?: TreeNode[]; disabled?: boolean };
export type TreeViewProps = { label: string; nodes: TreeNode[]; expanded?: string[]; defaultExpanded?: string[]; onExpandedChange?: (ids: string[]) => void; selected?: string | null; onSelect?: (id: string) => void };

/** Flattens visible nodes in display order. Exported for testing keyboard navigation. */
export function visibleNodes(nodes: TreeNode[], open: Set<string>, depth = 1, parent: string | null = null): { node: TreeNode; depth: number; parent: string | null; pos: number; size: number }[] {
  return nodes.flatMap((n, i) => [{ node: n, depth, parent, pos: i + 1, size: nodes.length }, ...(n.children && open.has(n.id) ? visibleNodes(n.children, open, depth + 1, n.id) : [])]);
}

/**
 * Hierarchical list (WAI-ARIA tree). Up/Down move, Right expands or enters, Left collapses or goes to the parent,
 * Home/End jump, * expands siblings, typing jumps by label. One tab stop.
 */
export function TreeView({ label, nodes, expanded, defaultExpanded = [], onExpandedChange, selected: sel, onSelect }: TreeViewProps) {
  const [open, setOpen] = useControllable(expanded, defaultExpanded, onExpandedChange);
  const [selected, setSelected] = useControllable<string | null>(sel, null, (v) => v && onSelect?.(v));
  const openSet = useMemo(() => new Set(open), [open]);
  const flat = visibleNodes(nodes, openSet);
  const [focus, setFocus] = useState<string>(flat[0]?.node.id ?? "");
  const ref = useRef<HTMLUListElement>(null);
  const typed = useRef({ s: "", t: 0 });
  const { transition } = useOrloMotion();
  const go = (id?: string) => { if (!id) return; setFocus(id); requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus()); };
  const toggle = (id: string, to?: boolean) => { const isOpen = openSet.has(id); const want = to ?? !isOpen; if (want !== isOpen) setOpen(want ? [...open, id] : open.filter((x) => x !== id)); };
  const onKey = (e: KeyboardEvent) => {
    const i = flat.findIndex((f) => f.node.id === focus); const cur = flat[i]; if (!cur) return;
    const rtl = getComputedStyle(ref.current!).direction === "rtl";
    const right = rtl ? "ArrowLeft" : "ArrowRight", left = rtl ? "ArrowRight" : "ArrowLeft";
    const has = !!cur.node.children?.length;
    if (e.key === "ArrowDown") { e.preventDefault(); go(flat[i + 1]?.node.id); }
    else if (e.key === "ArrowUp") { e.preventDefault(); go(flat[i - 1]?.node.id); }
    else if (e.key === right) { e.preventDefault(); if (has && !openSet.has(cur.node.id)) toggle(cur.node.id, true); else if (has) go(flat[i + 1]?.node.id); }
    else if (e.key === left) { e.preventDefault(); if (has && openSet.has(cur.node.id)) toggle(cur.node.id, false); else go(cur.parent ?? undefined); }
    else if (e.key === "Home") { e.preventDefault(); go(flat[0]?.node.id); }
    else if (e.key === "End") { e.preventDefault(); go(flat[flat.length - 1]?.node.id); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!cur.node.disabled) { setSelected(cur.node.id); if (has) toggle(cur.node.id); } }
    else if (e.key === "*") { const sibs = flat.filter((f) => f.parent === cur.parent && f.node.children?.length).map((f) => f.node.id); setOpen([...new Set([...open, ...sibs])]); }
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now(); typed.current = { s: (now - typed.current.t > 500 ? "" : typed.current.s) + e.key.toLowerCase(), t: now };
      const order = [...flat.slice(i + 1), ...flat.slice(0, i + 1)];
      go(order.find((f) => f.node.label.toLowerCase().startsWith(typed.current.s))?.node.id);
    }
  };
  const render = (list: TreeNode[], depth: number): ReactNode => list.map((n, i) => {
    const has = !!n.children?.length, isOpen = openSet.has(n.id);
    return (
      <li key={n.id} role="treeitem" data-id={n.id} tabIndex={n.id === focus ? 0 : -1} aria-expanded={has ? isOpen : undefined} aria-selected={selected === n.id} aria-disabled={n.disabled || undefined}
        aria-level={depth} aria-setsize={list.length} aria-posinset={i + 1} className="orlo-tree__item"
        onFocus={(e) => { if (e.target === e.currentTarget) setFocus(n.id); }}
        onClick={(e) => { e.stopPropagation(); if (n.disabled) return; setFocus(n.id); setSelected(n.id); if (has) toggle(n.id); }}>
        <span className="orlo-tree__row" style={{ paddingInlineStart: `calc(${depth - 1} * 1.25rem + 0.5rem)` }}>
          <span className="orlo-tree__twisty" aria-hidden="true">{has && <motion.span style={{ display: "inline-flex" }} animate={{ rotate: isOpen ? 90 : 0 }} transition={transition("press")}><Icons.ChevronRight size={16} /></motion.span>}</span>
          {n.icon && <span className="orlo-tree__icon" aria-hidden="true">{n.icon}</span>}
          <span>{n.label}</span>
        </span>
        <AnimatePresence initial={false}>
          {has && isOpen && (
            <motion.ul role="group" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1, transition: transition("expand") }} exit={{ height: 0, opacity: 0, transition: transition("dismiss") }} style={{ overflow: "hidden" }}>
              {render(n.children!, depth + 1)}
            </motion.ul>
          )}
        </AnimatePresence>
      </li>
    );
  });
  return <ul ref={ref} role="tree" aria-label={label} className="orlo-tree" onKeyDown={onKey}>{render(nodes, 1)}</ul>;
}
