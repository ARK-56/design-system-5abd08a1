import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = fileURLToPath(new URL("../tokens/", import.meta.url));
const primitives = JSON.parse(readFileSync(`${dir}primitives.json`, "utf8"));
const semantic = JSON.parse(readFileSync(`${dir}semantic.json`, "utf8"));

const REFERENCE = /^\{(.+)\.value\}$/;

/** Walk a token tree, yielding [dotted.path, value] for every leaf. */
function* leaves(node, path = []) {
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === "object" && "value" in value) yield [[...path, key].join("."), value.value];
    else if (value && typeof value === "object") yield* leaves(value, [...path, key]);
  }
}

const at = (tree, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), tree);
const resolve = (value) => {
  const m = REFERENCE.exec(value);
  return m ? at(primitives, m[1])?.value : value;
};
const token = (path) => resolve(at(semantic, path).value);

const luminance = (hex) => {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("semantic layer integrity", () => {
  it("every reference points at a primitive that exists", () => {
    const dangling = [];
    for (const [path, value] of leaves(semantic)) {
      const m = REFERENCE.exec(value);
      if (m && at(primitives, m[1]) === undefined) dangling.push(`${path} -> {${m[1]}}`);
    }
    expect(dangling).toEqual([]);
  });

  it("no semantic token hardcodes a hex value instead of referencing a primitive", () => {
    const hardcoded = [];
    for (const [path, value] of leaves(semantic)) {
      if (/^#[0-9a-f]{3,8}$/i.test(value)) hardcoded.push(`${path} = ${value}`);
    }
    expect(hardcoded).toEqual([]);
  });

  it("every status family exposes the same shape", () => {
    for (const family of ["brand", "danger", "warning", "success"]) {
      expect(Object.keys(semantic.color[family]), family).toEqual(
        expect.arrayContaining(["default", "subtle", "on-subtle"])
      );
    }
  });
});

// Exactly what the components compose. Update this table when a component
// introduces a new foreground/background pairing.
const PAIRINGS = [
  ["Button primary label", "color.text.on-brand", "color.brand.default", 4.5],
  ["Button primary hover", "color.text.on-brand", "color.brand.hover", 4.5],
  ["Button primary active", "color.text.on-brand", "color.brand.active", 4.5],
  ["Button danger label", "color.text.on-danger", "color.danger.default", 4.5],
  ["Button danger hover", "color.text.on-danger", "color.danger.hover", 4.5],
  ["Badge brand", "color.brand.on-subtle", "color.brand.subtle", 4.5],
  ["Badge success", "color.success.on-subtle", "color.success.subtle", 4.5],
  ["Badge warning", "color.warning.on-subtle", "color.warning.subtle", 4.5],
  ["Badge danger", "color.danger.on-subtle", "color.danger.subtle", 4.5],
  ["Body text on canvas", "color.text.primary", "color.bg.canvas", 4.5],
  ["Body text on surface", "color.text.primary", "color.bg.surface", 4.5],
  ["Secondary text on canvas", "color.text.secondary", "color.bg.canvas", 4.5],
  ["Secondary text on sunken", "color.text.secondary", "color.bg.surface-sunken", 4.5],
  ["Link on canvas", "color.text.link", "color.bg.canvas", 4.5],
  ["Control border on surface", "color.border.control", "color.bg.surface", 3],
  ["Control border on canvas", "color.border.control", "color.bg.canvas", 3],
  ["Focus ring on surface", "color.border.focus", "color.bg.surface", 3],
  ["Focus ring on canvas", "color.border.focus", "color.bg.canvas", 3],
  ["Input error border", "color.danger.default", "color.bg.surface", 3]
];

describe("WCAG contrast of every pairing the components compose", () => {
  it.each(PAIRINGS)("%s", (_label, fg, bg, required) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(required);
  });
});
