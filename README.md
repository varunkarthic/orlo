<p align="center">
  <img src="assets/brand/orlo-wordmark-black.svg#gh-light-mode-only" alt="Orlo" height="72">
  <img src="assets/brand/orlo-wordmark-white.svg#gh-dark-mode-only" alt="Orlo" height="72">
</p>

<p align="center"><strong>Design the parts between the moments.</strong><br>An open-source design framework for React by Varun Karthic.</p>

<p align="center"><a href="https://orlo-react.readthedocs.io/en/latest/">Documentation</a> · <a href="https://orlo-react.readthedocs.io/en/latest/components/">Components</a> · <a href="https://orlo-react.readthedocs.io/en/latest/brand/badges/">Embed badges</a> · <a href="https://github.com/varunkarthic/orlo/blob/main/LICENSE">MIT License</a></p>

Orlo is built on the idea that an interface is shaped as much by what happens *between* moments as by what appears on screen. The press, the interrupted transition, the image that never arrives, and the focus that has to come back are all part of the design.

The name is Italian for an edge, rim or hem (pronounced **OR-loh**). A hem is the finish that holds the whole together, even when nobody notices it.

> **Status: beta, pre-release.** The current manifest documents 131 components in [`components.json`](components.json). Coverage and maturity vary by component; the catalogue records both. Orlo is not published to npm, and automated checks are not a substitute for manual assistive-technology review.

**Start here:** [getting started](https://orlo-react.readthedocs.io/en/latest/start/) · [browse components](https://orlo-react.readthedocs.io/en/latest/components/) · [learn the design language](https://orlo-react.readthedocs.io/en/latest/foundations/) · [spacing & layout guidelines](https://orlo-react.readthedocs.io/en/latest/styles/spacing/) · [read the lifecycle guide](https://orlo-react.readthedocs.io/en/latest/foundations/lifecycle/)

## Why Orlo

**One system, not a wrapper.** Components share Orlo's tokens, motion presets, positioning, focus, and layer primitives. React and React DOM are peer dependencies; the workspace also depends on [Motion](https://motion.dev). See each package manifest for the exact dependency contract.

**Finished edges.** The Details Lab puts careless behaviour beside deliberate behaviour: half-clipped text under a growing card, focus sent to a trigger that no longer exists, and repeated-click races.

<img src="docs/media/details-lab.png" alt="Details Lab: a flawed card slicing through text beside Orlo's version with a scrim" width="800">

**One motion grammar.** Components ask for a purpose (`press`, `reveal`, `overlay`, `shared`) and Orlo supplies an interruptible spring. Reduced motion replaces travel with a fade; `off` makes changes instant.

**A shared spatial grammar.** Orlo uses an 8pt rhythm with a 4pt subgrid (`--orlo-space-*`, `--orlo-gap-*`), semantic corner radii, and explicit control and touch-target guidance. The [design rules](ORLO_DESIGN_RULES.md) describe the intended system; individual surfaces are still being audited against it.

**A lifecycle, not a resting frame.** Every component page now carries the same behavioural contract: stable entry, equivalent input acknowledgement, meaningful change, clear resolution, interruption and safe recovery. The [Lifecycle & composition guide](apps/docs/src/pages/FoundationsPages.tsx) defines how overlays, fields, asynchronous actions and nested surfaces hand off focus, layers, state and failure.

**Failure is designed.** Images reserve their space before loading, decode before they appear, retry a limited number of times and fall back to a designed placeholder. `images="off"` makes every managed image a placeholder and stops all image requests.

**Accessibility lives in behaviour.** Orlo includes keyboard and focus handling for menus, tabs, trees, grids, comboboxes, sliders, and overlays. Automated tests cover selected interactions and pages; manual screen-reader and cross-browser review remain necessary.

**Locale-aware.** The calendar's week start, digits and names come from `Intl`. Number fields parse "1.234,5" in German. Arrow keys and layouts mirror in right-to-left text. The tag input, combobox and command palette ignore keystrokes during IME composition.

## The catalogue

| Family | Components |
|---|---|
| Actions | Button, IconButton, CopyButton, SegmentedControl, ToggleButton, ToggleGroup, SplitButton, Fab, SpeedDial |
| Forms | TextField, TextArea, Select, Checkbox, RadioGroup, Switch, Slider, PasswordField, NumberField, SearchField, Combobox, TagInput, PinInput, RadioCards, RangeSlider, Rating |
| Pickers | Calendar, DatePicker, DateRangePicker, TimeField, ColorPicker, FileDropzone |
| Navigation | Tabs (line & pill variants), Menu, CommandPalette, Breadcrumbs, Pagination, NavigationRail, BottomNavigation, Steps, TableOfContents |
| Overlays | Dialog, AlertDialog, Sheet, Popover, Tooltip, Toast, ContextMenu, HoverCard, Tour |
| Disclosure & layout | Accordion, Collapsible, TreeView, ReadMore, Card, Stack, Divider, Splitter, ScrollArea, AspectRatio |
| Data display | Badge, StatusDot, Avatar, Table, AnimatedNumber, Kbd, Chip, DataList, Timeline, Sparkline, Meter, Highlight, RelativeTime |
| Feedback | Alert, Callout, Progress, Spinner, Skeleton, EmptyState, Banner, OfflineIndicator, ProgressRing |
| Media | OrloImage, Carousel, BeforeAfter, Lightbox |
| Specialty | Knob, HoldToConfirm, SignaturePad, ShortcutRecorder, ReorderableList, Heatmap, JsonTree, DiffViewer, CodeBlock, Countdown, Marquee, BuiltWithOrlo |

The machine-readable list is [`components.json`](components.json).

## Embeddable badges

Want to credit Orlo in a project footer or README? The optional [`BuiltWithOrlo` badge](https://orlo-react.readthedocs.io/en/latest/brand/badges/) comes in four fixed identity tones, three sizes, and signature, compact, or inline layouts. The signature shows “Open-source design framework for React” and “by Varun Karthic.” The Brand guide includes live previews, copyable React and HTML embeds, and self-contained SVG downloads for non-React sites. No badge is required by the MIT License.

## Explore the documentation

The [component reference](https://orlo-react.readthedocs.io/en/latest/components/) separates live examples, specifications, guidelines, accessibility, and code. [Foundations](https://orlo-react.readthedocs.io/en/latest/foundations/) explains interaction lifecycles and composition; the [motion lab](https://orlo-react.readthedocs.io/en/latest/styles/motion/) and [device lab](https://orlo-react.readthedocs.io/en/latest/develop/devices/) make behaviour easier to inspect. The [Design Studio](https://orlo-react.readthedocs.io/en/latest/design-studio/) is an experimental visual workspace, not a replacement for testing exported code in an application. Routes are statically prerendered for Read the Docs ([`.readthedocs.yaml`](.readthedocs.yaml)).

## Run it locally

Orlo is not on npm yet. From a clone:

```bash
npm install
npm run dev          # docs + live demos at http://localhost:5173
npm run typecheck
npm test             # unit and component tests
npm run build:rtd    # static site -> apps/docs/dist
npm run e2e          # Playwright + axe against the built site
```

```tsx
import { OrloProvider, Button, Dialog, TextField, useToast } from "@orlo/react";
import "@orlo/tokens/css";
import "@orlo/react/styles.css";

export function App() {
  return (
    <OrloProvider theme="system" motion="system" images="on">
      <Dialog title="Rename project" trigger={<Button>Rename…</Button>}
        footer={(close) => <Button onClick={close}>Save</Button>}>
        <TextField label="Project name" />
      </Dialog>
    </OrloProvider>
  );
}
```

To theme Orlo from a single colour:

```ts
import { createTheme, themeToCss } from "@orlo/tokens";
const css = themeToCss(createTheme("#1F5FA8"), ":root");
```

## Repository

```
packages/tokens   design tokens -> CSS custom properties, contrast + theme generator
packages/motion   spring presets, metrics, reduced-motion policy (wraps Motion)
packages/react    components, provider, positioning, focus and layer primitives, icons
apps/docs         prerendered documentation (Read the Docs custom build)
assets/brand      logo SVGs and PNG/ICO exports
docs/             Human Interface Guidelines, spatial systems, research notes, decisions, status
e2e/              Playwright + axe tests
```

## Verification and limits

Run `npm run typecheck && npm test && npm run build:rtd && npm run e2e` before proposing a change. Playwright includes selected axe checks; this does **not** establish site-wide accessibility conformance. Manual screen-reader, device, and cross-browser review remain open. Current evidence and unresolved work are tracked in the [implementation ledger](docs/IMPLEMENTATION_LEDGER.md); normative design guidance is in [`docs/README.md`](docs/README.md) and [`docs/guidelines/`](docs/guidelines/).

## Credits

Orlo studies established interface guidance while developing its own visual and interaction language. It is **not affiliated with Apple, Google, Framer or any other vendor**. Sources and licences are listed in [`docs/research/`](docs/research).

Agents should read [AGENTS.md](AGENTS.md) and [ORLO_DESIGN_RULES.md](ORLO_DESIGN_RULES.md). Licensed under the [MIT License](LICENSE).
