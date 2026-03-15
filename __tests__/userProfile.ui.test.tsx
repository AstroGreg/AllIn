import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

const stableT = (value: string) => value;
const mockStorage = new Map<string, string>();

const mockDeletePost = jest.fn();
const mockGetDownloadsSummary = jest.fn();
const mockGetHubAppearanceMedia = jest.fn();
const mockGetHubAppearances = jest.fn();
const mockGetMyGroups = jest.fn();
const mockProfileNewsSection = jest.fn();
const mockGetPosts = jest.fn();
const mockGetProfileCollectionByType = jest.fn();
const mockGetProfileSummary = jest.fn();
const mockGetProfileTimeline = jest.fn();
const mockGetSubscribedEvents = jest.fn();
const mockGetUploadedCompetitions = jest.fn();
const mockUpdateProfileSummary = jest.fn();
const mockUploadMediaBatch = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      mockStorage.delete(key);
    }),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
  }),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const {Image} = require('react-native');
  return function MockFastImage(props: any) {
    return React.createElement(Image, props);
  };
});

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
      secondaryColor: '#F5F7FA',
      btnBackgroundColor: '#EEF4FF',
      modalBackground: '#FFFFFF',
      errorColor: '#D32F2F',
    },
  }),
}));

jest.mock('../src/screens/userProfile/UserProfileStyles', () => ({
  createStyles: () =>
    new Proxy(
      {},
      {
        get: () => ({}),
      },
    ),
}));

jest.mock('../src/constants/Icons', () => {
  const React = require('react');
  const {View} = require('react-native');
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

jest.mock('../src/constants/Images', () => ({
  __esModule: true,
  default: {
    profilePic: {uri: 'placeholder://profile'},
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
    User: createIcon('User'),
    Edit2: createIcon('Edit2'),
    Clock: createIcon('Clock'),
    ArrowRight: createIcon('ArrowRight'),
    DocumentText: createIcon('DocumentText'),
    Add: createIcon('Add'),
    Gallery: createIcon('Gallery'),
    DocumentDownload: createIcon('DocumentDownload'),
  };
});

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(() => callback(), [callback]);
    },
  };
});

jest.mock('../src/components/profileTimeline/ProfileTimeline', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockProfileTimeline() {
    return React.createElement(View, {testID: 'profile-timeline-mock'});
  };
});

jest.mock('../src/components/profileNews/ProfileNewsSection', () => {
  const React = require('react');
  const {Text, View} = require('react-native');
  return function MockProfileNewsSection({
    sectionTitle,
    items = [],
    }: {
      sectionTitle: string;
      items?: Array<{id: string; title: string; status?: string | null}>;
    }) {
      mockProfileNewsSection({sectionTitle, items});
      return React.createElement(
        View,
        null,
      React.createElement(Text, null, sectionTitle),
      ...(items || []).map((item) =>
        React.createElement(
          View,
          {key: item.id},
          React.createElement(Text, null, item.title),
          item.status ? React.createElement(Text, null, item.status) : null,
        ),
      ),
    );
  };
});

const mockAuthState = {
  user: {
    picture: 'https://example.com/google-avatar.jpg',
    sub: 'auth0|viewer',
    email: 'viewer@example.com',
  },
  authBootstrap: {
    status: 'ready',
    has_profiles: false,
    profile_id: null,
  },
  userProfile: {
    username: 'viewer',
    selectedEvents: [],
  },
  apiAccessToken: 'api-token',
  updateUserProfile: jest.fn(),
};

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

jest.mock('../src/constants/RuntimeConfig', () => ({
  getApiBaseUrl: () => 'https://api.example.com',
}));

jest.mock('../src/services/apiGateway', () => ({
  deletePost: (...args: any[]) => mockDeletePost(...args),
  getDownloadsSummary: (...args: any[]) => mockGetDownloadsSummary(...args),
  getHubAppearanceMedia: (...args: any[]) => mockGetHubAppearanceMedia(...args),
  getHubAppearances: (...args: any[]) => mockGetHubAppearances(...args),
  getMyGroups: (...args: any[]) => mockGetMyGroups(...args),
  getPosts: (...args: any[]) => mockGetPosts(...args),
  getProfileCollectionByType: (...args: any[]) => mockGetProfileCollectionByType(...args),
  getProfileSummary: (...args: any[]) => mockGetProfileSummary(...args),
  getProfileTimeline: (...args: any[]) => mockGetProfileTimeline(...args),
  getSubscribedEvents: (...args: any[]) => mockGetSubscribedEvents(...args),
  getUploadedCompetitions: (...args: any[]) => mockGetUploadedCompetitions(...args),
  updateProfileSummary: (...args: any[]) => mockUpdateProfileSummary(...args),
  uploadMediaBatch: (...args: any[]) => mockUploadMediaBatch(...args),
}));

const UserProfileScreen = require('../src/screens/userProfile/UserProfileScreen').default;

function createNavigation() {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };
}

describe('UserProfileScreen UI', () => {
  beforeEach(() => {
    mockStorage.clear();
    mockAuthState.authBootstrap = {
      status: 'ready',
      has_profiles: false,
      profile_id: null,
    };
    mockAuthState.userProfile = {
      username: 'viewer',
      selectedEvents: [],
    };

    mockDeletePost.mockReset();
    mockGetDownloadsSummary.mockReset();
    mockGetHubAppearanceMedia.mockReset();
    mockGetHubAppearances.mockReset();
    mockGetMyGroups.mockReset();
    mockProfileNewsSection.mockReset();
    mockGetPosts.mockReset();
    mockGetProfileCollectionByType.mockReset();
    mockGetProfileSummary.mockReset();
    mockGetProfileTimeline.mockReset();
    mockGetSubscribedEvents.mockReset();
    mockGetUploadedCompetitions.mockReset();
    mockUpdateProfileSummary.mockReset();
    mockUploadMediaBatch.mockReset();

    mockGetProfileTimeline.mockResolvedValue({items: []});
    mockGetMyGroups.mockResolvedValue({groups: []});
    mockGetPosts.mockResolvedValue({posts: []});
    mockGetProfileCollectionByType.mockResolvedValue({items: []});
    mockGetSubscribedEvents.mockResolvedValue({events: []});
    mockGetHubAppearances.mockResolvedValue({items: []});
    mockGetDownloadsSummary.mockResolvedValue({
      total_downloads: 0,
      total_views: 0,
      total_profit_cents: 0,
    });
    mockGetUploadedCompetitions.mockResolvedValue({competitions: []});
    mockUpdateProfileSummary.mockResolvedValue({});
    mockUploadMediaBatch.mockResolvedValue({});
    mockDeletePost.mockResolvedValue({});
    mockGetHubAppearanceMedia.mockResolvedValue({results: []});
  });

  test('shows empty profile state and routes to add flow when no linked profiles exist', async () => {
    mockGetProfileSummary.mockRejectedValue(new Error('not found'));

    const navigation = createNavigation();
    render(<UserProfileScreen navigation={navigation} route={{params: {}}} />);

    await waitFor(() => {
      expect(screen.getByText('No profiles yet')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('+'));
    expect(navigation.navigate).toHaveBeenCalledWith('CategorySelectionScreen', {fromAddFlow: true});
  });

  test('keeps a sparse real profile visible after remount', async () => {
    mockAuthState.authBootstrap = {
      status: 'ready',
      has_profiles: true,
      profile_id: 'profile-sparse-1',
    };
    mockAuthState.userProfile = {
      username: 'viewer',
      firstName: 'Sparse',
      lastName: 'Runner',
      selectedEvents: [],
    };
    mockGetProfileSummary.mockResolvedValue({
      ok: true,
      profile_id: 'profile-sparse-1',
      followers_count: 0,
      posts_count: 0,
      profile: {
        display_name: 'Sparse Runner',
        username: 'viewer',
        selected_events: [],
        groups: [],
      },
    });

    const navigation = createNavigation();
    const route = {params: {}};
    const firstRender = render(<UserProfileScreen navigation={navigation} route={route} />);

    await waitFor(() => {
      expect(screen.getByTestId('user-profile-screen')).toBeTruthy();
    });
    expect(screen.queryByTestId('user-profile-empty-state')).toBeNull();

    firstRender.unmount();

    render(<UserProfileScreen navigation={navigation} route={route} />);

    await waitFor(() => {
      expect(screen.getByTestId('user-profile-screen')).toBeTruthy();
    });
    expect(screen.queryByTestId('user-profile-empty-state')).toBeNull();
  });

  test('renders profile meta for track athlete', async () => {
    mockGetProfileSummary.mockResolvedValue({
      profile_id: 'profile-1',
      followers_count: 42,
      profile: {
        selected_events: ['track-field'],
        nationality: 'BE',
        chest_numbers_by_year: {'2026': 123},
        track_field_main_event: '100m',
        track_field_club: 'Leuven Athletics',
        groups: [
          {
            group_id: 'group-1',
            name: 'Leuven Athletics',
            is_official_club: true,
            official_club_code: 'LEUVEN',
          },
        ],
      },
    });

    render(<UserProfileScreen navigation={createNavigation()} route={{params: {}}} />);

    await waitFor(() => {
      expect(screen.getByText('Followers')).toBeTruthy();
      expect(screen.getByText('Track & Field')).toBeTruthy();
    });
  });

  test('shows uploading status for blog items whose media is still processing', async () => {
    mockAuthState.authBootstrap = {
      status: 'ready',
      has_profiles: true,
      profile_id: 'profile-blog-1',
    };
    mockGetProfileSummary.mockResolvedValue({
      ok: true,
      profile_id: 'profile-blog-1',
      followers_count: 3,
      posts_count: 1,
      profile: {
        display_name: 'Blog Runner',
        username: 'blog.runner',
        selected_events: ['track-field'],
        groups: [],
      },
    });
    mockGetPosts.mockResolvedValue({
      posts: [
        {
          id: 'post-uploading-1',
          title: 'Race recap',
          description: 'Pending media processing',
          post_type: 'blog',
          created_at: new Date().toISOString(),
          media_count: 2,
          cover_media: null,
        },
      ],
    });

    render(<UserProfileScreen navigation={createNavigation()} route={{params: {}}} />);
    fireEvent.press(screen.getByText('News'));

    await waitFor(() => {
      expect(screen.getByText('Race recap')).toBeTruthy();
      expect(mockProfileNewsSection).toHaveBeenCalled();
    });
    const sawUploadingItem = mockProfileNewsSection.mock.calls.some(([props]) =>
      Array.isArray(props?.items) && props.items.some((item: any) => item?.title === 'Race recap' && item?.status === 'UPLOADING'),
    );
    expect(sawUploadingItem).toBe(true);
  });

  test('shows joined group in the compact meta summary on profile', async () => {
    mockGetProfileSummary.mockResolvedValue({
      profile_id: 'profile-join-1',
      followers_count: 10,
      profile: {
        selected_events: ['track-field'],
        nationality: 'BE',
        chest_numbers_by_year: {'2026': 321},
        track_field_main_event: '400m',
        groups: [
          {
            group_id: 'group-2',
            name: 'Morning Group',
            is_official_club: false,
          },
        ],
      },
    });

    const navigation = createNavigation();
    render(<UserProfileScreen navigation={navigation} route={{params: {}}} />);

    await waitFor(() => {
      expect(screen.getByText('400 m')).toBeTruthy();
      expect(screen.getByText(/Morning Gro/i)).toBeTruthy();
    });
  });
});
