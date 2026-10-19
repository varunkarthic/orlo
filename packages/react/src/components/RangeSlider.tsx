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
  /** Smallest allowed gap between the thumbs (enforced when allowCrossing is false). */
  minGap?: number;
  format?: (v: number) => string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  hideLabel?: boolean;
  /** Whether the two thumbs are allowed to cross each other. Defaults to false. */
  allowCrossing?: boolean;
};

/** Two thumbs with configurable crossing policy and orientation. Track presses spring the nearest thumb; drags follow pointer with spring settling. */
export function RangeSlider({
  label,
  value: v,
  defaultValue = [20, 80],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  minGap = 0,
  format = String,
  disabled,
  orientation = "horizontal",
  hideLabel,
  allowCrossing = false,
}: RangeSliderProps) {
  const [value, setValue] = useControllable<[number, number]>(v, defaultValue, onValueChange);
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  const a = useThumbMotion(pct(value[0])), b = useThumbMotion(pct(value[1]));
  const thumbs = [a, b];
  const track = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState<0 | 1 | null>(null);
  const down = useRef<{ i: 0 | 1; x: number; y: number; dragging: boolean } | null>(null);
  const id = useId();
  const vertical = orientation === "vertical";
  const { transition, scale } = useOrloMotion();

  const posA = useTransform(a.pos, (p) => `${p}%`), posB = useTransform(b.pos, (p) => `${p}%`);
  const left = useTransform(a.pos, (p) => `${Math.min(p, b.pos.get())}%`);
  const right = useTransform(b.pos, (p) => `${100 - Math.max(p, a.pos.get())}%`);

  const snap = (n: number) => Math.min(max, Math.max(min, Math.round((n - min) / step) * step + min));

  const set = (i: 0 | 1, n: number) => {
    const next: [number, number] = [...value];
    if (allowCrossing) {
      next[i] = snap(n);
    } else {
      next[i] = i === 0 ? Math.min(snap(n), value[1] - minGap) : Math.max(snap(n), value[0] + minGap);
    }
    if (next[0] !== value[0] || next[1] !== value[1]) setValue(next);
    return next[i];
  };

  const onDown = (e: React.PointerEvent) => {
    if (disabled || e.button > 0) return;
    e.preventDefault();
    track.current!.setPointerCapture(e.pointerId);
    const hit = els.current.findIndex((el) => el?.contains(e.target as Node));
    const n = min + pointerFraction(track.current!, e, vertical) * (max - min);
    const i = (hit >= 0 ? hit : Math.abs(n - value[0]) <= Math.abs(n - value[1]) ? 0 : 1) as 0 | 1;
    els.current[i]?.focus({ preventScroll: true });
    down.current = { i, x: e.clientX, y: e.clientY, dragging: hit >= 0 };
    setActive(i);
    if (hit >= 0) thumbs[i].begin(); else set(i, n);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = down.current; if (!d) return;
    if (!d.dragging && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 3) { d.dragging = true; thumbs[d.i].begin(); }
    if (!d.dragging) return;
    const f = pointerFraction(track.current!, e, vertical);
    const v2 = set(d.i, min + f * (max - min));
    if (!allowCrossing) {
      const limit = d.i === 0 ? pct(value[1] - minGap) : pct(value[0] + minGap);
      thumbs[d.i].follow(d.i === 0 ? Math.min(f * 100, limit) : Math.max(f * 100, limit));
    } else {
      thumbs[d.i].follow(f * 100);
    }
    void v2;
  };

  const onUp = () => {
    const d = down.current; if (!d) return;
    down.current = null;
    setActive(null);
    if (d.dragging) thumbs[d.i].end(pct(value[d.i]));
  };

  const key = (i: 0 | 1) => (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const d = ({ ArrowRight: rtl ? -step : step, ArrowLeft: rtl ? step : -step, ArrowUp: step, ArrowDown: -step, PageUp: step * 10, PageDown: -step * 10 } as Record<string, number>)[e.key];
    if (d !== undefined) { e.preventDefault(); set(i, value[i] + d); }
    else if (e.key === "Home") { e.preventDefault(); set(i, min); }
    else if (e.key === "End") { e.preventDefault(); set(i, max); }
  };

  const sortedVal = [Math.min(value[0], value[1]), Math.max(value[0], value[1])];

  return (
    <div className="orlo-slider orlo-range" data-orientation={orientation} data-disabled={disabled || undefined}>
      {!hideLabel && (
        <div className="orlo-slider__head">
          <span id={id} className="orlo-field__label">{label}</span>
          <span className="orlo-slider__value">{format(sortedVal[0])} – {format(sortedVal[1])}</span>
        </div>
      )}
      <div ref={track} className="orlo-slider__track" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <span className="orlo-slider__rail" aria-hidden="true" />
        <motion.span
          className="orlo-slider__fill orlo-range__fill"
          style={vertical ? { insetBlockEnd: left, insetBlockStart: right } : { insetInlineStart: left, insetInlineEnd: right }}
          aria-hidden="true"
        />
        {([0, 1] as const).map((i) => (
          <motion.div
            key={i}
            ref={(el) => { els.current[i] = el; }}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            className="orlo-slider__thumb"
            style={vertical ? { insetBlockEnd: i === 0 ? posA : posB } : { insetInlineStart: i === 0 ? posA : posB }}
            animate={{ scale: active === i ? scale(1.18) : 1 }}
            transition={transition("press")}
            aria-labelledby={id}
            aria-label={i === 0 ? "Minimum" : "Maximum"}
            aria-orientation={orientation}
            aria-valuemin={!allowCrossing && i === 1 ? value[0] + minGap : min}
            aria-valuemax={!allowCrossing && i === 0 ? value[1] - minGap : max}
            aria-valuenow={value[i]}
            aria-valuetext={format(value[i])}
            aria-disabled={disabled || undefined}
            onKeyDown={key(i)}
          />
        ))}
      </div>
    </div>
  );
}
