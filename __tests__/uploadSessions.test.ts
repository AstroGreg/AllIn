const mockStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage.set(key, value);
    }),
  },
}));

import {
  getUploadSession,
  listUploadSessions,
  removeUploadSession,
  upsertUploadSession,
  type UploadSession,
} from '../src/services/uploadSessions';

const STORAGE_KEY = '@upload_sessions_v1';

const baseSession = (overrides: Partial<UploadSession> = {}): UploadSession => ({
  id: 'session-1',
  competitionId: 'comp-1',
  createdAt: 100,
  updatedAt: 100,
  anonymous: false,
  phase: 'uploading',
  ...overrides,
});

describe('uploadSessions', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  test('returns an empty list when storage is invalid JSON', async () => {
    mockStorage.set(STORAGE_KEY, '{not-json');
    await expect(listUploadSessions()).resolves.toEqual([]);
  });

  test('sorts sessions by most recent update first', async () => {
    mockStorage.set(
      STORAGE_KEY,
      JSON.stringify([
        baseSession({id: 'older', updatedAt: 10}),
        baseSession({id: 'newer', updatedAt: 20}),
      ]),
    );

    await expect(listUploadSessions()).resolves.toEqual([
      expect.objectContaining({id: 'newer'}),
      expect.objectContaining({id: 'older'}),
    ]);
  });

  test('upserts and retrieves a session by id', async () => {
    const first = baseSession({id: 'sess-1', updatedAt: 10});
    const updated = {...first, phase: 'processing' as const, updatedAt: 25};

    await upsertUploadSession(first);
    await upsertUploadSession(updated);

    await expect(getUploadSession('sess-1')).resolves.toEqual(updated);
    await expect(listUploadSessions()).resolves.toEqual([updated]);
  });

  test('removes a stored session', async () => {
    await upsertUploadSession(baseSession({id: 'sess-1'}));
    await upsertUploadSession(baseSession({id: 'sess-2'}));

    await removeUploadSession('sess-1');

    await expect(getUploadSession('sess-1')).resolves.toBeNull();
    await expect(listUploadSessions()).resolves.toEqual([
      expect.objectContaining({id: 'sess-2'}),
    ]);
  });
});
