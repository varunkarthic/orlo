import { useEffect, useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Icons } from "../internal/icons.tsx";

export type BannerProps = { tone?: "info" | "warning" | "error" | "success"; children: ReactNode; action?: ReactNode; onDismiss?: () => void; open?: boolean };

/** Page-level message pinned above content (maintenance, billing, connectivity). Pushes content down instead of covering it. */
export function Banner({ tone = "info", children, action, onDismiss, open = true }: BannerProps) {
  const { transition } = useOrloMotion();
  const icon = { info: <Icons.Info size={18} />, warning: <Icons.Alert size={18} />, error: <Icons.Alert size={18} />, success: <Icons.Check size={18} /> }[tone];
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div className="orlo-banner" data-tone={tone} role={tone === "error" ? "alert" : "status"} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1, transition: transition("expand") }} exit={{ height: 0, opacity: 0, transition: transition("dismiss") }}>
          <div className="orlo-banner__inner">
            <span className="orlo-banner__icon" aria-hidden="true">{icon}</span>
            <div className="orlo-banner__text">{children}</div>
            {action}
            {onDismiss && <button type="button" className="orlo-icon-button" data-variant="ghost" data-size="sm" aria-label="Dismiss" onClick={onDismiss}><Icons.X size={16} /></button>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Watches navigator.onLine. Shows a calm banner when offline and a brief confirmation when the connection returns. */
export function OfflineIndicator({ simulate }: { simulate?: boolean }) {
  const [online, setOnline] = useState(true);
  const [back, setBack] = useState(false);
  useEffect(() => {
    if (simulate !== undefined) return;
    setOnline(navigator.onLine);
    const on = () => { setOnline(true); setBack(true); }, off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [simulate]);
  useEffect(() => { if (simulate === undefined) return; setOnline((was) => { if (!was && !simulate) setBack(true); return !simulate; }); }, [simulate]);
  useEffect(() => { if (!back) return; const t = setTimeout(() => setBack(false), 3000); return () => clearTimeout(t); }, [back]);
  return (
    <>
      <Banner tone="warning" open={!online}><strong>You’re offline.</strong> Changes are kept on this device and will sync when you reconnect.</Banner>
      <Banner tone="success" open={online && back}>Back online. Everything is synced.</Banner>
    </>
  );
}

export type ProgressRingProps = { label: string; value?: number; max?: number; size?: number; showValue?: boolean };

/** Circular determinate or indeterminate progress for compact spaces (uploads in a list, avatar status). */
export function ProgressRing({ label, value, max = 100, size = 40, showValue = true }: ProgressRingProps) {
  const { transition } = useOrloMotion();
  const id = useId();
  const pct = value === undefined ? undefined : Math.max(0, Math.min(100, (value / max) * 100));
  const r = 16, c = 2 * Math.PI * r;
  return (
    <span className="orlo-ring" style={{ inlineSize: size, blockSize: size }} role="progressbar" aria-labelledby={id} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} data-indeterminate={pct === undefined || undefined}>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r={r} className="orlo-ring__track" />
        {pct === undefined ? <circle cx="20" cy="20" r={r} className="orlo-ring__bar orlo-ring__bar--spin" strokeDasharray={`${c * 0.3} ${c}`} />
          : <motion.circle cx="20" cy="20" r={r} className="orlo-ring__bar" strokeDasharray={c} initial={false} animate={{ strokeDashoffset: c * (1 - pct / 100) }} transition={transition("shift")} />}
      </svg>
      {showValue && pct !== undefined && size >= 36 && <span className="orlo-ring__value" aria-hidden="true">{Math.round(pct)}</span>}
      <span id={id} className="orlo-visually-hidden">{label}</span>
    </span>
  );
}
