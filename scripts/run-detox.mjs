#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = join(scriptDir, '..');
const args = process.argv.slice(2);
const config = args[0];

if (!config) {
  console.error('Usage: node ./scripts/run-detox.mjs <detox-config> [extra detox args...]');
  process.exit(1);
}

if (process.platform === 'win32') {
  console.error('Detox end-to-end test runs are not supported on Windows in this repo. Use macOS for Detox, or run Android app builds on Windows.');
  process.exit(1);
}

const result = spawnSync('bash', [join(scriptDir, 'run-detox.sh'), ...args], {
  cwd: appRoot,
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Failed to launch Detox test runner: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 0);
