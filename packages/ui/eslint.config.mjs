import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist", "storybook-static", ".tmp"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // `interface FooProps extends X {}` is the idiomatic way to name a
      // component's props even when it adds nothing yet.
      "@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: "with-single-extends" }]
    }
  },
  {
    files: ["**/*.{js,cjs}"],
    languageOptions: { sourceType: "commonjs", globals: globals.node },
    // Tooling config and build scripts are loaded as CommonJS by Tailwind/node.
    rules: { "@typescript-eslint/no-require-imports": "off" }
  }
);
