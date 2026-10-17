import { Wordmark, Mark } from "@orlo/react";

const tile = (bg: string, fg: string) => ({ background: bg, color: fg, padding: 24, borderRadius: 12, border: "1px solid var(--orlo-color-border)" });

export function BrandPage() {
  return (
    <>
      <p className="eyebrow">System</p>
      <h1>Brand</h1>
      <p className="lead">The wordmark and mark are original, hand-built vector artwork (SVG, stroke-based, editable). Source files are in <code>assets/brand/</code>.</p>
      <h2>Wordmark</h2>
      <div className="grid">
        <div style={tile("#F7F5F0", "#1C1B18")}><Wordmark height={56} /></div>
        <div style={tile("#1C1B18", "#F7F5F0")}><Wordmark height={56} /></div>
        <div style={tile("#C2410C", "#FFFFFF")}><Wordmark height={56} /></div>
      </div>
      <h2>Mark</h2>
      <div className="grid">
        <div style={tile("#F7F5F0", "#1C1B18")}><Mark height={48} /></div>
        <div style={tile("#1C1B18", "#F7F5F0")}><Mark height={48} /></div>
        <div style={{ ...tile("var(--orlo-color-surface)", "inherit"), display: "flex", gap: 16, alignItems: "end" }}>{[16, 24, 32, 48].map((s) => <Mark key={s} height={s} width={s} />)}</div>
      </div>
      <h2>Rationale</h2>
      <p>The direction is a <em>precise finishing edge</em>: geometric letterforms with butt terminals, and an O whose rim stops short of closing at the upper right, like an unstitched hem. The break sits high on purpose: low on the right, it would read as the tail of a Q. It is the only embellishment; the remaining letters stay plain so the mark reads at small sizes and in one colour.</p>
      <p>Two other directions (typographic continuity, soft organic rhythm) are recorded in the decisions log as explored and not chosen. This is not trademark clearance.</p>
      <h2>Usage</h2>
      <ul>
        <li>Clear space: at least the width of the mark's stroke on every side of the wordmark, and one stroke-width for the mark.</li>
        <li>Do not recolour outside the neutral and accent tokens, add effects, outline, rotate or close the rim.</li>
        <li>Minimum wordmark height 20px; below that use the mark.</li>
      </ul>
    </>
  );
}
