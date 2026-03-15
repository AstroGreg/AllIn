import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Notification, Sms, Call, Global } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next';
const Help = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const supportItems = [
        {
            icon: _jsx(Sms, { size: 24, color: colors.primaryColor, variant: "Linear" }),
            label: 'Email',
            value: 'support@bcs.com'
        },
        {
            icon: _jsx(Call, { size: 24, color: colors.primaryColor, variant: "Linear" }),
            label: 'Contact Number',
            value: '+123 456 7890'
        },
        {
            icon: _jsx(Global, { size: 24, color: colors.primaryColor, variant: "Linear" }),
            label: 'Website',
            value: 'www.allin.com'
        }
    ];
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Help') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton }, { children: _jsx(Notification, { size: 24, color: colors.primaryColor, variant: "Linear" }) }))] })), _jsxs(View, Object.assign({ style: Styles.container }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(View, Object.assign({ style: Styles.helpCard }, { children: supportItems.map((item, index) => (_jsxs(React.Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.helpRow }, { children: [_jsx(View, Object.assign({ style: Styles.helpIconContainer }, { children: item.icon })), _jsx(SizeBox, { width: 8 }), _jsxs(View, Object.assign({ style: Styles.helpContent }, { children: [_jsx(Text, Object.assign({ style: Styles.helpLabel }, { children: item.label })), _jsx(Text, Object.assign({ style: Styles.helpValue }, { children: item.value }))] }))] })), index < supportItems.length - 1 && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 16 }), _jsx(View, { style: Styles.helpDivider }), _jsx(SizeBox, { height: 20 })] }))] }, item.label))) }))] }))] })));
};
export default Help;
