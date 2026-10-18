import { useMemo, useState } from "react";
import { createTheme, themeToCss, contrast, semantic } from "@orlo/tokens";
import { OrloProvider, Alert, ColorPicker, SegmentedControl, Button, Switch, Badge, Progress, Checkbox, Tabs, Stack, TextField, Slider, Wordmark, Avatar, Calendar, BarChart, Sparkline, EmptyState, Icons } from "@orlo/react";
import { Code, H2, PageHeader, Bullets, CardGrid, LinkCard } from "../kit.tsx";

export function StartOverview({ root }: { root: string }) {
  return (
    <>
      <PageHeader eyebrow="Get started" title="Start with Orlo" lead="Orlo is a design framework for React: tokens, a motion system and a complete component catalogue that share one visual and behavioural language." />
      <H2>What you get</H2>
      <Bullets items={[
        "A coherent default design: warm graphite neutrals, one persimmon accent, restrained shape and motion.",
        "Components that handle loading, failure, empty, disabled and offline states without extra code.",
        "One spring-based motion grammar that respects reduced-motion preferences automatically.",
        "Accessibility built into behaviour: focus management, keyboard models and announcements.",
        "Light and dark, density, right-to-left and a global no-image mode, all from one provider.",
      ]} />
      <H2>Next steps</H2>
      <CardGrid>
        <LinkCard href={`${root}start/installation/`} title="Installation" body="Add the packages, import the styles, wrap your app." />
        <LinkCard href={`${root}start/theme-studio/`} title="Theme Studio" body="Make Orlo yours with one colour, keeping contrast." />
        <LinkCard href={`${root}start/examples/`} title="Examples" body="Settings, dashboard and empty states built with Orlo." />
        <LinkCard href={`${root}foundations/principles/`} title="Principles" body="Why Orlo behaves the way it does." />
      </CardGrid>
    </>
  );
}

export function Installation() {
  return (
    <>
      <PageHeader eyebrow="Get started" title="Installation" lead="Orlo is a set of npm workspace packages. It isn't published to npm yet, so for now you use it from a clone." />
      <Alert tone="info" title="Pre-release">APIs may change before 1.0. Components are beta until they pass manual assistive-technology and visual review.</Alert>
      <H2>1. Get the code</H2>
      <Code>{`git clone https://github.com/varunkarthic/orlo.git\ncd orlo\nnpm install\nnpm run dev     # this documentation, live, at localhost:5173`}</Code>
      <H2>2. Add the styles</H2>
      <p>Import the tokens first, then the component styles. Both live in CSS cascade layers, so your own styles override them without specificity fights.</p>
      <Code>{`import "@orlo/tokens/css";\nimport "@orlo/react/styles.css";`}</Code>
      <H2>3. Wrap your app</H2>
      <Code>{`import { OrloProvider } from "@orlo/react";\n\nexport function App() {\n  return (\n    <OrloProvider theme="system" motion="system" images="on">\n      <Routes />\n    </OrloProvider>\n  );\n}`}</Code>
      <H2>4. Use components</H2>
      <Code>{`import { Button, Dialog, TextField, useToast } from "@orlo/react";\n\nfunction Rename() {\n  const { toast } = useToast();\n  return (\n    <Dialog\n      title="Rename project"\n      trigger={<Button>Rename…</Button>}\n      footer={(close) => (\n        <Button onClick={() => { close(); toast({ title: "Renamed", tone: "success" }); }}>Save</Button>\n      )}\n    >\n      <TextField label="Project name" />\n    </Dialog>\n  );\n}`}</Code>
      <H2>Requirements</H2>
      <p>React 18 or 19, current Chrome, Edge, Firefox and Safari. Peer dependencies: <code>react</code>, <code>react-dom</code>. Runtime dependency: <code>motion</code>.</p>
    </>
  );
}

type Scene = "settings" | "dashboard" | "calendar" | "feedback";
type Density = "compact" | "comfortable" | "touch";

function SceneView({ scene }: { scene: Scene }) {
  if (scene === "dashboard") return (
    <div className="scene scene--dash">
      {[["Revenue", "€48.2k", [3, 4, 3.6, 5, 4.8, 6, 6.4]], ["Active users", "12,480", [8, 7.5, 9, 9.4, 10, 9.8, 11]], ["Churn", "1.8%", [3, 2.8, 2.9, 2.4, 2.2, 2, 1.8]]].map(([k, v, d]) => (
        <div key={k as string} className="scene__stat orlo-material"><span className="orlo-hint">{k as string}</span><strong>{v as string}</strong><Sparkline label={k as string} data={d as number[]} width={140} height={32} /></div>
      ))}
      <div className="scene__wide"><BarChart title="Orders by weekday" labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} series={[{ name: "Orders", data: [42, 51, 47, 60, 72, 38, 30] }]} height={200} /></div>
    </div>
  );
  if (scene === "calendar") return (
    <div className="scene scene--cal">
      <div className="orlo-material scene__panel"><Calendar label="Pick a day" /></div>
      <div className="orlo-material scene__panel">
        <strong>Today</strong>
        <ul className="scene__agenda">{[["09:30", "Design review", "accent"], ["12:00", "Lunch with Ana", "neutral"], ["15:00", "Ship v0.4 notes", "success"]].map(([t, l, tone]) => <li key={t}><span className="orlo-hint">{t}</span><span>{l}</span><Badge tone={tone as "accent"} dot>{tone === "success" ? "Done" : tone === "accent" ? "Next" : "Later"}</Badge></li>)}</ul>
        <Button variant="accent" start={<Icons.Plus size={16} />}>New event</Button>
      </div>
    </div>
  );
  if (scene === "feedback") return (
    <div className="scene scene--feedback">
      <Alert tone="info" title="Scheduled maintenance">Sunday 02:00–03:00 UTC. Nothing is lost.</Alert>
      <Alert tone="success" title="Invoice sent" />
      <Alert tone="warning" title="Storage almost full">You have used 92% of 10 GB.</Alert>
      <Alert tone="error" title="Payment failed">The card was declined. Try another card.</Alert>
      <Progress label="Uploading report.pdf" value={64} />
      <div className="orlo-material scene__panel"><EmptyState icon={<Icons.Inbox size={28} />} title="No messages yet" description="When someone writes to you, it shows up here." action={<Button variant="subtle">Invite a teammate</Button>} /></div>
    </div>
  );
  return (
    <div className="scene scene--settings orlo-material">
      <div className="scene__head"><Avatar name="Theo Lindqvist" size="lg" /><div><strong>Theo Lindqvist</strong><div className="orlo-hint">theo@example.com</div></div><Badge tone="accent">Pro</Badge></div>
      <Tabs label="Settings" items={[{ value: "a", label: "Profile", content: null }, { value: "b", label: "Billing", content: null }, { value: "c", label: "Team", content: null }]} />
      <TextField label="Display name" defaultValue="Theo" />
      <Stack direction="row" gap={4} wrap align="center"><Switch label="Sync" defaultChecked /><Checkbox label="Remember me" defaultChecked /></Stack>
      <Slider label="Volume" defaultValue={60} />
      <p style={{ margin: 0 }}>Body text with <a href="#x" style={{ color: "var(--orlo-color-accent-text)" }}>an accent link</a>.</p>
      <Stack direction="row" gap={2} justify="end"><Button variant="ghost">Cancel</Button><Button variant="accent">Save</Button></Stack>
    </div>
  );
}

export function ThemeStudio() {
  const [hex, setHex] = useState("#1F5FA8");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [material, setMaterial] = useState<"solid" | "glass">("solid");
  const [density, setDensity] = useState<Density>("comfortable");
  const [scene, setScene] = useState<Scene>("settings");
  const theme = useMemo(() => createTheme(hex), [hex]);
  const t = theme[mode];
  const vars = Object.fromEntries(Object.entries(t).map(([k, v]) => [`--orlo-color-${k}`, v])) as React.CSSProperties;
  const kept = theme.light.accent.toUpperCase() === hex.toUpperCase();
  const canvas = semantic[mode].canvas;
  return (
    <div className="wide">
      <PageHeader eyebrow="Get started" title="Theme Studio" lead="Pick one brand colour and see it in real screens. Orlo keeps the hue and moves only lightness until every accent pairing passes WCAG 2.2 AA, in light and dark." />
      <div className="workshop">
        <aside className="workshop__controls">
          <ColorPicker label="Brand colour" value={hex} onValueChange={setHex} swatches={["#1F5FA8", "#7C3AED", "#16A34A", "#FFE600", "#00C2FF", "#E11D48", "#A8370A"]} />
          <SegmentedControl label="Appearance" value={mode} onValueChange={(v) => setMode(v as "light" | "dark")} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
          <SegmentedControl label="Material" value={material} onValueChange={(v) => setMaterial(v as "solid" | "glass")} options={[{ value: "solid", label: "Solid" }, { value: "glass", label: "Glass" }]} />
          <SegmentedControl label="Density" value={density} onValueChange={(v) => setDensity(v as Density)} options={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Default" }, { value: "touch", label: "Touch" }]} />
          <dl className="workshop__checks">
            <div><dt>Accent fill vs label</dt><dd>{contrast(t.accent, t["accent-fg"]).toFixed(2)}:1</dd></div>
            <div><dt>Accent text vs canvas</dt><dd>{contrast(t["accent-text"], canvas).toFixed(2)}:1</dd></div>
          </dl>
          <p className="orlo-hint" style={{ margin: 0 }}>{kept ? "Your colour already passes and is used as is." : `Adjusted to ${theme.light.accent} in light mode to reach 4.5:1.`}</p>
        </aside>
        <div className="workshop__stage">
          <SegmentedControl label="Scene" size="sm" value={scene} onValueChange={(v) => setScene(v as Scene)} options={[{ value: "settings", label: "Settings" }, { value: "dashboard", label: "Dashboard" }, { value: "calendar", label: "Calendar" }, { value: "feedback", label: "Feedback" }]} />
          <OrloProvider theme={mode} material={material} density={density} className="workshop__preview">
            <div style={vars} className="workshop__vars"><SceneView scene={scene} /></div>
          </OrloProvider>
        </div>
      </div>
      <H2>Export</H2>
      <p>Paste the CSS after Orlo's styles. It overrides only the accent roles, inside the cascade, for <code>.my-app</code> (or change the selector to <code>:root</code>). Material and density are provider props.</p>
      <Code>{themeToCss(theme, ".my-app")}</Code>
      <Code>{`import { createTheme, themeToCss } from "@orlo/tokens";\n\nconst css = themeToCss(createTheme("${hex}"), ":root");\n\n<OrloProvider material="${material}" density="${density}">\n  <App />\n</OrloProvider>`}</Code>
    </div>
  );
}

export function About() {
  return (
    <>
      <PageHeader eyebrow="Get started" title="About the name" lead={<><em>Orlo</em> (OR-loh) is Italian for an edge, rim or hem.</>} />
      <Wordmark height={64} style={{ marginBlock: 8 }} />
      <p>A hem is the careful finish that holds a garment together. Nobody looks at it first, but everyone notices when it's missing. Interfaces are the same: the moments between states, the failure paths and the edges where surfaces meet decide whether a product feels finished.</p>
      <p>That is the whole idea of Orlo, and the reason for its line: <strong>Nothing is an afterthought.</strong></p>
      <H2>What Orlo is not</H2>
      <Bullets items={["Not an Apple or Material skin. Orlo studies their motion principles and builds its own identity.", "Not a re-coloured fork of another library. Every component and primitive is written for Orlo.", "Not finished. Components are beta until they pass manual assistive-technology review."]} />
      <p className="orlo-hint">Meaning per the Cambridge Italian–English Dictionary entry for “orlo”. This is not trademark clearance.</p>
    </>
  );
}
