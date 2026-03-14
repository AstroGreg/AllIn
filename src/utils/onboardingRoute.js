import { shouldForceAccountCompletion } from './accountCompletion';
const asCategory = (value) => {
    const raw = String(value !== null && value !== void 0 ? value : '').trim().toLowerCase();
    if (raw === 'find' || raw === 'manage' || raw === 'support')
        return raw;
    return '';
};
const hasSelectedEvents = (value) => {
    if (!Array.isArray(value))
        return false;
    return value.some((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim().length > 0);
};
const hasSupportFocuses = (value) => {
    if (!Array.isArray(value))
        return false;
    return value.some((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim().length > 0);
};
const hasRequiredAccountFields = (bootstrap) => {
    var _a;
    const user = (_a = bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.user) !== null && _a !== void 0 ? _a : {};
    const required = [
        user.first_name,
        user.last_name,
        user.username,
        user.nationality,
        user.birthdate,
    ];
    return required.every((value) => String(value !== null && value !== void 0 ? value : '').trim().length > 0);
};
export const resolvePostAuthRoute = (bootstrap, userProfile) => {
    const category = asCategory(userProfile === null || userProfile === void 0 ? void 0 : userProfile.category);
    const selectedEventsPresent = hasSelectedEvents(userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents);
    const supportFocusesPresent = hasSupportFocuses(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportFocuses);
    const needsEventSelection = category === 'support' ? !supportFocusesPresent : !selectedEventsPresent;
    // On cold reopen, bootstrap can fail transiently (network/server startup).
    // In that case, resume from local onboarding progress instead of forcing
    // users back to "Complete your account".
    if (!bootstrap) {
        if (!category)
            return { name: 'CategorySelectionScreen' };
        if (needsEventSelection) {
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
        if (!category)
            return { name: 'CategorySelectionScreen' };
        if (needsEventSelection) {
            return {
                name: 'SelectEventScreen',
                params: { selectedCategory: category },
            };
        }
        return { name: 'BottomTabBar' };
    }
    if (Boolean(bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.has_profiles)) {
        return { name: 'BottomTabBar' };
    }
    if (!category)
        return { name: 'CategorySelectionScreen' };
    if (needsEventSelection) {
        return {
            name: 'SelectEventScreen',
            params: { selectedCategory: category },
        };
    }
    return { name: 'BottomTabBar' };
};
