import {shouldForceAccountCompletion} from '../src/utils/accountCompletion';

describe('shouldForceAccountCompletion', () => {
  test('forces completion when bootstrap is missing', () => {
    expect(shouldForceAccountCompletion(null)).toBe(true);
  });

  test('does not force completion for guest accounts', () => {
    expect(
      shouldForceAccountCompletion({
        user: {
          is_guest: true,
        },
        needs_user_onboarding: true,
      }),
    ).toBe(false);
  });

  test('forces completion when auth placeholders are still present', () => {
    expect(
      shouldForceAccountCompletion({
        user: {
          is_guest: false,
          username: 'auth0|abc123',
          first_name: 'auth0|abc123',
          last_name: 'runner@example.com',
          email: 'runner.auth@allin.local',
          nationality: 'BE',
          birthdate: '1995-04-10',
        },
        needs_user_onboarding: false,
        missing_user_fields: [],
      }),
    ).toBe(true);
  });

  test('forces completion when required fields are flagged missing by bootstrap', () => {
    expect(
      shouldForceAccountCompletion({
        user: {
          is_guest: false,
          username: 'runner',
          first_name: 'Road',
          last_name: 'Runner',
          email: 'runner@example.com',
          nationality: 'BE',
          birthdate: '1995-04-10',
        },
        needs_user_onboarding: false,
        missing_user_fields: ['birthdate'],
      }),
    ).toBe(true);
  });

  test('allows fully completed non-guest accounts through', () => {
    expect(
      shouldForceAccountCompletion({
        user: {
          is_guest: false,
          username: 'road.runner',
          first_name: 'Road',
          last_name: 'Runner',
          email: 'runner@example.com',
          nationality: 'BE',
          birthdate: '1995-04-10',
        },
        needs_user_onboarding: false,
        missing_user_fields: [],
      }),
    ).toBe(false);
  });
});
