import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Shown below the field. Overrides `hint` and marks the field invalid when set. */
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, required, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const messageId = error || hint ? `${inputId}-message` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <LabelPrimitive.Root
            htmlFor={inputId}
            className="text-100 font-medium text-foreground"
          >
            {label}
            {required && <span className="text-danger"> *</span>}
          </LabelPrimitive.Root>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={messageId}
          className={cn(
            "h-[var(--component-control-height-md)] rounded-md border border-border bg-surface px-[var(--component-control-padding-x)] text-100 text-foreground",
            "placeholder:text-foreground-disabled",
            "focus-visible:outline-none focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-border-focus",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-sunken",
            error && "border-danger focus-visible:border-danger focus-visible:ring-danger",
            className
          )}
          {...props}
        />
        {(error || hint) && (
          <p id={messageId} className={cn("text-50", error ? "text-danger" : "text-foreground-secondary")}>
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
