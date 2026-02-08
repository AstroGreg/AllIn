import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  keyboardVerticalOffset?: number;
  scroll?: boolean;
};

const KeyboardAvoidingContainer = ({
  children,
  keyboardVerticalOffset,
  scroll = true,
}: Props) => {
  const insets = useSafeAreaInsets();

  const offset = keyboardVerticalOffset ?? (Platform.OS === 'ios' ? insets.top : 0);

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={offset}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={{flexGrow: 1}}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={{flex: 1}}>{children}</View>
        )}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default KeyboardAvoidingContainer;

