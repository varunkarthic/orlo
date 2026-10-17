import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Spinner } from "./Spinner.tsx";
import { Icons } from "../internal/icons.tsx";

export type AsyncStatus = "idle" | "loading" | "success" | "error" | "empty" | "offline";
export type AsyncResult<T> = { status: AsyncStatus; data?: T; error?: unknown; stale: boolean; reload: () => void };

/**
 * Data loading with the details handled: aborts stale requests, keeps the last data visible while
 * reloading (stale-while-revalidate), reports "offline" separately from "error", and treats an empty
 * array as "empty" rather than success.
 */
export function useAsync<T>(fn: (signal: AbortSignal) => Promise<T>, deps: unknown[]): AsyncResult<T> {
  const [state, setState] = useState<{ status: AsyncStatus; data?: T; error?: unknown; stale: boolean }>({ status: "loading", stale: false });
  const [nonce, setNonce] = useState(0);
  const fnRef = useRef(fn); fnRef.current = fn;
  useEffect(() => {
    const ctl = new AbortController();
    setState((s) => ({ ...s, status: s.data !== undefined ? s.status : "loading", stale: s.data !== undefined }));
    fnRef.current(ctl.signal).then(
      (data) => { if (!ctl.signal.aborted) setState({ status: Array.isArray(data) && data.length === 0 ? "empty" : "success", data, stale: false }); },
      (error) => { if (!ctl.signal.aborted) setState((s) => ({ ...s, status: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error", error, stale: false })); },
    );
    return () => ctl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);
  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}

/** Shows a value only after `delay` ms and keeps it for at least `min` ms once shown: no 40 ms spinner flashes, no flicker. */
export function useDelayedFlag(on: boolean, delay = 300, min = 500) {
  const [shown, setShown] = useState(false);
  const since = useRef(0);
  useEffect(() => {
    if (on) { const t = setTimeout(() => { since.current = Date.now(); setShown(true); }, delay); return () => clearTimeout(t); }
    if (!shown) return;
    const left = Math.max(0, min - (Date.now() - since.current));
    const t = setTimeout(() => setShown(false), left);
    return () => clearTimeout(t);
  }, [on, delay, min, shown]);
  return shown;
}

export type AsyncContentProps<T> = {
  result: Pick<AsyncResult<T>, "status" | "data" | "error" | "stale" | "reload">;
  children: (data: T) => ReactNode;
  /** Shown while loading for the first time (ideally a skeleton of the final layout). */
  loading?: ReactNode;
  empty?: ReactNode;
  /** What failed, in words. */
  errorTitle?: ReactNode;
  errorDetail?: (error: unknown) => ReactNode;
  /** Min height reserved while loading so the layout doesn't jump. */
  minHeight?: number | string;
};

/**
 * Renders the right state for remote content with one consistent design: delayed loading, designed empty,
 * error with retry, offline with reassurance, and a quiet "Updating…" badge while stale data stays visible.
 */
export function AsyncContent<T>({ result, children, loading, empty, errorTitle = "Couldn’t load this", errorDetail, minHeight }: AsyncContentProps<T>) {
  const { status, data, error, stale, reload } = result;
  const showLoader = useDelayedFlag(status === "loading" && data === undefined);
  const { transition } = useOrloMotion();
  const body =
    data !== undefined && (status === "success" || stale) ? <>{children(data)}{stale && <span className="orlo-async-stale" role="status"><Spinner size="sm" label="" /> Updating…</span>}</>
    : status === "loading" ? (showLoader ? loading ?? <div className="orlo-async-loading" role="status"><Spinner label="Loading" /></div> : null)
    : status === "empty" ? empty ?? <p className="orlo-hint">Nothing here yet.</p>
    : status === "offline" ? <div className="orlo-async-msg" role="alert"><Icons.WifiOff size={22} /><strong>You’re offline</strong><span className="orlo-hint">This will load when you reconnect.</span><button type="button" className="orlo-button" data-variant="subtle" data-size="sm" onClick={reload}>Try again</button></div>
    : status === "error" ? <div className="orlo-async-msg" role="alert"><Icons.AlertCircle size={22} /><strong>{errorTitle}</strong>{errorDetail && <span className="orlo-hint">{errorDetail(error)}</span>}<button type="button" className="orlo-button" data-variant="subtle" data-size="sm" onClick={reload}>Try again</button></div>
    : null;
  return (
    <div className="orlo-async" style={{ minBlockSize: status === "loading" ? minHeight : undefined }} aria-busy={status === "loading" || stale || undefined}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={status === "success" || stale ? "data" : status} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: transition("fade") }} exit={{ opacity: 0, transition: transition("dismiss") }}>{body}</motion.div>
      </AnimatePresence>
    </div>
  );
}
