import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { useControllable } from "../internal/hooks.ts";

export type RangeSliderProps = {
  label: ReactNode;
  value?: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (v: [number, number]) => void;
  min?: number; max?: number; step?: number;
  /** Smallest allowed gap between the thumbs. */
  minGap?: number;
  format?: (v: number) => string;
  disabled?: boolean;
};

/** Two-thumb slider. Thumbs cannot cross; pressing the track moves the nearest thumb; keyboard mirrors in RTL. */
export function RangeSlider({ label, value: v, defaultValue = [20, 80], onValueChange, min = 0, max = 100, step = 1, minGap = 0, format = String, disabled }: RangeSliderProps) {
  const [value, setValue] = useControllable<[number, number]>(v, defaultValue, onValueChange);
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  const snap = (n: number) => Math.min(max, Math.max(min, Math.round((n - min) / step) * step + min));
  const set = (i: 0 | 1, n: number) => {
    const next: [number, number] = [...value];
    next[i] = i === 0 ? Math.min(snap(n), value[1] - minGap) : Math.max(snap(n), value[0] + minGap);
    if (next[0] !== value[0] || next[1] !== value[1]) setValue(next);
  };
  const fromPointer = (x: number) => {
    const r = track.current!.getBoundingClientRect();
    const rtl = getComputedStyle(track.current!).direction === "rtl";
    const f = Math.min(1, Math.max(0, (x - r.left) / r.width));
    return min + (rtl ? 1 - f : f) * (max - min);
  };
  const drag = (i: 0 | 1) => (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    (e.target as HTMLElement).focus();
    const move = (ev: PointerEvent) => set(i, fromPointer(ev.clientX));
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
  };
  const key = (i: 0 | 1) => (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const d = { ArrowRight: rtl ? -step : step, ArrowLeft: rtl ? step : -step, ArrowUp: step, ArrowDown: -step, PageUp: step * 10, PageDown: -step * 10 }[e.key];
    if (d !== undefined) { e.preventDefault(); set(i, value[i] + d); }
    else if (e.key === "Home") { e.preventDefault(); set(i, min); }
    else if (e.key === "End") { e.preventDefault(); set(i, max); }
  };
  return (
    <div className="orlo-slider orlo-range" data-disabled={disabled || undefined}>
      <div className="orlo-slider__head">
        <span id={id} className="orlo-field__label">{label}</span>
        <span className="orlo-slider__value">{format(value[0])} – {format(value[1])}</span>
      </div>
      <div ref={track} className="orlo-range__track" onPointerDown={(e) => {
        if (disabled || e.target !== e.currentTarget) return;
        const n = fromPointer(e.clientX);
        const i = Math.abs(n - value[0]) <= Math.abs(n - value[1]) ? 0 : 1;
        set(i, n); drag(i)(e);
        (track.current!.querySelectorAll<HTMLElement>("[role=slider]")[i]).focus();
      }}>
        <span className="orlo-range__fill" style={{ insetInlineStart: `${pct(value[0])}%`, insetInlineEnd: `${100 - pct(value[1])}%` }} />
        {([0, 1] as const).map((i) => (
          <div key={i} role="slider" tabIndex={disabled ? -1 : 0} className="orlo-range__thumb" style={{ insetInlineStart: `${pct(value[i])}%` }}
            aria-labelledby={id} aria-label={i === 0 ? "Minimum" : "Maximum"} aria-valuemin={i === 0 ? min : value[0] + minGap} aria-valuemax={i === 0 ? value[1] - minGap : max}
            aria-valuenow={value[i]} aria-valuetext={format(value[i])} aria-disabled={disabled || undefined}
            onPointerDown={drag(i)} onKeyDown={key(i)} />
        ))}
      </div>
    </div>
  );
}
