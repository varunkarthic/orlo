import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { contrast, hexToHsl, hslToHex } from "@orlo/tokens";
import { useControllable } from "../internal/hooks.ts";

// HSV <-> hex for the 2D area.
const hsvToHex = (h: number, s: number, v: number) => {
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return hslToHex([h, sl * 100, l * 100]);
};
const hexToHsv = (hex: string): [number, number, number] => {
  const [h, s, l] = hexToHsl(hex); const L = l / 100, S = s / 100;
  const v = L + S * Math.min(L, 1 - L);
  return [h, v === 0 ? 0 : 2 * (1 - L / v), v];
};
const isHex = (s: string) => /^#[0-9a-f]{6}$/i.test(s);

export type ColorPickerProps = { label: ReactNode; value?: string; defaultValue?: string; onValueChange?: (hex: string) => void; swatches?: string[] };

/**
 * Saturation/brightness area, hue slider, hex input, swatches, live contrast readout and the EyeDropper API where available.
 * The area is a keyboard slider: arrows adjust saturation (left/right) and brightness (up/down); Shift moves 10%.
 */
export function ColorPicker({ label, value: v, defaultValue = "#A8370A", onValueChange, swatches = ["#A8370A", "#1F5FA8", "#1F7A4D", "#8A5A00", "#7C3AED", "#1C1B18"] }: ColorPickerProps) {
  const [value, setValue] = useControllable(v, defaultValue, onValueChange);
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [text, setText] = useState(value);
  const area = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => { if (value.toUpperCase() !== hsvToHex(...hsv).toUpperCase()) setHsv(hexToHsv(value)); setText(value); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  const apply = (h: number, s: number, b: number) => { const n: [number, number, number] = [h, Math.min(1, Math.max(0, s)), Math.min(1, Math.max(0, b))]; setHsv(n); setValue(hsvToHex(...n)); };
  const fromPointer = (e: { clientX: number; clientY: number }) => { const r = area.current!.getBoundingClientRect(); apply(hsv[0], (e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height); };
  const eyedrop = typeof window !== "undefined" && "EyeDropper" in window;
  const cw = contrast(value, "#FFFFFF"), cb = contrast(value, "#000000");
  return (
    <div className="orlo-color" role="group" aria-labelledby={id}>
      <span id={id} className="orlo-field__label">{label}</span>
      <div ref={area} className="orlo-color__area" role="slider" tabIndex={0} aria-label="Saturation and brightness"
        aria-valuetext={`Saturation ${Math.round(hsv[1] * 100)}%, brightness ${Math.round(hsv[2] * 100)}%`} aria-valuenow={Math.round(hsv[1] * 100)} aria-valuemin={0} aria-valuemax={100}
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv[0]} 100% 50%))` }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
        onPointerMove={(e) => e.buttons && fromPointer(e)}
        onKeyDown={(e) => {
          const d = e.shiftKey ? 0.1 : 0.01;
          const m: Record<string, [number, number]> = { ArrowRight: [d, 0], ArrowLeft: [-d, 0], ArrowUp: [0, d], ArrowDown: [0, -d] };
          if (m[e.key]) { e.preventDefault(); apply(hsv[0], hsv[1] + m[e.key][0], hsv[2] + m[e.key][1]); }
        }}>
        <span className="orlo-color__handle" style={{ left: `${hsv[1] * 100}%`, top: `${(1 - hsv[2]) * 100}%`, background: value }} />
      </div>
      <input type="range" className="orlo-color__hue" min={0} max={359} value={Math.round(hsv[0])} aria-label="Hue" aria-valuetext={`${Math.round(hsv[0])} degrees`} onChange={(e) => apply(+e.target.value, hsv[1], hsv[2])} />
      <div className="orlo-color__row">
        <span className="orlo-color__preview" style={{ background: value }} aria-hidden="true" />
        <input className="orlo-field__input orlo-color__hex" value={text} aria-label="Hex colour" spellCheck={false} maxLength={7}
          onChange={(e) => { const t = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value; setText(t); if (isHex(t)) setValue(t.toUpperCase()); }}
          onBlur={() => setText(value)} />
        {eyedrop && <button type="button" className="orlo-button" data-variant="ghost" data-size="sm" onClick={async () => { try { const r = await new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper().open(); setValue(r.sRGBHex.toUpperCase()); } catch { /* cancelled */ } }}>Pick</button>}
      </div>
      <div className="orlo-color__swatches" role="group" aria-label="Swatches">
        {swatches.map((s) => <button key={s} type="button" className="orlo-color__swatch" style={{ background: s }} aria-label={s} aria-pressed={s.toUpperCase() === value.toUpperCase()} onClick={() => setValue(s)} />)}
      </div>
      <p className="orlo-hint" style={{ margin: 0 }}>Text on this colour: white {cw.toFixed(1)}:1 {cw >= 4.5 ? "✓" : "✕"} · black {cb.toFixed(1)}:1 {cb >= 4.5 ? "✓" : "✕"}</p>
    </div>
  );
}
