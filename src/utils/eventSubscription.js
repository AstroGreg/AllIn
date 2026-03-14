export const SUBSCRIPTION_CATEGORY_OPTIONS = [
    'All',
    'Pupil',
    'Miniem',
    'Cadet',
    'Scholier',
    'Junior',
    'Beloften',
    'Seniors',
    'Masters',
];
export const SUBSCRIPTION_ALL_DISCIPLINE_ID = '__all__';
export function buildSubscriptionDisciplineOptions(rows) {
    var _a, _b, _c;
    const out = [
        {
            id: SUBSCRIPTION_ALL_DISCIPLINE_ID,
            label: 'All',
            group: null,
        },
    ];
    const seen = new Set();
    for (const row of rows) {
        const id = String((_a = row === null || row === void 0 ? void 0 : row.id) !== null && _a !== void 0 ? _a : '').trim();
        const label = String((_c = (_b = row === null || row === void 0 ? void 0 : row.competition_name) !== null && _b !== void 0 ? _b : row === null || row === void 0 ? void 0 : row.competition_name_normalized) !== null && _c !== void 0 ? _c : '').trim();
        if (!id || !label || seen.has(id))
            continue;
        seen.add(id);
        out.push({
            id,
            label,
            group: (row === null || row === void 0 ? void 0 : row.discipline_group) ? String(row.discipline_group) : null,
        });
    }
    return out;
}
export function toggleSubscriptionDiscipline(selectedIds, disciplineId) {
    const safeId = String(disciplineId || '').trim();
    if (!safeId)
        return selectedIds;
    if (safeId === SUBSCRIPTION_ALL_DISCIPLINE_ID) {
        return [SUBSCRIPTION_ALL_DISCIPLINE_ID];
    }
    const base = selectedIds.filter((value) => value !== SUBSCRIPTION_ALL_DISCIPLINE_ID);
    if (base.includes(safeId)) {
        const next = base.filter((value) => value !== safeId);
        return next.length > 0 ? next : [SUBSCRIPTION_ALL_DISCIPLINE_ID];
    }
    return [...base, safeId];
}
export function normalizeSubscriptionCategories(values) {
    const allowed = new Set(SUBSCRIPTION_CATEGORY_OPTIONS);
    const next = Array.isArray(values)
        ? values
            .map((value) => String(value || '').trim())
            .filter((value) => allowed.has(value))
        : [];
    if (next.length === 0)
        return ['All'];
    if (next.includes('All'))
        return ['All'];
    return Array.from(new Set(next));
}
export function toggleSubscriptionCategory(selectedLabels, nextLabel) {
    if (nextLabel === 'All')
        return ['All'];
    const current = normalizeSubscriptionCategories(selectedLabels).filter((value) => value !== 'All');
    if (current.includes(nextLabel)) {
        const next = current.filter((value) => value !== nextLabel);
        return next.length > 0 ? next : ['All'];
    }
    return [...current, nextLabel];
}
