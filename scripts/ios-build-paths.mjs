#!/usr/bin/env node

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));

export const appRoot = join(scriptDir, '..');
export const iosDir = join(appRoot, 'ios');
export const cliBuildDir = join(iosDir, 'build-cli');
export const cliSymRoot = join(cliBuildDir, 'Build');
export const cliObjRoot = join(cliBuildDir, 'Build', 'Intermediates.noindex');
export const cliSharedPrecompsDir = join(cliBuildDir, 'Build', 'SharedPrecompiledHeaders');
export const xcodeBuildDir = join(iosDir, 'build-xcode');
export const legacyBuildDir = join(iosDir, 'build');
export const legacyDerivedDataDir = join(iosDir, 'DerivedData');
