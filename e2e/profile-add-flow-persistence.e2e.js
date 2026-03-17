/* eslint-env jest */
/* global device, element, by, expect, waitFor */
const { expect: jestExpect } = require('@jest/globals');

const { launchApp } = require('./helpers/launch');
const { apiRequest, e2eBootstrap } = require('./helpers/backend');

jest.setTimeout(300000);

const DEFAULT_API_BASE_URL = process.env.E2E_API_BASE_URL || process.env.API_GATEWAY_URL || 'http://127.0.0.1:3000';
const TARGET_ADD_FOCUS = process.env.E2E_ADD_PROFILE_FOCUS || 'road-events';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getSelectedEvents = async (accessToken) => {
  const summary = await apiRequest('/profiles/me/summary', { method: 'GET', accessToken });
  return Array.isArray(summary?.profile?.selected_events)
    ? summary.profile.selected_events.map((entry) => String(entry))
    : [];
};

const completeAthleteCreateFlow = async () => {
  await waitFor(element(by.id('profile-complete-athlete-details-screen')))
    .toBeVisible()
    .withTimeout(30000);

  const authFlowReviewButton = element(by.id('athlete-finish-button'));
  const authFlowCreateButton = element(by.id('athlete-create-profile-button'));
  const runtimeReviewButton = element(by.id('profile-athlete-review-button'));
  const runtimeCreateButton = element(by.id('profile-athlete-save-button'));

  try {
    await waitFor(authFlowReviewButton).toBeVisible().withTimeout(5000);
    await authFlowReviewButton.tap();
    await waitFor(authFlowCreateButton).toBeVisible().withTimeout(10000);
    await authFlowCreateButton.tap();
    return;
  } catch {
    // Fall through to runtime screen IDs
  }

  await waitFor(runtimeReviewButton).toBeVisible().withTimeout(5000);
  await runtimeReviewButton.tap();
  await waitFor(runtimeCreateButton).toBeVisible().withTimeout(10000);
  await runtimeCreateButton.tap();
};

describe('Profile add flow persistence', () => {
  afterEach(async () => {
    try {
      await device.terminateApp();
    } catch {
      // ignore
    }
  });

  it('persists the newly added athlete focus in backend summary', async () => {
    const stamp = `${Date.now()}`;
    const username = `addfocus${stamp.slice(-8)}`;

    const seededUser = await e2eBootstrap({
      sub: `auth0|profile-add-persist-${stamp}`,
      email: `${username}@spotme.local`,
      user: {
        first_name: 'Add',
        last_name: 'Focus',
        username,
      },
      profile: {
        username,
        display_name: 'Add Focus',
        category: 'Athlete',
        selected_events: ['track-field'],
        face_verified: true,
      },
    });

    const beforeEvents = await getSelectedEvents(seededUser.access_token);
    jestExpect(beforeEvents).toContain('track-field');
    jestExpect(beforeEvents).not.toContain(TARGET_ADD_FOCUS);

    await launchApp({
      routeName: 'CategorySelectionScreen',
      routeParams: { fromAddFlow: true },
      authState: seededUser.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
      deleteApp: true,
    });

    await waitFor(element(by.id('category-selection-screen')))
      .toBeVisible()
      .withTimeout(30000);
    await element(by.id('category-option-find')).tap();
    await element(by.id('category-continue-button')).tap();

    await waitFor(element(by.id('select-event-screen')))
      .toBeVisible()
      .withTimeout(30000);
    await waitFor(element(by.id(`focus-card-${TARGET_ADD_FOCUS}`)))
      .toBeVisible()
      .withTimeout(30000);
    await element(by.id(`focus-card-${TARGET_ADD_FOCUS}`)).tap();
    await element(by.id('select-event-next-button')).tap();

    await completeAthleteCreateFlow();

    await waitFor(element(by.id('user-profile-screen')))
      .toBeVisible()
      .withTimeout(45000);

    let afterEvents = [];
    for (let attempt = 0; attempt < 12; attempt += 1) {
      // eslint-disable-next-line no-await-in-loop
      afterEvents = await getSelectedEvents(seededUser.access_token);
      if (afterEvents.includes(TARGET_ADD_FOCUS)) break;
      // eslint-disable-next-line no-await-in-loop
      await sleep(1000);
    }

    jestExpect(afterEvents).toContain('track-field');
    jestExpect(afterEvents).toContain(TARGET_ADD_FOCUS);
    jestExpect(afterEvents.filter((entry) => entry === TARGET_ADD_FOCUS)).toHaveLength(1);
  });
});
