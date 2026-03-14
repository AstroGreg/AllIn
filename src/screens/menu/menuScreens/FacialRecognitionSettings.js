import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Scan } from 'iconsax-react-nativejs';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const FacialRecognitionSettings = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const startEnroll = useCallback(() => {
        navigation.navigate('SearchFaceCaptureScreen', {
            mode: 'enrolFace',
            replace: true,
            afterEnroll: { screen: 'ProfileSettings' },
        });
    }, [navigation]);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Facial Recognition') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: [Styles.accountSettingsCard, { flexDirection: 'column', alignItems: 'flex-start' }] }, { children: [_jsxs(View, Object.assign({ style: { flexDirection: 'row', alignItems: 'center' } }, { children: [_jsx(View, Object.assign({ style: Styles.accountSettingsIconContainer }, { children: _jsx(Scan, { size: 20, color: colors.primaryColor, variant: "Linear" }) })), _jsx(SizeBox, { width: 12 }), _jsx(Text, Object.assign({ style: Styles.accountSettingsTitle }, { children: t('Facial Recognition Templates') }))] })), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: { color: colors.grayColor, lineHeight: 20 } }, { children: t('Capture the front angle at close, medium, and far distance, then capture the other angles once.') })), _jsx(SizeBox, { height: 16 }), _jsx(TouchableOpacity, Object.assign({ onPress: startEnroll, style: {
                                    backgroundColor: colors.primaryColor,
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 12,
                                    alignSelf: 'stretch',
                                    alignItems: 'center',
                                } }, { children: _jsx(Text, Object.assign({ style: { color: colors.pureWhite, fontWeight: '600' } }, { children: t('Enroll Face') })) }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default FacialRecognitionSettings;
