import { renderToString } from "react-dom/server";
import { manifest } from "@orlo/react";
import { App } from "./App.tsx";
import { routes } from "./site.ts";
import { docs } from "./registry/index.ts";

export { routes };
export const render = (route: string) => renderToString(<App route={route} />);
/** Components listed in the manifest without a docs entry. The build fails if this is non-empty. */
export const missingDocs = manifest.filter((m) => !docs[m.slug]).map((m) => m.slug);
