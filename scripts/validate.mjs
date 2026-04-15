#!/usr/bin/env node
/**
 * rvst validate — Compare desktop RVST render against browser reference.
 *
 * Usage:
 *   node scripts/validate.mjs <template-dir> [--tolerance=N] [--out-dir=DIR]
 *
 * Example:
 *   node scripts/validate.mjs packages/create-rvst/templates/todo
 *
 * Produces:
 *   <out-dir>/desktop.png   — headless RVST render
 *   <out-dir>/browser.png   — Playwright screenshot of real Svelte app
 *   <out-dir>/diff.png      — pixel diff overlay
 */

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve, basename, join } from 'node:path';
import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const ROOT = resolve(import.meta.dirname, '..');

// --- Parse args ---
const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (const arg of args) {
  if (arg.startsWith('--')) {
    const [k, v] = arg.slice(2).split('=');
    flags[k] = v ?? 'true';
  } else {
    positional.push(arg);
  }
}

const templateDir = positional[0];
if (!templateDir) {
  console.error('Usage: node scripts/validate.mjs <template-dir> [--tolerance=N] [--out-dir=DIR]');
  process.exit(1);
}

const tolerance = parseInt(flags.tolerance ?? '2', 10);
const width = parseInt(flags.width ?? '1024', 10);
const height = parseInt(flags.height ?? '768', 10);
const outDir = resolve(flags['out-dir'] ?? `/tmp/rvst-validate/${basename(templateDir)}`);
const templatePath = resolve(templateDir);

if (!existsSync(templatePath)) {
  console.error(`Template dir not found: ${templatePath}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const rvstBin = join(ROOT, 'target/release/rvst');
if (!existsSync(rvstBin)) {
  console.error('rvst binary not found — run `cargo build --release` first');
  process.exit(1);
}

// --- Step 1: Desktop PNG render ---
console.log('\n=== Step 1: Desktop RVST render ===');
const bundleJs = findBundle(templatePath);
const desktopPng = join(outDir, 'desktop.png');

try {
  execSync(
    `"${rvstBin}" --render-png="${desktopPng}" --width=${width} --height=${height} "${bundleJs}"`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  );
  console.log(`  Desktop: ${desktopPng}`);
} catch (e) {
  console.error(`  Desktop render failed: ${e.stderr || e.message}`);
  process.exit(1);
}

// --- Step 2: Browser screenshot via Playwright ---
console.log('\n=== Step 2: Browser reference screenshot ===');
const browserPng = join(outDir, 'browser.png');

// Write a temp index.html in the template dir for Vite to serve
const tmpIndexHtml = join(templatePath, 'index.html');
const hadIndexHtml = existsSync(tmpIndexHtml);

if (!hadIndexHtml) {
  writeFileSync(tmpIndexHtml, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RVST Validate</title>
</head>
<body>
  <div id="app" style="display: contents"></div>
  <script type="module">
    import { mount } from 'svelte';
    import App from './src/App.svelte';
    mount(App, { target: document.getElementById('app') });
  </script>
</body>
</html>`);
}

await screenshotBrowser(browserPng, width, height);

// Clean up temp index.html
if (!hadIndexHtml && existsSync(tmpIndexHtml)) {
  unlinkSync(tmpIndexHtml);
}

// --- Step 3: Diff ---
console.log('\n=== Step 3: Pixel diff ===');
const diffPng = join(outDir, 'diff.png');

try {
  const diffResult = execSync(
    `"${rvstBin}" diff "${desktopPng}" "${browserPng}" --out="${diffPng}" --tolerance=${tolerance}`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  );
  console.log(`  Match: 100% (within tolerance ${tolerance})`);
} catch (e) {
  // Non-zero exit = differences found (expected during development)
  const stderr = e.stderr || '';
  console.log(`  ${stderr.trim()}`);
}

// --- Results ---
console.log(`\n=== Results in ${outDir} ===`);
console.log(`  desktop.png  — RVST headless render`);
console.log(`  browser.png  — Playwright browser screenshot`);
console.log(`  diff.png     — pixel diff overlay`);
console.log();

// --- Helpers ---

function findBundle(dir) {
  const distDir = join(dir, 'dist');
  if (!existsSync(distDir)) {
    console.error(`No dist/ directory in ${dir} — run the app's build first`);
    process.exit(1);
  }
  const files = readdirSync(distDir).filter(f => f.endsWith('.js'));
  if (files.length === 0) {
    console.error(`No .js bundle found in ${distDir}`);
    process.exit(1);
  }
  return join(distDir, files[0]);
}

async function screenshotBrowser(outputPath, w, h) {
  let server;
  try {
    // Start Vite dev server in the template directory (browser mode, no RVST plugin)
    server = await createServer({
      configFile: false,
      root: templatePath,
      plugins: [svelte()],
      resolve: {
        alias: {
          '$lib': join(templatePath, 'src/lib'),
          '$components': join(templatePath, 'src/lib/components'),
          '$types': join(templatePath, 'src/types'),
        },
      },
      css: {
        postcss: {
          plugins: [
            tailwindcss({
              content: [join(templatePath, 'src/**/*.{html,js,svelte,ts}')],
              theme: { extend: {} },
              plugins: [],
            }),
            autoprefixer(),
          ],
        },
      },
      server: {
        port: 0,
        strictPort: false,
      },
      logLevel: 'silent',
    });
    await server.listen();
    const address = server.httpServer.address();
    const port = address.port;
    const url = `http://localhost:${port}`;
    console.log(`  Vite dev server: ${url}`);

    // Screenshot with Playwright
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: w, height: h } });

    await page.goto(url, { waitUntil: 'networkidle' });
    // Give Svelte time to mount and CSS to paint
    await page.waitForTimeout(1000);

    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`  Browser: ${outputPath}`);

    await browser.close();
  } catch (e) {
    console.error(`  Browser screenshot failed: ${e.message}`);
    if (e.stack) console.error(e.stack);
    process.exit(1);
  } finally {
    if (server) await server.close();
  }
}
