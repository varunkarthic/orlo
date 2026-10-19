import { BuiltWithOrlo, Mark, Wordmark } from "@orlo/react";
import { Bullets, DoDont, H2, PageHeader } from "../kit.tsx";

export function BrandPage({ root }: { root: string }) {
  const download = (file: string) => `https://github.com/varunkarthic/orlo/raw/main/assets/brand/${file}`;
  return (
    <div className="wide brand-page">
      <PageHeader eyebrow="Brand" title="The Orlo identity." lead="A quiet mark for a framework built to care about the edges. Use these assets to refer to Orlo accurately, or add an optional badge to a site made with it." />
      <a className="brand-feature" href={`${root}brand/badges/`}>
        <div className="brand-feature__copy"><span className="brand-feature__eyebrow">For your site</span><strong>Embed an Orlo badge</strong><span>Choose a tone and layout. Copy React or HTML code, or download a self-contained SVG.</span><span className="brand-feature__action">Explore badges →</span></div>
        <div className="brand-feature__preview"><BuiltWithOrlo layout="signature" tone="dark" href={null} /></div>
      </a>
      <H2>Wordmark</H2>
      <p>The lowercase wordmark has leaf-shaped terminals on the <em>r</em> and <em>l</em>: soft where it meets the reader, precise everywhere else. Choose the version that maintains strong contrast.</p>
      <div className="brand-tiles" aria-label="Wordmark on three approved surfaces">
        <div className="brand-tile" data-tone="light"><Wordmark height={58} /></div>
        <div className="brand-tile" data-tone="dark"><Wordmark height={58} /></div>
        <div className="brand-tile" data-tone="accent"><Wordmark height={58} /></div>
      </div>
      <H2>Mark & favicon</H2>
      <p>The compact mark is the wordmark's “o”. Use the mark when the wordmark would be less than 20 px tall.</p>
      <div className="brand-tiles brand-tiles--mark"><div className="brand-tile" data-tone="light"><Mark height={56} width={56} /></div><div className="brand-tile" data-tone="dark"><Mark height={56} width={56} /></div><div className="brand-tile brand-tile--favicons" data-tone="surface">{[16, 24, 32, 48].map((size) => <img key={size} src={`${root}favicon.svg`} width={size} height={size} alt={`Favicon at ${size}px`} />)}</div></div>
      <H2>Download assets</H2>
      <p>Transparent SVG sources and PNG exports live in <code>assets/brand/</code>. Site badges have their own <a href={`${root}brand/badges/`}>embed guide and downloads</a>.</p>
      <ul className="brand-downloads">
        {[["orlo-wordmark.svg", "Wordmark · currentColor"], ["orlo-wordmark-black.svg", "Wordmark · black"], ["orlo-wordmark-white.svg", "Wordmark · white"], ["orlo-mark.svg", "Compact mark"], ["favicon.svg", "Adaptive favicon"], ["exports/wordmark-black@2x.png", "PNG · black"], ["exports/wordmark-white@2x.png", "PNG · white"], ["exports/favicon.ico", "ICO favicon"], ["exports/apple-touch-icon.png", "Apple touch icon"], ["exports/social-card.png", "Social card · 1200 × 630"]].map(([file, label]) => <li key={file}><a href={download(file)}>{label}</a><code>{file}</code></li>)}
      </ul>
      <H2>Use it well</H2>
      <Bullets items={["Clear space: at least the width of the “o” counter on every side.", "Minimum wordmark height: 20 px on screen. Below that, use the mark.", "Use graphite, off-white, white, black or the accent. Avoid gradients, outlines, shadows and effects.", "Pronounced OR-loh. Written lowercase in the logo, “Orlo” in running text."]} />
      <DoDont items={[["Place the wordmark on a calm, solid background with strong contrast.", "Place it on a busy photo or a low-contrast tint."], ["Scale it proportionally.", "Stretch, rotate, re-letter or recolour individual letters."]]} />
      <p className="orlo-hint">The name is used in good faith; this page is not trademark clearance. See <a href={`${root}brand/licensing/`}>licensing and credits</a>.</p>
    </div>
  );
}
