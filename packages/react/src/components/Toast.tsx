import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Portal } from "../internal/Portal.tsx";
import { Icons } from "../internal/icons.tsx";

export type ToastOptions = {
  title: ReactNode;
  description?: ReactNode;
  tone?: "neutral" | "success" | "warning" | "error";
  /** ms; `Infinity` keeps it until dismissed. Errors default to persistent. */
  duration?: number;
  action?: { label: string; onClick: () => void };
};
type Item = ToastOptions & { id: number };

const Ctx = createContext<{ toast: (t: ToastOptions) => number; dismiss: (id: number) => void } | null>(null);

/** `toast({ title })` from anywhere inside OrloProvider. */
export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <OrloProvider>");
  return ctx;
}

let seq = 0;
export function ToastRegion({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const toast = useCallback((t: ToastOptions) => { const id = ++seq; setItems((l) => [...l.slice(-4), { ...t, id }]); return id; }, []);
  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {items.length > 0 && (
        <Portal>
          <section className="orlo-toasts" aria-label="Notifications">
            <AnimatePresence initial={false}>
              {items.map((t) => <ToastView key={t.id} item={t} onDismiss={() => dismiss(t.id)} />)}
            </AnimatePresence>
          </section>
        </Portal>
      )}
    </Ctx.Provider>
  );
}

function ToastView({ item, onDismiss }: { item: Item; onDismiss: () => void }) {
  const { transition, distance } = useOrloMotion();
  const duration = item.duration ?? (item.tone === "error" ? Infinity : 5000);
  const [paused, setPaused] = useState(false);
  const left = useRef(duration);
  // Timer pauses while hovered or focused, and while the tab is hidden, so nobody misses a message.
  useEffect(() => {
    if (!Number.isFinite(duration) || paused) return;
    const start = Date.now();
    const t = setTimeout(onDismiss, left.current);
    const vis = () => { if (document.hidden) setPaused(true); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearTimeout(t); left.current -= Date.now() - start; document.removeEventListener("visibilitychange", vis); };
  }, [duration, paused, onDismiss]);
  return (
    <motion.div
      layout
      className="orlo-toast"
      data-tone={item.tone ?? "neutral"}
      role={item.tone === "error" ? "alert" : "status"}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      initial={{ opacity: 0, y: distance(16), scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: transition("reveal") }}
      exit={{ opacity: 0, scale: 0.98, transition: transition("dismiss") }}
      transition={transition("shift")}
    >
      <div className="orlo-toast__body">
        <strong>{item.title}</strong>
        {item.description && <div className="orlo-toast__desc">{item.description}</div>}
      </div>
      {item.action && <button type="button" className="orlo-button" data-variant="ghost" data-size="sm" onClick={() => { item.action!.onClick(); onDismiss(); }}>{item.action.label}</button>}
      <button type="button" className="orlo-icon-button" data-variant="ghost" data-size="sm" aria-label="Dismiss notification" onClick={onDismiss}><Icons.X size={16} /></button>
    </motion.div>
  );
}
