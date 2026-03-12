export type SportFocusId =
  | 'track-field'
  | 'road-events'
  | 'triathlon'
  | 'hyrox'
  | 'ironman'
  | 'cycling';

export type ProfileModeId = SportFocusId | 'support';

export type DisciplineCatalogItem = {
  key: string;
  label: string;
  group?: string;
  aliases?: string[];
};

type TranslateFn = (value: string) => string;

type SportFocusDefinition = {
  id: SportFocusId;
  label: string;
  translationKey: string;
  aliases: string[];
  chestNumbers: boolean;
};

const SPORT_FOCUS_DEFINITIONS: SportFocusDefinition[] = [
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

const TRACK_FIELD_DISCIPLINES: DisciplineCatalogItem[] = [
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

const ROAD_TRAIL_DISCIPLINES: DisciplineCatalogItem[] = [
  { key: '5k', label: '5K', group: 'Road' },
  { key: '10k', label: '10K', group: 'Road' },
  { key: '15k', label: '15K', group: 'Road' },
  { key: '20k', label: '20K', group: 'Road' },
  { key: 'half_marathon', label: 'Half marathon', group: 'Road', aliases: ['half-marathon', '21k'] },
  { key: 'marathon', label: 'Marathon', group: 'Road' },
  { key: 'short_trail', label: 'Short-distance trail', group: 'Trail' },
  { key: 'long_trail', label: 'Long-distance trail', group: 'Trail' },
];

const TRIATHLON_DISCIPLINES: DisciplineCatalogItem[] = [
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

const HYROX_DISCIPLINES: DisciplineCatalogItem[] = [
  { key: 'open', label: 'Open', group: 'HYROX' },
  { key: 'pro', label: 'Pro', group: 'HYROX' },
  { key: 'doubles', label: 'Doubles', group: 'HYROX' },
  { key: 'relay', label: 'Relay', group: 'HYROX' },
  { key: 'adaptive', label: 'Adaptive', group: 'HYROX' },
];

const IRONMAN_DISCIPLINES: DisciplineCatalogItem[] = [
  { key: '5150', label: '5150', group: 'Ironman' },
  { key: '70_3', label: '70.3', group: 'Ironman' },
  { key: '140_6', label: '140.6', group: 'Ironman' },
];

const CYCLING_DISCIPLINES: DisciplineCatalogItem[] = [
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

const DISCIPLINE_CATALOG_BY_FOCUS: Record<SportFocusId, DisciplineCatalogItem[]> = {
  'track-field': TRACK_FIELD_DISCIPLINES,
  'road-events': ROAD_TRAIL_DISCIPLINES,
  triathlon: TRIATHLON_DISCIPLINES,
  hyrox: HYROX_DISCIPLINES,
  ironman: IRONMAN_DISCIPLINES,
  cycling: CYCLING_DISCIPLINES,
};

const OFFICIAL_CLUB_DIRECTORY_FOCUSES = new Set<SportFocusId>([
  'track-field',
  'road-events',
  'triathlon',
  'ironman',
  'cycling',
]);

const FOCUS_ALIAS_MAP = new Map<string, SportFocusId>();

SPORT_FOCUS_DEFINITIONS.forEach((definition) => {
  FOCUS_ALIAS_MAP.set(definition.id, definition.id);
  definition.aliases.forEach((alias) => {
    FOCUS_ALIAS_MAP.set(alias.toLowerCase(), definition.id);
  });
});

const withTranslation = (value: string, t?: TranslateFn): string => (t ? t(value) : value);

function translateWithFallback(
  t: TranslateFn | undefined,
  key: string,
  fallback: string,
): string {
  if (!t) return fallback;
  const translated = t(key);
  return translated && translated !== key ? translated : fallback;
}

const normalizeRawFocus = (raw: any): string => {
  return String(
    typeof raw === 'string'
      ? raw
      : raw?.id ?? raw?.value ?? raw?.event_id ?? raw?.name ?? raw?.focus ?? '',
  )
    .trim()
    .toLowerCase();
};

export function normalizeFocusId(raw: any): SportFocusId | null {
  const normalized = normalizeRawFocus(raw);
  if (!normalized) return null;
  const direct = FOCUS_ALIAS_MAP.get(normalized);
  if (direct) return direct;
  if (normalized.includes('track')) return 'track-field';
  if (normalized.includes('road') || normalized.includes('trail')) return 'road-events';
  if (normalized.includes('triathlon') || normalized.includes('duathlon') || normalized.includes('aquathlon') || normalized.includes('aquabike')) {
    return 'triathlon';
  }
  if (normalized.includes('hyrox')) return 'hyrox';
  if (normalized.includes('ironman')) return 'ironman';
  if (normalized.includes('cycl')) return 'cycling';
  return null;
}

export function normalizeProfileModeId(raw: any): ProfileModeId | null {
  const normalized = String(
    typeof raw === 'string'
      ? raw
      : raw?.id ?? raw?.value ?? raw?.event_id ?? raw?.name ?? raw?.focus ?? '',
  )
    .trim()
    .toLowerCase();
  if (!normalized) return null;
  if (normalized === 'support') return 'support';
  return normalizeFocusId(normalized);
}

export function getProfileCollectionScopeKey(raw: any): string {
  return normalizeProfileModeId(raw) ?? 'default';
}

export function normalizeSelectedEvents(raw: any): SportFocusId[] {
  if (!Array.isArray(raw)) return [];
  const out: SportFocusId[] = [];
  raw.forEach((entry: any) => {
    const focusId = normalizeFocusId(entry);
    if (focusId && !out.includes(focusId)) out.push(focusId);
  });
  return out;
}

export function getSelectedSportFocuses(raw: any): SportFocusId[] {
  return normalizeSelectedEvents(raw);
}

export function hasFocusSelection(raw: any, focusId: SportFocusId): boolean {
  return normalizeSelectedEvents(raw).includes(focusId);
}

export function hasTrackFieldSelection(raw: any): boolean {
  return hasFocusSelection(raw, 'track-field');
}

export function hasRoadTrailSelection(raw: any): boolean {
  return hasFocusSelection(raw, 'road-events');
}

export function focusUsesChestNumbers(focusId: SportFocusId): boolean {
  return SPORT_FOCUS_DEFINITIONS.find((definition) => definition.id === focusId)?.chestNumbers === true;
}

export function getSportFocusDefinitions(): SportFocusDefinition[] {
  return SPORT_FOCUS_DEFINITIONS;
}

export function getSportFocusLabel(focusId: SportFocusId, t?: TranslateFn): string {
  const definition = SPORT_FOCUS_DEFINITIONS.find((item) => item.id === focusId);
  if (!definition) return focusId;
  return translateWithFallback(t, definition.translationKey, definition.label);
}

export function getDisciplineCatalog(focusId: SportFocusId): DisciplineCatalogItem[] {
  return DISCIPLINE_CATALOG_BY_FOCUS[focusId] ?? [];
}

export function focusSupportsOfficialClubDirectory(focusId: SportFocusId): boolean {
  return OFFICIAL_CLUB_DIRECTORY_FOCUSES.has(focusId);
}

export function getOfficialClubSearchFocuses(raw: any): SportFocusId[] {
  return normalizeSelectedEvents(raw).filter((focusId) => focusSupportsOfficialClubDirectory(focusId));
}

function getSingleFocusCopy(focusId: SportFocusId): {
  officialClubLabel: string;
  officialClubPlaceholder: string;
  officialClubModalTitle: string;
  groupLabel: string;
  groupPlaceholder: string;
  groupModalTitle: string;
  missingOfficialClubHelper?: string;
} {
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

function resolveFocusCopy(raw: any) {
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
    missingOfficialClubHelper:
      focuses.length > 0 && getOfficialClubSearchFocuses(focuses).length === 0
        ? 'No official club directory is available for this focus yet. Use the group field for your team, gym, or training group.'
        : undefined,
  };
}

export function getOfficialClubFieldLabel(raw: any, t?: TranslateFn): string {
  return withTranslation(resolveFocusCopy(raw).officialClubLabel, t);
}

export function getOfficialClubPlaceholder(raw: any, t?: TranslateFn): string {
  return withTranslation(resolveFocusCopy(raw).officialClubPlaceholder, t);
}

export function getOfficialClubModalTitle(raw: any, t?: TranslateFn): string {
  return withTranslation(resolveFocusCopy(raw).officialClubModalTitle, t);
}

export function getOfficialClubHelperText(raw: any, t?: TranslateFn): string {
  const helper = resolveFocusCopy(raw).missingOfficialClubHelper;
  return helper ? withTranslation(helper, t) : '';
}

export function getTrainingGroupFieldLabel(raw: any, t?: TranslateFn): string {
  return withTranslation(resolveFocusCopy(raw).groupLabel, t);
}

export function getTrainingGroupPlaceholder(raw: any, t?: TranslateFn): string {
  return withTranslation(resolveFocusCopy(raw).groupPlaceholder, t);
}

export function getTrainingGroupModalTitle(raw: any, t?: TranslateFn): string {
  return withTranslation(resolveFocusCopy(raw).groupModalTitle, t);
}

export function normalizeMainDisciplines(raw: any, legacy?: {trackFieldMainEvent?: string | null; roadTrailMainEvent?: string | null}): Record<string, string> {
  const source = typeof raw === 'string'
    ? (() => {
        try {
          return JSON.parse(raw);
        } catch {
          return {};
        }
      })()
    : raw;
  const out: Record<string, string> = {};
  if (source && typeof source === 'object' && !Array.isArray(source)) {
    Object.entries(source as Record<string, unknown>).forEach(([rawKey, rawValue]) => {
      const focusId = normalizeFocusId(rawKey);
      const value = String(rawValue ?? '').trim();
      if (!focusId || !value) return;
      out[focusId] = value;
    });
  }
  const legacyTrack = String(legacy?.trackFieldMainEvent ?? '').trim();
  const legacyRoad = String(legacy?.roadTrailMainEvent ?? '').trim();
  if (legacyTrack && !out['track-field']) out['track-field'] = legacyTrack;
  if (legacyRoad && !out['road-events']) out['road-events'] = legacyRoad;
  return out;
}

export function getMainDisciplineForFocus(
  raw: any,
  focusId: SportFocusId,
  legacy?: {trackFieldMainEvent?: string | null; roadTrailMainEvent?: string | null},
): string {
  return String(normalizeMainDisciplines(raw, legacy)[focusId] ?? '').trim();
}

export function getDisciplineLabel(
  focusId: SportFocusId,
  disciplineKey: string | null | undefined,
  t?: TranslateFn,
): string {
  const normalizedKey = String(disciplineKey ?? '').trim();
  if (!normalizedKey) return '';
  const item = getDisciplineCatalog(focusId).find((entry) => entry.key === normalizedKey);
  return withTranslation(item?.label ?? normalizedKey, t);
}

export function buildDisciplineSearchOptions(
  focusId: SportFocusId,
  t?: TranslateFn,
): Array<{id: string; title: string; subtitle?: string | null}> {
  return getDisciplineCatalog(focusId).map((entry) => ({
    id: entry.key,
    title: withTranslation(entry.label, t),
    subtitle: entry.group ? withTranslation(entry.group, t) : null,
  }));
}

export function getChestNumberFieldLabel(year: string, t?: TranslateFn): string {
  const fallback = `Chest number ${year} (optional)`;
  return translateWithFallback(t, 'chestNumberYearOptional', fallback).replace('{{year}}', year);
}

export function getFocusMainDisciplineLabel(focusId: SportFocusId, t?: TranslateFn): string {
  const focusLabel = getSportFocusLabel(focusId, t);
  const fallback = `${focusLabel} main discipline (optional)`;
  const translated = translateWithFallback(t, 'focusMainDisciplineOptional', fallback);
  return translated.replace('{{focus}}', focusLabel);
}

export function getFocusDisciplineModalTitle(focusId: SportFocusId, t?: TranslateFn): string {
  const focusLabel = getSportFocusLabel(focusId, t);
  const fallback = `${focusLabel} disciplines`;
  const translated = translateWithFallback(t, 'focusDisciplinesTitle', fallback);
  return translated.replace('{{focus}}', focusLabel);
}

export function getWizardStepLabel(step: number, total: number, t?: TranslateFn): string {
  const fallback = `Step ${step} of ${total}`;
  const translated = translateWithFallback(t, 'wizardStepOfTotal', fallback);
  return translated.replace('{{step}}', String(step)).replace('{{total}}', String(total));
}
