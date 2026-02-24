import { shouldForceAccountCompletion } from './accountCompletion';

type RouteTarget = {
  name: string;
  params?: Record<string, any>;
};

const asCategory = (value: any): 'find' | 'manage' | '' => {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === 'find' || raw === 'manage') return raw;
  return '';
};

const hasSelectedEvents = (value: any): boolean => {
  if (!Array.isArray(value)) return false;
  return value.some((entry) => String(entry ?? '').trim().length > 0);
};

const hasRequiredAccountFields = (bootstrap: any): boolean => {
  const user = bootstrap?.user ?? {};
  const required = [
    user.first_name,
    user.last_name,
    user.username,
    user.nationality,
    user.birthdate,
  ];
  return required.every((value) => String(value ?? '').trim().length > 0);
};

export const resolvePostAuthRoute = (
  bootstrap: any,
  userProfile: any,
): RouteTarget => {
  const category = asCategory(userProfile?.category);
  const selectedEventsPresent = hasSelectedEvents(userProfile?.selectedEvents);

  // On cold reopen, bootstrap can fail transiently (network/server startup).
  // In that case, resume from local onboarding progress instead of forcing
  // users back to "Complete your account".
  if (!bootstrap) {
    if (!category) return { name: 'CategorySelectionScreen' };
    if (!selectedEventsPresent) {
      return {
        name: 'SelectEventScreen',
        params: { selectedCategory: category },
      };
    }
    return { name: 'BottomTabBar' };
  }

  // Explicit business rule:
  // Go straight to home only when required account fields are present.
  if (hasRequiredAccountFields(bootstrap)) {
    return { name: 'BottomTabBar' };
  }

  if (shouldForceAccountCompletion(bootstrap)) {
    // Do not regress users back to account setup if they already progressed
    // further in local onboarding flow.
    if (!category && !selectedEventsPresent) {
      return { name: 'CreateProfileScreen' };
    }
    if (!category) return { name: 'CategorySelectionScreen' };
    if (!selectedEventsPresent) {
      return {
        name: 'SelectEventScreen',
        params: { selectedCategory: category },
      };
    }
    return { name: 'BottomTabBar' };
  }

  if (Boolean(bootstrap?.has_profiles)) {
    return { name: 'BottomTabBar' };
  }

  if (!category) return { name: 'CategorySelectionScreen' };

  if (!selectedEventsPresent) {
    return {
      name: 'SelectEventScreen',
      params: { selectedCategory: category },
    };
  }

  return { name: 'BottomTabBar' };
};
