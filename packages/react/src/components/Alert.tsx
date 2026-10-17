import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import type { ReactNode } from "react";
import { Icons } from "../internal/icons.tsx";

export type AlertProps = {
  tone?: "info" | "success" | "warning" | "error";
  title: ReactNode;
  /** Falsy `open` plays the exit and unmounts, so nothing invisible stays in the tab order. */
  open?: boolean;
  children?: ReactNode;
  action?: ReactNode;
};

const glyph = { info: <Icons.Info />, success: <Icons.Check />, warning: <Icons.Alert />, error: <Icons.Alert /> };

export function Alert({ tone = "info", title, open = true, children, action }: AlertProps) {
  const { transition, distance } = useOrloMotion();
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className="orlo-alert"
          data-tone={tone}
          role={tone === "error" || tone === "warning" ? "alert" : "status"}
          initial={{ opacity: 0, y: -distance(6) }}
          animate={{ opacity: 1, y: 0, transition: transition("reveal") }}
          exit={{ opacity: 0, y: -distance(6), transition: transition("dismiss") }}
        >
          <span className="orlo-alert__glyph" aria-hidden="true">{glyph[tone]}</span>
          <div className="orlo-alert__body">
            <strong>{title}</strong>
            {children && <div>{children}</div>}
          </div>
          {action}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
