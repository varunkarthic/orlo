import { useState, useMemo, useRef, useEffect, type ReactNode } from "react";
import {
  Button,
  AsyncButton,
  ButtonGroup,
  IconButton,
  TextField,
  TextArea,
  NumberField,
  PinInput,
  Slider,
  RangeSlider,
  Switch,
  Checkbox,
  RadioGroup,
  Badge,
  Card,
  StatCard,
  Chip,
  Avatar,
  PieChart,
  Progress,
  Spinner,
  SegmentedControl,
  ColorPicker,
  CodeBlock,
  Stack,
  Icons,
  OrloProvider,
  useToast,
} from "@orlo/react";
import { createTheme, contrast, semantic, themeToCss } from "@orlo/tokens";

export type Density = "comfortable" | "compact" | "touch";

export type StudioComponentType =
  | "button"
  | "async-button"
  | "text-field"
  | "text-area"
  | "number-field"
  | "pin-input"
  | "slider"
  | "range-slider"
  | "switch"
  | "badge"
  | "stat-card"
  | "chip"
  | "pie-chart"
  | "progress";

export type StudioItem = {
  id: string;
  type: StudioComponentType;
  props: Record<string, any>;
  x: number;
  y: number;
};

const DEFAULT_ITEMS: StudioItem[] = [
  {
    id: "btn-1",
    type: "button",
    props: { label: "Confirm deployment", variant: "solid", size: "md" },
    x: 40,
    y: 40,
  },
  {
    id: "field-1",
    type: "text-field",
    props: { label: "Workspace name", placeholder: "e.g. Acme Production", help: "Visible to all project members." },
    x: 40,
    y: 110,
  },
  {
    id: "stat-1",
    type: "stat-card",
    props: { label: "Monthly active seats", value: "2,410", delta: 12.4, deltaLabel: "vs last month" },
    x: 340,
    y: 40,
  },
  {
    id: "badge-1",
    type: "badge",
    props: { label: "Production", tone: "accent" },
    x: 40,
    y: 210,
  },
];

const COMPONENT_PALETTE: { type: StudioComponentType; name: string; category: string; defaultProps: Record<string, any> }[] = [
  { type: "button", name: "Button", category: "Actions", defaultProps: { label: "Submit", variant: "solid", size: "md" } },
  { type: "async-button", name: "Async Button", category: "Actions", defaultProps: { label: "Save changes", timeoutMs: 1500 } },
  { type: "text-field", name: "Text Field", category: "Forms", defaultProps: { label: "Email address", placeholder: "alex@company.com" } },
  { type: "text-area", name: "Text Area", category: "Forms", defaultProps: { label: "Feedback", placeholder: "Write your thoughts...", resize: "vertical" } },
  { type: "number-field", name: "Number Field", category: "Forms", defaultProps: { label: "Quantity", variant: "quantity", value: 1, min: 0, max: 99 } },
  { type: "pin-input", name: "PIN Input", category: "Forms", defaultProps: { label: "Verification code", length: 6, groupSize: 3 } },
  { type: "slider", name: "Slider", category: "Forms", defaultProps: { label: "Volume", orientation: "horizontal", bubble: true, defaultValue: 60 } },
  { type: "range-slider", name: "Range Slider", category: "Forms", defaultProps: { label: "Price range", orientation: "horizontal", defaultValue: [20, 80] } },
  { type: "switch", name: "Switch", category: "Forms", defaultProps: { label: "Email notifications", defaultChecked: true } },
  { type: "badge", name: "Badge", category: "Data", defaultProps: { label: "Active", tone: "success" } },
  { type: "stat-card", name: "Stat Card", category: "Data", defaultProps: { label: "API requests", value: "1.2M", delta: 8.5, deltaLabel: "vs last week" } },
  { type: "chip", name: "Chip", category: "Data", defaultProps: { label: "Design system", selected: true } },
  {
    type: "pie-chart",
    name: "Pie Chart",
    category: "Charts",
    defaultProps: {
      title: "Traffic sources",
      data: [
        { label: "Direct", value: 50 },
        { label: "Referral", value: 30 },
        { label: "Search", value: 20 },
      ],
    },
  },
  { type: "progress", name: "Progress", category: "Feedback", defaultProps: { label: "Upload progress", value: 65 } },
];

export function DesignStudio() {
  const [items, setItems] = useState<StudioItem[]>(DEFAULT_ITEMS);
  const [selectedId, setSelectedId] = useState<string | null>("btn-1");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [accent, setAccent] = useState<string>("#1F5FA8");
  const [material, setMaterial] = useState<"solid" | "glass">("solid");
  const [density, setDensity] = useState<Density>("comfortable");
  const [interactMode, setInteractMode] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [motionPreset, setMotionPreset] = useState<string>("press");
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"inspector" | "theme" | "motion" | "code">("inspector");

  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingId = useRef<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const itemStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const { toast } = useToast();

  const theme = useMemo(() => createTheme(accent), [accent]);
  const currentTokens = theme[mode];
  const canvasBg = semantic[mode].canvas;

  // Accessibility contrast ratio computations
  const fillContrast = contrast(currentTokens.accent, currentTokens["accent-fg"]);
  const textContrast = contrast(currentTokens["accent-text"], canvasBg);

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  const updateProp = (key: string, val: any) => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((item) => (item.id === selectedId ? { ...item, props: { ...item.props, [key]: val } } : item))
    );
  };

  const addItem = (paletteItem: (typeof COMPONENT_PALETTE)[number]) => {
    const newId = `${paletteItem.type}-${Date.now().toString(36)}`;
    const newItem: StudioItem = {
      id: newId,
      type: paletteItem.type,
      props: { ...paletteItem.defaultProps },
      x: 60 + (items.length % 5) * 40,
      y: 60 + (items.length % 5) * 40,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedId(newId);
    toast({ title: `Added ${paletteItem.name}`, tone: "neutral" });
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newId = `${item.type}-${Date.now().toString(36)}`;
    const cloned: StudioItem = {
      ...item,
      id: newId,
      x: item.x + 24,
      y: item.y + 24,
      props: JSON.parse(JSON.stringify(item.props)),
    };
    setItems((prev) => [...prev, cloned]);
    setSelectedId(newId);
  };

  // Pointer dragging on canvas for components in edit mode
  const handleItemPointerDown = (e: React.PointerEvent, id: string) => {
    if (interactMode) return;
    e.stopPropagation();
    setSelectedId(id);
    const item = items.find((i) => i.id === id);
    if (!item) return;
    draggingId.current = id;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    itemStartPos.current = { x: item.x, y: item.y };

    const onPointerMove = (ev: PointerEvent) => {
      if (!draggingId.current) return;
      const dx = (ev.clientX - dragStartPos.current.x) / zoom;
      const dy = (ev.clientY - dragStartPos.current.y) / zoom;
      setItems((prev) =>
        prev.map((it) =>
          it.id === draggingId.current ? { ...it, x: Math.max(0, Math.round(itemStartPos.current.x + dx)), y: Math.max(0, Math.round(itemStartPos.current.y + dy)) } : it
        )
      );
    };

    const onPointerUp = () => {
      draggingId.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // Code generation pipeline (idiomatic TypeScript + React)
  const generatedCode = useMemo(() => {
    const usedImports = new Set<string>(["OrloProvider"]);
    const elementsCode: string[] = [];

    items.forEach((item) => {
      switch (item.type) {
        case "button":
          usedImports.add("Button");
          elementsCode.push(
            `    <Button variant="${item.props.variant || "solid"}" size="${item.props.size || "md"}">\n      ${item.props.label || "Click"}\n    </Button>`
          );
          break;
        case "async-button":
          usedImports.add("AsyncButton");
          elementsCode.push(
            `    <AsyncButton action={async () => new Promise((r) => setTimeout(r, ${item.props.timeoutMs || 1500}))}>\n      ${item.props.label || "Save"}\n    </AsyncButton>`
          );
          break;
        case "text-field":
          usedImports.add("TextField");
          elementsCode.push(
            `    <TextField label="${item.props.label || "Input"}" placeholder="${item.props.placeholder || ""}" help="${item.props.help || ""}" />`
          );
          break;
        case "text-area":
          usedImports.add("TextArea");
          elementsCode.push(
            `    <TextArea label="${item.props.label || "Text"}" placeholder="${item.props.placeholder || ""}" resize="${item.props.resize || "vertical"}" />`
          );
          break;
        case "number-field":
          usedImports.add("NumberField");
          elementsCode.push(
            `    <NumberField label="${item.props.label || "Number"}" variant="${item.props.variant || "quantity"}" value={${item.props.value ?? 1}} min={${item.props.min ?? 0}} max={${item.props.max ?? 100}} />`
          );
          break;
        case "pin-input":
          usedImports.add("PinInput");
          elementsCode.push(
            `    <PinInput label="${item.props.label || "Code"}" length={${item.props.length || 6}} groupSize={${item.props.groupSize || 3}} />`
          );
          break;
        case "slider":
          usedImports.add("Slider");
          elementsCode.push(
            `    <Slider label="${item.props.label || "Level"}" orientation="${item.props.orientation || "horizontal"}" bubble={${item.props.bubble ?? true}} defaultValue={${item.props.defaultValue ?? 50}} />`
          );
          break;
        case "range-slider":
          usedImports.add("RangeSlider");
          elementsCode.push(
            `    <RangeSlider label="${item.props.label || "Range"}" orientation="${item.props.orientation || "horizontal"}" defaultValue={[${item.props.defaultValue?.[0] ?? 20}, ${item.props.defaultValue?.[1] ?? 80}]} />`
          );
          break;
        case "switch":
          usedImports.add("Switch");
          elementsCode.push(
            `    <Switch label="${item.props.label || "Setting"}" defaultChecked={${!!item.props.defaultChecked}} />`
          );
          break;
        case "badge":
          usedImports.add("Badge");
          elementsCode.push(
            `    <Badge tone="${item.props.tone || "accent"}">${item.props.label || "Badge"}</Badge>`
          );
          break;
        case "stat-card":
          usedImports.add("StatCard");
          elementsCode.push(
            `    <StatCard label="${item.props.label || "Metric"}" value="${item.props.value || "0"}" delta={${item.props.delta ?? 0}} deltaLabel="${item.props.deltaLabel || ""}" />`
          );
          break;
        case "chip":
          usedImports.add("Chip");
          elementsCode.push(
            `    <Chip selected={${!!item.props.selected}}>${item.props.label || "Tag"}</Chip>`
          );
          break;
        case "pie-chart":
          usedImports.add("PieChart");
          elementsCode.push(
            `    <PieChart title="${item.props.title || "Chart"}" data={${JSON.stringify(item.props.data || [])}} />`
          );
          break;
        case "progress":
          usedImports.add("Progress");
          elementsCode.push(
            `    <Progress label="${item.props.label || "Progress"}" value={${item.props.value ?? 50}} />`
          );
          break;
      }
    });

    return `import { ${Array.from(usedImports).sort().join(", ")} } from "@orlo/react";\nimport { createTheme, themeToCss } from "@orlo/tokens";\n\n// Custom semantic theme generated from Design Studio\nconst brandTheme = createTheme("${accent}");\nconst themeCss = themeToCss(brandTheme, ":root");\n\nexport function GeneratedView() {\n  return (\n    <OrloProvider theme="${mode}" material="${material}" density="${density}">\n      <div style={{ display: "grid", gap: "1.5rem", padding: "1.5rem", maxWidth: "48rem" }}>\n${elementsCode.join("\n\n")}\n      </div>\n    </OrloProvider>\n  );\n}\n`;
  }, [items, accent, mode, material, density]);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({ title: "Code copied to clipboard", tone: "success" });
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: "text/typescript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "OrloScreen.tsx";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded OrloScreen.tsx", tone: "success" });
  };

  const renderComponent = (item: StudioItem) => {
    switch (item.type) {
      case "button":
        return <Button variant={item.props.variant} size={item.props.size}>{item.props.label}</Button>;
      case "async-button":
        return (
          <AsyncButton action={async () => new Promise((r) => setTimeout(r, item.props.timeoutMs || 1500))}>
            {item.props.label}
          </AsyncButton>
        );
      case "text-field":
        return <TextField label={item.props.label} placeholder={item.props.placeholder} help={item.props.help} />;
      case "text-area":
        return <TextArea label={item.props.label} placeholder={item.props.placeholder} resize={item.props.resize} />;
      case "number-field":
        return (
          <NumberField
            label={item.props.label}
            variant={item.props.variant}
            value={item.props.value}
            min={item.props.min}
            max={item.props.max}
            onValueChange={(v) => updateProp("value", v)}
          />
        );
      case "pin-input":
        return <PinInput label={item.props.label} length={item.props.length} groupSize={item.props.groupSize} />;
      case "slider":
        return (
          <Slider
            label={item.props.label}
            orientation={item.props.orientation}
            bubble={item.props.bubble ?? true}
            defaultValue={item.props.defaultValue}
          />
        );
      case "range-slider":
        return (
          <RangeSlider
            label={item.props.label}
            orientation={item.props.orientation}
            defaultValue={item.props.defaultValue}
          />
        );
      case "switch":
        return <Switch label={item.props.label} defaultChecked={item.props.defaultChecked} />;
      case "badge":
        return <Badge tone={item.props.tone}>{item.props.label}</Badge>;
      case "stat-card":
        return (
          <div style={{ inlineSize: "16rem" }}>
            <StatCard label={item.props.label} value={item.props.value} delta={item.props.delta} deltaLabel={item.props.deltaLabel} />
          </div>
        );
      case "chip":
        return <Chip selected={item.props.selected}>{item.props.label}</Chip>;
      case "pie-chart":
        return (
          <div style={{ inlineSize: "20rem" }}>
            <PieChart title={item.props.title} data={item.props.data} />
          </div>
        );
      case "progress":
        return (
          <div style={{ inlineSize: "16rem" }}>
            <Progress label={item.props.label} value={item.props.value} />
          </div>
        );
      default:
        return <div>{item.type}</div>;
    }
  };

  return (
    <div className="wide design-studio">
      <header className="design-studio__header">
        <div>
          <h1 className="design-studio__title">Design Studio</h1>
          <p className="design-studio__lead">
            Visual workspace for composing, customizing, and exporting Orlo interfaces.
          </p>
        </div>
        <div className="design-studio__top-actions">
          <SegmentedControl
            label="Canvas mode"
            size="sm"
            value={interactMode ? "test" : "edit"}
            onValueChange={(v) => setInteractMode(v === "test")}
            options={[
              { value: "edit", label: "Select / Edit" },
              { value: "test", label: "Interact / Test" },
            ]}
          />
          <ButtonGroup label="Zoom controls">
            <IconButton label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
              <Icons.Minus size={16} />
            </IconButton>
            <Button variant="ghost" onClick={() => setZoom(1)}>
              {Math.round(zoom * 100)}%
            </Button>
            <IconButton label="Zoom in" onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}>
              <Icons.Plus size={16} />
            </IconButton>
          </ButtonGroup>
          <Button variant="subtle" size="sm" onClick={() => setActiveTab("code")}>
            <Icons.Code size={16} />
            <span>Export code</span>
          </Button>
        </div>
      </header>

      <div className="design-studio__workspace">
        {/* Left Palette */}
        <aside className="design-studio__palette" aria-label="Component Library">
          <div className="design-studio__palette-title">Palette</div>
          <div className="design-studio__palette-list">
            {COMPONENT_PALETTE.map((comp) => (
              <button
                key={comp.type}
                type="button"
                className="design-studio__palette-item"
                onClick={() => addItem(comp)}
              >
                <span className="design-studio__palette-name">{comp.name}</span>
                <span className="orlo-hint" style={{ fontSize: "var(--orlo-text-xs)" }}>{comp.category}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Center Canvas */}
        <div className="design-studio__canvas-wrapper" ref={canvasRef}>
          <div
            className="design-studio__canvas"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              background: canvasBg,
            }}
          >
            <OrloProvider theme={mode} material={material} density={density} motion={reducedMotion ? "off" : undefined}>
              {items.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`design-studio__node ${isSelected && !interactMode ? "design-studio__node--selected" : ""}`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      cursor: interactMode ? "default" : "grab",
                    }}
                    onPointerDown={(e) => handleItemPointerDown(e, item.id)}
                  >
                    {renderComponent(item)}
                    {!interactMode && isSelected && (
                      <div className="design-studio__node-tools">
                        <button
                          type="button"
                          className="design-studio__node-action"
                          onClick={() => duplicateItem(item.id)}
                          aria-label="Duplicate component"
                        >
                          <Icons.Copy size={13} />
                        </button>
                        <button
                          type="button"
                          className="design-studio__node-action design-studio__node-action--danger"
                          onClick={() => deleteItem(item.id)}
                          aria-label="Delete component"
                        >
                          <Icons.Trash size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </OrloProvider>
          </div>
        </div>

        {/* Right Inspector & Tools */}
        <aside className="design-studio__inspector" aria-label="Inspector and settings">
          <SegmentedControl
            label="Inspector sections"
            size="sm"
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            options={[
              { value: "inspector", label: "Props" },
              { value: "theme", label: "Theme" },
              { value: "motion", label: "Motion" },
              { value: "code", label: "Code" },
            ]}
          />

          {activeTab === "inspector" && (
            <div className="design-studio__panel">
              {selectedItem ? (
                <>
                  <div className="design-studio__section-title">
                    <span>{selectedItem.type.replace("-", " ").toUpperCase()}</span>
                    <button
                      type="button"
                      className="orlo-button"
                      data-variant="danger"
                      data-size="sm"
                      onClick={() => deleteItem(selectedItem.id)}
                    >
                      Delete
                    </button>
                  </div>

                  {"label" in selectedItem.props && (
                    <TextField
                      label="Label"
                      value={selectedItem.props.label || ""}
                      onChange={(e) => updateProp("label", e.target.value)}
                    />
                  )}

                  {"variant" in selectedItem.props && (
                    <SegmentedControl
                      label="Variant"
                      size="sm"
                      value={selectedItem.props.variant || "solid"}
                      onValueChange={(v) => updateProp("variant", v)}
                      options={[
                        { value: "solid", label: "Solid" },
                        { value: "subtle", label: "Subtle" },
                        { value: "ghost", label: "Ghost" },
                        { value: "danger", label: "Danger" },
                      ]}
                    />
                  )}

                  {"size" in selectedItem.props && (
                    <SegmentedControl
                      label="Size"
                      size="sm"
                      value={selectedItem.props.size || "md"}
                      onValueChange={(v) => updateProp("size", v)}
                      options={[
                        { value: "sm", label: "Sm" },
                        { value: "md", label: "Md" },
                        { value: "lg", label: "Lg" },
                      ]}
                    />
                  )}

                  {selectedItem.type === "pin-input" && (
                    <>
                      <Slider
                        label="Digits length"
                        min={3}
                        max={16}
                        step={1}
                        value={selectedItem.props.length || 6}
                        onValueChange={(v) => updateProp("length", v)}
                      />
                      <SegmentedControl
                        label="Group separators"
                        size="sm"
                        value={String(selectedItem.props.groupSize || 0)}
                        onValueChange={(v) => updateProp("groupSize", Number(v))}
                        options={[
                          { value: "0", label: "None" },
                          { value: "3", label: "3" },
                          { value: "4", label: "4" },
                        ]}
                      />
                    </>
                  )}

                  {(selectedItem.type === "slider" || selectedItem.type === "range-slider") && (
                    <>
                      <SegmentedControl
                        label="Orientation"
                        size="sm"
                        value={selectedItem.props.orientation || "horizontal"}
                        onValueChange={(v) => updateProp("orientation", v)}
                        options={[
                          { value: "horizontal", label: "Horizontal" },
                          { value: "vertical", label: "Vertical" },
                        ]}
                      />
                      <Switch
                        label="Show value indicator"
                        checked={!!selectedItem.props.showValue}
                        onCheckedChange={(c) => updateProp("showValue", c)}
                      />
                    </>
                  )}

                  {selectedItem.type === "text-area" && (
                    <SegmentedControl
                      label="Resize locks"
                      size="sm"
                      value={selectedItem.props.resize || "vertical"}
                      onValueChange={(v) => updateProp("resize", v)}
                      options={[
                        { value: "both", label: "Both" },
                        { value: "vertical", label: "Vertical" },
                        { value: "horizontal", label: "Horizontal" },
                        { value: "none", label: "None" },
                      ]}
                    />
                  )}
                </>
              ) : (
                <p className="orlo-hint">Click a component on the canvas to configure its props.</p>
              )}
            </div>
          )}

          {activeTab === "theme" && (
            <div className="design-studio__panel">
              <ColorPicker
                label="Accent color"
                value={accent}
                onValueChange={setAccent}
                swatches={["#1F5FA8", "#7C3AED", "#16A34A", "#E11D48", "#0284C7", "#D97706"]}
              />

              <SegmentedControl
                label="Theme mode"
                size="sm"
                value={mode}
                onValueChange={(v) => setMode(v as any)}
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
              />

              <SegmentedControl
                label="Material"
                size="sm"
                value={material}
                onValueChange={(v) => setMaterial(v as any)}
                options={[
                  { value: "solid", label: "Solid" },
                  { value: "glass", label: "Glass" },
                ]}
              />

              <SegmentedControl
                label="Density"
                size="sm"
                value={density}
                onValueChange={(v) => setDensity(v as any)}
                options={[
                  { value: "compact", label: "Compact" },
                  { value: "comfortable", label: "Default" },
                  { value: "touch", label: "Touch" },
                ]}
              />

              <div className="design-studio__contrast-box">
                <div className="design-studio__contrast-row">
                  <span>Accent fill vs text</span>
                  <strong>{fillContrast.toFixed(2)}:1</strong>
                </div>
                <div className="design-studio__contrast-row">
                  <span>Accent text vs canvas</span>
                  <strong>{textContrast.toFixed(2)}:1</strong>
                </div>
                <Badge
                  tone={fillContrast >= 4.5 && textContrast >= 4.5 ? "success" : "warning"}
                >
                  {fillContrast >= 4.5 && textContrast >= 4.5 ? "Passes WCAG AA" : "Adjust lightness for AA"}
                </Badge>
              </div>
            </div>
          )}

          {activeTab === "motion" && (
            <div className="design-studio__panel">
              <SegmentedControl
                label="Motion preset"
                size="sm"
                value={motionPreset}
                onValueChange={setMotionPreset}
                options={[
                  { value: "press", label: "Press" },
                  { value: "release", label: "Release" },
                  { value: "shift", label: "Shift" },
                  { value: "snap", label: "Snap" },
                  { value: "settle", label: "Settle" },
                ]}
              />
              <Switch
                label="Simulate reduced motion"
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
              />
              <p className="orlo-hint">
                Orlo motion is physics-driven and interruptible. Durations are never hardcoded.
              </p>
            </div>
          )}

          {activeTab === "code" && (
            <div className="design-studio__panel">
              <Stack direction="row" gap={2}>
                <Button variant="solid" size="sm" onClick={copyCode}>
                  <Icons.Copy size={15} />
                  <span>Copy React code</span>
                </Button>
                <Button variant="subtle" size="sm" onClick={downloadCode}>
                  <Icons.Download size={15} />
                  <span>Download .tsx</span>
                </Button>
              </Stack>
              <div style={{ marginBlockStart: "1rem" }}>
                <CodeBlock title="GeneratedScreen.tsx" code={generatedCode} language="tsx" />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
