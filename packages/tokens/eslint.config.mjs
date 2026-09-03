import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["build"] },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs", globals: globals.node }
  },
  {
    // Tests and tooling config are ESM, unlike the CommonJS build script.
    files: ["**/*.mjs"],
    languageOptions: { sourceType: "module", globals: globals.node }
  }
];
