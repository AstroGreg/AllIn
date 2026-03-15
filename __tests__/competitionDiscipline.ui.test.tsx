import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {render, screen, fireEvent} from '@testing-library/react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
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
      backgroundColor: '#FFFFFF',
      cardBackground: '#FFFFFF',
      mainTextColor: '#171717',
      subTextColor: '#898989',
      grayColor: '#777777',
      lightGrayColor: '#D9D9D9',
      secondaryColor: '#F3F6FA',
      btnBackgroundColor: '#F3F6FA',
    },
  }),
}));

jest.mock('../src/constants/SizeBox', () => {
  const React = require('react');
  return function MockSizeBox() {
    return null;
  };
});

jest.mock('iconsax-react-nativejs', () => {
  const React = require('react');
  const {View: MockView} = require('react-native');
  return {
    ArrowLeft2: (props: any) => React.createElement(MockView, props),
  };
});

const CompetitionDisciplineScreen = require('../src/screens/search/searchScreens/CompetitionDisciplineScreen').default;

describe('CompetitionDisciplineScreen', () => {
  test('uses discipline then category with All available and no separate gender section', () => {
    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
    };

    render(
      <CompetitionDisciplineScreen
        navigation={navigation}
        route={{params: {eventName: '60 m', competitionName: 'BK CadSch', eventId: 'evt-1', disciplineId: 'disc-1'}}}
      />,
    );

    expect(screen.getByText('Choose category')).toBeTruthy();
    expect(screen.getByText('All')).toBeTruthy();
    expect(screen.queryByText('Gender')).toBeNull();

    fireEvent.press(screen.getByText('Cadet'));
    fireEvent.press(screen.getByText('See photos'));

    expect(navigation.navigate).toHaveBeenCalledWith(
      'AllPhotosOfEvents',
      expect.objectContaining({
        categoryLabel: 'Cadet',
        categoryLabels: ['Cadet'],
        competitionId: 'evt-1',
        disciplineId: 'disc-1',
      }),
    );
  });
});
