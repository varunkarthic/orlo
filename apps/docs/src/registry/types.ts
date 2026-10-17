import type { ReactNode } from "react";
import type { PlaygroundDef } from "../playground.tsx";

export type Doc = {
  /** Hero demo on the Overview tab. */
  demo: () => ReactNode;
  variants?: { title: string; body?: string; demo: () => ReactNode }[];
  /** Usage snippet (must match the real API). */
  code: string;
  props?: [name: string, type: string, description: string][];
  /** Behaviour highlights. */
  notes: string[];
  /** [part label, CSS selector inside the anatomy demo]. */
  anatomy?: [string, string][];
  anatomyDemo?: () => ReactNode;
  /** [property, token or literal]. */
  specs?: [string, string][];
  useWhen?: string[];
  avoidWhen?: string[];
  dos?: [string, string][];
  keyboard?: [string, string][];
  semantics?: string[];
  /** Edge cases this component handles deliberately. */
  edge?: string[];
  /** Live prop playground. */
  playground?: PlaygroundDef;
};

export const controlSpecs: [string, string][] = [["Height", "--orlo-control-h"], ["Horizontal padding", "--orlo-control-pad"], ["Corner radius", "--orlo-radius-md"], ["Focus ring", "--orlo-color-focus"]];
export const surfaceSpecs: [string, string][] = [["Surface", "--orlo-color-surface-raised"], ["Border", "--orlo-color-border"], ["Corner radius", "--orlo-radius-lg"]];
