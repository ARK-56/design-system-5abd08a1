import * as React from "react";
import { cn } from "../../lib/utils";
import { Icon, type IconProps } from "./Icon";

/** The icons this library needs for its own components. Not a general set. */

export const CheckIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <Icon ref={ref} {...props}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
));
CheckIcon.displayName = "CheckIcon";

export const CloseIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <Icon ref={ref} {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
));
CloseIcon.displayName = "CloseIcon";

export const SpinnerIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, ...props }, ref) => (
    <Icon ref={ref} className={cn("animate-spin", className)} {...props}>
      <circle className="opacity-25" cx="12" cy="12" r="9" />
      <path className="opacity-75" d="M21 12a9 9 0 0 0-9-9" />
    </Icon>
  )
);
SpinnerIcon.displayName = "SpinnerIcon";
