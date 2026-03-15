import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Alert, InteractionManager, Text, TouchableOpacity, View} from 'react-native';

jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const React = require('react');
  const {View} = require('react-native');

  const MockFlatList = ({data, renderItem, ListEmptyComponent, ...props}: any) =>
    React.createElement(
      View,
      props,
      Array.isArray(data) && data.length > 0
        ? data.map((item, index) =>
            React.createElement(React.Fragment, {
              key: item?.id ?? item?.media_id ?? String(index),
            }, renderItem({item, index})),
          )
        : ListEmptyComponent ?? null,
    );

  return MockFlatList;
});

const mockSearchEvents = jest.fn();
const mockSearchMediaByBib = jest.fn();
const mockSearchObject = jest.fn();
const mockSearchFaceByEnrollment = jest.fn();
const mockGrantFaceRecognitionConsent = jest.fn();
const mockGetProfileSummary = jest.fn();

const mockRoute = {
  params: {} as Record<string, any>,
};

const mockAuthState = {
  apiAccessToken: 'api-token',
  userProfile: {},
};

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock('iconsax-react-nativejs', () => {
  const React = require('react');
  const {View} = require('react-native');
  const createIcon = (name: string) => {
    const Icon = (props: any) => React.createElement(View, {...props, accessibilityLabel: name});
    Icon.displayName = name;
    return Icon;
  };
  return {
    AddCircle: createIcon('AddCircle'),
    ArrowLeft2: createIcon('ArrowLeft2'),
    CloseCircle: createIcon('CloseCircle'),
    SearchNormal1: createIcon('SearchNormal1'),
    TickCircle: createIcon('TickCircle'),
  };
});

jest.mock('../src/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primaryColor: '#3C82F6',
      backgroundColor: '#FFFFFF',
      cardBackground: '#FFFFFF',
      mainTextColor: '#171717',
      subTextColor: '#898989',
      borderColor: '#E0ECFE',
      grayColor: '#777777',
      lightGrayColor: '#D9D9D9',
      btnBackgroundColor: '#F3F6FA',
    },
  }),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useRoute: () => mockRoute,
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(() => callback(), [callback]);
    },
  };
});

jest.mock('../src/constants/SizeBox', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockSizeBox(props: any) {
    return React.createElement(View, props);
  };
});

jest.mock('../src/components/KeyboardAvoidingContainer', () => {
  const React = require('react');
  const {View} = require('react-native');
  return function MockKeyboardAvoidingContainer({children}: {children: React.ReactNode}) {
    return React.createElement(View, null, children);
  };
});

jest.mock('../src/components/customSwitch/CustomSwitch', () => {
  const React = require('react');
  const {Text, TouchableOpacity} = require('react-native');
  return function MockCustomSwitch({isEnabled, toggleSwitch}: any) {
    return React.createElement(
      TouchableOpacity,
      {onPress: toggleSwitch},
      React.createElement(Text, null, isEnabled ? 'Face switch on' : 'Face switch off'),
    );
  };
});

jest.mock('../src/components/unifiedSearchInput/UnifiedSearchInput', () => {
  const React = require('react');
  const {TextInput, View} = require('react-native');
  return function MockUnifiedSearchInput({value, onChangeText, ...props}: any) {
    return React.createElement(
      View,
      null,
      React.createElement(TextInput, {
        ...props,
        value,
        onChangeText,
      }),
    );
  };
});

jest.mock('../src/services/apiGateway', () => {
  class MockApiError extends Error {
    status: number;
    body?: any;

    constructor({status, message, body}: {status: number; message: string; body?: any}) {
      super(message);
      this.status = status;
      this.body = body;
    }
  }

  return {
    ApiError: MockApiError,
    getProfileSummary: (...args: any[]) => mockGetProfileSummary(...args),
    grantFaceRecognitionConsent: (...args: any[]) => mockGrantFaceRecognitionConsent(...args),
    searchEvents: (...args: any[]) => mockSearchEvents(...args),
    searchFaceByEnrollment: (...args: any[]) => mockSearchFaceByEnrollment(...args),
    searchMediaByBib: (...args: any[]) => mockSearchMediaByBib(...args),
    searchObject: (...args: any[]) => mockSearchObject(...args),
  };
});

const {ApiError} = require('../src/services/apiGateway');
const CombinedSearchScreen = require('../src/screens/search/searchScreens/CombinedSearchScreen').default;

function textValue(node: ReactTestRenderer.ReactTestInstance) {
  const children = node.props.children;
  if (Array.isArray(children)) return children.join('');
  return String(children ?? '');
}

function findTextValues(root: ReactTestRenderer.ReactTestInstance) {
  return root.findAllByType(Text).map(textValue);
}

function pressTouchableWithText(root: ReactTestRenderer.ReactTestInstance, label: string) {
  const matchingTouchables = root.findAllByType(TouchableOpacity).filter((node) => {
    return node.findAllByType(Text).some((textNode) => textValue(textNode).includes(label));
  });

  const touchable = matchingTouchables.sort((a, b) => {
    return a.findAllByType(Text).length - b.findAllByType(Text).length;
  })[0];

  if (!touchable) {
    throw new Error(`Touchable with text "${label}" not found`);
  }

  act(() => {
    touchable.props.onPress();
  });
}

async function flushEffects(times = 1) {
  for (let i = 0; i < times; i += 1) {
    await act(async () => {
      await new Promise((resolve) => setImmediate(resolve));
    });
  }
}

function createNavigation() {
  return {
    canGoBack: jest.fn(() => true),
    goBack: jest.fn(),
    navigate: jest.fn(),
    setParams: jest.fn((params: Record<string, any>) => {
      mockRoute.params = {
        ...mockRoute.params,
        ...params,
      };
    }),
  };
}

describe('CombinedSearchScreen flows', () => {
  const renderers: ReactTestRenderer.ReactTestRenderer[] = [];

  beforeEach(() => {
    mockRoute.params = {};
    mockAuthState.apiAccessToken = 'api-token';
    mockAuthState.userProfile = {};

    mockSearchEvents.mockReset();
    mockSearchMediaByBib.mockReset();
    mockSearchObject.mockReset();
    mockSearchFaceByEnrollment.mockReset();
    mockGrantFaceRecognitionConsent.mockReset();
    mockGetProfileSummary.mockReset();

    mockGetProfileSummary.mockResolvedValue({profile: {}});
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation((callback: () => void) => {
      callback();
      return {cancel: jest.fn()} as any;
    });
  });

  afterEach(() => {
    act(() => {
      while (renderers.length > 0) {
        renderers.pop()?.unmount();
      }
    });
    jest.restoreAllMocks();
  });

  test('restores a pending combined search and auto-runs the context search', async () => {
    mockRoute.params = {
      resumeCombinedSearch: {
        selectedEvents: [{id: 'evt-1', name: 'Brussels 2025'}],
        contextText: 'finish line',
        autoRun: true,
      },
    };
    mockSearchObject.mockResolvedValue([
      {media_id: 'media-1', event_id: 'evt-1', preview_url: 'one'},
      {media_id: 'media-1', event_id: 'evt-1', preview_url: 'duplicate'},
      {media_id: 'media-2', event_id: 'evt-1', preview_url: 'two'},
    ]);

    const navigation = createNavigation();

    act(() => {
      renderers.push(ReactTestRenderer.create(<CombinedSearchScreen navigation={navigation} />));
    });
    await flushEffects(4);

    expect(navigation.setParams).toHaveBeenCalledWith({resumeCombinedSearch: undefined});
    expect(mockSearchObject).toHaveBeenCalledWith('api-token', {
      event_id: 'evt-1',
      q: 'finish line',
      top: 150,
    });
    expect(navigation.navigate).toHaveBeenCalledWith(
      'AISearchResultsScreen',
      expect.objectContaining({
        matchedCount: 2,
        matchType: 'combined',
        results: expect.arrayContaining([
          expect.objectContaining({
            event_id: 'evt-1',
            event_name: 'Brussels 2025',
            match_type: 'context',
            media_id: 'media-1',
          }),
          expect.objectContaining({
            event_id: 'evt-1',
            event_name: 'Brussels 2025',
            match_type: 'context',
            media_id: 'media-2',
          }),
        ]),
      }),
    );
  });

  test('shows the face consent recovery CTA and grants consent', async () => {
    mockRoute.params = {
      resumeCombinedSearch: {
        selectedEvents: [{id: 'evt-1', name: 'Brussels 2025'}],
        includeFace: true,
      },
    };
    mockSearchFaceByEnrollment.mockRejectedValue(
      new ApiError({
        status: 403,
        message: 'Consent required',
      }),
    );
    mockGrantFaceRecognitionConsent.mockResolvedValue({ok: true});

    let renderer: ReactTestRenderer.ReactTestRenderer;
    const navigation = createNavigation();

    act(() => {
      renderer = ReactTestRenderer.create(<CombinedSearchScreen navigation={navigation} />);
      renderers.push(renderer);
    });
    await flushEffects(3);

    pressTouchableWithText(renderer!.root, 'Run AI search');
    await flushEffects(3);

    expect(mockSearchFaceByEnrollment).toHaveBeenCalledWith('api-token', {
      event_ids: ['evt-1'],
      grade: 'hard',
      label: 'default',
      limit: 600,
      save: true,
      top: 100,
    });
    expect(findTextValues(renderer!.root)).toContain('Grant face consent');

    pressTouchableWithText(renderer!.root, 'Grant face consent');
    await flushEffects(2);

    expect(mockGrantFaceRecognitionConsent).toHaveBeenCalledWith('api-token');
    expect(mockGetProfileSummary).toHaveBeenCalledTimes(2);
  });

  test('prompts the user to enroll a face when setup is missing', async () => {
    mockRoute.params = {
      preselectedEvents: [{id: 'evt-1', name: 'Brussels 2025'}],
    };
    mockSearchFaceByEnrollment.mockRejectedValue(
      new ApiError({
        status: 400,
        message: 'Enrollment required',
        body: {missing_angles: ['left', 'right']},
      }),
    );

    let renderer: ReactTestRenderer.ReactTestRenderer;
    const navigation = createNavigation();

    act(() => {
      renderer = ReactTestRenderer.create(<CombinedSearchScreen navigation={navigation} />);
      renderers.push(renderer);
    });
    await flushEffects(3);

    pressTouchableWithText(renderer!.root, 'Face switch off');
    await flushEffects(2);

    expect(mockSearchFaceByEnrollment).toHaveBeenCalledWith('api-token', {
      event_ids: ['evt-1'],
      label: 'default',
      limit: 1,
      save: false,
      top: 1,
    });

    const alertSpy = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
    expect(alertSpy).toHaveBeenCalledWith(
      'Face setup required',
      'Please enroll your face before enabling face search.',
      expect.any(Array),
    );

    const buttons = alertSpy.mock.calls[0]?.[2] as Array<{onPress?: () => void}>;
    expect(buttons).toHaveLength(2);

    act(() => {
      buttons[1]?.onPress?.();
    });

    expect(navigation.navigate).toHaveBeenCalledWith(
      'SearchFaceCaptureScreen',
      expect.objectContaining({
        afterEnroll: expect.objectContaining({
          screen: 'AISearchScreen',
        }),
        mode: 'enrolFace',
      }),
    );
  });

  test('lets the user pick a softer face match grade in the main AI search flow', async () => {
    mockRoute.params = {
      preselectedEvents: [{id: 'evt-1', name: 'Brussels 2025'}],
    };
    mockSearchFaceByEnrollment.mockResolvedValue({
      results: [{media_id: 'media-1', event_id: 'evt-1', preview_url: 'preview'}],
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    const navigation = createNavigation();

    act(() => {
      renderer = ReactTestRenderer.create(<CombinedSearchScreen navigation={navigation} />);
      renderers.push(renderer);
    });
    await flushEffects(3);

    expect(findTextValues(renderer!.root)).toContain('Face match grade');
    pressTouchableWithText(renderer!.root, 'Soft · 85%');
    pressTouchableWithText(renderer!.root, 'Face switch off');
    await flushEffects(2);
    pressTouchableWithText(renderer!.root, 'Run AI search');
    await flushEffects(3);

    expect(mockSearchFaceByEnrollment).toHaveBeenCalledWith('api-token', {
      event_ids: ['evt-1'],
      grade: 'soft',
      label: 'default',
      limit: 600,
      save: true,
      top: 100,
    });
  });
});
