#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <detox-config> [extra detox args...]" >&2
  exit 1
fi

CONFIG="$1"
shift

METRO_PID=""

cleanup() {
  if [ -n "${METRO_PID}" ] && kill -0 "${METRO_PID}" >/dev/null 2>&1; then
    kill "${METRO_PID}" >/dev/null 2>&1 || true
    wait "${METRO_PID}" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

if ! nc -z 127.0.0.1 8081 >/dev/null 2>&1; then
  npm start >/tmp/spotme-metro.log 2>&1 &
  METRO_PID="$!"

  for _ in $(seq 1 60); do
    if nc -z 127.0.0.1 8081 >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  if ! nc -z 127.0.0.1 8081 >/dev/null 2>&1; then
    echo "Metro did not start on port 8081. See /tmp/spotme-metro.log" >&2
    exit 1
  fi
fi

npx detox test -c "${CONFIG}" --cleanup "$@"
