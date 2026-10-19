import { manifest, families } from "@orlo/react";

export type SectionId = "home" | "start" | "foundations" | "styles" | "components" | "develop" | "brand";
export type Page = { path: string; title: string; section: SectionId; group?: string; summary?: string };

export const sections: { id: SectionId; title: string; path: string; icon: "Home" | "Compass" | "Layers" | "Palette" | "Grid" | "Code" | "Sparkle" }[] = [
  { id: "home", title: "Home", path: "", icon: "Home" },
  { id: "start", title: "Get started", path: "start", icon: "Compass" },
  { id: "foundations", title: "Foundations", path: "foundations", icon: "Layers" },
  { id: "styles", title: "Styles", path: "styles", icon: "Palette" },
  { id: "components", title: "Components", path: "components", icon: "Grid" },
  { id: "develop", title: "Develop", path: "develop", icon: "Code" },
  { id: "brand", title: "Brand", path: "brand", icon: "Sparkle" },
];

export const TABS = ["overview", "specs", "guidelines", "accessibility", "code"] as const;
export type Tab = (typeof TABS)[number];
export const tabTitle: Record<Tab, string> = { overview: "Overview", specs: "Specs", guidelines: "Guidelines", accessibility: "Accessibility", code: "Code" };

/** Sidebar pages per section. Component tab pages exist as routes but are not listed individually. */
export const pages: Page[] = [
  { path: "", title: "Home", section: "home" },
  { path: "start", title: "Overview", section: "start", summary: "What Orlo is and how to begin." },
  { path: "start/installation", title: "Installation", section: "start", summary: "Add Orlo to a React app." },
  { path: "start/theme-studio", title: "Theme Studio", section: "start", summary: "Generate an accessible theme from one colour." },
  { path: "start/examples", title: "Examples", section: "start", summary: "Real screens built only from Orlo." },
  { path: "start/about", title: "About the name", section: "start", summary: "Orlo, the hem, and why the edges matter." },
  { path: "foundations", title: "Overview", section: "foundations" },
  { path: "foundations/principles", title: "Principles", section: "foundations", summary: "The rubric every component is judged against." },
  { path: "foundations/accessibility", title: "Accessibility", section: "foundations", summary: "Targets, testing and known limits." },
  { path: "foundations/adaptive", title: "Adaptive design", section: "foundations", summary: "Space, input, zoom, direction and preference." },
  { path: "foundations/interaction-states", title: "Interaction states", section: "foundations", summary: "Hover, focus, press, disabled and more." },
  { path: "foundations/lifecycle", title: "Lifecycle & composition", section: "foundations", summary: "How components enter, respond, interrupt, recover and work together." },
  { path: "foundations/layering", title: "Layering", section: "foundations", summary: "Who owns the space when surfaces overlap." },
  { path: "foundations/async-states", title: "Async states", section: "foundations", summary: "Loading, failure, empty, offline and retry." },
  { path: "foundations/edge-cases", title: "Edge cases", section: "foundations", summary: "The details lab: flawed beside fixed." },
  { path: "foundations/failures", title: "Failure gallery", section: "foundations", summary: "Every error state, side by side." },
  { path: "foundations/writing", title: "Writing", section: "foundations", summary: "Words for errors, empty states and actions." },
  { path: "foundations/tokens", title: "Design tokens", section: "foundations", summary: "Primitive, semantic and component layers." },
  { path: "styles", title: "Overview", section: "styles" },
  { path: "styles/color", title: "Color", section: "styles", summary: "Palette, roles and measured contrast." },
  { path: "styles/typography", title: "Typography", section: "styles", summary: "Type scale, rhythm and numerals." },
  { path: "styles/spacing", title: "Spacing & layout", section: "styles", summary: "8pt grid, element rhythm, tab bars, touch targets, and spatial hierarchy inspired by Apple HIG and Material 3." },
  { path: "styles/shape", title: "Shape", section: "styles", summary: "Radii, strokes and corners." },
  { path: "styles/elevation", title: "Elevation", section: "styles", summary: "Surfaces, shadows and scrims." },
  { path: "styles/materials", title: "Materials", section: "styles", summary: "Solid and frosted glass, with a readability guard." },
  { path: "styles/motion", title: "Motion", section: "styles", summary: "Springs, presets and the MotionLab." },
  { path: "styles/icons", title: "Icons", section: "styles", summary: "Orlo's own 24px icon set." },
  { path: "styles/density", title: "Density", section: "styles", summary: "Comfortable, compact and touch." },
  { path: "components", title: "All components", section: "components" },
  ...families.flatMap((f) => manifest.filter((c) => c.family === f).map((c) => ({ path: `components/${c.slug}`, title: c.name, section: "components" as const, group: f, summary: c.summary }))),
  { path: "develop", title: "Overview", section: "develop" },
  { path: "develop/provider", title: "Provider", section: "develop", summary: "Theme, motion, images, density, direction." },
  { path: "develop/motion", title: "Motion API", section: "develop", summary: "useOrloMotion and presets in code." },
  { path: "develop/positioning", title: "Positioning & layers", section: "develop", summary: "computePosition and the layer stack." },
  { path: "develop/theming", title: "Theming API", section: "develop", summary: "Tokens, createTheme and overrides." },
  { path: "develop/ssr", title: "Server rendering", section: "develop", summary: "Hydration, portals and no-JS output." },
  { path: "develop/testing", title: "Testing", section: "develop", summary: "How Orlo is verified, and how to test with it." },
  { path: "develop/read-the-docs", title: "Hosting on Read the Docs", section: "develop", summary: "How this site is built and served." },
  { path: "develop/agents", title: "For AI agents", section: "develop", summary: "Rules for coding agents using Orlo." },
  { path: "develop/devices", title: "Device lab", section: "develop", summary: "Real pages in phone, tablet and laptop frames." },
  { path: "brand", title: "Brand overview", section: "brand", summary: "Orlo identity, badges, assets and usage." },
  { path: "brand/badges", title: "Embed badges", section: "brand", summary: "Live badge variants, React code and static SVG embeds." },
  { path: "brand/licensing", title: "Licensing & credits", section: "brand", summary: "Designer, copyright, licence and attribution." },
];

/** Every prerendered route: pages plus the four extra tabs of each component. */
export const routes: { path: string; title: string }[] = [
  ...pages.map((p) => ({ path: p.path, title: p.title })),
  ...manifest.flatMap((c) => TABS.slice(1).map((t) => ({ path: `components/${c.slug}/${t}`, title: `${c.name} · ${tabTitle[t]}` }))),
];

export const sectionOf = (route: string): SectionId => (route === "" ? "home" : (route.split("/")[0] as SectionId));
