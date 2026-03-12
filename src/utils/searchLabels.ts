export type SearchFilterKey = 'Competition' | 'Person' | 'Group' | 'Location';

type TranslateFn = (value: string) => string;

export const SEARCH_FILTER_KEYS: SearchFilterKey[] = ['Competition', 'Person', 'Group', 'Location'];

export const getSearchFilterLabel = (filterKey: SearchFilterKey, t: TranslateFn): string => {
  if (filterKey === 'Competition') return t('Competition');
  if (filterKey === 'Person') return t('Person');
  if (filterKey === 'Group') return t('Group');
  return t('Location');
};

export const formatSearchDateRangeLabel = (
  t: TranslateFn,
  start?: string | null,
  end?: string | null,
): string => {
  const hasStart = Boolean(start);
  const hasEnd = Boolean(end);
  if (hasStart && hasEnd) return `${start} – ${end}`;
  if (hasStart) return `${t('From')} ${start}`;
  if (hasEnd) return `${t('Until')} ${end}`;
  return '';
};

export const buildSearchFilterChipLabel = (
  filterKey: SearchFilterKey,
  value: string,
  t: TranslateFn,
): string => `${getSearchFilterLabel(filterKey, t)}: ${value}`;
