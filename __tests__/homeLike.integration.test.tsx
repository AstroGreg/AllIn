import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

const mockGetHomeOverview = jest.fn();
const mockGetPosts = jest.fn();
const mockGetNotifications = jest.fn();
const mockGetProfileSummaryById = jest.fn();
const mockGetProfileSummary = jest.fn();
const mockRecordDownload = jest.fn();
const mockTogglePostLike = jest.fn();
const mockToggleMediaLike = jest.fn();
const mockCreateMediaIssueRequest = jest.fn();

const stableT = (value: string) => value;

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
    i18n: {language: 'en'},
  }),
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(() => callback(), [callback]);
    },
    useIsFocused: () => true,
  };
});

jest.mock('../src/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primaryColor: '#3C82F6',
      pureWhite: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      cardBackground: '#FFFFFF',
      mainTextColor: '#171717',
      subTextColor: '#898989',
      borderColor: '#E0ECFE',
      grayColor: '#777777',
      lightGrayColor: '#D9D9D9',
      btnBackgroundColor: '#F3F6FA',
      secondaryColor: '#F5F7FA',
      errorColor: '#D32F2F',
      whiteColor: '#FFFFFF',
      modalBackground: '#FFFFFF',
    },
  }),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    apiAccessToken: 'api-token',
    user: {
      picture: 'https://example.com/avatar.jpg',
      name: 'Viewer Name',
      nickname: 'viewer',
      givenName: 'Viewer',
      familyName: 'Name',
    },
    userProfile: {
      firstName: 'Viewer',
      lastName: 'Name',
      username: 'viewer.name',
    },
  }),
}));

jest.mock('../src/context/EventsContext', () => ({
  useEvents: () => ({
    eventNameById: () => null,
  }),
}));

jest.mock('../src/constants/RuntimeConfig', () => ({
  getApiBaseUrl: () => 'https://api.example.com',
  getHlsBaseUrl: () => 'https://cdn.example.com',
}));

jest.mock('../src/constants/AppConfig', () => ({
  AppConfig: {
    INSTAGRAM_APP_ID: '',
  },
}));

jest.mock('../src/screens/home/HomeStyles', () => ({
  createStyles: () =>
    new Proxy(
      {},
      {
        get: () => ({}),
      },
    ),
}));

jest.mock('../src/screens/home/components/Header', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockHeader() {
    return React.createElement(View, {testID: 'home-header'});
  };
});

jest.mock('../src/constants/SizeBox', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockSizeBox(props: any) {
    return React.createElement(View, props);
  };
});

jest.mock('../src/constants/Icons', () => {
  const React = require('react');
  const {View} = require('react-native');
  const MockIcon = (props: any) => React.createElement(View, props);
  const iconBag = {
    ShareBlue: {uri: 'icon://share'},
  } as Record<string, any>;
  return {
    __esModule: true,
    default: new Proxy(iconBag, {
      get: (target, key) => {
        const value = target[String(key)];
        return value ?? MockIcon;
      },
    }),
  };
});

jest.mock('../src/constants/Images', () => ({
  __esModule: true,
  default: {
    profilePic: {uri: 'placeholder://profile'},
    photo1: {uri: 'placeholder://photo1'},
    photo3: {uri: 'placeholder://photo3'},
  },
}));

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const {Image} = require('react-native');
  return function MockFastImage(props: any) {
    return React.createElement(Image, props);
  };
});

jest.mock('react-native-video', () => {
  const React = require('react');
  const {View} = require('react-native');
  return React.forwardRef((props: any, _ref: any) => React.createElement(View, props));
});

jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockSlider(props: any) {
    return React.createElement(View, props);
  };
});

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {
    open: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('react-native-fs', () => ({
  downloadFile: jest.fn(() => ({promise: Promise.resolve({statusCode: 200})})),
  unlink: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn().mockResolvedValue(false),
  CachesDirectoryPath: '/tmp',
}));

jest.mock('@react-native-camera-roll/camera-roll', () => ({
  __esModule: true,
  default: {
    save: jest.fn().mockResolvedValue('saved://ok'),
  },
}));

jest.mock('../src/components/share/InstagramStoryComposer', () => ({
  useInstagramStoryImageComposer: () => ({
    composeInstagramStoryImage: jest.fn().mockResolvedValue(undefined),
    composerElement: null,
  }),
}));

jest.mock('../src/components/shimmerEffect/ShimmerEffect', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockShimmerEffect(props: any) {
    return React.createElement(View, props);
  };
});

jest.mock('../src/i18n', () => ({
  translateText: (value: string) => value,
}));

jest.mock('../src/screens/home/components/NewsFeedCard', () => {
  const React = require('react');
  const {Text, TouchableOpacity, View} = require('react-native');
  return function MockNewsFeedCard({
    title,
    likesLabel,
    onToggleLike,
  }: {
    title: string;
    likesLabel?: string;
    onToggleLike?: () => void;
  }) {
    const id = String(title).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    return React.createElement(
      View,
      {testID: `news-card-${id}`},
      React.createElement(Text, null, title),
      React.createElement(Text, {testID: `likes-${id}`}, likesLabel ?? ''),
      React.createElement(
        TouchableOpacity,
        {
          testID: `toggle-like-${id}`,
          onPress: () => onToggleLike?.(),
        },
        React.createElement(Text, null, 'Toggle Like'),
      ),
    );
  };
});

jest.mock('../src/services/apiGateway', () => ({
  getHomeOverview: (...args: any[]) => mockGetHomeOverview(...args),
  getPosts: (...args: any[]) => mockGetPosts(...args),
  getNotifications: (...args: any[]) => mockGetNotifications(...args),
  getProfileSummaryById: (...args: any[]) => mockGetProfileSummaryById(...args),
  getProfileSummary: (...args: any[]) => mockGetProfileSummary(...args),
  recordDownload: (...args: any[]) => mockRecordDownload(...args),
  togglePostLike: (...args: any[]) => mockTogglePostLike(...args),
  toggleMediaLike: (...args: any[]) => mockToggleMediaLike(...args),
  createMediaIssueRequest: (...args: any[]) => mockCreateMediaIssueRequest(...args),
  ApiError: class MockApiError extends Error {
    status: number;
    body?: any;
    constructor({status, message, body}: {status: number; message: string; body?: any}) {
      super(message);
      this.status = status;
      this.body = body;
    }
  },
}));

const HomeScreen = require('../src/screens/home/HomeScreen').default;

function createNavigation() {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };
}

describe('HomeScreen like integration', () => {
  beforeAll(() => {
    if (typeof global.requestAnimationFrame !== 'function') {
      global.requestAnimationFrame = (callback: FrameRequestCallback) =>
        setTimeout(() => callback(0), 0) as unknown as number;
    }
  });

  beforeEach(() => {
    mockGetHomeOverview.mockReset();
    mockGetPosts.mockReset();
    mockGetNotifications.mockReset();
    mockGetProfileSummaryById.mockReset();
    mockGetProfileSummary.mockReset();
    mockRecordDownload.mockReset();
    mockTogglePostLike.mockReset();
    mockToggleMediaLike.mockReset();
    mockCreateMediaIssueRequest.mockReset();

    const postId = 'post-like-1';
    const title = 'Homepage Like Story';
    const nowIso = new Date().toISOString();
    mockGetHomeOverview.mockResolvedValue({
      ok: true,
      profile_id: 'profile-viewer',
      overview: {
        video: null,
        photo: null,
        blog: null,
        feed_posts: [
          {
            post: {
              id: postId,
              title,
              summary: 'summary',
              description: 'description',
              created_at: nowIso,
              reading_time_minutes: 1,
              likes_count: 0,
              views_count: 0,
              liked_by_me: false,
            },
            author: {
              profile_id: 'profile-author',
              display_name: 'Author Name',
              avatar_url: null,
            },
            media: null,
            media_items: [
              {
                media_id: 'media-preview-1',
                type: 'image',
                thumbnail_url: 'https://example.com/thumb-1.jpg',
              },
            ],
          },
        ],
      },
    });

    mockGetPosts.mockResolvedValue({ok: true, posts: []});
    mockGetNotifications.mockResolvedValue({
      ok: true,
      count: 0,
      unread_count: 0,
      notifications: [],
    });
    mockGetProfileSummary.mockResolvedValue({
      ok: true,
      profile_id: 'profile-viewer',
      profile: {avatar_url: null},
      posts_count: 0,
      followers_count: 0,
    });
    mockGetProfileSummaryById.mockResolvedValue({
      ok: true,
      profile_id: 'profile-author',
      profile: {avatar_url: null},
    });
    mockRecordDownload.mockResolvedValue({ok: true});
    mockToggleMediaLike.mockResolvedValue({
      ok: true,
      media_id: 'media-1',
      liked: true,
      likes_count: 1,
    });
    mockCreateMediaIssueRequest.mockResolvedValue({ok: true});
    mockTogglePostLike.mockResolvedValue({
      ok: true,
      post_id: postId,
      liked: true,
      likes_count: 1,
    });
  });

  test('tapping like updates homescreen post likes after API success', async () => {
    render(<HomeScreen navigation={createNavigation()} />);

    await waitFor(() => {
      expect(screen.getByText('Homepage Like Story')).toBeTruthy();
      expect(screen.getByText('0 likes')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('toggle-like-homepage-like-story'));

    await waitFor(() => {
      expect(mockTogglePostLike).toHaveBeenCalledWith('api-token', 'post-like-1');
    });

    await waitFor(() => {
      expect(screen.getByText('1 likes')).toBeTruthy();
    });
  }, 20000);

  test('home overview only uses friend feed posts and never raw competition overview media', async () => {
    render(<HomeScreen navigation={createNavigation()} />);

    await waitFor(() => {
      expect(mockGetHomeOverview).toHaveBeenCalledWith('api-token', 'me');
    });

    expect(screen.getByText('Homepage Like Story')).toBeTruthy();
    expect(mockGetHomeOverview.mock.calls[0]).toEqual(['api-token', 'me']);
    expect(mockGetHomeOverview.mock.results[0]).toBeTruthy();
  });
});
