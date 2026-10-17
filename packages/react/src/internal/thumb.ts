import { useEffect, useRef } from "react";
import { animate, useMotionValue, type AnimationPlaybackControls } from "motion/react";
import { createVelocityTracker, useOrloMotion } from "@orlo/motion";

/**
 * Motion value (0–100 %) for a slider thumb.
 * - External/keyboard changes and track presses: spring to the new value (`thumb` purpose).
 * - While dragging: follow the pointer 1:1 with no animation.
 * - On release: settle on the snapped value, carrying the release velocity.
 */
export function useThumbMotion(percent: number) {
  const pos = useMotionValue(percent);
  const dragging = useRef(false);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const tracker = useRef(createVelocityTracker());
  const { transition } = useOrloMotion();
  const tRef = useRef(transition); tRef.current = transition;

  useEffect(() => {
    if (dragging.current) return;
    anim.current?.stop();
    anim.current = animate(pos, percent, tRef.current("thumb") as never);
  }, [percent, pos]);
  useEffect(() => () => anim.current?.stop(), []);

  return {
    pos,
    begin() { dragging.current = true; anim.current?.stop(); tracker.current.reset(); },
    follow(p: number) { pos.set(p); tracker.current.add(p); },
    end(settleTo: number) {
      dragging.current = false;
      anim.current?.stop();
      anim.current = animate(pos, settleTo, tRef.current("drag", tracker.current.velocity()) as never);
    },
    get dragging() { return dragging.current; },
  };
}

/** Fraction along a track for a pointer event, honouring RTL and vertical orientation. */
export function pointerFraction(track: HTMLElement, e: { clientX: number; clientY: number }, vertical = false) {
  const r = track.getBoundingClientRect();
  if (vertical) return Math.min(1, Math.max(0, (r.bottom - e.clientY) / r.height));
  const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  return getComputedStyle(track).direction === "rtl" ? 1 - f : f;
}
