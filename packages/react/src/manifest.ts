export type Maturity = "planned" | "prototype" | "beta" | "stable";

export type ManifestEntry = {
  name: string;
  slug: string;
  family: "Actions" | "Forms" | "Navigation" | "Overlays" | "Disclosure" | "Data display" | "Feedback" | "Media" | "Layout";
  maturity: Maturity;
  summary: string;
  /** What has actually been verified; empty means nothing yet. */
  tested: ("unit" | "keyboard" | "browser")[];
};

/**
 * Honest coverage record. Nothing is `stable` until it clears the quality gate
 * (manual screen-reader passes, visual regression, RTL and zoom checks).
 */
export const manifest: ManifestEntry[] = [
  { name: "Button", slug: "button", family: "Actions", maturity: "beta", summary: "Solid, subtle, ghost and danger buttons with a geometry-preserving loading state.", tested: ["unit"] },
  { name: "IconButton", slug: "icon-button", family: "Actions", maturity: "beta", summary: "Icon-only button whose label is required and becomes its accessible name.", tested: [] },
  { name: "CopyButton", slug: "copy-button", family: "Actions", maturity: "beta", summary: "Copies text, confirms in place and announces the result.", tested: [] },
  { name: "SegmentedControl", slug: "segmented-control", family: "Actions", maturity: "beta", summary: "A few mutually exclusive options with a travelling selection surface.", tested: ["unit", "keyboard"] },
  { name: "TextField", slug: "text-field", family: "Forms", maturity: "beta", summary: "Labelled input with a reserved message line and announced errors.", tested: [] },
  { name: "TextArea", slug: "text-area", family: "Forms", maturity: "beta", summary: "Multi-line input that grows with content and can count characters.", tested: [] },
  { name: "Select", slug: "select", family: "Forms", maturity: "beta", summary: "Single-select listbox with typeahead and keyboard support while open or closed.", tested: ["unit", "keyboard"] },
  { name: "Checkbox", slug: "checkbox", family: "Forms", maturity: "beta", summary: "Native checkbox, styled, with an indeterminate state.", tested: ["unit"] },
  { name: "RadioGroup", slug: "radio-group", family: "Forms", maturity: "beta", summary: "Native radios in a fieldset, vertical or horizontal.", tested: [] },
  { name: "Switch", slug: "switch", family: "Forms", maturity: "beta", summary: "Immediate on/off setting with a springing thumb.", tested: ["unit"] },
  { name: "Slider", slug: "slider", family: "Forms", maturity: "beta", summary: "Native range input with a formatted, announced value.", tested: [] },
  { name: "Tabs", slug: "tabs", family: "Navigation", maturity: "beta", summary: "Roving-focus tabs with one shared indicator and unmounted inactive panels.", tested: ["unit", "keyboard"] },
  { name: "Menu", slug: "menu", family: "Navigation", maturity: "beta", summary: "Action menu with arrows, typeahead, edge flipping and focus return.", tested: ["unit", "keyboard"] },
  { name: "CommandPalette", slug: "command-palette", family: "Navigation", maturity: "beta", summary: "⌘K search-and-jump dialog with fuzzy ranking. Powers this site's search.", tested: [] },
  { name: "Breadcrumbs", slug: "breadcrumbs", family: "Navigation", maturity: "beta", summary: "Trail to the current page, marked with aria-current.", tested: [] },
  { name: "Pagination", slug: "pagination", family: "Navigation", maturity: "beta", summary: "Page list that always keeps first, last and neighbours in view.", tested: ["unit"] },
  { name: "Dialog", slug: "dialog", family: "Overlays", maturity: "beta", summary: "Modal with focus trap, inert page, single scroll lock and focus return.", tested: ["unit", "keyboard"] },
  { name: "AlertDialog", slug: "alert-dialog", family: "Overlays", maturity: "beta", summary: "Confirmation that needs an explicit choice.", tested: [] },
  { name: "Sheet", slug: "sheet", family: "Overlays", maturity: "beta", summary: "Edge panel; the bottom variant drags to dismiss from its handle only.", tested: [] },
  { name: "Popover", slug: "popover", family: "Overlays", maturity: "beta", summary: "Anchored non-modal panel that flips, shifts and docks on narrow screens.", tested: [] },
  { name: "Tooltip", slug: "tooltip", family: "Overlays", maturity: "beta", summary: "Short description on hover or keyboard focus, never on touch.", tested: ["unit"] },
  { name: "Toast", slug: "toast", family: "Overlays", maturity: "beta", summary: "Transient notifications that pause on hover, focus and hidden tabs.", tested: ["unit"] },
  { name: "Accordion", slug: "accordion", family: "Disclosure", maturity: "beta", summary: "Measured height animation; collapsed content is unmounted.", tested: ["unit"] },
  { name: "Card", slug: "card", family: "Layout", maturity: "beta", summary: "Container-query-aware surface.", tested: [] },
  { name: "Stack", slug: "stack", family: "Layout", maturity: "beta", summary: "Flex layout on the space scale.", tested: [] },
  { name: "Divider", slug: "divider", family: "Layout", maturity: "beta", summary: "Separator, optionally labelled.", tested: [] },
  { name: "Badge", slug: "badge", family: "Data display", maturity: "beta", summary: "Compact status label; tone never carries meaning alone.", tested: [] },
  { name: "Avatar", slug: "avatar", family: "Data display", maturity: "beta", summary: "Photo or initials on a stable tint, plus groups with overflow.", tested: ["unit"] },
  { name: "Table", slug: "table", family: "Data display", maturity: "beta", summary: "Sortable semantic table with sticky header and empty state.", tested: ["unit"] },
  { name: "AnimatedNumber", slug: "animated-number", family: "Data display", maturity: "beta", summary: "Locale-formatted number that tweens; screen readers hear the settled value.", tested: [] },
  { name: "Kbd", slug: "kbd", family: "Data display", maturity: "beta", summary: "Keyboard key.", tested: [] },
  { name: "Alert", slug: "alert", family: "Feedback", maturity: "beta", summary: "Inline status message whose exit removes it from the tab order.", tested: [] },
  { name: "Progress", slug: "progress", family: "Feedback", maturity: "beta", summary: "Determinate or honest indeterminate progress.", tested: [] },
  { name: "Spinner", slug: "spinner", family: "Feedback", maturity: "beta", summary: "Indeterminate activity with an accessible label.", tested: [] },
  { name: "Skeleton", slug: "skeleton", family: "Feedback", maturity: "beta", summary: "Geometry-reserving placeholder; static under reduced motion.", tested: [] },
  { name: "EmptyState", slug: "empty-state", family: "Feedback", maturity: "beta", summary: "Designed nothing-here-yet state with a next step.", tested: [] },
  { name: "OrloImage", slug: "image", family: "Media", maturity: "beta", summary: "Image lifecycle with bounded retry, designed failure and a no-image mode.", tested: ["unit"] },
];

export const families = [...new Set(manifest.map((m) => m.family))];
