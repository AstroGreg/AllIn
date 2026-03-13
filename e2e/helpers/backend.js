const DEFAULT_API_BASE_URL = process.env.E2E_API_BASE_URL || process.env.API_GATEWAY_URL || 'http://127.0.0.1:3000';
const DEFAULT_E2E_KEY = process.env.E2E_TEST_KEY || 'spotme-e2e-local';
const fs = require('fs');
const path = require('path');

async function e2eBootstrap(body = {}) {
  const res = await fetch(`${DEFAULT_API_BASE_URL.replace(/\/$/, '')}/e2e/bootstrap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-e2e-key': DEFAULT_E2E_KEY,
    },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const details = payload && typeof payload === 'object'
      ? (payload.error || payload.details || JSON.stringify(payload))
      : res.statusText;
    throw new Error(`E2E bootstrap failed (${res.status}): ${details}`);
  }

  return payload;
}

async function e2eResetSeed() {
  const res = await fetch(`${DEFAULT_API_BASE_URL.replace(/\/$/, '')}/e2e/reset-seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-e2e-key': DEFAULT_E2E_KEY,
    },
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const details = payload && typeof payload === 'object'
      ? (payload.error || payload.details || JSON.stringify(payload))
      : res.statusText;
    throw new Error(`E2E reset seed failed (${res.status}): ${details}`);
  }

  return payload;
}

async function bootstrapSeedUser(seedSub, profile = {}) {
  return e2eBootstrap({
    sub: seedSub,
    profile,
  });
}

async function apiRequest(path, { method = 'GET', accessToken, body, headers } = {}) {
  const res = await fetch(`${DEFAULT_API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`, {
    method,
    headers: {
      ...(body == null ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(headers || {}),
    },
    body: body == null ? undefined : JSON.stringify(body),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const details = payload && typeof payload === 'object'
      ? (payload.error || payload.details || payload.message || JSON.stringify(payload))
      : res.statusText;
    throw new Error(`API request failed (${res.status}): ${details}`);
  }
  return payload;
}

async function getCatalog() {
  const res = await fetch(`${DEFAULT_API_BASE_URL.replace(/\/$/, '')}/e2e/catalog`, {
    method: 'GET',
    headers: {
      'x-e2e-key': DEFAULT_E2E_KEY,
    },
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const details = payload && typeof payload === 'object'
      ? (payload.error || payload.details || JSON.stringify(payload))
      : res.statusText;
    throw new Error(`E2E catalog failed (${res.status}): ${details}`);
  }

  return payload;
}

async function e2eMutation(pathSuffix, body = {}) {
  const res = await fetch(`${DEFAULT_API_BASE_URL.replace(/\/$/, '')}/e2e/${pathSuffix.replace(/^\//, '')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-e2e-key': DEFAULT_E2E_KEY,
    },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const details = payload && typeof payload === 'object'
      ? (payload.error || payload.details || JSON.stringify(payload))
      : res.statusText;
    throw new Error(`E2E mutation failed (${res.status}): ${details}`);
  }
  return payload;
}

async function uploadFixtureMedia(accessToken, params = {}) {
  const files = Array.isArray(params.files) ? params.files : [];
  if (files.length === 0) {
    throw new Error('uploadFixtureMedia requires at least one file');
  }
  const form = new FormData();
  const uploadSalt = typeof params.upload_salt === 'string' && params.upload_salt.trim().length > 0
    ? params.upload_salt.trim()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  for (const file of files) {
    const filePath = path.resolve(String(file.path));
    const content = await fs.promises.readFile(filePath);
    const name = String(file.name || path.basename(filePath));
    const type = String(file.type || 'application/octet-stream');
    const saltedContent = Buffer.concat([
      content,
      Buffer.from(`\nspotme-e2e-upload:${uploadSalt}:${name}`),
    ]);
    form.append('files', new Blob([saltedContent], { type }), name);
  }

  const scalarEntries = [
    ['event_id', params.event_id],
    ['discipline_id', params.discipline_id],
    ['competition_map_id', params.competition_map_id],
    ['checkpoint_id', params.checkpoint_id],
    ['checkpoint_index', params.checkpoint_index],
    ['post_id', params.post_id],
    ['price_cents', params.price_cents],
    ['price_currency', params.price_currency],
    ['collection_scope_key', params.collection_scope_key],
  ];
  scalarEntries.forEach(([key, value]) => {
    if (value != null && String(value).trim().length > 0) {
      form.append(String(key), String(value));
    }
  });
  if (params.skip_profile_collection != null) {
    form.append('skip_profile_collection', params.skip_profile_collection ? 'true' : 'false');
  }
  if (params.is_anonymous != null) {
    form.append('is_anonymous', params.is_anonymous ? 'true' : 'false');
  }

  const res = await fetch(`${DEFAULT_API_BASE_URL.replace(/\/$/, '')}/media/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const details = payload && typeof payload === 'object'
      ? (payload.error || payload.details || payload.message || JSON.stringify(payload))
      : res.statusText;
    throw new Error(`Fixture upload failed (${res.status}): ${details}`);
  }
  return payload;
}

module.exports = {
  DEFAULT_API_BASE_URL,
  apiRequest,
  bootstrapSeedUser,
  e2eBootstrap,
  e2eMutation,
  e2eResetSeed,
  getCatalog,
  uploadFixtureMedia,
};
