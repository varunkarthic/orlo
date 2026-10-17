import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Portal } from "../internal/Portal.tsx";
import { useAnchoredPosition, useControllable, useDismiss } from "../internal/hooks.ts";
import { Icons } from "../internal/icons.tsx";

export type SelectOption = { value: string; label: string; disabled?: boolean; description?: ReactNode };
export type SelectProps = {
  label: ReactNode;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  help?: ReactNode;
};

/**
 * Single-select listbox (WAI-ARIA select-only combobox). Arrow keys, Home/End and typeahead work while closed or open;
 * the active option is tracked with aria-activedescendant so focus never leaves the trigger.
 */
export function Select({ label, options, value: v, defaultValue = "", onValueChange, placeholder = "Choose…", name, disabled, help }: SelectProps) {
  const [value, setValue] = useControllable(v, defaultValue, onValueChange);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const anchor = useRef<HTMLButtonElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const id = useId();
  const selected = options.find((o) => o.value === value);
  const enabledIdx = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  const openAt = (i: number) => { setActive(i); setOpen(true); };
  const move = (dir: 1 | -1) => {
    const pos = enabledIdx.indexOf(active);
    const next = enabledIdx[Math.max(0, Math.min(enabledIdx.length - 1, pos < 0 ? (dir > 0 ? 0 : enabledIdx.length - 1) : pos + dir))];
    setActive(next);
  };
  const commit = (i: number) => { const o = options[i]; if (o && !o.disabled) setValue(o.value); setOpen(false); };

  const onKey = (e: KeyboardEvent) => {
    const cur = options.findIndex((o) => o.value === value);
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openAt(cur >= 0 ? cur : enabledIdx[e.key === "ArrowUp" ? enabledIdx.length - 1 : 0]); }
    } else if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Home") { e.preventDefault(); setActive(enabledIdx[0]); }
    else if (e.key === "End") { e.preventDefault(); setActive(enabledIdx[enabledIdx.length - 1]); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); commit(active); }
    else if (e.key === "Tab") { if (active >= 0) commit(active); }
    if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      typed.current = { text: (now - typed.current.at > 500 ? "" : typed.current.text) + e.key.toLowerCase(), at: now };
      const hit = enabledIdx.find((i) => options[i].label.toLowerCase().startsWith(typed.current.text));
      if (hit !== undefined) open ? setActive(hit) : setValue(options[hit].value);
    }
  };

  return (
    <div className="orlo-field">
      <span className="orlo-field__label" id={`${id}-l`}>{label}</span>
      <button
        ref={anchor} type="button" role="combobox" disabled={disabled}
        className="orlo-field__input orlo-select"
        aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-lb`}
        aria-labelledby={`${id}-l ${id}-v`} aria-describedby={help ? `${id}-h` : undefined}
        aria-activedescendant={open && active >= 0 ? `${id}-o${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openAt(options.findIndex((o) => o.value === value)))}
        onKeyDown={onKey}
      >
        <span id={`${id}-v`} data-placeholder={!selected || undefined}>{selected?.label ?? placeholder}</span>
        <Icons.ChevronDown size={18} />
      </button>
      {help && <p id={`${id}-h`} className="orlo-field__msg">{help}</p>}
      {name && <input type="hidden" name={name} value={value} />}
      <AnimatePresence>
        {open && (
          <Portal>
            <Listbox id={id} anchor={anchor} options={options} value={value} active={active} setActive={setActive} commit={commit} onClose={() => setOpen(false)} />
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Listbox({ id, anchor, options, value, active, setActive, commit, onClose }: { id: string; anchor: React.RefObject<HTMLButtonElement | null>; options: SelectOption[]; value: string; active: number; setActive: (i: number) => void; commit: (i: number) => void; onClose: () => void }) {
  const present = useIsPresent();
  const ref = useRef<HTMLUListElement>(null);
  const pos = useAnchoredPosition(anchor, ref, present, "bottom-start", 4);
  const { transition } = useOrloMotion();
  useDismiss({ open: present, id, onDismiss: onClose, refs: [ref, anchor] });
  // Keep the active option visible when it moves via keyboard.
  useEffect(() => { document.getElementById(`${id}-o${active}`)?.scrollIntoView?.({ block: "nearest" }); }, [id, active]);
  return (
    <motion.ul
      ref={ref}
      id={`${id}-lb`}
      role="listbox"
      aria-labelledby={`${id}-l`}
      className="orlo-menu orlo-listbox"
      style={{ left: pos?.x ?? -9999, top: pos?.y ?? -9999, minWidth: anchor.current?.offsetWidth, maxHeight: pos ? Math.min(pos.maxHeight, 320) : undefined, transformOrigin: pos?.origin, pointerEvents: present ? undefined : "none" }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1, transition: transition("overlay") }}
      exit={{ opacity: 0, transition: transition("dismiss") }}
    >
      {options.map((o, i) => (
        <li
          key={o.value}
          id={`${id}-o${i}`}
          role="option"
          aria-selected={o.value === value}
          aria-disabled={o.disabled || undefined}
          data-active={i === active || undefined}
          className="orlo-menu__item"
          onPointerMove={() => !o.disabled && setActive(i)}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => commit(i)}
        >
          <span className="orlo-menu__text">{o.label}{o.description && <span className="orlo-hint">{o.description}</span>}</span>
          {o.value === value && <Icons.Check size={16} />}
        </li>
      ))}
    </motion.ul>
  );
}
