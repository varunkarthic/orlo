import { useState } from "react";
import { Alert, Callout, Progress, Spinner, Skeleton, EmptyState, Banner, OfflineIndicator, ProgressRing, Button, Card, Stack, Switch } from "@orlo/react";
import type { Doc } from "./types.ts";

function AlertDemo() {
  const [open, setOpen] = useState(true);
  const [retried, setRetried] = useState(false);
  return <Stack gap={3} style={{ inlineSize: "100%" }}>
    <div><Button variant="subtle" onClick={() => setOpen((o) => !o)}>{open ? "Dismiss" : "Show"} alert</Button></div>
    <Alert tone="warning" open={open} title="Connection is slow">Changes are saved on this device and will sync when the network recovers.</Alert>
    {retried ? <Alert tone="success" title="Preview retry complete" action={<Button variant="ghost" onClick={() => setRetried(false)}>Show failure</Button>}>The payment example recovered locally; no charge was made.</Alert> : <Alert tone="error" title="Payment declined" action={<Button variant="ghost" onClick={() => setRetried(true)}>Retry preview</Button>}>Your card was not charged.</Alert>}
    <Alert tone="success" title="Published">Everyone with the link can see it now.</Alert>
    <Alert tone="info" title="Scheduled maintenance">Saturday 02:00–03:00 UTC. Reading still works.</Alert>
  </Stack>;
}
function ProgressDemo() { const [v, setV] = useState(35); return <Stack gap={5} style={{ inlineSize: "min(100%, 24rem)" }}><Progress label="Uploading photos" value={v} /><Progress label="Preparing export" /><Stack direction="row" gap={4} align="center"><ProgressRing label="Upload" value={v} /><ProgressRing label="Syncing" size={28} /><Button variant="subtle" onClick={() => setV((x) => Math.max(0, x - 15))}>−15</Button><Button variant="subtle" onClick={() => setV((x) => Math.min(100, x + 15))}>+15</Button></Stack></Stack>; }
function BannerDemo() { const [open, setOpen] = useState(true); const [details, setDetails] = useState(false); return <Stack gap={3} style={{ inlineSize: "100%" }}><div style={{ border: "1px solid var(--orlo-color-border)", borderRadius: "var(--orlo-radius-lg)", overflow: "hidden" }}><Banner tone="info" open={open} onDismiss={() => setOpen(false)} action={<Button variant="ghost" onClick={() => setDetails((value) => !value)}>{details ? "Hide details" : "Details"}</Button>}>Scheduled maintenance on Saturday, 02:00–03:00 UTC.</Banner><div style={{ padding: "var(--orlo-space-4)" }}>Page content is pushed down, never covered.{details && <p className="orlo-hint" style={{ marginBlockEnd: 0 }}>During the preview window, reading stays available. Publishing resumes after maintenance.</p>}</div></div>{!open && <div><Button variant="subtle" onClick={() => setOpen(true)}>Show banner</Button></div>}</Stack>; }
function OfflineDemo() { const [off, setOff] = useState(false); return <Stack gap={3} style={{ inlineSize: "100%" }}><Switch label="Simulate offline" checked={off} onCheckedChange={setOff} /><div style={{ border: "1px solid var(--orlo-color-border)", borderRadius: 12, overflow: "hidden" }}><OfflineIndicator simulate={off} /><div style={{ padding: 16 }}>Your document</div></div></Stack>; }
function SkeletonDemo() { const [loaded, setLoaded] = useState(false); return <Stack gap={3} style={{ inlineSize: "min(100%, 22rem)" }}><Card><Stack direction="row" gap={3} align="center">{loaded ? <><span className="orlo-avatar" data-hue="2" style={{ inlineSize: 40, blockSize: 40 }}><span className="orlo-avatar__initials">GH</span></span><Stack gap={1}><strong style={{ lineHeight: "14px" }}>Grace Hopper</strong><span className="orlo-hint" style={{ lineHeight: "12px" }}>Rear admiral, programmer</span></Stack></> : <><Skeleton width={40} height={40} radius="50%" /><Stack gap={2} style={{ flex: 1 }}><Skeleton height={14} width="60%" /><Skeleton height={12} width="85%" /></Stack></>}</Stack></Card><div><Button variant="subtle" onClick={() => setLoaded((l) => !l)}>{loaded ? "Show skeleton" : "Hand off to content"}</Button></div></Stack>; }
function EmptyStateDemo() { const [created, setCreated] = useState(false); return <Card style={{ inlineSize: "100%" }}>{created ? <Stack gap={3}><strong>Draft invoice created in this preview</strong><span className="orlo-hint">Nothing was sent or stored.</span><div><Button variant="subtle" onClick={() => setCreated(false)}>Show empty state</Button></div></Stack> : <EmptyState title="No invoices yet" description="Invoices you send will appear here, newest first." action={<Button onClick={() => setCreated(true)}>Create draft invoice</Button>} />}</Card>; }

export const feedback: Record<string, Doc> = {
  alert: { demo: () => <AlertDemo />, code: `<Alert tone="warning" title="Connection is slow">Changes are saved on this device.</Alert>`, props: [["tone", '"info" | "success" | "warning" | "error"', ""], ["title", "ReactNode", ""], ["open", "boolean", "false plays the exit and unmounts."], ["action", "ReactNode", ""]], notes: ["Errors and warnings use role=alert; info and success use role=status.", "Each tone has its own icon as well as colour.", "Say what happened, what is safe, and what to do next."], anatomy: [["Icon", ".orlo-alert__glyph"], ["Title", ".orlo-alert__body strong"], ["Body", ".orlo-alert__body > div"]], anatomyDemo: () => <div style={{ inlineSize: 360 }}><Alert tone="warning" title="Connection is slow">Changes are kept on this device.</Alert></div>, specs: [["Accent bar", "3px"], ["Corner radius", "--orlo-radius-md"], ["Warning", "--orlo-color-warning"], ["Error", "--orlo-color-error"]] },
  callout: {
    demo: () => (
      <Stack gap={3} style={{ inlineSize: "100%" }}>
        <Callout variant="note" title="Note">Content stays readable when viewport zoom or font size changes.</Callout>
        <Callout variant="tip" title="Tip">Use container queries instead of viewport queries for component layouts.</Callout>
        <Callout variant="important" title="Important">Never convey state or error conditions by colour alone.</Callout>
        <Callout variant="caution" title="Caution">Destructive actions require explicit confirmation or a visible hold gesture.</Callout>
      </Stack>
    ),
    code: `<Callout variant="note" title="Note">\n  Content stays readable when viewport zoom changes.\n</Callout>`,
    props: [
      ["variant", '"note" | "tip" | "important" | "caution"', "Default note."],
      ["title", "ReactNode", "Optional heading."],
      ["children", "ReactNode", "Body text."],
      ["action", "ReactNode", "Optional trailing action button."],
    ],
    notes: [
      "Provides clear, accessible editorial notes and contextual callouts.",
      "Uses semantic token tints with high-contrast text and tone icons.",
      "Clear visual hierarchy with 4px tone indicator bar.",
    ],
  },
  progress: { demo: () => <ProgressDemo />, code: `<Progress label="Uploading photos" value={35} />\n<Progress label="Preparing export" />  {/* indeterminate */}`, notes: ["Omit value for indeterminate. Orlo never fakes progress it can't measure.", "Determinate progress eases between values with the `shift` spring."], semantics: ["role=progressbar labelled by the visible label."] },
  spinner: { demo: () => <><Spinner /><Spinner size="sm" label="Saving" /></>, code: `<Spinner label="Saving" />`, notes: ["Always carries an accessible label.", "Slows rather than stops under reduced motion, so activity stays visible."] },
  skeleton: { demo: () => <SkeletonDemo />, code: `<Skeleton height={14} width="60%" />`, notes: ["Shape it like the content that replaces it, so nothing moves at hand-off (try the button).", "Static under reduced motion. Use only when loading takes long enough to notice."] },
  "empty-state": { demo: () => <EmptyStateDemo />, code: `<EmptyState title="No invoices yet" description="…" action={<Button onClick={createDraft}>Create draft invoice</Button>} />`, notes: ["Explain what will appear and offer the next step. Not an apology."] },
  banner: { demo: () => <BannerDemo />, code: `<Banner tone="info" onDismiss={hide}>Scheduled maintenance on Saturday.</Banner>`, notes: ["Expands into place and pushes content down instead of covering it.", "Use for page-level conditions; use Alert for something about a section."] },
  "offline-indicator": { demo: () => <OfflineDemo />, code: `<OfflineIndicator />  // listens to online/offline events`, notes: ["Calm, non-blocking; no full-screen spinner.", "A brief “back online” confirmation that dismisses itself after 3 s."], edge: ["Reconnect while the offline banner is animating out"] },
  "progress-ring": { demo: () => <Stack direction="row" gap={4} align="center"><ProgressRing label="Upload" value={64} /><ProgressRing label="Upload" value={64} size={56} /><ProgressRing label="Waiting" /></Stack>, code: `<ProgressRing label="Upload" value={64} />`, notes: ["Shows the number only when there's room (≥ 36 px)."] },
};

