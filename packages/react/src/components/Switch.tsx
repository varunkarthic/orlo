import { useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { useControllable } from "../internal/hooks.ts";

export type SwitchProps = {
  label: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Submitted as "on" when checked, like a native checkbox. */
  name?: string;
  description?: ReactNode;
};

/** Immediate on/off setting. role="switch" with a real checked state; the thumb springs, rapid toggles redirect it. */
export function Switch({ label, checked: c, defaultChecked = false, onCheckedChange, disabled, name, description }: SwitchProps) {
  const [checked, setChecked] = useControllable(c, defaultChecked, onCheckedChange);
  const { transition } = useOrloMotion();
  const id = useId();
  return (
    <div className="orlo-switch-row">
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-describedby={description ? `${id}-d` : undefined}
        disabled={disabled}
        className="orlo-switch"
        data-checked={checked || undefined}
        onClick={() => setChecked(!checked)}
      >
        <motion.span className="orlo-switch__thumb" layout transition={transition("press")} />
      </button>
      <span className="orlo-switch__text">
        <label htmlFor={id}>{label}</label>
        {description && <span id={`${id}-d`} className="orlo-hint">{description}</span>}
      </span>
      {name && <input type="hidden" name={name} value={checked ? "on" : ""} />}
    </div>
  );
}
