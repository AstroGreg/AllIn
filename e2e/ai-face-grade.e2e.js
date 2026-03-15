/* eslint-env jest */
/* global device, element, by, waitFor */
const { launchApp } = require('./helpers/launch');
const { DEFAULT_API_BASE_URL, e2eBootstrap, getCatalog } = require('./helpers/backend');

jest.setTimeout(240000);

let catalog;
let competition;

beforeAll(async () => {
  catalog = await getCatalog();
  competition =
    catalog.competitions.find((entry) => String(entry.event_type || '').toLowerCase() === 'track-field')
    || catalog.competitions[0];
  if (!competition) {
    throw new Error('Missing seeded competition');
  }
});

describe('AI face grades', () => {
  afterEach(async () => {
    try {
      await device.terminateApp();
    } catch {
      // ignore
    }
  });

  it('shows hard, medium, and soft face grades on the main AI face search screen', async () => {
    const seededUser = await e2eBootstrap({
      sub: `auth0|ai-face-grade-${Date.now()}`,
      user: {
        first_name: 'Main',
        last_name: 'AI',
        username: `mainai${Date.now()}`,
      },
      profile: {
        display_name: 'Main AI',
        username: `mainai${Date.now()}`,
        selected_events: ['track-field'],
      },
    });

    await launchApp({
      routeName: 'AISearchScreen',
      routeParams: {
        preselectedEvents: [
          {
            id: competition.id,
            name: competition.name,
          },
        ],
      },
      authState: seededUser.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
      deleteApp: true,
    });

    await waitFor(element(by.id('ai-search-screen')))
      .toBeVisible()
      .withTimeout(15000);
    await waitFor(element(by.id('ai-search-screen-idle-ready')))
      .toBeVisible()
      .withTimeout(15000);

    await expect(element(by.id('ai-search-face-grade-hard'))).toBeVisible();
    await expect(element(by.id('ai-search-face-grade-medium'))).toBeVisible();
    await expect(element(by.id('ai-search-face-grade-soft'))).toBeVisible();
  });
});
