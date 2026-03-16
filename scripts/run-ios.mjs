#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { appRoot, cliBuildDir, cliObjRoot, cliSharedPrecompsDir, cliSymRoot } from './ios-build-paths.mjs';

if (process.platform !== 'darwin') {
  console.error('Native iOS builds require macOS with Xcode installed. Use Android commands on Windows.');
  process.exit(1);
}

const args = [
  'react-native',
  'run-ios',
  '--scheme',
  'SpotMe',
  '--buildFolder',
  cliBuildDir,
  '--extra-params',
  `SYMROOT=${cliSymRoot} OBJROOT=${cliObjRoot} SHARED_PRECOMPS_DIR=${cliSharedPrecompsDir}`,
  ...process.argv.slice(2),
];
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
