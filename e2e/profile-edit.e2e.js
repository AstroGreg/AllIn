/* eslint-env jest */
/* global device, element, by, expect */
const { launchApp } = require('./helpers/launch');
const { e2eBootstrap, DEFAULT_API_BASE_URL } = require('./helpers/backend');

describe('Profile editing', () => {
  it('edits the bio from the profile screen', async () => {
    const tag = `${Date.now()}`;
    const username = `edituser${tag.slice(-6)}`;
    const seeded = await e2eBootstrap({
      sub: `auth0|e2e-profile-edit-${tag}`,
      email: `profile-edit-${tag}@spotme.local`,
      user: {
        first_name: 'Edit',
        last_name: 'Tester',
        username,
      },
      profile: {
        username,
        display_name: 'Edit Tester',
        bio: 'Old bio',
        selected_events: ['track-field'],
        face_verified: true,
      },
    });

    await launchApp({
      routeName: 'UserProfileScreen',
      authState: seeded.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
    });

    await expect(element(by.id('user-profile-screen'))).toBeVisible();
    await element(by.id('profile-edit-bio-button')).tap();
    await expect(element(by.id('edit-bio-screen'))).toBeVisible();
    await element(by.id('edit-bio-input')).replaceText('Updated detox bio');
    await element(by.id('edit-bio-save')).tap();

    await expect(element(by.id('user-profile-screen'))).toBeVisible();
    await expect(element(by.text('Updated detox bio'))).toBeVisible();
  });
});
