import { useState, type ReactNode } from "react";
import { manifest, Button, Badge, Alert, Card, Spinner, Skeleton, TextField, OrloImage } from "@orlo/react";

const sample = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#C2410C"/><circle cx="200" cy="150" r="80" fill="none" stroke="#F7F5F0" stroke-width="22"/></svg>');

function ButtonDemo() {
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Button>Solid</Button><Button variant="subtle">Subtle</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Delete</Button>
      <Button disabled>Disabled</Button>
      <Button loading={busy} onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 1800); }}>Save changes</Button>
    </>
  );
}
function FieldDemo() {
  const [v, setV] = useState("");
  const bad = v.length > 0 && !v.includes("@");
  return <TextField label="Email" type="email" value={v} onChange={(e) => setV(e.target.value)} help="We only use this to sign you in." error={bad ? "Enter an address like name@example.com." : undefined} />;
}
function AlertDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ inlineSize: "100%" }}>
      <Button variant="subtle" onClick={() => setOpen((o) => !o)}>{open ? "Dismiss" : "Show"} alert</Button>
      <div style={{ marginBlockStart: 12 }}><Alert tone="warning" open={open} title="Connection is slow">Your changes are saved locally and will sync when the network recovers.</Alert></div>
    </div>
  );
}

type Doc = { demo: ReactNode; code: string; notes: string[] };
const docs: Record<string, Doc> = {
  button: { demo: <ButtonDemo />, notes: ["Loading keeps the button's width and focus, announces busy state and ignores repeat activation.", "Hover styling applies only on hover-capable fine pointers.", "Minimum height follows density: 40px comfortable, 48px touch, 32px compact."], code: `<Button loading={saving} onClick={save}>Save changes</Button>\n<Button variant="danger">Delete</Button>` },
  "text-field": { demo: <FieldDemo />, notes: ["The message line is always reserved, so validation does not push the form around.", "Errors are announced (role=alert), prefixed with a glyph and styled with a thicker border, never colour alone."], code: `<TextField label="Email" type="email" error={error} help="…" />` },
  badge: { demo: <><Badge>Neutral</Badge><Badge tone="accent">Accent</Badge><Badge tone="success">Saved</Badge><Badge tone="warning">Stale</Badge><Badge tone="error">Failed</Badge><Badge tone="info">Beta</Badge></>, notes: ["Always pair tone with words."], code: `<Badge tone="success">Saved</Badge>` },
  card: { demo: <Card style={{ maxInlineSize: 320 }}><h3 style={{ marginTop: 0 }}>Surface</h3><p style={{ marginBottom: 0 }}>A container that can answer to its own width, not the viewport's.</p></Card>, notes: ["Declares an inline-size container so children can use container queries."], code: `<Card>…</Card>` },
  alert: { demo: <AlertDemo />, notes: ["Errors and warnings use role=alert; info and success use role=status.", "On dismiss the element unmounts after its exit, so it never lingers in the tab order."], code: `<Alert tone="warning" open={open} title="Connection is slow">…</Alert>` },
  spinner: { demo: <><Spinner /><Spinner size="sm" label="Saving" /></>, notes: ["Always carries an accessible label.", "Slows (not stops) under reduced motion so activity stays visible."], code: `<Spinner label="Saving" />` },
  skeleton: { demo: <div style={{ display: "grid", gap: 8, inlineSize: 240 }}><Skeleton height={20} width="60%" /><Skeleton height={14} /><Skeleton height={14} width="85%" /></div>, notes: ["Give it the geometry of the real content to avoid a shift at hand-off.", "Static, not shimmering, under prefers-reduced-motion."], code: `<Skeleton height={14} width="85%" />` },
  image: { demo: <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))", inlineSize: "100%" }}>
      <OrloImage src={sample} alt="Orange disc" />
      <OrloImage src="./__missing__.png" alt="Harbour at dusk" maxRetries={1} />
      <OrloImage alt="No source supplied" /></div>,
    notes: ["Geometry is reserved before load, the image is decoded before reveal, and a failure becomes a fixed-size placeholder with an explicit retry.", "Retries are bounded; a dead URL cannot hammer a server.", "Header → Images: off renders the designed placeholders and makes no image requests."], code: `<OrloImage src={url} alt="Harbour at dusk" ratio="4 / 3" />\n<OrloProvider images="off">…</OrloProvider>` },
};

export function ComponentsIndex({ root }: { root: string }) {
  return (
    <>
      <h1>Components</h1>
      <p className="lead">This list is the coverage contract. Maturity is earned: <strong>beta</strong> means it exists and works but has not cleared the stable quality gate. Nothing is marked stable yet.</p>
      <table>
        <thead><tr><th>Component</th><th>Family</th><th>Maturity</th><th>Verified</th><th>Summary</th></tr></thead>
        <tbody>
          {manifest.map((c) => (
            <tr key={c.slug}>
              <td><a href={`${root}components/${c.slug}/`}>{c.name}</a></td><td>{c.family}</td>
              <td><Badge tone="warning">{c.maturity}</Badge></td><td>{c.tested.join(", ") || "not yet"}</td><td>{c.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Everything else in the planned inventory (dialogs, menus, tabs, tables, date pickers and more) is <strong>planned</strong> and deliberately not listed as installable.</p>
    </>
  );
}

export function ComponentPage({ slug }: { slug: string; root: string }) {
  const entry = manifest.find((c) => c.slug === slug);
  const doc = docs[slug];
  if (!entry || !doc) return <h1>Not found</h1>;
  return (
    <>
      <h1>{entry.name} <Badge tone="warning">{entry.maturity}</Badge></h1>
      <p className="lead">{entry.summary}</p>
      <h2>Live</h2>
      <div className="demo">{doc.demo}</div>
      <h2>Usage</h2>
      <pre><code>{`import { ${entry.name === "OrloImage" ? "OrloImage" : entry.name} } from "@orlo/react";\n\n${doc.code}`}</code></pre>
      <h2>Behaviour and accessibility</h2>
      <ul>{doc.notes.map((n) => <li key={n}>{n}</li>)}</ul>
      <p><small>Verified so far: {entry.tested.join(", ") || "nothing automated yet"}. Not yet verified: screen readers, visual regression, RTL, 400% zoom.</small></p>
    </>
  );
}
