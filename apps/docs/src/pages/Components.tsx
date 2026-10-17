import { manifest, families, Badge } from "@orlo/react";
import { docs } from "../registry.tsx";
import { Code } from "./Installation.tsx";

const tone = (m: string) => (m === "stable" ? "success" : m === "beta" ? "accent" : "neutral") as "success" | "accent" | "neutral";

export function ComponentsIndex({ root }: { root: string }) {
  return (
    <div className="wide">
      <p className="eyebrow">Components</p>
      <h1>All components</h1>
      <p className="lead">{manifest.length} components, all built in. <strong>Beta</strong> means it works and is tested in code, but has not yet cleared manual screen-reader and visual review. Nothing is marked stable until it has.</p>
      {families.map((f) => (
        <section key={f}>
          <h2>{f}</h2>
          <div className="family-grid">
            {manifest.filter((c) => c.family === f).map((c) => (
              <a key={c.slug} href={`${root}components/${c.slug}/`}>
                <strong>{c.name} <Badge tone={tone(c.maturity)}>{c.maturity}</Badge></strong>
                <span className="orlo-hint">{c.summary}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ComponentPage({ slug }: { slug: string; root: string }) {
  const entry = manifest.find((c) => c.slug === slug);
  const doc = docs[slug];
  if (!entry || !doc) return <h1>Not found</h1>;
  const importName = entry.name === "Toast" ? "useToast" : entry.name;
  return (
    <>
      <p className="eyebrow">{entry.family}</p>
      <h1>{entry.name} <Badge tone={tone(entry.maturity)}>{entry.maturity}</Badge></h1>
      <p className="lead">{entry.summary}</p>
      <div className="demo" aria-label={`${entry.name} example`}>{doc.demo()}</div>
      <h2>Usage</h2>
      <Code>{`import { ${importName} } from "@orlo/react";\n\n${doc.code}`}</Code>
      {doc.props && (
        <>
          <h2>Props</h2>
          <table className="doc" tabIndex={0}>
            <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
            <tbody>{doc.props.map(([n, t, d]) => <tr key={n}><td><code>{n}</code></td><td>{t && <code>{t}</code>}</td><td>{d}</td></tr>)}</tbody>
          </table>
        </>
      )}
      <h2>Behaviour and accessibility</h2>
      <ul className="notes">{doc.notes.map((n) => <li key={n}>{n}</li>)}</ul>
      <p className="orlo-hint">Verified: {entry.tested.length ? entry.tested.join(", ") : "visual only so far"}. Not yet verified: manual screen-reader passes, visual regression.</p>
    </>
  );
}
