jest.mock('../src/constants/RuntimeConfig', () => ({
  getApiBaseUrl: () => 'https://api.allin.test',
}));

import {
  ApiError,
  apiRequest,
  getGroupAssignedEvents,
  getWorkerHealth,
  searchGroups,
  updateProfileSummary,
} from '../src/services/apiGateway';

type MockResponse = {
  ok: boolean;
  status: number;
  statusText?: string;
  text: () => Promise<string>;
};

describe('apiGateway service layer', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('apiRequest sends JSON requests with bearer auth', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ok: true}),
    } as MockResponse);

    await expect(
      apiRequest('/users/me', {
        method: 'PUT',
        accessToken: 'token-123',
        body: {first_name: 'Road'},
      }),
    ).resolves.toEqual({ok: true});

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.allin.test/users/me',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({first_name: 'Road'}),
      }),
    );
  });

  test('apiRequest throws ApiError with backend details on HTTP failures', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 409,
      statusText: 'Conflict',
      text: async () =>
        JSON.stringify({
          error: 'username_taken',
          details: 'This username is already in use.',
        }),
    } as MockResponse);

    await expect(
      apiRequest('/users/me', {
        method: 'PUT',
        accessToken: 'token-123',
        body: {username: 'runner'},
      }),
    ).rejects.toEqual(
      expect.objectContaining<ApiError>({
        status: 409,
        message: 'username_taken',
        body: {
          error: 'username_taken',
          details: 'This username is already in use.',
        },
      }),
    );
  });

  test('searchGroups builds a query string from public params', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ok: true, count: 0, groups: []}),
    } as MockResponse);

    await searchGroups('token-123', {q: 'road', limit: 5, offset: 10});

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.allin.test/groups/search?q=road&limit=5&offset=10',
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  test('updateProfileSummary maps camelCase profile fields to API snake_case fields', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ok: true, profile_id: 'p1', profile: {}, posts_count: 0, followers_count: 0}),
    } as MockResponse);

    await updateProfileSummary('token-123', {
      chestNumbersByYear: {2025: 77},
      trackFieldClub: 'Fast Club',
      trackFieldMainEvent: '100m',
      roadTrailMainEvent: '10k',
      documentUploaded: true,
      faceVerified: false,
      bio: 'Runner',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.allin.test/profiles/me',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          display_name: undefined,
          bio: 'Runner',
          website: undefined,
          avatar_url: undefined,
          avatar_media_id: undefined,
          chest_numbers_by_year: {2025: 77},
          track_field_club: 'Fast Club',
          track_field_main_event: '100m',
          road_trail_main_event: '10k',
          document_uploaded: true,
          face_verified: false,
        }),
      }),
    );
  });

  test('getGroupAssignedEvents normalizes backend competition rows into frontend events', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          ok: true,
          count: 1,
          competitions: [
            {
              competition_id: 'comp-1',
              competition_name: 'Spring Run',
              competition_location: 'Ghent',
              competition_date: '2026-04-10',
              club_name: 'City Runners',
              assigned_athletes_count: 3,
            },
          ],
        }),
    } as MockResponse);

    await expect(getGroupAssignedEvents('token-123', 'group-1')).resolves.toEqual({
      ok: true,
      count: 1,
      events: [
        {
          event_id: 'comp-1',
          competition_id: 'comp-1',
          event_name: 'Spring Run',
          event_location: 'Ghent',
          event_date: '2026-04-10',
          competition_name: 'Spring Run',
          competition_location: 'Ghent',
          competition_date: '2026-04-10',
          organizing_club: 'City Runners',
          assigned_athletes_count: 3,
        },
      ],
    });
  });

  test('getWorkerHealth returns worker payload even when backend responds 503', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      text: async () =>
        JSON.stringify({
          ok: false,
          workers: {
            media: {ok: false, reason: 'stale'},
            ai: {ok: true},
            search: {ok: true},
            notifications: {ok: true},
            face: {ok: true, mode: 'local_fallback'},
          },
        }),
    } as MockResponse);

    await expect(getWorkerHealth('token-123')).resolves.toEqual({
      ok: false,
      workers: {
        media: {ok: false, reason: 'stale'},
        ai: {ok: true},
        search: {ok: true},
        notifications: {ok: true},
        face: {ok: true, mode: 'local_fallback'},
      },
    });
  });
});
