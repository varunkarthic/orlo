import { useState } from "react";
import { AsyncButton, ButtonGroup, Button, IconButton, CopyButton, SegmentedControl, ToggleButton, ToggleGroup, SplitButton, Fab, SpeedDial, Tooltip, Icons, Stack, useToast } from "@orlo/react";
import { controlSpecs, type Doc } from "./types.ts";

function LoadingButton() {
  const [busy, setBusy] = useState(false);
  return <Button loading={busy} loadingLabel="Saving" onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 1600); }}>Save changes</Button>;
}
function FabDemo() { const { toast } = useToast(); return <Stack direction="row" gap={4} align="center"><Fab icon={<Icons.Edit />} label="Compose" onClick={() => toast({ title: "Compose opened" })} /><Fab icon={<Icons.Plus />} label="New project" extended /></Stack>; }
function SpeedDemo() { const { toast } = useToast(); return <div style={{ paddingBlockStart: 200 }}><SpeedDial label="Create" actions={[{ label: "Document", icon: <Icons.File size={18} />, onSelect: () => toast({ title: "New document" }) }, { label: "Folder", icon: <Icons.Folder size={18} />, onSelect: () => toast({ title: "New folder" }) }, { label: "Upload", icon: <Icons.Upload size={18} />, onSelect: () => toast({ title: "Upload" }) }]} /></div>; }
function SplitDemo() { const { toast } = useToast(); return <SplitButton onClick={() => toast({ title: "Merged" })} items={[{ label: "Squash and merge", onSelect: () => toast({ title: "Squashed" }) }, { label: "Rebase and merge", onSelect: () => toast({ title: "Rebased" }) }]}>Merge</SplitButton>; }

const wait = (ms: number, signal: AbortSignal) => new Promise<void>((res, rej) => { const t = setTimeout(res, ms); signal.addEventListener("abort", () => { clearTimeout(t); rej(new Error("aborted")); }); });
let flaky = 0;

export const actions: Record<string, Doc> = {
  "async-button": {
    demo: () => <Stack direction="row" gap={3} wrap align="center">
      <AsyncButton action={(_, s) => wait(1400, s)}>Save changes</AsyncButton>
      <AsyncButton variant="tonal" action={async (report, s) => { for (let i = 1; i <= 20; i++) { await wait(90, s); report(i / 20); } }} successLabel="Uploaded" next={{ label: "View file", onClick: () => {} }}>Upload</AsyncButton>
      <AsyncButton variant="subtle" action={async (_, s) => { await wait(1100, s); if (flaky++ % 2 === 0) throw new Error("network"); }} errorLabel="Couldn’t send: retry" successLabel="Sent">Send invite</AsyncButton>
      <AsyncButton variant="subtle" cancellable action={(_, s) => wait(4000, s)} pendingLabel="Exporting">Export (cancellable)</AsyncButton>
    </Stack>,
    code: `<AsyncButton action={async (report, signal) => { await save(signal); }}
  successLabel="Saved" errorLabel="Couldn’t save: retry"
  next={{ label: "View", onClick: open }}>Save changes</AsyncButton>`,
    props: [["action", "(report, signal) => Promise", "Resolve = success, reject = error. report(0–1) makes the ring determinate."], ["successLabel / errorLabel / pendingLabel", "ReactNode", ""], ["next", "{ label, onClick }", "Offer a next step after success."], ["cancellable", "boolean", "Press again while pending to abort."], ["morph", "boolean", "Shrink into a ring while pending. Default true."], ["resetAfter", "number", "ms before success returns to idle."]],
    notes: ["Width and shape spring between states (`morph` spring); labels crossfade as a block with a slight blur so no glyph is ever half-clipped.", "Pending shrinks the button into a ring: indeterminate until the action reports progress, then determinate.", "Success never appears before the promise resolves. Failure says what failed and offers retry in place.", "Every state is announced politely; the ring has an accessible name with the percentage."],
    useWhen: ["Actions with a visible network round-trip where the outcome matters."], avoidWhen: ["Instant local actions: a plain Button is quieter."],
    keyboard: [["Enter / Space", "Run, cancel (when cancellable), retry, or take the next step"]], semantics: ["Native button; aria-busy while pending; a polite status region announces each outcome."],
    edge: ["Unmount mid-request aborts the signal", "Double press while pending is ignored (or cancels when cancellable)", "Very fast success still shows the confirmation"],
  },
  "button-group": {
    demo: () => <Stack gap={4}><ButtonGroup label="Text alignment"><Button variant="subtle">Left</Button><Button variant="subtle">Center</Button><Button variant="subtle">Right</Button></ButtonGroup><ButtonGroup label="Pagination" attached={false}><Button variant="ghost">Previous</Button><Button>Next</Button></ButtonGroup></Stack>,
    code: `<ButtonGroup label="Text alignment">
  <Button variant="subtle">Left</Button>
  <Button variant="subtle">Center</Button>
</ButtonGroup>`,
    notes: ["Attached groups share borders and round only the outer corners; a focused button rises above its neighbours so the ring is never clipped."], semantics: ["role=group with an accessible label; each button stays its own tab stop."],
  },
  button: {
    demo: () => <><Button>Continue</Button><Button variant="subtle">Cancel</Button><Button variant="ghost">Skip</Button><Button variant="danger">Delete</Button><LoadingButton /></>,
    variants: [
      { title: "Emphasis", body: "One emphasised button per view. Solid (ink) is the default primary; accent is for the single brand moment, such as a sign-up or checkout. Subtle for secondary, ghost for tertiary.", demo: () => <><Button variant="accent">Accent</Button><Button>Primary</Button><Button variant="subtle">Secondary</Button><Button variant="ghost">Tertiary</Button></> },
      { title: "Variants", demo: () => <><Button>Solid</Button><Button variant="accent">Accent</Button><Button variant="tonal">Tonal</Button><Button variant="subtle">Subtle</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Danger</Button></> },
      { title: "Sizes", demo: () => <><Button size="sm">Small</Button><Button>Medium</Button><Button size="lg">Large</Button></> },
      { title: "With icons", demo: () => <><Button start={<Icons.Plus size={18} />}>New file</Button><Button variant="subtle" end={<Icons.ChevronRight size={18} />}>Next</Button></> },
      { title: "States", body: "Disabled and loading look different on purpose: one is unavailable, the other is busy.", demo: () => <><Button disabled>Disabled</Button><Button loading>Loading</Button><Button variant="danger" disabled>Delete</Button></> },
      { title: "Long labels", body: "Labels wrap instead of overflowing; geometry stays stable.", demo: () => <div style={{ maxInlineSize: 220 }}><Button style={{ inlineSize: "100%" }}>Accept the revised terms and continue to checkout</Button></div> },
    ],
    code: `<Button>Continue</Button>\n<Button variant="subtle">Cancel</Button>\n<Button loading={saving} loadingLabel="Saving" onClick={save}>Save changes</Button>`,
    props: [["variant", '"solid" | "subtle" | "ghost" | "danger"', "Visual emphasis. Default solid."], ["loading", "boolean", "Keeps width and focus, sets aria-busy, ignores activation."], ["loadingLabel", "string", "Announced while loading."], ["…button attributes", "", "Forwarded to the native <button>."]],
    notes: ["Pressing compresses the button by 3% within 90 ms: acknowledgement before anything else happens.", "Loading never changes the button's size, so nothing around it moves.", "Hover styles only exist on hover-capable fine pointers; touch never shows a stuck hover."],
    anatomy: [["Container", ".orlo-button"], ["Label", ".orlo-button__label"], ["Leading icon (optional)", "svg"]],
    anatomyDemo: () => <Button><Icons.Plus size={18} /> New file</Button>,
    specs: [...controlSpecs, ["Label weight", "600"], ["Pressed scale", "0.97"], ["Fill (solid)", "--orlo-color-accent"], ["Label (solid)", "--orlo-color-accent-fg"], ["Press duration", "--orlo-motion-duration-instant"]],
    useWhen: ["Triggering an action in place: save, send, delete, open a dialog."], avoidWhen: ["Navigating to another page: use a link.", "Toggling a persistent setting: use a Switch."],
    dos: [["Use one solid button per area for the most important action.", "Put three solid buttons side by side so nothing stands out."], ["Name the outcome: “Save changes”, “Delete 3 files”.", "Use vague labels such as “OK” or “Submit” for consequential actions."]],
    keyboard: [["Enter / Space", "Activate"], ["Tab", "Move focus to the next control"]],
    semantics: ["Native <button>. type=\"button\" by default so it never submits a form by accident.", "Loading sets aria-busy and keeps the element focusable instead of disabling it."],
    edge: ["Repeated rapid clicks while loading start only one action.", "Disabled while hovered: the cursor updates immediately.", "Very long or translated labels wrap rather than overflow."],
  },
  "icon-button": {
    demo: () => <><IconButton label="Search"><Icons.Search /></IconButton><IconButton label="Add" variant="subtle"><Icons.Plus /></IconButton><IconButton label="More options" variant="solid"><Icons.More /></IconButton><Tooltip content="Close panel"><IconButton label="Close"><Icons.X /></IconButton></Tooltip></>,
    code: `<IconButton label="Search"><Icons.Search /></IconButton>`,
    props: [["label", "string", "Required accessible name."], ["variant", '"ghost" | "subtle" | "solid"', "Default ghost."], ["size", '"sm" | "md"', "Default md (matches control height)."]],
    notes: ["The label is required by the type, so an unnamed icon button cannot compile.", "Pair with Tooltip when the icon may be ambiguous to sighted users too."],
    specs: [["Size", "--orlo-control-h"], ["Icon size", "20px"], ["Corner radius", "--orlo-radius-md"], ["Focus ring", "--orlo-color-focus"]],
    useWhen: ["Compact toolbars and headers where the icon is universally understood."], avoidWhen: ["The meaning is not obvious from the icon: add a visible label."],
    dos: [["Use familiar icons (search, close, more).", "Invent a metaphor and rely on a tooltip to explain it."]],
    keyboard: [["Enter / Space", "Activate"]], semantics: ["aria-label from the required `label` prop; the SVG is hidden from assistive tech."],
  },
  "copy-button": {
    demo: () => <><code>npm install @orlo/react</code><CopyButton text="npm install @orlo/react" /></>,
    code: `<CopyButton text="npm install @orlo/react" />`, props: [["text", "string", "Copied to the clipboard."], ["label", "string", "Idle label. Default “Copy”."]],
    notes: ["Confirms in place for 1.6 s and announces it politely.", "If the Clipboard API is blocked (insecure context, permissions), it says so instead of pretending."],
    keyboard: [["Enter / Space", "Copy"]], semantics: ["Result is announced through a polite live region inside the button."], edge: ["Clipboard permission denied", "Clicking again while “Copied” restarts the timer"],
  },
  "segmented-control": {
    demo: () => <><SegmentedControl label="View" options={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }, { value: "board", label: "Board" }]} /><SegmentedControl label="Theme" size="sm" options={[{ value: "light", label: <Icons.Sun size={16} />, "aria-label": "Light" }, { value: "dark", label: <Icons.Moon size={16} />, "aria-label": "Dark" }]} /></>,
    code: `<SegmentedControl label="View" value={view} onValueChange={setView}\n  options={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }]} />`,
    props: [["label", "string", "Accessible group name."], ["options", "{ value, label, aria-label? }[]", "Use aria-label for icon-only options."], ["value / defaultValue / onValueChange", "", "Controlled or uncontrolled."], ["size", '"sm" | "md"', ""]],
    notes: ["The selection surface travels between options with the `shift` spring; rapid changes redirect it mid-flight.", "Selection is shown by a raised surface and heavier weight, not by colour."],
    anatomy: [["Track", ".orlo-segmented"], ["Selected surface", ".orlo-segmented__thumb"], ["Option label", ".orlo-segmented__item:last-child .orlo-segmented__label"]],
    anatomyDemo: () => <SegmentedControl label="View" options={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }]} />,
    specs: [["Track", "--orlo-color-border"], ["Selected surface", "--orlo-color-surface-raised"], ["Item height", "--orlo-control-h"], ["Corner radius", "--orlo-radius-md"]],
    useWhen: ["2–5 mutually exclusive views or modes that change content immediately."], avoidWhen: ["More than five options: use Select or Tabs.", "Options that need explanation: use RadioCards."],
    dos: [["Keep labels short and parallel (List / Grid / Board).", "Mix icons and words inconsistently across options."]],
    keyboard: [["Tab", "Enter the group (focus lands on the selected option)"], ["← / →", "Select the previous or next option (mirrored in RTL)"]],
    semantics: ["role=radiogroup with role=radio options and roving tabindex."], edge: ["Overflows horizontally inside narrow containers instead of breaking layout."],
  },
  "toggle-button": {
    demo: () => <><ToggleButton aria-label="Bold"><strong>B</strong></ToggleButton><ToggleButton aria-label="Italic" defaultPressed><em>I</em></ToggleButton><ToggleButton><Icons.Star size={18} /> Favourite</ToggleButton></>,
    code: `<ToggleButton pressed={bold} onPressedChange={setBold} aria-label="Bold"><strong>B</strong></ToggleButton>`,
    variants: [{ title: "Disabled", body: "Disabled toggles keep their label and a dashed outline at full opacity, pressed or not, so they never disappear.", demo: () => <><ToggleButton disabled>Off, disabled</ToggleButton><ToggleButton disabled defaultPressed>On, disabled</ToggleButton></> }],
    props: [["pressed / defaultPressed / onPressedChange", "", ""]], notes: ["Uses aria-pressed; the pressed state is a filled surface plus border, not colour alone."],
    useWhen: ["Formatting and view toggles inside a toolbar."], avoidWhen: ["Settings that persist and apply immediately: use Switch."],
    keyboard: [["Enter / Space", "Toggle"]], semantics: ["<button aria-pressed>. Do not change the label when pressed; the state is announced."],
  },
  "toggle-group": {
    demo: () => <><ToggleGroup label="Text formatting" items={[{ value: "b", label: <strong>B</strong>, "aria-label": "Bold" }, { value: "i", label: <em>I</em>, "aria-label": "Italic" }, { value: "u", label: <u>U</u>, "aria-label": "Underline" }]} defaultValue={["b"]} /><ToggleGroup label="Alignment" type="single" defaultValue={["left"]} items={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} /></>,
    code: `<ToggleGroup label="Text formatting" items={[{ value: "b", label: "B", "aria-label": "Bold" }, …]} />`,
    props: [["label", "string", "Toolbar name."], ["type", '"single" | "multiple"', "single allows none or one."], ["items", "{ value, label, aria-label?, disabled? }[]", ""], ["value / defaultValue / onValueChange", "string[]", ""]],
    notes: ["One tab stop for the whole toolbar; arrow keys move between toggles."], keyboard: [["Tab", "Enter or leave the toolbar"], ["← / →", "Move between toggles"], ["Home / End", "First / last toggle"], ["Enter / Space", "Toggle"]],
    semantics: ["role=toolbar with aria-pressed buttons."],
  },
  "split-button": {
    demo: () => <SplitDemo />, code: `<SplitButton onClick={merge} items={[{ label: "Squash and merge", onSelect: squash }]}>Merge</SplitButton>`,
    props: [["onClick", "() => void", "Primary action."], ["items", "MenuItem[]", "Alternatives."], ["menuLabel", "string", "Name of the menu button. Default “More options”."]],
    notes: ["Two real buttons with two tab stops, styled as one unit.", "The menu opens from its arrow and flips near the viewport edge."],
    useWhen: ["A default action with closely related alternatives (merge strategies, export formats)."], avoidWhen: ["Unrelated actions: use a Menu.", "The alternatives are as common as the default."],
    keyboard: [["Enter / Space on arrow", "Open menu"], ["↓ on arrow", "Open menu at the first item"]],
  },
  fab: {
    demo: () => <FabDemo />, code: `<Fab icon={<Icons.Plus />} label="New project" extended position="fixed" />`,
    props: [["icon", "ReactNode", ""], ["label", "string", "Accessible name; shown when extended."], ["extended", "boolean", "Show the label."], ["position", '"static" | "fixed"', "fixed pins it to the bottom-end corner, inside the safe area."]],
    notes: ["When fixed and extended, the label collapses while scrolling down and returns on scroll up.", "Respects safe-area insets so it never sits under a home indicator."],
    useWhen: ["The single most important action on a screen, usually creation."], avoidWhen: ["Secondary or destructive actions.", "More than one per screen."],
    specs: [["Size", "56px"], ["Corner radius", "--orlo-radius-lg"], ["Fill", "--orlo-color-accent"], ["Layer", "--orlo-layer-floating"]],
    semantics: ["Native button; the label stays the accessible name even when only the icon is visible."],
  },
  "speed-dial": {
    demo: () => <SpeedDemo />, code: `<SpeedDial label="Create" actions={[{ label: "Document", icon: <Icons.File />, onSelect: newDoc }]} />`,
    props: [["label", "string", ""], ["actions", "{ label, icon, onSelect }[]", "3–6 related actions."]],
    notes: ["Every action keeps a visible label; actions stagger in from nearest to farthest.", "Escape or an outside press closes it."],
    keyboard: [["Enter / Space", "Open or close"], ["Tab", "Move through actions"], ["Escape", "Close"]], avoidWhen: ["Two or fewer actions: use buttons."],
  },
};
