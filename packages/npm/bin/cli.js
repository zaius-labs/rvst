#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');
const BINARY = join(__dirname, process.platform === 'win32' ? 'rvst.exe' : 'rvst');

const TEMPLATES = {
  default: 'Counter app with scoped CSS',
  tailwind: 'Tailwind v4 with utility classes',
  dashboard: 'Full app — custom titlebar, routing, dark/light theme, icons',
  shadcn: 'Tailwind + bits-ui component primitives',
};

// ── CLI Router ──────────────────────────────────────────────────────────

const [,, command, ...args] = process.argv;

switch (command) {
  case 'create':
    create(args);
    break;
  case 'dev':
    dev(args);
    break;
  case 'build':
    build(args);
    break;
  case 'run':
    run(args);
    break;
  case 'snapshot':
    run(['--snapshot', ...args]);
    break;
  case 'a11y':
    run(['--a11y', ...args]);
    break;
  case 'ascii':
    run(['--ascii', ...args]);
    break;
  case '--help':
  case '-h':
  case 'help':
  case undefined:
    help();
    break;
  case '--version':
  case '-v':
    version();
    break;
  default:
    // Pass through to the Rust binary (e.g. rvst dist/app.js)
    run([command, ...args]);
    break;
}

// ── Commands ────────────────────────────────────────────────────────────

function help() {
  console.log(`
  rvst — Native desktop engine for Svelte

  Usage:
    rvst create <name> [--template <t>]   Scaffold a new project
    rvst dev                              Build + watch for changes
    rvst build                            Build the Svelte bundle
    rvst run [file.js] [file.css]         Run the desktop app
    rvst snapshot [file.js]               Dump scene graph as JSON
    rvst a11y [file.js]                   Dump accessibility tree
    rvst ascii [file.js]                  Print ASCII map of scene layout

  Options:
    --help, -h       Show this help
    --version, -v    Show version

  Templates:
${Object.entries(TEMPLATES).map(([k, v]) => `    ${k.padEnd(14)} ${v}`).join('\n')}

  Examples:
    rvst create my-app
    rvst create my-app --template dashboard
    rvst dev
    rvst build
    rvst run dist/app.js
    rvst --watch dist/app.js
`);
}

function version() {
  const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
  console.log(`rvst v${pkg.version}`);
}

function create(args) {
  let projectName = null;
  let template = 'default';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--template' || args[i] === '-t') {
      template = args[++i];
    } else if (!args[i].startsWith('-')) {
      projectName = projectName || args[i];
    }
  }

  if (!projectName) {
    console.error('  Error: project name required.\n  Usage: rvst create <name> [--template <t>]');
    process.exit(1);
  }

  if (!TEMPLATES[template]) {
    console.error(`  Error: unknown template "${template}".`);
    console.error(`  Available: ${Object.keys(TEMPLATES).join(', ')}`);
    process.exit(1);
  }

  const targetDir = resolve(process.cwd(), projectName);
  if (existsSync(targetDir)) {
    console.error(`  Error: directory "${projectName}" already exists.`);
    process.exit(1);
  }

  const templateDir = join(TEMPLATES_DIR, template);
  if (!existsSync(templateDir)) {
    console.error(`  Error: template "${template}" not found.`);
    process.exit(1);
  }

  console.log(`\n  Creating ${projectName} with template "${template}"...\n`);
  cpSync(templateDir, targetDir, { recursive: true });

  const pkgPath = join(targetDir, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    pkg.name = projectName;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }

  console.log(`  Done!\n`);
  console.log(`    cd ${projectName}`);
  console.log(`    npm install`);
  console.log(`    rvst build`);
  console.log(`    rvst run\n`);
}

function dev(args) {
  console.log('  Building + watching...\n');
  try {
    execSync('npx vite build --watch', { stdio: 'inherit', cwd: process.cwd() });
  } catch (e) {
    // vite --watch exits on ctrl-c
  }
}

function build(args) {
  console.log('  Building...\n');
  execSync('npx vite build', { stdio: 'inherit', cwd: process.cwd() });
  console.log('\n  Build complete. Run with: rvst run\n');
}

function run(args) {
  // Find the bundle automatically if no args
  let runArgs = [...args];
  if (runArgs.length === 0 || (runArgs.length === 1 && runArgs[0].startsWith('--'))) {
    // Auto-detect dist/app.js or dist/*.js
    const distDir = join(process.cwd(), 'dist');
    if (existsSync(join(distDir, 'app.js'))) {
      runArgs = [...runArgs, 'dist/app.js'];
    } else if (existsSync(distDir)) {
      const files = require('fs').readdirSync(distDir).filter(f => f.endsWith('.js'));
      if (files.length === 1) {
        runArgs = [...runArgs, `dist/${files[0]}`];
      }
    }
  }

  if (!existsSync(BINARY)) {
    console.error('  rvst binary not found. Run: npm install -g @rvst/cli');
    console.error('  Or build from source: cargo build --release -p rvst-shell');
    process.exit(1);
  }

  const child = spawn(BINARY, runArgs, { stdio: 'inherit', cwd: process.cwd() });
  child.on('exit', (code) => process.exit(code || 0));
}
