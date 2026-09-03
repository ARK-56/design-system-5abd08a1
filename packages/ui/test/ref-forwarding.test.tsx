import { render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import * as api from "../src";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeProvider,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from "../src";

type Ref = React.RefObject<HTMLElement>;

/**
 * Anything that renders a host element must forward its ref, so consumers can
 * measure it, focus it, or hand it to a positioning library. Each entry renders
 * the component in the minimum context it needs.
 */
const RENDERS_A_HOST_ELEMENT: Record<string, (ref: Ref) => React.ReactElement> = {
  Badge: (ref) => <Badge ref={ref as React.Ref<HTMLSpanElement>}>Label</Badge>,
  Button: (ref) => <Button ref={ref as React.Ref<HTMLButtonElement>}>Save</Button>,
  Card: (ref) => <Card ref={ref as React.Ref<HTMLDivElement>} />,
  CardContent: (ref) => <CardContent ref={ref as React.Ref<HTMLDivElement>} />,
  CardDescription: (ref) => <CardDescription ref={ref as React.Ref<HTMLParagraphElement>} />,
  CardFooter: (ref) => <CardFooter ref={ref as React.Ref<HTMLDivElement>} />,
  CardHeader: (ref) => <CardHeader ref={ref as React.Ref<HTMLDivElement>} />,
  CardTitle: (ref) => <CardTitle ref={ref as React.Ref<HTMLHeadingElement>} />,
  Checkbox: (ref) => <Checkbox ref={ref as React.Ref<HTMLButtonElement>} />,
  Input: (ref) => <Input ref={ref as React.Ref<HTMLInputElement>} />,
  ThemeProvider: (ref) => <ThemeProvider ref={ref}>content</ThemeProvider>,

  DialogHeader: (ref) => <DialogHeader ref={ref as React.Ref<HTMLDivElement>} />,
  DialogFooter: (ref) => <DialogFooter ref={ref as React.Ref<HTMLDivElement>} />,
  DialogContent: (ref) => (
    <Dialog open>
      <DialogContent ref={ref as React.Ref<HTMLDivElement>}>
        <DialogTitle>Title</DialogTitle>
      </DialogContent>
    </Dialog>
  ),
  DialogTitle: (ref) => (
    <Dialog open>
      <DialogContent>
        <DialogTitle ref={ref as React.Ref<HTMLHeadingElement>}>Title</DialogTitle>
      </DialogContent>
    </Dialog>
  ),
  DialogDescription: (ref) => (
    <Dialog open>
      <DialogContent>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription ref={ref as React.Ref<HTMLParagraphElement>}>Body</DialogDescription>
      </DialogContent>
    </Dialog>
  ),
  DialogClose: (ref) => (
    <Dialog open>
      <DialogContent>
        <DialogTitle>Title</DialogTitle>
        <api.DialogClose ref={ref as React.Ref<HTMLButtonElement>}>Close</api.DialogClose>
      </DialogContent>
    </Dialog>
  ),
  DialogTrigger: (ref) => (
    <Dialog>
      <api.DialogTrigger ref={ref as React.Ref<HTMLButtonElement>}>Open</api.DialogTrigger>
    </Dialog>
  ),

  Tabs: (ref) => <Tabs ref={ref as React.Ref<HTMLDivElement>} defaultValue="a" />,
  TabsList: (ref) => (
    <Tabs defaultValue="a">
      <TabsList ref={ref as React.Ref<HTMLDivElement>} />
    </Tabs>
  ),
  TabsTrigger: (ref) => (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger ref={ref as React.Ref<HTMLButtonElement>} value="a">
          A
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
  TabsContent: (ref) => (
    <Tabs defaultValue="a">
      <TabsContent ref={ref as React.Ref<HTMLDivElement>} value="a">
        Panel
      </TabsContent>
    </Tabs>
  ),

  Toast: (ref) => (
    <ToastProvider>
      <Toast ref={ref as React.Ref<HTMLLIElement>} open />
      <ToastViewport />
    </ToastProvider>
  ),
  ToastViewport: (ref) => (
    <ToastProvider>
      <ToastViewport ref={ref as React.Ref<HTMLOListElement>} />
    </ToastProvider>
  ),
  ToastTitle: (ref) => (
    <ToastProvider>
      <Toast open>
        <ToastTitle ref={ref as React.Ref<HTMLDivElement>}>Saved</ToastTitle>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
  ToastDescription: (ref) => (
    <ToastProvider>
      <Toast open>
        <ToastDescription ref={ref as React.Ref<HTMLDivElement>}>Detail</ToastDescription>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
  ToastAction: (ref) => (
    <ToastProvider>
      <Toast open>
        <ToastAction ref={ref as React.Ref<HTMLButtonElement>} altText="Undo">
          Undo
        </ToastAction>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
  ToastClose: (ref) => (
    <ToastProvider>
      <Toast open>
        <ToastClose ref={ref as React.Ref<HTMLButtonElement>} />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
};

/**
 * Exports with no host element of their own, each for a stated reason. Adding
 * an export means adding it here or to the table above -- the coverage test
 * below fails otherwise, so the decision cannot be skipped.
 */
const NO_HOST_ELEMENT: Record<string, string> = {
  Dialog: "Radix Root: context only, renders no DOM",
  ToastProvider: "Radix Provider: context only, renders no DOM",
  Toaster: "mount point that renders a provider and a list, not one element",
  cn: "utility function",
  toast: "imperative function",
  useToast: "hook"
};

describe("every component forwards its ref", () => {
  it.each(Object.keys(RENDERS_A_HOST_ELEMENT).sort())("%s", (name) => {
    const ref = React.createRef<HTMLElement>();
    render(RENDERS_A_HOST_ELEMENT[name](ref));
    expect(ref.current, `${name} did not forward its ref`).toBeInstanceOf(HTMLElement);
  });
});

describe("the convention covers the whole public API", () => {
  it("accounts for every export", () => {
    const unaccounted = Object.keys(api).filter(
      (name) => !(name in RENDERS_A_HOST_ELEMENT) && !(name in NO_HOST_ELEMENT)
    );
    expect(
      unaccounted,
      "new exports must forward a ref, or be listed in NO_HOST_ELEMENT with a reason"
    ).toEqual([]);
  });

  it("lists nothing that is no longer exported", () => {
    const stale = [...Object.keys(RENDERS_A_HOST_ELEMENT), ...Object.keys(NO_HOST_ELEMENT)].filter(
      (name) => !(name in api)
    );
    expect(stale).toEqual([]);
  });
});
