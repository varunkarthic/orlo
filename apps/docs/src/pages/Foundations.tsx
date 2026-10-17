import { primitive, semantic, contrast, space, radius, density, layer, type } from "@orlo/tokens";

const pairs: [string, string, number][] = [["fg", "canvas", 4.5], ["fg-muted", "canvas", 4.5], ["accent-fg", "accent", 4.5], ["accent-text", "canvas", 4.5], ["border-control", "canvas", 3], ["focus", "canvas", 3], ["success", "canvas", 4.5], ["warning", "canvas", 4.5], ["error", "canvas", 4.5], ["info", "canvas", 4.5]];
const Ramp = ({ ramp }: { ramp: Record<string, string> }) => (
  <div className="swatches">{Object.entries(ramp).map(([k, v]) => <div className="swatch" key={k}><div style={{ background: v }} /><p><strong>{k}</strong> <code>{v}</code></p></div>)}</div>
);

export function Foundations() {
  return (
    <>
      <p className="eyebrow">System</p>
      <h1>Foundations</h1>
      <p className="lead">Tokens move through layers: primitive values, semantic roles, then component use. One TypeScript source generates the CSS custom properties and the values on this page.</p>

      <h2>Colour</h2>
      <p>Warm graphite neutrals and a single persimmon accent. Depth comes from surface tone and occlusion more than from shadow.</p>
      <h3>Neutral</h3><Ramp ramp={primitive.neutral} />
      <h3>Accent</h3><Ramp ramp={primitive.accent} />
      <h3>Semantic roles</h3>
      <div className="swatches">{Object.entries(semantic.light).filter(([, v]) => v.startsWith("#")).map(([k]) => (
        <div className="swatch" key={k}><div style={{ background: `var(--orlo-color-${k})` }} /><p><code>--orlo-color-{k}</code></p></div>
      ))}</div>

      <h2>Contrast, measured</h2>
      <p>Computed from the token values with the WCAG 2.2 relative-luminance formula. The same checks run as unit tests, so a failing palette cannot ship.</p>
      <table className="doc" tabIndex={0}>
        <thead><tr><th>Pair</th><th>Light</th><th>Dark</th><th>Minimum</th></tr></thead>
        <tbody>{pairs.map(([a, b, min]) => (
          <tr key={a + b}><td><code>{a}</code> on <code>{b}</code></td>
            {(["light", "dark"] as const).map((s) => { const t = semantic[s] as Record<string, string>; return <td key={s}>{contrast(t[a], t[b]).toFixed(2)} : 1</td>; })}
            <td>{min} : 1</td></tr>
        ))}</tbody>
      </table>

      <h2>Typography</h2>
      <p>System UI by default (Inter when installed), monospace for code. Sizes above body are fluid and clamp between phone and desktop.</p>
      <table className="doc" tabIndex={0}>
        <thead><tr><th>Token</th><th>Value</th><th>Sample</th></tr></thead>
        <tbody>{Object.entries(type.size).map(([k, v]) => <tr key={k}><td><code>--orlo-text-{k}</code></td><td><code>{v}</code></td><td style={{ fontSize: `var(--orlo-text-${k})`, lineHeight: 1.2 }}>Finished edges</td></tr>)}</tbody>
      </table>

      <h2>Space, shape, density</h2>
      <p>A 4px scale: {Object.values(space).filter(Boolean).join(", ")}px. A small radius set: {Object.entries(radius).map(([k, v]) => `${k} ${v === 9999 ? "full" : v + "px"}`).join(", ")}.</p>
      <table className="doc" tabIndex={0}>
        <thead><tr><th>Density</th><th>Control height</th><th>Padding</th><th>When</th></tr></thead>
        <tbody>{Object.entries(density).map(([k, v]) => <tr key={k}><td><code>{k}</code></td><td>{v.control}px</td><td>{v.pad}px</td><td>{k === "touch" ? "Default on coarse pointers; ≥ 44px targets" : k === "compact" ? "Dense tools; still ≥ 24px (WCAG 2.5.8)" : "Default"}</td></tr>)}</tbody>
      </table>

      <h2>Layers</h2>
      <p>One named stacking scale, so a sticky header never fights a menu: {Object.entries(layer).map(([k, v]) => `${k} ${v}`).join(" · ")}.</p>

      <h2>Environment</h2>
      <ul className="notes">
        <li><code>prefers-color-scheme</code>: dark tokens apply automatically, or force with <code>data-orlo-theme</code>.</li>
        <li><code>prefers-contrast: more</code>: decorative borders strengthen to control contrast.</li>
        <li><code>forced-colors</code>: components fall back to system colours with visible borders.</li>
        <li><code>prefers-reduced-transparency</code>: scrims and the docs header become opaque.</li>
        <li><code>pointer: coarse</code>: touch density by default.</li>
      </ul>
    </>
  );
}
