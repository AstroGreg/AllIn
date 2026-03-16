#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = join(scriptDir, '..');
const iosDir = join(appRoot, 'ios');
const podsDir = join(iosDir, 'Pods');

if (process.platform !== 'darwin') {
  process.exit(0);
}

if (existsSync(podsDir)) {
  process.exit(0);
}

const installResult = spawnSync(process.execPath, [join(scriptDir, 'install-ios-pods.mjs')], {
  cwd: appRoot,
  stdio: 'inherit',
});

process.exit(installResult.status ?? 1);
