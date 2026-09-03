const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

// postcss-import's own resolver doesn't reliably follow package.json
// "exports" subpaths, even though Node and Vite both do. Resolve the real
// file with Node here and substitute it into a temp entry file so the
// public import stays the clean "@ark-56/tokens/css" everywhere else
// (source, Storybook/Vite, consuming apps).
const tokensCssPath = require.resolve("@ark-56/tokens/css");
const srcEntry = path.join(__dirname, "../src/styles/globals.css");
const tmpDir = path.join(__dirname, "../.tmp");
const tmpEntry = path.join(tmpDir, "globals.css");

fs.mkdirSync(tmpDir, { recursive: true });
const source = fs.readFileSync(srcEntry, "utf8");
const rewritten = source.replace('@import "@ark-56/tokens/css";', `@import "${tokensCssPath}";`);
fs.writeFileSync(tmpEntry, rewritten);

execSync(`npx tailwindcss -i "${tmpEntry}" -o ./dist/styles.css --minify`, { stdio: "inherit" });

fs.rmSync(tmpDir, { recursive: true, force: true });
