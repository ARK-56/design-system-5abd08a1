import type { Preview, Decorator } from "@storybook/react";
import "../src/styles/globals.css";

/**
 * Dark mode is a class on the root element, so the toggle just adds or removes
 * it. Every component follows because they all read the same CSS variables --
 * which is the property worth being able to see.
 */
const withColourMode: Decorator = (Story, context) => {
  document.documentElement.classList.toggle("dark", context.globals.colourMode === "dark");
  return Story();
};

export const globalTypes = {
  colourMode: {
    description: "Colour mode",
    defaultValue: "light",
    toolbar: {
      title: "Mode",
      icon: "contrast",
      items: [
        { value: "light", title: "Light" },
        { value: "dark", title: "Dark" }
      ],
      dynamicTitle: true
    }
  }
};

const preview: Preview = {
  decorators: [withColourMode],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;
