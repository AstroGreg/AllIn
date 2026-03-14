const SPORT_FOCUS_DEFINITIONS = [
    {
        id: 'track-field',
        label: 'Track & Field',
        translationKey: 'sportFocus.trackField',
        aliases: ['track-field', 'track field', 'track&field', 'track_field', 'track', 'athletics'],
        chestNumbers: true,
    },
    {
        id: 'road-events',
        label: 'Road & Trail',
        translationKey: 'sportFocus.roadTrail',
        aliases: ['road-events', 'road event', 'road&trail', 'road_trail', 'road trail', 'road', 'trail'],
        chestNumbers: false,
    },
    {
        id: 'triathlon',
        label: 'Triathlon',
        translationKey: 'sportFocus.triathlon',
        aliases: ['triathlon', 'duathlon', 'aquathlon', 'aquabike', 'multisport'],
        chestNumbers: false,
    },
    {
        id: 'hyrox',
        label: 'HYROX',
        translationKey: 'sportFocus.hyrox',
        aliases: ['hyrox', 'fitness'],
        chestNumbers: false,
    },
    {
        id: 'ironman',
        label: 'Ironman',
        translationKey: 'sportFocus.ironman',
        aliases: ['ironman', '70.3', '140.6', '5150'],
        chestNumbers: false,
    },
    {
        id: 'cycling',
        label: 'Cycling',
        translationKey: 'sportFocus.cycling',
        aliases: ['cycling', 'bike', 'bicycle', 'cyclocross', 'gravel', 'mtb'],
        chestNumbers: false,
    },
];
const TRACK_FIELD_DISCIPLINES = [
    { key: '60m', label: '60 m', group: 'Sprints' },
    { key: '100m', label: '100 m', group: 'Sprints' },
    { key: '200m', label: '200 m', group: 'Sprints' },
    { key: '400m', label: '400 m', group: 'Sprints' },
    { key: '800m', label: '800 m', group: 'Middle-distance' },
    { key: '1500m', label: '1500 m', group: 'Middle-distance' },
    { key: '3000m', label: '3000 m', group: 'Middle-distance' },
    { key: '5000m', label: '5000 m', group: 'Long-distance' },
    { key: '10000m', label: '10,000 m', group: 'Long-distance', aliases: ['10000m', '10k track'] },
    { key: '60m_hurdles', label: '60 m hurdles', group: 'Hurdles' },
    { key: '100m_hurdles', label: '100 m hurdles', group: 'Hurdles' },
    { key: '110m_hurdles', label: '110 m hurdles', group: 'Hurdles' },
    { key: '400m_hurdles', label: '400 m hurdles', group: 'Hurdles' },
    { key: '3000m_steeplechase', label: '3000 m steeplechase', group: 'Hurdles' },
    { key: '4x100m_relay', label: '4x100 m relay', group: 'Relays' },
    { key: '4x400m_relay', label: '4x400 m relay', group: 'Relays' },
    { key: 'long_jump', label: 'Long jump', group: 'Jumps' },
    { key: 'triple_jump', label: 'Triple jump', group: 'Jumps' },
    { key: 'high_jump', label: 'High jump', group: 'Jumps' },
    { key: 'pole_vault', label: 'Pole vault', group: 'Jumps' },
    { key: 'shot_put', label: 'Shot put', group: 'Throws' },
    { key: 'discus_throw', label: 'Discus throw', group: 'Throws' },
    { key: 'hammer_throw', label: 'Hammer throw', group: 'Throws' },
    { key: 'javelin_throw', label: 'Javelin throw', group: 'Throws' },
    { key: 'pentathlon', label: 'Pentathlon', group: 'Combined events' },
    { key: 'heptathlon', label: 'Heptathlon', group: 'Combined events' },
    { key: 'decathlon', label: 'Decathlon', group: 'Combined events' },
];
const ROAD_TRAIL_DISCIPLINES = [
    { key: '5k', label: '5K', group: 'Road' },
    { key: '10k', label: '10K', group: 'Road' },
    { key: '15k', label: '15K', group: 'Road' },
    { key: '20k', label: '20K', group: 'Road' },
    { key: 'half_marathon', label: 'Half marathon', group: 'Road', aliases: ['half-marathon', '21k'] },
    { key: 'marathon', label: 'Marathon', group: 'Road' },
    { key: 'short_trail', label: 'Short-distance trail', group: 'Trail' },
    { key: 'long_trail', label: 'Long-distance trail', group: 'Trail' },
];
const TRIATHLON_DISCIPLINES = [
    { key: 'super_sprint', label: 'Super sprint', group: 'Triathlon' },
    { key: 'sprint', label: 'Sprint', group: 'Triathlon' },
    { key: 'standard', label: 'Standard', group: 'Triathlon' },
    { key: 'middle', label: 'Middle distance', group: 'Triathlon' },
    { key: 'long', label: 'Long distance', group: 'Triathlon' },
    { key: 'cross_triathlon', label: 'Cross triathlon', group: 'Triathlon' },
    { key: 'duathlon', label: 'Duathlon', group: 'Multisport' },
    { key: 'aquathlon', label: 'Aquathlon', group: 'Multisport' },
    { key: 'aquabike', label: 'Aquabike', group: 'Multisport' },
];
const HYROX_DISCIPLINES = [
    { key: 'open', label: 'Open', group: 'HYROX' },
    { key: 'pro', label: 'Pro', group: 'HYROX' },
    { key: 'doubles', label: 'Doubles', group: 'HYROX' },
    { key: 'relay', label: 'Relay', group: 'HYROX' },
    { key: 'adaptive', label: 'Adaptive', group: 'HYROX' },
];
const IRONMAN_DISCIPLINES = [
    { key: '5150', label: '5150', group: 'Ironman' },
    { key: '70_3', label: '70.3', group: 'Ironman' },
    { key: '140_6', label: '140.6', group: 'Ironman' },
];
const CYCLING_DISCIPLINES = [
    { key: 'road', label: 'Road', group: 'Cycling' },
    { key: 'track', label: 'Track', group: 'Cycling' },
    { key: 'mountain_bike', label: 'Mountain bike', group: 'Cycling' },
    { key: 'gravel', label: 'Gravel', group: 'Cycling' },
    { key: 'cyclocross', label: 'Cyclocross', group: 'Cycling' },
    { key: 'bmx_racing', label: 'BMX racing', group: 'Cycling' },
    { key: 'bmx_freestyle', label: 'BMX freestyle', group: 'Cycling' },
    { key: 'trials', label: 'Trials', group: 'Cycling' },
    { key: 'cycling_esports', label: 'Cycling esports', group: 'Cycling' },
];
const DISCIPLINE_CATALOG_BY_FOCUS = {
    'track-field': TRACK_FIELD_DISCIPLINES,
    'road-events': ROAD_TRAIL_DISCIPLINES,
    triathlon: TRIATHLON_DISCIPLINES,
    hyrox: HYROX_DISCIPLINES,
    ironman: IRONMAN_DISCIPLINES,
    cycling: CYCLING_DISCIPLINES,
};
const OFFICIAL_CLUB_DIRECTORY_FOCUSES = new Set([
    'track-field',
    'road-events',
    'triathlon',
    'ironman',
    'cycling',
]);
const FOCUS_ALIAS_MAP = new Map();
SPORT_FOCUS_DEFINITIONS.forEach((definition) => {
    FOCUS_ALIAS_MAP.set(definition.id, definition.id);
    definition.aliases.forEach((alias) => {
        FOCUS_ALIAS_MAP.set(alias.toLowerCase(), definition.id);
    });
});
const withTranslation = (value, t) => (t ? t(value) : value);
function translateWithFallback(t, key, fallback) {
    if (!t)
        return fallback;
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
}
const normalizeRawFocus = (raw) => {
    var _a, _b, _c, _d, _e;
    return String(typeof raw === 'string'
        ? raw
        : (_e = (_d = (_c = (_b = (_a = raw === null || raw === void 0 ? void 0 : raw.id) !== null && _a !== void 0 ? _a : raw === null || raw === void 0 ? void 0 : raw.value) !== null && _b !== void 0 ? _b : raw === null || raw === void 0 ? void 0 : raw.event_id) !== null && _c !== void 0 ? _c : raw === null || raw === void 0 ? void 0 : raw.name) !== null && _d !== void 0 ? _d : raw === null || raw === void 0 ? void 0 : raw.focus) !== null && _e !== void 0 ? _e : '')
        .trim()
        .toLowerCase();
};
export function normalizeFocusId(raw) {
    const normalized = normalizeRawFocus(raw);
    if (!normalized)
        return null;
    const direct = FOCUS_ALIAS_MAP.get(normalized);
    if (direct)
        return direct;
    if (normalized.includes('track'))
        return 'track-field';
    if (normalized.includes('road') || normalized.includes('trail'))
        return 'road-events';
    if (normalized.includes('triathlon') || normalized.includes('duathlon') || normalized.includes('aquathlon') || normalized.includes('aquabike')) {
        return 'triathlon';
    }
    if (normalized.includes('hyrox'))
        return 'hyrox';
    if (normalized.includes('ironman'))
        return 'ironman';
    if (normalized.includes('cycl'))
        return 'cycling';
    return null;
}
export function resolveCompetitionFocusId(params) {
    var _a;
    const token = [
        params === null || params === void 0 ? void 0 : params.type,
        params === null || params === void 0 ? void 0 : params.name,
        params === null || params === void 0 ? void 0 : params.location,
        params === null || params === void 0 ? void 0 : params.organizer,
    ]
        .map((value) => String(value !== null && value !== void 0 ? value : '').trim().toLowerCase())
        .filter(Boolean)
        .join(' ');
    if (!token)
        return 'track-field';
    if (/\bironman\b|70\.3|140\.6|\b5150\b/.test(token))
        return 'ironman';
    if (/\btriathlon\b|\bduathlon\b|\baquathlon\b|\baquabike\b|\bmultisport\b/.test(token))
        return 'triathlon';
    if (/\bhyrox\b/.test(token))
        return 'hyrox';
    if (/\bcycling\b|\bcyclocross\b|\bgravel\b|\bmtb\b|mountain bike|\bbmx\b|\bvelo\b|\bbike\b|\bcriterium\b/.test(token)) {
        return 'cycling';
    }
    if (/\broad\b|\btrail\b|\bmarathon\b|\bveldloop\b|\bveldlopen\b|cross country|\b5k\b|\b10k\b|\b15k\b|\b20k\b|half marathon|\bultra\b|city\s*run/.test(token)) {
        return 'road-events';
    }
    return (_a = normalizeFocusId(token)) !== null && _a !== void 0 ? _a : 'track-field';
}
export function normalizeProfileModeId(raw) {
    var _a, _b, _c, _d, _e;
    const normalized = String(typeof raw === 'string'
        ? raw
        : (_e = (_d = (_c = (_b = (_a = raw === null || raw === void 0 ? void 0 : raw.id) !== null && _a !== void 0 ? _a : raw === null || raw === void 0 ? void 0 : raw.value) !== null && _b !== void 0 ? _b : raw === null || raw === void 0 ? void 0 : raw.event_id) !== null && _c !== void 0 ? _c : raw === null || raw === void 0 ? void 0 : raw.name) !== null && _d !== void 0 ? _d : raw === null || raw === void 0 ? void 0 : raw.focus) !== null && _e !== void 0 ? _e : '')
        .trim()
        .toLowerCase();
    if (!normalized)
        return null;
    if (normalized === 'support')
        return 'support';
    return normalizeFocusId(normalized);
}
export function getProfileCollectionScopeKey(raw) {
    var _a;
    return (_a = normalizeProfileModeId(raw)) !== null && _a !== void 0 ? _a : 'default';
}
export function normalizeSelectedEvents(raw) {
    if (!Array.isArray(raw))
        return [];
    const out = [];
    raw.forEach((entry) => {
        const focusId = normalizeFocusId(entry);
        if (focusId && !out.includes(focusId))
            out.push(focusId);
    });
    return out;
}
export function getSelectedSportFocuses(raw) {
    return normalizeSelectedEvents(raw);
}
export function hasFocusSelection(raw, focusId) {
    return normalizeSelectedEvents(raw).includes(focusId);
}
export function hasTrackFieldSelection(raw) {
    return hasFocusSelection(raw, 'track-field');
}
export function hasRoadTrailSelection(raw) {
    return hasFocusSelection(raw, 'road-events');
}
export function focusUsesChestNumbers(focusId) {
    var _a;
    return ((_a = SPORT_FOCUS_DEFINITIONS.find((definition) => definition.id === focusId)) === null || _a === void 0 ? void 0 : _a.chestNumbers) === true;
}
export function getSportFocusDefinitions() {
    return SPORT_FOCUS_DEFINITIONS;
}
export function getSportFocusLabel(focusId, t) {
    const definition = SPORT_FOCUS_DEFINITIONS.find((item) => item.id === focusId);
    if (!definition)
        return focusId;
    return translateWithFallback(t, definition.translationKey, definition.label);
}
export function getDisciplineCatalog(focusId) {
    var _a;
    return (_a = DISCIPLINE_CATALOG_BY_FOCUS[focusId]) !== null && _a !== void 0 ? _a : [];
}
export function focusSupportsOfficialClubDirectory(focusId) {
    return OFFICIAL_CLUB_DIRECTORY_FOCUSES.has(focusId);
}
export function getOfficialClubSearchFocuses(raw) {
    return normalizeSelectedEvents(raw).filter((focusId) => focusSupportsOfficialClubDirectory(focusId));
}
function getSingleFocusCopy(focusId) {
    switch (focusId) {
        case 'track-field':
            return {
                officialClubLabel: 'Running club (optional)',
                officialClubPlaceholder: 'Choose official running club',
                officialClubModalTitle: 'Select Running Club',
                groupLabel: 'Running group (optional)',
                groupPlaceholder: 'Choose running group',
                groupModalTitle: 'Select Running Group',
            };
        case 'road-events':
            return {
                officialClubLabel: 'Running club (optional)',
                officialClubPlaceholder: 'Choose official running club',
                officialClubModalTitle: 'Select Running Club',
                groupLabel: 'Running group (optional)',
                groupPlaceholder: 'Choose running group',
                groupModalTitle: 'Select Running Group',
            };
        case 'triathlon':
            return {
                officialClubLabel: 'Triathlon club (optional)',
                officialClubPlaceholder: 'Choose official triathlon club',
                officialClubModalTitle: 'Select Triathlon Club',
                groupLabel: 'Training group (optional)',
                groupPlaceholder: 'Choose training group',
                groupModalTitle: 'Select Training Group',
            };
        case 'ironman':
            return {
                officialClubLabel: 'Triathlon club (optional)',
                officialClubPlaceholder: 'Choose official triathlon club',
                officialClubModalTitle: 'Select Triathlon Club',
                groupLabel: 'Training group (optional)',
                groupPlaceholder: 'Choose training group',
                groupModalTitle: 'Select Training Group',
            };
        case 'cycling':
            return {
                officialClubLabel: 'Cycling club (optional)',
                officialClubPlaceholder: 'Choose official cycling club',
                officialClubModalTitle: 'Select Cycling Club',
                groupLabel: 'Team / riding group (optional)',
                groupPlaceholder: 'Choose team or riding group',
                groupModalTitle: 'Select Team / Riding Group',
            };
        case 'hyrox':
            return {
                officialClubLabel: 'Official club (optional)',
                officialClubPlaceholder: 'Choose official club',
                officialClubModalTitle: 'Select Official Club',
                groupLabel: 'Training group / gym (optional)',
                groupPlaceholder: 'Choose training group or gym',
                groupModalTitle: 'Select Training Group / Gym',
                missingOfficialClubHelper: 'HYROX has no official Flemish club directory yet. Use the group field for your gym or team.',
            };
        default:
            return {
                officialClubLabel: 'Official club (optional)',
                officialClubPlaceholder: 'Choose official club',
                officialClubModalTitle: 'Select Official Club',
                groupLabel: 'Group / team (optional)',
                groupPlaceholder: 'Choose group or team',
                groupModalTitle: 'Select Group / Team',
            };
    }
}
function resolveFocusCopy(raw) {
    const focuses = normalizeSelectedEvents(raw);
    if (focuses.length === 1) {
        return getSingleFocusCopy(focuses[0]);
    }
    return {
        officialClubLabel: 'Official club (optional)',
        officialClubPlaceholder: 'Choose official club',
        officialClubModalTitle: 'Select Official Club',
        groupLabel: 'Group / team (optional)',
        groupPlaceholder: 'Choose group or team',
        groupModalTitle: 'Select Group / Team',
        missingOfficialClubHelper: focuses.length > 0 && getOfficialClubSearchFocuses(focuses).length === 0
            ? 'No official club directory is available for this focus yet. Use the group field for your team, gym, or training group.'
            : undefined,
    };
}
export function getOfficialClubFieldLabel(raw, t) {
    return withTranslation(resolveFocusCopy(raw).officialClubLabel, t);
}
export function getOfficialClubPlaceholder(raw, t) {
    return withTranslation(resolveFocusCopy(raw).officialClubPlaceholder, t);
}
export function getOfficialClubModalTitle(raw, t) {
    return withTranslation(resolveFocusCopy(raw).officialClubModalTitle, t);
}
export function getOfficialClubHelperText(raw, t) {
    const helper = resolveFocusCopy(raw).missingOfficialClubHelper;
    return helper ? withTranslation(helper, t) : '';
}
export function getTrainingGroupFieldLabel(raw, t) {
    return withTranslation(resolveFocusCopy(raw).groupLabel, t);
}
export function getTrainingGroupPlaceholder(raw, t) {
    return withTranslation(resolveFocusCopy(raw).groupPlaceholder, t);
}
export function getTrainingGroupModalTitle(raw, t) {
    return withTranslation(resolveFocusCopy(raw).groupModalTitle, t);
}
export function normalizeMainDisciplines(raw, legacy) {
    var _a, _b;
    const source = typeof raw === 'string'
        ? (() => {
            try {
                return JSON.parse(raw);
            }
            catch (_a) {
                return {};
            }
        })()
        : raw;
    const out = {};
    if (source && typeof source === 'object' && !Array.isArray(source)) {
        Object.entries(source).forEach(([rawKey, rawValue]) => {
            const focusId = normalizeFocusId(rawKey);
            const value = String(rawValue !== null && rawValue !== void 0 ? rawValue : '').trim();
            if (!focusId || !value)
                return;
            out[focusId] = value;
        });
    }
    const legacyTrack = String((_a = legacy === null || legacy === void 0 ? void 0 : legacy.trackFieldMainEvent) !== null && _a !== void 0 ? _a : '').trim();
    const legacyRoad = String((_b = legacy === null || legacy === void 0 ? void 0 : legacy.roadTrailMainEvent) !== null && _b !== void 0 ? _b : '').trim();
    if (legacyTrack && !out['track-field'])
        out['track-field'] = legacyTrack;
    if (legacyRoad && !out['road-events'])
        out['road-events'] = legacyRoad;
    return out;
}
export function getMainDisciplineForFocus(raw, focusId, legacy) {
    var _a;
    return String((_a = normalizeMainDisciplines(raw, legacy)[focusId]) !== null && _a !== void 0 ? _a : '').trim();
}
export function getDisciplineLabel(focusId, disciplineKey, t) {
    var _a;
    const normalizedKey = String(disciplineKey !== null && disciplineKey !== void 0 ? disciplineKey : '').trim();
    if (!normalizedKey)
        return '';
    const item = getDisciplineCatalog(focusId).find((entry) => entry.key === normalizedKey);
    return withTranslation((_a = item === null || item === void 0 ? void 0 : item.label) !== null && _a !== void 0 ? _a : normalizedKey, t);
}
export function buildDisciplineSearchOptions(focusId, t) {
    return getDisciplineCatalog(focusId).map((entry) => ({
        id: entry.key,
        title: withTranslation(entry.label, t),
        subtitle: entry.group ? withTranslation(entry.group, t) : null,
    }));
}
export function getChestNumberFieldLabel(year, t) {
    const fallback = `Chest number ${year} (optional)`;
    return translateWithFallback(t, 'chestNumberYearOptional', fallback).replace('{{year}}', year);
}
export function getFocusMainDisciplineLabel(focusId, t) {
    const focusLabel = getSportFocusLabel(focusId, t);
    const fallback = `${focusLabel} main discipline (optional)`;
    const translated = translateWithFallback(t, 'focusMainDisciplineOptional', fallback);
    return translated.replace('{{focus}}', focusLabel);
}
export function getFocusDisciplineModalTitle(focusId, t) {
    const focusLabel = getSportFocusLabel(focusId, t);
    const fallback = `${focusLabel} disciplines`;
    const translated = translateWithFallback(t, 'focusDisciplinesTitle', fallback);
    return translated.replace('{{focus}}', focusLabel);
}
export function getWizardStepLabel(step, total, t) {
    const fallback = `Step ${step} of ${total}`;
    const translated = translateWithFallback(t, 'wizardStepOfTotal', fallback);
    return translated.replace('{{step}}', String(step)).replace('{{total}}', String(total));
}
