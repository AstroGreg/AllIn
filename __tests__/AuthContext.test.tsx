import React, {useEffect} from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';

const mockStorage = new Map<string, string>();
const mockGetAuthBootstrap = jest.fn();
const mockUpdateUserMe = jest.fn();
const mockUserInfo = jest.fn();

jest.mock('../src/constants/AppConfig', () => ({
  AppConfig: {
    AUTH0_DOMAIN: 'tenant.auth0.com',
    AUTH0_CLIENT_ID: 'client-id',
    AUTH0_AUDIENCE: 'https://api.allin.test',
    AUTH0_REDIRECT_URI: 'allin://callback',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      mockStorage.delete(key);
    }),
  },
}));

jest.mock('../src/services/apiGateway', () => ({
  getAuthBootstrap: (...args: any[]) => mockGetAuthBootstrap(...args),
  updateUserMe: (...args: any[]) => mockUpdateUserMe(...args),
}));

jest.mock('react-native-auth0', () =>
  jest.fn().mockImplementation(() => ({
    auth: {
      userInfo: mockUserInfo,
    },
    webAuth: {
      authorize: jest.fn(),
    },
  })),
);

const {AuthProvider, useAuth} = require('../src/context/AuthContext');

const AUTH_STORAGE_KEY = '@auth_credentials';
const PROFILE_STORAGE_KEY = '@user_profile';

function flushEffects() {
  return act(async () => {
    await new Promise((resolve) => setImmediate(resolve));
  });
}

type AuthSnapshot = {
  accessToken: string | null;
  authBootstrap: any;
  error: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  userProfile: any;
  updateUserAccount: (input: any) => Promise<any>;
};

function ContextProbe({onChange}: {onChange: (value: AuthSnapshot) => void}) {
  const auth = useAuth();

  useEffect(() => {
    onChange(auth);
  }, [auth, onChange]);

  return null;
}

describe('AuthProvider bootstrap', () => {
  let latestAuth: AuthSnapshot | null = null;

  beforeEach(() => {
    latestAuth = null;
    mockStorage.clear();
    mockGetAuthBootstrap.mockReset();
    mockUpdateUserMe.mockReset();
    mockUserInfo.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  test('restores a stored session, fetches bootstrap, and syncs profile fields locally', async () => {
    mockStorage.set(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        accessToken: 'stored-token',
      }),
    );
    mockUserInfo.mockResolvedValue({
      sub: 'auth0|runner-1',
      email: 'runner@example.com',
    });
    mockGetAuthBootstrap.mockResolvedValue({
      ok: true,
      sub: 'auth0|runner-1',
      profile_id: 'profile-1',
      has_profiles: true,
      profiles_count: 1,
      needs_user_onboarding: false,
      missing_user_fields: [],
      user: {
        username: 'road.runner',
        first_name: 'Road',
        last_name: 'Runner',
        nationality: 'BE',
        birthdate: '1995-04-10T00:00:00.000Z',
      },
    });

    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <ContextProbe onChange={(value) => {
            latestAuth = value;
          }} />
        </AuthProvider>,
      );
    });
    await flushEffects();
    await flushEffects();

    expect(mockGetAuthBootstrap).toHaveBeenCalledWith('stored-token');
    expect(latestAuth?.isLoading).toBe(false);
    expect(latestAuth?.isAuthenticated).toBe(true);
    expect(latestAuth?.accessToken).toBe('stored-token');
    expect(latestAuth?.authBootstrap?.profile_id).toBe('profile-1');
    expect(latestAuth?.userProfile).toEqual(
      expect.objectContaining({
        username: 'road.runner',
        firstName: 'Road',
        lastName: 'Runner',
        nationality: 'BE',
        birthDate: '1995-04-10',
      }),
    );

    const storedProfile = JSON.parse(mockStorage.get(PROFILE_STORAGE_KEY) ?? '{}');
    expect(storedProfile).toEqual(
      expect.objectContaining({
        username: 'road.runner',
        firstName: 'Road',
        lastName: 'Runner',
        nationality: 'BE',
        birthDate: '1995-04-10',
      }),
    );
  });

  test('keeps the session active when bootstrap fails transiently', async () => {
    mockStorage.set(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        accessToken: 'stored-token',
      }),
    );
    mockStorage.set(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        category: 'find',
        selectedEvents: ['evt-1'],
      }),
    );
    mockUserInfo.mockResolvedValue({
      sub: 'auth0|runner-1',
    });
    mockGetAuthBootstrap.mockRejectedValue(new Error('gateway unavailable'));

    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <ContextProbe onChange={(value) => {
            latestAuth = value;
          }} />
        </AuthProvider>,
      );
    });
    await flushEffects();
    await flushEffects();

    expect(latestAuth?.isLoading).toBe(false);
    expect(latestAuth?.isAuthenticated).toBe(true);
    expect(latestAuth?.authBootstrap).toBeNull();
    expect(latestAuth?.userProfile).toEqual(
      expect.objectContaining({
        category: 'find',
        selectedEvents: ['evt-1'],
      }),
    );
  });

  test('updateUserAccount refreshes bootstrap and re-syncs the local profile', async () => {
    mockStorage.set(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        accessToken: 'stored-token',
      }),
    );
    mockUserInfo.mockResolvedValue({
      sub: 'auth0|runner-1',
    });
    mockGetAuthBootstrap
      .mockResolvedValueOnce({
        ok: true,
        sub: 'auth0|runner-1',
        profile_id: 'profile-1',
        has_profiles: true,
        profiles_count: 1,
        needs_user_onboarding: true,
        missing_user_fields: ['username'],
        user: {
          username: null,
          first_name: 'Road',
          last_name: 'Runner',
          nationality: 'BE',
          birthdate: '1995-04-10',
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        sub: 'auth0|runner-1',
        profile_id: 'profile-1',
        has_profiles: true,
        profiles_count: 1,
        needs_user_onboarding: false,
        missing_user_fields: [],
        user: {
          username: 'updated.runner',
          first_name: 'Road',
          last_name: 'Runner',
          nationality: 'BE',
          birthdate: '1995-04-10',
        },
      });
    mockUpdateUserMe.mockResolvedValue({
      ok: true,
    });

    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <ContextProbe onChange={(value) => {
            latestAuth = value;
          }} />
        </AuthProvider>,
      );
    });
    await flushEffects();
    await flushEffects();

    await act(async () => {
      await latestAuth?.updateUserAccount({
        username: 'updated.runner',
      });
    });
    await flushEffects();

    expect(mockUpdateUserMe).toHaveBeenCalledWith('stored-token', {
      username: 'updated.runner',
    });
    expect(mockGetAuthBootstrap).toHaveBeenCalledTimes(2);
    expect(latestAuth?.authBootstrap).toEqual(
      expect.objectContaining({
        needs_user_onboarding: false,
      }),
    );
    expect(latestAuth?.userProfile).toEqual(
      expect.objectContaining({
        username: 'updated.runner',
      }),
    );
  });
});
