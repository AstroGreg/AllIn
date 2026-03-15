import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'iconsax-react-nativejs';
import { createStyles } from './AdvertisementScreenStyles';
import Images from '../../constants/Images';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const AdvertisementScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const handleSkip = () => {
        navigation.navigate('CategorySelectionScreen');
    };
    return (_jsx(View, Object.assign({ style: Styles.mainContainer }, { children: _jsxs(ImageBackground, Object.assign({ source: Images.advertisement, style: Styles.backgroundImage, resizeMode: "cover" }, { children: [_jsx(View, Object.assign({ style: Styles.contentContainer }, { children: _jsx(View, Object.assign({ style: Styles.adOverlay }, { children: _jsx(Text, Object.assign({ style: Styles.adText }, { children: t('Sponsored update') })) })) })), _jsx(View, Object.assign({ style: [Styles.buttonContainer, { bottom: insets.bottom + 40 }] }, { children: _jsxs(TouchableOpacity, Object.assign({ style: Styles.skipButton, activeOpacity: 0.7, onPress: handleSkip }, { children: [_jsx(Text, Object.assign({ style: Styles.skipButtonText }, { children: t('Skip') })), _jsx(ArrowRight, { size: 20, color: colors.grayColor })] })) }))] })) })));
};
export default AdvertisementScreen;
