import { useState } from "react";
import { Accordion, Collapsible, TreeView, ReadMore, Card, Stack, Divider, Splitter, ScrollArea, AspectRatio, Avatar, Icons, Button } from "@orlo/react";
import type { Doc } from "./types.ts";

const long = "Orlo treats the edge of every state as part of the design. When a surface grows over neighbouring content, one layer must clearly own that space; otherwise a half-severed line of text is left behind and the whole screen feels unfinished. The same care applies to truncation: whole lines, an ellipsis, and a way to see the rest.";
const tree = [
  { id: "src", label: "src", icon: <Icons.Folder size={16} />, children: [
    { id: "components", label: "components", icon: <Icons.Folder size={16} />, children: [{ id: "button", label: "Button.tsx", icon: <Icons.File size={16} /> }, { id: "dialog", label: "Dialog.tsx", icon: <Icons.File size={16} /> }] },
    { id: "app", label: "App.tsx", icon: <Icons.File size={16} /> }, { id: "main", label: "main.tsx", icon: <Icons.File size={16} /> }] },
  { id: "public", label: "public", icon: <Icons.Folder size={16} />, children: [{ id: "fav", label: "favicon.svg", icon: <Icons.File size={16} /> }] },
  { id: "readme", label: "README.md", icon: <Icons.File size={16} /> }, { id: "lock", label: "secrets.env (no access)", icon: <Icons.Lock size={16} />, disabled: true },
];
function TreeDemo() { const [sel, setSel] = useState<string | null>(null); return <Stack gap={2} style={{ inlineSize: "min(100%, 20rem)" }}><TreeView label="Project files" nodes={tree} defaultExpanded={["src"]} onSelect={setSel} /><span className="orlo-hint">Selected: {sel ?? "nothing"}</span></Stack>; }

export const structure: Record<string, Doc> = {
  accordion: {
    demo: () => <div style={{ inlineSize: "100%" }}><Accordion type="single" defaultValue={["what"]} items={[{ value: "what", title: "What is Orlo?", content: "A design framework for React that designs the moments between states." }, { value: "name", title: "Why the name?", content: "Orlo is Italian for edge or hem: the finish that holds a garment together." }, { value: "motion", title: "Can I turn motion off?", content: "Yes. Motion follows the OS by default and can be set to reduced, off or full." }]} /></div>,
    code: `<Accordion type="single" items={[{ value: "a", title: "Question", content: "Answer" }]} />`,
    props: [["items", "{ value, title, content, disabled? }[]", ""], ["type", '"single" | "multiple"', ""], ["value / defaultValue / onValueChange", "string[]", ""], ["headingLevel", "2 | 3 | 4", ""]],
    notes: ["Height animates from measured content while opacity fades, so text is never left half-revealed.", "Collapsed content is unmounted: nothing hidden stays focusable.", "Rapid toggling reverses the running animation instead of restarting it."],
    anatomy: [["Header (heading + button)", ".orlo-accordion__trigger"], ["Indicator", ".orlo-accordion__trigger svg"], ["Panel", ".orlo-accordion__region"]],
    anatomyDemo: () => <Accordion defaultValue={["a"]} items={[{ value: "a", title: "Question", content: "Answer text sits here." }]} />,
    specs: [["Header height", "calc(--orlo-control-h + 12px)"], ["Divider", "--orlo-color-border"], ["Panel text", "--orlo-color-fg-muted"], ["Motion", "expand / dismiss springs"]],
    keyboard: [["Enter / Space", "Toggle section"], ["Tab", "Next header or content"]], semantics: ["Each header is a heading containing a button with aria-expanded and aria-controls; panels are labelled regions."],
  },
  collapsible: {
    demo: () => (
      <div style={{ inlineSize: "min(100%, 28rem)" }}>
        <Collapsible title="Advanced layout settings">
          <Stack gap={2}>
            <p>Configure custom container query triggers, gutter widths, and aspect ratio locks.</p>
            <div><Button size="sm" variant="subtle">Reset to defaults</Button></div>
          </Stack>
        </Collapsible>
      </div>
    ),
    code: `<Collapsible title="Advanced layout settings">\n  <p>Panel contents with measured spring height animation.</p>\n</Collapsible>`,
    props: [
      ["title", "ReactNode", "Trigger label."],
      ["open / defaultOpen / onOpenChange", "boolean", "Controllable disclosure state."],
      ["disabled", "boolean", "Disables the toggle."],
    ],
    notes: [
      "Independent single-section disclosure without the multiple-panel grouping of Accordion.",
      "Uses measured content height for smooth spring animation without clipped intermediate frames.",
      "Full keyboard support with Space/Enter and ARIA aria-expanded attributes.",
    ],
  },
  "tree-view": {
    demo: () => <TreeDemo />, code: `<TreeView label="Project files" nodes={nodes} defaultExpanded={["src"]} onSelect={open} />`,
    props: [["nodes", "TreeNode[]", "{ id, label, icon?, children?, disabled? }"], ["expanded / defaultExpanded / onExpandedChange", "string[]", ""], ["selected / onSelect", "", ""]],
    notes: ["Full WAI-ARIA tree keyboard model, including typeahead and * to expand siblings.", "Branches expand with measured height; chevrons rotate with the press spring."],
    keyboard: [["↓ / ↑", "Next / previous visible item"], ["→", "Expand, or move to first child"], ["←", "Collapse, or move to parent"], ["Home / End", "First / last item"], ["Enter / Space", "Select (and toggle branches)"], ["*", "Expand all siblings"], ["Typing", "Jump by label"]],
    semantics: ["role=tree / treeitem / group with aria-expanded, aria-level, aria-setsize, aria-posinset and roving tabindex."], edge: ["Disabled items are visible but not selectable", "RTL mirrors ← and →"],
  },
  "read-more": {
    demo: () => <div style={{ maxInlineSize: "32rem" }}><ReadMore lines={2}>{long}</ReadMore></div>, code: `<ReadMore lines={3}>{longText}</ReadMore>`,
    notes: ["Shows the toggle only when the text actually overflows (rechecked on resize).", "The full text is always in the DOM for find-in-page and screen readers."], semantics: ["Toggle has aria-expanded and aria-controls."],
  },
  card: {
    demo: () => <div className="grid" style={{ inlineSize: "100%" }}><Card><strong>Surface</strong><p style={{ marginBlockEnd: 0 }}>Answers to its own width with container queries.</p></Card><Card><Stack direction="row" gap={3} align="center"><Avatar name="Grace Hopper" /><div><strong>Grace Hopper</strong><span className="orlo-hint">Rear admiral</span></div></Stack></Card></div>,
    code: `<Card>…</Card>`, notes: ["Declares an inline-size container so children adapt to the card, not the viewport."], specs: [["Surface", "--orlo-color-surface"], ["Border", "--orlo-color-border"], ["Corner radius", "--orlo-radius-lg"], ["Padding", "--orlo-space-5"]],
  },
  "aspect-ratio": {
    demo: () => (
      <div style={{ inlineSize: "min(100%, 20rem)" }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <AspectRatio ratio={16 / 9}>
            <div style={{ display: "grid", placeItems: "center", background: "var(--orlo-color-surface-selected)", color: "var(--orlo-color-fg-muted)", fontWeight: 600 }}>
              16 : 9 Aspect Ratio
            </div>
          </AspectRatio>
          <div style={{ padding: "var(--orlo-space-3)" }}>
            <strong>Fixed ratio media card</strong>
            <p className="orlo-hint" style={{ margin: 0 }}>Never causes cumulative layout shift.</p>
          </div>
        </Card>
      </div>
    ),
    code: `<AspectRatio ratio={16 / 9}>\n  <img src="/photo.jpg" alt="Preview" />\n</AspectRatio>`,
    props: [
      ["ratio", "number", "Width / height ratio (e.g. 16/9, 4/3, 1). Default 16/9."],
      ["children", "ReactNode", "Contained element."],
    ],
    notes: [
      "Prevents layout shift (CLS) as images, videos and iframes load.",
      "Works with container queries and fluid widths.",
    ],
  },
  stack: {
    demo: () => <Stack direction="row" gap={3} wrap>{[1, 2, 3, 4].map((i) => <div key={i} style={{ padding: 16, borderRadius: 8, background: "var(--orlo-color-surface-selected)" }}>Item {i}</div>)}</Stack>,
    code: `<Stack direction="row" gap={3} wrap>…</Stack>`, props: [["direction", '"column" | "row"', ""], ["gap", "space step", "0–16, 4px each."], ["align / justify / wrap", "", ""]], notes: ["A convenience over flexbox on the space scale. Plain CSS is fine when clearer."],
  },
  divider: { demo: () => <div style={{ inlineSize: "100%" }}><Divider /><Divider label="or continue with" /></div>, code: `<Divider label="or" />`, notes: ["Plain <hr> when unlabelled; a labelled separator otherwise."] },
  splitter: {
    demo: () => <Splitter style={{ inlineSize: "100%" }} start={<><strong>Navigator</strong><p className="orlo-hint">Drag the divider, or focus it and use arrow keys. Enter collapses.</p></>} end={<><strong>Editor</strong><p className="orlo-hint">Double-click the divider to reset.</p></>} />,
    code: `<Splitter start={<Nav />} end={<Editor />} defaultValue={30} min={15} max={70} />`,
    notes: ["The divider is a focusable separator with a value.", "Pointer capture means leaving the window mid-drag can't strand it."],
    keyboard: [["← / → (↑ / ↓ vertical)", "Resize (Shift for 10%)"], ["Home / End", "To the limits"], ["Enter", "Collapse / restore"]], semantics: ["role=separator with aria-valuenow/min/max and aria-orientation."],
  },
  "scroll-area": {
    demo: () => <div style={{ inlineSize: "min(100%, 22rem)" }}><ScrollArea label="Release notes" maxHeight={180}>{Array.from({ length: 14 }, (_, i) => <p key={i} style={{ margin: "0 0 8px" }}>Release {14 - i}: small, careful improvements.</p>)}</ScrollArea></div>,
    code: `<ScrollArea label="Release notes" maxHeight={240}>…</ScrollArea>`, notes: ["Edge shadows appear only when there is more to see in that direction.", "Focusable and labelled, so keyboard users can scroll it.", "Overscroll is contained so the page doesn't scroll behind it."],
  },
};

