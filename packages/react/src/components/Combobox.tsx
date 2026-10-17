import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Portal } from "../internal/Portal.tsx";
import { useAnchoredPosition, useControllable, useDismiss } from "../internal/hooks.ts";
import { Icons } from "../internal/icons.tsx";
import { Spinner } from "./Spinner.tsx";

export type ComboboxOption = { value: string; label: string; description?: string; disabled?: boolean };
export type ComboboxProps = {
  label: ReactNode;
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (v: string | null) => void;
  /** Fires as the user types (for remote search). When set, Orlo does not filter locally. */
  onInputChange?: (text: string) => void;
  loading?: boolean;
  placeholder?: string;
  help?: ReactNode;
  emptyText?: string;
  name?: string;
};

/** Editable combobox with list autocomplete (WAI-ARIA). Local or remote filtering, loading and empty states, IME-safe. */
export function Combobox({ label, options, value: v, defaultValue = null, onValueChange, onInputChange, loading, placeholder, help, emptyText = "No matches", name }: ComboboxProps) {
  const [value, setValue] = useControllable<string | null>(v, defaultValue, onValueChange);
  const selected = options.find((o) => o.value === value);
  const [text, setText] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => { if (!open) setText(selected?.label ?? ""); }, [selected, open]);
  const list = useMemo(() => {
    if (onInputChange || !open || text === (selected?.label ?? "")) return options;
    const q = text.toLowerCase().trim();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, text, open, onInputChange, selected]);
  const pick = (o?: ComboboxOption) => { if (!o || o.disabled) return; setValue(o.value); setText(o.label); setOpen(false); };
  const move = (d: number) => {
    if (!list.length) return;
    let i = active;
    for (let n = 0; n < list.length; n++) { i = (i + d + list.length) % list.length; if (!list[i].disabled) break; }
    setActive(i); setOpen(true);
  };
  return (
    <div className="orlo-field">
      <label className="orlo-field__label" htmlFor={id}>{label}</label>
      <div className="orlo-input-group" ref={wrap}>
        <input ref={input} id={id} className="orlo-field__input" role="combobox" autoComplete="off" placeholder={placeholder} value={text}
          aria-expanded={open} aria-controls={`${id}-lb`} aria-autocomplete="list" aria-describedby={help ? `${id}-h` : undefined}
          aria-activedescendant={open && active >= 0 && list[active] ? `${id}-o-${list[active].value}` : undefined}
          onChange={(e) => { setText(e.target.value); setOpen(true); setActive(-1); onInputChange?.(e.target.value); if (!e.target.value) setValue(null); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
            else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
            else if (e.key === "Enter" && open && active >= 0) { e.preventDefault(); pick(list[active]); }
            else if (e.key === "Escape") { if (open) { e.preventDefault(); e.stopPropagation(); setOpen(false); } else { setText(""); setValue(null); } }
          }} />
        <span className="orlo-input-group__icon" aria-hidden="true">{loading ? <Spinner size="sm" label="" /> : <Icons.ChevronDown size={18} />}</span>
      </div>
      {help && <p id={`${id}-h`} className="orlo-field__msg">{help}</p>}
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <AnimatePresence>
        {open && (
          <Portal>
            <ComboList id={id} anchor={wrap} list={list} value={value} active={active} setActive={setActive} pick={pick} loading={loading} emptyText={emptyText} onClose={() => setOpen(false)} />
          </Portal>
        )}
      </AnimatePresence>
      <span className="orlo-visually-hidden" aria-live="polite">{open ? (loading ? "Loading" : `${list.length} options`) : ""}</span>
    </div>
  );
}

function ComboList({ id, anchor, list, value, active, setActive, pick, loading, emptyText, onClose }: { id: string; anchor: React.RefObject<HTMLDivElement | null>; list: ComboboxOption[]; value: string | null; active: number; setActive: (i: number) => void; pick: (o: ComboboxOption) => void; loading?: boolean; emptyText: string; onClose: () => void }) {
  const present = useIsPresent();
  const ref = useRef<HTMLUListElement>(null);
  const pos = useAnchoredPosition(anchor, ref, present, "bottom-start", 4);
  const { transition } = useOrloMotion();
  useDismiss({ open: present, id, onDismiss: onClose, refs: [ref, anchor], outside: false });
  useEffect(() => { if (active >= 0 && list[active]) document.getElementById(`${id}-o-${list[active].value}`)?.scrollIntoView?.({ block: "nearest" }); }, [id, active, list]);
  return (
    <motion.ul ref={ref} id={`${id}-lb`} role="listbox" className="orlo-menu orlo-listbox"
      style={{ left: pos?.x ?? -9999, top: pos?.y ?? -9999, minWidth: anchor.current?.offsetWidth, maxHeight: pos ? Math.min(pos.maxHeight, 300) : undefined, pointerEvents: present ? undefined : "none" }}
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1, transition: transition("overlay") }} exit={{ opacity: 0, transition: transition("dismiss") }}>
      {list.length === 0 && <li className="orlo-palette__empty" role="presentation">{loading ? "Loading…" : emptyText}</li>}
      {list.map((o, i) => (
        <li key={o.value} id={`${id}-o-${o.value}`} role="option" aria-selected={o.value === value} aria-disabled={o.disabled || undefined} data-active={i === active || undefined}
          className="orlo-menu__item" onPointerMove={() => !o.disabled && setActive(i)} onPointerDown={(e) => e.preventDefault()} onClick={() => pick(o)}>
          <span className="orlo-menu__text">{o.label}{o.description && <span className="orlo-hint">{o.description}</span>}</span>
          {o.value === value && <Icons.Check size={16} />}
        </li>
      ))}
    </motion.ul>
  );
}
