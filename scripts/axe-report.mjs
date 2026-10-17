import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const b = await chromium.launch();
for (const [vp, scheme] of [[{width:1366,height:900},"light"],[{width:390,height:844},"dark"]]) {
  const ctx = await b.newContext({ viewport: vp, colorScheme: scheme }); const page = await ctx.newPage();
  for (const p of [""]) {
    await page.goto("http://localhost:4321/en/latest/" + p); await page.waitForTimeout(300);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag22aa"]).analyze();
    for (const v of r.violations) for (const n of v.nodes.slice(0,4)) console.log(scheme, p, v.id, n.target.join(" "), (n.any[0]?.message ?? "").slice(0,140));
  }
}
await b.close();
