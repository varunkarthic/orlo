import { useId, useRef, type ReactElement, type ReactNode } from "react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Portal } from "../internal/Portal.tsx";
import { useAnchoredPosition, useControllable, useDismiss, useFocusScope, useMediaQuery } from "../internal/hooks.ts";
import type { Placement } from "../internal/position.ts";
import { withTrigger } from "../internal/trigger.tsx";

export type PopoverProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: ReactElement;
  /** Accessible name for the panel. */
  label: string;
  placement?: Placement;
  children: ReactNode;
};

/**
 * Non-modal anchored panel. Flips and shifts at viewport edges and grows from its trigger.
 * Below 520px wide it docks to the bottom edge instead of squeezing beside the trigger, keeping the same tree (no state loss).
 */
export function Popover({ open: o, defaultOpen = false, onOpenChange, trigger, label, placement = "bottom-start", children }: PopoverProps) {
  const [open, setOpen] = useControllable(o, defaultOpen, onOpenChange);
  const anchor = useRef<HTMLElement>(null);
  const id = useId();
  return (
    <>
      {withTrigger(trigger, { ref: anchor, onClick: () => setOpen(!open), "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": open ? id : undefined })}
      <AnimatePresence>
        {open && (
          <Portal>
            <PopoverPanel id={id} anchor={anchor} label={label} placement={placement} onClose={() => setOpen(false)}>{children}</PopoverPanel>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}

function PopoverPanel({ id, anchor, label, placement, onClose, children }: { id: string; anchor: React.RefObject<HTMLElement | null>; label: string; placement: Placement; onClose: () => void; children: ReactNode }) {
  const present = useIsPresent();
  const ref = useRef<HTMLDivElement>(null);
  const narrow = useMediaQuery("(max-width: 519px)");
  const pos = useAnchoredPosition(anchor, ref, present && !narrow, placement);
  const { transition, distance, blur } = useOrloMotion();
  useFocusScope(ref, present, { trap: false });
  useDismiss({ open: present, id, onDismiss: onClose, refs: [ref, anchor] });
  const style = narrow ? undefined : { left: pos?.x ?? -9999, top: pos?.y ?? -9999, maxHeight: pos?.maxHeight, transformOrigin: pos?.origin };
  const dy = pos?.side === "top" ? distance(4) : -distance(4);
  return (
    <motion.div
      ref={ref}
      id={id}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      className="orlo-popover"
      data-docked={narrow || undefined}
      style={{ ...style, pointerEvents: present ? undefined : "none" }}
      initial={{ opacity: 0, scale: narrow ? 1 : 0.97, y: narrow ? distance(24) : dy, filter: blur(4) }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: { ...transition("overlay"), filter: transition("fade") } }}
      exit={{ opacity: 0, scale: narrow ? 1 : 0.97, transition: transition("dismiss") }}
    >
      {children}
    </motion.div>
  );
}
