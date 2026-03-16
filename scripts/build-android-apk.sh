#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="${APP_ROOT}/android"
OUTPUT_DIR="${APP_ROOT}/dist/android"
SOURCE_APK="${ANDROID_DIR}/app/build/outputs/apk/release/app-release.apk"
APP_NAME="$(node -p "require('${APP_ROOT}/package.json').name")"
APP_VERSION="$(node -p "require('${APP_ROOT}/package.json').version")"
VERSIONED_APK="${OUTPUT_DIR}/${APP_NAME}-${APP_VERSION}-release.apk"
LATEST_APK="${OUTPUT_DIR}/${APP_NAME}-release.apk"

echo "Building Android release APK..."
(
  cd "${ANDROID_DIR}"
  ./gradlew assembleRelease
)

if [ ! -f "${SOURCE_APK}" ]; then
  echo "APK not found at ${SOURCE_APK}" >&2
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"
cp "${SOURCE_APK}" "${VERSIONED_APK}"
cp "${SOURCE_APK}" "${LATEST_APK}"

echo "APK ready:"
echo "${VERSIONED_APK}"
echo "${LATEST_APK}"
