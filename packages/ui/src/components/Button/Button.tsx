import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { SpinnerIcon } from "../Icon";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-100 font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active",
        secondary: "bg-surface-sunken text-foreground hover:bg-surface-sunken-hover",
        outline: "border border-border bg-transparent text-foreground hover:bg-surface-sunken",
        ghost: "bg-transparent text-foreground hover:bg-surface-sunken",
        danger: "bg-danger text-on-danger hover:bg-danger-hover"
      },
      size: {
        sm: "h-[var(--component-control-height-sm)] px-3 text-50",
        md: "h-[var(--component-control-height-md)] px-4",
        lg: "h-[var(--component-control-height-lg)] px-6 text-200"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element instead of a <button> (e.g. a Next.js <Link>). */
  asChild?: boolean;
  /** Shows a loading spinner and disables the button. */
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <SpinnerIcon size="sm" />}
        {/*
          Slottable marks which child Slot should merge into. Without it the
          spinner slot counts as a second child -- even when isLoading is false,
          because `{false}` is still a child -- and asChild throws.
        */}
        <Slottable>{children}</Slottable>
      </Comp>
    );
  }
);
Button.displayName = "Button";
