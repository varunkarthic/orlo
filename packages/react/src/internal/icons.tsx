import type { SVGProps } from "react";
import type React from "react";
import { iconDefs, type IconName } from "./icon-defs.ts";

export type IconWeight = "light" | "regular" | "bold";
const strokes: Record<IconWeight, number> = { light: 1.25, regular: 1.75, bold: 2.25 };

export type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: number;
  weight?: IconWeight;
  /** Keeps visual stroke width constant regardless of size. */
  absoluteStroke?: boolean;
  /** Accessible name. Omit for decorative icons (the default). */
  label?: string;
  /** Smooth animation modifier. */
  animation?: "spin" | "pulse" | "bounce" | "hover-rotate" | "none";
  /** Rotation angle in degrees. */
  rotate?: number;
  /** Flip orientation. */
  flip?: "horizontal" | "vertical";
};

/** Orlo icon. Decorative unless `label` is given, in which case it becomes role="img" with that name. */
export function Icon({ name, size = 20, weight = "regular", absoluteStroke, label, animation, rotate, flip, style, className, ...rest }: IconProps) {
  const sw = absoluteStroke ? (strokes[weight] * 24) / size : strokes[weight];
  const animCls = animation && animation !== "none" ? `orlo-icon--${animation}` : "";
  const transform = [
    rotate ? `rotate(${rotate}deg)` : "",
    flip === "horizontal" ? "scaleX(-1)" : flip === "vertical" ? "scaleY(-1)" : "",
  ].filter(Boolean).join(" ");

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      focusable={false}
      className={`orlo-icon ${animCls} ${className ?? ""}`.trim()}
      style={{ ...(transform ? { transform } : {}), ...style }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      {...rest}>
      <path d={iconDefs[name]} />
    </svg>
  );
}

type P = Omit<IconProps, "name">;
/** Every icon as a component: <Icons.Search size={16} />. */
export const Icons = Object.fromEntries((Object.keys(iconDefs) as IconName[]).map((n) => [n, (props: P) => <Icon name={n} {...props} />])) as Record<IconName, (p: P) => React.JSX.Element>;
export const iconNames = Object.keys(iconDefs) as IconName[];
export type { IconName };
