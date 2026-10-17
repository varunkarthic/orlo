import { useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";

export type ProgressProps = {
  label: ReactNode;
  /** Omit for indeterminate. Never fake progress you cannot measure. */
  value?: number;
  max?: number;
  showValue?: boolean;
  tone?: "accent" | "success" | "error";
};

export function Progress({ label, value, max = 100, showValue = true, tone = "accent" }: ProgressProps) {
  const id = useId();
  const { transition } = useOrloMotion();
  const pct = value === undefined ? undefined : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="orlo-progress" data-tone={tone}>
      <div className="orlo-progress__head">
        <span id={id} className="orlo-field__label">{label}</span>
        {showValue && pct !== undefined && <span className="orlo-hint">{Math.round(pct)}%</span>}
      </div>
      <div className="orlo-progress__track" role="progressbar" aria-labelledby={id} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} data-indeterminate={pct === undefined || undefined}>
        {pct === undefined ? <span className="orlo-progress__bar orlo-progress__bar--indeterminate" /> : (
          <motion.span className="orlo-progress__bar" initial={false} animate={{ width: `${pct}%` }} transition={transition("shift")} />
        )}
      </div>
    </div>
  );
}
