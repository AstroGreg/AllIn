#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = join(scriptDir, '..');
const iosDir = join(appRoot, 'ios');

if (process.platform !== 'darwin') {
  console.error('CocoaPods and native iOS builds require macOS.');
  process.exit(1);
}

const podResult = spawnSync('pod', ['install'], {
  cwd: iosDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    LANG: 'en_US.UTF-8',
    LC_ALL: 'en_US.UTF-8',
  },
});

if (podResult.error) {
  console.error(`Failed to run CocoaPods: ${podResult.error.message}`);
  process.exit(1);
}

process.exit(podResult.status ?? 0);
