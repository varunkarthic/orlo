import { createElement, useLayoutEffect, useRef, useState, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";

type Size = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
type Tone = "default" | "muted" | "accent" | "success" | "warning" | "error" | "inherit";

export type TextProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  size?: Size;
  weight?: "regular" | "medium" | "semibold" | "bold";
  tone?: Tone;
  /** true = one line with ellipsis; a number = clamp to that many whole lines. */
  truncate?: boolean | number;
  /** Tabular figures for numbers that line up. */
  numeric?: boolean;
  balance?: boolean;
  align?: "start" | "center" | "end";
  lang?: string;
};

/** Body and UI text on the type scale. Truncation is always whole-line and keeps the full text in the DOM. */
export function Text({ as = "span", size, weight, tone, truncate, numeric, balance, align, className, style, ...rest }: TextProps) {
  const clamp = typeof truncate === "number" && truncate > 1 ? truncate : undefined;
  return createElement(as, {
    className: ["orlo-text", className].filter(Boolean).join(" "),
    "data-size": size, "data-weight": weight, "data-tone": tone, "data-truncate": truncate === true || truncate === 1 ? "line" : clamp ? "lines" : undefined,
    "data-numeric": numeric || undefined, "data-balance": balance || undefined, "data-align": align,
    style: clamp ? ({ ...style, "--orlo-lines": clamp } as CSSProperties) : style,
    ...rest,
  });
}

export type HeadingProps = Omit<TextProps, "as"> & { level?: 1 | 2 | 3 | 4 | 5 | 6 };
const headingSize: Record<number, Size> = { 1: "4xl", 2: "3xl", 3: "2xl", 4: "xl", 5: "lg", 6: "md" };

/** Semantic level and visual size are independent: <Heading level={2} size="xl">. */
export function Heading({ level = 2, size, weight = "bold", balance = true, ...rest }: HeadingProps) {
  return <Text as={`h${level}`} size={size ?? headingSize[level]} weight={weight} balance={balance} className="orlo-heading" {...rest} />;
}

/** Long-form content: comfortable measure, rhythm between elements, styled lists, quotes, code and tables. */
export function Prose({ children, measure = "base", className }: { children: ReactNode; measure?: "narrow" | "base" | "wide"; className?: string }) {
  return <div className={["orlo-prose", className].filter(Boolean).join(" ")} data-measure={measure}>{children}</div>;
}

/**
 * Middle truncation: keeps the start and the end ("annual-report-…-final-v3.pdf"), which is what matters for
 * filenames, paths and IDs. Measures real glyph widths, re-fits on resize, and exposes the full text to
 * assistive tech, find-in-page (via title) and copy.
 */
export function Truncate({ text, endChars, className }: { text: string; endChars?: number; className?: string }) {
  const box = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(text);
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const ctx = document.createElement("canvas").getContext("2d");
    const fit = () => {
      if (!ctx) return setShown(text);
      const cs = getComputedStyle(el);
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const avail = el.clientWidth;
      if (!avail || ctx.measureText(text).width <= avail) return setShown(text);
      const ext = endChars ?? Math.min(Math.max(text.length - text.lastIndexOf(".") + 4, 8), Math.floor(text.length / 2));
      let lo = 0, hi = text.length - ext, best = "…" + text.slice(-ext);
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const cand = text.slice(0, mid) + "…" + text.slice(text.length - ext);
        if (ctx.measureText(cand).width <= avail) { best = cand; lo = mid + 1; } else hi = mid - 1;
      }
      setShown(best);
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, [text, endChars]);
  return (
    <span ref={box} className={["orlo-truncate", className].filter(Boolean).join(" ")} title={shown !== text ? text : undefined}>
      <span aria-hidden="true">{shown}</span>
      <span className="orlo-visually-hidden">{text}</span>
    </span>
  );
}
