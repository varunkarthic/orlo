import { useMemo, useState } from "react";
import { createTheme, themeToCss, contrast, semantic } from "@orlo/tokens";
import { Alert, ColorPicker, Button, Switch, Badge, Progress, Checkbox, Tabs, Stack, Card, TextField, Slider, Wordmark } from "@orlo/react";
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

export function ThemeStudio() {
  const [hex, setHex] = useState("#1F5FA8");
  const [dark, setDark] = useState(false);
  const theme = useMemo(() => createTheme(hex), [hex]);
  const css = themeToCss(theme, ".my-app");
  const t = dark ? theme.dark : theme.light;
  const vars = Object.fromEntries(Object.entries(t).map(([k, v]) => [`--orlo-color-${k}`, v])) as React.CSSProperties;
  const kept = theme.light.accent.toUpperCase() === hex.toUpperCase();
  return (
    <div className="wide">
      <PageHeader eyebrow="Get started" title="Theme Studio" lead="Pick one brand colour. Orlo keeps its hue and adjusts only lightness until every accent pairing passes WCAG 2.2 AA in light and dark." />
      <div className="studio">
        <Card className="studio__controls">
          <ColorPicker label="Brand colour" value={hex} onValueChange={setHex} swatches={["#1F5FA8", "#7C3AED", "#16A34A", "#FFE600", "#00C2FF", "#E11D48", "#A8370A"]} />
          <Switch label="Preview dark" checked={dark} onCheckedChange={setDark} />
          <p className="orlo-hint" style={{ margin: 0 }}>{kept ? "Your colour already passes; it's used as is." : `Adjusted to ${theme.light.accent} in light mode to reach 4.5:1.`}</p>
          <table className="doc" tabIndex={0}><tbody>
            <tr><td>Accent fill vs label</td><td>{contrast(t.accent, t["accent-fg"]).toFixed(2)}:1</td></tr>
            <tr><td>Accent text vs canvas</td><td>{contrast(t["accent-text"], dark ? semantic.dark.canvas : semantic.light.canvas).toFixed(2)}:1</td></tr>
          </tbody></table>
        </Card>
        <div className="studio__preview orlo-root" data-orlo-theme={dark ? "dark" : "light"} style={vars}>
          <Wordmark height={28} />
          <Tabs label="Preview" items={[{ value: "a", label: "Overview", content: null }, { value: "b", label: "Activity", content: null }]} />
          <Stack direction="row" gap={2} wrap><Button>Primary</Button><Button variant="subtle">Secondary</Button><Badge tone="accent">New</Badge></Stack>
          <TextField label="Project" defaultValue="Orlo" />
          <Stack direction="row" gap={4} wrap align="center"><Switch label="Sync" defaultChecked /><Checkbox label="Remember" defaultChecked /></Stack>
          <Slider label="Volume" defaultValue={60} />
          <Progress label="Uploading" value={64} />
          <p style={{ margin: 0 }}>Body text with <a href="#x" style={{ color: "var(--orlo-color-accent-text)" }}>an accent link</a>.</p>
        </div>
      </div>
      <H2>Export</H2>
      <p>Paste this after Orlo's styles. It overrides only the accent roles, inside the cascade, for <code>.my-app</code> (or change the selector to <code>:root</code>).</p>
      <Code>{css}</Code>
      <H2>In code</H2>
      <Code>{`import { createTheme, themeToCss } from "@orlo/tokens";\n\nconst css = themeToCss(createTheme("${hex}"), ":root");`}</Code>
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
