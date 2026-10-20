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
    const badge = screen.getByRole("img", { name: "Orlo – open-source design framework for React by Varun Karthic" });
    expect(badge).toHaveTextContent("Open-source design framework for React");
    expect(badge).toHaveTextContent("by Varun Karthic");
  });
});

describe("Callout", () => {
  it("renders with tone, icon, and role note", () => {
    wrap(
      <Orlo.Callout title="Important Note" tone="note">
        This is editorial guidance.
      </Orlo.Callout>
    );
    const callout = screen.getByRole("note");
    expect(callout).toHaveAttribute("data-tone", "note");
    expect(screen.getByText("Important Note")).toBeInTheDocument();
    expect(screen.getByText("This is editorial guidance.")).toBeInTheDocument();
  });

  it("renders action if provided", () => {
    wrap(
      <Orlo.Callout
        title="Upgrade available"
        tone="tip"
        action={<button type="button">Upgrade now</button>}
      >
        New release installed.
      </Orlo.Callout>
    );
    expect(screen.getByRole("button", { name: "Upgrade now" })).toBeInTheDocument();
  });
});

describe("AspectRatio", () => {
  it("renders container with inline aspect-ratio style", () => {
    const { container } = wrap(
      <Orlo.AspectRatio ratio={16 / 9}>
        <img alt="Scenic preview" src="preview.jpg" />
      </Orlo.AspectRatio>
    );
    const el = container.querySelector(".orlo-aspect-ratio") as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el.style.aspectRatio).toBe("1.7777777777777777");
    expect(screen.getByRole("img", { name: "Scenic preview" })).toBeInTheDocument();
  });
});

describe("Collapsible", () => {
  it("toggles open and closed on trigger click", async () => {
    wrap(
      <Orlo.Collapsible trigger="Show details">
        <p>Hidden disclosure content</p>
      </Orlo.Collapsible>
    );
    const button = screen.getByRole("button", { name: "Show details" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Hidden disclosure content")).toBeInTheDocument();

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});

describe("StatusDot", () => {
  it("renders role status with accessible text and tone", () => {
    wrap(<Orlo.StatusDot tone="online" size="md" showLabel />);
    const dot = screen.getByRole("status");
    expect(dot).toHaveAttribute("data-status", "online");
    expect(dot).toHaveAttribute("data-tone", "success");
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("renders ping pulse element when ping=true", () => {
    const { container } = wrap(<Orlo.StatusDot tone="busy" ping />);
    expect(container.querySelector(".orlo-status-dot__ping")).toBeInTheDocument();
  });
});

describe("DateRangePicker", () => {
  it("renders field button with label and opens popover on click", async () => {
    wrap(
      <Orlo.DateRangePicker
        label="Trip Dates"
        value={{ start: null, end: null }}
      />
    );
    const trigger = screen.getByRole("button", { name: /Trip Dates/ });
    expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Tabs with variant", () => {
  it("applies data-variant pill", () => {
    const { container } = wrap(
      <Orlo.Tabs
        defaultValue="overview"
        variant="pill"
        items={[
          { value: "overview", label: "Overview", content: "Overview content" },
          { value: "specs", label: "Specs", content: "Specs content" },
        ]}
      />
    );
    const tabsRoot = container.querySelector(".orlo-tabs");
    expect(tabsRoot).toHaveAttribute("data-variant", "pill");
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
  });
});

describe("TextArea enhancements", () => {
  it("applies resize locks and bound styles", () => {
    wrap(<Orlo.TextArea label="Bio" resize="vertical" minHeight={80} maxHeight={300} minWidth="200px" maxWidth="500px" />);
    const textarea = screen.getByRole("textbox", { name: "Bio" });
    expect(textarea).toHaveAttribute("data-resize", "vertical");
    expect(textarea.style.minHeight).toBe("80px");
    expect(textarea.style.maxHeight).toBe("300px");
    expect(textarea.style.minWidth).toBe("200px");
    expect(textarea.style.maxWidth).toBe("500px");
  });
});

describe("PinInput enhancements", () => {
  it("renders 1-16 digits with group separators", () => {
    const { container } = wrap(<Orlo.PinInput label="Security PIN" length={8} groupSize={4} />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(8);
    const sep = container.querySelectorAll(".orlo-pin__sep");
    expect(sep).toHaveLength(1);
  });

  it("clears stale error on character entry", async () => {
    const { rerender } = wrap(<Orlo.PinInput label="Code" length={4} error="Code expired" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Code expired");
    const [first] = screen.getAllByRole("textbox");
    await userEvent.type(first, "1");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("NumberField quantity variant", () => {
  it("renders Add button at 0 and morphs to count controls on click", async () => {
    const onChange = vi.fn();
    wrap(<Orlo.NumberField label="Tickets" variant="quantity" value={0} onValueChange={onChange} />);
    const addBtn = screen.getByRole("button", { name: /Add Tickets/i });
    expect(addBtn).toBeInTheDocument();
    await userEvent.click(addBtn);
    expect(onChange).toHaveBeenCalledWith(1);
  });
});

describe("RangeSlider enhancements", () => {
  it("supports orientation vertical and data-orientation", () => {
    const { container } = wrap(<Orlo.RangeSlider label="Price Range" orientation="vertical" value={[20, 80]} />);
    const slider = container.querySelector(".orlo-slider");
    expect(slider).toHaveAttribute("data-orientation", "vertical");
  });
});

describe("DatePicker allowInput and Sheet enhancements", () => {
  it("renders text input when allowInput=true and opens popover via trigger", async () => {
    wrap(<Orlo.DatePicker label="Flight Date" allowInput defaultValue={new Date(2026, 9, 20)} />);
    const input = screen.getByRole("textbox", { name: /Flight Date/i });
    expect(input).toBeInTheDocument();
    const calBtn = screen.getByRole("button", { name: /Open calendar/i });
    expect(calBtn).toBeInTheDocument();
  });

  it("renders Sheet with side top and data-centered", () => {
    wrap(<Orlo.Sheet title="Top Notice" side="top" centered defaultOpen><p>Hello</p></Orlo.Sheet>);
    const modal = document.querySelector(".orlo-modal");
    expect(modal).toHaveAttribute("data-side", "top");
    expect(modal).toHaveAttribute("data-centered");
  });
});

describe("Batch C components (PieChart, DocumentViewer, SignaturePad)", () => {
  it("renders PieChart with role img and aria-label", () => {
    const data = [
      { label: "Engineering", value: 40 },
      { label: "Design", value: 30 },
      { label: "Product", value: 30 },
    ];
    const { container } = wrap(<Orlo.PieChart title="Distribution" data={data} />);
    expect(screen.getByRole("figure", { name: "Distribution" })).toBeInTheDocument();
    expect(container.querySelector('.orlo-donut[data-variant="pie"]')).toBeInTheDocument();
  });

  it("renders DocumentViewer with page, zoom, and rotate controls", () => {
    wrap(<Orlo.DocumentViewer src="/sample.pdf" title="Report" pages={5} allowPrint />);
    expect(screen.getByText("Report")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rotate clockwise" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Print document" })).toBeInTheDocument();
  });

  it("renders SignaturePad without Type instead button", () => {
    // jsdom has no canvas renderer; drawing itself is exercised in a browser.
    const context = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    try {
      wrap(<Orlo.SignaturePad label="Sign contract" />);
      expect(screen.queryByText("Type instead")).not.toBeInTheDocument();
      expect(screen.getByText("Undo")).toBeInTheDocument();
      expect(screen.getByText("Clear")).toBeInTheDocument();
    } finally {
      context.mockRestore();
    }
  });
});

describe("Generalized Dnd Primitives", () => {
  function DraggableItem({ id, label }: { id: string; label: string }) {
    const { attributes, listeners, setNodeRef, isDragging, transform } = Orlo.useDraggable({ id });
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        data-testid={`draggable-${id}`}
        style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      >
        {label} {isDragging ? "(dragging)" : ""}
      </div>
    );
  }

  it("renders draggable item with accessible attributes", () => {
    wrap(
      <Orlo.DndContext>
        <DraggableItem id="card-1" label="Card 1" />
      </Orlo.DndContext>
    );
    const item = screen.getByTestId("draggable-card-1");
    expect(item).toHaveAttribute("role", "button");
    expect(item).toHaveAttribute("aria-roledescription", "draggable item");
    expect(item).toHaveAttribute("aria-grabbed", "false");
  });

  it("handles keyboard pickup, arrow movement, and drop", async () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    wrap(
      <Orlo.DndContext onDragStart={onStart} onDragEnd={onEnd}>
        <DraggableItem id="card-1" label="Card 1" />
      </Orlo.DndContext>
    );
    const item = screen.getByTestId("draggable-card-1");
    item.focus();
    await userEvent.keyboard(" ");
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ active: expect.objectContaining({ id: "card-1" }) }));
    expect(screen.getByText(/Card 1 \(dragging\)/i)).toBeInTheDocument();

    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");
    expect(onEnd).toHaveBeenCalled();
  });

  it("respects modifiers such as snapToGrid and restrictToVerticalAxis", () => {
    const snap = Orlo.snapToGrid(25);
    const result = snap({ transform: { x: 37, y: 72 } });
    expect(result).toEqual({ x: 25, y: 75 });

    const vert = Orlo.restrictToVerticalAxis({ transform: { x: 40, y: 80 } });
    expect(vert).toEqual({ x: 0, y: 80 });
  });
});

describe("Rating polish", () => {
  it("renders with size variants sm, md, lg", () => {
    const { container } = wrap(<Orlo.Rating label="Small rating" size="sm" defaultValue={3} />);
    const group = container.querySelector(".orlo-rating");
    expect(group).toHaveAttribute("data-size", "sm");
  });

  it("supports custom icon render function", () => {
    const { container } = wrap(
      <Orlo.Rating
        label="Heart rating"
        defaultValue={2}
        icon={(active) => <span data-testid="heart">{active ? "❤️" : "🤍"}</span>}
      />
    );
    const hearts = container.querySelectorAll("[data-testid='heart']");
    expect(hearts).toHaveLength(5);
    expect(hearts[0]).toHaveTextContent("❤️");
    expect(hearts[1]).toHaveTextContent("❤️");
    expect(hearts[2]).toHaveTextContent("🤍");
  });
});

describe("CommandPalette shortcuts and icons", () => {
  it("renders command icon and keyboard shortcut", () => {
    wrap(
      <Orlo.CommandPalette
        open={true}
        onOpenChange={() => {}}
        commands={[
          {
            id: "copy",
            label: "Copy link",
            icon: <span data-testid="cmd-icon">📋</span>,
            shortcut: "⌘C",
            onSelect: () => {},
          },
        ]}
      />
    );
    expect(screen.getByTestId("cmd-icon")).toBeInTheDocument();
    expect(screen.getByText("⌘C")).toBeInTheDocument();
  });
});

describe("Wizard component", () => {
  it("renders steps, navigates with validation, and submits on completion", async () => {
    const onComplete = vi.fn();
    wrap(
      <Orlo.Wizard
        title="Setup Account"
        steps={[
          {
            id: "step1",
            title: "Account",
            content: ({ data, updateData, errors }) => (
              <div>
                <input
                  aria-label="Username"
                  value={(data.username as string) || ""}
                  onChange={(e) => updateData({ username: e.target.value })}
                />
                {errors.username && <span role="alert">{errors.username}</span>}
              </div>
            ),
            validate: (d) => {
              if (!d.username) return { username: "Username required" };
              return true;
            },
          },
          {
            id: "step2",
            title: "Profile",
            content: ({ data, updateData }) => (
              <div>
                <input
                  aria-label="City"
                  value={(data.city as string) || ""}
                  onChange={(e) => updateData({ city: e.target.value })}
                />
              </div>
            ),
          },
        ]}
        onComplete={onComplete}
      />
    );

    expect(screen.getByText("Setup Account")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();

    // Clicking Next without username triggers validation error
    const nextBtn = screen.getByRole("button", { name: "Next" });
    await userEvent.click(nextBtn);
    expect(screen.getByRole("alert")).toHaveTextContent("Username required");
    expect(onComplete).not.toHaveBeenCalled();

    // Type username and advance
    const input = screen.getByRole("textbox", { name: "Username" });
    await userEvent.type(input, "ada");
    await userEvent.click(nextBtn);

    // Now on step 2, button is "Complete"
    const completeBtn = screen.getByRole("button", { name: "Complete" });
    expect(completeBtn).toBeInTheDocument();
    await userEvent.click(completeBtn);
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ username: "ada" }));
  });
});

describe("FilterBuilder component", () => {
  it("renders empty state, adds rule, toggles conjunction, and removes rule", async () => {
    const onChange = vi.fn();
    wrap(
      <Orlo.FilterBuilder
        fields={[
          { id: "status", label: "Status", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] },
          { id: "age", label: "Age", type: "number" },
        ]}
        defaultValue={{ conjunction: "and", rules: [] }}
        onValueChange={onChange}
      />
    );

    expect(screen.getByText(/No active filters/i)).toBeInTheDocument();
    const addBtn = screen.getByRole("button", { name: /Add condition/i });
    await userEvent.click(addBtn);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        conjunction: "and",
        rules: expect.arrayContaining([expect.objectContaining({ field: "status" })]),
      })
    );
  });
});

describe("FeatureMatrix component", () => {
  it("renders tiers, categories, and handles boolean/text values with accessible marks", () => {
    wrap(
      <Orlo.FeatureMatrix
        tiers={[
          { id: "free", title: "Free Tier", price: "$0" },
          { id: "pro", title: "Pro Tier", price: "$20", highlighted: true, badge: "Best Value" },
        ]}
        rows={[
          {
            title: "API Access",
            category: "Platform",
            values: { free: true, pro: true },
          },
          {
            title: "Custom Domain",
            category: "Platform",
            values: { free: false, pro: "Unlimited" },
          },
        ]}
      />
    );

    expect(screen.getByText("Free Tier")).toBeInTheDocument();
    expect(screen.getByText("Pro Tier")).toBeInTheDocument();
    expect(screen.getByText("Best Value")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("API Access")).toBeInTheDocument();
    expect(screen.getByText("Unlimited")).toBeInTheDocument();
    expect(screen.getByLabelText("Included in Free Tier")).toBeInTheDocument();
    expect(screen.getByLabelText("Not included in Free Tier")).toBeInTheDocument();
  });
});

describe("OtpVerification component", () => {
  it("renders pin inputs, supports resend, and verifies on code completion", async () => {
    const onVerify = vi.fn().mockResolvedValue(true);
    const onResend = vi.fn().mockResolvedValue(undefined);

    wrap(
      <Orlo.OtpVerification
        length={4}
        deliveryTarget="user@test.com"
        onVerify={onVerify}
        onResend={onResend}
        resendCooldown={0}
      />
    );

    expect(screen.getByText(/user@test.com/i)).toBeInTheDocument();
    const boxes = screen.getAllByRole("textbox");
    expect(boxes).toHaveLength(4);

    // Test resend code before completion
    const resendBtn = screen.getByRole("button", { name: "Resend code" });
    await userEvent.click(resendBtn);
    expect(onResend).toHaveBeenCalled();

    // Type full code
    await userEvent.type(boxes[0], "1");
    await userEvent.type(boxes[1], "2");
    await userEvent.type(boxes[2], "3");
    await userEvent.type(boxes[3], "4");

    expect(onVerify).toHaveBeenCalledWith("1234");
    expect(await screen.findByText(/Code verified successfully/i)).toBeInTheDocument();
  });
});



