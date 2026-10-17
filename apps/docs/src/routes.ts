import { manifest, families } from "@orlo/react";

export type Route = { path: string; title: string; section: string };

/** Every route is prerendered to its own index.html, so deep links need no server rewrite. */
export const routes: Route[] = [
  { path: "", title: "Introduction", section: "Start" },
  { path: "start/installation", title: "Installation", section: "Start" },
  { path: "examples", title: "Examples", section: "Start" },
  { path: "foundations", title: "Foundations", section: "System" },
  { path: "motion", title: "Motion", section: "System" },
  { path: "brand", title: "Brand", section: "System" },
  { path: "labs/states", title: "State Lab", section: "Labs" },
  { path: "labs/details", title: "Details Lab", section: "Labs" },
  { path: "components", title: "All components", section: "Components" },
  ...families.flatMap((f) => manifest.filter((c) => c.family === f).map((c) => ({ path: `components/${c.slug}`, title: c.name, section: f }))),
];

export const sections = [...new Set(routes.map((r) => r.section))];
