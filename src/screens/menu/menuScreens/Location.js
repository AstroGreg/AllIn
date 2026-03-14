import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Notification, Location as LocationIcon } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next';
const Location = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [location, setLocation] = useState('');
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Menu') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton }, { children: _jsx(Notification, { size: 24, color: colors.primaryColor, variant: "Linear" }) }))] })), _jsxs(View, Object.assign({ style: Styles.container }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Location') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.locationInputContainer }, { children: [_jsx(LocationIcon, { size: 20, color: colors.primaryColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { style: Styles.locationInput, placeholder: t('Enter your location'), placeholderTextColor: colors.grayColor, value: location, onChangeText: setLocation })] }))] }))] })));
};
export default Location;
