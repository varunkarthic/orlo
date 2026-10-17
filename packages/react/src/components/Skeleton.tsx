import type { CSSProperties } from "react";

/** Reserve the geometry of the content that will replace it. Static under reduced motion (CSS). */
export function Skeleton({ width, height = "1em", radius, style }: { width?: CSSProperties["width"]; height?: CSSProperties["height"]; radius?: CSSProperties["borderRadius"]; style?: CSSProperties }) {
  return <span className="orlo-skeleton" aria-hidden="true" style={{ width, height, borderRadius: radius, ...style }} />;
}
