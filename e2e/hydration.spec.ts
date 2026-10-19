import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

// Every prerendered page must hydrate without React errors (418/423/425 etc.) or uncaught exceptions.
const routes: string[] = JSON.parse(readFileSync("apps/docs/dist/components.json", "utf8")).components.map((c: { docs: string }) => c.docs);
const extra = ["", "start/", "start/theme-studio/", "start/examples/", "foundations/failures/", "foundations/edge-cases/", "foundations/async-states/", "styles/materials/", "styles/motion/", "styles/icons/", "develop/devices/", "brand/", "brand/licensing/", "components/"];

test.describe.configure({ mode: "parallel" });
// A different locale and time zone from the build machine catches Intl/time hydration mismatches.
test.use({ locale: "de-DE", timezoneId: "Asia/Kolkata" });
for (const chunk of [extra, ...Array.from({ length: Math.ceil(routes.length / 20) }, (_, i) => routes.slice(i * 20, i * 20 + 20))]) {
  test(`hydrates cleanly: ${chunk[0] || "home"} … (${chunk.length})`, async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop sweep is enough");
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|404/.test(m.text())) errors.push(`${page.url()}: ${m.text()}`); });
    for (const r of chunk) { await page.goto(r, { waitUntil: "load" }); await page.waitForTimeout(60); }
    expect(errors).toEqual([]);
  });
}
