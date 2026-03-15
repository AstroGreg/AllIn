import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { CommonActions } from '@react-navigation/native';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, User, ArrowRight2 } from 'iconsax-react-nativejs';
import { createStyles } from './NameThisFaceScreenStyles';
import { useTranslation } from 'react-i18next';
const NameThisFaceScreen = ({ navigation, route }) => {
    var _a, _b, _c;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [faceName, setFaceName] = useState('');
    const frontFaceImage = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.frontFaceImage;
    const leftSideImage = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.leftSideImage;
    const rightSideImage = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.rightSideImage;
    const capturedImages = [
        frontFaceImage,
        leftSideImage,
        rightSideImage
    ].filter(Boolean);
    const handleSaveFace = () => {
        if (faceName.trim()) {
            // Navigate back to BottomTabBar and switch to Search tab
            navigation.dispatch(CommonActions.reset({
                index: 0,
                routes: [
                    {
                        name: 'BottomTabBar',
                        state: {
                            index: 1,
                            routes: [
                                { name: 'Home' },
                                { name: 'Search' },
                                { name: 'Upload' },
                                { name: 'Profile' },
                                { name: 'Menu' },
                            ],
                        },
                    },
                ],
            }));
        }
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Name This Face') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(View, Object.assign({ style: styles.content }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Captured Views') })), _jsx(SizeBox, { height: 16 }), _jsx(View, Object.assign({ style: styles.capturedViewsRow }, { children: capturedImages.map((image, index) => (_jsx(View, Object.assign({ style: styles.capturedImageContainer }, { children: _jsx(FastImage, { source: { uri: image }, style: styles.capturedImage, resizeMode: FastImage.resizeMode.cover }) }), index))) })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Face Name') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: styles.inputContainer }, { children: [_jsx(User, { size: 20, color: colors.primaryColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { style: styles.textInput, placeholder: t('Enter Face Name'), placeholderTextColor: colors.grayColor, value: faceName, onChangeText: setFaceName })] }))] })), _jsx(View, Object.assign({ style: styles.bottomContainer }, { children: _jsxs(TouchableOpacity, Object.assign({ style: [
                        styles.saveButton,
                        !faceName.trim() && styles.saveButtonDisabled
                    ], onPress: handleSaveFace, disabled: !faceName.trim() }, { children: [_jsx(Text, Object.assign({ style: styles.saveButtonText }, { children: t('Save Face') })), _jsx(ArrowRight2, { size: 18, color: "#FFFFFF", variant: "Linear" })] })) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })));
};
export default NameThisFaceScreen;
