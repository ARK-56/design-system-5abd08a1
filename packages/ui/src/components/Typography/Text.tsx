import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const textVariants = cva("font-body", {
  variants: {
    size: {
      xs: "text-50",
      sm: "text-100",
      md: "text-200",
      lg: "text-300"
    },
    tone: {
      default: "text-foreground",
      secondary: "text-foreground-secondary",
      disabled: "text-foreground-disabled",
      brand: "text-brand",
      danger: "text-danger"
    },
    weight: {
      regular: "font-regular",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold"
    }
  },
  defaultVariants: { size: "sm", tone: "default", weight: "regular" }
});

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">,
    VariantProps<typeof textVariants> {
  /** Render as the child element instead of a <p> (a <span>, a <label>, …). */
  asChild?: boolean;
}

/** Body copy at a scale step, so the step stays swappable. */
export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size, tone, weight, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "p";
    return (
      <Comp ref={ref} className={cn(textVariants({ size, tone, weight }), className)} {...props} />
    );
  }
);
Text.displayName = "Text";

export { textVariants };
