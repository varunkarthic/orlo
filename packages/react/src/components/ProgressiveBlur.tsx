import type { CSSProperties } from "react";

export type ProgressiveBlurProps = {
  /** Which edge the blur is strongest at. */
  side?: "top" | "bottom" | "start" | "end";
  /** Size of the blur band (CSS length). */
  size?: string;
  /** Maximum blur in px at the strongest edge. */
  strength?: number;
  /** Number of layers; more is smoother and costlier. */
  layers?: number;
  /** Also fade to the canvas colour, so text dissolves rather than being cut. */
  fade?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Progressive blur band: stacked backdrop-filter layers whose radius doubles while masks hand off between them,
 * so content passing under sticky chrome softens and fades instead of being sliced through its glyphs.
 * Falls back to a plain fade under reduced transparency or without backdrop-filter support.
 */
export function ProgressiveBlur({ side = "top", size = "28px", strength = 12, layers = 5, fade = true, className, style }: ProgressiveBlurProps) {
  const dir = { top: "to bottom", bottom: "to top", start: "to right", end: "to left" }[side];
  const step = 100 / layers;
  return (
    <div className={["orlo-pblur", className].filter(Boolean).join(" ")} data-side={side} aria-hidden="true" style={{ ...style, "--pblur-size": size } as CSSProperties}>
      {Array.from({ length: layers }, (_, i) => {
        const r = strength * ((layers - i) / layers);
        const stopStart = (i / layers) * 100;
        const stopEnd = Math.min(100, ((i + 1.5) / layers) * 100);
        const mask = `linear-gradient(${dir}, #000 0%, #000 ${stopStart.toFixed(1)}%, rgb(0 0 0 / 0) ${stopEnd.toFixed(1)}%)`;
        return <span key={i} className="orlo-pblur__layer" style={{ backdropFilter: `blur(${r.toFixed(2)}px)`, WebkitBackdropFilter: `blur(${r.toFixed(2)}px)`, maskImage: mask, WebkitMaskImage: mask }} />;
      })}
      {fade && <span className="orlo-pblur__fade" style={{ background: `linear-gradient(${dir}, var(--orlo-pblur-color, var(--orlo-color-canvas)), transparent)` }} />}
    </div>
  );
}
