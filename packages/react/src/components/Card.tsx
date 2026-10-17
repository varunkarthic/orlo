import { forwardRef, type HTMLAttributes } from "react";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card({ className, ...rest }, ref) {
  return <div ref={ref} className={["orlo-card", className].filter(Boolean).join(" ")} {...rest} />;
});
