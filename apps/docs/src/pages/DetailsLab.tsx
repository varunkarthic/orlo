import { useState } from "react";
import { Button, Card } from "@orlo/react";

const text = "Orlo treats the edge of every state as part of the design. When a surface grows over neighbouring content, one layer must clearly own that space, otherwise a half-severed line of text is left behind to look unfinished.";

export function DetailsLab() {
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  return (
    <>
      <h1>Details Lab</h1>
      <p className="lead">The half-clipped text problem: the same situation handled badly and handled deliberately.</p>

      <h2>1. Clipping a paragraph</h2>
      <div className="pair">
        <section>
          <h3>Flawed</h3>
          <div style={{ blockSize: "4.3em", overflow: "hidden" }}><p style={{ margin: 0 }}>{text}</p></div>
          <p><small>A fixed height cuts the last line through its glyphs. Nothing says there is more.</small></p>
        </section>
        <section>
          <h3>Orlo</h3>
          <p style={{ margin: 0, ...(more ? {} : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }) }}>{text}</p>
          <p><Button variant="ghost" aria-expanded={more} onClick={() => setMore((m) => !m)}>{more ? "Show less" : "Show more"}</Button></p>
          <p><small>Whole lines only, an ellipsis, and a control. Full text stays in the accessibility tree.</small></p>
        </section>
      </div>

      <h2>2. Overlay ownership</h2>
      <div className="pair">
        {(["flawed", "orlo"] as const).map((kind) => (
          <section key={kind}>
            <h3>{kind === "flawed" ? "Flawed" : "Orlo"}</h3>
            <div style={{ position: "relative", minBlockSize: 120 }}>
              <p style={{ margin: 0 }}>{text}</p>
              {open && (
                <>
                  {kind === "orlo" && <div style={{ position: "absolute", inset: 0, background: "var(--orlo-color-scrim)", borderRadius: 8 }} />}
                  <Card style={{ position: "absolute", insetInline: 16, insetBlockStart: 36, background: kind === "flawed" ? "color-mix(in oklab, var(--orlo-color-surface) 55%, transparent)" : "var(--orlo-color-surface-raised)" }}>
                    <strong>Details</strong>
                    <p style={{ margin: 0 }}>{kind === "flawed" ? "Text shows through and is cut mid-line." : "Opaque surface and a scrim: nothing beneath is half visible or clickable."}</p>
                  </Card>
                </>
              )}
            </div>
          </section>
        ))}
      </div>
      <p><Button variant="subtle" aria-pressed={open} onClick={() => setOpen((o) => !o)}>{open ? "Close" : "Open"} overlay</Button></p>
      <p><small>Planned for this lab: timeline scrubber, focus repair, tooltip collision, late skeleton hand-off.</small></p>
    </>
  );
}
