import { useState } from "react";
import { Calendar, DatePicker, TimeField, ColorPicker, FileDropzone, Stack, type DateRange } from "@orlo/react";
import type { Doc } from "./types.ts";

function RangeCal() {
  const [r, setR] = useState<DateRange>({ start: null, end: null });
  const f = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  return <Stack gap={2}><Calendar mode="range" value={r} onValueChange={setR} /><span className="orlo-hint">{r.start ? `${f.format(r.start)} → ${r.end ? f.format(r.end) : "pick an end date"}` : "Pick a start date"}</span></Stack>;
}
const in2w = () => { const d = new Date(); d.setDate(d.getDate() + 14); return d; };

export const pickers: Record<string, Doc> = {
  calendar: {
    demo: () => <Stack direction="row" gap={8} wrap><Calendar /><Calendar locale="ar-EG" label="Arabic (Egypt) calendar" /></Stack>,
    variants: [
      { title: "Range", body: "Hovering previews the range before the second click.", demo: () => <RangeCal /> },
      { title: "Limits", body: "Dates outside min/max are announced as unavailable and struck through.", demo: () => <Calendar min={new Date()} max={in2w()} isDateDisabled={(d) => d.getDay() === 0} /> },
      { title: "Week start by locale", body: "en-US starts on Sunday, en-GB on Monday, ar-EG on Saturday — from Intl, not hard-coded.", demo: () => <Stack direction="row" gap={6} wrap><Calendar locale="en-US" /><Calendar locale="en-GB" /></Stack> },
    ],
    code: `<Calendar value={date} onValueChange={setDate} min={today} />\n<Calendar mode="range" value={range} onValueChange={setRange} />`,
    props: [["mode", '"single" | "range"', ""], ["value / defaultValue / onValueChange", "Date | null  ·  { start, end }", ""], ["locale", "string", "Names, digits and week start."], ["min / max / isDateDisabled", "", ""], ["autoFocus", "boolean", "Focus the active day on mount."]],
    notes: ["Dates are pinned to local noon, so daylight-saving changes never shift a day.", "Month names, weekday names, digits and the first day of the week all come from Intl for the given locale.", "Changing months keeps focus on the equivalent day, clamped to month length (31 Jan → 28 Feb)."],
    anatomy: [["Month heading", ".orlo-calendar__title"], ["Previous / next", ".orlo-calendar__head .orlo-icon-button"], ["Weekday header", ".orlo-calendar__grid th"], ["Today marker", '[aria-current="date"]']], anatomyDemo: () => <Calendar />,
    specs: [["Day cell", "40px"], ["Selected", "--orlo-color-accent"], ["Range fill", "--orlo-color-surface-selected"], ["Today marker", "--orlo-color-accent"]],
    keyboard: [["← → (mirrored in RTL)", "Previous / next day"], ["↑ / ↓", "Previous / next week"], ["Home / End", "Start / end of week"], ["Page Up / Page Down", "Previous / next month"], ["Shift+Page Up / Shift+Page Down", "Previous / next year"], ["Enter / Space", "Select"]],
    semantics: ["role=grid with gridcells; each day button has a full date label (“Sunday, 18 October 2026”), aria-current=date for today and aria-disabled for unavailable days.", "The month heading is a polite live region, so paging months is announced."],
    edge: ["Daylight-saving transitions", "Leap years and 31st → shorter month", "Locales that start weeks on Saturday or Sunday", "Non-Latin digits (Arabic-Indic)"],
  },
  "date-picker": {
    demo: () => <div style={{ inlineSize: "min(100%, 18rem)" }}><DatePicker label="Departure" min={new Date()} help="Opens a calendar; on phones it docks to the bottom." /></div>,
    code: `<DatePicker label="Departure" value={date} onValueChange={setDate} min={new Date()} />`,
    notes: ["Selecting a date closes the popover and returns focus to the field.", "Below 520 px the calendar docks to the bottom edge instead of squeezing beside the field."],
    keyboard: [["Enter / Space", "Open"], ["Calendar keys", "As Calendar"], ["Escape", "Close without changing"]], semantics: ["Field is a button labelled by the label and current value; the popover is a labelled dialog."],
  },
  "time-field": {
    demo: () => <Stack direction="row" gap={4} wrap><TimeField label="Start time" defaultValue="09:30" /><TimeField label="24-hour (de-DE)" locale="de-DE" defaultValue="18:45" /><TimeField label="Empty, 15-min steps" minuteStep={15} /></Stack>,
    code: `<TimeField label="Start time" value={t} onValueChange={setT} />  // value is "HH:MM" (24h)`,
    props: [["value / defaultValue / onValueChange", "string | null", "Always 24-hour “HH:MM”."], ["locale", "string", "Display only: 12- or 24-hour."], ["minuteStep", "number", "Arrow step for minutes."]],
    notes: ["Displays the locale convention but stores one unambiguous format.", "Typing 7 in the hour moves straight to minutes; typing 1 waits for a second digit."],
    keyboard: [["Digits", "Type a segment (auto-advance)"], ["↑ / ↓", "Step and wrap"], ["← / →", "Move between segments"], ["A / P", "Set AM or PM"], ["Backspace", "Clear segment"]],
    semantics: ["A group of role=spinbutton segments with aria-valuetext; empty segments say “Empty”."],
  },
  "color-picker": {
    demo: () => <ColorPicker label="Brand colour" />, code: `<ColorPicker label="Brand colour" value={hex} onValueChange={setHex} />`,
    props: [["value / defaultValue / onValueChange", "string", "#RRGGBB."], ["swatches", "string[]", "Quick picks."]],
    notes: ["The saturation/brightness area is a keyboard slider, not a mouse-only canvas.", "Shows text contrast on the chosen colour, live, against white and black.", "Uses the EyeDropper API where the browser supports it; hidden elsewhere."],
    keyboard: [["← / →", "Saturation"], ["↑ / ↓", "Brightness"], ["Shift+arrows", "10% steps"]], semantics: ["Area: role=slider with a two-value aria-valuetext. Hue: native range. Swatches: aria-pressed buttons."],
    edge: ["Invalid hex is kept while typing and reverted on blur."],
  },
  "file-dropzone": {
    demo: () => <div style={{ inlineSize: "min(100%, 28rem)" }}><FileDropzone label="Attachments" accept="image/*,.pdf" maxSize={5_000_000} maxFiles={4} /></div>,
    code: `<FileDropzone label="Attachments" accept="image/*,.pdf" maxSize={5_000_000} onFilesChange={setFiles} />`,
    props: [["accept", "string", "Like <input accept>."], ["maxSize", "number", "Bytes."], ["maxFiles", "number", ""], ["multiple", "boolean", ""], ["onFilesChange", "(files) => void", ""]],
    notes: ["During a drag it shows whether the files will be accepted, before release.", "Every rejection says why: type, size, limit or duplicate.", "A real “Browse files” button, so it works without dragging."],
    keyboard: [["Tab", "Reach Browse files"], ["Enter / Space", "Open the file chooser"]], semantics: ["Rejections are an alert; the file list is labelled and each remove button names its file."],
    edge: ["Extension rules (.pdf) can't be judged mid-drag, so they never block the preview.", "Dragging over child elements doesn't flicker (enter/leave depth counting)."],
  },
};
