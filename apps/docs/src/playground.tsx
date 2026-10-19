import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SegmentedControl, Switch, TextField, Slider, Select, CopyButton, Stack } from "@orlo/react";

export type Control =
  | { name: string; type: "select"; options: string[]; default: string }
  | { name: string; type: "boolean"; default: boolean }
  | { name: string; type: "text"; default: string }
  | { name: string; type: "number"; min: number; max: number; step?: number; default: number };
export type PlaygroundDef = { controls: Control[]; render: (p: Record<string, unknown>) => ReactNode; code: (p: Record<string, unknown>) => string };

const parse = (c: Control, raw: string | null) => {
  if (raw === null) return c.default;
  if (c.type === "boolean") return raw === "1" ? true : raw === "0" ? false : c.default;
  if (c.type === "select") return c.options.includes(raw) ? raw : c.default;
  if (c.type === "text") return raw.slice(0, 120);
  const value = Number(raw);
  if (!raw.trim() || !Number.isFinite(value)) return c.default;
  const clamped = Math.min(c.max, Math.max(c.min, value));
  const step = c.step ?? 1;
  return Number(Math.min(c.max, c.min + Math.round((clamped - c.min) / step) * step).toFixed(6));
};

const queryFor = (controls: Control[], props: Record<string, unknown>) => {
  const q = new URLSearchParams(location.search);
  for (const c of controls) {
    const value = props[c.name];
    if (value === c.default) q.delete(`p.${c.name}`);
    else q.set(`p.${c.name}`, c.type === "boolean" ? (value ? "1" : "0") : String(value));
  }
  return q;
};

/** Live props, generated code that matches what you see, and shareable URL state (?p.name=value). */
export function Playground({ def }: { def: PlaygroundDef }) {
  const initial = useMemo(() => Object.fromEntries(def.controls.map((c) => [c.name, c.default])), [def]);
  const [props, setProps] = useState<Record<string, unknown>>(initial);
  // Restore from the URL after hydration so the prerendered HTML matches.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const restored = Object.fromEntries(def.controls.map((c) => [c.name, parse(c, q.get(`p.${c.name}`))]));
    setProps(restored);
    const canonical = queryFor(def.controls, restored);
    if (canonical.toString() !== q.toString()) history.replaceState(null, "", `${location.pathname}${canonical.toString() ? `?${canonical}` : ""}${location.hash}`);
  }, [def]);
  const set = (k: string, v: unknown) => {
    const control = def.controls.find((c) => c.name === k)!;
    const value = control.type === "number" ? parse(control, String(v)) : control.type === "text" ? String(v).slice(0, 120) : v;
    const next = { ...props, [k]: value };
    setProps(next);
    const q = queryFor(def.controls, next);
    history.replaceState(null, "", `${location.pathname}${q.toString() ? `?${q}` : ""}${location.hash}`);
  };
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
export function jsx(tag: string, props: Record<string, unknown>, defaults: Record<string, unknown>, children?: string, rawChildren = false) {
  const attrs = Object.entries(props).filter(([k, v]) => k !== "children" && v !== defaults[k] && v !== "" && v !== undefined).map(([k, v]) => v === true ? k : typeof v === "string" && !/["&<>{}\\\r\n]/.test(v) ? `${k}="${v}"` : `${k}={${JSON.stringify(v)}}`);
  const open = `<${tag}${attrs.length ? " " + attrs.join(" ") : ""}`;
  const body = children && !rawChildren && /[<&>{}\r\n]/.test(children) ? `{${JSON.stringify(children)}}` : children;
  return children ? `${open}>${body}</${tag}>` : `${open} />`;
}
