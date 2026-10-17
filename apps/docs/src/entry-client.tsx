import { hydrateRoot, createRoot } from "react-dom/client";
import { App } from "./App.tsx";

const route = document.querySelector<HTMLMetaElement>('meta[name="orlo-route"]')?.content ?? "";
const el = document.getElementById("root")!;
// Prerendered pages hydrate; the dev server serves an empty shell and renders client-side.
el.hasChildNodes() ? hydrateRoot(el, <App route={route} />) : createRoot(el).render(<App route={route} />);
