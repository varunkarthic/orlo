import type { SVGProps } from "react";

/** The Orlo wordmark in currentColor. Stroke-built so it stays editable; `title` gives it an accessible name. */
export function Wordmark({ title = "Orlo", ...rest }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg viewBox="0 0 240 100" role="img" aria-label={title} {...rest}>
      <g fill="none" stroke="currentColor" strokeWidth="12" strokeLinejoin="round">
        <path d="M79.5 29.4A36 36 0 1 1 66.9 18.2" />
        <path d="M110 86V64C110 48 122 40 136 40" />
        <path d="M156 14V86" />
        <circle cx="204" cy="62" r="24" />
      </g>
    </svg>
  );
}

/** Compact mark: an O with an open rim, like an unstitched hem. */
export function Mark({ title = "Orlo", ...rest }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title} {...rest}>
      <path d="M79.5 29.4A36 36 0 1 1 66.9 18.2" fill="none" stroke="currentColor" strokeWidth="14" />
    </svg>
  );
}
