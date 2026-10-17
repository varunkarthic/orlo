import { useState } from "react";
import { Wordmark, Button, Card, Switch, SegmentedControl, Slider, Badge, AvatarGroup, Progress, Tooltip, Menu, Icons, AnimatedNumber, OrloImage, Stack, manifest } from "@orlo/react";
import { sampleImage } from "../registry.tsx";

const principles = [
  ["Every transition has a reason", "Motion explains cause, hierarchy or continuity, or it does not happen."],
  ["Nothing is half-finished", "Entry, midpoint, exit, interruption and failure are all designed."],
  ["Content stays in control", "No effect is worth a clipped word or a lost focus ring."],
  ["Quiet by default", "Restrained transitions are the baseline. Expressive motion is rare and opt-in."],
  ["Every input is first-class", "Touch, pointer, pen, keyboard and screen reader, without assuming hover."],
  ["Accessible is beautiful", "Reduced motion, contrast, labels and focus are part of the design."],
];

export function Home({ root }: { root: string }) {
  const [saving, setSaving] = useState(false);
  const [count, setCount] = useState(1284);
  return (
    <div className="wide">
      <section className="hero">
        <Wordmark height={56} />
        <h1>Nothing is an afterthought.</h1>
        <p className="lead">
          Orlo is a design framework for React. It designs the moments most interfaces leave to chance: the press, the frame between
          two states, the image that never arrives, the focus that has to come back.
        </p>
        <div className="hero__actions">
          <a className="orlo-button" data-variant="solid" href={`${root}start/installation/`}>Get started</a>
          <a className="orlo-button" data-variant="subtle" href={`${root}components/`}>Browse {manifest.length} components</a>
          <a className="orlo-button" data-variant="ghost" href={`${root}labs/details/`}>See the details <Icons.ChevronRight size={16} /></a>
        </div>
      </section>

      <div className="showcase" aria-label="Live examples">
        <Card>
          <h3>Press, load, confirm</h3>
          <Stack direction="row" gap={2} wrap>
            <Button loading={saving} loadingLabel="Saving" onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 1400); }}>Save</Button>
            <Menu trigger={<Button variant="subtle">Options <Icons.ChevronDown size={16} /></Button>} items={[{ label: "Duplicate" }, { label: "Share…" }, { type: "separator" }, { label: "Delete", tone: "danger" }]} />
          </Stack>
        </Card>
        <Card>
          <h3>Settings that answer immediately</h3>
          <Switch label="Notifications" defaultChecked />
          <SegmentedControl label="Layout" options={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }]} />
        </Card>
        <Card>
          <h3>Numbers that stay honest</h3>
          <span style={{ fontSize: "1.75rem", fontWeight: 650 }}><AnimatedNumber value={count} format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} /></span>
          <Slider label="Budget" value={count} min={0} max={5000} step={50} onValueChange={setCount} format={(v) => new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v)} />
        </Card>
        <Card>
          <h3>Images that fail gracefully</h3>
          <Stack direction="row" gap={2}>
            <OrloImage src={sampleImage} alt="Hills at sunset" ratio="1 / 1" />
            <OrloImage src="./__missing__.png" alt="Missing photo" ratio="1 / 1" maxRetries={0} />
          </Stack>
        </Card>
        <Card>
          <h3>People and progress</h3>
          <AvatarGroup people={[{ name: "Ada Lovelace" }, { name: "Grace Hopper" }, { name: "Alan Turing" }, { name: "Barbara Liskov" }, { name: "Edsger Dijkstra" }]} max={4} />
          <Progress label="Syncing" value={64} />
        </Card>
        <Card>
          <h3>Status, never colour alone</h3>
          <Stack direction="row" gap={2} wrap>
            <Badge tone="success">Paid</Badge><Badge tone="warning">Due soon</Badge><Badge tone="error">Overdue</Badge>
            <Tooltip content="Focus with Tab to see this too"><Badge tone="info">Hover me</Badge></Tooltip>
          </Stack>
        </Card>
      </div>

      <h2>The name</h2>
      <p>
        <em>Orlo</em> (pronounced <strong>OR-loh</strong>) is Italian for an edge, rim or hem. A hem is the finish that holds the whole garment
        together, though nobody looks at it first. The mark is an O whose rim is deliberately left open.
      </p>

      <h2>Principles</h2>
      <div className="principles">
        {principles.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}
      </div>

      <h2>Built in, not bolted on</h2>
      <p>
        Every component, positioning engine, focus scope, scroll lock, layer stack, icon and token in Orlo is written for Orlo.
        Its only runtime dependencies are React and the <a href="https://motion.dev/docs/react">Motion</a> animation engine.
        Try the header: theme, motion, images, density and direction all change live, on every page.
      </p>
    </div>
  );
}
