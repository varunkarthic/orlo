import { useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Icons } from "../internal/icons.tsx";
import { CopyButton } from "./Misc.tsx";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/** Collapsible JSON explorer. Disclosure buttons per node, type-coloured values that are also labelled, long strings wrap. */
export function JsonTree({ data, label = "JSON", defaultDepth = 1 }: { data: Json; label?: string; defaultDepth?: number }) {
  return <div className="orlo-json" role="group" aria-label={label}><JsonNode k={null} v={data} depth={0} open={defaultDepth} /></div>;
}
function JsonNode({ k, v, depth, open }: { k: string | null; v: Json; depth: number; open: number }) {
  const [expanded, setExpanded] = useState(depth < open);
  const isObj = v !== null && typeof v === "object";
  const keyEl = k !== null && <span className="orlo-json__key">{JSON.stringify(k)}: </span>;
  if (!isObj) {
    const type = v === null ? "null" : typeof v;
    return <div className="orlo-json__row" style={{ paddingInlineStart: depth * 16 + 20 }}>{keyEl}<span className="orlo-json__val" data-type={type} title={type}>{typeof v === "string" ? JSON.stringify(v) : String(v)}</span></div>;
  }
  const entries = Array.isArray(v) ? v.map((x, i) => [String(i), x] as const) : Object.entries(v);
  const [o, c] = Array.isArray(v) ? ["[", "]"] : ["{", "}"];
  return (
    <div>
      <button type="button" className="orlo-json__row orlo-json__toggle" style={{ paddingInlineStart: depth * 16 }} aria-expanded={expanded} onClick={() => setExpanded((e) => !e)}>
        <Icons.ChevronRight size={14} className="orlo-json__chev" />{keyEl}<span>{o}</span>{!expanded && <span className="orlo-hint"> {entries.length} {Array.isArray(v) ? "items" : "keys"} {c}</span>}
      </button>
      {expanded && <>{entries.map(([kk, vv]) => <JsonNode key={kk} k={Array.isArray(v) ? null : kk} v={vv} depth={depth + 1} open={open} />)}<div className="orlo-json__row" style={{ paddingInlineStart: depth * 16 + 20 }}>{c}</div></>}
    </div>
  );
}

/** Line diff via longest common subsequence. Exported for tests. */
export function diffLines(a: string, b: string): { type: "same" | "add" | "del"; text: string }[] {
  const x = a.split("\n"), y = b.split("\n");
  const L = Array.from({ length: x.length + 1 }, () => new Array<number>(y.length + 1).fill(0));
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out: { type: "same" | "add" | "del"; text: string }[] = [];
  let i = 0, j = 0;
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) { out.push({ type: "same", text: x[i] }); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) out.push({ type: "del", text: x[i++] });
    else out.push({ type: "add", text: y[j++] });
  }
  while (i < x.length) out.push({ type: "del", text: x[i++] });
  while (j < y.length) out.push({ type: "add", text: y[j++] });
  return out;
}

/** Unified diff with +/− gutters (never colour alone), line numbers, and a summary for screen readers. */
export function DiffViewer({ before, after, label = "Changes" }: { before: string; after: string; label?: string }) {
  const rows = useMemo(() => diffLines(before, after), [before, after]);
  const add = rows.filter((r) => r.type === "add").length, del = rows.filter((r) => r.type === "del").length;
  let ln = 0, rn = 0;
  return (
    <figure className="orlo-diff">
      <figcaption className="orlo-diff__head"><strong>{label}</strong><span className="orlo-hint">{add} added, {del} removed</span></figcaption>
      <div className="orlo-diff__body" tabIndex={0} role="region" aria-label={label}>
        <table><tbody>
          {rows.map((r, i) => {
            if (r.type !== "add") ln++; if (r.type !== "del") rn++;
            return (
              <tr key={i} data-type={r.type}>
                <td className="orlo-diff__ln" aria-hidden="true">{r.type !== "add" ? ln : ""}</td>
                <td className="orlo-diff__ln" aria-hidden="true">{r.type !== "del" ? rn : ""}</td>
                <td className="orlo-diff__sign">{r.type === "add" ? "+" : r.type === "del" ? "−" : " "}<span className="orlo-visually-hidden">{r.type === "add" ? "added" : r.type === "del" ? "removed" : ""}</span></td>
                <td className="orlo-diff__code"><code>{r.text || " "}</code></td>
              </tr>
            );
          })}
        </tbody></table>
      </div>
    </figure>
  );
}

export type CodeBlockProps = { code: string; language?: string; title?: string; highlight?: number[]; lineNumbers?: boolean; wrap?: boolean };

/** Code with copy, optional line numbers and highlighted lines, and a wrap toggle so long lines never force page-level scroll. */
export function CodeBlock({ code, language, title, highlight = [], lineNumbers = true, wrap: w = false }: CodeBlockProps) {
  const [wrap, setWrap] = useState(w);
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <figure className="orlo-codeblock" data-wrap={wrap || undefined}>
      <figcaption className="orlo-codeblock__bar">
        <span className="orlo-codeblock__title">{title ?? language ?? "Code"}</span>
        <button type="button" className="orlo-button" data-variant="ghost" data-size="sm" aria-pressed={wrap} onClick={() => setWrap((x) => !x)}>Wrap</button>
        <CopyButton text={code} />
      </figcaption>
      <pre tabIndex={0} aria-label={title ?? "Code"}><code>
        {lines.map((l, i) => <span key={i} className="orlo-codeblock__line" data-hl={highlight.includes(i + 1) || undefined}>{lineNumbers && <span className="orlo-codeblock__ln" aria-hidden="true">{i + 1}</span>}<span>{l || " "}</span>{"\n"}</span>)}
      </code></pre>
    </figure>
  );
}

/** Continuous horizontal scroll for ambient content (logos, tickers). Pauses on hover and focus, has a pause button, and is static under reduced motion. */
export function Marquee({ children, label, speed = 40 }: { children: ReactNode; label: string; speed?: number }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className="orlo-marquee" role="region" aria-label={label} data-paused={paused || undefined} style={{ "--speed": `${speed}s` } as React.CSSProperties}>
      <div className="orlo-marquee__track"><div className="orlo-marquee__group">{children}</div><div className="orlo-marquee__group" aria-hidden="true">{children}</div></div>
      <button type="button" className="orlo-icon-button orlo-marquee__toggle" data-variant="subtle" data-size="sm" aria-label={paused ? "Play" : "Pause"} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>{paused ? <Icons.Play size={16} /> : <Icons.Pause size={16} />}</button>
    </div>
  );
}

export type ReorderableListProps<T> = { items: T[]; onReorder: (items: T[]) => void; getKey: (t: T) => string; getLabel: (t: T) => string; render: (t: T) => ReactNode; label: string };

/**
 * Drag to reorder with a pointer, or with the keyboard: Space picks up, arrows move, Space drops, Escape cancels.
 * Every move is announced. Items glide to their new places with the `shift` spring.
 */
export function ReorderableList<T>({ items, onReorder, getKey, getLabel, render, label }: ReorderableListProps<T>) {
  const [grabbed, setGrabbed] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const origin = useRef<T[] | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const drag = useRef<{ key: string; y: number } | null>(null);
  const { transition } = useOrloMotion();
  const move = (key: string, to: number) => {
    const from = items.findIndex((i) => getKey(i) === key); if (from < 0 || to < 0 || to >= items.length || to === from) return;
    const next = items.slice(); const [it] = next.splice(from, 1); next.splice(to, 0, it); onReorder(next);
    setMsg(`${getLabel(it)}, position ${to + 1} of ${items.length}`);
    requestAnimationFrame(() => list.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"] .orlo-reorder__handle`)?.focus());
  };
  return (
    <>
      <p id={`${label}-instr`} className="orlo-visually-hidden">Press Space to pick up an item, arrow keys to move it, Space to drop, Escape to cancel.</p>
      <ul ref={list} className="orlo-reorder" aria-label={label}>
        <AnimatePresence initial={false}>
          {items.map((it, i) => {
            const k = getKey(it);
            return (
              <motion.li key={k} data-key={k} layout transition={transition("shift")} className="orlo-reorder__item" data-grabbed={grabbed === k || undefined}
                onPointerMove={(e) => { if (!drag.current || drag.current.key === k) return; const r = e.currentTarget.getBoundingClientRect(); if (e.clientY > r.top + r.height * 0.25 && e.clientY < r.bottom - r.height * 0.25) move(drag.current.key, i); }}>
                <button type="button" className="orlo-reorder__handle" aria-label={`Reorder ${getLabel(it)}`} aria-describedby={`${label}-instr`} aria-pressed={grabbed === k}
                  onPointerDown={(e) => { e.preventDefault(); drag.current = { key: k, y: e.clientY }; setGrabbed(k); const up = () => { drag.current = null; setGrabbed(null); window.removeEventListener("pointerup", up); }; window.addEventListener("pointerup", up); }}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (grabbed === k) { setGrabbed(null); setMsg(`${getLabel(it)} dropped at position ${i + 1}`); origin.current = null; } else { setGrabbed(k); origin.current = items; setMsg(`${getLabel(it)} picked up, position ${i + 1} of ${items.length}`); } }
                    else if (grabbed === k && (e.key === "ArrowUp" || e.key === "ArrowDown")) { e.preventDefault(); move(k, i + (e.key === "ArrowUp" ? -1 : 1)); }
                    else if (grabbed === k && e.key === "Escape") { e.preventDefault(); if (origin.current) onReorder(origin.current); setGrabbed(null); setMsg("Reorder cancelled"); }
                  }}
                  onBlur={() => grabbed === k && setGrabbed(null)}><Icons.Grip size={18} /></button>
                <div className="orlo-reorder__content">{render(it)}</div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <span className="orlo-visually-hidden" aria-live="assertive">{msg}</span>
    </>
  );
}
