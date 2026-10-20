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
  await expect(page.getByRole("link", { name: "Go to the documentation home" })).toHaveAttribute("href", "/en/latest/");
});

test("playground URLs recover from invalid values and generated JSX escapes text", async ({ page }) => {
  await page.goto("components/slider/?p.max=wat&p.step=0&p.min=100000");
  const preview = page.locator(".playground__stage");
  await expect(preview.getByRole("slider", { name: "Value" })).toHaveAttribute("aria-valuemin", "0");
  await expect(preview.getByRole("slider", { name: "Value" })).toHaveAttribute("aria-valuemax", "100");
  await expect.poll(() => new URL(page.url()).search).toBe("");
  await page.goto("components/slider/?p.min=-100");
  await expect(page.locator(".playground__stage").getByRole("slider", { name: "Value" })).toHaveAttribute("aria-valuenow", "0");
  await expect(page.locator(".playground__code code")).toContainText("defaultValue={0}");
  await page.goto("components/button/?p.children=Save%20%3Cnow%3E%20%7Bok%7D&p.variant=invalid");
  await expect(page.locator(".playground__code code")).toContainText('{"Save <now> {ok}"}');
  await expect(page.locator(".playground__stage").getByRole("button", { name: "Save <now> {ok}" })).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.has("p.variant")).toBe(false);
});

test("playground actions give a visible outcome", async ({ page }) => {
  await page.goto("components/chip/?p.kind=input");
  const stage = page.locator(".playground__stage");
  await stage.getByRole("button", { name: "Remove In stock" }).click();
  await expect(stage.getByRole("status")).toContainText("Chip removed");
  await stage.getByRole("button", { name: "Restore chip" }).click();
  await expect(stage.getByRole("button", { name: "Remove In stock" })).toBeVisible();
  await page.goto("components/chip/?p.kind=assist");
  await page.locator(".playground__stage").getByRole("button", { name: "In stock" }).click();
  await expect(page.locator(".playground__stage").getByRole("status")).toContainText("Action completed");
});

test("icon copy and failure recovery report what happened", async ({ page }) => {
  await page.goto("styles/icons/");
  await page.getByRole("button", { name: "Copy Icons.Search JSX" }).click();
  await expect(page.getByRole("status")).toContainText(/Copied Icons.Search|Clipboard access is unavailable/);
  await page.goto("foundations/failures/");
  await page.getByRole("button", { name: "Show recovery" }).click();
  await expect(page.getByRole("status").filter({ hasText: "secure payment method" })).toBeVisible();
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
  await page.getByRole("button", { name: "Search components and guides" }).click();
  const input = page.getByRole("combobox", { name: "Search" });
  await expect(input).toBeFocused();
  await input.fill("motion");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/styles\/motion\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Motion" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1, name: "Design the parts between the moments." })).toBeVisible();
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
  test.skip(isMobile, "covered by preferences on narrow screens");
  await page.goto("");
  // Cycle: Auto → Light → Dark.
  await page.getByRole("button", { name: /^Theme: Auto/ }).click();
  await page.getByRole("button", { name: /^Theme: Light/ }).click();
  await expect(page.getByRole("button", { name: /^Theme: Dark/ })).toBeVisible();
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(19, 18, 17)");
});

test("off switch keeps a visible thumb and toggles cleanly", async ({ page }) => {
  await page.goto("components/switch/");
  const sw = page.locator(".stage").first().getByRole("switch", { name: "Wi-Fi" });
  await expect(sw).toHaveAttribute("aria-checked", "true");
  await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", "false");
  const thumb = sw.locator(".orlo-switch__thumb");
  await expect(thumb).toBeVisible();
  const box = await thumb.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(16);
  expect(box?.height).toBeGreaterThanOrEqual(16);
  expect(await thumb.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
});

test("mobile navigation opens as a sheet", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("components/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const nav = page.getByRole("dialog", { name: "Menu" });
  await expect(nav).toBeVisible();
  await nav.getByRole("link", { name: "Select" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Select/ })).toBeVisible();
});

test("no horizontal overflow on any page", async ({ page }) => {
  for (const p of ["", "components/", "components/table/", "components/calendar/specs/", "start/examples/", "styles/motion/", "styles/color/", "foundations/edge-cases/", "start/theme-studio/", "develop/devices/", "components/data-list/", "brand/", "brand/badges/"]) {
    await page.goto(p);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `overflow on /${p}`).toBeLessThanOrEqual(0);
  }
});

test("docs controls and section starts align at tablet and phone widths", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await expect(page.locator(".header__nav")).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("brand/badges/");
  const code = page.locator(".code").first();
  const copy = await code.locator(".orlo-copy").boundingBox();
  const snippet = await code.locator("pre").boundingBox();
  expect(copy).not.toBeNull();
  expect(snippet).not.toBeNull();
  expect(copy!.y + copy!.height).toBeLessThanOrEqual(snippet!.y);
  expect(await code.locator("pre").evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);

  await page.goto("styles/motion/");
  await expect(page.locator(".page-header + h2").first()).toHaveCSS("border-top-width", "0px");

  await page.goto("develop/devices/");
  await expect(page.getByRole("radio", { name: "Small", exact: true })).toBeVisible();
});

for (const p of ["", "components/", "components/select/", "components/dialog/accessibility/", "components/calendar/", "start/examples/", "styles/motion/", "styles/color/", "start/theme-studio/", "foundations/accessibility/", "brand/", "brand/badges/"]) {
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

test("home page renders hero, quickstart terminal with copy button, and pillars", async ({ page }) => {
  await page.goto("");
  await expect(page.locator(".hero2 h1")).toBeVisible();
  const terminal = page.locator(".hero2__terminal");
  await expect(terminal).toBeVisible();
  await expect(terminal.locator("button.orlo-copy")).toBeVisible();
  await expect(page.locator(".home__proof")).toBeVisible();
  await expect(page.locator(".home__pillars")).toBeVisible();
  await expect(page.locator(".home__families")).toBeVisible();
});

test("home hero uses the page width and its own display typography", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop layout assertion");
  await page.goto("");
  const result = await page.evaluate(() => {
    const hero = document.querySelector(".hero2")!;
    const title = hero.querySelector("h1")!;
    return { width: hero.getBoundingClientRect().width, viewport: document.documentElement.clientWidth, font: parseFloat(getComputedStyle(title).fontSize) };
  });
  expect(result.width).toBeGreaterThan(result.viewport * 0.9);
  expect(result.font).toBeGreaterThan(60);
});

test("Brand badge studio updates the preview and embed code", async ({ page }) => {
  await page.goto("brand/badges/");
  const studio = page.locator(".badge-studio");
  await expect(studio.getByRole("img", { name: "Orlo – open-source design framework for React by Varun Karthic" })).toBeVisible();
  await studio.getByRole("radio", { name: "Accent" }).click();
  await studio.getByRole("radio", { name: "Inline" }).click();
  await expect(studio.locator(".orlo-bwo")).toHaveAttribute("data-tone", "accent");
  await expect(studio.locator(".orlo-bwo")).toHaveAttribute("data-layout", "inline");
  await expect(page.getByLabel("React badge embed")).toContainText('layout="inline" tone="accent"');
  await expect(page.getByLabel("HTML badge embed")).toContainText("orlo-badge-accent.svg");
  const svg = await page.request.get("brand-badges/orlo-badge-accent.svg");
  expect(svg.status()).toBe(200);
  expect(svg.headers()["content-type"]).toContain("image/svg+xml");
  expect(await svg.text()).toContain("by Varun Karthic");
});

test("theme studio settings tabs reveal actual scenes", async ({ page }) => {
  await page.goto("start/theme-studio/");
  const settings = page.locator(".scene--settings");
  await settings.getByRole("tab", { name: "Billing" }).click();
  await expect(settings.getByRole("tabpanel", { name: "Billing" })).toContainText("Pro plan");
  await expect(settings.getByRole("textbox", { name: "Display name" })).toHaveCount(0);
  await settings.getByRole("tab", { name: "Profile" }).click();
  await settings.getByRole("textbox", { name: "Display name" }).fill("Mira");
  await settings.getByRole("button", { name: "Save" }).click();
  await expect(settings.getByRole("status")).toContainText("saved for Mira");
  await settings.getByRole("button", { name: "Reset" }).click();
  await expect(settings.getByRole("textbox", { name: "Display name" })).toHaveValue("Theo");
});

test("device lab controls change the live preview without covering it", async ({ page }) => {
  await page.goto("develop/devices/");
  const lab = page.locator(".devicelab");
  const frame = lab.locator(".devicelab__frame");
  await expect(frame).toHaveAttribute("data-kind", "phone");
  await expect(lab.locator(".devicelab__safe")).toHaveCount(2);
  await page.getByRole("switch", { name: "Show safe areas" }).click();
  await expect(lab.locator(".devicelab__safe")).toHaveCount(0);
  await page.getByRole("switch", { name: "Landscape" }).click();
  await expect(frame.locator("iframe")).toHaveAttribute("style", /inline-size: 844px; block-size: 390px/);
});

test("example inbox opens and closes a local compose state", async ({ page }) => {
  await page.goto("start/examples/");
  await page.getByRole("button", { name: "Compose" }).click();
  await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible();
  await page.getByRole("button", { name: "Finish preview" }).click();
  await expect(page.getByText("Draft preview complete")).toBeVisible();
});

test("feedback demos have working recovery and next actions", async ({ page }) => {
  await page.goto("components/alert/");
  const alertStage = page.locator(".stage").first();
  await alertStage.getByRole("button", { name: "Retry preview" }).click();
  await expect(alertStage.getByText("Preview retry complete")).toBeVisible();
  await page.goto("components/empty-state/");
  const emptyStage = page.locator(".stage").first();
  await emptyStage.getByRole("button", { name: "Create draft invoice" }).click();
  await expect(emptyStage.getByText("Draft invoice created in this preview")).toBeVisible();
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

test("disabled toggles stay visible, pressed or not", async ({ page }) => {
  await page.goto("components/toggle-button/");
  for (const name of ["Off, disabled", "On, disabled"]) {
    const t = page.getByRole("button", { name });
    await expect(t).toBeVisible();
    await expect(t).toBeDisabled();
    const o = await t.evaluate((el) => { let n: Element | null = el, o = 1; while (n) { o *= Number(getComputedStyle(n).opacity); n = n.parentElement; } return o; });
    expect(o).toBeGreaterThanOrEqual(0.6);
  }
});

test("validation messages carry no glyph prefix", async ({ page }) => {
  await page.goto("start/examples/");
  await page.locator("#wizard").getByRole("button", { name: "Continue" }).click();
  const msg = page.locator("#wizard .orlo-field__msg").first();
  await expect(msg).toBeVisible();
  expect((await msg.innerText()).trim().startsWith("!")).toBe(false);
});
