import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useTransform } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { useControllable } from "../internal/hooks.ts";
import { pointerFraction, useThumbMotion } from "../internal/thumb.ts";

export type SliderProps = {
  label: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (v: number) => void;
  /** Fires once when a drag or key interaction finishes. */
  onValueCommit?: (v: number) => void;
  min?: number; max?: number; step?: number;
  name?: string;
  disabled?: boolean;
  /** Formats the visible, bubble and announced value. */
  format?: (v: number) => string;
  /** Tick marks with optional labels. */
  marks?: (number | { value: number; label?: string })[];
  /** Show the floating value while interacting. Default true. */
  bubble?: boolean;
  orientation?: "horizontal" | "vertical";
  hideLabel?: boolean;
};

const snapTo = (v: number, min: number, max: number, step: number) => Math.min(max, Math.max(min, Math.round((v - min) / step) * step + min));

/**
 * Orlo slider. Pressing the track springs the thumb to the target; dragging follows the pointer exactly
 * and settles with the release velocity. Keyboard steps animate with the `thumb` spring.
 */
export function Slider({ label, value: v, defaultValue = 50, onValueChange, onValueCommit, min = 0, max = 100, step = 1, name, disabled, format = (n) => String(+n.toFixed(4)), marks, bubble = true, orientation = "horizontal", hideLabel }: SliderProps) {
  const [value, setValue] = useControllable(v, defaultValue, onValueChange);
  const pct = ((value - min) / (max - min)) * 100;
  const thumb = useThumbMotion(pct);
  const track = useRef<HTMLDivElement>(null);
  const thumbEl = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const down = useRef<{ x: number; y: number; dragging: boolean; fromThumb: boolean } | null>(null);
  const id = useId();
  const vertical = orientation === "vertical";
  const { transition, scale } = useOrloMotion();
  const posCss = useTransform(thumb.pos, (p) => `${p}%`);
  const fillCss = useTransform(thumb.pos, (p) => `${p}%`);
  const valueAt = (f: number) => snapTo(min + f * (max - min), min, max, step);

  const onDown = (e: React.PointerEvent) => {
    if (disabled || e.button > 0) return;
    e.preventDefault();
    track.current!.setPointerCapture(e.pointerId);
    thumbEl.current?.focus({ preventScroll: true });
    const fromThumb = thumbEl.current?.contains(e.target as Node) ?? false;
    down.current = { x: e.clientX, y: e.clientY, dragging: fromThumb, fromThumb };
    setActive(true);
    if (fromThumb) thumb.begin();
    else setValue(valueAt(pointerFraction(track.current!, e, vertical))); // springs there
  };
  const onMove = (e: React.PointerEvent) => {
    const d = down.current; if (!d) return;
    if (!d.dragging && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 3) { d.dragging = true; thumb.begin(); }
    if (!d.dragging) return;
    const f = pointerFraction(track.current!, e, vertical);
    thumb.follow(f * 100);
    const nv = valueAt(f);
    if (nv !== value) setValue(nv);
  };
  const onUp = () => {
    const d = down.current; if (!d) return;
    down.current = null; setActive(false);
    if (d.dragging) thumb.end(pct);
    onValueCommit?.(value);
  };
  const onKey = (e: KeyboardEvent) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const big = Math.max(step, (max - min) / 10);
    const map: Record<string, number> = { ArrowRight: rtl ? -step : step, ArrowLeft: rtl ? step : -step, ArrowUp: step, ArrowDown: -step, PageUp: big, PageDown: -big };
    let nv: number | undefined;
    if (e.key in map) nv = snapTo(value + map[e.key], min, max, step);
    else if (e.key === "Home") nv = min; else if (e.key === "End") nv = max;
    if (nv === undefined) return;
    e.preventDefault(); setValue(nv); onValueCommit?.(nv);
  };
  const markList = (marks ?? []).map((m) => (typeof m === "number" ? { value: m } : m));
  return (
    <div className="orlo-slider" data-orientation={orientation} data-disabled={disabled || undefined}>
      {!hideLabel && (
        <div className="orlo-slider__head">
          <span id={`${id}-l`} className="orlo-field__label">{label}</span>
          <output htmlFor={id} className="orlo-slider__value" aria-hidden="true">{format(value)}</output>
        </div>
      )}
      <div ref={track} className="orlo-slider__track" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <span className="orlo-slider__rail" aria-hidden="true" />
        <motion.span className="orlo-slider__fill" aria-hidden="true" style={vertical ? { blockSize: fillCss } : { inlineSize: fillCss }} />
        {markList.map((m) => (
          <span key={m.value} className="orlo-slider__mark" data-on={m.value <= value || undefined} style={{ [vertical ? "insetBlockEnd" : "insetInlineStart"]: `${((m.value - min) / (max - min)) * 100}%` } as CSSProperties} aria-hidden="true">
            {m.label && <span className="orlo-slider__mark-label">{m.label}</span>}
          </span>
        ))}
        <motion.div ref={thumbEl} id={id} role="slider" tabIndex={disabled ? -1 : 0} className="orlo-slider__thumb"
          aria-labelledby={hideLabel ? undefined : `${id}-l`} aria-label={hideLabel ? (typeof label === "string" ? label : undefined) : undefined}
          aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={format(value)}
          aria-orientation={orientation} aria-disabled={disabled || undefined}
          style={vertical ? { insetBlockEnd: posCss } : { insetInlineStart: posCss }}
          animate={{ scale: active ? scale(1.18) : 1 }} transition={transition("press")}
          onKeyDown={onKey} onFocus={() => setActive((a) => a)}>
          <AnimatePresence>
            {bubble && active && (
              <motion.span className="orlo-slider__bubble" aria-hidden="true" initial={{ opacity: 0, y: 4, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 / 1.18, transition: transition("tooltip") }} exit={{ opacity: 0, scale: 0.8, transition: transition("dismiss") }}>
                {format(value)}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
