import { Wordmark, Card, Badge } from "@orlo/react";

const principles = [
  ["Every transition has a reason", "Motion clarifies hierarchy, cause or continuity. If it does none of these, it goes."],
  ["Nothing is half-finished", "We inspect the entry, the midpoint, the exit, the interruption and the failure, not only the final frame."],
  ["Content stays in control", "No effect is worth a clipped word, a lost focus ring or a control that cannot be operated."],
  ["Quiet by default", "Restrained transitions are the baseline. Expressive motion is opt-in and rare."],
  ["Accessible is beautiful", "Reduced motion, clear focus, labels and contrast are part of the design, not a pass at the end."],
  ["Make the invisible deliberate", "Image failure, stale data, focus return, scroll anchoring and cleanup are designed, not hoped for."],
];

export function Home({ root }: { root: string }) {
  return (
    <>
      <Wordmark height={72} style={{ marginBlockEnd: 24 }} />
      <h1>Nothing is an afterthought.</h1>
      <p className="lead">
        Orlo is a design framework for React, built around the idea that a great interface is shaped as much by what happens
        between moments as by what appears on screen. Every press, transition, boundary, loading state and recovery is part of the design.
      </p>
      <p>
        The name is inspired by the Italian word <em>orlo</em>: an edge, rim or hem. Pronounced <strong>OR-loh</strong>, stress on the first syllable.
        A hem is the careful finish that holds the whole together, even when it is barely noticed. The mark is an O whose rim is deliberately left open.
      </p>
      <p>
        <Badge tone="warning">Pre-release</Badge> Orlo is under active construction. The{" "}
        <a href={`${root}components/`}>component list</a> shows exactly what exists and how far each piece has been verified.
      </p>

      <h2>Principles</h2>
      <div className="grid">
        {principles.map(([t, d]) => (
          <Card key={t}><h3 style={{ marginTop: 0 }}>{t}</h3><p style={{ marginBottom: 0 }}>{d}</p></Card>
        ))}
      </div>

      <h2>Try it</h2>
      <ul>
        <li><a href={`${root}motion/`}>MotionLab</a>: tune a spring and see damping ratio, overshoot and settling time.</li>
        <li><a href={`${root}labs/states/`}>State Lab</a>: a dead image, a slow image, a loading button and a global no-image switch.</li>
        <li><a href={`${root}labs/details/`}>Details Lab</a>: the half-clipped text problem, flawed beside fixed.</li>
        <li>Use the <strong>Theme</strong>, <strong>Motion</strong> and <strong>Images</strong> buttons in the header on any page.</li>
      </ul>
    </>
  );
}
