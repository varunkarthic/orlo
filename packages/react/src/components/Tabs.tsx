import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { useControllable } from "../internal/hooks.ts";

export type TabItem = { value: string; label: ReactNode; content: ReactNode; disabled?: boolean };
export type TabsVariant = "line" | "pill" | "enclosed";
export type TabsProps = { items: TabItem[]; value?: string; defaultValue?: string; onValueChange?: (v: string) => void; label?: string; variant?: TabsVariant };

/**
 * Tabs with automatic activation and roving focus (arrows respect RTL, Home/End).
 * The indicator is one shared element that travels to the new tab; it never animates through tabs in between.
 * Supports line (default underline indicator) and pill (Apple-style segmented surface) variants.
 * Inactive panels are unmounted, so their controls never sit in the tab order.
 */
export function Tabs({ items = [], value: v, defaultValue, onValueChange, label, variant = "line" }: TabsProps) {
  const [value, setValue] = useControllable(v, defaultValue ?? items[0]?.value, onValueChange);
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const { transition } = useOrloMotion();
  const enabled = items.filter((i) => !i.disabled);

  const onKey = (e: KeyboardEvent) => {
    const rtl = getComputedStyle(list.current!).direction === "rtl";
    const i = enabled.findIndex((t) => t.value === value);
    const step = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    let next = step ? enabled[(i + step + enabled.length) % enabled.length] : e.key === "Home" ? enabled[0] : e.key === "End" ? enabled[enabled.length - 1] : null;
    if (!next) return;
    e.preventDefault();
    setValue(next.value);
    list.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(next.value)}"]`)?.focus();
  };

  const current = items.find((t) => t.value === value);
  return (
    <div className="orlo-tabs" data-variant={variant}>
      <div ref={list} role="tablist" aria-label={label} className="orlo-tabs__list" onKeyDown={onKey}>
        {items.map((t) => {
          const selected = t.value === value;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              id={`${id}-t-${t.value}`}
              data-value={t.value}
              aria-selected={selected}
              aria-controls={`${id}-p-${t.value}`}
              tabIndex={selected ? 0 : -1}
              disabled={t.disabled}
              className="orlo-tabs__tab"
              onClick={() => setValue(t.value)}
            >
              {t.label}
              {selected && <motion.span className="orlo-tabs__indicator" layoutId={`${id}-ind`} transition={transition("shift")} />}
            </button>
          );
        })}
      </div>
      {current && (
        <div role="tabpanel" id={`${id}-p-${current.value}`} aria-labelledby={`${id}-t-${current.value}`} tabIndex={0} className="orlo-tabs__panel">
          {current.content}
        </div>
      )}
    </div>
  );
}
