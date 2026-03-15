import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

const mockGetCompetitionPublicMedia = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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
      backgroundColor: '#FFFFFF',
      cardBackground: '#FFFFFF',
      mainTextColor: '#171717',
      subTextColor: '#6B7280',
      lightGrayColor: '#D9D9D9',
      secondaryColor: '#F3F6FA',
      secondaryBlueColor: '#EDF4FF',
      btnBackgroundColor: '#F3F6FA',
      pureWhite: '#FFFFFF',
      borderColor: '#DCE7F8',
      whiteColor: '#FFFFFF',
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
  return function MockSizeBox() {
    return null;
  };
});

jest.mock('../src/components/customHeader/CustomHeader', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockCustomHeader(props: any) {
    return React.createElement(View, props);
  };
});

jest.mock('../src/constants/Icons', () => ({
  PlayCricle: () => null,
}));

jest.mock('../src/constants/Images', () => ({
  photo7: 7,
}));

jest.mock('../src/constants/RuntimeConfig', () => ({
  getHlsBaseUrl: () => 'https://cdn.example.test',
}));

jest.mock('../src/services/apiGateway', () => ({
  getCompetitionPublicMedia: (...args: any[]) => mockGetCompetitionPublicMedia(...args),
  getHubAppearanceMedia: jest.fn(),
}));

const AllPhotosOfEvents =
  require('../src/screens/search/searchScreens/AllPhotosOfCompetitions').default;
const AllVideosOfEvents =
  require('../src/screens/search/searchScreens/AllVideosOfCompetitions').default;

describe('competition media filters', () => {
  beforeEach(() => {
    mockGetCompetitionPublicMedia.mockReset();
    mockGetCompetitionPublicMedia.mockResolvedValue([]);
  });

  test('passes selected category labels when loading photos', async () => {
    render(
      <AllPhotosOfEvents
        navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
        route={{
          params: {
            eventName: 'BK CadSch',
            eventId: 'competition-1',
            competitionId: 'competition-1',
            disciplineId: 'discipline-1',
            categoryLabel: 'Cadet',
            categoryLabels: ['Cadet'],
          },
        }}
      />,
    );

    await waitFor(() => {
      expect(mockGetCompetitionPublicMedia).toHaveBeenCalledWith(
        'api-token',
        'competition-1',
        expect.objectContaining({
          type: 'image',
          discipline_id: 'discipline-1',
          category_labels: ['Cadet'],
        }),
      );
    });
  });

  test('passes selected category labels when loading videos', async () => {
    render(
      <AllVideosOfEvents
        navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
        route={{
          params: {
            eventName: 'BK CadSch',
            eventId: 'competition-1',
            competitionId: 'competition-1',
            disciplineId: 'discipline-1',
            categoryLabel: 'Miniem',
            categoryLabels: ['Miniem'],
          },
        }}
      />,
    );

    await waitFor(() => {
      expect(mockGetCompetitionPublicMedia).toHaveBeenCalledWith(
        'api-token',
        'competition-1',
        expect.objectContaining({
          type: 'video',
          discipline_id: 'discipline-1',
          category_labels: ['Miniem'],
        }),
      );
    });
  });
});
