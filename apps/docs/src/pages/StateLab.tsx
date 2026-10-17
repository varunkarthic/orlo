import { useEffect, useState } from "react";
import { Button, Alert, OrloImage, OrloProvider, type ImageState } from "@orlo/react";

const photo = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#1C1B18"/><path d="M0 220 Q100 140 200 200 T400 170 V300 H0Z" fill="#C2410C"/></svg>');

/** Simulation only: hands the image URL to the component after a delay. Everything stays local. */
function useDelayed<T>(value: T, ms: number, key: number) {
  const [v, setV] = useState<T | undefined>(undefined);
  useEffect(() => { setV(undefined); const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms, key]);
  return v;
}

export function StateLab() {
  const [run, setRun] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [states, setStates] = useState<Record<string, ImageState>>({});
  const slow = useDelayed(photo, 2500, run);
  const track = (k: string) => (s: ImageState) => setStates((p) => (p[k] === s ? p : { ...p, [k]: s }));
  return (
    <>
      <p className="eyebrow">Foundations</p>
      <h1>State Lab</h1>
      <p className="lead">Forced failures and delays, all simulated locally. Nothing here touches the network.</p>
      <p><Button variant="subtle" onClick={() => setRun((n) => n + 1)}>Replay image loads</Button></p>
      <h2>Images</h2>
      <div className="grid">
        <figure className="lab-fig"><OrloImage key={`a${run}`} src={photo} alt="Immediate" onStateChange={track("fast")} /><figcaption>Immediate · {states.fast}</figcaption></figure>
        <figure className="lab-fig"><OrloImage key={`b${run}`} src={slow} alt="Slow image (simulated 2.5s)" onStateChange={track("slow")} /><figcaption>Slow, 2.5 s simulated · {states.slow}</figcaption></figure>
        <figure className="lab-fig"><OrloImage key={`c${run}`} src="./__missing__.png" alt="Missing file (404)" maxRetries={2} onStateChange={track("404")} /><figcaption>404, two bounded retries · {states["404"]}</figcaption></figure>
        <figure className="lab-fig">
          <OrloProvider images="off"><OrloImage key={`d${run}`} src={photo} alt="Images switched off" onStateChange={track("off")} /></OrloProvider>
          <figcaption>Images off for this subtree · {states.off}</figcaption>
        </figure>
      </div>
      <p>The layout never moves between states. Use <strong>Images</strong> in the header to switch the whole site.</p>

      <h2>Async action</h2>
      <div className="demo">
        <Button loading={saving} loadingLabel="Saving" onClick={() => { setSaved(false); setSaving(true); setTimeout(() => { setSaving(false); setSaved(true); }, 1500); }}>Save changes</Button>
        <Alert tone="success" open={saved} title="Saved">Confirmed after the simulated request completed, never before.</Alert>
      </div>
    </>
  );
}
