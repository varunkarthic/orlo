import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Pt = { x: number; y: number; p: number };
export type SignatureValue = { kind: "drawn"; dataUrl: string } | null;
export type SignaturePadProps = { label: ReactNode; onValueChange?: (v: SignatureValue) => void; height?: number };

/**
 * Pressure-aware drawing surface with undo and clear. High-DPI canvas redrawing crisply on resize and theme change.
 */
export function SignaturePad({ label, onValueChange, height = 160 }: SignaturePadProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Pt[][]>([]);
  const [count, setCount] = useState(0);
  const id = useId();

  const draw = () => {
    const c = canvas.current; if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = getComputedStyle(c).color; ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const s of strokes.current) {
      for (let i = 1; i < s.length; i++) {
        ctx.lineWidth = 1.2 + s[i].p * 2.8;
        ctx.beginPath(); ctx.moveTo(s[i - 1].x * w, s[i - 1].y * h); ctx.lineTo(s[i].x * w, s[i].y * h); ctx.stroke();
      }
    }
  };
  useEffect(() => {
    const c = canvas.current; if (!c) return;
    draw();
    const ro = new ResizeObserver(draw); ro.observe(c);
    const mq = window.matchMedia("(prefers-color-scheme: dark)"); mq.addEventListener("change", draw);
    const mo = new MutationObserver(draw); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-orlo-theme"] });
    return () => { ro.disconnect(); mq.removeEventListener("change", draw); mo.disconnect(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const emit = () => onValueChange?.(strokes.current.length ? { kind: "drawn", dataUrl: canvas.current!.toDataURL("image/png") } : null);
  const point = (e: React.PointerEvent): Pt => { const r = canvas.current!.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, p: e.pressure && e.pointerType !== "mouse" ? e.pressure : 0.5 }; };

  return (
    <div className="orlo-signature" role="group" aria-labelledby={id}>
      <span id={id} className="orlo-field__label">{label}</span>
      <canvas ref={canvas} className="orlo-signature__canvas" style={{ blockSize: height }} role="img" aria-label={count ? `Signature with ${count} stroke${count > 1 ? "s" : ""}` : "Empty signature area. Draw with a mouse, finger or pen."}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); strokes.current.push([point(e)]); }}
        onPointerMove={(e) => { const s = strokes.current[strokes.current.length - 1]; if (!e.buttons || !s) return; for (const ev of (e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent])) s.push(point(ev as unknown as React.PointerEvent)); draw(); }}
        onPointerUp={() => { setCount(strokes.current.length); emit(); }} onPointerCancel={() => { strokes.current.pop(); draw(); }} />
      <div className="orlo-signature__bar">
        <span className="orlo-signature__line" aria-hidden="true">Sign above</span>
        <button type="button" className="orlo-button" data-variant="ghost" data-size="sm" disabled={!count} onClick={() => { strokes.current.pop(); setCount(strokes.current.length); draw(); emit(); }}>Undo</button>
        <button type="button" className="orlo-button" data-variant="ghost" data-size="sm" disabled={!count} onClick={() => { strokes.current = []; setCount(0); draw(); emit(); }}>Clear</button>
      </div>
    </div>
  );
}
