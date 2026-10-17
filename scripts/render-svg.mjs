import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const [svgFile, out, w, h, bg = "white", full = ""] = process.argv.slice(2);
const svg = readFileSync(svgFile, "utf8").replace("<svg ", full ? `<svg width="${w}" height="${h}" ` : `<svg width="100%" height="100%" `);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.setContent(`<html><body style="margin:0;background:${bg};color:#1C1B18;display:grid;place-items:center;height:100vh">${full ? svg : `<div style="width:56%">${svg}</div>`}</body></html>`);
await p.screenshot({ path: out, omitBackground: bg === "transparent" }); await b.close();
