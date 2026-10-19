import { Alert, Badge, Icons } from "@orlo/react";
import { presets } from "@orlo/motion";
import { Bullets, CardGrid, Code, H2, LinkCard, PageHeader } from "../kit.tsx";

export function DevelopOverview({ root }: { root: string }) {
  return (
    <>
      <PageHeader eyebrow="Develop" title="Develop with Orlo" lead="The APIs underneath the components: provider, motion, positioning, theming and rendering." />
      <CardGrid>
        <LinkCard href={`${root}develop/provider/`} title="Provider" body="One place for theme, motion, images, density and direction." icon={<Icons.Sliders size={22} />} />
        <LinkCard href={`${root}develop/motion/`} title="Motion API" body="useOrloMotion, presets and spring metrics." icon={<Icons.Activity size={22} />} />
        <LinkCard href={`${root}develop/positioning/`} title="Positioning & layers" body="computePosition and the layer stack." icon={<Icons.Move size={22} />} />
        <LinkCard href={`${root}develop/theming/`} title="Theming API" body="Tokens, createTheme, themeToCss." icon={<Icons.Palette size={22} />} />
        <LinkCard href={`${root}develop/ssr/`} title="Server rendering" body="What renders where, and why there's no flash." icon={<Icons.Cpu size={22} />} />
        <LinkCard href={`${root}develop/testing/`} title="Testing" body="How Orlo is verified and how to test with it." icon={<Icons.ShieldCheck size={22} />} />
        <LinkCard href={`${root}develop/read-the-docs/`} title="Read the Docs" body="How this static site is built and hosted." icon={<Icons.BookOpen size={22} />} />
        <LinkCard href={`${root}develop/agents/`} title="For AI agents" body="Rules that keep generated UI on-system." icon={<Icons.Terminal size={22} />} />
      </CardGrid>
    </>
  );
}

export function ProviderPage() {
  return (
    <>
      <PageHeader eyebrow="Develop" title="Provider" lead="OrloProvider carries every global policy and hosts the toast region. All props are optional." />
      <Code>{`<OrloProvider theme="system" motion="system" images="on" density="comfortable" dir="ltr">\n  <App />\n</OrloProvider>`}</Code>
      <table className="doc" tabIndex={0}><thead><tr><th>Prop</th><th>Values</th><th>Notes</th></tr></thead><tbody>
        <tr><td><code>theme</code></td><td>system · light · dark</td><td><code>system</code> resolves in CSS: no flash, no hydration mismatch.</td></tr>
        <tr><td><code>motion</code></td><td>system · reduced · off · full</td><td><code>full</code> ignores the OS preference; offer it only as an explicit user choice.</td></tr>
        <tr><td><code>images</code></td><td>on · off</td><td><code>off</code> renders designed placeholders and makes no image requests.</td></tr>
        <tr><td><code>density</code></td><td>comfortable · compact · touch</td><td>Unset: coarse pointers get touch sizing.</td></tr>
        <tr><td><code>dir</code></td><td>ltr · rtl</td><td>Also carried into portals.</td></tr>
      </tbody></table>
      <H2>Scoping</H2>
      <p>Providers nest. An inner <code>&lt;OrloProvider images="off"&gt;</code> affects only its subtree, which is how the State Lab turns images off for one card.</p>
      <H2>Hooks</H2>
      <Code>{`const { toast, dismiss } = useToast();\nconst policy = useImagePolicy();          // "on" | "off"\nconst { state, retry } = useImageState(src);`}</Code>
    </>
  );
}

export function MotionApi() {
  return (
    <>
      <PageHeader eyebrow="Develop" title="Motion API" lead="Components never hardcode timings. They ask for a purpose and the current policy decides the physics." />
      <Code>{`import { useOrloMotion } from "@orlo/motion";\nimport { motion } from "motion/react";\n\nfunction Panel() {\n  const { transition, distance } = useOrloMotion();\n  return (\n    <motion.div\n      initial={{ opacity: 0, y: distance(8) }}\n      animate={{ opacity: 1, y: 0, transition: transition("reveal") }}\n      exit={{ opacity: 0, transition: transition("dismiss") }}\n    />\n  );\n}`}</Code>
      <H2>useOrloMotion()</H2>
      <table className="doc" tabIndex={0}><thead><tr><th>Field</th><th>Meaning</th></tr></thead><tbody>
        <tr><td><code>effective</code></td><td><code>"full" | "reduced" | "off"</code> after combining policy and OS.</td></tr>
        <tr><td><code>transition(name)</code></td><td>Spring for the preset, a 150 ms fade under reduced, 0 under off.</td></tr>
        <tr><td><code>distance(px)</code></td><td>Returns px under full, 0 otherwise, so travel collapses to a fade.</td></tr>
        <tr><td><code>reduced</code></td><td>true unless effective is full.</td></tr>
      </tbody></table>
      <H2>Presets</H2>
      <p>{Object.keys(presets).map((p) => <code key={p} style={{ marginInlineEnd: 6 }}>{p}</code>)}</p>
      <Code>{`import { presets, springMetrics } from "@orlo/motion";\nspringMetrics(presets.overlay); // { zeta, overshoot, settleMs, omega }`}</Code>
    </>
  );
}

export function PositioningPage() {
  return (
    <>
      <PageHeader eyebrow="Develop" title="Positioning & layers" lead="Orlo positions every popover, menu, tooltip and listbox with one small, tested function." />
      <Code>{`import { computePosition } from "@orlo/react";\n\nconst pos = computePosition(anchorRect, { width, height }, viewport, "bottom-start");\n// { x, y, side, maxHeight, origin }`}</Code>
      <Bullets items={["Flips to the opposite side only when that side has more room.", "Shifts along the cross axis to stay 8 px from edges.", "Returns maxHeight so long content scrolls instead of leaving the viewport.", "Returns a transform-origin pointing at the anchor, recomputed after flipping.", "Kept live while open: scroll (capture), resize, visual viewport (virtual keyboard, pinch zoom) and the floating element's own size."]} />
      <H2>Layer stack</H2>
      <p>Every overlay registers with a shared stack while open. Only the top entry handles Escape and outside presses, so nested overlays always close in the right order.</p>
    </>
  );
}

export function ThemingApi() {
  return (
    <>
      <PageHeader eyebrow="Develop" title="Theming API" lead="Override tokens with plain CSS, or generate accessible accent roles from a brand colour." />
      <Code>{`import { createTheme, themeToCss, contrast, semantic } from "@orlo/tokens";\n\nconst theme = createTheme("#7C3AED");   // { light: {...}, dark: {...} }\nconst css = themeToCss(theme, ":root");  // inject or write to a file\ncontrast("#7C3AED", "#FFFFFF");          // 5.70`}</Code>
      <Bullets items={["createTheme keeps hue and adjusts lightness until every accent pairing meets 4.5:1 (unit-tested on yellow, cyan, white, black and more).", "All Orlo CSS lives in @layer orlo.*, so your overrides win without !important.", "data-orlo-theme and data-orlo-density can be set on any element to scope a subtree."]} />
    </>
  );
}

export function SsrPage() {
  return (
    <>
      <PageHeader eyebrow="Develop" title="Server rendering" lead="Every component renders on the server. This documentation is itself prerendered to static HTML and hydrated." />
      <Bullets items={["Theme `system` is resolved by CSS media queries, not JavaScript, so the first paint is correct.", "A stored explicit theme can be applied before paint with a tiny inline script (see apps/docs/index.html).", "Portals (overlays, toasts) mount only after hydration; nothing renders into body on the server.", "Browser APIs (matchMedia, ResizeObserver, Image) are touched only inside effects.", "Stateful values that differ per browser (stored preferences) are restored after hydration to avoid mismatches."]} />
      <H2>Without JavaScript</H2>
      <p>Prerendered pages are readable with JavaScript disabled: headings, text, tables and code all ship as HTML. Interactive demos need JavaScript.</p>
    </>
  );
}

export function TestingPage() {
  return (
    <>
      <PageHeader eyebrow="Develop" title="Testing" lead="What is verified automatically today, and how to run it." />
      <Code>{`npm test          # Vitest: tokens, motion, components (jsdom)\nnpm run e2e       # Playwright + axe against the built site under /en/latest/\nnpm run typecheck`}</Code>
      <table className="doc" tabIndex={0}><thead><tr><th>Suite</th><th>Covers</th></tr></thead><tbody>
        <tr><td>Token tests</td><td>Every semantic contrast pair, glass readability, light and dark; theme generator on extreme colours.</td></tr>
        <tr><td>Motion tests</td><td>Every preset under 5% overshoot and 700 ms settle.</td></tr>
        <tr><td>Component tests</td><td>Focus return, inert background, keyboard models (tabs, menu, select, tree, calendar), image retry limits, parsing helpers.</td></tr>
        <tr><td>Catalogue integrity</td><td>Every manifest entry exports; every entry has docs (build fails otherwise); components server-render.</td></tr>
        <tr><td>E2E (Playwright)</td><td>Deep links, 404, no-JS content, focus trap/return, edge menus, search, preferences, overflow at 390 px.</td></tr>
        <tr><td>axe-core</td><td>WCAG 2.2 A/AA rules on key pages, desktop and mobile.</td></tr>
      </tbody></table>
      <Alert tone="warning" title="Not automated">Screen-reader passes, visual regression snapshots and performance traces are not yet part of CI.</Alert>
    </>
  );
}

export function RtdPage() {
  return (
    <>
      <PageHeader eyebrow="Develop" title="Hosting on Read the Docs" lead="Read the Docs serves static files only, so this site is prerendered: one real index.html per route." />
      <Code>{`# .readthedocs.yaml\nversion: 2\nbuild:\n  os: ubuntu-24.04\n  tools:\n    nodejs: "22"\n  jobs:\n    install:\n      - npm ci\n    build:\n      html:\n        - npm run build:rtd\n        - mkdir -p "$READTHEDOCS_OUTPUT/html"\n        - cp -R apps/docs/dist/. "$READTHEDOCS_OUTPUT/html/"`}</Code>
      <Bullets items={["Asset URLs are relative, so the site works under /en/latest/, /en/stable/ or any version prefix.", "Every route, including each component tab, is its own HTML file: deep links and refresh work without rewrites.", "A self-contained 404.html is emitted for unknown paths.", "Search is the CommandPalette over a static index bundled with the site: no server.", "The build fails if any component lacks documentation."]} />
      <p>Locally, <code>npm run build:rtd && npm run serve:rtd</code> serves the output under <code>/en/latest/</code> exactly as Read the Docs does. <Badge tone="warning">The hosted project URL is configured by the maintainer.</Badge></p>
    </>
  );
}

export function AgentsPage() {
  return (
    <>
      <PageHeader eyebrow="Develop" title="For AI agents" lead="Orlo ships rules so coding agents produce on-system UI without re-teaching each decision." />
      <Bullets items={[<><code>AGENTS.md</code>: how to build, test and add components without style drift.</>, <><code>ORLO_DESIGN_RULES.md</code>: the non-negotiable principles, tokens, motion and anti-patterns.</>, <><code>llms.txt</code>: an index of the documentation for language models.</>, <><code>components.json</code>: a machine-readable manifest of every component and its maturity.</>]} />
      <H2>Example prompt</H2>
      <Code>{`Build a settings screen with Orlo. Use only components listed in components.json.\nUse useOrloMotion() for any custom animation; no hardcoded durations.\nBefore finishing, check mobile, keyboard, reduced motion and failure states.`}</Code>
    </>
  );
}
