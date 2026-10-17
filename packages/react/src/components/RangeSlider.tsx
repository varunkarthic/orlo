import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion, useTransform } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { useControllable } from "../internal/hooks.ts";
import { pointerFraction, useThumbMotion } from "../internal/thumb.ts";

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

/** Two thumbs that cannot cross. Track presses spring the nearest thumb; drags follow the pointer and settle with velocity. */
export function RangeSlider({ label, value: v, defaultValue = [20, 80], onValueChange, min = 0, max = 100, step = 1, minGap = 0, format = String, disabled }: RangeSliderProps) {
  const [value, setValue] = useControllable<[number, number]>(v, defaultValue, onValueChange);
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  const a = useThumbMotion(pct(value[0])), b = useThumbMotion(pct(value[1]));
  const thumbs = [a, b];
  const track = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState<0 | 1 | null>(null);
  const down = useRef<{ i: 0 | 1; x: number; dragging: boolean } | null>(null);
  const id = useId();
  const { transition, scale } = useOrloMotion();
  const left = useTransform(a.pos, (p) => `${p}%`);
  const right = useTransform(b.pos, (p) => `${100 - p}%`);
  const posA = useTransform(a.pos, (p) => `${p}%`), posB = useTransform(b.pos, (p) => `${p}%`);
  const snap = (n: number) => Math.min(max, Math.max(min, Math.round((n - min) / step) * step + min));
  const set = (i: 0 | 1, n: number) => {
    const next: [number, number] = [...value];
    next[i] = i === 0 ? Math.min(snap(n), value[1] - minGap) : Math.max(snap(n), value[0] + minGap);
    if (next[0] !== value[0] || next[1] !== value[1]) setValue(next);
    return next[i];
  };
  const onDown = (e: React.PointerEvent) => {
    if (disabled || e.button > 0) return;
    e.preventDefault();
    track.current!.setPointerCapture(e.pointerId);
    const hit = els.current.findIndex((el) => el?.contains(e.target as Node));
    const n = min + pointerFraction(track.current!, e) * (max - min);
    const i = (hit >= 0 ? hit : Math.abs(n - value[0]) <= Math.abs(n - value[1]) ? 0 : 1) as 0 | 1;
    els.current[i]?.focus({ preventScroll: true });
    down.current = { i, x: e.clientX, dragging: hit >= 0 };
    setActive(i);
    if (hit >= 0) thumbs[i].begin(); else set(i, n);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = down.current; if (!d) return;
    if (!d.dragging && Math.abs(e.clientX - d.x) > 3) { d.dragging = true; thumbs[d.i].begin(); }
    if (!d.dragging) return;
    const f = pointerFraction(track.current!, e);
    const v2 = set(d.i, min + f * (max - min));
    const limit = d.i === 0 ? pct(value[1] - minGap) : pct(value[0] + minGap);
    thumbs[d.i].follow(d.i === 0 ? Math.min(f * 100, limit) : Math.max(f * 100, limit));
    void v2;
  };
  const onUp = () => { const d = down.current; if (!d) return; down.current = null; setActive(null); if (d.dragging) thumbs[d.i].end(pct(value[d.i])); };
  const key = (i: 0 | 1) => (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const d = ({ ArrowRight: rtl ? -step : step, ArrowLeft: rtl ? step : -step, ArrowUp: step, ArrowDown: -step, PageUp: step * 10, PageDown: -step * 10 } as Record<string, number>)[e.key];
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
      <div ref={track} className="orlo-slider__track" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <span className="orlo-slider__rail" aria-hidden="true" />
        <motion.span className="orlo-slider__fill orlo-range__fill" style={{ insetInlineStart: left, insetInlineEnd: right }} aria-hidden="true" />
        {([0, 1] as const).map((i) => (
          <motion.div key={i} ref={(el) => { els.current[i] = el; }} role="slider" tabIndex={disabled ? -1 : 0} className="orlo-slider__thumb"
            style={{ insetInlineStart: i === 0 ? posA : posB }} animate={{ scale: active === i ? scale(1.18) : 1 }} transition={transition("press")}
            aria-labelledby={id} aria-label={i === 0 ? "Minimum" : "Maximum"} aria-valuemin={i === 0 ? min : value[0] + minGap} aria-valuemax={i === 0 ? value[1] - minGap : max}
            aria-valuenow={value[i]} aria-valuetext={format(value[i])} aria-disabled={disabled || undefined} onKeyDown={key(i)} />
        ))}
      </div>
    </div>
  );
}
