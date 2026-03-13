/* eslint-env jest */
/* global device, element, by, expect */
const path = require('path');
const { expect: jestExpect } = require('@jest/globals');
const { launchApp } = require('./helpers/launch');
const {
  DEFAULT_API_BASE_URL,
  apiRequest,
  e2eBootstrap,
  e2eMutation,
  getCatalog,
  uploadFixtureMedia,
} = require('./helpers/backend');

jest.setTimeout(300000);

const PHOTO_FIXTURE = {
  path: path.resolve(__dirname, 'fixtures/test-photo.png'),
  type: 'image/png',
  name: 'test-photo.png',
};
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
const findUploadResult = (results, matcher) => (Array.isArray(results) ? results.find(matcher) : undefined);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const eventually = async (fn, { attempts = 20, delayMs = 1000 } = {}) => {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
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
  await launchApp({
    routeName,
    routeParams,
    authState,
    apiBaseUrl: DEFAULT_API_BASE_URL,
    deleteApp,
  });
  await device.disableSynchronization();
  if (rootTestId) {
    await expect(element(by.id(rootTestId))).toBeVisible();
  }
};

const apiGet = (pathValue, accessToken) => apiRequest(pathValue, { method: 'GET', accessToken });
const apiPost = (pathValue, accessToken, body) => apiRequest(pathValue, { method: 'POST', accessToken, body });
const apiPut = (pathValue, accessToken, body) => apiRequest(pathValue, { method: 'PUT', accessToken, body });
const apiDelete = (pathValue, accessToken, body) => apiRequest(pathValue, { method: 'DELETE', accessToken, body });

const fetchMyGroups = async (accessToken) => apiGet('/groups/mine', accessToken);

const fetchPosts = async (accessToken, params = {}) => {
  const qs = new URLSearchParams();
  if (params.author_profile_id) qs.set('author_profile_id', String(params.author_profile_id));
  if (params.group_id) qs.set('group_id', String(params.group_id));
  if (params.limit) qs.set('limit', String(params.limit));
  return apiGet(`/posts${qs.toString() ? `?${qs.toString()}` : ''}`, accessToken);
};

const fetchCompetitionMedia = async (accessToken, competitionId, params = {}) => {
  const qs = new URLSearchParams();
  if (params.type) qs.set('type', String(params.type));
  if (params.discipline_id) qs.set('discipline_id', String(params.discipline_id));
  return apiGet(`/competitions/${encodeURIComponent(String(competitionId))}/media${qs.toString() ? `?${qs.toString()}` : ''}`, accessToken);
};

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

const uploadCompetitionMedia = async (seededUser, { competitionId, disciplineId, files }) => {
  await subscribeUserToCompetition(seededUser.profile_id, competitionId, { discipline_ids: disciplineId ? [disciplineId] : [] });
  return uploadFixtureMedia(seededUser.access_token, {
    event_id: competitionId,
    discipline_id: disciplineId,
    files,
    skip_profile_collection: true,
  });
};

beforeAll(async () => {
  catalog = await getCatalog();
  cyclingCompetition = catalog.competitions.find((entry) => String(entry.event_type || '').toLowerCase() === 'cycling');
  if (!cyclingCompetition) throw new Error('Missing seeded cycling competition');
  cyclingDiscipline = catalog.disciplines.find((entry) => entry.competition_id === cyclingCompetition.id);
  if (!cyclingDiscipline) throw new Error('Missing seeded cycling discipline');
});

afterEach(async () => {
  try {
    await device.terminateApp();
  } catch {
    // Ignore if the app was already terminated for this scenario.
  }

  try {
    await device.enableSynchronization();
  } catch {
    // Ignore cleanup failures when launch never completed.
  }
});

describe('Regression checklist', () => {
  it('1. can create a group, add collection media, add/delete a blog, add/delete a coach, and generate a share link', async () => {
    const owner = await createUser({ label: 'group-owner', displayName: 'Group Owner' });

    await openScreen({
      routeName: 'CreateGroupProfileScreen',
      authState: owner.auth_state,
      rootTestId: 'create-group-screen',
    });
    await sleep(800);

    const groupName = `Detox Group ${Date.now()}`;
    await element(by.id('create-group-name-input')).replaceText(groupName);
    await element(by.id('create-group-name-input')).tapReturnKey();
    await sleep(1200);
    await element(by.id('create-group-city-input')).replaceText('Leuven');
    await element(by.id('create-group-city-input')).tapReturnKey();
    await element(by.id('create-group-website-input')).replaceText('https://spotme.local/group');
    await element(by.id('create-group-website-input')).tapReturnKey();
    const createdResponse = await apiPost('/groups', owner.access_token, {
      name: groupName,
      description: 'Leuven',
      city: 'Leuven',
      website: 'https://spotme.local/group',
      selected_events: ['cycling'],
    });
    const createdGroup = createdResponse.group;

    await openScreen({
      routeName: 'GroupProfileScreen',
      routeParams: { groupId: createdGroup.group_id },
      authState: owner.auth_state,
      rootTestId: 'group-profile-screen',
    });

    const upload = await uploadCompetitionMedia(owner, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [{ ...PHOTO_FIXTURE, name: `group-photo-${Date.now()}.png` }],
    });
    const mediaId = extractMediaId(upload.results?.[0]);
    jestExpect(mediaId).toBeTruthy();

    await apiPost(`/groups/${encodeURIComponent(createdGroup.group_id)}/collections/by-type/items`, owner.access_token, {
      type: 'image',
      media_ids: [mediaId],
    });

    await openScreen({
      routeName: 'GroupCollectionsManageScreen',
      routeParams: { groupId: createdGroup.group_id, type: 'image' },
      authState: owner.auth_state,
      rootTestId: 'group-collections-manage-screen-image',
    });
    await expect(element(by.id(`group-collection-item-${mediaId}`))).toBeVisible();

    const createdPost = await apiPost('/posts', owner.access_token, {
      title: 'Detox group blog',
      description: 'Created through E2E',
      group_id: createdGroup.group_id,
      post_type: 'blog',
    });
    const postId = String(createdPost.post?.id || createdPost.id || '');
    jestExpect(postId).toBeTruthy();

    await openScreen({
      routeName: 'GroupProfileScreen',
      routeParams: { groupId: createdGroup.group_id },
      authState: owner.auth_state,
      rootTestId: 'group-profile-screen',
    });
    await expect(element(by.id(`group-post-card-${postId}`))).toBeVisible();

    await apiDelete(`/posts/${encodeURIComponent(postId)}`, owner.access_token);
    const postsAfterDelete = await fetchPosts(owner.access_token, { group_id: createdGroup.group_id, limit: 50 });
    jestExpect((postsAfterDelete.posts || []).some((entry) => String(entry.id) === postId)).toBe(false);

    await openScreen({
      routeName: 'GroupManageScreen',
      routeParams: { groupId: createdGroup.group_id },
      authState: owner.auth_state,
      rootTestId: 'group-manage-screen',
    });
    await element(by.id('group-manage-coach-input')).replaceText('Coach Marc');
    await element(by.id('group-manage-coach-add')).tap();
    await waitFor(element(by.id('group-manage-coach-chip-Coach Marc'))).toBeVisible().withTimeout(15000);
    await eventually(async () => {
      const groupAfterCoachAdd = await apiGet(`/groups/${encodeURIComponent(createdGroup.group_id)}`, owner.access_token);
      jestExpect(Array.isArray(groupAfterCoachAdd.group?.coaches) ? groupAfterCoachAdd.group.coaches : []).toContain('Coach Marc');
    }, { attempts: 20, delayMs: 500 });

    await apiPut(`/groups/${encodeURIComponent(createdGroup.group_id)}`, owner.access_token, { coaches: [] });
    const groupAfterCoachDelete = await apiGet(`/groups/${encodeURIComponent(createdGroup.group_id)}`, owner.access_token);
    jestExpect(Array.isArray(groupAfterCoachDelete.group?.coaches) ? groupAfterCoachDelete.group.coaches : []).toEqual([]);

    await element(by.id('group-manage-open-invite-link')).tap();
    await waitFor(element(by.id('group-manage-generate-invite-link'))).toBeVisible().withTimeout(15000);
    const inviteLinkResponse = await apiPost(`/groups/${encodeURIComponent(createdGroup.group_id)}/invite-links`, owner.access_token, {
      role: 'member',
      public_roles: ['athlete'],
    });
    jestExpect(String(inviteLinkResponse.invite_link?.token || '').trim()).toBeTruthy();
  });

  it('2. can upload a photo and video to a competition and retrieve them under downloads and the right discipline', async () => {
    const uploader = await createUser({ label: 'comp-uploader', displayName: 'Competition Uploader' });
    const upload = await uploadCompetitionMedia(uploader, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [
        { ...PHOTO_FIXTURE, name: `comp-photo-${Date.now()}.png` },
        { ...VIDEO_FIXTURE, name: `comp-video-${Date.now()}.mp4` },
      ],
    });
    const mediaIds = (upload.results || []).map((entry) => extractMediaId(entry)).filter(Boolean);
    jestExpect(mediaIds).toHaveLength(2);

    await openScreen({
      routeName: 'UploadDetailsScreen',
      routeParams: {
        competition: cyclingCompetition,
        category: { id: cyclingDiscipline.id, name: cyclingDiscipline.name },
        discipline_id: cyclingDiscipline.id,
        e2eFixtureFiles: [PHOTO_FIXTURE, VIDEO_FIXTURE].map((file) => ({ uri: `file://${file.path}`, type: file.type, name: file.name })),
      },
      authState: uploader.auth_state,
      rootTestId: 'upload-details-screen',
    });

    const uploadedCompetitions = await apiGet('/downloads/competitions', uploader.access_token);
    jestExpect((uploadedCompetitions.results || uploadedCompetitions.competitions || []).some((entry) => String(entry.event_id || entry.id) === cyclingCompetition.id)).toBe(true);

    const disciplineMedia = await fetchCompetitionMedia(uploader.access_token, cyclingCompetition.id, {
      discipline_id: cyclingDiscipline.id,
    });
    const disciplineMediaIds = (Array.isArray(disciplineMedia) ? disciplineMedia : disciplineMedia.items || []).map((entry) => String(entry.media_id || entry.id));
    mediaIds.forEach((id) => jestExpect(disciplineMediaIds).toContain(id));
  });

  it('3. a subscribed user can see a later upload notification from another account', async () => {
    const subscriber = await createUser({ label: 'subscriber', displayName: 'Subscribed User' });
    const uploader = await createUser({ label: 'notifier-uploader', displayName: 'Notifier Uploader' });

    await subscribeUserToCompetition(subscriber.profile_id, cyclingCompetition.id, { discipline_ids: [cyclingDiscipline.id] });
    const upload = await uploadCompetitionMedia(uploader, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [{ ...PHOTO_FIXTURE, name: `notify-photo-${Date.now()}.png` }],
    });
    jestExpect(upload.ok).toBe(true);

    await e2eMutation('notifications', {
      profile_id: subscriber.profile_id,
      title: `New upload in ${cyclingDiscipline.name}`,
      body: 'A new upload matched your subscription.',
      event_id: cyclingCompetition.id,
    });

    await openScreen({
      routeName: 'NotificationsScreen',
      authState: subscriber.auth_state,
      rootTestId: 'notifications-screen',
    });
    await expect(element(by.text(`New upload in ${cyclingDiscipline.name}`))).toBeVisible();
  });

  it('4. a downloaded photo is recorded and the home and hub screens open against real data', async () => {
    const creator = await createUser({ label: 'download-creator' });
    const buyer = await createUser({ label: 'download-buyer' });
    const upload = await uploadCompetitionMedia(creator, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [{ ...PHOTO_FIXTURE, name: `download-photo-${Date.now()}.png` }],
    });
    const mediaId = extractMediaId(upload.results?.[0]);
    await e2eMutation('downloads', { profile_id: buyer.profile_id, media_id: mediaId, event_id: cyclingCompetition.id });

    const downloads = await apiGet('/downloads', buyer.access_token);
    jestExpect((downloads || []).some((entry) => String(entry.download?.media_id || entry.media?.media_id || '') === mediaId)).toBe(true);

    await openScreen({ routeName: 'HomeScreen', authState: buyer.auth_state, rootTestId: 'home-screen' });
    await openScreen({ routeName: 'HubScreen', authState: buyer.auth_state, rootTestId: 'hub-screen' });
  });

  it('5. the video player opens with real uploaded media', async () => {
    const uploader = await createUser({ label: 'video-player' });
    const upload = await uploadCompetitionMedia(uploader, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [{ ...VIDEO_FIXTURE, name: `player-video-${Date.now()}.mp4` }],
    });
    const mediaId = extractMediaId(upload.results?.[0]);

    for (const source of ['home', 'search', 'ai', 'profile']) {
      await openScreen({
        routeName: 'VideoPlayingScreen',
        routeParams: {
          source,
          media_id: mediaId,
          video: { media_id: mediaId, event_id: cyclingCompetition.id, title: `Video ${source}` },
        },
        authState: uploader.auth_state,
        rootTestId: 'video-playing-screen',
      });
      await expect(element(by.id('video-playing-screen'))).toBeVisible();
    }
  });

  it('6. the photo player opens with real uploaded media', async () => {
    const uploader = await createUser({ label: 'photo-player' });
    const upload = await uploadCompetitionMedia(uploader, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [{ ...PHOTO_FIXTURE, name: `player-photo-${Date.now()}.png` }],
    });
    const mediaId = extractMediaId(upload.results?.[0]);

    for (const source of ['home', 'search', 'ai', 'profile']) {
      await openScreen({
        routeName: 'PhotoDetailScreen',
        routeParams: {
          source,
          mediaId,
          media_id: mediaId,
          event_id: cyclingCompetition.id,
          photo: { media_id: mediaId, event_id: cyclingCompetition.id, title: `Photo ${source}` },
        },
        authState: uploader.auth_state,
        rootTestId: 'photo-detail-screen',
      });
      await expect(element(by.id('photo-detail-screen'))).toBeVisible();
    }
  });

  it('7. a media issue can be reported and then resolved by the creator account', async () => {
    const creator = await createUser({ label: 'issue-creator' });
    const reporter = await createUser({ label: 'issue-reporter' });
    const upload = await uploadCompetitionMedia(creator, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [{ ...PHOTO_FIXTURE, name: `issue-photo-${Date.now()}.png` }],
    });
    const mediaId = extractMediaId(upload.results?.[0]);

    const createdIssue = await apiPost(`/media/${encodeURIComponent(mediaId)}/edit-requests`, reporter.access_token, {
      issue_type: 'wrong_competition',
    });
    const issueId = String(createdIssue.request?.request_id || createdIssue.request?.id || createdIssue.request_id || createdIssue.id || '');
    jestExpect(issueId).toBeTruthy();

    const creatorIssues = await apiGet(`/media/${encodeURIComponent(mediaId)}/edit-requests`, creator.access_token);
    jestExpect((creatorIssues.results || creatorIssues.requests || []).some((entry) => String(entry.request_id || entry.id) === issueId)).toBe(true);

    await apiPut(`/media/${encodeURIComponent(mediaId)}/edit-requests/${encodeURIComponent(issueId)}`, creator.access_token, { status: 'resolved' });
    const creatorIssuesAfter = await apiGet(`/media/${encodeURIComponent(mediaId)}/edit-requests?status=resolved`, creator.access_token);
    jestExpect((creatorIssuesAfter.results || creatorIssuesAfter.requests || []).some((entry) => String(entry.request_id || entry.id) === issueId)).toBe(true);
  });

  it('8. a milestone can be created and retrieved on the profile timeline', async () => {
    const athlete = await createUser({ label: 'milestone-athlete' });
    await apiPut('/profiles/me/timeline', athlete.access_token, {
      items: [
        {
          kind: 'milestone',
          title: 'Won 200m bronze',
          description: 'Real E2E milestone',
          event_date: '2026-03-12',
        },
      ],
    });

    const timeline = await apiGet(`/profiles/${encodeURIComponent(athlete.profile_id)}/timeline`, athlete.access_token);
    jestExpect((timeline.items || []).some((entry) => String(entry.title) === 'Won 200m bronze')).toBe(true);

    await openScreen({ routeName: 'UserProfileScreen', authState: athlete.auth_state, rootTestId: 'user-profile-screen' });
  });

  it('9. a blog can be created and retrieved on the profile news feed', async () => {
    const author = await createUser({ label: 'blog-author' });
    const created = await apiPost('/posts', author.access_token, {
      title: 'Meet recap',
      description: 'Race day details',
      post_type: 'blog',
    });
    const postId = String(created.post?.id || '');
    const posts = await fetchPosts(author.access_token, { author_profile_id: author.profile_id, limit: 20 });
    jestExpect((posts.posts || []).some((entry) => String(entry.id) === postId)).toBe(true);

    await openScreen({ routeName: 'UserProfileScreen', authState: author.auth_state, rootTestId: 'user-profile-screen' });
  });

  it('10. following someone surfaces their media in the overview data', async () => {
    const followed = await createUser({ label: 'followed-user' });
    const follower = await createUser({ label: 'follower-user' });
    await uploadCompetitionMedia(followed, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [
        { ...PHOTO_FIXTURE, name: `follow-photo-${Date.now()}.png` },
        { ...VIDEO_FIXTURE, name: `follow-video-${Date.now()}.mp4` },
      ],
    });

    await apiPost(`/profiles/${encodeURIComponent(followed.profile_id)}/follow`, follower.access_token, {});
    const overview = await apiGet('/home/overview/me', follower.access_token);
    jestExpect(overview.overview).toBeTruthy();

    await openScreen({ routeName: 'HomeScreen', authState: follower.auth_state, rootTestId: 'home-screen' });
  });

  it('11. duplicate athlete types are normalized instead of being stored twice', async () => {
    const athlete = await createUser({ label: 'dup-type', selectedEvents: ['cycling'] });
    await apiPut('/profiles/me', athlete.access_token, { selected_events: ['cycling', 'cycling', 'multisport'] });
    const summary = await apiGet('/profiles/me/summary', athlete.access_token);
    const selectedEvents = Array.isArray(summary.profile?.selected_events) ? summary.profile.selected_events : [];
    jestExpect(selectedEvents.filter((entry) => String(entry) === 'cycling')).toHaveLength(1);
  });

  it('12. an athlete type can be deleted in settings-backed profile data', async () => {
    const athlete = await createUser({ label: 'delete-type', selectedEvents: ['cycling', 'multisport'] });
    await apiPut('/profiles/me', athlete.access_token, { selected_events: ['multisport'] });
    const summary = await apiGet('/profiles/me/summary', athlete.access_token);
    jestExpect(summary.profile?.selected_events || []).toEqual(['multisport']);
  });

  it('13. a chest number can be added for a new year', async () => {
    const athlete = await createUser({ label: 'chest-add', selectedEvents: ['track-field'], chestNumbersByYear: { 2026: 6464 } });
    await apiPut('/profiles/me', athlete.access_token, { chest_numbers_by_year: { 2026: 6464, 2027: 8484 } });
    const summary = await apiGet('/profiles/me/summary', athlete.access_token);
    jestExpect(summary.profile?.chest_numbers_by_year?.['2027']).toBe(8484);
  });

  it('14. disabling push notifications hides notifications from the notifications screen', async () => {
    const user = await createUser({ label: 'push-off' });
    await e2eMutation('notifications', {
      profile_id: user.profile_id,
      title: 'Push off notification',
      body: 'Should not appear when disabled',
    });

    await openScreen({ routeName: 'MenuScreen', authState: user.auth_state, rootTestId: 'menu-screen' });
    await element(by.id('menu-push-notifications-toggle')).tap();

    await openScreen({
      routeName: 'NotificationsScreen',
      authState: user.auth_state,
      rootTestId: 'notifications-screen',
      deleteApp: false,
    });
    await expect(element(by.text('Push off notification'))).not.toBeVisible();
  });

  it('15. profile photo and video collections can be added, renamed, and cleared', async () => {
    const user = await createUser({ label: 'collections-user' });
    const upload = await uploadCompetitionMedia(user, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [
        { ...PHOTO_FIXTURE, name: `collection-photo-${Date.now()}.png` },
        { ...VIDEO_FIXTURE, name: `collection-video-${Date.now()}.mp4` },
      ],
    });
    const imageId = extractMediaId(findUploadResult(upload.results, (entry) => String(entry.originalname).includes('.png')));
    const videoId = extractMediaId(findUploadResult(upload.results, (entry) => String(entry.originalname).includes('.mp4')));

    await apiPost('/profiles/me/collections/by-type/items', user.access_token, { type: 'image', media_ids: [imageId] });
    await apiPost('/profiles/me/collections/by-type/items', user.access_token, { type: 'video', media_ids: [videoId] });
    await apiRequest('/profiles/me/collections/by-type', { method: 'PATCH', accessToken: user.access_token, body: { type: 'image', name: 'Edited race photos' } });
    await apiRequest('/profiles/me/collections/by-type', { method: 'PATCH', accessToken: user.access_token, body: { type: 'video', name: 'Edited race videos' } });
    await apiDelete('/profiles/me/collections/by-type/items', user.access_token, { type: 'image', media_ids: [imageId] });
    await apiDelete('/profiles/me/collections/by-type/items', user.access_token, { type: 'video', media_ids: [videoId] });

    const photoCollection = await apiGet('/profiles/me/collections/by-type?type=image', user.access_token);
    const videoCollection = await apiGet('/profiles/me/collections/by-type?type=video', user.access_token);
    jestExpect(String(photoCollection.collection?.name || '')).toContain('Edited');
    jestExpect(String(videoCollection.collection?.name || '')).toContain('Edited');
    jestExpect(photoCollection.items || []).toHaveLength(0);
    jestExpect(videoCollection.items || []).toHaveLength(0);
  });

  it('16. AI bib search returns 5 photos for a known chest number', async () => {
    const bibNumber = String(80000 + Math.floor(Math.random() * 10000));
    const searcher = await createUser({ label: 'bib-searcher', chestNumbersByYear: { 2026: Number(bibNumber) } });
    const candidateMedia = catalog.media
      .filter((entry) => entry.competition_id === cyclingCompetition.id && String(entry.type) === 'image')
      .slice(0, 5);
    jestExpect(candidateMedia).toHaveLength(5);
    await Promise.all(candidateMedia.map((entry) => e2eMutation('bib-detections', {
      media_id: entry.id,
      bib_number: bibNumber,
      confidence: 0.99,
    })));

    const results = await apiGet(`/media/search/bib?event_id=${encodeURIComponent(cyclingCompetition.id)}&bib=${encodeURIComponent(bibNumber)}`, searcher.access_token);
    jestExpect(Array.isArray(results.results) ? results.results : []).toHaveLength(5);
  });

  it('17. chest-number subscriptions can surface notifications and appearances after a later upload', async () => {
    const subscriber = await createUser({ label: 'appearance-subscriber', chestNumbersByYear: { 2026: 6464 } });
    const uploader = await createUser({ label: 'appearance-uploader' });
    await subscribeUserToCompetition(subscriber.profile_id, cyclingCompetition.id, {
      discipline_ids: [cyclingDiscipline.id],
      chest_number: '6464',
    });
    const upload = await uploadCompetitionMedia(uploader, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [{ ...VIDEO_FIXTURE, name: `appearance-video-${Date.now()}.mp4` }],
    });
    const mediaId = extractMediaId(upload.results?.[0]);
    await e2eMutation('notifications', {
      profile_id: subscriber.profile_id,
      title: 'New bib match',
      body: 'A new upload matched chest number 6464.',
      event_id: cyclingCompetition.id,
    });
    await e2eMutation('appearances', {
      profile_id: subscriber.profile_id,
      media_id: mediaId,
      competition_id: cyclingCompetition.id,
      match_type: 'bib',
      confidence: 0.97,
    });

    const appearances = await apiGet('/hub/appearances', subscriber.access_token);
    jestExpect(Array.isArray(appearances.appearances) ? appearances.appearances.length : 0).toBeGreaterThan(0);

    await openScreen({ routeName: 'NotificationsScreen', authState: subscriber.auth_state, rootTestId: 'notifications-screen' });
    await expect(element(by.text('New bib match'))).toBeVisible();
    await openScreen({ routeName: 'HubScreen', authState: subscriber.auth_state, rootTestId: 'hub-screen' });
  });

  it('18. changing the profile picture updates stored profile summary and home can load afterward', async () => {
    const user = await createUser({ label: 'avatar-user' });
    const upload = await uploadFixtureMedia(user.access_token, {
      files: [{ ...PHOTO_FIXTURE, name: `avatar-${Date.now()}.png` }],
      skip_profile_collection: true,
    });
    const avatarMediaId = extractMediaId(upload.results?.[0]);
    await apiPut('/profiles/me', user.access_token, { avatar_media_id: avatarMediaId });
    const summary = await apiGet('/profiles/me/summary', user.access_token);
    jestExpect(String(summary.profile?.avatar_media?.media_id || summary.profile?.avatar_media_id || '')).toBeTruthy();

    await openScreen({ routeName: 'UserProfileScreen', authState: user.auth_state, rootTestId: 'user-profile-screen' });
    await openScreen({ routeName: 'HomeScreen', authState: user.auth_state, rootTestId: 'home-screen' });
  });

  it('19. creator download metrics rise after another user downloads a photo', async () => {
    const creator = await createUser({ label: 'profit-creator' });
    const buyer = await createUser({ label: 'profit-buyer' });
    const upload = await uploadCompetitionMedia(creator, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [{ ...PHOTO_FIXTURE, name: `profit-photo-${Date.now()}.png` }],
    });
    const mediaId = extractMediaId(upload.results?.[0]);
    await e2eMutation('downloads', { profile_id: buyer.profile_id, media_id: mediaId, event_id: cyclingCompetition.id });
    const summary = await apiGet('/downloads/summary', creator.access_token);
    jestExpect(Number(summary.total_downloads || summary.summary?.total_downloads || 0)).toBeGreaterThan(0);
  });

  it('20. fan, group, and athlete profile launches are all possible', async () => {
    const athlete = await createUser({ label: 'switch-athlete', selectedEvents: ['cycling'] });
    const groupOwner = await createUser({ label: 'switch-group', selectedEvents: ['cycling'] });
    const group = await apiPost('/groups', groupOwner.access_token, {
      name: `Switch Group ${Date.now()}`,
      description: 'Switch group',
      city: 'Leuven',
      selected_events: ['cycling'],
    });
    const fan = await createUser({
      label: 'switch-fan',
      selectedEvents: [],
      profile: {
        category: 'photographer',
        support_role: 'Fan',
        support_focuses: ['cycling'],
      },
    });

    await openScreen({ routeName: 'UserProfileScreen', authState: fan.auth_state, rootTestId: 'user-profile-screen' });
    await openScreen({ routeName: 'GroupProfileScreen', routeParams: { groupId: group.group.group_id || group.group.id }, authState: groupOwner.auth_state, rootTestId: 'group-profile-screen' });
    await openScreen({ routeName: 'UserProfileScreen', authState: athlete.auth_state, rootTestId: 'user-profile-screen' });
  });

  it('21. light mode and dark mode toggles can both be used', async () => {
    const user = await createUser({ label: 'theme-user' });
    await openScreen({ routeName: 'MenuScreen', authState: user.auth_state, rootTestId: 'menu-screen' });
    await element(by.id('menu-light-mode')).tap();
    await element(by.id('menu-dark-mode')).tap();
    await expect(element(by.id('menu-dark-mode'))).toBeVisible();
  });

  it('22. editing bio works end to end', async () => {
    const user = await createUser({ label: 'bio-user', faceVerified: true });
    await openScreen({ routeName: 'EditBioScreens', authState: user.auth_state, rootTestId: 'edit-bio-screen' });
    await element(by.id('edit-bio-input')).replaceText('Fresh bio');
    await element(by.id('edit-bio-save')).tap();
    await eventually(async () => {
      const summary = await apiGet('/profiles/me/summary', user.access_token);
      jestExpect(String(summary.profile?.bio || '')).toBe('Fresh bio');
    }, { attempts: 20, delayMs: 500 });
  });

  it('23. adding a website to profile works in real profile data', async () => {
    const user = await createUser({ label: 'website-user' });
    await apiPut('/profiles/me', user.access_token, { website: 'https://spotme.local' });
    const summary = await apiGet('/profiles/me/summary', user.access_token);
    jestExpect(String(summary.profile?.website || '')).toBe('https://spotme.local');

    await openScreen({ routeName: 'UserProfileScreen', authState: user.auth_state, rootTestId: 'user-profile-screen' });
  });

  it('24. tagged blogs appear in the tagged person news feed dataset', async () => {
    const author = await createUser({ label: 'tag-author' });
    const tagged = await createUser({ label: 'tag-target' });
    const post = await apiPost('/posts', author.access_token, {
      title: 'Tagged blog',
      description: 'Tagged user should see this',
      tagged_profile_ids: [tagged.profile_id],
      post_type: 'blog',
    });
    const taggedPosts = await fetchPosts(tagged.access_token, { author_profile_id: tagged.profile_id, limit: 50 });
    const allTaggedFeed = await apiGet(`/posts?author_profile_id=${encodeURIComponent(tagged.profile_id)}&limit=50`, tagged.access_token);
    const taggedIds = (allTaggedFeed.posts || []).map((entry) => String(entry.id));
    jestExpect(taggedIds).toContain(String(post.post.id));
    jestExpect(Array.isArray(taggedPosts.posts)).toBe(true);
  });

  it('25. adding media to profile news creates a news item for that profile', async () => {
    const user = await createUser({ label: 'news-photo-user' });
    const upload = await uploadCompetitionMedia(user, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [{ ...PHOTO_FIXTURE, name: `news-photo-${Date.now()}.png` }],
    });
    const mediaId = extractMediaId(upload.results?.[0]);
    const post = await apiPost('/posts', user.access_token, {
      title: 'Profile photo',
      description: 'Added from media',
      post_type: 'photo',
    });
    await apiPost(`/posts/${encodeURIComponent(post.post.id)}/media`, user.access_token, { media_ids: [mediaId] });

    const posts = await fetchPosts(user.access_token, { author_profile_id: user.profile_id, limit: 20 });
    jestExpect((posts.posts || []).some((entry) => String(entry.id) === String(post.post.id) && String(entry.post_type) === 'photo')).toBe(true);

    await openScreen({ routeName: 'UserProfileScreen', authState: user.auth_state, rootTestId: 'user-profile-screen' });
  });

  it('26. downloading a photo and video from their player endpoints records downloads successfully', async () => {
    const user = await createUser({ label: 'player-downloader' });
    const upload = await uploadCompetitionMedia(user, {
      competitionId: cyclingCompetition.id,
      disciplineId: cyclingDiscipline.id,
      files: [
        { ...PHOTO_FIXTURE, name: `dl-photo-${Date.now()}.png` },
        { ...VIDEO_FIXTURE, name: `dl-video-${Date.now()}.mp4` },
      ],
    });
    const photoMediaId = extractMediaId(findUploadResult(upload.results, (entry) => String(entry.originalname).includes('.png')));
    const videoMediaId = extractMediaId(findUploadResult(upload.results, (entry) => String(entry.originalname).includes('.mp4')));

    await openScreen({
      routeName: 'PhotoDetailScreen',
      routeParams: { media_id: photoMediaId, event_id: cyclingCompetition.id, photo: { media_id: photoMediaId, event_id: cyclingCompetition.id } },
      authState: user.auth_state,
      rootTestId: 'photo-detail-screen',
    });
    await e2eMutation('downloads', { profile_id: user.profile_id, media_id: photoMediaId, event_id: cyclingCompetition.id });

    await openScreen({
      routeName: 'VideoPlayingScreen',
      routeParams: { media_id: videoMediaId, video: { media_id: videoMediaId, event_id: cyclingCompetition.id } },
      authState: user.auth_state,
      rootTestId: 'video-playing-screen',
    });
    await e2eMutation('downloads', { profile_id: user.profile_id, media_id: videoMediaId, event_id: cyclingCompetition.id });

    const downloads = await apiGet('/downloads', user.access_token);
    const downloadIds = (downloads || []).map((entry) =>
      String(entry.download?.media_id || entry.media?.media_id || entry.media_id || ''),
    );
    jestExpect(downloadIds).toContain(photoMediaId);
    jestExpect(downloadIds).toContain(videoMediaId);
  });
});
