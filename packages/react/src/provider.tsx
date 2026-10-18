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
const LocaleCtx = createContext<string | undefined>(undefined);
/** Locale for dates, numbers and week starts. Pass it explicitly when server rendering so server and client agree. */
export const useLocale = (override?: string) => override ?? useContext(LocaleCtx);

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
  /** Surface material for overlays and opted-in surfaces: `solid` or frosted `glass`. Glass falls back to solid when transparency is reduced. */
  material?: Material;
  glass?: GlassOptions;
  /** Force solid surfaces regardless of OS preference. */
  reduceTransparency?: boolean;
  dir?: "ltr" | "rtl";
  /** BCP 47 locale for dates and numbers (e.g. "en-GB"). Defaults to the runtime locale. */
  locale?: string;
  className?: string;
  children: ReactNode;
};

/** CSS variables for a material in both schemes; the stylesheet picks the right one per scheme. */
export function useMaterialStyle(material: Material, glass?: GlassOptions): CSSProperties | undefined {
  return useMemo(() => {
    if (material !== "glass") return undefined;
    const l = materialVars(material, "light", glass), d = materialVars(material, "dark", glass);
    return {
      "--orlo-material-bg-light": l["--orlo-material-bg"], "--orlo-material-bg-dark": d["--orlo-material-bg"],
      "--orlo-material-blur": l["--orlo-material-blur"], "--orlo-material-saturation": l["--orlo-material-saturation"],
      "--orlo-material-depth-shadow": `var(--orlo-shadow-${Math.max(0, Math.min(5, glass?.depth ?? 3))})`,
    } as CSSProperties;
  }, [material, glass]);
}

export function OrloProvider({ theme = "system", density, motion = "system", motionScheme = "standard", images = "on", material = "solid", glass, reduceTransparency, dir, locale, className, children }: OrloProviderProps) {
  const materialStyle = useMaterialStyle(material, glass);
  const portal = useMemo(() => ({ theme, density, dir, material, materialStyle, reduceTransparency }), [theme, density, dir, material, materialStyle, reduceTransparency]);
  return (
    <OrloMotionProvider mode={motion} scheme={motionScheme}>
      <LocaleCtx.Provider value={locale}>
      <ImagesCtx.Provider value={images}>
        <PortalCtx.Provider value={portal}>
          <ToastRegion>
            <div className={["orlo-root", className].filter(Boolean).join(" ")} data-orlo-theme={theme === "system" ? undefined : theme} data-orlo-density={density}
              lang={locale} data-orlo-material={material} data-orlo-transparency={reduceTransparency ? "reduced" : undefined} dir={dir} style={materialStyle}>
              {children}
            </div>
          </ToastRegion>
        </PortalCtx.Provider>
      </ImagesCtx.Provider>
      </LocaleCtx.Provider>
    </OrloMotionProvider>
  );
}
