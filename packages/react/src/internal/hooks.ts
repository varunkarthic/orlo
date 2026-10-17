import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { computePosition, type Placement } from "./position.ts";

export const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Controlled/uncontrolled state with a single code path. */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const set = useCallback((v: T) => { if (!controlled) setInner(v); if (!Object.is(v, current)) onChange?.(v); }, [controlled, current, onChange]);
  return [current, set] as const;
}

/** True after hydration. Guards portals and browser-only APIs during SSR. */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function useMediaQuery(query: string, ssrDefault = false) {
  const [match, setMatch] = useState(ssrDefault);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatch(mq.matches);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

// ---- Layer stack: only the topmost overlay reacts to Escape / outside press. ----
const stack: string[] = [];
export function useLayer(id: string, active: boolean) {
  useEffect(() => {
    if (!active) return;
    stack.push(id);
    return () => { const i = stack.lastIndexOf(id); if (i >= 0) stack.splice(i, 1); };
  }, [id, active]);
  return useCallback(() => stack[stack.length - 1] === id, [id]);
}

export function useDismiss(opts: { open: boolean; id: string; onDismiss: () => void; refs: RefObject<HTMLElement | null>[]; outside?: boolean; escape?: boolean }) {
  const { open, id, onDismiss, refs, outside = true, escape = true } = opts;
  const isTop = useLayer(id, open);
  const cb = useRef(onDismiss);
  cb.current = onDismiss;
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (escape && e.key === "Escape" && isTop()) { e.stopPropagation(); cb.current(); } };
    const down = (e: PointerEvent) => {
      if (!outside || !isTop()) return;
      const t = e.target as Node;
      if (refs.some((r) => r.current?.contains(t))) return;
      cb.current();
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", down);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("pointerdown", down); };
  }, [open, outside, escape, isTop, refs]);
}

// ---- Focus ----
const TABBABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';
export const tabbables = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLElement>(TABBABLE)).filter((n) => !n.closest("[inert],[hidden],[aria-hidden='true']"));

/** Moves focus in on open, optionally traps Tab, and restores focus exactly once on close (skipping removed/disabled triggers). */
export function useFocusScope(ref: RefObject<HTMLElement | null>, active: boolean, { trap = true, initial }: { trap?: boolean; initial?: RefObject<HTMLElement | null> } = {}) {
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const frame = requestAnimationFrame(() => {
      if (!el || el.contains(document.activeElement)) return;
      (initial?.current ?? tabbables(el)[0] ?? el).focus({ preventScroll: true });
    });
    const onKey = (e: KeyboardEvent) => {
      if (!trap || e.key !== "Tab" || !el) return;
      const list = tabbables(el);
      if (!list.length) { e.preventDefault(); el.focus(); return; }
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      if (previous && previous.isConnected && !(previous as HTMLButtonElement).disabled) previous.focus({ preventScroll: true });
    };
  }, [active, trap, ref, initial]);
}

// ---- Scroll lock (ref-counted, compensates the scrollbar so the page does not jump) ----
let locks = 0;
let saved: { overflow: string; paddingRight: string } | null = null;
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    if (locks++ === 0) {
      const gap = window.innerWidth - root.clientWidth;
      saved = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
      root.style.overflow = "hidden";
      if (gap > 0) root.style.paddingRight = `${gap}px`;
    }
    return () => {
      if (--locks === 0 && saved) { root.style.overflow = saved.overflow; root.style.paddingRight = saved.paddingRight; saved = null; }
    };
  }, [active]);
}

/** Makes everything outside `ref` inert while a modal is open. Nested modals stack naturally. */
export function useInertOutside(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const host = ref.current.closest("[data-orlo-portal]") ?? ref.current;
    const changed: Element[] = [];
    for (const child of Array.from(document.body.children)) {
      if (child === host || child.contains(host) || child.hasAttribute("inert") || child.tagName === "SCRIPT") continue;
      child.setAttribute("inert", "");
      changed.push(child);
    }
    return () => changed.forEach((c) => c.removeAttribute("inert"));
  }, [active, ref]);
}

/** Keeps a floating element attached to its anchor while open: scroll, resize and visual viewport changes. */
export function useAnchoredPosition(anchor: RefObject<HTMLElement | null>, floating: RefObject<HTMLElement | null>, open: boolean, placement: Placement, offset = 6) {
  const [pos, setPos] = useState<ReturnType<typeof computePosition> | null>(null);
  const update = useCallback(() => {
    const a = anchor.current, f = floating.current;
    if (!a || !f) return;
    const vv = window.visualViewport;
    const r = a.getBoundingClientRect();
    setPos(computePosition(r, { width: f.offsetWidth, height: f.scrollHeight }, { width: vv?.width ?? window.innerWidth, height: vv?.height ?? window.innerHeight }, placement, offset));
  }, [anchor, floating, placement, offset]);
  useIsoLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    // The floating node may mount a frame later (portals); wait for it, then observe its size.
    const attach = () => { if (!floating.current) { raf = requestAnimationFrame(attach); return; } update(); ro?.observe(floating.current); };
    attach();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      ro?.disconnect();
    };
  }, [open, update]);
  return pos;
}
