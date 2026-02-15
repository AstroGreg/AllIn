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

