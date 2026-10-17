import { motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { useImagePolicy } from "../provider.tsx";
import { useImageState, type ImageState } from "./useImageState.ts";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import { Icons } from "../internal/icons.tsx";

export type OrloImageProps = {
  src?: string;
  srcSet?: string;
  sizes?: string;
  /** Required. Pass "" with `decorative` for images that add no information. */
  alt: string;
  decorative?: boolean;
  /** CSS aspect-ratio, e.g. "4 / 3". Geometry is reserved before load so nothing shifts. Use "auto" to size by content. */
  ratio?: string;
  /** Placeholder while loading: a colour (e.g. the image's dominant colour) or a tiny blurred preview (data URL). */
  placeholder?: { color?: string; preview?: string };
  /** Above-the-fold hero: eager load with high fetch priority. */
  priority?: boolean;
  fit?: CSSProperties["objectFit"];
  /** Text shown in the designed placeholder. Defaults to alt. */
  caption?: ReactNode;
  maxRetries?: number;
  /** Overrides the provider's `images` policy for this image. */
  images?: "on" | "off";
  onStateChange?: (s: ImageState) => void;
  className?: string;
};

/**
 * Image lifecycle: reserved box → placeholder (colour or blurred preview) → preload + decode → blur-to-sharp reveal.
 * Failure and no-image modes are designed placeholders with a bounded, explicit retry — never a broken icon.
 */
export function OrloImage({ src, srcSet, sizes, alt, decorative, ratio = "4 / 3", placeholder, priority, fit = "cover", caption, maxRetries, images, onStateChange, className }: OrloImageProps) {
  const policy = useImagePolicy();
  const { state, retry } = useImageState(src, { enabled: (images ?? policy) === "on", maxRetries, srcSet, sizes });
  const { transition, blur, scale } = useOrloMotion();
  useEffect(() => onStateChange?.(state), [state, onStateChange]);
  const label = caption ?? alt;
  const showImage = state === "loaded" && src;
  const pending = state === "loading" || state === "retrying";
  return (
    <figure className={["orlo-image", className].filter(Boolean).join(" ")} data-state={state} style={{ aspectRatio: ratio === "auto" ? undefined : ratio, background: placeholder?.color }}>
      {placeholder?.preview && state !== "failed" && state !== "disabled" && <img className="orlo-image__preview" src={placeholder.preview} alt="" aria-hidden="true" />}
      {showImage ? (
        <motion.img
          src={src} srcSet={srcSet} sizes={sizes} alt={decorative ? "" : alt} draggable={false}
          loading={priority ? "eager" : "lazy"} decoding="async" {...{ fetchpriority: priority ? "high" : undefined }}
          style={{ objectFit: fit }}
          initial={{ opacity: 0, filter: blur(12), scale: scale(1.02) }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1, transition: { opacity: transition("fade"), filter: transition("blur"), scale: transition("reveal") } }}
        />
      ) : (
        <div className="orlo-image__placeholder" aria-busy={pending || undefined}>
          {pending && !placeholder && <span className="orlo-skeleton" aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />}
          <span className="orlo-image__label" role={decorative ? undefined : "img"} aria-label={decorative ? undefined : alt} aria-hidden={decorative || undefined}>
            {!pending && (
              <>
                {state === "failed" ? <Icons.Image size={24} /> : state === "disabled" ? <Icons.EyeOff size={22} /> : <Icons.Image size={24} />}
                {!decorative && label ? <span className="orlo-image__caption" aria-hidden="true">{label}</span> : null}
                {state === "disabled" && <span className="orlo-image__note" aria-hidden="true">Images off</span>}
              </>
            )}
          </span>
          {state === "failed" && <button type="button" className="orlo-image__retry" onClick={retry}>Try again</button>}
          {state === "retrying" && <span className="orlo-image__retry-state" role="status">Retrying image</span>}
        </div>
      )}
    </figure>
  );
}
