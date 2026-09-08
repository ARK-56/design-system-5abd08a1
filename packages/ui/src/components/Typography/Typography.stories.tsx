import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "./Heading";
import { Text } from "./Text";

const meta: Meta<typeof Heading> = {
  title: "Components/Typography",
  component: Heading,
  parameters: { layout: "padded" }
};
export default meta;

type Story = StoryObj<typeof Heading>;

/** Level sets the tag and the default size; they can be decoupled. */
export const Scale: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <Heading key={level} level={level}>
          Heading level {level}
        </Heading>
      ))}
    </div>
  )
};

export const SizeIndependentOfLevel: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Heading level={2} size="xs">
        An h2 sized xs — correct outline, quiet presentation
      </Heading>
      <Heading level={4} size="xl">
        An h4 sized xl — a section that looks like a title
      </Heading>
    </div>
  )
};

export const BodyText: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Text size="lg">Large body copy, for a standfirst or an intro paragraph.</Text>
      <Text size="md">Medium body copy, the default for long-form reading.</Text>
      <Text size="sm">Small body copy, the interface default.</Text>
      <Text size="xs" tone="secondary">
        Extra small in the secondary tone, for captions and helper text.
      </Text>
      <Text tone="danger" weight="medium">
        Danger tone for inline error copy.
      </Text>
    </div>
  )
};
