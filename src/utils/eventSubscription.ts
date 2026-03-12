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
] as const;

export type SubscriptionCategoryLabel = (typeof SUBSCRIPTION_CATEGORY_OPTIONS)[number];

export type SubscriptionDisciplineOption = {
  id: string;
  label: string;
  group?: string | null;
};

export function buildSubscriptionDisciplineOptions(
  rows: Array<{
    id?: string | null;
    competition_name?: string | null;
    competition_name_normalized?: string | null;
    discipline_group?: string | null;
  }>,
): SubscriptionDisciplineOption[] {
  const out: SubscriptionDisciplineOption[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const id = String(row?.id ?? '').trim();
    const label = String(row?.competition_name ?? row?.competition_name_normalized ?? '').trim();
    if (!id || !label || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      label,
      group: row?.discipline_group ? String(row.discipline_group) : null,
    });
  }
  return out;
}

export function toggleSubscriptionDiscipline(
  selectedIds: string[],
  disciplineId: string,
): string[] {
  const safeId = String(disciplineId || '').trim();
  if (!safeId) return selectedIds;
  return selectedIds.includes(safeId)
    ? selectedIds.filter((value) => value !== safeId)
    : [...selectedIds, safeId];
}

export function normalizeSubscriptionCategories(
  values: string[] | null | undefined,
): SubscriptionCategoryLabel[] {
  const allowed = new Set<string>(SUBSCRIPTION_CATEGORY_OPTIONS);
  const next = Array.isArray(values)
    ? values
        .map((value) => String(value || '').trim())
        .filter((value): value is SubscriptionCategoryLabel => allowed.has(value))
    : [];
  if (next.length === 0) return ['All'];
  if (next.includes('All')) return ['All'];
  return Array.from(new Set(next)) as SubscriptionCategoryLabel[];
}

export function toggleSubscriptionCategory(
  selectedLabels: string[],
  nextLabel: SubscriptionCategoryLabel,
): SubscriptionCategoryLabel[] {
  if (nextLabel === 'All') return ['All'];
  const current = normalizeSubscriptionCategories(selectedLabels).filter((value) => value !== 'All');
  if (current.includes(nextLabel)) {
    const next = current.filter((value) => value !== nextLabel);
    return next.length > 0 ? (next as SubscriptionCategoryLabel[]) : ['All'];
  }
  return [...current, nextLabel] as SubscriptionCategoryLabel[];
}
