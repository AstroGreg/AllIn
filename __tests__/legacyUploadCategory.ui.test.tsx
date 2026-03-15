import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

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
      mainTextColor: '#171717',
      subTextColor: '#6B7280',
      cardBackground: '#FFFFFF',
      lightGrayColor: '#D9D9D9',
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

const LegacyUploadCategoryScreen =
  require('../src/screens/upload/uploadScreens/SelectCategory').default;

describe('Legacy upload category route', () => {
  test('redirects straight into the updated upload competition flow', async () => {
    const navigation = {
      replace: jest.fn(),
      getState: jest.fn(() => ({
        routeNames: ['SelectCategory', 'RootUploadSelectCompetitionScreen'],
      })),
    };

    render(
      <LegacyUploadCategoryScreen
        navigation={navigation}
        route={{ params: { anonymous: false, preserved: 'value' } }}
      />,
    );

    await waitFor(() => {
      expect(navigation.replace).toHaveBeenCalledWith('RootUploadSelectCompetitionScreen', {
        anonymous: false,
        preserved: 'value',
      });
    });
  });
});
