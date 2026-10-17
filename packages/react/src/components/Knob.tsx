import { useId, useRef, type ReactNode } from "react";
import { useControllable } from "../internal/hooks.ts";

export type KnobProps = {
  label: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (v: number) => void;
  min?: number; max?: number; step?: number;
  format?: (v: number) => string;
  size?: number;
};

const SWEEP = 270;
/** Arc path from angle a0 to a1 (degrees, 0 = up, clockwise). */
const arc = (r: number, a0: number, a1: number) => {
  const p = (a: number) => [50 + r * Math.sin((a * Math.PI) / 180), 50 - r * Math.cos((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

/**
 * Rotary control for dense, studio-style interfaces. Drag up/down (Shift for fine control), arrows, PageUp/PageDown,
 * Home/End; double-click resets to the default. Semantically a slider, so assistive tech treats it like one.
 */
export function Knob({ label, value: v, defaultValue = 50, onValueChange, min = 0, max = 100, step = 1, format = String, size = 72 }: KnobProps) {
  const [value, setValue] = useControllable(v, defaultValue, onValueChange);
  const id = useId();
  const start = useRef<{ y: number; v: number } | null>(null);
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n / step) * step));
  const f = (value - min) / (max - min);
  const a0 = -SWEEP / 2, a = a0 + f * SWEEP;
  return (
    <div className="orlo-knob">
      <div role="slider" tabIndex={0} aria-labelledby={id} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={format(value)}
        className="orlo-knob__dial" style={{ inlineSize: size, blockSize: size }}
        onDoubleClick={() => setValue(defaultValue)}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.focus(); start.current = { y: e.clientY, v: value }; }}
        onPointerMove={(e) => { if (!start.current) return; const range = max - min; const sens = e.shiftKey ? 600 : 160; setValue(clamp(start.current.v + ((start.current.y - e.clientY) / sens) * range)); }}
        onPointerUp={() => (start.current = null)} onPointerCancel={() => (start.current = null)}
        onKeyDown={(e) => {
          const big = (max - min) / 10;
          const d = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: big, PageDown: -big }[e.key];
          if (d !== undefined) { e.preventDefault(); setValue(clamp(value + d)); }
          else if (e.key === "Home") { e.preventDefault(); setValue(min); }
          else if (e.key === "End") { e.preventDefault(); setValue(max); }
        }}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d={arc(40, a0, a0 + SWEEP)} className="orlo-knob__track" />
          {f > 0.001 && <path d={arc(40, a0, a)} className="orlo-knob__fill" />}
          <line x1="50" y1="50" x2={50 + 26 * Math.sin((a * Math.PI) / 180)} y2={50 - 26 * Math.cos((a * Math.PI) / 180)} className="orlo-knob__needle" />
        </svg>
      </div>
      <span id={id} className="orlo-knob__label">{label}</span>
      <output className="orlo-slider__value">{format(value)}</output>
    </div>
  );
}
