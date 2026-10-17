// Captures screenshots for design review: node scripts/shots.mjs <outDir> [path...]
import { chromium } from "@playwright/test";
const [out = "shots", ...paths] = process.argv.slice(2);
const list = paths.length ? paths : ["", "components/", "components/dialog/", "examples/", "motion/", "labs/details/", "foundations/"];
const browser = await chromium.launch();
for (const [name, vp, scheme] of [["desktop", { width: 1366, height: 900 }, "light"], ["dark", { width: 1366, height: 900 }, "dark"], ["phone", { width: 390, height: 844 }, "light"]]) {
  const page = await browser.newPage({ viewport: vp, colorScheme: scheme });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  for (const p of list) {
    await page.goto(`http://localhost:4321/en/latest/${p}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${name}-${p.replace(/\//g, "_") || "home"}.png`, fullPage: false });
  }
  if (errors.length) console.log(name, "errors:", [...new Set(errors)].join("\n"));
  await page.close();
}
await browser.close();
console.log("done");
