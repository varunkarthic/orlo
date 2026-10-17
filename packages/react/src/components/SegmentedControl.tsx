import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { useControllable } from "../internal/hooks.ts";

export type SegmentedControlProps = {
  label: string;
  options: { value: string; label: ReactNode; "aria-label"?: string }[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  size?: "sm" | "md";
};

/** A small set of mutually exclusive choices, as a radiogroup. Selection is shown by surface and weight, not colour alone. */
export function SegmentedControl({ label, options, value: v, defaultValue, onValueChange, size = "md" }: SegmentedControlProps) {
  const [value, setValue] = useControllable(v, defaultValue ?? options[0]?.value, onValueChange);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const { transition } = useOrloMotion();
  const onKey = (e: KeyboardEvent) => {
    const rtl = getComputedStyle(ref.current!).direction === "rtl";
    const fwd = e.key === "ArrowRight" || e.key === "ArrowDown", back = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!fwd && !back) return;
    e.preventDefault();
    const dir = (fwd ? 1 : -1) * (rtl && (e.key === "ArrowRight" || e.key === "ArrowLeft") ? -1 : 1);
    const i = options.findIndex((o) => o.value === value);
    const next = options[(i + dir + options.length) % options.length];
    setValue(next.value);
    ref.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(next.value)}"]`)?.focus();
  };
  return (
    <div ref={ref} role="radiogroup" aria-label={label} className="orlo-segmented" data-size={size} onKeyDown={onKey}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} aria-label={o["aria-label"]} tabIndex={on ? 0 : -1} data-value={o.value} className="orlo-segmented__item" onClick={() => setValue(o.value)}>
            {on && <motion.span className="orlo-segmented__thumb" layoutId={`${id}-thumb`} transition={transition("shift")} />}
            <span className="orlo-segmented__label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
