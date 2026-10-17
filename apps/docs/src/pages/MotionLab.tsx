import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@orlo/react";
import { presets, springMetrics, useOrloMotion, OVERSHOOT_CEILING } from "@orlo/motion";

export function MotionLab() {
  const [k, setK] = useState(380);
  const [c, setC] = useState(34);
  const [m, setM] = useState(1);
  const [end, setEnd] = useState(false);
  const { effective, distance } = useOrloMotion();
  const metrics = springMetrics({ stiffness: k, damping: c, mass: m });
  const token = JSON.stringify({ type: "spring", stiffness: k, damping: c, mass: m }, null, 2);
  const slider = (label: string, v: number, set: (n: number) => void, min: number, max: number, step: number) => (
    <label className="range">{label}: {v}
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)} />
    </label>
  );
  return (
    <>
      <h1>MotionLab</h1>
      <p className="lead">Orlo motion is spring-based: <code>m·x″ + c·x′ + k·(x − target) = 0</code>. Tune the three constants and read the consequences before you commit to a token.</p>
      <div className="row">
        {slider("Stiffness", k, setK, 50, 1000, 10)}
        {slider("Damping", c, setC, 5, 100, 1)}
        {slider("Mass", m, setM, 0.2, 3, 0.1)}
      </div>
      <p aria-live="polite">
        Damping ratio ζ = <strong>{metrics.zeta.toFixed(2)}</strong> · overshoot <strong>{(metrics.overshoot * 100).toFixed(1)}%</strong> · settles in about <strong>{Math.round(metrics.settleMs)} ms</strong>.{" "}
        {metrics.overshoot > OVERSHOOT_CEILING ? `Above Orlo's ${OVERSHOOT_CEILING * 100}% ceiling, so this is expressive-only.` : "Within Orlo's overshoot ceiling."}
      </p>
      <div className="lab-track">
        <motion.div
          className="lab-box"
          animate={{ x: end ? distance(260) : 0, opacity: effective === "full" ? 1 : end ? 1 : 0.5 }}
          transition={effective === "off" ? { duration: 0 } : effective === "reduced" ? { duration: 0.15 } : { type: "spring", stiffness: k, damping: c, mass: m }}
        />
      </div>
      <p>
        <Button onClick={() => setEnd((e) => !e)}>Move</Button>{" "}
        <span className="tag">Click rapidly: each click redirects the running spring from its current velocity, with no jump.</span>
      </p>
      <p>Motion policy in effect: <strong>{effective}</strong>. Under <em>reduced</em> the box fades instead of travelling; under <em>off</em> it jumps.</p>
      <h3>Export token</h3>
      <pre><code>{token}</code></pre>

      <h2>Presets</h2>
      <table>
        <thead><tr><th>Preset</th><th>k</th><th>c</th><th>m</th><th>ζ</th><th>Overshoot</th><th>Settle</th></tr></thead>
        <tbody>
          {Object.entries(presets).map(([name, p]) => {
            const x = springMetrics(p);
            return <tr key={name}><td><code>{name}</code></td><td>{p.stiffness}</td><td>{p.damping}</td><td>{p.mass}</td><td>{x.zeta.toFixed(2)}</td><td>{(x.overshoot * 100).toFixed(1)}%</td><td>{Math.round(x.settleMs)} ms</td></tr>;
          })}
        </tbody>
      </table>
      <p>Values are initial design hypotheses tuned by eye and checked analytically. They are not Apple or Google values.</p>
    </>
  );
}
