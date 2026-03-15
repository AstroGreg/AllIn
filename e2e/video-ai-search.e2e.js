/* eslint-env jest */
/* global device, element, by, expect, waitFor */
const path = require('path');

const { launchApp } = require('./helpers/launch');
const {
  e2eMutation,
  e2eBootstrap,
  getCatalog,
  uploadFixtureMedia,
} = require('./helpers/backend');

jest.setTimeout(300000);

const DEFAULT_API_BASE_URL = process.env.E2E_API_BASE_URL || process.env.API_GATEWAY_URL || 'http://127.0.0.1:3000';
const uniqueTag = (label) => `${label}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const VIDEO_FIXTURE = {
  path: path.resolve(__dirname, 'fixtures/test-video.mp4'),
  type: 'video/mp4',
  name: 'merksem-4x400-mixed.mp4',
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
  selectedEvents = ['track-field'],
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
      face_verified: true,
      face_consent_granted: true,
      ...profile,
    },
  });
};

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

const openScreen = async ({
  routeName,
  routeParams = {},
  authState,
  rootTestId,
}) => {
  try {
    await device.terminateApp();
  } catch {
    // ignore
  }
  await launchApp({
    routeName,
    routeParams,
    authState,
    apiBaseUrl: DEFAULT_API_BASE_URL,
  });
  if (rootTestId) {
    await expect(element(by.id(rootTestId))).toBeVisible();
  }
};

const buildAiRouteParams = (competition) => ({
  preselectedEvents: [
    {
      id: competition.id,
      name: competition.event_name || competition.name,
      date: competition.event_date || null,
      location: competition.event_location || competition.location || null,
    },
  ],
});

let catalog;
let merksemCompetition;
let merksemDiscipline;
let merksemRelayVideo;

beforeAll(async () => {
  catalog = await getCatalog();
  merksemCompetition = catalog.competitions.find((entry) => /merksem/i.test(String(entry.event_name || entry.name || '')))
    || catalog.competitions.find((entry) => String(entry.event_type || '').toLowerCase() === 'track')
    || null;
  if (!merksemCompetition) throw new Error('Missing competition for seeded Merksem 4x400 mixed video');
  merksemDiscipline = catalog.disciplines.find((entry) => entry.competition_id === merksemCompetition.id)
    || catalog.disciplines[0]
    || null;
  if (!merksemDiscipline) throw new Error('Missing discipline for seeded Merksem 4x400 mixed video');
  merksemRelayVideo = catalog.media.find((entry) =>
    String(entry.type || '').toLowerCase() === 'video'
      && String(entry.event_id || entry.competition_id || '') === String(merksemCompetition.id)
      && /4x400/i.test(String(entry.title || ''))
      && /mixed/i.test(String(entry.title || '')),
  ) || null;
  if (!merksemRelayVideo) {
    const uploader = await createUser({
      label: 'video-ai-seed-uploader',
      displayName: 'Video AI Seed Uploader',
      selectedEvents: ['track-field'],
    });
    await subscribeUserToCompetition(uploader.profile_id, merksemCompetition.id, {
      discipline_ids: merksemDiscipline?.id ? [merksemDiscipline.id] : [],
    });
    const upload = await uploadFixtureMedia(uploader.access_token, {
      event_id: merksemCompetition.id,
      discipline_id: merksemDiscipline.id,
      skip_profile_collection: true,
      files: [
        {
          ...VIDEO_FIXTURE,
          name: `merksem-4x400-mixed-${Date.now()}.mp4`,
          title: 'athletics 4x400 mixed merksem',
        },
      ],
      upload_salt: uniqueTag('merksem-4x400-mixed'),
    });
    const mediaId = String(upload?.results?.[0]?.media_id || '').trim();
    if (!mediaId) {
      throw new Error('Failed to provision fallback Merksem 4x400 mixed video');
    }
    await e2eMutation('media-asset-duration', {
      media_id: mediaId,
      duration_seconds: 180,
    });
    await e2eMutation('media-object-embedding-text', {
      media_id: mediaId,
      text: 'athletics 4x400 mixed merksem',
    });
    await e2eMutation('bib-detections', {
      media_id: mediaId,
      bib_number: '6038',
      confidence: 0.99,
      match_time_seconds: 70,
    });
    merksemRelayVideo = {
      id: mediaId,
      event_id: merksemCompetition.id,
      competition_id: merksemCompetition.id,
      title: 'athletics 4x400 mixed merksem',
      type: 'video',
    };
  }

  const relayMediaId = String(merksemRelayVideo.id || '').trim();
  if (!relayMediaId) {
    throw new Error('Missing resolved Merksem relay media id');
  }
  await e2eMutation('media-asset-duration', {
    media_id: relayMediaId,
    duration_seconds: 180,
  });
  await e2eMutation('media-object-embedding-text', {
    media_id: relayMediaId,
    text: 'athletics 4x400 mixed merksem',
  });
  await e2eMutation('bib-detections', {
    media_id: relayMediaId,
    bib_number: '6038',
    confidence: 0.99,
    match_time_seconds: 70,
  });
});

afterEach(async () => {
  try {
    await device.terminateApp();
  } catch {
    // ignore
  }
});

describe('Video AI search', () => {
  it('matches a titled competition video for context search and opens the video player', async () => {
    const searcher = await createUser({ label: 'video-context-searcher', displayName: 'Video Context Searcher' });
    const mediaId = String(merksemRelayVideo.id);

    await openScreen({
      routeName: 'AISearchScreen',
      routeParams: buildAiRouteParams(merksemCompetition),
      authState: searcher.auth_state,
      rootTestId: 'ai-search-screen',
    });

    await waitFor(element(by.id('ai-search-screen-idle-ready'))).toExist().withTimeout(15000);
    await element(by.id('ai-search-context-input')).replaceText('athletics');
    await element(by.id('ai-search-run-button')).tap();
    await waitFor(element(by.id('ai-search-results-ready'))).toExist().withTimeout(20000);
    await waitFor(element(by.id(`ai-search-result-${mediaId}`))).toBeVisible().withTimeout(15000);
    await element(by.id(`ai-search-result-${mediaId}`)).tap();
    await expect(element(by.id('video-playing-screen'))).toBeVisible();
  });

  it('returns a video bib hit with timestamp and opens the player at the matched time', async () => {
    const searcher = await createUser({ label: 'video-bib-searcher', displayName: 'Video Bib Searcher' });
    const mediaId = String(merksemRelayVideo.id);

    await openScreen({
      routeName: 'AISearchScreen',
      routeParams: buildAiRouteParams(merksemCompetition),
      authState: searcher.auth_state,
      rootTestId: 'ai-search-screen',
    });

    await waitFor(element(by.id('ai-search-screen-idle-ready'))).toExist().withTimeout(15000);
    await element(by.id('ai-search-bib-input')).replaceText('6038');
    await element(by.id('ai-search-run-button')).tap();
    await waitFor(element(by.id('ai-search-results-ready'))).toExist().withTimeout(20000);
    await waitFor(element(by.id(`ai-search-result-${mediaId}`))).toBeVisible().withTimeout(15000);
    await element(by.id(`ai-search-result-${mediaId}`)).tap();
    await expect(element(by.id('video-playing-screen'))).toBeVisible();
    await waitFor(element(by.id('video-playing-initial-seek-time'))).toHaveText('1:10').withTimeout(20000);
  });
});
