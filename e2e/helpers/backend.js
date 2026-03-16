const DEFAULT_API_BASE_URL = process.env.E2E_API_BASE_URL || process.env.API_GATEWAY_URL || 'http://127.0.0.1:3000';
const DEFAULT_E2E_KEY = process.env.E2E_TEST_KEY || 'spotme-e2e-local';
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const E2E_REQUEST_TIMEOUT_MS = Number(process.env.E2E_FETCH_TIMEOUT_MS || 900000);

function rawJsonRequest(pathname, { method = 'GET', body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${DEFAULT_API_BASE_URL.replace(/\/$/, '')}${pathname.startsWith('/') ? pathname : `/${pathname}`}`);
    const transport = url.protocol === 'https:' ? https : http;
    const bodyText = body == null ? null : JSON.stringify(body);
    const req = transport.request(
      url,
      {
        method,
        headers: {
          ...(bodyText == null ? {} : { 'Content-Type': 'application/json' }),
          ...headers,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const rawText = Buffer.concat(chunks).toString('utf8');
          const payload = rawText ? JSON.parse(rawText) : null;
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(payload);
            return;
          }
          const details = payload && typeof payload === 'object'
            ? (payload.error || payload.details || payload.message || JSON.stringify(payload))
            : res.statusMessage;
          reject(new Error(`HTTP request failed (${res.statusCode}): ${details}`));
        });
      },
    );
    req.setTimeout(E2E_REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error(`HTTP request timed out after ${E2E_REQUEST_TIMEOUT_MS}ms`));
    });
    req.on('error', reject);
    if (bodyText != null) req.write(bodyText);
    req.end();
  });
}

async function e2eBootstrap(body = {}) {
  try {
    return await rawJsonRequest('/e2e/bootstrap', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        'x-e2e-key': DEFAULT_E2E_KEY,
      },
    });
  } catch (error) {
    throw new Error(`E2E bootstrap failed: ${String(error?.message || error)}`);
  }
}

async function e2eResetSeed() {
  try {
    return await rawJsonRequest('/e2e/reset-seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-e2e-key': DEFAULT_E2E_KEY,
      },
    });
  } catch (error) {
    throw new Error(`E2E reset seed failed: ${String(error?.message || error)}`);
  }
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
  try {
    return await rawJsonRequest('/e2e/catalog', {
      method: 'GET',
      headers: {
        'x-e2e-key': DEFAULT_E2E_KEY,
      },
    });
  } catch (error) {
    throw new Error(`E2E catalog failed: ${String(error?.message || error)}`);
  }
}

async function e2eMutation(pathSuffix, body = {}) {
  try {
    return await rawJsonRequest(`/e2e/${pathSuffix.replace(/^\//, '')}`, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        'x-e2e-key': DEFAULT_E2E_KEY,
      },
    });
  } catch (error) {
    throw new Error(`E2E mutation failed: ${String(error?.message || error)}`);
  }
}

async function setWorkerHealthOverride(workers = null) {
  try {
    return await rawJsonRequest('/e2e/worker-health', {
      method: 'POST',
      body: workers == null ? {} : {workers},
      headers: {
        'Content-Type': 'application/json',
        'x-e2e-key': DEFAULT_E2E_KEY,
      },
    });
  } catch (error) {
    throw new Error(`E2E worker health override failed: ${String(error?.message || error)}`);
  }
}

async function setMediaStatusOverride(statuses = null) {
  try {
    return await rawJsonRequest('/e2e/media-status', {
      method: 'POST',
      body: statuses == null ? {} : {statuses},
      headers: {
        'Content-Type': 'application/json',
        'x-e2e-key': DEFAULT_E2E_KEY,
      },
    });
  } catch (error) {
    throw new Error(`E2E media status override failed: ${String(error?.message || error)}`);
  }
}

async function upsertMediaAsset(asset = {}) {
  try {
    return await rawJsonRequest('/e2e/media-asset', {
      method: 'POST',
      body: asset,
      headers: {
        'Content-Type': 'application/json',
        'x-e2e-key': DEFAULT_E2E_KEY,
      },
    });
  } catch (error) {
    throw new Error(`E2E media asset upsert failed: ${String(error?.message || error)}`);
  }
}

async function triggerCompetitionUploadNotification(mediaId) {
  try {
    return await rawJsonRequest('/e2e/competition-upload-notify', {
      method: 'POST',
      body: {media_id: String(mediaId || '')},
      headers: {
        'Content-Type': 'application/json',
        'x-e2e-key': DEFAULT_E2E_KEY,
      },
    });
  } catch (error) {
    throw new Error(`E2E competition upload notify failed: ${String(error?.message || error)}`);
  }
}

async function uploadFixtureMedia(accessToken, params = {}) {
  const files = Array.isArray(params.files) ? params.files : [];
  if (files.length === 0) {
    throw new Error('uploadFixtureMedia requires at least one file');
  }
  const form = new FormData();
  const fileTitles = [];
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
    fileTitles.push(file.title == null ? '' : String(file.title));
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
  if (Array.isArray(params.category_labels) && params.category_labels.length > 0) {
    form.append('category_labels_json', JSON.stringify(params.category_labels.map((value) => String(value))));
  }
  if (fileTitles.some((entry) => entry.trim().length > 0)) {
    form.append('file_titles_json', JSON.stringify(fileTitles));
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
  setMediaStatusOverride,
  setWorkerHealthOverride,
  triggerCompetitionUploadNotification,
  upsertMediaAsset,
  uploadFixtureMedia,
};
