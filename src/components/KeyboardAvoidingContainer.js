import { jsx as _jsx } from "react/jsx-runtime";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const KeyboardAvoidingContainer = ({ children, keyboardVerticalOffset, scroll = true, }) => {
    const insets = useSafeAreaInsets();
    const offset = keyboardVerticalOffset !== null && keyboardVerticalOffset !== void 0 ? keyboardVerticalOffset : (Platform.OS === 'ios' ? insets.top : 0);
    return (_jsx(KeyboardAvoidingView, Object.assign({ style: { flex: 1 }, behavior: Platform.OS === 'ios' ? 'padding' : undefined, keyboardVerticalOffset: offset }, { children: _jsx(TouchableWithoutFeedback, Object.assign({ onPress: Keyboard.dismiss, accessible: false }, { children: scroll ? (_jsx(ScrollView, Object.assign({ contentContainerStyle: { flexGrow: 1 }, keyboardShouldPersistTaps: "handled" }, { children: children }))) : (_jsx(View, Object.assign({ style: { flex: 1 } }, { children: children }))) })) })));
};
export default KeyboardAvoidingContainer;
