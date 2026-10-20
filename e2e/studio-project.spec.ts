import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("Design Studio restores an edited draft after reload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("design-studio/");
  const studio = page.locator(".design-studio");
  await expect(studio.locator(".design-studio__node")).toHaveCount(6);
  await studio.getByRole("button", { name: "Components", exact: true }).last().click();
  await studio.locator(".design-studio__palette-card").filter({ hasText: "Button" }).first().click();
  await expect(studio.locator(".design-studio__node")).toHaveCount(7);
  await expect(studio.getByText("Draft saved in this browser")).toBeVisible();
  await page.reload();
  await expect(studio.locator(".design-studio__node")).toHaveCount(7);
  await expect(studio.getByText("Draft saved in this browser")).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("orlo_studio_v3_draft")!));
  expect(stored.schemaVersion).toBe(1);
  expect(stored.items).toHaveLength(7);
});

test("Design Studio rejects invalid imports without replacing the canvas, then restores a valid import", async ({ page, isMobile }) => {
  test.skip(isMobile, "Import schema contract is viewport-independent; covered on desktop");
  await page.goto("design-studio/");
  const studio = page.locator(".design-studio");
  const input = studio.locator('input[type="file"][accept=".json"]');
  const setProject = (value: unknown) => input.setInputFiles({ name: "project.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(value)) });

  await setProject({ schemaVersion: 1, items: [{ id: "broken", type: "button", props: { label: "Unsafe" }, x: "0); alert(1)", y: 0, zIndex: 1 }] });
  await expect(page.getByText("Project JSON is invalid or unsupported; the current canvas is unchanged")).toBeVisible();
  await expect(studio.locator(".design-studio__node")).toHaveCount(6);

  const validProject = {
    schemaVersion: 1,
    items: [{ id: "imported-button", type: "button", props: { label: "Imported action", variant: "outline", size: "md" }, x: 32, y: 64, zIndex: 1 }],
    theme: { mode: "dark", accent: "#7C3AED", material: "solid", density: "compact", radiusScale: "round" },
    motion: { stiffness: 300, damping: 24, mass: 1 },
  };
  const chooserPromise = page.waitForEvent("filechooser");
  const importButton = studio.getByRole("button", { name: "Import", exact: true });
  await importButton.focus();
  await page.keyboard.press("Enter");
  await (await chooserPromise).setFiles({ name: "project.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(validProject)) });
  await expect(studio.locator(".design-studio__node")).toHaveCount(1);
  await expect(studio.locator(".design-studio__device-frame")).toHaveAttribute("data-orlo-theme", "dark");
  await expect(studio.getByText("Draft saved in this browser")).toBeVisible();
  await page.reload();
  await expect(studio.locator(".design-studio__node")).toHaveCount(1);
  await expect(studio.locator(".design-studio__device-frame")).toHaveAttribute("data-orlo-theme", "dark");
  await expect(studio.locator(".design-studio__node").first().getByRole("button", { name: "Imported action" })).toBeVisible();
  await expect(studio.locator('.design-studio__node .orlo-button[data-variant="tonal"]')).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await studio.getByRole("button", { name: "JSON", exact: true }).click();
  const download = await downloadPromise;
  const exported = await readFile(await download.path());
  const project = JSON.parse(exported.toString());
  expect(project.schemaVersion).toBe(1);
  expect(project.items).toHaveLength(1);
  await studio.getByRole("button", { name: "Templates", exact: true }).click();
  await studio.locator(".design-studio__template-card").first().click();
  await expect(studio.locator(".design-studio__node")).toHaveCount(6);
  await input.setInputFiles({ name: "round-trip.json", mimeType: "application/json", buffer: exported });
  await expect(studio.locator(".design-studio__node")).toHaveCount(1);
});

test("Design Studio migrates an older avatar draft and recovers from corrupt storage", async ({ page, isMobile }) => {
  test.skip(isMobile, "Draft migration is viewport-independent; covered on desktop");
  await page.goto("design-studio/");
  await page.evaluate((draft) => localStorage.setItem("orlo_studio_v3_draft", JSON.stringify(draft)), {
    items: [{ id: "old-avatar", type: "avatar", props: { name: "Alex Rivera", size: "lg", variant: "art" }, x: 40, y: 40, zIndex: 1 }],
    theme: { mode: "light", accent: "#1F5FA8", material: "solid", density: "comfortable" },
    motion: { stiffness: 300, damping: 24, mass: 1 },
  });
  await page.reload();
  await expect(page.locator('.design-studio__node .orlo-avatar[data-variant="marble"]')).toBeVisible();
  await expect(page.locator(".design-studio__node")).toHaveCount(1);

  await page.evaluate(() => localStorage.setItem("orlo_studio_v3_draft", "{broken"));
  await page.reload();
  await expect(page.locator(".design-studio__node")).toHaveCount(6);
  await expect(page.getByText("Draft could not be restored; the starter template is safe to edit")).toBeVisible();
});

test("all built-in Studio templates round-trip through exported JSON", async ({ page, isMobile }) => {
  test.skip(isMobile, "Project schema is viewport-independent; covered on desktop");
  await page.goto("design-studio/");
  const studio = page.locator(".design-studio");
  const input = studio.locator('input[type="file"][accept=".json"]');
  for (let index = 0; index < 6; index++) {
    await studio.getByRole("button", { name: "Templates", exact: true }).click();
    await studio.locator(".design-studio__template-card").nth(index).click();
    const count = await studio.locator(".design-studio__node").count();
    const downloadPromise = page.waitForEvent("download");
    await studio.getByRole("button", { name: "JSON", exact: true }).click();
    const exported = await readFile(await (await downloadPromise).path());
    await input.setInputFiles({ name: "round-trip.json", mimeType: "application/json", buffer: exported });
    await expect(studio.locator(".design-studio__node")).toHaveCount(count);
    await expect(page.getByText("Imported project successfully").last()).toBeVisible();
  }
});
