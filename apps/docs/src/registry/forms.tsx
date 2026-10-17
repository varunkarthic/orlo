import { useState } from "react";
import { TextField, TextArea, Select, Checkbox, RadioGroup, Switch, Slider, PasswordField, NumberField, SearchField, Combobox, TagInput, PinInput, RadioCards, RangeSlider, Rating, Stack, Icons, Highlight } from "@orlo/react";
import { controlSpecs, type Doc } from "./types.ts";

function EmailField() {
  const [v, setV] = useState("");
  const bad = v.length > 0 && !/^\S+@\S+\.\S+$/.test(v);
  return <div style={{ inlineSize: "min(100%, 22rem)" }}><TextField label="Email" type="email" autoComplete="email" value={v} onChange={(e) => setV(e.target.value)} help="Used only to sign you in." error={bad ? "Enter an address like name@example.com." : undefined} /></div>;
}
function Bio() { const [v, setV] = useState(""); return <div style={{ inlineSize: "min(100%, 26rem)" }}><TextArea label="Bio" value={v} onChange={(e) => setV(e.target.value)} maxLength={160} showCount help="A sentence or two." /></div>; }
function SelectDemo() {
  const [v, setV] = useState("");
  return <div style={{ inlineSize: "min(100%, 18rem)" }}><Select label="Time zone" value={v} onValueChange={setV} placeholder="Choose a time zone" help={v ? `Selected: ${v}` : "Type to jump to an option."}
    options={[{ value: "Europe/Rome", label: "Rome" }, { value: "Europe/London", label: "London" }, { value: "America/New_York", label: "New York" }, { value: "Asia/Kolkata", label: "Kolkata" }, { value: "Asia/Tokyo", label: "Tokyo" }, { value: "Pacific/Auckland", label: "Auckland", disabled: true }]} /></div>;
}
function PasswordDemo() { const [v, setV] = useState(""); return <div style={{ inlineSize: "min(100%, 22rem)" }}><PasswordField label="New password" value={v} onChange={(e) => setV(e.target.value)} autoComplete="new-password" showStrength help="At least 12 characters. Try turning Caps Lock on." /></div>; }
function NumberDemo() { const [v, setV] = useState<number | null>(3); return <Stack direction="row" gap={4} wrap><div style={{ inlineSize: "12rem" }}><NumberField label="Quantity" value={v} onValueChange={setV} min={0} max={99} help="Hold + or − to repeat." /></div><div style={{ inlineSize: "12rem" }}><NumberField label="Budget" defaultValue={1250.5} step={50} format={{ style: "currency", currency: "EUR" }} locale="de-DE" help="German format: 1.250,50 €" /></div></Stack>; }
const fruit = ["Apple", "Apricot", "Banana", "Blackberry", "Blueberry", "Cherry", "Clementine", "Date", "Fig", "Grape", "Guava", "Kiwi", "Lemon", "Lime", "Mango", "Melon", "Nectarine", "Orange", "Papaya", "Peach", "Pear", "Plum", "Pomegranate", "Raspberry", "Strawberry"];
function SearchDemo() {
  const [q, setQ] = useState(""); const [busy, setBusy] = useState(false); const [res, setRes] = useState<string[]>(fruit.slice(0, 6));
  return (
    <div style={{ inlineSize: "min(100%, 22rem)" }}>
      <SearchField label="Search fruit" value={q} onValueChange={setQ} loading={busy} onSearch={(s) => { setBusy(true); setTimeout(() => { setRes(fruit.filter((f) => f.toLowerCase().includes(s.toLowerCase())).slice(0, 6)); setBusy(false); }, 350); }} />
      <ul style={{ margin: "8px 0 0", paddingInlineStart: 18 }}>{res.length ? res.map((r) => <li key={r}><Highlight text={r} query={q} /></li>) : <li style={{ listStyle: "none", marginInlineStart: -18 }} className="orlo-hint">No fruit matches “{q}”.</li>}</ul>
    </div>
  );
}
function AsyncCombo() {
  const [opts, setOpts] = useState(fruit.slice(0, 8).map((f) => ({ value: f, label: f }))); const [busy, setBusy] = useState(false);
  return <div style={{ inlineSize: "min(100%, 18rem)" }}><Combobox label="Remote search" placeholder="Type a fruit" loading={busy} options={opts} help="Simulated 400 ms server." onInputChange={(t) => { setBusy(true); setTimeout(() => { setOpts(fruit.filter((f) => f.toLowerCase().startsWith(t.toLowerCase())).map((f) => ({ value: f, label: f }))); setBusy(false); }, 400); }} /></div>;
}
function PinDemo() { const [err, setErr] = useState<string>(); const [ok, setOk] = useState(false); return <Stack gap={2}><PinInput label="Verification code" onComplete={(v) => { if (v === "123456") { setOk(true); setErr(undefined); } else { setOk(false); setErr("That code doesn’t match. Try 123456."); } }} error={err} />{ok && <span style={{ color: "var(--orlo-color-success)", fontWeight: 600 }}><Icons.Check size={16} /> Verified</span>}</Stack>; }
function RangeDemo() { const [v, setV] = useState<[number, number]>([40, 180]); return <div style={{ inlineSize: "min(100%, 22rem)" }}><RangeSlider label="Price" value={v} onValueChange={setV} min={0} max={300} step={5} minGap={20} format={(n) => `€${n}`} /></div>; }
function Indeterminate() {
  const [items, setItems] = useState([true, false, true]);
  const all = items.every(Boolean), none = !items.some(Boolean);
  return <Stack gap={2}><Checkbox label="All notifications" checked={all} indeterminate={!all && !none} onChange={() => setItems(items.map(() => !all))} />
    <div style={{ paddingInlineStart: 28, display: "grid", gap: 8 }}>{["Replies", "Mentions", "Weekly digest"].map((l, i) => <Checkbox key={l} label={l} checked={items[i]} onChange={() => setItems(items.map((x, j) => (j === i ? !x : x)))} />)}</div></Stack>;
}

export const forms: Record<string, Doc> = {
  "text-field": {
    demo: () => <EmailField />,
    variants: [
      { title: "Help and error", body: "The message line is always reserved; switching from help to error never moves the form.", demo: () => <Stack direction="row" gap={4} wrap><div style={{ inlineSize: "14rem" }}><TextField label="Username" help="Letters and numbers." /></div><div style={{ inlineSize: "14rem" }}><TextField label="Username" defaultValue="ada lovelace" error="No spaces allowed." /></div></Stack> },
      { title: "Disabled and read-only", demo: () => <Stack direction="row" gap={4} wrap><div style={{ inlineSize: "14rem" }}><TextField label="Plan" defaultValue="Team" disabled /></div><div style={{ inlineSize: "14rem" }}><TextField label="Account ID" defaultValue="ac_19F2" readOnly help="Copy, but not edit." /></div></Stack> },
    ],
    code: `<TextField label="Email" type="email" value={email} onChange={…}\n  help="Used only to sign you in." error={error} />`,
    props: [["label", "ReactNode", "Visible label, always."], ["help", "ReactNode", "Hint text, linked via aria-describedby."], ["error", "ReactNode", "Replaces help; sets aria-invalid and announces."], ["…input attributes", "", "Forwarded to <input>."]],
    notes: ["The message line is always reserved, so validation never pushes the rest of the form down.", "Errors are announced, prefixed with a glyph and drawn with a doubled border, never colour alone."],
    anatomy: [["Label", ".orlo-field__label"], ["Input container", ".orlo-field__input"], ["Supporting text", ".orlo-field__msg"]],
    anatomyDemo: () => <div style={{ inlineSize: 260 }}><TextField label="Email" defaultValue="ada@example.com" help="Used only to sign you in." /></div>,
    specs: [...controlSpecs, ["Border", "--orlo-color-border-control"], ["Error", "--orlo-color-error"], ["Label size", "--orlo-text-sm"]],
    useWhen: ["Short, single-line free text."], avoidWhen: ["A choice from known options: use Select or RadioGroup.", "Long text: use TextArea."],
    dos: [["Keep the label visible above the field.", "Use placeholder text as the only label."], ["Validate on blur or submit, then live once the field is in error.", "Show an error while the person is still typing their first character."]],
    keyboard: [["Tab", "Move into and out of the field"]], semantics: ["<label for>, aria-describedby for help/error, aria-invalid when in error, role=alert on the error text."],
    edge: ["Autofill and password managers work: it is a native input.", "IME composition is not interrupted by validation."],
  },
  "text-area": {
    demo: () => <Bio />, code: `<TextArea label="Bio" value={bio} onChange={…} maxLength={160} showCount />`,
    props: [["label / help / error", "", "As TextField."], ["showCount", "boolean", "Live count, against maxLength when set."]],
    notes: ["Grows with its content where CSS field-sizing is supported; falls back to manual resize.", "The count updates politely so screen readers are not interrupted on each keystroke."],
    specs: [["Min height", "5.5rem"], ["Max height before scroll", "20rem"], ["Line height", "--orlo-leading-snug"], ["Corner radius", "--orlo-radius-md"]],
    useWhen: ["Multi-line text: comments, descriptions, messages."], keyboard: [["Enter", "New line"], ["Tab", "Leave the field"]],
  },
  select: {
    demo: () => <SelectDemo />,
    code: `<Select label="Time zone" value={tz} onValueChange={setTz}\n  options={[{ value: "Europe/Rome", label: "Rome" }, …]} />`,
    props: [["label", "ReactNode", ""], ["options", "{ value, label, disabled?, description? }[]", ""], ["value / defaultValue / onValueChange", "", ""], ["placeholder", "string", ""], ["name", "string", "Adds a hidden input for native form submission."]],
    notes: ["Focus stays on the trigger; the active option is tracked with aria-activedescendant.", "Typeahead works while closed (changes the value) and open (moves the highlight).", "The list flips above the trigger near the bottom of the screen and scrolls if long."],
    anatomy: [["Label", ".orlo-field__label"], ["Trigger", ".orlo-select"], ["Value", ".orlo-select span"], ["Indicator", ".orlo-select svg"]],
    anatomyDemo: () => <div style={{ inlineSize: 240 }}><Select label="Time zone" defaultValue="rome" options={[{ value: "rome", label: "Rome" }]} /></div>,
    specs: [...controlSpecs, ["Listbox surface", "--orlo-color-surface-raised"], ["Active option", "--orlo-color-surface-selected"], ["Layer", "--orlo-layer-menu"]],
    useWhen: ["Choosing one of 5–15 known options."], avoidWhen: ["Fewer than five: show them with RadioGroup or SegmentedControl.", "Hundreds of options: use Combobox."],
    keyboard: [["↓ / ↑ / Enter / Space", "Open (closed); move or choose (open)"], ["Home / End", "First / last option"], ["Typing", "Jump to a matching option"], ["Escape", "Close without changing"], ["Tab", "Choose the highlighted option and move on"]],
    semantics: ["Select-only combobox: button role=combobox with aria-expanded, aria-controls and aria-activedescendant; listbox with role=option."], edge: ["Disabled options are skipped by arrows and typeahead.", "Long lists scroll and keep the active option in view."],
  },
  checkbox: {
    demo: () => <Stack gap={3}><Checkbox label="Email me about replies" defaultChecked /><Checkbox label="Archived (disabled)" disabled /><Checkbox label="Weekly digest" description="One email every Monday." /></Stack>,
    variants: [{ title: "Indeterminate parent", body: "A parent reflects a partially selected group.", demo: () => <Indeterminate /> }],
    code: `<Checkbox label="Email me about replies" checked={on} onChange={(e) => setOn(e.target.checked)} />`,
    props: [["label", "ReactNode", ""], ["indeterminate", "boolean", "Mixed state, set on the real input."], ["description", "ReactNode", ""], ["…input attributes", "", "Native checkbox props."]],
    notes: ["A real <input type=checkbox>: forms, autofill and assistive tech behave natively.", "The tick draws itself in; under reduced motion it simply appears."],
    anatomy: [["Box", ".orlo-check__box"], ["Label", ".orlo-check__text"]], anatomyDemo: () => <Checkbox label="Remember me" defaultChecked />,
    specs: [["Box size", "20px"], ["Border", "--orlo-color-border-control"], ["Checked fill", "--orlo-color-accent"], ["Corner radius", "--orlo-radius-sm"]],
    useWhen: ["Independent on/off choices inside a form that is submitted."], avoidWhen: ["Immediate settings: use Switch.", "One choice among several: use RadioGroup."],
    keyboard: [["Space", "Toggle"]], semantics: ["Native checkbox; indeterminate also exposes aria-checked=mixed."],
  },
  "radio-group": {
    demo: () => <RadioGroup legend="Delivery" name="delivery" defaultValue="standard" options={[{ value: "standard", label: "Standard", description: "3–5 working days" }, { value: "express", label: "Express", description: "Next working day" }, { value: "pickup", label: "Pick up in store", disabled: true }]} />,
    code: `<RadioGroup legend="Delivery" name="delivery" value={v} onValueChange={setV}\n  options={[{ value: "standard", label: "Standard" }, …]} />`,
    props: [["legend", "ReactNode", "Group label."], ["name", "string", ""], ["options", "{ value, label, description?, disabled? }[]", ""], ["orientation", '"vertical" | "horizontal"', ""]],
    notes: ["Native radios in a fieldset: arrow keys and grouping come from the platform."],
    keyboard: [["Tab", "Enter the group on the selected radio"], ["↑ ↓ ← →", "Select the previous or next option"]], semantics: ["<fieldset> + <legend>, native radios sharing a name."],
    useWhen: ["2–6 mutually exclusive options that benefit from being visible at once."],
  },
  switch: {
    demo: () => <Stack gap={4}><Switch label="Wi-Fi" defaultChecked /><Switch label="Low data mode" description="Pauses image loading on cellular." /><Switch label="Managed by your organisation" disabled defaultChecked /></Stack>,
    code: `<Switch label="Wi-Fi" checked={on} onCheckedChange={setOn} />`,
    props: [["label", "ReactNode", ""], ["checked / defaultChecked / onCheckedChange", "", ""], ["description", "ReactNode", ""], ["name", "string", "Hidden input for forms."]],
    notes: ["The thumb springs with the `press` preset; tapping rapidly redirects it mid-flight without jumps.", "The touch target extends beyond the visible track."],
    anatomy: [["Track", ".orlo-switch"], ["Thumb", ".orlo-switch__thumb"], ["Label", ".orlo-switch__text label"]], anatomyDemo: () => <Switch label="Wi-Fi" defaultChecked />,
    specs: [["Track", "44 × 26px"], ["Thumb", "18px"], ["On fill", "--orlo-color-accent"], ["Off fill", "--orlo-color-border"], ["Touch target", "≥ 42px"]],
    useWhen: ["Settings that apply immediately."], avoidWhen: ["Choices that only apply after Save: use Checkbox."],
    dos: [["Label the setting, not the state (“Wi-Fi”, not “Turn on Wi-Fi”).", "Change the label when the switch flips."]],
    keyboard: [["Space / Enter", "Toggle"]], semantics: ["<button role=switch aria-checked>. The visible label is a <label for>."], edge: ["Rapid toggling never desynchronises the thumb from the state."],
  },
  slider: {
    demo: () => <div style={{ inlineSize: "min(100%, 22rem)" }}><Stack gap={6}><Slider label="Volume" defaultValue={60} format={(v) => `${v}%`} /><Slider label="Price limit" min={0} max={500} step={25} defaultValue={150} format={(v) => `€${v}`} marks={[0, { value: 250, label: "€250" }, 500]} /></Stack></div>,
    variants: [
      { title: "Press vs drag", body: "Click far along the track: the thumb springs there. Grab the thumb: it stays under your pointer, then settles with your release velocity.", demo: () => <div style={{ inlineSize: "min(100%, 28rem)" }}><Slider label="Try both" defaultValue={10} /></div> },
      { title: "Stepped with marks", demo: () => <div style={{ inlineSize: "min(100%, 28rem)" }}><Slider label="Quality" min={0} max={4} step={1} defaultValue={2} format={(v) => ["Draft", "Low", "Medium", "High", "Maximum"][v]} marks={[0, 1, 2, 3, 4].map((v) => ({ value: v, label: ["Draft", "Low", "Med", "High", "Max"][v] }))} /></div> },
      { title: "Vertical", demo: () => <Stack direction="row" gap={8}><Slider label="Bass" orientation="vertical" defaultValue={40} /><Slider label="Treble" orientation="vertical" defaultValue={70} /></Stack> },
    ],
    code: `<Slider label="Volume" value={v} onValueChange={setV} onValueCommit={save} format={(v) => \`\${v}%\`} />`,
    props: [["label", "ReactNode", ""], ["min / max / step", "number", ""], ["format", "(v) => string", "Visible, bubble and announced value."], ["marks", "(number | { value, label })[]", "Tick marks."], ["onValueCommit", "(v) => void", "Once per drag or key press."], ["bubble", "boolean", "Floating value while interacting."], ["orientation", '"horizontal" | "vertical"', ""]],
    notes: ["Pressing the track springs the thumb to the target with the `thumb` spring — it never teleports.", "Dragging follows the pointer exactly (verified in a real browser to within 3 px per frame), then settles on the step with your release velocity.", "Keyboard steps animate too; under reduced motion everything becomes a short fade or instant."],
    anatomy: [["Rail", ".orlo-slider__rail"], ["Active fill", ".orlo-slider__fill"], ["Thumb", ".orlo-slider__thumb"], ["Value", ".orlo-slider__value"]], anatomyDemo: () => <div style={{ inlineSize: 280 }}><Slider label="Volume" defaultValue={60} /></div>,
    specs: [["Rail height", "6px"], ["Thumb", "22px"], ["Fill", "--orlo-color-accent"], ["Rail", "--orlo-color-border"], ["Settle", "--orlo-duration-spatial-fast"], ["Settle curve", "--orlo-ease-spatial-fast"]],
    keyboard: [["← → ↑ ↓ (mirrored in RTL)", "Step"], ["Page Up / Page Down", "10% of range"], ["Home / End", "Min / max"]], semantics: ["role=slider with aria-valuenow/min/max, aria-valuetext from `format` and aria-orientation."],
    edge: ["Pointer released outside the window (pointer capture)", "Pointer cancelled by the OS (touch interrupted)", "Vertical page scroll still works when a finger lands on the track"],
  },
  "password-field": {
    demo: () => <PasswordDemo />, code: `<PasswordField label="New password" value={pw} onChange={…} autoComplete="new-password" showStrength />`,
    props: [["label / help / error", "", "As TextField."], ["showStrength", "boolean", "Segmented meter plus a word."]],
    notes: ["Show/Hide keeps the caret and selection exactly where they were.", "Warns when Caps Lock is on, in words.", "Strength is an estimate for feedback, never presented as a security guarantee."],
    keyboard: [["Tab", "Move between field and reveal toggle"], ["Enter / Space on toggle", "Show or hide"]],
    semantics: ["Reveal toggle is a button with aria-pressed and aria-controls; strength is linked with aria-describedby."], edge: ["Caps Lock state is cleared on blur.", "Password managers keep working (native input, correct autocomplete)."],
  },
  "number-field": {
    demo: () => <NumberDemo />, code: `<NumberField label="Quantity" value={qty} onValueChange={setQty} min={0} max={99} />\n<NumberField label="Budget" format={{ style: "currency", currency: "EUR" }} locale="de-DE" />`,
    props: [["value / defaultValue / onValueChange", "number | null", "null means empty."], ["min / max / step", "number", ""], ["format", "Intl.NumberFormatOptions", ""], ["locale", "string", "Affects parsing and display."]],
    notes: ["Typing is free; the value is parsed in the user's locale and clamped on commit.", "Holding a stepper repeats with gentle acceleration.", "No wheel hijacking: scrolling the page over the field never changes it."],
    keyboard: [["↑ / ↓", "Step"], ["Page Up / Page Down", "×10 step"], ["Home / End", "Min / max"], ["Enter", "Commit typed text"]],
    semantics: ["role=spinbutton with aria-valuenow, min, max and aria-valuetext."], edge: ["“1.234,5” in German and “1,234.5” in English both parse.", "Clearing the field gives null instead of 0."],
  },
  "search-field": {
    demo: () => <SearchDemo />, code: `<SearchField label="Search" onSearch={run} loading={pending} />`,
    props: [["label", "string", "Always provide; hideLabel keeps it for screen readers."], ["onSearch", "(q) => void", "Debounced; never fires mid-IME."], ["debounce", "number", "ms, default 250."], ["loading", "boolean", "Spinner in place of the icon, announced."]],
    notes: ["Escape clears; the clear button keeps focus in the field.", "onSearch never fires during IME composition, so Japanese and Chinese input aren't searched half-typed."],
    keyboard: [["Escape", "Clear"], ["Enter", "Submit (native)"]], semantics: ["Wrapped in role=search; native type=search input."],
  },
  combobox: {
    demo: () => <Stack direction="row" gap={4} wrap><div style={{ inlineSize: "min(100%, 18rem)" }}><Combobox label="Fruit" options={fruit.map((f) => ({ value: f, label: f }))} placeholder="Start typing" /></div><AsyncCombo /></Stack>,
    code: `<Combobox label="Fruit" options={options} value={v} onValueChange={setV} />\n// Remote: pass onInputChange and loading; Orlo stops filtering locally.`,
    props: [["options", "{ value, label, description?, disabled? }[]", ""], ["value / defaultValue / onValueChange", "string | null", ""], ["onInputChange", "(text) => void", "For remote search."], ["loading", "boolean", ""], ["emptyText", "string", ""]],
    notes: ["List autocomplete with an announced result count.", "Escape closes the list first, then clears on a second press."],
    keyboard: [["↓ / ↑", "Move through options (opens the list)"], ["Enter", "Choose the highlighted option"], ["Escape", "Close, then clear"]],
    semantics: ["Input role=combobox with aria-autocomplete=list, aria-expanded and aria-activedescendant."], edge: ["Empty, loading and no-match states are designed.", "IME composition never triggers selection."],
  },
  "tag-input": {
    demo: () => <div style={{ inlineSize: "min(100%, 26rem)" }}><TagInput label="Topics" defaultValue={["design", "react"]} max={6} help="Enter or comma to add. Try pasting “a, b, c”." validate={(t) => (t.length > 20 ? "Keep tags under 20 characters." : undefined)} /></div>,
    code: `<TagInput label="Topics" value={tags} onValueChange={setTags} max={6} />`,
    props: [["value / defaultValue / onValueChange", "string[]", ""], ["validate", "(tag) => string | undefined", "Return a message to reject."], ["max", "number", ""]],
    notes: ["Pasting comma, semicolon or newline separated text adds each item.", "Duplicates are refused with a reason, case-insensitively.", "Backspace on an empty input arms the last tag; a second Backspace removes it."],
    keyboard: [["Enter / , / Tab", "Add the typed tag"], ["Backspace ×2", "Remove the last tag"], ["Escape", "Disarm"]], semantics: ["Tags are a labelled list; each remove button names its tag. Count changes are announced."],
  },
  "pin-input": {
    demo: () => <PinDemo />, code: `<PinInput label="Verification code" length={6} onComplete={verify} />`,
    props: [["length", "number", "Default 6."], ["onComplete", "(code) => void", ""], ["type", '"numeric" | "alphanumeric"', ""], ["mask", "boolean", ""], ["error", "ReactNode", ""]],
    notes: ["Pasting a code fills every box, ignoring spaces and dashes.", "The first box offers the platform's one-time-code autofill (SMS codes on phones)."],
    keyboard: [["Digits", "Fill and advance"], ["Backspace", "Clear and step back"], ["← / →", "Move between boxes"]], semantics: ["A fieldset with a legend; each box is labelled “Character n of m”."],
    edge: ["Autofill delivering the whole code into one box is split correctly.", "Letters are refused in numeric mode."],
  },
  "radio-cards": {
    demo: () => <RadioCards legend="Plan" name="plan" defaultValue="team" options={[{ value: "solo", title: "Solo", description: "For one person.", meta: "Free", icon: <Icons.User /> }, { value: "team", title: "Team", description: "Shared projects and roles.", meta: "€12 / seat", icon: <Icons.Grid /> }, { value: "org", title: "Organisation", description: "SSO and audit logs.", meta: "Contact us", icon: <Icons.Lock />, disabled: true }]} />,
    code: `<RadioCards legend="Plan" name="plan" options={[{ value: "team", title: "Team", description: "…", meta: "€12 / seat" }]} />`,
    notes: ["Large targets for decisions that need explanation; native radios underneath."], keyboard: [["↑ ↓ ← →", "Change selection"]], useWhen: ["Plans, shipping options, roles."],
  },
  "range-slider": {
    demo: () => <RangeDemo />, code: `<RangeSlider label="Price" value={range} onValueChange={setRange} min={0} max={300} minGap={20} />`,
    props: [["value / defaultValue / onValueChange", "[number, number]", ""], ["minGap", "number", "Smallest distance between thumbs."], ["format", "(v) => string", ""]],
    notes: ["Thumbs cannot cross; pressing the track moves the nearest thumb.", "Each thumb exposes its own min and max to assistive tech, based on the other thumb."],
    keyboard: [["← → ↑ ↓", "Step the focused thumb (mirrored in RTL)"], ["Page Up / Page Down", "×10"], ["Home / End", "To its limit"]], semantics: ["Two role=slider thumbs labelled Minimum and Maximum."],
  },
  rating: {
    demo: () => <Stack gap={4}><Rating label="Your rating" defaultValue={3} labels={["Poor", "Fair", "Good", "Great", "Excellent"]} /><Rating label="Average" value={3.6} readOnly /></Stack>,
    code: `<Rating label="Your rating" value={stars} onValueChange={setStars} />\n<Rating label="Average" value={3.6} readOnly />`,
    props: [["max", "number", "Default 5."], ["readOnly", "boolean", "Shows fractions exactly."], ["allowClear", "boolean", "Choosing the current value again clears it."], ["labels", "string[]", "Words for each step."]],
    notes: ["Hover previews only on fine pointers, so touch never sticks.", "Read-only mode clips stars precisely (3.6 shows 60% of the fourth star)."],
    keyboard: [["← → ↑ ↓", "Change rating"]], semantics: ["Interactive: radiogroup of radios. Read-only: a single img with “3.6 out of 5”."],
  },
};
