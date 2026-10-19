import { useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Icons } from "../internal/icons.tsx";

/** Rough entropy-style estimate, 0–4. Good enough for feedback; never a security guarantee. */
export function passwordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^\w\s]/].filter((r) => r.test(pw)).length;
  const unique = new Set(pw).size;
  let s = Math.min(4, Math.floor(pw.length / 4)) + (classes - 1);
  if (unique < pw.length / 2) s -= 1; // "aaaaaaaa" is not strong
  if (/^(password|123456|qwerty|letmein)/i.test(pw)) s = 0;
  return Math.max(0, Math.min(4, s)) as 0 | 1 | 2 | 3 | 4;
}
const words = ["Too weak", "Weak", "Fair", "Good", "Strong"];

export type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode; help?: ReactNode; error?: ReactNode; showStrength?: boolean };

/** Reveal toggle that keeps caret and selection, a Caps Lock warning, and optional strength feedback in words and segments. */
export function PasswordField({ label, help, error, showStrength, id, value, onKeyDown, onKeyUp, ...rest }: PasswordFieldProps) {
  const auto = useId(); const fid = id ?? auto;
  const ref = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const [caps, setCaps] = useState(false);
  const strength = passwordStrength(typeof value === "string" ? value : "");
  const toggle = () => {
    const el = ref.current;
    if (!el) return setVisible((v) => !v);
    const [a, b, dir] = [el.selectionStart, el.selectionEnd, el.selectionDirection];
    setDissolving(true);
    setVisible((v) => !v);
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
      if (a !== null && b !== null) el.setSelectionRange(a, b, dir ?? undefined);
    });
    setTimeout(() => setDissolving(false), 180);
  };
  const capsCheck = (e: React.KeyboardEvent) => setCaps(e.getModifierState?.("CapsLock") ?? false);
  const msg = error ?? (caps ? "Caps Lock is on." : help);
  return (
    <div className="orlo-field" data-invalid={error ? "" : undefined}>
      <label className="orlo-field__label" htmlFor={fid}>{label}</label>
      <div className="orlo-input-group orlo-password-group">
        <input ref={ref} id={fid} type={visible ? "text" : "password"} className={["orlo-field__input", "orlo-password__input", dissolving ? "orlo-password--dissolving" : ""].filter(Boolean).join(" ")} value={value} autoComplete="current-password" spellCheck={false}
          aria-invalid={error ? true : undefined} aria-describedby={`${fid}-msg${showStrength ? ` ${fid}-str` : ""}`}
          onKeyDown={(e) => { capsCheck(e); onKeyDown?.(e); }} onKeyUp={(e) => { capsCheck(e); onKeyUp?.(e); }} onBlur={() => setCaps(false)} {...rest} />
        <button type="button" className="orlo-input-group__action orlo-password__toggle" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} aria-controls={fid} onClick={toggle} onMouseDown={(e) => e.preventDefault()}>
          {visible ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
        </button>
      </div>
      {showStrength && (
        <div className="orlo-strength" id={`${fid}-str`} data-level={strength}>
          <span className="orlo-strength__bars" aria-hidden="true">{[1, 2, 3, 4].map((i) => <span key={i} data-on={strength >= i || undefined} />)}</span>
          <span className="orlo-hint" aria-live="polite">Strength: {typeof value === "string" && value ? words[strength] : "—"}</span>
        </div>
      )}
      <p id={`${fid}-msg`} className="orlo-field__msg" role={error ? "alert" : undefined} data-warn={caps && !error ? "" : undefined}>{error ? <svg className="orlo-field__status" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 4.75v3.75M8 11h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg> : null}{msg}</p>
    </div>
  );
}
