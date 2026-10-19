import { Children, isValidElement, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CopyButton, SegmentedControl, Icons, TableOfContents } from "@orlo/react";

export const slug = (s: string) => s.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
const text = (n: ReactNode): string => typeof n === "string" || typeof n === "number" ? String(n) : Array.isArray(n) ? n.map(text).join("") : isValidElement(n) ? text((n.props as { children?: ReactNode }).children) : "";

/** Section heading with a stable anchor (and a visible link on hover). */
export function H2({ children, id }: { children: ReactNode; id?: string }) {
  const i = id ?? slug(text(children));
  return <h2 id={i} className="anchor">{children}<a href={`#${i}`} className="anchor__link" aria-label={`Link to ${text(children)}`}>#</a></h2>;
}
export function H3({ children }: { children: ReactNode }) { return <h3 id={slug(text(children))}>{children}</h3>; }

export function PageHeader({ eyebrow, title, lead, children }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="page-header">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {children && <div className="page-header__meta">{children}</div>}
    </header>
  );
}

export const Code = ({ children, label = "Code example" }: { children: string; label?: string }) => (
  <div className="code"><div className="code__bar"><span>{label}</span><CopyButton text={children} /></div><pre tabIndex={0} aria-label={label}><code>{children}</code></pre></div>
);

/**
 * Example block: a live preview with its own Light/Dark/RTL switch (so a component can be checked in each mode
 * without touching the page) and, when code is given, a Code toggle that reveals the snippet underneath.
 */
export function Stage({ children, label, tall, plain, code }: { children: ReactNode; label: string; tall?: boolean; plain?: boolean; code?: string }) {
  const [mode, setMode] = useState("page");
  const [open, setOpen] = useState(false);
  return (
    <figure className="example stage" data-tall={tall || undefined}>
      <div className="example__preview orlo-root" data-orlo-theme={mode === "light" || mode === "dark" ? mode : undefined} dir={mode === "rtl" ? "rtl" : undefined}>{children}</div>
      {!plain && (
        <figcaption className="example__bar">
          <span className="example__label">{label}</span>
          <span className="example__tools">
            <SegmentedControl label={`Preview ${label} as`} size="sm" value={mode} onValueChange={setMode} options={[{ value: "page", label: "Page" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "rtl", label: "RTL" }]} />
            {code && <button type="button" className="example__toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}><Icons.Code size={16} aria-hidden="true" />Code</button>}
          </span>
        </figcaption>
      )}
      {code && <div className="example__code" data-open={open || undefined} inert={!open}><div><Code>{code}</Code></div></div>}
    </figure>
  );
}

/** Numbered anatomy pins placed over a live component, found by CSS selector after mount. */
export function Anatomy({ children, parts }: { children: ReactNode; parts: [string, string][] }) {
  const box = useRef<HTMLDivElement>(null);
  const [pins, setPins] = useState<{ x: number; y: number }[]>([]);
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const place = () => {
      const b = el.getBoundingClientRect();
      setPins(parts.map(([, sel]) => { const t = el.querySelector(sel)?.getBoundingClientRect(); return t ? { x: t.left - b.left + Math.min(t.width, 28) / 2, y: t.top - b.top } : { x: -999, y: -999 }; }));
    };
    place(); const ro = new ResizeObserver(place); ro.observe(el); return () => ro.disconnect();
  }, [parts]);
  return (
    <div className="anatomy">
      <div ref={box} className="anatomy__stage" inert>{children}{pins.map((p, i) => p.x > -999 && <span key={i} className="anatomy__pin" style={{ left: p.x, top: p.y }} aria-hidden="true">{i + 1}</span>)}</div>
      <ol className="anatomy__list">{parts.map(([label]) => <li key={label}>{label}</li>)}</ol>
    </div>
  );
}

/** Spec rows resolve their token against the live stylesheet, so the table can never drift from the CSS. */
export function SpecTable({ rows }: { rows: [string, string][] }) {
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => {
    const read = () => { const cs = getComputedStyle(document.querySelector(".orlo-root") ?? document.documentElement); setVals(Object.fromEntries(rows.map(([, t]) => [t, t.startsWith("--") ? cs.getPropertyValue(t).trim() : t]))); };
    read(); const mo = new MutationObserver(read); mo.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["data-orlo-theme", "data-orlo-density"] }); return () => mo.disconnect();
  }, [rows]);
  return (
    <table className="doc" tabIndex={0}>
      <thead><tr><th>Property</th><th>Token</th><th>Resolved now</th></tr></thead>
      <tbody>{rows.map(([p, t]) => {
        const v = vals[t] ?? "";
        const isColor = /^#|^rgb|^oklch|^hsl/.test(v);
        return <tr key={p + t}><td>{p}</td><td>{t.startsWith("--") ? <code>{t}</code> : "—"}</td><td>{isColor && <span className="swatch-dot" style={{ background: v }} />}<code>{v || (t.startsWith("--") ? "…" : t)}</code></td></tr>;
      })}</tbody>
    </table>
  );
}

export function DoDont({ items }: { items: [string, string][] }) {
  return (
    <div className="dodont">
      {items.map(([d, n], i) => (
        <div key={i} className="dodont__pair">
          <div className="dodont__card" data-kind="do"><p className="dodont__head"><Icons.Check size={16} /> Do</p><p>{d}</p></div>
          <div className="dodont__card" data-kind="dont"><p className="dodont__head"><Icons.X size={16} /> Don’t</p><p>{n}</p></div>
        </div>
      ))}
    </div>
  );
}

export function KeyTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="doc keys" tabIndex={0}>
      <thead><tr><th>Key</th><th>Action</th></tr></thead>
      <tbody>{rows.map(([k, a]) => <tr key={k}><td>{k.split(" / ").map((x, i) => <span key={i}>{i > 0 && " / "}{x.split("+").map((p, j) => <span key={j}>{j > 0 && "+"}<kbd className="orlo-kbd">{p}</kbd></span>)}</span>)}</td><td>{a}</td></tr>)}</tbody>
    </table>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) { return <ul className="notes">{items.map((n, i) => <li key={i}>{n}</li>)}</ul>; }

/** Builds the "On this page" list from the rendered h2/h3 headings after hydration. */
export function PageToc({ dep }: { dep: string }) {
  const [items, setItems] = useState<{ id: string; label: string; level: 2 | 3 }[]>([]);
  useEffect(() => {
    const hs = Array.from(document.querySelectorAll<HTMLElement>("#main h2[id], #main h3[id]")).filter((h) => !h.closest(".stage, .orlo-portal, .anatomy"));
    setItems(hs.map((h) => ({ id: h.id, label: (h.firstChild?.textContent ?? h.textContent ?? "").trim(), level: h.tagName === "H3" ? 3 : 2 })));
  }, [dep]);
  return <TableOfContents items={items} />;
}

export function CardGrid({ children }: { children: ReactNode }) { return <div className="card-grid">{Children.toArray(children)}</div>; }
export function LinkCard({ href, title, body, art, cta = "Explore" }: { href: string; title: string; body: string; art?: ReactNode; cta?: string }) {
  return (
    <a className="link-card" href={href}>
      {art && <span className="link-card__art" aria-hidden="true" inert>{art}</span>}
      <span className="link-card__body"><strong>{title}</strong><span>{body}</span><span className="link-card__cta">{cta} <Icons.ChevronRight size={14} /></span></span>
    </a>
  );
}
