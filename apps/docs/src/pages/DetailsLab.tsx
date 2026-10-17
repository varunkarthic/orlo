import { useState } from "react";
import { Button, Card, Slider, Switch, Dialog, Stack } from "@orlo/react";

const text = "Orlo treats the edge of every state as part of the design. When a surface grows over neighbouring content, one layer must clearly own that space; otherwise a half-severed line of text is left behind, and the whole screen feels unfinished.";

export function DetailsLab() {
  const [t, setT] = useState(55);
  const [more, setMore] = useState(false);
  const [removeTrigger, setRemoveTrigger] = useState(false);
  const p = t / 100;
  return (
    <>
      <p className="eyebrow">Foundations</p>
      <h1>Details Lab</h1>
      <p className="lead">The same situation handled carelessly and handled deliberately. Scrub the timeline to inspect the frames in between.</p>

      <h2>1. A card expanding over text</h2>
      <div style={{ maxInlineSize: "22rem" }}><Slider label="Timeline" value={t} onValueChange={setT} format={(v) => `${v}%`} /></div>
      <div className="pair" style={{ marginBlockStart: 16 }}>
        {(["flawed", "orlo"] as const).map((kind) => (
          <section key={kind}>
            <h3>{kind === "flawed" ? "Flawed" : "Orlo"}</h3>
            <div style={{ position: "relative", overflow: "hidden", borderRadius: 8 }}>
              <p style={{ margin: 0, opacity: kind === "orlo" ? 1 - p * 0.6 : 1 }}>{text}</p>
              {kind === "orlo" && <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "var(--orlo-color-scrim)", opacity: p }} />}
              <Card style={{
                position: "absolute", insetInline: 0, insetBlockStart: 0, blockSize: `${p * 100}%`, padding: kind === "orlo" ? 16 : "0 16px", overflow: "hidden",
                background: kind === "flawed" ? "color-mix(in oklab, var(--orlo-color-surface-raised) 60%, transparent)" : "var(--orlo-color-surface-raised)",
              }}>
                <strong style={{ opacity: kind === "orlo" ? Math.max(0, (p - 0.4) / 0.6) : 1 }}>Details</strong>
              </Card>
            </div>
            <p className="orlo-hint">{kind === "flawed" ? "Translucent surface and a hard edge: lines are cut through their glyphs and show through." : "Opaque surface with a scrim that dims the text as a block. Its own label only appears once there is room."}</p>
          </section>
        ))}
      </div>

      <h2>2. Truncating a paragraph</h2>
      <div className="pair">
        <section>
          <h3>Flawed</h3>
          <div style={{ blockSize: "4.4em", overflow: "hidden" }}><p style={{ margin: 0 }}>{text}</p></div>
          <p className="orlo-hint">A fixed height slices the last line in half, and nothing says there is more.</p>
        </section>
        <section>
          <h3>Orlo</h3>
          <p id="clamp" style={{ margin: 0, ...(more ? {} : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }) }}>{text}</p>
          <Button variant="ghost" aria-expanded={more} aria-controls="clamp" onClick={() => setMore((m) => !m)}>{more ? "Show less" : "Show more"}</Button>
          <p className="orlo-hint">Whole lines, an ellipsis and a control. The full text stays in the accessibility tree.</p>
        </section>
      </div>

      <h2>3. Focus that has nowhere to return</h2>
      <p>Open the dialog with “remove trigger” on: the button that opened it disappears while it is open. Orlo checks the trigger still exists and is enabled before returning focus, instead of throwing focus to nowhere.</p>
      <Stack direction="row" gap={4} align="center" wrap>
        <Switch label="Remove trigger while open" checked={removeTrigger} onCheckedChange={setRemoveTrigger} />
        <DisappearingTrigger remove={removeTrigger} />
      </Stack>

      <h2>4. The repeated-click race</h2>
      <p>Click <strong>Save</strong> five times fast. The button acknowledges each press, but only one request starts, its width never changes, and focus stays put.</p>
      <RaceDemo />
    </>
  );
}

function DisappearingTrigger({ remove }: { remove: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!(remove && open) && <Button variant="subtle" onClick={() => setOpen(true)}>Open dialog</Button>}
      <Dialog open={open} onOpenChange={setOpen} title="Trigger check" description={remove ? "The trigger is gone. Closing will not throw focus to a removed node." : "Closing returns focus to the trigger."} footer={(close) => <Button onClick={close}>Close</Button>} />
    </>
  );
}

function RaceDemo() {
  const [busy, setBusy] = useState(false);
  const [requests, setRequests] = useState(0);
  return (
    <Stack direction="row" gap={3} align="center">
      <Button loading={busy} loadingLabel="Saving" onClick={() => { setRequests((r) => r + 1); setBusy(true); setTimeout(() => setBusy(false), 1500); }}>Save</Button>
      <span aria-live="polite">Requests started: <strong>{requests}</strong></span>
    </Stack>
  );
}
