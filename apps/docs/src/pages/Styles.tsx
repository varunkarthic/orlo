import { primitive, semantic, contrast, radius, space, type as typeTokens, density } from "@orlo/tokens";
import { Icons, Card, Button, Stack, SegmentedControl, Badge, Tooltip, Callout, Tabs, TextField } from "@orlo/react";
import { useState } from "react";
import { CardGrid, H2, LinkCard, PageHeader, Stage, SpecTable } from "../kit.tsx";

const Ramp = ({ ramp, name }: { ramp: Record<string, string>; name: string }) => (
  <div className="swatches">{Object.entries(ramp).map(([k, v]) => <div className="swatch" key={k}><div style={{ background: v }} /><p><strong>{name} {k}</strong><code>{v}</code></p></div>)}</div>
);

export function StylesOverview({ root }: { root: string }) {
  return (
    <>
      <PageHeader eyebrow="Styles" title="Styles" lead="The visual language: editorial precision, tactile naturalness, visual restraint. Recognisable even with motion turned off." />
      <CardGrid>
        <LinkCard href={`${root}styles/color/`} title="Color" body="Warm graphite neutrals and one persimmon accent, contrast-tested." art={<div className="swatchrow">{["fg", "fg-muted", "surface-selected", "accent"].map((c) => <span key={c} style={{ background: `var(--orlo-color-${c})` }} />)}</div>} />
        <LinkCard href={`${root}styles/typography/`} title="Typography" body="Generous hierarchy, clear numerals, fluid display sizes." art={<span style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em" }}>Aa 123</span>} />
        <LinkCard href={`${root}styles/spacing/`} title="Spacing & layout" body="8pt grid, component rhythm, tab bars and touch targets from Apple HIG and Material 3." art={<Stack direction="row" gap={2} align="center"><span style={{ inlineSize: 8, blockSize: 28, background: "var(--orlo-color-accent)", borderRadius: 2 }} /><span style={{ inlineSize: 16, blockSize: 28, background: "var(--orlo-color-accent)", borderRadius: 2 }} /><span style={{ inlineSize: 24, blockSize: 28, background: "var(--orlo-color-accent)", borderRadius: 2 }} /></Stack>} />
        <LinkCard href={`${root}styles/shape/`} title="Shape" body="A small, related set of radii that follow hierarchy." art={<Stack direction="row" gap={2}>{["xs", "sm", "md", "lg"].map((r) => <span key={r} style={{ inlineSize: 36, blockSize: 36, borderRadius: `var(--orlo-radius-${r})`, background: "var(--orlo-color-surface-selected)", border: "1px solid var(--orlo-color-border-control)" }} />)}</Stack>} />
        <LinkCard href={`${root}styles/elevation/`} title="Elevation" body="Depth from surface tone and occlusion before shadow." icon={<Icons.Layers size={22} />} />
        <LinkCard href={`${root}styles/motion/`} title="Motion" body="Springs, presets, policies and the MotionLab." icon={<Icons.Activity size={22} />} />
        <LinkCard href={`${root}styles/icons/`} title="Icons" body={`${Object.keys(Icons).length} original 24 px icons with one stroke and one corner.`} art={<Stack direction="row" gap={2}><Icons.Search /><Icons.Calendar /><Icons.Settings /><Icons.Heart /></Stack>} />
        <LinkCard href={`${root}styles/density/`} title="Density" body="Comfortable, compact and touch from one token set." icon={<Icons.Columns size={22} />} />
      </CardGrid>
    </>
  );
}

const pairs: [string, string, number][] = [["fg", "canvas", 4.5], ["fg-muted", "canvas", 4.5], ["fg-muted", "surface", 4.5], ["accent-fg", "accent", 4.5], ["accent-text", "canvas", 4.5], ["border-control", "canvas", 3], ["focus", "canvas", 3], ["success", "canvas", 4.5], ["warning", "canvas", 4.5], ["error", "canvas", 4.5], ["info", "canvas", 4.5]];
export function Color() {
  return (
    <>
      <PageHeader eyebrow="Styles" title="Color" lead="Disciplined neutral surfaces, one purposeful accent and strong semantic colours. Accessibility wins over aesthetic attachment." />
      <H2>Neutral</H2><Ramp ramp={primitive.neutral} name="neutral" />
      <H2>Accent</H2><Ramp ramp={primitive.accent} name="accent" />
      <H2>Roles</H2>
      <p>Components use roles, never ramp steps. Each role has a light and a dark value.</p>
      <table className="doc" tabIndex={0}><thead><tr><th>Role</th><th>Light</th><th>Dark</th></tr></thead><tbody>
        {Object.keys(semantic.light).map((k) => { const l = (semantic.light as Record<string, string>)[k], d = (semantic.dark as Record<string, string>)[k]; return <tr key={k}><td><code>--orlo-color-{k}</code></td><td><span className="swatch-dot" style={{ background: l }} /><code>{l}</code></td><td><span className="swatch-dot" style={{ background: d }} /><code>{d}</code></td></tr>; })}
      </tbody></table>
      <H2>Contrast, measured</H2>
      <p>Computed with the WCAG 2.2 relative-luminance formula. The same checks run as unit tests, so a failing palette can't ship.</p>
      <table className="doc" tabIndex={0}><thead><tr><th>Pair</th><th>Light</th><th>Dark</th><th>Minimum</th></tr></thead><tbody>
        {pairs.map(([a, b, min]) => <tr key={a + b}><td><code>{a}</code> on <code>{b}</code></td>{(["light", "dark"] as const).map((s) => { const t = semantic[s] as Record<string, string>; const c = contrast(t[a], t[b]); return <td key={s}>{c.toFixed(2)}:1 {c >= min ? <Badge tone="success">pass</Badge> : <Badge tone="error">fail</Badge>}</td>; })}<td>{min}:1</td></tr>)}
      </tbody></table>
      <H2>Never colour alone</H2>
      <Stage label="Status with redundant cues"><Badge tone="success" dot>Paid</Badge><Badge tone="warning" dot>Due soon</Badge><Badge tone="error" dot>Overdue</Badge></Stage>
    </>
  );
}

export function Typography() {
  return (
    <>
      <PageHeader eyebrow="Styles" title="Typography" lead="System UI by default (Inter when installed) so nothing downloads; tabular numerals wherever numbers align." />
      <H2>Scale</H2>
      <div className="typescale">{Object.entries(typeTokens.size).reverse().map(([k, v]) => <div key={k}><code>--orlo-text-{k}</code><span style={{ fontSize: `var(--orlo-text-${k})`, lineHeight: 1.15, fontWeight: k.includes("xl") ? 700 : 400, letterSpacing: k.includes("xl") ? "-0.02em" : undefined }}>Finished edges</span><span className="orlo-hint">{v}</span></div>)}</div>
      <H2>Line height</H2>
      <SpecTable rows={[["Tight (display)", "--orlo-leading-tight"], ["Snug (UI)", "--orlo-leading-snug"], ["Normal (body)", "--orlo-leading-normal"]]} />
      <H2>Numerals</H2>
      <Stage label="Tabular vs proportional"><div style={{ display: "grid", gap: 4 }}><span style={{ fontVariantNumeric: "tabular-nums" }}>1,111.10 · 9,999.99 (tabular)</span><span>1,111.10 · 9,999.99 (proportional)</span></div></Stage>
      <H2>Rules</H2>
      <ul className="notes"><li>Body text at 1rem; never below 0.75rem.</li><li>Lines at most ~68 characters.</li><li>Headings balance with <code>text-wrap: balance</code>; paragraphs use <code>pretty</code>.</li><li>No font is redistributed by Orlo.</li></ul>
    </>
  );
}

export function Shape() {
  return (
    <>
      <PageHeader eyebrow="Styles" title="Shape" lead="A small, related radius scale. Shape follows hierarchy and touch affordance, never decoration." />
      <div className="shapes">{Object.entries(radius).map(([k, v]) => <div key={k}><span style={{ borderRadius: v === 9999 ? 999 : v }} /><code>--orlo-radius-{k}</code><span className="orlo-hint">{v === 9999 ? "full" : `${v}px`}</span></div>)}</div>
      <H2>Usage</H2>
      <table className="doc" tabIndex={0}><thead><tr><th>Radius</th><th>Used by</th></tr></thead><tbody>
        <tr><td>xs · 4</td><td>Keycaps and small badges</td></tr><tr><td>sm · 8</td><td>Chips and menu items</td></tr><tr><td>md · 10</td><td>Buttons and fields</td></tr><tr><td>lg · 14</td><td>Cards and menus</td></tr><tr><td>xl · 20</td><td>Dialogs and sheets</td></tr><tr><td>2xl · 28</td><td>Large device frames</td></tr><tr><td>full</td><td>Avatars, switches and progress tracks</td></tr>
      </tbody></table>
      <p>Nested corners follow <em>outer = inner + padding</em> (see the segmented control track), so curves stay concentric.</p>
    </>
  );
}

export function Elevation() {
  return (
    <>
      <PageHeader eyebrow="Styles" title="Elevation" lead="Depth comes from surface tone and occlusion first, and only then from shadow. Decorative glass is never used to fake hierarchy." />
      <div className="elev">
        <div style={{ background: "var(--orlo-color-canvas)" }}><strong>Canvas</strong><span>Page background</span></div>
        <div style={{ background: "var(--orlo-color-surface)", border: "1px solid var(--orlo-color-border)" }}><strong>Surface</strong><span>Cards, tables</span></div>
        <div style={{ background: "var(--orlo-color-surface-raised)", border: "1px solid var(--orlo-color-border)", boxShadow: "var(--orlo-shadow-2)" }}><strong>Raised</strong><span>Menus, popovers</span></div>
        <div style={{ background: "var(--orlo-color-surface-raised)", border: "1px solid var(--orlo-color-border)", boxShadow: "var(--orlo-shadow-4)" }}><strong>Modal</strong><span>Dialogs, sheets</span></div>
      </div>
      <H2>Scrims</H2>
      <p>Modal layers dim the page with <code>--orlo-color-scrim</code>. Under <code>prefers-reduced-transparency</code>, scrims become opaque.</p>
    </>
  );
}

export function IconsPage() {
  const [size, setSize] = useState("24");
  const [copyMessage, setCopyMessage] = useState("");
  const copyIcon = async (name: string) => {
    try {
      await navigator.clipboard.writeText(`<Icons.${name} />`);
      setCopyMessage(`Copied Icons.${name} JSX.`);
    } catch {
      setCopyMessage("Clipboard access is unavailable. Select the icon name to copy it manually.");
    }
  };
  return (
    <>
      <PageHeader eyebrow="Styles" title="Icons" lead="An original set: 24 px grid, 1.75 stroke, round joins, optically centred. Decorative by default; give icon-only controls a label." />
      <SegmentedControl label="Size" size="sm" value={size} onValueChange={setSize} options={["16", "20", "24", "32"].map((s) => ({ value: s, label: `${s}px` }))} />
      <div className="icongrid">{Object.entries(Icons).map(([n, I]) => <Tooltip key={n} content={`Icons.${n}`}><button type="button" className="icongrid__item" aria-label={`Copy Icons.${n} JSX`} onClick={() => void copyIcon(n)}><I size={+size} /><span>{n}</span></button></Tooltip>)}</div>
      <p className="orlo-hint">Click an icon to copy its JSX. <span role="status">{copyMessage}</span></p>
    </>
  );
}

export function Density() {
  const [d, setD] = useState("comfortable");
  const [savedDensity, setSavedDensity] = useState("comfortable");
  const [message, setMessage] = useState("");
  return (
    <>
      <PageHeader eyebrow="Styles" title="Density" lead="Three densities from one token set. Coarse pointers get touch sizing automatically." />
      <Stage label="Density preview">
        <div data-orlo-density={d} style={{ display: "grid", gap: 16 }}>
          <SegmentedControl label="Density" value={d} onValueChange={(value) => { setD(value); setMessage(""); }} options={Object.keys(density).map((k) => ({ value: k, label: k }))} />
          <Stack direction="row" gap={2} wrap><Button onClick={() => { setSavedDensity(d); setMessage(`${d} density saved for this preview.`); }}>Save</Button><Button variant="subtle" onClick={() => { setD(savedDensity); setMessage("Preview restored to the saved density."); }}>Cancel</Button></Stack>
          <span role="status" className="orlo-hint">{message}</span>
          <Card style={{ maxInlineSize: 320 }}>Control height {density[d as keyof typeof density].control}px</Card>
        </div>
      </Stage>
      <table className="doc" tabIndex={0}><thead><tr><th>Density</th><th>Control</th><th>Padding</th><th>Use</th></tr></thead><tbody>
        {Object.entries(density).map(([k, v]) => <tr key={k}><td><code>{k}</code></td><td>{v.control}px</td><td>{v.pad}px</td><td>{k === "touch" ? "Phones, kiosks; ≥ 44 px targets" : k === "compact" ? "Dense tools; still ≥ 24 px" : "Default"}</td></tr>)}
      </tbody></table>
    </>
  );
}

export function SpacingAndLayout() {
  const [tabVariant, setTabVariant] = useState<"pill" | "line">("pill");
  const scale = [
    { token: "--orlo-space-1", px: 4, use: "Tight micro-spacing, badges, icons in buttons, segmented control padding" },
    { token: "--orlo-space-2", px: 8, use: "Intra-component rhythm, button icon gap, inline tag lists, table cell padding" },
    { token: "--orlo-space-3", px: 12, use: "Dense stack gap, form helper clearance, compact card inset" },
    { token: "--orlo-space-4", px: 16, use: "Base element rhythm, card padding, dialog content margins, list spacing" },
    { token: "--orlo-space-5", px: 20, use: "Comfortable card padding, loose control clusters" },
    { token: "--orlo-space-6", px: 24, use: "Field-to-field vertical flow, tab panel clearance, section subdividers" },
    { token: "--orlo-space-8", px: 32, use: "Group-to-group vertical rhythm, modal padding, card grid gutters" },
    { token: "--orlo-space-10", px: 40, use: "Page header bottom clearance, major section breaks on tablet" },
    { token: "--orlo-space-12", px: 48, use: "Desktop section rhythm, hero banner bottom margin" },
    { token: "--orlo-space-16", px: 64, use: "Major page landmark divisions, landing flow transitions" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Styles"
        title="Spacing & Layout"
        lead="Predictable spatial rhythm built on an 8pt primary grid with a 4pt subgrid. Consistent hierarchy from micro intra-control gaps to section divisions, inspired by Apple Human Interface Guidelines and Material Design 3."
      />

      <H2>The 8pt & 4pt Spatial Grid</H2>
      <p>
        Every dimension in Orlo aligns to an 8pt baseline rhythm, with a 4pt subgrid reserved for compact UI
        elements, optical centering, and segmented control borders. Aligned spacing prevents visual jitter and
        creates immediate cognitive order.
      </p>

      <div style={{ display: "grid", gap: "var(--orlo-space-3)", marginBlock: "var(--orlo-space-6)" }}>
        {scale.map((s) => (
          <div
            key={s.token}
            style={{
              display: "grid",
              gridTemplateColumns: "140px 60px 1fr",
              alignItems: "center",
              gap: "var(--orlo-space-4)",
              padding: "var(--orlo-space-2) var(--orlo-space-3)",
              background: "var(--orlo-color-surface)",
              borderRadius: "var(--orlo-radius-md)",
              border: "1px solid var(--orlo-color-border)",
            }}
          >
            <code>{s.token}</code>
            <span style={{ fontWeight: 600, color: "var(--orlo-color-fg-muted)" }}>{s.px}px</span>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--orlo-space-3)" }}>
              <div
                style={{
                  inlineSize: s.px,
                  blockSize: 16,
                  background: "var(--orlo-color-accent)",
                  borderRadius: 2,
                  flex: "none",
                }}
              />
              <span className="orlo-hint">{s.use}</span>
            </div>
          </div>
        ))}
      </div>

      <H2>Spatial Hierarchy & Gestalt Proximity</H2>
      <p>
        Elements that relate functionally must sit closer together than elements belonging to different groups.
        Spacing communicates meaning before words are read:
      </p>
      <table className="doc" tabIndex={0}>
        <thead>
          <tr>
            <th>Level</th>
            <th>Distance</th>
            <th>Token</th>
            <th>Examples</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Intra-component</td>
            <td>4 – 8 px</td>
            <td><code>--orlo-space-1</code> / <code>--orlo-space-2</code></td>
            <td>Icon next to button label; status dot margin; badge count padding</td>
          </tr>
          <tr>
            <td>Inter-element</td>
            <td>8 – 12 px</td>
            <td><code>--orlo-gap-control</code> (8px)</td>
            <td>Related action buttons; filter chips in a group; toolbar items</td>
          </tr>
          <tr>
            <td>Field-to-field</td>
            <td>20 – 24 px</td>
            <td><code>--orlo-space-6</code> (24px)</td>
            <td>Consecutive form inputs; label-to-control stacks; list rows</td>
          </tr>
          <tr>
            <td>Group-to-group</td>
            <td>32 – 40 px</td>
            <td><code>--orlo-gap-panel</code> (24px) / <code>--orlo-space-8</code></td>
            <td>Form fieldsets; card sections; summary metric blocks</td>
          </tr>
          <tr>
            <td>Section-to-section</td>
            <td>48 – 72 px</td>
            <td><code>--orlo-space-12</code> – <code>--orlo-space-16</code></td>
            <td>Major page headers; landmark containers; footer division</td>
          </tr>
        </tbody>
      </table>

      <H2>Tab Bars & Navigation Rhythm</H2>
      <p>
        Tabs establish primary category navigation and require precise spatial clearance to prevent visual friction:
      </p>
      <ul className="notes">
        <li>
          <strong>Segmented Pill Tabs (Apple HIG):</strong> Container inset is exactly <code>4px</code> (<code>--orlo-inset-tab</code>), inter-tab gap is <code>4px</code> (<code>--orlo-gap-tab</code>), and each tab has <code>16px</code> horizontal padding (<code>--orlo-space-4</code>) with full border-radius.
        </li>
        <li>
          <strong>Line Tabs (Material 3):</strong> <code>8px</code> minimum gap between tab labels, with an active indicator bar spanning either the label or full tab width, anchored <code>1px</code> over the bottom border.
        </li>
        <li>
          <strong>Panel Clearance:</strong> The active tab panel must sit at least <code>24px</code> (<code>--orlo-space-6</code>) below the tablist so content never crowds the navigation affordance.
        </li>
        <li>
          <strong>Touch Target Minimum:</strong> On touch devices, every tab and interactive control enforces at least <code>44×44 pt</code> tap geometry per Apple Human Interface Guidelines and WCAG 2.5.5. On fine pointers (mouse), height scales comfortably to <code>32–40 px</code>.
        </li>
      </ul>

      <H2>Live Spatial Playground</H2>
      <Stage label="Spatial rhythm in an authentic form surface">
        <Card style={{ inlineSize: "min(100%, 30rem)", padding: "var(--orlo-gap-card, 16px)" }}>
          <Stack gap={4}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "var(--orlo-text-lg)" }}>Account Settings</strong>
              <SegmentedControl
                label="Tab Style"
                size="sm"
                value={tabVariant}
                onValueChange={(v) => setTabVariant(v as "pill" | "line")}
                options={[
                  { value: "pill", label: "Apple Pill" },
                  { value: "line", label: "M3 Line" },
                ]}
              />
            </div>

            <Tabs
              variant={tabVariant}
              defaultValue="general"
              items={[
                {
                  value: "general",
                  label: "General",
                  content: (
                    <Stack gap={4} style={{ paddingBlockStart: "var(--orlo-space-4)" }}>
                      <TextField label="Display name" defaultValue="Varun Karthic" />
                      <TextField label="Work email" defaultValue="varun@orlo.dev" help="Used for security and bill alerts." />
                      <Stack direction="row" gap={2} justify="end" style={{ paddingBlockStart: "var(--orlo-space-2)" }}>
                        <Button variant="subtle">Cancel</Button>
                        <Button>Save changes</Button>
                      </Stack>
                    </Stack>
                  ),
                },
                {
                  value: "security",
                  label: "Security",
                  content: (
                    <Stack gap={3} style={{ paddingBlockStart: "var(--orlo-space-4)" }}>
                      <p className="orlo-hint">Two-factor authentication is active on this account.</p>
                      <Button variant="subtle">Manage Passkeys</Button>
                    </Stack>
                  ),
                },
              ]}
            />
          </Stack>
        </Card>
      </Stage>

      <H2>Editorial Guidance</H2>
      <Stack gap={3}>
        <Callout title="Do: Use semantic gap tokens" tone="tip">
          Always apply <code>--orlo-gap-control</code> (8px), <code>--orlo-gap-card</code> (16px), and <code>--orlo-gap-panel</code> (24px) rather than hardcoded pixel values. This preserves automatic responsiveness when density changes to compact or touch.
        </Callout>
        <Callout title="Don't: Mix conflicting spacing grids" tone="caution">
          Avoid odd-numbered margins (e.g. 11px, 15px, 23px). Random margins disrupt the eye's visual scanning cadence and break component alignment across adjacent cards.
        </Callout>
      </Stack>
    </>
  );
}

