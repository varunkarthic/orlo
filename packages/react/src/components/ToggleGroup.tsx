import { forwardRef, useRef, type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { useControllable } from "../internal/hooks.ts";

export type ToggleButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & { pressed?: boolean; defaultPressed?: boolean; onPressedChange?: (p: boolean) => void };

/** A button that stays on (aria-pressed). Use for formatting or view options, not for settings that persist. */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton({ pressed: p, defaultPressed = false, onPressedChange, className, children, onClick, ...rest }, ref) {
  const [pressed, setPressed] = useControllable(p, defaultPressed, onPressedChange);
  return <button ref={ref} type="button" aria-pressed={pressed} className={["orlo-toggle", className].filter(Boolean).join(" ")} onClick={(e) => { setPressed(!pressed); onClick?.(e); }} {...rest}>{children}</button>;
});

export type ToggleGroupProps = {
  label: string;
  type?: "single" | "multiple";
  items: { value: string; label: ReactNode; "aria-label"?: string; disabled?: boolean }[];
  value?: string[]; defaultValue?: string[]; onValueChange?: (v: string[]) => void;
};

/** A toolbar of toggles with one tab stop and arrow-key movement (RTL-aware). `single` allows none or one. */
export function ToggleGroup({ label, type = "multiple", items, value: v, defaultValue = [], onValueChange }: ToggleGroupProps) {
  const [value, setValue] = useControllable(v, defaultValue, onValueChange);
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    const btns = Array.from(ref.current!.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    const rtl = getComputedStyle(ref.current!).direction === "rtl";
    const d = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    if (d) { e.preventDefault(); btns[(i + d + btns.length) % btns.length]?.focus(); }
    else if (e.key === "Home") { e.preventDefault(); btns[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); btns[btns.length - 1]?.focus(); }
  };
  const first = items.findIndex((i) => !i.disabled);
  return (
    <div ref={ref} role="toolbar" aria-label={label} className="orlo-toggle-group" onKeyDown={onKey}
      onFocus={(e) => { ref.current!.querySelectorAll<HTMLButtonElement>("button").forEach((b) => (b.tabIndex = b === (e.target as Element) ? 0 : -1)); }}>
      {items.map((it, i) => {
        const on = value.includes(it.value);
        return (
          <button key={it.value} type="button" aria-pressed={on} aria-label={it["aria-label"]} disabled={it.disabled} tabIndex={i === first ? 0 : -1} className="orlo-toggle"
            onClick={() => setValue(on ? value.filter((x) => x !== it.value) : type === "single" ? [it.value] : [...value, it.value])}>{it.label}</button>
        );
      })}
    </div>
  );
}
