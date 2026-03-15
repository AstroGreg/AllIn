const REQUIRED_USER_FIELDS = [
    'username',
    'first_name',
    'last_name',
    'email',
    'nationality',
    'birthdate',
];
const PLACEHOLDER_VALUES = new Set(['auth0', 'unknown', 'n/a', 'na', 'null', 'undefined']);
const asText = (value) => (value == null ? '' : String(value).trim());
const normalize = (value) => asText(value).replace(/\s+/g, ' ').trim();
const looksLikeAuthSubject = (value) => {
    const v = normalize(value).toLowerCase();
    if (!v)
        return false;
    return (v.startsWith('google-oauth2|') ||
        v.startsWith('auth0|') ||
        v.startsWith('apple|') ||
        v.includes('|'));
};
const looksPlaceholderName = (value) => {
    const v = normalize(value).toLowerCase();
    if (!v)
        return true;
    if (PLACEHOLDER_VALUES.has(v))
        return true;
    if (looksLikeAuthSubject(v))
        return true;
    if (v.includes('@'))
        return true;
    const compact = v.replace(/[^a-z0-9]/g, '');
    if (!compact)
        return true;
    if (compact.length >= 12 && /^[a-z0-9]+$/.test(compact) && !/[aeiou]/.test(compact))
        return true;
    return false;
};
const looksInvalidUsername = (value) => {
    const v = normalize(value);
    if (!v)
        return true;
    if (looksLikeAuthSubject(v))
        return true;
    if (v.includes('@'))
        return true;
    const cleaned = v.replace(/[^a-z0-9._-]/gi, '');
    return cleaned.length < 2;
};
const looksInvalidEmail = (value) => {
    const v = normalize(value);
    if (!v)
        return true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        return true;
    if (v.toLowerCase().endsWith('.auth@allin.local'))
        return true;
    return false;
};
const looksInvalidBirthdate = (value) => {
    const v = asText(value);
    if (!v)
        return true;
    if (!/^\d{4}-\d{2}-\d{2}/.test(v))
        return true;
    const dt = new Date(v);
    if (Number.isNaN(dt.getTime()))
        return true;
    const year = dt.getUTCFullYear();
    const nowYear = new Date().getUTCFullYear();
    return year < 1900 || year > nowYear - 5;
};
export const shouldForceAccountCompletion = (bootstrap) => {
    var _a, _b;
    if (!bootstrap)
        return true;
    const isGuest = Boolean((_a = bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.user) === null || _a === void 0 ? void 0 : _a.is_guest);
    if (isGuest)
        return false;
    if (Boolean(bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.needs_user_onboarding)) {
        return true;
    }
    const missingFields = new Set((Array.isArray(bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.missing_user_fields) ? bootstrap.missing_user_fields : []).map((v) => String(v !== null && v !== void 0 ? v : '').trim().toLowerCase()));
    if (REQUIRED_USER_FIELDS.some((field) => missingFields.has(field))) {
        return true;
    }
    const user = (_b = bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.user) !== null && _b !== void 0 ? _b : {};
    if (looksInvalidUsername(user.username))
        return true;
    if (looksPlaceholderName(user.first_name))
        return true;
    if (looksPlaceholderName(user.last_name))
        return true;
    if (looksInvalidEmail(user.email))
        return true;
    if (!normalize(user.nationality))
        return true;
    if (looksInvalidBirthdate(user.birthdate))
        return true;
    return false;
};
