export const SEARCH_FILTER_KEYS = ['Competition', 'Person', 'Group', 'Location'];
export const getSearchFilterLabel = (filterKey, t) => {
    if (filterKey === 'Competition')
        return t('Competition');
    if (filterKey === 'Person')
        return t('Person');
    if (filterKey === 'Group')
        return t('Group');
    return t('Location');
};
export const formatSearchDateRangeLabel = (t, start, end) => {
    const hasStart = Boolean(start);
    const hasEnd = Boolean(end);
    if (hasStart && hasEnd)
        return `${start} – ${end}`;
    if (hasStart)
        return `${t('From')} ${start}`;
    if (hasEnd)
        return `${t('Until')} ${end}`;
    return '';
};
export const buildSearchFilterChipLabel = (filterKey, value, t) => `${getSearchFilterLabel(filterKey, t)}: ${value}`;
