import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="details" className="w-[420px]">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="shipping">Shipping</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="details">
        <p className="text-100 text-foreground-secondary">Order details go here.</p>
      </TabsContent>
      <TabsContent value="shipping">
        <p className="text-100 text-foreground-secondary">Shipping address and method.</p>
      </TabsContent>
      <TabsContent value="billing">
        <p className="text-100 text-foreground-secondary">Payment method and invoices.</p>
      </TabsContent>
    </Tabs>
  )
};
