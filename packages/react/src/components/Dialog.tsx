import { useId, useRef, type ReactElement, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion, useIsPresent, useDragControls, type PanInfo } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Portal } from "../internal/Portal.tsx";
import { useControllable, useDismiss, useFocusScope, useInertOutside, useScrollLock } from "../internal/hooks.ts";
import { withTrigger } from "../internal/trigger.tsx";
import { Icons } from "../internal/icons.tsx";
import { usePortalContext } from "../provider.tsx";

type Common = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element that opens the surface. Gets aria-haspopup/aria-expanded and an onClick. */
  trigger?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Footer actions. A function receives `close`. */
  footer?: ReactNode | ((close: () => void) => ReactNode);
  /** Escape and backdrop press close it. Defaults to true (false for AlertDialog). */
  dismissible?: boolean;
  initialFocus?: RefObject<HTMLElement | null>;
  /** Hides the visible close button (Escape still works when dismissible). */
  hideClose?: boolean;
};

type SurfaceKind = { kind: "dialog"; size?: "sm" | "md" | "lg"; role?: "dialog" | "alertdialog" } | { kind: "sheet"; side?: "end" | "start" | "bottom" };

function ModalSurface(props: Common & SurfaceKind & { onClose: () => void }) {
  const { title, description, children, footer, dismissible = true, initialFocus, hideClose, onClose } = props;
  const present = useIsPresent();
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const { transition, distance, effective } = useOrloMotion();
  const drag = useDragControls();
  const { dir } = usePortalContext();
  const sign = (dir ?? (typeof document !== "undefined" ? document.documentElement.dir : "")) === "rtl" ? -1 : 1;

  useFocusScope(ref, present, { initial: initialFocus });
  useScrollLock(present);
  useInertOutside(ref, present);
  useDismiss({ open: present, id, onDismiss: onClose, refs: [ref], outside: dismissible, escape: dismissible });

  const isSheet = props.kind === "sheet";
  const side = isSheet ? props.side ?? "end" : undefined;
  const offset = side === "bottom" ? { y: "100%" } : side === "start" ? { x: `${-100 * sign}%` } : side === "end" ? { x: `${100 * sign}%` } : { y: distance(12), scale: effective === "full" ? 0.98 : 1 };
  const hidden = isSheet && effective !== "full" ? { opacity: 0 } : { opacity: isSheet ? 1 : 0, ...offset };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const h = ref.current?.offsetHeight ?? 400;
    if (info.offset.y > h * 0.3 || info.velocity.y > 600) onClose();
  };

  return (
    <div className="orlo-modal" data-kind={props.kind} data-side={side} style={{ pointerEvents: present ? undefined : "none" }}>
      <motion.div className="orlo-scrim" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: transition("overlay") }} exit={{ opacity: 0, transition: transition("dismiss") }} />
      <motion.div
        ref={ref}
        className="orlo-modal__panel"
        role={props.kind === "dialog" ? props.role ?? "dialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        aria-describedby={description ? `${id}-d` : undefined}
        data-size={props.kind === "dialog" ? props.size ?? "md" : undefined}
        tabIndex={-1}
        initial={hidden}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1, transition: transition(isSheet ? "overlay" : "reveal") }}
        exit={{ ...hidden, transition: transition("dismiss") }}
        drag={side === "bottom" && dismissible ? "y" : false}
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.9 }}
        onDragEnd={onDragEnd}
      >
        {side === "bottom" && <div className="orlo-sheet__handle" onPointerDown={(e) => drag.start(e)} aria-hidden="true"><span /></div>}
        <header className="orlo-modal__header">
          <h2 id={`${id}-t`} className="orlo-modal__title">{title}</h2>
          {!hideClose && dismissible && (
            <button type="button" className="orlo-icon-button" data-variant="ghost" aria-label="Close" onClick={onClose}><Icons.X /></button>
          )}
        </header>
        {description && <p id={`${id}-d`} className="orlo-modal__desc">{description}</p>}
        {children && <div className="orlo-modal__body">{children}</div>}
        {footer && <footer className="orlo-modal__footer">{typeof footer === "function" ? footer(onClose) : footer}</footer>}
      </motion.div>
    </div>
  );
}

function useSurface(p: Common) {
  const [open, setOpen] = useControllable(p.open, p.defaultOpen ?? false, p.onOpenChange);
  const trigger = withTrigger(p.trigger, { onClick: () => setOpen(true), "aria-haspopup": "dialog", "aria-expanded": open });
  return { open, close: () => setOpen(false), trigger };
}

export type DialogProps = Common & { size?: "sm" | "md" | "lg" };
/** Modal dialog: focus moves in and is trapped, the page becomes inert, scroll is locked once, focus returns to the trigger. */
export function Dialog(p: DialogProps) {
  const { open, close, trigger } = useSurface(p);
  return (
    <>
      {trigger}
      <AnimatePresence>{open && <Portal><ModalSurface {...p} kind="dialog" onClose={close} /></Portal>}</AnimatePresence>
    </>
  );
}

/** Confirmation that requires an explicit choice: not dismissible by Escape or backdrop by default. */
export function AlertDialog(p: DialogProps) {
  const { open, close, trigger } = useSurface(p);
  return (
    <>
      {trigger}
      <AnimatePresence>{open && <Portal><ModalSurface dismissible={false} {...p} kind="dialog" role="alertdialog" size={p.size ?? "sm"} onClose={close} /></Portal>}</AnimatePresence>
    </>
  );
}

export type SheetProps = Common & { side?: "end" | "start" | "bottom" };
/** Edge-anchored modal panel. `bottom` can be dragged down to dismiss from its handle only, never from content. */
export function Sheet(p: SheetProps) {
  const { open, close, trigger } = useSurface(p);
  return (
    <>
      {trigger}
      <AnimatePresence>{open && <Portal><ModalSurface {...p} kind="sheet" onClose={close} /></Portal>}</AnimatePresence>
    </>
  );
}
