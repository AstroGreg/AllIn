import countries from 'i18n-iso-countries';

// Register English locale for display names.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const enLocale = require('i18n-iso-countries/langs/en.json');
countries.registerLocale(enLocale);

let cachedNationalityOptions: string[] | null = null;

export const getNationalityOptions = (): string[] => {
  if (cachedNationalityOptions) return cachedNationalityOptions;
  const names = countries.getNames('en', { select: 'official' }) as Record<string, string>;
  cachedNationalityOptions = Object.values(names)
    .map((v) => String(v || '').trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  return cachedNationalityOptions;
};
