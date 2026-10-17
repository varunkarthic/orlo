import { useEffect, useId, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Icons } from "../internal/icons.tsx";

export type NavItem = { href: string; label: string; icon: ReactNode; current?: boolean; badge?: ReactNode };

/** Vertical rail of 3–7 top-level destinations for tablet and desktop. Labels always visible; the active pill travels. */
export function NavigationRail({ items, label = "Main", header }: { items: NavItem[]; label?: string; header?: ReactNode }) {
  const id = useId(); const { transition } = useOrloMotion();
  return (
    <nav className="orlo-rail" aria-label={label}>
      {header && <div className="orlo-rail__header">{header}</div>}
      <ul>
        {items.map((it) => (
          <li key={it.href}>
            <a href={it.href} className="orlo-rail__item" aria-current={it.current ? "page" : undefined}>
              <span className="orlo-rail__icon">
                {it.current && <motion.span className="orlo-rail__pill" layoutId={`${id}-pill`} transition={transition("shift")} />}
                <span className="orlo-rail__glyph" aria-hidden="true">{it.icon}</span>
                {it.badge && <span className="orlo-rail__badge">{it.badge}</span>}
              </span>
              <span className="orlo-rail__label">{it.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Bottom bar for 3–5 destinations on phones. Respects the safe area; hides nothing behind hover. */
export function BottomNavigation({ items, label = "Main" }: { items: NavItem[]; label?: string }) {
  const id = useId(); const { transition } = useOrloMotion();
  return (
    <nav className="orlo-bottom-nav" aria-label={label}>
      {items.map((it) => (
        <a key={it.href} href={it.href} className="orlo-bottom-nav__item" aria-current={it.current ? "page" : undefined}>
          <span className="orlo-rail__icon">
            {it.current && <motion.span className="orlo-rail__pill" layoutId={`${id}-pill`} transition={transition("shift")} />}
            <span className="orlo-rail__glyph" aria-hidden="true">{it.icon}</span>
            {it.badge && <span className="orlo-rail__badge">{it.badge}</span>}
          </span>
          <span className="orlo-rail__label">{it.label}</span>
        </a>
      ))}
    </nav>
  );
}

export type Step = { label: string; description?: string; state?: "complete" | "current" | "upcoming" | "error" };

/** Progress through a known sequence. State is conveyed by icon, text and position, never colour alone. */
export function Steps({ steps, orientation = "horizontal", label = "Progress" }: { steps: Step[]; orientation?: "horizontal" | "vertical"; label?: string }) {
  return (
    <ol className="orlo-steps" data-orientation={orientation} aria-label={label}>
      {steps.map((s, i) => {
        const st = s.state ?? "upcoming";
        return (
          <li key={i} className="orlo-steps__item" data-state={st} aria-current={st === "current" ? "step" : undefined}>
            <span className="orlo-steps__marker" aria-hidden="true">{st === "complete" ? <Icons.Check size={14} /> : st === "error" ? "!" : i + 1}</span>
            <span className="orlo-steps__text">
              <span className="orlo-steps__label">{s.label}</span>
              {s.description && <span className="orlo-hint">{s.description}</span>}
              <span className="orlo-visually-hidden">{{ complete: ", completed", current: ", current step", upcoming: ", not started", error: ", needs attention" }[st]}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** "On this page" list with scrollspy. Highlights the heading nearest the top; links are plain anchors so it works without JS. */
export function TableOfContents({ items, label = "On this page" }: { items: { id: string; label: string; level?: 2 | 3 }[]; label?: string }) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!items.length) return;
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-72px 0px -65% 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);
  if (!items.length) return null;
  return (
    <nav className="orlo-toc" aria-label={label}>
      <p className="orlo-toc__title">{label}</p>
      <ul>{items.map((i) => <li key={i.id} data-level={i.level ?? 2}><a href={`#${i.id}`} aria-current={active === i.id ? "location" : undefined}>{i.label}</a></li>)}</ul>
    </nav>
  );
}
