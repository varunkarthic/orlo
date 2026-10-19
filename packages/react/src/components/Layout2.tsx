import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useControllable } from "../internal/hooks.ts";

export type SplitterProps = { start: ReactNode; end: ReactNode; label?: string; orientation?: "horizontal" | "vertical"; value?: number; defaultValue?: number; onValueChange?: (v: number) => void; min?: number; max?: number; style?: CSSProperties };

/**
 * Two resizable panes. The divider is a focusable separator with a value: arrows resize, Home/End collapse to the limits,
 * Enter toggles between collapsed and the last size. Pointer drag uses capture, so leaving the window can’t strand it.
 */
export function Splitter({ start, end, label = "Resize panels", orientation = "horizontal", value: v, defaultValue = 50, onValueChange, min = 15, max = 85, style }: SplitterProps) {
  const [value, setValue] = useControllable(v, defaultValue, onValueChange);
  const box = useRef<HTMLDivElement>(null);
  const last = useRef(value);
  const horiz = orientation === "horizontal";
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const fromPointer = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    const rtl = getComputedStyle(box.current!).direction === "rtl";
    const f = horiz ? (e.clientX - r.left) / r.width : (e.clientY - r.top) / r.height;
    setValue(clamp((horiz && rtl ? 1 - f : f) * 100));
  };
  return (
    <div ref={box} className="orlo-splitter" data-orientation={orientation} style={{ ...style, [horiz ? "gridTemplateColumns" : "gridTemplateRows"]: `${value}% auto 1fr` }}>
      <div className="orlo-splitter__pane">{start}</div>
      <div role="separator" tabIndex={0} aria-label={label} aria-orientation={horiz ? "vertical" : "horizontal"} aria-valuenow={Math.round(value)} aria-valuemin={min} aria-valuemax={max} className="orlo-splitter__handle"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && fromPointer(e)}
        onDoubleClick={() => setValue(defaultValue)}
        onKeyDown={(e) => {
          const rtl = getComputedStyle(box.current!).direction === "rtl";
          const inc = horiz ? (rtl ? "ArrowLeft" : "ArrowRight") : "ArrowDown", dec = horiz ? (rtl ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
          const step = e.shiftKey ? 10 : 2;
          if (e.key === inc) { e.preventDefault(); setValue(clamp(value + step)); }
          else if (e.key === dec) { e.preventDefault(); setValue(clamp(value - step)); }
          else if (e.key === "Home") { e.preventDefault(); setValue(min); }
          else if (e.key === "End") { e.preventDefault(); setValue(max); }
          else if (e.key === "Enter") { e.preventDefault(); if (value > min) { last.current = value; setValue(min); } else setValue(last.current); }
        }}><span aria-hidden="true" /></div>
      <div className="orlo-splitter__pane">{end}</div>
    </div>
  );
}

/**
 * Truncates to whole lines with an ellipsis and offers a toggle only when the text actually overflows.
 * The full text is always in the DOM, so find-in-page and screen readers get all of it.
 */
export function ReadMore({ children, lines = 3, moreLabel = "Show more", lessLabel = "Show less" }: { children: ReactNode; lines?: number; moreLabel?: string; lessLabel?: string }) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 1 || open);
    check(); const ro = new ResizeObserver(check); ro.observe(el); return () => ro.disconnect();
  }, [open, children]);
  return (
    <div className="orlo-readmore">
      <div ref={ref} id={id} className="orlo-readmore__text" style={open ? undefined : ({ WebkitLineClamp: lines, "--lines": lines } as CSSProperties)} data-clamped={!open || undefined}>{children}</div>
      {overflows && <button type="button" className="orlo-link-button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>{open ? lessLabel : moreLabel}</button>}
    </div>
  );
}

/**
 * Scroll container with edge shadows that appear only when there is more to see, a stable gutter, and
 * keyboard focusability so it can be scrolled without a pointer.
 */
export function ScrollArea({ children, maxHeight = 240, label, style }: { children: ReactNode; maxHeight?: number | string; label: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const on = () => setEdges({ top: el.scrollTop > 2, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 2 });
    on(); el.addEventListener("scroll", on, { passive: true }); const ro = new ResizeObserver(on); ro.observe(el);
    return () => { el.removeEventListener("scroll", on); ro.disconnect(); };
  }, []);
  return (
    <div className="orlo-scroll" data-top={edges.top || undefined} data-bottom={edges.bottom || undefined} style={style}>
      <div ref={ref} className="orlo-scroll__viewport" tabIndex={0} role="region" aria-label={label} style={{ maxBlockSize: maxHeight }}>{children}</div>
    </div>
  );
}

export type AspectRatioProps = {
  ratio?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Constrains child content to a fixed aspect ratio (width / height), preventing layout shifts.
 */
export function AspectRatio({ ratio = 16 / 9, children, className, style }: AspectRatioProps) {
  return (
    <div className={["orlo-aspect-ratio", className].filter(Boolean).join(" ")} style={{ ...style, aspectRatio: `${ratio}` }}>
      {children}
    </div>
  );
}

