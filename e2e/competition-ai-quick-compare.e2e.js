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

describe('Competition AI quick compare', () => {
  afterEach(async () => {
    try {
      await device.terminateApp();
    } catch {
      // ignore
    }
  });

  it('shows hard, medium, and soft face grades in quick compare', async () => {
    const seededUser = await e2eBootstrap({
      sub: `auth0|competition-ai-grade-${Date.now()}`,
      user: {
        first_name: 'AI',
        last_name: 'Grade',
        username: `aigrade${Date.now()}`,
      },
      profile: {
        display_name: 'AI Grade',
        username: `aigrade${Date.now()}`,
        selected_events: ['track-field'],
      },
    });

    await launchApp({
      routeName: 'CompetitionDetailsScreen',
      routeParams: {
        name: competition.name,
        eventId: competition.id,
        competitionId: competition.id,
        competitionFocus: competition.competition_focus || competition.event_type || 'track-field',
        competitionType: competition.event_type === 'road-events' ? 'road' : 'track',
        location: competition.location || '',
        date: competition.date || '',
        organizingClub: competition.organizing_club || competition.organizingClub || '',
      },
      authState: seededUser.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
      deleteApp: true,
    });

    await waitFor(element(by.id('competition-details-screen')))
      .toBeVisible()
      .withTimeout(15000);
    await waitFor(element(by.id('competition-ai-quick-open')))
      .toBeVisible()
      .withTimeout(15000);

    await element(by.id('competition-ai-quick-open')).tap();

    await waitFor(element(by.id('competition-ai-quick-modal')))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.id('competition-ai-quick-grade-hard'))).toBeVisible();
    await expect(element(by.id('competition-ai-quick-grade-medium'))).toBeVisible();
    await expect(element(by.id('competition-ai-quick-grade-soft'))).toBeVisible();
  });
});
