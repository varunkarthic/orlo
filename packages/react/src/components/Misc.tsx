import { useLocale } from "../provider.tsx";
import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { animate } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Icons } from "../internal/icons.tsx";

/** Keyboard key. */
export const Kbd = ({ children }: { children: ReactNode }) => <kbd className="orlo-kbd">{children}</kbd>;

export const Divider = ({ label }: { label?: ReactNode }) =>
  label ? <div className="orlo-divider" role="separator" data-label=""><span>{label}</span></div> : <hr className="orlo-divider" />;

export type StackProps = HTMLAttributes<HTMLDivElement> & {
  direction?: "column" | "row";
  /** Space token step: 1–16 (4px each). */
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: boolean;
};
/** Flex layout on the space scale. Use CSS directly when this adds nothing. */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack({ direction = "column", gap = 4, align, justify, wrap, style, className, ...rest }, ref) {
  return <div ref={ref} className={["orlo-stack", className].filter(Boolean).join(" ")} style={{ display: "flex", flexDirection: direction, gap: `var(--orlo-space-${gap})`, alignItems: align, justifyContent: justify, flexWrap: wrap ? "wrap" : undefined, ...style }} {...rest} />;
});

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; variant?: "ghost" | "subtle" | "solid"; size?: "sm" | "md" };
/** Icon-only button. `label` is required: it becomes the accessible name. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ label, variant = "ghost", size = "md", className, type = "button", children, ...rest }, ref) {
  return <button ref={ref} type={type} aria-label={label} className={["orlo-icon-button", className].filter(Boolean).join(" ")} data-variant={variant} data-size={size} {...rest}>{children}</button>;
});

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="orlo-empty">
      <span className="orlo-empty__icon" aria-hidden="true">{icon ?? <Icons.Inbox size={28} />}</span>
      <p className="orlo-empty__title">{title}</p>
      {description && <p className="orlo-empty__desc">{description}</p>}
      {action}
    </div>
  );
}

/** Copies text; confirms in place and announces it. Falls back to an error label if the clipboard is blocked. */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setState("copied"); } catch { setState("failed"); }
    clearTimeout(t.current);
    t.current = setTimeout(() => setState("idle"), 1600);
  };
  return (
    <button type="button" className="orlo-button orlo-copy" data-variant="ghost" data-size="sm" onClick={copy}>
      {state === "copied" ? <Icons.Check size={16} /> : <Icons.Copy size={16} />}
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}</span>
    </button>
  );
}

/**
 * Animates between numeric values with locale formatting. Screen readers get only the settled value;
 * reduced motion shows it instantly. Negative numbers and decimals never pass through misleading states.
 */
export function AnimatedNumber({ value, format = {}, locale: localeProp }: { value: number; format?: Intl.NumberFormatOptions; locale?: string }) {
  const locale = useLocale(localeProp);
  const fmt = new Intl.NumberFormat(locale, format);
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(value);
  const { effective, transition } = useOrloMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (effective !== "full") { el.textContent = fmt.format(value); from.current = value; return; }
    const ctl = animate(from.current, value, { ...transition("shift"), onUpdate: (v) => { el.textContent = fmt.format(v); from.current = v; } });
    return () => ctl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, effective]);
  return (
    <span className="orlo-number">
      <span ref={ref} aria-hidden="true">{fmt.format(value)}</span>
      <span className="orlo-visually-hidden">{fmt.format(value)}</span>
    </span>
  );
}
