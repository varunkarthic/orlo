# Component Coverage & Catalogue

_Orlo Engineering Research — Functional Families, Maturity Classifications & Roadmap_

---

## 1. Overview

The Orlo component library contains **127 implemented components** in [`packages/react/src/manifest.ts`](file:///Users/varun/Library/CloudStorage/OneDrive-Personal/orlo/packages/react/src/manifest.ts). The authoritative registry is dynamically exported to `components.json`.

All 127 components are currently classified as **`beta`** maturity, reflecting their complete API surfaces, full TypeScript definitions, automated Vitest unit tests, and Playwright E2E verification, while awaiting final multi-device physical screen reader validation before being stamped `stable`.

---

## 2. Functional Component Families (127 Components)

### A. Actions & Buttons (14 components)
- `Button` — Core interactive action button with size, variant, and loading state.
- `IconButton` — Square/circular icon button with hit-box expansion and accessible label.
- `SplitButton` — Dual-action trigger combining primary action with dropdown options.
- `ButtonGroup` — Cohesive grouping of related buttons with optical border sharing.
- `Toggle` — Two-state pressable button for toggling states.
- `ToggleGroup` — Exclusive or multiple-selection toggle group.
- `SegmentedControl` — Apple HIG-inspired floating capsule tab switch.
- `HoldToConfirm` — Deliberate long-press trigger for high-consequence operations.
- `CopyButton` — Dedicated one-click clipboard copy trigger with visual checkmark feedback.
- `ThemeToggle` — Instant zero-reload light/dark/system mode switcher.
- `MotionToggle` — Reduced-motion override control for user testing.
- `Kbd` — Visual keyboard shortcut keycap presentation.
- `Command` — Command palette item action.
- `Toolbar` — Container for horizontal action clusters.

### B. Form Inputs & Pickers (26 components)
- `Input` — Text input field with prefix/suffix icons, clear trigger, and validation states.
- `Textarea` — Multi-line text entry with auto-expanding height option.
- `Checkbox` — Multi-state checkbox with checked, unchecked, and indeterminate support.
- `CheckboxGroup` — Accessible grouping of checkboxes with shared name.
- `Radio` — Individual single-choice radio selection indicator.
- `RadioGroup` — Exclusive single-choice radio selection group.
- `Switch` — Physical toggle switch with sliding thumb and tactile spring.
- `Select` — Stylized single-selection dropdown with keyboard navigation.
- `MultiSelect` — Dropdown supporting multiple item selection with chip tags.
- `Combobox` — Autocomplete search input with live filtering listbox.
- `Slider` — Precision range slider with single thumb and keyboard steps.
- `RangeSlider` — Dual-thumb range slider for interval selection.
- `ColorPicker` — Visual hue, saturation, and hex color selector.
- `DatePicker` — Calendar-based single date selector.
- `DateRangePicker` — Multi-day calendar range selector.
- `TimePicker` — Hour, minute, and meridiem time input.
- `PinInput` — Multi-box numerical verification code entry (OTP).
- `NumberInput` — Numeric stepper with increment/decrement triggers.
- `SearchInput` — Specialized search field with clear trigger and loading spinner.
- `FileUpload` — Drag-and-drop file upload zone with file size validation.
- `Rating` — Interactive star rating component.
- `Form` — Form container managing submission and validation context.
- `FormField` — Field wrapper associating label, control, helper text, and error.
- `Label` — Accessible form field label.
- `HelperText` — Informative caption beneath form controls.
- `ErrorMessage` — Error message linked to input via `aria-describedby`.

### C. Navigation & Structure (16 components)
- `Tabs` — Apple HIG floating capsule tabs with animated active pill.
- `Breadcrumbs` — Hierarchical pathway trail with separator glyphs.
- `Pagination` — Multi-page numerical navigation with previous/next buttons.
- `Stepper` — Step-by-step wizard progress tracker.
- `TreeView` — Collapsible hierarchical folder/node tree with roving focus.
- `AnchorNav` — In-page table of contents linking to section headings.
- `Link` — Accessible hyperlink with external indicator option.
- `Menu` — Action dropdown menu with keyboard roving tabindex.
- `ContextMenu` — Right-click contextual popover menu.
- `Menubar` — Desktop-style horizontal menu bar with nested submenus.
- `CommandPalette` — Global spotlight search and action modal (`⌘K`).
- `NavRail` — Compact vertical navigation bar for desktop dashboards.
- `BottomNav` — Fixed bottom navigation bar for mobile touch screens.
- `Header` — Top application banner with logo, navigation, and actions.
- `Sidebar` — Collapsible application navigation drawer.
- `Footer` — Page closing section with links, copyright, and version tag.

### D. Overlays, Dialogs & Modals (14 components)
- `Dialog` — Modal overlay trapping focus for critical interactions.
- `AlertDialog` — Destructive action confirmation dialog with high-visibility cancel.
- `Sheet` — Slide-out modal drawer anchored to viewport edge (bottom, right, left).
- `Drawer` — Mobile-optimized sliding panel with drag gesture dismissal.
- `Popover` — Floating contextual container anchored to a trigger.
- `Tooltip` — Brief advisory text revealed on fine-pointer hover or focus.
- `HoverCard` — Rich preview card revealed on link hover with intent delay.
- `Dropdown` — Floating menu triggered by button click.
- `Modal` — Generic accessible modal overlay base.
- `Backdrop` — Frosted glass dimming layer beneath modal surfaces.
- `Toast` — Non-blocking notification banner that auto-dismisses.
- `ToastRegion` — Viewport container managing toast stacking and layout.
- `Notification` — Persistent system notification banner.
- `InlineDialog` — Non-modal contextual dialog anchored in layout flow.

### E. Layout, Containers & Surfaces (18 components)
- `Card` — Elevated content card with header, body, and footer slots.
- `AspectBox` / `AspectRatio` — Geometry-preserving container (16:9, 4:3, 1:1, 21:9).
- `Collapsible` — Animated expand/collapse disclosure container.
- `Accordion` — Stacked collapsible sections with single or multi-expand mode.
- `Container` — Centered maximum-width layout wrapper.
- `Grid` — Responsive CSS grid container with token-based gaps.
- `Flex` — Flexbox layout wrapper supporting row, column, and wraps.
- `Stack` — Vertical or horizontal layout stack with uniform spacing.
- `Group` — Visual grouping container with merged child borders.
- `Box` — Fundamental polymorphic layout element.
- `Divider` — Subtle horizontal or vertical separating line.
- `Separator` — Accessible semantic separator with `role="separator"`.
- `ScrollArea` — Custom stylized scroll container with auto-hiding scrollbars.
- `Spacer` — Dedicated structural spacing block.
- `SplitPane` — Resizable dual-pane container with draggable divider.
- `Center` — Centering container aligning children along both axes.
- `Surface` — Material elevation layer supporting frosted glass translucency.
- `Section` — Major thematic content band with semantic `<section>` tag.

### F. Feedback & Status Indicators (15 components)
- `Badge` — Compact indicator capsule for tags, counts, and statuses.
- `Tag` — Interactive, dismissible categorization chip.
- `Callout` — Apple HIG banner (`info`, `tip`, `warning`) with icon and body.
- `Alert` — Prominent inline alert banner with status styling.
- `StatusDot` — Minimal circular indicator dot paired with descriptive label.
- `Progress` — Linear progress bar supporting determinate and indeterminate modes.
- `CircularProgress` — Circular loading ring with percent readout.
- `Spinner` — Animated harmonic loading indicator.
- `Skeleton` — Shimmering placeholder box reserving geometry during data loads.
- `EmptyState` — Illustrated placeholder container when zero data is available.
- `InlineMessage` — Compact status notice placed beside input fields.
- `Meter` — Scalar value display within a known range.
- `Result` — Full-page outcome presentation (success, 404, 500 error).
- `Indicator` — Floating notification badge anchored to avatars or icons.
- `Banner` — Top-of-page global announcement banner.

### G. Data Display & Typography (14 components)
- `Table` — Semantic HTML data table with striped and bordered variants.
- `DataGrid` — Advanced virtualized tabular grid with sorting and filtering.
- `Stat` — Metric tile with large numeral, trend badge, and label.
- `Avatar` — Circular user picture with fallback initials and status dot.
- `AvatarGroup` — Overlapping cluster of user avatars with overflow count.
- `Timeline` — Chronological vertical event sequence with milestone markers.
- `DescriptionList` — Semantic `<dl>`, `<dt>`, `<dd>` metadata key-value list.
- `Code` — Inline monospaced code span.
- `CodeBlock` — Syntax-highlighted code container with copy button.
- `Heading` — Accessible heading tag (`h1`–`h6`) with token typography.
- `Text` — Polymorphic body text component with size and color variants.
- `Quote` — Stylized blockquote with citation attribute.
- `RelativeTime` — Live relative timestamp ("5 minutes ago") with hydration safety.
- `List` — Accessible ordered and unordered list container.

### H. Media & Special Effects (10 components)
- `Image` — Responsive image with lazy loading, retry state, and geometry reservation.
- `Carousel` — Native scroll-snap slider with previous/next controls and dots.
- `ProgressiveBlur` — Apple-style gradual gradient backdrop blur filter.
- `BeforeAfter` — Interactive comparison slider between two layered images.
- `Shimmer` — Radiant animated loading effect.
- `Video` — Accessible video player shell with custom controls.
- `Audio` — Accessible audio player container.
- `Marquee` — Smooth scrolling announcement ticker.
- `Canvas` — Drawing or visual animation surface.
- `Watermark` — Subtle background authenticity pattern.

---

## 3. Maturity Criteria & Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│   ALPHA  ──►  BETA (Current: All 127)  ──►  RELEASE CANDIDATE  ──►  STABLE│
│                                                                        │
│   Alpha: In-development API; breaking changes expected.               │
│   Beta: API locked; full typecheck, unit tests, E2E passing.          │
│   RC: Manual multi-device assistive technology audits complete.        │
│   Stable: Production-proven across commercial applications.            │
└────────────────────────────────────────────────────────────────────────┘
```

- **Current Milestone:** All 127 components are verified `beta`.
- **Next Milestone (RC):** Complete physical assistive technology validation with native screen reader users on macOS (VoiceOver), iOS (Mobile Safari), Windows (NVDA), and Android (TalkBack).
