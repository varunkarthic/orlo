import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { useState } from "react";
import {
  OrloProvider, passwordStrength, parseLocaleNumber, NumberField, Combobox, TagInput, PinInput, Calendar, monthGrid, matchesAccept, dragVerdict,
  TreeView, visibleNodes, Highlight, comboFrom, diffLines, PasswordField, manifest, Chip,
} from "./index.ts";
import * as Orlo from "./index.ts";

afterEach(cleanup);
const wrap = (ui: React.ReactNode) => render(<OrloProvider>{ui}</OrloProvider>);

describe("Chip", () => {
  it("runs assist actions from keyboard and does not activate when disabled", async () => {
    const action = vi.fn();
    wrap(<><Chip kind="assist" onAction={action}>Share</Chip><Chip kind="assist" onAction={action} disabled>Unavailable</Chip><Chip kind="assist">No callback</Chip></>);
    screen.getByRole("button", { name: "Share" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(action).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Unavailable" }), { pointerEventsCheck: 0 });
    expect(action).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "No callback" })).toBeDisabled();
  });
  it("removes input chips with Delete, but not when disabled", async () => {
    const remove = vi.fn();
    wrap(<><Chip kind="input" onRemove={remove}>Design</Chip><Chip kind="input" onRemove={remove} disabled>Locked</Chip></>);
    const design = screen.getByText("Design").closest('[data-kind="input"]') as HTMLElement;
    design.focus();
    await userEvent.keyboard("{Delete}");
    expect(remove).toHaveBeenCalledOnce();
    const locked = screen.getByText("Locked").closest('[data-kind="input"]') as HTMLElement;
    expect(locked).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "Remove Locked" })).toBeDisabled();
    locked.focus();
    await userEvent.keyboard("{Backspace}");
    expect(remove).toHaveBeenCalledOnce();
  });
});

describe("pure helpers", () => {
  it("passwordStrength rejects repeats and common passwords", () => {
    expect(passwordStrength("")).toBe(0);
    expect(passwordStrength("password123")).toBe(0);
    expect(passwordStrength("aaaaaaaaaaaa")).toBeLessThan(passwordStrength("t7#Kq!m2Lp9z"));
    expect(passwordStrength("t7#Kq!m2Lp9z")).toBe(4);
  });
  it("parseLocaleNumber understands group and decimal separators", () => {
    expect(parseLocaleNumber("1,234.5", "en-US")).toBe(1234.5);
    expect(parseLocaleNumber("1.234,5", "de-DE")).toBe(1234.5);
    expect(parseLocaleNumber("1 234,5", "fr-FR")).toBe(1234.5);
    expect(parseLocaleNumber("abc", "en-US")).toBeNull();
    expect(parseLocaleNumber("-", "en-US")).toBeNull();
  });
  it("monthGrid starts on the locale's first weekday and covers six weeks", () => {
    const g = monthGrid(new Date(2026, 9, 18, 12), 1); // Oct 2026, Monday start
    expect(g).toHaveLength(42);
    expect(g[0].getDay()).toBe(1);
    expect(g.some((d) => d.getMonth() === 9 && d.getDate() === 1)).toBe(true);
    expect(monthGrid(new Date(2026, 9, 1, 12), 7)[0].getDay()).toBe(0);
  });
  it("matchesAccept and dragVerdict", () => {
    expect(matchesAccept({ name: "a.PNG", type: "image/png" }, "image/*")).toBe(true);
    expect(matchesAccept({ name: "a.pdf", type: "application/pdf" }, "image/*,.pdf")).toBe(true);
    expect(matchesAccept({ name: "a.exe", type: "application/x-msdownload" }, "image/*,.pdf")).toBe(false);
    expect(dragVerdict(["application/zip"], "image/*")).toBe("invalid");
    expect(dragVerdict(["application/zip"], ".zip")).toBe("valid"); // extension rules can't judge mid-drag
    expect(dragVerdict([], "image/*")).toBe("invalid");
  });
  it("visibleNodes follows expansion", () => {
    const nodes = [{ id: "a", label: "A", children: [{ id: "a1", label: "A1" }] }, { id: "b", label: "B" }];
    expect(visibleNodes(nodes, new Set()).map((n) => n.node.id)).toEqual(["a", "b"]);
    expect(visibleNodes(nodes, new Set(["a"])).map((n) => [n.node.id, n.depth])).toEqual([["a", 1], ["a1", 2], ["b", 1]]);
  });
  it("comboFrom requires a modifier and normalises", () => {
    expect(comboFrom({ key: "k", metaKey: true, ctrlKey: false, altKey: false, shiftKey: false }, true)).toBe("Mod+K");
    expect(comboFrom({ key: "k", metaKey: false, ctrlKey: false, altKey: false, shiftKey: false }, true)).toBeNull();
    expect(comboFrom({ key: "Shift", metaKey: false, ctrlKey: false, altKey: false, shiftKey: true }, true)).toBeNull();
    expect(comboFrom({ key: "s", metaKey: false, ctrlKey: true, altKey: false, shiftKey: true }, false)).toBe("Mod+Shift+S");
  });
  it("diffLines finds additions and removals", () => {
    const d = diffLines("a\nb\nc", "a\nc\nd");
    expect(d).toEqual([{ type: "same", text: "a" }, { type: "del", text: "b" }, { type: "same", text: "c" }, { type: "add", text: "d" }]);
  });
});

describe("Highlight", () => {
  it("marks accent-insensitive matches without breaking text", () => {
    const { container } = render(<p><Highlight text="Café and cafe" query="cafe" /></p>);
    expect(Array.from(container.querySelectorAll("mark")).map((m) => m.textContent)).toEqual(["Café", "cafe"]);
    expect(container.textContent).toBe("Café and cafe");
  });
  it("treats regex characters literally", () => {
    const { container } = render(<p><Highlight text="a+b (c)" query="(c)" /></p>);
    expect(container.querySelector("mark")?.textContent).toBe("(c)");
  });
});

describe("NumberField", () => {
  it("steps with arrows, clamps and formats on blur", async () => {
    const spy = vi.fn();
    wrap(<NumberField label="Qty" defaultValue={9} min={0} max={10} onValueChange={spy} />);
    const sb = screen.getByRole("spinbutton", { name: "Qty" });
    sb.focus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(spy).toHaveBeenLastCalledWith(10);
    await userEvent.keyboard("{Home}");
    expect(spy).toHaveBeenLastCalledWith(0);
    await userEvent.clear(sb); await userEvent.type(sb, "55"); sb.blur();
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith(10));
  });
});

describe("Combobox", () => {
  it("filters, navigates and selects", async () => {
    const spy = vi.fn();
    wrap(<Combobox label="Country" onValueChange={spy} options={[{ value: "it", label: "Italy" }, { value: "in", label: "India" }, { value: "ie", label: "Ireland" }]} />);
    const input = screen.getByRole("combobox", { name: "Country" });
    await userEvent.type(input, "ir");
    const opts = await screen.findAllByRole("option");
    expect(opts.map((o) => o.textContent)).toEqual(["Ireland"]);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(spy).toHaveBeenLastCalledWith("ie");
    expect(input).toHaveValue("Ireland");
  });
});

describe("TagInput", () => {
  it("adds on Enter, splits paste, refuses duplicates, removes with double Backspace", async () => {
    function C() { const [v, setV] = useState<string[]>([]); return <><TagInput label="Tags" value={v} onValueChange={setV} /><output>{v.join("|")}</output></>; }
    wrap(<C />);
    const input = screen.getByRole("textbox", { name: "Tags" });
    await userEvent.type(input, "red{Enter}");
    fireEvent.paste(input, { clipboardData: { getData: () => "green, blue; red" } });
    expect(document.querySelector("output")?.textContent).toBe("red|green|blue");
    expect(screen.getByRole("alert")).toHaveTextContent("already added");
    await userEvent.click(input); await userEvent.keyboard("{Backspace}");
    expect(document.querySelector("output")?.textContent).toBe("red|green|blue");
    await userEvent.keyboard("{Backspace}");
    expect(document.querySelector("output")?.textContent).toBe("red|green");
  });
});

describe("PinInput", () => {
  it("fills on paste and reports completion", async () => {
    const done = vi.fn();
    wrap(<PinInput label="Code" length={4} onComplete={done} />);
    const boxes = screen.getAllByRole("textbox");
    boxes[0].focus();
    fireEvent.paste(boxes[0], { clipboardData: { getData: () => "12a34" } });
    expect(done).toHaveBeenCalledWith("1234");
  });
  it("advances as you type", async () => {
    wrap(<PinInput label="Code" length={3} />);
    const boxes = screen.getAllByRole("textbox");
    await userEvent.click(boxes[0]); await userEvent.keyboard("7");
    expect(boxes[1]).toHaveFocus();
  });
});

describe("Calendar", () => {
  it("moves by day and week and selects with Enter", async () => {
    const spy = vi.fn();
    wrap(<Calendar locale="en-GB" defaultValue={new Date(2026, 9, 14, 12)} onValueChange={spy} />);
    const cur = screen.getByRole("button", { name: /14 October 2026/ });
    expect(cur).toHaveAttribute("tabindex", "0");
    cur.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowDown}{Enter}");
    expect(spy).toHaveBeenLastCalledWith(new Date(2026, 9, 22, 12));
  });
  it("PageDown moves a month and respects disabled dates", async () => {
    const spy = vi.fn();
    wrap(<Calendar locale="en-GB" defaultValue={new Date(2026, 0, 31, 12)} max={new Date(2026, 1, 20, 12)} onValueChange={spy} />);
    screen.getByRole("button", { name: /31 January 2026/ }).focus();
    await userEvent.keyboard("{PageDown}");
    const feb28 = await screen.findByRole("button", { name: /28 February 2026/ });
    expect(feb28).toHaveAttribute("aria-disabled", "true");
    await waitFor(() => expect(feb28).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("TreeView", () => {
  it("implements tree keyboard navigation", async () => {
    wrap(<TreeView label="Files" nodes={[{ id: "src", label: "src", children: [{ id: "app", label: "App.tsx" }, { id: "main", label: "main.tsx" }] }, { id: "readme", label: "README.md" }]} />);
    const src = screen.getByRole("treeitem", { name: /src/ });
    src.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(src).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByRole("treeitem", { name: "App.tsx" })).toHaveFocus());
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(src).toHaveFocus());
    await userEvent.keyboard("r");
    await waitFor(() => expect(screen.getByRole("treeitem", { name: "README.md" })).toHaveFocus());
  });
});

describe("PasswordField", () => {
  it("reveals without losing the value and labels the toggle", async () => {
    function C() { const [v, setV] = useState("secret"); return <PasswordField label="Password" value={v} onChange={(e) => setV(e.target.value)} showStrength />; }
    wrap(<C />);
    const input = screen.getByLabelText("Password") as HTMLInputElement;
    expect(input.type).toBe("password");
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input.type).toBe("text");
    expect(input.value).toBe("secret");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("catalogue integrity", () => {
  it("every manifest entry has a matching export", () => {
    const exported = new Set(Object.keys(Orlo));
    const alias: Record<string, string> = { Toast: "useToast" };
    const missing = manifest.filter((m) => !exported.has(alias[m.name] ?? m.name)).map((m) => m.name);
    expect(missing).toEqual([]);
  });
  it("components server-render without touching browser globals", () => {
    const html = renderToString(<OrloProvider><Orlo.Calendar /><Orlo.TimeField label="T" /><Orlo.ColorPicker label="C" /><Orlo.Carousel label="c" slides={["a", "b"]} /><Orlo.Heatmap label="h" data={{}} /><Orlo.ReadMore>Text</Orlo.ReadMore><Orlo.Splitter start="a" end="b" /></OrloProvider>);
    expect(html).toContain("orlo-calendar");
  });
});

describe("Slider v2", () => {
  it("keyboard steps and exposes slider semantics", async () => {
    const spy = vi.fn();
    wrap(<Orlo.Slider label="Volume" defaultValue={50} onValueChange={spy} />);
    const s = screen.getByRole("slider", { name: "Volume" });
    s.focus();
    await userEvent.keyboard("{ArrowRight}{PageUp}{End}");
    expect(spy.mock.calls.map((c) => c[0])).toEqual([51, 61, 100]);
    expect(s).toHaveAttribute("aria-valuenow", "100");
  });
});

describe("AsyncButton", () => {
  it("goes pending → success, then error → retry", async () => {
    let fail = false;
    wrap(<Orlo.AsyncButton action={() => (fail ? Promise.reject(new Error("x")) : Promise.resolve())} successLabel="Saved" errorLabel="Failed — retry" resetAfter={50}>Save</Orlo.AsyncButton>);
    const b = screen.getByRole("button", { name: /Save/ });
    await userEvent.click(b);
    await waitFor(() => expect(b).toHaveAttribute("data-state", "success"));
    expect(b).toHaveTextContent("Saved");
    await waitFor(() => expect(b).toHaveAttribute("data-state", "idle"));
    fail = true;
    await userEvent.click(b);
    await waitFor(() => expect(b).toHaveAttribute("data-state", "error"));
    expect(screen.getByRole("status")).toHaveTextContent("Failed — retry");
  });
  it("aborts on cancel", async () => {
    let aborted = false;
    wrap(<Orlo.AsyncButton cancellable action={(_, signal) => new Promise((_, rej) => signal.addEventListener("abort", () => { aborted = true; rej(new Error()); }))}>Export</Orlo.AsyncButton>);
    const b = screen.getByRole("button");
    await userEvent.click(b);
    expect(b).toHaveAttribute("data-state", "pending");
    await userEvent.click(b);
    expect(aborted).toBe(true);
    expect(b).toHaveAttribute("data-state", "idle");
  });
});

describe("Icons", () => {
  it("are decorative by default and labelled on request", () => {
    const { container } = render(<><Orlo.Icon name="Search" /><Orlo.Icon name="Heart" label="Favourite" /></>);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("img", { name: "Favourite" })).toBeInTheDocument();
    expect(Orlo.iconNames.length).toBeGreaterThan(250);
    for (const n of Orlo.iconNames) expect(n).toMatch(/^[A-Z][A-Za-z0-9]*$/);
  });
});

describe("BuiltWithOrlo", () => {
  it("is one link with a plain-text name and hides the artwork", async () => {
    const { BuiltWithOrlo } = await import("./index.ts");
    render(<BuiltWithOrlo kind="designed" tone="light" />);
    const link = screen.getByRole("link", { name: "Designed with Orlo" });
    expect(link.getAttribute("href")).toBe("https://orlo-react.readthedocs.io/");
    expect(link.dataset.tone).toBe("light");
    expect(link.querySelectorAll('svg[aria-hidden="true"]').length).toBe(1);
  });
  it("renders a static image when href is null", async () => {
    const { BuiltWithOrlo } = await import("./index.ts");
    render(<BuiltWithOrlo href={null} layout="inline" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("img", { name: "Built with Orlo" }).dataset.layout).toBe("inline");
  });
  it("credits the framework and its designer in the signature layout", async () => {
    const { BuiltWithOrlo } = await import("./index.ts");
    render(<BuiltWithOrlo layout="signature" href={null} />);
    const badge = screen.getByRole("img", { name: "Orlo — open-source design framework for React by Varun Karthic" });
    expect(badge).toHaveTextContent("Open-source design framework for React");
    expect(badge).toHaveTextContent("by Varun Karthic");
  });
});
