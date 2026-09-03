import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  args: { label: "Work email", placeholder: "you@company.com" }
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Required: Story = { args: { required: true } };
export const WithHint: Story = { args: { hint: "We'll only use this for order updates." } };
export const WithError: Story = {
  args: { error: "Enter a valid work email address.", defaultValue: "not-an-email" }
};
export const Disabled: Story = { args: { disabled: true, defaultValue: "you@company.com" } };
