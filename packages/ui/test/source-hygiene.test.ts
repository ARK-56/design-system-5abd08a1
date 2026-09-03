// @vitest-environment node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Scans component source rather than output. These guard the design system's
 * own rules -- the ones a person can follow by convention and an agent cannot
 * infer -- so that breaking them fails a build instead of shipping quietly.
 */
const COMPONENTS = resolve(process.cwd(), "src/components");
const PRIMITIVES = resolve(process.cwd(), "../tokens/tokens/primitives.json");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    // Stories are demo code and may reach for one-off values deliberately.
    return /\.tsx?$/.test(entry) && !entry.includes(".stories.") ? [full] : [];
  });
}

const files = sourceFiles(COMPONENTS).map((path) => ({
  name: relative(COMPONENTS, path).replace(/\\/g, "/"),
  source: readFileSync(path, "utf8")
}));

const findAll = (pattern: RegExp) =>
  files.flatMap(({ name, source }) =>
    [...source.matchAll(pattern)].map((m) => `${name}: ${m[0]}`)
  );

describe("components consume the semantic layer only", () => {
  it("has component files to scan", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it("reaches for no primitive colour utility", () => {
    // The Tailwind theme exposes the raw neutral scale as an escape hatch for
    // consuming apps. Components must not use it, or a re-theme moves only
    // part of the system.
    expect(findAll(/\b(?:bg|text|border|ring|fill|stroke)-(?:neutral|brand|red|amber|green)-\d+\b/g)).toEqual([]);
  });

  it("hardcodes no hex colour", () => {
    expect(findAll(/#[0-9a-fA-F]{3,8}\b/g)).toEqual([]);
  });

  it("invents no z-index, and uses the named layers instead", () => {
    expect(findAll(/\bz-(?:\d+|\[[^\]]*\])/g)).toEqual([]);
  });
});

describe("spacing stays on the token scale", () => {
  const primitives = JSON.parse(readFileSync(PRIMITIVES, "utf8"));
  // Token keys use "1-5" because a dot is awkward in a CSS custom property
  // name; the Tailwind class that consumes it is still `gap-1.5`.
  const scale = new Set(Object.keys(primitives.space).map((key) => key.replace("-", ".")));

  it("exposes both whole and half steps", () => {
    expect(scale.has("1")).toBe(true);
    expect(scale.has("1.5")).toBe(true);
  });

  it("uses no spacing step the token scale does not define", () => {
    const SPACING = /\b(?:gap|gap-x|gap-y|p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|top|right|bottom|left)-(\d+(?:\.\d+)?)(?![\w/.[])/g;
    const offScale = files.flatMap(({ name, source }) =>
      [...source.matchAll(SPACING)]
        .filter((m) => !scale.has(m[1]))
        .map((m) => `${name}: ${m[0]}`)
    );
    expect(offScale).toEqual([]);
  });
});
