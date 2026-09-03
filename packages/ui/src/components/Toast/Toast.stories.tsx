import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "./Toaster";
import { ToastAction } from "./Toast";
import { toast } from "./use-toast";
import { Button } from "../Button/Button";

const meta: Meta = {
  title: "Components/Toast"
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <>
      <Button
        onClick={() =>
          toast({
            title: "Changes saved",
            description: "Your profile has been updated."
          })
        }
      >
        Show toast
      </Button>
      <Toaster />
    </>
  )
};

export const WithAction: Story = {
  render: () => (
    <>
      <Button
        variant="danger"
        onClick={() =>
          toast({
            variant: "danger",
            title: "Payment failed",
            description: "Your card was declined.",
            action: <ToastAction altText="Retry payment">Retry</ToastAction>
          })
        }
      >
        Trigger failed payment toast
      </Button>
      <Toaster />
    </>
  )
};
