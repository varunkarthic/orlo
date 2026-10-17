import type { ReactNode } from "react";
import type { Tab } from "../site.ts";
import { loadAllDocs, loadDoc } from "../registry/load.ts";

export type PageRender = (p: { root: string; tab: Tab }) => ReactNode;

/** Resolves the page for a route, loading only that page's code (and its documentation chunk). */
export async function loadPage(route: string): Promise<PageRender> {
  const m = route.match(/^components\/([^/]+)/);
  if (m) {
    const [{ ComponentPage }, doc] = await Promise.all([import("./ComponentDocs.tsx"), loadDoc(m[1])]);
    return ({ root, tab }) => <ComponentPage slug={m[1]} doc={doc} root={root} tab={tab} />;
  }
  if (route === "components") { const [{ ComponentsIndex }, docs] = await Promise.all([import("./ComponentDocs.tsx"), loadAllDocs()]); return ({ root }) => <ComponentsIndex root={root} docs={docs} />; }
  if (route === "") { const { Home } = await import("./Home.tsx"); return ({ root }) => <Home root={root} />; }
  if (route.startsWith("start")) {
    if (route === "start/examples") { const { Examples } = await import("./Examples.tsx"); return () => <Examples />; }
    const s = await import("./Start.tsx");
    return ({ root }) => ({ start: <s.StartOverview root={root} />, "start/installation": <s.Installation />, "start/theme-studio": <s.ThemeStudio />, "start/about": <s.About /> } as Record<string, ReactNode>)[route] ?? <h1>Not found</h1>;
  }
  if (route.startsWith("foundations")) {
    if (route === "foundations/async-states") { const { StateLab } = await import("./StateLab.tsx"); return () => <StateLab />; }
    if (route === "foundations/edge-cases") { const { DetailsLab } = await import("./DetailsLab.tsx"); return () => <DetailsLab />; }
    if (route === "foundations/failures") { const { Failures } = await import("./Failures.tsx"); return () => <Failures />; }
    const f = await import("./FoundationsPages.tsx");
    return ({ root }) => ({ foundations: <f.FoundationsOverview root={root} />, "foundations/principles": <f.Principles />, "foundations/accessibility": <f.Accessibility root={root} />, "foundations/adaptive": <f.Adaptive />, "foundations/interaction-states": <f.InteractionStates />, "foundations/layering": <f.Layering />, "foundations/writing": <f.Writing />, "foundations/tokens": <f.TokensPage /> } as Record<string, ReactNode>)[route] ?? <h1>Not found</h1>;
  }
  if (route.startsWith("styles")) {
    if (route === "styles/motion") { const { MotionLab } = await import("./MotionLab.tsx"); return () => <MotionLab />; }
    if (route === "styles/materials") { const { Materials } = await import("./Materials.tsx"); return () => <Materials />; }
    const s = await import("./Styles.tsx");
    return ({ root }) => ({ styles: <s.StylesOverview root={root} />, "styles/color": <s.Color />, "styles/typography": <s.Typography />, "styles/shape": <s.Shape />, "styles/elevation": <s.Elevation />, "styles/icons": <s.IconsPage />, "styles/density": <s.Density /> } as Record<string, ReactNode>)[route] ?? <h1>Not found</h1>;
  }
  if (route.startsWith("develop")) {
    if (route === "develop/devices") { const { DeviceLab } = await import("./DeviceLab.tsx"); return ({ root }) => <DeviceLab root={root} />; }
    const d = await import("./Develop.tsx");
    return ({ root }) => ({ develop: <d.DevelopOverview root={root} />, "develop/provider": <d.ProviderPage />, "develop/motion": <d.MotionApi />, "develop/positioning": <d.PositioningPage />, "develop/theming": <d.ThemingApi />, "develop/ssr": <d.SsrPage />, "develop/testing": <d.TestingPage />, "develop/read-the-docs": <d.RtdPage />, "develop/agents": <d.AgentsPage /> } as Record<string, ReactNode>)[route] ?? <h1>Not found</h1>;
  }
  if (route === "brand") { const { BrandPage } = await import("./Brand.tsx"); return ({ root }) => <BrandPage root={root} />; }
  if (route === "brand/licensing") { const { Licensing } = await import("./Licensing.tsx"); return () => <Licensing />; }
  return () => <h1>Not found</h1>;
}
