import { useEffect, useId, useRef, type ReactElement, type ReactNode, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Portal } from "../internal/Portal.tsx";
import { useAnchoredPosition, useControllable, useDismiss } from "../internal/hooks.ts";
import type { Placement } from "../internal/position.ts";
import { withTrigger } from "../internal/trigger.tsx";

export type MenuItem =
  | { type?: "item"; label: string; onSelect?: () => void; shortcut?: string; disabled?: boolean; tone?: "danger"; icon?: ReactNode }
  | { type: "separator" }
  | { type: "label"; label: string };

export type MenuProps = { trigger: ReactElement; items: MenuItem[]; label?: string; placement?: Placement; open?: boolean; onOpenChange?: (o: boolean) => void };

/**
 * Action menu (WAI-ARIA menu button pattern): arrows, Home/End, typeahead, Escape and Tab close,
 * focus returns to the trigger. Long menus scroll inside the panel instead of leaving the viewport.
 */
export function Menu({ trigger, items, label, placement = "bottom-start", open: o, onOpenChange }: MenuProps) {
  const [open, setOpen] = useControllable(o, false, onOpenChange);
  const anchor = useRef<HTMLElement>(null);
  const firstKey = useRef<"first" | "last">("first");
  const id = useId();
  const close = (refocus = true) => { setOpen(false); if (refocus) anchor.current?.focus(); };
  return (
    <>
      {withTrigger(trigger, {
        ref: anchor, id: `${id}-trigger`, "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": open ? id : undefined,
        onClick: () => { firstKey.current = "first"; setOpen(!open); },
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); firstKey.current = e.key === "ArrowUp" ? "last" : "first"; setOpen(true); }
        },
      })}
      <AnimatePresence>
        {open && <Portal><MenuPanel id={id} anchor={anchor} items={items} label={label} placement={placement} start={firstKey.current} onClose={close} /></Portal>}
      </AnimatePresence>
    </>
  );
}

function MenuPanel({ id, anchor, items, label, placement, start, onClose }: { id: string; anchor: React.RefObject<HTMLElement | null>; items: MenuItem[]; label?: string; placement: Placement; start: "first" | "last"; onClose: (refocus?: boolean) => void }) {
  const present = useIsPresent();
  const ref = useRef<HTMLDivElement>(null);
  const pos = useAnchoredPosition(anchor, ref, present, placement, 4);
  const { transition, distance } = useOrloMotion();
  const typed = useRef({ text: "", at: 0 });
  useDismiss({ open: present, id, onDismiss: () => onClose(), refs: [ref, anchor] });
  useEffect(() => {
    const f = requestAnimationFrame(() => focusAt(start === "last" ? -1 : 0));
    return () => cancelAnimationFrame(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enabled = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? []);
  const focusAt = (i: number) => { const l = enabled(); l[(i + l.length) % l.length]?.focus(); };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const l = enabled(); const i = l.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") { e.preventDefault(); focusAt(i + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); focusAt(i - 1); }
    else if (e.key === "Home") { e.preventDefault(); focusAt(0); }
    else if (e.key === "End") { e.preventDefault(); focusAt(-1); }
    else if (e.key === "Tab") { onClose(false); }
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      typed.current = { text: (now - typed.current.at > 500 ? "" : typed.current.text) + e.key.toLowerCase(), at: now };
      const hit = l.find((n) => n.textContent?.trim().toLowerCase().startsWith(typed.current.text));
      hit?.focus();
    }
  };

  return (
    <motion.div
      ref={ref}
      id={id}
      role="menu"
      aria-label={label}
      aria-labelledby={label ? undefined : `${id}-trigger`}
      className="orlo-menu"
      onKeyDown={onKey}
      style={{ left: pos?.x ?? -9999, top: pos?.y ?? -9999, maxHeight: pos?.maxHeight, transformOrigin: pos?.origin, pointerEvents: present ? undefined : "none" }}
      initial={{ opacity: 0, scale: 0.97, y: pos?.side === "top" ? distance(4) : -distance(4) }}
      animate={{ opacity: 1, scale: 1, y: 0, transition: transition("overlay") }}
      exit={{ opacity: 0, scale: 0.98, transition: transition("dismiss") }}
    >
      {items.map((it, i) =>
        it.type === "separator" ? <div key={i} role="separator" className="orlo-menu__sep" />
        : it.type === "label" ? <div key={i} role="presentation" className="orlo-menu__label">{it.label}</div>
        : (
          <div
            key={i}
            role="menuitem"
            tabIndex={-1}
            aria-disabled={it.disabled || undefined}
            data-tone={it.tone}
            className="orlo-menu__item"
            onClick={() => { if (it.disabled) return; onClose(); it.onSelect?.(); }}
            onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !it.disabled) { e.preventDefault(); onClose(); it.onSelect?.(); } }}
            onPointerMove={(e) => !it.disabled && e.currentTarget.focus({ preventScroll: true })}
          >
            {it.icon && <span className="orlo-menu__icon" aria-hidden="true">{it.icon}</span>}
            <span className="orlo-menu__text">{it.label}</span>
            {it.shortcut && <kbd className="orlo-kbd" aria-hidden="true">{it.shortcut}</kbd>}
          </div>
        ),
      )}
    </motion.div>
  );
}
