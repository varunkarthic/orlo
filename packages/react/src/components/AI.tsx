import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Icons } from "../internal/icons.tsx";
import { AnimatedIcon } from "../internal/animated-icons.tsx";
import { Markdown } from "./Editor.tsx";
import { Avatar } from "./Avatar.tsx";
import { useLocale } from "../provider.tsx";

export type ChatMessage = { id: string; role: "user" | "assistant" | "system"; content: string; author?: string; time?: Date; citations?: { id: string; title: string; href: string; source?: string }[]; status?: "streaming" | "done" | "error" | "stopped" };

/**
 * Conversation thread. Keeps the newest message in view while the reader is at the bottom, but never yanks
 * the scroll position if they have scrolled up to read; offers "Jump to latest" instead. Streaming text is
 * announced in calm chunks (sentences), not per token.
 */
export function ChatThread({ messages, label = "Conversation", assistantName = "Assistant", onRetry }: { messages: ChatMessage[]; label?: string; assistantName?: string; onRetry?: (id: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);
  const { transition, distance } = useOrloMotion();
  const locale = useLocale();
  const last = messages[messages.length - 1];
  useEffect(() => { const el = box.current; if (el && pinned) el.scrollTop = el.scrollHeight; }, [messages, last?.content, pinned]);
  return (
    <div className="orlo-chat">
      <div ref={box} className="orlo-chat__log" role="log" aria-label={label} aria-live="off" tabIndex={0} onScroll={(e) => { const el = e.currentTarget; setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 40); }}>
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.article key={m.id} className="orlo-msg" data-role={m.role} initial={{ opacity: 0, y: distance(8) }} animate={{ opacity: 1, y: 0, transition: transition("reveal") }} aria-label={`${m.role === "user" ? m.author ?? "You" : assistantName}${m.time ? `, ${m.time.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}` : ""}`}>
              {m.role !== "system" && <span className="orlo-msg__avatar" aria-hidden="true">{m.role === "user" ? <Avatar name={m.author ?? "You"} size="sm" /> : <span className="orlo-msg__bot"><Icons.Sparkle size={16} /></span>}</span>}
              <div className="orlo-msg__bubble">
                {m.role === "system" ? <p className="orlo-hint" style={{ margin: 0 }}>{m.content}</p> : <Markdown source={m.content || " "} />}
                {m.status === "streaming" && <span className="orlo-msg__caret" aria-hidden="true" />}
                {m.citations?.length ? <ol className="orlo-msg__cites" aria-label="Sources">{m.citations.map((c, i) => <li key={c.id}><a href={c.href} target="_blank" rel="noopener noreferrer"><span className="orlo-msg__cite-n">{i + 1}</span>{c.title}{c.source && <span className="orlo-hint"> · {c.source}</span>}</a></li>)}</ol> : null}
                {m.status === "error" && <p className="orlo-msg__error" role="alert"><Icons.AlertCircle size={16} /> The response was interrupted. {onRetry && <button type="button" className="orlo-link-button" onClick={() => onRetry(m.id)}>Retry</button>}</p>}
                {m.status === "stopped" && <p className="orlo-hint" style={{ margin: "6px 0 0" }}>Stopped. The answer above is incomplete.</p>}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>{!pinned && <motion.button type="button" className="orlo-chat__jump orlo-button" data-variant="subtle" data-size="sm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} onClick={() => { setPinned(true); box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" }); }}><Icons.ArrowDown size={14} /> Jump to latest</motion.button>}</AnimatePresence>
      <span className="orlo-visually-hidden" aria-live="polite">{last?.role === "assistant" && last.status === "done" ? `${assistantName} replied` : ""}</span>
    </div>
  );
}

export type ComposerProps = { onSend: (text: string) => void; onStop?: () => void; busy?: boolean; placeholder?: string; label?: string; suggestions?: string[]; maxLength?: number };

/** Message composer: Enter sends, Shift+Enter adds a line, never sends mid-IME composition, grows with content, and becomes a Stop button while a reply is generating. */
export function Composer({ onSend, onStop, busy, placeholder = "Ask anything…", label = "Message", suggestions, maxLength = 4000 }: ComposerProps) {
  const [text, setText] = useState("");
  const id = useId();
  const send = () => { const t = text.trim(); if (!t || busy) return; onSend(t); setText(""); };
  return (
    <div className="orlo-composer">
      {suggestions?.length ? <div className="orlo-composer__suggest" role="group" aria-label="Suggestions">{suggestions.map((s) => <button key={s} type="button" className="orlo-chip" data-kind="assist" onClick={() => onSend(s)} disabled={busy}><Icons.Sparkle size={14} />{s}</button>)}</div> : null}
      <div className="orlo-composer__box">
        <label htmlFor={id} className="orlo-visually-hidden">{label}</label>
        <textarea id={id} className="orlo-composer__input" value={text} rows={1} maxLength={maxLength} placeholder={placeholder} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
        {busy && onStop
          ? <button type="button" className="orlo-icon-button orlo-composer__send" data-variant="subtle" aria-label="Stop generating" onClick={onStop}><Icons.Stop size={16} /></button>
          : <button type="button" className="orlo-icon-button orlo-composer__send" data-variant="solid" aria-label="Send" disabled={!text.trim() || busy} onClick={send}><Icons.ArrowUp size={18} /></button>}
      </div>
      <p className="orlo-hint orlo-composer__hint">Enter to send · Shift+Enter for a new line{text.length > maxLength * 0.9 ? ` · ${maxLength - text.length} characters left` : ""}</p>
    </div>
  );
}

export type ToolStep = { label: string; status: "pending" | "running" | "done" | "failed" | "skipped"; detail?: ReactNode };

/** Transparent progress for multi-step work (tool calls, agents, pipelines). Shows real status per step; never implies completion before it happens. */
export function ToolRun({ title, steps, defaultOpen = true }: { title: string; steps: ToolStep[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const done = steps.filter((s) => s.status === "done").length;
  const failed = steps.some((s) => s.status === "failed");
  const running = steps.some((s) => s.status === "running");
  const { transition } = useOrloMotion();
  const id = useId();
  return (
    <section className="orlo-toolrun" data-state={failed ? "failed" : running ? "running" : done === steps.length ? "done" : "pending"}>
      <button type="button" className="orlo-toolrun__head" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <span className="orlo-toolrun__icon" aria-hidden="true">{failed ? <Icons.AlertCircle size={18} /> : running ? <AnimatedIcon name="spinner" size={18} /> : done === steps.length ? <AnimatedIcon name="check" size={18} /> : <Icons.Clock size={18} />}</span>
        <span className="orlo-toolrun__title">{title}</span>
        <span className="orlo-hint">{failed ? "Needs attention" : `${done} of ${steps.length}`}</span>
        <AnimatedIcon name="chevron" active={open} size={16} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ol id={id} className="orlo-toolrun__steps" initial={{ height: 0, opacity: 0, paddingBottom: 0 }} animate={{ height: "auto", opacity: 1, paddingBottom: 12, transition: transition("expand") }} exit={{ height: 0, opacity: 0, paddingBottom: 0, transition: transition("collapse") }}>
            {steps.map((s, i) => (
              <li key={i} data-status={s.status}>
                <span className="orlo-toolrun__dot" aria-hidden="true">{s.status === "done" ? <Icons.Check size={12} /> : s.status === "failed" ? <Icons.X size={12} /> : s.status === "running" ? <span className="orlo-toolrun__pulse" /> : null}</span>
                <span>{s.label}{s.detail && <span className="orlo-hint">{s.detail}</span>}</span>
                <span className="orlo-visually-hidden">, {s.status}</span>
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
      <span className="orlo-visually-hidden" aria-live="polite">{running ? "" : failed ? `${title}: a step failed` : done === steps.length ? `${title}: complete` : ""}</span>
    </section>
  );
}

/** Thumbs up/down with an optional reason; a quiet, reversible signal. */
export function ResponseFeedback({ onFeedback }: { onFeedback?: (v: "up" | "down" | null) => void }) {
  const [v, setV] = useState<"up" | "down" | null>(null);
  const pick = (n: "up" | "down") => { const next = v === n ? null : n; setV(next); onFeedback?.(next); };
  return (
    <div className="orlo-feedback" role="group" aria-label="Was this helpful?">
      <button type="button" className="orlo-icon-button" data-variant="ghost" data-size="sm" aria-label="Helpful" aria-pressed={v === "up"} onClick={() => pick("up")}><Icons.ThumbsUp size={16} /></button>
      <button type="button" className="orlo-icon-button" data-variant="ghost" data-size="sm" aria-label="Not helpful" aria-pressed={v === "down"} onClick={() => pick("down")}><Icons.ThumbsDown size={16} /></button>
      <span className="orlo-hint" aria-live="polite">{v ? "Thanks for the feedback" : ""}</span>
    </div>
  );
}
