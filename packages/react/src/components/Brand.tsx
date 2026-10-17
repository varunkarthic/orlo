import type { SVGProps } from "react";

/** The Orlo wordmark in currentColor. Stroke-built so it stays editable; `title` gives it an accessible name. */
export function Wordmark({ title = "Orlo", ...rest }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg viewBox="0 0 256 100" role="img" aria-label={title} {...rest}>
      <g fill="none" stroke="currentColor" strokeWidth="12" strokeLinejoin="round">
        <path d="M66.9 81.8A36 36 0 1 1 79.5 70.6" />
        <path d="M122 86V64C122 48 134 40 148 40" />
        <path d="M170 14V86" />
        <circle cx="214" cy="62" r="24" />
      </g>
    </svg>
  );
}

/** Compact mark: an O with an open rim, like an unstitched hem. */
export function Mark({ title = "Orlo", ...rest }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title} {...rest}>
      <path d="M66.9 81.8A36 36 0 1 1 79.5 70.6" fill="none" stroke="currentColor" strokeWidth="14" />
    </svg>
  );
}
