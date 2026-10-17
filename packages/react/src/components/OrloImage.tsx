import { motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { useImagePolicy } from "../provider.tsx";
import { useImageState, type ImageState } from "./useImageState.ts";
import { useEffect, type ReactNode } from "react";

export type OrloImageProps = {
  src?: string;
  /** Required. Pass "" with `decorative` for images that add no information. */
  alt: string;
  decorative?: boolean;
  /** CSS aspect-ratio, e.g. "4 / 3". Geometry is reserved before load so nothing shifts. */
  ratio?: string;
  /** Text shown in the designed placeholder. Defaults to alt. */
  caption?: ReactNode;
  maxRetries?: number;
  /** Overrides the provider's `images` policy for this image. */
  images?: "on" | "off";
  onStateChange?: (s: ImageState) => void;
  className?: string;
};

/** Image lifecycle: reserved box -> preload+decode -> gentle reveal; failure and no-image modes are designed, never a broken icon. */
export function OrloImage({ src, alt, decorative, ratio = "4 / 3", caption, maxRetries, images, onStateChange, className }: OrloImageProps) {
  const policy = useImagePolicy();
  const { state, retry } = useImageState(src, { enabled: (images ?? policy) === "on", maxRetries });
  const { transition } = useOrloMotion();
  useEffect(() => onStateChange?.(state), [state, onStateChange]);
  const label = caption ?? alt;
  const showImage = state === "loaded" && src;
  return (
    <figure className={["orlo-image", className].filter(Boolean).join(" ")} data-state={state} style={{ aspectRatio: ratio }}>
      {showImage ? (
        <motion.img
          src={src}
          alt={decorative ? "" : alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: transition("reveal") }}
          draggable={false}
        />
      ) : (
        <div className="orlo-image__placeholder" aria-busy={state === "loading" || undefined}>
          {state === "loading" && <span className="orlo-skeleton" aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />}
          <span className="orlo-image__label" role={decorative ? undefined : "img"} aria-label={decorative ? undefined : alt} aria-hidden={decorative || undefined}>
            {state !== "loading" && (
              <>
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                  <path d="M4 18l5-6 4 4 3-3 4 5M4 5h16v14H4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                {!decorative && label ? <span className="orlo-image__caption" aria-hidden="true">{label}</span> : null}
              </>
            )}
          </span>
          {state === "failed" && <button type="button" className="orlo-image__retry" onClick={retry}>Try again</button>}
        </div>
      )}
    </figure>
  );
}

