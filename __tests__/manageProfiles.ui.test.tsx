import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

const stableT = (value: string) => value;
const mockUseAuth = jest.fn();
const mockGetMyGroups = jest.fn();
const mockDeleteGroup = jest.fn();

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
      errorColor: '#D32F2F',
    },
  }),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../src/services/apiGateway', () => ({
  deleteGroup: (...args: any[]) => mockDeleteGroup(...args),
  getMyGroups: (...args: any[]) => mockGetMyGroups(...args),
}));

jest.mock('../src/constants/Icons', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('iconsax-react-nativejs', () => {
  const React = require('react');
  const { View } = require('react-native');
  const createIcon = () => (props: any) => React.createElement(View, props);
  return {
    Add: createIcon(),
    ArrowLeft2: createIcon(),
    Trash: createIcon(),
  };
});

const ManageProfiles = require('../src/screens/menu/menuScreens/ManageProfiles').default;

function createNavigation() {
  return {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };
}

describe('ManageProfiles add flows', () => {
  beforeEach(() => {
    mockGetMyGroups.mockReset();
    mockDeleteGroup.mockReset();
    mockUseAuth.mockReset();

    mockGetMyGroups.mockResolvedValue({ groups: [] });
    mockUseAuth.mockReturnValue({
      apiAccessToken: 'token-123',
      updateUserProfile: jest.fn(),
      userProfile: {
        category: 'athlete',
        selectedEvents: ['track-field'],
      },
    });
  });

  test('shows explicit add actions and hides the generic chooser entry', async () => {
    render(<ManageProfiles navigation={createNavigation()} />);

    await waitFor(() => {
      expect(screen.getByTestId('manage-profiles-add-athlete')).toBeTruthy();
    });

    expect(screen.getByTestId('manage-profiles-add-support')).toBeTruthy();
    expect(screen.getByTestId('manage-profiles-add-group')).toBeTruthy();
    expect(screen.queryByText('Add profile')).toBeNull();
  });

  test('routes athlete add directly to focus selection', async () => {
    const navigation = createNavigation();
    render(<ManageProfiles navigation={navigation} />);

    await waitFor(() => {
      expect(screen.getByTestId('manage-profiles-add-athlete')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('manage-profiles-add-athlete'));

    expect(navigation.navigate).toHaveBeenCalledWith('SelectEventScreen', {
      fromAddFlow: true,
      selectedCategory: 'find',
    });
  });

  test('routes support add directly to focus selection', async () => {
    const navigation = createNavigation();
    render(<ManageProfiles navigation={navigation} />);

    await waitFor(() => {
      expect(screen.getByTestId('manage-profiles-add-support')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('manage-profiles-add-support'));

    expect(navigation.navigate).toHaveBeenCalledWith('SelectEventScreen', {
      fromAddFlow: true,
      selectedCategory: 'support',
    });
  });

  test('routes group add directly to focus selection', async () => {
    const navigation = createNavigation();
    render(<ManageProfiles navigation={navigation} />);

    await waitFor(() => {
      expect(screen.getByTestId('manage-profiles-add-group')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('manage-profiles-add-group'));

    expect(navigation.navigate).toHaveBeenCalledWith('SelectEventScreen', {
      fromAddFlow: true,
      selectedCategory: 'manage',
    });
  });

  test('hides the support add action when a support profile already exists', async () => {
    mockUseAuth.mockReturnValue({
      apiAccessToken: 'token-123',
      updateUserProfile: jest.fn(),
      userProfile: {
        category: 'athlete',
        selectedEvents: ['track-field'],
        supportRole: 'Coach',
      },
    });

    render(<ManageProfiles navigation={createNavigation()} />);

    await waitFor(() => {
      expect(screen.getByTestId('manage-profiles-add-athlete')).toBeTruthy();
    });

    expect(screen.queryByTestId('manage-profiles-add-support')).toBeNull();
    expect(screen.getByText('Coach profile')).toBeTruthy();
  });
});
