import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';

const stableT = (value: string) => value;
const mockUseAuth = jest.fn();
const mockGetProfileSummary = jest.fn();
const mockSearchClubs = jest.fn(() => new Promise(() => {}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
  }),
}));

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { Image } = require('react-native');
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
      errorColor: '#D32F2F',
    },
  }),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../src/services/apiGateway', () => ({
  getGroup: jest.fn(),
  getProfileSummary: (...args: any[]) => mockGetProfileSummary(...args),
  searchClubs: (...args: any[]) => mockSearchClubs(...args),
}));

jest.mock('../src/components/profile/ChestNumbersByYearField', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockChestNumbersByYearField() {
    return React.createElement(View, { testID: 'chest-numbers-field' });
  };
});

jest.mock('../src/components/profile/SearchPickerModal', () => {
  const React = require('react');
  return function MockSearchPickerModal() {
    return null;
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

jest.mock('../src/constants/Images', () => ({
  __esModule: true,
  default: {
    athleteDetails: { uri: 'placeholder://athlete' },
  },
}));

jest.mock('iconsax-react-nativejs', () => {
  const React = require('react');
  const { View } = require('react-native');
  const createIcon = () => (props: any) => React.createElement(View, props);
  return {
    ArrowLeft2: createIcon(),
    ArrowRight: createIcon(),
    Buildings: createIcon(),
    CloseCircle: createIcon(),
    Global: createIcon(),
    Profile2User: createIcon(),
    User: createIcon(),
  };
});

jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    reset: jest.fn((payload: any) => payload),
  },
}));

jest.mock('../src/utils/navigationResets', () => ({
  buildBottomTabUserProfileReset: jest.fn(() => ({ index: 0, routes: [] })),
}));

const CompleteAthleteDetailsScreen = require('../src/screens/completeAthleteDetails/CompleteAthleteDetailsScreen').default;
const AuthCompleteAthleteDetailsScreen = require('../src/screens/authFlow/completeAthleteDetails/CompleteAthleteDetailsScreen').default;
const TrackFieldSettings = require('../src/screens/menu/menuScreens/TrackFieldSettings').default;

const INVITE_ONLY_COPY = 'Join a group through an invitation link. Group membership cannot be added from this profile flow.';

function createNavigation() {
  return {
    goBack: jest.fn(),
    dispatch: jest.fn(),
    navigate: jest.fn(),
  };
}

describe('athlete group access', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockGetProfileSummary.mockReset();
    mockSearchClubs.mockClear();
    mockUseAuth.mockReturnValue({
      apiAccessToken: 'token-123',
      updateUserProfile: jest.fn(),
      userProfile: {
        selectedEvents: ['track-field'],
        mainDisciplines: { 'track-field': '800m' },
        runningClubGroupId: '',
      },
    });
    mockGetProfileSummary.mockResolvedValue({
      profile: {
        chest_numbers_by_year: {},
        track_field_club: '',
        running_club_group_id: '',
        website: '',
        main_disciplines: { 'track-field': '800m' },
        track_field_main_event: '800m',
      },
    });
  });

  test('standard athlete onboarding keeps the group field invite-only', () => {
    render(
      <CompleteAthleteDetailsScreen
        navigation={createNavigation()}
        route={{ params: { selectedEvents: ['track-field'] } }}
      />,
    );

    expect(screen.queryByTestId('profile-athlete-group-picker-open')).toBeNull();
    expect(screen.getByTestId('profile-athlete-group-invite-only')).toBeTruthy();
    expect(screen.getByText(INVITE_ONLY_COPY)).toBeTruthy();
  });

  test('auth athlete onboarding keeps the group field invite-only', () => {
    render(
      <AuthCompleteAthleteDetailsScreen
        navigation={createNavigation()}
        route={{ params: { selectedEvents: ['track-field'], flowSelectedEvents: ['track-field'] } }}
      />,
    );

    expect(screen.queryByTestId('profile-athlete-group-picker-open')).toBeNull();
    expect(screen.getByTestId('profile-athlete-group-invite-only')).toBeTruthy();
    expect(screen.getByText(INVITE_ONLY_COPY)).toBeTruthy();
  });

  test('track field settings shows invite-only group copy for persisted athlete focus', async () => {
    render(
      <TrackFieldSettings
        navigation={createNavigation()}
        route={{ params: { focusId: 'track-field' } }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('track-field-group-invite-only')).toBeTruthy();
    });
    expect(screen.getByText(INVITE_ONLY_COPY)).toBeTruthy();
  });
});
