import { useEffect, useMemo, useState } from "react";
import { OrloProvider, Wordmark, IconButton, SegmentedControl, Popover, Sheet, CommandPalette, Kbd, Icons, BuiltWithOrlo, manifest, families } from "@orlo/react";
import type { MotionMode } from "@orlo/motion";
import { pages, sections, sectionOf, TABS, tabTitle, type Tab } from "./site.ts";
import { PageToc } from "./kit.tsx";
import type { PageRender } from "./pages/index.tsx";
import "@orlo/tokens/css";
import "@orlo/react/styles.css";
import "./docs.css";

type Theme = "system" | "light" | "dark";
type Density = "comfortable" | "compact" | "touch";
type Prefs = { theme: Theme; motion: MotionMode; scheme: "standard" | "expressive"; images: "on" | "off"; density: Density | "auto"; dir: "ltr" | "rtl"; material: "solid" | "glass"; transparency: "system" | "reduced" };
const DEFAULTS: Prefs = { theme: "system", motion: "system", scheme: "standard", images: "on", density: "auto", dir: "ltr", material: "glass", transparency: "system" };
const read = (): Partial<Prefs> => { try { const p = JSON.parse(localStorage.getItem("orlo-prefs") ?? "{}"); if (p.material !== "solid") delete p.material; delete p.tint; return p; } catch { return {}; } };
const THEME_NEXT: Record<Theme, Theme> = { light: "dark", dark: "system", system: "light" };
const THEME_NAME: Record<Theme, string> = { light: "Light", dark: "Dark", system: "Auto" };
const write = (p: Prefs) => { try { localStorage.setItem("orlo-prefs", JSON.stringify(p)); localStorage.setItem("orlo-theme", p.theme); } catch { /* storage blocked */ } };
const NAV = sections.filter((s) => s.id !== "home");

export function App({ route, page }: { route: string; page: PageRender }) {
  const depth = route ? route.split("/").length : 0;
  const root = "../".repeat(depth) || "./";
  const href = (p: string) => `${root}${p}${p ? "/" : ""}`;
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState("");
  // Render in a fixed locale first (matches the prerendered HTML), then switch to the visitor's locale.
  const [locale, setLocale] = useState("en-US");
  useEffect(() => setLocale(navigator.language || "en-US"), []);
  useEffect(() => setPrefs({ ...DEFAULTS, ...read() }), []);
  // Read the Docs injects a floating version flyout. Orlo hides it (docs.css) and shows the version in its footer instead.
  const [rtd, setRtd] = useState<{ version: string; versions: { slug: string; url: string }[] } | null>(null);
  useEffect(() => {
    type Source = { data?: () => { versions?: { current?: { slug: string }; active?: { slug: string; urls: { documentation: string } }[] } } } | undefined;
    const take = (src: Source) => {
      const d = src?.data?.();
      if (d?.versions?.current) setRtd({ version: d.versions.current.slug, versions: (d.versions.active ?? []).map((v) => ({ slug: v.slug, url: v.urls.documentation })) });
    };
    const on = (e: Event) => take((e as CustomEvent).detail as Source);
    // The event often fires before hydration finishes, so also read the data RTD leaves on window.
    try { take((window as unknown as { ReadTheDocsEventData?: Source }).ReadTheDocsEventData); } catch { /* not ready yet */ }
    document.addEventListener("readthedocs-addons-data-ready", on);
    return () => document.removeEventListener("readthedocs-addons-data-ready", on);
  }, []);
  // "/" opens search from anywhere except text inputs (the palette itself handles ⌘K / Ctrl+K).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest("input, textarea, select, [contenteditable=true]");
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const set = <K extends keyof Prefs>(k: K) => (v: Prefs[K]) => setPrefs((p) => {
    const next = { ...p, [k]: v }; write(next);
    if (k === "theme") v === "system" ? delete document.documentElement.dataset.orloTheme : (document.documentElement.dataset.orloTheme = v as string);
    return next;
  });
  const section = sectionOf(route);
  const home = section === "home";
  const commands = useMemo(() => [
    ...pages.map((p) => ({ id: p.path || "home", label: p.title === "Overview" ? `${sections.find((s) => s.id === p.section)?.title} overview` : p.title, group: p.group ?? sections.find((s) => s.id === p.section)?.title, keywords: p.summary, onSelect: () => { location.href = href(p.path); } })),
    ...manifest.flatMap((c) => TABS.slice(1).map((t) => ({ id: `${c.slug}-${t}`, label: `${c.name} ${tabTitle[t].toLowerCase()}`, group: "Component tabs", hint: tabTitle[t], onSelect: () => { location.href = href(`components/${c.slug}/${t}`); } }))),
  ], [root]); // eslint-disable-line react-hooks/exhaustive-deps

  const base = route.match(/^components\/[^/]+/)?.[0] ?? route;
  const sidePages = pages.filter((p) => p.section === section && !home);
  const groups = section === "components" ? ["", ...families] : [""];
  const flat = pages.filter((p) => p.section !== "home");
  const idx = flat.findIndex((p) => p.path === base);
  const prev = idx > 0 ? flat[idx - 1] : undefined, next = idx >= 0 ? flat[idx + 1] : undefined;
  const tab = (route.split("/")[2] as Tab | undefined) ?? "overview";
  const titleOf = (p: (typeof pages)[number]) => (p.title === "Overview" ? sections.find((s) => s.id === p.section)?.title : p.title);
  const q = filter.trim().toLowerCase();

  const sidebar = (
    <nav aria-label={`${sections.find((s) => s.id === section)?.title ?? ""} pages`} className="side">
      {section === "components" && (
        <label className="side__filter">
          <Icons.Search size={16} aria-hidden="true" />
          <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter components" aria-label="Filter components" />
        </label>
      )}
      {groups.map((g) => {
        const list = sidePages.filter((p) => (p.group ?? "") === g && (!q || p.title.toLowerCase().includes(q)));
        if (!list.length) return null;
        return (
          <div key={g || "main"} className="side__group">
            {g && <p className="side__heading">{g}</p>}
            <ul>{list.map((p) => <li key={p.path}><a href={href(p.path)} aria-current={p.path === base ? "page" : undefined}>{p.title}</a></li>)}</ul>
          </div>
        );
      })}
      {q && !sidePages.some((p) => p.title.toLowerCase().includes(q)) && <p className="side__empty">No component matches “{filter}”.</p>}
    </nav>
  );

  return (
    <OrloProvider theme={prefs.theme} motion={prefs.motion} motionScheme={prefs.scheme} images={prefs.images} density={prefs.density === "auto" ? undefined : prefs.density} dir={prefs.dir} material={prefs.material} reduceTransparency={prefs.transparency === "reduced"} locale={locale}>
      <a className="skip" href="#main">Skip to content</a>
      <header className="header orlo-material">
        <div className="header__inner">
          <a href={root} className="header__logo" aria-label="Orlo home"><Wordmark height={22} /><span>Docs</span></a>
          <nav aria-label="Sections" className="header__nav">
            {NAV.map((s) => <a key={s.id} href={href(s.path)} aria-current={section === s.id ? "true" : undefined}>{s.title}</a>)}
          </nav>
          <div className="header__end">
            <button type="button" className="search" onClick={() => setSearchOpen(true)} aria-label="Search components and guides" aria-keyshortcuts="Meta+K Control+K /">
              <Icons.Search size={16} /><span className="search__label">Search components and guides</span><span className="search__keys" aria-hidden="true"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
            </button>
            <IconButton label={`Theme: ${THEME_NAME[prefs.theme]}. Switch to ${THEME_NAME[THEME_NEXT[prefs.theme]]}`} onClick={() => set("theme")(THEME_NEXT[prefs.theme])}>
              {prefs.theme === "light" ? <Icons.Sun size={20} /> : prefs.theme === "dark" ? <Icons.Moon size={20} /> : <Icons.Monitor size={20} />}
            </IconButton>
            <Popover label="Preferences" placement="bottom-end" trigger={<IconButton label="Preferences"><Icons.Sliders size={20} /></IconButton>}>
              <div className="prefs">
                <p className="prefs__title">Appearance</p>
                <Pref label="Theme" value={prefs.theme} onChange={(v) => set("theme")(v as Theme)} options={["system", "light", "dark"]} />
                <Pref label="Material" value={prefs.material} onChange={(v) => set("material")(v as Prefs["material"])} options={["solid", "glass"]} />
                <p className="prefs__title">Motion and accessibility</p>
                <Pref label="Motion" value={prefs.motion} onChange={(v) => set("motion")(v as MotionMode)} options={["system", "reduced", "off", "full"]} />
                <Pref label="Images" value={prefs.images} onChange={(v) => set("images")(v as "on" | "off")} options={["on", "off"]} />
                <Pref label="Transparency" value={prefs.transparency} onChange={(v) => set("transparency")(v as Prefs["transparency"])} options={["system", "reduced"]} />
                <details className="prefs__more">
                  <summary>More</summary>
                  <Pref label="Density" value={prefs.density} onChange={(v) => set("density")(v as Prefs["density"])} options={["auto", "compact", "comfortable", "touch"]} />
                  <Pref label="Direction" value={prefs.dir} onChange={(v) => set("dir")(v as "ltr" | "rtl")} options={["ltr", "rtl"]} />
                  <Pref label="Spring" value={prefs.scheme} onChange={(v) => set("scheme")(v as Prefs["scheme"])} options={["standard", "expressive"]} />
                </details>
                <p className="orlo-hint prefs__note">Saved in this browser only.</p>
              </div>
            </Popover>
            <a className="header__gh" href="https://github.com/varunkarthic/orlo" aria-label="Source on GitHub">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>
            </a>
            <Sheet side="end" title="Menu" trigger={<IconButton label="Open menu" className="header__menu"><Icons.Menu size={20} /></IconButton>}>
              <nav aria-label="Sections" className="mnav">
                {NAV.map((s) => <a key={s.id} href={href(s.path)} aria-current={section === s.id ? "true" : undefined}>{s.title}</a>)}
              </nav>
              {!home && sidebar}
            </Sheet>
          </div>
        </div>
      </header>

      <div className="layout" data-home={home || undefined}>
        {!home && <aside className="layout__side">{sidebar}</aside>}
        <main id="main" tabIndex={-1} className="layout__main">
          <div className="article" data-section={section}>
            {page({ root, tab })}
            {!home && idx >= 0 && (
              <nav className="pager" aria-label="Previous and next">
                {prev ? <a href={href(prev.path)}><span>Previous</span><strong><Icons.ChevronLeft size={16} aria-hidden="true" />{titleOf(prev)}</strong></a> : <span />}
                {next ? <a href={href(next.path)} data-next=""><span>Next</span><strong>{titleOf(next)}<Icons.ChevronRight size={16} aria-hidden="true" /></strong></a> : <span />}
              </nav>
            )}
          </div>
          {!home && <aside className="layout__toc"><PageToc dep={route} /></aside>}
        </main>
      </div>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <Wordmark height={20} />
            <p>Open-source design framework for React, designed by Varun Karthic. Pre-release: packages are not on npm yet.</p>
            <BuiltWithOrlo layout="inline" tone="outline" size="sm" href={href("brand")} kind="designed" />
          </div>
          <div className="footer__cols">
            <div><p>Learn</p><a href={href("start")}>Get started</a><a href={href("foundations")}>Foundations</a><a href={href("styles")}>Styles</a></div>
            <div><p>Build</p><a href={href("components")}>Components</a><a href={href("develop")}>Develop</a><a href={href("start/theme-studio")}>Theme Studio</a></div>
            <div><p>Project</p><a href={href("brand")}>Brand</a><a href={href("brand/badges")}>Embed badges</a><a href={href("brand/licensing")}>Licensing & credits</a><a href="https://github.com/varunkarthic/orlo">GitHub</a></div>
          </div>
        </div>
        <div className="footer__legal">
          <span>Designed by Varun Karthic. Not affiliated with Apple, Google, Framer or any other vendor named in its research.</span>
          {rtd && <span className="footer__version">Version: {rtd.versions.length > 1 ? rtd.versions.map((v, i) => <span key={v.slug}>{i ? " · " : ""}{v.slug === rtd.version ? <strong>{v.slug}</strong> : <a href={v.url}>{v.slug}</a>}</span>) : <strong>{rtd.version}</strong>} · Hosted on Read the Docs</span>}
        </div>
      </footer>
      <CommandPalette commands={commands} open={searchOpen} onOpenChange={setSearchOpen} placeholder="Search components and guides" />
    </OrloProvider>
  );
}

function Pref({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="pref">
      <span className="pref__label">{label}</span>
      <SegmentedControl label={label} size="sm" value={value} onValueChange={onChange} options={options.map((o) => ({ value: o, label: o === "ltr" || o === "rtl" ? o.toUpperCase() : o === "system" ? "Auto" : o[0].toUpperCase() + o.slice(1) }))} />
    </div>
  );
}
