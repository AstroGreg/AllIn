var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react-nativejs';
import { launchCamera } from 'react-native-image-picker';
import { createStyles } from './FrontFaceCaptureScreenStyles';
import { useTranslation } from 'react-i18next';
// Custom camera frame with corner brackets
const CameraFrame = ({ width, height, children, primaryColor, secondaryColor }) => {
    const strokeWidth = 10;
    const cornerLength = 80;
    const borderRadius = 10;
    const middleBracketLength = 50;
    const middleY = height / 2;
    return (_jsxs(View, Object.assign({ style: { width, height, position: 'relative' } }, { children: [_jsx(View, Object.assign({ style: {
                    width,
                    height,
                    borderRadius,
                    overflow: 'hidden',
                    backgroundColor: secondaryColor
                } }, { children: children })), _jsxs(Svg, Object.assign({ width: width, height: height, style: { position: 'absolute', top: 0, left: 0 } }, { children: [_jsx(Path, { d: `M ${strokeWidth / 2} ${borderRadius + cornerLength}
                        L ${strokeWidth / 2} ${borderRadius}
                        Q ${strokeWidth / 2} ${strokeWidth / 2} ${borderRadius} ${strokeWidth / 2}
                        L ${borderRadius + cornerLength} ${strokeWidth / 2}`, stroke: primaryColor, strokeWidth: strokeWidth, fill: "none", strokeLinecap: "round" }), _jsx(Path, { d: `M ${width - borderRadius - cornerLength} ${strokeWidth / 2}
                        L ${width - borderRadius} ${strokeWidth / 2}
                        Q ${width - strokeWidth / 2} ${strokeWidth / 2} ${width - strokeWidth / 2} ${borderRadius}
                        L ${width - strokeWidth / 2} ${borderRadius + cornerLength}`, stroke: primaryColor, strokeWidth: strokeWidth, fill: "none", strokeLinecap: "round" }), _jsx(Path, { d: `M ${strokeWidth / 2} ${middleY - middleBracketLength}
                        L ${strokeWidth / 2} ${middleY + middleBracketLength}`, stroke: primaryColor, strokeWidth: strokeWidth, fill: "none", strokeLinecap: "round" }), _jsx(Path, { d: `M ${width - strokeWidth / 2} ${middleY - middleBracketLength}
                        L ${width - strokeWidth / 2} ${middleY + middleBracketLength}`, stroke: primaryColor, strokeWidth: strokeWidth, fill: "none", strokeLinecap: "round" }), _jsx(Path, { d: `M ${strokeWidth / 2} ${height - borderRadius - cornerLength}
                        L ${strokeWidth / 2} ${height - borderRadius}
                        Q ${strokeWidth / 2} ${height - strokeWidth / 2} ${borderRadius} ${height - strokeWidth / 2}
                        L ${borderRadius + cornerLength} ${height - strokeWidth / 2}`, stroke: primaryColor, strokeWidth: strokeWidth, fill: "none", strokeLinecap: "round" }), _jsx(Path, { d: `M ${width - borderRadius - cornerLength} ${height - strokeWidth / 2}
                        L ${width - borderRadius} ${height - strokeWidth / 2}
                        Q ${width - strokeWidth / 2} ${height - strokeWidth / 2} ${width - strokeWidth / 2} ${height - borderRadius}
                        L ${width - strokeWidth / 2} ${height - borderRadius - cornerLength}`, stroke: primaryColor, strokeWidth: strokeWidth, fill: "none", strokeLinecap: "round" })] }))] })));
};
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_WIDTH = SCREEN_WIDTH - 40; // 20px padding on each side
const FRAME_HEIGHT = 465;
const FrontFaceCaptureScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [capturedImage, setCapturedImage] = useState(null);
    const handleCapture = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const result = yield launchCamera({
                mediaType: 'photo',
                cameraType: 'front',
                saveToPhotos: false,
                quality: 0.8,
            });
            if (result.assets && ((_a = result.assets[0]) === null || _a === void 0 ? void 0 : _a.uri)) {
                setCapturedImage(result.assets[0].uri);
            }
        }
        catch (error) {
            console.log('Camera error:', error);
        }
    });
    const handleConfirm = () => {
        if (capturedImage) {
            // Navigate to Left Side Capture screen
            navigation.navigate('LeftSideCaptureScreen', { frontFaceImage: capturedImage });
        }
    };
    const handleNext = () => {
        // Reset and capture again
        setCapturedImage(null);
        handleCapture();
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Front Face Capture') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(View, Object.assign({ style: styles.content }, { children: [_jsx(Text, Object.assign({ style: styles.instructionText }, { children: t('Look straight at the camera and keep your face inside the frame.') })), _jsx(SizeBox, { height: 16 }), _jsx(TouchableOpacity, Object.assign({ onPress: !capturedImage ? handleCapture : undefined, activeOpacity: capturedImage ? 1 : 0.7 }, { children: _jsx(CameraFrame, Object.assign({ width: FRAME_WIDTH, height: FRAME_HEIGHT, primaryColor: colors.primaryColor, secondaryColor: colors.secondaryColor }, { children: capturedImage ? (_jsx(FastImage, { source: { uri: capturedImage }, style: styles.capturedImage, resizeMode: FastImage.resizeMode.cover })) : (_jsx(View, Object.assign({ style: styles.cameraPlaceholder }, { children: _jsx(Text, Object.assign({ style: styles.tapToCapture }, { children: t('Tap to capture') })) }))) })) })), _jsx(SizeBox, { height: 79 }), _jsxs(View, Object.assign({ style: styles.buttonRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.nextButton, onPress: handleNext }, { children: _jsx(Text, Object.assign({ style: styles.nextButtonText }, { children: t('Next') })) })), _jsxs(TouchableOpacity, Object.assign({ style: [
                                    styles.confirmButton,
                                    !capturedImage && styles.confirmButtonDisabled
                                ], onPress: handleConfirm, disabled: !capturedImage }, { children: [_jsx(Text, Object.assign({ style: styles.confirmButtonText }, { children: t('Confirm') })), _jsx(ArrowRight2, { size: 18, color: "#FFFFFF", variant: "Linear" })] }))] }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })));
};
export default FrontFaceCaptureScreen;
