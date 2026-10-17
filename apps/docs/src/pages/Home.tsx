import { useState } from "react";
import { Wordmark, Button, Card, Switch, SegmentedControl, Slider, Badge, AvatarGroup, Progress, Menu, Icons, AnimatedNumber, OrloImage, Stack, Rating, Chip, Knob, Calendar, Marquee, Sparkline, Steps, manifest, families } from "@orlo/react";
import { sampleImage } from "../registry/shared.tsx";
import { LinkCard } from "../kit.tsx";

export function Home({ root }: { root: string }) {
  const [saving, setSaving] = useState(false);
  const [budget, setBudget] = useState(1800);
  return (
    <div className="home">
      <section className="hero2">
        <div className="hero2__text">
          <Wordmark className="hero2__mark" />
          <h1>Nothing is an afterthought.</h1>
          <p className="lead">A design framework for React that finishes the edges: the press, the frame between two states, the image that never arrives, the focus that has to come back. {manifest.length} components, one motion grammar, all built in.</p>
          <div className="hero2__actions">
            <a className="orlo-button" data-variant="solid" href={`${root}start/`}>Get started</a>
            <a className="orlo-button" data-variant="subtle" href={`${root}components/`}>Browse components</a>
            <a className="orlo-button" data-variant="ghost" href={`${root}foundations/edge-cases/`}>See the details <Icons.ChevronRight size={16} /></a>
          </div>
        </div>
        <div className="hero2__collage" aria-label="Live components">
          <Card className="hc hc--a"><Stack direction="row" gap={2}><Button loading={saving} loadingLabel="Saving" onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 1400); }}>Save</Button><Menu trigger={<Button variant="subtle">More <Icons.ChevronDown size={16} /></Button>} items={[{ label: "Duplicate" }, { label: "Share…" }, { type: "separator" }, { label: "Delete", tone: "danger" }]} /></Stack></Card>
          <Card className="hc hc--b"><Switch label="Notifications" defaultChecked /><SegmentedControl label="Layout" size="sm" options={[{ value: "l", label: "List" }, { value: "g", label: "Grid" }, { value: "b", label: "Board" }]} /></Card>
          <Card className="hc hc--c"><span className="orlo-hint">Budget</span><span className="hc__num"><AnimatedNumber value={budget} format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} /></span><Slider label="Monthly" value={budget} onValueChange={setBudget} min={0} max={5000} step={50} format={(v) => new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v)} /></Card>
          <Card className="hc hc--d"><Calendar /></Card>
          <Card className="hc hc--e"><Stack direction="row" gap={3} align="center"><Knob label="Gain" defaultValue={64} size={60} format={(v) => `${v}%`} /><Stack gap={2}><Rating label="Rate" defaultValue={4} /><Stack direction="row" gap={2} wrap><Chip defaultSelected>Spring</Chip><Chip>Fade</Chip></Stack></Stack></Stack></Card>
          <Card className="hc hc--f"><Stack direction="row" gap={2}><OrloImage src={sampleImage} alt="Hills at sunset" ratio="1 / 1" /><OrloImage src="./__missing__.png" alt="Missing photo" ratio="1 / 1" maxRetries={0} /></Stack></Card>
        </div>
      </section>

      <Marquee label="What Orlo handles">{["Focus return", "Bounded retry", "Spring physics", "No-image mode", "RTL", "Reduced motion", "Forced colours", "Safe areas", "IME input", "Locale numbers", "Daylight saving", "Scroll lock", "Inert backgrounds", "Edge flipping"].map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}</Marquee>

      <section className="home__section">
        <h2>Start anywhere</h2>
        <div className="card-grid card-grid--3">
          <LinkCard href={`${root}start/`} title="Get started" body="Install, wrap your app, ship your first screen." art={<Steps steps={[{ label: "Install", state: "complete" }, { label: "Wrap", state: "current" }, { label: "Ship" }]} />} />
          <LinkCard href={`${root}styles/`} title="Styles" body="Colour, type, shape, elevation, motion and icons." art={<div className="swatchrow">{["#1C1B18", "#5C574C", "#A39D90", "#E2DDD2", "#A8370A", "#F08A57"].map((c) => <span key={c} style={{ background: c }} />)}</div>} />
          <LinkCard href={`${root}components/`} title="Components" body={`${manifest.length} components across ${families.length} families, from buttons to signature pads.`} art={<Stack direction="row" gap={2}><Badge tone="success">Paid</Badge><Badge tone="warning">Due</Badge><Progress label="Sync" value={64} showValue={false} /></Stack>} />
          <LinkCard href={`${root}foundations/`} title="Foundations" body="Principles, accessibility, adaptive layout and layering." art={<AvatarGroup people={[{ name: "Ada Lovelace" }, { name: "Grace Hopper" }, { name: "Alan Turing" }, { name: "Barbara Liskov" }]} max={3} />} />
          <LinkCard href={`${root}styles/motion/`} title="MotionLab" body="Tune a spring and read overshoot and settle time before committing." art={<Sparkline label="Spring" data={[0, 0.5, 0.92, 1.03, 1.01, 1, 1]} width={160} height={40} />} />
          <LinkCard href={`${root}start/theme-studio/`} title="Theme Studio" body="One brand colour in, an accessible light and dark theme out." art={<div className="swatchrow">{["#1F5FA8", "#8DB8EB", "#D9E3F0", "#1F7A4D", "#6CCB9A", "#DDE7D6"].map((c) => <span key={c} style={{ background: c }} />)}</div>} />
        </div>
      </section>

      <section className="home__section home__split">
        <div>
          <p className="eyebrow">Motion</p>
          <h2>One spring grammar, not a hundred tweens</h2>
          <p>Components ask for a purpose (<code>press</code>, <code>reveal</code>, <code>overlay</code>, <code>shared</code>) and Orlo supplies the physics. Every preset is checked analytically: under 5% overshoot and settled within 700 ms, enforced by a test. Interrupt anything mid-flight and it redirects from its current velocity.</p>
          <a href={`${root}styles/motion/`}>Open the MotionLab →</a>
        </div>
        <div>
          <p className="eyebrow">Edge cases</p>
          <h2>The parts nobody screenshots</h2>
          <p>Half-clipped text under a growing card. Focus thrown to a removed trigger. A spinner that flashes for 40 ms. A dead image beside a broken icon. Orlo designs these on purpose, and the Details Lab shows each one flawed beside fixed.</p>
          <a href={`${root}foundations/edge-cases/`}>Open the Details Lab →</a>
        </div>
      </section>

      <section className="home__section">
        <h2>Built in, not bolted on</h2>
        <p className="lead" style={{ maxInlineSize: "52rem" }}>Positioning, focus scopes, scroll locking, the layer stack, the icon set, the theme generator and every component are written for Orlo. The only runtime dependencies are React and the Motion animation engine.</p>
        <div className="stats">
          <div><strong>{manifest.length}</strong><span>components</span></div>
          <div><strong>{families.length}</strong><span>families</span></div>
          <div><strong>15</strong><span>motion presets</span></div>
          <div><strong>4</strong><span>motion policies</span></div>
          <div><strong>2</strong><span>runtime dependencies</span></div>
        </div>
      </section>
    </div>
  );
}
