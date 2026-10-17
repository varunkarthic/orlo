import { createContext, useContext, type ReactNode } from "react";
import { OrloMotionProvider, type MotionMode } from "@orlo/motion";

export type ImagePolicy = "on" | "off";
const ImagesCtx = createContext<ImagePolicy>("on");
export const useImagePolicy = () => useContext(ImagesCtx);

export type OrloProviderProps = {
  /** `system` follows prefers-color-scheme (no flash: resolved in CSS, not JS). */
  theme?: "system" | "light" | "dark";
  density?: "comfortable" | "compact" | "touch";
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
        <div
          className={["orlo-root", className].filter(Boolean).join(" ")}
          data-orlo-theme={theme === "system" ? undefined : theme}
          data-orlo-density={density}
          dir={dir}
        >
          {children}
        </div>
      </ImagesCtx.Provider>
    </OrloMotionProvider>
  );
}
