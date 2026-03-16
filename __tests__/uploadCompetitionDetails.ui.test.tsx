import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

const mockGetEventCompetitions = jest.fn();
const mockGetCompetitionMaps = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    multiRemove: jest.fn(async () => undefined),
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
      secondaryColor: '#F6F8FB',
      cardBackground: '#FFFFFF',
    },
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

jest.mock('react-native-svg', () => ({
  SvgUri: () => null,
}));

jest.mock('iconsax-react-nativejs', () => {
  const React = require('react');
  const { View } = require('react-native');
  const createIcon = () => (props: any) => React.createElement(View, props);
  return {
    ArrowLeft2: createIcon(),
    Ghost: createIcon(),
    Trash: createIcon(),
  };
});

jest.mock('../src/services/apiGateway', () => ({
  ApiError: class MockApiError extends Error {},
  getEventCompetitions: (...args: any[]) => mockGetEventCompetitions(...args),
  getCompetitionMaps: (...args: any[]) => mockGetCompetitionMaps(...args),
}));

const UploadCompetitionDetailsScreen =
  require('../src/screens/upload/CompetitionDetailsScreen').default;

describe('upload competition details', () => {
  beforeEach(() => {
    mockGetEventCompetitions.mockReset();
    mockGetCompetitionMaps.mockReset();
    mockGetEventCompetitions.mockResolvedValue({
      competitions: [
        {
          id: 'discipline-road-1',
          competition_name: 'Road course',
          competition_type: 'road-events',
          discipline_group: 'road',
          competition_focus: 'road-events',
        },
      ],
    });
    mockGetCompetitionMaps.mockResolvedValue({
      ok: true,
      count: 1,
      maps: [
        {
          id: 'map-1',
          competition_id: 'discipline-road-1',
          name: '5K',
          checkpoints: [
            { id: 'cp-start', checkpoint_index: 0, label: 'Start' },
            { id: 'cp-finish', checkpoint_index: 1, label: 'Finish' },
          ],
        },
        {
          id: 'map-2',
          competition_id: 'discipline-road-1',
          name: '10K',
          checkpoints: [
            { id: 'cp-10k-start', checkpoint_index: 0, label: 'Start' },
            { id: 'cp-10k-finish', checkpoint_index: 1, label: 'Finish' },
          ],
        },
      ],
    });
  });

  test('keeps route choices visible for non-track uploads and opens a checkpoint modal before upload', async () => {
    const navigation = { goBack: jest.fn(), navigate: jest.fn() };

    render(
      <UploadCompetitionDetailsScreen
        navigation={navigation}
        route={{
          params: {
            competition: {
              id: 'event-road-1',
              name: 'Cycling demo',
              competition_focus: 'road-events',
              competition_type: 'road-events',
            },
            competitionFocus: 'road-events',
            competitionType: 'road-events',
          },
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Choose a route')).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText('5K')).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText('10K')).toBeTruthy();
    });
    expect(screen.queryByText('Road course')).toBeNull();

    fireEvent.press(screen.getByText('5K'));
    await waitFor(() => {
      expect(screen.getByText('Select checkpoint')).toBeTruthy();
    });
    expect(screen.queryByText('Category')).toBeNull();
    await waitFor(() => {
      expect(screen.getByText('Start')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Start'));
    fireEvent.press(screen.getByTestId('upload-discipline-continue'));

    expect(navigation.navigate).toHaveBeenCalledWith(
      'UploadDetailsScreen',
      expect.objectContaining({
        discipline_id: 'discipline-road-1',
        competition_map_id: 'map-1',
        checkpoint_id: 'cp-start',
        checkpoint_label: 'Start',
      }),
    );
  });
});
