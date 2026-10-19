import { useId, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { useControllable } from "../internal/hooks.ts";
import { Icons } from "../internal/icons.tsx";

export type AccordionItem = { value: string; title: ReactNode; content: ReactNode; disabled?: boolean };
export type AccordionProps = {
  items: AccordionItem[];
  /** `single` keeps at most one open. */
  type?: "single" | "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (v: string[]) => void;
  headingLevel?: 2 | 3 | 4;
};

/** Height animates from measured content; collapsed content is unmounted, not merely hidden, so nothing invisible is focusable. */
export function Accordion({ items, type = "multiple", value: v, defaultValue = [], onValueChange, headingLevel = 3 }: AccordionProps) {
  const [open, setOpen] = useControllable(v, defaultValue, onValueChange);
  const id = useId();
  const { transition } = useOrloMotion();
  const H = `h${headingLevel}` as "h3";
  const toggle = (val: string) => {
    const isOpen = open.includes(val);
    setOpen(isOpen ? open.filter((x) => x !== val) : type === "single" ? [val] : [...open, val]);
  };
  return (
    <div className="orlo-accordion">
      {items.map((it) => {
        const expanded = open.includes(it.value);
        return (
          <div key={it.value} className="orlo-accordion__item" data-open={expanded || undefined}>
            <H className="orlo-accordion__heading">
              <button type="button" id={`${id}-b-${it.value}`} aria-expanded={expanded} aria-controls={`${id}-r-${it.value}`} disabled={it.disabled} className="orlo-accordion__trigger" onClick={() => toggle(it.value)}>
                <span>{it.title}</span>
                <motion.span aria-hidden="true" animate={{ rotate: expanded ? 180 : 0 }} transition={transition("press")} style={{ display: "inline-flex" }}><Icons.ChevronDown size={18} /></motion.span>
              </button>
            </H>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="c"
                  id={`${id}-r-${it.value}`}
                  role="region"
                  aria-labelledby={`${id}-b-${it.value}`}
                  className="orlo-accordion__region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1, transition: transition("expand") }}
                  exit={{ height: 0, opacity: 0, transition: transition("dismiss") }}
                >
                  <div className="orlo-accordion__content">{it.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export type CollapsibleProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  trigger?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

/**
 * An independent animated disclosure surface with spring physics and accessible semantics.
 */
export function Collapsible({
  open: o,
  defaultOpen = false,
  onOpenChange,
  title,
  trigger,
  children,
  disabled,
  className,
}: CollapsibleProps) {
  const [open, setOpen] = useControllable(o, defaultOpen, onOpenChange);
  const id = useId();
  const { transition } = useOrloMotion();
  const label = trigger ?? title;

  return (
    <div className={["orlo-collapsible", className].filter(Boolean).join(" ")} data-open={open || undefined}>
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={open}
        aria-controls={`${id}-region`}
        disabled={disabled}
        className="orlo-collapsible__trigger"
        onClick={() => setOpen(!open)}
      >
        <span>{label}</span>
        <motion.span aria-hidden="true" animate={{ rotate: open ? 180 : 0 }} transition={transition("press")} style={{ display: "inline-flex" }}>
          <Icons.ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-region`}
            role="region"
            aria-labelledby={`${id}-trigger`}
            className="orlo-collapsible__region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: transition("expand") }}
            exit={{ height: 0, opacity: 0, transition: transition("dismiss") }}
          >
            <div className="orlo-collapsible__content">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

