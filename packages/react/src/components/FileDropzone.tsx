import { useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Icons } from "../internal/icons.tsx";

export type Rejection = { file: File; reason: string };
export type FileDropzoneProps = {
  label: ReactNode;
  /** Same syntax as <input accept>: "image/*,.pdf". */
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
  help?: ReactNode;
};

export const formatBytes = (n: number, locale?: string) => {
  const units = ["byte", "kilobyte", "megabyte", "gigabyte"] as const; let i = 0;
  while (n >= 1000 && i < units.length - 1) { n /= 1000; i++; }
  return new Intl.NumberFormat(locale, { style: "unit", unit: units[i], unitDisplay: "short", maximumFractionDigits: i ? 1 : 0 }).format(n);
};

export function matchesAccept(file: { name: string; type: string }, accept?: string) {
  if (!accept) return true;
  return accept.split(",").map((a) => a.trim().toLowerCase()).some((a) =>
    a.startsWith(".") ? file.name.toLowerCase().endsWith(a) : a.endsWith("/*") ? file.type.startsWith(a.slice(0, -1)) : file.type === a);
}

/**
 * During a drag only MIME types are visible, not names. Extension rules can't be judged until drop,
 * so they never block the preview; MIME rules can.
 */
export function dragVerdict(types: string[], accept?: string): "valid" | "invalid" {
  if (!types.length) return "invalid";
  if (!accept) return "valid";
  const rules = accept.split(",").map((a) => a.trim()).filter(Boolean);
  if (rules.some((r) => r.startsWith("."))) return "valid";
  return types.every((t) => matchesAccept({ name: "", type: t }, accept)) ? "valid" : "invalid";
}

/** Drop area plus a real file button. Shows whether a drag will be accepted before release, and explains every rejection. */
export function FileDropzone({ label, accept, maxSize, maxFiles = Infinity, multiple = true, onFilesChange, help }: FileDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [rejected, setRejected] = useState<Rejection[]>([]);
  const [drag, setDrag] = useState<"none" | "valid" | "invalid">("none");
  const depth = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const { transition } = useOrloMotion();
  const take = (list: File[]) => {
    const ok: File[] = []; const bad: Rejection[] = [];
    for (const f of list) {
      if (!matchesAccept(f, accept)) bad.push({ file: f, reason: "type not accepted" });
      else if (maxSize && f.size > maxSize) bad.push({ file: f, reason: `larger than ${formatBytes(maxSize)}` });
      else if (files.length + ok.length >= maxFiles) bad.push({ file: f, reason: `limit of ${maxFiles} reached` });
      else if (files.some((x) => x.name === f.name && x.size === f.size)) bad.push({ file: f, reason: "already added" });
      else ok.push(f);
    }
    const next = multiple ? [...files, ...ok] : ok.slice(0, 1);
    setFiles(next); setRejected(bad); onFilesChange?.(next);
  };
  const remove = (f: File) => { const next = files.filter((x) => x !== f); setFiles(next); onFilesChange?.(next); };
  return (
    <div className="orlo-field">
      <span id={`${id}-l`} className="orlo-field__label">{label}</span>
      <div className="orlo-dropzone" data-drag={drag}
        onDragEnter={(e) => { e.preventDefault(); depth.current++; setDrag(dragVerdict(Array.from(e.dataTransfer.items).filter((i) => i.kind === "file").map((i) => i.type), accept)); }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = drag === "invalid" ? "none" : "copy"; }}
        onDragLeave={() => { if (--depth.current <= 0) { depth.current = 0; setDrag("none"); } }}
        onDrop={(e) => { e.preventDefault(); depth.current = 0; setDrag("none"); take(Array.from(e.dataTransfer.files)); }}>
        <Icons.Upload size={28} />
        <p className="orlo-dropzone__title">{drag === "valid" ? "Release to add" : drag === "invalid" ? "These files can’t be added" : "Drag files here"}</p>
        <p className="orlo-hint" style={{ margin: 0 }}>{help ?? [accept && `Accepts ${accept}`, maxSize && `up to ${formatBytes(maxSize)} each`].filter(Boolean).join(", ")}</p>
        <button type="button" className="orlo-button" data-variant="subtle" data-size="sm" aria-describedby={`${id}-l`} onClick={() => input.current?.click()}>Browse files</button>
        <input ref={input} type="file" hidden accept={accept} multiple={multiple} onChange={(e) => { take(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
      </div>
      <ul className="orlo-filelist" aria-label="Selected files">
        <AnimatePresence initial={false}>
          {files.map((f) => (
            <motion.li key={f.name + f.size} layout initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0, transition: transition("reveal") }} exit={{ opacity: 0, transition: transition("dismiss") }}>
              <Icons.File size={18} /><span className="orlo-filelist__name">{f.name}</span><span className="orlo-hint">{formatBytes(f.size)}</span>
              <button type="button" className="orlo-icon-button" data-variant="ghost" data-size="sm" aria-label={`Remove ${f.name}`} onClick={() => remove(f)}><Icons.X size={16} /></button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {rejected.length > 0 && (
        <div role="alert" className="orlo-field__msg" style={{ color: "var(--orlo-color-error)" }}>
          {rejected.map((r) => <div key={r.file.name}><span aria-hidden="true">! </span>{r.file.name}: {r.reason}</div>)}
        </div>
      )}
    </div>
  );
}
