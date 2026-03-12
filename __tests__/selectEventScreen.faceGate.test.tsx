import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';

const stableT = (value: string) => value;

const mockAuthState: any = {
  userProfile: {
    selectedEvents: [],
    faceVerified: false,
  },
};

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableT,
  }),
}));

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const {Image} = require('react-native');
  return function MockFastImage(props: any) {
    return React.createElement(Image, props);
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
    TickCircle: createIcon('TickCircle'),
  };
});

jest.mock('../src/constants/Icons', () => {
  const React = require('react');
  const {View} = require('react-native');
  const MockIcon = (props: any) => React.createElement(View, props);
  return {
    __esModule: true,
    default: {
      RightBtnIcon: MockIcon,
    },
  };
});

jest.mock('../src/constants/Images', () => ({
  __esModule: true,
  default: {
    signup3: {uri: 'mock://signup3'},
  },
}));

jest.mock('../src/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primaryColor: '#3C82F6',
      backgroundColor: '#FFFFFF',
      mainTextColor: '#171717',
      grayColor: '#777777',
      secondaryColor: '#F5F7FA',
      borderColor: '#E0ECFE',
      secondaryBlueColor: '#EEF4FF',
      lightGrayColor: '#D9D9D9',
      cardBackground: '#FFFFFF',
      subTextColor: '#898989',
    },
  }),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

jest.mock('../src/components/profile/SportFocusIcon', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockSportFocusIcon(props: any) {
    return React.createElement(View, props);
  };
});

const SelectEventScreen = require('../src/screens/authFlow/selectEventScreen/SelectEventScreen').default;

describe('SelectEventScreen next route', () => {
  beforeEach(() => {
    mockAuthState.userProfile = {
      selectedEvents: [],
      faceVerified: false,
    };
  });

  test.each([
    [
      'athlete',
      'find',
      {
        screen: 'CompleteAthleteDetailsScreen',
        params: {
          selectedCategory: 'find',
          selectedEvents: ['track-field'],
          flowSelectedEvents: ['track-field'],
        },
      },
    ],
    [
      'group',
      'manage',
      {
        screen: 'CreateGroupProfileScreen',
        params: {
          selectedFocuses: ['track-field'],
          selectedEvents: ['track-field'],
          focusLocked: true,
        },
      },
    ],
    [
      'support',
      'support',
      {
        screen: 'CompleteSupportDetailsScreen',
        params: {
          selectedCategory: 'support',
          selectedEvents: ['track-field'],
          flowSelectedEvents: ['track-field'],
        },
      },
    ],
    [
      'photographer',
      'sell',
      {
        screen: 'CreatePhotographerProfileScreen',
        params: {},
      },
    ],
  ])('routes %s setup directly to the details screen', (_label, selectedCategory, nextRoute) => {
    const navigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
    };

    render(
      <SelectEventScreen
        navigation={navigation}
        route={{params: {selectedCategory, fromAddFlow: true}}}
      />,
    );

    fireEvent.press(screen.getByText('Track & Field'));
    fireEvent.press(screen.getByText('Next'));

    expect(navigation.navigate).toHaveBeenCalledWith(nextRoute.screen, nextRoute.params);
  });
});
