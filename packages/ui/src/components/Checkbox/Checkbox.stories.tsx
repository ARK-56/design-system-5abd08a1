import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: { label: "Email me about product updates" }
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};
export const WithDescription: Story = {
  args: { description: "About once a month. No spam, unsubscribe any time." }
};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
