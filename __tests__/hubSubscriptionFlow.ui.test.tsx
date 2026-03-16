import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

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

jest.mock('../src/constants/SizeBox', () => {
  const React = require('react');
  return function MockSizeBox() {
    return null;
  };
});

const EventDivisionScreen =
  require('../src/screens/search/searchScreens/CompetitionDisciplineScreen').default;

describe('hub subscribed competition category flow', () => {
  test('passes selected category and discipline into photo results', () => {
    const navigate = jest.fn();
    const goBack = jest.fn();
    const screen = render(
      <EventDivisionScreen
        navigation={{ navigate, goBack }}
        route={{
          params: {
            eventName: '60 m',
            competitionName: 'BK CadSch',
            eventId: 'competition-1',
            competitionId: 'competition-1',
            disciplineId: 'discipline-1',
          },
        }}
      />,
    );

    fireEvent.press(screen.getByText('Miniem'));
    fireEvent.press(screen.getByText('See photos'));

    expect(navigate).toHaveBeenCalledWith('AllPhotosOfEvents', {
      eventName: '60 m',
      eventId: 'competition-1',
      competitionId: 'competition-1',
      disciplineId: 'discipline-1',
      categoryLabel: 'Miniem',
      categoryLabels: ['Miniem'],
    });
  });

  test('passes selected category and discipline into video results', () => {
    const navigate = jest.fn();
    const goBack = jest.fn();
    const screen = render(
      <EventDivisionScreen
        navigation={{ navigate, goBack }}
        route={{
          params: {
            eventName: '60 m',
            competitionName: 'BK CadSch',
            eventId: 'competition-1',
            competitionId: 'competition-1',
            disciplineId: 'discipline-1',
          },
        }}
      />,
    );

    fireEvent.press(screen.getByText('Cadet'));
    fireEvent.press(screen.getByText('See videos'));

    expect(navigate).toHaveBeenCalledWith('VideosForEvent', {
      eventName: '60 m',
      eventId: 'competition-1',
      competitionId: 'competition-1',
      disciplineId: 'discipline-1',
      categoryLabel: 'Cadet',
      categoryLabels: ['Cadet'],
    });
  });
});
