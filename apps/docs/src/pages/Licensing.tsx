import { Wordmark, Card } from "@orlo/react";
import { H2, PageHeader } from "../kit.tsx";

export function Licensing() {
  return (
    <>
      <PageHeader eyebrow="Brand" title="Licensing & credits" lead="Who made Orlo, what you may do with it, and the work it stands on." />
      <Card style={{ display: "grid", gap: 8 }}>
        <Wordmark height={36} />
        <p style={{ margin: 0 }}><strong>Designed by Varun Karthic.</strong> Orlo’s visual language, motion system, components, documentation and brand are designed by Varun Karthic.</p>
        <p style={{ margin: 0 }} className="orlo-hint">Copyright © 2026 Varun Karthic.</p>
      </Card>
      <H2>Licence</H2>
      <p>The Orlo source code (packages <code>@orlo/tokens</code>, <code>@orlo/motion</code>, <code>@orlo/react</code>, and this documentation site) is released under the <a href="https://github.com/varunkarthic/orlo/blob/main/LICENSE">MIT License</a>. You may use, copy, modify, merge, publish, distribute, sublicense and sell copies, provided the copyright notice and licence text are included in all copies or substantial portions of the software. The software is provided “as is”, without warranty of any kind.</p>
      <H2>Name and logo</H2>
      <p>The Orlo name, wordmark and mark identify the project. The MIT License covers the code, not the right to present another product as Orlo or as endorsed by its designer. Use the logo to refer to Orlo itself; don’t alter it or use it for your own product. This is a usage request, not a claim of registered trademark.</p>
      <H2>Credits</H2>
      <table className="doc" tabIndex={0}><thead><tr><th>Work</th><th>Use</th><th>Licence</th></tr></thead><tbody>
        <tr><td><a href="https://react.dev">React</a> and React DOM</td><td>Runtime</td><td>MIT</td></tr>
        <tr><td><a href="https://motion.dev">Motion</a></td><td>Animation engine (springs, layout, presence)</td><td>MIT</td></tr>
        <tr><td><a href="https://vite.dev">Vite</a>, <a href="https://www.typescriptlang.org">TypeScript</a>, <a href="https://vitest.dev">Vitest</a>, <a href="https://playwright.dev">Playwright</a>, <a href="https://github.com/dequelabs/axe-core">axe-core</a></td><td>Build and test tooling (not shipped)</td><td>MIT / Apache-2.0 / MPL-2.0 (axe-core)</td></tr>
        <tr><td><a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a></td><td>Map tiles, only after consent in MapView</td><td>ODbL; © OpenStreetMap contributors</td></tr>
      </tbody></table>
      <H2>Original work</H2>
      <ul className="notes">
        <li>All components, primitives (positioning, focus scopes, scroll lock, layer stack) and the theme generator are original to Orlo. No third-party component source is copied.</li>
        <li>The icon set (≈270 icons) and animated icons are drawn for Orlo.</li>
        <li>The wordmark was supplied by Varun Karthic and vectorised for this repository.</li>
        <li>Fonts: Orlo uses system font stacks and redistributes no font files.</li>
      </ul>
      <H2>Inspiration, not affiliation</H2>
      <p>Orlo’s motion principles were studied from Apple’s Human Interface Guidelines and Google’s Material 3 Expressive, and its documentation structure from m3.material.io. Orlo uses no text, artwork or styles from them and is not affiliated with or endorsed by Apple, Google, Framer or any other company named here.</p>
    </>
  );
}
