import { describe, expect, it, vi, afterEach } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { OrloProvider, Button, Dialog, Tabs, Select, Switch, Menu, Accordion, Tooltip, SegmentedControl, useToast, Checkbox, Table, OrloImage } from "./index.ts";

afterEach(cleanup);
const wrap = (ui: React.ReactNode, props: Partial<React.ComponentProps<typeof OrloProvider>> = {}) => render(<OrloProvider {...props}>{ui}</OrloProvider>);

describe("Button", () => {
  it("ignores activation while loading but stays focusable", async () => {
    const onClick = vi.fn();
    wrap(<Button loading onClick={onClick}>Save</Button>);
    const b = screen.getByRole("button", { name: /save/i });
    await userEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
    expect(b).toHaveAttribute("aria-busy", "true");
    expect(b).not.toBeDisabled();
  });
});

describe("Dialog", () => {
  it("moves focus in, closes on Escape and returns focus to the trigger", async () => {
    wrap(<Dialog title="Rename" trigger={<Button>Open</Button>}><input aria-label="Name" /></Dialog>);
    const trigger = screen.getByRole("button", { name: "Open" });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Rename" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger).toHaveFocus();
  });
  it("makes the page inert while open", async () => {
    wrap(<Dialog title="T" defaultOpen><p>x</p></Dialog>);
    await screen.findByRole("dialog");
    const app = document.querySelector(".orlo-root")!.closest("body > div")!;
    expect(app).toHaveAttribute("inert");
  });
});

describe("Tabs", () => {
  it("moves selection with arrow keys and keeps one tab stop", async () => {
    wrap(<Tabs label="Sections" items={[{ value: "a", label: "Alpha", content: "A body" }, { value: "b", label: "Beta", content: "B body" }]} />);
    const [a, b] = screen.getAllByRole("tab");
    expect(a).toHaveAttribute("tabindex", "0");
    expect(b).toHaveAttribute("tabindex", "-1");
    a.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(b).toHaveAttribute("aria-selected", "true");
    expect(b).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("B body");
    expect(screen.queryByText("A body")).toBeNull();
  });
});

describe("Select", () => {
  it("opens with the keyboard and commits with Enter", async () => {
    const onChange = vi.fn();
    wrap(<Select label="Fruit" onValueChange={onChange} options={[{ value: "a", label: "Apple" }, { value: "b", label: "Banana" }, { value: "c", label: "Cherry", disabled: true }]} />);
    const combo = screen.getByRole("combobox");
    combo.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("b"); // skipped the disabled option
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(combo).toHaveAccessibleName(/Fruit Banana/);
  });
});

describe("Switch / Checkbox / SegmentedControl", () => {
  it("switch reports checked state", async () => {
    wrap(<Switch label="Wi-Fi" />);
    const s = screen.getByRole("switch", { name: "Wi-Fi" });
    await userEvent.click(s);
    expect(s).toHaveAttribute("aria-checked", "true");
  });
  it("checkbox supports indeterminate", () => {
    wrap(<Checkbox label="All" indeterminate />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(true);
  });
  it("segmented control is a radiogroup with arrow keys", async () => {
    wrap(<SegmentedControl label="View" options={[{ value: "l", label: "List" }, { value: "g", label: "Grid" }]} />);
    screen.getByRole("radio", { name: "List" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "true");
  });
});

describe("Menu", () => {
  it("focuses the first item, runs onSelect and restores focus", async () => {
    const onSelect = vi.fn();
    wrap(<Menu trigger={<Button>Actions</Button>} items={[{ label: "Edit", onSelect }, { label: "Delete", disabled: true }]} />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    await userEvent.click(trigger);
    const item = await screen.findByRole("menuitem", { name: "Edit" });
    await waitFor(() => expect(item).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(trigger).toHaveFocus();
  });
});

describe("Accordion", () => {
  it("single mode keeps one open and unmounts collapsed content", async () => {
    wrap(<Accordion type="single" items={[{ value: "1", title: "One", content: "First" }, { value: "2", title: "Two", content: "Second" }]} />);
    await userEvent.click(screen.getByRole("button", { name: "One" }));
    expect(screen.getByText("First")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Two" }));
    await waitFor(() => expect(screen.queryByText("First")).toBeNull());
    expect(screen.getByRole("button", { name: "Two" })).toHaveAttribute("aria-expanded", "true");
  });
});

describe("Tooltip", () => {
  it("opens on keyboard focus and describes the trigger", async () => {
    wrap(<Tooltip content="Archive this item"><button>Archive</button></Tooltip>);
    await userEvent.tab();
    const tip = await screen.findByRole("tooltip");
    expect(screen.getByRole("button")).toHaveAttribute("aria-describedby", tip.id);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });
});

describe("Toast", () => {
  it("shows and dismisses a notification", async () => {
    function Demo() { const { toast } = useToast(); return <Button onClick={() => toast({ title: "Saved", duration: Infinity })}>Go</Button>; }
    wrap(<Demo />);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Saved");
    await userEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    await waitFor(() => expect(screen.queryByText("Saved")).toBeNull());
  });
});

describe("Table", () => {
  it("sorts and exposes aria-sort", async () => {
    const rows = [{ id: "1", name: "Pear", qty: 3 }, { id: "2", name: "Apple", qty: 10 }];
    wrap(<Table caption="Fruit" rowKey={(r) => r.id} rows={rows} columns={[{ key: "name", header: "Name", sortable: true }, { key: "qty", header: "Qty", sortable: true, align: "end" }]} />);
    await userEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("Apple");
  });
  it("renders a designed empty state", () => {
    wrap(<Table caption="Empty" rowKey={(r: { id: string }) => r.id} rows={[]} columns={[{ key: "id", header: "ID" }]} empty="No orders yet." />);
    expect(screen.getByText("No orders yet.")).toBeInTheDocument();
  });
});

describe("OrloImage", () => {
  it("makes no request when images are off", () => {
    const spy = vi.spyOn(window, "Image");
    wrap(<OrloImage src="/a.png" alt="Harbour" />, { images: "off" });
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByRole("img", { name: "Harbour" })).toBeInTheDocument();
    spy.mockRestore();
  });
  it("gives up after bounded retries and offers manual retry", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const made: HTMLImageElement[] = [];
    const Real = window.Image;
    window.Image = class extends Real { constructor() { super(); made.push(this); } } as typeof Image;
    wrap(<OrloImage src="/dead.png" alt="Dead" maxRetries={2} />);
    for (let i = 0; i < 3; i++) { await act(async () => { made[0].onerror?.(new Event("error")); await vi.advanceTimersByTimeAsync(5000); }); }
    expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
    window.Image = Real;
    vi.useRealTimers();
  });
});

describe("controlled usage", () => {
  it("Switch can be controlled", async () => {
    function C() { const [on, setOn] = useState(false); return <><Switch label="X" checked={on} onCheckedChange={setOn} /><span>{on ? "yes" : "no"}</span></>; }
    wrap(<C />);
    await userEvent.click(screen.getByRole("switch"));
    expect(screen.getByText("yes")).toBeInTheDocument();
  });
});
