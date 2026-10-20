import { useState, useMemo, useRef, useEffect, useCallback, type ReactNode } from "react";
import {
  Button,
  AsyncButton,
  ButtonGroup,
  IconButton,
  ToggleButton,
  SegmentedControl,
  ToggleGroup,
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
  Sparkline,
  Progress,
  Spinner,
  Callout,
  Rating,
  FileDropzone,
  ColorPicker,
  CodeBlock,
  Stack,
  Icons,
  OrloProvider,
  useToast,
} from "@orlo/react";
import { createTheme, contrast, semantic, themeToCss } from "@orlo/tokens";

export type Density = "comfortable" | "compact" | "touch";
export type ViewportMode = "responsive" | "desktop" | "tablet" | "mobile";
export type Orientation = "portrait" | "landscape";
export type StudioComponentType =
  | "button"
  | "async-button"
  | "button-group"
  | "icon-button"
  | "toggle-button"
  | "segmented-control"
  | "toggle-group"
  | "text-field"
  | "text-area"
  | "number-field"
  | "pin-input"
  | "slider"
  | "range-slider"
  | "switch"
  | "checkbox"
  | "radio-group"
  | "color-picker"
  | "file-dropzone"
  | "rating"
  | "badge"
  | "stat-card"
  | "chip"
  | "avatar"
  | "pie-chart"
  | "sparkline"
  | "progress"
  | "spinner"
  | "callout"
  | "card";

export type StudioItem = {
  id: string;
  type: StudioComponentType;
  props: Record<string, any>;
  x: number;
  y: number;
  zIndex: number;
};

export type MotionPhysics = {
  stiffness: number;
  damping: number;
  mass: number;
};

// Text entered in the inspector must remain literal text in copied TSX.
const jsxEntities: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
  "{": "&#123;", "}": "&#125;", "\n": "&#10;", "\r": "&#13;",
};
const escapeJsx = (value: unknown) => String(value).replace(/[&<>"{}\n\r]/g, (character) => jsxEntities[character]);
const finiteNumber = (value: unknown, fallback: number) => {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// 6 Complete Templates as specified in Master Prompt Section 5
export const STUDIO_TEMPLATES: {
  id: string;
  name: string;
  description: string;
  items: StudioItem[];
}[] = [
  {
    id: "settings-form",
    name: "Settings Form",
    description: "Account profile, avatar, credentials, vertical resize bio, and save button.",
    items: [
      {
        id: "avatar-1",
        type: "avatar",
        props: { name: "Alex Rivera", size: "lg", variant: "marble" },
        x: 40,
        y: 40,
        zIndex: 1,
      },
      {
        id: "field-name",
        type: "text-field",
        props: { label: "Full Name", placeholder: "Alex Rivera", help: "Visible on team workspace." },
        x: 40,
        y: 120,
        zIndex: 2,
      },
      {
        id: "field-email",
        type: "text-field",
        props: { label: "Work Email", placeholder: "alex@acme.dev", help: "Used for 2FA security notifications." },
        x: 340,
        y: 120,
        zIndex: 3,
      },
      {
        id: "field-bio",
        type: "text-area",
        props: {
          label: "Biography",
          placeholder: "Design systems architect leading enterprise motion.",
          resize: "vertical",
          minHeight: 80,
          maxHeight: 200,
        },
        x: 40,
        y: 220,
        zIndex: 4,
      },
      {
        id: "switch-notif",
        type: "switch",
        props: { label: "Push notifications for deployments", defaultChecked: true },
        x: 40,
        y: 350,
        zIndex: 5,
      },
      {
        id: "btn-save",
        type: "async-button",
        props: { label: "Save Profile", timeoutMs: 1400, variant: "solid" },
        x: 40,
        y: 410,
        zIndex: 6,
      },
    ],
  },
  {
    id: "analytics-kpi",
    name: "SaaS Analytics Dashboard",
    description: "KPI stat cards, traffic pie chart, live badge, and export action group.",
    items: [
      {
        id: "badge-status",
        type: "badge",
        props: { label: "Live System Health: 99.98%", tone: "success" },
        x: 40,
        y: 40,
        zIndex: 1,
      },
      {
        id: "stat-mrr",
        type: "stat-card",
        props: { label: "Monthly Recurring Revenue", value: "$48,250", delta: 14.2, deltaLabel: "vs previous month" },
        x: 40,
        y: 90,
        zIndex: 2,
      },
      {
        id: "stat-users",
        type: "stat-card",
        props: { label: "Active Workspace Members", value: "2,410", delta: 8.5, deltaLabel: "vs previous week" },
        x: 340,
        y: 90,
        zIndex: 3,
      },
      {
        id: "chart-traffic",
        type: "pie-chart",
        props: {
          title: "Traffic Acquisition Breakdown",
          data: [
            { label: "Direct", value: 48 },
            { label: "Referral", value: 32 },
            { label: "Organic Search", value: 20 },
          ],
        },
        x: 40,
        y: 260,
        zIndex: 4,
      },
      {
        id: "spark-req",
        type: "sparkline",
        props: { label: "Network IO Throughput (req/s)", data: [15, 24, 20, 38, 42, 58, 64, 82] },
        x: 340,
        y: 260,
        zIndex: 5,
      },
      {
        id: "btn-export",
        type: "button",
        props: { label: "Export Audit Ledger (.csv)", variant: "subtle", size: "sm" },
        x: 340,
        y: 390,
        zIndex: 6,
      },
    ],
  },
  {
    id: "auth-otp",
    name: "Auth & OTP Verification Modal",
    description: "Security PIN input with grouping separators, resend trigger, and async submit.",
    items: [
      {
        id: "card-auth",
        type: "card",
        props: {
          title: "Two-Factor Verification",
          description: "Enter the 6-digit confirmation code generated by your hardware key or authenticator app.",
        },
        x: 40,
        y: 40,
        zIndex: 1,
      },
      {
        id: "pin-code",
        type: "pin-input",
        props: { label: "Security PIN", length: 6, groupSize: 3, simulateError: false },
        x: 70,
        y: 160,
        zIndex: 2,
      },
      {
        id: "btn-resend",
        type: "button",
        props: { label: "Didn't receive code? Resend SMS", variant: "ghost", size: "sm" },
        x: 70,
        y: 240,
        zIndex: 3,
      },
      {
        id: "btn-verify",
        type: "async-button",
        props: { label: "Verify & Continue", timeoutMs: 1500, variant: "solid" },
        x: 70,
        y: 290,
        zIndex: 4,
      },
    ],
  },
  {
    id: "pricing-matrix",
    name: "Pricing Matrix",
    description: "Subscription tiers, seat stepper number field, and call-to-action buttons.",
    items: [
      {
        id: "card-starter",
        type: "card",
        props: { title: "Developer Starter", description: "Free forever for individual hackers and open-source." },
        x: 40,
        y: 40,
        zIndex: 1,
      },
      {
        id: "chip-starter",
        type: "chip",
        props: { label: "Up to 3 Projects", selected: true },
        x: 70,
        y: 140,
        zIndex: 2,
      },
      {
        id: "btn-free",
        type: "button",
        props: { label: "Get Started Free", variant: "subtle", size: "md" },
        x: 70,
        y: 200,
        zIndex: 3,
      },
      {
        id: "card-pro",
        type: "card",
        props: { title: "Team Pro ($49/seat)", description: "High-concurrency cloud builds with priority SLA." },
        x: 360,
        y: 40,
        zIndex: 4,
      },
      {
        id: "stepper-seats",
        type: "number-field",
        props: { label: "Workspace Seats", variant: "quantity", value: 5, min: 1, max: 100, step: 1 },
        x: 390,
        y: 140,
        zIndex: 5,
      },
      {
        id: "btn-pro",
        type: "button",
        props: { label: "Upgrade Workspace", variant: "solid", size: "md" },
        x: 390,
        y: 220,
        zIndex: 6,
      },
    ],
  },
  {
    id: "feedback-survey",
    name: "Feedback Survey",
    description: "Interactive rating scale, category segmented control, and detailed comments.",
    items: [
      {
        id: "callout-survey",
        type: "callout",
        props: {
          title: "How was your experience?",
          message: "Your feedback directly influences Orlo's next sprint releases.",
          tone: "note",
        },
        x: 40,
        y: 40,
        zIndex: 1,
      },
      {
        id: "rating-ux",
        type: "rating",
        props: { label: "Overall System Satisfaction", max: 5, defaultValue: 5 },
        x: 40,
        y: 150,
        zIndex: 2,
      },
      {
        id: "seg-cat",
        type: "segmented-control",
        props: {
          label: "Primary Area",
          options: ["Ergonomics", "Motion Physics", "Documentation", "TypeScript APIs"],
          value: "Motion Physics",
        },
        x: 40,
        y: 220,
        zIndex: 3,
      },
      {
        id: "area-thoughts",
        type: "text-area",
        props: { label: "Specific Observations", placeholder: "What felt natural? What caused friction?", resize: "vertical" },
        x: 40,
        y: 290,
        zIndex: 4,
      },
      {
        id: "btn-submit-survey",
        type: "button",
        props: { label: "Submit Feedback", variant: "solid", size: "md" },
        x: 40,
        y: 420,
        zIndex: 5,
      },
    ],
  },
  {
    id: "file-upload-center",
    name: "File Upload Center",
    description: "File upload dropzone with 5 MB / 4 file limits, upload progress, and submit action.",
    items: [
      {
        id: "dropzone-main",
        type: "file-dropzone",
        props: {
          label: "Upload Documentation & Assets",
          accept: ".pdf,image/*",
          maxFiles: 4,
          maxSize: 5242880,
        },
        x: 40,
        y: 40,
        zIndex: 1,
      },
      {
        id: "prog-upload",
        type: "progress",
        props: { label: "Synchronizing Batch Assets", value: 68 },
        x: 40,
        y: 260,
        zIndex: 2,
      },
      {
        id: "btn-start-upload",
        type: "async-button",
        props: { label: "Process & Publish Assets", timeoutMs: 1800, variant: "solid" },
        x: 40,
        y: 330,
        zIndex: 3,
      },
    ],
  },
];

// Component Palette definition (24 distinct Orlo components)
const COMPONENT_PALETTE: {
  type: StudioComponentType;
  name: string;
  category: "Actions" | "Forms" | "Data & Charts" | "Feedback" | "Composed";
  icon: keyof typeof Icons;
  defaultProps: Record<string, any>;
}[] = [
  // Actions
  { type: "button", name: "Button", category: "Actions", icon: "Check", defaultProps: { label: "Confirm Action", variant: "solid", size: "md" } },
  { type: "async-button", name: "Async Button", category: "Actions", icon: "Play", defaultProps: { label: "Deploy Build", timeoutMs: 1500, variant: "solid" } },
  { type: "button-group", name: "Button Group", category: "Actions", icon: "Layers", defaultProps: { labels: ["Preview", "Stage", "Live"] } },
  { type: "icon-button", name: "Icon Button", category: "Actions", icon: "Heart", defaultProps: { label: "Save to favorites", icon: "Heart" } },
  { type: "toggle-button", name: "Toggle Button", category: "Actions", icon: "Sliders", defaultProps: { label: "Pin to Sidebar", defaultPressed: true } },
  { type: "segmented-control", name: "Segmented Control", category: "Actions", icon: "Layout", defaultProps: { label: "View Mode", options: ["List", "Grid", "Board"], value: "Grid" } },
  { type: "toggle-group", name: "Toggle Group", category: "Actions", icon: "Terminal", defaultProps: { label: "Formatting", options: ["Bold", "Italic", "Code"], value: "Bold" } },

  // Forms
  { type: "text-field", name: "Text Field", category: "Forms", icon: "Search", defaultProps: { label: "Workspace Slug", placeholder: "acme-design", help: "Must be URL-safe." } },
  { type: "text-area", name: "Text Area", category: "Forms", icon: "AlignLeft", defaultProps: { label: "Change Notes", placeholder: "Detail your edits...", resize: "vertical", minHeight: 80, maxHeight: 200 } },
  { type: "number-field", name: "Number Field", category: "Forms", icon: "Plus", defaultProps: { label: "Compute Nodes", variant: "quantity", value: 3, min: 1, max: 32, step: 1 } },
  { type: "pin-input", name: "PIN Input", category: "Forms", icon: "Lock", defaultProps: { label: "Auth Code", length: 6, groupSize: 3, simulateError: false } },
  { type: "slider", name: "Slider", category: "Forms", icon: "Sliders", defaultProps: { label: "Volume", orientation: "horizontal", showValue: true, min: 0, max: 100, defaultValue: 65 } },
  { type: "range-slider", name: "Range Slider", category: "Forms", icon: "Sliders", defaultProps: { label: "Latency Threshold (ms)", orientation: "horizontal", showValue: true, min: 0, max: 500, defaultValue: [50, 300] } },
  { type: "switch", name: "Switch", category: "Forms", icon: "Sliders", defaultProps: { label: "Automatic Backups", defaultChecked: true } },
  { type: "checkbox", name: "Checkbox", category: "Forms", icon: "CheckCircle", defaultProps: { label: "Enable telemetry monitoring", defaultChecked: true } },
  { type: "radio-group", name: "Radio Group", category: "Forms", icon: "CheckCircle", defaultProps: { label: "Default Branch", options: ["main", "develop", "stage"], defaultValue: "main" } },
  { type: "color-picker", name: "Color Picker", category: "Forms", icon: "Droplet", defaultProps: { label: "Accent Tint", defaultValue: "#1F5FA8" } },
  { type: "file-dropzone", name: "File Upload", category: "Forms", icon: "Upload", defaultProps: { label: "File upload", accept: ".pdf,image/*", maxFiles: 4, maxSize: 5242880 } },
  { type: "rating", name: "Rating", category: "Forms", icon: "Star", defaultProps: { label: "Feature Score", max: 5, defaultValue: 5 } },

  // Data & Charts
  { type: "badge", name: "Badge", category: "Data & Charts", icon: "Shield", defaultProps: { label: "Verified Tier", tone: "accent" } },
  { type: "stat-card", name: "Stat Card", category: "Data & Charts", icon: "Activity", defaultProps: { label: "Cache Hit Ratio", value: "98.4%", delta: 2.1, deltaLabel: "vs 24h avg" } },
  { type: "chip", name: "Chip", category: "Data & Charts", icon: "Tag", defaultProps: { label: "React 19 Ready", selected: true } },
  { type: "avatar", name: "Avatar", category: "Data & Charts", icon: "User", defaultProps: { name: "Varun Karthic", size: "md", variant: "marble" } },
  { type: "pie-chart", name: "Pie Chart", category: "Data & Charts", icon: "PieChart", defaultProps: { title: "Bandwidth Distribution", data: [{ label: "API", value: 55 }, { label: "Images", value: 30 }, { label: "Static", value: 15 }] } },
  { type: "sparkline", name: "Sparkline", category: "Data & Charts", icon: "TrendingUp", defaultProps: { label: "Request Velocity", data: [12, 19, 14, 25, 32, 28, 45, 58] } },

  // Feedback
  { type: "progress", name: "Progress", category: "Feedback", icon: "BarChart", defaultProps: { label: "Sync Status", value: 78 } },
  { type: "spinner", name: "Spinner", category: "Feedback", icon: "Refresh", defaultProps: { size: "md" } },
  { type: "callout", name: "Callout", category: "Feedback", icon: "AlertCircle", defaultProps: { title: "Review before release", message: "Check keyboard and contrast behaviour in your application.", tone: "note" } },

  // Composed
  { type: "card", name: "Card", category: "Composed", icon: "Layout", defaultProps: { title: "Service Worker Settings", description: "Configures client cache policies and offline routing." } },
];

export function DesignStudio() {
  const [items, setItems] = useState<StudioItem[]>(STUDIO_TEMPLATES[0].items);
  const [history, setHistory] = useState<{ past: StudioItem[][]; future: StudioItem[][] }>({
    past: [],
    future: [],
  });
  const [selectedId, setSelectedId] = useState<string | null>(STUDIO_TEMPLATES[0].items[0].id);

  // Studio Global Theme & Physics state
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [accent, setAccent] = useState<string>("#1F5FA8");
  const [material, setMaterial] = useState<"solid" | "glass">("solid");
  const [density, setDensity] = useState<Density>("comfortable");
  const [radiusScale, setRadiusScale] = useState<"subtle" | "default" | "round" | "pill">("default");

  // Studio Workspace / Camera state
  const [interactMode, setInteractMode] = useState<boolean>(false);
  const [viewport, setViewport] = useState<ViewportMode>("responsive");
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [gridSnap, setGridSnap] = useState<boolean>(true);
  const [gridPattern] = useState<"dots" | "lines" | "none">("dots");

  // Physics motion state
  const [motionPhysics, setMotionPhysics] = useState<MotionPhysics>({ stiffness: 300, damping: 24, mass: 1 });
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [springBallOffset, setSpringBallOffset] = useState<number>(0);

  // Navigation & sidebars state
  const [activeLeftTab, setActiveLeftTab] = useState<"palette" | "layers">("palette");
  const [activeRightTab, setActiveRightTab] = useState<"props" | "theme" | "motion" | "code">("props");
  const [mobilePanel, setMobilePanel] = useState<"components" | "canvas" | "inspector">("canvas");
  const [paletteFilter, setPaletteFilter] = useState<string>("");
  const [paletteCategory, setPaletteCategory] = useState<string>("All");
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("Just now");

  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const viewportDims = useMemo(() => {
    if (viewport === "responsive") return { width: "100%", height: "100%", isFixed: false };
    if (viewport === "desktop") return { width: 1440, height: 900, isFixed: true };
    if (viewport === "tablet") {
      return orientation === "portrait"
        ? { width: 768, height: 1024, isFixed: true }
        : { width: 1024, height: 768, isFixed: true };
    }
    return orientation === "portrait"
      ? { width: 375, height: 812, isFixed: true }
      : { width: 812, height: 375, isFixed: true };
  }, [viewport, orientation]);
  const fitScale = viewportDims.isFixed && canvasSize.width && canvasSize.height
    ? Math.min(1, canvasSize.width / Number(viewportDims.width), canvasSize.height / Number(viewportDims.height))
    : 1;
  const effectiveZoom = zoom * fitScale;
  useEffect(() => {
    const el = canvasViewportRef.current;
    if (!el) return;
    const measure = () => {
      const gutter = parseFloat(getComputedStyle(el).getPropertyValue("--orlo-space-6")) || 0;
      setCanvasSize({ width: Math.max(0, el.clientWidth - gutter * 2), height: Math.max(0, el.clientHeight - gutter * 2) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const draggingId = useRef<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const itemStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanning = useRef<boolean>(false);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPan = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const { toast } = useToast();

  // Create active Orlo theme
  const theme = useMemo(() => createTheme(accent), [accent]);
  const currentTokens = theme[mode];
  const canvasBg = semantic[mode].canvas;

  // Real-time WCAG 2.2 AA Contrast computations
  const fillContrast = contrast(currentTokens.accent, currentTokens["accent-fg"]);
  const textContrast = contrast(currentTokens["accent-text"], canvasBg);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      const payload = {
        items,
        theme: { mode, accent, material, density },
        motion: motionPhysics,
      };
      localStorage.setItem("orlo_studio_v3_draft", JSON.stringify(payload));
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch {
      // ignore storage errors
    }
  }, [items, mode, accent, material, density, motionPhysics]);

  // Push state to undo history
  const pushState = useCallback((newItems: StudioItem[]) => {
    setHistory((prev) => ({
      past: [...prev.past.slice(-20), items],
      future: [],
    }));
    setItems(newItems);
  }, [items]);

  const undo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    setHistory((prev) => ({
      past: prev.past.slice(0, -1),
      future: [items, ...prev.future],
    }));
    setItems(previous);
    toast({ title: "Undo action", tone: "neutral" });
  };

  const redo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory((prev) => ({
      past: [...prev.past, items],
      future: prev.future.slice(1),
    }));
    setItems(next);
    toast({ title: "Redo action", tone: "neutral" });
  };

  const selectedItem = useMemo(() => items.find((i) => i.id === selectedId) ?? null, [items, selectedId]);

  const updateProp = (key: string, val: any) => {
    if (!selectedId) return;
    const updated = items.map((item) => (item.id === selectedId ? { ...item, props: { ...item.props, [key]: val } } : item));
    pushState(updated);
  };

  const addItem = (paletteItem: (typeof COMPONENT_PALETTE)[number]) => {
    const newId = `${paletteItem.type}-${Date.now().toString(36).slice(-4)}`;
    const maxZ = items.reduce((max, i) => Math.max(max, i.zIndex || 0), 0);
    const newItem: StudioItem = {
      id: newId,
      type: paletteItem.type,
      props: JSON.parse(JSON.stringify(paletteItem.defaultProps)),
      x: 60 + ((items.length * 24) % 240),
      y: 60 + ((items.length * 24) % 240),
      zIndex: maxZ + 1,
    };
    pushState([...items, newItem]);
    setSelectedId(newId);
    setActiveRightTab("props");
    setMobilePanel("canvas");
    toast({ title: `Added ${paletteItem.name}`, tone: "neutral" });
  };

  const deleteItem = (id: string) => {
    pushState(items.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast({ title: "Removed layer", tone: "neutral" });
  };

  const duplicateItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newId = `${item.type}-${Date.now().toString(36).slice(-4)}`;
    const maxZ = items.reduce((max, i) => Math.max(max, i.zIndex || 0), 0);
    const cloned: StudioItem = {
      ...item,
      id: newId,
      x: item.x + (gridSnap ? 16 : 20),
      y: item.y + (gridSnap ? 16 : 20),
      zIndex: maxZ + 1,
      props: JSON.parse(JSON.stringify(item.props)),
    };
    pushState([...items, cloned]);
    setSelectedId(newId);
    toast({ title: `Duplicated ${item.type}`, tone: "neutral" });
  };

  const bringForward = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const updated = items.map((i) => (i.id === id ? { ...i, zIndex: (i.zIndex || 0) + 1 } : i));
    pushState(updated);
  };

  const sendBackward = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const updated = items.map((i) => (i.id === id ? { ...i, zIndex: Math.max(0, (i.zIndex || 0) - 1) } : i));
    pushState(updated);
  };

  const loadTemplate = (tmpl: (typeof STUDIO_TEMPLATES)[number]) => {
    pushState(JSON.parse(JSON.stringify(tmpl.items)));
    setSelectedId(tmpl.items[0]?.id ?? null);
    setShowTemplatesModal(false);
    toast({ title: `Loaded template: ${tmpl.name}`, tone: "success" });
  };

  // Keyboard navigation & nudging
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d" && selectedId) {
        e.preventDefault();
        duplicateItem(selectedId);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !interactMode) {
        e.preventDefault();
        deleteItem(selectedId);
        return;
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        return;
      }

      // Arrow key nudges
      if (selectedId && !interactMode && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const delta = e.shiftKey ? (gridSnap ? 16 : 10) : gridSnap ? 8 : 1;
        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== selectedId) return item;
            let nx = item.x;
            let ny = item.y;
            if (e.key === "ArrowUp") ny = Math.max(0, item.y - delta);
            if (e.key === "ArrowDown") ny = item.y + delta;
            if (e.key === "ArrowLeft") nx = Math.max(0, item.x - delta);
            if (e.key === "ArrowRight") nx = item.x + delta;
            return { ...item, x: nx, y: ny };
          })
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, interactMode, gridSnap, history]);

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
      const dx = (ev.clientX - dragStartPos.current.x) / effectiveZoom;
      const dy = (ev.clientY - dragStartPos.current.y) / effectiveZoom;
      let targetX = Math.max(0, itemStartPos.current.x + dx);
      let targetY = Math.max(0, itemStartPos.current.y + dy);

      if (gridSnap) {
        targetX = Math.round(targetX / 8) * 8;
        targetY = Math.round(targetY / 8) * 8;
      }

      setItems((prev) =>
        prev.map((it) => (it.id === draggingId.current ? { ...it, x: Math.round(targetX), y: Math.round(targetY) } : it))
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

  const spacePressed = useRef<boolean>(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== "input" && activeTag !== "textarea") {
          spacePressed.current = e.type === "keydown";
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKey);
    };
  }, []);

  // Canvas pan via spacebar or middle-click or empty background drag
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || spacePressed.current || (!interactMode && e.target === canvasViewportRef.current)) {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      initialPan.current = { ...pan };

      const onCanvasMove = (ev: PointerEvent) => {
        if (!isPanning.current) return;
        const dx = ev.clientX - panStart.current.x;
        const dy = ev.clientY - panStart.current.y;
        setPan({ x: initialPan.current.x + dx, y: initialPan.current.y + dy });
      };

      const onCanvasUp = () => {
        isPanning.current = false;
        window.removeEventListener("pointermove", onCanvasMove);
        window.removeEventListener("pointerup", onCanvasUp);
      };

      window.addEventListener("pointermove", onCanvasMove);
      window.addEventListener("pointerup", onCanvasUp);
    } else if (!interactMode && e.target === canvasViewportRef.current) {
      setSelectedId(null);
    }
  };

  // Interactive physics spring ball simulation impulse
  const triggerSpringSimulation = () => {
    let step = 0;
    const startVal = 80;
    const interval = setInterval(() => {
      step += 0.05;
      const omega = Math.sqrt(motionPhysics.stiffness / motionPhysics.mass);
      const zeta = motionPhysics.damping / (2 * Math.sqrt(motionPhysics.stiffness * motionPhysics.mass));
      const pos = startVal * Math.exp(-zeta * omega * step) * Math.cos(omega * Math.sqrt(Math.max(0, 1 - zeta * zeta)) * step);
      setSpringBallOffset(Math.round(pos));
      if (step > 2.5 || Math.abs(pos) < 0.2) {
        clearInterval(interval);
        setSpringBallOffset(0);
      }
    }, 16);
  };

  // Code generation pipeline (idiomatic TypeScript + React)
  const generatedCode = useMemo(() => {
    const usedImports = new Set<string>(["OrloProvider"]);
    const elementsCode: string[] = [];

    items.forEach((sourceItem) => {
      const item = { ...sourceItem, x: finiteNumber(sourceItem.x, 0), y: finiteNumber(sourceItem.y, 0) };
      switch (item.type) {
        case "button":
          usedImports.add("Button");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <Button variant="${escapeJsx(item.props.variant || "solid")}" size="${escapeJsx(item.props.size || "md")}">\n        ${escapeJsx(item.props.label || "Click")}\n      </Button>\n    </div>`
          );
          break;
        case "async-button":
          usedImports.add("AsyncButton");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <AsyncButton action={async () => new Promise((r) => setTimeout(r, ${finiteNumber(item.props.timeoutMs, 1500)}))}>\n        ${escapeJsx(item.props.label || "Save")}\n      </AsyncButton>\n    </div>`
          );
          break;
        case "button-group":
          usedImports.add("ButtonGroup");
          usedImports.add("Button");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <ButtonGroup label="Actions">\n        ${(item.props.labels || ["Action 1", "Action 2"]).map((l: string) => `<Button>${escapeJsx(l)}</Button>`).join("\n        ")}\n      </ButtonGroup>\n    </div>`
          );
          break;
        case "icon-button":
          usedImports.add("IconButton");
          usedImports.add("Icons");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <IconButton label="${escapeJsx(item.props.label || "Icon")}">\n        <Icons.Heart size={18} />\n      </IconButton>\n    </div>`
          );
          break;
        case "toggle-button":
          usedImports.add("ToggleButton");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <ToggleButton defaultPressed={${!!item.props.defaultPressed}}>\n        ${escapeJsx(item.props.label || "Toggle")}\n      </ToggleButton>\n    </div>`
          );
          break;
        case "segmented-control":
          usedImports.add("SegmentedControl");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <SegmentedControl label="${escapeJsx(item.props.label || "Mode")}" options={${JSON.stringify((item.props.options || ["A", "B"]).map((option: string) => ({ value: option, label: option })))}} defaultValue="${escapeJsx(item.props.value || "A")}" />\n    </div>`
          );
          break;
        case "toggle-group":
          usedImports.add("ToggleGroup");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <ToggleGroup label="${escapeJsx(item.props.label || "Format")}" type="single" items={${JSON.stringify((item.props.options || ["A", "B"]).map((o: string) => ({ value: o, label: o })))}} defaultValue={${JSON.stringify([item.props.value || "A"])}} />\n    </div>`
          );
          break;
        case "text-field":
          usedImports.add("TextField");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 280 }}>\n      <TextField label="${escapeJsx(item.props.label || "Input")}" placeholder="${escapeJsx(item.props.placeholder || "")}" help="${escapeJsx(item.props.help || "")}" />\n    </div>`
          );
          break;
        case "text-area":
          usedImports.add("TextArea");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 280 }}>\n      <TextArea label="${escapeJsx(item.props.label || "Comments")}" resize="${escapeJsx(item.props.resize || "vertical")}" placeholder="${escapeJsx(item.props.placeholder || "")}" />\n    </div>`
          );
          break;
        case "number-field":
          usedImports.add("NumberField");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <NumberField label="${escapeJsx(item.props.label || "Quantity")}" variant="${escapeJsx(item.props.variant || "quantity")}" defaultValue={${finiteNumber(item.props.value, 1)}} min={${finiteNumber(item.props.min, 0)}} max={${finiteNumber(item.props.max, 100)}} step={${finiteNumber(item.props.step, 1)}} />\n    </div>`
          );
          break;
        case "pin-input":
          usedImports.add("PinInput");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <PinInput label="${escapeJsx(item.props.label || "PIN")}" length={${finiteNumber(item.props.length, 6)}} groupSize={${finiteNumber(item.props.groupSize, 3)}} />\n    </div>`
          );
          break;
        case "slider":
          usedImports.add("Slider");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 240 }}>\n      <Slider label="${escapeJsx(item.props.label || "Level")}" orientation="${escapeJsx(item.props.orientation || "horizontal")}" defaultValue={${finiteNumber(item.props.defaultValue, 50)}} />\n    </div>`
          );
          break;
        case "range-slider":
          usedImports.add("RangeSlider");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 240 }}>\n      <RangeSlider label="${escapeJsx(item.props.label || "Range")}" orientation="${escapeJsx(item.props.orientation || "horizontal")}" defaultValue={${JSON.stringify(item.props.defaultValue || [20, 80])}} />\n    </div>`
          );
          break;
        case "switch":
          usedImports.add("Switch");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <Switch label="${escapeJsx(item.props.label || "Toggle")}" defaultChecked={${!!item.props.defaultChecked}} />\n    </div>`
          );
          break;
        case "checkbox":
          usedImports.add("Checkbox");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <Checkbox label="${escapeJsx(item.props.label || "Option")}" defaultChecked={${!!item.props.defaultChecked}} />\n    </div>`
          );
          break;
        case "radio-group":
          usedImports.add("RadioGroup");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <RadioGroup legend="${escapeJsx(item.props.label || "Select")}" name="screen-radio" options={${JSON.stringify((item.props.options || ["Opt 1", "Opt 2"]).map((o: string) => ({ value: o, label: o })))}} defaultValue="${escapeJsx(item.props.defaultValue || "Opt 1")}" />\n    </div>`
          );
          break;
        case "color-picker":
          usedImports.add("ColorPicker");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <ColorPicker label="${escapeJsx(item.props.label || "Color")}" defaultValue="${escapeJsx(item.props.defaultValue || "#1F5FA8")}" />\n    </div>`
          );
          break;
        case "file-dropzone":
          usedImports.add("FileDropzone");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 320 }}>\n      <FileDropzone label="${escapeJsx(item.props.label || "File upload")}" accept="${escapeJsx(item.props.accept || "*/*")}" maxFiles={${finiteNumber(item.props.maxFiles, 4)}} maxSize={${finiteNumber(item.props.maxSize, 5242880)}} />\n    </div>`
          );
          break;
        case "rating":
          usedImports.add("Rating");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <Rating label="${escapeJsx(item.props.label || "Rating")}" max={${finiteNumber(item.props.max, 5)}} defaultValue={${finiteNumber(item.props.defaultValue, 5)}} />\n    </div>`
          );
          break;
        case "badge":
          usedImports.add("Badge");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <Badge tone="${escapeJsx(item.props.tone || "accent")}">\n        ${escapeJsx(item.props.label || "Badge")}\n      </Badge>\n    </div>`
          );
          break;
        case "stat-card":
          usedImports.add("StatCard");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 260 }}>\n      <StatCard label="${escapeJsx(item.props.label || "Metric")}" value="${escapeJsx(item.props.value || "0")}" delta={${finiteNumber(item.props.delta, 0)}} deltaLabel="${escapeJsx(item.props.deltaLabel || "")}" />\n    </div>`
          );
          break;
        case "chip":
          usedImports.add("Chip");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <Chip selected={${!!item.props.selected}}>\n        ${escapeJsx(item.props.label || "Chip")}\n      </Chip>\n    </div>`
          );
          break;
        case "avatar":
          usedImports.add("Avatar");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <Avatar name="${escapeJsx(item.props.name || "User")}" size="${escapeJsx(item.props.size || "md")}" variant="${escapeJsx(item.props.variant || "marble")}" />\n    </div>`
          );
          break;
        case "pie-chart":
          usedImports.add("PieChart");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 280 }}>\n      <PieChart title="${escapeJsx(item.props.title || "Distribution")}" data={${JSON.stringify(item.props.data || [])}} />\n    </div>`
          );
          break;
        case "sparkline":
          usedImports.add("Sparkline");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 240 }}>\n      <Sparkline label="${escapeJsx(item.props.label || "Trend")}" data={${JSON.stringify(item.props.data || [10, 20, 15, 30])}} />\n    </div>`
          );
          break;
        case "progress":
          usedImports.add("Progress");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 240 }}>\n      <Progress label="${escapeJsx(item.props.label || "Progress")}" value={${finiteNumber(item.props.value, 50)}} />\n    </div>`
          );
          break;
        case "spinner":
          usedImports.add("Spinner");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <Spinner size="${escapeJsx(item.props.size || "md")}" />\n    </div>`
          );
          break;
        case "callout":
          usedImports.add("Callout");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 340 }}>\n      <Callout title="${escapeJsx(item.props.title || "Note")}" tone="${escapeJsx(item.props.tone || "note")}">\n        ${escapeJsx(item.props.message || "")}\n      </Callout>\n    </div>`
          );
          break;
        case "card":
          usedImports.add("Card");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 300 }}>\n      <Card>\n        <h3>${escapeJsx(item.props.title || "Card")}</h3>\n        <p>${escapeJsx(item.props.description || "")}</p>\n      </Card>\n    </div>`
          );
          break;
      }
    });

    const importsString = Array.from(usedImports).sort().join(", ");

    return `import { ${importsString} } from "@orlo/react";
import { createTheme, themeToCss } from "@orlo/tokens";
import "@orlo/tokens/css";
import "@orlo/react/styles.css";

const screenTheme = createTheme(${JSON.stringify(accent)});

export function GeneratedScreen() {
  return (
    <OrloProvider className="generated-screen" theme="${mode}" material="${material}" density="${density}">
      <style>{themeToCss(screenTheme, ".generated-screen")}</style>
      <div
        style={{
          position: "relative",
          inlineSize: "100%",
          minBlockSize: "680px",
          background: "var(--orlo-color-canvas)",
          color: "var(--orlo-color-fg)",
          padding: "var(--orlo-space-8)",
          overflow: "auto",
        }}
      >
${elementsCode.join("\n\n")}
      </div>
    </OrloProvider>
  );
}
`;
  }, [items, accent, mode, material, density]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      toast({ title: "Copied TypeScript code to clipboard", tone: "neutral" });
    } catch {
      toast({ title: "Failed to copy code", tone: "error" });
    }
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: "text/typescript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GeneratedScreen.tsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded GeneratedScreen.tsx", tone: "neutral" });
  };

  const exportProjectJson = () => {
    const projectData = {
      schemaVersion: 1,
      appName: "Orlo Studio Application",
      exportedAt: new Date().toISOString(),
      theme: { mode, accent, material, density, radiusScale },
      motion: motionPhysics,
      items,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orlo-studio-project.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Exported project JSON", tone: "success" });
  };

  const importProjectJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.items && Array.isArray(parsed.items)) {
          pushState(parsed.items);
          if (parsed.theme) {
            if (parsed.theme.mode) setMode(parsed.theme.mode);
            if (parsed.theme.accent) setAccent(parsed.theme.accent);
            if (parsed.theme.material) setMaterial(parsed.theme.material);
            if (parsed.theme.density) setDensity(parsed.theme.density);
          }
          if (parsed.motion) setMotionPhysics(parsed.motion);
          setSelectedId(parsed.items[0]?.id ?? null);
          toast({ title: "Imported project successfully", tone: "success" });
        } else {
          toast({ title: "Invalid project schema", tone: "error" });
        }
      } catch {
        toast({ title: "Failed to parse JSON file", tone: "error" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Filtered components in palette
  const filteredPalette = useMemo(() => {
    return COMPONENT_PALETTE.filter((comp) => {
      const matchesCategory = paletteCategory === "All" || comp.category === paletteCategory;
      const matchesSearch =
        !paletteFilter ||
        comp.name.toLowerCase().includes(paletteFilter.toLowerCase()) ||
        comp.category.toLowerCase().includes(paletteFilter.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [paletteFilter, paletteCategory]);

  return (
    <div className="design-studio" data-mode={mode} data-interact={interactMode || undefined} data-mobile-panel={mobilePanel}>
      {/* ---------- STUDIO TOPBAR (Full Bleed Header) ---------- */}
      <header className="design-studio__topbar">
        {/* Left: Brand badge, Title & Auto-save status */}
        <div className="design-studio__topbar-left">
          <span className="design-studio__badge">Studio</span>
          <span className="design-studio__doc-title">Interactive Canvas</span>
          <span className="design-studio__save-status">
            <Icons.Check size={12} aria-hidden="true" />
            <span>Saved {lastSavedTime}</span>
          </span>
        </div>

        {/* Center: Viewport Device Switcher & Mode Toggle */}
        <div className="design-studio__topbar-center">
          <div className="design-studio__viewport-controls">
            <button
              type="button"
              className={`design-studio__icon-tool ${viewport === "responsive" ? "is-active" : ""}`}
              onClick={() => setViewport("responsive")}
              title="Responsive Fluid Viewport"
              aria-label="Responsive Viewport"
            >
              <Icons.Maximize size={15} />
            </button>
            <button
              type="button"
              className={`design-studio__icon-tool ${viewport === "desktop" ? "is-active" : ""}`}
              onClick={() => setViewport("desktop")}
              title="Desktop 1440×900"
              aria-label="Desktop 1440 Viewport"
            >
              <Icons.Monitor size={15} />
            </button>
            <button
              type="button"
              className={`design-studio__icon-tool ${viewport === "tablet" ? "is-active" : ""}`}
              onClick={() => setViewport("tablet")}
              title="Tablet 768px"
              aria-label="Tablet Viewport"
            >
              <Icons.Tablet size={15} />
            </button>
            <button
              type="button"
              className={`design-studio__icon-tool ${viewport === "mobile" ? "is-active" : ""}`}
              onClick={() => setViewport("mobile")}
              title="Mobile 375px"
              aria-label="Mobile Viewport"
            >
              <Icons.Smartphone size={15} />
            </button>
            {viewport !== "responsive" && viewport !== "desktop" && (
              <button
                type="button"
                className="design-studio__icon-tool"
                onClick={() => setOrientation((o) => (o === "portrait" ? "landscape" : "portrait"))}
                title={`Rotate orientation (${orientation})`}
                aria-label="Rotate Orientation"
              >
                <Icons.Refresh size={14} />
              </button>
            )}
          </div>

          <div className="design-studio__divider-v" />

          {/* Mode Toggle: Design vs. Test */}
          <div className="design-studio__mode-toggle">
            <button
              type="button"
              className={`design-studio__mode-btn ${!interactMode ? "is-active" : ""}`}
              onClick={() => setInteractMode(false)}
            >
              <Icons.Edit size={14} />
              <span>Design</span>
            </button>
            <button
              type="button"
              className={`design-studio__mode-btn ${interactMode ? "is-active" : ""}`}
              onClick={() => setInteractMode(true)}
            >
              <Icons.Play size={14} />
              <span>Test Mode</span>
            </button>
          </div>

          <div className="design-studio__divider-v" />

          {/* Camera & Pan/Zoom Controls */}
          <div className="design-studio__zoom-controls">
            <button
              type="button"
              className="design-studio__icon-tool"
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
              title="Zoom out"
              aria-label="Zoom Out"
            >
              <Icons.Minus size={14} />
            </button>
            <span className="design-studio__zoom-label">{Math.round(effectiveZoom * 100)}%</span>
            <button
              type="button"
              className="design-studio__icon-tool"
              onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(1))))}
              title="Zoom in"
              aria-label="Zoom In"
            >
              <Icons.Plus size={14} />
            </button>
            <button
              type="button"
              className="design-studio__icon-tool"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              title="Fit canvas"
              aria-label="Fit Canvas"
            >
              <Icons.Home size={14} />
            </button>
            <button
              type="button"
              className={`design-studio__icon-tool ${gridSnap ? "is-active" : ""}`}
              onClick={() => setGridSnap((s) => !s)}
              title={`Snap to 8pt grid (${gridSnap ? "Enabled" : "Disabled"})`}
              aria-label="Toggle 8pt Grid Snap"
            >
              <Icons.Grid size={14} />
            </button>
          </div>
        </div>

        {/* Right: Undo/Redo, Templates, Import/Export, Code Actions */}
        <div className="design-studio__topbar-right">
          <div className="design-studio__history-tools">
            <button
              type="button"
              className="design-studio__icon-tool"
              onClick={undo}
              disabled={history.past.length === 0}
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <Icons.ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="design-studio__icon-tool"
              onClick={redo}
              disabled={history.future.length === 0}
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <Icons.ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            className="design-studio__action-btn"
            onClick={() => setShowTemplatesModal(true)}
          >
            <Icons.Zap size={14} />
            <span>Templates</span>
          </button>

          <label className="design-studio__action-btn" title="Import .orlo.json">
            <Icons.Folder size={14} />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={importProjectJson}
            />
          </label>

          <button
            type="button"
            className="design-studio__action-btn"
            onClick={exportProjectJson}
            title="Export project schema"
          >
            <Icons.Download size={14} />
            <span>JSON</span>
          </button>

          <Button
            variant="solid"
            size="sm"
            onClick={copyCode}
            className="design-studio__copy-btn"
          >
            <Icons.Copy size={14} />
            <span>Copy Code</span>
          </Button>
        </div>
        <nav className="design-studio__mobile-panels" aria-label="Studio panels">
          {(["components", "canvas", "inspector"] as const).map((panel) => (
            <button key={panel} type="button" aria-pressed={mobilePanel === panel} onClick={() => setMobilePanel(panel)}>
              {panel === "components" ? "Components" : panel === "canvas" ? "Canvas" : "Inspector"}
            </button>
          ))}
        </nav>
      </header>

      {/* ---------- STUDIO WORKSPACE (3 Columns) ---------- */}
      <div className="design-studio__workspace">
        {/* === LEFT SIDEBAR: Palette & Layers === */}
        <aside className="design-studio__sidebar-left">
          <div className="design-studio__tab-strip">
            <button
              type="button"
              className={`design-studio__tab-btn ${activeLeftTab === "palette" ? "is-active" : ""}`}
              onClick={() => setActiveLeftTab("palette")}
            >
              <Icons.Layers size={14} />
              <span>Components</span>
            </button>
            <button
              type="button"
              className={`design-studio__tab-btn ${activeLeftTab === "layers" ? "is-active" : ""}`}
              onClick={() => setActiveLeftTab("layers")}
            >
              <Icons.List size={14} />
              <span>Scene Tree ({items.length})</span>
            </button>
          </div>

          {activeLeftTab === "palette" && (
            <div className="design-studio__palette-pane">
              {/* Search filter */}
              <div className="design-studio__search-box">
                <Icons.Search size={14} className="design-studio__search-icon" aria-hidden="true" />
                <input
                  type="search"
                  value={paletteFilter}
                  onChange={(e) => setPaletteFilter(e.target.value)}
                  placeholder="Filter 24+ components..."
                  className="design-studio__search-input"
                />
                {paletteFilter && (
                  <button
                    type="button"
                    className="design-studio__search-clear"
                    onClick={() => setPaletteFilter("")}
                  >
                    <Icons.X size={12} />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="design-studio__category-row">
                {["All", "Actions", "Forms", "Data & Charts", "Feedback", "Composed"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`design-studio__category-pill ${paletteCategory === cat ? "is-active" : ""}`}
                    onClick={() => setPaletteCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Component cards list */}
              <div className="design-studio__palette-list">
                {filteredPalette.map((paletteItem) => {
                  const IconComp = Icons[paletteItem.icon] || Icons.Check;
                  return (
                    <button
                      key={paletteItem.type}
                      type="button"
                      className="design-studio__palette-card"
                      onClick={() => addItem(paletteItem)}
                    >
                      <div className="design-studio__palette-icon">
                        <IconComp size={16} />
                      </div>
                      <div className="design-studio__palette-meta">
                        <span className="design-studio__palette-name">{paletteItem.name}</span>
                        <span className="design-studio__palette-cat">{paletteItem.category}</span>
                      </div>
                      <Icons.Plus size={14} className="design-studio__palette-add" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeLeftTab === "layers" && (
            <div className="design-studio__layers-pane">
              <div className="design-studio__layers-header">
                <span>Z-Index Hierarchy ({items.length} nodes)</span>
                <button
                  type="button"
                  className="design-studio__clear-btn"
                  onClick={() => {
                    if (window.confirm("Clear all items from canvas?")) {
                      pushState([]);
                      setSelectedId(null);
                    }
                  }}
                >
                  Clear All
                </button>
              </div>
              <div className="design-studio__layers-list">
                {items
                  .slice()
                  .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
                  .map((item, idx) => {
                    const isSelected = item.id === selectedId;
                    return (
                      <div
                        key={item.id}
                        className={`design-studio__layer-item ${isSelected ? "is-selected" : ""}`}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <span className="design-studio__layer-index">#{idx + 1}</span>
                        <div className="design-studio__layer-title">
                          <strong>{item.type}</strong>
                          <small>
                            X: {item.x}, Y: {item.y}
                          </small>
                        </div>
                        <div className="design-studio__layer-actions">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              bringForward(item.id);
                            }}
                            title="Bring forward"
                          >
                            <Icons.ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sendBackward(item.id);
                            }}
                            title="Send backward"
                          >
                            <Icons.ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateItem(item.id);
                            }}
                            title="Duplicate"
                          >
                            <Icons.Copy size={12} />
                          </button>
                          <button
                            type="button"
                            className="design-studio__layer-del"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(item.id);
                            }}
                            title="Delete"
                          >
                            <Icons.Trash size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </aside>

        {/* === CENTER CANVAS: Infinite-Feeling Viewport & Device Frame === */}
        <div
          ref={canvasViewportRef}
          className={`design-studio__canvas-viewport design-studio__grid--${gridPattern}`}
          onPointerDown={handleCanvasPointerDown}
        >
          {/* Pan & Zoom Transform Space */}
          <div
            className="design-studio__camera-stage"
            style={{
              inlineSize: viewportDims.isFixed ? viewportDims.width : "100%",
              blockSize: viewportDims.isFixed ? viewportDims.height : "100%",
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${effectiveZoom})`,
              transformOrigin: "center center",
            }}
          >
            {/* Device Frame Simulation */}
            <div
              className={`design-studio__device-frame ${viewportDims.isFixed ? `is-${viewport}` : "is-responsive"}`}
              data-orlo-theme={mode}
              style={{
                inlineSize: typeof viewportDims.width === "number" ? `${viewportDims.width}px` : "100%",
                blockSize: typeof viewportDims.height === "number" ? `${viewportDims.height}px` : "100%",
              }}
            >
              {/* Optional hardware bar for phone/tablet */}
              {viewportDims.isFixed && (
                <div className="design-studio__device-header">
                  <div className="design-studio__device-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="design-studio__device-model">
                    {viewport === "desktop" ? "Desktop 1440 × 900" : viewport === "tablet" ? "Tablet 768 × 1024" : "Mobile 375 × 812"}
                  </span>
                  <div className="design-studio__device-meta">
                    <Icons.Wifi size={12} />
                    <Icons.Battery size={12} />
                  </div>
                </div>
              )}

              {/* Canvas Canvas Render Target */}
              <div
                className="design-studio__canvas-surface"
                style={{
                  minInlineSize: viewportDims.isFixed ? undefined : "100%",
                  minBlockSize: viewportDims.isFixed ? undefined : "100%",
                }}
              >
                <OrloProvider
                  theme={mode}
                  material={material}
                  density={density}
                >
                  <style>{themeToCss(theme, ".design-studio__device-frame")}</style>
                  {items.map((item) => {
                    const isSelected = item.id === selectedId;
                    return (
                      <div
                        key={item.id}
                        className={`design-studio__node ${isSelected && !interactMode ? "is-selected" : ""}`}
                        style={{
                          transform: `translate(${item.x}px, ${item.y}px)`,
                          zIndex: item.zIndex || 1,
                        }}
                        onPointerDown={(e) => handleItemPointerDown(e, item.id)}
                      >
                        {/* Floating Node Toolbar in Design Mode */}
                        {isSelected && !interactMode && (
                          <div className="design-studio__node-tools">
                            <span className="design-studio__node-coords">
                              X: {item.x}, Y: {item.y}
                            </span>
                            <button
                              type="button"
                              className="design-studio__node-tool-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateItem(item.id);
                              }}
                              title="Duplicate layer"
                            >
                              <Icons.Copy size={12} />
                            </button>
                            <button
                              type="button"
                              className="design-studio__node-tool-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                bringForward(item.id);
                              }}
                              title="Bring forward"
                            >
                              <Icons.ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              className="design-studio__node-tool-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                sendBackward(item.id);
                              }}
                              title="Send backward"
                            >
                              <Icons.ArrowDown size={12} />
                            </button>
                            <button
                              type="button"
                              className="design-studio__node-tool-btn design-studio__node-tool-btn--danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(item.id);
                              }}
                              title="Delete layer"
                            >
                              <Icons.Trash size={12} />
                            </button>
                          </div>
                        )}

                        {/* Node Render Engine */}
                        <div className="design-studio__component-host">
                          {renderStudioComponent(item, updateProp)}
                        </div>
                      </div>
                    );
                  })}
                </OrloProvider>
              </div>

              {/* Hardware home indicator for mobile */}
              {viewport === "mobile" && (
                <div className="design-studio__device-home-bar" />
              )}
            </div>
          </div>
        </div>

        {/* === RIGHT SIDEBAR: Props, Theme, Motion, Code Inspectors === */}
        <aside className="design-studio__sidebar-right">
          <div className="design-studio__tab-strip">
            <button
              type="button"
              className={`design-studio__tab-btn ${activeRightTab === "props" ? "is-active" : ""}`}
              onClick={() => setActiveRightTab("props")}
            >
              <Icons.Sliders size={14} />
              <span>Props</span>
            </button>
            <button
              type="button"
              className={`design-studio__tab-btn ${activeRightTab === "theme" ? "is-active" : ""}`}
              onClick={() => setActiveRightTab("theme")}
            >
              <Icons.Droplet size={14} />
              <span>Theme</span>
            </button>
            <button
              type="button"
              className={`design-studio__tab-btn ${activeRightTab === "motion" ? "is-active" : ""}`}
              onClick={() => setActiveRightTab("motion")}
            >
              <Icons.Activity size={14} />
              <span>Motion</span>
            </button>
            <button
              type="button"
              className={`design-studio__tab-btn ${activeRightTab === "code" ? "is-active" : ""}`}
              onClick={() => setActiveRightTab("code")}
              aria-label="React code"
              title="React code"
            >
              <Icons.Code size={14} />
              <span>Code</span>
            </button>
          </div>

          <div className="design-studio__inspector-scroll">
            {/* --- PROPS TAB --- */}
            {activeRightTab === "props" && (
              <div className="design-studio__inspector-pane">
                {selectedItem ? (
                  <>
                    <div className="design-studio__inspector-head">
                      <div>
                        <strong>{selectedItem.type.replace("-", " ").toUpperCase()}</strong>
                        <p>ID: #{selectedItem.id}</p>
                      </div>
                      <Badge tone="accent">
                        Layer Z: {selectedItem.zIndex || 1}
                      </Badge>
                    </div>

                    {/* Common text/label prop */}
                    {"label" in selectedItem.props && (
                      <TextField
                        label="Label Text"
                        value={selectedItem.props.label || ""}
                        onChange={(e) => updateProp("label", e.target.value)}
                      />
                    )}

                    {/* Placeholder prop */}
                    {"placeholder" in selectedItem.props && (
                      <TextField
                        label="Placeholder"
                        value={selectedItem.props.placeholder || ""}
                        onChange={(e) => updateProp("placeholder", e.target.value)}
                      />
                    )}

                    {/* Helper text prop */}
                    {"help" in selectedItem.props && (
                      <TextField
                        label="Helper Caption"
                        value={selectedItem.props.help || ""}
                        onChange={(e) => updateProp("help", e.target.value)}
                      />
                    )}

                    {/* Button Variant & Size */}
                    {selectedItem.type === "button" && (
                      <>
                        <SegmentedControl
                          label="Variant"
                          size="sm"
                          value={selectedItem.props.variant || "solid"}
                          onValueChange={(v) => updateProp("variant", v)}
                          options={[
                            { value: "solid", label: "Solid" },
                            { value: "subtle", label: "Subtle" },
                            { value: "outline", label: "Outline" },
                            { value: "ghost", label: "Ghost" },
                          ]}
                        />
                        <SegmentedControl
                          label="Size"
                          size="sm"
                          value={selectedItem.props.size || "md"}
                          onValueChange={(v) => updateProp("size", v)}
                          options={[
                            { value: "sm", label: "Small" },
                            { value: "md", label: "Medium" },
                            { value: "lg", label: "Large" },
                          ]}
                        />
                      </>
                    )}

                    {/* Async Button Timeout */}
                    {selectedItem.type === "async-button" && (
                      <Slider
                        label="Simulated Latency (ms)"
                        min={500}
                        max={3000}
                        step={100}
                        value={selectedItem.props.timeoutMs || 1500}
                        onValueChange={(v) => updateProp("timeoutMs", v)}
                      />
                    )}

                    {/* Pin Input: length 1-16, grouping, stale error clear */}
                    {selectedItem.type === "pin-input" && (
                      <>
                        <SegmentedControl
                          label="Digit Length"
                          size="sm"
                          value={String(selectedItem.props.length || 6)}
                          onValueChange={(v) => updateProp("length", Number(v))}
                          options={[
                            { value: "3", label: "3" },
                            { value: "4", label: "4" },
                            { value: "6", label: "6" },
                            { value: "8", label: "8" },
                            { value: "12", label: "12" },
                            { value: "16", label: "16" },
                          ]}
                        />
                        <SegmentedControl
                          label="Visual Separator Grouping"
                          size="sm"
                          value={String(selectedItem.props.groupSize || 3)}
                          onValueChange={(v) => updateProp("groupSize", Number(v))}
                          options={[
                            { value: "0", label: "None" },
                            { value: "3", label: "Every 3" },
                            { value: "4", label: "Every 4" },
                          ]}
                        />
                        <Switch
                          label="Simulate Invalid PIN Error"
                          checked={!!selectedItem.props.simulateError}
                          onCheckedChange={(c) => updateProp("simulateError", c)}
                        />
                        <p className="orlo-hint">
                          Under Master Prompt §3.2, editing a previously invalid PIN clears stale validation errors automatically.
                        </p>
                      </>
                    )}

                    {/* Slider / RangeSlider: orientation, showValue */}
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
                          label="Show Numerical Value Bubble"
                          checked={!!selectedItem.props.showValue}
                          onCheckedChange={(c) => updateProp("showValue", c)}
                        />
                      </>
                    )}

                    {/* TextArea resize locks */}
                    {selectedItem.type === "text-area" && (
                      <>
                        <SegmentedControl
                          label="Resize Locks"
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
                        <Slider
                          label="Minimum Height (px)"
                          min={60}
                          max={160}
                          value={selectedItem.props.minHeight || 80}
                          onValueChange={(v) => updateProp("minHeight", v)}
                        />
                      </>
                    )}

                    {/* NumberField: standard vs quantity picker */}
                    {selectedItem.type === "number-field" && (
                      <>
                        <SegmentedControl
                          label="Variant"
                          size="sm"
                          value={selectedItem.props.variant || "quantity"}
                          onValueChange={(v) => updateProp("variant", v)}
                          options={[
                            { value: "quantity", label: "Quantity Morph" },
                            { value: "stepper", label: "Standard Stepper" },
                          ]}
                        />
                        <Slider
                          label="Step Interval"
                          min={1}
                          max={10}
                          value={selectedItem.props.step || 1}
                          onValueChange={(v) => updateProp("step", v)}
                        />
                      </>
                    )}

                    {/* File Dropzone: accepted formats, max size */}
                    {selectedItem.type === "file-dropzone" && (
                      <>
                        <TextField
                          label="Accepted Formats (MIME/ext)"
                          value={selectedItem.props.accept || ".pdf,image/*"}
                          onChange={(e) => updateProp("accept", e.target.value)}
                        />
                        <Slider
                          label="Max File Count"
                          min={1}
                          max={10}
                          value={selectedItem.props.maxFiles || 4}
                          onValueChange={(v) => updateProp("maxFiles", v)}
                        />
                      </>
                    )}

                    {/* Rating: max stars */}
                    {selectedItem.type === "rating" && (
                      <SegmentedControl
                        label="Star Scale"
                        size="sm"
                        value={String(selectedItem.props.max || 5)}
                        onValueChange={(v) => updateProp("max", Number(v))}
                        options={[
                          { value: "5", label: "5 Stars" },
                          { value: "10", label: "10 Stars" },
                        ]}
                      />
                    )}

                    {/* Badge / Chip: tone */}
                    {(selectedItem.type === "badge" || selectedItem.type === "chip") && (
                      <SegmentedControl
                        label="Semantic Tone"
                        size="sm"
                        value={selectedItem.props.tone || "accent"}
                        onValueChange={(v) => updateProp("tone", v)}
                        options={[
                          { value: "accent", label: "Accent" },
                          { value: "neutral", label: "Neutral" },
                          { value: "success", label: "Success" },
                          { value: "warning", label: "Warning" },
                          { value: "error", label: "Error" },
                        ]}
                      />
                    )}

                    <div className="design-studio__inspector-footer">
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => duplicateItem(selectedItem.id)}
                      >
                        <Icons.Copy size={14} />
                        <span>Duplicate</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(selectedItem.id)}
                        className="design-studio__delete-btn"
                      >
                        <Icons.Trash size={14} />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="design-studio__empty-inspector">
                    <Icons.Mouse size={24} className="design-studio__empty-icon" />
                    <strong>No Layer Selected</strong>
                    <p>Click any component on the canvas to configure its valid TypeScript props and interactive states.</p>
                  </div>
                )}
              </div>
            )}

            {/* --- THEME TAB: Palettes and scoped accent-pair contrast --- */}
            {activeRightTab === "theme" && (
              <div className="design-studio__inspector-pane">
                <ColorPicker
                  label="System Accent Hex"
                  value={accent}
                  onValueChange={setAccent}
                  swatches={["#1F5FA8", "#7C3AED", "#16A34A", "#E11D48", "#0284C7", "#D97706", "#4F46E5", "#0F172A"]}
                />

                <SegmentedControl
                  label="Theme Appearance"
                  size="sm"
                  value={mode}
                  onValueChange={(v) => setMode(v as any)}
                  options={[
                    { value: "light", label: "Light Theme" },
                    { value: "dark", label: "Dark Theme" },
                  ]}
                />

                <SegmentedControl
                  label="Surface Material"
                  size="sm"
                  value={material}
                  onValueChange={(v) => setMaterial(v as any)}
                  options={[
                    { value: "solid", label: "Solid Color" },
                    { value: "glass", label: "Frosted Glass" },
                  ]}
                />

                <SegmentedControl
                  label="Ergonomic Density"
                  size="sm"
                  value={density}
                  onValueChange={(v) => setDensity(v as any)}
                  options={[
                    { value: "compact", label: "Compact" },
                    { value: "comfortable", label: "Default" },
                    { value: "touch", label: "Touch 44pt" },
                  ]}
                />

                <SegmentedControl
                  label="Corner Geometry System"
                  size="sm"
                  value={radiusScale}
                  onValueChange={(v) => setRadiusScale(v as any)}
                  options={[
                    { value: "subtle", label: "Subtle (6px)" },
                    { value: "default", label: "Standard (10px)" },
                    { value: "round", label: "Round (16px)" },
                    { value: "pill", label: "Full Pill" },
                  ]}
                />

                  {/* These two pairings are a useful check, not a conformance audit. */}
                <div className="design-studio__contrast-card">
                  <div className="design-studio__contrast-head">
                    <Icons.Shield size={16} />
                      <strong>Accent contrast checks</strong>
                  </div>

                  <div className="design-studio__contrast-row">
                    <span>Accent Fill vs Text</span>
                    <strong className={fillContrast >= 4.5 ? "contrast-pass" : "contrast-warn"}>
                      {fillContrast.toFixed(2)}:1
                    </strong>
                  </div>

                  <div className="design-studio__contrast-row">
                    <span>Accent Text vs Canvas</span>
                    <strong className={textContrast >= 4.5 ? "contrast-pass" : "contrast-warn"}>
                      {textContrast.toFixed(2)}:1
                    </strong>
                  </div>

                  <Badge
                    tone={fillContrast >= 4.5 && textContrast >= 4.5 ? "success" : "warning"}
                  >
                    {fillContrast >= 4.5 && textContrast >= 4.5
                      ? "Both checked pairings meet 4.5:1"
                      : "Review accent contrast"}
                  </Badge>

                  {fillContrast < 4.5 && (
                    <div className="design-studio__contrast-advice">
                      <p>Accent contrast is below 4.5:1. We recommend adjusting lightness for optimal readability.</p>
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          setAccent(mode === "light" ? "#144882" : "#3b82f6");
                          toast({ title: "Applied contrast correction", tone: "success" });
                        }}
                      >
                        Auto-Correct Contrast
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- MOTION TAB: Damped Harmonic Oscillator Simulator --- */}
            {activeRightTab === "motion" && (
              <div className="design-studio__inspector-pane">
                <div className="design-studio__physics-tuner">
                  <strong>Harmonic Oscillator Physics</strong>
                  <p className="orlo-hint">
                    Orlo motion computes physical spring accelerations. Durations are never hardcoded.
                  </p>

                  <Slider
                    label={`Stiffness (k): ${motionPhysics.stiffness}`}
                    min={50}
                    max={600}
                    step={10}
                    value={motionPhysics.stiffness}
                    onValueChange={(v) => setMotionPhysics((p) => ({ ...p, stiffness: v }))}
                  />

                  <Slider
                    label={`Damping (c): ${motionPhysics.damping}`}
                    min={5}
                    max={50}
                    step={1}
                    value={motionPhysics.damping}
                    onValueChange={(v) => setMotionPhysics((p) => ({ ...p, damping: v }))}
                  />

                  <Slider
                    label={`Mass (m): ${motionPhysics.mass}`}
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={motionPhysics.mass}
                    onValueChange={(v) => setMotionPhysics((p) => ({ ...p, mass: Number(v.toFixed(1)) }))}
                  />

                  {/* Preset Buttons */}
                  <div className="design-studio__preset-row">
                    <button
                      type="button"
                      className="design-studio__preset-btn"
                      onClick={() => setMotionPhysics({ stiffness: 120, damping: 14, mass: 1 })}
                    >
                      Gentle
                    </button>
                    <button
                      type="button"
                      className="design-studio__preset-btn"
                      onClick={() => setMotionPhysics({ stiffness: 300, damping: 24, mass: 1 })}
                    >
                      Snappy
                    </button>
                    <button
                      type="button"
                      className="design-studio__preset-btn"
                      onClick={() => setMotionPhysics({ stiffness: 200, damping: 10, mass: 1 })}
                    >
                      Bouncy
                    </button>
                    <button
                      type="button"
                      className="design-studio__preset-btn"
                      onClick={() => setMotionPhysics({ stiffness: 450, damping: 35, mass: 1 })}
                    >
                      Stiff
                    </button>
                  </div>

                  <Switch
                    label="Simulate OS Reduced Motion"
                    checked={reducedMotion}
                    onCheckedChange={setReducedMotion}
                  />

                  {/* Interactive Physics Spring Test Sandbox */}
                  <div className="design-studio__spring-sandbox">
                    <div className="design-studio__sandbox-track">
                      <div
                        className="design-studio__sandbox-ball"
                        style={{
                          transform: `translateX(${reducedMotion ? 0 : springBallOffset}px)`,
                          transition: reducedMotion ? "none" : undefined,
                        }}
                      />
                    </div>
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={triggerSpringSimulation}
                    >
                      <Icons.Play size={14} />
                      <span>Test Spring Impulse</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* --- CODE TAB: Clean Idiomatic TSX --- */}
            {activeRightTab === "code" && (
              <div className="design-studio__inspector-pane">
                <p className="orlo-hint">Exports TSX for a React project using the local Orlo workspace packages. Review layout and behaviour in your app before shipping.</p>
                <Stack direction="row" gap={2}>
                  <Button variant="solid" size="sm" onClick={copyCode}>
                    <Icons.Copy size={15} />
                    <span>Copy Code</span>
                  </Button>
                  <Button variant="subtle" size="sm" onClick={downloadCode}>
                    <Icons.Download size={15} />
                    <span>Download .tsx</span>
                  </Button>
                </Stack>
                <div style={{ marginBlockStart: "1rem" }}>
                  <CodeBlock
                    title="GeneratedScreen.tsx"
                    code={generatedCode}
                    language="tsx"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ---------- STUDIO STATUS BAR (Bottom 32px) ---------- */}
      <footer className="design-studio__statusbar" tabIndex={0} aria-label="Studio status; scroll horizontally for more details">
        <div className="design-studio__statusbar-left">
          <span>{items.length} layers on canvas</span>
          <span className="design-studio__dot-sep" />
          <span>
            {selectedItem
              ? `Selected: #${selectedItem.id} (${selectedItem.type})`
              : "No layer selected"}
          </span>
          <span className="design-studio__dot-sep" />
          <span>8pt Grid: {gridSnap ? "On" : "Off"}</span>
        </div>

        <div className="design-studio__statusbar-center">
          <Badge tone={interactMode ? "success" : "neutral"}>
            {interactMode ? "● Test Mode (Live Controls)" : "■ Design Mode (Select & Move)"}
          </Badge>
        </div>

        <div className="design-studio__statusbar-right">
          <span>{viewport.toUpperCase()}</span>
          <span className="design-studio__dot-sep" />
          <span>Zoom {Math.round(effectiveZoom * 100)}%</span>
          <span className="design-studio__dot-sep" />
          <span title="Stored in browser localStorage">Draft Auto-Saved</span>
        </div>
      </footer>

      {/* ---------- TEMPLATES MODAL DIALOG ---------- */}
      {showTemplatesModal && (
        <div className="design-studio__modal-backdrop" onClick={() => setShowTemplatesModal(false)}>
          <div
            className="design-studio__modal-window"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Design Studio Templates Library"
          >
            <div className="design-studio__modal-header">
              <div>
                <strong>Design Studio Templates Library</strong>
                <p>Starting points to arrange, edit, test and export</p>
              </div>
              <button
                type="button"
                className="design-studio__modal-close"
                onClick={() => setShowTemplatesModal(false)}
              >
                <Icons.X size={18} />
              </button>
            </div>
            <div className="design-studio__templates-grid">
              {STUDIO_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="design-studio__template-card"
                  onClick={() => loadTemplate(tmpl)}
                >
                  <div className="design-studio__template-card-head">
                    <Icons.Zap size={18} className="design-studio__template-icon" />
                    <strong>{tmpl.name}</strong>
                  </div>
                  <p>{tmpl.description}</p>
                  <div className="design-studio__template-meta">
                    <Badge tone="accent">
                      {tmpl.items.length} Components
                    </Badge>
                    <span className="design-studio__template-cta">Load →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component renderer with real live interactivity in Test Mode
function renderStudioComponent(
  item: StudioItem,
  updateProp: (key: string, val: any) => void
): ReactNode {
  switch (item.type) {
    case "button":
      return (
        <Button variant={item.props.variant || "solid"} size={item.props.size || "md"}>
          {item.props.label || "Action"}
        </Button>
      );
    case "async-button":
      return (
        <AsyncButton
          variant={item.props.variant || "solid"}
          action={async () => new Promise((r) => setTimeout(r, item.props.timeoutMs || 1500))}
        >
          {item.props.label || "Deploy"}
        </AsyncButton>
      );
    case "button-group":
      return (
        <ButtonGroup label="Actions">
          {(item.props.labels || ["Action 1", "Action 2"]).map((l: string, i: number) => (
            <Button key={i} variant="subtle" size="sm">
              {l}
            </Button>
          ))}
        </ButtonGroup>
      );
    case "icon-button":
      return (
        <IconButton label={item.props.label || "Heart"}>
          <Icons.Heart size={18} />
        </IconButton>
      );
    case "toggle-button":
      return (
        <ToggleButton defaultPressed={!!item.props.defaultPressed}>
          {item.props.label || "Toggle"}
        </ToggleButton>
      );
    case "segmented-control":
      return (
        <SegmentedControl
          label={item.props.label || "Mode"}
          size="sm"
          value={item.props.value || "Grid"}
          onValueChange={(v) => updateProp("value", v)}
          options={(item.props.options || ["A", "B"]).map((o: string) => ({ value: o, label: o }))}
        />
      );
    case "toggle-group":
      return (
        <ToggleGroup
          label={item.props.label || "Format"}
          type="single"
          value={[item.props.value || "Bold"]}
          onValueChange={(v) => updateProp("value", v[0])}
          items={(item.props.options || ["A", "B"]).map((o: string) => ({ value: o, label: o }))}
        />
      );
    case "text-field":
      return (
        <div style={{ inlineSize: 280 }}>
          <TextField
            label={item.props.label || "Input"}
            placeholder={item.props.placeholder || ""}
            help={item.props.help || ""}
          />
        </div>
      );
    case "text-area":
      return (
        <div style={{ inlineSize: 280 }}>
          <TextArea
            label={item.props.label || "Comments"}
            placeholder={item.props.placeholder || ""}
            resize={item.props.resize || "vertical"}
            style={{ minBlockSize: item.props.minHeight || 80 }}
          />
        </div>
      );
    case "number-field":
      return (
        <NumberField
          label={item.props.label || "Quantity"}
          variant={item.props.variant || "quantity"}
          value={item.props.value ?? 1}
          min={item.props.min ?? 0}
          max={item.props.max ?? 100}
          step={item.props.step ?? 1}
          onValueChange={(v) => updateProp("value", v)}
        />
      );
    case "pin-input":
      return (
        <div>
          <PinInput
            label={item.props.label || "Security PIN"}
            length={item.props.length || 6}
            groupSize={item.props.groupSize || 3}
            error={item.props.simulateError ? "Invalid security code" : undefined}
          />
        </div>
      );
    case "slider":
      return (
        <div style={{ inlineSize: item.props.orientation === "vertical" ? 60 : 220 }}>
          <Slider
            label={item.props.label || "Volume"}
            orientation={item.props.orientation || "horizontal"}
            min={item.props.min ?? 0}
            max={item.props.max ?? 100}
            defaultValue={item.props.defaultValue ?? 60}
          />
        </div>
      );
    case "range-slider":
      return (
        <div style={{ inlineSize: item.props.orientation === "vertical" ? 60 : 240 }}>
          <RangeSlider
            label={item.props.label || "Price Range"}
            orientation={item.props.orientation || "horizontal"}
            min={item.props.min ?? 0}
            max={item.props.max ?? 100}
            defaultValue={item.props.defaultValue || [20, 80]}
          />
        </div>
      );
    case "switch":
      return (
        <Switch
          label={item.props.label || "Toggle"}
          defaultChecked={!!item.props.defaultChecked}
        />
      );
    case "checkbox":
      return (
        <Checkbox
          label={item.props.label || "Option"}
          defaultChecked={!!item.props.defaultChecked}
        />
      );
    case "radio-group":
      return (
        <RadioGroup
          legend={item.props.label || "Option"}
          name={`radio-${item.id}`}
          options={(item.props.options || ["A", "B"]).map((o: string) => ({ value: o, label: o }))}
          defaultValue={item.props.defaultValue || "A"}
        />
      );
    case "color-picker":
      return (
        <ColorPicker
          label={item.props.label || "Color"}
          defaultValue={item.props.defaultValue || "#1F5FA8"}
        />
      );
    case "file-dropzone":
      return (
        <div style={{ inlineSize: 320 }}>
          <FileDropzone
            label={item.props.label || "File upload"}
            accept={item.props.accept || ".pdf,image/*"}
            maxFiles={item.props.maxFiles || 4}
            maxSize={item.props.maxSize || 5242880}
          />
        </div>
      );
    case "rating":
      return (
        <Rating
          label={item.props.label || "Rating"}
          max={item.props.max || 5}
          defaultValue={item.props.defaultValue || 5}
        />
      );
    case "badge":
      return (
        <Badge tone={item.props.tone || "accent"}>
          {item.props.label || "Production"}
        </Badge>
      );
    case "stat-card":
      return (
        <div style={{ inlineSize: 260 }}>
          <StatCard
            label={item.props.label || "Metric"}
            value={item.props.value || "1,200"}
            delta={item.props.delta || 0}
            deltaLabel={item.props.deltaLabel || ""}
          />
        </div>
      );
    case "chip":
      return (
        <Chip selected={!!item.props.selected}>
          {item.props.label || "Design token"}
        </Chip>
      );
    case "avatar":
      return (
        <Avatar
          name={item.props.name || "Varun"}
          size={item.props.size || "md"}
          variant={item.props.variant || "marble"}
        />
      );
    case "pie-chart":
      return (
        <div style={{ inlineSize: 280 }}>
          <PieChart
            title={item.props.title || "Traffic Sources"}
            data={item.props.data || []}
          />
        </div>
      );
    case "sparkline":
      return (
        <div style={{ inlineSize: 240 }}>
          <Sparkline
            label={item.props.label || "Trend"}
            data={item.props.data || [10, 25, 18, 42, 60]}
          />
        </div>
      );
    case "progress":
      return (
        <div style={{ inlineSize: 240 }}>
          <Progress label={item.props.label || "Progress"} value={item.props.value || 50} />
        </div>
      );
    case "spinner":
      return <Spinner size={item.props.size || "md"} />;
    case "callout":
      return (
        <div style={{ inlineSize: 340 }}>
          <Callout
            title={item.props.title || "Note"}
            tone={item.props.tone || "note"}
          >
            {item.props.message || ""}
          </Callout>
        </div>
      );
    case "card":
      return (
        <div style={{ inlineSize: 300 }}>
          <Card>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "1rem", fontWeight: 600 }}>
              {item.props.title || "Security"}
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--orlo-color-fg-muted)" }}>
              {item.props.description || ""}
            </p>
          </Card>
        </div>
      );
    default:
      return null;
  }
}
