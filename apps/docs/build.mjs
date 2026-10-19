// Static prerender: client build -> SSR build -> one index.html per route. No server needed at runtime.
import { build } from "vite";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { semantic, brandBadge, radius } from "@orlo/tokens";

const root = dirname(fileURLToPath(import.meta.url));
await build({ root, logLevel: "warn" });
await build({ root, logLevel: "warn", build: { ssr: "src/entry-server.tsx", outDir: "dist-ssr", emptyOutDir: true, rollupOptions: { output: { entryFileNames: "entry-server.mjs" } } }, ssr: { noExternal: [/^@orlo\//] } });

const { render, routes, findMissingDocs, manifest, pages } = await import(pathToFileURL(join(root, "dist-ssr/entry-server.mjs")).href);
const missingDocs = await findMissingDocs();
if (missingDocs.length) throw new Error(`Components without docs: ${missingDocs.join(", ")}`);
const template = readFileSync(join(root, "dist/index.html"), "utf8");

// Portable, self-contained signature badges for non-React sites. Identity colors come from tokens.
const wordmark = readFileSync(join(root, "../../assets/brand/orlo-wordmark.svg"), "utf8");
const paths = wordmark.match(/<g fill="currentColor">([\s\S]*?)<\/g>/)?.[1];
if (!paths) throw new Error("Could not read Orlo wordmark paths for badges");
const badgeDir = join(root, "dist/brand-badges");
mkdirSync(badgeDir, { recursive: true });
for (const [tone, color] of Object.entries(brandBadge)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 108" role="img" aria-labelledby="title desc">
<title id="title">Orlo — open-source design framework for React by Varun Karthic</title>
<desc id="desc">${tone} signature badge</desc>
<rect x="0.5" y="0.5" width="359" height="107" rx="${radius.lg}" fill="${color.bg}" stroke="${color.border}"/>
<svg x="20" y="16" width="86" height="36" viewBox="318 355 808 342" fill="${color.fg}" aria-hidden="true"><g>${paths}</g></svg>
<text x="20" y="73" fill="${color.fg}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="600">Open-source design framework for React</text>
<text x="20" y="93" fill="${color.fg}" font-family="Arial, Helvetica, sans-serif" font-size="12">by Varun Karthic</text>
</svg>`;
  writeFileSync(join(badgeDir, `orlo-badge-${tone}.svg`), svg);
}

for (const { path, title } of routes) {
  const depth = path ? path.split("/").length : 0;
  const up = "../".repeat(depth) || "./";
  const html = template
    .replace("<!--route-->", path)
    .replace("<!--title-->", path ? `${title} · Orlo` : "Orlo · Open-source design framework for React")
    .replace("<!--canonical-->", "")
    // The template's asset URLs are relative to the site root; rebase them for nested pages.
    .replace(/(href|src)="\.\/(?!\/)/g, `$1="${up}`)
    .replace("<!--app-->", await render(path));
  const out = join(root, "dist", path, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}
// Read the Docs serves /404.html for unknown paths. Asset URLs there must be absolute to the version root,
// so it uses a small self-contained page instead of the app bundle.
writeFileSync(join(root, "dist", "404.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found · Orlo</title>
<style>body{margin:0;min-height:100dvh;box-sizing:border-box;display:grid;place-items:center;font:16px/1.55 system-ui,sans-serif;background:${semantic.light.canvas};color:${semantic.light.fg};padding:24px}
main{max-width:32rem}h1{font-size:2rem;letter-spacing:-.02em;margin:16px 0 8px}a{color:${semantic.light["accent-text"]}}a:focus-visible{outline:3px solid ${semantic.light.focus};outline-offset:4px}@media (prefers-color-scheme:dark){body{background:${semantic.dark.canvas};color:${semantic.dark.fg}}a{color:${semantic.dark["accent-text"]}}a:focus-visible{outline-color:${semantic.dark.focus}}}</style></head>
<body><main><svg viewBox="0 0 100 100" width="48" height="48" aria-hidden="true"><path d="M79.5 29.4A36 36 0 1 1 66.9 18.2" fill="none" stroke="currentColor" stroke-width="14"/></svg>
<h1>This page has an open edge.</h1><p>The address doesn’t match any page in the Orlo documentation. It may have moved.</p>
<p><a id="docs-home" href="/en/latest/">Go to the documentation home</a></p></main><script>const parts=location.pathname.split("/");if(parts[1]==="en"&&parts[2])document.getElementById("docs-home").href="/en/"+encodeURIComponent(parts[2])+"/";</script></body></html>`);
// Machine-readable files for AI agents and tooling, generated from the same manifest the site uses.
const components = { name: "orlo", generated: new Date().toISOString().slice(0, 10), components: manifest.map(({ name, slug, family, maturity, summary, tested }) => ({ name, slug, family, maturity, summary, tested, docs: `components/${slug}/` })) };
writeFileSync(join(root, "dist", "components.json"), JSON.stringify(components, null, 2));
writeFileSync(join(root, "..", "..", "components.json"), JSON.stringify({ ...components, generated: undefined }, null, 2) + "\n");
const llms = ["# Orlo", "", "> A design framework for React. Nothing is an afterthought.", "", "Orlo ships tokens (@orlo/tokens), a spring motion system (@orlo/motion) and components (@orlo/react). All components are beta.", "", "## Docs", ...pages.filter((p) => p.path && !p.path.startsWith("components/")).map((p) => `- [${p.title}](${p.path}/): ${p.summary ?? ""}`), "", "## Components", ...manifest.map((c) => `- [${c.name}](components/${c.slug}/): ${c.summary}`), ""].join("\n");
writeFileSync(join(root, "dist", "llms.txt"), llms);
writeFileSync(join(root, "..", "..", "llms.txt"), llms);
rmSync(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`docs: prerendered ${routes.length} routes`);
