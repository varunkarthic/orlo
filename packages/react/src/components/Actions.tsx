import { forwardRef, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Icons } from "../internal/icons.tsx";
import { Menu, type MenuItem } from "./Menu.tsx";
import { useDismiss } from "../internal/hooks.ts";

export type SplitButtonProps = { children: ReactNode; onClick: () => void; items: MenuItem[]; menuLabel?: string; variant?: "solid" | "subtle"; disabled?: boolean };

/** Primary action plus a menu of related alternatives. Two real buttons, two tab stops, one visual unit. */
export function SplitButton({ children, onClick, items, menuLabel = "More options", variant = "solid", disabled }: SplitButtonProps) {
  return (
    <div className="orlo-split" data-variant={variant} role="group">
      <button type="button" className="orlo-button" data-variant={variant} disabled={disabled} onClick={onClick}>{children}</button>
      <Menu placement="bottom-end" items={items} trigger={<button type="button" className="orlo-icon-button" data-variant={variant} aria-label={menuLabel} disabled={disabled}><Icons.ChevronDown size={18} /></button>} />
    </div>
  );
}

export type FabProps = ButtonHTMLAttributes<HTMLButtonElement> & { icon: ReactNode; label: string; extended?: boolean; position?: "static" | "fixed" };

/**
 * Floating action for the single most important action on a screen. `extended` shows the label; it collapses
 * to the icon while the page scrolls down and returns on scroll up, keeping the label as its accessible name.
 */
export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab({ icon, label, extended = false, position = "static", className, ...rest }, ref) {
  const [collapsed, setCollapsed] = useState(false);
  const { transition } = useOrloMotion();
  useEffect(() => {
    if (!extended || position !== "fixed") return;
    let last = window.scrollY;
    const on = () => { const y = window.scrollY; if (Math.abs(y - last) > 8) { setCollapsed(y > last && y > 80); last = y; } };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [extended, position]);
  const showLabel = extended && !collapsed;
  return (
    <motion.button ref={ref} type="button" layout aria-label={label} className={["orlo-fab", className].filter(Boolean).join(" ")} data-position={position} data-extended={showLabel || undefined} transition={transition("shift")} {...(rest as object)}>
      <span className="orlo-fab__icon" aria-hidden="true">{icon}</span>
      <AnimatePresence initial={false}>{showLabel && <motion.span className="orlo-fab__label" aria-hidden="true" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={transition("shift")}>{label}</motion.span>}</AnimatePresence>
    </motion.button>
  );
});

export type SpeedDialProps = { label: string; actions: { label: string; icon: ReactNode; onSelect: () => void }[]; icon?: ReactNode };

/** A FAB that fans out a few related actions. Each action keeps a visible label; Escape or outside press closes. */
export function SpeedDial({ label, actions, icon = <Icons.Plus /> }: SpeedDialProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const { transition, distance } = useOrloMotion();
  useDismiss({ open, id, onDismiss: () => setOpen(false), refs: [ref] });
  return (
    <div ref={ref} className="orlo-speed-dial" data-open={open || undefined}>
      <AnimatePresence>
        {open && (
          <motion.ul id={id} className="orlo-speed-dial__list" role="menu" aria-label={label}>
            {actions.map((a, i) => (
              <motion.li key={a.label} role="none" initial={{ opacity: 0, y: distance(12), scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { ...transition("reveal"), delay: (actions.length - 1 - i) * 0.03 } }} exit={{ opacity: 0, y: distance(8), transition: transition("dismiss") }}>
                <button type="button" role="menuitem" className="orlo-speed-dial__action" onClick={() => { setOpen(false); a.onSelect(); }}>
                  <span className="orlo-speed-dial__label">{a.label}</span><span className="orlo-speed-dial__icon" aria-hidden="true">{a.icon}</span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <button type="button" className="orlo-fab" aria-label={label} aria-expanded={open} aria-haspopup="menu" aria-controls={open ? id : undefined} onClick={() => setOpen((o) => !o)}>
        <motion.span className="orlo-fab__icon" aria-hidden="true" animate={{ rotate: open ? 45 : 0 }} transition={transition("press")}>{icon}</motion.span>
      </button>
    </div>
  );
}

export type HoldToConfirmProps = { children: ReactNode; onConfirm: () => void; duration?: number; tone?: "danger" | "accent" };

/**
 * For irreversible actions where a dialog would be too heavy: press and hold (pointer, Space or Enter) to confirm.
 * Releasing early cancels and the fill drains back. The required hold is announced, not just drawn.
 */
export function HoldToConfirm({ children, onConfirm, duration = 1200, tone = "danger" }: HoldToConfirmProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef(0); const start = useRef(0); const held = useRef(false);
  const id = useId();
  const tick = () => {
    const p = Math.min(1, (performance.now() - start.current) / duration);
    setProgress(p);
    if (p >= 1) { held.current = false; setDone(true); onConfirm(); setTimeout(() => { setDone(false); setProgress(0); }, 1400); return; }
    if (held.current) raf.current = requestAnimationFrame(tick);
  };
  const begin = () => { if (held.current || done) return; held.current = true; start.current = performance.now() - progress * duration; raf.current = requestAnimationFrame(tick); };
  const end = () => {
    if (!held.current) return; held.current = false; cancelAnimationFrame(raf.current);
    const from = progress; const t0 = performance.now();
    const drain = () => { const p = Math.max(0, from - (performance.now() - t0) / 300); setProgress(p); if (p > 0 && !held.current) raf.current = requestAnimationFrame(drain); };
    raf.current = requestAnimationFrame(drain);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (
    <button type="button" className="orlo-button orlo-hold" data-variant={tone === "danger" ? "danger" : "subtle"} data-done={done || undefined} aria-describedby={id}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); begin(); }} onPointerUp={end} onPointerCancel={end} onPointerLeave={end}
      onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); begin(); } }} onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") end(); }}
      onClick={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}>
      <span className="orlo-hold__fill" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <span className="orlo-button__label">{done ? <><Icons.Check size={16} /> Done</> : children}</span>
      <span id={id} className="orlo-visually-hidden">Press and hold for {Math.round(duration / 100) / 10} seconds to confirm.</span>
    </button>
  );
}
