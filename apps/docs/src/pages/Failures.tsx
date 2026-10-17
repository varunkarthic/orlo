import { useState } from "react";
import { OrloImage, VideoPlayer, AudioPlayer, Embed, DocumentViewer, AsyncContent, useAsync, TextField, FileDropzone, Alert, Banner, OfflineIndicator, Switch, AsyncButton, Avatar, Card, Stack, Sparkline, LineChart, Combobox, EmptyState, Button, Skeleton } from "@orlo/react";
import { H2, PageHeader } from "../kit.tsx";

function Failing({ kind }: { kind: "error" | "offline" | "slow" | "empty" }) {
  const [n, setN] = useState(0);
  const r = useAsync<string[]>((signal) => new Promise((res, rej) => { const t = setTimeout(() => kind === "empty" ? res([]) : kind === "slow" ? res(["Loaded after 4 s"]) : rej(new Error("x")), kind === "slow" ? 4000 : 700); signal.addEventListener("abort", () => clearTimeout(t)); }), [n]);
  const shown = kind === "offline" && r.status === "error" ? { ...r, status: "offline" as const } : r;
  return <Card><AsyncContent result={shown} minHeight={110} errorTitle="Couldn’t load invoices" errorDetail={() => "The server didn’t respond. Nothing was changed."} loading={<Stack gap={2}><Skeleton height={14} width="70%" /><Skeleton height={14} width="45%" /></Stack>} empty={<EmptyState title="No invoices yet" description="They’ll appear here, newest first." />}>{(d) => <p style={{ margin: 0 }}>{d[0]}</p>}</AsyncContent></Card>;
}

export function Failures() {
  const [off, setOff] = useState(false);
  return (
    <div className="wide">
      <PageHeader eyebrow="Foundations" title="Failure gallery" lead="Every way things go wrong, side by side. Each one says what happened, what is safe, what you can do, and whether it will recover. All failures here are simulated locally." />
      <H2>Images and media</H2>
      <div className="grid">
        <figure className="lab-fig"><OrloImage src="./__missing__.png" alt="Product photo" maxRetries={1} /><figcaption>404 after one bounded retry</figcaption></figure>
        <figure className="lab-fig"><OrloImage src="data:image/png;base64,AAAA" alt="Corrupt file" maxRetries={0} /><figcaption>Corrupt data</figcaption></figure>
        <figure className="lab-fig"><OrloImage alt="No source" /><figcaption>Missing src</figcaption></figure>
        <figure className="lab-fig"><OrloImage src="./x.png" alt="Images off" images="off" /><figcaption>Images turned off (no request)</figcaption></figure>
        <figure className="lab-fig"><Stack direction="row" gap={2}><Avatar name="Alan Turing" src="./__missing__.png" size="lg" /><Avatar name="" size="lg" /></Stack><figcaption>Avatar photo fails · empty name</figcaption></figure>
      </div>
      <div className="grid" style={{ marginBlockStart: 16 }}>
        <figure className="lab-fig"><VideoPlayer src="./__missing__.mp4" title="Missing video" /><figcaption>Video that can’t play (press play)</figcaption></figure>
        <figure className="lab-fig"><AudioPlayer src="./__missing__.mp3" title="Missing audio" /><figcaption>Audio that can’t load</figcaption></figure>
        <figure className="lab-fig"><DocumentViewer src="./__missing__.pdf" title="Missing.pdf" ratio="4 / 3" /><figcaption>Document that can’t be previewed</figcaption></figure>
        <figure className="lab-fig"><Embed src="https://example.invalid/never" title="Unreachable embed" consented timeout={2500} /><figcaption>Embed that never loads (slow fallback)</figcaption></figure>
      </div>
      <H2>Remote data</H2>
      <div className="grid">
        <figure className="lab-fig"><Failing kind="error" /><figcaption>Server error with retry</figcaption></figure>
        <figure className="lab-fig"><Failing kind="offline" /><figcaption>Offline, with reassurance</figcaption></figure>
        <figure className="lab-fig"><Failing kind="slow" /><figcaption>Slow: skeleton, no flash</figcaption></figure>
        <figure className="lab-fig"><Failing kind="empty" /><figcaption>Empty, not an error</figcaption></figure>
      </div>
      <H2>Charts with missing data</H2>
      <div className="grid">
        <figure className="lab-fig"><Card><Sparkline label="Uptime" data={[99, 98, null, null, 97, 99]} width={200} /></Card><figcaption>Gaps stay gaps</figcaption></figure>
        <figure className="lab-fig"><LineChart title="No data" labels={[]} series={[{ name: "x", data: [] }]} /><figcaption>Empty chart</figcaption></figure>
        <figure className="lab-fig"><LineChart title="Loading" labels={["a"]} series={[{ name: "x", data: [1] }]} loading /><figcaption>Loading chart</figcaption></figure>
      </div>
      <H2>Forms and actions</H2>
      <div className="grid">
        <figure className="lab-fig"><Card><TextField label="Email" defaultValue="ada@" error="Enter an address like name@example.com." /></Card><figcaption>Field error: words, glyph, border</figcaption></figure>
        <figure className="lab-fig"><Card><FileDropzone label="Attachments" accept="image/*" maxSize={1000} help="Drop a PDF or a large image to see rejections." /></Card><figcaption>Rejected files explain why</figcaption></figure>
        <figure className="lab-fig"><Card><AsyncButton action={() => new Promise((_, rej) => setTimeout(() => rej(new Error()), 900))} errorLabel="Couldn’t save — retry">Save</AsyncButton></Card><figcaption>Action fails, retry in place</figcaption></figure>
        <figure className="lab-fig"><Card><Combobox label="Remote search" options={[]} onInputChange={() => {}} emptyText="No matches. Check the spelling." /></Card><figcaption>No results</figcaption></figure>
      </div>
      <H2>Page-level</H2>
      <Stack gap={3}>
        <Alert tone="error" title="Payment declined" action={<Button variant="ghost">Update card</Button>}>Your card was not charged. Your plan stays active until 30 November.</Alert>
        <div style={{ border: "1px solid var(--orlo-color-border)", borderRadius: 12, overflow: "hidden" }}><Banner tone="warning">Scheduled maintenance Saturday 02:00–03:00 UTC. Reading still works.</Banner><div style={{ padding: 12 }}>Content stays usable underneath.</div></div>
        <Switch label="Simulate going offline" checked={off} onCheckedChange={setOff} />
        <div style={{ border: "1px solid var(--orlo-color-border)", borderRadius: 12, overflow: "hidden" }}><OfflineIndicator simulate={off} /><div style={{ padding: 12 }}>Your document</div></div>
      </Stack>
    </div>
  );
}
