import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SegmentedControl, Switch, TextField, Slider, Select, CopyButton, Stack } from "@orlo/react";

export type Control =
  | { name: string; type: "select"; options: string[]; default: string }
  | { name: string; type: "boolean"; default: boolean }
  | { name: string; type: "text"; default: string }
  | { name: string; type: "number"; min: number; max: number; step?: number; default: number };
export type PlaygroundDef = { controls: Control[]; render: (p: Record<string, unknown>) => ReactNode; code: (p: Record<string, unknown>) => string };

const parse = (c: Control, raw: string | null) => raw === null ? c.default : c.type === "boolean" ? raw === "1" : c.type === "number" ? Number(raw) : raw;

/** Live props, generated code that matches what you see, and shareable URL state (?p.name=value). */
export function Playground({ def }: { def: PlaygroundDef }) {
  const initial = useMemo(() => Object.fromEntries(def.controls.map((c) => [c.name, c.default])), [def]);
  const [props, setProps] = useState<Record<string, unknown>>(initial);
  // Restore from the URL after hydration so the prerendered HTML matches.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setProps(Object.fromEntries(def.controls.map((c) => [c.name, parse(c, q.get(`p.${c.name}`))])));
  }, [def]);
  const set = (k: string, v: unknown) => setProps((p) => {
    const next = { ...p, [k]: v };
    const q = new URLSearchParams(location.search);
    for (const c of def.controls) { const val = next[c.name]; if (val === c.default) q.delete(`p.${c.name}`); else q.set(`p.${c.name}`, c.type === "boolean" ? (val ? "1" : "0") : String(val)); }
    history.replaceState(null, "", `${location.pathname}${q.toString() ? `?${q}` : ""}${location.hash}`);
    return next;
  });
  const code = def.code(props);
  return (
    <div className="playground">
      <div className="playground__stage orlo-root">{def.render(props)}</div>
      <div className="playground__controls" role="group" aria-label="Props">
        {def.controls.map((c) => (
          <div key={c.name} className="playground__control">
            {c.type === "select" && (c.options.length <= 4
              ? <><span className="orlo-field__label">{c.name}</span><SegmentedControl label={c.name} size="sm" value={String(props[c.name])} onValueChange={(v) => set(c.name, v)} options={c.options.map((o) => ({ value: o, label: o }))} /></>
              : <Select label={c.name} value={String(props[c.name])} onValueChange={(v) => set(c.name, v)} options={c.options.map((o) => ({ value: o, label: o }))} />)}
            {c.type === "boolean" && <Switch label={c.name} checked={Boolean(props[c.name])} onCheckedChange={(v) => set(c.name, v)} />}
            {c.type === "text" && <TextField label={c.name} value={String(props[c.name])} onChange={(e) => set(c.name, e.target.value)} />}
            {c.type === "number" && <Slider label={c.name} value={Number(props[c.name])} onValueChange={(v) => set(c.name, v)} min={c.min} max={c.max} step={c.step} bubble={false} />}
          </div>
        ))}
      </div>
      <div className="playground__code"><pre tabIndex={0} aria-label="Generated code"><code>{code}</code></pre><Stack direction="row" gap={2}><CopyButton text={code} /><CopyButton text={typeof location !== "undefined" ? location.href : ""} label="Copy link" /></Stack></div>
    </div>
  );
}

/** Builds a JSX string with only non-default props, in a stable order. */
export function jsx(tag: string, props: Record<string, unknown>, defaults: Record<string, unknown>, children?: string) {
  const attrs = Object.entries(props).filter(([k, v]) => k !== "children" && v !== defaults[k] && v !== "" && v !== undefined).map(([k, v]) => (v === true ? k : typeof v === "string" ? `${k}="${v}"` : `${k}={${JSON.stringify(v)}}`));
  const open = `<${tag}${attrs.length ? " " + attrs.join(" ") : ""}`;
  return children ? `${open}>${children}</${tag}>` : `${open} />`;
}
