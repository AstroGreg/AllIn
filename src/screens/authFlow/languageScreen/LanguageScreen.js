import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import CustomButton from '../../../components/customButton/CustomButton';
import { createStyles } from './LanguageScreenStyles';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const LanguageScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { colors, mode, setTheme } = useTheme();
    const Styles = createStyles(colors);
    const renderRadio = (selected) => (_jsx(View, Object.assign({ style: [Styles.radioOuter, selected && Styles.radioOuterSelected] }, { children: selected ? _jsx(View, { style: Styles.radioInner }) : null })));
    return (_jsx(View, Object.assign({ style: Styles.mainContainer }, { children: _jsxs(View, Object.assign({ style: Styles.contentContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: t('appearance') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: t('Choose your preferred appearance mode to continue.') })), _jsx(SizeBox, { height: 40 }), _jsxs(View, Object.assign({ style: Styles.optionsContainer }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: [Styles.optionItem, mode === 'light' && Styles.optionItemSelected], activeOpacity: 0.7, onPress: () => setTheme('light') }, { children: [_jsx(Text, Object.assign({ style: [Styles.optionText, mode !== 'light' && Styles.optionTextUnselected] }, { children: t('lightMode') })), renderRadio(mode === 'light')] })), _jsx(SizeBox, { height: 14 }), _jsxs(TouchableOpacity, Object.assign({ style: [Styles.optionItem, mode === 'dark' && Styles.optionItemSelected], activeOpacity: 0.7, onPress: () => setTheme('dark') }, { children: [_jsx(Text, Object.assign({ style: [Styles.optionText, mode !== 'dark' && Styles.optionTextUnselected] }, { children: t('darkMode') })), renderRadio(mode === 'dark')] }))] })), _jsx(SizeBox, { height: 40 }), _jsx(CustomButton, { title: t('continue'), onPress: () => navigation.navigate('LoginScreen') })] })) })));
};
export default LanguageScreen;
