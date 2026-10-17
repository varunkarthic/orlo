import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";
import { OrloMotionProvider, type MotionMode, type Scheme } from "@orlo/motion";
import { materialVars, type GlassOptions, type Material } from "@orlo/tokens";
import { ToastRegion } from "./components/Toast.tsx";

export type ImagePolicy = "on" | "off";
type Theme = "system" | "light" | "dark";
type Density = "comfortable" | "compact" | "touch";

const ImagesCtx = createContext<ImagePolicy>("on");
export const useImagePolicy = () => useContext(ImagesCtx);

type PortalInfo = { theme: Theme; density?: Density; dir?: "ltr" | "rtl"; material: Material; materialStyle?: CSSProperties; reduceTransparency?: boolean };
const PortalCtx = createContext<PortalInfo>({ theme: "system", material: "solid" });
export const usePortalContext = () => useContext(PortalCtx);

export type OrloProviderProps = {
  /** `system` follows prefers-color-scheme in CSS, so there is no flash on load. */
  theme?: Theme;
  density?: Density;
  motion?: MotionMode;
  /** Spring character: `standard` (≤ 5 % overshoot) or `expressive` (≤ 12 %). */
  motionScheme?: Scheme;
  /** `off` renders designed no-image replacements and performs no image requests. */
  images?: ImagePolicy;
  /** Surface material for overlays and opted-in surfaces. Glass falls back to solid when transparency is reduced. */
  material?: Material;
  /** Tint colour for `material="tinted"` (any hex colour). */
  tint?: string;
  glass?: GlassOptions;
  /** Force solid surfaces regardless of OS preference. */
  reduceTransparency?: boolean;
  dir?: "ltr" | "rtl";
  className?: string;
  children: ReactNode;
};

/** CSS variables for a material in both schemes; the stylesheet picks the right one per scheme. */
export function useMaterialStyle(material: Material, tint?: string, glass?: GlassOptions): CSSProperties | undefined {
  return useMemo(() => {
    if (material === "solid") return undefined;
    const l = materialVars(material, "light", glass, tint), d = materialVars(material, "dark", glass, tint);
    return {
      "--orlo-material-bg-light": l["--orlo-material-bg"], "--orlo-material-bg-dark": d["--orlo-material-bg"],
      "--orlo-material-blur": l["--orlo-material-blur"], "--orlo-material-saturation": l["--orlo-material-saturation"],
      "--orlo-material-depth-shadow": `var(--orlo-shadow-${Math.max(0, Math.min(5, glass?.depth ?? 3))})`,
      ...(tint ? { "--orlo-material-tint": tint } : {}),
    } as CSSProperties;
  }, [material, tint, glass]);
}

export function OrloProvider({ theme = "system", density, motion = "system", motionScheme = "standard", images = "on", material = "solid", tint, glass, reduceTransparency, dir, className, children }: OrloProviderProps) {
  const materialStyle = useMaterialStyle(material, tint, glass);
  const portal = useMemo(() => ({ theme, density, dir, material, materialStyle, reduceTransparency }), [theme, density, dir, material, materialStyle, reduceTransparency]);
  return (
    <OrloMotionProvider mode={motion} scheme={motionScheme}>
      <ImagesCtx.Provider value={images}>
        <PortalCtx.Provider value={portal}>
          <ToastRegion>
            <div className={["orlo-root", className].filter(Boolean).join(" ")} data-orlo-theme={theme === "system" ? undefined : theme} data-orlo-density={density}
              data-orlo-material={material} data-orlo-transparency={reduceTransparency ? "reduced" : undefined} dir={dir} style={materialStyle}>
              {children}
            </div>
          </ToastRegion>
        </PortalCtx.Provider>
      </ImagesCtx.Provider>
    </OrloMotionProvider>
  );
}
