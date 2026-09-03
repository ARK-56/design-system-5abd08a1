import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";
import { Button } from "../Button/Button";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Order #10482</CardTitle>
        <CardDescription>Placed 2 days ago - awaiting fulfillment.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-100 text-foreground-secondary">3 items - $128.40 total</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Mark fulfilled</Button>
        <Button size="sm" variant="outline">
          View details
        </Button>
      </CardFooter>
    </Card>
  )
};
