import { useState } from "react";
import { Tabs, Menu, CommandPalette, Breadcrumbs, Pagination, NavigationRail, BottomNavigation, Steps, TableOfContents, Button, IconButton, Switch, Icons } from "@orlo/react";
import type { Doc } from "./types.ts";

function PaletteDemo() {
  const [open, setOpen] = useState(false); const [last, setLast] = useState("nothing yet");
  const cmds = ["New document", "Open recent", "Share link", "Invite teammate", "Toggle theme", "Keyboard shortcuts", "Export as PDF", "Rename project"].map((label) => ({ id: label, label, group: "Actions", onSelect: () => setLast(label) }));
  return <><Button variant="subtle" onClick={() => setOpen(true)}>Open palette</Button><span>Ran: <strong>{last}</strong></span><CommandPalette commands={cmds} open={open} onOpenChange={setOpen} hotkey={false} /></>;
}
function PaginationDemo() { const [p, setP] = useState(4); return <Pagination page={p} count={12} onPageChange={setP} />; }
const navItems = (cur: string) => [{ href: "#inbox", label: "Inbox", icon: <Icons.Inbox />, badge: 3 }, { href: "#calendar", label: "Calendar", icon: <Icons.Calendar /> }, { href: "#files", label: "Files", icon: <Icons.Folder /> }, { href: "#settings", label: "Settings", icon: <Icons.Settings /> }].map((i) => ({ ...i, current: i.href === cur }));
function RailDemo() { const [c, setC] = useState("#inbox"); return <div onClick={(e) => { const a = (e.target as HTMLElement).closest("a"); if (a) { e.preventDefault(); setC(a.getAttribute("href")!); } }} style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}><NavigationRail items={navItems(c)} /><div style={{ inlineSize: 360, maxInlineSize: "100%" }}><BottomNavigation items={navItems(c)} /></div></div>; }

export const navigation: Record<string, Doc> = {
  tabs: {
    demo: () => <div style={{ inlineSize: "100%" }}><Tabs label="Project" items={[{ value: "overview", label: "Overview", content: <p style={{ margin: 0 }}>Tabs keep a single tab stop. Use arrow keys to move between them.</p> }, { value: "activity", label: "Activity", content: <p style={{ margin: 0 }}>Inactive panels are unmounted, so their controls never sit in the tab order.</p> }, { value: "settings", label: "Settings", content: <Switch label="Notify me" /> }, { value: "archived", label: "Archived", content: null, disabled: true }]} /></div>,
    code: `<Tabs label="Project" items={[\n  { value: "overview", label: "Overview", content: <Overview /> },\n  { value: "activity", label: "Activity", content: <Activity /> },\n]} />`,
    props: [["items", "{ value, label, content, disabled? }[]", ""], ["value / defaultValue / onValueChange", "", ""], ["label", "string", "Accessible name for the tab list."]],
    notes: ["One indicator travels directly to the new tab. It never sweeps through the tabs in between.", "The list scrolls horizontally on narrow screens rather than wrapping."],
    anatomy: [["Tab list", ".orlo-tabs__list"], ["Active tab", '[aria-selected="true"]'], ["Indicator", ".orlo-tabs__indicator"], ["Panel", ".orlo-tabs__panel"]],
    anatomyDemo: () => <Tabs label="x" items={[{ value: "a", label: "Overview", content: "Panel content" }, { value: "b", label: "Activity", content: "" }]} />,
    specs: [["Tab height", "--orlo-control-h"], ["Indicator", "--orlo-color-accent"], ["Indicator thickness", "2px"], ["Motion", "shift spring"]],
    useWhen: ["Switching between related views of the same thing."], avoidWhen: ["Sequential steps: use Steps.", "Navigating between pages: use links."],
    keyboard: [["Tab", "Into the tab list, then into the panel"], ["← / → (mirrored in RTL)", "Previous / next tab (activates it)"], ["Home / End", "First / last tab"]],
    semantics: ["tablist / tab / tabpanel with aria-selected, aria-controls and roving tabindex."],
  },
  menu: {
    demo: () => <><Menu trigger={<Button variant="subtle">Actions <Icons.ChevronDown size={16} /></Button>} items={[{ type: "label", label: "Document" }, { label: "Rename", shortcut: "R", icon: <Icons.Edit size={16} /> }, { label: "Duplicate", shortcut: "⌘D" }, { label: "Move to…", disabled: true }, { type: "separator" }, { label: "Delete", tone: "danger", icon: <Icons.Trash size={16} /> }]} /><Menu placement="bottom-end" trigger={<IconButton label="More"><Icons.More /></IconButton>} items={Array.from({ length: 24 }, (_, i) => ({ label: `Long menu item ${i + 1}` }))} /></>,
    code: `<Menu trigger={<Button>Actions</Button>} items={[\n  { label: "Rename", onSelect: rename },\n  { type: "separator" },\n  { label: "Delete", tone: "danger", onSelect: remove },\n]} />`,
    props: [["trigger", "ReactElement", "Receives aria-haspopup, aria-expanded and handlers."], ["items", "MenuItem[]", "item | separator | label."], ["placement", "Placement", "Preferred side; flips and shifts at edges."]],
    notes: ["Grows from its trigger; the origin is recomputed after flipping.", "Long menus scroll inside the panel with fade hints and never leave the viewport."],
    specs: [["Surface", "--orlo-color-surface-raised"], ["Item height", "36px (44px on touch)"], ["Active item", "--orlo-color-surface-selected"], ["Layer", "--orlo-layer-menu"], ["Corner radius", "--orlo-radius-lg"]],
    keyboard: [["↓ / ↑ on trigger", "Open at first / last item"], ["↓ / ↑", "Move"], ["Home / End", "First / last"], ["Typing", "Jump by label"], ["Enter / Space", "Choose"], ["Escape", "Close and return focus"], ["Tab", "Close and move on"]],
    semantics: ["WAI-ARIA menu button: role=menu, role=menuitem, aria-disabled for unavailable items."], edge: ["Trigger at the very bottom-right corner", "24+ items", "Pointer moves over disabled items"],
  },
  "command-palette": {
    demo: () => <PaletteDemo />, code: `<CommandPalette commands={[{ id: "new", label: "New document", onSelect: create }]} />  // ⌘K / Ctrl+K`,
    props: [["commands", "{ id, label, group?, hint?, keywords?, onSelect }[]", ""], ["open / onOpenChange", "", ""], ["hotkey", "boolean", "⌘K / Ctrl+K. Default true."], ["empty", "ReactNode", ""]],
    notes: ["Fuzzy ranking prefers word starts and contiguous runs.", "This site's search is this component over a static index. No server."],
    keyboard: [["⌘K / Ctrl+K", "Open or close"], ["↓ / ↑", "Move"], ["Enter", "Run"], ["Escape", "Close"]], semantics: ["Modal dialog containing a combobox and listbox; result count announced."], edge: ["Never acts mid-IME composition."],
  },
  breadcrumbs: {
    demo: () => <Breadcrumbs items={[{ label: "Workspace", href: "#" }, { label: "Projects", href: "#" }, { label: "Orlo" }]} />, code: `<Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: "Orlo" }]} />`,
    notes: ["The last item is the current page: aria-current and not a link.", "Separators mirror in RTL and are hidden from assistive tech."], semantics: ["<nav aria-label=Breadcrumb> with an ordered list."],
  },
  pagination: {
    demo: () => <PaginationDemo />, code: `<Pagination page={page} count={12} onPageChange={setPage} />`,
    notes: ["Always shows first, last, current and neighbours.", "Current page is a raised surface plus aria-current, not colour alone."], semantics: ["<nav aria-label=Pagination>; each page button is labelled “Page n”."],
  },
  "navigation-rail": {
    demo: () => <RailDemo />, code: `<NavigationRail items={[{ href: "/inbox", label: "Inbox", icon: <Icons.Inbox />, current: true }]} />`,
    notes: ["Labels are always visible: icons alone are not navigation.", "The active pill travels between destinations."], useWhen: ["3–7 top-level destinations on tablet and desktop."], semantics: ["<nav> of links with aria-current=page."],
  },
  "bottom-navigation": {
    demo: () => <RailDemo />, code: `<BottomNavigation items={items} />`, notes: ["Sits above the home indicator using safe-area insets.", "Badges are part of the visual only; include counts in labels when they matter."], useWhen: ["3–5 destinations on phones."],
  },
  steps: {
    demo: () => <div style={{ display: "grid", gap: 32, inlineSize: "100%" }}><Steps steps={[{ label: "Cart", state: "complete" }, { label: "Shipping", state: "complete" }, { label: "Payment", state: "current", description: "Card or bank" }, { label: "Review" }]} /><Steps orientation="vertical" steps={[{ label: "Account created", state: "complete" }, { label: "Verify email", state: "error", description: "Link expired. Send a new one." }, { label: "Invite team" }]} /></div>,
    code: `<Steps steps={[{ label: "Cart", state: "complete" }, { label: "Payment", state: "current" }, { label: "Review" }]} />`,
    notes: ["State is in the icon, the text and a hidden suffix for screen readers.", "On phones, only the current step's label is shown to save space."], semantics: ["Ordered list; the current step has aria-current=step."],
  },
  "table-of-contents": {
    demo: () => <TableOfContents items={[{ id: "overview", label: "Overview" }, { id: "variants", label: "Variants" }, { id: "behaviour", label: "Behaviour", level: 3 }]} />,
    code: `<TableOfContents items={[{ id: "intro", label: "Introduction" }]} />`, notes: ["Plain anchor links: works without JavaScript.", "Scrollspy uses IntersectionObserver, not scroll listeners. This page's own TOC is this component."],
  },
};
