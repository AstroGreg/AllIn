var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowRight } from 'iconsax-react-nativejs';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor, } from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';
import { createStyles } from './FaceVerificationScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
const CAPTURE_ANGLES = [
    { id: 'front', title: 'Front', instruction: 'Look straight at the camera and hold still', yawMin: -10, yawMax: 10, pitchMin: -10, pitchMax: 10 },
    { id: 'slight_left', title: 'Slight Left', instruction: 'Turn your head slightly to the left and hold still', yawMin: 15, yawMax: 40, pitchMin: -15, pitchMax: 15 },
    { id: 'slight_right', title: 'Slight Right', instruction: 'Turn your head slightly to the right and hold still', yawMin: -40, yawMax: -15, pitchMin: -15, pitchMax: 15 },
    { id: 'slight_up', title: 'Slight Up', instruction: 'Tilt your head slightly upward and hold still', yawMin: -15, yawMax: 15, pitchMin: 10, pitchMax: 35 },
    { id: 'slight_down', title: 'Slight Down', instruction: 'Tilt your head slightly downward and hold still', yawMin: -15, yawMax: 15, pitchMin: -35, pitchMax: -10 },
    { id: 'back_front', title: 'Front Again', instruction: 'Look straight at the camera one more time', yawMin: -10, yawMax: 10, pitchMin: -10, pitchMax: 10 },
];
const FaceVerificationScreen = ({ navigation, route }) => {
    var _a, _b;
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile } = useAuth();
    const afterVerification = (_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.afterVerification) !== null && _b !== void 0 ? _b : null;
    const cameraRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    const device = useCameraDevice('front');
    const { hasPermission } = useCameraPermission();
    const { detectFaces } = useFaceDetector({
        performanceMode: 'fast',
        classificationMode: 'none',
        landmarkMode: 'none',
        contourMode: 'none',
    });
    const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
    const [capturedImages, setCapturedImages] = useState({});
    const [faceDetected, setFaceDetected] = useState(false);
    const [angleMatched, setAngleMatched] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [isTransitioning] = useState(false);
    // Use refs to track state in worklet callbacks (avoid stale closures)
    const currentAngleIndexRef = useRef(currentAngleIndex);
    const isCapturingRef = useRef(false);
    const hasCurrentImageRef = useRef(false);
    const countdownActiveRef = useRef(false);
    const isTransitioningRef = useRef(false);
    const countdownRef = useRef(null);
    const isMountedRef = useRef(true);
    // Keep refs in sync with state
    useEffect(() => {
        currentAngleIndexRef.current = currentAngleIndex;
    }, [currentAngleIndex]);
    useEffect(() => {
        const currentAngle = CAPTURE_ANGLES[currentAngleIndex];
        hasCurrentImageRef.current = !!capturedImages[currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.id];
    }, [capturedImages, currentAngleIndex]);
    const currentAngle = CAPTURE_ANGLES[currentAngleIndex];
    const currentImage = capturedImages[currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.id];
    const allCaptured = Object.keys(capturedImages).length === CAPTURE_ANGLES.length;
    const progress = Object.keys(capturedImages).length / CAPTURE_ANGLES.length;
    const handleRequestPermission = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield Camera.requestCameraPermission();
            if (result === 'denied') {
                Alert.alert(t('Permission Denied'), t('Camera permission was denied. Please enable it in Settings.'), [
                    { text: t('Cancel'), style: 'cancel' },
                    { text: t('Open Settings'), onPress: () => Linking.openSettings() }
                ]);
            }
        }
        catch (error) {
            console.log('Permission request error:', error);
        }
    }), [t]);
    useEffect(() => {
        if (!hasPermission) {
            handleRequestPermission();
        }
    }, [hasPermission, handleRequestPermission]);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
        };
    }, []);
    const openSettings = useCallback(() => {
        Linking.openSettings();
    }, []);
    // Check if face angle matches current target
    const checkAngleMatch = useCallback((yaw, pitch, angleIndex) => {
        const angle = CAPTURE_ANGLES[angleIndex];
        if (!angle)
            return false;
        const yawMatch = yaw >= angle.yawMin && yaw <= angle.yawMax;
        const pitchMatch = pitch >= angle.pitchMin && pitch <= angle.pitchMax;
        return yawMatch && pitchMatch;
    }, []);
    // Clear countdown
    const clearCountdown = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        countdownActiveRef.current = false;
        setCountdown(null);
    }, []);
    const advanceToNextAngle = useCallback(() => {
        if (!isMountedRef.current)
            return;
        clearCountdown();
        const nextIndex = currentAngleIndexRef.current + 1;
        if (nextIndex < CAPTURE_ANGLES.length) {
            setCurrentAngleIndex(nextIndex);
            setAngleMatched(false);
            setCountdown(null);
            countdownActiveRef.current = false;
        }
    }, [clearCountdown]);
    const handleRetakeCurrentAngle = useCallback(() => {
        if (!(currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.id))
            return;
        clearCountdown();
        setCapturedImages((prev) => {
            const next = Object.assign({}, prev);
            delete next[currentAngle.id];
            return next;
        });
        setAngleMatched(false);
        setCountdown(null);
        countdownActiveRef.current = false;
    }, [clearCountdown, currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.id]);
    // Capture photo
    const capturePhoto = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!cameraRef.current || isCapturingRef.current || hasCurrentImageRef.current || isTransitioningRef.current) {
            return;
        }
        isCapturingRef.current = true;
        try {
            const photo = yield cameraRef.current.takePhoto();
            if (!isMountedRef.current)
                return;
            const photoUri = `file://${photo.path}`;
            const capturedAngleIndex = currentAngleIndexRef.current;
            const capturedAngle = CAPTURE_ANGLES[capturedAngleIndex];
            setCapturedImages(prev => (Object.assign(Object.assign({}, prev), { [capturedAngle.id]: photoUri })));
        }
        catch (error) {
            console.log('Capture error:', error);
        }
        finally {
            isCapturingRef.current = false;
        }
    }), []);
    // Start countdown
    const startCountdown = useCallback(() => {
        if (countdownActiveRef.current || isCapturingRef.current || hasCurrentImageRef.current || isTransitioningRef.current) {
            return;
        }
        countdownActiveRef.current = true;
        setCountdown(3);
        let count = 3;
        countdownRef.current = setInterval(() => {
            if (!isMountedRef.current) {
                clearCountdown();
                return;
            }
            count -= 1;
            if (count > 0) {
                setCountdown(count);
            }
            else {
                clearCountdown();
                capturePhoto();
            }
        }, 1000);
    }, [capturePhoto, clearCountdown]);
    // Handle face detection result from worklet
    const handleFaceDetected = Worklets.createRunOnJS((detected, yaw, pitch) => {
        if (!isMountedRef.current)
            return;
        setFaceDetected(detected);
        // Skip processing if transitioning, capturing, or already have image
        if (isTransitioningRef.current || isCapturingRef.current || hasCurrentImageRef.current) {
            return;
        }
        if (detected) {
            const matched = checkAngleMatch(yaw, pitch, currentAngleIndexRef.current);
            setAngleMatched(matched);
            if (matched) {
                if (!countdownActiveRef.current) {
                    startCountdown();
                }
            }
            else {
                clearCountdown();
            }
        }
        else {
            setAngleMatched(false);
            clearCountdown();
        }
    });
    // Frame processor for face detection
    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';
        try {
            const faces = detectFaces(frame);
            if (faces && faces.length > 0) {
                const face = faces[0];
                const yaw = face.yawAngle || 0;
                const pitch = face.pitchAngle || 0;
                handleFaceDetected(true, yaw, pitch);
            }
            else {
                handleFaceDetected(false, 0, 0);
            }
        }
        catch (e) {
            // Silently handle frame processor errors
        }
    }, [detectFaces, handleFaceDetected]);
    const handleContinue = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        if (currentImage && !allCaptured) {
            advanceToNextAngle();
            return;
        }
        if (!allCaptured) {
            return;
        }
        setIsSaving(true);
        try {
            yield updateUserProfile({
                faceVerified: true,
            });
            if (afterVerification === null || afterVerification === void 0 ? void 0 : afterVerification.screen) {
                navigation.navigate(afterVerification.screen, (_c = afterVerification.params) !== null && _c !== void 0 ? _c : {});
            }
            else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'BottomTabBar' }],
                });
            }
        }
        catch (err) {
            Alert.alert(t('Error'), t('Failed to save verification. Please try again.'));
        }
        finally {
            setIsSaving(false);
        }
    }), [advanceToNextAngle, afterVerification, allCaptured, currentImage, navigation, t, updateUserProfile]);
    const handleCancel = useCallback(() => {
        navigation.goBack();
    }, [navigation]);
    // Get instruction text based on current state
    const getInstructionText = () => {
        if (isTransitioning) {
            return t('Great! Moving to the next angle...');
        }
        if (countdown !== null) {
            return t('Perfect!');
        }
        if (currentImage && !allCaptured) {
            return t('Review this capture, then continue or retake.');
        }
        if (currentImage && allCaptured) {
            return t('Review your final capture, then save when ready.');
        }
        if (angleMatched) {
            return t('Perfect!');
        }
        if (faceDetected) {
            return t(currentAngle.instruction);
        }
        return t('Position your face within the frame to begin verification.');
    };
    // Permission screen
    if (!hasPermission) {
        return (_jsxs(View, Object.assign({ style: [Styles.mainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }] }, { children: [_jsx(Text, Object.assign({ style: Styles.titleText }, { children: t('Camera permission required') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: [Styles.descriptionText, { textAlign: 'center' }] }, { children: t('Please grant camera access to capture your face for verification.') })), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: { width: '100%', gap: 12 } }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.primaryButton, onPress: handleRequestPermission }, { children: _jsx(Text, Object.assign({ style: Styles.primaryButtonText }, { children: t('Grant Permission') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.secondaryButton, onPress: openSettings }, { children: _jsx(Text, Object.assign({ style: Styles.secondaryButtonText }, { children: t('Open Settings') })) }))] })), _jsx(SizeBox, { height: 16 }), _jsx(TouchableOpacity, Object.assign({ onPress: () => navigation.goBack() }, { children: _jsx(Text, Object.assign({ style: [Styles.secondaryButtonText, { textDecorationLine: 'underline' }] }, { children: t('Skip for now') })) }))] })));
    }
    // No camera screen
    if (!device) {
        return (_jsx(View, Object.assign({ style: [Styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }] }, { children: _jsx(Text, Object.assign({ style: Styles.titleText }, { children: t('No front camera found') })) })));
    }
    // Determine if camera should show preview
    const showCameraPreview = !currentImage;
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top + 10 }), _jsxs(View, Object.assign({ style: Styles.contentContainer }, { children: [_jsxs(View, Object.assign({ style: Styles.cameraOuterContainer }, { children: [_jsx(View, { style: [Styles.borderCorner, Styles.borderCornerTopLeft] }), _jsx(View, { style: [Styles.borderCorner, Styles.borderCornerTopRight] }), _jsx(View, { style: [Styles.borderCorner, Styles.borderCornerBottomLeft] }), _jsx(View, { style: [Styles.borderCorner, Styles.borderCornerBottomRight] }), _jsx(View, { style: [Styles.borderDash, Styles.borderDashHorizontal, { top: 0, left: '30%' }] }), _jsx(View, { style: [Styles.borderDash, Styles.borderDashHorizontal, { top: 0, right: '30%' }] }), _jsx(View, { style: [Styles.borderDash, Styles.borderDashHorizontal, { bottom: 0, left: '30%' }] }), _jsx(View, { style: [Styles.borderDash, Styles.borderDashHorizontal, { bottom: 0, right: '30%' }] }), _jsx(View, { style: [Styles.borderDash, Styles.borderDashVertical, { left: 0, top: '30%' }] }), _jsx(View, { style: [Styles.borderDash, Styles.borderDashVertical, { left: 0, bottom: '30%' }] }), _jsx(View, { style: [Styles.borderDash, Styles.borderDashVertical, { right: 0, top: '30%' }] }), _jsx(View, { style: [Styles.borderDash, Styles.borderDashVertical, { right: 0, bottom: '30%' }] }), _jsxs(View, Object.assign({ style: Styles.cameraContainer }, { children: [_jsxs(View, Object.assign({ style: [Styles.cameraWrapper, !showCameraPreview && { opacity: 0, position: 'absolute' }] }, { children: [_jsx(Camera, { ref: cameraRef, style: StyleSheet.absoluteFill, device: device, isActive: true, photo: true, frameProcessor: showCameraPreview ? frameProcessor : undefined }), showCameraPreview && (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.faceGuideOverlay }, { children: _jsx(View, { style: [
                                                                Styles.faceGuide,
                                                                angleMatched && { borderColor: colors.greenColor },
                                                                faceDetected && !angleMatched && { borderColor: colors.pendingColor },
                                                                !faceDetected && { borderColor: colors.primaryColor }
                                                            ] }) })), countdown !== null && (_jsx(View, Object.assign({ style: Styles.countdownOverlay }, { children: _jsx(Text, Object.assign({ style: Styles.countdownText }, { children: countdown })) })))] }))] })), currentImage && (_jsx(FastImage, { source: { uri: currentImage }, style: Styles.capturedImage, resizeMode: "cover" }))] }))] })), _jsx(SizeBox, { height: 30 }), _jsxs(View, Object.assign({ style: Styles.progressBarContainer }, { children: [_jsx(View, Object.assign({ style: Styles.progressBarTrack }, { children: _jsx(View, { style: [Styles.progressBarFill, { width: `${progress * 100}%` }] }) })), _jsx(View, { style: [Styles.progressIndicator, { left: `${progress * 100}%` }] })] })), _jsx(SizeBox, { height: 20 }), _jsxs(View, Object.assign({ style: Styles.textSection }, { children: [_jsx(Text, Object.assign({ style: Styles.titleText }, { children: t('Verifying your face') })), _jsx(SizeBox, { height: 14 }), _jsx(Text, Object.assign({ style: Styles.descriptionText }, { children: getInstructionText() }))] })), _jsx(View, { style: { flex: 1 } }), _jsxs(View, Object.assign({ style: Styles.buttonContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [
                                    Styles.primaryButton,
                                    (!currentImage && !allCaptured) && Styles.primaryButtonDisabled,
                                    isSaving && Styles.primaryButtonDisabled
                                ], activeOpacity: 0.7, onPress: handleContinue, disabled: isSaving || (!currentImage && !allCaptured) }, { children: isSaving ? (_jsx(ActivityIndicator, { size: "small", color: colors.pureWhite })) : (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.primaryButtonText }, { children: allCaptured ? t('Save Preferences') : t('Continue') })), _jsx(ArrowRight, { size: 24, color: colors.pureWhite })] })) })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.secondaryButton, activeOpacity: 0.7, onPress: currentImage ? handleRetakeCurrentAngle : handleCancel }, { children: [_jsx(Text, Object.assign({ style: Styles.secondaryButtonText }, { children: currentImage ? t('Redo face') : t('Cancel') })), _jsx(ArrowRight, { size: 24, color: colors.grayColor })] }))] })), _jsx(SizeBox, { height: insets.bottom + 20 })] }))] })));
};
export default FaceVerificationScreen;
