type ScreenParams = Record<string, unknown> | undefined;

function buildBottomTabProfileState(screen: string, params?: ScreenParams) {
  return {
    index: 0,
    routes: [
      {
        name: 'BottomTabBar',
        state: {
          index: 3,
          routes: [
            { name: 'Home' },
            { name: 'Search' },
            { name: 'Upload' },
            {
              name: 'Profile',
              state: {
                index: 0,
                routes: [{ name: screen, params }],
              },
            },
            { name: 'Menu' },
          ],
        },
      },
    ],
  };
}

export function buildBottomTabUserProfileReset(params?: ScreenParams) {
  return buildBottomTabProfileState('UserProfileScreen', params);
}

export function buildBottomTabGroupProfileReset(groupId: string, params?: ScreenParams) {
  return buildBottomTabProfileState('GroupProfileScreen', {
    groupId,
    ...(params ?? {}),
  });
}
