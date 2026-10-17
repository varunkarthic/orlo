import { useState } from "react";
import { Dialog, AlertDialog, Sheet, Popover, Tooltip, useToast, ContextMenu, HoverCard, Tour, Button, TextField, Checkbox, Slider, Switch, Stack, Avatar, Icons } from "@orlo/react";
import type { Doc } from "./types.ts";

function ToastDemo() {
  const { toast } = useToast();
  return <>
    <Button variant="subtle" onClick={() => toast({ title: "Draft saved", tone: "success" })}>Success</Button>
    <Button variant="subtle" onClick={() => toast({ title: "Message archived", description: "Moved to Archive.", action: { label: "Undo", onClick: () => toast({ title: "Restored" }) } })}>With undo</Button>
    <Button variant="subtle" onClick={() => toast({ title: "Upload failed", description: "The file is larger than 25 MB.", tone: "error" })}>Error (persistent)</Button>
    <Button variant="ghost" onClick={() => { for (let i = 1; i <= 7; i++) setTimeout(() => toast({ title: `Notification ${i}` }), i * 120); }}>Burst of 7</Button>
  </>;
}
function CtxDemo() {
  const { toast } = useToast();
  return <ContextMenu items={[{ label: "Open", onSelect: () => toast({ title: "Opened" }) }, { label: "Rename", shortcut: "F2" }, { type: "separator" }, { label: "Delete", tone: "danger", onSelect: () => toast({ title: "Deleted", tone: "warning" }) }]}>
    <div style={{ display: "grid", placeItems: "center", blockSize: 140, inlineSize: "min(100%, 22rem)", border: "1.5px dashed var(--orlo-color-border-control)", borderRadius: 12, color: "var(--orlo-color-fg-muted)", textAlign: "center", padding: 16 }}>Right-click, long-press, or focus and press Shift+F10</div>
  </ContextMenu>;
}
function TourDemo() {
  const [open, setOpen] = useState(false);
  return <Stack gap={3}><Stack direction="row" gap={2} wrap><Button id="tour-a" variant="subtle">Projects</Button><Button id="tour-b" variant="subtle">Share</Button><Button id="tour-c" variant="subtle">Settings</Button></Stack><div><Button onClick={() => setOpen(true)}>Start tour</Button></div>
    <Tour open={open} onOpenChange={setOpen} steps={[{ target: "#tour-a", title: "Your projects", body: "Everything you’re working on lives here." }, { target: "#missing", title: "Never shown", body: "Targets that don’t exist are skipped." }, { target: "#tour-b", title: "Share", body: "Invite people or copy a link." }, { target: "#tour-c", title: "Settings", body: "Theme, motion and notifications." }]} /></Stack>;
}

export const overlays: Record<string, Doc> = {
  dialog: {
    demo: () => <Dialog title="Rename project" description="This changes the name for everyone on the team." trigger={<Button>Rename…</Button>} footer={(close) => <><Button variant="subtle" onClick={close}>Cancel</Button><Button onClick={close}>Save</Button></>}><TextField label="Project name" defaultValue="Orlo" /></Dialog>,
    variants: [
      { title: "Sizes", demo: () => <>{(["sm", "md", "lg"] as const).map((s) => <Dialog key={s} size={s} title={`Size ${s}`} trigger={<Button variant="subtle">{s}</Button>} footer={(c) => <Button onClick={c}>Done</Button>}><p style={{ margin: 0 }}>Content adapts; long content scrolls inside the body, never the page.</p></Dialog>)}</> },
      { title: "Long content", body: "Header and footer stay put; the body scrolls with overscroll contained.", demo: () => <Dialog title="Terms" trigger={<Button variant="subtle">Open long dialog</Button>} footer={(c) => <Button onClick={c}>Accept</Button>}>{Array.from({ length: 30 }, (_, i) => <p key={i}>Clause {i + 1}. Orlo keeps the footer reachable no matter how long this gets.</p>)}</Dialog> },
      { title: "Nested", body: "Discouraged, but supported: each layer owns Escape and focus in order.", demo: () => <Dialog title="Outer" trigger={<Button variant="subtle">Open outer</Button>}><Dialog title="Inner" trigger={<Button>Open inner</Button>}><p style={{ margin: 0 }}>Escape closes only this one.</p></Dialog></Dialog> },
    ],
    code: `<Dialog title="Rename project" trigger={<Button>Rename…</Button>}\n  footer={(close) => <Button onClick={close}>Save</Button>}>\n  <TextField label="Project name" />\n</Dialog>`,
    props: [["title", "ReactNode", "Labels the dialog."], ["description", "ReactNode", ""], ["trigger", "ReactElement", "Optional; or control with open/onOpenChange."], ["footer", "ReactNode | (close) => ReactNode", ""], ["size", '"sm" | "md" | "lg"', ""], ["dismissible", "boolean", "Escape and backdrop close. Default true."], ["initialFocus", "RefObject", ""]],
    notes: ["Focus moves in and is trapped; the rest of the page becomes inert.", "Scroll is locked once, with scrollbar compensation so the page doesn't shift.", "Focus returns to the trigger, unless it was removed or disabled.", "On narrow screens it docks to the bottom with full-width, stacked actions."],
    anatomy: [["Scrim", ".orlo-scrim"], ["Container", ".orlo-modal__panel"], ["Headline", ".orlo-modal__title"], ["Close", ".orlo-modal__header .orlo-icon-button"], ["Supporting text", ".orlo-modal__desc"], ["Actions", ".orlo-modal__footer"]],
    anatomyDemo: () => <div className="orlo-modal" style={{ position: "relative", inset: "auto", minBlockSize: 280 }}><div className="orlo-scrim" style={{ borderRadius: 12 }} /><div className="orlo-modal__panel" style={{ inlineSize: 340 }}><header className="orlo-modal__header"><h2 className="orlo-modal__title">Rename project</h2><button className="orlo-icon-button" data-variant="ghost" aria-label="Close"><Icons.X /></button></header><p className="orlo-modal__desc">This changes the name for everyone.</p><footer className="orlo-modal__footer"><Button variant="subtle">Cancel</Button><Button>Save</Button></footer></div></div>,
    specs: [["Container", "--orlo-color-surface-raised"], ["Corner radius", "--orlo-radius-xl"], ["Scrim", "--orlo-color-scrim"], ["Max width (md)", "32rem"], ["Layer", "--orlo-layer-modal"], ["Enter motion", "reveal spring"], ["Exit motion", "dismiss spring"]],
    useWhen: ["A focused task or decision that must finish before continuing."], avoidWhen: ["Information that doesn't need a response: use Toast or Alert.", "Complex multi-step flows: use a page."],
    dos: [["Title it with the task (“Rename project”).", "Title it “Are you sure?”."], ["Put the primary action last in reading order.", "Hide the only way to close it."]],
    keyboard: [["Tab / Shift+Tab", "Cycle within the dialog"], ["Escape", "Close (when dismissible)"]],
    semantics: ["role=dialog, aria-modal=true, aria-labelledby title, aria-describedby description. Everything else gets inert."],
    edge: ["Trigger removed while open: focus isn't thrown to a missing node.", "Backdrop stops intercepting clicks the instant closing begins.", "Nested dialogs: Escape closes only the top layer.", "Scroll lock is reference-counted, so stacked overlays restore exactly once."],
  },
  "alert-dialog": {
    demo: () => <AlertDialog title="Delete 3 files?" description="They will be removed for everyone. This cannot be undone." trigger={<Button variant="danger">Delete files…</Button>} footer={(close) => <><Button variant="subtle" onClick={close}>Keep files</Button><Button variant="danger" onClick={close}>Delete</Button></>} />,
    code: `<AlertDialog title="Delete 3 files?" description="This cannot be undone."\n  trigger={<Button variant="danger">Delete…</Button>}\n  footer={(close) => <Button variant="danger" onClick={() => { remove(); close(); }}>Delete</Button>} />`,
    notes: ["Escape and backdrop do not dismiss it: the person must choose.", "No shake, no red flash. The consequence is in the words."],
    dos: [["Name the consequence and the action: “Delete 3 files?” / “Delete”.", "Use “Yes” and “No” as button labels."]],
    semantics: ["role=alertdialog with the same focus guarantees as Dialog."],
  },
  sheet: {
    demo: () => <><Sheet title="Filters" trigger={<Button variant="subtle">Side sheet</Button>} footer={(close) => <Button onClick={close}>Show results</Button>}><Stack gap={4}><Checkbox label="In stock" defaultChecked /><Checkbox label="On sale" /><Slider label="Max price" defaultValue={80} format={(v) => `€${v}`} /></Stack></Sheet><Sheet side="bottom" title="Share" description="Drag the handle down to dismiss." trigger={<Button variant="subtle">Bottom sheet</Button>}><Stack gap={2}>{["Copy link", "Email", "Messages"].map((l) => <Button key={l} variant="ghost" style={{ justifyContent: "flex-start" }}>{l}</Button>)}</Stack></Sheet><Sheet side="start" title="Start side" trigger={<Button variant="ghost">Start side</Button>}><p>“Start” is left in LTR and right in RTL.</p></Sheet></>,
    code: `<Sheet side="bottom" title="Share" trigger={<Button>Share</Button>}>…</Sheet>`,
    props: [["side", '"end" | "start" | "bottom"', "Logical sides."], ["…Dialog props", "", ""]],
    notes: ["The bottom sheet drags only from its handle, so content can scroll and text can be selected.", "Dismiss threshold: 30% of its height or a fast flick; otherwise it springs back.", "Under reduced motion sheets fade instead of sliding."],
    keyboard: [["Escape", "Close"], ["Tab", "Cycle within"]], edge: ["Drag reversed mid-gesture springs back", "RTL flips start/end automatically"],
  },
  popover: {
    demo: () => <><Popover label="Share settings" trigger={<Button variant="subtle">Open popover</Button>}><Stack gap={3} style={{ inlineSize: "16rem" }}><strong>Share settings</strong><Switch label="Anyone with the link" /><Button variant="subtle">Copy link</Button></Stack></Popover><Popover label="Edge test" placement="top-end" trigger={<Button variant="ghost">Top end</Button>}><p style={{ margin: 0, maxInlineSize: "14rem" }}>Flips and shifts to stay on screen; grows from the trigger.</p></Popover></>,
    code: `<Popover label="Share settings" trigger={<Button>Share</Button>}>\n  …interactive content…\n</Popover>`,
    props: [["label", "string", "Accessible name of the panel."], ["trigger", "ReactElement", ""], ["placement", "Placement", ""], ["open / defaultOpen / onOpenChange", "", ""]],
    notes: ["Non-modal: focus moves in but isn't trapped.", "Below 520 px it docks to the bottom edge, keeping the same tree so input isn't lost.", "Use this, not Tooltip, whenever the content is interactive."],
    keyboard: [["Escape", "Close and return focus"], ["Tab", "Move through content"]], semantics: ["role=dialog with aria-label; trigger has aria-expanded and aria-controls."],
  },
  tooltip: {
    demo: () => <><Tooltip content="Saved 2 minutes ago"><Button variant="subtle">Hover or focus me</Button></Tooltip><Tooltip content="Bottom placement" placement="bottom"><Button variant="ghost">Bottom</Button></Tooltip><Tooltip content="Neighbours open instantly after the first"><Button variant="ghost">Warm 1</Button></Tooltip><Tooltip content="See? No second delay."><Button variant="ghost">Warm 2</Button></Tooltip></>,
    code: `<Tooltip content="Saved 2 minutes ago"><Button>Status</Button></Tooltip>`,
    props: [["content", "ReactNode", "Short, non-interactive."], ["placement", "Placement", "Default top."], ["delay", "number", "Default 500 ms."]],
    notes: ["Mouse: after a delay. Keyboard focus: immediately. Touch: never.", "After one shows, neighbours open instantly for a moment.", "A short grace period means crossing the gap doesn't flicker."],
    specs: [["Background", "--orlo-color-fg"], ["Text", "--orlo-color-fg-inverse"], ["Corner radius", "--orlo-radius-sm"], ["Max width", "18rem"], ["Layer", "--orlo-layer-tooltip"]],
    keyboard: [["Tab (focus)", "Show"], ["Escape", "Hide without moving focus"]], semantics: ["role=tooltip, linked with aria-describedby while visible. The WAI-ARIA tooltip pattern is still a work in progress; Orlo tests behaviour directly."],
  },
  toast: {
    demo: () => <ToastDemo />, code: `const { toast } = useToast();\ntoast({ title: "Message archived", action: { label: "Undo", onClick: undo } });`,
    props: [["title", "ReactNode", ""], ["description", "ReactNode", ""], ["tone", '"neutral" | "success" | "warning" | "error"', ""], ["duration", "number", "ms; Infinity persists. Errors persist by default."], ["action", "{ label, onClick }", ""]],
    notes: ["Pauses on hover, focus and while the tab is hidden.", "Errors stay until dismissed.", "At most five are kept; the stack reflows smoothly."],
    semantics: ["role=status (role=alert for errors) inside a labelled region."], edge: ["Bursts of notifications", "Tab hidden while a toast is counting down"],
  },
  "context-menu": {
    demo: () => <CtxDemo />, code: `<ContextMenu items={[{ label: "Rename", onSelect: rename }]}>\n  <FileRow />\n</ContextMenu>`,
    notes: ["Right-click, Shift+F10, the ContextMenu key, or a 500 ms long-press.", "Long-press is cancelled if the finger moves, so scrolling still works."],
    keyboard: [["Shift+F10 / ContextMenu", "Open"], ["↓ / ↑", "Move"], ["Enter", "Choose"], ["Escape", "Close"]], edge: ["Opened at the bottom-right corner: stays on screen"],
  },
  "hover-card": {
    demo: () => <p>Built by <HoverCard trigger={<a href="#ada">@ada</a>}><Stack direction="row" gap={3} align="center"><Avatar name="Ada Lovelace" size="lg" /><div><strong>Ada Lovelace</strong><p className="orlo-hint" style={{ margin: 0 }}>Wrote the first algorithm intended for a machine.</p></div></Stack></HoverCard> with care.</p>,
    code: `<HoverCard trigger={<a href="/u/ada">@ada</a>}><ProfilePreview /></HoverCard>`,
    notes: ["Waits for intent (600 ms) and survives the pointer crossing to the card.", "Never the only way to reach its content: the trigger is a real link."], avoidWhen: ["Content people must act on: use Popover."],
  },
  tour: {
    demo: () => <TourDemo />, code: `<Tour open={open} onOpenChange={setOpen} steps={[{ target: "#projects", title: "Your projects", body: "…" }]} />`,
    notes: ["Always skippable; missing targets are skipped instead of pointing at nothing.", "The spotlight glides between targets with the `shared` spring."], avoidWhen: ["As a substitute for clear interface design."],
    keyboard: [["Tab", "Move within the step card"], ["Escape", "End the tour"]],
  },
};
