#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = join(scriptDir, '..');
const androidDir = join(appRoot, 'android');
const outputDir = join(appRoot, 'dist', 'android');
const sourceApk = join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const latestApk = join(outputDir, `${pkg.name}-release.apk`);
const versionedApk = join(outputDir, `${pkg.name}-${pkg.version}-release.apk`);

const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const gradleResult = spawnSync(gradleCommand, ['assembleRelease'], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (gradleResult.status !== 0) {
  process.exit(gradleResult.status ?? 1);
}

if (!existsSync(sourceApk)) {
  console.error(`APK not found at ${sourceApk}`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
cpSync(sourceApk, versionedApk);
cpSync(sourceApk, latestApk);

console.log('APK ready:');
console.log(versionedApk);
console.log(latestApk);
