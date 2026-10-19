import { useEffect, useRef, useState } from "react";
import { Badge, Button, BuiltWithOrlo, Icons, SegmentedControl, Slider, Switch, manifest, families } from "@orlo/react";

const paths = [
  { number: "01", label: "Start", title: "Set the foundation", body: "See the provider, tokens and first screen. Packages are currently pre-release and not on npm.", href: "start/", icon: Icons.Compass },
  { number: "02", label: "Explore", title: "Find a component", body: "Browse the complete inventory, then open live examples, specs, keyboard behavior and code.", href: "components/", icon: Icons.Grid },
  { number: "03", label: "Understand", title: "Design beyond rest", body: "Read the lifecycle, accessibility and failure guidance that makes components work together.", href: "foundations/lifecycle/", icon: Icons.Layers },
  { number: "04", label: "Tune", title: "Make it your own", body: "Shape a theme and motion language with named roles instead of scattered constants.", href: "styles/", icon: Icons.Palette },
] as const;

export function Home({ root }: { root: string }) {
  const [saving, setSaving] = useState(false);
  const [budget, setBudget] = useState(1800);
  const [notifications, setNotifications] = useState(true);
  const [digest, setDigest] = useState(false);
  const [layout, setLayout] = useState("l");
  const [message, setMessage] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(saveTimer.current), []);
  const reset = () => {
    clearTimeout(saveTimer.current);
    setSaving(false);
    setNotifications(true);
    setDigest(false);
    setBudget(1800);
    setLayout("l");
    setMessage("Preview changes reset.");
  };
  const save = () => {
    setMessage("");
    setSaving(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { setSaving(false); setMessage("Preview settings saved in this page."); }, 650);
  };
  return (
    <div className="home">
      <section className="hero2" aria-labelledby="home-title">
        <div className="hero2__text">
          <p className="hero2__eyebrow"><span className="hero2__eyebrow-mark" aria-hidden="true">◌</span> OPEN-SOURCE DESIGN FRAMEWORK FOR REACT</p>
          <h1 id="home-title">Design the parts between the moments.</h1>
          <p className="hero2__lead">Orlo gives React interfaces a complete visual and behavioral grammar—from the first press to the interrupted transition, empty state and focus return.</p>
          <div className="hero2__actions"><a className="orlo-button" data-variant="accent" href={`${root}start/`}>Start with Orlo <Icons.ChevronRight size={16} aria-hidden="true" /></a><a className="orlo-button" data-variant="subtle" href={`${root}components/`}>Explore components</a></div>
          <p className="hero2__note">Designed by Varun Karthic <span aria-hidden="true">·</span> Pre-release, not yet on npm</p>
        </div>
        <div className="hero2__scene">
          <div className="hero2__scene-head"><span>INTERACTIVE PREVIEW</span><span>01 / 04</span></div>
          <div className="showcase orlo-material" aria-label="Live example: workspace preferences">
            <header className="showcase__head"><div><span className="showcase__overline">Workspace / Preferences</span><strong>Make it yours.</strong></div><Badge tone="success" dot>Live</Badge></header>
            <div className="showcase__body">
              <Switch label="Notifications" description="Mentions and replies only." checked={notifications} onCheckedChange={(value) => { setNotifications(value); setMessage(""); }} />
              <Switch label="Weekly digest" checked={digest} onCheckedChange={(value) => { setDigest(value); setMessage(""); }} />
              <Slider label="Monthly budget" value={budget} onValueChange={(value) => { setBudget(value); setMessage(""); }} min={0} max={5000} step={50} format={(v) => new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v)} />
              <SegmentedControl label="Layout" value={layout} onValueChange={(value) => { setLayout(value); setMessage(""); }} options={[{ value: "l", label: "List" }, { value: "g", label: "Grid" }, { value: "b", label: "Board" }]} />
            </div>
            <footer className="showcase__foot"><span className="showcase__message" role="status">{message}</span><Button variant="ghost" onClick={reset}>Reset</Button><Button variant="accent" loading={saving} loadingLabel="Saving" onClick={save}>Save changes</Button></footer>
          </div>
          <div className="hero2__scene-foot"><span>Real components. Real states.</span><span>Try the controls ↑</span></div>
        </div>
      </section>

      <div className="home__proof" aria-label="Framework at a glance"><div><strong>{manifest.length}</strong><span>documented components</span></div><div><strong>{families.length}</strong><span>component families</span></div><div><strong>1</strong><span>shared motion grammar</span></div><div><strong>0</strong><span>required badges</span></div></div>

      <section className="home__section home__paths" aria-labelledby="home-paths-title">
        <div className="home__section-head"><div><p className="home__kicker">A PLACE TO BEGIN</p><h2 id="home-paths-title">Find your way into Orlo.</h2></div><p>Start from the task in front of you. Each page connects the design decision to its behavior and implementation.</p></div>
        <div className="home__path-grid">{paths.map((path) => <a key={path.number} className="home__path" href={`${root}${path.href}`}><span className="home__path-top"><span>{path.number} / {path.label}</span><path.icon size={22} aria-hidden="true" /></span><span className="home__path-main"><strong>{path.title}</strong><span>{path.body}</span></span><span className="home__path-arrow" aria-hidden="true"><Icons.ArrowRight size={18} /></span></a>)}</div>
      </section>

      <section className="home__section home__principle" aria-labelledby="home-principle-title"><div className="home__principle-copy"><p className="home__kicker">THE FRAMEWORK</p><h2 id="home-principle-title">A component is more than its resting state.</h2><p>Orlo documents the whole interaction: how an element enters, responds, hands off focus, handles interruption, fails and recovers—alone and alongside other components.</p><a href={`${root}foundations/lifecycle/`}>Explore lifecycle & composition <Icons.ArrowRight size={17} aria-hidden="true" /></a></div><div className="home__lifecycle" aria-label="Component lifecycle"><div><span>01</span><strong>Enter</strong><small>Placement · reveal</small></div><div><span>02</span><strong>Respond</strong><small>Input · feedback</small></div><div><span>03</span><strong>Interrupt</strong><small>Redirect · preserve</small></div><div><span>04</span><strong>Recover</strong><small>Failure · focus</small></div></div></section>

      <section className="home__section home__closing" aria-labelledby="home-closing-title"><div><p className="home__kicker">MAKE SOMETHING THOUGHTFUL</p><h2 id="home-closing-title">The details are the design.</h2><p>Build with Orlo, inspect the edge cases, and make the system feel like your own.</p><div className="home__closing-actions"><a className="orlo-button" data-variant="accent" href={`${root}start/`}>Read the getting-started guide</a><a href={`${root}brand/badges/`}>Get an embed badge <Icons.ArrowRight size={17} aria-hidden="true" /></a></div></div><BuiltWithOrlo layout="signature" tone="light" href={`${root}brand/badges/`} /></section>
    </div>
  );
}
