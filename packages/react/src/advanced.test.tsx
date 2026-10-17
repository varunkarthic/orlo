import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { OrloProvider, niceTicks, windowRange, parseInline, Markdown, DataGrid, Composer, Kanban, AsyncContent, useAsync, type KanbanColumn } from "./index.ts";

afterEach(cleanup);
const wrap = (ui: React.ReactNode) => render(<OrloProvider>{ui}</OrloProvider>);

describe("chart maths", () => {
  it("niceTicks covers the range with round steps and includes zero across it", () => {
    expect(niceTicks(0, 97)).toEqual([0, 20, 40, 60, 80, 100]);
    const t = niceTicks(-6, 18);
    expect(t).toContain(0); expect(t[0]).toBeLessThanOrEqual(-6); expect(t.at(-1)).toBeGreaterThanOrEqual(18);
    expect(niceTicks(5, 5).length).toBeGreaterThan(1);
  });
  it("windowRange renders only the visible slice plus overscan", () => {
    expect(windowRange(0, 400, 40, 10000)).toEqual([0, 16]);
    expect(windowRange(40000, 400, 40, 10000)).toEqual([994, 1016]);
    expect(windowRange(399600, 400, 40, 10000)[1]).toBe(10000);
  });
});

describe("Markdown safety", () => {
  it("neutralises dangerous links and never injects HTML", () => {
    const n = parseInline("[x](javascript:alert(1))");
    expect((n[0] as { href: string }).href).toBe("#");
    const { container } = render(<Markdown source={"<img src=x onerror=alert(1)>\n\n**bold** and [ok](https://example.com)"} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("<img src=x onerror=alert(1)>");
    expect(container.querySelector("strong")?.textContent).toBe("bold");
    expect(container.querySelector("a")?.getAttribute("href")).toBe("https://example.com");
  });
  it("renders lists, quotes and code fences", () => {
    const { container } = render(<Markdown source={"- a\n- b\n\n> q\n\n```\ncode\n```"} />);
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.querySelector("blockquote")?.textContent).toBe("q");
    expect(container.querySelector("pre code")?.textContent).toBe("code");
  });
});

describe("DataGrid", () => {
  type R = { id: string; name: string; n: number };
  const rows: R[] = Array.from({ length: 500 }, (_, i) => ({ id: `r${i}`, name: `Row ${i}`, n: 500 - i }));
  it("virtualises, exposes grid semantics and selects with Space", async () => {
    const spy = vi.fn();
    wrap(<DataGrid label="Rows" columns={[{ key: "name", header: "Name", sortable: true }, { key: "n", header: "N", sortable: true, align: "end" }]} rows={rows} rowKey={(r) => r.id} selectable onSelectionChange={spy} height={300} />);
    const grid = screen.getByRole("grid", { name: "Rows" });
    expect(grid).toHaveAttribute("aria-rowcount", "501");
    expect(screen.getAllByRole("row").length).toBeLessThan(40); // not 500
    const firstHeader = screen.getAllByRole("columnheader")[0];
    firstHeader.focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement?.getAttribute("data-cell")).toBe("1-0"));
    await userEvent.keyboard(" ");
    expect(spy).toHaveBeenLastCalledWith(["r0"]);
  });
  it("sorts from the header with Enter", async () => {
    wrap(<DataGrid label="Rows" columns={[{ key: "name", header: "Name" }, { key: "n", header: "N", sortable: true }]} rows={rows.slice(0, 5)} rowKey={(r) => r.id} />);
    const h = screen.getAllByRole("columnheader")[1];
    h.focus(); await userEvent.keyboard("{Enter}");
    expect(h).toHaveAttribute("aria-sort", "ascending");
  });
});

describe("Composer", () => {
  it("sends on Enter, newline on Shift+Enter, never mid-composition", async () => {
    const send = vi.fn();
    wrap(<Composer onSend={send} />);
    const ta = screen.getByLabelText("Message");
    await userEvent.type(ta, "hello");
    fireEvent.keyDown(ta, { key: "Enter", isComposing: true });
    expect(send).not.toHaveBeenCalled();
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
    expect(send).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    expect(send).toHaveBeenCalledWith("hello");
  });
});

describe("Kanban", () => {
  it("moves a card across columns with the keyboard", async () => {
    function C() {
      const [cols, setCols] = useState<KanbanColumn[]>([{ id: "a", title: "To do", cards: [{ id: "x", title: "Task X" }] }, { id: "b", title: "Done", cards: [] }]);
      return <><Kanban columns={cols} onChange={setCols} /><output>{cols.map((c) => `${c.id}:${c.cards.map((k) => k.id).join(",")}`).join("|")}</output></>;
    }
    wrap(<C />);
    const card = screen.getByText("Task X").closest("li")!;
    card.focus();
    await userEvent.keyboard(" {ArrowRight} ");
    expect(document.querySelector("output")?.textContent).toBe("a:|b:x");
  });
});

describe("AsyncContent", () => {
  it("shows data, then error with retry", async () => {
    let fail = false;
    function C() { const r = useAsync(() => (fail ? Promise.reject(new Error("x")) : Promise.resolve(["a"])), []); return <AsyncContent result={r} errorTitle="Couldn’t load">{(d) => <p>Got {d.join()}</p>}</AsyncContent>; }
    wrap(<C />);
    expect(await screen.findByText("Got a")).toBeInTheDocument();
    fail = true;
    cleanup();
    wrap(<C />);
    expect(await screen.findByText("Couldn’t load")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    void act;
  });
});
