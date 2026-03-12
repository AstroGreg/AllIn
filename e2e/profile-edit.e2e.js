/* eslint-env jest */
/* global device, element, by, expect */
const { launchApp } = require('./helpers/launch');

describe('Profile editing', () => {
  it('edits the bio from the profile screen', async () => {
    await launchApp({
      routeName: 'UserProfileScreen',
      authState: {
        userProfile: {
          selectedEvents: ['track-field'],
          firstName: 'Edit',
          lastName: 'Tester',
          username: 'edituser',
          bio: 'Old bio',
          category: 'athlete',
          faceVerified: true,
        },
      },
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
