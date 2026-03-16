#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = join(scriptDir, '..');
const iosDir = join(appRoot, 'ios');
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
  'ios/build',
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
  console.error('If it still happens, restart Xcode and remove the project build folder from Xcode Settings > Locations > Derived Data.');
}

process.exit(result.status ?? 1);
