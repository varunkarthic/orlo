import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("deep link to a nested component page works directly and after reload", async ({ page }) => {
  await page.goto("components/dialog/");
  await expect(page.getByRole("heading", { level: 1, name: /Dialog/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: /Dialog/ })).toBeVisible();
  // assets resolved relative to /en/latest/
  await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute("href", /^\.\.\/\.\.\/assets\//);
});

test("unknown paths get the 404 page", async ({ page }) => {
  const res = await page.goto("does/not/exist/");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /open edge/ })).toBeVisible();
});

test("content is present without JavaScript", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("http://localhost:4321/en/latest/components/tabs/");
  await expect(page.getByRole("heading", { level: 1, name: /Tabs/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Highlights" })).toBeVisible();
  await ctx.close();
});

test("dialog: opens, traps focus, Escape closes, focus returns, scroll lock released", async ({ page }) => {
  await page.goto("components/dialog/");
  const trigger = page.locator(".stage").first().getByRole("button", { name: "Rename…" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Rename project" });
  await expect(dialog).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true);
  for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
});

test("menu near the viewport edge stays inside it", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto("components/menu/");
  const more = page.locator(".stage").first().getByRole("button", { name: "More" });
  await more.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 300));
  await more.click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  const box = (await menu.boundingBox())!;
  const vp = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
  await page.keyboard.press("End");
  await expect(page.getByRole("menuitem", { name: "Long menu item 24" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(more).toBeFocused();
});

test("search palette navigates to a page", async ({ page, isMobile }) => {
  await page.goto("");
  // Chromium reserves Ctrl+K on some Linux runners for browser chrome. The
  // component hotkey has unit coverage; this browser journey exercises the
  // visible, accessible trigger on every platform.
  await page.getByRole("button", { name: "Search documentation" }).click();
  const input = page.getByRole("combobox", { name: "Search" });
  await expect(input).toBeFocused();
  await input.fill("motion");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/styles\/motion\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Motion" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1, name: /afterthought/ })).toBeVisible();
});

test("preferences: images off removes image requests and persists", async ({ page, isMobile }) => {
  test.skip(isMobile, "covered on desktop");
  await page.goto("components/image/");
  await page.getByRole("button", { name: "Preferences" }).click();
  await page.getByRole("radiogroup", { name: "Images" }).getByRole("radio", { name: "Off" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".stage img")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".stage .orlo-image[data-state=disabled]").first()).toBeVisible();
});

test("theme toggle switches to dark without reload", async ({ page, isMobile }) => {
  test.skip(isMobile, "theme control hidden on narrow screens; in preferences");
  await page.goto("");
  await page.getByRole("radio", { name: "Dark" }).click();
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(18, 17, 16)");
});

test("mobile navigation opens as a sheet", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("components/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const nav = page.getByRole("dialog", { name: "Orlo" });
  await expect(nav).toBeVisible();
  await nav.getByRole("link", { name: "Select" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Select/ })).toBeVisible();
});

test("no horizontal overflow on any page", async ({ page }) => {
  for (const p of ["", "components/", "components/table/", "components/calendar/specs/", "start/examples/", "styles/motion/", "styles/color/", "foundations/edge-cases/", "start/theme-studio/", "components/data-list/"]) {
    await page.goto(p);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `overflow on /${p}`).toBeLessThanOrEqual(0);
  }
});

for (const p of ["", "components/", "components/select/", "components/dialog/accessibility/", "components/calendar/", "start/examples/", "styles/motion/", "styles/color/", "start/theme-studio/", "foundations/accessibility/"]) {
  test(`axe: no serious violations on /${p}`, async ({ page }) => {
    await page.goto(p);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });
}

test("component tabs are real pages with their own content", async ({ page }) => {
  await page.goto("components/select/accessibility/");
  const tabs = page.getByRole("navigation", { name: "Select documentation" });
  await expect(tabs.getByRole("link", { name: "Accessibility", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Keyboard" })).toBeVisible();
  await tabs.getByRole("link", { name: "Specs", exact: true }).click();
  await expect(page).toHaveURL(/components\/select\/specs\/$/);
  await expect(page.getByRole("heading", { name: "Anatomy" })).toBeVisible();
});

test("theme studio generates an accessible theme", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop");
  await page.goto("start/theme-studio/");
  await page.getByRole("textbox", { name: "Hex colour" }).fill("#FFE600");
  await expect(page.locator(".code pre").first()).toContainText("--orlo-color-accent:");
  await expect(page.getByText(/Adjusted to #/)).toBeVisible();
});

test("sign-up flow: validation focus, back keeps input, failure then retry", async ({ page }) => {
  await page.goto("start/examples/");
  const wiz = page.locator("#wizard");
  await wiz.getByRole("button", { name: "Continue" }).click();
  await expect(wiz.getByLabel("Full name")).toBeFocused();
  await wiz.getByLabel("Full name").fill("Grace Hopper");
  await wiz.getByLabel("Email").fill("grace@example.com");
  await wiz.getByRole("button", { name: "Continue" }).click();
  await wiz.getByRole("button", { name: "Back" }).click();
  await expect(wiz.getByLabel("Full name")).toHaveValue("Grace Hopper");
  await wiz.getByRole("button", { name: "Continue" }).click();
  await wiz.getByRole("button", { name: "Continue" }).click();
  await wiz.getByLabel("I accept the terms").check();
  await wiz.getByRole("button", { name: "Create workspace" }).click();
  await expect(wiz.getByRole("alert").filter({ hasText: "Couldn’t create" })).toBeVisible({ timeout: 5000 });
  await wiz.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("Welcome, Grace")).toBeVisible({ timeout: 5000 });
});
