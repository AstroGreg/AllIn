import type { AccountAvailabilityProvider } from '../services/apiGateway';

export const normalizeUsernameInput = (value: string): string =>
  String(value ?? '').trim().toLowerCase();

export const normalizeEmailInput = (value: string): string =>
  String(value ?? '').trim().toLowerCase();

export const validateUsernameInput = (value: string): string | null => {
  const normalized = normalizeUsernameInput(value);
  if (!normalized) return 'required';
  if (normalized.length < 2) return 'too_short';
  if (normalized.length > 32) return 'too_long';
  if (!/^[a-z0-9._-]+$/i.test(normalized)) return 'invalid_format';
  return null;
};

export const validateEmailInput = (value: string): string | null => {
  const normalized = normalizeEmailInput(value);
  if (!normalized) return 'required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return 'invalid_format';
  return null;
};

export const formatAccountProvider = (provider?: AccountAvailabilityProvider | null): string => {
  if (provider === 'google') return 'Google';
  if (provider === 'apple') return 'Apple';
  if (provider === 'email') return 'email/password';
  return 'another sign-in method';
};
