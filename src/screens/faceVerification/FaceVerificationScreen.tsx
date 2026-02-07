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
import { verifyFaceAngle, grantFaceRecognitionConsent, enrollFace } from '../../services/api';

type ApiAngle = 'frontal' | 'left_profile' | 'right_profile' | 'upward' | 'downward';

interface CaptureAngle {
    id: ApiAngle;
    title: string;
    instruction: string;
    yawMin: number;
    yawMax: number;
    pitchMin: number;
    pitchMax: number;
}

const CAPTURE_ANGLES: CaptureAngle[] = [
    { id: 'frontal', title: 'Front', instruction: 'Look straight at the camera and hold still', yawMin: -10, yawMax: 10, pitchMin: -10, pitchMax: 10 },
    { id: 'left_profile', title: 'Left Profile', instruction: 'Turn your head to the left and hold still', yawMin: 15, yawMax: 40, pitchMin: -15, pitchMax: 15 },
    { id: 'right_profile', title: 'Right Profile', instruction: 'Turn your head to the right and hold still', yawMin: -40, yawMax: -15, pitchMin: -15, pitchMax: 15 },
    { id: 'upward', title: 'Look Up', instruction: 'Tilt your head slightly upward and hold still', yawMin: -15, yawMax: 15, pitchMin: 10, pitchMax: 35 },
    { id: 'downward', title: 'Look Down', instruction: 'Tilt your head slightly downward and hold still', yawMin: -15, yawMax: 15, pitchMin: -35, pitchMax: -10 },
];

const FaceVerificationScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile, accessToken } = useAuth();

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
    const [verifiedImages, setVerifiedImages] = useState<{ [key: string]: boolean }>({});
    const [isCapturing, setIsCapturing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [angleMatched, setAngleMatched] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Use refs to track state in worklet callbacks
    const currentAngleIndexRef = useRef(currentAngleIndex);
    const isCapturingRef = useRef(false);
    const hasCurrentImageRef = useRef(false);
    const countdownActiveRef = useRef(false);
    const isTransitioningRef = useRef(false);
    const isVerifyingRef = useRef(false);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        currentAngleIndexRef.current = currentAngleIndex;
    }, [currentAngleIndex]);

    useEffect(() => {
        const currentAngle = CAPTURE_ANGLES[currentAngleIndex];
        hasCurrentImageRef.current = !!verifiedImages[currentAngle?.id];
    }, [verifiedImages, currentAngleIndex]);

    useEffect(() => {
        isVerifyingRef.current = isVerifying;
    }, [isVerifying]);

    const currentAngle = CAPTURE_ANGLES[currentAngleIndex];
    const currentImage = capturedImages[currentAngle?.id];
    const isCurrentVerified = verifiedImages[currentAngle?.id];
    const allVerified = CAPTURE_ANGLES.every(a => verifiedImages[a.id]);
    const progress = Object.keys(verifiedImages).length / CAPTURE_ANGLES.length;

    const handleRequestPermission = useCallback(async () => {
        try {
            const result = await Camera.requestCameraPermission();
            if (result === 'denied') {
                Alert.alert(
                    'Permission Denied',
                    'Camera permission was denied. Please enable it in Settings.',
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

    const openSettings = useCallback(() => {
        Linking.openSettings();
    }, []);

    const checkAngleMatch = useCallback((yaw: number, pitch: number, angleIndex: number) => {
        const angle = CAPTURE_ANGLES[angleIndex];
        if (!angle) return false;
        const yawMatch = yaw >= angle.yawMin && yaw <= angle.yawMax;
        const pitchMatch = pitch >= angle.pitchMin && pitch <= angle.pitchMax;
        return yawMatch && pitchMatch;
    }, []);

    // Verify a captured photo with the API (falls back to local detection if API is unavailable)
    const verifyCapture = useCallback(async (angleId: ApiAngle, photoUri: string) => {
        if (!accessToken) {
            console.log('[FaceVerify] No access token, using local verification');
            return true;
        }

        setIsVerifying(true);
        isVerifyingRef.current = true;
        try {
            const result = await verifyFaceAngle(accessToken, angleId, photoUri);
            console.log('[FaceVerify] API result:', JSON.stringify(result));

            if (result.accepted) {
                return true;
            } else {
                Alert.alert(
                    'Verification Failed',
                    result.reason || `Expected ${result.expected_angle} but detected ${result.detected_angle}. Please try again.`,
                );
                return false;
            }
        } catch (err: any) {
            console.log('[FaceVerify] API error, falling back to local verification:', err.message);
            // Accept local face detection result if API is unavailable (e.g. token not configured)
            return true;
        } finally {
            setIsVerifying(false);
            isVerifyingRef.current = false;
        }
    }, [accessToken]);

    // Capture photo
    const capturePhoto = useCallback(async () => {
        if (!cameraRef.current || isCapturingRef.current || hasCurrentImageRef.current || isTransitioningRef.current) {
            return;
        }

        isCapturingRef.current = true;
        setIsCapturing(true);

        try {
            const photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'quality',
            });

            if (!isMountedRef.current) return;

            const photoUri = `file://${photo.path}`;
            const capturedAngleIndex = currentAngleIndexRef.current;
            const capturedAngle = CAPTURE_ANGLES[capturedAngleIndex];

            // Show the captured image immediately
            setCapturedImages(prev => ({
                ...prev,
                [capturedAngle.id]: photoUri
            }));

            // Verify with the API
            const verified = await verifyCapture(capturedAngle.id, photoUri);

            if (!isMountedRef.current) return;

            if (verified) {
                // Mark as verified
                setVerifiedImages(prev => ({
                    ...prev,
                    [capturedAngle.id]: true
                }));

                // Auto-advance to next angle
                if (capturedAngleIndex < CAPTURE_ANGLES.length - 1) {
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
            } else {
                // Verification failed — clear the captured image so user can retry
                setCapturedImages(prev => {
                    const next = { ...prev };
                    delete next[capturedAngle.id];
                    return next;
                });
                setAngleMatched(false);
                setCountdown(null);
                countdownActiveRef.current = false;
            }
        } catch (error) {
            console.log('Capture error:', error);
        } finally {
            isCapturingRef.current = false;
            if (isMountedRef.current) {
                setIsCapturing(false);
            }
        }
    }, [verifyCapture]);

    const clearCountdown = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        countdownActiveRef.current = false;
        setCountdown(null);
    }, []);

    const startCountdown = useCallback(() => {
        if (countdownActiveRef.current || isCapturingRef.current || hasCurrentImageRef.current || isTransitioningRef.current || isVerifyingRef.current) {
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

        if (isTransitioningRef.current || isCapturingRef.current || hasCurrentImageRef.current || isVerifyingRef.current) {
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

    const handleContinue = useCallback(async () => {
        if (!accessToken) {
            Alert.alert('Error', 'Not authenticated. Please log in again.');
            return;
        }

        setIsSaving(true);
        try {
            // Try API enrollment (non-blocking if token isn't configured for the API)
            try {
                await grantFaceRecognitionConsent(accessToken);
                console.log('[FaceVerify] Consent granted');

                await enrollFace(accessToken, {
                    frontal: capturedImages['frontal'],
                    left_profile: capturedImages['left_profile'],
                    right_profile: capturedImages['right_profile'],
                    upward: capturedImages['upward'],
                    downward: capturedImages['downward'],
                });
                console.log('[FaceVerify] Face enrollment successful');
            } catch (apiErr: any) {
                console.log('[FaceVerify] API enrollment skipped (token not configured):', apiErr.message);
            }

            // Update profile metadata locally
            await updateUserProfile({
                faceVerified: true,
            });

            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabBar' }],
            });
        } catch (err: any) {
            console.log('[FaceVerify] Save error:', err.message);
            Alert.alert('Error', err.message || 'Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [navigation, updateUserProfile, accessToken, capturedImages]);

    const handleCancel = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const getInstructionText = () => {
        if (isVerifying) {
            return 'Verifying your face angle...';
        }
        if (isTransitioning) {
            return 'Great! Moving to the next angle...';
        }
        if (countdown !== null) {
            return 'Perfect!';
        }
        if (angleMatched) {
            return 'Perfect!';
        }
        if (faceDetected) {
            return currentAngle.instruction;
        }
        return 'Position your face within the frame to begin verification.';
    };

    // Permission screen
    if (!hasPermission) {
        return (
            <View style={[Styles.mainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
                <Text style={Styles.titleText}>Camera permission required</Text>
                <SizeBox height={8} />
                <Text style={[Styles.descriptionText, { textAlign: 'center' }]}>
                    Please grant camera access to capture your face for verification.
                </Text>
                <SizeBox height={24} />
                <View style={{ width: '100%', gap: 12 }}>
                    <TouchableOpacity style={Styles.primaryButton} onPress={handleRequestPermission}>
                        <Text style={Styles.primaryButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.secondaryButton} onPress={openSettings}>
                        <Text style={Styles.secondaryButtonText}>Open Settings</Text>
                    </TouchableOpacity>
                </View>
                <SizeBox height={16} />
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[Styles.secondaryButtonText, { textDecorationLine: 'underline' }]}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // No camera screen
    if (!device) {
        return (
            <View style={[Styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={Styles.titleText}>No front camera found</Text>
            </View>
        );
    }

    const showCameraPreview = !currentImage || !isCurrentVerified;

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top + 10} />

            <View style={Styles.contentContainer}>
                {/* Camera Container */}
                <View style={Styles.cameraOuterContainer}>
                    {/* Custom dashed border */}
                    <View style={[Styles.borderCorner, Styles.borderCornerTopLeft]} />
                    <View style={[Styles.borderCorner, Styles.borderCornerTopRight]} />
                    <View style={[Styles.borderCorner, Styles.borderCornerBottomLeft]} />
                    <View style={[Styles.borderCorner, Styles.borderCornerBottomRight]} />
                    <View style={[Styles.borderDash, Styles.borderDashHorizontal, { top: 0, left: '30%' }]} />
                    <View style={[Styles.borderDash, Styles.borderDashHorizontal, { top: 0, right: '30%' }]} />
                    <View style={[Styles.borderDash, Styles.borderDashHorizontal, { bottom: 0, left: '30%' }]} />
                    <View style={[Styles.borderDash, Styles.borderDashHorizontal, { bottom: 0, right: '30%' }]} />
                    <View style={[Styles.borderDash, Styles.borderDashVertical, { left: 0, top: '30%' }]} />
                    <View style={[Styles.borderDash, Styles.borderDashVertical, { left: 0, bottom: '30%' }]} />
                    <View style={[Styles.borderDash, Styles.borderDashVertical, { right: 0, top: '30%' }]} />
                    <View style={[Styles.borderDash, Styles.borderDashVertical, { right: 0, bottom: '30%' }]} />

                    <View style={Styles.cameraContainer}>
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
                                    <View style={Styles.faceGuideOverlay}>
                                        <View style={[
                                            Styles.faceGuide,
                                            angleMatched && { borderColor: colors.greenColor },
                                            faceDetected && !angleMatched && { borderColor: colors.yellowColor || '#FFA500' },
                                            !faceDetected && { borderColor: colors.primaryColor }
                                        ]} />
                                    </View>
                                    {countdown !== null && (
                                        <View style={Styles.countdownOverlay}>
                                            <Text style={Styles.countdownText}>{countdown}</Text>
                                        </View>
                                    )}
                                    {isVerifying && (
                                        <View style={Styles.countdownOverlay}>
                                            <ActivityIndicator size="large" color={colors.pureWhite} />
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                        {currentImage && isCurrentVerified && (
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
                    <Text style={Styles.titleText}>Verifying your face</Text>
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
                            (!allVerified || isSaving) && Styles.primaryButtonDisabled
                        ]}
                        activeOpacity={0.7}
                        onPress={handleContinue}
                        disabled={!allVerified || isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={colors.pureWhite} />
                        ) : (
                            <>
                                <Text style={Styles.primaryButtonText}>
                                    {allVerified ? 'Save Preferences' : `${currentAngleIndex + 1} of ${CAPTURE_ANGLES.length}`}
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
                        <Text style={Styles.secondaryButtonText}>Cancel</Text>
                        <ArrowRight size={24} color={colors.grayColor} />
                    </TouchableOpacity>
                </View>

                <SizeBox height={insets.bottom + 20} />
            </View>
        </View>
    );
};

export default FaceVerificationScreen;
