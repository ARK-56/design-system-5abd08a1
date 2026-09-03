import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge, Button, CardTitle, cn } from "../src";

/**
 * Regression guards for a class of bug that behaviour tests cannot see:
 * tailwind-merge silently dropping a utility because it misfiled the numeric
 * font scale into its text-colour group. When that happened, `lg` buttons lost
 * text-on-brand entirely and rendered dark text on the brand fill.
 */
describe("cn() keeps font size and text colour independent", () => {
  it("does not let a colour utility evict a size utility", () => {
    expect(cn("text-100", "text-foreground")).toBe("text-100 text-foreground");
  });

  it("still lets a later size override an earlier one", () => {
    expect(cn("text-100", "text-300")).toBe("text-300");
  });

  it("still lets a later colour override an earlier one", () => {
    expect(cn("text-foreground", "text-on-brand")).toBe("text-on-brand");
  });
});

describe("Button keeps both its size and its foreground at every size", () => {
  it.each([
    ["sm", "text-50"],
    ["md", "text-100"],
    ["lg", "text-200"]
  ] as const)("%s carries %s and text-on-brand", (size, sizeClass) => {
    render(<Button size={size}>Go</Button>);
    const cls = screen.getByRole("button").className;
    expect(cls).toContain(sizeClass);
    expect(cls).toContain("text-on-brand");
  });
});

describe("status foregrounds are the on-subtle variants", () => {
  it.each(["brand", "success", "warning", "danger"] as const)(
    "Badge %s pairs its subtle background with its on-subtle foreground",
    (variant) => {
      render(<Badge variant={variant}>Label</Badge>);
      const cls = screen.getByText("Label").className;
      expect(cls).toContain(`bg-${variant}-subtle`);
      expect(cls).toContain(`text-${variant}-on-subtle`);
      expect(cls).toContain("text-50");
    }
  );
});

describe("typography components keep their scale step", () => {
  it("CardTitle keeps text-300 alongside its colour", () => {
    render(<CardTitle>Order</CardTitle>);
    const cls = screen.getByText("Order").className;
    expect(cls).toContain("text-300");
    expect(cls).toContain("text-foreground");
  });
});
