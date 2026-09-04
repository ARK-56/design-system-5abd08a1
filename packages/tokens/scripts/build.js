/**
 * Builds the token pipeline: tokens/primitives.json + tokens/semantic.json
 * (+ tokens/semantic.dark.json)
 * -> build/css/variables.css   (:root plus a .dark block, semantic tokens
 *                               referencing primitive vars)
 * -> build/js/tokens.{cjs,esm}.js
 * -> build/ts/tokens.d.ts
 * -> build/tailwind/theme.cjs  (Tailwind theme.extend consuming the CSS vars)
 *
 * To re-theme for a client: replace tokens/primitives.json (and/or override
 * values in the semantic files) and re-run `pnpm build`. Component code never
 * changes because components only ever consume the semantic layer.
 */
const fs = require('node:fs');
const path = require('node:path');
const StyleDictionary = require('style-dictionary').default;

const primitives = require('../tokens/primitives.json');
const darkOverrides = require('../tokens/semantic.dark.json');

const v = (name) => `var(--${name})`;

/** Dot-paths the dark set redefines, so the .dark block emits only those. */
function overriddenPaths(node, prefix = []) {
  return Object.entries(node).flatMap(([key, value]) =>
    value && typeof value === 'object' && 'value' in value
      ? [[...prefix, key].join('.')]
      : overriddenPaths(value, [...prefix, key])
  );
}
const DARK_PATHS = new Set(overriddenPaths(darkOverrides));

// Maps semantic token CSS var names -> Tailwind theme keys.
// Kept explicit (rather than auto-derived) so Tailwind class names stay clean
// (`bg-surface`, not `bg-bg-surface`). Update alongside tokens/semantic.json.
function buildTailwindColors() {
  return {
    canvas: v('color-bg-canvas'),
    surface: v('color-bg-surface'),
    'surface-sunken': v('color-bg-surface-sunken'),
    'surface-sunken-hover': v('color-bg-surface-sunken-hover'),
    'surface-raised': v('color-bg-surface-raised'),
    overlay: v('color-bg-overlay'),

    foreground: v('color-text-primary'),
    'foreground-secondary': v('color-text-secondary'),
    'foreground-disabled': v('color-text-disabled'),
    'on-brand': v('color-text-on-brand'),
    'on-danger': v('color-text-on-danger'),
    link: v('color-text-link'),

    border: v('color-border-default'),
    'border-control': v('color-border-control'),
    'border-focus': v('color-border-focus'),

    brand: {
      DEFAULT: v('color-brand-default'),
      hover: v('color-brand-hover'),
      active: v('color-brand-active'),
      subtle: v('color-brand-subtle'),
      'on-subtle': v('color-brand-on-subtle')
    },
    danger: {
      DEFAULT: v('color-danger-default'),
      hover: v('color-danger-hover'),
      subtle: v('color-danger-subtle'),
      'on-subtle': v('color-danger-on-subtle')
    },
    warning: {
      DEFAULT: v('color-warning-default'),
      subtle: v('color-warning-subtle'),
      'on-subtle': v('color-warning-on-subtle')
    },
    success: {
      DEFAULT: v('color-success-default'),
      subtle: v('color-success-subtle'),
      'on-subtle': v('color-success-on-subtle')
    },
    // Primitive neutral scale exposed directly for one-off utility needs in
    // consuming apps. Components must not use it -- see source-hygiene tests.
    neutral: Object.fromEntries(
      [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((step) => [
        step,
        v(`color-neutral-${step}`)
      ])
    )
  };
}

StyleDictionary.registerFormat({
  name: 'tailwind/theme',
  format: () => {
    const theme = {
      colors: buildTailwindColors(),
      spacing: {
        ...Object.fromEntries(
          [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map((step) => [step, v(`space-${step}`)])
        ),
        // Half steps keep Tailwind's familiar `gap-1.5` class names while moving
        // the values onto the token scale, where a re-theme can reach them.
        ...Object.fromEntries(
          ['0.5', '1.5', '2.5'].map((step) => [step, v(`space-${step.replace('.', '-')}`)])
        )
      },
      borderRadius: Object.fromEntries(
        ['none', 'sm', 'md', 'lg', 'xl', 'full'].map((k) => [k, v(`radius-${k}`)])
      ),
      boxShadow: Object.fromEntries(['sm', 'md', 'lg'].map((k) => [k, v(`shadow-${k}`)])),
      zIndex: Object.fromEntries(
        ['dropdown', 'sticky', 'overlay', 'modal', 'toast'].map((k) => [k, v(`z-${k}`)])
      ),
      // Breakpoints are the one category that cannot flow through CSS custom
      // properties: a media query condition can't read var(). These are emitted
      // as raw values, so changing them needs a rebuild -- a runtime
      // ThemeProvider override cannot reach them.
      screens: Object.fromEntries(
        Object.entries(primitives.breakpoint).map(([key, token]) => [key, token.value])
      ),
      fontFamily: {
        body: [v('font-family-body')],
        heading: [v('font-family-heading')],
        code: [v('font-family-code')]
      },
      fontSize: Object.fromEntries(
        [50, 100, 200, 300, 400, 500, 600, 700, 800].map((k) => [k, v(`font-size-${k}`)])
      ),
      fontWeight: Object.fromEntries(
        ['regular', 'medium', 'semibold', 'bold'].map((k) => [k, v(`font-weight-${k}`)])
      )
    };
    return `/* Auto-generated from @ark-56/tokens. Do not edit directly. */\nmodule.exports = ${JSON.stringify(
      theme,
      null,
      2
    )};\n`;
  }
});

const cssFile = (destination, selector, filter) => ({
  destination,
  format: 'css/variables',
  options: { outputReferences: true, selector },
  ...(filter ? { filter } : {})
});

const light = new StyleDictionary({
  source: ['tokens/primitives.json', 'tokens/semantic.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [cssFile('variables.css', ':root')]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      files: [
        { destination: 'tokens.cjs.js', format: 'javascript/module' },
        { destination: 'tokens.esm.js', format: 'javascript/es6' }
      ]
    },
    ts: {
      transformGroup: 'js',
      buildPath: 'build/ts/',
      files: [{ destination: 'tokens.d.ts', format: 'typescript/es6-declarations' }]
    },
    tailwind: {
      transformGroup: 'css',
      buildPath: 'build/tailwind/',
      files: [{ destination: 'theme.cjs', format: 'tailwind/theme' }]
    }
  }
});

// A second pass, because the dark set is a sparse override rather than a whole
// theme. It deliberately does NOT load semantic.json: the dark file redefines
// those same paths, which Style Dictionary would report as ~90 collisions. It
// needs only the primitives its references resolve against.
const dark = new StyleDictionary({
  source: ['tokens/primitives.json', 'tokens/semantic.dark.json'],
  // The one remaining warning -- references to primitives filtered out of this
  // file -- is by construction: those vars are emitted once in :root by the
  // light pass, and resolve there at runtime.
  log: { warnings: 'disabled' },
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [
        cssFile('_dark.css', '.dark', (token) => DARK_PATHS.has(token.path.join('.')))
      ]
    }
  }
});

async function main() {
  await light.buildAllPlatforms();
  await dark.buildAllPlatforms();

  // Merge the two blocks into one stylesheet, so consumers keep importing a
  // single "@ark-56/tokens/css".
  const dir = path.join(__dirname, '../build/css');
  const base = fs.readFileSync(path.join(dir, 'variables.css'), 'utf8').trimEnd();
  const overlay = fs.readFileSync(path.join(dir, '_dark.css'), 'utf8');
  const block = overlay.slice(overlay.indexOf('.dark')).trimEnd();

  fs.writeFileSync(
    path.join(dir, 'variables.css'),
    `${base}\n\n/* Dark mode. Only the semantic tokens that differ; primitives are shared. */\n${block}\n`
  );
  fs.unlinkSync(path.join(dir, '_dark.css'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
