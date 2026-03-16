/* eslint-env jest */
/* global device, element, by, waitFor, expect */
const { launchApp } = require('./helpers/launch');
const { DEFAULT_API_BASE_URL, e2eBootstrap } = require('./helpers/backend');

jest.setTimeout(240000);

let seededUser;

beforeAll(async () => {
  const salt = Date.now();
  seededUser = await e2eBootstrap({
    sub: `auth0|manage-profiles-${salt}`,
    user: {
      first_name: 'Manage',
      last_name: 'Profiles',
      username: `manageprofiles${salt}`,
    },
    profile: {
      display_name: 'Manage Profiles',
      username: `manageprofiles${salt}`,
      selected_events: ['track-field'],
    },
  });
});

afterEach(async () => {
  try {
    await device.terminateApp();
  } catch {
    // ignore
  }
});

async function launchManageProfiles() {
  await launchApp({
    routeName: 'ManageProfiles',
    authState: seededUser.auth_state,
    apiBaseUrl: DEFAULT_API_BASE_URL,
    deleteApp: true,
    launchArgs: {
      detoxEnableSynchronization: 0,
    },
  });

  await waitFor(element(by.id('manage-profiles-screen')))
    .toBeVisible()
    .withTimeout(30000);
}

describe('Manage profiles add flows', () => {
  it('opens focus selection directly for athlete profiles', async () => {
    await launchManageProfiles();

    await waitFor(element(by.id('manage-profiles-add-athlete')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('manage-profiles-add-athlete')).tap();

    await waitFor(element(by.id('select-event-screen')))
      .toBeVisible()
      .withTimeout(30000);
    await expect(element(by.id('category-selection-screen'))).not.toBeVisible();
  });

  it('opens focus selection directly for support profiles', async () => {
    await launchManageProfiles();

    await waitFor(element(by.id('manage-profiles-add-support')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('manage-profiles-add-support')).tap();

    await waitFor(element(by.id('select-event-screen')))
      .toBeVisible()
      .withTimeout(30000);
    await expect(element(by.id('category-selection-screen'))).not.toBeVisible();
  });

  it('opens focus selection directly for group profiles', async () => {
    await launchManageProfiles();

    await waitFor(element(by.id('manage-profiles-add-group')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('manage-profiles-add-group')).tap();

    await waitFor(element(by.id('select-event-screen')))
      .toBeVisible()
      .withTimeout(30000);
    await expect(element(by.id('category-selection-screen'))).not.toBeVisible();
  });
});
