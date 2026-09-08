import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const iconVariants = cva(
  "shrink-0 [stroke-width:var(--component-icon-stroke)]",
  {
    variants: {
      size: {
        sm: "h-[var(--component-icon-size-sm)] w-[var(--component-icon-size-sm)]",
        md: "h-[var(--component-icon-size-md)] w-[var(--component-icon-size-md)]",
        lg: "h-[var(--component-icon-size-lg)] w-[var(--component-icon-size-lg)]"
      }
    },
    defaultVariants: { size: "md" }
  }
);

export interface IconProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof iconVariants> {
  /**
   * Give a label only when the icon carries meaning no adjacent text already
   * conveys. Without one the icon is hidden from assistive technology, which
   * is the right default for icons sitting beside a visible label.
   */
  label?: string;
}

/**
 * The icon contract rather than an icon set: a 24-unit viewBox, `currentColor`,
 * token-driven size and stroke. Wrap any path data in it -- the four icons this
 * library ships, or a third-party set a consuming app prefers -- and it renders
 * consistently with everything else.
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, label, children, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(iconVariants({ size }), className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {children}
    </svg>
  )
);
Icon.displayName = "Icon";

export { iconVariants };
