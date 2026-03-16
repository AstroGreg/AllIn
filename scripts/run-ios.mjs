#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = join(scriptDir, '..');

if (process.platform !== 'darwin') {
  console.error('Native iOS builds require macOS with Xcode installed. Use Android commands on Windows.');
  process.exit(1);
}

const args = ['react-native', 'run-ios', '--scheme', 'SpotMe', ...process.argv.slice(2)];
const result = spawnSync('npx', args, {
  cwd: appRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(`Failed to launch iOS build: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 0);
