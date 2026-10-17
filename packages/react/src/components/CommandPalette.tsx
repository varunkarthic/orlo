import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Portal } from "../internal/Portal.tsx";
import { useControllable, useDismiss, useFocusScope, useInertOutside, useScrollLock } from "../internal/hooks.ts";
import { Icons } from "../internal/icons.tsx";

export type Command = { id: string; label: string; group?: string; hint?: ReactNode; keywords?: string; onSelect: () => void };

/** Subsequence match with a preference for word starts and contiguous runs. Returns -1 when it does not match. */
export function score(query: string, text: string): number {
  const q = query.toLowerCase().trim(), t = text.toLowerCase();
  if (!q) return 0;
  let s = 0, ti = 0, run = 0;
  for (const ch of q) {
    const i = t.indexOf(ch, ti);
    if (i < 0) return -1;
    run = i === ti ? run + 1 : 0;
    s += 1 + run * 2 + (i === 0 || /[\s\-/]/.test(t[i - 1]) ? 3 : 0) - Math.min(i - ti, 3) * 0.5;
    ti = i + 1;
  }
  return s;
}

export type CommandPaletteProps = {
  commands: Command[];
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  placeholder?: string;
  /** Registers ⌘K / Ctrl+K. */
  hotkey?: boolean;
  empty?: ReactNode;
};

/** Keyboard-first command and search dialog (combobox + listbox). Works without a server: you pass the index. */
export function CommandPalette({ commands, open: o, onOpenChange, placeholder = "Search or jump to…", hotkey = true, empty = "No matches. Try fewer letters." }: CommandPaletteProps) {
  const [open, setOpen] = useControllable(o, false, onOpenChange);
  useEffect(() => {
    if (!hotkey) return;
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // Opening is deliberately idempotent. Repeated key events must not close the
        // palette before its focus scope can move focus to the search field.
        if (!open) setOpen(true);
      }
    };
    document.addEventListener("keydown", on);
    return () => document.removeEventListener("keydown", on);
  }, [hotkey, open, setOpen]);
  return <AnimatePresence>{open && <Portal><Palette commands={commands} placeholder={placeholder} empty={empty} onClose={() => setOpen(false)} /></Portal>}</AnimatePresence>;
}

function Palette({ commands, placeholder, empty, onClose }: { commands: Command[]; placeholder: string; empty: ReactNode; onClose: () => void }) {
  const present = useIsPresent();
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const { transition, distance } = useOrloMotion();
  useFocusScope(ref, present, { initial: input });
  useScrollLock(present);
  useInertOutside(ref, present);
  useDismiss({ open: present, id, onDismiss: onClose, refs: [ref] });

  const results = useMemo(() => commands
    .map((c) => ({ c, s: Math.max(score(q, c.label), score(q, `${c.keywords ?? ""} ${c.group ?? ""}`) - 2) }))
    .filter((r) => r.s >= 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 50).map((r) => r.c), [q, commands]);
  useEffect(() => setActive(0), [q]);
  useEffect(() => { document.getElementById(`${id}-o${active}`)?.scrollIntoView?.({ block: "nearest" }); }, [id, active]);

  const run = (c?: Command) => { if (!c) return; onClose(); c.onSelect(); };
  return (
    <div className="orlo-modal" data-kind="palette" style={{ pointerEvents: present ? undefined : "none" }}>
      <motion.div className="orlo-scrim" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: transition("overlay") }} exit={{ opacity: 0, transition: transition("dismiss") }} />
      <motion.div
        ref={ref} role="dialog" aria-modal="true" aria-label="Command palette" className="orlo-modal__panel orlo-palette"
        initial={{ opacity: 0, y: -distance(8), scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1, transition: transition("overlay") }} exit={{ opacity: 0, scale: 0.98, transition: transition("dismiss") }}
      >
        <div className="orlo-palette__search">
          <Icons.Search size={18} />
          <input
            ref={input} role="combobox" aria-expanded="true" aria-controls={`${id}-lb`} aria-autocomplete="list"
            aria-activedescendant={results[active] ? `${id}-o${active}` : undefined} aria-label="Search"
            placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return; // never act mid-IME composition
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              else if (e.key === "Enter") { e.preventDefault(); run(results[active]); }
            }}
          />
          <kbd className="orlo-kbd">Esc</kbd>
        </div>
        <ul id={`${id}-lb`} role="listbox" aria-label="Results" className="orlo-palette__list">
          {results.length === 0 && <li className="orlo-palette__empty" role="presentation">{empty}</li>}
          {results.map((c, i) => (
            <li key={c.id} id={`${id}-o${i}`} role="option" aria-selected={i === active} data-active={i === active || undefined} className="orlo-menu__item"
              onPointerMove={() => setActive(i)} onPointerDown={(e) => e.preventDefault()} onClick={() => run(c)}>
              <span className="orlo-menu__text">{c.label}</span>
              {(c.hint ?? c.group) && <span className="orlo-hint">{c.hint ?? c.group}</span>}
            </li>
          ))}
        </ul>
        <p className="orlo-visually-hidden" aria-live="polite">{results.length} results</p>
      </motion.div>
    </div>
  );
}
