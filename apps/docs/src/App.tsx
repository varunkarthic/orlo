import { useEffect, useMemo, useState } from "react";
import { OrloProvider, ProgressiveBlur, Wordmark, Button, IconButton, SegmentedControl, Popover, Sheet, CommandPalette, Kbd, Stack, Icons, manifest, families } from "@orlo/react";
import type { MotionMode } from "@orlo/motion";
import { pages, sections, sectionOf, TABS, tabTitle, type Tab } from "./site.ts";
import { PageToc } from "./kit.tsx";
import type { PageRender } from "./pages/index.tsx";
import "@orlo/tokens/css";
import "@orlo/react/styles.css";
import "./docs.css";

type Theme = "system" | "light" | "dark";
type Density = "comfortable" | "compact" | "touch";
type Prefs = { theme: Theme; motion: MotionMode; scheme: "standard" | "expressive"; images: "on" | "off"; density: Density | "auto"; dir: "ltr" | "rtl"; material: "solid" | "glass" | "tinted"; tint: string; transparency: "system" | "reduced" };
const DEFAULTS: Prefs = { theme: "system", motion: "system", scheme: "standard", images: "on", density: "auto", dir: "ltr", material: "glass", tint: "#A8370A", transparency: "system" };
const read = (): Partial<Prefs> => { try { return JSON.parse(localStorage.getItem("orlo-prefs") ?? "{}"); } catch { return {}; } };
const write = (p: Prefs) => { try { localStorage.setItem("orlo-prefs", JSON.stringify(p)); localStorage.setItem("orlo-theme", p.theme); } catch { /* storage blocked */ } };

export function App({ route, page }: { route: string; page: PageRender }) {
  const depth = route ? route.split("/").length : 0;
  const root = "../".repeat(depth) || "./";
  const href = (p: string) => `${root}${p}${p ? "/" : ""}`;
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [searchOpen, setSearchOpen] = useState(false);
  // Render in a fixed locale first (matches the prerendered HTML), then switch to the visitor's locale.
  const [locale, setLocale] = useState("en-US");
  useEffect(() => setLocale(navigator.language || "en-US"), []);
  useEffect(() => setPrefs({ ...DEFAULTS, ...read() }), []);
  const set = <K extends keyof Prefs>(k: K) => (v: Prefs[K]) => setPrefs((p) => {
    const next = { ...p, [k]: v }; write(next);
    if (k === "theme") v === "system" ? delete document.documentElement.dataset.orloTheme : (document.documentElement.dataset.orloTheme = v as string);
    return next;
  });
  const section = sectionOf(route);
  const commands = useMemo(() => [
    ...pages.map((p) => ({ id: p.path || "home", label: p.title === "Overview" ? `${sections.find((s) => s.id === p.section)?.title} overview` : p.title, group: p.group ?? sections.find((s) => s.id === p.section)?.title, keywords: p.summary, onSelect: () => { location.href = href(p.path); } })),
    ...manifest.flatMap((c) => TABS.slice(1).map((t) => ({ id: `${c.slug}-${t}`, label: `${c.name} ${tabTitle[t].toLowerCase()}`, group: "Component tabs", hint: tabTitle[t], onSelect: () => { location.href = href(`components/${c.slug}/${t}`); } }))),
  ], [root]); // eslint-disable-line react-hooks/exhaustive-deps

  const base = route.match(/^components\/[^/]+/)?.[0] ?? route;
  const sidePages = pages.filter((p) => p.section === section && section !== "home");
  const groups = section === "components" ? ["", ...families] : [""];
  const flat = pages.filter((p) => p.section !== "home");
  const idx = flat.findIndex((p) => p.path === base);
  const prev = idx > 0 ? flat[idx - 1] : undefined, next = idx >= 0 ? flat[idx + 1] : undefined;
  const tab = (route.split("/")[2] as Tab | undefined) ?? "overview";

  const drawer = (
    <nav aria-label={`${sections.find((s) => s.id === section)?.title ?? ""} pages`} className="drawer__nav">
      <p className="drawer__title">{sections.find((s) => s.id === section)?.title}</p>
      {groups.map((g) => {
        const list = sidePages.filter((p) => (p.group ?? "") === g);
        if (!list.length) return null;
        return (
          <div key={g || "main"} className="drawer__group">
            {g && <p className="drawer__heading">{g}</p>}
            <ul>{list.map((p) => <li key={p.path}><a href={href(p.path)} aria-current={p.path === base ? "page" : undefined}>{p.title}</a></li>)}</ul>
          </div>
        );
      })}
    </nav>
  );
  const rail = (
    <ul className="rail">
      {sections.map((s) => { const I = Icons[s.icon]; return (
        <li key={s.id}><a href={href(s.path)} className="rail__item" aria-current={section === s.id ? "page" : undefined}>
          <span className="rail__icon"><I size={22} /></span><span className="rail__label">{s.title}</span>
        </a></li>
      ); })}
    </ul>
  );

  return (
    <OrloProvider theme={prefs.theme} motion={prefs.motion} motionScheme={prefs.scheme} images={prefs.images} density={prefs.density === "auto" ? undefined : prefs.density} dir={prefs.dir} material={prefs.material} tint={prefs.tint} reduceTransparency={prefs.transparency === "reduced"} locale={locale}>
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar orlo-material">
        <Sheet side="start" title="Orlo" trigger={<IconButton label="Open navigation" className="only-narrow"><Icons.Menu /></IconButton>}>
          <nav aria-label="Sections" className="mobile-sections">{rail}</nav>
          {section !== "home" && drawer}
        </Sheet>
        <a href={root} className="topbar__logo" aria-label="Orlo home"><Wordmark height={24} /></a>
        <span className="topbar__tag">beta</span>
        <button type="button" className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search documentation">
          <Icons.Search size={16} /><span>Search {manifest.length} components and guides</span><span className="search-trigger__keys" aria-hidden="true"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
        </button>
        <div className="topbar__end">
          <SegmentedControl label="Colour theme" size="sm" value={prefs.theme} onValueChange={(v) => set("theme")(v as Theme)}
            options={[{ value: "light", label: <Icons.Sun size={16} />, "aria-label": "Light" }, { value: "system", label: "Auto" }, { value: "dark", label: <Icons.Moon size={16} />, "aria-label": "Dark" }]} />
          <Popover label="Preferences" placement="bottom-end" trigger={<IconButton label="Preferences"><Icons.Settings size={20} /></IconButton>}>
            <Stack gap={4} style={{ inlineSize: "min(19rem, 100%)" }}>
              <strong>Preferences</strong>
              <Pref label="Theme" value={prefs.theme} onChange={(v) => set("theme")(v as Theme)} options={["system", "light", "dark"]} />
              <Pref label="Material" value={prefs.material} onChange={(v) => set("material")(v as Prefs["material"])} options={["solid", "glass", "tinted"]} />
              {prefs.material === "tinted" && <label className="pref"><span className="orlo-field__label">Tint</span><input type="color" className="tint-input" value={prefs.tint} onChange={(e) => set("tint")(e.target.value.toUpperCase())} aria-label="Tint colour" /></label>}
              <Pref label="Transparency" value={prefs.transparency} onChange={(v) => set("transparency")(v as Prefs["transparency"])} options={["system", "reduced"]} />
              <Pref label="Motion" value={prefs.motion} onChange={(v) => set("motion")(v as MotionMode)} options={["system", "reduced", "off", "full"]} />
              <Pref label="Spring" value={prefs.scheme} onChange={(v) => set("scheme")(v as Prefs["scheme"])} options={["standard", "expressive"]} />
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
        <ProgressiveBlur side="top" size="24px" strength={8} />
      </header>
      <div className="shell" data-section={section}>
        <nav aria-label="Sections" className="shell__rail">{rail}</nav>
        {section !== "home" && <aside className="shell__drawer">{drawer}</aside>}
        <main id="main" tabIndex={-1} className="content" data-section={section}>
          <div className="content__inner">
            {page({ root, tab })}
            {section !== "home" && idx >= 0 && (
              <nav className="pager" aria-label="Previous and next">
                {prev ? <a href={href(prev.path)}><span className="orlo-hint">Previous</span>{prev.title === "Overview" ? `${sections.find((s) => s.id === prev.section)?.title}` : prev.title}</a> : <span />}
                {next ? <a href={href(next.path)} data-next=""><span className="orlo-hint">Next</span>{next.title === "Overview" ? `${sections.find((s) => s.id === next.section)?.title}` : next.title}</a> : <span />}
              </nav>
            )}
            <footer className="site-footer">
              <Wordmark height={18} />
              <p>An independent, pre-release design framework for React. Not affiliated with Apple, Google, Framer or any other vendor named in its research. Nothing is published to npm yet.</p>
            </footer>
          </div>
          {section !== "home" && <aside className="content__toc"><PageToc dep={route} /></aside>}
        </main>
      </div>
      <CommandPalette commands={commands} open={searchOpen} onOpenChange={setSearchOpen} placeholder="Search components, guides and tabs…" />
    </OrloProvider>
  );
}

function Pref({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="pref">
      <span className="orlo-field__label">{label}</span>
      <SegmentedControl label={label} size="sm" value={value} onValueChange={onChange} options={options.map((o) => ({ value: o, label: o === "ltr" || o === "rtl" ? o.toUpperCase() : o[0].toUpperCase() + o.slice(1) }))} />
    </div>
  );
}
