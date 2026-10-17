import { cloneElement, isValidElement, type ReactElement, type Ref } from "react";

type TriggerProps = Record<string, unknown> & { ref?: Ref<HTMLElement> };

/** Clones the consumer's trigger element, merging handlers instead of replacing them. */
export function withTrigger(el: ReactElement | undefined, props: TriggerProps) {
  if (!isValidElement(el)) return null;
  const own = el.props as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...props };
  for (const k of Object.keys(props)) {
    if (k.startsWith("on") && typeof own[k] === "function" && typeof props[k] === "function") {
      merged[k] = (...a: unknown[]) => { (own[k] as (...x: unknown[]) => void)(...a); (props[k] as (...x: unknown[]) => void)(...a); };
    }
  }
  return cloneElement(el as ReactElement<Record<string, unknown>>, merged);
}
