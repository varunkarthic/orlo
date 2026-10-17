import { MotionGlobalConfig } from "motion";
import "@testing-library/jest-dom/vitest";

// Animations are verified in the browser; unit tests assert state, semantics and focus.
MotionGlobalConfig.skipAnimations = true;
window.matchMedia ??= ((q: string) => ({ matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })) as typeof window.matchMedia;
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= function () {};
