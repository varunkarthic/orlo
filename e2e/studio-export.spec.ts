import path from "node:path";
import ts from "typescript";
import { expect, test } from "@playwright/test";

test("Design Studio templates export type-correct consumer TSX", async ({ page, isMobile }) => {
  test.skip(isMobile, "Export compilation is independent of viewport; covered on desktop");
  await page.goto("design-studio/");
  await page.getByRole("button", { name: "React code" }).click();

  const exported = new Map<string, string>();
  const capture = async (name: string) => {
    const lines = await page.locator(".design-studio__inspector-pane .orlo-codeblock__line > span:last-child").allTextContents();
    const code = lines.join("\n");
    expect(code).toContain('from "@orlo/react"');
    expect(code).not.toContain("apps/docs");
    exported.set(path.resolve("apps/docs/src", `GeneratedScreen-${name}.tsx`), code);
  };

  for (let index = 0; index < 6; index++) {
    await page.getByRole("button", { name: "Templates", exact: true }).click();
    const template = page.locator(".design-studio__template-card").nth(index);
    const name = (await template.locator("strong").innerText()).replace(/\W+/g, "-");
    await template.click();
    await capture(name);
  }

  await page.locator(".design-studio__palette-card").filter({ hasText: "Toggle Group" }).click();
  await page.getByRole("button", { name: "React code" }).click();
  await capture("File-Upload-with-Toggle-Group");
  expect(exported.get(path.resolve("apps/docs/src/GeneratedScreen-File-Upload-with-Toggle-Group.tsx"))).toContain('type="single"');

  await page.getByRole("button", { name: "Templates", exact: true }).click();
  await page.locator(".design-studio__template-card").first().click();
  await page.locator(".design-studio__node").nth(1).click();
  await page.getByRole("button", { name: "Props", exact: true }).click();
  const editedLabel = 'Save "draft" <now> {ok} & continue';
  await page.getByRole("textbox", { name: "Label Text" }).fill(editedLabel);
  await expect(page.locator(".design-studio__canvas-viewport").getByText(editedLabel)).toBeVisible();
  await page.getByRole("button", { name: "React code" }).click();
  await capture("Edited-Text-Field");
  expect(exported.get(path.resolve("apps/docs/src/GeneratedScreen-Edited-Text-Field.tsx"))).toContain("&quot;draft&quot; &lt;now&gt; &#123;ok&#125; &amp; continue");

  const frame = page.locator(".design-studio__device-frame");
  const firstAccent = await frame.evaluate((element) => getComputedStyle(element).getPropertyValue("--orlo-color-accent"));
  await page.getByRole("button", { name: "Theme", exact: true }).click();
  await page.getByRole("button", { name: "#7C3AED" }).click();
  await expect.poll(() => frame.evaluate((element) => getComputedStyle(element).getPropertyValue("--orlo-color-accent"))).not.toBe(firstAccent);
  await expect(page.getByText("Both checked pairings meet 4.5:1")).toBeVisible();
  await page.getByRole("button", { name: "React code" }).click();
  await capture("Edited-Accent");
  expect(exported.get(path.resolve("apps/docs/src/GeneratedScreen-Edited-Accent.tsx"))).toContain('createTheme("#7C3AED")');

  const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
  expect(config.error).toBeUndefined();
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
  const host = ts.createCompilerHost(parsed.options);
  const originalSource = host.getSourceFile.bind(host);
  const originalExists = host.fileExists.bind(host);
  const originalRead = host.readFile.bind(host);
  host.getSourceFile = (file, language, ...rest) => exported.has(file)
    ? ts.createSourceFile(file, exported.get(file)!, language, true, ts.ScriptKind.TSX)
    : originalSource(file, language, ...rest);
  host.fileExists = (file) => exported.has(file) || originalExists(file);
  host.readFile = (file) => exported.get(file) ?? originalRead(file);

  const program = ts.createProgram([...exported.keys()], parsed.options, host);
  const errors = ts.getPreEmitDiagnostics(program).map((diagnostic) => {
    const location = diagnostic.file && diagnostic.start !== undefined
      ? `${path.basename(diagnostic.file.fileName)}:${diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1}`
      : "global";
    return `${location}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`;
  });
  expect(errors).toEqual([]);
});
