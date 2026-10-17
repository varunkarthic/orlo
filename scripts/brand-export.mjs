// Renders brand SVGs to PNG/ICO exports: node scripts/brand-export.mjs
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";

const dir = "assets/brand/";
const out = `${dir}exports/`;
mkdirSync(out, { recursive: true });
const svg = (f) => readFileSync(dir + f, "utf8");
const b = await chromium.launch();

async function shot(html, w, h, file, transparent = true) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.setContent(`<html><body style="margin:0;width:${w}px;height:${h}px;overflow:hidden">${html}</body></html>`);
  const buf = await p.screenshot({ omitBackground: transparent, type: "png" });
  await p.close();
  if (file) writeFileSync(out + file, buf);
  return buf;
}
const fit = (s, w, h, pad = 0) => `<div style="box-sizing:border-box;width:${w}px;height:${h}px;padding:${pad}px;display:grid;place-items:center">${s.replace("<svg ", '<svg style="width:100%;height:100%" ')}</div>`;

// Transparent wordmarks and marks
for (const [f, name] of [["orlo-wordmark-black.svg", "wordmark-black"], ["orlo-wordmark-white.svg", "wordmark-white"], ["orlo-wordmark-accent.svg", "wordmark-accent"]]) {
  await shot(fit(svg(f), 1616, 684), 1616, 684, `${name}@2x.png`);
  await shot(fit(svg(f), 808, 342), 808, 342, `${name}.png`);
}
for (const [f, name] of [["orlo-mark-black.svg", "mark-black"], ["orlo-mark-white.svg", "mark-white"]]) await shot(fit(svg(f), 512, 512), 512, 512, `${name}-512.png`);

// Favicons (light tile; the SVG favicon adapts to dark tab bars on its own)
const tile = svg("favicon.svg").replace(/<style>.*<\/style>/s, "<style>.t{fill:#1C1B18}.m{fill:#F7F5F0}</style>");
const icoParts = [];
for (const s of [16, 32, 48]) icoParts.push([s, await shot(fit(tile, s, s), s, s, `favicon-${s}.png`)]);
for (const s of [192, 512]) await shot(fit(tile, s, s), s, s, `icon-${s}.png`);
// Apple touch icon: opaque, square (iOS applies its own mask)
const opaque = tile.replace('rx="14"', 'rx="0"');
await shot(fit(opaque, 180, 180), 180, 180, "apple-touch-icon.png", false);
// Maskable icon: content inside the 80% safe zone
await shot(`<div style="width:512px;height:512px;background:#1C1B18;display:grid;place-items:center">${svg("orlo-mark-white.svg").replace("<svg ", '<svg style="width:52%;height:52%" ')}</div>`, 512, 512, "icon-maskable-512.png", false);

// Social preview card
await shot(`<div style="width:1200px;height:630px;background:#F7F5F0;color:#1C1B18;font:600 34px/1.3 system-ui,sans-serif;display:grid;align-content:center;gap:40px;padding:0 120px;box-sizing:border-box">
  <div style="width:420px">${svg("orlo-wordmark-black.svg").replace("<svg ", '<svg style="width:100%;height:auto" ')}</div>
  <div style="color:#5C574C">Nothing is an afterthought.<br><span style="color:#A8370A">A design framework for React.</span></div></div>`, 1200, 630, "social-card.png", false);

// ICO containing PNG images (supported by all current browsers)
const header = Buffer.alloc(6 + 16 * icoParts.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(icoParts.length, 4);
let offset = header.length;
icoParts.forEach(([s, png], i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e); header.writeUInt8(s, e + 1); header.writeUInt8(0, e + 2); header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6); header.writeUInt32LE(png.length, e + 8); header.writeUInt32LE(offset, e + 12);
  offset += png.length;
});
writeFileSync(out + "favicon.ico", Buffer.concat([header, ...icoParts.map((p) => p[1])]));
await b.close();

// Publish favicons into the docs site
const pub = "apps/docs/public/";
copyFileSync(dir + "favicon.svg", pub + "favicon.svg");
for (const f of ["favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "social-card.png"]) copyFileSync(out + f, pub + f);
writeFileSync(pub + "manifest.webmanifest", JSON.stringify({
  name: "Orlo", short_name: "Orlo", start_url: "./", display: "standalone", background_color: "#F7F5F0", theme_color: "#1C1B18",
  icons: [{ src: "icon-192.png", sizes: "192x192", type: "image/png" }, { src: "icon-512.png", sizes: "512x512", type: "image/png" }, { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }],
}, null, 2));
console.log("brand: exports written");
