import React from 'react';
import {TextInput, View} from 'react-native';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

const mockSearchEvents = jest.fn();
const mockSearchGroups = jest.fn();
const mockSearchProfiles = jest.fn();
const mockGetGroupMembers = jest.fn();
const mockGetProfileSummary = jest.fn();
const mockGetProfileSummaryById = jest.fn();
const mockFollowProfile = jest.fn();
const mockUnfollowProfile = jest.fn();
const stableT = (value: string) => value;

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
  }),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  return function MockDateTimePicker() {
    return null;
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
    },
  }),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    apiAccessToken: 'api-token',
    user: {
      picture: 'https://example.com/google-avatar.jpg',
    },
  }),
}));

jest.mock('../src/constants/RuntimeConfig', () => ({
  getApiBaseUrl: () => 'https://api.example.com',
}));

jest.mock('../src/screens/search/SearchStyles', () => ({
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
    default: {
      AiBlueBordered: MockIcon,
      TrackFieldLogo: MockIcon,
      PersonRunningColorful: MockIcon,
      Run: MockIcon,
    },
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
    const Icon = (props: any) => React.createElement(View, {
      ...props,
      accessibilityLabel: name,
    });
    Icon.displayName = name;
    return Icon;
  };
  return {
    SearchNormal1: createIcon('SearchNormal1'),
    Calendar: createIcon('Calendar'),
    Location: createIcon('Location'),
    CloseCircle: createIcon('CloseCircle'),
    Clock: createIcon('Clock'),
    ArrowDown2: createIcon('ArrowDown2'),
    Camera: createIcon('Camera'),
  };
});

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const {Image} = require('react-native');
  return function MockFastImage(props: any) {
    return React.createElement(Image, props);
  };
});

jest.mock('../src/components/unifiedSearchInput/UnifiedSearchInput', () => {
  const React = require('react');
  const {TextInput, View} = require('react-native');
  return React.forwardRef(function MockUnifiedSearchInput(props: any, ref: any) {
    const {value, onChangeText, placeholder} = props;
    return React.createElement(
      View,
      null,
      React.createElement(TextInput, {
        ref,
        testID: 'search-input',
        value,
        onChangeText,
        placeholder,
      }),
    );
  });
});

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
    searchEvents: (...args: any[]) => mockSearchEvents(...args),
    searchGroups: (...args: any[]) => mockSearchGroups(...args),
    searchProfiles: (...args: any[]) => mockSearchProfiles(...args),
    getGroupMembers: (...args: any[]) => mockGetGroupMembers(...args),
    getProfileSummary: (...args: any[]) => mockGetProfileSummary(...args),
    getProfileSummaryById: (...args: any[]) => mockGetProfileSummaryById(...args),
    followProfile: (...args: any[]) => mockFollowProfile(...args),
    unfollowProfile: (...args: any[]) => mockUnfollowProfile(...args),
  };
});

const SearchScreen = require('../src/screens/search/SearchScreen').default;

function createNavigation() {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };
}

describe('SearchScreen UI', () => {
  beforeAll(() => {
    if (typeof global.requestAnimationFrame !== 'function') {
      global.requestAnimationFrame = (callback: FrameRequestCallback) =>
        setTimeout(() => callback(0), 0) as unknown as number;
    }
  });

  beforeEach(() => {
    mockSearchEvents.mockReset();
    mockSearchGroups.mockReset();
    mockSearchProfiles.mockReset();
    mockGetGroupMembers.mockReset();
    mockGetProfileSummary.mockReset();
    mockGetProfileSummaryById.mockReset();
    mockFollowProfile.mockReset();
    mockUnfollowProfile.mockReset();

    mockSearchEvents.mockResolvedValue({
      events: [
        {
          event_id: 'evt-1',
          event_name: 'Brussels City Run',
          event_date: '2026-03-01',
          event_location: 'Brussels',
          competition_type: 'road',
        },
      ],
    });
    mockSearchGroups.mockResolvedValue({groups: []});
    mockSearchProfiles.mockResolvedValue({profiles: []});
    mockGetGroupMembers.mockResolvedValue({members: []});
    mockGetProfileSummary.mockResolvedValue({profile_id: 'own-profile-id'});
    mockGetProfileSummaryById.mockResolvedValue({
      profile: {
        avatar_url: null,
      },
    });
    mockFollowProfile.mockResolvedValue({ok: true});
    mockUnfollowProfile.mockResolvedValue({ok: true});
  });

  test('shows latest competitions by default and hides Results section', async () => {
    render(<SearchScreen navigation={createNavigation()} />);

    await waitFor(() => {
      expect(screen.getByText('Latest competitions')).toBeTruthy();
    });

    expect(screen.queryByText('Results')).toBeNull();
    expect(screen.getByText('Brussels City Run')).toBeTruthy();
  });

  test('orders result sections with Groups first when Group filter is active', async () => {
    mockSearchGroups.mockResolvedValue({
      groups: [
        {
          group_id: 'group-1',
          name: 'Leuven Runners',
          member_count: 5,
          location: 'Leuven',
        },
      ],
    });
    mockSearchProfiles.mockResolvedValue({
      profiles: [
        {
          profile_id: 'profile-2',
          display_name: 'Mila Runner',
          selected_events: ['track-field'],
        },
      ],
    });

    render(<SearchScreen navigation={createNavigation()} />);

    fireEvent.press(screen.getByText('Group'));
    fireEvent.changeText(screen.getByTestId('search-input'), 'Leuven');

    await waitFor(() => {
      expect(screen.getByText('Results')).toBeTruthy();
      expect(screen.getByText('Groups')).toBeTruthy();
      expect(screen.getByText('People')).toBeTruthy();
    });

    const sectionTitles = screen
      .getAllByText(/^(Groups|People)$/)
      .map(node => String(node.props.children));
    expect(sectionTitles[0]).toBe('Groups');
  });

  test('does not show Follow button for own profile search result', async () => {
    mockGetProfileSummary.mockResolvedValue({profile_id: 'profile-own'});
    mockSearchProfiles.mockResolvedValue({
      profiles: [
        {
          profile_id: 'profile-own',
          display_name: 'Own User',
          selected_events: ['track-field'],
        },
      ],
    });

    render(<SearchScreen navigation={createNavigation()} />);

    fireEvent.press(screen.getByText('Person'));
    fireEvent.changeText(screen.getByTestId('search-input'), 'Own');

    await waitFor(() => {
      expect(screen.getByText('Own User')).toBeTruthy();
    });

    expect(screen.queryByText('Follow')).toBeNull();
    expect(screen.queryByText('Following')).toBeNull();
  });

  test('person filter shows the searched user first in frontend results', async () => {
    mockSearchProfiles.mockResolvedValue({
      profiles: [
        {
          profile_id: 'profile-target',
          display_name: 'Alex Runner',
          selected_events: ['road-events'],
        },
        {
          profile_id: 'profile-other',
          display_name: 'Alex Coach',
          selected_events: ['track-field'],
        },
      ],
    });

    render(<SearchScreen navigation={createNavigation()} />);

    fireEvent.press(screen.getByText('Person'));
    fireEvent.changeText(screen.getByTestId('search-input'), 'Alex');

    await waitFor(() => {
      expect(screen.getByText('Results')).toBeTruthy();
      expect(screen.getByText('People')).toBeTruthy();
      expect(screen.getByText('Alex Runner')).toBeTruthy();
      expect(screen.getByText('Alex Coach')).toBeTruthy();
    });

    const orderedPeople = screen
      .getAllByText(/^(Alex Runner|Alex Coach)$/)
      .map(node => String(node.props.children));

    expect(orderedPeople[0]).toBe('Alex Runner');
  });

  test('competition filter shows the searched competition first in frontend results', async () => {
    mockSearchEvents.mockResolvedValue({
      events: [
        {
          event_id: 'evt-target',
          event_name: 'City Championship',
          event_date: '2026-05-10',
          event_location: 'Brussels',
          competition_type: 'track',
        },
        {
          event_id: 'evt-other',
          event_name: 'City Fun Run',
          event_date: '2026-04-10',
          event_location: 'Brussels',
          competition_type: 'road',
        },
      ],
    });

    render(<SearchScreen navigation={createNavigation()} />);

    fireEvent.press(screen.getByText('Competition'));
    fireEvent.changeText(screen.getByTestId('search-input'), 'City');

    await waitFor(() => {
      expect(screen.getByText('Results')).toBeTruthy();
      expect(screen.getByText('Competitions')).toBeTruthy();
      expect(screen.getByText('City Championship')).toBeTruthy();
      expect(screen.getByText('City Fun Run')).toBeTruthy();
    });

    const orderedCompetitions = screen
      .getAllByText(/^(City Championship|City Fun Run)$/)
      .map(node => String(node.props.children));

    expect(orderedCompetitions[0]).toBe('City Championship');
  });

  test('group filter shows the searched group first in frontend results', async () => {
    mockSearchGroups.mockResolvedValue({
      groups: [
        {
          group_id: 'group-target',
          name: 'Apex Runners',
          member_count: 8,
          location: 'Brussels',
        },
        {
          group_id: 'group-other',
          name: 'Bravo Runners',
          member_count: 5,
          location: 'Brussels',
        },
      ],
    });

    render(<SearchScreen navigation={createNavigation()} />);

    fireEvent.press(screen.getByText('Group'));
    fireEvent.changeText(screen.getByTestId('search-input'), 'Runners');

    await waitFor(() => {
      expect(screen.getByText('Results')).toBeTruthy();
      expect(screen.getByText('Groups')).toBeTruthy();
      expect(screen.getByText('Apex Runners')).toBeTruthy();
      expect(screen.getByText('Bravo Runners')).toBeTruthy();
    });

    const orderedGroups = screen
      .getAllByText(/^(Apex Runners|Bravo Runners)$/)
      .map(node => String(node.props.children));

    expect(orderedGroups[0]).toBe('Apex Runners');
  });

  test('location filter shows the searched location competition first in frontend results', async () => {
    mockSearchEvents.mockResolvedValue({
      events: [
        {
          event_id: 'evt-loc-target',
          event_name: 'Leuven Spring Classic',
          event_date: '2026-05-12',
          event_location: 'Leuven',
          competition_type: 'road',
        },
        {
          event_id: 'evt-loc-other',
          event_name: 'Leuven Night Run',
          event_date: '2026-04-12',
          event_location: 'Leuven',
          competition_type: 'road',
        },
      ],
    });

    render(<SearchScreen navigation={createNavigation()} />);

    fireEvent.press(screen.getByText('Location'));
    fireEvent.changeText(screen.getByTestId('search-input'), 'Leuven');

    await waitFor(() => {
      expect(screen.getByText('Results')).toBeTruthy();
      expect(screen.getByText('Competitions')).toBeTruthy();
      expect(screen.getByText('Leuven Spring Classic')).toBeTruthy();
      expect(screen.getByText('Leuven Night Run')).toBeTruthy();
    });

    const orderedCompetitions = screen
      .getAllByText(/^(Leuven Spring Classic|Leuven Night Run)$/)
      .map(node => String(node.props.children));

    expect(orderedCompetitions[0]).toBe('Leuven Spring Classic');
  });
});
