import type { ReactNode } from "react";
import type { Tab } from "../site.ts";
import { Home } from "./Home.tsx";
import { StartOverview, Installation, ThemeStudio, About } from "./Start.tsx";
import { Examples } from "./Examples.tsx";
import { FoundationsOverview, Principles, Accessibility, Adaptive, InteractionStates, Layering, Writing, TokensPage } from "./FoundationsPages.tsx";
import { StateLab } from "./StateLab.tsx";
import { DetailsLab } from "./DetailsLab.tsx";
import { StylesOverview, Color, Typography, Shape, Elevation, IconsPage, Density } from "./Styles.tsx";
import { MotionLab } from "./MotionLab.tsx";
import { ComponentsIndex, ComponentPage } from "./ComponentDocs.tsx";
import { DevelopOverview, ProviderPage, MotionApi, PositioningPage, ThemingApi, SsrPage, TestingPage, RtdPage, AgentsPage } from "./Develop.tsx";
import { BrandPage } from "./Brand.tsx";

export function renderPage(route: string, root: string, tab: Tab): ReactNode {
  const table: Record<string, () => ReactNode> = {
    "": () => <Home root={root} />,
    start: () => <StartOverview root={root} />, "start/installation": () => <Installation />, "start/theme-studio": () => <ThemeStudio />, "start/examples": () => <Examples />, "start/about": () => <About />,
    foundations: () => <FoundationsOverview root={root} />, "foundations/principles": () => <Principles />, "foundations/accessibility": () => <Accessibility root={root} />,
    "foundations/adaptive": () => <Adaptive />, "foundations/interaction-states": () => <InteractionStates />, "foundations/layering": () => <Layering />,
    "foundations/async-states": () => <StateLab />, "foundations/edge-cases": () => <DetailsLab />, "foundations/writing": () => <Writing />, "foundations/tokens": () => <TokensPage />,
    styles: () => <StylesOverview root={root} />, "styles/color": () => <Color />, "styles/typography": () => <Typography />, "styles/shape": () => <Shape />, "styles/elevation": () => <Elevation />,
    "styles/motion": () => <MotionLab />, "styles/icons": () => <IconsPage />, "styles/density": () => <Density />,
    components: () => <ComponentsIndex root={root} />,
    develop: () => <DevelopOverview root={root} />, "develop/provider": () => <ProviderPage />, "develop/motion": () => <MotionApi />, "develop/positioning": () => <PositioningPage />,
    "develop/theming": () => <ThemingApi />, "develop/ssr": () => <SsrPage />, "develop/testing": () => <TestingPage />, "develop/read-the-docs": () => <RtdPage />, "develop/agents": () => <AgentsPage />,
    brand: () => <BrandPage root={root} />,
  };
  if (table[route]) return table[route]();
  const m = route.match(/^components\/([^/]+)/);
  if (m) return <ComponentPage slug={m[1]} root={root} tab={tab} />;
  return <h1>Not found</h1>;
}
