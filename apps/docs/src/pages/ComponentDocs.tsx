import { useEffect, useRef, useState } from "react";
import { manifest, families, Badge, Chip, SearchField, Stack, EmptyState, Button, ProgressiveBlur } from "@orlo/react";
import type { Doc } from "../registry/types.ts";
import { TABS, tabTitle, type Tab } from "../site.ts";
import { Anatomy, Bullets, Code, DoDont, H2, H3, KeyTable, PageHeader, SpecTable, Stage } from "../kit.tsx";
import { controlSpecs } from "../registry/types.ts";
import { Playground } from "../playground.tsx";
import { LifecycleContract } from "./LifecycleContract.tsx";

/** Renders a component's demo only once its card scrolls near the viewport, so the index stays light. */
function LazyPreview({ doc }: { doc?: Doc }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } }, { rootMargin: "200px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className="cindex__preview" inert aria-hidden="true">{show && <div className="cindex__scale">{doc?.demo()}</div>}</div>;
}

export function ComponentsIndex({ root, docs }: { root: string; docs: Record<string, Doc> }) {
  const [q, setQ] = useState("");
  const [fam, setFam] = useState<string | null>(null);
  const list = manifest.filter((c) => (!fam || c.family === fam) && (!q || `${c.name} ${c.summary} ${c.family}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="wide">
      <PageHeader eyebrow="Components" title="All components" lead={<>{manifest.length} components, every one designed and built for Orlo. <strong>Beta</strong> means it works and is tested in code but hasn't yet cleared manual screen-reader and visual review.</>} />
      <Stack gap={3}>
        <div style={{ maxInlineSize: "24rem" }}><SearchField label="Filter components" hideLabel value={q} onValueChange={setQ} placeholder={`Filter ${manifest.length} components`} /></div>
        <div className="cindex__chips" role="group" aria-label="Family">
          <Chip selected={fam === null} onSelectedChange={() => setFam(null)}>All</Chip>
          {families.map((f) => <Chip key={f} selected={fam === f} onSelectedChange={(s) => setFam(s ? f : null)}>{f} <span className="orlo-hint" style={{ display: "inline" }}>{manifest.filter((c) => c.family === f).length}</span></Chip>)}
        </div>
      </Stack>
      <p className="orlo-visually-hidden" aria-live="polite">{list.length} components shown</p>
      {list.length === 0 ? <EmptyState title="No components match" description={`Nothing for “${q}”${fam ? ` in ${fam}` : ""}.`} action={<Button variant="subtle" onClick={() => { setQ(""); setFam(null); }}>Clear filters</Button>} /> :
        (fam ? [fam] : families).map((f) => {
          const items = list.filter((c) => c.family === f);
          if (!items.length) return null;
          return (
            <section key={f}>
              <H2>{f}</H2>
              <div className="cindex">
                {items.map((c) => (
                  <a key={c.slug} href={`${root}components/${c.slug}/`} className="cindex__card">
                    <LazyPreview doc={docs[c.slug]} />
                    <span className="cindex__body"><strong>{c.name}</strong><span className="orlo-hint">{c.summary}</span></span>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}

export function ComponentPage({ slug, doc: d, root, tab }: { slug: string; doc?: Doc; root: string; tab: Tab }) {
  const entry = manifest.find((c) => c.slug === slug);
  if (!entry || !d) return <h1>Not found</h1>;
  const importName = entry.name === "Toast" ? "useToast" : entry.name;
  return (
    <>
      <PageHeader eyebrow={entry.family} title={entry.name} badge={entry.maturity} lead={entry.summary} />
      <div className="ctabs-wrap">
        <nav className="ctabs" aria-label={`${entry.name} documentation`}>
          {TABS.map((t) => <a key={t} href={`${root}components/${slug}/${t === "overview" ? "" : t + "/"}`} aria-current={t === tab ? "page" : undefined}>{tabTitle[t]}</a>)}
        </nav>
        <ProgressiveBlur side="top" size="32px" />
      </div>
      {tab === "overview" && (
        <>
          <Stage label="Live example">{d.demo()}</Stage>
          {d.playground && <><H2>Playground</H2><Playground def={d.playground} /></>}
          <LifecycleContract entry={entry} doc={d} root={root} />
          <H2>Highlights</H2>
          <Bullets items={d.notes} />
          {d.variants?.length ? <><H2>Variants</H2>{d.variants.map((v) => <section key={v.title}><H3>{v.title}</H3>{v.body && <p>{v.body}</p>}<Stage label={v.title}>{v.demo()}</Stage></section>)}</> : null}
          <H2>Usage</H2>
          <Code>{`import { ${importName} } from "@orlo/react";\n\n${d.code}`}</Code>
        </>
      )}
      {tab === "specs" && (
        <>
          <H2>Anatomy</H2>
          {d.anatomy ? <Anatomy parts={d.anatomy}>{(d.anatomyDemo ?? d.demo)()}</Anatomy> : <Stage label="Reference" plain>{d.demo()}</Stage>}
          <H2>Measurements and tokens</H2>
          <p>Values resolve live from the stylesheet. Change density or theme in Preferences and watch them update.</p>
          <SpecTable rows={d.specs ?? controlSpecs} />
          <H2>States</H2>
          <p>Every interactive part has distinct enabled, hover (fine pointers only), focus-visible, pressed and disabled appearances. Focus uses <code>--orlo-color-focus</code> with a 2 px outline offset by 2 px, so it never touches the component's own border.</p>
          <H2>Motion</H2>
          <p>Uses Orlo presets via <code>useOrloMotion()</code>. Under reduced motion, travel and scale collapse to a 150 ms fade; under <em>off</em>, changes are instant.</p>
        </>
      )}
      {tab === "guidelines" && (
        <>
          {d.useWhen && <><H2>When to use</H2><Bullets items={d.useWhen} /></>}
          {d.avoidWhen && <><H2>When not to use</H2><Bullets items={d.avoidWhen} /></>}
          {d.dos && <><H2>Do and don’t</H2><DoDont items={d.dos} /></>}
          <H2>Edge cases handled</H2>
          <Bullets items={d.edge ?? ["Long and translated labels wrap rather than overflow.", "Works in right-to-left layouts via logical properties.", "Stays operable at 200% and 400% zoom."]} />
          {!d.useWhen && !d.dos && <p className="orlo-hint">More guidance for this component is being written.</p>}
        </>
      )}
      {tab === "accessibility" && (
        <>
          <H2>Keyboard</H2>
          {d.keyboard ? <KeyTable rows={d.keyboard} /> : <p>Reachable with Tab; activated with Enter or Space where interactive.</p>}
          <H2>Semantics</H2>
          <Bullets items={d.semantics ?? ["Uses native elements wherever possible; ARIA only where HTML has no equivalent."]} />
          <H2>Motion and preferences</H2>
          <Bullets items={["Respects prefers-reduced-motion by default, and Orlo's motion policy (system, reduced, off, full).", "Readable in forced-colours mode with system colours and visible borders.", "Touch targets are at least 24 × 24 CSS px (WCAG 2.5.8), and 44 px+ in touch density."]} />
          <H2>Verification</H2>
          <p>Automated: {entry.tested.length ? entry.tested.join(", ") : "visual review only so far"}. axe-core runs against the documentation pages in CI. Not yet verified with screen readers by a person; see <a href={`${root}foundations/accessibility/`}>Accessibility</a> for the testing status.</p>
        </>
      )}
      {tab === "code" && (
        <>
          <H2>Import</H2>
          <Code>{`import { ${importName} } from "@orlo/react";\nimport "@orlo/tokens/css";\nimport "@orlo/react/styles.css";`}</Code>
          <H2>Example</H2>
          <Code>{d.code}</Code>
          <H2>API</H2>
          {d.props ? (
            <table className="doc" tabIndex={0}>
              <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
              <tbody>{d.props.map(([n, t, x]) => <tr key={n}><td><code>{n}</code></td><td>{t && <code>{t}</code>}</td><td>{x}</td></tr>)}</tbody>
            </table>
          ) : <p>Accepts the props shown in the example. See the TypeScript types in <code>@orlo/react</code> for the complete signature.</p>}
          <H2>Source</H2>
          <p><a href={`https://github.com/varunkarthic/orlo/tree/main/packages/react/src/components`}>packages/react/src/components</a> on GitHub.</p>
        </>
      )}
      <p className="maturity-note"><Badge tone="accent">{entry.maturity}</Badge> {entry.family} · tested: {entry.tested.join(", ") || "visual"}</p>
    </>
  );
}
