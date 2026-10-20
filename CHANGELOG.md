# Changelog

## Unreleased

### Master Implementation (October 2026)
- **Foundations & Core Fixes:**
  - `gesture.ts`: Added logarithmic `elasticResistance` (`log1p` model) for natural bounded overdrag physics.
  - `icon-defs.ts`: Upgraded Settings gear icon with precise 6-cog geometry and circular inner bore.
  - `Overlays2.tsx`: Pre-clamped `ContextMenu` coordinates to prevent top-left viewport offset.
  - `Media2.tsx`: Prevented `Carousel` page scroll using `track.current.scrollTo`.
  - `AI.tsx`: Synchronized `ToolRun` collapse padding and height transitions.
  - `Charts.tsx`: Synchronized animated clipPath for `LineChart` multi-series paths.
  - `ProgressiveBlur.tsx`: Eliminated hard visible seam with smooth gradient opacity tapering.
  - `Slider.tsx` & `RangeSlider.tsx`: Corrected accessibility name computation when `hideLabel` is active (`aria-label` directly on thumb).

- **Documentation Refinements:**
  - `App.tsx`: Wired `sessionStorage` scroll restoration on sidebar navigation.
  - `docs.css`: Spaced wordmark from nav, shrunk `.import` copy button, bounded settings panel.
  - `ComponentDocs.tsx`: Removed promotional badges (`Beta`, `Multi-platform`, `M3 Expressive`) while retaining Source links.
  - `Home.tsx`: Replaced marketing claims with verified counts (`manifest.length`, `families.length`, WCAG 2.2 AA).
  - `Start.tsx`: Upgraded `About()` with a positive design philosophy.

- **Component Refinements:**
  - `TextArea.tsx`: Added `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, and `resize` locks with logical properties.
  - `TagInput.tsx`: Wrapped chips in `AnimatePresence mode="popLayout"` with smooth container layout shifts.
  - `PinInput.tsx`: Supported 1–16 digits, `groupSize` separators, responsive sizing, and `clearStaleError()`.
  - `NumberField.tsx`: Added `quantity` picker variant (morphing "Add" $\leftrightarrow$ `[-] count [+]`) and `stepper` toggle.
  - `PasswordField.tsx`: Coordinated visual field dissolve reveal.
  - `RangeSlider.tsx`: Added `orientation="vertical"` and `allowCrossing` policy.
  - `Actions.tsx` & `extended.css`: Fixed SplitButton corner seams (matching `border-radius: var(--orlo-radius-md)`) and added `size="sm" | "md" | "lg"`.
  - `Calendar.tsx` & `extended.css`: Added provisional range hover preview and distinct `today` outline/ring. Added `allowInput` text entry mode with locale-aware parsing and popover sync to `DatePicker`.
  - `Dialog.tsx` & `styles.css`: Added `side="top"` top sheet and `centered` desktop partial-width bottom sheet.
  - `actions.tsx`: Built live `SegmentedViewDemo` with interactive List, Grid, and Board layouts.
  - `Charts.tsx` & `index.ts`: Exported `PieChart`, added `variant="pie"` and `innerRadius` to `DonutChart`.
  - `Data2.tsx`: Fixed `Sparkline` path scaling, margins, trend title, and regex safety. Updated `RelativeTime` to viewer's local timezone.
  - `extended.css`: Changed `.orlo-reltime` cursor from `help` to `default`.
  - `SignaturePad.tsx` & `specialty.tsx`: Removed "Type instead" and preserved pure high-DPI drawing/undo/clear. Guarded canvas 2D context in `SignaturePad.tsx` for jsdom/headless resilience.
  - `Media3.tsx` & `extended2.css`: Added speed toggle to `VideoPlayer`. Added Orlo-owned controls (paging, zoom, rotate, print, viewport scale) to `DocumentViewer`.
  - `Rating.tsx`: Added `size="sm" | "md" | "lg"` and custom `icon` render callback `(active: boolean) => ReactNode`.
  - `CommandPalette.tsx`: Extended `Command` item schema with `icon?: ReactNode` and `shortcut?: string` (rendered with styled `<kbd>`).
  - `Overlays2.tsx`: Updated `Tour` spotlight cutout geometry to dynamically query and animate to the target element's computed `borderRadius`.
  - `Wizard.tsx`: Added multistep form wizard with typed step schema, step validation, back/next navigation, draft state, async submit/retry, and accessible error summary.
  - `FilterBuilder.tsx`: Added multi-condition query filter builder with typed fields, comparison operators, AND/OR conjunction toggles, and live summary.
  - `FeatureMatrix.tsx`: Added feature comparison matrix and pricing table with category grouping, highlighted tiers, and accessible check/en-dash indications.
  - `OtpVerification.tsx`: Added complete OTP verification flow assembly with PIN input, live resend cooldown timer, delivery target display, and stale error clearance.

- **Generalized Drag-and-Drop Primitives (`@orlo/react`):**
  - Implemented `DndContext`, `useDraggable`, `useDroppable`, `useSortable`, `SortableContext`, `DragOverlay` (spring physics via `transition("drag")`), and `DropIndicator`.
  - Collision strategies: `rectIntersection` and `closestCenter`.
  - Modifiers: `restrictToVerticalAxis`, `restrictToHorizontalAxis`, `snapToGrid`, and `boundedElastic`.
  - Full keyboard accessibility (Space/Enter pick-up, Arrow keys translation, Escape cancellation).
  - XY drag tracking in `ReorderableList` and `Kanban` (with column capacity limits and screen-reader announcements).

- **Design Studio Workspace (`@orlo/docs`):**
  - Introduced full visual workspace at `/design-studio/` replacing Theme Studio.
  - Interactive component palette across core, forms, feedback, pickers, and workspace components.
  - Infinite-style pan/zoom canvas (50% to 180%) with Select/Edit mode and live Interact/Test mode.
  - Live TypeScript property inspector with real-time prop mutations and layout reordering.
  - Real-time WCAG 2.2 AA contrast ratio calculator with guardrails.
  - Motion inspector with spring physics tuning (`tension`, `friction`, `mass`, presets).
  - Portable, idiomatic React + TypeScript code generator importing purely from `@orlo/react` and `@orlo/tokens` with Copy and Download `.tsx`.

### v3 "quiet precision" redesign (in progress, not released)
- **Breaking:** the tinted-glass material is removed. `Material` is now `"solid" | "glass"`; the `tint` provider prop and the `tintStrength` glass option are gone.
- **Breaking:** `Button variant="solid"` is now an ink (foreground) fill. The new `variant="accent"` is the brand-colour fill for a single brand moment per view.
- Tokens: neutral-first surfaces (`surface-sunken`, `surface-selected`, `fg-subtle`), lighter shadows, `radius.sm` 8px, relaxed display tracking. New contrast tests cover the new roles.
- Controls: flat fills without gradients, circular icon buttons, one focus ring, press = scale(0.98) without radius change, disabled states that stay visible (never faded out), quieter skeleton.
- Forms: validation messages use a small status icon instead of a "!" prefix.
- Badge: `dot` and `count` / `max`. Avatar: deterministic generated art (`variant="marble" | "geometric" | "initials"`) that is identical on server and client.
- Fixes: the checkbox box no longer intercepts pointer events; buttons use system colours in forced-colours mode; select placeholder meets 4.5:1; empty tab panels add no padding; the slider thumb skips no-op animations.
- Docs: "Search components and guides", a circular theme button cycling Light → Dark → Auto, compact grouped Preferences with a More section, neutral navigation and TOC, no beta badges on titles, plain demo stages, a single coherent settings app on the home page, Materials (solid vs glass), a Theme Studio workshop with four scenes, and a MotionLab race that only moves dots not already at their target.
- Brand: adopted the supplied lowercase "orlo" logo as vectors, with transparent variants, favicons (SVG, ICO, PNG), PWA icons and a social card.
- Components: 91 in-house components across 11 families, including pickers (Calendar, DatePicker, TimeField, ColorPicker, FileDropzone) and specialty components (Knob, HoldToConfirm, SignaturePad, ShortcutRecorder, ReorderableList, Heatmap, JsonTree, DiffViewer, CodeBlock, Countdown, Marquee).
- Primitives: collision-aware positioning, a layer stack, focus scopes, reference-counted scroll lock and inert backgrounds.
- Tokens: `createTheme` / `themeToCss` produce AA-compliant accent roles from any colour; identity tints are tokenised.
- Docs: a Material-style information architecture with five tabs per component (490 prerendered routes), Theme Studio, MotionLab, Details Lab, State Lab, ⌘K search, `components.json` and `llms.txt`.
- Testing: Vitest (112 tests) and Playwright with axe (40 browser tests) in CI.
- Removed: CONTRIBUTING, CODE_OF_CONDUCT and SECURITY (the project doesn't accept contributions).
