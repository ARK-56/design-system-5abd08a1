import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  args: { children: "Fulfilled" },
  argTypes: {
    variant: { control: "select", options: ["neutral", "brand", "success", "warning", "danger"] }
  }
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Neutral: Story = { args: { variant: "neutral", children: "Draft" } };
export const Brand: Story = { args: { variant: "brand", children: "New" } };
export const Success: Story = { args: { variant: "success", children: "Fulfilled" } };
export const Warning: Story = { args: { variant: "warning", children: "Backordered" } };
export const Danger: Story = { args: { variant: "danger", children: "Payment failed" } };
