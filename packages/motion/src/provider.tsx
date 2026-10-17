import { createContext, useContext, useMemo, type ReactNode } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import { presets, type PresetName } from "./presets.ts";

/** `system` follows the OS. `reduced` keeps opacity-only feedback. `off` is instant. `full` ignores the OS (explicit opt-in). */
export type MotionMode = "system" | "full" | "reduced" | "off";
export type EffectiveMotion = "full" | "reduced" | "off";

const Ctx = createContext<MotionMode>("system");

export function OrloMotionProvider({ mode = "system", children }: { mode?: MotionMode; children: ReactNode }) {
  const reducedMotion = mode === "full" ? "never" : mode === "system" ? "user" : "always";
  return (
    <Ctx.Provider value={mode}>
      <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>
    </Ctx.Provider>
  );
}

export function useOrloMotion() {
  const mode = useContext(Ctx);
  const osReduced = useReducedMotion();
  return useMemo(() => {
    const effective: EffectiveMotion =
      mode === "off" ? "off" : mode === "reduced" || (mode === "system" && osReduced) ? "reduced" : "full";
    /** Transition for a preset under the current policy. */
    const transition = (name: PresetName) =>
      effective === "off" ? { duration: 0 } : effective === "reduced" ? { duration: 0.15, ease: "easeOut" as const } : presets[name];
    /** Spatial offset collapses to 0 when motion is reduced, leaving a pure fade. */
    const distance = (px: number) => (effective === "full" ? px : 0);
    return { mode, effective, reduced: effective !== "full", transition, distance };
  }, [mode, osReduced]);
}
