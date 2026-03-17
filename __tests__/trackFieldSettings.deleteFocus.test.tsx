import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

const stableT = (value: string) => value;
const mockUseAuth = jest.fn();
const mockUpdateUserProfile = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
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
      secondaryColor: '#F5F7FA',
      secondaryBlueColor: '#EEF4FF',
      borderColor: '#D9D9D9',
      cardBackground: '#FFFFFF',
      modalBackground: '#FFFFFF',
      btnBackgroundColor: '#EEF4FF',
      errorColor: '#D32F2F',
    },
  }),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../src/services/apiGateway', () => ({
  getGroup: jest.fn(),
  getProfileSummary: jest.fn(),
  searchClubs: jest.fn(),
  searchGroups: jest.fn(),
  ApiError: class ApiError extends Error {},
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

jest.mock('iconsax-react-nativejs', () => {
  const React = require('react');
  const { View } = require('react-native');
  const createIcon = () => (props: any) => React.createElement(View, props);
  return {
    ArrowLeft2: createIcon(),
    Buildings: createIcon(),
    CloseCircle: createIcon(),
    Global: createIcon(),
    Profile2User: createIcon(),
    User: createIcon(),
  };
});

const TrackFieldSettings = require('../src/screens/menu/menuScreens/TrackFieldSettings').default;

const createNavigation = () => ({
  goBack: jest.fn(),
  navigate: jest.fn(),
});

describe('TrackFieldSettings delete sport focus', () => {
  beforeEach(() => {
    mockUpdateUserProfile.mockReset();
    mockUpdateUserProfile.mockResolvedValue(undefined);
    mockUseAuth.mockReset();
    mockUseAuth.mockReturnValue({
      apiAccessToken: null,
      updateUserProfile: mockUpdateUserProfile,
      userProfile: {
        selectedEvents: ['track-field', 'cycling'],
        chestNumbersByYear: { 2026: '1234' },
        mainDisciplines: {
          'track-field': '800m',
          cycling: 'road',
        },
      },
    });
  });

  test('removes current focus from selected events and summary links', async () => {
    const navigation = createNavigation();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    render(
      <TrackFieldSettings
        navigation={navigation}
        route={{ params: { focusId: 'track-field' } }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-sport-focus-button')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('delete-sport-focus-button'));
    expect(alertSpy).toHaveBeenCalled();

    const alertButtons = alertSpy.mock.calls[0]?.[2] as Array<{ text?: string; onPress?: () => Promise<void> | void }>;
    const deleteButton = alertButtons.find((button) => button.text === 'Delete');
    expect(deleteButton).toBeTruthy();

    await act(async () => {
      await deleteButton?.onPress?.();
    });

    expect(mockUpdateUserProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedEvents: ['cycling'],
        mainDisciplines: { cycling: 'road' },
        trackFieldMainEvent: '',
        roadTrailMainEvent: '',
        chestNumbersByYear: {},
      }),
    );
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
