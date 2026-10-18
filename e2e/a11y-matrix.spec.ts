import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Accessibility emulation matrix. Screenshots land in docs/media/a11y/ as evidence; assertions fail on real problems.
test.describe.configure({ mode: "parallel" });
const shot = (page: Page, name: string) => page.screenshot({ path: `docs/media/a11y/${name}.png` });
const noOverflow = async (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test("forced colours: key pages stay operable and axe-clean", async ({ page, isMobile }) => {
  test.skip(isMobile);
  await page.emulateMedia({ forcedColors: "active" });
  for (const p of ["components/button/", "components/dialog/", "components/data-grid/"]) {
    await page.goto(p);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.filter((v) => v.impact === "critical" || v.impact === "serious").map((v) => v.id), p).toEqual([]);
  }
  await page.goto("components/dialog/");
  await page.locator(".stage").first().getByRole("button", { name: "Rename…" }).click();
  await page.waitForTimeout(400);
  await shot(page, "forced-colors-dialog");
});

for (const deficiency of ["protanopia", "deuteranopia", "tritanopia", "achromatopsia"] as const) {
  test(`colour-vision simulation: ${deficiency}`, async ({ page, isMobile }) => {
    test.skip(isMobile || test.info().project.name !== "desktop");
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setEmulatedVisionDeficiency", { type: deficiency });
    await page.goto("components/line-chart/");
    await page.evaluate(() => window.scrollTo(0, 220));
    await page.waitForTimeout(600);
    await shot(page, `cvd-${deficiency}-chart`);
    // Charts must not rely on colour alone: multi-series lines expose a dash or
    // marker distinction. Motion may set SVG presentation attributes as styles.
    const distinction = await page.locator(".stage .orlo-chart__svg path, .stage .orlo-chart__svg circle, .stage .orlo-chart__svg rect").evaluateAll((nodes) =>
      nodes.some((node) => getComputedStyle(node).strokeDasharray !== "none" || node.tagName !== "path"),
    );
    expect(distinction).toBe(true);
  });
}

test("400% zoom (320 CSS px): no horizontal page scroll", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 4 });
  const page = await ctx.newPage();
  for (const p of ["", "components/", "components/dialog/", "components/data-grid/", "components/calendar/", "components/line-chart/", "start/examples/", "foundations/failures/", "styles/materials/", "brand/licensing/"]) {
    await page.goto(`http://localhost:4321/en/latest/${p}`);
    expect(await noOverflow(page), `/${p}`).toBeLessThanOrEqual(0);
  }
  await page.goto("http://localhost:4321/en/latest/components/dialog/");
  await shot(page, "zoom-400-dialog-page");
  await ctx.close();
});

test("right-to-left: layout mirrors without overflow", async ({ page, isMobile }) => {
  test.skip(isMobile);
  await page.addInitScript(() => localStorage.setItem("orlo-prefs", JSON.stringify({ dir: "rtl" })));
  for (const p of ["components/slider/", "components/tabs/", "components/calendar/", "components/data-grid/"]) {
    await page.goto(p);
    await page.waitForTimeout(300);
    expect(await page.locator(".orlo-root").first().getAttribute("dir")).toBe("rtl");
    expect(await noOverflow(page), p).toBeLessThanOrEqual(0);
  }
  await page.goto("components/slider/");
  const thumb = page.locator(".stage .orlo-slider__thumb").first();
  await thumb.focus();
  const before = await thumb.getAttribute("aria-valuenow");
  await page.keyboard.press("ArrowLeft"); // in RTL, left increases
  expect(Number(await thumb.getAttribute("aria-valuenow"))).toBeGreaterThan(Number(before));
  await shot(page, "rtl-slider");
});

test("reduced motion: overlays appear without travel or blur", async ({ page, isMobile }) => {
  test.skip(isMobile);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("components/menu/");
  await page.locator(".stage").first().getByRole("button", { name: /Actions/ }).click();
  const t = await page.getByRole("menu").evaluate((el) => { const cs = getComputedStyle(el); return { transform: cs.transform, filter: cs.filter }; });
  expect(t.transform === "none" || /matrix\(1, 0, 0, 1, 0, 0\)/.test(t.transform)).toBe(true);
  expect(t.filter === "none" || t.filter === "blur(0px)").toBe(true);
});

test("reduced transparency: glass becomes solid", async ({ page, isMobile }) => {
  test.skip(isMobile);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
  await page.goto("components/dialog/");
  await page.locator(".stage").first().getByRole("button", { name: "Rename…" }).click();
  const bf = await page.locator(".orlo-modal__panel").evaluate((el) => getComputedStyle(el).backdropFilter);
  expect(bf === "none" || /blur\(0px\)/.test(bf)).toBe(true);
  await shot(page, "reduced-transparency-dialog");
});

test("touch targets: interactive controls are at least 24×24 CSS px", async ({ page, isMobile }) => {
  test.skip(!isMobile, "measured on the touch device profile");
  const small: string[] = [];
  for (const p of ["components/button/", "components/switch/", "components/checkbox/", "components/pagination/", "components/tabs/"]) {
    await page.goto(p);
    const found = await page.locator(".stage").first().evaluate((stage) => [...stage.querySelectorAll<HTMLElement>("button, a[href], input, [role=slider], [role=tab], [role=switch]")]
      .filter((el) => el.offsetParent !== null && !el.closest("[aria-hidden=true]"))
      .map((el) => { const r = (el.matches("input[type=checkbox], input[type=radio]") ? el.parentElement! : el).getBoundingClientRect(); return { w: r.width, h: r.height, n: el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 20) }; })
      .filter((r) => r.w < 24 || r.h < 24).map((r) => `${r.n} ${Math.round(r.w)}×${Math.round(r.h)}`));
    small.push(...found.map((f) => `${p}: ${f}`));
  }
  expect(small).toEqual([]);
});
