import { Badge, BuiltWithOrlo, CopyButton, Icons, manifest, families } from "@orlo/react";

const paths = [
  { number: "01", label: "Start", title: "Set the foundation", body: "Explore the provider, theme tokens, and your first screen. Zero configuration required.", href: "start/", icon: Icons.Compass },
  { number: "02", label: "Explore", title: "Find a component", body: `Browse all ${manifest.length} components across ${families.length} families with live interactive specs, keyboard behaviors, and code.`, href: "components/", icon: Icons.Grid },
  { number: "03", label: "Understand", title: "Design beyond rest", body: "Read the lifecycle, accessibility, and failure guidance that makes complex multi-component flows seamless.", href: "foundations/lifecycle/", icon: Icons.Lightbulb },
  { number: "04", label: "Tune", title: "Make it your own", body: "Shape a theme and harmonic motion language with named semantic tokens instead of scattered hardcoded values.", href: "styles/", icon: Icons.Brush },
] as const;

const familyDescriptions: Record<string, { title: string; count: number; desc: string; icon: any; link: string }> = {
  Actions: { title: "Actions", count: 7, desc: "Buttons, async loaders, segmented pill controls, and copy triggers.", icon: Icons.Sparkles, link: "components/button/" },
  Forms: { title: "Forms & Inputs", count: 22, desc: "Text fields, comboboxes, sliders, date pickers, pin inputs, and switches.", icon: Icons.Sliders, link: "components/text-field/" },
  Navigation: { title: "Navigation", count: 11, desc: "Pill tabs, breadcrumbs, pagination, spotlight command palette, and steppers.", icon: Icons.Route, link: "components/tabs/" },
  Overlays: { title: "Overlays & Modals", count: 8, desc: "Dialogs, sliding sheets, popovers, tooltips, and non-blocking toast stacks.", icon: Icons.Layers, link: "components/dialog/" },
  Feedback: { title: "Feedback & Status", count: 12, desc: "Callouts, alerts, progress bars, spinners, skeletons, and status dots.", icon: Icons.AlertCircle, link: "components/alert/" },
  Data: { title: "Data Display", count: 18, desc: "Data tables, avatar rings, timelines, tree views, and metric stat cards.", icon: Icons.Table, link: "components/table/" },
  Layout: { title: "Layout & Hierarchy", count: 14, desc: "Surface dividers, aspect ratio guards, splitters, and responsive stacks.", icon: Icons.Layout, link: "components/card/" },
  Typography: { title: "Typography & Primitives", count: 35, desc: "Keyboard badges, code blocks, animated numbers, and text highlighters.", icon: Icons.Type, link: "components/kbd/" },
};

export function Home({ root }: { root: string }) {
  return (
    <div className="home">
      {/* ---------- Apple HIG Display Hero ---------- */}
      <section className="hero2" aria-labelledby="home-title">
        <div className="hero2__text">
          <p className="hero2__eyebrow">
            <span className="hero2__eyebrow-badge">
              <Icons.Sparkles size={14} animation="pulse" aria-hidden="true" />
              <span>NOTHING IS AN AFTERTHOUGHT</span>
            </span>
          </p>
          <h1 id="home-title">Design the parts between the moments.</h1>
          <p className="hero2__lead">
            <strong>Nothing is an afterthought.</strong> Orlo gives React interfaces an uncompromising visual and behavioral grammar: from tactile physical springs and translucent materials to interrupted transitions and deterministic accessibility.
          </p>
          <div className="hero2__actions">
            <a className="orlo-button" data-variant="accent" href={`${root}start/`}>
              <Icons.Compass size={17} aria-hidden="true" />
              <span>Start with Orlo</span>
              <Icons.ChevronRight size={15} aria-hidden="true" />
            </a>
            <a className="orlo-button" data-variant="subtle" href={`${root}components/`}>
              <Icons.Grid size={17} aria-hidden="true" />
              <span>Explore {manifest.length} components</span>
            </a>
            <a className="orlo-button" data-variant="ghost" href="https://github.com/varunkarthic/orlo" target="_blank" rel="noreferrer">
              <Icons.Code size={17} aria-hidden="true" />
              <span>GitHub</span>
            </a>
          </div>
          <p className="hero2__note">
            Designed by Varun Karthic <span aria-hidden="true">·</span> 100% in-house zero-dependency architecture <span aria-hidden="true">·</span> Open source
          </p>
        </div>

        {/* Quickstart Terminal & Architecture Matrix */}
        <div className="hero2__terminal" aria-label="Terminal quickstart">
          <div className="terminal__head">
            <div className="terminal__dots" aria-hidden="true">
              <span className="terminal__dot terminal__dot--close" />
              <span className="terminal__dot terminal__dot--min" />
              <span className="terminal__dot terminal__dot--max" />
            </div>
            <div className="terminal__title">bash: quickstart</div>
            <Badge tone="success" dot>Ready</Badge>
          </div>
          <div className="terminal__body">
            <div className="terminal__prompt">
              <span className="terminal__ps1">$</span>
              <code className="terminal__cmd">npm install @orlo/react @orlo/motion @orlo/tokens</code>
              <CopyButton text="npm install @orlo/react @orlo/motion @orlo/tokens" label="Copy" />
            </div>
            <div className="terminal__code">
              <div className="terminal__code-line"><span className="t-kw">import</span> {"{ OrloProvider, Button, Sheet, useOrloMotion }"} <span className="t-kw">from</span> <span className="t-str">&quot;@orlo/react&quot;</span>;</div>
              <div className="terminal__code-line"><span className="t-kw">import</span> <span className="t-str">&quot;@orlo/tokens/css&quot;</span>;</div>
              <div className="terminal__code-line"><span className="t-kw">import</span> <span className="t-str">&quot;@orlo/react/styles.css&quot;</span>;</div>
            </div>
            <div className="terminal__meta">
              <div className="terminal__pill"><Icons.Package size={14} className="terminal__pill-icon" aria-hidden="true" /><span>127 In-House Components</span></div>
              <div className="terminal__pill"><Icons.Zap size={14} className="terminal__pill-icon" aria-hidden="true" /><span>7 Tuned Spring Presets</span></div>
              <div className="terminal__pill"><Icons.ShieldCheck size={14} className="terminal__pill-icon" aria-hidden="true" /><span>WCAG AAA Contrast</span></div>
              <div className="terminal__pill"><Icons.Cpu size={14} className="terminal__pill-icon" aria-hidden="true" /><span>Zero Headless Bloat</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Metrics / System Proof Counters ---------- */}
      <div className="home__proof" aria-label="Framework at a glance">
        <div><strong>{manifest.length}</strong><span>documented components</span></div>
        <div><strong>{families.length}</strong><span>component families</span></div>
        <div><strong>7</strong><span>harmonic spring presets</span></div>
        <div><strong>100%</strong><span>in-house zero-dependency</span></div>
      </div>

      {/* ---------- Apple HIG Core Philosophy Pillars ---------- */}
      <section className="home__section home__pillars" aria-labelledby="home-pillars-title">
        <div className="home__section-head">
          <div>
            <p className="home__kicker">DESIGN FOUNDATIONS</p>
            <h2 id="home-pillars-title">The three principles of Orlo.</h2>
          </div>
          <p>Rooted in Apple Human Interface Guidelines and Google Material 3 expressive physics.</p>
        </div>
        <div className="home__pillars-grid">
          <div className="home__pillar">
            <div className="home__pillar-icon" aria-hidden="true"><Icons.Ruler size={28} /></div>
            <h3>Clarity &amp; Spatial Deference</h3>
            <p>Every token, margin, and tap target derives from strict 8pt rhythm and WCAG AAA contrast ratios. Visual chrome defers to user content, ensuring effortless legibility in any lighting.</p>
            <a href={`${root}foundations/principles/`} className="home__pillar-link">Read principles <Icons.ArrowRight size={14} aria-hidden="true" /></a>
          </div>
          <div className="home__pillar">
            <div className="home__pillar-icon" aria-hidden="true"><Icons.Activity size={28} animation="pulse" /></div>
            <h3>Harmonic Physical Motion</h3>
            <p>Motion carries meaning, never decoration. Underpinned by damped harmonic oscillators that preserve physical momentum across user gestures, sheet drags, and sudden interrupts.</p>
            <a href={`${root}styles/motion/`} className="home__pillar-link">Explore motion <Icons.ArrowRight size={14} aria-hidden="true" /></a>
          </div>
          <div className="home__pillar">
            <div className="home__pillar-icon" aria-hidden="true"><Icons.Droplet size={28} /></div>
            <h3>Translucent Materials &amp; Depth</h3>
            <p>Adaptive acrylic blur and vibrancy ground layered surfaces without muddy shadows. Gracefully falls back to high-contrast opaque materials when reduced transparency is requested.</p>
            <a href={`${root}styles/materials/`} className="home__pillar-link">View materials <Icons.ArrowRight size={14} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      {/* ---------- 8 Component Families Grid ---------- */}
      <section className="home__section home__families" aria-labelledby="home-families-title">
        <div className="home__section-head">
          <div>
            <p className="home__kicker">CATALOGUE</p>
            <h2 id="home-families-title">Eight cohesive families.</h2>
          </div>
          <p>Everything your interface needs, sharing one calm grammar and matching touch-target ergonomics.</p>
        </div>
        <div className="home__families-grid">
          {families.map((fam) => {
            const meta = familyDescriptions[fam] ?? { title: fam, count: manifest.filter((c) => c.family === fam).length, desc: "Production-ready components.", icon: Icons.Grid, link: "components/" };
            const IconComp = meta.icon;
            const count = manifest.filter((c) => c.family === fam).length;
            return (
              <a key={fam} className="home__family-card" href={`${root}${meta.link}`}>
                <div className="home__family-head">
                  <span className="home__family-icon" aria-hidden="true"><IconComp size={22} /></span>
                  <span className="home__family-count">{count} components</span>
                </div>
                <div className="home__family-main">
                  <strong>{meta.title}</strong>
                  <p>{meta.desc}</p>
                </div>
                <span className="home__family-arrow" aria-hidden="true"><Icons.ArrowRight size={16} /></span>
              </a>
            );
          })}
        </div>
      </section>

      {/* ---------- Guided Pathways ---------- */}
      <section className="home__section home__paths" aria-labelledby="home-paths-title">
        <div className="home__section-head">
          <div>
            <p className="home__kicker">A PLACE TO BEGIN</p>
            <h2 id="home-paths-title">Find your way into Orlo.</h2>
          </div>
          <p>Start from the task in front of you. Each page connects design decisions directly to behavior and code.</p>
        </div>
        <div className="home__path-grid">
          {paths.map((path) => (
            <a key={path.number} className="home__path" href={`${root}${path.href}`}>
              <span className="home__path-top">
                <span>{path.number} / {path.label}</span>
                <path.icon size={22} aria-hidden="true" />
              </span>
              <span className="home__path-main">
                <strong>{path.title}</strong>
                <span>{path.body}</span>
              </span>
              <span className="home__path-arrow" aria-hidden="true"><Icons.ArrowRight size={18} /></span>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- Lifecycle Architecture ---------- */}
      <section className="home__section home__principle" aria-labelledby="home-principle-title">
        <div className="home__principle-copy">
          <p className="home__kicker">THE FRAMEWORK</p>
          <h2 id="home-principle-title">A component is more than its resting state.</h2>
          <p>
            Orlo documents the whole interaction: how an element enters, responds, hands off focus, handles interruption, fails and recovers, alone and alongside other components.
          </p>
          <a href={`${root}foundations/lifecycle/`}>Explore lifecycle &amp; composition <Icons.ArrowRight size={17} aria-hidden="true" /></a>
        </div>
        <div className="home__lifecycle" aria-label="Component lifecycle">
          <div><span>01</span><strong>Enter</strong><small>Placement · reveal</small></div>
          <div><span>02</span><strong>Respond</strong><small>Input · feedback</small></div>
          <div><span>03</span><strong>Interrupt</strong><small>Redirect · preserve</small></div>
          <div><span>04</span><strong>Recover</strong><small>Failure · focus</small></div>
        </div>
      </section>

      {/* ---------- Closing Banner ---------- */}
      <section className="home__section home__closing" aria-labelledby="home-closing-title">
        <div>
          <p className="home__kicker">MAKE SOMETHING THOUGHTFUL</p>
          <h2 id="home-closing-title">Nothing is an afterthought.</h2>
          <p>Build with Orlo, inspect the edge cases, and make the system feel like your own.</p>
          <div className="home__closing-actions">
            <a className="orlo-button" data-variant="accent" href={`${root}start/`}>Read the getting-started guide</a>
            <a href={`${root}brand/badges/`}>Get an embed badge <Icons.ArrowRight size={17} aria-hidden="true" /></a>
          </div>
        </div>
        <BuiltWithOrlo layout="signature" tone="light" href={`${root}brand/badges/`} />
      </section>
    </div>
  );
}
