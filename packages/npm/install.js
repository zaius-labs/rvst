#!/usr/bin/env node

// Downloads the correct rvst binary for the current platform from GitHub Releases.
// This follows the same pattern as esbuild, turbo, and biome.

import { execSync } from 'child_process';
import { existsSync, mkdirSync, chmodSync, createWriteStream, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { get } from 'https';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN_DIR = join(__dirname, 'bin');
const VERSION = process.env.RVST_VERSION || '0.1.0';
const REPO = 'zaius-labs/rvst';

const PLATFORM_MAP = {
  'darwin-arm64': 'rvst-macos-arm64',
  'darwin-x64': 'rvst-macos-x64',
  'linux-x64': 'rvst-linux-x64',
  'win32-x64': 'rvst-windows-x64',
};

async function install() {
  const key = `${process.platform}-${process.arch}`;
  const artifact = PLATFORM_MAP[key];

  if (!artifact) {
    console.error(`Unsupported platform: ${key}`);
    console.error(`Supported: ${Object.keys(PLATFORM_MAP).join(', ')}`);
    console.error('Build from source: cargo build --release -p rvst-shell');
    process.exit(1);
  }

  const isWindows = process.platform === 'win32';
  const binaryName = isWindows ? 'rvst.exe' : 'rvst';
  const binaryPath = join(BIN_DIR, binaryName);

  // Skip if already installed
  if (existsSync(binaryPath)) {
    console.log('rvst binary already installed.');
    return;
  }

  mkdirSync(BIN_DIR, { recursive: true });

  const ext = isWindows ? 'zip' : 'tar.gz';
  const url = `https://github.com/${REPO}/releases/download/v${VERSION}/${artifact}.${ext}`;

  console.log(`Downloading rvst v${VERSION} for ${key}...`);
  console.log(`  ${url}`);

  try {
    if (isWindows) {
      // Download zip and extract
      const zipPath = join(BIN_DIR, 'rvst.zip');
      await downloadFile(url, zipPath);
      execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${BIN_DIR}'"`, { stdio: 'inherit' });
      unlinkSync(zipPath);
    } else {
      // Download tar.gz and extract
      const tarPath = join(BIN_DIR, 'rvst.tar.gz');
      await downloadFile(url, tarPath);
      execSync(`tar xzf "${tarPath}" -C "${BIN_DIR}"`, { stdio: 'inherit' });
      unlinkSync(tarPath);
      chmodSync(binaryPath, 0o755);
    }
    console.log(`  Installed to ${binaryPath}`);
  } catch (err) {
    console.error(`Failed to download rvst: ${err.message}`);
    console.error('You can build from source: cargo build --release -p rvst-shell');
    console.error('Then copy target/release/rvst to your PATH.');
    process.exit(1);
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (url) => {
      get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          follow(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const file = createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
        file.on('error', reject);
      }).on('error', reject);
    };
    follow(url);
  });
}

install();
