import { renderToString } from "react-dom/server";
import { manifest } from "@orlo/react";
import { App } from "./App.tsx";
import { routes, pages } from "./site.ts";
import { loadPage } from "./pages/index.tsx";
import { loadDoc } from "./registry/load.ts";

export { routes, pages, manifest };
export const render = async (route: string) => renderToString(<App route={route} page={await loadPage(route)} />);
/** Components in the manifest whose docs don't resolve through the chunk loader. The build fails if any. */
export const findMissingDocs = async () => (await Promise.all(manifest.map(async (m) => ((await loadDoc(m.slug)) ? null : m.slug)))).filter(Boolean);
