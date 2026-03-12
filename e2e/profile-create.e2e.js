/* eslint-env jest */
/* global device, element, by, expect */
const { launchApp } = require('./helpers/launch');

describe('Profile creation', () => {
  it('creates an athlete profile through the review step', async () => {
    await launchApp({
      routeName: 'CategorySelectionScreen',
      routeParams: { fromAddFlow: true },
      authState: {
        authBootstrap: { status: 'needs_onboarding', has_profiles: false },
        userProfile: {
          selectedEvents: [],
          category: null,
          bio: '',
        },
      },
    });

    await expect(element(by.id('category-selection-screen'))).toBeVisible();
    await element(by.id('category-option-find')).tap();
    await element(by.id('category-continue-button')).tap();

    await expect(element(by.id('select-event-screen'))).toBeVisible();
    await element(by.id('focus-card-track-field')).tap();
    await element(by.id('select-event-next-button')).tap();

    await expect(element(by.id('complete-athlete-details-screen'))).toBeVisible();
    await element(by.id('athlete-finish-button')).tap();
    await expect(element(by.id('athlete-review-card'))).toBeVisible();
    await element(by.id('athlete-create-profile-button')).tap();

    await expect(element(by.id('user-profile-screen'))).toBeVisible();
  });
});
