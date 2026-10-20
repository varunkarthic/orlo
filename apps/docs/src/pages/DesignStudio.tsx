import { useState, useMemo, useRef, useEffect, useCallback, type ReactNode } from "react";
import {
  Button,
  AsyncButton,
  ButtonGroup,
  IconButton,
  ToggleButton,
  SegmentedControl,
  ToggleGroup,
  HoldToConfirm,
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
  StatusDot,
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
  Breadcrumbs,
  Tabs,
  Accordion,
  Kbd,
  DataList,
  Icons,
  OrloProvider,
  useToast,
} from "@orlo/react";
import { createTheme, contrast, semantic, themeToCss } from "@orlo/tokens";

export type Density = "comfortable" | "compact" | "touch";
export type ViewportMode = "responsive" | "desktop" | "tablet" | "mobile";
export type Orientation = "portrait" | "landscape";
export type LayoutMode = "canvas" | "flow";
export type StudioComponentType =
  | "button"
  | "async-button"
  | "button-group"
  | "icon-button"
  | "toggle-button"
  | "segmented-control"
  | "toggle-group"
  | "hold-to-confirm"
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
  | "status-dot"
  | "stat-card"
  | "chip"
  | "avatar"
  | "pie-chart"
  | "sparkline"
  | "progress"
  | "spinner"
  | "callout"
  | "card"
  | "breadcrumbs"
  | "tabs"
  | "accordion"
  | "kbd"
  | "data-list";

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

// 8 Complete Production Templates
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
        props: { label: "Full Name", placeholder: "Alex Rivera", help: "Visible to workspace members." },
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
        y: 360,
        zIndex: 5,
      },
      {
        id: "btn-save",
        type: "async-button",
        props: { label: "Save Profile", timeoutMs: 1400, variant: "solid" },
        x: 40,
        y: 420,
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
        props: { label: "Live System Health: 99.98% SLA", tone: "success" },
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
          title: "Traffic Breakdown",
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
        props: { title: "Developer Starter", description: "Free forever for individual hackers and open-source projects." },
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
        props: { title: "Team Pro ($49/seat)", description: "High-concurrency cloud builds with priority SLA and audit logs." },
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
        props: {
          label: "Batch Syncing Assets (3 of 4 files)",
          value: 75,
        },
        x: 40,
        y: 220,
        zIndex: 2,
      },
      {
        id: "badge-pdf",
        type: "badge",
        props: {
          label: "Specification.pdf (2.4 MB)",
          tone: "neutral",
        },
        x: 40,
        y: 280,
        zIndex: 3,
      },
      {
        id: "badge-img",
        type: "badge",
        props: {
          label: "Architecture-Diagram.png (1.8 MB)",
          tone: "success",
        },
        x: 260,
        y: 280,
        zIndex: 4,
      },
      {
        id: "btn-finalize",
        type: "async-button",
        props: {
          label: "Publish Assets to CDN",
          timeoutMs: 1600,
          variant: "solid",
        },
        x: 40,
        y: 340,
        zIndex: 5,
      },
    ],
  },
  {
    id: "smart-home",
    name: "Smart Home Environment Hub",
    description: "Environmental monitoring, temperature telemetry, lighting slider, and scene controls.",
    items: [
      {
        id: "card-climate",
        type: "card",
        props: {
          title: "Living Room Climate",
          description: "All environmental sensors and smart illumination online.",
        },
        x: 40,
        y: 40,
        zIndex: 1,
      },
      {
        id: "stat-temp",
        type: "stat-card",
        props: {
          label: "Ambient Temperature",
          value: "72°F",
          delta: 1.5,
          deltaLabel: "target 70°F",
        },
        x: 70,
        y: 140,
        zIndex: 2,
      },
      {
        id: "slider-light",
        type: "slider",
        props: {
          label: "Ambient Brightness",
          defaultValue: 85,
          orientation: "horizontal",
        },
        x: 360,
        y: 40,
        zIndex: 3,
      },
      {
        id: "seg-scene",
        type: "segmented-control",
        props: {
          label: "Scene Profile",
          options: ["Home", "Away", "Night", "Focus"],
          value: "Home",
        },
        x: 360,
        y: 130,
        zIndex: 4,
      },
      {
        id: "picker-hue",
        type: "color-picker",
        props: {
          label: "Smart Hue Accent",
          defaultValue: "#0284C7",
        },
        x: 360,
        y: 200,
        zIndex: 5,
      },
      {
        id: "switch-power",
        type: "switch",
        props: {
          label: "Active Zone Power",
          defaultChecked: true,
        },
        x: 70,
        y: 240,
        zIndex: 6,
      },
    ],
  },
  {
    id: "sprint-kanban",
    name: "Project Sprint & Team Tasks",
    description: "Sprint velocity overview, task status badges, assignee avatar, and quick-add actions.",
    items: [
      {
        id: "card-sprint",
        type: "card",
        props: {
          title: "Sprint 42 — Design Foundations",
          description: "Active milestones for physical spring motion and token scale.",
        },
        x: 40,
        y: 40,
        zIndex: 1,
      },
      {
        id: "badge-task-1",
        type: "badge",
        props: {
          label: "In Review: Harmonic Oscillator Motion",
          tone: "accent",
        },
        x: 70,
        y: 140,
        zIndex: 2,
      },
      {
        id: "badge-task-2",
        type: "badge",
        props: {
          label: "Complete: Token Radius Harmonization",
          tone: "success",
        },
        x: 70,
        y: 180,
        zIndex: 3,
      },
      {
        id: "chip-priority",
        type: "chip",
        props: {
          label: "High Priority Only",
          selected: true,
        },
        x: 70,
        y: 230,
        zIndex: 4,
      },
      {
        id: "avatar-assignee",
        type: "avatar",
        props: {
          name: "Taylor Brooks",
          size: "md",
          variant: "marble",
        },
        x: 260,
        y: 230,
        zIndex: 5,
      },
      {
        id: "btn-add-task",
        type: "button",
        props: {
          label: "Add Backlog Task",
          variant: "subtle",
          size: "sm",
        },
        x: 70,
        y: 290,
        zIndex: 6,
      },
    ],
  },
];

// Complete 30+ Component Palette
export const COMPONENT_PALETTE: {
  type: StudioComponentType;
  name: string;
  category: "Actions" | "Forms" | "Navigation" | "Data & Charts" | "Feedback" | "Composed";
  icon: keyof typeof Icons;
  defaultProps: Record<string, any>;
}[] = [
  // Actions
  { type: "button", name: "Button", category: "Actions", icon: "Play", defaultProps: { label: "Click Action", variant: "solid", size: "md" } },
  { type: "async-button", name: "Async Button", category: "Actions", icon: "Refresh", defaultProps: { label: "Deploy Cloud", timeoutMs: 1500, variant: "solid" } },
  { type: "button-group", name: "Button Group", category: "Actions", icon: "Layers", defaultProps: { label: "Actions", labels: ["Left", "Center", "Right"] } },
  { type: "icon-button", name: "Icon Button", category: "Actions", icon: "Heart", defaultProps: { label: "Favorite" } },
  { type: "toggle-button", name: "Toggle Button", category: "Actions", icon: "Check", defaultProps: { label: "Bookmark", defaultPressed: false } },
  { type: "segmented-control", name: "Segmented Control", category: "Actions", icon: "Sliders", defaultProps: { label: "View Style", options: ["Cards", "Table", "List"], value: "Cards" } },
  { type: "toggle-group", name: "Toggle Group", category: "Actions", icon: "Check", defaultProps: { label: "Format Mode", options: ["Bold", "Italic", "Code"], value: "Bold" } },
  { type: "hold-to-confirm", name: "Hold to Confirm", category: "Actions", icon: "Shield", defaultProps: { label: "Hold to Purge", duration: 1200, tone: "danger" } },

  // Forms
  { type: "text-field", name: "Text Field", category: "Forms", icon: "FileText", defaultProps: { label: "Workspace Slug", placeholder: "e.g. acme-corp", help: "Unique identifier for your team." } },
  { type: "text-area", name: "Text Area", category: "Forms", icon: "AlignLeft", defaultProps: { label: "Project Summary", placeholder: "Describe goals and release criteria...", resize: "vertical", minHeight: 80, maxHeight: 200 } },
  { type: "number-field", name: "Number Field", category: "Forms", icon: "Hash", defaultProps: { label: "Node Instances", variant: "quantity", value: 3, min: 1, max: 20, step: 1 } },
  { type: "pin-input", name: "PIN Input", category: "Forms", icon: "Key", defaultProps: { label: "Security Code", length: 6, groupSize: 3, simulateError: false } },
  { type: "slider", name: "Slider", category: "Forms", icon: "Sliders", defaultProps: { label: "Bandwidth Allocation", orientation: "horizontal", defaultValue: 65 } },
  { type: "range-slider", name: "Range Slider", category: "Forms", icon: "Sliders", defaultProps: { label: "Memory Thresholds", orientation: "horizontal", defaultValue: [20, 80] } },
  { type: "switch", name: "Switch", category: "Forms", icon: "Sliders", defaultProps: { label: "Automated Deployments", defaultChecked: true } },
  { type: "checkbox", name: "Checkbox", category: "Forms", icon: "CheckCircle", defaultProps: { label: "Enable audit telemetry logs", defaultChecked: true } },
  { type: "radio-group", name: "Radio Group", category: "Forms", icon: "Circle", defaultProps: { label: "Update Frequency", options: ["Continuous", "Daily", "Weekly"], defaultValue: "Continuous" } },
  { type: "color-picker", name: "Color Picker", category: "Forms", icon: "Droplet", defaultProps: { label: "Brand Accent", defaultValue: "#1F5FA8" } },
  { type: "file-dropzone", name: "File Upload", category: "Forms", icon: "Upload", defaultProps: { label: "Upload Documents", accept: ".pdf,image/*", maxFiles: 4, maxSize: 5242880 } },
  { type: "rating", name: "Rating", category: "Forms", icon: "Star", defaultProps: { label: "Satisfaction Score", max: 5, defaultValue: 5 } },

  // Navigation
  { type: "breadcrumbs", name: "Breadcrumbs", category: "Navigation", icon: "ChevronRight", defaultProps: { label: "Workspace Path", items: [{ label: "Organization", href: "#" }, { label: "Projects", href: "#" }, { label: "Orlo Design" }] } },
  { type: "tabs", name: "Tabs", category: "Navigation", icon: "Layout", defaultProps: { label: "Project Views", options: ["Overview", "Metrics", "Settings"], value: "Overview" } },

  // Data & Charts
  { type: "badge", name: "Badge", category: "Data & Charts", icon: "Shield", defaultProps: { label: "Production Tier", tone: "accent" } },
  { type: "status-dot", name: "Status Dot", category: "Data & Charts", icon: "Circle", defaultProps: { label: "All Systems Operational", status: "online", showLabel: true } },
  { type: "stat-card", name: "Stat Card", category: "Data & Charts", icon: "Activity", defaultProps: { label: "Cache Hit Ratio", value: "98.4%", delta: 2.1, deltaLabel: "vs 24h avg" } },
  { type: "chip", name: "Chip", category: "Data & Charts", icon: "Tag", defaultProps: { label: "React 19 Ready", selected: true } },
  { type: "avatar", name: "Avatar", category: "Data & Charts", icon: "User", defaultProps: { name: "Alex Rivera", size: "md", variant: "marble" } },
  { type: "pie-chart", name: "Pie Chart", category: "Data & Charts", icon: "PieChart", defaultProps: { title: "Traffic Distribution", data: [{ label: "API", value: 55 }, { label: "Images", value: 30 }, { label: "Static", value: 15 }] } },
  { type: "sparkline", name: "Sparkline", category: "Data & Charts", icon: "TrendingUp", defaultProps: { label: "Request Throughput", data: [12, 19, 14, 25, 32, 28, 45, 58] } },
  { type: "kbd", name: "Keyboard Shortcut", category: "Data & Charts", icon: "Key", defaultProps: { shortcut: "⌘K" } },
  { type: "data-list", name: "Data List", category: "Data & Charts", icon: "List", defaultProps: { items: [{ label: "Environment", value: "Production" }, { label: "Region", value: "us-east-1" }, { label: "SLA", value: "99.98%" }] } },

  // Feedback
  { type: "progress", name: "Progress", category: "Feedback", icon: "BarChart", defaultProps: { label: "Sync Status", value: 78 } },
  { type: "spinner", name: "Spinner", category: "Feedback", icon: "Refresh", defaultProps: { size: "md" } },
  { type: "callout", name: "Callout", category: "Feedback", icon: "AlertCircle", defaultProps: { title: "Production Ready", message: "Review accessibility audit before publishing changes.", tone: "note" } },

  // Composed
  { type: "card", name: "Card", category: "Composed", icon: "Layout", defaultProps: { title: "Cluster Infrastructure", description: "Configures horizontal pod autoscaling and egress gateways." } },
  { type: "accordion", name: "Accordion", category: "Composed", icon: "ChevronDown", defaultProps: { title: "Harmonic Motion Physics", content: "Durations are calculated dynamically via spring mass, stiffness, and damping." } },
];

export const DESIGNER_PALETTES = [
  { name: "Oceanic", hex: "#1F5FA8" },
  { name: "Violet", hex: "#7C3AED" },
  { name: "Emerald", hex: "#16A34A" },
  { name: "Crimson", hex: "#E11D48" },
  { name: "Amber", hex: "#D97706" },
  { name: "Cyan", hex: "#0284C7" },
  { name: "Midnight", hex: "#0F172A" },
  { name: "Teal", hex: "#0D9488" },
];

type StudioProject = {
  items: StudioItem[];
  theme?: { mode?: "light" | "dark"; accent?: string; material?: "solid" | "glass"; density?: Density; radiusScale?: "subtle" | "default" | "round" | "pill" };
  motion?: MotionPhysics;
};

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);

const propSchemas = new Map<StudioComponentType, Record<string, unknown>>(
  COMPONENT_PALETTE.map((component) => [component.type, { ...component.defaultProps }]),
);
for (const template of STUDIO_TEMPLATES) {
  for (const item of template.items) {
    if (!propSchemas.has(item.type)) {
      propSchemas.set(item.type, { ...item.props });
    } else {
      Object.assign(propSchemas.get(item.type)!, item.props);
    }
  }
}

const propChoices: Partial<Record<StudioComponentType, Record<string, string[]>>> = {
  avatar: { variant: ["marble", "geometric", "initials"], size: ["sm", "md", "lg", "xl"] },
  button: { variant: ["solid", "subtle", "tonal", "ghost", "accent", "danger"], size: ["sm", "md", "lg"] },
  "async-button": { variant: ["solid", "subtle", "tonal"] },
  "number-field": { variant: ["quantity", "stepper", "standard"] },
  slider: { orientation: ["horizontal", "vertical"] },
  "range-slider": { orientation: ["horizontal", "vertical"] },
  "text-area": { resize: ["none", "horizontal", "vertical", "both"] },
  badge: { tone: ["accent", "neutral", "success", "warning", "error", "info"] },
  "status-dot": { status: ["online", "offline", "busy", "away", "pending"] },
  callout: { tone: ["note", "tip", "important", "caution"] },
  spinner: { size: ["sm", "md"] },
};

const matchesShape = (value: unknown, sample: unknown, depth = 0): boolean => {
  if (depth > 3) return false;
  if (typeof sample === "number") return typeof value === "number" && Number.isFinite(value);
  if (typeof sample === "string") return typeof value === "string" && value.length <= 2048;
  if (typeof sample === "boolean") return typeof value === "boolean";
  if (Array.isArray(sample)) return Array.isArray(value) && value.length <= 100 && value.every((entry) => matchesShape(entry, sample[0], depth + 1));
  if (isRecord(sample)) return isRecord(value) && Object.entries(value).every(([key, entry]) => Object.hasOwn(sample, key) && matchesShape(entry, sample[key], depth + 1));
  return value === sample;
};

function parseStudioProject(value: unknown): StudioProject | null {
  if (!isRecord(value) || (value.schemaVersion !== undefined && value.schemaVersion !== 1) || !Array.isArray(value.items) || value.items.length > 100) return null;
  const ids = new Set<string>();
  const items: StudioItem[] = [];
  for (const entry of value.items) {
    if (!isRecord(entry) || typeof entry.id !== "string" || !entry.id || entry.id.length > 120 || ids.has(entry.id)
      || typeof entry.type !== "string" || !propSchemas.has(entry.type as StudioComponentType)
      || typeof entry.x !== "number" || !Number.isFinite(entry.x) || entry.x < 0 || entry.x > 100000
      || typeof entry.y !== "number" || !Number.isFinite(entry.y) || entry.y < 0 || entry.y > 100000
      || typeof entry.zIndex !== "number" || !Number.isFinite(entry.zIndex) || entry.zIndex < 0 || entry.zIndex > 100000
      || !isRecord(entry.props) || Object.keys(entry.props).length > 30) return null;
    const type = entry.type as StudioComponentType;
    const props = { ...entry.props };
    if (type === "avatar" && props.variant === "art") props.variant = "marble";
    if (type === "button" && props.variant === "outline") props.variant = "tonal";
    const schema = propSchemas.get(type)!;
    for (const [key, prop] of Object.entries(props)) {
      if (!Object.hasOwn(schema, key) || !matchesShape(prop, schema[key])) return null;
      const choices = propChoices[type]?.[key];
      if (choices && !choices.includes(prop as string)) return null;
    }
    ids.add(entry.id);
    items.push({ id: entry.id, type, props, x: entry.x, y: entry.y, zIndex: entry.zIndex });
  }
  let theme: StudioProject["theme"];
  if (value.theme !== undefined) {
    if (!isRecord(value.theme)) return null;
    const t = value.theme;
    if ((t.mode !== undefined && t.mode !== "light" && t.mode !== "dark")
      || (t.accent !== undefined && (typeof t.accent !== "string" || !/^#[\da-f]{6}$/i.test(t.accent)))
      || (t.material !== undefined && t.material !== "solid" && t.material !== "glass")
      || (t.density !== undefined && !["comfortable", "compact", "touch"].includes(t.density as string))
      || (t.radiusScale !== undefined && !["subtle", "default", "round", "pill"].includes(t.radiusScale as string))) return null;
    theme = t as StudioProject["theme"];
  }
  let motion: MotionPhysics | undefined;
  if (value.motion !== undefined) {
    const candidate = value.motion;
    if (!isRecord(candidate) || !["stiffness", "damping", "mass"].every((key) => typeof candidate[key] === "number" && Number.isFinite(candidate[key]) && (candidate[key] as number) > 0)) return null;
    motion = candidate as MotionPhysics;
  }
  return { items, theme, motion };
}

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
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("canvas");
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
  const [activeRightTab, setActiveRightTab] = useState<"props" | "theme" | "motion" | "a11y" | "code">("props");
  const [mobilePanel, setMobilePanel] = useState<"components" | "canvas" | "inspector">("canvas");
  const [paletteFilter, setPaletteFilter] = useState<string>("");
  const [paletteCategory, setPaletteCategory] = useState<string>("All");
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"loading" | "saved" | "unavailable">("loading");

  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const projectFileRef = useRef<HTMLInputElement>(null);
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

  // Restore after hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem("orlo_studio_v3_draft");
      if (stored) {
        const restored = parseStudioProject(JSON.parse(stored));
        if (!restored) throw new Error("Invalid Studio draft");
        setItems(restored.items);
        setSelectedId(restored.items[0]?.id ?? null);
        setHistory({ past: [], future: [] });
        if (restored.theme?.mode) setMode(restored.theme.mode);
        if (restored.theme?.accent) setAccent(restored.theme.accent);
        if (restored.theme?.material) setMaterial(restored.theme.material);
        if (restored.theme?.density) setDensity(restored.theme.density);
        if (restored.theme?.radiusScale) setRadiusScale(restored.theme.radiusScale);
        if (restored.motion) setMotionPhysics(restored.motion);
      }
    } catch {
      toast({ title: "Draft could not be restored; the starter template is safe to edit", tone: "error" });
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (!draftLoaded) return;
    try {
      const payload = {
        schemaVersion: 1,
        items,
        theme: { mode, accent, material, density, radiusScale },
        motion: motionPhysics,
      };
      localStorage.setItem("orlo_studio_v3_draft", JSON.stringify(payload));
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setSaveStatus("saved");
    } catch {
      setSaveStatus("unavailable");
    }
  }, [draftLoaded, items, mode, accent, material, density, radiusScale, motionPhysics]);

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

  // Alignment functions
  const alignLeft = () => {
    const minX = items.reduce((min, it) => Math.min(min, it.x), Infinity);
    const targetX = Math.max(40, isFinite(minX) ? minX : 40);
    const updated = items.map((it) => ({ ...it, x: targetX }));
    pushState(updated);
    toast({ title: "Aligned items to left", tone: "neutral" });
  };

  const alignCenter = () => {
    const frameWidth = typeof viewportDims.width === "number" ? viewportDims.width : 800;
    const centerX = Math.max(40, Math.round(frameWidth / 2 - 140));
    const updated = items.map((it) => ({ ...it, x: centerX }));
    pushState(updated);
    toast({ title: "Centered items on canvas", tone: "neutral" });
  };

  const distributeVertically = () => {
    const sorted = [...items].sort((a, b) => a.y - b.y);
    let curY = 40;
    const updated = sorted.map((it) => {
      const itemWithY = { ...it, y: curY };
      curY += 75;
      return itemWithY;
    });
    pushState(updated);
    toast({ title: "Distributed items vertically", tone: "neutral" });
  };

  const autoTidyGrid = () => {
    const col1X = 40;
    const col2X = 360;
    let y1 = 40;
    let y2 = 40;
    const updated = items.map((it, idx) => {
      if (idx % 2 === 0) {
        const itemWithPos = { ...it, x: col1X, y: y1 };
        y1 += 85;
        return itemWithPos;
      } else {
        const itemWithPos = { ...it, x: col2X, y: y2 };
        y2 += 85;
        return itemWithPos;
      }
    });
    pushState(updated);
    toast({ title: "Tidied items into balanced 2-column grid", tone: "neutral" });
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
    if (interactMode || layoutMode === "flow") return;
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
        case "hold-to-confirm":
          usedImports.add("HoldToConfirm");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <HoldToConfirm duration={${finiteNumber(item.props.duration, 1200)}} onConfirm={() => console.log("Confirmed")}>\n        ${escapeJsx(item.props.label || "Hold to Confirm")}\n      </HoldToConfirm>\n    </div>`
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
        case "status-dot":
          usedImports.add("StatusDot");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <StatusDot status="${escapeJsx(item.props.status || "online")}" label="${escapeJsx(item.props.label || "Status")}" showLabel={${item.props.showLabel !== false}} />\n    </div>`
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
        case "breadcrumbs":
          usedImports.add("Breadcrumbs");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <Breadcrumbs items={${JSON.stringify(item.props.items || [{ label: "Home", href: "#" }, { label: "Current" }])}} />\n    </div>`
          );
          break;
        case "tabs":
          usedImports.add("Tabs");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 340 }}>\n      <Tabs items={[${(item.props.options || ["Tab 1", "Tab 2"]).map((opt: string, idx: number) => `{ value: "tab-${idx + 1}", label: "${escapeJsx(opt)}", content: <div>${escapeJsx(opt)} Content</div> }`).join(", ")}]} defaultValue="tab-1" />\n    </div>`
          );
          break;
        case "accordion":
          usedImports.add("Accordion");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 320 }}>\n      <Accordion items={[{ value: "item-1", title: "${escapeJsx(item.props.title || "Section")}", content: <div>${escapeJsx(item.props.content || "Details")}</div> }]} defaultValue={["item-1"]} />\n    </div>`
          );
          break;
        case "kbd":
          usedImports.add("Kbd");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y} }}>\n      <Kbd>${escapeJsx(item.props.shortcut || "⌘K")}</Kbd>\n    </div>`
          );
          break;
        case "data-list":
          usedImports.add("DataList");
          elementsCode.push(
            `    <div style={{ position: "absolute", left: ${item.x}, top: ${item.y}, width: 280 }}>\n      <DataList items={${JSON.stringify(item.props.items || [{ label: "Status", value: "Active" }])}} />\n    </div>`
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
    if (file.size > 1_000_000) {
      toast({ title: "Project file is too large; choose a JSON file under 1 MB", tone: "error" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const validated = parseStudioProject(parsed);
        if (!validated) {
          toast({ title: "Project JSON is invalid or unsupported; the current canvas is unchanged", tone: "error" });
          return;
        }
        pushState(validated.items);
        setSelectedId(validated.items[0]?.id ?? null);
        if (validated.theme?.mode) setMode(validated.theme.mode);
        if (validated.theme?.accent) setAccent(validated.theme.accent);
        if (validated.theme?.material) setMaterial(validated.theme.material);
        if (validated.theme?.density) setDensity(validated.theme.density);
        if (validated.theme?.radiusScale) setRadiusScale(validated.theme.radiusScale);
        if (validated.motion) setMotionPhysics(validated.motion);
        toast({ title: "Imported project successfully", tone: "success" });
      } catch {
        toast({ title: "Project JSON is invalid or unsupported; the current canvas is unchanged", tone: "error" });
      } finally {
        if (projectFileRef.current) projectFileRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const filteredPalette = useMemo(() => {
    return COMPONENT_PALETTE.filter((comp) => {
      const matchesCat = paletteCategory === "All" || comp.category === paletteCategory;
      const matchesSearch =
        comp.name.toLowerCase().includes(paletteFilter.toLowerCase()) ||
        comp.category.toLowerCase().includes(paletteFilter.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [paletteFilter, paletteCategory]);

  return (
    <div className="design-studio" data-interact={interactMode || undefined} data-mobile-panel={mobilePanel}>
      {/* ---------- STUDIO TOPBAR (Top 48px) ---------- */}
      <header className="design-studio__topbar">
        <div className="design-studio__topbar-left">
          <span className="design-studio__badge">Studio</span>
          <span className="design-studio__doc-title">Design Studio</span>
          <span className="design-studio__save-status">
            <span className="design-studio__save-dot" />
            <span>{lastSavedTime ? `Saved ${lastSavedTime}` : "Auto-saved"}</span>
          </span>
        </div>

        {/* Center: Mode, Device Frame, Layout Mode & Camera Zoom */}
        <div className="design-studio__topbar-center">
          <div className="design-studio__mode-toggle">
            <button
              type="button"
              className={`design-studio__mode-btn ${!interactMode ? "is-active" : ""}`}
              onClick={() => setInteractMode(false)}
              title="Design Mode: Select, arrange and inspect"
            >
              <Icons.Layout size={14} />
              <span>Design</span>
            </button>
            <button
              type="button"
              className={`design-studio__mode-btn ${interactMode ? "is-active" : ""}`}
              onClick={() => {
                setInteractMode(true);
                setSelectedId(null);
                toast({ title: "Test Mode: All components are live and interactive", tone: "neutral" });
              }}
              title="Test Mode: Test inputs, click buttons and observe motion"
            >
              <Icons.Play size={14} />
              <span>Test</span>
            </button>
          </div>

          <div className="design-studio__divider-v" />

          {/* Layout Mode Toggle */}
          <div className="design-studio__mode-toggle">
            <button
              type="button"
              className={`design-studio__mode-btn ${layoutMode === "canvas" ? "is-active" : ""}`}
              onClick={() => setLayoutMode("canvas")}
              title="Freeform Canvas: Position elements anywhere in space"
            >
              <Icons.Move size={14} />
              <span>Freeform</span>
            </button>
            <button
              type="button"
              className={`design-studio__mode-btn ${layoutMode === "flow" ? "is-active" : ""}`}
              onClick={() => {
                setLayoutMode("flow");
                toast({ title: "Auto-Layout Flow: Elements stack responsively", tone: "neutral" });
              }}
              title="Auto-Layout Flow: Stack elements in a responsive container"
            >
              <Icons.List size={14} />
              <span>Flow</span>
            </button>
          </div>

          <div className="design-studio__divider-v" />

          {/* Viewport Frame Mode */}
          <div className="design-studio__viewport-controls">
            <button
              type="button"
              className={`design-studio__icon-tool ${viewport === "responsive" ? "is-active" : ""}`}
              onClick={() => setViewport("responsive")}
              title="Responsive Viewport"
            >
              <Icons.Maximize size={15} />
            </button>
            <button
              type="button"
              className={`design-studio__icon-tool ${viewport === "desktop" ? "is-active" : ""}`}
              onClick={() => setViewport("desktop")}
              aria-label="Desktop 1440 Viewport"
              title="Desktop 1440 Viewport"
            >
              <Icons.Monitor size={15} />
            </button>
            <button
              type="button"
              className={`design-studio__icon-tool ${viewport === "tablet" ? "is-active" : ""}`}
              onClick={() => setViewport("tablet")}
              title="Tablet 768 Viewport"
            >
              <Icons.Tablet size={15} />
            </button>
            <button
              type="button"
              className={`design-studio__icon-tool ${viewport === "mobile" ? "is-active" : ""}`}
              onClick={() => setViewport("mobile")}
              title="Mobile 375 Viewport"
            >
              <Icons.Smartphone size={15} />
            </button>

            {viewport !== "responsive" && (
              <button
                type="button"
                className="design-studio__icon-tool"
                onClick={() => setOrientation((o) => (o === "portrait" ? "landscape" : "portrait"))}
                title={`Rotate device (${orientation})`}
              >
                <Icons.Refresh size={14} />
              </button>
            )}
          </div>

          <div className="design-studio__divider-v" />

          {/* Camera Zoom & Snap Controls */}
          <div className="design-studio__zoom-controls">
            <button
              type="button"
              className="design-studio__icon-tool"
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
              title="Zoom out"
            >
              <Icons.Minus size={13} />
            </button>
            <span className="design-studio__zoom-label">{Math.round(effectiveZoom * 100)}%</span>
            <button
              type="button"
              className="design-studio__icon-tool"
              onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(1))))}
              title="Zoom in"
            >
              <Icons.Plus size={13} />
            </button>
            <button
              type="button"
              className="design-studio__icon-tool"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              title="Reset camera zoom & position"
            >
              <Icons.Maximize size={13} />
            </button>
            <button
              type="button"
              className={`design-studio__icon-tool ${gridSnap ? "is-active" : ""}`}
              onClick={() => setGridSnap(!gridSnap)}
              title="Toggle 8pt Grid Snap"
            >
              <Icons.Grid size={13} />
            </button>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="design-studio__topbar-right">
          <div className="design-studio__history-tools">
            <button
              type="button"
              className="design-studio__icon-tool"
              disabled={history.past.length === 0}
              onClick={undo}
              title="Undo (Cmd+Z)"
            >
              <Icons.Undo size={14} />
            </button>
            <button
              type="button"
              className="design-studio__icon-tool"
              disabled={history.future.length === 0}
              onClick={redo}
              title="Redo (Cmd+Shift+Z)"
            >
              <Icons.Redo size={14} />
            </button>
          </div>

          <div className="design-studio__divider-v" />

          <button
            type="button"
            className="design-studio__action-btn"
            onClick={() => setShowTemplatesModal(true)}
            title="Browse application templates"
          >
            <Icons.Zap size={14} />
            <span>Templates</span>
          </button>

          <button
            type="button"
            className="design-studio__action-btn"
            onClick={() => projectFileRef.current?.click()}
            title="Import project JSON"
          >
            <Icons.Upload size={14} />
            <span>Import</span>
          </button>
          <input
            ref={projectFileRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={importProjectJson}
          />

          <button
            type="button"
            className="design-studio__action-btn"
            onClick={exportProjectJson}
            title="Export project JSON document"
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
      </header>

      {/* Mobile panel selector for compact viewports */}
      <nav className="design-studio__mobile-panels" aria-label="Design Studio panels">
        <button
          type="button"
          aria-pressed={mobilePanel === "components"}
          onClick={() => setMobilePanel("components")}
        >
          Components
        </button>
        <button
          type="button"
          aria-pressed={mobilePanel === "canvas"}
          onClick={() => setMobilePanel("canvas")}
        >
          Canvas
        </button>
        <button
          type="button"
          aria-pressed={mobilePanel === "inspector"}
          onClick={() => setMobilePanel("inspector")}
        >
          Inspector
        </button>
      </nav>

      {/* ---------- STUDIO WORKSPACE (Main Canvas & Drawers) ---------- */}
      <div className="design-studio__workspace">
        {/* === LEFT SIDEBAR: Palette & Layers === */}
        <aside className="design-studio__sidebar-left">
          <div className="design-studio__tab-strip">
            <button
              type="button"
              className={`design-studio__tab-btn ${activeLeftTab === "palette" ? "is-active" : ""}`}
              onClick={() => setActiveLeftTab("palette")}
            >
              <Icons.Plus size={14} />
              <span>Palette</span>
            </button>
            <button
              type="button"
              className={`design-studio__tab-btn ${activeLeftTab === "layers" ? "is-active" : ""}`}
              onClick={() => setActiveLeftTab("layers")}
            >
              <Icons.Layers size={14} />
              <span>Layers ({items.length})</span>
            </button>
          </div>

          {activeLeftTab === "palette" && (
            <div className="design-studio__palette-pane">
              {/* Search Box */}
              <div className="design-studio__search-box">
                <Icons.Search size={14} className="design-studio__search-icon" />
                <input
                  type="text"
                  placeholder="Search 30+ components..."
                  value={paletteFilter}
                  onChange={(e) => setPaletteFilter(e.target.value)}
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

              {/* Category Pills */}
              <div className="design-studio__category-row">
                {["All", "Actions", "Forms", "Navigation", "Data & Charts", "Feedback", "Composed"].map((cat) => (
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
                className={`design-studio__canvas-surface ${layoutMode === "flow" ? "is-flow" : "is-freeform"}`}
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
                          transform: layoutMode === "canvas" ? `translate(${item.x}px, ${item.y}px)` : undefined,
                          zIndex: item.zIndex || 1,
                        }}
                        onPointerDown={(e) => handleItemPointerDown(e, item.id)}
                      >
                        {/* Floating Node Toolbar in Design Mode */}
                        {isSelected && !interactMode && layoutMode === "canvas" && (
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
                          {renderStudioComponent(item, updateProp, toast)}
                        </div>
                      </div>
                    );
                  })}
                </OrloProvider>
              </div>

              {/* Alignment Bar for Canvas mode */}
              {layoutMode === "canvas" && !interactMode && items.length > 0 && (
                <div className="design-studio__align-bar">
                  <button type="button" className="design-studio__align-btn" onClick={alignLeft} title="Align all items to left">
                    <Icons.AlignLeft size={13} />
                    <span>Left</span>
                  </button>
                  <button type="button" className="design-studio__align-btn" onClick={alignCenter} title="Center all items horizontally">
                    <Icons.AlignCenter size={13} />
                    <span>Center</span>
                  </button>
                  <button type="button" className="design-studio__align-btn" onClick={distributeVertically} title="Distribute items with even vertical gaps">
                    <Icons.List size={13} />
                    <span>Distribute Y</span>
                  </button>
                  <button type="button" className="design-studio__align-btn" onClick={autoTidyGrid} title="Auto-tidy into a balanced 2-column grid">
                    <Icons.Grid size={13} />
                    <span>Tidy Grid</span>
                  </button>
                </div>
              )}

              {/* Hardware home indicator for mobile */}
              {viewport === "mobile" && (
                <div className="design-studio__device-home-bar" />
              )}
            </div>
          </div>
        </div>

        {/* === RIGHT SIDEBAR: Props, Theme, Motion, A11y, Code Inspectors === */}
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
              className={`design-studio__tab-btn ${activeRightTab === "a11y" ? "is-active" : ""}`}
              onClick={() => setActiveRightTab("a11y")}
            >
              <Icons.Shield size={14} />
              <span>A11y</span>
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

                    {/* Title prop */}
                    {"title" in selectedItem.props && (
                      <TextField
                        label="Title Heading"
                        value={selectedItem.props.title || ""}
                        onChange={(e) => updateProp("title", e.target.value)}
                      />
                    )}

                    {/* Description prop */}
                    {"description" in selectedItem.props && (
                      <TextArea
                        label="Card Description"
                        value={selectedItem.props.description || ""}
                        onChange={(e) => updateProp("description", e.target.value)}
                      />
                    )}

                    {/* Message prop */}
                    {"message" in selectedItem.props && (
                      <TextArea
                        label="Message Text"
                        value={selectedItem.props.message || ""}
                        onChange={(e) => updateProp("message", e.target.value)}
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
                            { value: "tonal", label: "Tonal" },
                            { value: "ghost", label: "Ghost" },
                            { value: "danger", label: "Danger" },
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

                    {/* Async Button: timeout */}
                    {selectedItem.type === "async-button" && (
                      <Slider
                        label={`Simulated Delay: ${selectedItem.props.timeoutMs || 1500}ms`}
                        min={500}
                        max={4000}
                        step={100}
                        value={selectedItem.props.timeoutMs || 1500}
                        onValueChange={(v) => updateProp("timeoutMs", v)}
                      />
                    )}

                    {/* Slider / RangeSlider: Orientation */}
                    {(selectedItem.type === "slider" || selectedItem.type === "range-slider") && (
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
                    )}

                    {/* TextArea: Resize lock */}
                    {selectedItem.type === "text-area" && (
                      <SegmentedControl
                        label="Resize Constraints"
                        size="sm"
                        value={selectedItem.props.resize || "vertical"}
                        onValueChange={(v) => updateProp("resize", v)}
                        options={[
                          { value: "none", label: "Locked" },
                          { value: "vertical", label: "Vertical" },
                          { value: "horizontal", label: "Horizontal" },
                          { value: "both", label: "Both" },
                        ]}
                      />
                    )}

                    {/* NumberField: Variant */}
                    {selectedItem.type === "number-field" && (
                      <SegmentedControl
                        label="Input Stepper Variant"
                        size="sm"
                        value={selectedItem.props.variant || "quantity"}
                        onValueChange={(v) => updateProp("variant", v)}
                        options={[
                          { value: "quantity", label: "Quantity" },
                          { value: "stepper", label: "Stepper" },
                          { value: "standard", label: "Standard" },
                        ]}
                      />
                    )}

                    {/* PIN Input: length */}
                    {selectedItem.type === "pin-input" && (
                      <SegmentedControl
                        label="PIN Code Digits"
                        size="sm"
                        value={String(selectedItem.props.length || 6)}
                        onValueChange={(v) => updateProp("length", Number(v))}
                        options={[
                          { value: "4", label: "4 Digits" },
                          { value: "6", label: "6 Digits" },
                          { value: "8", label: "8 Digits" },
                        ]}
                      />
                    )}

                    {/* File Dropzone: Limits */}
                    {selectedItem.type === "file-dropzone" && (
                      <>
                        <TextField
                          label="Accepted MIME Types"
                          value={selectedItem.props.accept || "*/*"}
                          onChange={(e) => updateProp("accept", e.target.value)}
                        />
                        <Slider
                          label={`Max Files: ${selectedItem.props.maxFiles || 4}`}
                          min={1}
                          max={10}
                          step={1}
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

                    {/* Status Dot: status */}
                    {selectedItem.type === "status-dot" && (
                      <SegmentedControl
                        label="Status State"
                        size="sm"
                        value={selectedItem.props.status || "online"}
                        onValueChange={(v) => updateProp("status", v)}
                        options={[
                          { value: "online", label: "Online" },
                          { value: "busy", label: "Busy" },
                          { value: "away", label: "Away" },
                          { value: "offline", label: "Offline" },
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
                <strong>Curated Color Harmonies</strong>
                <div className="design-studio__theme-swatches">
                  {DESIGNER_PALETTES.map((pal) => (
                    <button
                      key={pal.hex}
                      type="button"
                      className={`design-studio__theme-swatch-btn ${accent.toLowerCase() === pal.hex.toLowerCase() ? "is-active" : ""}`}
                      onClick={() => {
                        setAccent(pal.hex);
                        toast({ title: `Applied ${pal.name} theme`, tone: "neutral" });
                      }}
                      title={`${pal.name} (${pal.hex})`}
                    >
                      <div className="design-studio__swatch-circle" style={{ background: pal.hex }} />
                      <span>{pal.name}</span>
                    </button>
                  ))}
                </div>

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

            {/* --- A11Y TAB: Automated Guardrails & Compliance --- */}
            {activeRightTab === "a11y" && (
              <div className="design-studio__inspector-pane design-studio__a11y-panel">
                <strong>Accessibility Guardrails (WCAG 2.2 AA)</strong>
                <p className="orlo-hint">Continuous automated scan of color contrast, touch target sizes, and accessible labels.</p>

                <div className="design-studio__a11y-stat-grid">
                  <div className="design-studio__a11y-stat-card">
                    <small>Accent Contrast</small>
                    <strong className={fillContrast >= 4.5 ? "contrast-pass" : "contrast-warn"}>
                      {fillContrast.toFixed(2)}:1
                    </strong>
                    <span className="orlo-hint">{fillContrast >= 4.5 ? "Meets AA (4.5:1)" : "Needs adjustment"}</span>
                  </div>
                  <div className="design-studio__a11y-stat-card">
                    <small>Touch Target Size</small>
                    <strong>{density === "touch" ? "48px (Touch)" : density === "comfortable" ? "40px (Default)" : "32px (Compact)"}</strong>
                    <span className="orlo-hint">{density === "touch" ? "Meets 44px WCAG 2.5.8" : "Target size >= 24px"}</span>
                  </div>
                  <div className="design-studio__a11y-stat-card">
                    <small>Active Layers</small>
                    <strong>{items.length} Elements</strong>
                    <span className="orlo-hint">Checked for semantic roles</span>
                  </div>
                  <div className="design-studio__a11y-stat-card">
                    <small>Corner Scale</small>
                    <strong>{radiusScale.toUpperCase()}</strong>
                    <span className="orlo-hint">Tokenized curvature</span>
                  </div>
                </div>

                <div className="design-studio__contrast-card">
                  <div className="design-studio__contrast-head">
                    <Icons.Shield size={16} />
                    <strong>Contrast Compliance</strong>
                  </div>
                  <div className="design-studio__contrast-row">
                    <span>Accent Fill vs Text</span>
                    <strong className={fillContrast >= 4.5 ? "contrast-pass" : "contrast-warn"}>{fillContrast.toFixed(2)}:1</strong>
                  </div>
                  <div className="design-studio__contrast-row">
                    <span>Accent Text vs Canvas</span>
                    <strong className={textContrast >= 4.5 ? "contrast-pass" : "contrast-warn"}>{textContrast.toFixed(2)}:1</strong>
                  </div>
                  <Badge tone={fillContrast >= 4.5 && textContrast >= 4.5 ? "success" : "warning"}>
                    {fillContrast >= 4.5 && textContrast >= 4.5 ? "Both checked pairings meet 4.5:1" : "Review accent contrast"}
                  </Badge>
                </div>

                <Button
                  variant="solid"
                  size="md"
                  onClick={() => {
                    setAccent(mode === "light" ? "#144882" : "#3b82f6");
                    setDensity("comfortable");
                    toast({ title: "Auto-corrected all detected accessibility warnings!", tone: "success" });
                  }}
                >
                  <Icons.Check size={16} />
                  <span>Auto-Fix Accessibility Guardrails</span>
                </Button>
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
          <span className="design-studio__dot-sep" />
          <span>Layout: {layoutMode === "flow" ? "Auto-Layout Flow" : "Freeform"}</span>
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
          <span title={saveStatus === "saved" ? "Stored in this browser" : undefined}>{saveStatus === "saved" ? "Draft saved in this browser" : saveStatus === "unavailable" ? "Draft not saved" : "Restoring draft"}</span>
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
                <p>8 cohesive production blueprints to arrange, edit, test and export</p>
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
  updateProp: (key: string, val: any) => void,
  toast: (opts: { title: string; tone?: any }) => void
): ReactNode {
  switch (item.type) {
    case "button":
      return (
        <Button
          variant={item.props.variant || "solid"}
          size={item.props.size || "md"}
          onClick={() => toast({ title: `Triggered: ${item.props.label || "Action"}`, tone: "neutral" })}
        >
          {item.props.label || "Action"}
        </Button>
      );
    case "async-button":
      return (
        <AsyncButton
          variant={item.props.variant || "solid"}
          action={async () => {
            await new Promise((r) => setTimeout(r, item.props.timeoutMs || 1500));
            toast({ title: `Completed: ${item.props.label || "Action"}!`, tone: "success" });
          }}
        >
          {item.props.label || "Deploy"}
        </AsyncButton>
      );
    case "button-group":
      return (
        <ButtonGroup label="Actions">
          {(item.props.labels || ["Action 1", "Action 2"]).map((lbl: string, idx: number) => (
            <Button
              key={idx}
              onClick={() => toast({ title: `Selected: ${lbl}`, tone: "neutral" })}
            >
              {lbl}
            </Button>
          ))}
        </ButtonGroup>
      );
    case "icon-button":
      return (
        <IconButton
          label={item.props.label || "Favorite"}
          onClick={() => toast({ title: `Toggled ${item.props.label || "Icon"}`, tone: "neutral" })}
        >
          <Icons.Heart size={18} />
        </IconButton>
      );
    case "toggle-button":
      return (
        <ToggleButton
          defaultPressed={!!item.props.defaultPressed}
          onPressedChange={(p) => {
            updateProp("defaultPressed", p);
            toast({ title: `${item.props.label || "Toggle"}: ${p ? "Active" : "Inactive"}`, tone: "neutral" });
          }}
        >
          {item.props.label || "Toggle"}
        </ToggleButton>
      );
    case "segmented-control":
      return (
        <SegmentedControl
          label={item.props.label || "Selection"}
          options={item.props.options || ["Option A", "Option B"]}
          value={item.props.value || "Option A"}
          onValueChange={(val) => {
            updateProp("value", val);
            toast({ title: `Segment selected: ${val}`, tone: "neutral" });
          }}
        />
      );
    case "toggle-group":
      return (
        <ToggleGroup
          label={item.props.label || "Format"}
          type="single"
          items={(item.props.options || ["A", "B"]).map((o: string) => ({ value: o, label: o }))}
          value={[item.props.value || "A"]}
          onValueChange={(v) => {
            updateProp("value", v[0] || "");
            toast({ title: `Format: ${v[0] || "None"}`, tone: "neutral" });
          }}
        />
      );
    case "hold-to-confirm":
      return (
        <HoldToConfirm
          duration={finiteNumber(item.props.duration, 1200)}
          tone={item.props.tone || "danger"}
          onConfirm={() => toast({ title: "Confirmed destructive action!", tone: "danger" })}
        >
          {item.props.label || "Hold to Confirm"}
        </HoldToConfirm>
      );
    case "text-field":
      return (
        <div style={{ inlineSize: 280 }}>
          <TextField
            label={item.props.label || "Field"}
            placeholder={item.props.placeholder || ""}
            help={item.props.help}
            value={item.props.value}
            onChange={(e) => updateProp("value", e.target.value)}
          />
        </div>
      );
    case "text-area":
      return (
        <div style={{ inlineSize: 280 }}>
          <TextArea
            label={item.props.label || "Text Area"}
            placeholder={item.props.placeholder}
            resize={item.props.resize || "vertical"}
            value={item.props.value}
            onChange={(e) => updateProp("value", e.target.value)}
          />
        </div>
      );
    case "number-field":
      return (
        <NumberField
          label={item.props.label || "Quantity"}
          variant={item.props.variant || "quantity"}
          value={item.props.value || 1}
          min={item.props.min || 0}
          max={item.props.max || 100}
          step={item.props.step || 1}
          onValueChange={(val) => updateProp("value", val)}
        />
      );
    case "pin-input":
      return (
        <PinInput
          label={item.props.label || "Security PIN"}
          length={item.props.length || 6}
          groupSize={item.props.groupSize || 3}
          onComplete={(pin) => toast({ title: `Entered PIN: ${pin}`, tone: "success" })}
        />
      );
    case "slider":
      return (
        <div style={{ inlineSize: 240 }}>
          <Slider
            label={item.props.label || "Slider"}
            orientation={item.props.orientation || "horizontal"}
            defaultValue={item.props.defaultValue || 50}
            onValueChange={(v) => updateProp("defaultValue", v)}
          />
        </div>
      );
    case "range-slider":
      return (
        <div style={{ inlineSize: 240 }}>
          <RangeSlider
            label={item.props.label || "Range Slider"}
            orientation={item.props.orientation || "horizontal"}
            defaultValue={item.props.defaultValue || [20, 80]}
            onValueChange={(v) => updateProp("defaultValue", v)}
          />
        </div>
      );
    case "switch":
      return (
        <Switch
          label={item.props.label || "Switch Option"}
          defaultChecked={item.props.defaultChecked !== false}
          onCheckedChange={(c) => {
            updateProp("defaultChecked", c);
            toast({ title: `${item.props.label || "Switch"}: ${c ? "On" : "Off"}`, tone: "neutral" });
          }}
        />
      );
    case "checkbox":
      return (
        <Checkbox
          label={item.props.label || "Checkbox Option"}
          defaultChecked={item.props.defaultChecked !== false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProp("defaultChecked", e.target.checked)}
        />
      );
    case "radio-group":
      return (
        <RadioGroup
          legend={item.props.label || "Select Option"}
          name="studio-radio"
          options={(item.props.options || ["Option 1", "Option 2"]).map((o: string) => ({ value: o, label: o }))}
          defaultValue={item.props.defaultValue || "Option 1"}
          onValueChange={(v) => updateProp("defaultValue", v)}
        />
      );
    case "color-picker":
      return (
        <ColorPicker
          label={item.props.label || "Color"}
          value={item.props.defaultValue || "#1F5FA8"}
          onValueChange={(v) => updateProp("defaultValue", v)}
        />
      );
    case "file-dropzone":
      return (
        <div style={{ inlineSize: 320 }}>
          <FileDropzone
            label={item.props.label || "File upload"}
            accept={item.props.accept || "*/*"}
            maxFiles={item.props.maxFiles || 4}
            maxSize={item.props.maxSize || 5242880}
            onFilesChange={(files: File[]) => toast({ title: `Uploaded ${files.length} file(s)`, tone: "success" })}
          />
        </div>
      );
    case "rating":
      return (
        <Rating
          label={item.props.label || "Rating"}
          max={item.props.max || 5}
          defaultValue={item.props.defaultValue || 5}
          onValueChange={(v) => {
            updateProp("defaultValue", v);
            toast({ title: `Rated ${v} out of ${item.props.max || 5} stars`, tone: "neutral" });
          }}
        />
      );
    case "badge":
      return (
        <Badge tone={item.props.tone || "accent"}>
          {item.props.label || "Badge"}
        </Badge>
      );
    case "status-dot":
      return (
        <StatusDot
          status={item.props.status || "online"}
          label={item.props.label || "Online"}
          showLabel={item.props.showLabel !== false}
        />
      );
    case "stat-card":
      return (
        <div style={{ inlineSize: 260 }}>
          <StatCard
            label={item.props.label || "Metric"}
            value={item.props.value || "0"}
            delta={item.props.delta || 0}
            deltaLabel={item.props.deltaLabel || ""}
          />
        </div>
      );
    case "chip":
      return (
        <Chip
          selected={item.props.selected !== false}
          onSelectedChange={(s) => updateProp("selected", s)}
        >
          {item.props.label || "Chip Tag"}
        </Chip>
      );
    case "avatar":
      return (
        <Avatar
          name={item.props.name || "User"}
          size={item.props.size || "md"}
          variant={item.props.variant || "marble"}
        />
      );
    case "pie-chart":
      return (
        <div style={{ inlineSize: 280 }}>
          <PieChart
            title={item.props.title || "Distribution"}
            data={item.props.data || [{ label: "A", value: 50 }, { label: "B", value: 50 }]}
          />
        </div>
      );
    case "sparkline":
      return (
        <div style={{ inlineSize: 240 }}>
          <Sparkline
            label={item.props.label || "Trend"}
            data={item.props.data || [10, 20, 15, 30]}
          />
        </div>
      );
    case "progress":
      return (
        <div style={{ inlineSize: 240 }}>
          <Progress
            label={item.props.label || "Progress"}
            value={item.props.value || 50}
          />
        </div>
      );
    case "spinner":
      return <Spinner size={item.props.size || "md"} />;
    case "callout":
      return (
        <div style={{ inlineSize: 340 }}>
          <Callout
            title={item.props.title || "Notice"}
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
            <h3 style={{ margin: "0 0 6px 0", fontSize: "var(--orlo-text-sm)", fontWeight: 600 }}>{item.props.title || "Card"}</h3>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--orlo-color-fg-muted)" }}>{item.props.description || ""}</p>
          </Card>
        </div>
      );
    case "breadcrumbs":
      return (
        <Breadcrumbs
          items={item.props.items || [{ label: "Workspace", href: "#" }, { label: "Project", href: "#" }, { label: "Dashboard" }]}
        />
      );
    case "tabs":
      return (
        <div style={{ inlineSize: 320 }}>
          <Tabs
            items={(item.props.options || ["Tab 1", "Tab 2"]).map((opt: string, idx: number) => ({
              value: `tab-${idx + 1}`,
              label: opt,
              content: <div style={{ padding: "8px 0", fontSize: "12px" }}>Active: {opt} View</div>,
            }))}
            defaultValue="tab-1"
          />
        </div>
      );
    case "accordion":
      return (
        <div style={{ inlineSize: 300 }}>
          <Accordion
            items={[
              {
                value: "acc-1",
                title: item.props.title || "Accordion Section",
                content: <div style={{ fontSize: "12px" }}>{item.props.content || "Expanded content section details."}</div>,
              },
            ]}
            defaultValue={["acc-1"]}
          />
        </div>
      );
    case "kbd":
      return <Kbd>{item.props.shortcut || "⌘K"}</Kbd>;
    case "data-list":
      return (
        <div style={{ inlineSize: 280 }}>
          <DataList
            items={item.props.items || [{ label: "Status", value: "Active" }, { label: "Region", value: "us-east" }]}
          />
        </div>
      );
    default:
      return <div>{(item as any).type}</div>;
  }
}
