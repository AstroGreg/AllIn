/* global device */
const buildAuthState = (overrides = {}) => {
  const baseUserProfile = {
    id: 'profile-e2e',
    username: 'e2euser',
    firstName: 'E2E',
    lastName: 'Runner',
    bio: 'Detox bio',
    category: 'athlete',
    selectedEvents: [],
    mainDisciplines: {},
    chestNumbersByYear: {},
    faceVerified: true,
  };

  const base = {
    enabled: true,
    authenticated: true,
    accessToken: null,
    user: {
      sub: 'auth0|e2e-user',
      name: 'E2E Runner',
      nickname: 'e2euser',
      email: 'e2e@example.com',
      picture: '',
    },
    authBootstrap: {
      status: 'ready',
      has_profiles: true,
      sub: 'auth0|e2e-user',
      profile_id: 'profile-e2e',
      event_ids: [],
    },
    userProfile: baseUserProfile,
  };

  return {
    ...base,
    ...overrides,
    user: {
      ...base.user,
      ...(overrides.user || {}),
    },
    authBootstrap: {
      ...base.authBootstrap,
      ...(overrides.authBootstrap || {}),
    },
    userProfile: {
      ...baseUserProfile,
      ...(overrides.userProfile || {}),
    },
  };
};

const launchApp = async ({
  routeName,
  routeParams = {},
  authState = {},
  apiBaseUrl,
  hlsBaseUrl,
  deleteApp = true,
} = {}) => {
  await device.launchApp({
    newInstance: true,
    delete: deleteApp,
    launchArgs: {
      e2eInitialRouteName: routeName,
      e2eInitialRouteParams: JSON.stringify(routeParams),
      e2eAuthState: JSON.stringify(buildAuthState(authState)),
      ...(apiBaseUrl ? { e2eApiBaseUrl: apiBaseUrl } : {}),
      ...(hlsBaseUrl ? { e2eHlsBaseUrl: hlsBaseUrl } : {}),
    },
  });
};

module.exports = {
  buildAuthState,
  launchApp,
};
