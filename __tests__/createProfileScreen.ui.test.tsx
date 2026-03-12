import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';

const mockCheckAccountAvailability = jest.fn();
const mockUpdateUserAccount = jest.fn();
const mockRefreshAuthBootstrap = jest.fn();

const mockAuthState: any = {
  authBootstrap: null,
  refreshAuthBootstrap: mockRefreshAuthBootstrap,
  user: {
    givenName: 'Jane',
    familyName: 'Runner',
    email: 'jane@example.com',
    nickname: 'jane_runner',
    name: 'Jane Runner',
  },
  accessToken: 'token-123',
  updateUserAccount: mockUpdateUserAccount,
};

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: any) => {
    const React = require('react');
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock('../src/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primaryColor: '#3C82F6',
      pureWhite: '#FFFFFF',
      whiteColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      mainTextColor: '#171717',
      subTextColor: '#666666',
      grayColor: '#898989',
      lightGrayColor: '#D9D9D9',
      secondaryColor: '#F5F7FA',
      btnBackgroundColor: '#EEF4FF',
      cardBackground: '#FFFFFF',
      modalBackground: '#FFFFFF',
      errorColor: '#D32F2F',
      greenColor: '#00BD48',
      secondaryBlueColor: '#DCE9FF',
      inputBackgroundColor: '#F7F9FC',
    },
  }),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

jest.mock('../src/services/apiGateway', () => ({
  ApiError: class ApiError extends Error {
    status?: number;
    body?: any;
  },
  checkAccountAvailability: (...args: any[]) => mockCheckAccountAvailability(...args),
}));

jest.mock('../src/constants/Images', () => ({
  __esModule: true,
  default: {
    signup2: {uri: 'mock://signup2'},
  },
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
    default: {
      User: MockIcon,
    },
  };
});

jest.mock('../src/components/customButton/CustomButton', () => {
  const React = require('react');
  const {Text, TouchableOpacity} = require('react-native');
  return function MockCustomButton({title, onPress}: any) {
    return React.createElement(
      TouchableOpacity,
      {onPress},
      React.createElement(Text, null, title),
    );
  };
});

jest.mock('../src/components/datePickerModal/DatePickerModal', () => {
  return function MockDatePickerModal() {
    return null;
  };
});

const CreateProfileScreen = require('../src/screens/authFlow/createProfileScreen/CreateProfileScreen').default;

describe('CreateProfileScreen', () => {
  beforeEach(() => {
    mockCheckAccountAvailability.mockReset();
    mockUpdateUserAccount.mockReset();
    mockRefreshAuthBootstrap.mockReset();
    mockAuthState.authBootstrap = null;
    mockAuthState.user = {
      givenName: 'Jane',
      familyName: 'Runner',
      email: 'jane@example.com',
      nickname: 'jane_runner',
      name: 'Jane Runner',
    };
  });

  test('keeps a typed first name when bootstrap data arrives later', () => {
    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
      canGoBack: jest.fn(() => true),
    };

    const {rerender} = render(
      <CreateProfileScreen navigation={navigation} />,
    );

    const firstNameInput = screen.getByPlaceholderText('Enter First Name');
    fireEvent.changeText(firstNameInput, 'Greg');
    expect(screen.getByDisplayValue('Greg')).toBeTruthy();

    mockAuthState.authBootstrap = {
      user: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        username: 'john_doe',
      },
    };

    rerender(
      <CreateProfileScreen navigation={navigation} />,
    );

    expect(screen.getByDisplayValue('Greg')).toBeTruthy();
  });
});
