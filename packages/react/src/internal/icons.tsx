import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20, rest: SVGProps<SVGSVGElement>) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, focusable: false, ...rest,
});
const icon = (d: string) => ({ size, ...rest }: P) => <svg {...base(size, rest)}><path d={d} /></svg>;

/** Orlo's own 24px icon set: 1.75 stroke, round joins, optically centred. Decorative by default. */
export const Icons = {
  Check: icon("M5 12.5l4.5 4.5L19 7.5"),
  X: icon("M6 6l12 12M18 6L6 18"),
  ChevronDown: icon("M6 9.5l6 6 6-6"),
  ChevronRight: icon("M9.5 6l6 6-6 6"),
  ChevronLeft: icon("M14.5 6l-6 6 6 6"),
  Copy: icon("M9 9h10v10H9zM5 15V5h10"),
  Search: icon("M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5"),
  Info: icon("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01"),
  Alert: icon("M12 3.5l9.5 16.5h-19zM12 10v4.5M12 17.5h.01"),
  Image: icon("M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4"),
  Menu: icon("M4 7h16M4 12h16M4 17h16"),
  Minus: icon("M6 12h12"),
  Plus: icon("M12 6v12M6 12h12"),
  Sun: icon("M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"),
  Moon: icon("M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"),
  Sort: icon("M8 9l4-4 4 4M8 15l4 4 4-4"),
  ArrowUp: icon("M12 19V5M6 11l6-6 6 6"),
  ArrowDown: icon("M12 5v14M6 13l6 6 6-6"),
  Inbox: icon("M3 13l3-8h12l3 8v6H3zM3 13h5l1.5 2.5h5L16 13h5"),
  More: icon("M5 12h.01M12 12h.01M19 12h.01"),
};
export type IconName = keyof typeof Icons;
