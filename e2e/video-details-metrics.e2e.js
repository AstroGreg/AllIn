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

const VIDEO_FIXTURE = {
  path: path.resolve(__dirname, 'fixtures/test-video.mp4'),
  type: 'video/mp4',
  name: 'metrics-video.mp4',
};

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

describe('Video details metrics', () => {
  it('shows face and chest-number counts in details and manage upload', async () => {
    const seededUser = await e2eBootstrap({
      sub: `auth0|video-metrics-${Date.now()}`,
      user: {
        first_name: 'Video',
        last_name: 'Metrics',
        username: `videometrics${Date.now()}`,
      },
      profile: {
        display_name: 'Video Metrics',
        username: `videometrics${Date.now()}`,
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
          ...VIDEO_FIXTURE,
          name: `metrics-video-${Date.now()}.mp4`,
          title: 'Metrics Video',
        },
      ],
    });

    const mediaId = String(uploadResult?.results?.[0]?.media_id || '').trim();
    if (!mediaId) throw new Error('Missing media_id from fixture upload');

    await setMediaStatusOverride({
      [mediaId]: {
        stage: 'ai_processing',
        progress: 0.78,
        metrics: {
          face_count: 6,
          chest_number_count: 3,
          ai_complete: false,
          notifications_done: false,
          notifications_sent: 0,
          subscribers_total: 0,
        },
      },
    });

    await launchApp({
      routeName: 'VideoDetailsScreen',
      routeParams: {
        mediaId,
        video: {
          media_id: mediaId,
          type: 'video',
          title: 'Metrics Video',
        },
      },
      authState: seededUser.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
      deleteApp: true,
    });

    await waitFor(element(by.id('video-details-screen')))
      .toBeVisible()
      .withTimeout(15000);
    await waitFor(element(by.id('video-details-metric-faces')))
      .toHaveText('Faces: 6')
      .withTimeout(15000);
    await expect(element(by.id('video-details-metric-chest'))).toHaveText('Chest numbers: 3');

    await element(by.id('video-details-manage-upload-button')).tap();
    await waitFor(element(by.id('video-details-manage-modal')))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.id('video-details-modal-metric-faces'))).toHaveText('Faces: 6');
    await expect(element(by.id('video-details-modal-metric-chest'))).toHaveText('Chest numbers: 3');
  });
});
