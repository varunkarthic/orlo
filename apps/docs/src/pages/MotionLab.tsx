import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button, Slider, SegmentedControl, Stack, Badge } from "@orlo/react";
import { presets, springMetrics, useOrloMotion, OVERSHOOT_CEILING, type PresetName } from "@orlo/motion";
import { Code } from "../kit.tsx";

/** Numerically integrates the spring (semi-implicit Euler) for the response chart. */
function simulate(k: number, c: number, m: number, ms = 900) {
  const pts: [number, number][] = [];
  let x = 0, v = 0;
  const dt = 1 / 240;
  for (let t = 0; t <= ms / 1000; t += dt) {
    const a = (-k * (x - 1) - c * v) / m;
    v += a * dt; x += v * dt;
    pts.push([t, x]);
  }
  return pts;
}

export function MotionLab() {
  const [preset, setPreset] = useState<PresetName | "custom">("reveal");
  const [k, setK] = useState(presets.reveal.stiffness);
  const [c, setC] = useState(presets.reveal.damping);
  const [m, setM] = useState(1);
  const [end, setEnd] = useState(false);
  const { effective, distance } = useOrloMotion();
  const metrics = springMetrics({ stiffness: k, damping: c, mass: m });
  const pts = useMemo(() => simulate(k, c, m), [k, c, m]);
  const W = 480, H = 180, max = Math.max(1.3, ...pts.map((p) => p[1]));
  const path = pts.filter((_, i) => i % 3 === 0).map(([t, x], i) => `${i ? "L" : "M"}${(t / 0.9) * W},${H - (x / max) * (H - 10)}`).join("");
  const choose = (p: string) => {
    setPreset(p as PresetName);
    if (p in presets) { const s = presets[p as PresetName]; setK(s.stiffness); setC(s.damping); setM(s.mass); }
  };
  const custom = (f: (n: number) => void) => (n: number) => { f(n); setPreset("custom"); };

  return (
    <>
      <p className="eyebrow">System</p>
      <h1>Motion</h1>
      <p className="lead">Orlo motion is one spring grammar: <code>m·x″ + c·x′ + k·(x − target) = 0</code>. Components ask for a purpose (<code>press</code>, <code>reveal</code>, <code>overlay</code>…), never for raw numbers.</p>

      <h2>MotionLab</h2>
      <Stack gap={5}>
        <SegmentedControl label="Preset" size="sm" value={preset === "custom" ? "custom" : preset} onValueChange={choose}
          options={[...(["press", "reveal", "overlay", "expand", "shared", "drag"] as const).map((p) => ({ value: p, label: p })), { value: "custom", label: "custom" }]} />
        <div className="lab-controls">
          <Slider label="Stiffness (k)" value={k} onValueChange={custom(setK)} min={50} max={1000} step={10} />
          <Slider label="Damping (c)" value={c} onValueChange={custom(setC)} min={5} max={100} />
          <Slider label="Mass (m)" value={m} onValueChange={custom(setM)} min={0.2} max={3} step={0.1} format={(v) => v.toFixed(1)} />
        </div>
        <p aria-live="polite" style={{ margin: 0 }}>
          ζ = <strong>{metrics.zeta.toFixed(2)}</strong> · overshoot <strong>{(metrics.overshoot * 100).toFixed(1)}%</strong> · settles in about <strong>{Math.round(metrics.settleMs)} ms</strong>{" "}
          {metrics.overshoot > OVERSHOOT_CEILING ? <Badge tone="warning">Above the {OVERSHOOT_CEILING * 100}% ceiling: expressive only</Badge> : <Badge tone="success">Within the ceiling</Badge>}
        </p>
        <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Step response: overshoot ${(metrics.overshoot * 100).toFixed(1)} percent, settling in ${Math.round(metrics.settleMs)} milliseconds`}>
          <line x1="0" x2={W} y1={H - (1 / max) * (H - 10)} y2={H - (1 / max) * (H - 10)} stroke="var(--orlo-color-border-control)" strokeDasharray="4 4" />
          <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" />
        </svg>
        <div className="lab-track">
          <motion.div className="lab-box"
            animate={{ x: end ? distance(Math.min(280, typeof window === "undefined" ? 280 : window.innerWidth - 140)) : 0, opacity: effective === "full" ? 1 : end ? 1 : 0.45 }}
            transition={effective === "off" ? { duration: 0 } : effective === "reduced" ? { duration: 0.15 } : { type: "spring", stiffness: k, damping: c, mass: m }} />
        </div>
        <Stack direction="row" gap={3} align="center" wrap>
          <Button onClick={() => setEnd((e) => !e)}>Move</Button>
          <span className="orlo-hint">Click again mid-flight: the spring redirects from its current velocity, with no jump. Policy in effect: <strong>{effective}</strong>.</span>
        </Stack>
        <Code>{JSON.stringify({ type: "spring", stiffness: k, damping: c, mass: m }, null, 2)}</Code>
      </Stack>

      <h2>Presets</h2>
      <table className="doc" tabIndex={0}>
        <thead><tr><th>Preset</th><th>k</th><th>c</th><th>ζ</th><th>Overshoot</th><th>Settle</th></tr></thead>
        <tbody>{Object.entries(presets).map(([name, p]) => { const x = springMetrics(p); return <tr key={name}><td><code>{name}</code></td><td>{p.stiffness}</td><td>{p.damping}</td><td>{x.zeta.toFixed(2)}</td><td>{(x.overshoot * 100).toFixed(1)}%</td><td>{Math.round(x.settleMs)} ms</td></tr>; })}</tbody>
      </table>
      <p className="orlo-hint">A unit test fails the build if any preset exceeds 5% overshoot or 700 ms settling. Values are Orlo's own hypotheses, not Apple or Google values.</p>

      <h2>Policies</h2>
      <table className="doc" tabIndex={0}>
        <thead><tr><th>Mode</th><th>Behaviour</th></tr></thead>
        <tbody>
          <tr><td><code>system</code></td><td>Follows <code>prefers-reduced-motion</code>. The default.</td></tr>
          <tr><td><code>reduced</code></td><td>Travel and scale collapse to a 150 ms fade. State changes stay visible.</td></tr>
          <tr><td><code>off</code></td><td>Instant. Nothing animates; nothing is lost.</td></tr>
          <tr><td><code>full</code></td><td>Ignores the OS preference. Only for an explicit user choice.</td></tr>
        </tbody>
      </table>
      <Code>{`import { useOrloMotion } from "@orlo/motion";\n\nconst { transition, distance } = useOrloMotion();\n<motion.div initial={{ opacity: 0, y: distance(8) }} animate={{ opacity: 1, y: 0, transition: transition("reveal") }} />`}</Code>

      <h2>Laws</h2>
      <ul className="notes">
        <li>Acknowledge input immediately, before any longer transition.</li>
        <li>Every animation can be interrupted and redirected without jumps or duplicated elements.</li>
        <li>Overlays grow from their trigger and leave towards it.</li>
        <li>No purposeless bounce. Overshoot is a measured choice.</li>
        <li>Animate transform and opacity; avoid layout thrash.</li>
        <li>Nothing invisible remains focusable after an exit.</li>
      </ul>
    </>
  );
}
