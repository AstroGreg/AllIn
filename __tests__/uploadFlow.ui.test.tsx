import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

const mockStorage = new Map<string, string>();
const mockGetWorkerHealth = jest.fn();
const mockLaunchImageLibrary = jest.fn();
const mockMkdir = jest.fn();
const mockCopyFile = jest.fn();
const mockStat = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage.set(key, value);
    }),
    multiRemove: jest.fn(),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock('../src/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primaryColor: '#3C82F6',
      pureWhite: '#FFFFFF',
      whiteColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      mainTextColor: '#171717',
      subTextColor: '#898989',
      grayColor: '#777777',
      lightGrayColor: '#D9D9D9',
      btnBackgroundColor: '#F3F6FA',
    },
  }),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    apiAccessToken: 'api-token',
  }),
}));

jest.mock('../src/constants/SizeBox', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockSizeBox(props: any) {
    return React.createElement(View, props);
  };
});

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { Image } = require('react-native');
  return function MockFastImage(props: any) {
    return React.createElement(Image, props);
  };
});

jest.mock('react-native-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockVideo(props: any) {
    return React.createElement(View, props);
  };
});

jest.mock('../src/constants/Icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props: any) => React.createElement(View, props);
  return {
    __esModule: true,
    default: new Proxy(
      {},
      {
        get: () => MockIcon,
      },
    ),
  };
});

jest.mock('iconsax-react-nativejs', () => {
  const React = require('react');
  const { View } = require('react-native');
  const createIcon = () => (props: any) => React.createElement(View, props);
  return {
    ArrowLeft2: createIcon(),
    ArrowRight: createIcon(),
    Ghost: createIcon(),
  };
});

jest.mock('../src/services/apiGateway', () => ({
  ApiError: class MockApiError extends Error {},
  getWorkerHealth: (...args: any[]) => mockGetWorkerHealth(...args),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: (...args: any[]) => mockLaunchImageLibrary(...args),
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/documents',
  mkdir: (...args: any[]) => mockMkdir(...args),
  copyFile: (...args: any[]) => mockCopyFile(...args),
  stat: (...args: any[]) => mockStat(...args),
}));

const UploadSummaryScreen = require('../src/screens/upload/UploadSummaryScreen').default;
const UploadDetailsScreen = require('../src/screens/upload/UploadDetailsScreen').default;

function textChildren(node: any): string {
  const value = node?.props?.children;
  if (Array.isArray(value)) return value.join('');
  return String(value ?? '');
}

function createDeferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('upload flow screens', () => {
  beforeAll(() => {
    (global as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0);
  });

  beforeEach(() => {
    mockStorage.clear();
    mockGetWorkerHealth.mockReset();
    mockLaunchImageLibrary.mockReset();
    mockMkdir.mockReset();
    mockCopyFile.mockReset();
    mockStat.mockReset();
    mockMkdir.mockResolvedValue(undefined);
    mockStat.mockResolvedValue({ size: 0 });
    mockGetWorkerHealth.mockResolvedValue({
      ok: true,
      workers: {
        media: { ok: true },
        ai: { ok: true },
        search: { ok: true },
        notifications: { ok: true },
        face: { ok: true, mode: 'local_fallback' },
      },
    });
  });

  test('UploadSummaryScreen blocks starting upload when a worker is unavailable', async () => {
    mockStorage.set(
      '@upload_assets_event-22',
      JSON.stringify({
        sprint: [
          {
            uri: 'file:///tmp/merksem_4x400m-mixed.MOV',
            type: 'video/quicktime',
            fileName: 'merksem_4x400m-mixed.MOV',
            title: '',
            price_cents: 500,
            price_currency: 'EUR',
          },
        ],
      }),
    );
    mockGetWorkerHealth.mockResolvedValue({
      ok: false,
      message: 'Upload blocked. Workers unavailable: media',
      workers: {
        media: { ok: false, reason: 'stale' },
        ai: { ok: true },
        search: { ok: true },
        notifications: { ok: true },
        face: { ok: true, mode: 'local_fallback' },
      },
    });

    const navigation = { goBack: jest.fn(), navigate: jest.fn() };

    render(
      <UploadSummaryScreen
        navigation={navigation}
        route={{ params: { competition: { id: 'event-22' }, anonymous: false } }}
      />,
    );

    await waitFor(() => {
      expect(textChildren(screen.getByTestId('upload-worker-health-text'))).toContain('Upload blocked. Workers unavailable: media');
    });

    const startButton = screen.getByTestId('upload-start-button');
    fireEvent.press(startButton);
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(screen.getByText('Merksem 4x400m Mixed')).toBeTruthy();
  });

  test('UploadSummaryScreen lets you change the price amount for a selected upload', async () => {
    mockStorage.set(
      '@upload_assets_event-55',
      JSON.stringify({
        sprint: [
          {
            uri: 'file:///tmp/track-photo.JPG',
            type: 'image/jpeg',
            fileName: 'track-photo.JPG',
            title: '',
            price_cents: 100,
            price_currency: 'EUR',
            width: 1200,
            height: 900,
          },
        ],
      }),
    );

    const navigation = { goBack: jest.fn(), navigate: jest.fn() };

    render(
      <UploadSummaryScreen
        navigation={navigation}
        route={{ params: { competition: { id: 'event-55' }, anonymous: false } }}
      />,
    );

    const priceInput = await screen.findByTestId('upload-summary-price-input-sprint-1');
    fireEvent.changeText(priceInput, '0.55');
    fireEvent(priceInput, 'blur');

    await waitFor(() => {
      const raw = mockStorage.get('@upload_assets_event-55');
      expect(raw).toBeTruthy();
      const parsed = raw ? JSON.parse(raw) : null;
      expect(parsed.sprint[0].price_cents).toBe(55);
    });
  });

  test('UploadDetailsScreen shows a blocking preparing overlay with formatted file name while copying local media', async () => {
    const deferredCopy = createDeferred<void>();
    mockLaunchImageLibrary.mockResolvedValue({
      assets: [
        {
          uri: 'file:///private/tmp/IMG_2026-03-15 00-55-33.JPG',
          type: 'image/jpeg',
          fileName: 'IMG_2026-03-15 00-55-33.JPG',
          width: 1200,
          height: 900,
        },
      ],
    });
    mockCopyFile.mockReturnValue(deferredCopy.promise);

    const navigation = { goBack: jest.fn(), navigate: jest.fn() };

    render(
      <UploadDetailsScreen
        navigation={navigation}
        route={{ params: { competition: { id: 'event-99' }, category: { name: 'Sprint' } } }}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('upload-browse-files-button'));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('upload-preparing-overlay')).toBeTruthy();
    });
    expect(screen.getByTestId('upload-preparing-title')).toBeTruthy();
    expect(textChildren(screen.getByTestId('upload-preparing-name'))).toContain('Img 2026 03 15 00 55 33');

    await act(async () => {
      deferredCopy.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('upload-preparing-overlay')).toBeNull();
    });
    await waitFor(() => {
      expect(screen.getByTestId('upload-selected-assets-ready')).toBeTruthy();
    });
  });

  test('UploadDetailsScreen skips oversized files before preparation starts', async () => {
    const navigation = { goBack: jest.fn(), navigate: jest.fn() };

    mockLaunchImageLibrary.mockResolvedValue({
      assets: [
        {
          uri: 'file:///private/tmp/HUGE_VIDEO.MOV',
          type: 'video/quicktime',
          fileName: 'HUGE_VIDEO.MOV',
          fileSize: 1024 * 1024 * 1024 + 1,
        },
      ],
    });

    render(
      <UploadDetailsScreen
        navigation={navigation}
        route={{ params: { competition: { id: 'event-99' }, category: { name: 'sprint' } } }}
      />,
    );

    fireEvent.press(screen.getByTestId('upload-browse-files-button'));

    await waitFor(() => {
      expect(screen.getByTestId('upload-size-error')).toBeTruthy();
    });
    expect(screen.queryByTestId('upload-preparing-overlay')).toBeNull();
    expect(screen.queryByTestId('upload-selected-assets-ready')).toBeNull();
    expect(screen.getByText(/Max upload size is 1 GB/)).toBeTruthy();
  });

  test('UploadDetailsScreen keeps valid files when a mixed selection includes oversized media', async () => {
    const navigation = { goBack: jest.fn(), navigate: jest.fn() };

    mockLaunchImageLibrary.mockResolvedValue({
      assets: [
        {
          uri: 'file:///private/tmp/track_photo.JPG',
          type: 'image/jpeg',
          fileName: 'track_photo.JPG',
          fileSize: 2 * 1024 * 1024,
        },
        {
          uri: 'file:///private/tmp/HUGE_VIDEO.MOV',
          type: 'video/quicktime',
          fileName: 'HUGE_VIDEO.MOV',
          fileSize: 1024 * 1024 * 1024 + 1,
        },
      ],
    });
    mockCopyFile.mockResolvedValue(undefined);

    render(
      <UploadDetailsScreen
        navigation={navigation}
        route={{ params: { competition: { id: 'event-100' }, category: { name: 'sprint' } } }}
      />,
    );

    fireEvent.press(screen.getByTestId('upload-browse-files-button'));

    await waitFor(() => {
      expect(screen.getByTestId('upload-selected-assets-ready')).toBeTruthy();
    });

    expect(screen.getByText('Selected 1 files')).toBeTruthy();
    expect(screen.getByTestId('upload-size-error')).toBeTruthy();
    expect(screen.getByText(/Skipped Huge Video/)).toBeTruthy();
  });
});
