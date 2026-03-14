/* eslint-env jest */
/* global device, element, by, expect, waitFor */
const path = require('path');
const { expect: jestExpect } = require('@jest/globals');

const { launchApp } = require('./helpers/launch');
const {
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

const DEFAULT_API_BASE_URL = process.env.E2E_API_BASE_URL || process.env.API_GATEWAY_URL || 'http://127.0.0.1:3000';

let catalog;
let benchmarkCompetition;
let benchmarkDiscipline;

const uniqueTag = (label) => `${label}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const apiGet = (pathValue, accessToken) => apiRequest(pathValue, { method: 'GET', accessToken });
const apiPost = (pathValue, accessToken, body) => apiRequest(pathValue, { method: 'POST', accessToken, body });
const apiPut = (pathValue, accessToken, body) => apiRequest(pathValue, { method: 'PUT', accessToken, body });

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
    // ignore
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

const uploadCompetitionMedia = async (uploader, { type, title }) => {
  await subscribeUserToCompetition(uploader.profile_id, benchmarkCompetition.id, {
    discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [],
  });
  const upload = await uploadFixtureMedia(uploader.access_token, {
    event_id: benchmarkCompetition.id,
    discipline_id: benchmarkDiscipline?.id || null,
    files: [
      {
        ...(type === 'video' ? VIDEO_FIXTURE : PHOTO_FIXTURE),
        name: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}.${type === 'video' ? 'mp4' : 'png'}`,
        title,
      },
    ],
    skip_profile_collection: true,
  });
  const result = Array.isArray(upload?.results) ? upload.results.find((entry) => entry?.media_id) : null;
  const mediaId = String(result?.media_id || '').trim();
  if (!mediaId) {
    throw new Error(`Upload returned no media_id: ${JSON.stringify(upload)}`);
  }
  return mediaId;
};

const findNotification = async (accessToken, predicate) => {
  const payload = await apiGet('/notifications?limit=100&offset=0&unread_only=true', accessToken);
  const notifications = Array.isArray(payload?.notifications) ? payload.notifications : [];
  const match = notifications.find(predicate);
  if (!match) {
    throw new Error(`Matching notification not found in ${JSON.stringify(notifications)}`);
  }
  return match;
};

const openNotificationsAndTap = async (authState, notificationId) => {
  await openScreen({
    routeName: 'NotificationsScreen',
    authState,
    rootTestId: 'notifications-screen',
  });
  await waitFor(element(by.id(`notification-card-${notificationId}`))).toBeVisible().withTimeout(15000);
  await element(by.id(`notification-card-${notificationId}`)).tap();
};

beforeAll(async () => {
  catalog = await getCatalog();
  benchmarkCompetition = catalog.competitions.find((entry) => String(entry.event_type || '').toLowerCase() === 'cycling')
    || catalog.competitions[0];
  if (!benchmarkCompetition) throw new Error('Missing seeded competition');
  benchmarkDiscipline = catalog.disciplines.find((entry) => entry.competition_id === benchmarkCompetition.id)
    || catalog.disciplines[0];
});

afterEach(async () => {
  try {
    await device.terminateApp();
  } catch {
    // ignore
  }
});

describe('Notification routing', () => {
  it('routes competition photo upload notifications to the all-photos screen', async () => {
    const subscriber = await createUser({ label: 'notif-photo-subscriber', displayName: 'Photo Subscriber' });
    const uploader = await createUser({ label: 'notif-photo-uploader', displayName: 'Photo Uploader' });
    await subscribeUserToCompetition(subscriber.profile_id, benchmarkCompetition.id, {
      discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [],
    });

    await uploadCompetitionMedia(uploader, { type: 'image', title: `Photo upload ${Date.now()}` });

    const notification = await eventually(() =>
      findNotification(
        subscriber.access_token,
        (item) => String(item?.metadata?.action || '') === 'competition_upload' && String(item?.metadata?.media_type || '') === 'image',
      ),
    );

    await openNotificationsAndTap(subscriber.auth_state, String(notification.id));
    await expect(element(by.id('all-photos-events-screen'))).toBeVisible();
  });

  it('routes competition video upload notifications to the all-videos screen', async () => {
    const subscriber = await createUser({ label: 'notif-video-subscriber', displayName: 'Video Subscriber' });
    const uploader = await createUser({ label: 'notif-video-uploader', displayName: 'Video Uploader' });
    await subscribeUserToCompetition(subscriber.profile_id, benchmarkCompetition.id, {
      discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [],
    });

    await uploadCompetitionMedia(uploader, { type: 'video', title: `Video upload ${Date.now()}` });

    const notification = await eventually(() =>
      findNotification(
        subscriber.access_token,
        (item) => String(item?.metadata?.action || '') === 'competition_upload' && String(item?.metadata?.media_type || '') === 'video',
      ),
    );

    await openNotificationsAndTap(subscriber.auth_state, String(notification.id));
    await expect(element(by.id('all-videos-events-screen'))).toBeVisible();
  });

  it('notifies uploaders about edit requests and opens the media detail screen', async () => {
    const uploader = await createUser({ label: 'notif-edit-uploader', displayName: 'Edit Uploader' });
    const requester = await createUser({ label: 'notif-edit-requester', displayName: 'Edit Requester' });
    await subscribeUserToCompetition(requester.profile_id, benchmarkCompetition.id, {
      discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [],
    });
    const mediaId = await uploadCompetitionMedia(uploader, { type: 'video', title: `Needs fix ${Date.now()}` });

    await apiPost(`/media/${encodeURIComponent(mediaId)}/edit-requests`, requester.access_token, {
      issue_type: 'wrong_heat',
    });

    const notification = await eventually(() =>
      findNotification(
        uploader.access_token,
        (item) => String(item?.metadata?.action || '') === 'edit_request_received' && String(item?.metadata?.media_id || '') === mediaId,
      ),
    );

    await openNotificationsAndTap(uploader.auth_state, String(notification.id));
    await expect(element(by.id('video-details-screen'))).toBeVisible();
  });

  it('notifies followed profiles and routes to the follower profile', async () => {
    const followed = await createUser({ label: 'notif-followed', displayName: 'Followed Profile' });
    const follower = await createUser({ label: 'notif-follower', displayName: 'Follower Profile' });

    await apiPost(`/profiles/${encodeURIComponent(followed.profile_id)}/follow`, follower.access_token, {});

    const notification = await eventually(() =>
      findNotification(
        followed.access_token,
        (item) => String(item?.metadata?.action || '') === 'followed_you' && String(item?.actor_profile_id || '') === follower.profile_id,
      ),
    );

    await openNotificationsAndTap(followed.auth_state, String(notification.id));
    await expect(element(by.id('view-user-profile-screen'))).toBeVisible();
  });

  it('notifies owners when their media is liked and routes to the liker profile', async () => {
    const owner = await createUser({ label: 'notif-like-owner', displayName: 'Media Owner' });
    const liker = await createUser({ label: 'notif-like-actor', displayName: 'Media Liker' });
    await subscribeUserToCompetition(liker.profile_id, benchmarkCompetition.id, {
      discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [],
    });

    const mediaId = await uploadCompetitionMedia(owner, { type: 'image', title: `Likable media ${Date.now()}` });
    await apiPost(`/media/${encodeURIComponent(mediaId)}/like`, liker.access_token, {});

    const notification = await eventually(() =>
      findNotification(
        owner.access_token,
        (item) => String(item?.metadata?.action || '') === 'media_liked' && String(item?.actor_profile_id || '') === liker.profile_id,
      ),
    );

    await openNotificationsAndTap(owner.auth_state, String(notification.id));
    await expect(element(by.id('view-user-profile-screen'))).toBeVisible();
  });

  it('notifies owners when their blog is liked and routes to the liker profile', async () => {
    const owner = await createUser({ label: 'notif-blog-owner', displayName: 'Blog Owner' });
    const liker = await createUser({ label: 'notif-blog-liker', displayName: 'Blog Liker' });

    const created = await apiPost('/posts', owner.access_token, {
      title: `Blog ${Date.now()}`,
      description: 'Benchmark blog post for notifications.',
    });
    const postId = String(created?.post?.id || '').trim();
    if (!postId) throw new Error(`Missing post id: ${JSON.stringify(created)}`);

    await apiPost(`/posts/${encodeURIComponent(postId)}/like`, liker.access_token, {});

    const notification = await eventually(() =>
      findNotification(
        owner.access_token,
        (item) => String(item?.metadata?.action || '') === 'post_liked' && String(item?.actor_profile_id || '') === liker.profile_id,
      ),
    );

    await openNotificationsAndTap(owner.auth_state, String(notification.id));
    await expect(element(by.id('view-user-profile-screen'))).toBeVisible();
  });

  it('notifies requesters when an edit request is resolved and opens the media detail screen', async () => {
    const uploader = await createUser({ label: 'notif-resolve-uploader', displayName: 'Resolve Uploader' });
    const requester = await createUser({ label: 'notif-resolve-requester', displayName: 'Resolve Requester' });
    await subscribeUserToCompetition(requester.profile_id, benchmarkCompetition.id, {
      discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [],
    });
    const mediaId = await uploadCompetitionMedia(uploader, { type: 'image', title: `Resolve target ${Date.now()}` });
    const createdRequest = await apiPost(`/media/${encodeURIComponent(mediaId)}/edit-requests`, requester.access_token, {
      issue_type: 'wrong_heat',
    });
    const requestId = String(createdRequest?.request?.request_id || createdRequest?.request?.id || '').trim();
    if (!requestId) throw new Error(`Missing request id: ${JSON.stringify(createdRequest)}`);

    await apiPut(`/media/${encodeURIComponent(mediaId)}/edit-requests/${encodeURIComponent(requestId)}`, uploader.access_token, {
      status: 'resolved',
    });

    const notification = await eventually(() =>
      findNotification(
        requester.access_token,
        (item) => String(item?.metadata?.action || '') === 'edit_request_resolved' && String(item?.metadata?.request_id || '') === requestId,
      ),
    );

    await openNotificationsAndTap(requester.auth_state, String(notification.id));
    await expect(element(by.id('photo-detail-screen'))).toBeVisible();
  });

  it('bundles floods of likes, uploads, and edit requests into grouped notifications', async () => {
    const target = await createUser({ label: 'notif-bundle-target', displayName: 'Bundle Target' });
    const uploader = await createUser({ label: 'notif-bundle-uploader', displayName: 'Bundle Uploader' });
    const followerA = await createUser({ label: 'notif-bundle-follower-a', displayName: 'Bundle Follower A' });
    const followerB = await createUser({ label: 'notif-bundle-follower-b', displayName: 'Bundle Follower B' });
    const likerA = await createUser({ label: 'notif-bundle-liker-a', displayName: 'Bundle Liker A' });
    const likerB = await createUser({ label: 'notif-bundle-liker-b', displayName: 'Bundle Liker B' });
    const requesterA = await createUser({ label: 'notif-bundle-requester-a', displayName: 'Bundle Requester A' });
    const requesterB = await createUser({ label: 'notif-bundle-requester-b', displayName: 'Bundle Requester B' });

    await subscribeUserToCompetition(target.profile_id, benchmarkCompetition.id, {
      discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [],
    });
    await Promise.all([
      subscribeUserToCompetition(likerA.profile_id, benchmarkCompetition.id, { discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [] }),
      subscribeUserToCompetition(likerB.profile_id, benchmarkCompetition.id, { discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [] }),
      subscribeUserToCompetition(requesterA.profile_id, benchmarkCompetition.id, { discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [] }),
      subscribeUserToCompetition(requesterB.profile_id, benchmarkCompetition.id, { discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [] }),
      subscribeUserToCompetition(followerA.profile_id, benchmarkCompetition.id, { discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [] }),
      subscribeUserToCompetition(followerB.profile_id, benchmarkCompetition.id, { discipline_ids: benchmarkDiscipline?.id ? [benchmarkDiscipline.id] : [] }),
    ]);

    const mediaA = await uploadCompetitionMedia(target, { type: 'image', title: `Bundle media A ${Date.now()}` });
    const mediaB = await uploadCompetitionMedia(target, { type: 'image', title: `Bundle media B ${Date.now()}` });

    await uploadCompetitionMedia(uploader, { type: 'image', title: `Bundle upload 1 ${Date.now()}` });
    await uploadCompetitionMedia(uploader, { type: 'image', title: `Bundle upload 2 ${Date.now()}` });
    await uploadCompetitionMedia(uploader, { type: 'image', title: `Bundle upload 3 ${Date.now()}` });

    await apiPost(`/media/${encodeURIComponent(mediaA)}/like`, likerA.access_token, {});
    await apiPost(`/media/${encodeURIComponent(mediaB)}/like`, likerB.access_token, {});
    await apiPost(`/media/${encodeURIComponent(mediaA)}/like`, followerA.access_token, {});

    await apiPost(`/media/${encodeURIComponent(mediaA)}/edit-requests`, requesterA.access_token, { issue_type: 'wrong_heat' });
    await apiPost(`/media/${encodeURIComponent(mediaB)}/edit-requests`, requesterB.access_token, { issue_type: 'wrong_heat' });
    await apiPost(`/media/${encodeURIComponent(mediaA)}/edit-requests`, followerB.access_token, { issue_type: 'wrong_heat' });

    const payload = await eventually(() => apiGet('/notifications?limit=100&offset=0&unread_only=true', target.access_token));
    const notifications = Array.isArray(payload?.notifications) ? payload.notifications : [];
    const bundledKinds = notifications
      .filter((item) => Boolean(item?.metadata?.bundled))
      .map((item) => String(item?.metadata?.bundle_kind || ''));

    jestExpect(bundledKinds).toContain('media_liked');
    jestExpect(bundledKinds).toContain('edit_request_received');

    const uploadPayload = await eventually(() => apiGet('/notifications?limit=100&offset=0&unread_only=true', target.access_token));
    const uploadNotifications = Array.isArray(uploadPayload?.notifications) ? uploadPayload.notifications : [];
    const bundledUpload = uploadNotifications.find((item) => Boolean(item?.metadata?.bundled) && String(item?.metadata?.bundle_kind || '') === 'competition_upload');
    if (bundledUpload) {
      await openNotificationsAndTap(target.auth_state, String(bundledUpload.id));
      await expect(element(by.id('all-photos-events-screen'))).toBeVisible();
    }
  });
});
