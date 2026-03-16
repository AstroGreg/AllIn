#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { appRoot, cliBuildDir, cliObjRoot, cliSharedPrecompsDir, cliSymRoot } from './ios-build-paths.mjs';
const args = [
  '-workspace',
  'ios/SpotMe.xcworkspace',
  '-scheme',
  'SpotMe',
  '-configuration',
  'Debug',
  '-sdk',
  'iphonesimulator',
  '-derivedDataPath',
  cliBuildDir,
  `SYMROOT=${cliSymRoot}`,
  `OBJROOT=${cliObjRoot}`,
  `SHARED_PRECOMPS_DIR=${cliSharedPrecompsDir}`,
  'clean',
];

if (process.platform !== 'darwin') {
  console.error('Native iOS clean requires macOS with Xcode installed.');
  process.exit(1);
}

const result = spawnSync('xcodebuild', args, {
  cwd: appRoot,
  encoding: 'utf8',
});

if (typeof result.stdout === 'string' && result.stdout.length > 0) {
  process.stdout.write(result.stdout);
}

if (typeof result.stderr === 'string' && result.stderr.length > 0) {
  process.stderr.write(result.stderr);
}

if (result.error) {
  console.error(`Failed to run xcodebuild clean: ${result.error.message}`);
  process.exit(1);
}

const combinedOutput = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
if ((result.status ?? 1) !== 0 && /build\.db|database is locked|unable to attach DB/i.test(combinedOutput)) {
  console.error('\nXcode clean hit a locked build database.');
  console.error('Close any active Xcode builds/tests, quit duplicate Xcode windows, then rerun `npm run ios:clean`.');
  console.error(`CLI builds now use ${cliBuildDir}. If the lock persists, Xcode itself still has an active build open.`);
}

process.exit(result.status ?? 1);
