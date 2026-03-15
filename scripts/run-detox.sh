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
E2E_GATEWAY_REUSE="${E2E_GATEWAY_REUSE:-0}"

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
  if [ "${E2E_GATEWAY_REUSE}" = "1" ] && curl -fsS "${E2E_API_BASE_URL%/}/e2e/catalog" -H "x-e2e-key: ${E2E_TEST_KEY:-spotme-e2e-local}" >/dev/null 2>&1; then
    return 0
  fi

  if [ "${E2E_GATEWAY_REUSE}" != "1" ]; then
    EXISTING_GATEWAY_PID="$(lsof -ti tcp:${E2E_GATEWAY_PORT} || true)"
    if [ -n "${EXISTING_GATEWAY_PID}" ]; then
      kill ${EXISTING_GATEWAY_PID} >/dev/null 2>&1 || true
      sleep 1
    fi
  fi

  (
    cd "${GATEWAY_ROOT}"
    npm run build >/dev/null
    if [ -z "${TEST_AZURE_STORAGE_CONNECTION_STRING:-}" ] && [ -n "${TEST_AZURE_STORAGE_ACCOUNT_NAME:-}" ] && [ -n "${TEST_AZURE_STORAGE_ACCOUNT_KEY:-}" ]; then
      export TEST_AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=${TEST_AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${TEST_AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net"
    fi
    if [ -n "${TEST_DATABASE_URL:-}" ]; then
      export DATABASE_URL="${TEST_DATABASE_URL}"
    fi
    if [ -n "${TEST_AZURE_STORAGE_CONNECTION_STRING:-}" ]; then
      export AZURE_STORAGE_CONNECTION_STRING="${TEST_AZURE_STORAGE_CONNECTION_STRING}"
    fi
    if [ -n "${TEST_AZURE_STORAGE_ACCOUNT_NAME:-}" ]; then
      export AZURE_STORAGE_ACCOUNT_NAME="${TEST_AZURE_STORAGE_ACCOUNT_NAME}"
    fi
    if [ -n "${TEST_AZURE_STORAGE_ACCOUNT_KEY:-}" ]; then
      export AZURE_STORAGE_ACCOUNT_KEY="${TEST_AZURE_STORAGE_ACCOUNT_KEY}"
    fi
    if [ -n "${TEST_AZURE_STORAGE_CONTAINER_NAME:-}" ]; then
      export AZURE_STORAGE_CONTAINER_NAME="${TEST_AZURE_STORAGE_CONTAINER_NAME}"
    fi
    if [ -n "${TEST_SERVICEBUS_CONNECTION_STRING:-}" ]; then
      export SERVICEBUS_CONNECTION_STRING="${TEST_SERVICEBUS_CONNECTION_STRING}"
    fi
    if [ -n "${TEST_SERVICEBUS_MEDIA_QUEUE_NAME:-}" ]; then
      export SERVICEBUS_MEDIA_QUEUE_NAME="${TEST_SERVICEBUS_MEDIA_QUEUE_NAME}"
    fi
    if [ -n "${TEST_SERVICEBUS_AI_QUEUE_NAME:-}" ]; then
      export SERVICEBUS_AI_QUEUE_NAME="${TEST_SERVICEBUS_AI_QUEUE_NAME}"
    fi
    if [ -n "${TEST_SERVICEBUS_SEARCH_QUEUE_NAME:-}" ]; then
      export SERVICEBUS_SEARCH_QUEUE_NAME="${TEST_SERVICEBUS_SEARCH_QUEUE_NAME}"
    fi
    if [ -n "${TEST_SERVICEBUS_TOPIC_NAME:-}" ]; then
      export SERVICEBUS_TOPIC_NAME="${TEST_SERVICEBUS_TOPIC_NAME}"
    fi
    if [ -n "${TEST_SERVICEBUS_SUBSCRIPTION_NAME:-}" ]; then
      export SERVICEBUS_SUBSCRIPTION_NAME="${TEST_SERVICEBUS_SUBSCRIPTION_NAME}"
    fi
    export DATABASE_ACTIVE_SCHEMA=testing
    node --input-type=module -e "import pg from 'pg'; const schema = process.env.DATABASE_ACTIVE_SCHEMA || 'testing'; const url = process.env.DATABASE_URL || ''; if (!url) process.exit(0); const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } }); try { await pool.query(\`ALTER TABLE \\\"\${schema}\\\".media ADD COLUMN IF NOT EXISTS title text\`); } finally { await pool.end().catch(() => {}); }" >/dev/null 2>&1 || true
    NODE_ENV=test \
    ENABLE_E2E_TEST_AUTH=1 \
    DATABASE_ACTIVE_SCHEMA="${DATABASE_ACTIVE_SCHEMA}" \
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
