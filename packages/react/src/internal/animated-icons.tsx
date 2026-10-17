import { motion, useReducedMotion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";

export type AnimatedIconName = "check" | "spinner" | "alert" | "menu" | "play" | "heart" | "bell" | "copy" | "plus" | "chevron" | "refresh" | "upload" | "dots" | "sparkle";
export type AnimatedIconProps = {
  name: AnimatedIconName;
  size?: number;
  /** Toggle state for two-state icons: menu→close, play→pause, heart filled, copy→check, plus→close, chevron flipped. */
  active?: boolean;
  /** Accessible name; decorative when omitted. */
  label?: string;
  className?: string;
};

/**
 * Icons whose motion carries meaning: a check that draws itself, a menu that becomes a close,
 * play becoming pause. Under reduced motion they switch state instantly; looping icons slow down.
 */
export function AnimatedIcon({ name, size = 20, active = false, label, className }: AnimatedIconProps) {
  const { transition, effective } = useOrloMotion();
  const os = useReducedMotion();
  const still = effective !== "full" || !!os;
  const t = transition("morph");
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: ["orlo-aicon", className].filter(Boolean).join(" "), ...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const }) };
  const draw = { initial: { pathLength: still ? 1 : 0, opacity: still ? 1 : 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { ...transition("success"), opacity: { duration: 0.05 } } };
  switch (name) {
    case "check":
      return <svg {...common}><motion.path d="M5 12.5l4.5 4.5L19 7.5" {...draw} /></svg>;
    case "alert":
      return <svg {...common}><motion.g initial={{ scale: still ? 1 : 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={transition("error")} style={{ originX: "12px", originY: "12px" }}><circle cx="12" cy="12" r="9" /><path d="M12 7.5V13M12 16.5h.01" /></motion.g></svg>;
    case "spinner":
      return <svg {...common}><circle cx="12" cy="12" r="8.5" opacity="0.25" /><motion.path d="M20.5 12A8.5 8.5 0 0 0 12 3.5" animate={{ rotate: 360 }} transition={{ duration: still ? 2.4 : 0.8, ease: "linear", repeat: Infinity }} style={{ originX: "12px", originY: "12px" }} /></svg>;
    case "menu":
      return <svg {...common}>
        <motion.path animate={{ d: active ? "M6 6L18 18" : "M4 7H20" }} transition={t} />
        <motion.path d="M4 12H20" animate={{ opacity: active ? 0 : 1, scaleX: active ? 0.2 : 1 }} transition={t} style={{ originX: "12px" }} />
        <motion.path animate={{ d: active ? "M6 18L18 6" : "M4 17H20" }} transition={t} />
      </svg>;
    case "play":
      return <svg {...common}>
        <motion.path animate={{ d: active ? "M7 5.5L10 5.5L10 18.5L7 18.5Z" : "M8 5.5L13 8.75L13 15.25L8 18.5Z" }} transition={t} fill="currentColor" />
        <motion.path animate={{ d: active ? "M14 5.5L17 5.5L17 18.5L14 18.5Z" : "M13 8.75L18 12L18 12L13 15.25Z" }} transition={t} fill="currentColor" />
      </svg>;
    case "heart":
      return <svg {...common}>
        <motion.path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.5 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" animate={{ fill: active ? "currentColor" : "rgba(0,0,0,0)", scale: active && !still ? [1, 1.25, 1] : 1 }} transition={{ ...transition("success"), scale: { duration: 0.35 } }} style={{ originX: "12px", originY: "13px" }} />
        {active && !still && [0, 60, 120, 180, 240, 300].map((a) => (
          <motion.circle key={a} cx={12} cy={13} r={1} fill="currentColor" stroke="none" initial={{ opacity: 1, x: 0, y: 0 }} animate={{ opacity: 0, x: Math.cos((a * Math.PI) / 180) * 10, y: Math.sin((a * Math.PI) / 180) * 10 }} transition={{ duration: 0.5, ease: "easeOut" }} />
        ))}
      </svg>;
    case "bell":
      return <svg {...common}><motion.path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4" animate={{ rotate: active && !still ? [0, 14, -12, 8, -5, 0] : 0 }} transition={{ duration: 0.7 }} style={{ originX: "12px", originY: "4px" }} /></svg>;
    case "copy":
      return <svg {...common}>{active ? <motion.path d="M5 12.5l4.5 4.5L19 7.5" {...draw} /> : <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></>}</svg>;
    case "plus":
      return <svg {...common}><motion.g animate={{ rotate: active ? 45 : 0 }} transition={transition("press")} style={{ originX: "12px", originY: "12px" }}><path d="M12 5v14M5 12h14" /></motion.g></svg>;
    case "chevron":
      return <svg {...common}><motion.path d="M6 9.5l6 6 6-6" animate={{ rotate: active ? 180 : 0 }} transition={transition("press")} style={{ originX: "12px", originY: "12px" }} /></svg>;
    case "refresh":
      return <svg {...common}><motion.g animate={active ? { rotate: 360 } : { rotate: 0 }} transition={active ? { duration: still ? 2.4 : 0.9, ease: "linear", repeat: Infinity } : { duration: 0 }} style={{ originX: "12px", originY: "12px" }}><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4.5h-4.5" /></motion.g></svg>;
    case "upload":
      return <svg {...common}><motion.g animate={active && !still ? { y: [0, -2.5, 0] } : { y: 0 }} transition={active ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}><path d="M12 15.5V4M7 8.5l5-5 5 5" /></motion.g><path d="M4 15v5h16v-5" /></svg>;
    case "dots":
      return <svg {...common} fill="currentColor" stroke="none">{[6, 12, 18].map((x, i) => <motion.circle key={x} cx={x} cy={12} r={1.9} animate={still ? { opacity: 0.8 } : { opacity: [0.25, 1, 0.25], y: [0, -2, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />)}</svg>;
    case "sparkle":
      return <svg {...common}><motion.path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z" animate={active && !still ? { scale: [1, 1.15, 1], rotate: [0, 12, 0] } : { scale: 1 }} transition={{ duration: 0.6 }} style={{ originX: "12px", originY: "10.5px" }} /></svg>;
  }
}
