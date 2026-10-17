import { primitive, semantic, contrast, space, radius, density } from "@orlo/tokens";

const pairs: [string, string][] = [["fg", "canvas"], ["fg-muted", "canvas"], ["accent-fg", "accent"], ["accent-text", "canvas"], ["border-control", "canvas"], ["focus", "canvas"], ["error", "canvas"]];

export function Foundations() {
  return (
    <>
      <h1>Foundations</h1>
      <p className="lead">Tokens move through four layers: primitive, semantic, component, state. Everything on this page is read from the same source that generates the CSS.</p>

      <h2>Neutral ramp</h2>
      <div className="swatches">
        {Object.entries(primitive.neutral).map(([k, v]) => (
          <div className="swatch" key={k}><div style={{ background: v }} /><p><strong>{k}</strong> <code>{v}</code></p></div>
        ))}
      </div>
      <h2>Accent ramp</h2>
      <div className="swatches">
        {Object.entries(primitive.accent).map(([k, v]) => (
          <div className="swatch" key={k}><div style={{ background: v }} /><p><strong>{k}</strong> <code>{v}</code></p></div>
        ))}
      </div>

      <h2>Contrast, measured</h2>
      <p>Computed from the token values with the WCAG relative-luminance formula. These checks also run as unit tests.</p>
      <table>
        <thead><tr><th>Pair</th><th>Light</th><th>Dark</th><th>Target</th></tr></thead>
        <tbody>
          {pairs.map(([a, b]) => (
            <tr key={a + b}>
              <td><code>{a}</code> on <code>{b}</code></td>
              {(["light", "dark"] as const).map((s) => {
                const t = semantic[s] as Record<string, string>;
                return <td key={s}>{contrast(t[a], t[b]).toFixed(2)}:1</td>;
              })}
              <td>{a === "border-control" || a === "focus" ? "3:1" : "4.5:1"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Space, radius, density</h2>
      <p>Spacing is a 4px scale: {Object.values(space).filter(Boolean).join(", ")}. Radii: {Object.entries(radius).map(([k, v]) => `${k} ${v}`).join(", ")}.</p>
      <p>Control height by density: {Object.entries(density).map(([k, v]) => `${k} ${v.control}px`).join(", ")}. Coarse pointers default to <code>touch</code>.</p>
    </>
  );
}
