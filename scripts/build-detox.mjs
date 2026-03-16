#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = join(scriptDir, '..');
const args = process.argv.slice(2);
const config = args[0];

if (!config) {
  console.error('Usage: node ./scripts/build-detox.mjs <detox-config>');
  process.exit(1);
}

if (process.platform === 'win32') {
  console.error('Detox builds are not supported on Windows in this repo. Use macOS for iOS and Detox workflows.');
  process.exit(1);
}

if (config.startsWith('ios') && process.platform !== 'darwin') {
  console.error('Detox iOS builds require macOS with Xcode installed.');
  process.exit(1);
}

const result = spawnSync('npx', ['detox', 'build', '-c', config], {
  cwd: appRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(`Failed to launch Detox build: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 0);
