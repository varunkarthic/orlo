import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Portal } from "../internal/Portal.tsx";
import { useAnchoredPosition, useDismiss } from "../internal/hooks.ts";
import type { Placement } from "../internal/position.ts";
import { withTrigger } from "../internal/trigger.tsx";

// After one tooltip closes, the next opens instantly for a short while ("warm" state), so scanning a toolbar feels immediate.
let warmUntil = 0;

export type TooltipProps = {
  /** Short, non-interactive description. For links or buttons inside, use Popover. */
  content: ReactNode;
  children: ReactElement;
  placement?: Placement;
  delay?: number;
};

/** Opens on mouse hover (after a delay) or keyboard focus; never on touch. Escape closes. Wired via aria-describedby. */
export function Tooltip({ content, children, placement = "top", delay = 500 }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLElement>(null);
  const floating = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();
  const pos = useAnchoredPosition(anchor, floating, open, placement, 8);
  const { transition, distance } = useOrloMotion();
  useDismiss({ open, id, onDismiss: () => setOpen(false), refs: [], outside: false });
  useEffect(() => () => clearTimeout(timer.current), []);

  const show = (instant: boolean) => {
    clearTimeout(timer.current);
    if (instant || Date.now() < warmUntil) setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    // A short grace period means crossing the gap between trigger and tooltip does not flicker.
    timer.current = setTimeout(() => { setOpen((was) => { if (was) warmUntil = Date.now() + 400; return false; }); }, 80);
  };

  const trigger = withTrigger(children, {
    ref: anchor,
    "aria-describedby": open ? id : undefined,
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && show(false),
    onPointerLeave: (e: React.PointerEvent) => e.pointerType === "mouse" && hide(),
    onFocus: (e: React.FocusEvent<HTMLElement>) => { if (e.currentTarget.matches(":focus-visible")) show(true); },
    onBlur: hide,
    onPointerDown: () => { clearTimeout(timer.current); setOpen(false); },
  });

  return (
    <>
      {trigger}
      <AnimatePresence>
        {open && (
          <Portal>
            <motion.div
              ref={floating}
              id={id}
              role="tooltip"
              className="orlo-tooltip"
              style={{ left: pos?.x ?? -9999, top: pos?.y ?? -9999, transformOrigin: pos?.origin }}
              initial={{ opacity: 0, scale: 0.96, y: pos?.side === "bottom" ? -distance(2) : distance(2) }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: transition("reveal") }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
            >
              {content}
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
