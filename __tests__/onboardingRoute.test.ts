import {resolvePostAuthRoute} from '../src/utils/onboardingRoute';

describe('resolvePostAuthRoute', () => {
  test('sends users without local progress to category selection when bootstrap is unavailable', () => {
    expect(resolvePostAuthRoute(null, null)).toEqual({
      name: 'CategorySelectionScreen',
    });
  });

  test('resumes event selection when local onboarding already has a category', () => {
    expect(
      resolvePostAuthRoute(null, {
        category: 'find',
        selectedEvents: [],
      }),
    ).toEqual({
      name: 'SelectEventScreen',
      params: {selectedCategory: 'find'},
    });
  });

  test('goes straight to the app when bootstrap account fields are complete', () => {
    expect(
      resolvePostAuthRoute(
        {
          user: {
            first_name: 'Road',
            last_name: 'Runner',
            username: 'road.runner',
            nationality: 'BE',
            birthdate: '1995-04-10',
          },
          has_profiles: true,
        },
        {
          category: '',
          selectedEvents: [],
        },
      ),
    ).toEqual({
      name: 'BottomTabBar',
    });
  });

  test('does not regress progressed users back to account setup when bootstrap still needs completion', () => {
    expect(
      resolvePostAuthRoute(
        {
          user: {
            first_name: '',
            last_name: '',
            username: '',
            nationality: '',
            birthdate: '',
          },
          needs_user_onboarding: true,
          missing_user_fields: ['first_name', 'last_name'],
        },
        {
          category: 'manage',
          selectedEvents: ['evt-1'],
        },
      ),
    ).toEqual({
      name: 'BottomTabBar',
    });
  });

  test('forces event selection for find/manage users who have not selected any events yet', () => {
    expect(
      resolvePostAuthRoute(
        {
          user: {
            first_name: '',
            last_name: '',
            username: '',
            nationality: '',
            birthdate: '',
          },
          needs_user_onboarding: true,
          missing_user_fields: ['username'],
        },
        {
          category: 'manage',
          selectedEvents: [],
        },
      ),
    ).toEqual({
      name: 'SelectEventScreen',
      params: {selectedCategory: 'manage'},
    });
  });
});
