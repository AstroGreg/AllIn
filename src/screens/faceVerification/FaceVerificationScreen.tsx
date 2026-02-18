import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowRight, ArrowLeft } from 'iconsax-react-nativejs';
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useFrameProcessor,
} from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';
import { createStyles } from './FaceVerificationScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next'

interface CaptureAngle {
    id: string;
    title: string;
    instruction: string;
    yawMin: number;
    yawMax: number;
    pitchMin: number;
    pitchMax: number;
}

const CAPTURE_ANGLES: CaptureAngle[] = [
    { id: 'front', title: 'Front', instruction: 'Look straight at the camera and hold still', yawMin: -10, yawMax: 10, pitchMin: -10, pitchMax: 10 },
    { id: 'slight_left', title: 'Slight Left', instruction: 'Turn your head slightly to the left and hold still', yawMin: 15, yawMax: 40, pitchMin: -15, pitchMax: 15 },
    { id: 'slight_right', title: 'Slight Right', instruction: 'Turn your head slightly to the right and hold still', yawMin: -40, yawMax: -15, pitchMin: -15, pitchMax: 15 },
    { id: 'slight_up', title: 'Slight Up', instruction: 'Tilt your head slightly upward and hold still', yawMin: -15, yawMax: 15, pitchMin: 10, pitchMax: 35 },
    { id: 'slight_down', title: 'Slight Down', instruction: 'Tilt your head slightly downward and hold still', yawMin: -15, yawMax: 15, pitchMin: -35, pitchMax: -10 },
    { id: 'back_front', title: 'Front Again', instruction: 'Look straight at the camera one more time', yawMin: -10, yawMax: 10, pitchMin: -10, pitchMax: 10 },
];

const FaceVerificationScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile } = useAuth();

    const cameraRef = useRef<Camera>(null);
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
    const [capturedImages, setCapturedImages] = useState<{ [key: string]: string }>({});
    const [isCapturing, setIsCapturing] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [angleMatched, setAngleMatched] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Use refs to track state in worklet callbacks (avoid stale closures)
    const currentAngleIndexRef = useRef(currentAngleIndex);
    const isCapturingRef = useRef(false);
    const hasCurrentImageRef = useRef(false);
    const countdownActiveRef = useRef(false);
    const isTransitioningRef = useRef(false);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    // Keep refs in sync with state
    useEffect(() => {
        currentAngleIndexRef.current = currentAngleIndex;
    }, [currentAngleIndex]);

    useEffect(() => {
        const currentAngle = CAPTURE_ANGLES[currentAngleIndex];
        hasCurrentImageRef.current = !!capturedImages[currentAngle?.id];
    }, [capturedImages, currentAngleIndex]);

    const currentAngle = CAPTURE_ANGLES[currentAngleIndex];
    const currentImage = capturedImages[currentAngle?.id];
    const allCaptured = Object.keys(capturedImages).length === CAPTURE_ANGLES.length;
    const progress = Object.keys(capturedImages).length / CAPTURE_ANGLES.length;

    const handleRequestPermission = useCallback(async () => {
        try {
            const result = await Camera.requestCameraPermission();
            if (result === 'denied') {
                Alert.alert(
                    t('Permission Denied'),
                    t('Camera permission was denied. Please enable it in Settings.'),
                    [
                        { text: t('Cancel'), style: 'cancel' },
                        { text: t('Open Settings'), onPress: () => Linking.openSettings() }
                    ]
                );
            }
        } catch (error) {
            console.log('Permission request error:', error);
        }
    }, [t]);

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
    const checkAngleMatch = useCallback((yaw: number, pitch: number, angleIndex: number) => {
        const angle = CAPTURE_ANGLES[angleIndex];
        if (!angle) return false;
        const yawMatch = yaw >= angle.yawMin && yaw <= angle.yawMax;
        const pitchMatch = pitch >= angle.pitchMin && pitch <= angle.pitchMax;
        return yawMatch && pitchMatch;
    }, []);

    // Capture photo
    const capturePhoto = useCallback(async () => {
        if (!cameraRef.current || isCapturingRef.current || hasCurrentImageRef.current || isTransitioningRef.current) {
            return;
        }

        isCapturingRef.current = true;
        setIsCapturing(true);

        try {
            const photo = await cameraRef.current.takePhoto();

            if (!isMountedRef.current) return;

            const photoUri = `file://${photo.path}`;
            const capturedAngleIndex = currentAngleIndexRef.current;
            const capturedAngle = CAPTURE_ANGLES[capturedAngleIndex];

            setCapturedImages(prev => ({
                ...prev,
                [capturedAngle.id]: photoUri
            }));

            // Auto-advance to next angle after a delay
            if (capturedAngleIndex < CAPTURE_ANGLES.length - 1) {
                isTransitioningRef.current = true;
                setIsTransitioning(true);

                setTimeout(() => {
                    if (!isMountedRef.current) return;

                    setCurrentAngleIndex(capturedAngleIndex + 1);
                    setAngleMatched(false);
                    setCountdown(null);
                    countdownActiveRef.current = false;

                    // Allow a brief moment before enabling detection again
                    setTimeout(() => {
                        if (!isMountedRef.current) return;
                        isTransitioningRef.current = false;
                        setIsTransitioning(false);
                    }, 500);
                }, 1500);
            }
        } catch (error) {
            console.log('Capture error:', error);
        } finally {
            isCapturingRef.current = false;
            if (isMountedRef.current) {
                setIsCapturing(false);
            }
        }
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
            } else {
                clearCountdown();
                capturePhoto();
            }
        }, 1000);
    }, [capturePhoto, clearCountdown]);

    // Handle face detection result from worklet
    const handleFaceDetected = Worklets.createRunOnJS((
        detected: boolean,
        yaw: number,
        pitch: number
    ) => {
        if (!isMountedRef.current) return;

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
            } else {
                clearCountdown();
            }
        } else {
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
            } else {
                handleFaceDetected(false, 0, 0);
            }
        } catch (e) {
            // Silently handle frame processor errors
        }
    }, [detectFaces, handleFaceDetected]);

    const handleContinue = useCallback(async () => {
        setIsSaving(true);
        try {
            await updateUserProfile({
                faceVerified: allCaptured,
            });
            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabBar' }],
            });
        } catch (err: any) {
            Alert.alert(t('Error'), t('Failed to save verification. Please try again.'));
        } finally {
            setIsSaving(false);
        }
    }, [allCaptured, navigation, t, updateUserProfile]);

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
        return (
            <View style={[Styles.mainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
                <Text style={Styles.titleText}>{t('Camera permission required')}</Text>
                <SizeBox height={8} />
                <Text style={[Styles.descriptionText, { textAlign: 'center' }]}>
                    {t('Please grant camera access to capture your face for verification.')}
                </Text>
                <SizeBox height={24} />
                <View style={{ width: '100%', gap: 12 }}>
                    <TouchableOpacity style={Styles.primaryButton} onPress={handleRequestPermission}>
                        <Text style={Styles.primaryButtonText}>{t('Grant Permission')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.secondaryButton} onPress={openSettings}>
                        <Text style={Styles.secondaryButtonText}>{t('Open Settings')}</Text>
                    </TouchableOpacity>
                </View>
                <SizeBox height={16} />
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[Styles.secondaryButtonText, { textDecorationLine: 'underline' }]}>{t('Skip for now')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // No camera screen
    if (!device) {
        return (
            <View style={[Styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={Styles.titleText}>{t('No front camera found')}</Text>
            </View>
        );
    }

    // Determine if camera should show preview
    const showCameraPreview = !currentImage;

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top + 10} />

            <View style={Styles.contentContainer}>
                {/* Camera Container */}
                <View style={Styles.cameraOuterContainer}>
                    {/* Custom dashed border */}
                    {/* Corners */}
                    <View style={[Styles.borderCorner, Styles.borderCornerTopLeft]} />
                    <View style={[Styles.borderCorner, Styles.borderCornerTopRight]} />
                    <View style={[Styles.borderCorner, Styles.borderCornerBottomLeft]} />
                    <View style={[Styles.borderCorner, Styles.borderCornerBottomRight]} />
                    {/* Top dashes */}
                    <View style={[Styles.borderDash, Styles.borderDashHorizontal, { top: 0, left: '30%' }]} />
                    <View style={[Styles.borderDash, Styles.borderDashHorizontal, { top: 0, right: '30%' }]} />
                    {/* Bottom dashes */}
                    <View style={[Styles.borderDash, Styles.borderDashHorizontal, { bottom: 0, left: '30%' }]} />
                    <View style={[Styles.borderDash, Styles.borderDashHorizontal, { bottom: 0, right: '30%' }]} />
                    {/* Left dashes */}
                    <View style={[Styles.borderDash, Styles.borderDashVertical, { left: 0, top: '30%' }]} />
                    <View style={[Styles.borderDash, Styles.borderDashVertical, { left: 0, bottom: '30%' }]} />
                    {/* Right dashes */}
                    <View style={[Styles.borderDash, Styles.borderDashVertical, { right: 0, top: '30%' }]} />
                    <View style={[Styles.borderDash, Styles.borderDashVertical, { right: 0, bottom: '30%' }]} />

                    <View style={Styles.cameraContainer}>
                        {/* Always render camera but control visibility */}
                        <View style={[Styles.cameraWrapper, !showCameraPreview && { opacity: 0, position: 'absolute' }]}>
                            <Camera
                                ref={cameraRef}
                                style={StyleSheet.absoluteFill}
                                device={device}
                                isActive={true}
                                photo={true}
                                frameProcessor={showCameraPreview ? frameProcessor : undefined}
                            />
                            {showCameraPreview && (
                                <>
                                    {/* Face guide overlay with oval */}
                                    <View style={Styles.faceGuideOverlay}>
                                        <View style={[
                                            Styles.faceGuide,
                                            angleMatched && { borderColor: colors.greenColor },
                                            faceDetected && !angleMatched && { borderColor: colors.pendingColor },
                                            !faceDetected && { borderColor: colors.primaryColor }
                                        ]} />
                                    </View>
                                    {/* Countdown overlay */}
                                    {countdown !== null && (
                                        <View style={Styles.countdownOverlay}>
                                            <Text style={Styles.countdownText}>{countdown}</Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                        {/* Show captured image */}
                        {currentImage && (
                            <FastImage
                                source={{ uri: currentImage }}
                                style={Styles.capturedImage}
                                resizeMode="cover"
                            />
                        )}
                    </View>
                </View>

                <SizeBox height={30} />

                {/* Progress Bar */}
                <View style={Styles.progressBarContainer}>
                    <View style={Styles.progressBarTrack}>
                        <View style={[Styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <View style={[Styles.progressIndicator, { left: `${progress * 100}%` }]} />
                </View>

                <SizeBox height={20} />

                {/* Title and Instructions */}
                <View style={Styles.textSection}>
                    <Text style={Styles.titleText}>{t('Verifying your face')}</Text>
                    <SizeBox height={14} />
                    <Text style={Styles.descriptionText}>
                        {getInstructionText()}
                    </Text>
                </View>

                <View style={{ flex: 1 }} />

                {/* Buttons */}
                <View style={Styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            Styles.primaryButton,
                            isSaving && Styles.primaryButtonDisabled
                        ]}
                        activeOpacity={0.7}
                        onPress={handleContinue}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={colors.pureWhite} />
                        ) : (
                            <>
                                <Text style={Styles.primaryButtonText}>
                                    {allCaptured ? t('Save Preferences') : t('Continue')}
                                </Text>
                                <ArrowRight size={24} color={colors.pureWhite} />
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={Styles.secondaryButton}
                        activeOpacity={0.7}
                        onPress={handleCancel}
                    >
                        <Text style={Styles.secondaryButtonText}>{t('Cancel')}</Text>
                        <ArrowRight size={24} color={colors.grayColor} />
                    </TouchableOpacity>
                </View>

                <SizeBox height={insets.bottom + 20} />
            </View>
        </View>
    );
};

export default FaceVerificationScreen;
