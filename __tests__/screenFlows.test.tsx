import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text, TouchableOpacity} from 'react-native';

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
    Clock: createIcon('Clock'),
    ArrowLeft2: createIcon('ArrowLeft2'),
    ArrowRight: createIcon('ArrowRight'),
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
    },
    isDark: false,
  }),
}));

jest.mock('../src/constants/Icons', () => {
  const React = require('react');
  const {View} = require('react-native');
  const MockIcon = (props: any) => React.createElement(View, props);
  return {
    __esModule: true,
    default: {
      LightbulbColorful: MockIcon,
      AiColorful: MockIcon,
    },
  };
});

const UploadScreen = require('../src/screens/upload/UploadScreen').default;
const AISearchScreen = require('../src/screens/aiSearch/AISearchScreen').default;

function pressTouchableWithText(root: ReactTestRenderer.ReactTestInstance, label: string) {
  const matchingTouchables = root.findAllByType(TouchableOpacity).filter((node) => {
    const texts = node.findAllByType(Text).map((textNode) => {
      const children = textNode.props.children;
      if (Array.isArray(children)) return children.join('');
      return String(children ?? '');
    });
    return texts.some((text) => text.includes(label));
  });

  const touchable = matchingTouchables.sort((a, b) => {
    const aTextCount = a.findAllByType(Text).length;
    const bTextCount = b.findAllByType(Text).length;
    return aTextCount - bTextCount;
  })[0];

  if (!touchable) {
    throw new Error(`Touchable with text "${label}" not found`);
  }

  act(() => {
    touchable.props.onPress();
  });
}

describe('screen flows', () => {
  test('UploadScreen routes standard and anonymous uploads correctly', () => {
    const navigation = {
      navigate: jest.fn(),
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<UploadScreen navigation={navigation} />);
    });

    pressTouchableWithText(renderer!.root, 'Upload anonymously');
    pressTouchableWithText(renderer!.root, 'Upload');

    expect(navigation.navigate).toHaveBeenNthCalledWith(1, 'SelectCompetitionScreen', {
      anonymous: true,
    });
    expect(navigation.navigate).toHaveBeenNthCalledWith(2, 'SelectCompetitionScreen', {
      anonymous: false,
    });
  });

  test('UploadScreen opens upload activity from the header action', () => {
    const navigation = {
      navigate: jest.fn(),
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<UploadScreen navigation={navigation} />);
    });

    const touchables = renderer!.root.findAllByType(TouchableOpacity);
    act(() => {
      touchables[0].props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('UploadActivityScreen');
  });

  test('AISearchScreen opens the subscription modal and routes to payment', () => {
    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<AISearchScreen navigation={navigation} />);
    });

    pressTouchableWithText(renderer!.root, 'Face');

    const modalTexts = renderer!.root.findAllByType(Text).map((node) => {
      const children = node.props.children;
      return Array.isArray(children) ? children.join('') : String(children ?? '');
    });
    expect(modalTexts).toContain('Subscribe Now');

    pressTouchableWithText(renderer!.root, 'Subscribe Now');

    expect(navigation.navigate).toHaveBeenCalledWith('PaymentMethod');
  });

  test('AISearchScreen back button calls navigation.goBack', () => {
    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<AISearchScreen navigation={navigation} />);
    });

    const touchables = renderer!.root.findAllByType(TouchableOpacity);
    act(() => {
      touchables[0].props.onPress();
    });

    expect(navigation.goBack).toHaveBeenCalled();
  });
});
