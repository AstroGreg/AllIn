#!/usr/bin/env node

import { existsSync, mkdirSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = join(scriptDir, '..');
const iosDir = join(appRoot, 'ios');
const buildDir = join(iosDir, 'build');
const derivedDataDir = join(iosDir, 'DerivedData');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

if (process.platform !== 'darwin') {
  console.error('Native iOS build reset requires macOS with Xcode installed.');
  process.exit(1);
}

const processCheck = spawnSync('bash', ['-lc', "pgrep -x Xcode >/dev/null || pgrep -f 'xcodebuild|XCBBuildService' >/dev/null"], {
  cwd: appRoot,
});

if (processCheck.status === 0) {
  console.error('Close Xcode and stop any active iOS builds before resetting local build artifacts.');
  process.exit(1);
}

const archivedPaths = [];
for (const path of [buildDir, derivedDataDir]) {
  if (!existsSync(path)) {
    continue;
  }

  const archivedPath = `${path}-stale-${timestamp}`;
  renameSync(path, archivedPath);
  archivedPaths.push(archivedPath);
}

mkdirSync(buildDir, { recursive: true });

if (archivedPaths.length === 0) {
  console.log('No local iOS build artifacts were present to reset.');
} else {
  console.log('Archived local iOS build artifacts:');
  for (const archivedPath of archivedPaths) {
    console.log(archivedPath);
  }
}

console.log('Fresh iOS build folder ready at:');
console.log(buildDir);
console.log('Next steps: npm run ios:clean && npm run ios');
