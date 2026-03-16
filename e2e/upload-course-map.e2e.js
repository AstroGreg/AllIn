/* eslint-env jest */
/* global device, element, by, waitFor, expect */
const path = require('path');
const { launchApp } = require('./helpers/launch');
const {
  DEFAULT_API_BASE_URL,
  apiRequest,
  e2eBootstrap,
  e2eMutation,
  getCatalog,
  setWorkerHealthOverride,
} = require('./helpers/backend');

jest.setTimeout(300000);

const FIXTURE_PATH = `file://${path.resolve(__dirname, 'fixtures/test-photo.png')}`;

let catalog;
let competition;
let discipline;
let seededUser;
let fiveKMapId;
let tenKMapId;
let fiveKCheckpointIds = [];
let tenKCheckpointIds = [];

async function waitForCheckpointMedia({competitionId, checkpointId, accessToken, timeoutMs = 120000}) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const payload = await apiRequest(
      `/competitions/${competitionId}/checkpoints/${checkpointId}/photos?limit=20&offset=0&include_original=false`,
      {accessToken},
    );
    const items = Array.isArray(payload?.items) ? payload.items : [];
    if (items.length > 0) {
      return items;
    }
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  throw new Error(`Timed out waiting for checkpoint ${checkpointId} media`);
}

beforeAll(async () => {
  catalog = await getCatalog();
  competition =
    catalog.competitions.find((entry) => String(entry.event_type || '').toLowerCase() === 'cycling')
    || catalog.competitions.find((entry) => String(entry.event_type || '').toLowerCase() === 'road')
    || catalog.competitions[0];
  if (!competition) throw new Error('Missing seeded competition');

  discipline = catalog.disciplines.find((entry) => entry.competition_id === competition.id) || catalog.disciplines[0];
  if (!discipline) throw new Error('Missing seeded discipline');

  const salt = Date.now();
  seededUser = await e2eBootstrap({
    sub: `auth0|upload-course-map-${salt}`,
    user: {
      first_name: 'Upload',
      last_name: 'Checkpoint',
      username: `uploadcheckpoint${salt}`,
    },
    profile: {
      display_name: 'Upload Checkpoint',
      username: `uploadcheckpoint${salt}`,
      selected_events: ['road-events'],
    },
  });

  const fiveKResult = await e2eMutation('competition-maps', {
    event_id: competition.id,
    competition_id: discipline.id,
    name: '5K',
    checkpoints: [
      { checkpoint_index: 1, label: 'Start line' },
      { checkpoint_index: 2, label: '1 km checkpoint' },
      { checkpoint_index: 3, label: '3 km checkpoint' },
      { checkpoint_index: 4, label: '5 km checkpoint' },
      { checkpoint_index: 5, label: 'Finish line' },
    ],
  });

  const tenKResult = await e2eMutation('competition-maps', {
    event_id: competition.id,
    competition_id: discipline.id,
    name: '10K',
    checkpoints: [
      { checkpoint_index: 1, label: 'Start line' },
      { checkpoint_index: 2, label: '5 km checkpoint' },
      { checkpoint_index: 3, label: '10 km checkpoint' },
      { checkpoint_index: 4, label: 'Finish line' },
    ],
  });

  fiveKMapId = String(fiveKResult?.map_id || '').trim();
  tenKMapId = String(tenKResult?.map_id || '').trim();
  fiveKCheckpointIds = Array.isArray(fiveKResult?.checkpoint_ids) ? fiveKResult.checkpoint_ids.map(String) : [];
  tenKCheckpointIds = Array.isArray(tenKResult?.checkpoint_ids) ? tenKResult.checkpoint_ids.map(String) : [];

  if (!fiveKMapId || !tenKMapId || fiveKCheckpointIds.length < 3 || tenKCheckpointIds.length < 2) {
    throw new Error('Failed to create seeded course map checkpoints');
  }
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

describe('Upload course-map flow', () => {
  it('keeps multiple route choices visible and opens checkpoints in a modal', async () => {
    await launchApp({
      routeName: 'RootUploadCompetitionDetailsScreen',
      routeParams: {
        competition: {
          id: competition.id,
          name: competition.name,
          location: competition.location || '',
          date: competition.date || '',
          competition_focus: 'road-events',
          competition_type: competition.event_type || 'cycling',
          organizingClub: competition.organizing_club || competition.organizingClub || '',
        },
        competitionFocus: 'road-events',
        competitionType: competition.event_type || 'cycling',
      },
      authState: seededUser.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
      deleteApp: true,
      launchArgs: {
        detoxEnableSynchronization: 0,
      },
    });

    await device.disableSynchronization();
    await waitFor(element(by.id('upload-competition-details-screen')))
      .toBeVisible()
      .withTimeout(30000);
    await waitFor(element(by.id(`upload-discipline-card-${fiveKMapId}`)))
      .toBeVisible()
      .withTimeout(30000);
    await waitFor(element(by.id(`upload-discipline-card-${tenKMapId}`)))
      .toBeVisible()
      .withTimeout(30000);

    await element(by.id(`upload-discipline-card-${fiveKMapId}`)).tap();
    await waitFor(element(by.id('upload-selection-modal')))
      .toBeVisible()
      .withTimeout(15000);
    await expect(element(by.text('Select checkpoint'))).toBeVisible();
    await expect(element(by.text('3 km checkpoint'))).toBeVisible();
  });

  it('tags uploaded media with the selected checkpoint and shows it in competition media', async () => {
    const selectedCheckpointId = fiveKCheckpointIds[2];
    const selectedCheckpointLabel = '3 km checkpoint';

    await setWorkerHealthOverride({
      media: { ok: true },
      ai: { ok: true },
      search: { ok: true },
      notifications: { ok: true },
      face: { ok: true, mode: 'local_fallback' },
    });

    const baselinePayload = await apiRequest(
      `/competitions/${competition.id}/checkpoints/${selectedCheckpointId}/photos?limit=20&offset=0&include_original=false`,
      {accessToken: seededUser.access_token},
    );
    const baselineItems = Array.isArray(baselinePayload?.items) ? baselinePayload.items : [];
    if (baselineItems.length !== 0) {
      throw new Error(`Expected empty checkpoint baseline for ${selectedCheckpointId}, received ${baselineItems.length} items`);
    }

    await launchApp({
      routeName: 'UploadDetailsScreen',
      routeParams: {
        competition: {
          id: competition.id,
          name: competition.name,
          location: competition.location || '',
          date: competition.date || '',
          competition_focus: 'road-events',
          competition_type: competition.event_type || 'cycling',
          organizingClub: competition.organizing_club || competition.organizingClub || '',
        },
        category: {
          id: fiveKMapId,
          name: '5K',
          kind: 'road',
          checkpoint_id: selectedCheckpointId,
          checkpoint_label: selectedCheckpointLabel,
        },
        category_labels: [],
        competitionFocus: 'road-events',
        competitionType: competition.event_type || 'cycling',
        discipline_id: discipline.id,
        competition_map_id: fiveKMapId,
        checkpoint_id: selectedCheckpointId,
        checkpoint_label: selectedCheckpointLabel,
        e2eFixtureFiles: [
          {
            uri: FIXTURE_PATH,
            type: 'image/png',
            fileName: 'checkpoint-upload.png',
            width: 1200,
            height: 900,
            fileSize: 2 * 1024 * 1024,
          },
        ],
      },
      authState: seededUser.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
      deleteApp: true,
      launchArgs: {
        detoxEnableSynchronization: 0,
      },
    });

    await device.disableSynchronization();
    await waitFor(element(by.id('upload-details-screen')))
      .toBeVisible()
      .withTimeout(30000);
    await waitFor(element(by.id('upload-selected-assets-ready')))
      .toBeVisible()
      .withTimeout(20000);
    await element(by.id('upload-details-next-button')).tap();

    await waitFor(element(by.id('upload-summary-screen')))
      .toBeVisible()
      .withTimeout(20000);
    await waitFor(element(by.id('upload-worker-health-text')))
      .toHaveText('All workers are live. Upload can start.')
      .withTimeout(20000);
    await element(by.id('upload-start-button')).tap();

    const uploadedItems = await waitForCheckpointMedia({
      competitionId: competition.id,
      checkpointId: selectedCheckpointId,
      accessToken: seededUser.access_token,
    });
    const uploadedMediaId = String(uploadedItems[0]?.media_id || '').trim();
    if (!uploadedMediaId) {
      throw new Error('Missing uploaded media_id for selected checkpoint');
    }

    await device.terminateApp();
    await launchApp({
      routeName: 'AllPhotosOfEvents',
      routeParams: {
        eventName: competition.name,
        competitionId: competition.id,
        checkpointId: selectedCheckpointId,
        checkpoint: {
          id: selectedCheckpointId,
          label: selectedCheckpointLabel,
        },
      },
      authState: seededUser.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
      deleteApp: false,
      launchArgs: {
        detoxEnableSynchronization: 0,
      },
    });

    await device.disableSynchronization();
    await waitFor(element(by.id('all-photos-events-screen')))
      .toBeVisible()
      .withTimeout(20000);
  });
});
