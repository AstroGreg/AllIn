import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'iconsax-react-nativejs';
import ConfettiCannon from 'react-native-confetti-cannon';
import { createStyles } from './CongratulationsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const CongratulationsScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const confettiRef = useRef(null);
    const confettiRef2 = useRef(null);
    useEffect(() => {
        // Trigger confetti on mount
        if (confettiRef.current) {
            confettiRef.current.start();
        }
        if (confettiRef2.current) {
            setTimeout(() => {
                var _a;
                (_a = confettiRef2.current) === null || _a === void 0 ? void 0 : _a.start();
            }, 500);
        }
    }, []);
    const handleBackHome = () => {
        navigation.reset({
            index: 0,
            routes: [{
                    name: 'BottomTabBar',
                    state: { index: 2, routes: [{ name: 'Upload' }] },
                }],
        });
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(ConfettiCannon, { ref: confettiRef, count: 100, origin: { x: -10, y: 0 }, autoStart: false, fadeOut: true, fallSpeed: 3000, explosionSpeed: 350, colors: ['#3C82F6', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'] }), _jsx(ConfettiCannon, { ref: confettiRef2, count: 100, origin: { x: 400, y: 0 }, autoStart: false, fadeOut: true, fallSpeed: 3000, explosionSpeed: 350, colors: ['#3C82F6', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'] }), _jsxs(View, Object.assign({ style: styles.content }, { children: [_jsx(View, Object.assign({ style: styles.iconContainer }, { children: _jsx(Icons.CheckCircleGreen, { height: 122, width: 122 }) })), _jsx(SizeBox, { height: 35 }), _jsxs(View, Object.assign({ style: styles.textContainer }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: t('Congratulations') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: styles.subtitle }, { children: t('Your upload is complete.') }))] })), _jsx(SizeBox, { height: 90 }), _jsxs(TouchableOpacity, Object.assign({ style: styles.backHomeButton, onPress: handleBackHome }, { children: [_jsx(Text, Object.assign({ style: styles.backHomeButtonText }, { children: t('OK') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom : 20 })] })));
};
export default CongratulationsScreen;
