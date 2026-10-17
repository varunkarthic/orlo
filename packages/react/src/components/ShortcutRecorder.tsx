import { useEffect, useRef, useState, type ReactNode } from "react";

/** Platform for key labels, resolved after mount (the server can't know it). */
function useIsMac() { const [mac, setMac] = useState(false); useEffect(() => setMac(isMac()), []); return mac; }
import { useControllable } from "../internal/hooks.ts";

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
/** Shortcuts the browser or OS will intercept before a page can see them. */
const RESERVED = ["Mod+W", "Mod+T", "Mod+N", "Mod+Q", "Mod+Shift+T", "Mod+Shift+N", "Mod+L", "Mod+Tab", "Alt+F4", "Alt+Tab", "Mod+R", "Mod+P"];

export function comboFrom(e: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">, mac = isMac()): string | null {
  if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) return null;
  const parts: string[] = [];
  if (mac ? e.metaKey : e.ctrlKey) parts.push("Mod");
  if (mac && e.ctrlKey) parts.push("Ctrl");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");
  if (!parts.length) return null; // a lone key is not a shortcut
  parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
  return parts.join("+");
}

export const comboLabel = (combo: string, mac = isMac()) => combo.split("+").map((p) => ({ Mod: mac ? "⌘" : "Ctrl", Ctrl: "⌃", Alt: mac ? "⌥" : "Alt", Shift: mac ? "⇧" : "Shift", ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→", " ": "Space" } as Record<string, string>)[p] ?? p);

export type ShortcutRecorderProps = { label: ReactNode; value?: string | null; defaultValue?: string | null; onValueChange?: (v: string | null) => void; taken?: string[] };

/** Records a key combination. Warns about shortcuts the browser reserves and ones already in use. Escape cancels; Backspace clears. */
export function ShortcutRecorder({ label, value: v, defaultValue = null, onValueChange, taken = [] }: ShortcutRecorderProps) {
  const [value, setValue] = useControllable<string | null>(v, defaultValue, onValueChange);
  const [recording, setRecording] = useState(false);
  const [warn, setWarn] = useState<string>();
  const btn = useRef<HTMLButtonElement>(null);
  const mac = useIsMac();
  useEffect(() => {
    if (!recording) return;
    const on = (e: KeyboardEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (e.key === "Escape") return setRecording(false);
      if (e.key === "Backspace" && !e.metaKey && !e.ctrlKey) { setValue(null); setWarn(undefined); return setRecording(false); }
      const c = comboFrom(e, mac); if (!c) return;
      setWarn(RESERVED.includes(c) ? "Your browser uses this shortcut, so pages never receive it." : taken.includes(c) ? "Already assigned to another action." : undefined);
      setValue(c); setRecording(false);
    };
    window.addEventListener("keydown", on, true);
    return () => window.removeEventListener("keydown", on, true);
  }, [recording, taken, setValue, mac]);
  return (
    <div className="orlo-field">
      <span className="orlo-field__label">{label}</span>
      <button ref={btn} type="button" className="orlo-field__input orlo-shortcut" data-recording={recording || undefined} aria-pressed={recording} onClick={() => setRecording((r) => !r)} onBlur={() => setRecording(false)}>
        {recording ? <span className="orlo-shortcut__hint">Press keys… <span className="orlo-hint">Esc to cancel</span></span>
          : value ? <span className="orlo-shortcut__keys">{comboLabel(value, mac).map((k, i) => <kbd key={i} className="orlo-kbd">{k}</kbd>)}</span>
          : <span data-placeholder="">Click to record</span>}
      </button>
      <p className="orlo-field__msg" role={warn ? "alert" : undefined} data-warn={warn ? "" : undefined}>{warn ?? (value ? "Backspace while recording clears it." : `Include ${mac ? "⌘" : "Ctrl"}, ${mac ? "⌥" : "Alt"} or Shift.`)}</p>
    </div>
  );
}
