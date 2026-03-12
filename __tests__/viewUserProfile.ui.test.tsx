import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

const stableT = (value: string) => value;

const mockFollowProfile = jest.fn();
const mockGetPosts = jest.fn();
const mockGetProfileCollections = jest.fn();
const mockGetProfileSummary = jest.fn();
const mockGetProfileSummaryById = jest.fn();
const mockGetProfileTimeline = jest.fn();
const mockUnfollowProfile = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
  }),
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
      whiteColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      mainTextColor: '#171717',
      grayColor: '#777777',
      btnBackgroundColor: '#EEF4FF',
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
    ArrowLeft2: createIcon('ArrowLeft2'),
    Clock: createIcon('Clock'),
    DocumentText: createIcon('DocumentText'),
    Gallery: createIcon('Gallery'),
  };
});

jest.mock('../src/components/profileTimeline/ProfileTimeline', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockProfileTimeline() {
    return React.createElement(View, {testID: 'view-profile-timeline-mock'});
  };
});

jest.mock('../src/components/profileNews/ProfileNewsSection', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return function MockProfileNewsSection({sectionTitle}: {sectionTitle: string}) {
    return React.createElement(Text, null, sectionTitle);
  };
});

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    apiAccessToken: 'api-token',
  }),
}));

jest.mock('../src/constants/RuntimeConfig', () => ({
  getApiBaseUrl: () => 'https://api.example.com',
}));

jest.mock('../src/services/apiGateway', () => ({
  followProfile: (...args: any[]) => mockFollowProfile(...args),
  getPosts: (...args: any[]) => mockGetPosts(...args),
  getProfileCollections: (...args: any[]) => mockGetProfileCollections(...args),
  getProfileSummary: (...args: any[]) => mockGetProfileSummary(...args),
  getProfileSummaryById: (...args: any[]) => mockGetProfileSummaryById(...args),
  getProfileTimeline: (...args: any[]) => mockGetProfileTimeline(...args),
  unfollowProfile: (...args: any[]) => mockUnfollowProfile(...args),
}));

const ViewUserProfileScreen = require('../src/screens/viewUserProfile/ViewUserProfileScreen').default;

function createNavigation() {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };
}

describe('ViewUserProfileScreen UI', () => {
  beforeEach(() => {
    mockFollowProfile.mockReset();
    mockGetPosts.mockReset();
    mockGetProfileCollections.mockReset();
    mockGetProfileSummary.mockReset();
    mockGetProfileSummaryById.mockReset();
    mockGetProfileTimeline.mockReset();
    mockUnfollowProfile.mockReset();

    mockFollowProfile.mockResolvedValue({ok: true});
    mockUnfollowProfile.mockResolvedValue({ok: true});
    mockGetPosts.mockResolvedValue({posts: []});
    mockGetProfileCollections.mockResolvedValue({collections: []});
    mockGetProfileTimeline.mockResolvedValue({items: []});
  });

  test('shows Follow for another profile and toggles to Following', async () => {
    mockGetProfileSummary.mockResolvedValue({profile_id: 'viewer-1'});
    mockGetProfileSummaryById.mockResolvedValue({
      profile_id: 'target-1',
      is_following: false,
      followers_count: 12,
      profile: {
        display_name: 'Target User',
        username: 'targetuser',
        selected_events: ['track-field'],
        groups: [],
      },
    });

    const navigation = createNavigation();
    render(
      <ViewUserProfileScreen
        navigation={navigation}
        route={{params: {profileId: 'target-1'}}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Follow')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Follow'));

    await waitFor(() => {
      expect(mockFollowProfile).toHaveBeenCalledWith('api-token', 'target-1');
      expect(screen.getByText('Following')).toBeTruthy();
    });
  });

  test('hides Follow button for own profile view', async () => {
    mockGetProfileSummary.mockResolvedValue({profile_id: 'same-profile'});
    mockGetProfileSummaryById.mockResolvedValue({
      profile_id: 'same-profile',
      is_following: false,
      followers_count: 4,
      profile: {
        display_name: 'Same User',
        username: 'sameuser',
        selected_events: [],
        groups: [],
      },
    });

    const navigation = createNavigation();
    render(
      <ViewUserProfileScreen
        navigation={navigation}
        route={{params: {profileId: 'same-profile'}}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Followers')).toBeTruthy();
    });

    expect(screen.queryByText('Follow')).toBeNull();
    expect(screen.queryByText('Following')).toBeNull();
  });

  test('renders official club inline without navigating to a group screen', async () => {
    mockGetProfileSummary.mockResolvedValue({profile_id: 'viewer-1'});
    mockGetProfileSummaryById.mockResolvedValue({
      profile_id: 'target-2',
      is_following: false,
      followers_count: 9,
      profile: {
        display_name: 'Club User',
        username: 'clubuser',
        selected_events: ['track-field'],
        track_field_club: 'Leuven Athletics',
        chest_numbers_by_year: {'2026': 101},
        groups: [
          {
            group_id: 'group-9',
            name: 'Leuven Athletics',
            is_official_club: true,
            official_club_code: 'LEUVEN',
          },
        ],
      },
    });

    const navigation = createNavigation();
    render(
      <ViewUserProfileScreen
        navigation={navigation}
        route={{params: {profileId: 'target-2'}}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Leuven Athl/i)).toBeTruthy();
    });

    expect(navigation.navigate).not.toHaveBeenCalledWith('GroupProfileScreen', expect.anything());
  });
});
