import React from 'react';
import {Image, Text, View} from 'react-native';
import {render, screen, waitFor} from '@testing-library/react-native';

const mockGetPostById = jest.fn();
const mockRecordPostView = jest.fn();
const mockTogglePostLike = jest.fn();
const mockDeletePost = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (value: string) => value,
    i18n: {language: 'en'},
  }),
}));

jest.mock('../src/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primaryColor: '#3C82F6',
      pureWhite: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      mainTextColor: '#171717',
      subTextColor: '#898989',
      borderColor: '#E0ECFE',
      lightGrayColor: '#D9D9D9',
      btnBackgroundColor: '#EEF4FF',
      secondaryColor: '#F5F7FA',
    },
  }),
}));

jest.mock('../src/context/EventsContext', () => ({
  useEvents: () => ({
    eventNameById: () => null,
  }),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    apiAccessToken: 'api-token',
  }),
}));

jest.mock('../src/constants/RuntimeConfig', () => ({
  getApiBaseUrl: () => 'https://api.example.com',
}));

jest.mock('../src/screens/viewUserBlogDetails/ViewUserBlogDetailsScreenStyles', () => ({
  createStyles: () =>
    new Proxy(
      {},
      {
        get: () => ({}),
      },
    ),
}));

jest.mock('../src/constants/SizeBox', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockSizeBox(props: any) {
    return React.createElement(View, props);
  };
});

jest.mock('../src/constants/Images', () => ({
  __esModule: true,
  default: {
    profile1: {uri: 'placeholder://profile'},
  },
}));

jest.mock('../src/constants/Icons', () => ({
  __esModule: true,
  default: {
    LanguageSetting: () => null,
    ShareBlue: {uri: 'icon://share'},
    PlayCricle: () => null,
  },
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
    Heart: createIcon('Heart'),
    Edit2: createIcon('Edit2'),
    Trash: createIcon('Trash'),
  };
});

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const {Image} = require('react-native');
  return function MockFastImage(props: any) {
    return React.createElement(Image, props);
  };
});

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {
    open: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../src/i18n', () => ({
  translateText: (value: string) => value,
}));

jest.mock('../src/services/apiGateway', () => ({
  getPostById: (...args: any[]) => mockGetPostById(...args),
  recordPostView: (...args: any[]) => mockRecordPostView(...args),
  togglePostLike: (...args: any[]) => mockTogglePostLike(...args),
  deletePost: (...args: any[]) => mockDeletePost(...args),
}));

const ViewUserBlogDetailsScreen = require('../src/screens/viewUserBlogDetails/ViewUserBlogDetailsScreen').default;

describe('ViewUserBlogDetailsScreen post view integration', () => {
  beforeEach(() => {
    mockGetPostById.mockReset();
    mockRecordPostView.mockReset();
    mockTogglePostLike.mockReset();
    mockDeletePost.mockReset();

    mockGetPostById.mockResolvedValue({
      ok: true,
      post: {
        id: 'post-1',
        title: 'Post Detail Story',
        description: 'Post body',
        likes_count: 0,
        liked_by_me: false,
        views_count: 0,
        created_at: new Date().toISOString(),
      },
      author: {
        profile_id: 'profile-author',
        display_name: 'Author',
        avatar_url: null,
      },
      media: [],
    });

    mockRecordPostView.mockResolvedValue({
      ok: true,
      post_id: 'post-1',
      views_count: 1,
    });
    mockTogglePostLike.mockResolvedValue({
      ok: true,
      post_id: 'post-1',
      liked: true,
      likes_count: 1,
    });
    mockDeletePost.mockResolvedValue({ok: true});
  });

  test('opening detail records view request for DB persistence', async () => {
    render(
      <ViewUserBlogDetailsScreen
        navigation={{goBack: jest.fn(), navigate: jest.fn()}}
        route={{
          params: {
            postId: 'post-1',
            postPreview: {
              id: 'post-1',
              title: 'Post Detail Story',
              description: 'Post body',
              likes_count: 0,
              liked_by_me: false,
              views_count: 0,
            },
          },
        }}
      />,
    );

    await waitFor(() => {
      expect(mockRecordPostView).toHaveBeenCalledWith('api-token', 'post-1');
    });

    await waitFor(() => {
      expect(screen.getByText('Post Detail Story')).toBeTruthy();
    });
  });
});
