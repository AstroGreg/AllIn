/* eslint-env jest */
/* global device, element, by, expect, waitFor */
const path = require('path');
const { launchApp } = require('./helpers/launch');
const {
  DEFAULT_API_BASE_URL,
  e2eBootstrap,
  getCatalog,
  setWorkerHealthOverride,
} = require('./helpers/backend');

jest.setTimeout(240000);

const FIXTURE_PATH = `file://${path.resolve(__dirname, 'fixtures/test-photo.png')}`;

let catalog;
let competition;
let discipline;

beforeAll(async () => {
  catalog = await getCatalog();
  competition = catalog.competitions.find((entry) => String(entry.event_type || '').toLowerCase() === 'cycling')
    || catalog.competitions[0];
  if (!competition) throw new Error('Missing seeded competition');
  discipline = catalog.disciplines.find((entry) => entry.competition_id === competition.id) || catalog.disciplines[0];
  if (!discipline) throw new Error('Missing seeded discipline');
});

afterEach(async () => {
  await setWorkerHealthOverride(null).catch(() => null);
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

describe('Upload worker health gating', () => {
  it('blocks upload when a worker is down and starts once workers recover', async () => {
    const seededUser = await e2eBootstrap({
      sub: `auth0|upload-health-${Date.now()}`,
      user: {
        first_name: 'Upload',
        last_name: 'Tester',
        username: `uploadhealth${Date.now()}`,
      },
      profile: {
        display_name: 'Upload Tester',
        username: `uploadhealth${Date.now()}`,
        selected_events: ['cycling'],
      },
    });

    await setWorkerHealthOverride({
      media: { ok: false, reason: 'stale' },
      ai: { ok: true },
      search: { ok: true },
      notifications: { ok: true },
      face: { ok: true, mode: 'local_fallback' },
    });

    await launchApp({
      routeName: 'UploadDetailsScreen',
      routeParams: {
        competition: {
          id: competition.id,
          name: competition.name,
        },
        category: {
          id: discipline.id,
          discipline_id: discipline.id,
          name: discipline.name || 'Discipline',
        },
        e2eFixtureFiles: [
          {
            uri: FIXTURE_PATH,
            type: 'image/png',
            fileName: 'IMG_2026-03-15 00-55-33.JPG',
            width: 1200,
            height: 900,
          },
        ],
      },
      authState: seededUser.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
      deleteApp: true,
    });

    await device.disableSynchronization();
    await expect(element(by.id('upload-details-screen'))).toBeVisible();
    await waitFor(element(by.id('upload-selected-assets-ready')))
      .toBeVisible()
      .withTimeout(15000);
    await element(by.id('upload-details-next-button')).tap();
    await waitFor(element(by.id('upload-summary-screen')))
      .toBeVisible()
      .withTimeout(15000);
    await waitFor(element(by.id('upload-worker-health-text')))
      .toHaveText('Upload blocked. Workers unavailable: media')
      .withTimeout(15000);
    await expect(element(by.text('IMG 2026 03 15 00 55 33'))).toBeVisible();

    await setWorkerHealthOverride({
      media: { ok: true },
      ai: { ok: true },
      search: { ok: true },
      notifications: { ok: true },
      face: { ok: true, mode: 'local_fallback' },
    });

    await device.terminateApp();
    await launchApp({
      routeName: 'UploadSummaryScreen',
      routeParams: {
        competition: {
          id: competition.id,
          name: competition.name,
        },
      },
      authState: seededUser.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
      deleteApp: false,
    });

    await device.disableSynchronization();
    await waitFor(element(by.id('upload-summary-screen')))
      .toBeVisible()
      .withTimeout(15000);
    await waitFor(element(by.id('upload-worker-health-text')))
      .toHaveText('All workers are live. Upload can start.')
      .withTimeout(15000);

    await element(by.id('upload-start-button')).tap();
    await waitFor(element(by.id('upload-progress-screen')))
      .toBeVisible()
      .withTimeout(15000);
    await waitFor(element(by.id('upload-progress-stage')))
      .toBeVisible()
      .withTimeout(30000);
  });
});
