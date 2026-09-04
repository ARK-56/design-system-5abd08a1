import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../../lib/utils";
import { CheckIcon } from "../Icon";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;

    const control = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={cn(
          "peer h-5 w-5 shrink-0 rounded-sm border border-border-control bg-surface",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:border-border-focus",
          "data-[state=checked]:bg-brand data-[state=checked]:border-brand",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-on-brand">
          <CheckIcon size="sm" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    if (!label) return control;

    return (
      <div className="flex items-start gap-2.5">
        {control}
        <div className="flex flex-col gap-0.5">
          <LabelPrimitive.Root htmlFor={checkboxId} className="text-100 font-medium text-foreground">
            {label}
          </LabelPrimitive.Root>
          {description && <p className="text-50 text-foreground-secondary">{description}</p>}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
