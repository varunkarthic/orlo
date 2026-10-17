import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePortalContext } from "../provider.tsx";

/**
 * Renders into a fresh node on <body>, carrying the provider's theme, density and direction
 * so overlays never escape their tokens. Renders nothing on the server.
 */
export function Portal({ children }: { children: ReactNode }) {
  const { theme, density, dir } = usePortalContext();
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
    theme === "system" ? node.removeAttribute("data-orlo-theme") : node.setAttribute("data-orlo-theme", theme);
    density ? node.setAttribute("data-orlo-density", density) : node.removeAttribute("data-orlo-density");
    node.dir = dir ?? document.documentElement.dir ?? "";
  }, [node, theme, density, dir]);
  return node ? createPortal(children, node) : null;
}
