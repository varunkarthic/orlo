import { manifest } from "@orlo/react";

export type Route = { path: string; title: string };

/** Every route is prerendered to its own index.html, so deep links need no server rewrite. */
export const routes: Route[] = [
  { path: "", title: "Orlo" },
  { path: "foundations", title: "Foundations" },
  { path: "motion", title: "Motion" },
  { path: "components", title: "Components" },
  ...manifest.map((c) => ({ path: `components/${c.slug}`, title: c.name })),
  { path: "labs/states", title: "State Lab" },
  { path: "labs/details", title: "Details Lab" },
  { path: "brand", title: "Brand" },
];
