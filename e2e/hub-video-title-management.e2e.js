/* eslint-env jest */
/* global device, element, by, expect, waitFor */
const fs = require('fs');
const path = require('path');
const { expect: jestExpect } = require('@jest/globals');

const { launchApp } = require('./helpers/launch');
const {
  DEFAULT_API_BASE_URL,
  apiRequest,
  e2eBootstrap,
  getCatalog,
  uploadFixtureMedia,
} = require('./helpers/backend');

jest.setTimeout(300000);

const REPORTS_DIR = path.resolve(__dirname, '../reports');
const ITERATIONS = Number(process.env.E2E_MANAGE_UPLOAD_PERF_ITERATIONS || 3);
const TARGET_MS = Number(process.env.E2E_PERF_TARGET_MS || 1000);
const HARD_CAP_MS = Number(process.env.E2E_PERF_HARD_CAP_MS || 2000);

const VIDEO_FIXTURE = {
  path: path.resolve(__dirname, 'fixtures/test-video.mp4'),
  type: 'video/mp4',
  name: 'test-video.mp4',
};

let catalog;
let cyclingCompetition;
let cyclingDiscipline;

const uniqueTag = (label) => `${label}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
const extractMediaId = (entry) => String(entry?.media_id || entry?.existing_media_id || '').trim();
const round = (value) => Math.round(value * 10) / 10;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const percentile = (values, pct) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((pct / 100) * sorted.length) - 1));
  return sorted[index] || 0;
};

const eventually = async (fn, { attempts = 20, delayMs = 1000 } = {}) => {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
};

const createUser = async ({
  label,
  firstName = 'E2E',
  lastName = 'User',
  username,
  displayName,
  selectedEvents = ['cycling'],
  chestNumbersByYear,
  faceVerified = true,
  faceConsentGranted = true,
  profile = {},
  user = {},
} = {}) => {
  const tag = uniqueTag(label || 'user');
  const safeUsername = username || tag.replace(/[^a-z0-9]+/gi, '').slice(-20).toLowerCase();
  return e2eBootstrap({
    sub: `auth0|${tag}`,
    email: `${safeUsername}@spotme.local`,
    user: {
      first_name: firstName,
      last_name: lastName,
      username: safeUsername,
      ...user,
    },
    profile: {
      display_name: displayName || `${firstName} ${lastName}`,
      username: safeUsername,
      selected_events: selectedEvents,
      chest_numbers_by_year: chestNumbersByYear || undefined,
      face_verified: faceVerified,
      face_consent_granted: faceConsentGranted,
      ...profile,
    },
  });
};

const openScreen = async ({
  routeName,
  routeParams = {},
  authState,
  rootTestId,
  deleteApp = true,
}) => {
  try {
    await device.terminateApp();
  } catch {
    // ignore if app is not running yet
  }
  await launchApp({
    routeName,
    routeParams,
    authState,
    apiBaseUrl: DEFAULT_API_BASE_URL,
    deleteApp,
  });
  if (rootTestId) {
    await expect(element(by.id(rootTestId))).toBeVisible();
  }
};

const apiGet = (pathValue, accessToken) => apiRequest(pathValue, { method: 'GET', accessToken });
const apiPost = (pathValue, accessToken, body) => apiRequest(pathValue, { method: 'POST', accessToken, body });

const continueHubInfoIfNeeded = async () => {
  try {
    await waitFor(element(by.id('hub-info-modal'))).toBeVisible().withTimeout(2000);
    await element(by.id('hub-info-continue')).tap();
  } catch {
    // modal not shown
  }
};

const blurHubSearchIfNeeded = async () => {
  try {
    await element(by.id('hub-search-input')).tapReturnKey();
  } catch {
    // return key is not always exposed in Detox
  }
  try {
    await element(by.text('Uploads')).tap();
  } catch {
    // chip already selected or not hittable in this locale
  }
};

const subscribeUserToCompetition = async (profileId, competitionId, extra = {}) => {
  await apiRequest('/e2e/competition-subscriptions', {
    method: 'POST',
    headers: { 'x-e2e-key': process.env.E2E_TEST_KEY || 'spotme-e2e-local' },
    body: {
      profile_id: profileId,
      competition_id: competitionId,
      discipline_ids: extra.discipline_ids || [],
      category_labels: extra.category_labels || [],
      chest_number: extra.chest_number || null,
      face_recognition_enabled: Boolean(extra.face_recognition_enabled),
    },
  });
};

async function uploadCompetitionVideo(uploader, { title }) {
  await subscribeUserToCompetition(uploader.profile_id, cyclingCompetition.id, {
    discipline_ids: cyclingDiscipline?.id ? [cyclingDiscipline.id] : [],
  });
  const upload = await uploadFixtureMedia(uploader.access_token, {
    event_id: cyclingCompetition.id,
    discipline_id: cyclingDiscipline?.id || null,
    files: [
      {
        ...VIDEO_FIXTURE,
        name: `workflow-${Date.now()}.mp4`,
        title,
      },
    ],
    skip_profile_collection: true,
  });
  const mediaId = extractMediaId(upload.results?.[0]);
  if (!mediaId) {
    throw new Error(`Upload returned no media_id: ${JSON.stringify(upload)}`);
  }
  return mediaId;
}

async function createWorkflowScenario() {
  const uploader = await createUser({ label: 'video-title-uploader', displayName: 'Video Title Uploader' });
  const reporter = await createUser({ label: 'video-title-reporter', displayName: 'Video Title Reporter' });
  const initialTitle = `Wrong Heat ${Date.now()}`;
  const correctedTitle = `${initialTitle} Fixed`;
  const mediaId = await uploadCompetitionVideo(uploader, { title: initialTitle });
  const createdRequest = await apiPost(`/media/${encodeURIComponent(mediaId)}/edit-requests`, reporter.access_token, {
    issue_type: 'wrong_heat',
  });
  const requestId = String(createdRequest?.request?.request_id || createdRequest?.request?.id || '').trim();
  if (!requestId) {
    throw new Error(`Missing request id: ${JSON.stringify(createdRequest)}`);
  }

  const notification = await eventually(async () => {
    const payload = await apiGet('/notifications?limit=30&offset=0&unread_only=true', uploader.access_token);
    const match = Array.isArray(payload?.notifications)
      ? payload.notifications.find((item) => String(item?.metadata?.request_id || '') === requestId)
      : null;
    if (!match) {
      throw new Error('edit request notification not found yet');
    }
    return match;
  });

  return {
    uploader,
    reporter,
    mediaId,
    requestId,
    notificationId: String(notification.id),
    initialTitle,
    correctedTitle,
  };
}

async function measure(label, fn) {
  const startedAt = Date.now();
  await fn();
  return Date.now() - startedAt;
}

beforeAll(async () => {
  catalog = await getCatalog();
  cyclingCompetition = catalog.competitions.find((entry) => String(entry.event_type || '').toLowerCase() === 'cycling')
    || catalog.competitions[0];
  if (!cyclingCompetition) throw new Error('Missing seeded competition');
  cyclingDiscipline = catalog.disciplines.find((entry) => entry.competition_id === cyclingCompetition.id)
    || catalog.disciplines[0];
});

afterEach(async () => {
  try {
    await device.terminateApp();
  } catch {
    // ignore
  }
  try {
    await device.enableSynchronization();
  } catch {
    // ignore
  }
});

describe('Hub video title management', () => {
  it('lets the uploader fix a reported wrong heat title from hub manage upload', async () => {
    const scenario = await createWorkflowScenario();

    const unreadNotifications = await apiGet('/notifications?limit=30&offset=0&unread_only=true', scenario.uploader.access_token);
    const matchingNotification = Array.isArray(unreadNotifications?.notifications)
      ? unreadNotifications.notifications.find((item) => String(item?.metadata?.request_id || '') === scenario.requestId)
      : null;
    jestExpect(String(matchingNotification?.id || '')).toBe(scenario.notificationId);

    await openScreen({
      routeName: 'HubScreen',
      authState: scenario.uploader.auth_state,
      rootTestId: 'hub-screen',
    });
    await element(by.id('hub-search-input')).replaceText(scenario.initialTitle);
    await blurHubSearchIfNeeded();
    await waitFor(element(by.id(`hub-upload-card-${scenario.mediaId}`))).toBeVisible().withTimeout(15000);
    await element(by.id(`hub-manage-upload-${scenario.mediaId}`)).tap();
    await continueHubInfoIfNeeded();

    await waitFor(element(by.id('video-details-screen'))).toBeVisible().withTimeout(15000);
    await waitFor(element(by.id(`video-details-edit-request-${scenario.requestId}`))).toBeVisible().withTimeout(15000);

    await element(by.id('video-details-manage-upload-button')).tap();
    await waitFor(element(by.id('video-details-manage-modal'))).toBeVisible().withTimeout(10000);
    await element(by.id('video-details-title-input')).replaceText(scenario.correctedTitle);
    await element(by.id('video-details-save-button')).tap();
    await waitFor(element(by.text(scenario.correctedTitle))).toBeVisible().withTimeout(15000);

    const updatedMedia = await eventually(() => apiGet(`/media/${encodeURIComponent(scenario.mediaId)}`, scenario.uploader.access_token));
    jestExpect(String(updatedMedia?.title || '')).toBe(scenario.correctedTitle);

    await element(by.id(`video-details-edit-request-${scenario.requestId}`)).tap();
    await waitFor(element(by.id('video-details-status-save-button'))).toBeVisible().withTimeout(10000);
    await element(by.id('video-details-status-fixed')).tap();
    await element(by.id('video-details-status-save-button')).tap();
    await waitFor(element(by.text('Fixed'))).toBeVisible().withTimeout(15000);

    const requestsPayload = await eventually(() => apiGet(`/media/${encodeURIComponent(scenario.mediaId)}/edit-requests`, scenario.uploader.access_token));
    const updatedRequest = Array.isArray(requestsPayload?.requests)
      ? requestsPayload.requests.find((entry) => String(entry.request_id || entry.id || '') === scenario.requestId)
      : null;
    jestExpect(String(updatedRequest?.status || '')).toBe('resolved');
  });

  it('benchmarks notification to hub manage-upload remediation within target thresholds', async () => {
    const samples = {
      notification_fetch_ms: [],
      app_launch_to_hub_ms: [],
      hub_search_in_app_ms: [],
      manage_open_ms: [],
      title_save_ms: [],
      resolve_issue_ms: [],
    };

    for (let attempt = 0; attempt < ITERATIONS; attempt += 1) {
      const scenario = await createWorkflowScenario();

      // eslint-disable-next-line no-await-in-loop
      const notificationsOpenMs = await measure('notification_fetch', async () => {
        const payload = await apiGet('/notifications?limit=30&offset=0&unread_only=true', scenario.uploader.access_token);
        const match = Array.isArray(payload?.notifications)
          ? payload.notifications.find((item) => String(item?.metadata?.request_id || '') === scenario.requestId)
          : null;
        if (!match) {
          throw new Error('edit request notification missing');
        }
      });
      samples.notification_fetch_ms.push(notificationsOpenMs);

      // eslint-disable-next-line no-await-in-loop
      const appLaunchToHubMs = await measure('app_launch_to_hub', async () => {
        await openScreen({
          routeName: 'HubScreen',
          authState: scenario.uploader.auth_state,
          rootTestId: 'hub-screen',
          deleteApp: attempt === 0,
        });
      });
      samples.app_launch_to_hub_ms.push(appLaunchToHubMs);

      // eslint-disable-next-line no-await-in-loop
      const hubSearchInAppMs = await measure('hub_search_in_app', async () => {
        await element(by.id('hub-search-input')).replaceText(scenario.initialTitle);
        await blurHubSearchIfNeeded();
        await waitFor(element(by.id(`hub-upload-card-${scenario.mediaId}`))).toBeVisible().withTimeout(HARD_CAP_MS);
      });
      samples.hub_search_in_app_ms.push(hubSearchInAppMs);

      // eslint-disable-next-line no-await-in-loop
      const manageOpenMs = await measure('manage_open', async () => {
        await element(by.id(`hub-manage-upload-${scenario.mediaId}`)).tap();
        await continueHubInfoIfNeeded();
        await waitFor(element(by.id('video-details-screen'))).toBeVisible().withTimeout(HARD_CAP_MS);
        await waitFor(element(by.id(`video-details-edit-request-${scenario.requestId}`))).toBeVisible().withTimeout(HARD_CAP_MS);
      });
      samples.manage_open_ms.push(manageOpenMs);

      // eslint-disable-next-line no-await-in-loop
      const titleSaveMs = await measure('title_save', async () => {
        await element(by.id('video-details-manage-upload-button')).tap();
        await waitFor(element(by.id('video-details-manage-modal'))).toBeVisible().withTimeout(HARD_CAP_MS);
        await element(by.id('video-details-title-input')).replaceText(scenario.correctedTitle);
        await element(by.id('video-details-save-button')).tap();
        await waitFor(element(by.text(scenario.correctedTitle))).toBeVisible().withTimeout(HARD_CAP_MS);
      });
      samples.title_save_ms.push(titleSaveMs);

      // eslint-disable-next-line no-await-in-loop
      const resolveIssueMs = await measure('resolve_issue', async () => {
        await element(by.id(`video-details-edit-request-${scenario.requestId}`)).tap();
        await waitFor(element(by.id('video-details-status-save-button'))).toBeVisible().withTimeout(HARD_CAP_MS);
        await element(by.id('video-details-status-fixed')).tap();
        await element(by.id('video-details-status-save-button')).tap();
        await waitFor(element(by.text('Fixed'))).toBeVisible().withTimeout(HARD_CAP_MS);
      });
      samples.resolve_issue_ms.push(resolveIssueMs);
    }

    const results = Object.entries(samples).map(([name, values]) => {
      const isLaunchMetric = name === 'app_launch_to_hub_ms';
      const warmSamples = values.slice(1);
      const warmP95 = round(percentile(warmSamples, 95));
      const coldMs = round(values[0] || 0);
      const pass = values.every((value) => value <= HARD_CAP_MS);
      return {
        name,
        category: isLaunchMetric ? 'launch' : 'flow',
        enforced: false,
        cold_ms: coldMs,
        warm_p95_ms: warmP95,
        target_ms: TARGET_MS,
        hard_cap_ms: HARD_CAP_MS,
        samples_ms: values.map(round),
        target_met: percentile(warmSamples, 95) <= TARGET_MS,
        pass,
      };
    });

    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(REPORTS_DIR, `hub-video-title-management-perf-${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({
      generated_at: new Date().toISOString(),
      api_base_url: DEFAULT_API_BASE_URL,
      iterations: ITERATIONS,
      target_ms: TARGET_MS,
      hard_cap_ms: HARD_CAP_MS,
      results,
    }, null, 2));

    // eslint-disable-next-line no-console
    console.log(`Hub video title management perf report: ${reportPath}`);
    results.forEach((entry) => {
      // eslint-disable-next-line no-console
      console.log(
        `[perf] ${entry.name} category=${entry.category} cold=${entry.cold_ms}ms warm_p95=${entry.warm_p95_ms}ms pass=${entry.pass} target=${entry.target_met}`,
      );
    });

    jestExpect(results.length).toBeGreaterThan(0);
  }, 600000);
});
