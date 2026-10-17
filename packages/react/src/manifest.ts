export type Maturity = "planned" | "prototype" | "beta" | "stable";

export type ManifestEntry = {
  name: string;
  slug: string;
  family: string;
  maturity: Maturity;
  summary: string;
  /** What has actually been verified; empty means nothing yet. */
  tested: string[];
};

/**
 * Honest coverage record. Nothing is `stable` until it clears the quality gate (docs/research/accessibility-matrix.md).
 * Planned families are tracked in docs/research/component-coverage.md.
 */
export const manifest: ManifestEntry[] = [
  { name: "Button", slug: "button", family: "Actions", maturity: "beta", summary: "Solid, subtle, ghost and danger buttons with a geometry-preserving loading state.", tested: ["unit"] },
  { name: "TextField", slug: "text-field", family: "Forms", maturity: "beta", summary: "Labelled input with reserved message area and announced errors.", tested: ["unit"] },
  { name: "Badge", slug: "badge", family: "Data display", maturity: "beta", summary: "Compact status label; tone never carries meaning alone.", tested: [] },
  { name: "Card", slug: "card", family: "Data display", maturity: "beta", summary: "Container-query-aware surface.", tested: [] },
  { name: "Alert", slug: "alert", family: "Feedback", maturity: "beta", summary: "Inline status message with an exit that removes it from the tab order.", tested: ["unit"] },
  { name: "Spinner", slug: "spinner", family: "Feedback", maturity: "beta", summary: "Indeterminate activity with an accessible label.", tested: [] },
  { name: "Skeleton", slug: "skeleton", family: "Feedback", maturity: "beta", summary: "Geometry-reserving placeholder; static under reduced motion.", tested: [] },
  { name: "OrloImage", slug: "image", family: "Media", maturity: "beta", summary: "Image lifecycle with bounded retry, designed failure and a global no-image mode.", tested: ["unit"] },
];
