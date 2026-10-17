import { useCallback, useEffect, useState } from "react";

export type ImageState = "disabled" | "empty" | "loading" | "retrying" | "loaded" | "failed";

export type UseImageOptions = { enabled?: boolean; maxRetries?: number; retryDelayMs?: number; srcSet?: string; sizes?: string };

/**
 * Preloads `src` off-DOM (with srcset/sizes so the same candidate is chosen), awaits decode, then reports `loaded`.
 * Retries are bounded (exponential backoff) so a dead URL never hammers a server; `retry()` is the explicit escape hatch.
 */
export function useImageState(src: string | undefined, { enabled = true, maxRetries = 2, retryDelayMs = 800, srcSet, sizes }: UseImageOptions = {}) {
  const [state, setState] = useState<ImageState>(!enabled ? "disabled" : src ? "loading" : "empty");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return setState("disabled");
    if (!src) return setState("empty");
    setState(attempt > 0 ? "retrying" : "loading");
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const img = new Image();
    const fail = (tries: number) => {
      if (cancelled) return;
      if (tries < maxRetries) timer = setTimeout(() => !cancelled && run(tries + 1), retryDelayMs * 2 ** tries);
      else setState("failed");
    };
    const run = (tries: number) => {
      img.onload = () => {
        const done = () => !cancelled && setState("loaded");
        typeof img.decode === "function" ? img.decode().then(done, done) : done();
      };
      img.onerror = () => fail(tries);
      if (sizes) img.sizes = sizes;
      if (srcSet) img.srcset = srcSet;
      img.src = src;
    };
    run(0);
    return () => { cancelled = true; clearTimeout(timer); img.onload = img.onerror = null; img.src = ""; };
  }, [src, srcSet, sizes, enabled, maxRetries, retryDelayMs, attempt]);

  const retry = useCallback(() => {
    if (state === "failed") setAttempt((a) => a + 1);
  }, [state]);
  return { state, retry };
}
