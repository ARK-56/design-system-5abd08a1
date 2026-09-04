import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "./Icon";
import { CheckIcon, CloseIcon, SpinnerIcon } from "./icons";

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  parameters: { layout: "padded" }
};
export default meta;

type Story = StoryObj<typeof Icon>;

/** The icons the library uses for its own components. */
export const Library: Story = {
  render: () => (
    <div className="flex items-center gap-6 text-foreground">
      <CheckIcon />
      <CloseIcon />
      <SpinnerIcon />
    </div>
  )
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6 text-foreground">
      <CheckIcon size="sm" />
      <CheckIcon size="md" />
      <CheckIcon size="lg" />
    </div>
  )
};

/** Icons inherit colour, so they follow whatever token the context sets. */
export const InheritsColour: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <CheckIcon className="text-success" />
      <CloseIcon className="text-danger" />
      <CheckIcon className="text-brand" />
      <CheckIcon className="text-foreground-secondary" />
    </div>
  )
};

/** Wrap any path data to get the same viewBox, stroke and sizing contract. */
export const CustomPathData: Story = {
  render: () => (
    <Icon size="lg" label="Download" className="text-foreground">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" />
    </Icon>
  )
};
