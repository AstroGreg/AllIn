/* eslint-env jest */
/* global device, element, by, waitFor */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { expect: jestExpect } = require('@jest/globals');

const { launchApp } = require('./helpers/launch');
const {
  DEFAULT_API_BASE_URL,
  apiRequest,
  bootstrapSeedUser,
  e2eBootstrap,
  e2eMutation,
  e2eResetSeed,
  getCatalog,
  uploadFixtureMedia,
} = require('./helpers/backend');

jest.setTimeout(900000);

const ITERATIONS = Number(process.env.E2E_PERF_ITERATIONS || 3);
const TARGET_MS = Number(process.env.E2E_PERF_TARGET_MS || 1000);
const HARD_CAP_MS = Number(process.env.E2E_PERF_HARD_CAP_MS || 2000);
const SCREEN_FILTER = String(process.env.E2E_PERF_SCREENS || '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

const REPORTS_DIR = path.resolve(__dirname, '../reports');
const PERF_FIXTURES_DIR = path.join(os.tmpdir(), 'spotme-e2e-perf-fixtures');
const TINY_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z0WQAAAAASUVORK5CYII=';
const VIDEO_FIXTURE = {
  path: path.resolve(__dirname, 'fixtures/test-video.mp4'),
  type: 'video/mp4',
  name: 'test-video.mp4',
};

const BACKEND_BASELINES_MS = {
  home: 216.4,
  hub: 164.8,
  search: 250.6,
  profile: 297.4,
  upload_select: 154.4,
  upload_competition: 179.4,
  competition: 179.4,
};

const SEED_AUTHOR_SUBS = [
  'seed|kobe-hermans',
  'seed|elias-sleeckx',
  'seed|lode-wuyts',
  'seed|guy-vanwijnendael',
  'seed|bart-cuypers',
  'seed|jens-riskin-photography',
];

const MIN_HOME_FEED_POSTS = Number(process.env.E2E_PERF_MIN_HOME_FEED_POSTS || 10);
const MIN_HOME_MEDIA_TOTAL = Number(process.env.E2E_PERF_MIN_HOME_MEDIA_TOTAL || 20);
const MIN_HOME_PHOTO_POSTS = Number(process.env.E2E_PERF_MIN_HOME_PHOTO_POSTS || 10);
const MIN_HOME_BLOG_POSTS = Number(process.env.E2E_PERF_MIN_HOME_BLOG_POSTS || 10);
const MIN_HUB_APPEARANCES = Number(process.env.E2E_PERF_MIN_HUB_APPEARANCES || 5);
const MIN_HUB_UPLOADS = Number(process.env.E2E_PERF_MIN_HUB_UPLOADS || 10);
const MIN_SEARCH_RESULTS = Number(process.env.E2E_PERF_MIN_SEARCH_RESULTS || 10);
const MIN_SEARCH_THUMBNAILS = Number(process.env.E2E_PERF_MIN_SEARCH_THUMBNAILS || 10);
const MIN_COMPETITION_DISCIPLINES = Number(process.env.E2E_PERF_MIN_COMPETITION_DISCIPLINES || 1);
const MIN_PROFILE_POSTS = Number(process.env.E2E_PERF_MIN_PROFILE_POSTS || 10);
const MIN_ONBOARDING_CLUBS = Number(process.env.E2E_PERF_MIN_ONBOARDING_CLUBS || 5);
const MIN_ONBOARDING_GROUPS = Number(process.env.E2E_PERF_MIN_ONBOARDING_GROUPS || 1);
const MIN_AI_BIB_SINGLE_RESULTS = Number(process.env.E2E_PERF_MIN_AI_BIB_SINGLE_RESULTS || 5);
const MIN_AI_BIB_MULTI_RESULTS = Number(process.env.E2E_PERF_MIN_AI_BIB_MULTI_RESULTS || 25);
const MIN_SEARCH_PEOPLE_RESULTS = Number(process.env.E2E_PERF_MIN_SEARCH_PEOPLE_RESULTS || 1);
const MIN_SEARCH_GROUP_RESULTS = Number(process.env.E2E_PERF_MIN_SEARCH_GROUP_RESULTS || 1);
const SHOULD_RESET_SEED = String(process.env.E2E_PERF_RESET_SEED || '0').trim() === '1';

const uniqueTag = (label) => `${label}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
const round = (value) => Math.round(value * 10) / 10;

const parseReadyElapsedMs = (attributes) => {
  const rawCandidates = [attributes?.text, attributes?.label, attributes?.value, attributes?.identifier];
  for (const raw of rawCandidates) {
    const match = String(raw || '').match(/ready:(\d+(?:\.\d+)?)/i);
    if (match) return Number(match[1]);
  }
  return null;
};

const percentile = (values, pct) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((pct / 100) * sorted.length) - 1));
  return sorted[index] || 0;
};

const median = (values) => percentile(values, 50);

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const ensureTinyPngFixture = async () => {
  await fs.promises.mkdir(PERF_FIXTURES_DIR, { recursive: true });
  const filePath = path.join(PERF_FIXTURES_DIR, 'tiny-upload.png');
  await fs.promises.writeFile(filePath, Buffer.from(TINY_PNG_BASE64, 'base64'));
  return filePath;
};

const normalizeMediaType = (media) => String(media?.type || '').trim().toLowerCase();
const buildCompetitionSearchRouteParams = (events = []) => ({
  preselectedEvents: events.map((event) => ({
    id: event.id,
    event_id: event.id,
    name: event.name,
    event_name: event.name,
    date: event.date ?? null,
    event_date: event.date ?? null,
    location: event.location ?? null,
    event_location: event.location ?? null,
  })),
});

const createMediaBackedPosts = async ({
  author,
  mediaPool,
  count,
  labelPrefix,
}) => {
  let createdCount = 0;
  for (let index = 0; index < count; index += 1) {
    const media = mediaPool[index];
    if (!media?.id) continue;
    // eslint-disable-next-line no-await-in-loop
    const created = await apiPost('/posts', author.access_token, {
      title: `${labelPrefix} ${index + 1}`,
      description: `${labelPrefix} ${index + 1} seeded for frontend performance benchmarking.`,
      summary: `${labelPrefix} ${index + 1}`,
      post_type: 'blog',
    }).catch(() => null);
    const postId = String(created?.post?.id || '').trim();
    if (!postId) continue;
    // eslint-disable-next-line no-await-in-loop
    await apiPost(`/posts/${encodeURIComponent(postId)}/media`, author.access_token, {
      media_ids: [media.id],
    }).catch(() => null);
    createdCount += 1;
  }
  return createdCount;
};

const createUser = async ({
  label,
  firstName = 'Perf',
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
  const tag = uniqueTag(label || 'perf-user');
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

const apiPost = (pathValue, accessToken, body) => apiRequest(pathValue, { method: 'POST', accessToken, body });

const subscribeUserToCompetition = async (profileId, competitionId, extra = {}) => {
  await e2eMutation('competition-subscriptions', {
    profile_id: profileId,
    competition_id: competitionId,
    discipline_ids: extra.discipline_ids || [],
    category_labels: extra.category_labels || [],
    chest_number: extra.chest_number || null,
    face_recognition_enabled: Boolean(extra.face_recognition_enabled),
  });
};

const resolveCompetitionFocus = (eventType) => {
  const normalized = String(eventType || '').trim().toLowerCase();
  if (normalized === 'track' || normalized === 'field') return 'track-field';
  if (normalized === 'road' || normalized === 'trail') return 'road-events';
  if (normalized === 'multisport') return 'triathlon';
  if (normalized === 'fitness') return 'hyrox';
  return normalized || 'track-field';
};

const resolveCompetitionType = (eventType) => {
  const normalized = String(eventType || '').trim().toLowerCase();
  if (normalized === 'road' || normalized === 'trail') return 'road';
  if (normalized === 'track' || normalized === 'field') return 'track';
  return 'track';
};

async function resolveBenchmarkCompetitions(accessToken, desiredCount = 5) {
  const catalog = await getCatalog();
  const competitions = normalizeArray(catalog.competitions);
  const prioritizedCompetitions = [
    ...competitions.filter((entry) => String(entry.event_type || '').toLowerCase() === 'track'),
    ...competitions.filter((entry) => String(entry.event_type || '').toLowerCase() === 'cycling'),
    ...competitions.filter((entry) => !['track', 'cycling'].includes(String(entry.event_type || '').toLowerCase())),
  ];

  const resolved = [];
  for (const competition of prioritizedCompetitions) {
    if (resolved.length >= desiredCount) break;
    try {
      // eslint-disable-next-line no-await-in-loop
      const payload = await apiRequest(`/competitions/${competition.id}/disciplines?only_with_media=true`, {
        accessToken,
      });
      const disciplines = normalizeArray(payload?.disciplines);
      if (!disciplines.length) continue;
      resolved.push({
        competition,
        discipline: {
          id: String(disciplines[0].id),
          competition_id: String(disciplines[0].competition_id || competition.id),
          name: disciplines[0].discipline_name || disciplines[0].name || null,
          type: disciplines[0].discipline_type || disciplines[0].type || null,
        },
        discipline_count: disciplines.length,
      });
    } catch {
      // Keep scanning candidates.
    }
  }

  if (!resolved.length) {
    throw new Error('Missing seeded competitions with media-backed disciplines for perf benchmark');
  }

  return resolved;
}

async function seedRichDataset() {
  if (SHOULD_RESET_SEED) {
    await e2eResetSeed();
  }

  const emptyViewer = await createUser({
    label: 'perf-empty-viewer',
    displayName: 'Perf Empty Viewer',
    chestNumbersByYear: { 2026: 6464 },
  });

  const seedUsers = [];
  for (const sub of SEED_AUTHOR_SUBS) {
    // eslint-disable-next-line no-await-in-loop
    const seeded = await bootstrapSeedUser(sub);
    seedUsers.push(seeded);
  }

  const richViewer = seedUsers.find((entry) => String(entry?.auth_state?.user?.sub || '') === 'seed|kobe-hermans') || seedUsers[0];
  if (!richViewer) throw new Error('Missing rich seeded viewer for performance benchmark');

  const authorUsers = seedUsers.filter((entry) => entry.profile_id !== richViewer.profile_id);
  for (const author of authorUsers) {
    // eslint-disable-next-line no-await-in-loop
    await e2eMutation('profile-follows', {
      follower_profile_id: richViewer.profile_id,
      followed_profile_id: author.profile_id,
    });
  }

  const competitions = await resolveBenchmarkCompetitions(richViewer.access_token, 5);
  for (const entry of competitions) {
    // eslint-disable-next-line no-await-in-loop
    await subscribeUserToCompetition(richViewer.profile_id, entry.competition.id, {
      discipline_ids: [entry.discipline.id],
      chest_number: '6464',
      face_recognition_enabled: true,
    });
  }

  const catalog = await getCatalog();
  const catalogMedia = normalizeArray(catalog.media);
  const relevantCompetitionIds = new Set(competitions.map((entry) => String(entry.competition.id)));
  const appearanceCandidates = [];
  for (const entry of competitions) {
    const competitionId = String(entry.competition.id);
    const candidate = catalogMedia.find((media) => String(media.event_id || media.competition_id || '') === competitionId);
    if (candidate) appearanceCandidates.push(candidate);
  }
  const extraAppearanceCandidates = catalogMedia
    .filter((entry) => relevantCompetitionIds.has(String(entry.event_id || entry.competition_id || '')))
    .filter((entry) => !appearanceCandidates.some((candidate) => candidate.id === entry.id))
    .slice(0, Math.max(MIN_HUB_APPEARANCES, 10));
  appearanceCandidates.push(...extraAppearanceCandidates);

  for (const media of appearanceCandidates) {
    // eslint-disable-next-line no-await-in-loop
    await e2eMutation('appearances', {
      profile_id: richViewer.profile_id,
      media_id: media.id,
      competition_id: String(media.competition_id || media.event_id || ''),
      event_id: String(media.event_id || media.competition_id || ''),
      match_type: 'bib',
      confidence: 0.97,
    });
  }

  const uploadFixturePath = await ensureTinyPngFixture();
  const uploadCount = Math.max(MIN_HUB_UPLOADS, 10);
  const uploadTarget = competitions[0];
  const uploadTargetFocus = resolveCompetitionFocus(uploadTarget.competition.event_type);
  const uploadPayload = await uploadFixtureMedia(richViewer.access_token, {
    event_id: uploadTarget.competition.id,
    discipline_id: uploadTarget.discipline.id,
    files: Array.from({ length: uploadCount }, (_, index) => ({
      path: uploadFixturePath,
      name: `perf-upload-${index + 1}.png`,
      type: 'image/png',
    })),
    upload_salt: uniqueTag('perf-rich-viewer-upload'),
  }).catch(() => ({ results: [] }));
  const richViewerUploadedMedia = normalizeArray(uploadPayload?.results).filter((entry) => entry?.media_id);

  const guaranteedHomeFeedPosts = Math.max(MIN_HOME_MEDIA_TOTAL, MIN_HOME_FEED_POSTS, 20);
  const guaranteedPhotoAuthors = authorUsers.slice(0, Math.min(2, authorUsers.length));
  const guaranteedPhotoPostsPerAuthor = Math.ceil(
    guaranteedHomeFeedPosts / Math.max(guaranteedPhotoAuthors.length, 1),
  );
  for (const [authorIndex, author] of guaranteedPhotoAuthors.entries()) {
    // eslint-disable-next-line no-await-in-loop
    const seededUpload = await uploadFixtureMedia(author.access_token, {
      event_id: uploadTarget.competition.id,
      discipline_id: uploadTarget.discipline.id,
      files: Array.from({ length: guaranteedPhotoPostsPerAuthor }, (_, index) => ({
        path: uploadFixturePath,
        name: `perf-home-rich-${authorIndex + 1}-${index + 1}.png`,
        type: 'image/png',
      })),
      upload_salt: uniqueTag(`perf-home-rich-${authorIndex + 1}`),
    }).catch(() => ({ results: [] }));
    const seededMediaPool = normalizeArray(seededUpload?.results)
      .filter((entry) => entry?.media_id)
      .map((entry) => ({ id: entry.media_id, type: 'image' }));
    await createMediaBackedPosts({
      author,
      mediaPool: seededMediaPool,
      count: seededMediaPool.length,
      labelPrefix: `Perf guaranteed rich home post ${authorIndex + 1}`,
    });
  }

  const authorMediaByProfile = new Map();
  normalizeArray(catalog.media).forEach((media) => {
    const uploaderId = String(media.uploader_profile_id || '').trim();
    if (!uploaderId) return;
    const list = authorMediaByProfile.get(uploaderId) || [];
    list.push(media);
    authorMediaByProfile.set(uploaderId, list);
  });

  const sortedMediaAuthors = authorUsers
    .map((author) => ({
      author,
      media: normalizeArray(authorMediaByProfile.get(author.profile_id)),
    }))
    .filter((entry) => entry.media.length > 0)
    .sort((left, right) => right.media.length - left.media.length);

  const primaryMediaAuthor = sortedMediaAuthors[0]?.author || authorUsers[0] || richViewer;
  const primaryMediaPool = normalizeArray(authorMediaByProfile.get(primaryMediaAuthor.profile_id));
  const richViewerMediaPool = [
    ...richViewerUploadedMedia.map((entry) => ({ id: entry.media_id })),
    ...normalizeArray(authorMediaByProfile.get(richViewer.profile_id)),
  ];
  const photoAuthorEntry = sortedMediaAuthors.find((entry) =>
    entry.media.some((media) => normalizeMediaType(media) !== 'video'),
  ) || { author: primaryMediaAuthor, media: primaryMediaPool };

  await createMediaBackedPosts({
    author: photoAuthorEntry.author,
    mediaPool: photoAuthorEntry.media.filter((media) => normalizeMediaType(media) !== 'video'),
    count: Math.max(MIN_HOME_PHOTO_POSTS, 10),
    labelPrefix: 'Perf rich photo feed post',
  });
  await createMediaBackedPosts({
    author: photoAuthorEntry.author,
    mediaPool: photoAuthorEntry.media.filter((media) => normalizeMediaType(media) !== 'video'),
    count: Math.max(MIN_HOME_BLOG_POSTS, MIN_HOME_FEED_POSTS, 10),
    labelPrefix: 'Perf rich blog feed post',
  });

  const aiBibNumber = String(88000 + Math.floor(Math.random() * 1000));
  const aiBibSearcher = await createUser({
    label: 'perf-ai-bib-searcher',
    displayName: 'Perf AI Bib Searcher',
    selectedEvents: competitions.map((entry) => resolveCompetitionFocus(entry.competition.event_type)),
    chestNumbersByYear: { 2026: Number(aiBibNumber) },
  });
  const aiBibResultsByCompetition = [];
  for (const entry of competitions) {
    let candidateMedia = catalogMedia
      .filter((media) =>
        String(media.competition_id || media.event_id || '') === String(entry.competition.id)
        && normalizeMediaType(media) === 'image',
      )
      .slice(0, MIN_AI_BIB_SINGLE_RESULTS);
    if (candidateMedia.length < MIN_AI_BIB_SINGLE_RESULTS) {
      const missingCount = MIN_AI_BIB_SINGLE_RESULTS - candidateMedia.length;
      // eslint-disable-next-line no-await-in-loop
      const topUpUpload = await uploadFixtureMedia(richViewer.access_token, {
        event_id: entry.competition.id,
        discipline_id: entry.discipline.id,
        files: Array.from({ length: missingCount }, (_, index) => ({
          path: uploadFixturePath,
          name: `perf-ai-bib-${String(entry.competition.id).slice(0, 8)}-${index + 1}.png`,
          type: 'image/png',
        })),
        upload_salt: uniqueTag(`perf-ai-bib-${entry.competition.id}`),
      }).catch(() => ({ results: [] }));
      const uploadedMedia = normalizeArray(topUpUpload?.results)
        .filter((result) => result?.media_id)
        .map((result) => ({
          id: result.media_id,
          type: 'image',
          competition_id: entry.competition.id,
          event_id: entry.competition.id,
          uploader_profile_id: richViewer.profile_id,
        }));
      candidateMedia = [...candidateMedia, ...uploadedMedia].slice(0, MIN_AI_BIB_SINGLE_RESULTS);
    }
    aiBibResultsByCompetition.push({
      competition: entry.competition,
      results: candidateMedia,
    });
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(candidateMedia.map((media) => e2eMutation('bib-detections', {
      media_id: media.id,
      bib_number: aiBibNumber,
      confidence: 0.99,
    })));
  }

  const benchmarkPhoto = catalogMedia.find((media) =>
    competitions.some((entry) => String(entry.competition.id) === String(media.competition_id || media.event_id || ''))
    && normalizeMediaType(media) === 'image',
  ) || null;
  let benchmarkLongVideo = catalogMedia.find((media) =>
    competitions.some((entry) => String(entry.competition.id) === String(media.competition_id || media.event_id || ''))
    && normalizeMediaType(media) === 'video'
    && Number(media.duration_seconds || 0) >= 120,
  ) || null;

  if (!benchmarkPhoto) throw new Error('Missing seeded competition photo for viewer benchmark');
  if (!benchmarkLongVideo) {
    const fallbackVideoUpload = await uploadFixtureMedia(richViewer.access_token, {
      event_id: uploadTarget.competition.id,
      discipline_id: uploadTarget.discipline.id,
      files: [
        {
          ...VIDEO_FIXTURE,
          name: `perf-long-video-${Date.now()}.mp4`,
          title: 'Seeded long video benchmark',
        },
      ],
      upload_salt: uniqueTag('perf-long-video'),
    }).catch(() => ({ results: [] }));
    const uploadedVideoId = normalizeArray(fallbackVideoUpload?.results)
      .map((entry) => String(entry?.media_id || '').trim())
      .find(Boolean);
    if (uploadedVideoId) {
      await e2eMutation('media-asset-duration', {
        media_id: uploadedVideoId,
        duration_seconds: 125,
      }).catch(() => null);
      benchmarkLongVideo = {
        id: uploadedVideoId,
        type: 'video',
        title: 'Seeded long video benchmark',
        event_id: uploadTarget.competition.id,
        competition_id: uploadTarget.competition.id,
        duration_seconds: 125,
      };
    }
  }
  if (!benchmarkLongVideo) throw new Error('Missing seeded competition video longer than 2 minutes for viewer benchmark');

  const searchPersonToken = uniqueTag('perf-search-person').replace(/[^a-z0-9]+/gi, '').slice(-10).toLowerCase();
  const searchGroupToken = uniqueTag('perf-search-group').replace(/[^a-z0-9]+/gi, '').slice(-10).toLowerCase();
  const searchPerson = await createUser({
    label: 'perf-search-person',
    firstName: 'PerfSearch',
    lastName: searchPersonToken,
    displayName: `Perf Search Person ${searchPersonToken}`,
    selectedEvents: [uploadTargetFocus],
  });
  const searchGroupOwner = await createUser({
    label: 'perf-search-group-owner',
    firstName: 'PerfGroup',
    lastName: searchGroupToken,
    displayName: `Perf Group Owner ${searchGroupToken}`,
    selectedEvents: [uploadTargetFocus],
  });
  await subscribeUserToCompetition(searchPerson.profile_id, uploadTarget.competition.id, {
    discipline_ids: [uploadTarget.discipline.id],
  });
  await subscribeUserToCompetition(searchGroupOwner.profile_id, uploadTarget.competition.id, {
    discipline_ids: [uploadTarget.discipline.id],
  });
  const createdSearchGroup = await apiPost('/groups', searchGroupOwner.access_token, {
    name: `Perf Search Group ${searchGroupToken}`,
    description: 'Leuven',
    city: 'Leuven',
    website: 'https://spotme.local/group',
    selected_events: [uploadTargetFocus],
  }).catch(() => ({ group: null }));
  const searchPersonUpload = await uploadFixtureMedia(searchPerson.access_token, {
    event_id: uploadTarget.competition.id,
    discipline_id: uploadTarget.discipline.id,
    files: Array.from({ length: 8 }, (_, index) => ({
      path: uploadFixturePath,
      name: `perf-search-person-${index + 1}.png`,
      type: 'image/png',
    })),
    upload_salt: uniqueTag('perf-search-person'),
  }).catch(() => ({ results: [] }));
  const searchPersonMediaIds = normalizeArray(searchPersonUpload?.results)
    .map((entry) => String(entry?.media_id || '').trim())
    .filter(Boolean);
  for (let index = 0; index < Math.min(6, searchPersonMediaIds.length); index += 1) {
    // eslint-disable-next-line no-await-in-loop
    const created = await apiPost('/posts', searchPerson.access_token, {
      title: `Perf Search Person Blog ${index + 1}`,
      description: `Benchmark blog ${index + 1}`,
      summary: `Benchmark summary ${index + 1}`,
      post_type: 'blog',
    }).catch(() => null);
    const postId = String(created?.post?.id || '').trim();
    if (!postId) continue;
    // eslint-disable-next-line no-await-in-loop
    await apiPost(`/posts/${encodeURIComponent(postId)}/media`, searchPerson.access_token, {
      media_ids: [searchPersonMediaIds[index]],
    }).catch(() => null);
  }
  await apiRequest('/profiles/me/timeline', {
    method: 'PUT',
    accessToken: searchPerson.access_token,
    body: {
      items: [
        { kind: 'milestone', title: 'PB 10k', description: 'Rich search profile milestone', event_date: '2026-03-12' },
        { kind: 'milestone', title: 'Club transfer', description: 'Joined a new club', event_date: '2026-03-11' },
        { kind: 'news', title: 'Season goals', description: 'Preparing for benchmark season', event_date: '2026-03-10' },
      ],
    },
  }).catch(() => null);
  let searchGroupMediaIds = [];
  if (createdSearchGroup?.group?.group_id || createdSearchGroup?.group?.id) {
    const searchGroupUpload = await uploadFixtureMedia(searchGroupOwner.access_token, {
      event_id: uploadTarget.competition.id,
      discipline_id: uploadTarget.discipline.id,
      files: Array.from({ length: 8 }, (_, index) => ({
        path: uploadFixturePath,
        name: `perf-search-group-${index + 1}.png`,
        type: 'image/png',
      })),
      upload_salt: uniqueTag('perf-search-group'),
    }).catch(() => ({ results: [] }));
    searchGroupMediaIds = normalizeArray(searchGroupUpload?.results)
      .map((entry) => String(entry?.media_id || '').trim())
      .filter(Boolean);
    const groupId = String(createdSearchGroup.group.group_id || createdSearchGroup.group.id);
    for (let index = 0; index < Math.min(6, searchGroupMediaIds.length); index += 1) {
      // eslint-disable-next-line no-await-in-loop
      const created = await apiPost('/posts', searchGroupOwner.access_token, {
        title: `Perf Search Group Blog ${index + 1}`,
        description: `Group benchmark blog ${index + 1}`,
        summary: `Group benchmark summary ${index + 1}`,
        post_type: 'blog',
        group_id: groupId,
      }).catch(() => null);
      const postId = String(created?.post?.id || '').trim();
      if (!postId) continue;
      // eslint-disable-next-line no-await-in-loop
      await apiPost(`/posts/${encodeURIComponent(postId)}/media`, searchGroupOwner.access_token, {
        media_ids: [searchGroupMediaIds[index]],
      }).catch(() => null);
    }
    if (searchGroupMediaIds.length > 0) {
      await apiPost(`/groups/${encodeURIComponent(groupId)}/collections/by-type/items`, searchGroupOwner.access_token, {
        type: 'image',
        media_ids: searchGroupMediaIds.slice(0, 4),
      }).catch(() => null);
    }
  }

  const requiredProfilePosts = Math.max(MIN_PROFILE_POSTS, 10);
  for (let index = 0; index < requiredProfilePosts; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    const created = await apiPost('/posts', richViewer.access_token, {
      title: `Perf profile post ${index + 1}`,
      description: `Seeded profile post ${index + 1} so the benchmarked profile is not empty.`,
      summary: `Profile post ${index + 1}`,
      post_type: 'blog',
    }).catch(() => null);

    const postId = String(created?.post?.id || '').trim();
    if (!postId) continue;

    const attachable = richViewerMediaPool[index] ? [richViewerMediaPool[index]] : [];
    if (!attachable.length) continue;

    // eslint-disable-next-line no-await-in-loop
    await apiPost(`/posts/${encodeURIComponent(postId)}/media`, richViewer.access_token, {
      media_ids: attachable.map((entry) => entry.id),
    }).catch(() => null);
  }

  return {
    emptyViewer,
    richViewer,
    competitions,
    aiBibSearcher,
    aiBibNumber,
    aiBibResultsByCompetition,
    searchPerson,
    searchPersonQuery: searchPersonToken,
    searchGroup: createdSearchGroup?.group ?? null,
    searchGroupQuery: searchGroupToken,
    searchPersonMediaCount: searchPersonMediaIds.length,
    searchGroupMediaCount: searchGroupMediaIds.length,
    benchmarkPhoto,
    benchmarkLongVideo,
  };
}

async function collectDatasetValidation({
  emptyViewer,
  richViewer,
  competitions,
  aiBibSearcher,
  aiBibNumber,
  aiBibResultsByCompetition,
  searchPerson,
  searchPersonQuery,
  searchGroup,
  searchGroupQuery,
  searchPersonMediaCount,
  searchGroupMediaCount,
}) {
  const homeEmpty = await apiRequest('/home/overview/me', { accessToken: emptyViewer.access_token });
  const homeRich = await apiRequest('/home/overview/me', { accessToken: richViewer.access_token });
  const hubAppearances = await apiRequest('/hub/appearances', { accessToken: richViewer.access_token });
  const hubUploads = await apiRequest('/hub/uploads?include_original=false', { accessToken: richViewer.access_token });
  const searchCompetitions = await apiRequest('/competitions/search?limit=50', { accessToken: richViewer.access_token });
  const richCompetition = competitions[0];
  const disciplines = await apiRequest(`/competitions/${richCompetition.competition.id}/disciplines?only_with_media=true`, {
    accessToken: richViewer.access_token,
  });
  const richProfilePosts = await apiRequest(`/posts?author_profile_id=${encodeURIComponent(richViewer.profile_id)}&limit=20`, {
    accessToken: richViewer.access_token,
  }).catch(() => ({ posts: [] }));
  const clubs = await apiRequest('/clubs/search?limit=50&focuses=track-field', { accessToken: richViewer.access_token });
  const groups = await apiRequest('/groups/search?limit=50', { accessToken: richViewer.access_token });
  const searchPeople = await apiRequest(`/profiles/search?q=${encodeURIComponent(searchPersonQuery)}&limit=20&offset=0`, {
    accessToken: richViewer.access_token,
  }).catch(() => ({ profiles: [] }));
  const searchGroups = await apiRequest(`/groups/search?q=${encodeURIComponent(searchGroupQuery)}&limit=20&offset=0`, {
    accessToken: richViewer.access_token,
  }).catch(() => ({ groups: [] }));
  const aiBibSingle = await apiRequest(
    `/media/search/bib?event_id=${encodeURIComponent(competitions[0].competition.id)}&bib=${encodeURIComponent(aiBibNumber)}`,
    { accessToken: aiBibSearcher.access_token },
  );
  const aiBibMultiCounts = [];
  for (const entry of competitions) {
    // eslint-disable-next-line no-await-in-loop
    const payload = await apiRequest(
      `/media/search/bib?event_id=${encodeURIComponent(entry.competition.id)}&bib=${encodeURIComponent(aiBibNumber)}`,
      { accessToken: aiBibSearcher.access_token },
    ).catch(() => ({ results: [] }));
    aiBibMultiCounts.push(normalizeArray(payload?.results).length);
  }

  const homeRichFeedPosts = normalizeArray(homeRich?.overview?.feed_posts);
  const homeRichPhotoPosts = homeRichFeedPosts.filter((entry) => normalizeMediaType(entry?.media) !== 'video' && entry?.media).length;
  const homeRichVideoPosts = homeRichFeedPosts.filter((entry) => normalizeMediaType(entry?.media) === 'video').length;
  const homeRichMediaCount = [
    homeRich?.overview?.video ? 1 : 0,
    homeRich?.overview?.photo ? 1 : 0,
    ...homeRichFeedPosts.map((entry) => (entry?.media ? 1 : 0)),
  ].reduce((sum, value) => sum + value, 0);

  const searchResults = normalizeArray(searchCompetitions?.competitions || searchCompetitions?.events);
  const searchThumbs = searchResults.filter((entry) => entry?.thumbnail_url || entry?.preview_url).length;
  const hubAppearanceEntries = normalizeArray(hubAppearances?.appearances);
  const hubUploadEntries = normalizeArray(hubUploads?.results);
  const clubEntries = normalizeArray(clubs?.clubs);
  const groupEntries = normalizeArray(groups?.groups);
  const disciplineEntries = normalizeArray(disciplines?.disciplines);
  const profilePosts = normalizeArray(richProfilePosts?.posts);

  return {
    home_empty: {
      has_video: Boolean(homeEmpty?.overview?.video),
      has_photo: Boolean(homeEmpty?.overview?.photo),
      feed_posts: normalizeArray(homeEmpty?.overview?.feed_posts).length,
    },
    home_rich: {
      has_video: Boolean(homeRich?.overview?.video),
      has_photo: Boolean(homeRich?.overview?.photo),
      has_blog: Boolean(homeRich?.overview?.blog),
      feed_posts: homeRichFeedPosts.length,
      media_total: homeRichMediaCount,
      photo_posts: homeRichPhotoPosts,
      video_posts: homeRichVideoPosts,
    },
    hub: {
      appearances: hubAppearanceEntries.length,
      uploads: hubUploadEntries.length,
    },
    search: {
      competitions: searchResults.length,
      thumbnails: searchThumbs,
    },
    competition: {
      competition_id: richCompetition.competition.id,
      disciplines: disciplineEntries.length,
    },
    profile_rich: {
      posts: profilePosts.length,
      uploads: hubUploadEntries.length,
    },
    onboarding: {
      clubs: clubEntries.length,
      groups: groupEntries.length,
      disciplines: disciplineEntries.length,
    },
    search_entities: {
      person_query: searchPersonQuery,
      group_query: searchGroupQuery,
      person_results: normalizeArray(searchPeople?.profiles).filter(
        (entry) => String(entry.profile_id || '') === String(searchPerson.profile_id),
      ).length,
      group_results: normalizeArray(searchGroups?.groups).filter(
        (entry) => String(entry.group_id || entry.id || '') === String(searchGroup?.group_id || searchGroup?.id || ''),
      ).length,
      person_media: searchPersonMediaCount,
      group_media: searchGroupMediaCount,
    },
    ai_bib: {
      selected_competitions: competitions.length,
      seeded_media_per_competition: aiBibResultsByCompetition.map((entry) => entry.results.length),
      single_competition_results: normalizeArray(aiBibSingle?.results).length,
      five_competition_results: aiBibMultiCounts.reduce((sum, count) => sum + count, 0),
    },
  };
}

function assertDatasetValidation(validation) {
  jestExpect(validation.home_empty.feed_posts).toBe(0);
  jestExpect(validation.home_empty.has_video).toBe(false);
  jestExpect(validation.home_empty.has_photo).toBe(false);

  jestExpect(validation.home_rich.has_video || validation.home_rich.has_photo).toBe(true);
  jestExpect(validation.home_rich.has_blog).toBe(true);
  jestExpect(validation.home_rich.feed_posts).toBeGreaterThanOrEqual(MIN_HOME_FEED_POSTS);
  jestExpect(validation.home_rich.media_total).toBeGreaterThanOrEqual(MIN_HOME_MEDIA_TOTAL);
  jestExpect(validation.home_rich.photo_posts).toBeGreaterThanOrEqual(MIN_HOME_PHOTO_POSTS);

  jestExpect(validation.hub.appearances).toBeGreaterThanOrEqual(MIN_HUB_APPEARANCES);
  jestExpect(validation.hub.uploads).toBeGreaterThanOrEqual(MIN_HUB_UPLOADS);
  jestExpect(validation.search.competitions).toBeGreaterThanOrEqual(MIN_SEARCH_RESULTS);
  jestExpect(validation.search.thumbnails).toBeGreaterThanOrEqual(MIN_SEARCH_THUMBNAILS);
  jestExpect(validation.competition.disciplines).toBeGreaterThanOrEqual(MIN_COMPETITION_DISCIPLINES);
  jestExpect(validation.profile_rich.posts).toBeGreaterThanOrEqual(MIN_PROFILE_POSTS);
  jestExpect(validation.onboarding.clubs).toBeGreaterThanOrEqual(MIN_ONBOARDING_CLUBS);
  jestExpect(validation.onboarding.groups).toBeGreaterThanOrEqual(MIN_ONBOARDING_GROUPS);
  jestExpect(validation.search_entities.person_results).toBeGreaterThanOrEqual(MIN_SEARCH_PEOPLE_RESULTS);
  jestExpect(validation.search_entities.group_results).toBeGreaterThanOrEqual(MIN_SEARCH_GROUP_RESULTS);
  jestExpect(validation.search_entities.person_media).toBeGreaterThanOrEqual(4);
  jestExpect(validation.search_entities.group_media).toBeGreaterThanOrEqual(4);
  jestExpect(validation.ai_bib.single_competition_results).toBeGreaterThanOrEqual(MIN_AI_BIB_SINGLE_RESULTS);
  jestExpect(validation.ai_bib.five_competition_results).toBeGreaterThanOrEqual(MIN_AI_BIB_MULTI_RESULTS);
}

async function measureBackendBibSearchBaseline({ accessToken, eventIds, bib }) {
  const samples = [];
  for (let attempt = 0; attempt < ITERATIONS; attempt += 1) {
    const startedAt = Date.now();
    await Promise.all(
      eventIds.map((eventId) =>
        apiRequest(
          `/media/search/bib?event_id=${encodeURIComponent(eventId)}&bib=${encodeURIComponent(bib)}`,
          { accessToken },
        )),
    );
    samples.push(Date.now() - startedAt);
  }
  return {
    cold_ms: round(samples[0] || 0),
    warm_p95_ms: round(percentile(samples.slice(1), 95)),
  };
}

async function measureScreenReady({
  name,
  routeName,
  routeParams = {},
  authState,
  readyTestId,
  backendBaselineMs = null,
}) {
  const wallClockSamples = [];
  const screenReadySamples = [];
  const failures = [];

  for (let attempt = 0; attempt < ITERATIONS; attempt += 1) {
    const startedAt = Date.now();
    try {
      await launchApp({
        routeName,
        routeParams,
        authState,
        apiBaseUrl: DEFAULT_API_BASE_URL,
        deleteApp: false,
      });
      const readyElement = element(by.id(readyTestId));
      await waitFor(readyElement).toExist().withTimeout(HARD_CAP_MS);
      const attributes = await readyElement.getAttributes();
      wallClockSamples.push(Date.now() - startedAt);
      screenReadySamples.push(parseReadyElapsedMs(attributes) ?? HARD_CAP_MS);
    } catch (error) {
      failures.push({ attempt: attempt + 1, error: String(error?.message || error) });
      wallClockSamples.push(HARD_CAP_MS);
      screenReadySamples.push(HARD_CAP_MS);
    } finally {
      try {
        await device.terminateApp();
      } catch {
        // ignore
      }
    }
  }

  const warmWallClockSamples = wallClockSamples.slice(1);
  const warmScreenReadySamples = screenReadySamples.slice(1);
  const warmP50 = median(warmScreenReadySamples);
  const warmP95 = percentile(warmScreenReadySamples, 95);
  const warmMax = Math.max(...warmScreenReadySamples);
  const coldMs = screenReadySamples[0] || 0;
  const coldWallClockMs = wallClockSamples[0] || 0;
  const estimatedFrontendOverheadMs = backendBaselineMs == null
    ? null
    : Math.max(0, warmP95 - backendBaselineMs);
  const coldLaunchOverheadMs = Math.max(0, coldWallClockMs - coldMs);
  const dominantLayer = backendBaselineMs == null
    ? 'unknown'
    : estimatedFrontendOverheadMs > backendBaselineMs
      ? 'frontend'
      : 'backend';

  return {
    name,
    routeName,
    ready_test_id: readyTestId,
    cold_ms: round(coldMs),
    cold_wall_clock_ms: round(coldWallClockMs),
    cold_launch_overhead_ms: round(coldLaunchOverheadMs),
    warm_samples_ms: warmScreenReadySamples.map(round),
    warm_wall_clock_samples_ms: warmWallClockSamples.map(round),
    warm_p50_ms: round(warmP50),
    warm_p95_ms: round(warmP95),
    warm_max_ms: round(warmMax),
    target_ms: TARGET_MS,
    max_ms: HARD_CAP_MS,
    backend_baseline_ms: backendBaselineMs == null ? null : round(backendBaselineMs),
    estimated_frontend_overhead_ms: estimatedFrontendOverheadMs == null ? null : round(estimatedFrontendOverheadMs),
    dominant_layer: dominantLayer,
    failures,
    target_met: warmP95 <= TARGET_MS,
    pass: failures.length === 0 && coldMs <= HARD_CAP_MS && warmP95 <= HARD_CAP_MS,
  };
}

async function measureInteractiveFlow({
  name,
  routeName,
  routeParams = {},
  authState,
  screenTestId,
  backendBaselineMs = null,
  prepare,
  action,
  readyCheck,
}) {
  const samples = [];
  const prepareSamples = [];
  const failures = [];

  for (let attempt = 0; attempt < ITERATIONS; attempt += 1) {
    try {
      await launchApp({
        routeName,
        routeParams,
        authState,
        apiBaseUrl: DEFAULT_API_BASE_URL,
        deleteApp: false,
      });
      await waitFor(element(by.id(screenTestId))).toExist().withTimeout(HARD_CAP_MS);
      const prepareStartedAt = Date.now();
      // eslint-disable-next-line no-await-in-loop
      if (prepare) await prepare();
      prepareSamples.push(Date.now() - prepareStartedAt);
      const startedAt = Date.now();
      // eslint-disable-next-line no-await-in-loop
      await action();
      // eslint-disable-next-line no-await-in-loop
      await readyCheck();
      samples.push(Date.now() - startedAt);
    } catch (error) {
      failures.push({ attempt: attempt + 1, error: String(error?.message || error) });
      prepareSamples.push(HARD_CAP_MS);
      samples.push(HARD_CAP_MS);
    } finally {
      try {
        await device.terminateApp();
      } catch {
        // ignore
      }
    }
  }

  const warmSamples = samples.slice(1);
  const warmPrepareSamples = prepareSamples.slice(1);
  const warmP50 = median(warmSamples);
  const warmP95 = percentile(warmSamples, 95);
  const estimatedFrontendOverheadMs = backendBaselineMs == null
    ? null
    : Math.max(0, warmP95 - backendBaselineMs);
  const dominantLayer = backendBaselineMs == null
    ? 'frontend'
    : estimatedFrontendOverheadMs > backendBaselineMs
      ? 'frontend'
      : 'backend';

  return {
    name,
    routeName,
    prepare_samples_ms: warmPrepareSamples.map(round),
    prepare_p95_ms: round(percentile(warmPrepareSamples, 95)),
    cold_ms: round(samples[0] || 0),
    warm_samples_ms: warmSamples.map(round),
    warm_p50_ms: round(warmP50),
    warm_p95_ms: round(warmP95),
    warm_max_ms: round(Math.max(...warmSamples)),
    target_ms: TARGET_MS,
    max_ms: HARD_CAP_MS,
    backend_baseline_ms: backendBaselineMs == null ? null : round(backendBaselineMs),
    estimated_frontend_overhead_ms: estimatedFrontendOverheadMs == null ? null : round(estimatedFrontendOverheadMs),
    dominant_layer: dominantLayer,
    failures,
    target_met: warmP95 <= TARGET_MS,
    pass: failures.length === 0 && warmP95 <= HARD_CAP_MS && (samples[0] || 0) <= HARD_CAP_MS,
  };
}

describe('Frontend performance benchmark', () => {
  it('critical screens and onboarding flows load within target thresholds on valid seeded data', async () => {
    const dataset = await seedRichDataset();
    const validation = await collectDatasetValidation(dataset);
    assertDatasetValidation(validation);

    const richCompetition = dataset.competitions[0];
    const competitionRouteParams = {
      eventId: richCompetition.competition.id,
      competitionId: richCompetition.competition.id,
      eventName: richCompetition.competition.name,
      name: richCompetition.competition.name,
      date: richCompetition.competition.event_date,
      location: richCompetition.competition.location,
      competitionFocus: resolveCompetitionFocus(richCompetition.competition.event_type),
      competitionType: resolveCompetitionType(richCompetition.competition.event_type),
      organizingClub: 'SpotMe Perf',
    };

    const uploadCompetitionRouteParams = {
      competition: {
        id: richCompetition.competition.id,
        event_id: richCompetition.competition.id,
        eventId: richCompetition.competition.id,
        name: richCompetition.competition.name,
        event_name: richCompetition.competition.name,
        location: richCompetition.competition.location,
        event_location: richCompetition.competition.location,
        event_date: richCompetition.competition.event_date,
        competition_focus: resolveCompetitionFocus(richCompetition.competition.event_type),
        competition_type: resolveCompetitionType(richCompetition.competition.event_type),
      },
      competitionFocus: resolveCompetitionFocus(richCompetition.competition.event_type),
      competitionType: resolveCompetitionType(richCompetition.competition.event_type),
      account: 'main',
      anonymous: false,
    };

    const onboardingRouteParams = {
      selectedCategory: 'find',
      selectedEvents: ['track-field'],
      flowSelectedEvents: ['track-field'],
    };
    const aiBibSingleCompetition = dataset.competitions[0].competition;
    const aiBibSingleRouteParams = {
      ...buildCompetitionSearchRouteParams([{
        id: aiBibSingleCompetition.id,
        name: aiBibSingleCompetition.name,
        date: aiBibSingleCompetition.event_date,
        location: aiBibSingleCompetition.location,
      }]),
      resumeCombinedSearch: {
        bib: dataset.aiBibNumber,
      },
    };
    const aiBibFiveRouteParams = {
      ...buildCompetitionSearchRouteParams(
        dataset.competitions.map((entry) => ({
          id: entry.competition.id,
          name: entry.competition.name,
          date: entry.competition.event_date,
          location: entry.competition.location,
        })),
      ),
      resumeCombinedSearch: {
        bib: dataset.aiBibNumber,
      },
    };
    const aiBibSingleBackendBaseline = await measureBackendBibSearchBaseline({
      accessToken: dataset.aiBibSearcher.access_token,
      eventIds: [aiBibSingleCompetition.id],
      bib: dataset.aiBibNumber,
    });
    const aiBibFiveBackendBaseline = await measureBackendBibSearchBaseline({
      accessToken: dataset.aiBibSearcher.access_token,
      eventIds: dataset.competitions.map((entry) => entry.competition.id),
      bib: dataset.aiBibNumber,
    });
    const benchmarkPhotoDetail = await apiRequest(`/media/${encodeURIComponent(dataset.benchmarkPhoto.id)}`, {
      accessToken: dataset.richViewer.access_token,
    }).catch(() => null);
    const photoViewerRouteParams = {
      mediaId: dataset.benchmarkPhoto.id,
      media_id: dataset.benchmarkPhoto.id,
      media: {
        id: dataset.benchmarkPhoto.id,
        media_id: dataset.benchmarkPhoto.id,
        type: 'image',
        title: benchmarkPhotoDetail?.title || dataset.benchmarkPhoto.title || null,
        event_id: dataset.benchmarkPhoto.event_id || dataset.benchmarkPhoto.competition_id || null,
        competition_id: dataset.benchmarkPhoto.competition_id || dataset.benchmarkPhoto.event_id || null,
        thumbnail_url: benchmarkPhotoDetail?.thumbnail_url || null,
        preview_url: benchmarkPhotoDetail?.preview_url || null,
        original_url: benchmarkPhotoDetail?.original_url || null,
        full_url: benchmarkPhotoDetail?.full_url || null,
        raw_url: benchmarkPhotoDetail?.raw_url || null,
      },
    };
    const longVideoViewerRouteParams = {
      media_id: dataset.benchmarkLongVideo.id,
      event_id: dataset.benchmarkLongVideo.event_id || dataset.benchmarkLongVideo.competition_id || null,
      video: {
        id: dataset.benchmarkLongVideo.id,
        media_id: dataset.benchmarkLongVideo.id,
        title: dataset.benchmarkLongVideo.title || 'Seeded long video',
        views_count: 0,
      },
    };

    const screens = [
      {
        name: 'home_empty',
        routeName: 'HomeScreen',
        readyTestId: 'e2e-perf-ready-home',
        authState: dataset.emptyViewer.auth_state,
        backendBaselineMs: BACKEND_BASELINES_MS.home,
      },
      {
        name: 'home_rich',
        routeName: 'HomeScreen',
        readyTestId: 'e2e-perf-ready-home',
        authState: dataset.richViewer.auth_state,
        backendBaselineMs: BACKEND_BASELINES_MS.home,
      },
      {
        name: 'hub',
        routeName: 'HubScreen',
        readyTestId: 'e2e-perf-ready-hub',
        authState: dataset.richViewer.auth_state,
        backendBaselineMs: BACKEND_BASELINES_MS.hub,
      },
      {
        name: 'search',
        routeName: 'SearchScreen',
        readyTestId: 'e2e-perf-ready-search',
        authState: dataset.richViewer.auth_state,
        backendBaselineMs: BACKEND_BASELINES_MS.search,
      },
      {
        name: 'upload_select',
        routeName: 'RootUploadSelectCompetitionScreen',
        readyTestId: 'e2e-perf-ready-upload-select',
        authState: dataset.richViewer.auth_state,
        backendBaselineMs: BACKEND_BASELINES_MS.upload_select,
      },
      {
        name: 'upload_competition',
        routeName: 'RootUploadCompetitionDetailsScreen',
        routeParams: uploadCompetitionRouteParams,
        readyTestId: 'e2e-perf-ready-upload-competition',
        authState: dataset.richViewer.auth_state,
        backendBaselineMs: BACKEND_BASELINES_MS.upload_competition,
      },
      {
        name: 'profile_sparse',
        routeName: 'UserProfileScreen',
        readyTestId: 'e2e-perf-ready-profile',
        authState: dataset.emptyViewer.auth_state,
        backendBaselineMs: BACKEND_BASELINES_MS.profile,
      },
      {
        name: 'profile_rich',
        routeName: 'UserProfileScreen',
        readyTestId: 'e2e-perf-ready-profile',
        authState: dataset.richViewer.auth_state,
        backendBaselineMs: BACKEND_BASELINES_MS.profile,
      },
      {
        name: 'competition',
        routeName: 'CompetitionDetailsScreen',
        routeParams: competitionRouteParams,
        readyTestId: 'e2e-perf-ready-competition',
        authState: dataset.richViewer.auth_state,
        backendBaselineMs: BACKEND_BASELINES_MS.competition,
      },
      {
        name: 'photo_viewer_open',
        routeName: 'PhotoDetailScreen',
        routeParams: photoViewerRouteParams,
        readyTestId: 'e2e-perf-ready-photo-viewer',
        authState: dataset.richViewer.auth_state,
      },
      {
        name: 'video_viewer_long_open',
        routeName: 'VideoPlayingScreen',
        routeParams: longVideoViewerRouteParams,
        readyTestId: 'e2e-perf-ready-video-viewer',
        authState: dataset.richViewer.auth_state,
      },
    ].filter((screen) => SCREEN_FILTER.length === 0 || SCREEN_FILTER.includes(screen.name));

    const interactionFlows = [
      {
        name: 'onboarding_focus_select',
        routeName: 'SelectEventScreen',
        routeParams: { selectedCategory: 'find', fromAddFlow: false },
        screenTestId: 'select-event-screen',
        authState: dataset.richViewer.auth_state,
        action: async () => {},
        readyCheck: async () => {
          await waitFor(element(by.id('focus-card-track-field'))).toExist().withTimeout(HARD_CAP_MS);
        },
      },
      {
        name: 'onboarding_club_picker',
        routeName: 'CompleteAthleteDetailsScreen',
        routeParams: onboardingRouteParams,
        screenTestId: 'profile-complete-athlete-details-screen',
        authState: dataset.richViewer.auth_state,
        prepare: async () => {
          await waitFor(element(by.id('profile-athlete-club-picker-open'))).toBeVisible().withTimeout(HARD_CAP_MS);
          await waitFor(element(by.id('profile-athlete-club-prefetch-ready'))).toExist().withTimeout(HARD_CAP_MS);
        },
        action: async () => {
          await element(by.id('profile-athlete-club-picker-open')).tap();
        },
        readyCheck: async () => {
          await waitFor(element(by.id('profile-athlete-club-picker-ready'))).toExist().withTimeout(HARD_CAP_MS);
        },
      },
      {
        name: 'onboarding_group_picker',
        routeName: 'CompleteAthleteDetailsScreen',
        routeParams: onboardingRouteParams,
        screenTestId: 'profile-complete-athlete-details-screen',
        authState: dataset.richViewer.auth_state,
        prepare: async () => {
          await waitFor(element(by.id('profile-athlete-group-picker-open')))
            .toBeVisible()
            .whileElement(by.id('profile-complete-athlete-details-scroll'))
            .scroll(200, 'down');
        },
        action: async () => {
          await element(by.id('profile-athlete-group-picker-open')).tap();
        },
        readyCheck: async () => {
          await waitFor(element(by.id('profile-athlete-group-picker-ready'))).toExist().withTimeout(HARD_CAP_MS);
        },
      },
      {
        name: 'onboarding_discipline_picker',
        routeName: 'CompleteAthleteDetailsScreen',
        routeParams: onboardingRouteParams,
        screenTestId: 'profile-complete-athlete-details-screen',
        authState: dataset.richViewer.auth_state,
        prepare: async () => {
          await waitFor(element(by.id('profile-athlete-discipline-prefetch-ready'))).toExist().withTimeout(HARD_CAP_MS);
          await waitFor(element(by.id('profile-athlete-discipline-picker-open-track-field')))
            .toBeVisible()
            .whileElement(by.id('profile-complete-athlete-details-scroll'))
            .scroll(260, 'down');
        },
        action: async () => {
          await element(by.id('profile-athlete-discipline-picker-open-track-field')).tap();
        },
        readyCheck: async () => {
          await waitFor(element(by.id('profile-athlete-discipline-picker-ready'))).toExist().withTimeout(HARD_CAP_MS);
        },
      },
      {
        name: 'search_person',
        routeName: 'SearchScreen',
        screenTestId: 'search-screen',
        authState: dataset.richViewer.auth_state,
        prepare: async () => {
          await waitFor(element(by.id('e2e-perf-ready-search'))).toExist().withTimeout(HARD_CAP_MS);
          await waitFor(element(by.id('search-filter-person'))).toBeVisible().withTimeout(HARD_CAP_MS);
        },
        action: async () => {
          await element(by.id('search-filter-person')).tap();
          await element(by.id('search-input')).replaceText(dataset.searchPersonQuery);
        },
        readyCheck: async () => {
          await waitFor(element(by.id(`search-person-card-${dataset.searchPerson.profile_id}`))).toBeVisible().withTimeout(HARD_CAP_MS);
        },
      },
      {
        name: 'search_group',
        routeName: 'SearchScreen',
        screenTestId: 'search-screen',
        authState: dataset.richViewer.auth_state,
        prepare: async () => {
          await waitFor(element(by.id('e2e-perf-ready-search'))).toExist().withTimeout(HARD_CAP_MS);
          await waitFor(element(by.id('search-filter-group'))).toBeVisible().withTimeout(HARD_CAP_MS);
        },
        action: async () => {
          await element(by.id('search-filter-group')).tap();
          await element(by.id('search-input')).replaceText(dataset.searchGroupQuery);
        },
        readyCheck: async () => {
          await waitFor(element(by.id(`search-group-card-${dataset.searchGroup.group_id || dataset.searchGroup.id}`))).toBeVisible().withTimeout(HARD_CAP_MS);
        },
      },
      {
        name: 'search_person_open_profile',
        routeName: 'SearchScreen',
        screenTestId: 'search-screen',
        authState: dataset.richViewer.auth_state,
        prepare: async () => {
          await waitFor(element(by.id('e2e-perf-ready-search'))).toExist().withTimeout(HARD_CAP_MS);
          await waitFor(element(by.id('search-filter-person'))).toBeVisible().withTimeout(HARD_CAP_MS);
        },
        action: async () => {
          await element(by.id('search-filter-person')).tap();
          await element(by.id('search-input')).replaceText(dataset.searchPersonQuery);
          await waitFor(element(by.id(`search-person-card-${dataset.searchPerson.profile_id}`))).toBeVisible().withTimeout(HARD_CAP_MS);
          await element(by.id(`search-person-card-${dataset.searchPerson.profile_id}`)).tap();
        },
        readyCheck: async () => {
          await waitFor(element(by.id('view-user-profile-screen'))).toBeVisible().withTimeout(HARD_CAP_MS);
        },
      },
      {
        name: 'search_group_open_profile',
        routeName: 'SearchScreen',
        screenTestId: 'search-screen',
        authState: dataset.richViewer.auth_state,
        prepare: async () => {
          await waitFor(element(by.id('e2e-perf-ready-search'))).toExist().withTimeout(HARD_CAP_MS);
          await waitFor(element(by.id('search-filter-group'))).toBeVisible().withTimeout(HARD_CAP_MS);
        },
        action: async () => {
          await element(by.id('search-filter-group')).tap();
          await element(by.id('search-input')).replaceText(dataset.searchGroupQuery);
          await waitFor(element(by.id(`search-group-card-${dataset.searchGroup.group_id || dataset.searchGroup.id}`))).toBeVisible().withTimeout(HARD_CAP_MS);
          await element(by.id(`search-group-card-${dataset.searchGroup.group_id || dataset.searchGroup.id}`)).tap();
        },
        readyCheck: async () => {
          await waitFor(element(by.id('group-profile-screen'))).toBeVisible().withTimeout(HARD_CAP_MS);
        },
      },
      {
        name: 'ai_competition_selector',
        routeName: 'AISearchScreen',
        screenTestId: 'ai-search-screen',
        authState: dataset.aiBibSearcher.auth_state,
        prepare: async () => {
          await waitFor(element(by.id('ai-search-screen-idle-ready'))).toExist().withTimeout(HARD_CAP_MS);
          await waitFor(element(by.id('ai-search-competition-prefetch-ready'))).toExist().withTimeout(HARD_CAP_MS);
        },
        action: async () => {
          await element(by.id('ai-search-open-competition-selector')).tap();
        },
        readyCheck: async () => {
          await waitFor(element(by.id('ai-search-competition-modal-overlay'))).toBeVisible().withTimeout(HARD_CAP_MS);
        },
      },
      {
        name: 'ai_bib_single_competition',
        routeName: 'AISearchScreen',
        routeParams: aiBibSingleRouteParams,
        screenTestId: 'ai-search-screen',
        authState: dataset.aiBibSearcher.auth_state,
        backendBaselineMs: aiBibSingleBackendBaseline.warm_p95_ms,
        prepare: async () => {
          await waitFor(element(by.id('ai-search-run-button'))).toBeVisible().withTimeout(HARD_CAP_MS);
        },
        action: async () => {
          await element(by.id('ai-search-run-button')).tap();
        },
        readyCheck: async () => {
          await waitFor(element(by.id('ai-search-results-ready'))).toExist().withTimeout(HARD_CAP_MS);
        },
      },
      {
        name: 'ai_bib_five_competitions',
        routeName: 'AISearchScreen',
        routeParams: aiBibFiveRouteParams,
        screenTestId: 'ai-search-screen',
        authState: dataset.aiBibSearcher.auth_state,
        backendBaselineMs: aiBibFiveBackendBaseline.warm_p95_ms,
        prepare: async () => {
          await waitFor(element(by.id('ai-search-run-button'))).toBeVisible().withTimeout(HARD_CAP_MS);
        },
        action: async () => {
          await element(by.id('ai-search-run-button')).tap();
        },
        readyCheck: async () => {
          await waitFor(element(by.id('ai-search-results-ready'))).toExist().withTimeout(HARD_CAP_MS);
        },
      },
    ].filter((flow) => SCREEN_FILTER.length === 0 || SCREEN_FILTER.includes(flow.name));

    const results = [];
    for (const screen of screens) {
      // eslint-disable-next-line no-await-in-loop
      const result = await measureScreenReady(screen);
      results.push(result);
      // eslint-disable-next-line no-console
      console.log(
        `[perf] ${result.name} cold=${result.cold_ms}ms coldWall=${result.cold_wall_clock_ms}ms warm_p95=${result.warm_p95_ms}ms ` +
        `backend=${result.backend_baseline_ms ?? 'n/a'}ms pass=${result.pass} target=${result.target_met}`,
      );
    }

    for (const flow of interactionFlows) {
      // eslint-disable-next-line no-await-in-loop
      const result = await measureInteractiveFlow(flow);
      results.push(result);
      // eslint-disable-next-line no-console
      console.log(
        `[perf] ${result.name} cold=${result.cold_ms}ms warm_p95=${result.warm_p95_ms}ms ` +
        `backend=n/a pass=${result.pass} target=${result.target_met}`,
      );
    }

    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(REPORTS_DIR, `frontend-perf-${timestamp}.json`);
    const report = {
      generated_at: new Date().toISOString(),
      api_base_url: DEFAULT_API_BASE_URL,
      target_ms: TARGET_MS,
      max_ms: HARD_CAP_MS,
      iterations: ITERATIONS,
      backend_baselines_ms: BACKEND_BASELINES_MS,
      dataset_validation: validation,
      results,
      all_passed: results.every((entry) => entry.pass),
      target_met: results.every((entry) => entry.target_met),
      target_warnings: results.filter((entry) => !entry.target_met).map((entry) => ({
        name: entry.name,
        warm_p95_ms: entry.warm_p95_ms,
        target_ms: entry.target_ms,
      })),
    };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // eslint-disable-next-line no-console
    console.log('=== Frontend Critical Screen Benchmarks ===');
    results.forEach((entry) => {
      // eslint-disable-next-line no-console
      console.log(
        `${entry.name}: cold=${entry.cold_ms}ms warm_p50=${entry.warm_p50_ms}ms warm_p95=${entry.warm_p95_ms}ms ` +
        `backend=${entry.backend_baseline_ms ?? 'n/a'}ms frontend_overhead=${entry.estimated_frontend_overhead_ms ?? 'n/a'}ms ` +
        `layer=${entry.dominant_layer} pass=${entry.pass}`,
      );
    });
    // eslint-disable-next-line no-console
    console.log(`Report: ${reportPath}`);

    jestExpect(results.every((entry) => entry.pass)).toBe(true);
  });
});
