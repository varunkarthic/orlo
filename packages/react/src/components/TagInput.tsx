import { useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { useControllable } from "../internal/hooks.ts";
import { Icons } from "../internal/icons.tsx";

export type TagInputProps = {
  label: ReactNode;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (v: string[]) => void;
  /** Return an error message to reject a tag. */
  validate?: (tag: string) => string | undefined;
  max?: number;
  placeholder?: string;
  help?: ReactNode;
};

/**
 * Tokens from free text. Enter, comma or Tab adds; pasting "a, b; c" splits into three; duplicates are refused with a reason.
 * Backspace on an empty input selects the last tag, a second Backspace removes it.
 */
export function TagInput({ label, value: v, defaultValue = [], onValueChange, validate, max = Infinity, placeholder = "Add…", help }: TagInputProps) {
  const [tags, setTags] = useControllable(v, defaultValue, onValueChange);
  const [text, setText] = useState("");
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string>();
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const { transition } = useOrloMotion();
  const add = (raw: string[]) => {
    let next = [...tags]; let err: string | undefined;
    for (const r of raw.map((x) => x.trim()).filter(Boolean)) {
      if (next.length >= max) { err = `Up to ${max} allowed.`; break; }
      if (next.some((t) => t.toLowerCase() === r.toLowerCase())) { err = `“${r}” is already added.`; continue; }
      const bad = validate?.(r); if (bad) { err = bad; continue; }
      next = [...next, r];
    }
    setTags(next); setError(err); setText("");
  };
  const remove = (i: number) => { setTags(tags.filter((_, j) => j !== i)); setArmed(false); input.current?.focus(); };
  return (
    <div className="orlo-field" data-invalid={error ? "" : undefined}>
      <label className="orlo-field__label" htmlFor={id}>{label}</label>
      <motion.div layout className="orlo-field__input orlo-tags" onClick={() => input.current?.focus()} transition={transition("shift")}>
        <ul className="orlo-tags__list" aria-label="Added">
          <AnimatePresence initial={false} mode="popLayout">
            {tags.map((t, i) => (
              <motion.li key={t} className="orlo-chip" data-armed={armed && i === tags.length - 1 || undefined} layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1, transition: transition("reveal") }} exit={{ opacity: 0, scale: 0.85, transition: transition("dismiss") }} transition={transition("shift")}>
                <span>{t}</span>
                <button type="button" className="orlo-chip__remove" aria-label={`Remove ${t}`} onClick={(e) => { e.stopPropagation(); remove(i); }}><Icons.X size={14} /></button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <motion.div layout className="orlo-tags__input-wrap" transition={transition("shift")}>
          <input ref={input} id={id} value={text} placeholder={tags.length ? "" : placeholder} aria-describedby={`${id}-msg`} aria-invalid={error ? true : undefined}
            onChange={(e) => { setText(e.target.value); setArmed(false); setError(undefined); }}
            onPaste={(e) => { const t = e.clipboardData.getData("text"); if (/[,;\n]/.test(t)) { e.preventDefault(); add(t.split(/[,;\n]/)); } }}
            onBlur={() => text.trim() && add([text])}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if ((e.key === "Enter" || e.key === "," || (e.key === "Tab" && text.trim())) && text.trim()) { e.preventDefault(); add([text]); }
              else if (e.key === "Backspace" && !text && tags.length) { e.preventDefault(); armed ? remove(tags.length - 1) : setArmed(true); }
              else if (e.key === "Escape") setArmed(false);
            }} />
        </motion.div>
      </motion.div>
      <p id={`${id}-msg`} className="orlo-field__msg" role={error ? "alert" : undefined}>{error ?? (armed ? "Press Backspace again to remove." : help)}</p>
      <span className="orlo-visually-hidden" aria-live="polite">{tags.length} added</span>
    </div>
  );
}
