import type { ManifestEntry } from "@orlo/react";
import type { Doc } from "../registry/types.ts";

type Stop = { name: string; detail: string };

function stopsFor(entry: ManifestEntry, doc: Doc): Stop[] {
  const shared: Stop[] = [
    { name: "Stable", detail: "Starts readable and operable, with semantics and geometry already in place." },
    { name: "Engage", detail: "Acknowledges equivalent pointer, keyboard and assistive-technology input." },
    { name: "Interrupt", detail: "Redirects safely; focus, content and hit targets stay available." },
  ];
  if (entry.family === "Overlays") return [
    shared[0],
    { name: "Open", detail: "Takes the required focus and layer ownership without remounting its trigger." },
    { name: "Dismiss", detail: "Releases focus, inertness and scroll ownership in the correct order." },
    shared[2],
  ];
  if (["Forms", "Pickers"].includes(entry.family)) return [
    shared[0],
    { name: "Edit", detail: "Keeps a visible label, current value and focus while input changes." },
    { name: "Validate", detail: "Explains validity near the cause without relying on colour alone." },
    shared[2],
  ];
  if (entry.name === "AsyncButton" || doc.edge?.some((edge) => /request|retry|loading|error/i.test(edge))) return [
    shared[0],
    { name: "Pending", detail: "Keeps geometry and focus while work is in progress, then announces the outcome." },
    { name: "Resolve", detail: "Makes success, retry or the next step explicit." },
    shared[2],
  ];
  return shared;
}

export function LifecycleContract({ entry, doc, root }: { entry: ManifestEntry; doc: Doc; root: string }) {
  const stops = stopsFor(entry, doc);
  return (
    <section className="component-lifecycle" aria-labelledby="component-lifecycle">
      <div className="component-lifecycle__head"><div><h2 id="component-lifecycle">Lifecycle</h2><p>Framework contract for this component. Its specific exceptions appear in Highlights and Edge cases.</p></div><a href={`${root}foundations/lifecycle/`}>View the full contract</a></div>
      <ol>
        {stops.map((stop, i) => <li key={stop.name}><span aria-hidden="true">{i + 1}</span><div><strong>{stop.name}</strong><span>{stop.detail}</span></div></li>)}
      </ol>
    </section>
  );
}
