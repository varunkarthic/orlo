import { useMemo, useState } from "react";
import { materialVars, mixHex, contrast, semantic, type Material } from "@orlo/tokens";
import { SegmentedControl, Slider, ColorPicker, Button, Switch, Badge, Stack, Card, Icons, useMaterialStyle } from "@orlo/react";
import { Code, H2, PageHeader } from "../kit.tsx";

function Backdrop() {
  return <div className="mat-backdrop" aria-hidden="true"><span style={{ background: "#F08A57" }} /><span style={{ background: "#1F5FA8" }} /><span style={{ background: "#6CCB9A" }} /><span style={{ background: "#FFE600" }} /><p>Busy content behind the glass · Busy content behind the glass · Busy content behind the glass</p></div>;
}

export function Materials() {
  const [material, setMaterial] = useState<Material>("tinted");
  const [tint, setTint] = useState("#1F5FA8");
  const [blur, setBlur] = useState(20);
  const [opacity, setOpacity] = useState(55);
  const [sat, setSat] = useState(16);
  const [depth, setDepth] = useState(3);
  const [strength, setStrength] = useState(22);
  const [reduced, setReduced] = useState(false);
  const glass = useMemo(() => ({ blur, opacity: opacity / 100, saturation: sat / 10, depth, tintStrength: strength / 100 }), [blur, opacity, sat, depth, strength]);
  const style = useMaterialStyle(material, tint, glass);
  const panel = (scheme: "light" | "dark") => {
    const v = materialVars(material, scheme, glass, tint);
    const alpha = Number(v["--orlo-material-alpha"] ?? 1);
    return (
      <div className="mat-stage orlo-root" data-orlo-theme={scheme} data-orlo-material={material} data-orlo-transparency={reduced ? "reduced" : undefined} style={style}>
        <Backdrop />
        <div className="orlo-material mat-card">
          <Stack direction="row" gap={2} align="center"><Icons.Sparkles size={18} /><strong>{scheme === "light" ? "Light" : "Dark"} {material}</strong>{material !== "solid" && <Badge tone="neutral">{Math.round(alpha * 100)}% opaque</Badge>}</Stack>
          <p style={{ margin: 0 }}>Body text stays readable over anything behind it.</p>
          <Stack direction="row" gap={2}><Button size="sm">Primary</Button><Button size="sm" variant="subtle">Secondary</Button></Stack>
        </div>
      </div>
    );
  };
  const vL = materialVars(material, "light", glass, tint);
  const raised = Number(vL["--orlo-material-alpha"] ?? 1) > opacity / 100 + 0.005;
  return (
    <div className="wide">
      <PageHeader eyebrow="Styles" title="Materials" lead="Solid, frosted glass and tinted glass in any colour, each with light and dark appearances. Glass is applied selectively (overlays, sticky chrome, opted-in surfaces) and never at the cost of reading." />
      <div className="studio">
        <Card className="studio__controls">
          <SegmentedControl label="Material" value={material} onValueChange={(v) => setMaterial(v as Material)} options={[{ value: "solid", label: "Solid" }, { value: "glass", label: "Glass" }, { value: "tinted", label: "Tinted" }]} />
          {material === "tinted" && <ColorPicker label="Tint" value={tint} onValueChange={setTint} swatches={["#1F5FA8", "#A8370A", "#1F7A4D", "#7C3AED", "#FFE600", "#FFFFFF", "#000000"]} />}
          {material !== "solid" && <>
            <Slider label="Blur" value={blur} onValueChange={setBlur} min={0} max={48} format={(v) => `${v}px`} />
            <Slider label="Requested opacity" value={opacity} onValueChange={setOpacity} min={10} max={100} format={(v) => `${v}%`} />
            <Slider label="Saturation" value={sat} onValueChange={setSat} min={5} max={25} format={(v) => `${(v / 10).toFixed(1)}×`} />
            {material === "tinted" && <Slider label="Tint strength" value={strength} onValueChange={setStrength} min={0} max={40} format={(v) => `${v}%`} />}
          </>}
          <Slider label="Depth" value={depth} onValueChange={setDepth} min={0} max={5} marks={[0, 1, 2, 3, 4, 5]} />
          <Switch label="Reduce transparency" description="What people with the OS setting see." checked={reduced} onCheckedChange={setReduced} />
          {material !== "solid" && <p className="orlo-hint" style={{ margin: 0 }}>{raised ? `Readability guard raised opacity to ${Math.round(Number(vL["--orlo-material-alpha"]) * 100)}% so text stays ≥ 4.5:1 over black or white backdrops.` : "Requested opacity already keeps text readable."}</p>}
        </Card>
        <div className="mat-pair">{panel("light")}{panel("dark")}</div>
      </div>
      <H2>How the guard works</H2>
      <p>Text on glass sits on a mix of the surface and whatever is behind it. Orlo can’t know the backdrop, so it checks the worst cases, pure black and pure white, and raises opacity until body text passes 4.5:1 against both. Tints that would make the surface itself unreadable (yellow under light text, for example) are weakened first.</p>
      <table className="doc" tabIndex={0}><thead><tr><th>Scheme</th><th>Surface</th><th>Text on black backdrop</th><th>Text on white backdrop</th></tr></thead><tbody>
        {(["light", "dark"] as const).map((sc) => { const v = materialVars(material, sc, glass, tint); const a = Number(v["--orlo-material-alpha"] ?? 1); const [r, g, b] = (v["--orlo-material-bg"].match(/\d+/g) ?? ["255", "255", "255"]).map(Number); const hex = "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join(""); return <tr key={sc}><td>{sc}</td><td><span className="swatch-dot" style={{ background: v["--orlo-material-bg"] }} />{Math.round(a * 100)}%</td><td>{contrast(semantic[sc].fg, mixHex("#000000", hex, a)).toFixed(2)}:1</td><td>{contrast(semantic[sc].fg, mixHex("#FFFFFF", hex, a)).toFixed(2)}:1</td></tr>; })}
      </tbody></table>
      <H2>Fallbacks</H2>
      <ul className="notes"><li><code>prefers-reduced-transparency</code> or <code>reduceTransparency</code>: solid surfaces, no blur.</li><li>No <code>backdrop-filter</code> support: solid surface.</li><li>Forced colours: system Canvas with visible borders.</li><li>Progressive blur bands degrade to a plain fade.</li></ul>
      <H2>Use it</H2>
      <Code>{`<OrloProvider material="${material}"${material === "tinted" ? ` tint="${tint}"` : ""} glass={{ blur: ${blur}, opacity: ${opacity / 100}, saturation: ${sat / 10}, depth: ${depth}${material === "tinted" ? `, tintStrength: ${strength / 100}` : ""} }}>\n  <App />\n</OrloProvider>\n\n// Opt a surface in: <div className="orlo-material">…</div>`}</Code>
    </div>
  );
}
