import { useMemo, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "motion/react";
import { Button, Slider, SegmentedControl, Stack, Badge, Card } from "@orlo/react";
import { springs, springMetrics, simulate, spring, purposes, useOrloMotion, OVERSHOOT_CEILING, EXPRESSIVE_CEILING, projectSnap, createVelocityTracker, type Scheme } from "@orlo/motion";
import { Code, H2, PageHeader } from "../kit.tsx";

function Curve({ sp, w = 180, h = 64, velocity = 0, ms = 900 }: { sp: { stiffness: number; damping: number; mass: number }; w?: number; h?: number; velocity?: number; ms?: number }) {
  const pts = simulate(sp, { velocity, ms });
  const max = Math.max(1.15, ...pts.map((p) => p[1]));
  const d = pts.filter((_, i) => i % 3 === 0).map(([t, x], i) => `${i ? "L" : "M"}${((t / ms) * w).toFixed(1)},${(h - 4 - (x / max) * (h - 8)).toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="curve" role="img" aria-label="Spring step response">
      <line x1="0" x2={w} y1={h - 4 - (1 / max) * (h - 8)} y2={h - 4 - (1 / max) * (h - 8)} className="curve__target" />
      <path d={d} className="curve__line" />
    </svg>
  );
}

function TokenGrid({ scheme }: { scheme: Scheme }) {
  const [run, setRun] = useState(0);
  return (
    <>
      <div className="token-grid">
        {(["spatial", "effects"] as const).flatMap((fam) => (["fast", "default", "slow"] as const).map((speed) => {
          const sp = springs[scheme][fam][speed]; const m = springMetrics(sp);
          return (
            <Card key={fam + speed} className="token">
              <div className="token__head"><code>{fam}.{speed}</code><span className="orlo-hint">k {sp.stiffness} · c {sp.damping}</span></div>
              <Curve sp={sp} />
              <div className="token__track"><motion.span key={run} className="token__dot" initial={{ x: 0 }} animate={{ x: run ? 140 : 0 }} transition={sp} /></div>
              <div className="token__meta"><span>ζ {m.zeta.toFixed(2)}</span><span>{(m.overshoot * 100).toFixed(1)}% overshoot</span><span>{Math.round(m.settleMs)} ms</span></div>
            </Card>
          );
        }))}
      </div>
      <Button variant="subtle" onClick={() => setRun((r) => r + 1)}>Race all six</Button>
    </>
  );
}

function Fling() {
  const x = useMotionValue(0);
  const tracker = useRef(createVelocityTracker());
  const [info, setInfo] = useState<{ v: number; target: number; from: number } | null>(null);
  const { transition, effective } = useOrloMotion();
  const W = 520, snaps = [0, 130, 260, 390, 520 - 56];
  return (
    <Stack gap={3}>
      <div className="fling" style={{ inlineSize: W }}>
        {snaps.map((s) => <span key={s} className="fling__snap" style={{ insetInlineStart: s + 28 }} />)}
        <motion.div className="fling__puck" style={{ x }} drag="x" dragConstraints={{ left: 0, right: W - 56 }} dragElastic={0.18} dragMomentum={false}
          onDragStart={() => tracker.current.reset()} onDrag={() => tracker.current.add(x.get())}
          onDragEnd={() => {
            const v = tracker.current.velocity();
            const target = projectSnap(x.get(), v, snaps);
            setInfo({ v, target, from: x.get() });
            animate(x, target, effective === "full" ? { ...(transition("drag", v) as object) } : (transition("drag") as object));
          }} aria-label="Fling the puck" role="img" />
      </div>
      <p aria-live="polite" style={{ margin: 0 }}>{info ? <>Released at <strong>{Math.round(info.v)} px/s</strong>, projected to snap <strong>{snaps.indexOf(info.target) + 1}</strong>, settled with the <code>drag</code> spring carrying that velocity.</> : "Drag and release the puck quickly or slowly: momentum decides where it lands."}</p>
      {info && Math.abs(info.target - info.from) > 1 && <Curve sp={spring("drag")} w={360} h={70} velocity={Math.max(-12, Math.min(12, info.v / (info.target - info.from)))} />}
    </Stack>
  );
}

export function MotionLab() {
  const [scheme, setScheme] = useState<Scheme>("standard");
  const [k, setK] = useState(springs.standard.spatial.default.stiffness);
  const [c, setC] = useState(springs.standard.spatial.default.damping);
  const [m, setM] = useState(1);
  const [v0, setV0] = useState(0);
  const [end, setEnd] = useState(false);
  const { effective, distance } = useOrloMotion();
  const metrics = springMetrics({ stiffness: k, damping: c, mass: m });
  const purposeRows = useMemo(() => Object.entries(purposes), []);
  const ceiling = scheme === "expressive" ? EXPRESSIVE_CEILING : OVERSHOOT_CEILING;
  return (
    <div className="wide">
      <PageHeader eyebrow="Styles" title="Motion" lead={<>One spring grammar: <code>m·x″ + c·x′ + k·(x − target) = 0</code>. Components ask for a purpose; Orlo picks a spring from two families and three speeds, and carries gesture velocity into the settle.</>} />
      <H2>Spring tokens</H2>
      <p><strong>Spatial</strong> springs move position, size and shape and may overshoot a little. <strong>Effects</strong> springs fade opacity, colour, blur and shadow and are critically damped, because opacity can’t overshoot.</p>
      <SegmentedControl label="Scheme" value={scheme} onValueChange={(v) => setScheme(v as Scheme)} options={[{ value: "standard", label: "Standard (≤ 5%)" }, { value: "expressive", label: "Expressive (≤ 12%)" }]} />
      <div style={{ marginBlockStart: 16 }}><TokenGrid scheme={scheme} /></div>

      <H2>Velocity hand-off</H2>
      <p>When a gesture ends, its velocity becomes the spring’s starting velocity, so the object keeps moving the way your hand was moving instead of stopping and restarting.</p>
      <Fling />

      <H2>Tune a spring</H2>
      <div className="lab-controls">
        <Slider label="Stiffness (k)" value={k} onValueChange={setK} min={50} max={1200} step={10} />
        <Slider label="Damping (c)" value={c} onValueChange={setC} min={5} max={100} />
        <Slider label="Mass (m)" value={m} onValueChange={setM} min={0.2} max={3} step={0.1} format={(v) => v.toFixed(1)} />
        <Slider label="Initial velocity" value={v0} onValueChange={setV0} min={-10} max={10} step={0.5} format={(v) => `${v} travel/s`} />
      </div>
      <p aria-live="polite">ζ = <strong>{metrics.zeta.toFixed(2)}</strong> · overshoot <strong>{(metrics.overshoot * 100).toFixed(1)}%</strong> · settles in <strong>{Math.round(metrics.settleMs)} ms</strong> {metrics.overshoot > ceiling ? <Badge tone="warning">Above the {Math.round(ceiling * 100)}% ceiling</Badge> : <Badge tone="success">Within the {Math.round(ceiling * 100)}% ceiling</Badge>}</p>
      <Curve sp={{ stiffness: k, damping: c, mass: m }} w={560} h={160} velocity={v0} ms={1200} />
      <div className="lab-track"><motion.div className="lab-box" animate={{ x: end ? distance(260) : 0, opacity: effective === "full" || end ? 1 : 0.45 }} transition={effective === "off" ? { duration: 0 } : effective === "reduced" ? { duration: 0.15 } : { type: "spring", stiffness: k, damping: c, mass: m, velocity: v0 * 260 }} /></div>
      <Stack direction="row" gap={3} align="center" wrap><Button onClick={() => setEnd((e) => !e)}>Move</Button><span className="orlo-hint">Click mid-flight: it redirects from its current velocity. Policy: <strong>{effective}</strong>.</span></Stack>
      <Code>{JSON.stringify({ type: "spring", stiffness: k, damping: c, mass: m }, null, 2)}</Code>

      <H2>Purposes</H2>
      <table className="doc" tabIndex={0}><thead><tr><th>Purpose</th><th>Family</th><th>Speed</th><th>Used for</th></tr></thead><tbody>
        {purposeRows.map(([name, [fam, speed]]) => <tr key={name}><td><code>{name}</code></td><td>{fam}</td><td>{speed}</td><td className="orlo-hint">{({ press: "Pointer-down compression", release: "Spring back", focus: "Focus halo", hover: "Hover tint", tooltip: "Small reveals", thumb: "Slider and switch thumbs", reveal: "Appearing in place", dismiss: "Leaving (never bouncy)", expand: "Accordion, disclosure", collapse: "Closing panels", shift: "Indicators, siblings yielding", morph: "Button → progress, shape changes", shared: "Continuity between views", overlay: "Menus, popovers, dialogs", page: "Route changes", drag: "Settle after a gesture", snap: "Snap points", success: "Confirmations", error: "Error appearance (no shake)", fade: "Opacity", shadow: "Elevation changes", blur: "Blur and backdrop", loading: "Progress", stagger: "Sequenced lists" } as Record<string, string>)[name]}</td></tr>)}
      </tbody></table>
      <H2>CSS uses the same physics</H2>
      <p>The token build samples each spring into a CSS <code>linear()</code> easing with a matching duration, so pure-CSS transitions (hover, press, focus) move with the same curves as Motion animations.</p>
      <Code>{`.my-card {\n  transition: transform var(--orlo-duration-spatial-default) var(--orlo-ease-spatial-default);\n}`}</Code>
      <H2>Policies</H2>
      <table className="doc" tabIndex={0}><thead><tr><th>Mode</th><th>Behaviour</th></tr></thead><tbody>
        <tr><td><code>system</code></td><td>Follows <code>prefers-reduced-motion</code>. The default.</td></tr><tr><td><code>reduced</code></td><td>Travel, scale and blur collapse to a 150 ms fade.</td></tr><tr><td><code>off</code></td><td>Instant.</td></tr><tr><td><code>full</code></td><td>Ignores the OS preference; only for an explicit user choice.</td></tr>
      </tbody></table>
    </div>
  );
}
