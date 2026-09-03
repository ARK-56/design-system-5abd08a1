import axe from "axe-core";
import { expect } from "vitest";

/**
 * jsdom has no layout engine, so axe cannot evaluate colour-contrast here --
 * that rule is covered far more precisely by the token contrast tests in
 * @ark-56/tokens. Everything else (roles, names, relationships) runs.
 */
export async function expectNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } }
  });
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help} [${v.nodes.length} node(s)]`
  );
  expect(summary).toEqual([]);
}
