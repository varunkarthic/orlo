import { useEffect, useMemo, useRef, useState } from "react";
import {
  Text, Heading, Prose, Truncate, AsyncContent, useAsync, VideoPlayer, AudioPlayer, Embed, MapView, DocumentViewer, DataGrid, LineChart, BarChart, DonutChart,
  Markdown, MarkdownEditor, ChatThread, Composer, ToolRun, ResponseFeedback, AppShell, TabStrip, StatusBar, Kanban, StatCard, Badge, Button, Stack, Card, Icons,
  SegmentedControl, Skeleton, Switch, ProgressiveBlur, type ChatMessage, type KanbanColumn, type DocTab, type GridColumn, type ToolStep,
} from "@orlo/react";
import type { Doc } from "./types.ts";

/** Site root for local demo media, resolved after mount so server and client markup match. */
function useBase() { const [b, setB] = useState<string | null>(null); useEffect(() => setB((document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null)?.href.replace(/manifest\.webmanifest$/, "") ?? "./"), []); return b; }
function WithBase({ children }: { children: (base: string) => React.ReactNode }) { const b = useBase(); return b === null ? <Skeleton width="100%" height={120} /> : <>{children(b)}</>; }

function AsyncDemo() {
  const [mode, setMode] = useState("success");
  const [n, setN] = useState(0);
  const result = useAsync<string[]>((signal) => new Promise((res, rej) => {
    const t = setTimeout(() => (mode === "error" ? rej(new Error("500")) : res(mode === "empty" ? [] : ["Linen notebook", "Brass pen", "Archive box"])), mode === "fast" ? 60 : 1200);
    signal.addEventListener("abort", () => clearTimeout(t));
  }), [mode, n]);
  return <Stack gap={3} style={{ inlineSize: "min(100%, 28rem)" }}>
    <SegmentedControl label="Simulate" size="sm" value={mode} onValueChange={(v) => { setMode(v); setN((x) => x + 1); }} options={[{ value: "success", label: "Slow" }, { value: "fast", label: "Fast (60 ms)" }, { value: "empty", label: "Empty" }, { value: "error", label: "Error" }]} />
    <Card><AsyncContent result={result} minHeight={120} errorTitle="Couldn’t load products" errorDetail={() => "The server returned 500. Nothing was changed."} loading={<Stack gap={2}><Skeleton height={14} width="60%" /><Skeleton height={14} width="40%" /><Skeleton height={14} width="52%" /></Stack>} empty={<p className="orlo-hint">No products yet.</p>}>
      {(items) => <ul style={{ margin: 0, paddingInlineStart: 18 }}>{items.map((i) => <li key={i}>{i}</li>)}</ul>}
    </AsyncContent></Card>
    <Button variant="ghost" size="sm" onClick={() => setN((x) => x + 1)}>Reload (keeps data visible)</Button>
  </Stack>;
}

type Row = { id: string; name: string; team: string; city: string; score: number; joined: string };
const teams = ["Design", "Platform", "Growth", "Research", "Support"], cities = ["Rome", "London", "Kolkata", "Tokyo", "Lagos", "Lima", "Oslo"], first = ["Ada", "Grace", "Alan", "Katherine", "Edsger", "Barbara", "Margaret", "Linus", "Radia", "Tim"], last = ["Lovelace", "Hopper", "Turing", "Johnson", "Dijkstra", "Liskov", "Hamilton", "Torvalds", "Perlman", "Berners-Lee"];
const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: `u${i + 1}`, name: `${first[i % 10]} ${last[(i * 7) % 10]}`, team: teams[(i * 3) % 5], city: cities[(i * 5) % 7], score: Math.round(((Math.sin(i * 1.7) + 1) / 2) * 1000) / 10, joined: new Date(2020, i % 12, (i % 27) + 1).toISOString().slice(0, 10) }));
function GridDemo() {
  const rows = useMemo(() => makeRows(10000), []);
  const [sel, setSel] = useState<string[]>([]);
  const cols: GridColumn<Row>[] = [{ key: "name", header: "Name", width: 190, sortable: true, pin: true }, { key: "team", header: "Team", width: 130, sortable: true, render: (r) => <Badge tone="neutral">{r.team}</Badge> }, { key: "city", header: "City", width: 120, sortable: true }, { key: "score", header: "Score", width: 110, sortable: true, align: "end" }, { key: "joined", header: "Joined", width: 130, sortable: true }];
  return <div style={{ inlineSize: "100%" }}><DataGrid label="People" columns={cols} rows={rows} rowKey={(r) => r.id} selectable selection={sel} onSelectionChange={setSel} height={380} /></div>;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function LineDemo() {
  const [y, setY] = useState("2026");
  const s = y === "2026" ? [[12, 15, 14, 19, 24, 22, 27, 30, 28, 34, 38, 41], [8, 9, 11, null, null, 14, 16, 18, 17, 21, 22, 25]] : [[6, 8, 9, 11, 12, 14, 13, 16, 18, 17, 20, 22], [4, 5, 6, 7, 8, 9, 9, 10, 12, 12, 13, 15]];
  return <Stack gap={3} style={{ inlineSize: "100%" }}><SegmentedControl label="Year" size="sm" value={y} onValueChange={setY} options={[{ value: "2025", label: "2025" }, { value: "2026", label: "2026" }]} /><LineChart title="Monthly active teams" description="Thousands. A sensor outage in April–May is shown as a gap, not zero." labels={months} series={[{ name: "Paid", data: s[0] }, { name: "Trial", data: s[1] }]} area format={(n) => `${n}k`} /></Stack>;
}

const longMd = "## Release notes\n\nOrlo **0.2** focuses on *motion* and `materials`.\n\n- Springs now carry gesture velocity\n- [x] Glass with a readability guard\n- [ ] Visual regression baselines\n\n> Nothing is an afterthought.\n\n```\nnpm run build:rtd\n```\n\nRead the [docs](https://github.com/varunkarthic/orlo).";

function ChatDemo() {
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { id: "s", role: "system", content: "This is a local simulation. No data leaves your browser." },
    { id: "1", role: "user", content: "How does Orlo stop tooltips flickering?", author: "Ada Lovelace", time: new Date("2026-10-18T09:30:00Z") },
    { id: "2", role: "assistant", content: "A short **grace period** keeps the tooltip open while the pointer crosses the gap, and a *warm* window lets neighbours open instantly.", status: "done", citations: [{ id: "c1", title: "Tooltip guidelines", href: "#", source: "Orlo docs" }] },
  ]);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);
  const reply = "Orlo animates with **springs** rather than fixed durations, so interrupted motion keeps its velocity. Under reduced motion, travel becomes a short fade.";
  const send = (t: string) => {
    const id = String(Date.now());
    setMsgs((m) => [...m, { id: id + "u", role: "user", content: t, author: "Ada Lovelace", time: new Date() }, { id, role: "assistant", content: "", status: "streaming" }]);
    setBusy(true); let i = 0;
    timer.current = setInterval(() => { i += 3; setMsgs((m) => m.map((x) => (x.id === id ? { ...x, content: reply.slice(0, i), status: i >= reply.length ? "done" : "streaming" } : x))); if (i >= reply.length) { clearInterval(timer.current); setBusy(false); } }, 40);
  };
  const stop = () => { clearInterval(timer.current); setBusy(false); setMsgs((m) => m.map((x) => (x.status === "streaming" ? { ...x, status: "stopped" } : x))); };
  return <Stack gap={3} style={{ inlineSize: "100%" }}><ChatThread messages={msgs} /><Composer onSend={send} onStop={stop} busy={busy} suggestions={["Explain springs", "What is glass?"]} /></Stack>;
}

function ToolDemo() {
  const [k, setK] = useState(0);
  const labels = ["Read the brief", "Search component docs", "Generate layout", "Run accessibility checks", "Write summary"];
  useEffect(() => { if (k > labels.length) return; const t = setTimeout(() => setK((x) => x + 1), 900); return () => clearTimeout(t); }, [k, labels.length]);
  const steps: ToolStep[] = labels.map((l, i) => ({ label: l, status: i < k ? (i === 3 && k > 4 ? "failed" : "done") : i === k ? "running" : "pending", detail: i === 3 && k > 4 ? "2 contrast issues found in the draft" : undefined }));
  return <Stack gap={3} style={{ inlineSize: "min(100%, 30rem)" }}><ToolRun title="Building the settings screen" steps={steps} /><div><Button variant="ghost" size="sm" onClick={() => setK(0)}>Replay</Button></div></Stack>;
}

function ShellDemo() {
  const [tabs, setTabs] = useState<DocTab[]>([{ id: "a", title: "Button.tsx", icon: <Icons.FileCode size={14} /> }, { id: "b", title: "Dialog.tsx", dirty: true, icon: <Icons.FileCode size={14} /> }, { id: "c", title: "tokens.ts", icon: <Icons.FileCode size={14} /> }, { id: "d", title: "README.md", icon: <Icons.FileText size={14} /> }]);
  const [active, setActive] = useState("b");
  return <div style={{ inlineSize: "100%" }}><AppShell height={380}
    header={<><strong>orlo</strong><span className="orlo-hint" style={{ display: "inline" }}>main</span></>}
    sidebar={<Stack gap={1}>{["src", "components", "Button.tsx", "Dialog.tsx", "tokens.ts", "README.md"].map((f, i) => <div key={f} style={{ paddingInlineStart: i > 1 && i < 4 ? 24 : 8, paddingBlock: 4, fontSize: 14, borderRadius: 6 }}>{f}</div>)}</Stack>}
    inspector={<Stack gap={2}><strong>Properties</strong><Switch label="Format on save" defaultChecked /></Stack>}
    status={<StatusBar start={<span>Ln 12, Col 4</span>} message={tabs.find((t) => t.id === active)?.dirty ? "Unsaved changes" : ""} end={<span>UTF-8 · TypeScript</span>} />}>
    <TabStrip tabs={tabs} active={active} onActiveChange={setActive} onClose={(id) => setTabs((t) => t.filter((x) => x.id !== id))} onReorder={setTabs} />
    <div style={{ padding: 16, fontFamily: "var(--orlo-font-mono)", fontSize: 13, color: "var(--orlo-color-fg-muted)" }}>{`// ${tabs.find((t) => t.id === active)?.title ?? "No file open"}`}</div>
  </AppShell></div>;
}

function KanbanDemo() {
  const [cols, setCols] = useState<KanbanColumn[]>([
    { id: "todo", title: "To do", cards: [{ id: "k1", title: "Audit focus return", meta: "A11y" }, { id: "k2", title: "Glass contrast guard", meta: "Tokens" }] },
    { id: "doing", title: "In progress", limit: 2, cards: [{ id: "k3", title: "Slider physics", meta: "Motion" }] },
    { id: "done", title: "Done", cards: [{ id: "k4", title: "Icon set v2", meta: "Brand" }] },
  ]);
  return <div style={{ inlineSize: "100%" }}><Kanban columns={cols} onChange={setCols} label="Roadmap" /></div>;
}

export const advanced: Record<string, Doc> = {
  "progressive-blur": {
    demo: () => <div style={{ position: "relative", inlineSize: "min(100%, 26rem)", blockSize: 220, overflow: "hidden", borderRadius: 14, border: "1px solid var(--orlo-color-border)", background: "var(--orlo-color-canvas)" }}>
      <div style={{ position: "relative", zIndex: 2, padding: "10px 14px", background: "var(--orlo-color-canvas)", borderBlockEnd: "1px solid var(--orlo-color-border)", fontWeight: 600 }}>Sticky header<ProgressiveBlur side="top" size="40px" /></div>
      <div style={{ blockSize: 170, overflow: "auto", padding: "0 14px" }} tabIndex={0} aria-label="Scrollable sample">{Array.from({ length: 14 }, (_, i) => <p key={i} style={{ margin: "10px 0" }}>Line {i + 1}: scroll me under the header and watch the glyphs soften instead of being cut.</p>)}</div>
    </div>,
    code: `<header style={{ position: "sticky", top: 0 }}>
  …
  <ProgressiveBlur side="top" size="32px" />
</header>`,
    props: [["side", '"top" | "bottom" | "start" | "end"', "Strongest edge."], ["size", "string", "Band size."], ["strength", "number", "Max blur px."], ["layers", "number", "Default 5."], ["fade", "boolean", "Also fade to the canvas colour."]],
    notes: ["Five backdrop-filter layers with doubling radius and overlapping masks: blur grows smoothly instead of stepping.", "Used under this site's top bar and component tabs: scroll this page and look at the edges.", "Plain fade under reduced transparency or without backdrop-filter support."],
  },
  text: { demo: () => <Stack gap={2}><Text size="xl" weight="semibold">Finished edges</Text><Text tone="muted">Supporting text in the muted tone.</Text><Text numeric>1,111.10 · 9,999.99</Text><div style={{ inlineSize: 220 }}><Text truncate>A single line that is far too long to fit and ends with an ellipsis</Text></div><div style={{ inlineSize: 260 }}><Text truncate={2}>Two whole lines at most, then an ellipsis. The full sentence stays in the DOM for find-in-page and screen readers.</Text></div></Stack>, code: `<Text size="lg" tone="muted" truncate={2}>…</Text>`, props: [["size", "2xs … 5xl", ""], ["weight", "regular | medium | semibold | bold", ""], ["tone", "default | muted | accent | success | warning | error", ""], ["truncate", "boolean | number", "One line, or N whole lines."], ["numeric", "boolean", "Tabular figures."], ["as", "ElementType", ""]], notes: ["Truncation clamps whole lines only, never a half-visible line.", "Paragraphs use text-wrap: pretty; headings use balance."] },
  heading: { demo: () => <Stack gap={2}><Heading level={2} size="3xl">Level 2, size 3xl</Heading><Heading level={3} size="lg">Level 3, size lg</Heading></Stack>, code: `<Heading level={2} size="xl">Settings</Heading>`, notes: ["Choose the semantic level for the document outline and the size for the design; they're independent."] },
  prose: { demo: () => <Prose><h2>Prose</h2><p>Long-form text with a comfortable measure and rhythm. <a href="#p">Links</a>, <code>code</code> and lists are styled.</p><ul><li>First point</li><li>Second point</li></ul><blockquote>Nothing is an afterthought.</blockquote><p lang="ja">日本語の文章も自然に改行されます。</p><p lang="ar" dir="rtl">النص العربي يحصل على ارتفاع سطر مناسب.</p></Prose>, code: `<Prose>{article}</Prose>`, notes: ["CJK uses strict line breaking; Arabic and Devanagari get taller line heights and no letter-spacing."] },
  truncate: { demo: () => <Stack gap={2} style={{ inlineSize: "min(100%, 18rem)" }}>{["quarterly-financial-report-2026-final-v3-approved.pdf", "/Users/varun/Projects/orlo/packages/react/src/components/DataGrid.tsx", "ord_9f3a1c7e2b4d6f8a0c1e3b5d7f9a2c4e"].map((t) => <div key={t} style={{ padding: 8, border: "1px solid var(--orlo-color-border)", borderRadius: 8 }}><Truncate text={t} /></div>)}</Stack>, code: `<Truncate text={fileName} />`, notes: ["Keeps the start and the extension; recomputes as the container resizes.", "Screen readers and copy get the whole string."] },
  "async-content": { demo: () => <AsyncDemo />, code: `const result = useAsync((signal) => fetch(url, { signal }).then((r) => r.json()), [url]);\n<AsyncContent result={result} loading={<Skeleton… />}>{(data) => <List data={data} />}</AsyncContent>`, notes: ["The spinner waits 300 ms before appearing and stays at least 500 ms once shown: fast requests never flash, slow ones never flicker.", "Reloading keeps the last data visible with a quiet “Updating…” badge.", "Offline is reported separately from failure, with reassurance instead of blame."], edge: ["Request finishes in 60 ms (try Fast)", "Request superseded by a newer one (aborted)", "Empty array treated as empty, not success"] },
  "video-player": { demo: () => <div style={{ inlineSize: "100%" }}><WithBase>{(b) => <VideoPlayer src={`${b}media/orlo-motion.webm`} title="Orlo motion recording" />}</WithBase></div>, code: `<VideoPlayer src="/clip.mp4" poster="/poster.jpg" title="Product tour" captions={[{ src: "/en.vtt", label: "English", srclang: "en" }]} />`, notes: ["Nothing downloads until Play; never autoplays with sound.", "Loading, buffering and errors are distinct, with a download fallback.", "Shortcuts: Space/K play, J/L ±10 s, M mute, F full screen, C captions. Controls fade when idle but return on any pointer or focus."], keyboard: [["Space / K", "Play or pause"], ["J / L", "Back / forward 10 s"], ["M", "Mute"], ["F", "Full screen"], ["C", "Captions"]] },
  "audio-player": { demo: () => <div style={{ inlineSize: "min(100%, 28rem)" }}><WithBase>{(b) => <AudioPlayer src={`${b}media/tones.wav`} title="Four tones" artist="Generated test signal" />}</WithBase></div>, code: `<AudioPlayer src="/episode.mp3" title="Episode 4" artist="Orlo FM" />`, notes: ["Playback rate cycles 0.75× → 2×.", "A missing file shows an inline error instead of a dead button."] },
  embed: { demo: () => <div style={{ inlineSize: "100%" }}><Embed src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" title="Example video" provider="YouTube" /></div>, code: `<Embed src="https://www.youtube-nocookie.com/embed/…" title="Talk" provider="YouTube" />`, notes: ["Nothing is requested from the provider until the person chooses to load it.", "“Always load” is remembered per host in this browser only.", "Sandboxed iframe; slow loads offer a direct link after 8 s."], semantics: ["The gate is a normal region with buttons; the iframe has a title."] },
  "map-view": { demo: () => <div style={{ inlineSize: "100%" }}><MapView lat={41.8986} lon={12.4768} label="Pantheon, Rome" /></div>, code: `<MapView lat={41.8986} lon={12.4768} label="Pantheon, Rome" />`, notes: ["Shows the place, coordinates and a directions link without any network request.", "The interactive OpenStreetMap view loads only after consent."] },
  "document-viewer": { demo: () => <div style={{ inlineSize: "min(100%, 30rem)" }}><WithBase>{(b) => <DocumentViewer src={`${b}media/orlo-brand.pdf`} title="Orlo brand sheet.pdf" ratio="1 / 1.29" />}</WithBase></div>, code: `<DocumentViewer src="/files/report.pdf" title="Report.pdf" />`, notes: ["Checks the file first; if it can't be loaded, offers a download instead of an empty frame."] },
  "data-grid": { demo: () => <GridDemo />, code: `<DataGrid label="People" columns={columns} rows={rows} rowKey={(r) => r.id} selectable height={420} />`, props: [["columns", "GridColumn[]", "{ key, header, width, sortable, align, pin, render, sortValue }"], ["rows / rowKey", "", ""], ["selectable / selection / onSelectionChange", "", "Shift+click selects a range."], ["onRowActivate", "(row) => void", "Enter or double-click."], ["rowHeight / height", "number", ""], ["loading / empty", "", "Skeleton rows; designed empty."]], notes: ["10,000 rows above, but only the visible window (~15 rows) is in the DOM.", "Focus survives virtualisation: arrow keys scroll the focused cell into the window first.", "Columns resize by dragging the header edge or with Alt+←/→ on a header."], keyboard: [["Arrows", "Move between cells"], ["Home / End", "Row start / end"], ["Ctrl+Home / Ctrl+End", "First / last cell"], ["Page Up / Page Down", "Move by a screen"], ["Space", "Select row (Shift extends)"], ["Ctrl+A", "Select all"], ["Enter", "Sort (header) or open (row)"], ["Alt+← / Alt+→", "Resize column (header)"]], semantics: ["role=grid with aria-rowcount, aria-rowindex, aria-colindex, aria-selected and aria-sort; one tab stop."] },
  "line-chart": { demo: () => <LineDemo />, code: `<LineChart title="Active teams" labels={months} series={[{ name: "Paid", data }]} area />`, notes: ["Nulls break the line: missing data never pretends to be zero.", "Series differ by colour, dash and marker shape (colour-vision safe).", "Tab to the chart, then ← → to read each point; values are announced. Data table one click away.", "Switching data morphs the line instead of redrawing it."] },
  "bar-chart": { demo: () => <div style={{ inlineSize: "100%" }}><BarChart title="Net change by region" description="Negative values hang below the zero line." labels={["North", "South", "East", "West", "Central"]} series={[{ name: "Q3", data: [12, -4, 8, 15, -2] }, { name: "Q4", data: [16, 3, -6, 18, 5] }]} /></div>, variants: [{ title: "Stacked", demo: () => <div style={{ inlineSize: "100%" }}><BarChart stacked title="Tickets by channel" labels={["Mon", "Tue", "Wed", "Thu", "Fri"]} series={[{ name: "Email", data: [12, 18, 9, 14, 20] }, { name: "Chat", data: [8, 6, 12, 10, 7] }, { name: "Phone", data: [3, 4, 2, 5, 3] }]} /></div> }], code: `<BarChart title="Revenue" labels={quarters} series={[{ name: "2026", data }]} stacked />`, notes: ["True zero baseline for negatives.", "Tab in, then arrows: ← → categories, ↑ ↓ series."] },
  "donut-chart": { demo: () => <div style={{ inlineSize: "min(100%, 34rem)" }}><DonutChart title="Traffic sources" data={[{ label: "Search", value: 4200 }, { label: "Direct", value: 2900 }, { label: "Social", value: 1300 }, { label: "Referral", value: 800 }, { label: "Email", value: 400 }]} /></div>, code: `<DonutChart title="Traffic" data={[{ label: "Search", value: 4200 }]} />`, notes: ["Each segment is focusable and announces label, value and percentage.", "Use for up to about six parts; otherwise use a bar chart."] },
  markdown: { demo: () => <div style={{ inlineSize: "min(100%, 34rem)" }}><Markdown source={longMd} /></div>, code: `<Markdown source={text} />`, notes: ["Renders to React elements: no innerHTML, so injected scripts can't run.", "Links with unsafe schemes (javascript:, data:) are neutralised."] },
  "markdown-editor": { demo: () => <div style={{ inlineSize: "100%" }}><MarkdownEditor label="Description" defaultValue={longMd} status={<span className="orlo-hint">Saved just now</span>} /></div>, code: `<MarkdownEditor label="Description" value={md} onValueChange={setMd} />`, keyboard: [["⌘/Ctrl+B", "Bold"], ["⌘/Ctrl+I", "Italic"], ["⌘/Ctrl+E", "Inline code"], ["⌘/Ctrl+K", "Link"]], notes: ["A real textarea: native undo, spellcheck, IME and screen readers keep working.", "Toolbar buttons keep focus and selection in the text."] },
  "chat-thread": { demo: () => <ChatDemo />, code: `<ChatThread messages={messages} />`, notes: ["Auto-scrolls only while you're at the bottom; if you scroll up, it offers “Jump to latest” instead.", "Streaming shows a caret (static under reduced motion) and announces completion, not every token.", "Stopped and interrupted answers say so, with retry."] },
  composer: { demo: () => <ChatDemo />, code: `<Composer onSend={send} onStop={stop} busy={generating} suggestions={["Summarise"]} />`, keyboard: [["Enter", "Send"], ["Shift+Enter", "New line"]], notes: ["Never sends mid-IME composition.", "Becomes a Stop button while a reply is generating."] },
  "tool-run": { demo: () => <ToolDemo />, code: `<ToolRun title="Building the report" steps={[{ label: "Fetch data", status: "done" }, { label: "Chart", status: "running" }]} />`, notes: ["Status per step: pending, running, done, failed, skipped. Completion is never implied early.", "Failures stay visible with detail; the summary reads “Needs attention”."] },
  "response-feedback": { demo: () => <ResponseFeedback />, code: `<ResponseFeedback onFeedback={send} />`, notes: ["Reversible: pressing again clears it."] },
  "app-shell": { demo: () => <ShellDemo />, code: `<AppShell header={…} sidebar={<Tree />} inspector={<Props />} status={<StatusBar />}>…</AppShell>`, notes: ["Sidebar collapses with a measured width animation and resizes by drag or keyboard.", "The shell answers to its own width (container queries): the inspector hides below 760 px and the sidebar overlays below 480 px."] },
  "tab-strip": { demo: () => <ShellDemo />, code: `<TabStrip tabs={tabs} active={id} onActiveChange={setId} onClose={close} onReorder={setTabs} />`, keyboard: [["← / →", "Switch tab"], ["Ctrl+Shift+← / →", "Move tab"], ["Delete", "Close tab"], ["Middle click", "Close tab"]], notes: ["Closing the active tab activates its neighbour and keeps focus in the strip.", "Unsaved dot is announced as “unsaved changes”."] },
  "status-bar": { demo: () => <div style={{ inlineSize: "100%", border: "1px solid var(--orlo-color-border)", borderRadius: 8 }}><StatusBar start={<><span>main</span><span>0 errors</span></>} message="Saved" end={<span>Spaces: 2</span>} /></div>, code: `<StatusBar start={…} end={…} message="Saved" />`, notes: ["Transient messages are announced politely."] },
  kanban: { demo: () => <KanbanDemo />, code: `<Kanban columns={columns} onChange={setColumns} />`, keyboard: [["Space / Enter", "Pick up / drop"], ["↑ / ↓", "Move within column"], ["← / →", "Move to neighbouring column"], ["Escape", "Cancel"]], notes: ["Pointer drag or a complete keyboard path; every move is announced with column and position.", "WIP limits are shown in numbers and turn red when exceeded."] },
  "stat-card": { demo: () => <div className="grid" style={{ inlineSize: "100%" }}><StatCard label="Revenue" value="€48,210" delta={12.4} trend={[20, 24, 22, 27, 30, 29, 34]} /><StatCard label="Churn" value="2.1%" delta={0.6} positive="down" deltaLabel="vs last month" trend={[1.4, 1.6, 1.5, 1.9, 2.0, 2.1]} /><StatCard label="Uptime" value="99.98%" delta={0} /></div>, code: `<StatCard label="Revenue" value="€48,210" delta={12.4} trend={series} />`, notes: ["Direction appears as icon, sign and words.", "`positive=\"down\"` for metrics where less is better (churn, latency)."] },
};
