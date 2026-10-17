import { Fragment, useId, useRef, useState, type ReactNode } from "react";
import { Icons } from "../internal/icons.tsx";
import { useControllable } from "../internal/hooks.ts";

type Inline = string | { t: "b" | "i" | "code" | "a"; c: Inline[] | string; href?: string };

/** Tiny, safe inline parser: **bold**, *italic*, `code`, [text](https://…). Never produces HTML strings. Exported for tests. */
export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    if (m[2]) out.push({ t: "b", c: parseInline(m[2]) });
    else if (m[4]) out.push({ t: "i", c: parseInline(m[4]) });
    else if (m[6]) out.push({ t: "code", c: m[6] });
    else if (m[8]) { const href = /^(https?:|mailto:|#|\/)/i.test(m[9]) ? m[9] : "#"; out.push({ t: "a", c: parseInline(m[8]), href }); }
    last = re.lastIndex;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
const renderInline = (nodes: Inline[]): ReactNode => nodes.map((n, i) => typeof n === "string" ? <Fragment key={i}>{n}</Fragment>
  : n.t === "b" ? <strong key={i}>{renderInline(n.c as Inline[])}</strong>
  : n.t === "i" ? <em key={i}>{renderInline(n.c as Inline[])}</em>
  : n.t === "code" ? <code key={i}>{n.c as string}</code>
  : <a key={i} href={n.href} rel="noopener noreferrer" target={n.href?.startsWith("http") ? "_blank" : undefined}>{renderInline(n.c as Inline[])}</a>);

/** Renders a safe subset of Markdown (headings, lists, quotes, code fences, paragraphs, inline marks) as React elements. */
export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks: ReactNode[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; ) {
    const l = lines[i];
    if (/^```/.test(l)) { const buf: string[] = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; blocks.push(<pre key={i}><code>{buf.join("\n")}</code></pre>); continue; }
    const h = l.match(/^(#{1,4})\s+(.*)/);
    if (h) { const H = `h${h[1].length + 1}` as "h2"; blocks.push(<H key={i}>{renderInline(parseInline(h[2]))}</H>); i++; continue; }
    if (/^\s*[-*]\s+/.test(l)) { const items: string[] = []; while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, "")); blocks.push(<ul key={i}>{items.map((t, k) => <li key={k}>{t.startsWith("[x] ") ? <><input type="checkbox" checked readOnly aria-label="done" /> {renderInline(parseInline(t.slice(4)))}</> : t.startsWith("[ ] ") ? <><input type="checkbox" readOnly aria-label="not done" /> {renderInline(parseInline(t.slice(4)))}</> : renderInline(parseInline(t))}</li>)}</ul>); continue; }
    if (/^\s*\d+\.\s+/.test(l)) { const items: string[] = []; while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, "")); blocks.push(<ol key={i}>{items.map((t, k) => <li key={k}>{renderInline(parseInline(t))}</li>)}</ol>); continue; }
    if (/^>\s?/.test(l)) { const buf: string[] = []; while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, "")); blocks.push(<blockquote key={i}>{renderInline(parseInline(buf.join(" ")))}</blockquote>); continue; }
    if (!l.trim()) { i++; continue; }
    const buf: string[] = []; while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|>|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) buf.push(lines[i++]);
    blocks.push(<p key={i}>{renderInline(parseInline(buf.join(" ")))}</p>);
  }
  return <div className={["orlo-prose orlo-markdown", className].filter(Boolean).join(" ")}>{blocks}</div>;
}

export type MarkdownEditorProps = { label: string; value?: string; defaultValue?: string; onValueChange?: (v: string) => void; placeholder?: string; minRows?: number; status?: ReactNode };

/**
 * Plain-text Markdown editing with a formatting toolbar and shortcuts (⌘/Ctrl+B, I, K, E), a Write/Preview switch,
 * word count and a slot for autosave status. Text stays text: undo, IME, spellcheck and screen readers work natively.
 */
export function MarkdownEditor({ label, value: v, defaultValue = "", onValueChange, placeholder = "Write in Markdown…", minRows = 8, status }: MarkdownEditorProps) {
  const [value, setValue] = useControllable(v, defaultValue, onValueChange);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const ta = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  const wrap = (before: string, after = before, placeholderText = "text") => {
    const el = ta.current; if (!el) return;
    const [a, b] = [el.selectionStart, el.selectionEnd];
    const sel = value.slice(a, b) || placeholderText;
    // execCommand keeps the native undo stack intact where supported; fall back to a value update.
    el.focus();
    const ok = document.execCommand?.("insertText", false, before + sel + after);
    if (!ok) setValue(value.slice(0, a) + before + sel + after + value.slice(b));
    requestAnimationFrame(() => el.setSelectionRange(a + before.length, a + before.length + sel.length));
  };
  const prefix = (p: string) => {
    const el = ta.current; if (!el) return;
    const a = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    el.focus(); el.setSelectionRange(a, a);
    if (!document.execCommand?.("insertText", false, p)) setValue(value.slice(0, a) + p + value.slice(a));
  };
  const tools: [string, ReactNode, () => void, string?][] = [
    ["Bold", <Icons.Bold size={16} />, () => wrap("**"), "⌘B"], ["Italic", <Icons.Italic size={16} />, () => wrap("*"), "⌘I"], ["Code", <Icons.Code size={16} />, () => wrap("`"), "⌘E"],
    ["Link", <Icons.Link size={16} />, () => wrap("[", "](https://)", "link text"), "⌘K"], ["Heading", <Icons.Heading size={16} />, () => prefix("## ")],
    ["Bulleted list", <Icons.List size={16} />, () => prefix("- ")], ["Numbered list", <Icons.ListOrdered size={16} />, () => prefix("1. ")], ["Quote", <Icons.Quote size={16} />, () => prefix("> ")],
  ];
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  return (
    <div className="orlo-editor">
      <div className="orlo-editor__bar">
        <span id={`${id}-l`} className="orlo-field__label">{label}</span>
        <div className="orlo-editor__modes" role="tablist" aria-label="Mode">
          {(["write", "preview"] as const).map((m) => <button key={m} type="button" role="tab" aria-selected={mode === m} className="orlo-editor__mode" onClick={() => setMode(m)}>{m === "write" ? "Write" : "Preview"}</button>)}
        </div>
      </div>
      {mode === "write" && (
        <div className="orlo-editor__tools" role="toolbar" aria-label="Formatting" aria-controls={id}>
          {tools.map(([name, icon, fn, key]) => <button key={name} type="button" className="orlo-icon-button" data-variant="ghost" data-size="sm" aria-label={key ? `${name} (${key})` : name} title={key ? `${name} ${key}` : name} onMouseDown={(e) => e.preventDefault()} onClick={fn}>{icon}</button>)}
        </div>
      )}
      {mode === "write" ? (
        <textarea ref={ta} id={id} className="orlo-editor__input" aria-labelledby={`${id}-l`} value={value} placeholder={placeholder} rows={minRows} spellCheck
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (!(e.metaKey || e.ctrlKey)) return;
            const k = e.key.toLowerCase();
            if (k === "b") { e.preventDefault(); wrap("**"); } else if (k === "i") { e.preventDefault(); wrap("*"); } else if (k === "e") { e.preventDefault(); wrap("`"); } else if (k === "k") { e.preventDefault(); wrap("[", "](https://)", "link text"); }
          }} />
      ) : (
        <div className="orlo-editor__preview" tabIndex={0} aria-label="Preview">{value.trim() ? <Markdown source={value} /> : <p className="orlo-hint">Nothing to preview yet.</p>}</div>
      )}
      <div className="orlo-editor__foot"><span className="orlo-hint">{words} {words === 1 ? "word" : "words"} · Markdown supported</span>{status}</div>
    </div>
  );
}
