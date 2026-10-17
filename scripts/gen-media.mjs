// Records demo media from the built site (server must be running on :4321).
import { chromium } from "@playwright/test";
import { mkdirSync, renameSync, copyFileSync, readdirSync } from "node:fs";
const base = "http://localhost:4321/en/latest/";
mkdirSync("docs/media/recordings", { recursive: true });
const b = await chromium.launch();

async function record(name, path, steps, size = { width: 1280, height: 720 }, scheme = "light") {
  const dir = `docs/media/recordings/tmp-${name}`;
  const ctx = await b.newContext({ viewport: size, colorScheme: scheme, recordVideo: { dir, size }, reducedMotion: "no-preference" });
  const p = await ctx.newPage();
  await p.goto(base + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  await steps(p);
  await p.waitForTimeout(600);
  await ctx.close();
  const f = readdirSync(dir)[0];
  renameSync(`${dir}/${f}`, `docs/media/recordings/${name}.webm`);
}

await record("slider-physics", "components/slider/", async (p) => {
  await p.evaluate(() => window.scrollTo(0, 260));
  const t = p.locator(".stage .orlo-slider__track").first(); const box = await t.boundingBox();
  for (const f of [0.95, 0.15, 0.7]) { await p.mouse.click(box.x + box.width * f, box.y + box.height / 2); await p.waitForTimeout(700); }
  await p.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2); await p.mouse.down();
  for (let i = 0; i <= 30; i++) { await p.mouse.move(box.x + box.width * (0.7 - i * 0.02), box.y + box.height / 2); await p.waitForTimeout(16); }
  await p.mouse.up(); await p.waitForTimeout(500);
});
await record("async-button", "components/async-button/", async (p) => {
  await p.evaluate(() => window.scrollTo(0, 260));
  const btns = p.locator(".stage").first().locator("button.orlo-async");
  await btns.nth(0).click(); await p.waitForTimeout(2200);
  await btns.nth(1).click(); await p.waitForTimeout(2600);
  await btns.nth(2).click(); await p.waitForTimeout(1800);
});
await record("glass-overlays", "components/dialog/", async (p) => {
  await p.locator(".stage").first().getByRole("button", { name: "Rename…" }).click(); await p.waitForTimeout(900);
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
}, { width: 1280, height: 720 }, "dark");
await record("orlo-motion", "styles/motion/", async (p) => {
  await p.evaluate(() => window.scrollTo(0, 380));
  const btn = p.getByRole("button", { name: "Move" });
  for (let i = 0; i < 4; i++) { await btn.click(); await p.waitForTimeout(i === 1 ? 140 : 800); }
});
// The docs demos use the motion recording as their sample video.
copyFileSync("docs/media/recordings/orlo-motion.webm", "apps/docs/public/media/orlo-motion.webm");
// Sample PDF for DocumentViewer.
const ctx = await b.newContext(); const p = await ctx.newPage();
await p.goto(base + "brand/", { waitUntil: "networkidle" });
await p.pdf({ path: "apps/docs/public/media/orlo-brand.pdf", format: "A4", printBackground: true });
await b.close();
console.log("media written");
