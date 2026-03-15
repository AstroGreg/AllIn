/* eslint-env jest */
/* global device, element, by, expect, waitFor */
const path = require('path');
const {launchApp} = require('./helpers/launch');
const {
  DEFAULT_API_BASE_URL,
  e2eBootstrap,
  getCatalog,
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

describe('Upload summary amounts', () => {
  it('persists a changed upload amount in the upload summary flow', async () => {
    const seededUser = await e2eBootstrap({
      sub: `auth0|upload-amount-${Date.now()}`,
      user: {
        first_name: 'Upload',
        last_name: 'Amount',
        username: `uploadamount${Date.now()}`,
      },
      profile: {
        display_name: 'Upload Amount',
        username: `uploadamount${Date.now()}`,
        selected_events: ['cycling'],
      },
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

    const inputId = `upload-summary-price-input-${discipline.name}-1`;
    await element(by.id(inputId)).replaceText('0.55');
    await element(by.id('upload-worker-health-card')).tap();
    await waitFor(element(by.id(inputId)))
      .toHaveText('0.55')
      .withTimeout(10000);

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
    await waitFor(element(by.id(inputId)))
      .toHaveText('0.55')
      .withTimeout(15000);
  });
});
