import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Dimensions } from 'react-native';
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
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import Fonts from '../../../constants/Fonts';
import {useAuth} from '../../../context/AuthContext';
import {ApiError, enrollFace, FaceAngleClass, verifyFaceAngle} from '../../../services/apiGateway';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAMERA_WIDTH = SCREEN_WIDTH - 54;
const CAMERA_HEIGHT = CAMERA_WIDTH * 1.27;

interface CaptureAngle {
    id: string;
    title: string;
    instruction: string;
    yawMin: number;
    yawMax: number;
    pitchMin: number;
    pitchMax: number;
}

type AngleVerifyStatus = 'empty' | 'verifying' | 'accepted' | 'rejected';

interface AngleVerifyState {
    status: AngleVerifyStatus;
    reason?: string;
}

// Only 3 angles for search face capture
const SAVE_FACE_CAPTURE_ANGLES: CaptureAngle[] = [
    { id: 'front', title: 'Front', instruction: 'Look straight at the camera and hold still', yawMin: -10, yawMax: 10, pitchMin: -10, pitchMax: 10 },
    { id: 'left', title: 'Left Side', instruction: 'Turn your head to the left and hold still', yawMin: 15, yawMax: 45, pitchMin: -15, pitchMax: 15 },
    { id: 'right', title: 'Right Side', instruction: 'Turn your head to the right and hold still', yawMin: -45, yawMax: -15, pitchMin: -15, pitchMax: 15 },
];

// 5 angles for backend enrollment (/ai/enrol/face)
const ENROLL_FACE_CAPTURE_ANGLES: CaptureAngle[] = [
    { id: 'frontal', title: 'Front', instruction: 'Look straight at the camera and hold still', yawMin: -10, yawMax: 10, pitchMin: -10, pitchMax: 10 },
    { id: 'left_profile', title: 'Left Profile', instruction: 'Turn your head to the left and hold still', yawMin: 15, yawMax: 45, pitchMin: -15, pitchMax: 15 },
    { id: 'right_profile', title: 'Right Profile', instruction: 'Turn your head to the right and hold still', yawMin: -45, yawMax: -15, pitchMin: -15, pitchMax: 15 },
    { id: 'upward', title: 'Upward', instruction: 'Tilt your head up and hold still', yawMin: -10, yawMax: 10, pitchMin: 10, pitchMax: 35 },
    { id: 'downward', title: 'Downward', instruction: 'Tilt your head down and hold still', yawMin: -10, yawMax: 10, pitchMin: -35, pitchMax: -10 },
];

const SearchFaceCaptureScreen = ({ navigation, route }: any) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const {apiAccessToken} = useAuth();

    const mode: 'saveFace' | 'enrolFace' = route?.params?.mode === 'enrolFace' ? 'enrolFace' : 'saveFace';
    const captureAngles = useMemo(() => (
        mode === 'enrolFace' ? ENROLL_FACE_CAPTURE_ANGLES : SAVE_FACE_CAPTURE_ANGLES
    ), [mode]);
    const afterEnroll = route?.params?.afterEnroll ?? null;

    const cameraRef = useRef<Camera>(null);
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [angleVerification, setAngleVerification] = useState<Record<string, AngleVerifyState>>(() => {
        if (mode !== 'enrolFace') return {};
        const init: Record<string, AngleVerifyState> = {};
        for (const a of ENROLL_FACE_CAPTURE_ANGLES) {
            init[a.id] = {status: 'empty'};
        }
        return init;
    });

    const currentAngleIndexRef = useRef(currentAngleIndex);
    const isCapturingRef = useRef(false);
    const hasCurrentImageRef = useRef(false);
    const countdownActiveRef = useRef(false);
    const isTransitioningRef = useRef(false);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        currentAngleIndexRef.current = currentAngleIndex;
    }, [currentAngleIndex]);

    useEffect(() => {
        const currentAngle = captureAngles[currentAngleIndex];
        hasCurrentImageRef.current = !!capturedImages[currentAngle?.id];
    }, [capturedImages, currentAngleIndex, captureAngles]);

    const currentAngle = captureAngles[currentAngleIndex];
    const currentImage = capturedImages[currentAngle?.id];
    const verifiedCount = useMemo(() => {
        if (mode !== 'enrolFace') return 0;
        return captureAngles.filter(a => capturedImages[a.id] && angleVerification[a.id]?.status === 'accepted').length;
    }, [angleVerification, captureAngles, capturedImages, mode]);

    const completedCount = mode === 'enrolFace' ? verifiedCount : Object.keys(capturedImages).length;
    const allCaptured = completedCount === captureAngles.length;
    const progress = captureAngles.length > 0 ? completedCount / captureAngles.length : 0;

    const handleRequestPermission = useCallback(async () => {
        try {
            const result = await Camera.requestCameraPermission();
            if (result === 'denied') {
                Alert.alert(
                    'Permission Denied',
                    'Camera permission is required to capture your face.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() }
                    ]
                );
            }
        } catch (error) {
            console.log('Permission request error:', error);
        }
    }, []);

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

    const checkAngleMatch = useCallback((yaw: number, pitch: number, angleIndex: number) => {
        const angle = captureAngles[angleIndex];
        if (!angle) return false;
        const yawMatch = yaw >= angle.yawMin && yaw <= angle.yawMax;
        const pitchMatch = pitch >= angle.pitchMin && pitch <= angle.pitchMax;
        return yawMatch && pitchMatch;
    }, [captureAngles]);

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
            const capturedAngle = captureAngles[capturedAngleIndex];
            if (!capturedAngle?.id) return;

            setCapturedImages(prev => ({
                ...prev,
                [capturedAngle.id]: photoUri
            }));

            let canProceed = true;
            if (mode === 'enrolFace') {
                if (!apiAccessToken) {
                    Alert.alert('Missing API token', 'Log in or set a Dev API token to enroll your face.');
                    return;
                }

                setAngleVerification(prev => ({
                    ...prev,
                    [capturedAngle.id]: {status: 'verifying'},
                }));

                try {
                    const verified = await verifyFaceAngle(apiAccessToken, {
                        angle: capturedAngle.id as FaceAngleClass,
                        uri: photoUri,
                    });

                    if (!isMountedRef.current) return;

                    canProceed = !!verified?.accepted;
                    setAngleVerification(prev => ({
                        ...prev,
                        [capturedAngle.id]: canProceed
                            ? {status: 'accepted'}
                            : {status: 'rejected', reason: String(verified?.reason ?? 'angle_mismatch')},
                    }));
                } catch (e: any) {
                    canProceed = false;
                    const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                    setAngleVerification(prev => ({
                        ...prev,
                        [capturedAngle.id]: {status: 'rejected', reason: msg},
                    }));
                    Alert.alert('Angle check failed', msg);
                }
            }

            if (canProceed && capturedAngleIndex < captureAngles.length - 1) {
                isTransitioningRef.current = true;
                setIsTransitioning(true);

                setTimeout(() => {
                    if (!isMountedRef.current) return;

                    setCurrentAngleIndex(capturedAngleIndex + 1);
                    setAngleMatched(false);
                    setCountdown(null);
                    countdownActiveRef.current = false;

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
    }, [apiAccessToken, captureAngles, mode]);

    const clearCountdown = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        countdownActiveRef.current = false;
        setCountdown(null);
    }, []);

    const handleRetakeAngle = useCallback((angleId: string) => {
        clearCountdown();
        countdownActiveRef.current = false;
        setAngleMatched(false);
        setCapturedImages(prev => {
            const next = {...prev};
            delete next[angleId];
            return next;
        });
        if (mode === 'enrolFace') {
            setAngleVerification(prev => ({
                ...prev,
                [angleId]: {status: 'empty'},
            }));
        }
    }, [clearCountdown, mode]);

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

    const handleFaceDetected = Worklets.createRunOnJS((
        detected: boolean,
        yaw: number,
        pitch: number
    ) => {
        if (!isMountedRef.current) return;

        setFaceDetected(detected);

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

    const handleSaveFace = useCallback(async () => {
        if (mode === 'enrolFace') {
            if (!apiAccessToken) {
                Alert.alert('Missing API token', 'Log in or set a Dev API token to enroll your face.');
                return;
            }

            const required = ['frontal', 'left_profile', 'right_profile', 'upward', 'downward'] as const;
            const missing = required.filter(k => !capturedImages[k] || angleVerification[k]?.status !== 'accepted');
            if (missing.length > 0) {
                Alert.alert('Missing angles', `Please capture: ${missing.join(', ')}`);
                const firstMissingIndex = captureAngles.findIndex(a => missing.includes(a.id as any));
                if (firstMissingIndex >= 0) {
                    setCurrentAngleIndex(firstMissingIndex);
                }
                return;
            }

            setIsSubmitting(true);
            try {
                await enrollFace(apiAccessToken, {
                    frontal: capturedImages.frontal,
                    left_profile: capturedImages.left_profile,
                    right_profile: capturedImages.right_profile,
                    upward: capturedImages.upward,
                    downward: capturedImages.downward,
                });

                if (afterEnroll?.screen) {
                    navigation.navigate(afterEnroll.screen, afterEnroll.params ?? {});
                } else {
                    navigation.navigate('AISearchScreen', {autoSearch: true});
                }
            } catch (e: any) {
                if (e instanceof ApiError && e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                    Alert.alert('Consent required', 'Enable face recognition consent first, then try again.');
                    return;
                }
                const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                Alert.alert('Enrollment failed', msg);
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // Legacy: Navigate to NameThisFaceScreen with captured images
        navigation.navigate('NameThisFaceScreen', {
            frontFaceImage: capturedImages['front'],
            leftSideImage: capturedImages['left'],
            rightSideImage: capturedImages['right'],
        });
    }, [apiAccessToken, afterEnroll, angleVerification, captureAngles, capturedImages, mode, navigation]);

    const handleCancel = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const getInstructionText = () => {
        if (mode === 'enrolFace') {
            const verify = angleVerification[currentAngle?.id];
            if (verify?.status === 'verifying') {
                return 'Checking this angle…';
            }
            if (verify?.status === 'rejected') {
                if (verify.reason === 'no_face_detected_or_too_small') {
                    return 'No face detected. Move closer and retake.';
                }
                if (verify.reason === 'angle_mismatch') {
                    return 'Angle mismatch. Tap Retake and try again.';
                }
                return 'This angle was not accepted. Tap Retake and try again.';
            }
        }

        if (isTransitioning) {
            return 'Great! Moving to the next angle...';
        }
        if (countdown !== null) {
            return 'Hold still...';
        }
        if (angleMatched) {
            return 'Perfect! Hold still...';
        }
        if (faceDetected) {
            return currentAngle.instruction;
        }
        return 'Position your face within the frame';
    };

    // Permission screen
    if (!hasPermission) {
        return (
            <View style={[styles.mainContainer, { backgroundColor: colors.backgroundColor, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
                <Text style={[styles.titleText, { color: colors.mainTextColor }]}>Camera permission required</Text>
                <SizeBox height={8} />
                <Text style={[styles.descriptionText, { color: colors.grayColor, textAlign: 'center' }]}>
                    Please grant camera access to capture your face.
                </Text>
                <SizeBox height={24} />
                <View style={{ width: '100%', gap: 12 }}>
                    <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primaryColor }]} onPress={handleRequestPermission}>
                        <Text style={[styles.primaryButtonText, { color: colors.pureWhite }]}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.backgroundColor, borderColor: colors.lightGrayColor }]} onPress={() => Linking.openSettings()}>
                        <Text style={[styles.secondaryButtonText, { color: colors.grayColor }]}>Open Settings</Text>
                    </TouchableOpacity>
                </View>
                <SizeBox height={16} />
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.secondaryButtonText, { color: colors.grayColor, textDecorationLine: 'underline' }]}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={[styles.mainContainer, { backgroundColor: colors.backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={[styles.titleText, { color: colors.mainTextColor }]}>No front camera found</Text>
            </View>
        );
    }

    const showCameraPreview = !currentImage;
    const currentVerify = mode === 'enrolFace' ? angleVerification[currentAngle?.id] : null;

    return (
        <View style={[styles.mainContainer, { backgroundColor: colors.backgroundColor }]}>
        <SizeBox height={insets.top + 10} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} style={[styles.backButton, { backgroundColor: colors.cardBackground }]}>
                    <ArrowLeft size={24} color={colors.mainTextColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.mainTextColor }]}>
                    {mode === 'enrolFace' ? 'Enroll Face' : 'Add Face'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.contentContainer}>
                {mode === 'enrolFace' && (
                    <>
                        <View style={styles.angleSelectorRow}>
                            {captureAngles.map((a, idx) => {
                                const status = angleVerification[a.id]?.status ?? 'empty';
                                const isSelected = idx === currentAngleIndex;
                                const dotColor =
                                    status === 'accepted'
                                        ? '#22C55E'
                                        : status === 'rejected'
                                            ? '#EF4444'
                                            : status === 'verifying'
                                                ? colors.primaryColor
                                                : colors.lightGrayColor;

                                const disabled = isSubmitting || status === 'verifying';

                                return (
                                    <TouchableOpacity
                                        key={a.id}
                                        activeOpacity={0.8}
                                        disabled={disabled}
                                        onPress={() => {
                                            clearCountdown();
                                            setAngleMatched(false);
                                            setCurrentAngleIndex(idx);
                                        }}
                                        style={[
                                            styles.angleChip,
                                            {
                                                backgroundColor: colors.cardBackground,
                                                borderColor: isSelected ? colors.primaryColor : colors.lightGrayColor,
                                            },
                                        ]}
                                    >
                                        <View style={[styles.angleStatusDot, {backgroundColor: dotColor}]} />
                                        <Text style={[styles.angleChipText, {color: colors.mainTextColor}]}>
                                            {a.title}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <SizeBox height={14} />
                    </>
                )}

                {/* Camera Container */}
                <View style={[styles.cameraOuterContainer, { width: CAMERA_WIDTH, height: CAMERA_HEIGHT }]}>
                    {/* Corner borders */}
                    <View style={[styles.borderCorner, styles.borderCornerTopLeft, { borderColor: colors.primaryColor }]} />
                    <View style={[styles.borderCorner, styles.borderCornerTopRight, { borderColor: colors.primaryColor }]} />
                    <View style={[styles.borderCorner, styles.borderCornerBottomLeft, { borderColor: colors.primaryColor }]} />
                    <View style={[styles.borderCorner, styles.borderCornerBottomRight, { borderColor: colors.primaryColor }]} />
                    {/* Dashes */}
                    <View style={[styles.borderDash, styles.borderDashHorizontal, { backgroundColor: colors.primaryColor, top: 0, left: '30%' }]} />
                    <View style={[styles.borderDash, styles.borderDashHorizontal, { backgroundColor: colors.primaryColor, top: 0, right: '30%' }]} />
                    <View style={[styles.borderDash, styles.borderDashHorizontal, { backgroundColor: colors.primaryColor, bottom: 0, left: '30%' }]} />
                    <View style={[styles.borderDash, styles.borderDashHorizontal, { backgroundColor: colors.primaryColor, bottom: 0, right: '30%' }]} />
                    <View style={[styles.borderDash, styles.borderDashVertical, { backgroundColor: colors.primaryColor, left: 0, top: '30%' }]} />
                    <View style={[styles.borderDash, styles.borderDashVertical, { backgroundColor: colors.primaryColor, left: 0, bottom: '30%' }]} />
                    <View style={[styles.borderDash, styles.borderDashVertical, { backgroundColor: colors.primaryColor, right: 0, top: '30%' }]} />
                    <View style={[styles.borderDash, styles.borderDashVertical, { backgroundColor: colors.primaryColor, right: 0, bottom: '30%' }]} />

                    <View style={[styles.cameraContainer, { backgroundColor: colors.secondaryColor }]}>
                        <View style={[styles.cameraWrapper, !showCameraPreview && { opacity: 0, position: 'absolute' }]}>
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
                                    <View style={styles.faceGuideOverlay}>
                                        <View style={[
                                            styles.faceGuide,
                                            { width: CAMERA_WIDTH * 0.55, height: CAMERA_HEIGHT * 0.65, borderRadius: CAMERA_WIDTH * 0.275 },
                                            angleMatched && { borderColor: '#22C55E' },
                                            faceDetected && !angleMatched && { borderColor: '#F59E0B' },
                                            !faceDetected && { borderColor: colors.primaryColor }
                                        ]} />
                                    </View>
                                    {countdown !== null && (
                                        <View style={styles.countdownOverlay}>
                                            <Text style={styles.countdownText}>{countdown}</Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                        {currentImage && (
                            <FastImage
                                source={{ uri: currentImage }}
                                style={styles.capturedImage}
                                resizeMode="cover"
                            />
                        )}
                    </View>
                </View>

                <SizeBox height={30} />

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarTrack, { backgroundColor: colors.lightGrayColor }]}>
                        <View style={[styles.progressBarFill, { backgroundColor: colors.primaryColor, width: `${progress * 100}%` }]} />
                    </View>
                    <View style={[styles.progressIndicator, { backgroundColor: colors.primaryColor, left: `${progress * 100}%` }]} />
                </View>

                <SizeBox height={20} />

                {/* Title and Instructions */}
                <View style={styles.textSection}>
                    <Text style={[styles.titleText, { color: colors.mainTextColor }]}>
                        {currentAngle?.title || 'Capture Complete'}
                    </Text>
                    <SizeBox height={8} />
                    <Text style={[styles.descriptionText, { color: colors.grayColor }]}>
                        {getInstructionText()}
                    </Text>
                </View>

                <View style={{ flex: 1 }} />

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            { backgroundColor: colors.primaryColor },
                            !allCaptured && styles.primaryButtonDisabled
                        ]}
                        activeOpacity={0.7}
                        onPress={handleSaveFace}
                        disabled={!allCaptured || isSubmitting}
                    >
                        <Text style={[styles.primaryButtonText, { color: colors.pureWhite }]}>
                            {isSubmitting
                                ? 'Saving…'
                                : allCaptured
                                    ? 'Continue'
                                    : `${currentAngleIndex + 1} of ${captureAngles.length}`}
                        </Text>
                        <ArrowRight size={24} color={colors.pureWhite} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, { backgroundColor: colors.backgroundColor, borderColor: colors.lightGrayColor }]}
                        activeOpacity={0.7}
                        onPress={() => {
                            if (currentAngle?.id && currentImage) {
                                handleRetakeAngle(currentAngle.id);
                                return;
                            }
                            handleCancel();
                        }}
                        disabled={!!currentImage && currentVerify?.status === 'verifying'}
                    >
                        <Text style={[styles.secondaryButtonText, { color: colors.grayColor }]}>
                            {currentImage ? 'Retake' : 'Cancel'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={insets.bottom + 20} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.semibold18,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    angleSelectorRow: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 4,
    },
    angleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
    },
    angleStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    angleChipText: {
        ...Fonts.medium12,
        lineHeight: 16,
    },
    cameraOuterContainer: {
        position: 'relative',
    },
    cameraContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
        overflow: 'hidden',
    },
    borderCorner: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderWidth: 3,
        zIndex: 10,
    },
    borderCornerTopLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 14,
    },
    borderCornerTopRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 14,
    },
    borderCornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 14,
    },
    borderCornerBottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 14,
    },
    borderDash: {
        position: 'absolute',
        zIndex: 10,
    },
    borderDashHorizontal: {
        width: 40,
        height: 3,
    },
    borderDashVertical: {
        width: 3,
        height: 40,
    },
    cameraWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    faceGuideOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    faceGuide: {
        borderWidth: 3,
        borderStyle: 'dashed',
    },
    countdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    countdownText: {
        fontSize: 80,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    progressBarContainer: {
        width: '100%',
        height: 16,
        position: 'relative',
        justifyContent: 'center',
    },
    progressBarTrack: {
        width: '100%',
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressIndicator: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        marginLeft: -8,
        top: 0,
    },
    textSection: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 13,
    },
    titleText: {
        ...Fonts.medium16,
        fontSize: 18,
        lineHeight: 26,
        textAlign: 'center',
    },
    descriptionText: {
        ...Fonts.regular14,
        lineHeight: 22,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    primaryButton: {
        height: 54,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
    },
    primaryButtonDisabled: {
        opacity: 0.6,
    },
    secondaryButton: {
        height: 54,
        borderRadius: 10,
        borderWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    secondaryButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
    },
});

export default SearchFaceCaptureScreen;
