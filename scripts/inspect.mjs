// Design-review captures with interactions: node scripts/inspect.mjs <outDir>
import { chromium } from "@playwright/test";
const out = process.argv[2] ?? "shots";
const base = "http://localhost:4321/en/latest/";
const b = await chromium.launch();
const shoot = async (name, path, { scheme = "light", w = 1280, h = 860, act } = {}) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(base + path, { waitUntil: "networkidle" });
  if (act) await act(p);
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/${name}.png` });
  if (errs.length) console.log(name, errs);
  await ctx.close();
};
await shoot("slider", "components/slider/");
await shoot("button", "components/button/", { scheme: "dark" });
await shoot("menu-glass", "components/menu/", { act: (p) => p.locator(".stage").first().getByRole("button", { name: /Actions/ }).click() });
await shoot("dialog-glass", "components/dialog/", { scheme: "dark", act: (p) => p.locator(".stage").first().getByRole("button", { name: "Rename…" }).click() });
await b.close();
console.log("ok");
