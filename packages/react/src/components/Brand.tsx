import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { title?: string };

/** The Orlo wordmark (lowercase, leaf terminals on r and l), filled with currentColor. Keep clear space of one "o" counter on every side. */
export function Wordmark({ title = "Orlo", ...rest }: P) {
  return (
    <svg viewBox="318 355 808 342" role="img" aria-label={title} {...rest}>
      <g fill="currentColor">
        <path fillRule="evenodd" d="M450 445C376 445 318 502 318 571C318 640 376 697 450 697C524 697 583 640 583 571C583 502 524 445 450 445ZM450 492C493 492 529 527 529 570C529 613 493 648 450 648C407 648 372 613 372 570C372 527 407 492 450 492Z" />
        <path d="M603 650V566C603 499 651 447 713 447H754C757 447 759 449 758 452C754 478 737 497 712 498C679 499 656 524 656 566V684C656 688 653 690 650 690H644C622 690 603 672 603 650Z" />
        <path d="M780 355H786C812 355 835 380 835 408V684C835 688 832 690 829 690H823C800 690 780 670 780 646V355Z" />
        <path fillRule="evenodd" d="M993 445C919 445 861 502 861 571C861 640 919 697 993 697C1067 697 1126 640 1126 571C1126 502 1067 445 993 445ZM993 492C1036 492 1072 527 1072 570C1072 613 1036 648 993 648C950 648 915 613 915 570C915 527 950 492 993 492Z" />
      </g>
    </svg>
  );
}

/** Compact mark: the wordmark's "o". Use below 20px wordmark height and for app icons. */
export function Mark({ title = "Orlo", ...rest }: P) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title} {...rest}>
      <g fill="currentColor"><path fillRule="evenodd" d="M50 4C23 4 2 25 2 50C2 75 23 96 50 96C77 96 98 75 98 50C98 25 77 4 50 4ZM50 21C66 21 79 34 79 50C79 66 66 79 50 79C34 79 21 66 21 50C21 34 34 21 50 21Z" /></g>
    </svg>
  );
}

export type BuiltWithOrloProps = {
  /** Caption above the wordmark. */
  kind?: "built" | "designed" | "made";
  /** Fixed brand colours, like store badges: they don't follow the page theme, so they look the same everywhere. */
  tone?: "dark" | "light" | "accent" | "outline";
  size?: "sm" | "md" | "lg";
  /** `stacked` is the badge (caption over wordmark); `inline` is a single-line pill for footers. */
  layout?: "stacked" | "inline";
  /** Where the badge links. Pass `null` to render a non-interactive badge. */
  href?: string | null;
  className?: string;
};

const CAPTION = { built: "Built with", designed: "Designed with", made: "Made with" } as const;

/**
 * An optional "Built with Orlo" badge for apps and sites made with Orlo. Never required; use it if you'd like to.
 * It is one link with a plain-text name ("Built with Orlo"), so screen readers don't spell out the artwork.
 */
export function BuiltWithOrlo({ kind = "built", tone = "dark", size = "md", layout = "stacked", href = "https://orlo-react.readthedocs.io/", className }: BuiltWithOrloProps) {
  const name = `${CAPTION[kind]} Orlo`;
  const inner = layout === "inline"
    ? <><Mark aria-hidden="true" role={undefined} className="orlo-bwo__mark" /><span className="orlo-bwo__caption">{CAPTION[kind]}</span><Wordmark aria-hidden="true" role={undefined} className="orlo-bwo__word" /></>
    : <span className="orlo-bwo__text"><span className="orlo-bwo__caption">{CAPTION[kind]}</span><Wordmark aria-hidden="true" role={undefined} className="orlo-bwo__word" /></span>;
  const props = { className: ["orlo-bwo", className].filter(Boolean).join(" "), "data-tone": tone, "data-size": size, "data-layout": layout, "aria-label": name };
  return href === null ? <span role="img" {...props}>{inner}</span> : <a href={href} {...props}>{inner}</a>;
}
