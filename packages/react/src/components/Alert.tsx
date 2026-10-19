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

export type CalloutVariant = "note" | "tip" | "important" | "caution";

export type CalloutProps = {
  variant?: CalloutVariant;
  tone?: CalloutVariant;
  title?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

const calloutGlyph: Record<CalloutVariant, ReactNode> = {
  note: <Icons.Info size={18} />,
  tip: <Icons.Sparkle size={18} />,
  important: <Icons.Alert size={18} />,
  caution: <Icons.Alert size={18} />,
};

/** Editorial callout box with icon, optional title, and tone styling. Inspired by Apple HIG editorial notes. */
export function Callout({ variant, tone: toneProp, title, children, icon, action, className }: CalloutProps) {
  const v = variant ?? toneProp ?? "note";
  return (
    <aside
      role="note"
      className={["orlo-callout", className].filter(Boolean).join(" ")}
      data-variant={v}
      data-tone={v}
      aria-label={typeof title === "string" ? title : `${v} note`}
    >
      <span className="orlo-callout__icon" aria-hidden="true">{icon ?? calloutGlyph[v]}</span>
      <div className="orlo-callout__content">
        {title && <strong className="orlo-callout__title">{title}</strong>}
        <div className="orlo-callout__body">{children}</div>
      </div>
      {action && <div className="orlo-callout__action">{action}</div>}
    </aside>
  );
}

