import { useState } from "react";
import { BuiltWithOrlo, SegmentedControl, type BuiltWithOrloProps } from "@orlo/react";
import { Code, H2, PageHeader } from "../kit.tsx";

const tones = ["dark", "light", "accent", "outline"] as const;
const layouts = ["signature", "stacked", "inline"] as const;
const sizes = ["sm", "md", "lg"] as const;
const badgeAlt = "Orlo — open-source design framework for React by Varun Karthic";

export function BadgesPage({ root }: { root: string }) {
  const [tone, setTone] = useState<BuiltWithOrloProps["tone"]>("dark");
  const [layout, setLayout] = useState<BuiltWithOrloProps["layout"]>("signature");
  const [size, setSize] = useState<BuiltWithOrloProps["size"]>("md");
  const imageUrl = `https://orlo-react.readthedocs.io/en/latest/brand-badges/orlo-badge-${tone}.svg`;
  const reactCode = `import { BuiltWithOrlo } from "@orlo/react";\n\n<BuiltWithOrlo layout="${layout}" tone="${tone}" size="${size}" />`;
  const htmlCode = `<a href="https://orlo-react.readthedocs.io/"\n   aria-label="${badgeAlt}">\n  <img\n    src="${imageUrl}"\n    width="360" height="108"\n    alt="${badgeAlt}"\n  />\n</a>`;

  return (
    <div className="wide badge-page">
      <PageHeader eyebrow="Brand / badges" title="A small mark with a clear story." lead="Embeddable Orlo badges for project footers, credits and readmes. Choose a React component or a self-contained SVG that works on any site. Attribution is welcome, never required." />
      <div className="badge-intro">
        <div><span className="badge-intro__index">01 / Identity</span><strong>Open-source design framework for React</strong><p>The signature badge says exactly what Orlo is and names its designer, Varun Karthic.</p></div>
        <div><span className="badge-intro__index">02 / Placement</span><strong>Quiet, not promotional</strong><p>Use it in a footer or credits area. Keep your product and its primary actions in focus.</p></div>
      </div>

      <H2>Compose a badge</H2>
      <div className="badge-studio">
        <div className="badge-studio__controls">
          <SegmentedControl label="Badge layout" value={layout} onValueChange={(v) => setLayout(v as BuiltWithOrloProps["layout"])} options={layouts.map((value) => ({ value, label: value === "signature" ? "Signature" : value === "stacked" ? "Compact" : "Inline" }))} />
          <SegmentedControl label="Badge tone" value={tone} onValueChange={(v) => setTone(v as BuiltWithOrloProps["tone"])} options={tones.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} />
          <SegmentedControl label="Badge size" value={size} onValueChange={(v) => setSize(v as BuiltWithOrloProps["size"])} options={sizes.map((value) => ({ value, label: value.toUpperCase() }))} />
        </div>
        <div className="badge-studio__preview" aria-live="polite"><BuiltWithOrlo layout={layout} tone={tone} size={size} href={null} /></div>
      </div>
      <p className="orlo-hint">Signature shows the full framework and designer credit. Compact and inline keep the mark legible where space is limited.</p>

      <H2>Use it in React</H2>
      <p>Import the component from Orlo. The entire badge is one accessible link by default; pass <code>href={"{null}"}</code> to make it decorative rather than interactive.</p>
      <Code label="React badge embed">{reactCode}</Code>

      <H2>Use it on any site</H2>
      <p>The static signature SVG includes the wordmark, framework description and designer credit. It has its own color and does not need a stylesheet or JavaScript. The example below links back to Orlo; adjust the image URL if you self-host the downloaded file.</p>
      <Code label="HTML badge embed">{htmlCode}</Code>
      <div className="badge-downloads" aria-label="Download SVG badges">
        {tones.map((value) => <a key={value} href={`${root}brand-badges/orlo-badge-${value}.svg`} download={`orlo-badge-${value}.svg`}>Download {value} SVG</a>)}
      </div>

      <H2>All four tones</H2>
      <div className="badge-gallery">
        {tones.map((value) => <div key={value} className="badge-gallery__item"><BuiltWithOrlo layout="signature" tone={value} href={null} /><span>{value}</span></div>)}
      </div>
      <p className="orlo-hint">Use the dark badge on light surfaces and the light badge on dark surfaces. Check contrast in your own context. Do not stretch the SVG or remove its credit line.</p>
    </div>
  );
}
