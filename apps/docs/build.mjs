// Static prerender: client build -> SSR build -> one index.html per route. No server needed at runtime.
import { build } from "vite";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
await build({ root, logLevel: "warn" });
await build({ root, logLevel: "warn", build: { ssr: "src/entry-server.tsx", outDir: "dist-ssr", emptyOutDir: true, rollupOptions: { output: { entryFileNames: "entry-server.mjs" } } }, ssr: { noExternal: [/^@orlo\//] } });

const { render, routes, missingDocs, manifest, pages } = await import(pathToFileURL(join(root, "dist-ssr/entry-server.mjs")).href);
if (missingDocs.length) throw new Error(`Components without docs: ${missingDocs.join(", ")}`);
const template = readFileSync(join(root, "dist/index.html"), "utf8");

for (const { path, title } of routes) {
  const depth = path ? path.split("/").length : 0;
  const up = "../".repeat(depth) || "./";
  const html = template
    .replace("<!--route-->", path)
    .replace("<!--title-->", path ? `${title} · Orlo` : "Orlo · Nothing is an afterthought")
    .replace("<!--canonical-->", "")
    // The template's asset URLs are relative to the site root; rebase them for nested pages.
    .replace(/(href|src)="\.\/(?!\/)/g, `$1="${up}`)
    .replace("<!--app-->", render(path));
  const out = join(root, "dist", path, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}
// Read the Docs serves /404.html for unknown paths. Asset URLs there must be absolute to the version root,
// so it uses a small self-contained page instead of the app bundle.
writeFileSync(join(root, "dist", "404.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found · Orlo</title>
<style>body{margin:0;min-height:100dvh;display:grid;place-items:center;font:16px/1.55 system-ui,sans-serif;background:#F7F5F0;color:#1C1B18;padding:24px}
@media (prefers-color-scheme:dark){body{background:#121110;color:#EFEBE3}a{color:#F08A57!important}}main{max-width:32rem}h1{font-size:2rem;letter-spacing:-.02em;margin:16px 0 8px}a{color:#A8370A}</style></head>
<body><main><svg viewBox="0 0 100 100" width="48" height="48" aria-hidden="true"><path d="M79.5 29.4A36 36 0 1 1 66.9 18.2" fill="none" stroke="currentColor" stroke-width="14"/></svg>
<h1>This page has an open edge.</h1><p>The address doesn’t match any page in the Orlo documentation. It may have moved.</p>
<p><a href="/">Go to the documentation home</a></p></main></body></html>`);
// Machine-readable files for AI agents and tooling, generated from the same manifest the site uses.
const components = { name: "orlo", generated: new Date().toISOString().slice(0, 10), components: manifest.map(({ name, slug, family, maturity, summary, tested }) => ({ name, slug, family, maturity, summary, tested, docs: `components/${slug}/` })) };
writeFileSync(join(root, "dist", "components.json"), JSON.stringify(components, null, 2));
writeFileSync(join(root, "..", "..", "components.json"), JSON.stringify({ ...components, generated: undefined }, null, 2) + "\n");
const llms = ["# Orlo", "", "> A design framework for React. Nothing is an afterthought.", "", "Orlo ships tokens (@orlo/tokens), a spring motion system (@orlo/motion) and components (@orlo/react). All components are beta.", "", "## Docs", ...pages.filter((p) => p.path && !p.path.startsWith("components/")).map((p) => `- [${p.title}](${p.path}/): ${p.summary ?? ""}`), "", "## Components", ...manifest.map((c) => `- [${c.name}](components/${c.slug}/): ${c.summary}`), ""].join("\n");
writeFileSync(join(root, "dist", "llms.txt"), llms);
writeFileSync(join(root, "..", "..", "llms.txt"), llms);
rmSync(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`docs: prerendered ${routes.length} routes`);
