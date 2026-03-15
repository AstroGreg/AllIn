import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, ShieldCross } from 'iconsax-react-nativejs';
import { createStyles } from './FailedScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const FailedScreen = ({ navigation, route }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const eventName = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.eventName) || 'BK Studentent 23';
    const handleTryAgain = () => {
        // Go back to EventSummaryScreen
        navigation.goBack();
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.content }, { children: [_jsx(View, Object.assign({ style: styles.iconContainer }, { children: _jsx(ShieldCross, { size: 122, color: "#ED5454", variant: "Bold" }) })), _jsx(SizeBox, { height: 35 }), _jsxs(View, Object.assign({ style: styles.textContainer }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: t('Failed') })), _jsx(SizeBox, { height: 8 }), _jsxs(Text, Object.assign({ style: styles.subtitle }, { children: [t('Something went wrong while adding you to'), " ", eventName] }))] })), _jsx(SizeBox, { height: 90 }), _jsxs(TouchableOpacity, Object.assign({ style: styles.tryAgainButton, onPress: handleTryAgain }, { children: [_jsx(Text, Object.assign({ style: styles.tryAgainButtonText }, { children: t('Try Again') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom : 20 })] })));
};
export default FailedScreen;
