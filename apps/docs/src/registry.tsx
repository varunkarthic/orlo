import { useState, type ReactNode } from "react";
import {
  Button, IconButton, CopyButton, SegmentedControl, TextField, TextArea, Select, Checkbox, RadioGroup, Switch, Slider,
  Tabs, Menu, CommandPalette, Breadcrumbs, Pagination, Dialog, AlertDialog, Sheet, Popover, Tooltip, useToast, Accordion,
  Card, Stack, Divider, Badge, Avatar, AvatarGroup, Table, AnimatedNumber, Kbd, Alert, Progress, Spinner, Skeleton, EmptyState,
  OrloImage, Icons,
} from "@orlo/react";

export type Doc = { demo: () => ReactNode; code: string; notes: string[]; props?: [string, string, string][] };

export const sampleImage = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0B48C"/><stop offset="1" stop-color="#C2410C"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="290" cy="96" r="36" fill="#FBE3D3"/><path d="M0 230 Q90 170 180 214 T400 190 V300 H0Z" fill="#1C1B18"/></svg>');

const people = [{ name: "Ada Lovelace" }, { name: "Grace Hopper" }, { name: "Alan Turing" }, { name: "Katherine Johnson" }, { name: "Edsger Dijkstra" }, { name: "Barbara Liskov" }];

function LoadingButton() {
  const [busy, setBusy] = useState(false);
  return <Button loading={busy} loadingLabel="Saving" onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 1600); }}>Save changes</Button>;
}
function EmailField() {
  const [v, setV] = useState("");
  const bad = v.length > 0 && !/^\S+@\S+\.\S+$/.test(v);
  return <div style={{ inlineSize: "min(100%, 22rem)" }}><TextField label="Email" type="email" autoComplete="email" value={v} onChange={(e) => setV(e.target.value)} help="Used only to sign you in." error={bad ? "Enter an address like name@example.com." : undefined} /></div>;
}
function Bio() {
  const [v, setV] = useState("");
  return <div style={{ inlineSize: "min(100%, 26rem)" }}><TextArea label="Bio" value={v} onChange={(e) => setV(e.target.value)} maxLength={160} showCount help="A sentence or two." /></div>;
}
function ToastDemo() {
  const { toast } = useToast();
  return (
    <>
      <Button variant="subtle" onClick={() => toast({ title: "Draft saved", tone: "success" })}>Success</Button>
      <Button variant="subtle" onClick={() => toast({ title: "Message archived", description: "Moved to Archive.", action: { label: "Undo", onClick: () => toast({ title: "Restored" }) } })}>With undo</Button>
      <Button variant="subtle" onClick={() => toast({ title: "Upload failed", description: "The file is larger than 25 MB.", tone: "error" })}>Error (persistent)</Button>
    </>
  );
}
function AlertDemo() {
  const [open, setOpen] = useState(true);
  return (
    <Stack gap={3} style={{ inlineSize: "100%" }}>
      <div><Button variant="subtle" onClick={() => setOpen((o) => !o)}>{open ? "Dismiss" : "Show"} alert</Button></div>
      <Alert tone="warning" open={open} title="Connection is slow">Changes are saved on this device and will sync when the network recovers.</Alert>
      <Alert tone="error" title="Payment declined" action={<Button variant="ghost" data-size="sm">Retry</Button>}>Your card was not charged.</Alert>
      <Alert tone="success" title="Published">Everyone with the link can see it now.</Alert>
    </Stack>
  );
}
function ProgressDemo() {
  const [v, setV] = useState(35);
  return (
    <Stack gap={5} style={{ inlineSize: "min(100%, 24rem)" }}>
      <Progress label="Uploading photos" value={v} />
      <Progress label="Preparing export" />
      <Stack direction="row" gap={2}><Button variant="subtle" onClick={() => setV((x) => Math.max(0, x - 15))}>−15</Button><Button variant="subtle" onClick={() => setV((x) => Math.min(100, x + 15))}>+15</Button></Stack>
    </Stack>
  );
}
function NumberDemo() {
  const [n, setN] = useState(1284.5);
  return (
    <Stack direction="row" gap={4} align="center" wrap>
      <span style={{ fontSize: "2rem", fontWeight: 650 }}><AnimatedNumber value={n} format={{ style: "currency", currency: "EUR" }} /></span>
      <Button variant="subtle" onClick={() => setN((x) => +(x + Math.round(Math.random() * 400 - 200) + Math.random()).toFixed(2))}>Change</Button>
      <Button variant="ghost" onClick={() => setN((x) => -Math.abs(x))}>Make negative</Button>
    </Stack>
  );
}
function PaginationDemo() {
  const [p, setP] = useState(4);
  return <Pagination page={p} count={12} onPageChange={setP} />;
}
function PaletteDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("nothing yet");
  const cmds = ["New document", "Open recent", "Share link", "Invite teammate", "Toggle theme", "Keyboard shortcuts"].map((label) => ({ id: label, label, group: "Actions", onSelect: () => setLast(label) }));
  return <><Button variant="subtle" onClick={() => setOpen(true)}>Open palette</Button><span>Ran: <strong>{last}</strong></span><CommandPalette commands={cmds} open={open} onOpenChange={setOpen} hotkey={false} /></>;
}
function SelectDemo() {
  const [v, setV] = useState("");
  return (
    <div style={{ inlineSize: "min(100%, 18rem)" }}>
      <Select label="Time zone" value={v} onValueChange={setV} placeholder="Choose a time zone" help={v ? `Selected: ${v}` : "Type to jump to an option."}
        options={[{ value: "Europe/Rome", label: "Rome" }, { value: "Europe/London", label: "London" }, { value: "America/New_York", label: "New York" }, { value: "Asia/Kolkata", label: "Kolkata" }, { value: "Asia/Tokyo", label: "Tokyo" }, { value: "Pacific/Auckland", label: "Auckland", disabled: true }]} />
    </div>
  );
}
const tableRows = [
  { id: "1", name: "Linen notebook", stock: 42, price: 18 },
  { id: "2", name: "Brass pen", stock: 7, price: 64 },
  { id: "3", name: "Archive box", stock: 0, price: 29 },
  { id: "4", name: "Ink, sepia", stock: 120, price: 12 },
];
function TableDemo() {
  const [filter, setFilter] = useState("");
  const rows = tableRows.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()));
  return (
    <Stack gap={3} style={{ inlineSize: "100%" }}>
      <div style={{ maxInlineSize: "18rem" }}><TextField label="Filter" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Try “pen” or “zzz”" /></div>
      <Table caption="Inventory" rowKey={(r) => r.id} rows={rows}
        empty={<EmptyState title="No products match" description="Clear the filter to see everything." action={<Button variant="subtle" onClick={() => setFilter("")}>Clear filter</Button>} />}
        columns={[
          { key: "name", header: "Product", sortable: true },
          { key: "stock", header: "Stock", sortable: true, align: "end", render: (r) => r.stock === 0 ? <Badge tone="error">Out of stock</Badge> : r.stock },
          { key: "price", header: "Price", sortable: true, align: "end", render: (r) => new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(r.price) },
        ]} />
    </Stack>
  );
}

export const docs: Record<string, Doc> = {
  button: {
    demo: () => <><Button>Solid</Button><Button variant="subtle">Subtle</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Delete</Button><Button disabled>Disabled</Button><LoadingButton /></>,
    code: `<Button>Continue</Button>\n<Button variant="subtle">Cancel</Button>\n<Button loading={saving} loadingLabel="Saving" onClick={save}>Save changes</Button>`,
    props: [["variant", '"solid" | "subtle" | "ghost" | "danger"', "Visual weight. Default solid."], ["loading", "boolean", "Keeps width and focus, sets aria-busy, ignores activation."], ["loadingLabel", "string", "Announced while loading."], ["…button attributes", "", "Forwarded to the native <button>."]],
    notes: ["Pressing compresses the button by 3%: immediate acknowledgement before anything else happens.", "Hover styles apply only on hover-capable fine pointers, so touch never shows a stuck hover.", "Height follows density: 40px comfortable, 32px compact, 48px touch (default on coarse pointers)."],
  },
  "icon-button": {
    demo: () => <><IconButton label="Search"><Icons.Search /></IconButton><IconButton label="Add" variant="subtle"><Icons.Plus /></IconButton><IconButton label="More options" variant="solid"><Icons.More /></IconButton><Tooltip content="Close panel"><IconButton label="Close"><Icons.X /></IconButton></Tooltip></>,
    code: `<IconButton label="Search"><Icons.Search /></IconButton>`,
    props: [["label", "string", "Required accessible name."], ["variant", '"ghost" | "subtle" | "solid"', "Default ghost."], ["size", '"sm" | "md"', "Default md (matches control height)."]],
    notes: ["The label is mandatory in the type, so an unnamed icon button cannot compile.", "Pair with Tooltip when the icon alone may be ambiguous for sighted users."],
  },
  "copy-button": {
    demo: () => <><code>npm install @orlo/react</code><CopyButton text="npm install @orlo/react" /></>,
    code: `<CopyButton text="npm install @orlo/react" />`,
    props: [["text", "string", "Copied to the clipboard."], ["label", "string", "Idle label. Default “Copy”."]],
    notes: ["Confirms in place and announces via a polite live region.", "If the Clipboard API is blocked, it says so instead of pretending."],
  },
  "segmented-control": {
    demo: () => <><SegmentedControl label="View" options={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }, { value: "board", label: "Board" }]} /><SegmentedControl label="Theme" size="sm" options={[{ value: "light", label: <Icons.Sun size={16} />, "aria-label": "Light" }, { value: "dark", label: <Icons.Moon size={16} />, "aria-label": "Dark" }]} /></>,
    code: `<SegmentedControl label="View" value={view} onValueChange={setView}\n  options={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }]} />`,
    props: [["label", "string", "Accessible group name."], ["options", "{ value, label, aria-label? }[]", "Use aria-label for icon-only options."], ["value / defaultValue / onValueChange", "", "Controlled or uncontrolled."], ["size", '"sm" | "md"', ""]],
    notes: ["A radiogroup with roving focus: Tab enters once, arrows move (mirrored in RTL).", "Selection is shown by a raised surface and heavier weight, not by colour.", "The surface travels between options with the `shift` spring; rapid changes redirect it."],
  },
  "text-field": {
    demo: () => <EmailField />,
    code: `<TextField label="Email" type="email" value={email} onChange={…}\n  help="Used only to sign you in." error={error} />`,
    props: [["label", "ReactNode", "Visible label, always."], ["help", "ReactNode", "Hint text, linked via aria-describedby."], ["error", "ReactNode", "Replaces help; sets aria-invalid and announces."], ["…input attributes", "", "Forwarded to <input>."]],
    notes: ["The message line is always reserved, so validation never pushes the rest of the form down.", "Errors are announced, prefixed with a glyph and drawn with a doubled border: never colour alone."],
  },
  "text-area": {
    demo: () => <Bio />,
    code: `<TextArea label="Bio" value={bio} onChange={…} maxLength={160} showCount />`,
    props: [["label / help / error", "", "As TextField."], ["showCount", "boolean", "Live count, against maxLength if set."]],
    notes: ["Grows with its content where CSS field-sizing is supported; falls back to manual resize.", "Count updates politely so screen readers are not interrupted on each keystroke."],
  },
  select: {
    demo: () => <SelectDemo />,
    code: `<Select label="Time zone" value={tz} onValueChange={setTz}\n  options={[{ value: "Europe/Rome", label: "Rome" }, …]} />`,
    props: [["label", "ReactNode", ""], ["options", "{ value, label, disabled?, description? }[]", ""], ["value / defaultValue / onValueChange", "", ""], ["placeholder", "string", ""], ["name", "string", "Adds a hidden input for native form submission."]],
    notes: ["Focus stays on the trigger; the active option is tracked with aria-activedescendant.", "Typeahead works while closed (changes the value) and open (moves the highlight).", "Disabled options are skipped by the keyboard and announced as unavailable.", "The list flips above the trigger near the bottom of the screen and scrolls if long."],
  },
  checkbox: {
    demo: () => <Stack gap={3}><Checkbox label="Email me about replies" defaultChecked /><Checkbox label="Select all" indeterminate /><Checkbox label="Archived (disabled)" disabled /><Checkbox label="Weekly digest" description="One email every Monday." /></Stack>,
    code: `<Checkbox label="Email me about replies" checked={on} onChange={(e) => setOn(e.target.checked)} />`,
    props: [["label", "ReactNode", ""], ["indeterminate", "boolean", "Mixed state, set on the real input."], ["description", "ReactNode", ""], ["…input attributes", "", "Native checkbox props."]],
    notes: ["A real <input type=checkbox>: forms, autofill and assistive tech behave natively.", "The tick draws itself in; under reduced motion it simply appears."],
  },
  "radio-group": {
    demo: () => <RadioGroup legend="Delivery" name="delivery" defaultValue="standard" options={[{ value: "standard", label: "Standard", description: "3–5 working days" }, { value: "express", label: "Express", description: "Next working day" }, { value: "pickup", label: "Pick up in store", disabled: true }]} />,
    code: `<RadioGroup legend="Delivery" name="delivery" value={v} onValueChange={setV}\n  options={[{ value: "standard", label: "Standard" }, …]} />`,
    props: [["legend", "ReactNode", "Group label (fieldset legend)."], ["name", "string", ""], ["options", "{ value, label, description?, disabled? }[]", ""], ["orientation", '"vertical" | "horizontal"', ""]],
    notes: ["Native radios in a fieldset: arrow keys and grouping come from the platform."],
  },
  switch: {
    demo: () => <Stack gap={4}><Switch label="Wi-Fi" defaultChecked /><Switch label="Low data mode" description="Pauses image loading on cellular." /><Switch label="Managed by your organisation" disabled defaultChecked /></Stack>,
    code: `<Switch label="Wi-Fi" checked={on} onCheckedChange={setOn} />`,
    props: [["label", "ReactNode", ""], ["checked / defaultChecked / onCheckedChange", "", ""], ["description", "ReactNode", ""], ["name", "string", "Hidden input for forms."]],
    notes: ["For settings that take effect immediately. Use a Checkbox inside forms that need submitting.", "The thumb springs with the `press` preset; tapping rapidly redirects it mid-flight without jumps.", "The touch target extends beyond the visible track."],
  },
  slider: {
    demo: () => <div style={{ inlineSize: "min(100%, 20rem)" }}><Stack gap={5}><Slider label="Volume" defaultValue={60} format={(v) => `${v}%`} /><Slider label="Price limit" min={0} max={500} step={25} defaultValue={150} format={(v) => `€${v}`} /></Stack></div>,
    code: `<Slider label="Volume" value={v} onValueChange={setV} format={(v) => \`\${v}%\`} />`,
    props: [["label", "ReactNode", ""], ["min / max / step", "number", ""], ["format", "(v) => string", "Visible and announced value."]],
    notes: ["A native range input: keyboard, pen, touch and screen readers work as the platform intends.", "touch-action: pan-y lets the page still scroll vertically when a thumb lands on the track."],
  },
  tabs: {
    demo: () => <div style={{ inlineSize: "100%" }}><Tabs label="Project" items={[{ value: "overview", label: "Overview", content: <p style={{ margin: 0 }}>Tabs keep a single tab stop. Use arrow keys to move between them.</p> }, { value: "activity", label: "Activity", content: <p style={{ margin: 0 }}>Inactive panels are unmounted, so their controls never sit in the tab order.</p> }, { value: "settings", label: "Settings", content: <Switch label="Notify me" /> }, { value: "archived", label: "Archived", content: null, disabled: true }]} /></div>,
    code: `<Tabs label="Project" items={[\n  { value: "overview", label: "Overview", content: <Overview /> },\n  { value: "activity", label: "Activity", content: <Activity /> },\n]} />`,
    props: [["items", "{ value, label, content, disabled? }[]", ""], ["value / defaultValue / onValueChange", "", ""], ["label", "string", "Accessible name for the tab list."]],
    notes: ["Automatic activation with roving focus; Home/End jump; arrows mirror in RTL.", "One indicator travels directly to the new tab. It never sweeps through the tabs in between.", "The list scrolls horizontally on narrow screens rather than wrapping."],
  },
  menu: {
    demo: () => <><Menu trigger={<Button variant="subtle">Actions <Icons.ChevronDown size={16} /></Button>} items={[{ type: "label", label: "Document" }, { label: "Rename", shortcut: "R", onSelect: () => {} }, { label: "Duplicate", shortcut: "⌘D" }, { label: "Move to…", disabled: true }, { type: "separator" }, { label: "Delete", tone: "danger" }]} /><Menu placement="bottom-end" trigger={<IconButton label="More"><Icons.More /></IconButton>} items={Array.from({ length: 24 }, (_, i) => ({ label: `Long menu item ${i + 1}` }))} /></>,
    code: `<Menu trigger={<Button>Actions</Button>} items={[\n  { label: "Rename", onSelect: rename },\n  { type: "separator" },\n  { label: "Delete", tone: "danger", onSelect: remove },\n]} />`,
    props: [["trigger", "ReactElement", "Receives aria-haspopup, aria-expanded and handlers."], ["items", "MenuItem[]", "item | separator | label."], ["placement", "Placement", "Preferred side; flips and shifts at edges."]],
    notes: ["ArrowDown/ArrowUp on the trigger open at the first/last item. Typeahead jumps by label.", "Escape returns focus to the trigger; Tab closes and moves on.", "Long menus scroll inside the panel with fade hints at the edges and never leave the viewport.", "Submenus are not implemented yet."],
  },
  "command-palette": {
    demo: () => <PaletteDemo />,
    code: `<CommandPalette commands={[\n  { id: "new", label: "New document", onSelect: create },\n]} />  // ⌘K / Ctrl+K opens it`,
    props: [["commands", "{ id, label, group?, hint?, keywords?, onSelect }[]", ""], ["open / onOpenChange", "", ""], ["hotkey", "boolean", "Register ⌘K / Ctrl+K. Default true."], ["empty", "ReactNode", "No-results message."]],
    notes: ["Combobox and listbox semantics; result count is announced.", "Never acts mid-IME composition, so Japanese or Chinese input does not trigger commands early.", "This site's search (top bar, or ⌘K) is this component over a static index: no server needed."],
  },
  breadcrumbs: {
    demo: () => <Breadcrumbs items={[{ label: "Workspace", href: "#" }, { label: "Projects", href: "#" }, { label: "Orlo" }]} />,
    code: `<Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: "Orlo" }]} />`,
    notes: ["The last item is the current page: marked aria-current and not a link.", "Separators mirror in RTL and are hidden from assistive tech."],
  },
  pagination: {
    demo: () => <PaginationDemo />,
    code: `<Pagination page={page} count={12} onPageChange={setPage} />`,
    notes: ["Always shows first, last, current and neighbours; the rest collapse to an ellipsis.", "Current page uses aria-current and a raised surface, not colour alone."],
  },
  dialog: {
    demo: () => <Dialog title="Rename project" description="This changes the name for everyone on the team." trigger={<Button>Rename…</Button>} footer={(close) => <><Button variant="subtle" onClick={close}>Cancel</Button><Button onClick={close}>Save</Button></>}><TextField label="Project name" defaultValue="Orlo" /></Dialog>,
    code: `<Dialog title="Rename project" trigger={<Button>Rename…</Button>}\n  footer={(close) => <Button onClick={close}>Save</Button>}>\n  <TextField label="Project name" />\n</Dialog>`,
    props: [["title", "ReactNode", "Labels the dialog."], ["description", "ReactNode", "Describes it."], ["trigger", "ReactElement", "Optional; or control with open/onOpenChange."], ["footer", "ReactNode | (close) => ReactNode", ""], ["size", '"sm" | "md" | "lg"', ""], ["dismissible", "boolean", "Escape and backdrop close. Default true."], ["initialFocus", "RefObject", "Element to focus on open."]],
    notes: ["Focus moves in and is trapped; the rest of the page becomes inert.", "Scroll is locked once, with scrollbar compensation so the page does not shift.", "Focus returns to the trigger after closing, unless the trigger was removed or disabled.", "On narrow screens it docks to the bottom edge with full-width, stacked actions.", "The backdrop stops intercepting clicks the moment closing begins."],
  },
  "alert-dialog": {
    demo: () => <AlertDialog title="Delete 3 files?" description="They will be removed for everyone. This cannot be undone." trigger={<Button variant="danger">Delete files…</Button>} footer={(close) => <><Button variant="subtle" onClick={close}>Keep files</Button><Button variant="danger" onClick={close}>Delete</Button></>} />,
    code: `<AlertDialog title="Delete 3 files?" description="This cannot be undone."\n  trigger={<Button variant="danger">Delete…</Button>}\n  footer={(close) => <Button variant="danger" onClick={() => { remove(); close(); }}>Delete</Button>} />`,
    notes: ["role=alertdialog. Escape and backdrop do not dismiss it by default: the user must choose.", "Name the consequence in the title and the action on the button. No shake, no red flash."],
  },
  sheet: {
    demo: () => <><Sheet title="Filters" trigger={<Button variant="subtle">Side sheet</Button>} footer={(close) => <Button onClick={close}>Show results</Button>}><Stack gap={4}><Checkbox label="In stock" defaultChecked /><Checkbox label="On sale" /><Slider label="Max price" defaultValue={80} format={(v) => `€${v}`} /></Stack></Sheet><Sheet side="bottom" title="Share" description="Drag the handle down to dismiss." trigger={<Button variant="subtle">Bottom sheet</Button>}><Stack gap={2}>{["Copy link", "Email", "Messages"].map((l) => <Button key={l} variant="ghost" style={{ justifyContent: "flex-start" }}>{l}</Button>)}</Stack></Sheet></>,
    code: `<Sheet side="bottom" title="Share" trigger={<Button>Share</Button>}>…</Sheet>`,
    props: [["side", '"end" | "start" | "bottom"', "Logical sides: end is right in LTR, left in RTL."], ["…Dialog props", "", "title, description, footer, dismissible…"]],
    notes: ["Same focus, inert and scroll guarantees as Dialog.", "The bottom sheet drags only from its handle, so content can still scroll and text can be selected.", "Dismiss threshold: 30% of its height or a fast flick; otherwise it springs back.", "Under reduced motion sheets fade instead of sliding."],
  },
  popover: {
    demo: () => <><Popover label="Share settings" trigger={<Button variant="subtle">Open popover</Button>}><Stack gap={3} style={{ inlineSize: "16rem" }}><strong>Share settings</strong><Switch label="Anyone with the link" /><Button variant="subtle">Copy link</Button></Stack></Popover><Popover label="Edge test" placement="top-end" trigger={<Button variant="ghost">Top end</Button>}><p style={{ margin: 0, maxInlineSize: "14rem" }}>Flips and shifts to stay on screen; grows from the trigger.</p></Popover></>,
    code: `<Popover label="Share settings" trigger={<Button>Share</Button>}>\n  …interactive content…\n</Popover>`,
    props: [["label", "string", "Accessible name of the panel."], ["trigger", "ReactElement", ""], ["placement", "Placement", "Preferred position."], ["open / defaultOpen / onOpenChange", "", ""]],
    notes: ["Non-modal: focus moves in but is not trapped; Escape or an outside press closes and focus returns.", "Transform origin is recomputed after flipping, so it always grows out of its trigger.", "Below 520px it docks to the bottom edge, keeping the same component tree so input is not lost.", "Use this, not Tooltip, whenever the content is interactive."],
  },
  tooltip: {
    demo: () => <><Tooltip content="Saved 2 minutes ago"><Button variant="subtle">Hover or focus me</Button></Tooltip><Tooltip content="Bottom placement" placement="bottom"><Button variant="ghost">Bottom</Button></Tooltip></>,
    code: `<Tooltip content="Saved 2 minutes ago"><Button>Status</Button></Tooltip>`,
    props: [["content", "ReactNode", "Short, non-interactive text."], ["placement", "Placement", "Default top."], ["delay", "number", "Hover delay in ms. Default 500."]],
    notes: ["Opens after a delay on mouse hover, immediately on keyboard focus, never on touch.", "Once one tooltip has shown, neighbours open instantly for a moment, so scanning a toolbar feels quick.", "A small close grace period avoids flicker when the pointer crosses the gap.", "Escape closes it without moving focus."],
  },
  toast: {
    demo: () => <ToastDemo />,
    code: `const { toast } = useToast();\ntoast({ title: "Message archived", action: { label: "Undo", onClick: undo } });`,
    props: [["title", "ReactNode", ""], ["description", "ReactNode", ""], ["tone", '"neutral" | "success" | "warning" | "error"', ""], ["duration", "number", "ms; Infinity to persist. Errors persist by default."], ["action", "{ label, onClick }", "One optional action."]],
    notes: ["The timer pauses on hover, on focus and while the tab is hidden.", "Errors stay until dismissed, so they are never missed.", "The stack reflows smoothly as toasts arrive and leave; at most five are kept."],
  },
  accordion: {
    demo: () => <div style={{ inlineSize: "100%" }}><Accordion type="single" defaultValue={["what"]} items={[{ value: "what", title: "What is Orlo?", content: "A design framework for React that designs the moments between states." }, { value: "name", title: "Why the name?", content: "Orlo is Italian for edge or hem: the finish that holds a garment together." }, { value: "motion", title: "Can I turn motion off?", content: "Yes. Motion follows the OS setting by default, and can be set to reduced, off or full." }]} /></div>,
    code: `<Accordion type="single" items={[\n  { value: "a", title: "Question", content: "Answer" },\n]} />`,
    props: [["items", "{ value, title, content, disabled? }[]", ""], ["type", '"single" | "multiple"', ""], ["value / defaultValue / onValueChange", "string[]", ""], ["headingLevel", "2 | 3 | 4", "Semantic heading around each trigger."]],
    notes: ["Height animates from measured content while opacity fades, so text is never left half-revealed.", "Collapsed content is unmounted: nothing hidden stays focusable."],
  },
  card: {
    demo: () => <div className="grid" style={{ inlineSize: "100%" }}><Card><strong>Surface</strong><p style={{ marginBlockEnd: 0 }}>Answers to its own width with container queries.</p></Card><Card><Stack direction="row" gap={3} align="center"><Avatar name="Grace Hopper" /><div><strong>Grace Hopper</strong><span className="orlo-hint">Rear admiral</span></div></Stack></Card></div>,
    code: `<Card>…</Card>`,
    notes: ["Declares an inline-size container so children can adapt to the card, not the viewport."],
  },
  stack: {
    demo: () => <Stack direction="row" gap={3} wrap>{[1, 2, 3, 4].map((i) => <div key={i} style={{ padding: 16, borderRadius: 8, background: "var(--orlo-color-surface-selected)" }}>Item {i}</div>)}</Stack>,
    code: `<Stack direction="row" gap={3} wrap>…</Stack>`,
    props: [["direction", '"column" | "row"', ""], ["gap", "space step", "0–16, 4px each."], ["align / justify / wrap", "", ""]],
    notes: ["A convenience over flexbox using the space scale. Plain CSS is fine when it is clearer."],
  },
  divider: { demo: () => <div style={{ inlineSize: "100%" }}><Divider /><Divider label="or continue with" /></div>, code: `<Divider label="or" />`, notes: ["Plain <hr> when unlabelled; a labelled separator otherwise."] },
  badge: {
    demo: () => <><Badge>Draft</Badge><Badge tone="accent">New</Badge><Badge tone="success">Paid</Badge><Badge tone="warning">Due soon</Badge><Badge tone="error">Overdue</Badge><Badge tone="info">Beta</Badge></>,
    code: `<Badge tone="success">Paid</Badge>`,
    notes: ["Always pair tone with words; colour alone is never the message.", "Tinted fill plus border keeps it legible in light, dark and forced-colours modes."],
  },
  avatar: {
    demo: () => <Stack gap={4}><Stack direction="row" gap={3} align="center"><Avatar name="Ada Lovelace" size="lg" status="online" /><Avatar name="Grace Hopper" src={sampleImage} /><Avatar name="Alan Turing" src="./__missing__.png" status="away" /><Avatar name="Katherine Johnson" size="sm" /></Stack><AvatarGroup people={people} max={4} /></Stack>,
    code: `<Avatar name="Ada Lovelace" src={url} status="online" />\n<AvatarGroup people={team} max={4} />`,
    props: [["name", "string", "Accessible name and initials."], ["src", "string", "Optional photo."], ["size", '"sm" | "md" | "lg"', ""], ["status", '"online" | "away" | "offline"', "Included in the accessible name."]],
    notes: ["Initials render immediately; the photo fades in only after it has decoded.", "A failed or disabled image leaves the initials. Never a broken icon or someone else's stale photo.", "Each name maps to a stable tint, tested for contrast in light and dark."],
  },
  table: {
    demo: () => <TableDemo />,
    code: `<Table caption="Inventory" rowKey={(r) => r.id} rows={rows}\n  columns={[{ key: "name", header: "Product", sortable: true }, …]} />`,
    props: [["caption", "ReactNode", "Visible table caption."], ["columns", "{ key, header, sortable?, align?, render? }[]", ""], ["rows", "T[]", ""], ["rowKey", "(row) => string", "Stable identity for row animation."], ["empty", "ReactNode", "Shown when there are no rows."], ["animateBelow", "number", "Rows animate only below this count. Default 50."]],
    notes: ["Sort state is in aria-sort, a visible arrow and hidden text.", "Rows glide to their new positions when sorted, only while the set is small enough to follow.", "Numbers align to the end with tabular figures.", "Virtualisation for very large sets is planned."],
  },
  "animated-number": {
    demo: () => <NumberDemo />,
    code: `<AnimatedNumber value={total} format={{ style: "currency", currency: "EUR" }} />`,
    notes: ["Every frame is formatted with Intl, so separators, decimals and signs are always valid for the locale.", "Screen readers get only the settled value; reduced motion shows it instantly."],
  },
  kbd: { demo: () => <span>Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search</span>, code: `<Kbd>⌘</Kbd> <Kbd>K</Kbd>`, notes: ["Monospace keycap with a slightly heavier base."] },
  alert: {
    demo: () => <AlertDemo />,
    code: `<Alert tone="warning" title="Connection is slow">Changes are saved on this device.</Alert>`,
    props: [["tone", '"info" | "success" | "warning" | "error"', ""], ["title", "ReactNode", ""], ["open", "boolean", "false plays the exit and unmounts."], ["action", "ReactNode", ""]],
    notes: ["Errors and warnings use role=alert; info and success use role=status.", "Each tone has its own icon as well as colour.", "Say what happened, what is safe, and what to do next."],
  },
  progress: {
    demo: () => <ProgressDemo />,
    code: `<Progress label="Uploading photos" value={35} />\n<Progress label="Preparing export" />  {/* indeterminate */}`,
    notes: ["Omit value for indeterminate. Orlo never fakes progress it cannot measure.", "Determinate progress eases between values with the `shift` spring."],
  },
  spinner: { demo: () => <><Spinner /><Spinner size="sm" label="Saving" /></>, code: `<Spinner label="Saving" />`, notes: ["Always carries an accessible label.", "Slows rather than stops under reduced motion, so activity stays visible."] },
  skeleton: {
    demo: () => <Card style={{ inlineSize: "min(100%, 20rem)" }}><Stack direction="row" gap={3} align="center"><Skeleton width={40} height={40} radius="50%" /><Stack gap={2} style={{ flex: 1 }}><Skeleton height={14} width="60%" /><Skeleton height={12} width="85%" /></Stack></Stack></Card>,
    code: `<Skeleton height={14} width="60%" />`,
    notes: ["Shape it like the content that replaces it so nothing moves at hand-off.", "Static under prefers-reduced-motion. Use only when loading takes long enough to notice."],
  },
  "empty-state": {
    demo: () => <Card style={{ inlineSize: "100%" }}><EmptyState title="No invoices yet" description="Invoices you send will appear here, newest first." action={<Button>Create invoice</Button>} /></Card>,
    code: `<EmptyState title="No invoices yet" description="…" action={<Button>Create invoice</Button>} />`,
    notes: ["Explain what will appear here and offer the next step. Not an apology."],
  },
  image: {
    demo: () => <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", inlineSize: "100%" }}><OrloImage src={sampleImage} alt="Sunset over dark hills" /><OrloImage src="./__missing__.png" alt="Harbour at dusk" maxRetries={1} /><OrloImage alt="No image supplied" ratio="1 / 1" /></div>,
    code: `<OrloImage src={url} alt="Harbour at dusk" ratio="4 / 3" />\n<OrloProvider images="off">…</OrloProvider>`,
    props: [["src", "string", ""], ["alt", "string", "Required."], ["decorative", "boolean", "Silent to assistive tech."], ["ratio", "string", "CSS aspect-ratio; reserved before load."], ["maxRetries", "number", "Automatic retries with backoff. Default 2."], ["images", '"on" | "off"', "Per-image override of the provider policy."], ["onStateChange", "(state) => void", "disabled | empty | loading | loaded | failed."]],
    notes: ["Geometry is reserved before load, so nothing shifts.", "Pixels appear only after decode, with a gentle fade.", "Failure is a designed placeholder with an explicit Try again, never a broken-image icon.", "Turn Images off in Preferences: every Orlo image becomes a designed placeholder and no requests are made."],
  },
};
