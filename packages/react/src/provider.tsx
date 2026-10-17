import { createContext, useContext, type ReactNode } from "react";
import { OrloMotionProvider, type MotionMode } from "@orlo/motion";
import { ToastRegion } from "./components/Toast.tsx";

export type ImagePolicy = "on" | "off";
type Theme = "system" | "light" | "dark";
type Density = "comfortable" | "compact" | "touch";

const ImagesCtx = createContext<ImagePolicy>("on");
export const useImagePolicy = () => useContext(ImagesCtx);

const PortalCtx = createContext<{ theme: Theme; density?: Density; dir?: "ltr" | "rtl" }>({ theme: "system" });
export const usePortalContext = () => useContext(PortalCtx);

export type OrloProviderProps = {
  /** `system` follows prefers-color-scheme in CSS, so there is no flash on load. */
  theme?: Theme;
  density?: Density;
  motion?: MotionMode;
  /** `off` renders designed no-image replacements and performs no image requests. */
  images?: ImagePolicy;
  dir?: "ltr" | "rtl";
  className?: string;
  children: ReactNode;
};

export function OrloProvider({ theme = "system", density, motion = "system", images = "on", dir, className, children }: OrloProviderProps) {
  return (
    <OrloMotionProvider mode={motion}>
      <ImagesCtx.Provider value={images}>
        <PortalCtx.Provider value={{ theme, density, dir }}>
          <ToastRegion>
            <div className={["orlo-root", className].filter(Boolean).join(" ")} data-orlo-theme={theme === "system" ? undefined : theme} data-orlo-density={density} dir={dir}>
              {children}
            </div>
          </ToastRegion>
        </PortalCtx.Provider>
      </ImagesCtx.Provider>
    </OrloMotionProvider>
  );
}
