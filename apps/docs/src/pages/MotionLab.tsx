import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "motion/react";
import { Button, Slider, SegmentedControl, Stack, Badge, Card } from "@orlo/react";
import { springs, springMetrics, simulate, spring, purposes, useOrloMotion, OVERSHOOT_CEILING, EXPRESSIVE_CEILING, projectSnap, createVelocityTracker, type Scheme } from "@orlo/motion";
import { Code, H2, PageHeader } from "../kit.tsx";

function Curve({ sp, w = 180, h = 64, velocity = 0, ms = 900 }: { sp: { stiffness: number; damping: number; mass: number }; w?: number; h?: number; velocity?: number; ms?: number }) {
  const { transition } = useOrloMotion();
  const pts = simulate(sp, { velocity, ms });
  const max = Math.max(1.15, ...pts.map((p) => p[1]));
  const d = pts.filter((_, i) => i % 3 === 0).map(([t, x], i) => `${i ? "L" : "M"}${((t / ms) * w).toFixed(1)},${(h - 4 - (x / max) * (h - 8)).toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="curve" role="img" aria-label="Spring step response">
      <line x1="0" x2={w} y1={h - 4 - (1 / max) * (h - 8)} y2={h - 4 - (1 / max) * (h - 8)} className="curve__target" />
      <motion.path d={d} animate={{ d }} initial={false} transition={transition("shift")} className="curve__line" />
    </svg>
  );
}

function TokenGrid({ scheme }: { scheme: Scheme }) {
  // Toggle between ends instead of remounting: a dot already at its target never replays.
  const [atEnd, setAtEnd] = useState(false);
  return (
    <>
      <div className="token-grid">
        {(["spatial", "effects"] as const).flatMap((fam) => (["fast", "default", "slow"] as const).map((speed) => {
          const sp = springs[scheme][fam][speed]; const m = springMetrics(sp);
          return (
            <Card key={fam + speed} className="token">
              <div className="token__head"><code>{fam}.{speed}</code><span className="orlo-hint">k {sp.stiffness} · c {sp.damping}</span></div>
              <Curve sp={sp} />
              <div className="token__track" data-end={atEnd || undefined}><motion.span className="token__dot" layout="position" initial={false} transition={sp} /></div>
              <div className="token__meta"><span>ζ {m.zeta.toFixed(2)}</span><span>{(m.overshoot * 100).toFixed(1)}% overshoot</span><span>{Math.round(m.settleMs)} ms</span></div>
            </Card>
          );
        }))}
      </div>
      <Button variant="subtle" onClick={() => setAtEnd((v) => !v)}>{atEnd ? "Race back" : "Race all six"}</Button>
    </>
  );
}

function Fling() {
  const x = useMotionValue(0);
  const tracker = useRef(createVelocityTracker());
  const track = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(520);
  const previousTravel = useRef(464);
  const [snapIndex, setSnapIndex] = useState(0);
  const [info, setInfo] = useState<{ v: number; target: number; from: number } | null>(null);
  const { transition, effective } = useOrloMotion();
  const travel = Math.max(0, width - 56);
  const snaps = [0, 0.25, 0.5, 0.75, 1].map((n) => n * travel);
  useLayoutEffect(() => {
    if (!track.current) return;
    const resize = () => setWidth(track.current?.clientWidth ?? 520);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(track.current);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    if (previousTravel.current !== travel) {
      x.set(previousTravel.current ? (x.get() / previousTravel.current) * travel : 0);
      previousTravel.current = travel;
    }
  }, [travel, x]);
  return (
    <Stack gap={3}>
      <div ref={track} className="fling">
        {snaps.map((s) => <span key={s} className="fling__snap" style={{ insetInlineStart: s + 28 }} />)}
        <motion.div className="fling__puck" style={{ x }} drag="x" dragConstraints={{ left: 0, right: travel }} dragElastic={0.18} dragMomentum={false}
          onDragStart={() => tracker.current.reset()} onDrag={() => tracker.current.add(x.get())}
          onDragEnd={() => {
            const v = tracker.current.velocity();
            const target = projectSnap(x.get(), v, snaps);
            setSnapIndex(snaps.indexOf(target));
            setInfo({ v, target, from: x.get() });
            animate(x, target, effective === "full" ? { ...(transition("drag", v) as object) } : (transition("drag") as object));
          }} onKeyDown={(event) => {
            const next = event.key === "ArrowRight" ? Math.min(4, snapIndex + 1) : event.key === "ArrowLeft" ? Math.max(0, snapIndex - 1) : event.key === "Home" ? 0 : event.key === "End" ? 4 : null;
            if (next === null) return;
            event.preventDefault();
            setSnapIndex(next);
            setInfo({ v: 0, target: snaps[next], from: x.get() });
            animate(x, snaps[next], transition("snap") as never);
          }} tabIndex={0} aria-label="Fling snap position" aria-valuemin={1} aria-valuemax={5} aria-valuenow={snapIndex + 1} aria-valuetext={`Snap ${snapIndex + 1} of 5`} role="slider" />
      </div>
      <p aria-live="polite" style={{ margin: 0 }}>{info ? <>Snap <strong>{snapIndex + 1} of 5</strong>{info.v ? <> · release velocity <strong>{Math.round(info.v)} px/s</strong></> : null}. The <code>drag</code> spring settles from the current position.</> : "Drag and release the puck, or use arrow keys to move between snap points."}</p>
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
  const previewTrack = useRef<HTMLDivElement>(null);
  const previewBox = useRef<HTMLDivElement>(null);
  const [previewTravel, setPreviewTravel] = useState(260);
  const { effective, distance, transition } = useOrloMotion();
  useLayoutEffect(() => {
    if (!previewTrack.current) return;
    const resize = () => {
      const track = previewTrack.current;
      const box = previewBox.current;
      if (!track || !box) return;
      const css = getComputedStyle(track);
      const pad = parseFloat(css.paddingInlineStart) + parseFloat(css.paddingInlineEnd);
      setPreviewTravel(Math.max(0, track.clientWidth - pad - box.offsetWidth));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(previewTrack.current);
    return () => observer.disconnect();
  }, []);
  const metrics = springMetrics({ stiffness: k, damping: c, mass: m });
  const purposeRows = useMemo(() => Object.entries(purposes), []);
  const ceiling = scheme === "expressive" ? EXPRESSIVE_CEILING : OVERSHOOT_CEILING;
  return (
    <div className="wide">
      <PageHeader eyebrow="Styles" title="Motion" lead={<>One spring grammar: <code>m·x″ + c·x′ + k·(x − target) = 0</code>. Components ask for a purpose; Orlo picks a spring from two families and three speeds, and carries gesture velocity into the settle.</>} />
      <H2>Spring tokens</H2>
      <p><strong>Spatial</strong> springs move position, size and shape and may overshoot a little. <strong>Effects</strong> springs fade opacity, colour, blur and shadow and are critically damped, because opacity can’t overshoot.</p>
      <SegmentedControl label="Scheme" value={scheme} onValueChange={(v) => setScheme(v as Scheme)} options={[{ value: "standard", label: "Standard (≤ 5%)" }, { value: "expressive", label: "Expressive (≤ 12%)" }]} />
      <div className="motion-tokens"><TokenGrid scheme={scheme} /></div>

      <H2>Velocity hand-off</H2>
      <p>When a gesture ends, its velocity becomes the spring’s starting velocity, so the object keeps moving the way your hand was moving instead of stopping and restarting.</p>
      <Fling />

      <H2>Tune a spring</H2>
      <div className="spring-workbench">
        <div className="spring-workbench__controls">
          <p className="spring-workbench__eyebrow">Adjust the physics</p>
          <div className="lab-controls">
            <Slider label="Stiffness (k)" value={k} onValueChange={setK} min={50} max={1200} step={10} />
            <Slider label="Damping (c)" value={c} onValueChange={setC} min={5} max={100} />
            <Slider label="Mass (m)" value={m} onValueChange={setM} min={0.2} max={3} step={0.1} format={(v) => v.toFixed(1)} />
            <Slider label="Initial velocity" value={v0} onValueChange={setV0} min={-10} max={10} step={0.5} format={(v) => `${v} travel/s`} />
          </div>
        </div>
        <div className="spring-workbench__preview">
          <div className="spring-workbench__top"><span>Live response</span><Badge tone={metrics.overshoot > ceiling ? "warning" : "success"}>{metrics.overshoot > ceiling ? "Above limit" : "Within limit"}</Badge></div>
          <Curve sp={{ stiffness: k, damping: c, mass: m }} w={560} h={130} velocity={v0} ms={1200} />
          <div ref={previewTrack} className="lab-track"><motion.div ref={previewBox} className="lab-box" initial={false} animate={{ x: end ? distance(previewTravel) : 0, opacity: effective === "full" || end ? 1 : 0.55 }} transition={effective === "full" ? { type: "spring", stiffness: k, damping: c, mass: m, velocity: v0 * previewTravel } : transition("shift")} /></div>
          <div className="spring-workbench__action"><Button onClick={() => setEnd((e) => !e)}>{end ? "Move back" : "Move forward"}</Button><span className="orlo-hint">Change a value or reverse the block mid-flight.</span></div>
          <p className="spring-workbench__metrics" aria-live="polite"><span>ζ <strong>{metrics.zeta.toFixed(2)}</strong></span><span>Overshoot <strong>{(metrics.overshoot * 100).toFixed(1)}%</strong></span><span>Settles <strong>{Math.round(metrics.settleMs)} ms</strong></span><span>Policy <strong>{effective}</strong></span></p>
        </div>
      </div>
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
