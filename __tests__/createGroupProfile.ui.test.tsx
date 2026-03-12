import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

jest.useFakeTimers();

const stableT = (value: string) => value;

const mockCreateGroup = jest.fn();
const mockGetGroup = jest.fn();
const mockGetMediaById = jest.fn();
const mockInviteGroupMember = jest.fn();
const mockSearchClubs = jest.fn();
const mockSearchGroups = jest.fn();
const mockSearchProfiles = jest.fn();
const mockUploadMediaBatch = jest.fn();
const mockUpdateGroup = jest.fn();

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
    People: createIcon('People'),
    Edit2: createIcon('Edit2'),
    SearchNormal1: createIcon('SearchNormal1'),
    Add: createIcon('Add'),
    CloseCircle: createIcon('CloseCircle'),
    Profile2User: createIcon('Profile2User'),
  };
});

jest.mock('../src/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primaryColor: '#3C82F6',
      whiteColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      mainTextColor: '#171717',
      subTextColor: '#898989',
      grayColor: '#777777',
      lightGrayColor: '#D9D9D9',
      secondaryColor: '#F5F7FA',
      btnBackgroundColor: '#EEF4FF',
      borderColor: '#E0ECFE',
      cardBackground: '#FFFFFF',
      errorColor: '#D32F2F',
    },
  }),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    apiAccessToken: 'api-token',
    authBootstrap: {
      profile_id: 'viewer-profile-id',
    },
  }),
}));

jest.mock('../src/constants/RuntimeConfig', () => ({
  getApiBaseUrl: () => 'https://api.example.com',
}));

jest.mock('../src/components/profile/SportFocusIcon', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockSportFocusIcon(props: any) {
    return React.createElement(View, props);
  };
});

jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    reset: (payload: any) => ({type: 'RESET', payload}),
  },
}));

jest.mock('../src/services/apiGateway', () => ({
  createGroup: (...args: any[]) => mockCreateGroup(...args),
  getGroup: (...args: any[]) => mockGetGroup(...args),
  getMediaById: (...args: any[]) => mockGetMediaById(...args),
  inviteGroupMember: (...args: any[]) => mockInviteGroupMember(...args),
  searchClubs: (...args: any[]) => mockSearchClubs(...args),
  searchGroups: (...args: any[]) => mockSearchGroups(...args),
  searchProfiles: (...args: any[]) => mockSearchProfiles(...args),
  uploadMediaBatch: (...args: any[]) => mockUploadMediaBatch(...args),
  updateGroup: (...args: any[]) => mockUpdateGroup(...args),
}));

const CreateGroupProfileScreen = require('../src/screens/createGroupProfile/CreateGroupProfileScreen').default;

describe('CreateGroupProfileScreen', () => {
  beforeEach(() => {
    mockCreateGroup.mockReset();
    mockGetGroup.mockReset();
    mockGetMediaById.mockReset();
    mockInviteGroupMember.mockReset();
    mockSearchClubs.mockReset();
    mockSearchGroups.mockReset();
    mockSearchProfiles.mockReset();
    mockUploadMediaBatch.mockReset();
    mockUpdateGroup.mockReset();

    mockCreateGroup.mockResolvedValue({
      ok: true,
      group: {
        group_id: 'group-123',
      },
    });
    mockSearchGroups.mockResolvedValue({groups: []});
    mockSearchClubs.mockResolvedValue({clubs: []});
    mockSearchProfiles.mockResolvedValue({profiles: []});
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('create mode does not expose self-add controls or send self-join payloads', async () => {
    const navigation = {
      goBack: jest.fn(),
      dispatch: jest.fn(),
    };

    render(
      <CreateGroupProfileScreen
        navigation={navigation}
        route={{params: {mode: 'create'}}}
      />,
    );

    expect(screen.queryByText('Add me as athlete')).toBeNull();
    expect(screen.queryByText('Add Members')).toBeNull();

    fireEvent.changeText(screen.getByPlaceholderText('Enter group name'), 'Night Runners');
    fireEvent.changeText(screen.getByPlaceholderText('City'), 'Leuven');

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    fireEvent.press(screen.getAllByText('Create Group').at(-1)!);

    await waitFor(() => expect(mockCreateGroup).toHaveBeenCalledTimes(1));

    const [, payload] = mockCreateGroup.mock.calls[0];
    expect(payload).not.toHaveProperty('owner_public_roles');
    expect(mockInviteGroupMember).not.toHaveBeenCalled();
    expect(mockSearchProfiles).not.toHaveBeenCalled();
  });
});
