import { Icons } from "../internal/icons.tsx";

export type Crumb = { label: string; href?: string };

/** Last item is the current page (aria-current, not a link). Separators are decorative. */
export function Breadcrumbs({ items, label = "Breadcrumb" }: { items: Crumb[]; label?: string }) {
  return (
    <nav aria-label={label} className="orlo-breadcrumbs">
      <ol>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i}>
              {last || !c.href ? <span aria-current={last ? "page" : undefined}>{c.label}</span> : <a href={c.href}>{c.label}</a>}
              {!last && <Icons.ChevronRight size={14} className="orlo-breadcrumbs__sep" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
