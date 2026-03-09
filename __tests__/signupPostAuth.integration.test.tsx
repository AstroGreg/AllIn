import {resolvePostAuthRoute} from '../src/utils/onboardingRoute';

describe('signup post-auth integration contract', () => {
  test('routes fresh signup to onboarding when required account fields are missing', () => {
    const route = resolvePostAuthRoute(
      {
        user: {
          first_name: '',
          last_name: '',
          username: '',
          nationality: '',
          birthdate: '',
        },
        needs_user_onboarding: true,
        missing_user_fields: ['first_name', 'last_name', 'username', 'nationality', 'birthdate'],
      },
      null,
    );

    expect(route).toEqual({name: 'CreateProfileScreen'});
  });

  test('routes signup to home when required account fields are complete', () => {
    const route = resolvePostAuthRoute(
      {
        user: {
          first_name: 'Road',
          last_name: 'Runner',
          username: 'road.runner',
          nationality: 'BE',
          birthdate: '1995-04-10',
        },
      },
      null,
    );

    expect(route).toEqual({name: 'BottomTabBar'});
  });
});
