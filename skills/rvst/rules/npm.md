---
name: npm
description: RVST npm packages — @rvst/cli (binary wrapper) and @rvst/create (scaffolding).
---

# npm Packages

## @rvst/cli (`packages/npm/`)

Binary wrapper that downloads the platform-specific RVST binary from GitHub Releases on `npm install`.

### Structure
```
packages/npm/
├── package.json      # name: @rvst/cli, bin: rvst → bin/cli.js
├── bin/cli.js        # CLI router: create, dev, build, run, snapshot, a11y, ascii
├── install.js        # postinstall: downloads binary from GitHub Releases
└── templates/        # (not currently populated — scaffolding uses @rvst/create)
```

### Commands
```bash
rvst create <name> [--template <t>]   # Scaffold new project
rvst dev                              # Build + watch
rvst build                            # Vite build
rvst run [file.js] [file.css]         # Launch desktop app
rvst snapshot [file.js]               # Dump scene graph
rvst a11y [file.js]                   # Accessibility tree
rvst ascii [file.js]                  # ASCII visualization
```

### Binary Download (install.js)
Platform mapping:
- `darwin-arm64` → `rvst-macos-arm64`
- `darwin-x64` → `rvst-macos-x64`
- `linux-x64` → `rvst-linux-x64`
- `win32-x64` → `rvst-windows-x64`

Downloads from: `https://github.com/zaius-labs/rvst/releases/download/v{VERSION}/{artifact}.tar.gz`

## @rvst/create (`packages/create-rvst/`)

Project scaffolding tool.

### Usage
```bash
npx create-rvst my-app
npx create-rvst my-app --template dashboard
```

### Structure
```
packages/create-rvst/
├── package.json      # name: @rvst/create, bin: create-rvst → index.js
├── index.js          # Scaffolding logic
└── templates/        # All template apps (todo, chat, editor, etc.)
```

### How Scaffolding Works
1. Copies template directory to target
2. Writes `package.json` with project name and RVST deps
3. Prints next-steps instructions

### Template List
The available templates are defined in both:
- `packages/create-rvst/index.js` (TEMPLATES object)
- `packages/npm/bin/cli.js` (TEMPLATES object)

Keep them in sync when adding templates.
