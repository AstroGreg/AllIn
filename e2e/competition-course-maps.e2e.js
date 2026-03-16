/* eslint-env jest */
/* global device, element, by, waitFor, expect */
const { launchApp } = require('./helpers/launch');
const { DEFAULT_API_BASE_URL, e2eBootstrap, e2eMutation, getCatalog } = require('./helpers/backend');

jest.setTimeout(240000);

let catalog;
let competition;
let discipline;

beforeAll(async () => {
  catalog = await getCatalog();
  competition =
    catalog.competitions.find((entry) => String(entry.event_type || '').toLowerCase() === 'cycling')
    || catalog.competitions.find((entry) => String(entry.event_type || '').toLowerCase() === 'road')
    || catalog.competitions[0];
  if (!competition) throw new Error('Missing seeded competition');
  discipline = catalog.disciplines.find((entry) => entry.competition_id === competition.id) || catalog.disciplines[0];
  if (!discipline) throw new Error('Missing seeded discipline');
});

afterEach(async () => {
  try {
    await device.terminateApp();
  } catch {
    // ignore
  }
  try {
    await device.enableSynchronization();
  } catch {
    // ignore
  }
});

describe('Competition course maps', () => {
  it('shows the course map layout for seeded non-track competitions', async () => {
    const seededUser = await e2eBootstrap({
      sub: `auth0|competition-course-map-${Date.now()}`,
      user: {
        first_name: 'Course',
        last_name: 'Map',
        username: `coursemap${Date.now()}`,
      },
      profile: {
        display_name: 'Course Map',
        username: `coursemap${Date.now()}`,
        selected_events: [competition.event_type || 'cycling'],
      },
    });

    await e2eMutation('competition-maps', {
      event_id: competition.id,
      competition_id: discipline.id,
      name: 'E2E Cycling Loop',
      checkpoints: [
        { checkpoint_index: 1, label: 'Start' },
        { checkpoint_index: 2, label: 'Bridge' },
        { checkpoint_index: 3, label: 'Finish' },
      ],
    });

    await launchApp({
      routeName: 'CompetitionDetailsScreen',
      routeParams: {
        name: competition.name,
        eventId: competition.id,
        competitionId: competition.id,
        competitionFocus: competition.competition_focus || competition.event_type || 'cycling',
        competitionType: competition.event_type || 'cycling',
        location: competition.location || '',
        date: competition.date || '',
        organizingClub: competition.organizing_club || competition.organizingClub || '',
      },
      authState: seededUser.auth_state,
      apiBaseUrl: DEFAULT_API_BASE_URL,
      deleteApp: true,
      launchArgs: {
        detoxEnableSynchronization: 0,
      },
    });

    await waitFor(element(by.id('competition-details-screen')))
      .toBeVisible()
      .withTimeout(30000);
    await waitFor(element(by.text('Course map')))
      .toBeVisible()
      .whileElement(by.id('competition-details-scroll'))
      .scroll(260, 'down')
      .withTimeout(30000);
    await waitFor(element(by.text('Checkpoints')))
      .toBeVisible()
      .whileElement(by.id('competition-details-scroll'))
      .scroll(160, 'down')
      .withTimeout(30000);
    await expect(element(by.text('No events available yet.'))).not.toBeVisible();
  });
});
