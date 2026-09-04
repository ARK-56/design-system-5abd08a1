import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const headingVariants = cva("font-heading text-foreground", {
  variants: {
    size: {
      "2xl": "text-800 font-bold",
      xl: "text-700 font-bold",
      lg: "text-600 font-semibold",
      md: "text-500 font-semibold",
      sm: "text-400 font-semibold",
      xs: "text-300 font-semibold"
    }
  },
  defaultVariants: { size: "md" }
});

/** Visual size a level defaults to. Override with `size` when the document
 *  outline and the visual hierarchy legitimately differ. */
const SIZE_FOR_LEVEL = { 1: "2xl", 2: "xl", 3: "lg", 4: "md", 5: "sm", 6: "xs" } as const;

export interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">,
    VariantProps<typeof headingVariants> {
  /** Heading level, which sets the rendered tag and the default size. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  asChild?: boolean;
}

/**
 * Exposes the type scale so consuming code never hardcodes `text-500
 * font-semibold`. Level and size are separate on purpose: the tag belongs to
 * the document outline, the size to the layout.
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : (`h${level}` as "h1");
    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ size: size ?? SIZE_FOR_LEVEL[level] }), className)}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

export { headingVariants };
