// Captures the deployed docs: node scripts/live-shots.mjs <outDir> [base]
import { chromium } from "@playwright/test";
const [out = "docs/media/v3-before", base = "https://orlo-react.readthedocs.io/en/latest/"] = process.argv.slice(2);
const b = await chromium.launch();
const shots = [["home", ""], ["components", "components/"], ["button", "components/button/"], ["calendar", "components/calendar/"], ["theme-studio", "start/theme-studio/"], ["motion", "styles/motion/"], ["details", "foundations/edge-cases/"], ["failures", "foundations/failures/"], ["text-field", "components/text-field/"], ["badge", "components/badge/"]];
for (const scheme of ["light", "dark"]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage();
  for (const [n, path] of shots) {
    if (scheme === "dark" && !["home", "button", "theme-studio"].includes(n)) continue;
    await p.goto(base + path, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${out}/${n}-${scheme}.png` });
  }
  if (scheme === "light") {
    await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(800);
    await p.getByRole("button", { name: "Preferences" }).click().catch(() => {});
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${out}/preferences-open.png` });
    console.log("rtd flyout present:", await p.evaluate(() => !!document.querySelector("readthedocs-flyout, [class*=readthedocs], #readthedocs-ea")));
  }
  await ctx.close();
}
const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const mp = await m.newPage(); await mp.goto(base, { waitUntil: "networkidle" }); await mp.waitForTimeout(1000); await mp.screenshot({ path: `${out}/home-mobile.png` });
await b.close(); console.log("done");
