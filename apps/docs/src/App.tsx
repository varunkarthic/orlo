import { useEffect, useMemo, useState, type ReactNode } from "react";
import { OrloProvider, Wordmark, Button, IconButton, SegmentedControl, Popover, Sheet, CommandPalette, Kbd, Stack, Icons, manifest } from "@orlo/react";
import type { MotionMode } from "@orlo/motion";
import { routes, sections } from "./routes.ts";
import { Home } from "./pages/Home.tsx";
import { Installation } from "./pages/Installation.tsx";
import { Examples } from "./pages/Examples.tsx";
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
type Density = "comfortable" | "compact" | "touch";
type Prefs = { theme: Theme; motion: MotionMode; images: "on" | "off"; density: Density | "auto"; dir: "ltr" | "rtl" };
const DEFAULTS: Prefs = { theme: "system", motion: "system", images: "on", density: "auto", dir: "ltr" };

const read = (): Partial<Prefs> => { try { return JSON.parse(localStorage.getItem("orlo-prefs") ?? "{}"); } catch { return {}; } };
const write = (p: Prefs) => { try { localStorage.setItem("orlo-prefs", JSON.stringify(p)); localStorage.setItem("orlo-theme", p.theme); } catch { /* storage blocked: preferences last for this page only */ } };

function page(route: string, root: string): ReactNode {
  if (route === "") return <Home root={root} />;
  if (route === "start/installation") return <Installation />;
  if (route === "examples") return <Examples />;
  if (route === "foundations") return <Foundations />;
  if (route === "motion") return <MotionLab />;
  if (route === "components") return <ComponentsIndex root={root} />;
  if (route.startsWith("components/")) return <ComponentPage slug={route.slice(11)} root={root} />;
  if (route === "labs/states") return <StateLab />;
  if (route === "labs/details") return <DetailsLab />;
  if (route === "brand") return <BrandPage />;
  return null;
}

function Sidebar({ route, root }: { route: string; root: string }) {
  return (
    <nav aria-label="Documentation" className="sidebar__nav">
      {sections.map((s) => (
        <div key={s} className="sidebar__group">
          <p className="sidebar__heading">{s}</p>
          <ul>
            {routes.filter((r) => r.section === s).map((r) => (
              <li key={r.path}><a href={`${root}${r.path}${r.path ? "/" : ""}`} aria-current={r.path === route ? "page" : undefined}>{r.title}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function App({ route }: { route: string }) {
  const depth = route ? route.split("/").length : 0;
  const root = "../".repeat(depth) || "./";
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [searchOpen, setSearchOpen] = useState(false);
  // Restore after hydration so the server render and the first client render agree.
  useEffect(() => setPrefs({ ...DEFAULTS, ...read() }), []);
  const set = <K extends keyof Prefs>(k: K) => (v: Prefs[K]) => setPrefs((p) => {
    const next = { ...p, [k]: v };
    write(next);
    if (k === "theme") v === "system" ? delete document.documentElement.dataset.orloTheme : (document.documentElement.dataset.orloTheme = v as string);
    return next;
  });

  const commands = useMemo(() => routes.map((r) => ({
    id: r.path || "home", label: r.title, group: r.section,
    keywords: manifest.find((m) => `components/${m.slug}` === r.path)?.summary,
    onSelect: () => { location.href = `${root}${r.path}${r.path ? "/" : ""}`; },
  })), [root]);

  const current = routes.find((r) => r.path === route);
  const idx = routes.indexOf(current!);
  const prev = idx > 0 ? routes[idx - 1] : undefined;
  const next = idx >= 0 && idx < routes.length - 1 ? routes[idx + 1] : undefined;
  const href = (p: string) => `${root}${p}${p ? "/" : ""}`;

  return (
    <OrloProvider theme={prefs.theme} motion={prefs.motion} images={prefs.images} density={prefs.density === "auto" ? undefined : prefs.density} dir={prefs.dir}>
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar">
        <div className="topbar__start">
          <Sheet side="start" title="Orlo" trigger={<IconButton label="Open navigation" className="only-narrow"><Icons.Menu /></IconButton>}>
            <Sidebar route={route} root={root} />
          </Sheet>
          <a href={root} className="topbar__logo" aria-label="Orlo home"><Wordmark height={26} /></a>
          <span className="topbar__tag">pre-release</span>
        </div>
        <button type="button" className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search documentation">
          <Icons.Search size={16} /><span>Search</span><span className="search-trigger__keys" aria-hidden="true"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
        </button>
        <div className="topbar__end">
          <SegmentedControl label="Colour theme" size="sm" value={prefs.theme} onValueChange={(v) => set("theme")(v as Theme)}
            options={[{ value: "light", label: <Icons.Sun size={16} />, "aria-label": "Light" }, { value: "system", label: "Auto" }, { value: "dark", label: <Icons.Moon size={16} />, "aria-label": "Dark" }]} />
          <Popover label="Preferences" placement="bottom-end" trigger={<Button variant="ghost" data-size="sm">Preferences</Button>}>
            <Stack gap={4} style={{ inlineSize: "min(18rem, 100%)" }}>
              <strong>Preferences</strong>
              <Pref label="Motion" value={prefs.motion} onChange={(v) => set("motion")(v as MotionMode)} options={["system", "reduced", "off", "full"]} />
              <Pref label="Images" value={prefs.images} onChange={(v) => set("images")(v as "on" | "off")} options={["on", "off"]} />
              <Pref label="Density" value={prefs.density} onChange={(v) => set("density")(v as Prefs["density"])} options={["auto", "compact", "comfortable", "touch"]} />
              <Pref label="Direction" value={prefs.dir} onChange={(v) => set("dir")(v as "ltr" | "rtl")} options={["ltr", "rtl"]} />
              <p className="orlo-hint" style={{ margin: 0 }}>Saved in this browser only.</p>
            </Stack>
          </Popover>
          <a className="topbar__gh" href="https://github.com/varunkarthic/orlo" aria-label="Source on GitHub">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>
          </a>
        </div>
      </header>
      <div className="shell">
        <aside className="sidebar"><Sidebar route={route} root={root} /></aside>
        <main id="main" tabIndex={-1} className="content">
          {page(route, root)}
          {current && (
            <nav className="pager" aria-label="Previous and next">
              {prev ? <a href={href(prev.path)}><span className="orlo-hint">Previous</span>{prev.title}</a> : <span />}
              {next ? <a href={href(next.path)} data-next=""><span className="orlo-hint">Next</span>{next.title}</a> : <span />}
            </nav>
          )}
          <footer className="site-footer">
            <p>Orlo is an independent, pre-release project. It is not affiliated with Apple, Google, Framer or any other vendor named in its research. Nothing is published to npm yet.</p>
          </footer>
        </main>
      </div>
      <CommandPalette commands={commands} open={searchOpen} onOpenChange={setSearchOpen} placeholder="Search pages and components…" />
    </OrloProvider>
  );
}

function Pref({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="pref">
      <span className="orlo-field__label">{label}</span>
      <SegmentedControl label={label} size="sm" value={value} onValueChange={onChange} options={options.map((o) => ({ value: o, label: o.toUpperCase() === o ? o : o[0].toUpperCase() + o.slice(1) }))} />
    </div>
  );
}
