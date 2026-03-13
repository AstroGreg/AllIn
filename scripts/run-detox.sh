#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <detox-config> [extra detox args...]" >&2
  exit 1
fi

CONFIG="$1"
shift

METRO_PID=""
GATEWAY_PID=""
APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GATEWAY_ROOT="${E2E_GATEWAY_ROOT:-$APP_ROOT/../ALLIN-api-gateway}"
E2E_API_BASE_URL="${E2E_API_BASE_URL:-http://127.0.0.1:3000}"
E2E_GATEWAY_LOG="${E2E_GATEWAY_LOG:-/tmp/spotme-e2e-gateway.log}"
E2E_METRO_LOG="${E2E_METRO_LOG:-/tmp/spotme-metro.log}"
E2E_GATEWAY_PORT="$(node -e "const u=new URL(process.argv[1]); process.stdout.write(String(u.port || (u.protocol==='https:'?'443':'80')));" "${E2E_API_BASE_URL}")"

cleanup() {
  if [ -n "${METRO_PID}" ] && kill -0 "${METRO_PID}" >/dev/null 2>&1; then
    kill "${METRO_PID}" >/dev/null 2>&1 || true
    wait "${METRO_PID}" >/dev/null 2>&1 || true
  fi
  if [ -n "${GATEWAY_PID}" ] && kill -0 "${GATEWAY_PID}" >/dev/null 2>&1; then
    kill "${GATEWAY_PID}" >/dev/null 2>&1 || true
    wait "${GATEWAY_PID}" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

ensure_gateway_ready() {
  if curl -fsS "${E2E_API_BASE_URL%/}/e2e/catalog" -H "x-e2e-key: ${E2E_TEST_KEY:-spotme-e2e-local}" >/dev/null 2>&1; then
    return 0
  fi

  (
    cd "${GATEWAY_ROOT}"
    npm run build >/dev/null
    NODE_ENV=test \
    ENABLE_E2E_TEST_AUTH=1 \
    DATABASE_ACTIVE_SCHEMA=testing \
    DATABASE_POOL_MAX="${DATABASE_POOL_MAX:-2}" \
    SKIP_REDIS_INIT=YES \
    SKIP_SEARCH_INDEX_INIT=YES \
    PORT="${E2E_GATEWAY_PORT}" \
    npm run start
  ) >"${E2E_GATEWAY_LOG}" 2>&1 &
  GATEWAY_PID="$!"

  for _ in $(seq 1 90); do
    if curl -fsS "${E2E_API_BASE_URL%/}/e2e/catalog" -H "x-e2e-key: ${E2E_TEST_KEY:-spotme-e2e-local}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "Gateway did not start on ${E2E_API_BASE_URL}. See ${E2E_GATEWAY_LOG}" >&2
  exit 1
}

ensure_gateway_ready

if ! nc -z 127.0.0.1 8081 >/dev/null 2>&1; then
  npm start >"${E2E_METRO_LOG}" 2>&1 &
  METRO_PID="$!"

  for _ in $(seq 1 60); do
    if nc -z 127.0.0.1 8081 >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  if ! nc -z 127.0.0.1 8081 >/dev/null 2>&1; then
    echo "Metro did not start on port 8081. See ${E2E_METRO_LOG}" >&2
    exit 1
  fi
fi

E2E_API_BASE_URL="${E2E_API_BASE_URL}" npx detox test -c "${CONFIG}" --cleanup "$@"
