import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text, TouchableOpacity, View} from 'react-native';

const mockStorage = new Map<string, string>();
const mockGetUploadSession = jest.fn();
const mockUpsertUploadSession = jest.fn();
const mockGetMediaStatus = jest.fn();
const mockUploadMediaBatch = jest.fn();
const mockUploadMediaBatchWatermark = jest.fn();
const mockExists = jest.fn();
const mockMkdir = jest.fn();
const mockCopyFile = jest.fn();

const mockAuthState = {
  apiAccessToken: 'api-token',
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage.set(key, value);
    }),
    multiRemove: jest.fn(async (keys: string[]) => {
      keys.forEach((key) => mockStorage.delete(key));
    }),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock('iconsax-react-nativejs', () => {
  const React = require('react');
  const {View} = require('react-native');
  const createIcon = (name: string) => {
    const Icon = (props: any) => React.createElement(View, {...props, accessibilityLabel: name});
    Icon.displayName = name;
    return Icon;
  };
  return {
    ArrowLeft2: createIcon('ArrowLeft2'),
  };
});

jest.mock('../src/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primaryColor: '#3C82F6',
      backgroundColor: '#FFFFFF',
      cardBackground: '#FFFFFF',
      mainTextColor: '#171717',
      subTextColor: '#898989',
      btnBackgroundColor: '#F3F6FA',
    },
  }),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

jest.mock('../src/constants/SizeBox', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockSizeBox(props: any) {
    return React.createElement(View, props);
  };
});

jest.mock('../src/services/uploadSessions', () => ({
  getUploadSession: (...args: any[]) => mockGetUploadSession(...args),
  upsertUploadSession: (...args: any[]) => mockUpsertUploadSession(...args),
}));

jest.mock('../src/services/apiGateway', () => {
  class MockApiError extends Error {
    status: number;
    body?: any;

    constructor({status, message, body}: {status: number; message: string; body?: any}) {
      super(message);
      this.status = status;
      this.body = body;
    }
  }

  return {
    ApiError: MockApiError,
    getMediaStatus: (...args: any[]) => mockGetMediaStatus(...args),
    uploadMediaBatch: (...args: any[]) => mockUploadMediaBatch(...args),
    uploadMediaBatchWatermark: (...args: any[]) => mockUploadMediaBatchWatermark(...args),
  };
});

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: 'C:/documents',
  copyFile: (...args: any[]) => mockCopyFile(...args),
  exists: (...args: any[]) => mockExists(...args),
  mkdir: (...args: any[]) => mockMkdir(...args),
}));

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockFastImage(props: any) {
    return React.createElement(View, props);
  };
});

const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const UploadProgressScreen = require('../src/screens/upload/UploadProgressScreen').default;

function textValue(node: ReactTestRenderer.ReactTestInstance) {
  const children = node.props.children;
  if (Array.isArray(children)) return children.join('');
  return String(children ?? '');
}

function findTextValues(root: ReactTestRenderer.ReactTestInstance) {
  return root.findAllByType(Text).map(textValue);
}

async function flushEffects(times = 1) {
  for (let i = 0; i < times; i += 1) {
    await act(async () => {
      await new Promise((resolve) => setImmediate(resolve));
    });
  }
}

describe('UploadProgressScreen', () => {
  beforeEach(() => {
    mockStorage.clear();
    mockAuthState.apiAccessToken = 'api-token';

    mockGetUploadSession.mockReset();
    mockUpsertUploadSession.mockReset();
    mockGetMediaStatus.mockReset();
    mockUploadMediaBatch.mockReset();
    mockUploadMediaBatchWatermark.mockReset();
    mockExists.mockReset();
    mockMkdir.mockReset();
    mockCopyFile.mockReset();

    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.multiRemove.mockClear();

    mockExists.mockResolvedValue(true);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('restores a processing session and finishes polling when media is ready', async () => {
    mockGetUploadSession.mockResolvedValue({
      id: 'sess-1',
      competitionId: 'event-1',
      createdAt: 1,
      updatedAt: 1,
      anonymous: false,
      phase: 'processing',
      media_ids: ['media-1', 'media-2'],
    });
    mockGetMediaStatus.mockResolvedValue({
      results: [
        {media_id: 'media-1', steps: {transforms_done: true, embeddings_done: true}},
        {media_id: 'media-2', steps: {transforms_done: true, embeddings_done: true}},
      ],
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    const navigation = {
      goBack: jest.fn(),
      reset: jest.fn(),
    };

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <UploadProgressScreen
          navigation={navigation}
          route={{params: {competition: {id: 'event-1'}, sessionId: 'sess-1', autoStart: false}}}
        />,
      );
    });
    await flushEffects(4);

    expect(mockGetMediaStatus).toHaveBeenCalledWith('api-token', ['media-1', 'media-2']);
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      '@upload_assets_event-1',
      '@upload_counts_event-1',
      '@upload_session_event-1',
    ]);
    expect(findTextValues(renderer!.root)).toContain('Done');
    expect(findTextValues(renderer!.root)).toContain('OK');
  });

  test('uploads persisted assets, switches to processing, and clears the upload draft', async () => {
    mockGetUploadSession.mockResolvedValue(null);
    mockUploadMediaBatchWatermark.mockResolvedValue({
      results: [{ok: true, media_id: 'media-1'}],
    });
    mockGetMediaStatus.mockResolvedValue({
      results: [
        {media_id: 'media-1', steps: {transforms_done: true, embeddings_done: true}},
      ],
    });

    mockStorage.set(
      '@upload_assets_event-7',
      JSON.stringify({
        podium: [
          {
            uri: 'file://C:/media/photo 1.jpg',
            type: 'image/jpeg',
            fileName: 'photo 1.jpg',
            price_cents: 499,
            price_currency: 'EUR',
          },
        ],
      }),
    );

    let renderer: ReactTestRenderer.ReactTestRenderer;
    const navigation = {
      goBack: jest.fn(),
      reset: jest.fn(),
    };

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <UploadProgressScreen
          navigation={navigation}
          route={{
            params: {
              anonymous: true,
              competition: {id: 'event-7'},
              watermarkText: 'ALLIN',
            },
          }}
        />,
      );
    });
    await flushEffects(6);

    expect(mockUploadMediaBatchWatermark).toHaveBeenCalledWith(
      'api-token',
      expect.objectContaining({
        event_id: 'event-7',
        files: [
          expect.objectContaining({
            name: 'photo 1.jpg',
            type: 'image/jpeg',
            uri: 'file://C:/media/photo 1.jpg',
          }),
        ],
        is_anonymous: true,
        price_cents: 499,
        price_currency: 'EUR',
        watermark_text: 'ALLIN',
      }),
    );
    expect(mockGetMediaStatus).toHaveBeenCalledWith('api-token', ['media-1']);
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      '@upload_assets_event-7',
      '@upload_counts_event-7',
    ]);
    expect(mockUpsertUploadSession).toHaveBeenCalledWith(
      expect.objectContaining({
        competitionId: 'event-7',
        media_ids: ['media-1'],
        phase: 'done',
        processing_ready: 1,
        processing_total: 1,
      }),
    );
    expect(findTextValues(renderer!.root)).toContain('Done');
  });
});
