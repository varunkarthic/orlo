import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Portal } from "../internal/Portal.tsx";
import { useAnchoredPosition, useDismiss, useFocusScope } from "../internal/hooks.ts";
import { withTrigger } from "../internal/trigger.tsx";
import type { MenuItem } from "./Menu.tsx";

export type ContextMenuProps = { children: ReactNode; items: MenuItem[]; label?: string };

/**
 * Right-click menu that also opens with Shift+F10, the ContextMenu key and a 500 ms touch long-press
 * (cancelled if the finger moves, so scrolling still works). Positioned at the pointer, kept on screen.
 */
export function ContextMenu({ children, items, label = "Context menu" }: ContextMenuProps) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const press = useRef<{ t: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);
  const id = useId();
  const { transition } = useOrloMotion();
  const close = () => { setAt(null); area.current?.focus(); };
  useDismiss({ open: !!at, id, onDismiss: close, refs: [menu] });
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const openAt = (x: number, y: number) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight : 768;
    const estW = menu.current?.offsetWidth || 200;
    const estH = menu.current?.offsetHeight || 180;
    const posX = Math.max(8, Math.min(x, vw - estW - 8));
    const posY = y + estH > vh - 8 ? Math.max(8, y - estH) : y;
    setPos({ x: posX, y: posY });
    setAt({ x, y });
  };
  useEffect(() => {
    if (!at || !menu.current) return;
    const m = menu.current, vw = window.innerWidth, vh = window.innerHeight;
    setPos({ x: Math.max(8, Math.min(at.x, vw - m.offsetWidth - 8)), y: at.y + m.offsetHeight > vh - 8 ? Math.max(8, at.y - m.offsetHeight) : at.y });
    requestAnimationFrame(() => m.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus());
  }, [at]);
  return (
    <>
      <div ref={area} className="orlo-context-area" tabIndex={0} aria-haspopup="menu" aria-describedby={`${id}-hint`}
        onContextMenu={(e) => { e.preventDefault(); openAt(e.clientX, e.clientY); }}
        onKeyDown={(e) => { if ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu") { e.preventDefault(); const r = area.current!.getBoundingClientRect(); openAt(r.left + 16, r.top + 16); } }}
        onPointerDown={(e) => { if (e.pointerType !== "touch") return; const { clientX: x, clientY: y } = e; press.current = { x, y, t: setTimeout(() => openAt(x, y), 500) }; }}
        onPointerMove={(e) => { if (press.current && Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 10) { clearTimeout(press.current.t); press.current = null; } }}
        onPointerUp={() => { if (press.current) clearTimeout(press.current.t); press.current = null; }}>
        {children}
        <span id={`${id}-hint`} className="orlo-visually-hidden">Press Shift+F10 for actions.</span>
      </div>
      <AnimatePresence>
        {at && (
          <Portal>
            <motion.div ref={menu} role="menu" aria-label={label} className="orlo-menu" style={{ left: pos.x, top: pos.y, transformOrigin: "top left" }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1, transition: transition("overlay") }} exit={{ opacity: 0, transition: transition("dismiss") }}
              onKeyDown={(e) => {
                const l = Array.from(menu.current!.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'));
                const i = l.indexOf(document.activeElement as HTMLElement);
                if (e.key === "ArrowDown") { e.preventDefault(); l[(i + 1) % l.length]?.focus(); }
                else if (e.key === "ArrowUp") { e.preventDefault(); l[(i - 1 + l.length) % l.length]?.focus(); }
                else if (e.key === "Tab") { e.preventDefault(); close(); }
              }}>
              {items.map((it, i) => it.type === "separator" ? <div key={i} role="separator" className="orlo-menu__sep" /> : it.type === "label" ? <div key={i} role="presentation" className="orlo-menu__label">{it.label}</div> : (
                <div key={i} role="menuitem" tabIndex={-1} aria-disabled={it.disabled || undefined} data-tone={it.tone} className="orlo-menu__item"
                  onClick={() => { if (!it.disabled) { close(); it.onSelect?.(); } }}
                  onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !it.disabled) { e.preventDefault(); close(); it.onSelect?.(); } }}
                  onPointerMove={(e) => !it.disabled && e.currentTarget.focus({ preventScroll: true })}>
                  {it.icon && <span className="orlo-menu__icon" aria-hidden="true">{it.icon}</span>}
                  <span className="orlo-menu__text">{it.label}</span>
                  {it.shortcut && <kbd className="orlo-kbd" aria-hidden="true">{it.shortcut}</kbd>}
                </div>
              ))}
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}

export type HoverCardProps = { trigger: ReactElement; children: ReactNode; openDelay?: number; closeDelay?: number };

/**
 * Rich preview on hover or keyboard focus (e.g. a profile behind a username). Waits for intent before opening,
 * survives the pointer crossing to the card, and is never the only way to reach its content.
 */
export function HoverCard({ trigger, children, openDelay = 600, closeDelay = 250 }: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();
  const pos = useAnchoredPosition(anchor, card, open, "bottom-start", 8);
  const { transition, distance } = useOrloMotion();
  useDismiss({ open, id, onDismiss: () => setOpen(false), refs: [card, anchor] });
  useEffect(() => () => clearTimeout(t.current), []);
  const show = (d = openDelay) => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(true), d); };
  const hide = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(false), closeDelay); };
  return (
    <>
      {withTrigger(trigger, {
        ref: anchor, "aria-describedby": open ? id : undefined,
        onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && show(), onPointerLeave: (e: React.PointerEvent) => e.pointerType === "mouse" && hide(),
        onFocus: (e: React.FocusEvent<HTMLElement>) => e.currentTarget.matches(":focus-visible") && show(300), onBlur: hide,
      })}
      <AnimatePresence>
        {open && (
          <Portal>
            <motion.div ref={card} id={id} role="tooltip" className="orlo-popover orlo-hovercard" style={{ left: pos?.x ?? -9999, top: pos?.y ?? -9999, transformOrigin: pos?.origin }}
              onPointerEnter={() => clearTimeout(t.current)} onPointerLeave={hide}
              initial={{ opacity: 0, y: -distance(4), scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1, transition: transition("overlay") }} exit={{ opacity: 0, transition: transition("dismiss") }}>
              {children}
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}

export type TourStep = { target: string; title: string; body: ReactNode };
export type TourProps = { steps: TourStep[]; open: boolean; onOpenChange: (o: boolean) => void };

/**
 * Optional product tour. Spotlights one element at a time, is always skippable, keeps focus in the step card,
 * and scrolls targets into view. Missing targets are skipped instead of pointing at nothing.
 */
export function Tour({ steps, open, onOpenChange }: TourProps) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const id = useId();
  const { transition } = useOrloMotion();
  const valid = steps.filter((s) => typeof document !== "undefined" && document.querySelector(s.target));
  const step = valid[i];
  useEffect(() => { if (open) setI(0); }, [open]);
  useEffect(() => {
    if (!open || !step) return;
    const el = document.querySelector(step.target) as HTMLElement;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    const upd = () => setRect(el.getBoundingClientRect());
    upd(); const t = setTimeout(upd, 400);
    window.addEventListener("scroll", upd, true); window.addEventListener("resize", upd);
    return () => { clearTimeout(t); window.removeEventListener("scroll", upd, true); window.removeEventListener("resize", upd); };
  }, [open, step]);
  useFocusScope(card, open && !!step);
  useDismiss({ open: open && !!step, id, onDismiss: () => onOpenChange(false), refs: [card] });
  if (!open || !step) return null;
  const pad = 6;
  const below = rect ? rect.bottom + 220 < window.innerHeight : true;
  return (
    <Portal>
      <div className="orlo-tour" aria-hidden="false">
        {rect && <motion.div className="orlo-tour__spot" initial={false} animate={{ left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }} transition={transition("shared")} />}
        <motion.div ref={card} role="dialog" aria-modal="false" aria-labelledby={`${id}-t`} className="orlo-popover orlo-tour__card" key={i}
          style={rect ? { left: Math.max(8, Math.min(rect.left, window.innerWidth - 328)), top: below ? rect.bottom + 14 : Math.max(8, rect.top - 14 - 180) } : undefined}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: transition("reveal") }}>
          <p className="orlo-hint" style={{ margin: 0 }}>Step {i + 1} of {valid.length}</p>
          <h2 id={`${id}-t`} className="orlo-modal__title" style={{ margin: "4px 0 8px" }}>{step.title}</h2>
          <div>{step.body}</div>
          <div className="orlo-tour__actions">
            <button type="button" className="orlo-button" data-variant="ghost" data-size="sm" onClick={() => onOpenChange(false)}>Skip tour</button>
            <span style={{ flex: 1 }} />
            {i > 0 && <button type="button" className="orlo-button" data-variant="subtle" data-size="sm" onClick={() => setI(i - 1)}>Back</button>}
            <button type="button" className="orlo-button" data-variant="solid" data-size="sm" onClick={() => (i + 1 < valid.length ? setI(i + 1) : onOpenChange(false))}>{i + 1 < valid.length ? "Next" : "Finish"}</button>
          </div>
        </motion.div>
      </div>
    </Portal>
  );
}
