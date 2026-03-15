import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';

const mockGetEventCompetitions = jest.fn();
const mockGetCompetitionMaps = jest.fn();
const mockGetProfileSummary = jest.fn();
const mockSearchFaceByEnrollment = jest.fn();
const mockSearchEvents = jest.fn();
const mockSearchMediaByBib = jest.fn();
const mockGrantFaceRecognitionConsent = jest.fn();
const mockUnsubscribeToEvent = jest.fn();

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
    userProfile: {
      faceVerified: true,
      faceConsentGranted: true,
      chestNumbersByYear: {},
    },
  }),
}));

jest.mock('../src/context/EventsContext', () => ({
  useEvents: () => ({
    events: [],
    refresh: jest.fn(),
  }),
}));

jest.mock('../src/constants/SizeBox', () => {
  const React = require('react');
  return function MockSizeBox() {
    return null;
  };
});

jest.mock('../src/components/e2e/E2EPerfReady', () => {
  const React = require('react');
  return function MockE2EPerfReady() {
    return null;
  };
});

jest.mock('../src/constants/RuntimeConfig', () => ({
  getApiBaseUrl: () => 'https://api.spot-me.ai',
}));

jest.mock('react-native-fast-image', () => 'FastImage');

jest.mock('iconsax-react-nativejs', () => {
  const React = require('react');
  const { View } = require('react-native');
  const createIcon = (name: string) => {
    const Icon = (props: any) => React.createElement(View, { ...props, accessibilityLabel: name });
    Icon.displayName = name;
    return Icon;
  };
  return {
    ArrowLeft2: createIcon('ArrowLeft2'),
    ArrowRight: createIcon('ArrowRight'),
    Ghost: createIcon('Ghost'),
    Trash: createIcon('Trash'),
  };
});

jest.mock('../src/constants/Icons', () => ({
  AiBlueBordered: () => null,
  AiWhiteBordered: () => null,
}));

jest.mock('../src/services/apiGateway', () => {
  class MockApiError extends Error {
    status: number;
    body?: any;

    constructor({ status, message, body }: { status: number; message: string; body?: any }) {
      super(message);
      this.status = status;
      this.body = body;
    }
  }

  return {
    ApiError: MockApiError,
    getCompetitionMaps: (...args: any[]) => mockGetCompetitionMaps(...args),
    getEventCompetitions: (...args: any[]) => mockGetEventCompetitions(...args),
    getProfileSummary: (...args: any[]) => mockGetProfileSummary(...args),
    grantFaceRecognitionConsent: (...args: any[]) => mockGrantFaceRecognitionConsent(...args),
    searchEvents: (...args: any[]) => mockSearchEvents(...args),
    searchFaceByEnrollment: (...args: any[]) => mockSearchFaceByEnrollment(...args),
    searchMediaByBib: (...args: any[]) => mockSearchMediaByBib(...args),
    unsubscribeToEvent: (...args: any[]) => mockUnsubscribeToEvent(...args),
  };
});

const CompetitionDetailsScreen =
  require('../src/screens/search/searchScreens/CompetitionDetailsScreen').default;

describe('Competition AI quick compare', () => {
  beforeEach(() => {
    mockGetEventCompetitions.mockReset();
    mockGetCompetitionMaps.mockReset();
    mockGetProfileSummary.mockReset();
    mockSearchFaceByEnrollment.mockReset();
    mockSearchEvents.mockReset();
    mockSearchMediaByBib.mockReset();
    mockGrantFaceRecognitionConsent.mockReset();
    mockUnsubscribeToEvent.mockReset();

    mockGetEventCompetitions.mockResolvedValue({
      competitions: [
        {
          id: 'disc-1',
          competition_name: '4x400 m relay',
          competition_type: 'track',
          discipline_group: 'track',
          competition_focus: 'track-field',
        },
      ],
    });
    mockGetCompetitionMaps.mockResolvedValue({ maps: [] });
    mockGetProfileSummary.mockResolvedValue({
      profile: {
        chest_numbers_by_year: {},
        face_verified: true,
        face_consent_granted: true,
      },
    });
    mockSearchFaceByEnrollment.mockResolvedValue({
      results: [{ media_id: 'media-1' }],
    });
    mockSearchMediaByBib.mockResolvedValue({ results: [] });
  });

  test('shows face grades in quick compare and forwards the selected grade', async () => {
    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
    };

    render(
      <CompetitionDetailsScreen
        navigation={navigation}
        route={{
          params: {
            name: 'BVV Merksem',
            eventId: 'evt-1',
            competitionId: 'evt-1',
            competitionType: 'track',
            competitionFocus: 'track-field',
            date: '2026-03-15',
            location: 'Merksem',
          },
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('competition-ai-quick-open')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('competition-ai-quick-open'));

    await waitFor(() => {
      expect(screen.getByTestId('competition-ai-quick-modal')).toBeTruthy();
      expect(screen.getByTestId('competition-ai-quick-grade-hard')).toBeTruthy();
      expect(screen.getByTestId('competition-ai-quick-grade-medium')).toBeTruthy();
      expect(screen.getByTestId('competition-ai-quick-grade-soft')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('competition-ai-quick-grade-soft'));
    fireEvent.press(screen.getByText('Compare now'));

    await waitFor(() => {
      expect(mockSearchFaceByEnrollment).toHaveBeenCalledWith(
        'api-token',
        expect.objectContaining({
          event_ids: ['evt-1'],
          grade: 'soft',
        }),
      );
    });
  });
});
