/* eslint-env jest */
/* global device, element, by, waitFor */
const { launchApp } = require('./helpers/launch');
const { DEFAULT_API_BASE_URL, e2eBootstrap } = require('./helpers/backend');

jest.setTimeout(180000);

describe('Legacy upload category route', () => {
  afterEach(async () => {
    try {
      await device.terminateApp();
    } catch {
      // ignore
    }
  });

  it('redirects to the updated upload competition flow', async () => {
    const seededUser = await e2eBootstrap({
      sub: `auth0|legacy-upload-category-${Date.now()}`,
      user: {
        first_name: 'Legacy',
        last_name: 'Upload',
        username: `legacyupload${Date.now()}`,
      },
      profile: {
        display_name: 'Legacy Upload',
        username: `legacyupload${Date.now()}`,
        selected_events: ['track-field'],
      },
    });

    await launchApp({
      routeName: 'SelectCategory',
      routeParams: { anonymous: false },
      authState: seededUser.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
      deleteApp: true,
    });

    await waitFor(element(by.id('upload-select-competition-screen')))
      .toBeVisible()
      .withTimeout(15000);
  });
});
