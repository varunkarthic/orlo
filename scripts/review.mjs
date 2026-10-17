// node scripts/review.mjs <outDir> <path> [scheme] [width]
import { chromium } from "@playwright/test";
const [out, ...paths] = process.argv.slice(2);
const b = await chromium.launch();
for (const spec of paths) {
  const [path, scheme = "light", w = "1280"] = spec.split("@");
  const ctx = await b.newContext({ viewport: { width: +w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto("http://localhost:4321/en/latest/" + path, { waitUntil: "networkidle" });
  await p.evaluate(() => window.scrollTo(0, 250)); await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/${path.replace(/\//g, "_")}-${scheme}-${w}.png` });
  if (errs.length) console.log(path, errs.join("; "));
  await ctx.close();
}
await b.close();
