import { createContext, useContext, useMemo, type ReactNode } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import { spring, type PresetName, type Scheme } from "./presets.ts";

/** `system` follows the OS. `reduced` keeps opacity-only feedback. `off` is instant. `full` ignores the OS (explicit opt-in). */
export type MotionMode = "system" | "full" | "reduced" | "off";
export type EffectiveMotion = "full" | "reduced" | "off";

const Ctx = createContext<{ mode: MotionMode; scheme: Scheme }>({ mode: "system", scheme: "standard" });

export function OrloMotionProvider({ mode = "system", scheme = "standard", children }: { mode?: MotionMode; scheme?: Scheme; children: ReactNode }) {
  const reducedMotion = mode === "full" ? "never" : mode === "system" ? "user" : "always";
  const value = useMemo(() => ({ mode, scheme }), [mode, scheme]);
  return (
    <Ctx.Provider value={value}>
      <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>
    </Ctx.Provider>
  );
}

const REDUCED = { duration: 0.15, ease: "easeOut" as const };
const OFF = { duration: 0 };

export function useOrloMotion() {
  const { mode, scheme } = useContext(Ctx);
  const osReduced = useReducedMotion();
  return useMemo(() => {
    const effective: EffectiveMotion = mode === "off" ? "off" : mode === "reduced" || (mode === "system" && osReduced) ? "reduced" : "full";
    /** Transition for a purpose under the current policy. Pass a gesture velocity to carry momentum into the settle. */
    const transition = (name: PresetName, velocity?: number) => (effective === "off" ? OFF : effective === "reduced" ? REDUCED : spring(name, scheme, velocity));
    /** Spatial offset collapses to 0 when motion is reduced, leaving a pure fade. */
    const distance = (px: number) => (effective === "full" ? px : 0);
    /** Scale collapses to 1 when motion is reduced. */
    const scale = (v: number) => (effective === "full" ? v : 1);
    /** Blur radius for entrances; none when reduced (blur animation is costly and can be disorienting). */
    const blur = (px: number) => (effective === "full" ? `blur(${px}px)` : "blur(0px)");
    return { mode, scheme, effective, reduced: effective !== "full", transition, distance, scale, blur };
  }, [mode, scheme, osReduced]);
}
