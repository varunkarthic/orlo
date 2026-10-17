export type Side = "top" | "bottom" | "left" | "right";
export type Align = "start" | "center" | "end";
export type Placement = Side | `${Side}-${Exclude<Align, "center">}`;
type Rect = { x: number; y: number; width: number; height: number };
type Size = { width: number; height: number };

const opposite: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };

/**
 * Collision-aware anchored positioning (fixed coordinates).
 * Flips to the opposite side when the preferred side lacks room and the other has more,
 * shifts along the cross axis to stay `padding` from the edges, and reports the space left
 * on the chosen side so long content can scroll instead of leaving the viewport.
 */
export function computePosition(anchor: Rect, floating: Size, viewport: Size, placement: Placement = "bottom-start", offset = 6, padding = 8) {
  const [pSide, pAlign = "center"] = placement.split("-") as [Side, Align?];
  const room = (s: Side) =>
    s === "top" ? anchor.y - offset - padding
    : s === "bottom" ? viewport.height - (anchor.y + anchor.height) - offset - padding
    : s === "left" ? anchor.x - offset - padding
    : viewport.width - (anchor.x + anchor.width) - offset - padding;
  const need = (s: Side) => (s === "top" || s === "bottom" ? floating.height : floating.width);
  let side = pSide;
  if (room(side) < need(side) && room(opposite[side]) > room(side)) side = opposite[side];
  const vertical = side === "top" || side === "bottom";

  let x: number, y: number;
  if (vertical) {
    y = side === "bottom" ? anchor.y + anchor.height + offset : anchor.y - offset - Math.min(floating.height, room(side));
    x = pAlign === "start" ? anchor.x : pAlign === "end" ? anchor.x + anchor.width - floating.width : anchor.x + anchor.width / 2 - floating.width / 2;
    x = clamp(x, padding, viewport.width - floating.width - padding);
  } else {
    x = side === "right" ? anchor.x + anchor.width + offset : anchor.x - offset - floating.width;
    y = pAlign === "start" ? anchor.y : pAlign === "end" ? anchor.y + anchor.height - floating.height : anchor.y + anchor.height / 2 - floating.height / 2;
    y = clamp(y, padding, viewport.height - floating.height - padding);
  }
  // Transform origin points back at the anchor, so overlays grow out of their trigger even after flipping/shifting.
  const ox = vertical ? clamp(anchor.x + anchor.width / 2 - x, 0, floating.width) : side === "right" ? 0 : floating.width;
  const oy = vertical ? (side === "bottom" ? 0 : Math.min(floating.height, room(side))) : clamp(anchor.y + anchor.height / 2 - y, 0, floating.height);
  return { x: Math.round(x), y: Math.round(y), side, maxHeight: vertical ? Math.max(room(side), 120) : viewport.height - padding * 2, origin: `${Math.round(ox)}px ${Math.round(oy)}px` };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, Math.max(lo, hi)));
