import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  console.log('RVST extension activated');

  // Generate rust-project.json for rust-analyzer if src-native exists
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspaceRoot) {
    generateRustProject(workspaceRoot);

    // Watch for new .rs files and regenerate
    const watcher = vscode.workspace.createFileSystemWatcher('**/src-native/**/*.rs');
    watcher.onDidCreate(() => generateRustProject(workspaceRoot));
    watcher.onDidChange(() => generateRustProject(workspaceRoot));
    context.subscriptions.push(watcher);
  }
}

function generateRustProject(root: string) {
  const nativeDir = path.join(root, 'src-native');
  if (!fs.existsSync(nativeDir)) return;

  const cargoToml = path.join(nativeDir, 'Cargo.toml');
  if (!fs.existsSync(cargoToml)) return;

  // Generate rust-project.json that rust-analyzer uses for non-Cargo projects
  // Actually, since src-native IS a Cargo project, rust-analyzer should pick it up
  // automatically if we add it to the workspace settings

  const settings = {
    'rust-analyzer.linkedProjects': [
      path.join(nativeDir, 'Cargo.toml')
    ]
  };

  // Write to .vscode/settings.json (merge with existing)
  const vscodeDir = path.join(root, '.vscode');
  if (!fs.existsSync(vscodeDir)) fs.mkdirSync(vscodeDir, { recursive: true });

  const settingsPath = path.join(vscodeDir, 'settings.json');
  let existing: Record<string, any> = {};
  try {
    existing = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch {}

  // Only update if not already configured
  if (!existing['rust-analyzer.linkedProjects']?.includes(settings['rust-analyzer.linkedProjects'][0])) {
    existing['rust-analyzer.linkedProjects'] = [
      ...(existing['rust-analyzer.linkedProjects'] || []),
      ...settings['rust-analyzer.linkedProjects']
    ];
    fs.writeFileSync(settingsPath, JSON.stringify(existing, null, 2));
  }
}

export function deactivate() {}
