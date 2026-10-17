import { CopyButton, Alert } from "@orlo/react";

export const Code = ({ children }: { children: string }) => (
  <div className="code"><pre tabIndex={0} aria-label="Code example"><code>{children}</code></pre><CopyButton text={children} /></div>
);

export function Installation() {
  return (
    <>
      <p className="eyebrow">Start</p>
      <h1>Installation</h1>
      <p className="lead">Orlo is a set of npm workspace packages. It is not published to npm yet, so for now you use it from a clone.</p>
      <Alert tone="info" title="Pre-release">APIs may still change before 1.0. Components are marked beta until they pass manual assistive-technology and visual review.</Alert>

      <h2>1. Get the code</h2>
      <Code>{`git clone https://github.com/varunkarthic/orlo.git\ncd orlo\nnpm install\nnpm run dev     # this documentation, live, at localhost:5173`}</Code>

      <h2>2. Add the styles</h2>
      <p>Import the tokens first, then the component styles. Both live in CSS cascade layers, so your own styles override them without specificity battles.</p>
      <Code>{`import "@orlo/tokens/css";\nimport "@orlo/react/styles.css";`}</Code>

      <h2>3. Wrap your app</h2>
      <p>The provider carries theme, density, motion policy, image policy and direction, and hosts the toast region. Everything is optional.</p>
      <Code>{`import { OrloProvider } from "@orlo/react";\n\nexport function App() {\n  return (\n    <OrloProvider theme="system" motion="system" images="on">\n      <Routes />\n    </OrloProvider>\n  );\n}`}</Code>

      <h2>4. Use components</h2>
      <Code>{`import { Button, Dialog, TextField, useToast } from "@orlo/react";\n\nfunction Rename() {\n  const { toast } = useToast();\n  return (\n    <Dialog\n      title="Rename project"\n      trigger={<Button>Rename…</Button>}\n      footer={(close) => (\n        <Button onClick={() => { close(); toast({ title: "Renamed", tone: "success" }); }}>Save</Button>\n      )}\n    >\n      <TextField label="Project name" />\n    </Dialog>\n  );\n}`}</Code>

      <h2>Provider options</h2>
      <table className="doc" tabIndex={0}>
        <thead><tr><th>Prop</th><th>Values</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td><code>theme</code></td><td>system · light · dark</td><td><code>system</code> resolves in CSS, so there is no flash of the wrong theme on load.</td></tr>
          <tr><td><code>motion</code></td><td>system · reduced · off · full</td><td><code>system</code> follows the OS. <code>full</code> overrides it and should only be an explicit user choice.</td></tr>
          <tr><td><code>images</code></td><td>on · off</td><td><code>off</code> renders designed placeholders and makes no image requests.</td></tr>
          <tr><td><code>density</code></td><td>comfortable · compact · touch</td><td>Unset: coarse pointers get touch sizing automatically.</td></tr>
          <tr><td><code>dir</code></td><td>ltr · rtl</td><td>Components use logical properties and mirror arrow keys.</td></tr>
        </tbody>
      </table>

      <h2>Server rendering</h2>
      <p>Every component renders on the server. Overlays and toasts mount into portals only after hydration, and browser APIs are only touched inside effects. This documentation is itself prerendered to static HTML and hydrated.</p>

      <h2>Requirements</h2>
      <p>React 18 or 19. Current Chrome, Edge, Firefox and Safari. Peer dependency: <code>react</code>, <code>react-dom</code>. Runtime dependency: <code>motion</code>.</p>
    </>
  );
}
