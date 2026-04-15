#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, 'templates');

const TEMPLATES = {
  default: 'Counter app with scoped CSS',
  tailwind: 'Tailwind v4 with utility classes',
  dashboard: 'Full app with custom titlebar, routing, dark/light theme',
  shadcn: 'Tailwind + bits-ui component primitives',
};

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
  create-rvst — Scaffold a new RVST desktop app

  Usage:
    npx create-rvst <project-name> [--template <name>]

  Templates:
${Object.entries(TEMPLATES).map(([k, v]) => `    ${k.padEnd(12)} ${v}`).join('\n')}

  Examples:
    npx create-rvst my-app
    npx create-rvst my-app --template tailwind
    npx create-rvst my-app --template dashboard
`);
    process.exit(0);
  }

  // Parse args
  let projectName = null;
  let template = 'default';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--template' || args[i] === '-t') {
      template = args[++i];
    } else if (!args[i].startsWith('-')) {
      projectName = args[i];
    }
  }

  if (!projectName) {
    console.error('Error: project name required. Run with --help for usage.');
    process.exit(1);
  }

  if (!TEMPLATES[template]) {
    console.error(`Error: unknown template "${template}". Available: ${Object.keys(TEMPLATES).join(', ')}`);
    process.exit(1);
  }

  const targetDir = resolve(process.cwd(), projectName);

  if (existsSync(targetDir)) {
    console.error(`Error: directory "${projectName}" already exists.`);
    process.exit(1);
  }

  const templateDir = join(TEMPLATES_DIR, template);

  if (!existsSync(templateDir)) {
    console.error(`Error: template "${template}" not found at ${templateDir}`);
    process.exit(1);
  }

  // Copy template
  console.log(`\n  Creating ${projectName} with template "${template}"...\n`);
  cpSync(templateDir, targetDir, { recursive: true });

  // Update package.json name
  const pkgPath = join(targetDir, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    pkg.name = projectName;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }

  console.log(`  Done! Next steps:\n`);
  console.log(`    cd ${projectName}`);
  console.log(`    npm install`);
  console.log(`    npm run build`);
  console.log(`    rvst dist/app.js`);
  console.log(`\n  Or with watch mode:\n`);
  console.log(`    rvst --watch dist/app.js\n`);
}

main();
