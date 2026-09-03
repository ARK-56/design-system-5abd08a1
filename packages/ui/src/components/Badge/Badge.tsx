import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-50 font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-surface-sunken text-foreground-secondary",
        brand: "bg-brand-subtle text-brand-on-subtle",
        success: "bg-success-subtle text-success-on-subtle",
        warning: "bg-warning-subtle text-warning-on-subtle",
        danger: "bg-danger-subtle text-danger-on-subtle"
      }
    },
    defaultVariants: { variant: "neutral" }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
);
Badge.displayName = "Badge";
