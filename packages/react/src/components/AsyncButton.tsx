import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { AnimatedIcon } from "../internal/animated-icons.tsx";

export type AsyncState = "idle" | "pending" | "success" | "error";
export type AsyncButtonProps = {
  children: ReactNode;
  /** Runs on press. Resolve for success, reject for error. Receives a progress reporter (0–1) and an abort signal. */
  action: (report: (p: number) => void, signal: AbortSignal) => Promise<unknown>;
  variant?: "solid" | "tonal" | "subtle";
  pendingLabel?: string;
  successLabel?: ReactNode;
  errorLabel?: ReactNode;
  /** After success, offer a next step instead of returning to idle. */
  next?: { label: ReactNode; onClick: () => void };
  /** Allow cancelling while pending (aborts the signal). */
  cancellable?: boolean;
  /** ms to show success before returning to idle (ignored when `next` is set). */
  resetAfter?: number;
  /** Morph into a circular progress indicator while pending. Default true. */
  morph?: boolean;
};

/**
 * One button, every outcome. Press → it morphs into a circular progress indicator (determinate when the action
 * reports progress) → success expands into a confirmation (and optionally a next step), failure expands into
 * a retry with the error in words. Width and shape spring between states; the label crossfades as a block,
 * so no glyph is ever half-clipped. Status changes are announced politely.
 */
export function AsyncButton({ children, action, variant = "solid", pendingLabel = "Working", successLabel = "Done", errorLabel = "Failed — retry", next, cancellable, resetAfter = 1800, morph = true }: AsyncButtonProps) {
  const [state, setState] = useState<AsyncState>("idle");
  const [progress, setProgress] = useState<number | null>(null);
  const ctl = useRef<AbortController | null>(null);
  const { transition } = useOrloMotion();
  useEffect(() => () => ctl.current?.abort(), []);
  useEffect(() => {
    if (state !== "success" || next) return;
    const t = setTimeout(() => setState("idle"), resetAfter);
    return () => clearTimeout(t);
  }, [state, next, resetAfter]);

  const run = async () => {
    if (state === "pending") { if (cancellable) { ctl.current?.abort(); setState("idle"); } return; }
    if (state === "success" && next) { next.onClick(); setState("idle"); return; }
    ctl.current = new AbortController();
    setProgress(null); setState("pending");
    try {
      await action((p) => setProgress(Math.max(0, Math.min(1, p))), ctl.current.signal);
      if (!ctl.current.signal.aborted) setState("success");
    } catch {
      if (!ctl.current.signal.aborted) setState("error");
    }
  };

  const circle = morph && state === "pending" && !cancellable;
  const r = 9, c = 2 * Math.PI * r;
  const content = {
    idle: <>{children}</>,
    pending: circle ? null : <><AnimatedIcon name="spinner" size={16} /> {cancellable ? "Cancel" : pendingLabel}</>,
    success: <><AnimatedIcon name="check" size={16} /> {next ? next.label : successLabel}</>,
    error: <><AnimatedIcon name="alert" size={16} /> {errorLabel}</>,
  }[state];
  const announce = { idle: "", pending: pendingLabel, success: typeof successLabel === "string" ? successLabel : "Done", error: typeof errorLabel === "string" ? errorLabel : "Failed" }[state];

  return (
    <motion.button
      type="button"
      layout
      transition={transition("morph")}
      className="orlo-button orlo-async"
      data-variant={state === "error" ? "danger" : state === "success" && !next ? "tonal-success" : variant}
      data-state={state}
      data-circle={circle || undefined}
      aria-busy={state === "pending" || undefined}
      aria-label={circle ? `${pendingLabel}${progress !== null ? `, ${Math.round(progress * 100)}%` : ""}` : undefined}
      style={{ borderRadius: circle ? 999 : undefined }}
      onClick={run}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={state + (circle ? "c" : "")} className="orlo-button__label" layout="position"
          initial={{ opacity: 0, y: 6, filter: "blur(2px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: transition("fade") }} exit={{ opacity: 0, y: -6, filter: "blur(2px)", transition: transition("dismiss") }}>
          {circle ? (
            <svg className="orlo-async__ring" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <circle cx="12" cy="12" r={r} className="orlo-async__track" />
              {progress === null
                ? <circle cx="12" cy="12" r={r} className="orlo-async__bar orlo-async__bar--spin" strokeDasharray={`${c * 0.28} ${c}`} />
                : <motion.circle cx="12" cy="12" r={r} className="orlo-async__bar" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - progress) }} transition={transition("shift")} />}
            </svg>
          ) : content}
        </motion.span>
      </AnimatePresence>
      <span className="orlo-visually-hidden" role="status">{announce}</span>
    </motion.button>
  );
}
