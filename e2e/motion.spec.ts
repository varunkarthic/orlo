import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "no-preference" });

async function thumbX(page: import("@playwright/test").Page) {
  return page.evaluate(() => { const t = document.querySelector(".stage .orlo-slider__thumb")!.getBoundingClientRect(); return t.left + t.width / 2; });
}

test("slider: track click springs the thumb smoothly; drag tracks the pointer 1:1", async ({ page, isMobile }) => {
  test.skip(isMobile, "pointer-precise test on desktop");
  await page.goto("components/slider/");
  const track = page.locator(".stage .orlo-slider__track").first();
  const box = (await track.boundingBox())!;
  const start = await thumbX(page);
  const target = box.x + box.width * 0.92;
  // Start a per-frame sampler in the page, then click: the thumb must pass through intermediate positions.
  await page.evaluate(() => {
    const w = window as unknown as { __s: number[] }; w.__s = [];
    const el = document.querySelector(".stage .orlo-slider__thumb")!;
    const tick = () => { const r = el.getBoundingClientRect(); w.__s.push(r.left + r.width / 2); if (w.__s.length < 40) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  await page.mouse.click(target, box.y + box.height / 2);
  await page.waitForFunction(() => (window as unknown as { __s: number[] }).__s.length >= 40);
  const samples = await page.evaluate(() => (window as unknown as { __s: number[] }).__s);
  const intermediate = samples.filter((x) => Math.abs(x - start) > 4 && Math.abs(x - target) > 4);
  expect(intermediate.length, `samples ${samples.map(Math.round).join(",")}`).toBeGreaterThan(1);
  await page.waitForTimeout(600);
  expect(Math.abs((await thumbX(page)) - target)).toBeLessThan(box.width * 0.02 + 2);

  // Drag: pointer and thumb stay together on every move.
  const t0 = await thumbX(page);
  await page.mouse.move(t0, box.y + box.height / 2);
  await page.mouse.down();
  for (const f of [0.7, 0.5, 0.3, 0.2]) {
    const x = box.x + box.width * f;
    await page.mouse.move(x, box.y + box.height / 2);
    expect(Math.abs((await thumbX(page)) - x)).toBeLessThan(3);
  }
  await page.mouse.up();
});

test("overlays blur and fade in rather than popping", async ({ page }) => {
  await page.goto("components/menu/");
  await page.locator(".stage").first().getByRole("button", { name: /Actions/ }).click();
  const first = await page.getByRole("menu").evaluate((el) => getComputedStyle(el).opacity);
  await page.waitForTimeout(500);
  const settled = await page.getByRole("menu").evaluate((el) => ({ o: getComputedStyle(el).opacity, f: getComputedStyle(el).filter }));
  expect(Number(first)).toBeLessThan(1);
  expect(settled.o).toBe("1");
  expect(settled.f === "none" || settled.f === "blur(0px)").toBe(true);
});
