import { Wordmark, Mark, Stack } from "@orlo/react";
import { Bullets, H2, PageHeader, DoDont } from "../kit.tsx";

const tile = (bg: string, fg: string) => ({ background: bg, color: fg, padding: 28, borderRadius: 14, border: "1px solid var(--orlo-color-border)", display: "grid", placeItems: "center", minBlockSize: 140 });

export function BrandPage({ root }: { root: string }) {
  const dl = (f: string) => `https://github.com/varunkarthic/orlo/raw/main/assets/brand/${f}`;
  return (
    <div className="wide">
      <PageHeader eyebrow="Brand" title="Logo & usage" lead="A lowercase wordmark with leaf-shaped terminals on the r and l: soft where it meets the reader, precise everywhere else." />
      <H2>Wordmark</H2>
      <div className="grid">
        <div style={tile("#F7F5F0", "#1C1B18")}><Wordmark height={64} /></div>
        <div style={tile("#1C1B18", "#F7F5F0")}><Wordmark height={64} /></div>
        <div style={tile("#A8370A", "#FFFFFF")}><Wordmark height={64} /></div>
      </div>
      <H2>Mark and favicon</H2>
      <p>The compact mark is the wordmark's “o”. Below 20 px of wordmark height, use the mark.</p>
      <Stack direction="row" gap={6} wrap align="end">
        <div style={tile("#F7F5F0", "#1C1B18")}><Mark height={56} width={56} /></div>
        <div style={tile("#1C1B18", "#F7F5F0")}><Mark height={56} width={56} /></div>
        <Stack direction="row" gap={4} align="end">{[16, 24, 32, 48].map((s) => <img key={s} src={`${root}favicon.svg`} width={s} height={s} alt={`Favicon at ${s}px`} />)}</Stack>
      </Stack>
      <H2>Downloads</H2>
      <p>Transparent SVG sources and PNG exports live in <code>assets/brand/</code>.</p>
      <ul className="downloads">
        {[["orlo-wordmark.svg", "Wordmark (currentColor)"], ["orlo-wordmark-black.svg", "Wordmark, black"], ["orlo-wordmark-white.svg", "Wordmark, white"], ["orlo-mark.svg", "Mark"], ["favicon.svg", "Favicon (adapts to dark tabs)"], ["exports/wordmark-black@2x.png", "PNG, black, transparent"], ["exports/wordmark-white@2x.png", "PNG, white, transparent"], ["exports/favicon.ico", "favicon.ico (16/32/48)"], ["exports/apple-touch-icon.png", "Apple touch icon"], ["exports/social-card.png", "Social card 1200×630"]].map(([f, l]) => <li key={f}><a href={dl(f)}>{l}</a> <code>{f}</code></li>)}
      </ul>
      <H2>Rules</H2>
      <Bullets items={["Clear space: at least the width of the “o” counter on every side.", "Minimum wordmark height 20 px on screen; use the mark below that.", "Use graphite, off-white, white, black or the accent. No gradients, outlines, shadows or effects.", "Pronounced OR-loh. Written lowercase in the logo, “Orlo” in running text."]} />
      <DoDont items={[["Place the wordmark on a calm, solid background with strong contrast.", "Place it on a busy photo or a low-contrast tint."], ["Scale it proportionally.", "Stretch, rotate, re-letter or recolour individual letters."]]} />
      <p className="orlo-hint">The name is used in good faith; this page is not trademark clearance.</p>
    </div>
  );
}
