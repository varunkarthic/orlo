import { Button, Stack, Card, Popover, Dialog, Tooltip, Menu, Badge, TextField, Alert, Icons } from "@orlo/react";
import { layer, primitive, semantic, density, space, radius, type as typeTokens } from "@orlo/tokens";
import { Bullets, CardGrid, Code, DoDont, H2, H3, LinkCard, PageHeader, Stage } from "../kit.tsx";

export function FoundationsOverview({ root }: { root: string }) {
  return (
    <>
      <PageHeader eyebrow="Foundations" title="Foundations" lead="The decisions underneath every component: what Orlo values, how it adapts, and who owns the space when things overlap." />
      <CardGrid>
        <LinkCard href={`${root}foundations/principles/`} title="Principles" body="The rubric every component is judged against." icon={<Icons.Compass size={22} />} />
        <LinkCard href={`${root}foundations/accessibility/`} title="Accessibility" body="WCAG 2.2 AA as the target, and how it's tested." icon={<Icons.Eye size={22} />} />
        <LinkCard href={`${root}foundations/adaptive/`} title="Adaptive design" body="Space, input, zoom, direction and preferences." icon={<Icons.Columns size={22} />} />
        <LinkCard href={`${root}foundations/interaction-states/`} title="Interaction states" body="One consistent language for hover, focus, press and more." icon={<Icons.Activity size={22} />} />
        <LinkCard href={`${root}foundations/lifecycle/`} title="Lifecycle & composition" body="How a component starts, responds, interrupts, resolves and hands off." icon={<Icons.Refresh size={22} />} />
        <LinkCard href={`${root}foundations/layering/`} title="Layering" body="Stacking, portals, focus ownership and dismissal order." icon={<Icons.Layers size={22} />} />
        <LinkCard href={`${root}foundations/async-states/`} title="Async states" body="Loading, failure, empty, offline, retry." icon={<Icons.Zap size={22} />} />
        <LinkCard href={`${root}foundations/edge-cases/`} title="Edge cases" body="The Details Lab: flawed beside fixed." icon={<Icons.ShieldCheck size={22} />} />
        <LinkCard href={`${root}foundations/writing/`} title="Writing" body="Words for errors, empty states and actions." icon={<Icons.Type size={22} />} />
        <LinkCard href={`${root}foundations/tokens/`} title="Design tokens" body="How values flow from primitive to component." icon={<Icons.Shapes size={22} />} />
      </CardGrid>
    </>
  );
}

const principles: [string, string, string][] = [
  ["Every transition has a reason", "Motion clarifies hierarchy, cause, destination or continuity. If it does none of these, it doesn't happen.", "Ask: what would be confusing if this were instant?"],
  ["Nothing is half-finished", "We inspect the entry, the midpoint, the exit, the interruption and the failure, not only the final frame.", "Scrub every animation to 50% and look for clipped text or ghosts."],
  ["Continuity is a feature", "Related things move together; one object becoming another keeps its identity.", "Shared indicators travel; they never fade out and in elsewhere."],
  ["Content stays in control", "No effect is worth a clipped word, a lost focus ring or a control that can't be operated.", "If an effect hides content, the effect goes."],
  ["Quiet by default", "Restrained transitions are the baseline. Expressive motion is opt-in and rare.", "Overshoot over 5% needs a written reason."],
  ["Physics should feel plausible", "Springs carry velocity through interruptions; nothing teleports.", "Click twice fast: does it redirect smoothly?"],
  ["Every input is first-class", "Pointer, touch, pen, keyboard and screen reader all get complete paths, without assuming hover.", "Unplug the mouse and finish the task."],
  ["Performance is visual quality", "Late feedback and layout shift are visual bugs.", "Acknowledge input on the next frame; animate transform and opacity."],
  ["Accessible is beautiful", "Contrast, focus, labels and reduced motion are part of the design, not a pass at the end.", "Turn on reduced motion and forced colours before calling it done."],
  ["Make the invisible deliberate", "Image failure, stale data, focus return, scroll anchoring and cleanup are designed.", "Break the network and see what's left."],
];
export function Principles() {
  return (
    <>
      <PageHeader eyebrow="Foundations" title="Principles" lead="Ten principles, written as a rubric. Each has a quick test you can run on any screen." />
      <div className="principle-list">
        {principles.map(([t, d, test], i) => (
          <section key={t} className="principle"><span className="principle__n">{String(i + 1).padStart(2, "0")}</span><div><h2 id={`p${i + 1}`}>{t}</h2><p>{d}</p><p className="principle__test"><strong>Test:</strong> {test}</p></div></section>
        ))}
      </div>
      <H2>Quality gate</H2>
      <p>A component becomes <em>stable</em> only when it scores at least 4 of 5 on hierarchy, finish, motion, input adaptability, resilience, accessibility, performance, coherence and documentation, with evidence, and no known critical accessibility or data-integrity issue. Today, every component is <Badge tone="accent">beta</Badge>.</p>
    </>
  );
}

export function Accessibility({ root }: { root: string }) {
  return (
    <>
      <PageHeader eyebrow="Foundations" title="Accessibility" lead="WCAG 2.2 Level AA is the release target for stable components and this documentation. Orlo doesn't claim conformance without evidence." />
      <H2>Built in</H2>
      <Bullets items={[
        "Semantic HTML first; ARIA only where HTML has no equivalent.",
        "Keyboard models follow the WAI-ARIA Authoring Practices: menus, tabs, trees, grids, comboboxes, sliders.",
        "Visible :focus-visible rings with 3:1 contrast, offset so they never merge with borders.",
        "Modal surfaces trap focus, make the page inert and return focus to a valid element.",
        "Reduced motion is the default whenever the OS asks for it; Orlo never silently overrides it.",
        "Touch targets meet WCAG 2.5.8 (24 × 24 px minimum) and grow to 44 px+ on coarse pointers.",
        "Colour is never the only signal: icons, words, weight or shape always accompany it.",
        "Contrast is computed from tokens and enforced by unit tests in light and dark.",
      ]} />
      <H2>How it's tested</H2>
      <table className="doc" tabIndex={0}>
        <thead><tr><th>Check</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Token contrast (light + dark, all semantic pairs)</td><td><Badge tone="success">automated, passing</Badge></td></tr>
          <tr><td>Component behaviour (focus, keyboard, ARIA state) in jsdom</td><td><Badge tone="success">automated, passing</Badge></td></tr>
          <tr><td>axe-core on documentation pages, desktop and mobile</td><td><Badge tone="success">automated, passing</Badge></td></tr>
          <tr><td>Real-browser focus return, menus at viewport edges, deep links</td><td><Badge tone="success">Playwright, passing</Badge></td></tr>
          <tr><td>VoiceOver + Safari, NVDA + Firefox, TalkBack, iOS VoiceOver</td><td><Badge tone="warning">not yet tested by a person</Badge></td></tr>
          <tr><td>400% zoom and reflow on every page</td><td><Badge tone="warning">partial</Badge></td></tr>
        </tbody>
      </table>
      <Alert tone="warning" title="Known limitations">Automated tools catch only part of real accessibility. Until manual screen-reader passes are recorded, treat every component as beta. The WAI-ARIA tooltip pattern itself is still marked work in progress.</Alert>
      <H2>Your responsibilities</H2>
      <Bullets items={["Write meaningful labels and alt text; Orlo requires them but can't write them.", "Keep the reading order logical when composing layouts.", "Don't disable focus outlines or override reduced-motion preferences.", <>Test your own flows; see <a href={`${root}develop/testing/`}>Testing</a>.</>]} />
    </>
  );
}

export function Adaptive() {
  return (
    <>
      <PageHeader eyebrow="Foundations" title="Adaptive design" lead="Responsive means adapting to space, input, accessibility settings, content and performance, not just shrinking a desktop layout." />
      <H2>Space: containers before viewports</H2>
      <p>Cards declare container queries, so a component in a narrow sidebar behaves narrow even on a wide screen. Viewport breakpoints are only used for page-level strategy.</p>
      <Stage label="Resize the stage">
        <div style={{ resize: "horizontal", overflow: "auto", inlineSize: 480, maxInlineSize: "100%", minInlineSize: 200, padding: 2 }}>
          <Card><p style={{ margin: 0 }}>Drag the corner. This card's contents respond to <em>its</em> width.</p></Card>
        </div>
      </Stage>
      <H2>Input</H2>
      <Bullets items={["Hover styles exist only under (hover: hover) and (pointer: fine). Touch never shows a stuck hover.", "Coarse pointers get touch density (48 px controls) automatically.", "Tooltips never open on touch; anything important is reachable without hover.", "Drag interactions have keyboard equivalents (reorderable lists, splitters, sliders, knobs).", "touch-action is set per component so sliders don't fight page scrolling."]} />
      <H2>Overlays that change shape</H2>
      <p>Popovers dock to the bottom edge below 520 px, and dialogs become bottom sheets, keeping the same component tree so typed input survives the switch.</p>
      <H2>Zoom, text size and direction</H2>
      <Bullets items={["Sizes are in rem, so browser text size settings apply.", "Layouts reflow at 400% zoom without horizontal scrolling of the page.", "Logical properties (inline-start, block-end) everywhere; arrow keys mirror in RTL. Try Preferences → Direction."]} />
      <H2>Preferences Orlo listens to</H2>
      <table className="doc" tabIndex={0}><thead><tr><th>Media feature</th><th>Effect</th></tr></thead><tbody>
        <tr><td><code>prefers-color-scheme</code></td><td>Dark tokens (resolved in CSS, so no flash)</td></tr>
        <tr><td><code>prefers-reduced-motion</code></td><td>Travel becomes fade; loops slow or stop</td></tr>
        <tr><td><code>prefers-contrast: more</code></td><td>Decorative borders strengthen</td></tr>
        <tr><td><code>prefers-reduced-transparency</code></td><td>Opaque scrims and headers</td></tr>
        <tr><td><code>forced-colors</code></td><td>System colours with visible borders</td></tr>
        <tr><td><code>pointer: coarse</code></td><td>Touch density</td></tr>
        <tr><td><code>env(safe-area-inset-*)</code></td><td>Sheets, toasts and FABs avoid notches and home indicators</td></tr>
      </tbody></table>
    </>
  );
}

export function InteractionStates() {
  return (
    <>
      <PageHeader eyebrow="Foundations" title="Interaction states" lead="One state language across every component, so a pressed chip and a pressed button feel related." />
      <Stage label="States">
        <Stack direction="row" gap={3} wrap align="center">
          <Button>Enabled</Button><Button disabled>Disabled</Button><Button loading>Loading</Button>
          <Button variant="subtle" aria-pressed="true">Selected</Button>
          <TextField label="Invalid" defaultValue="ada@" error="Missing domain." />
        </Stack>
      </Stage>
      <table className="doc" tabIndex={0}><thead><tr><th>State</th><th>Treatment</th><th>Never</th></tr></thead><tbody>
        <tr><td>Hover</td><td>Subtle surface tint, fine pointers only</td><td>Movement, size change</td></tr>
        <tr><td>Focus-visible</td><td>2 px <code>--orlo-color-focus</code> outline, 2 px offset</td><td>Removing outlines; focus on mouse click</td></tr>
        <tr><td>Pressed</td><td>Scale to 0.97 within 90 ms</td><td>Ripples that obscure content</td></tr>
        <tr><td>Selected</td><td>Selected surface + weight or check</td><td>Colour alone</td></tr>
        <tr><td>Disabled</td><td>50% opacity, not-allowed cursor, still readable</td><td>Hiding the reason when it matters</td></tr>
        <tr><td>Loading</td><td>Geometry held, aria-busy, focus kept</td><td>Disabling (focus would be lost)</td></tr>
        <tr><td>Invalid</td><td>Error colour + doubled border + glyph + text</td><td>Shaking</td></tr>
      </tbody></table>
      <H2>Disabled is not one thing</H2>
      <p>Intentionally unavailable, permission-gated, busy and invalid look and read differently. Prefer explaining why something is unavailable (in nearby text or a description) over silently greying it out.</p>
    </>
  );
}

const lifecycle = [
  ["1. Stable", "The first frame is complete: labels are present, geometry is reserved and the control has its real semantics. Nothing needs motion to become usable."],
  ["2. Acknowledge", "Pointer, keyboard and assistive technology input receive an immediate, equivalent response. Hover is an enhancement, never the only path."],
  ["3. Change", "A component moves only to explain hierarchy, cause, destination or continuity. It uses a named Orlo motion purpose and preserves content, focus and hit targets."],
  ["4. Resolve", "Success, selection and completion make the next state unmistakable. The resulting state remains available long enough to be understood and acted on."],
  ["5. Interrupt", "A new input redirects the current animation from its current velocity; it does not restart, jump or leave an invisible interaction layer behind."],
  ["6. Recover", "Cancellation, error, offline and unmount paths restore a safe, intelligible state. Focus returns only to a live, enabled element."],
] as const;

export function Lifecycle() {
  return (
    <>
      <PageHeader eyebrow="Foundations" title="Lifecycle & composition" lead="Orlo defines components by their whole journey, not their resting frame. This contract is shown on every component page and is the bar for new work." />
      <section className="lifecycle" aria-label="Component lifecycle contract">
        {lifecycle.map(([step, detail], i) => <article className="lifecycle__step" key={step}><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><div><h2>{step}</h2><p>{detail}</p></div></article>)}
      </section>
      <H2>When components work together</H2>
      <table className="doc" tabIndex={0}><thead><tr><th>Relationship</th><th>Contract</th></tr></thead><tbody>
        <tr><td>Trigger → overlay</td><td>The trigger keeps its identity. The overlay owns focus, Escape and outside dismissal while open; on close, focus returns only when the trigger remains valid.</td></tr>
        <tr><td>Field → validation</td><td>Validation appears near its cause, preserves layout where practical and gives words, an icon or shape in addition to colour.</td></tr>
        <tr><td>Action → async result</td><td>Busy work keeps its geometry and focus. A result explains what happened, what is safe, and the next action.</td></tr>
        <tr><td>Collection → detail</td><td>Selection is represented in the collection before a detail view opens. Closing a detail restores the reader to the same logical item.</td></tr>
        <tr><td>Nested surfaces</td><td>The topmost surface owns the space. Layer, inertness, scroll lock and dismissal are coordinated rather than independently guessed.</td></tr>
      </tbody></table>
      <H2>Implementation checklist</H2>
      <Bullets items={["Design the initial, loading, empty, success, error, cancelled and unavailable states before polishing the happy path.", "Route movement through useOrloMotion(): choose a purpose, carry gesture velocity into a settle, and test full, reduced and off modes.", "Exercise pointer, touch, keyboard, screen reader, narrow layout, RTL and interruption paths in the same composed flow.", "Document component-specific exceptions in Highlights and Edge cases; do not hide an unsupported lifecycle behind a visual variant."]} />
      <H2>What this does not mean</H2>
      <p>A lifecycle is not an excuse to animate every state. Static information, instant local toggles and low-confidence changes can remain quiet. The contract requires clarity and recovery; motion is only one possible tool.</p>
    </>
  );
}

export function Layering() {
  return (
    <>
      <PageHeader eyebrow="Foundations" title="Layering" lead="When surfaces overlap, exactly one layer owns the space, the focus and the Escape key." />
      <H2>The stack</H2>
      <div className="layers">{Object.entries(layer).map(([k, v]) => <div key={k} style={{ "--z": v } as React.CSSProperties}><code>{k}</code><span>{v}</span></div>)}</div>
      <p>These are the only z-index values Orlo uses. Overlays render in portals on <code>&lt;body&gt;</code>, carrying the theme, density and direction with them, so a menu inside a transformed or clipped container never gets cut off.</p>
      <H2>Ownership rules</H2>
      <Bullets items={["Only the topmost overlay reacts to Escape and outside presses (a shared layer stack).", "Modal surfaces make everything else inert, so screen readers and Tab can't wander behind them.", "Scroll lock is reference-counted: three stacked overlays release the page exactly once.", "A closing overlay stops intercepting pointer events the moment its exit begins.", "Focus returns to the element that opened it, only if that element still exists and is enabled."]} />
      <Stage label="Try it: a tooltip, a menu and a dialog stacked">
        <Dialog title="Layered dialog" trigger={<Button>Open dialog</Button>}>
          <Stack direction="row" gap={2} wrap>
            <Tooltip content="Tooltips sit above menus"><Button variant="subtle">Tooltip</Button></Tooltip>
            <Menu trigger={<Button variant="subtle">Menu</Button>} items={[{ label: "Escape closes me first" }, { label: "Then the dialog" }]} />
            <Popover label="Popover" trigger={<Button variant="subtle">Popover</Button>}><p style={{ margin: 0 }}>Each layer handles its own Escape.</p></Popover>
          </Stack>
        </Dialog>
      </Stage>
    </>
  );
}

export function Writing() {
  return (
    <>
      <PageHeader eyebrow="Foundations" title="Writing" lead="Calm, direct, specific. Words are part of the interaction design." />
      <H2>Errors</H2>
      <p>Say what happened, what is safe, what the person can do, and whether it will recover on its own.</p>
      <Alert tone="error" title="Couldn’t upload “report.pdf”" action={<Button variant="ghost">Try again</Button>}>The file is larger than 25 MB. Your other files uploaded. Compress it or split it, then try again.</Alert>
      <DoDont items={[["“Couldn’t save. Your changes are kept on this device.”", "“Error 0x80004005.”"], ["“Enter an address like name@example.com.”", "“Invalid input.”"], ["“Delete 3 files?” with a “Delete” button.", "“Are you sure?” with “OK”."]]} />
      <H2>Empty states</H2>
      <p>Explain what will appear here and how to get it. Don't apologise for an empty list.</p>
      <H2>Actions</H2>
      <Bullets items={["Use verbs that name the outcome: Save changes, Send invite, Delete project.", "Keep the same verb from button to confirmation to toast.", "Never use urgency, guilt or confirmshaming."]} />
    </>
  );
}

export function TokensPage() {
  return (
    <>
      <PageHeader eyebrow="Foundations" title="Design tokens" lead="One TypeScript source generates CSS custom properties and typed exports. Components only read semantic and component tokens." />
      <H2>Layers</H2>
      <table className="doc" tabIndex={0}><thead><tr><th>Layer</th><th>Example</th><th>Who reads it</th></tr></thead><tbody>
        <tr><td>Primitive</td><td><code>--orlo-ramp-neutral-900</code> = {primitive.neutral[900]}</td><td>Semantic tokens only</td></tr>
        <tr><td>Semantic</td><td><code>--orlo-color-fg</code> = {semantic.light.fg} / {semantic.dark.fg}</td><td>Components and apps</td></tr>
        <tr><td>Component</td><td><code>--orlo-control-h</code> = {density.comfortable.control}px</td><td>Components</td></tr>
        <tr><td>State</td><td><code>data-invalid</code>, <code>aria-pressed</code></td><td>Component CSS</td></tr>
      </tbody></table>
      <H2>Families</H2>
      <Bullets items={[`Colour: ${Object.keys(semantic.light).length} semantic roles per scheme`, `Space: ${Object.keys(space).length} steps on a 4 px grid`, `Radius: ${Object.keys(radius).join(", ")}`, `Type: ${Object.keys(typeTokens.size).length} sizes, fluid above body`, `Density: ${Object.keys(density).join(", ")}`, `Layers: ${Object.keys(layer).length} named z-levels`, "Motion: CSS durations and easings, plus spring presets in @orlo/motion"]} />
      <H2>Overriding</H2>
      <Code>{`/* Everything Orlo ships is in @layer orlo.*, so plain CSS wins. */\n:root {\n  --orlo-radius-md: 6px;\n  --orlo-color-accent: #1F5FA8;\n}`}</Code>
      <H3>Naming</H3>
      <p><code>--orlo-&lt;family&gt;-&lt;role&gt;[-&lt;variant&gt;]</code>. Removed tokens are aliased for one minor version with a console-free deprecation note in the changelog.</p>
    </>
  );
}

