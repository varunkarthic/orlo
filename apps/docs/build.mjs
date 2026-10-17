// Static prerender: client build -> SSR build -> one index.html per route. No server needed at runtime.
import { build } from "vite";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
await build({ root, logLevel: "warn" });
await build({ root, logLevel: "warn", build: { ssr: "src/entry-server.tsx", outDir: "dist-ssr", emptyOutDir: true, rollupOptions: { output: { entryFileNames: "entry-server.mjs" } } }, ssr: { noExternal: [/^@orlo\//] } });

const { render, routes } = await import(pathToFileURL(join(root, "dist-ssr/entry-server.mjs")).href);
const template = readFileSync(join(root, "dist/index.html"), "utf8");

for (const { path, title } of routes) {
  const depth = path ? path.split("/").length : 0;
  const up = "../".repeat(depth) || "./";
  const html = template
    .replace("<!--route-->", path)
    .replace("<!--title-->", path ? `${title} · Orlo` : "Orlo · Nothing is an afterthought")
    // The template's asset URLs are relative to the site root; rebase them for nested pages.
    .replace(/(href|src)="\.\/(?!\/)/g, `$1="${up}`)
    .replace("<!--app-->", render(path));
  const out = join(root, "dist", path, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}
rmSync(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`docs: prerendered ${routes.length} routes`);
