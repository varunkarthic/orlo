// Captures README screenshots from the built site: node scripts/readme-shots.mjs (server must be running)
import { chromium } from "@playwright/test";
const base = "http://localhost:4321/en/latest/";
const shots = [
  ["home-light", "", { width: 1440, height: 900 }, "light"],
  ["home-dark", "", { width: 1440, height: 900 }, "dark"],
  ["component-dialog", "components/dialog/", { width: 1440, height: 900 }, "light"],
  ["component-calendar-specs", "components/calendar/specs/", { width: 1440, height: 900 }, "dark"],
  ["components-index", "components/", { width: 1440, height: 900 }, "light"],
  ["details-lab", "foundations/edge-cases/", { width: 1440, height: 900 }, "light"],
  ["theme-studio", "start/theme-studio/", { width: 1440, height: 900 }, "light"],
  ["motion-lab", "styles/motion/", { width: 1440, height: 900 }, "dark"],
  ["mobile-home", "", { width: 390, height: 844 }, "light"],
];
const b = await chromium.launch();
for (const [name, path, viewport, colorScheme] of shots) {
  const ctx = await b.newContext({ viewport, colorScheme, deviceScaleFactor: 2, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(base + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await p.screenshot({ path: `docs/media/${name}.png` });
  await ctx.close();
}
await b.close();
console.log("readme shots written");
