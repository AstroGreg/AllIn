/* eslint-env jest */
/* global device, element, by, expect, waitFor */
const path = require('path');
const {launchApp} = require('./helpers/launch');
const {
  DEFAULT_API_BASE_URL,
  e2eBootstrap,
  e2eMutation,
  getCatalog,
  setMediaStatusOverride,
  uploadFixtureMedia,
} = require('./helpers/backend');

jest.setTimeout(240000);

const FIXTURE_PATH = path.resolve(__dirname, 'fixtures/test-photo.png');

let catalog;
let competition;
let discipline;

const subscribeUserToCompetition = async (profileId, competitionId, extra = {}) => {
  await e2eMutation('/competition-subscriptions', {
    profile_id: profileId,
    competition_id: competitionId,
    discipline_ids: extra.discipline_ids || [],
    category_labels: extra.category_labels || [],
    chest_number: extra.chest_number || null,
    face_recognition_enabled: Boolean(extra.face_recognition_enabled),
  });
};

beforeAll(async () => {
  catalog = await getCatalog();
  competition = catalog.competitions.find((entry) => String(entry.event_type || '').toLowerCase() === 'cycling')
    || catalog.competitions[0];
  if (!competition) throw new Error('Missing seeded competition');
  discipline = catalog.disciplines.find((entry) => entry.competition_id === competition.id) || catalog.disciplines[0];
  if (!discipline) throw new Error('Missing seeded discipline');
});

afterEach(async () => {
  await setMediaStatusOverride(null).catch(() => null);
  try {
    await device.terminateApp();
  } catch {
    // ignore
  }
});

describe('Upload progress metrics', () => {
  it('shows processing metrics while uploads are still being processed', async () => {
    const seededUser = await e2eBootstrap({
      sub: `auth0|upload-progress-${Date.now()}`,
      user: {
        first_name: 'Upload',
        last_name: 'Metrics',
        username: `uploadmetrics${Date.now()}`,
      },
      profile: {
        display_name: 'Upload Metrics',
        username: `uploadmetrics${Date.now()}`,
        selected_events: ['cycling'],
      },
    });

    await subscribeUserToCompetition(seededUser.profile_id, competition.id, {
      discipline_ids: discipline?.id ? [discipline.id] : [],
    });

    const uploadResult = await uploadFixtureMedia(seededUser.access_token, {
      event_id: competition.id,
      discipline_id: discipline.id,
      skip_profile_collection: true,
      files: [
        {
          path: FIXTURE_PATH,
          name: 'metrics-fixture.png',
          type: 'image/png',
          title: '',
        },
      ],
    });

    const mediaId = String(uploadResult?.results?.[0]?.media_id || '').trim();
    if (!mediaId) throw new Error('Missing media_id from fixture upload');

    await setMediaStatusOverride({
      [mediaId]: {
        stage: 'notifying',
        progress: 0.96,
        steps: {
          transforms_done: true,
          embeddings_done: true,
          bib_done: true,
          indexed_done: false,
        },
        metrics: {
          face_count: 4,
          chest_number_count: 2,
          ai_complete: true,
          notifications_done: false,
          notifications_sent: 3,
          subscribers_total: 7,
        },
      },
    });

    await launchApp({
      routeName: 'UploadProgressScreen',
      routeParams: {
        competition: {
          id: competition.id,
          name: competition.name,
        },
        sessionId: `e2e-progress-${Date.now()}`,
        autoStart: false,
        e2ePhase: 'processing',
        e2eMediaIds: [mediaId],
      },
      authState: seededUser.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
      deleteApp: true,
    });

    await waitFor(element(by.id('upload-progress-screen')))
      .toBeVisible()
      .withTimeout(15000);
    await waitFor(element(by.id('upload-progress-stage')))
      .toHaveText('Sending notifications')
      .withTimeout(15000);
    await waitFor(element(by.id('upload-progress-faces-value')))
      .toHaveText('4')
      .withTimeout(15000);
    await expect(element(by.id('upload-progress-bibs-value'))).toHaveText('2');
    await expect(element(by.id('upload-progress-ai-value'))).toHaveText('1/1');
    await expect(element(by.id('upload-progress-notifications-value'))).toHaveText('3/7');
  });
});
