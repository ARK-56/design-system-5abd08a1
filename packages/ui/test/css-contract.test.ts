// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Asserts against the *built* stylesheet. These catch bugs that live between
 * the source and the output -- a utility Tailwind never generated, or one it
 * generated with the wrong meaning -- which rendering React in jsdom can never
 * see, because jsdom applies no stylesheet at all.
 */
let css = "";
let primitiveHexes: string[] = [];

beforeAll(() => {
  // vitest runs with the package root as cwd; the turbo `test` task depends on
  // `build`, so dist/ is guaranteed present and current.
  css = readFileSync(resolve(process.cwd(), "dist/styles.css"), "utf8");

  const primitives = JSON.parse(
    readFileSync(resolve(process.cwd(), "../tokens/tokens/primitives.json"), "utf8")
  );
  const walk = (node: Record<string, unknown>): string[] =>
    Object.values(node).flatMap((v) => {
      if (v && typeof v === "object" && "value" in (v as object)) {
        const value = (v as { value: unknown }).value;
        return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? [value.toLowerCase()] : [];
      }
      return v && typeof v === "object" ? walk(v as Record<string, unknown>) : [];
    });
  primitiveHexes = [...new Set(walk(primitives))];
});

/**
 * Declaration blocks of every rule whose selector contains `needle`, in source
 * order, with the offset each was found at. Matching on a plain substring
 * avoids reproducing Tailwind's backslash escaping of `:`, `[`, `]` and `(`.
 */
function rulesFor(needle: string): Array<{ declarations: string; at: number }> {
  const found: Array<{ declarations: string; at: number }> = [];
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (match[1].includes(needle)) found.push({ declarations: match[2], at: match.index ?? 0 });
  }
  return found;
}

const firstRuleFor = (needle: string) => rulesFor(needle)[0]?.declarations ?? null;

describe("focus rings resolve to brand tokens, not Tailwind's default blue", () => {
  it("lets the token override win the ring-colour initialiser", () => {
    // Tailwind's preflight seeds --tw-ring-color with a hardcoded blue and our
    // base layer redefines it. Both rules share the `*` selector, so what
    // matters is that ours comes last.
    const initialisers = rulesFor("*,:after,:before").filter((r) =>
      r.declarations.includes("--tw-ring-color")
    );
    expect(initialisers.length).toBeGreaterThanOrEqual(1);
    expect(initialisers.at(-1)?.declarations).toContain(
      "--tw-ring-color:var(--color-border-focus)"
    );
  });

  it("orders the override after every hardcoded blue that remains", () => {
    const override = css.lastIndexOf("--tw-ring-color:var(--color-border-focus)");
    expect(override).toBeGreaterThan(-1);
    for (const blue of [/rgba?\(\s*59\s*,\s*130\s*,\s*246/g, /rgba?\(\s*147\s*,\s*197\s*,\s*253/g]) {
      for (const match of css.matchAll(blue)) {
        expect(match.index, `blue at ${match.index} is not overridden`).toBeLessThan(override);
      }
    }
  });

  it.each([
    ["ring-border-focus:focus-visible", "--color-border-focus"],
    ["ring-danger:focus-visible", "--color-danger-default"]
  ])("%s points at %s", (needle, cssVar) => {
    expect(firstRuleFor(needle)).toContain(`--tw-ring-color:var(${cssVar})`);
  });
});

describe("dark mode is a scoped swap of the same variables", () => {
  const darkBlock = () => {
    const start = css.indexOf(".dark{");
    return start < 0 ? null : css.slice(start + 6, css.indexOf("}", start));
  };

  it("emits a .dark block after :root, so it wins at equal specificity", () => {
    // `:root` and `.dark` are both specificity 0-1-0 and both match <html>,
    // so source order is the only thing deciding which applies.
    const root = css.indexOf(":root{");
    const dark = css.indexOf(".dark{");
    expect(root).toBeGreaterThan(-1);
    expect(dark).toBeGreaterThan(root);
  });

  it("redefines the tokens a dark ground needs", () => {
    const block = darkBlock();
    expect(block).toContain("--color-bg-canvas:var(--color-neutral-900)");
    expect(block).toContain("--color-brand-default:var(--color-brand-400)");
    expect(block).toContain("--color-text-primary:var(--color-neutral-50)");
    expect(block).toContain("--color-text-on-brand:var(--color-neutral-900)");
  });

  it("changes variables only, never a declaration a utility owns", () => {
    // A mode that set `background-color` directly would fight the utilities
    // instead of feeding them.
    const declarations = (darkBlock() ?? "").split(";").filter(Boolean);
    expect(declarations.filter((d) => !d.trim().startsWith("--"))).toEqual([]);
  });

  it("keeps utilities pointed at the variables the mode swaps", () => {
    // The chain that makes the whole thing work: utility -> var -> mode block.
    const exact = (selector: string) => {
      for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (m[1].split(",").includes(selector)) return m[2];
      }
      return null;
    };
    expect(exact(".bg-brand")).toBe("background-color:var(--color-brand-default)");
    expect(exact(".text-on-brand")).toBe("color:var(--color-text-on-brand)");
    expect(exact(".bg-surface")).toBe("background-color:var(--color-bg-surface)");
    // The page ground reaches `body` from globals.css rather than a utility --
    // Tailwind never emits `.bg-canvas` because nothing uses it. There are two
    // `body` rules (preflight's, then ours), so check that one of them carries it.
    const bodyRules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter((m) => m[1].split(",").includes("body"))
      .map((m) => m[2]);
    expect(bodyRules.some((d) => d.includes("background-color:var(--color-bg-canvas)"))).toBe(true);
  });
});

describe("arbitrary token values carry the right type", () => {
  it("the card shadow sets a shadow, not a shadow colour", () => {
    const declarations = firstRuleFor("component-card-shadow");
    expect(declarations).not.toBeNull();
    expect(declarations).toContain("--tw-shadow:var(--component-card-shadow)");
    // The bug this guards: Tailwind read the var as a colour, so it set
    // --tw-shadow-color and left --tw-shadow pointing at an undefined var,
    // which silently collapsed the shadow to none.
    expect(declarations).not.toContain("--tw-shadow:var(--tw-shadow-colored)");
  });
});

describe("the token layer reaches every themeable utility", () => {
  it.each([
    "text-brand-on-subtle",
    "text-success-on-subtle",
    "text-warning-on-subtle",
    "text-danger-on-subtle",
    "border-border-control"
  ])("%s exists and resolves to a custom property", (needle) => {
    expect(firstRuleFor(needle), needle).toMatch(/var\(--color-/);
  });

  it("bakes no palette value into a utility class", () => {
    // The white-label guarantee: every palette colour must live in the :root
    // token block, where swapping primitives.json can reach it. A hex from the
    // palette appearing in a utility is a value no re-theme can move.
    const utilities = css.replace(/:root\{[^}]*\}/, "");
    const leaked = primitiveHexes.filter((hex) => utilities.toLowerCase().includes(hex));
    expect(primitiveHexes.length).toBeGreaterThan(20);
    expect(leaked).toEqual([]);
  });
});
