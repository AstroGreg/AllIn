import AsyncStorage from '@react-native-async-storage/async-storage';

export type UploadSessionPhase = 'uploading' | 'processing' | 'done' | 'failed';

export type UploadSession = {
  id: string;
  competitionId: string;
  createdAt: number;
  updatedAt: number;
  anonymous: boolean;
  watermarkText?: string;
  phase: UploadSessionPhase;
  total?: number;
  uploaded?: number;
  processing_ready?: number;
  processing_total?: number;
  media_ids?: string[];
  error?: string | null;
};

export function calculateUploadProgressState(input: {
  phase?: UploadSessionPhase | 'idle';
  total?: number;
  uploaded?: number;
  processing_ready?: number;
  processing_total?: number;
}) {
  const phase = input.phase ?? 'uploading';
  const total = Math.max(0, Number(input.total ?? 0));
  const uploaded = Math.max(0, Math.min(total || Number.MAX_SAFE_INTEGER, Number(input.uploaded ?? 0)));
  const derivedProcessingTotal =
    Number(input.processing_total ?? 0) > 0
      ? Number(input.processing_total ?? 0)
      : phase === 'processing' || phase === 'done'
        ? Math.max(uploaded, total > 0 ? uploaded : 0)
        : 0;
  const processingTotal = Math.max(0, derivedProcessingTotal);
  const processingReady = Math.max(
    0,
    Math.min(processingTotal || Number.MAX_SAFE_INTEGER, Number(input.processing_ready ?? 0)),
  );

  if (phase === 'done') {
    return {
      total,
      uploaded,
      processingTotal,
      processingReady: processingTotal || uploaded || total,
      overallProgress: 1,
    };
  }

  if (phase === 'processing') {
    const uploadDenominator = Math.max(1, total);
    const processingDenominator = Math.max(1, processingTotal || uploaded);
    return {
      total,
      uploaded,
      processingTotal: processingDenominator,
      processingReady,
      overallProgress: Math.min(1, (uploaded + processingReady) / (uploadDenominator + processingDenominator)),
    };
  }

  return {
    total,
    uploaded,
    processingTotal,
    processingReady,
    overallProgress: total > 0 ? Math.min(1, uploaded / Math.max(1, total)) : 0,
  };
}

const STORAGE_KEY = '@upload_sessions_v1';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function listUploadSessions(): Promise<UploadSession[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const parsed = safeParse<UploadSession[]>(raw);
  const sessions = Array.isArray(parsed) ? parsed : [];
  return sessions.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export async function getUploadSession(sessionId: string): Promise<UploadSession | null> {
  const sessions = await listUploadSessions();
  return sessions.find((s) => s.id === sessionId) ?? null;
}

export async function upsertUploadSession(session: UploadSession): Promise<void> {
  const sessions = await listUploadSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  const next = [...sessions];
  if (idx >= 0) next[idx] = session;
  else next.unshift(session);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function removeUploadSession(sessionId: string): Promise<void> {
  const sessions = await listUploadSessions();
  const next = sessions.filter((s) => s.id !== sessionId);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
