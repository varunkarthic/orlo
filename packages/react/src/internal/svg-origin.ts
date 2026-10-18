import type { MotionStyle } from "motion/react";

/**
 * Transform origin for a motion SVG child, in viewBox units.
 * Motion defaults SVG children to `transform-box: fill-box`, which measures pixel origins from the
 * element's own bounding box: an arc rotated "around 12px" then pivots off-centre and wobbles.
 * `view-box` makes the origin refer to the SVG's coordinate system instead.
 */
export const svgOrigin = (x: number, y: number): MotionStyle => ({ transformBox: "view-box", originX: `${x}px`, originY: `${y}px` });
