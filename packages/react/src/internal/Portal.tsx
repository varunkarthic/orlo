import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePortalContext } from "../provider.tsx";

/**
 * Renders into a fresh node on <body>, carrying the provider's theme, density, direction and material
 * so overlays never escape their tokens. Renders nothing on the server.
 */
export function Portal({ children }: { children: ReactNode }) {
  const { theme, density, dir, material, materialStyle, reduceTransparency } = usePortalContext();
  const [node, setNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("data-orlo-portal", "");
    el.className = "orlo-portal";
    document.body.appendChild(el);
    setNode(el);
    return () => el.remove();
  }, []);
  useEffect(() => {
    if (!node) return;
    const attr = (k: string, v?: string) => (v ? node.setAttribute(k, v) : node.removeAttribute(k));
    attr("data-orlo-theme", theme === "system" ? undefined : theme);
    attr("data-orlo-density", density);
    attr("data-orlo-material", material);
    attr("data-orlo-transparency", reduceTransparency ? "reduced" : undefined);
    node.dir = dir ?? document.documentElement.dir ?? "";
    node.removeAttribute("style");
    for (const [k, v] of Object.entries(materialStyle ?? {})) node.style.setProperty(k, String(v));
  }, [node, theme, density, dir, material, materialStyle, reduceTransparency]);
  return node ? createPortal(children, node) : null;
}
