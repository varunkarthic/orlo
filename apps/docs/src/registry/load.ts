import type { Doc } from "./types.ts";
import { manifest } from "@orlo/react";

type Chunk = "actions" | "forms" | "pickers" | "navigation" | "overlays" | "structure" | "data" | "feedback" | "media" | "specialty" | "advanced";
const loaders: Record<Chunk, () => Promise<Record<string, Doc>>> = {
  actions: () => import("./actions.tsx").then((m) => m.actions),
  forms: () => import("./forms.tsx").then((m) => m.forms),
  pickers: () => import("./pickers.tsx").then((m) => m.pickers),
  navigation: () => import("./navigation.tsx").then((m) => m.navigation),
  overlays: () => import("./overlays.tsx").then((m) => m.overlays),
  structure: () => import("./structure.tsx").then((m) => m.structure),
  data: () => import("./data.tsx").then((m) => m.data),
  feedback: () => import("./feedback.tsx").then((m) => m.feedback),
  media: () => import("./media.tsx").then((m) => m.media),
  specialty: () => import("./specialty.tsx").then((m) => m.specialty),
  advanced: () => import("./advanced.tsx").then((m) => m.advanced),
};

/** Components documented in advanced.tsx regardless of family. The build verifies every slug resolves. */
const ADVANCED = new Set(["text", "heading", "prose", "truncate", "async-content", "video-player", "audio-player", "embed", "map-view", "document-viewer", "data-grid", "line-chart", "bar-chart", "donut-chart", "markdown", "markdown-editor", "chat-thread", "composer", "tool-run", "response-feedback", "app-shell", "tab-strip", "status-bar", "kanban", "stat-card", "progressive-blur"]);
const byFamily: Record<string, Chunk> = { Actions: "actions", Forms: "forms", Pickers: "pickers", Navigation: "navigation", Overlays: "overlays", Disclosure: "structure", Layout: "structure", "Data display": "data", Feedback: "feedback", Media: "media", Specialty: "specialty" };

export function chunkFor(slug: string): Chunk {
  if (ADVANCED.has(slug)) return "advanced";
  const fam = manifest.find((m) => m.slug === slug)?.family ?? "Specialty";
  return byFamily[fam] ?? "advanced";
}
const PLAYGROUNDS = new Set(["button", "async-button", "slider", "switch", "badge", "alert", "tooltip", "progress", "avatar", "chip", "rating", "text-field", "checkbox", "segmented-control", "spinner"]);
export async function loadDoc(slug: string): Promise<Doc | undefined> {
  const [doc, pg] = await Promise.all([loaders[chunkFor(slug)]().then((m) => m[slug]), PLAYGROUNDS.has(slug) ? import("./playgrounds.tsx").then((m) => m.playgrounds[slug]) : undefined]);
  return doc && pg ? { ...doc, playground: pg } : doc;
}
export async function loadAllDocs(): Promise<Record<string, Doc>> { return Object.assign({}, ...(await Promise.all(Object.values(loaders).map((l) => l())))); }
