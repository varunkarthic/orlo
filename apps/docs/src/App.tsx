import { useEffect, useState, type ReactNode } from "react";
import { OrloProvider, Wordmark, Button } from "@orlo/react";
import type { MotionMode } from "@orlo/motion";
import { routes } from "./routes.ts";
import { Home } from "./pages/Home.tsx";
import { Foundations } from "./pages/Foundations.tsx";
import { MotionLab } from "./pages/MotionLab.tsx";
import { ComponentsIndex, ComponentPage } from "./pages/Components.tsx";
import { StateLab } from "./pages/StateLab.tsx";
import { DetailsLab } from "./pages/DetailsLab.tsx";
import { BrandPage } from "./pages/Brand.tsx";
import "@orlo/tokens/css";
import "@orlo/react/styles.css";
import "./docs.css";

type Theme = "system" | "light" | "dark";
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage may be blocked */ } },
};

function page(route: string, root: string): ReactNode {
  if (route === "") return <Home root={root} />;
  if (route === "foundations") return <Foundations />;
  if (route === "motion") return <MotionLab />;
  if (route === "components") return <ComponentsIndex root={root} />;
  if (route.startsWith("components/")) return <ComponentPage slug={route.slice(11)} root={root} />;
  if (route === "labs/states") return <StateLab />;
  if (route === "labs/details") return <DetailsLab />;
  if (route === "brand") return <BrandPage />;
  return null;
}

export function App({ route }: { route: string }) {
  const depth = route ? route.split("/").length : 0;
  const root = "../".repeat(depth) || "./";
  const [theme, setTheme] = useState<Theme>("system");
  const [motion, setMotion] = useState<MotionMode>("system");
  const [images, setImages] = useState<"on" | "off">("on");

  // Restore after hydration so server and first client render agree.
  useEffect(() => {
    const t = store.get("orlo-theme"); if (t === "light" || t === "dark") setTheme(t);
    const m = store.get("orlo-motion"); if (m === "reduced" || m === "off" || m === "full") setMotion(m);
    if (store.get("orlo-images") === "off") setImages("off");
  }, []);

  const pick = <T extends string>(key: string, set: (v: T) => void) => (v: T) => { set(v); store.set(key, v); if (key === "orlo-theme") {
    v === "system" ? delete document.documentElement.dataset.orloTheme : (document.documentElement.dataset.orloTheme = v); } };

  const current = routes.find((r) => r.path === route);
  const nav = [["foundations", "Foundations"], ["motion", "Motion"], ["components", "Components"], ["labs/states", "State Lab"], ["labs/details", "Details Lab"], ["brand", "Brand"]] as const;

  return (
    <OrloProvider theme={theme} motion={motion} images={images}>
      <a className="skip" href="#main">Skip to content</a>
      <header className="site-header">
        <a href={root} className="site-logo" aria-label="Orlo, home"><Wordmark height={28} /></a>
        <nav aria-label="Primary">
          <ul>
            {nav.map(([p, label]) => (
              <li key={p}><a href={`${root}${p}/`} aria-current={route === p || route.startsWith(p + "/") ? "page" : undefined}>{label}</a></li>
            ))}
          </ul>
        </nav>
        <div className="prefs" role="group" aria-label="Preferences">
          <Button variant="ghost" aria-pressed={theme === "dark"} onClick={() => pick<Theme>("orlo-theme", setTheme)(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")}>
            Theme: {theme}
          </Button>
          <Button variant="ghost" aria-pressed={motion !== "system"} onClick={() => pick<MotionMode>("orlo-motion", setMotion)(motion === "system" ? "reduced" : motion === "reduced" ? "off" : motion === "off" ? "full" : "system")}>
            Motion: {motion}
          </Button>
          <Button variant="ghost" aria-pressed={images === "off"} onClick={() => pick<"on" | "off">("orlo-images", setImages)(images === "on" ? "off" : "on")}>
            Images: {images}
          </Button>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {current && route !== "" && <p className="crumb"><a href={root}>Orlo</a> / {current.title}</p>}
        {page(route, root)}
      </main>
      <footer className="site-footer">
        <p>Orlo is an independent project. It is not affiliated with Apple, Google, Framer or any other vendor named in its research notes. Pre-release: nothing here is published to npm.</p>
      </footer>
    </OrloProvider>
  );
}
