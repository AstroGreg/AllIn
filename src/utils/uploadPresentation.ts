export function normalizeUploadFileName(raw?: string | null): string {
  const source = String(raw ?? '').trim();
  if (!source) return '';
  const withoutExtension = source.replace(/\.[^.]+$/, '');
  return withoutExtension
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toTitleCaseWords(raw: string): string {
  return raw.replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

export function formatUploadDisplayName(input: {
  title?: string | null;
  fileName?: string | null;
  type?: string | null;
  fallbackIndex?: number;
}): string {
  const title = String(input.title ?? '').trim();
  if (title) return title;
  const normalized = normalizeUploadFileName(input.fileName);
  if (normalized) return toTitleCaseWords(normalized);
  const fallbackIndex = Number(input.fallbackIndex ?? 0);
  if (fallbackIndex > 0) return `File ${fallbackIndex}`;
  return 'File';
}

export function formatUploadStageLabel(stage?: string | null): string {
  switch (String(stage ?? '').trim().toLowerCase()) {
    case 'uploaded':
      return 'Stored';
    case 'transforms_done':
      return 'Media ready';
    case 'ai_processing':
      return 'AI processing';
    case 'notifying':
      return 'Sending notifications';
    case 'complete':
      return 'Ready';
    case 'failed':
      return 'Failed';
    default:
      return 'Processing';
  }
}
