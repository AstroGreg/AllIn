import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Notification } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next';
const TermsOfService = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const thirdPartyLinks = [
        'Google Play Services',
        'Google Analytics for Firebase',
        'Firebase Crashlytics',
        'Facebook'
    ];
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Terms of Service') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton }, { children: _jsx(Notification, { size: 24, color: colors.primaryColor, variant: "Linear" }) }))] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.termsSection }, { children: [_jsx(Text, Object.assign({ style: Styles.termsSectionTitle }, { children: t('Terms of Service') })), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: Styles.termsText }, { children: t('These terms explain how SpotMe is provided, which features are available, and what is expected from users when uploading, buying, or sharing media.') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.termsText }, { children: t('Third-party services used by the app may also apply their own terms and privacy rules.') })), _jsx(SizeBox, { height: 8 }), thirdPartyLinks.map((link, index) => (_jsxs(Text, Object.assign({ style: Styles.termsLink }, { children: ['\u2022', " ", link] }), index)))] })), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.termsSection }, { children: [_jsx(Text, Object.assign({ style: Styles.termsSectionTitle }, { children: t('Changes to This Terms and Conditions') })), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: Styles.termsText }, { children: t('We may update these terms when features, billing rules, or legal requirements change. Material updates should be reviewed before you continue using the app.') }))] })), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.termsSection }, { children: [_jsx(Text, Object.assign({ style: Styles.termsSectionTitle }, { children: t('Contact Us') })), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: Styles.termsText }, { children: t('If you have questions about these terms, billing, or privacy requests, contact the SpotMe support team through the help section in the app.') }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default TermsOfService;
