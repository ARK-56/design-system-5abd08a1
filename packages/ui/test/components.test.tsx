import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toaster,
  toast
} from "../src";
import { expectNoViolations } from "./axe";

describe("Button", () => {
  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled and marked busy while loading, and swallows clicks", async () => {
    const onClick = vi.fn();
    render(<Button isLoading onClick={onClick}>Saving</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders as its child element when asChild is set", () => {
    render(<Button asChild><a href="/next">Continue</a></Button>);
    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute("href", "/next");
  });
});

describe("Input", () => {
  it("associates its label, so the field is reachable by name", async () => {
    render(<Input label="Work email" />);
    await userEvent.type(screen.getByLabelText("Work email"), "a@b.co");
    expect(screen.getByLabelText("Work email")).toHaveValue("a@b.co");
  });

  it("generates SSR-stable ids that agree across label, field and message", () => {
    render(<Input label="Work email" hint="We only use this for receipts" />);
    const field = screen.getByLabelText("Work email");
    const describedBy = field.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent("We only use this for receipts");
  });

  it("marks itself invalid and describes the error when one is given", () => {
    render(<Input label="Work email" error="Enter a valid address" />);
    const field = screen.getByLabelText("Work email");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(document.getElementById(field.getAttribute("aria-describedby") as string))
      .toHaveTextContent("Enter a valid address");
  });

  it("prefers the error over the hint", () => {
    render(<Input label="Email" hint="Never shown" error="Required" />);
    expect(screen.queryByText("Never shown")).not.toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});

describe("Checkbox", () => {
  it("toggles and stays label-associated", async () => {
    render(<Checkbox label="Email me receipts" />);
    const box = screen.getByRole("checkbox", { name: "Email me receipts" });
    expect(box).toHaveAttribute("data-state", "unchecked");
    await userEvent.click(box);
    expect(box).toHaveAttribute("data-state", "checked");
  });
});

describe("Tabs", () => {
  it("switches panels on selection", async () => {
    render(
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>
        <TabsContent value="details">Order details</TabsContent>
        <TabsContent value="shipping">Shipping address</TabsContent>
      </Tabs>
    );
    expect(screen.getByText("Order details")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Shipping" }));
    expect(screen.getByText("Shipping address")).toBeInTheDocument();
  });
});

describe("Dialog", () => {
  it("opens from its trigger and exposes an accessible name", async () => {
    render(
      <Dialog>
        <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
        <DialogContent>
          <DialogTitle>Cancel order</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Cancel order");
  });
});

describe("toast()", () => {
  it("updates a toast in place rather than queueing a duplicate", async () => {
    render(<Toaster />);
    let handle: ReturnType<typeof toast>;
    act(() => { handle = toast({ title: "Uploading" }); });
    await waitFor(() => expect(screen.getByText("Uploading")).toBeInTheDocument());

    act(() => { handle.update({ title: "Upload complete" }); });
    await waitFor(() => expect(screen.getByText("Upload complete")).toBeInTheDocument());

    expect(screen.queryByText("Uploading")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Upload complete/)).toHaveLength(1);
  });
});

describe("accessibility", () => {
  it.each([
    ["Button", <Button key="b">Save changes</Button>],
    ["Input with error", <Input key="i" label="Work email" error="Required" />],
    ["Checkbox", <Checkbox key="c" label="Email me receipts" description="At most one a week" />],
    ["Badge", <Badge key="g" variant="warning">Backordered</Badge>],
    [
      "Card",
      <Card key="d">
        <CardHeader>
          <CardTitle>Order #10482</CardTitle>
          <CardDescription>Placed 2 days ago</CardDescription>
        </CardHeader>
      </Card>
    ]
  ])("%s has no axe violations", async (_name, ui) => {
    const { container } = render(ui as React.ReactElement);
    await expectNoViolations(container);
  });
});
