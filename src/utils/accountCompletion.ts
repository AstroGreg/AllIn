const REQUIRED_USER_FIELDS = [
  'username',
  'first_name',
  'last_name',
  'email',
  'nationality',
  'birthdate',
] as const;

const PLACEHOLDER_VALUES = new Set(['auth0', 'unknown', 'n/a', 'na', 'null', 'undefined']);

const asText = (value: any) => (value == null ? '' : String(value).trim());

const normalize = (value: any) => asText(value).replace(/\s+/g, ' ').trim();

const looksLikeAuthSubject = (value: any) => {
  const v = normalize(value).toLowerCase();
  if (!v) return false;
  return (
    v.startsWith('google-oauth2|') ||
    v.startsWith('auth0|') ||
    v.startsWith('apple|') ||
    v.includes('|')
  );
};

const looksPlaceholderName = (value: any) => {
  const v = normalize(value).toLowerCase();
  if (!v) return true;
  if (PLACEHOLDER_VALUES.has(v)) return true;
  if (looksLikeAuthSubject(v)) return true;
  if (v.includes('@')) return true;
  const compact = v.replace(/[^a-z0-9]/g, '');
  if (!compact) return true;
  if (compact.length >= 12 && /^[a-z0-9]+$/.test(compact) && !/[aeiou]/.test(compact)) return true;
  return false;
};

const looksInvalidUsername = (value: any) => {
  const v = normalize(value);
  if (!v) return true;
  if (looksLikeAuthSubject(v)) return true;
  if (v.includes('@')) return true;
  const cleaned = v.replace(/[^a-z0-9._-]/gi, '');
  return cleaned.length < 2;
};

const looksInvalidEmail = (value: any) => {
  const v = normalize(value);
  if (!v) return true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return true;
  if (v.toLowerCase().endsWith('.auth@allin.local')) return true;
  return false;
};

const looksInvalidBirthdate = (value: any) => {
  const v = asText(value);
  if (!v) return true;
  if (!/^\d{4}-\d{2}-\d{2}/.test(v)) return true;
  const dt = new Date(v);
  if (Number.isNaN(dt.getTime())) return true;
  const year = dt.getUTCFullYear();
  const nowYear = new Date().getUTCFullYear();
  return year < 1900 || year > nowYear - 5;
};

export const shouldForceAccountCompletion = (bootstrap: any): boolean => {
  if (!bootstrap) return true;

  const isGuest = Boolean(bootstrap?.user?.is_guest);
  if (isGuest) return false;

  if (Boolean(bootstrap?.needs_user_onboarding)) {
    return true;
  }

  const missingFields = new Set(
    (Array.isArray(bootstrap?.missing_user_fields) ? bootstrap.missing_user_fields : []).map((v: any) =>
      String(v ?? '').trim().toLowerCase(),
    ),
  );
  if (REQUIRED_USER_FIELDS.some((field) => missingFields.has(field))) {
    return true;
  }

  const user = bootstrap?.user ?? {};
  if (looksInvalidUsername(user.username)) return true;
  if (looksPlaceholderName(user.first_name)) return true;
  if (looksPlaceholderName(user.last_name)) return true;
  if (looksInvalidEmail(user.email)) return true;
  if (!normalize(user.nationality)) return true;
  if (looksInvalidBirthdate(user.birthdate)) return true;

  return false;
};

