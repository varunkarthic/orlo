import { hydrateRoot, createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { loadPage } from "./pages/index.tsx";

const route = document.querySelector<HTMLMetaElement>('meta[name="orlo-route"]')?.content ?? "";
const el = document.getElementById("root")!;
// Load only this page's code, then hydrate synchronously so the markup matches the prerendered HTML.
loadPage(route).then((page) => {
  el.hasChildNodes() ? hydrateRoot(el, <App route={route} page={page} />) : createRoot(el).render(<App route={route} page={page} />);
});
