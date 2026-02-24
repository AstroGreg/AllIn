import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Dimensions, ActivityIndicator } from 'react-native';
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
import {ApiError, enrollFace, FaceAngleClass, verifyFaceAngle, startFaceLivenessChallenge, submitFaceLivenessStep, grantFaceRecognitionConsent} from '../../../services/apiGateway';
import { useTranslation } from 'react-i18next'

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAMERA_WIDTH = SCREEN_WIDTH - 54;
const CAMERA_HEIGHT = CAMERA_WIDTH * 1.27;
const AUTO_COUNTDOWN_SECONDS_SAVE = 3;
const AUTO_COUNTDOWN_SECONDS_ENROLL = 2;
const AUTO_CAPTURE_STABLE_FRAMES_SAVE = 3;
const AUTO_CAPTURE_STABLE_FRAMES_ENROLL = 6;

interface CaptureAngle {
    id: string;
    title: string;
    instruction: string;
    yawMin: number;
    yawMax: number;
    pitchMin: number;
    pitchMax: number;
}

type AngleVerifyStatus = 'empty' | 'verifying' | 'accepted' | 'rejected' | 'partial';

interface AngleVerifyState {
    status: AngleVerifyStatus;
    reason?: string;
}

// Only 3 angles for search face capture
const SAVE_FACE_CAPTURE_ANGLES: CaptureAngle[] = [
    { id: 'front', title: 'Front', instruction: 'Look straight at the camera and hold still', yawMin: -15, yawMax: 15, pitchMin: -15, pitchMax: 15 },
    { id: 'left', title: 'Left Side', instruction: 'Turn your head to the left and hold still', yawMin: 10, yawMax: 55, pitchMin: -20, pitchMax: 20 },
    { id: 'right', title: 'Right Side', instruction: 'Turn your head to the right and hold still', yawMin: -55, yawMax: -10, pitchMin: -20, pitchMax: 20 },
];

// 5 angles for backend enrollment (/ai/faces/enroll)
const ENROLL_FACE_CAPTURE_ANGLES: CaptureAngle[] = [
    { id: 'frontal', title: 'Front', instruction: 'Look straight at the camera and hold still', yawMin: -25, yawMax: 25, pitchMin: -25, pitchMax: 25 },
    { id: 'left_profile', title: 'Left Profile', instruction: 'Turn your head to the left and hold still', yawMin: 5, yawMax: 75, pitchMin: -25, pitchMax: 25 },
    { id: 'right_profile', title: 'Right Profile', instruction: 'Turn your head to the right and hold still', yawMin: -75, yawMax: -5, pitchMin: -25, pitchMax: 25 },
    { id: 'upward', title: 'Upward', instruction: 'Tilt your head up and hold still', yawMin: -25, yawMax: 25, pitchMin: 0, pitchMax: 50 },
    { id: 'downward', title: 'Downward', instruction: 'Tilt your head down and hold still', yawMin: -25, yawMax: 25, pitchMin: -50, pitchMax: 0 },
];

const ENROLL_DISTANCE_STEPS = [
    {
        id: 'close',
        label: 'Close up',
        instruction: 'Move closer so your face fills most of the frame.',
    },
    {
        id: 'mid',
        label: 'Mid range',
        instruction: 'Hold the phone about 30 cm (12 in) from your face.',
    },
    {
        id: 'far',
        label: 'Far away',
        instruction: 'Step back slightly so your full head and shoulders are visible.',
    },
];

const normalizeAngleId = (value: string | null | undefined): FaceAngleClass | null => {
    const s = String(value ?? '').trim().toLowerCase();
    switch (s) {
        case 'frontal':
        case 'front':
            return 'frontal';
        case 'left_profile':
        case 'left':
            return 'left_profile';
        case 'right_profile':
        case 'right':
            return 'right_profile';
        case 'upward':
        case 'up':
            return 'upward';
        case 'downward':
        case 'down':
            return 'downward';
        default:
            return null;
    }
};

const angleLabel = (angle: FaceAngleClass | null): string => {
    switch (angle) {
        case 'frontal':
            return 'Front';
        case 'left_profile':
            return 'Left Profile';
        case 'right_profile':
            return 'Right Profile';
        case 'upward':
            return 'Upward';
        case 'downward':
            return 'Downward';
        default:
            return 'Unknown';
    }
};

const SearchFaceCaptureScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const {apiAccessToken} = useAuth();

    const mode: 'saveFace' | 'enrolFace' = route?.params?.mode === 'enrolFace' ? 'enrolFace' : 'saveFace';
    const useLiveness: boolean = mode === 'enrolFace' && route?.params?.useLiveness === true;
    const enrollReplace: boolean = mode === 'enrolFace' ? (route?.params?.replace !== false) : true;
    const guidedAutoCapture: boolean = mode === 'enrolFace' ? (route?.params?.guidedAutoCapture !== false) : true;
    const requireConsentBeforeEnroll: boolean = mode === 'enrolFace' ? (route?.params?.requireConsentBeforeEnroll !== false) : false;
    const templatesPerAngle: number = mode === 'enrolFace' ? (useLiveness ? 1 : 3) : 1;
    const afterEnroll = route?.params?.afterEnroll ?? null;
    const [isGrantingConsent, setIsGrantingConsent] = useState(false);
    const [hasPreEnrollConsent, setHasPreEnrollConsent] = useState(mode !== 'enrolFace' || !requireConsentBeforeEnroll);

    const [livenessChallengeId, setLivenessChallengeId] = useState<string | null>(null);
    const [enrollOrder, setEnrollOrder] = useState<string[] | null>(null);

    const captureAngles = useMemo(() => {
        if (mode !== 'enrolFace') return SAVE_FACE_CAPTURE_ANGLES;
        if (!enrollOrder) return ENROLL_FACE_CAPTURE_ANGLES;
        const byId = new Map(ENROLL_FACE_CAPTURE_ANGLES.map(a => [a.id, a] as const));
        const ordered = enrollOrder.map(id => byId.get(id)).filter(Boolean) as CaptureAngle[];
        // If the server order is missing any angle, fall back safely.
        return ordered.length === ENROLL_FACE_CAPTURE_ANGLES.length ? ordered : ENROLL_FACE_CAPTURE_ANGLES;
    }, [mode, enrollOrder]);

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
    const [capturedImages, setCapturedImages] = useState<Record<string, string[]>>({});
    const [isCapturing, setIsCapturing] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [angleMatched, setAngleMatched] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);
    const [pendingAngleId, setPendingAngleId] = useState<string | null>(null);
    const [, setFaceSizeRatio] = useState<number>(0);
    const [distanceMatched, setDistanceMatched] = useState(false);
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
    const distanceStepIdRef = useRef<string | null>(null);
    const stableMatchFramesRef = useRef(0);

    useEffect(() => {
        currentAngleIndexRef.current = currentAngleIndex;
    }, [currentAngleIndex]);

    useEffect(() => {
        const a = captureAngles[currentAngleIndex];
        const id = a?.id;
        const count = id ? (capturedImages[id]?.length ?? 0) : 0;
        const required = mode === 'enrolFace' ? templatesPerAngle : 1;
        hasCurrentImageRef.current = count >= required;
    }, [capturedImages, currentAngleIndex, captureAngles, mode, templatesPerAngle]);

    const currentAngle = captureAngles[currentAngleIndex];
    const currentImages = capturedImages[currentAngle?.id] ?? [];
    const currentImage = currentImages.length > 0 ? currentImages[currentImages.length - 1] : undefined;
    const distanceIndex = mode === 'enrolFace' ? Math.min(currentImages.length, ENROLL_DISTANCE_STEPS.length - 1) : 0;
    const distanceStep = mode === 'enrolFace' ? ENROLL_DISTANCE_STEPS[distanceIndex] : null;
    const isReviewing = !!pendingPhotoUri;

    useEffect(() => {
        distanceStepIdRef.current = distanceStep?.id ?? null;
    }, [distanceStep]);
    const verifiedCount = useMemo(() => {
        if (mode !== 'enrolFace') return 0;
        return captureAngles.filter(a => (capturedImages[a.id]?.length ?? 0) >= templatesPerAngle && angleVerification[a.id]?.status === 'accepted').length;
    }, [angleVerification, captureAngles, capturedImages, mode, templatesPerAngle]);

    const completedCount = mode === 'enrolFace' ? verifiedCount : Object.values(capturedImages).filter(v => (v?.length ?? 0) > 0).length;
    const allCaptured = completedCount === captureAngles.length;
    const progress = captureAngles.length > 0 ? completedCount / captureAngles.length : 0;
    const consentGateSatisfied = mode !== 'enrolFace' || hasPreEnrollConsent;

    const handleRequestPermission = useCallback(async () => {
        try {
            const result = await Camera.requestCameraPermission();
            if (result === 'denied') {
                Alert.alert(
                    t('Permission Denied'),
                    t('Camera permission is required to capture your face.'),
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
        if (!consentGateSatisfied) return;
        if (!hasPermission) {
            handleRequestPermission();
        }
    }, [consentGateSatisfied, hasPermission, handleRequestPermission]);


    const startLiveness = useCallback(async () => {
        if (!useLiveness) return;
        if (!apiAccessToken) return;
        try {
            const started = await startFaceLivenessChallenge(apiAccessToken, {count: 5});
            setLivenessChallengeId(started.challenge_id);
            // Server returns lower-case strings that match our ids.
            setEnrollOrder((started.steps as any) ?? null);
            setCurrentAngleIndex(0);
            setAngleMatched(false);
            stableMatchFramesRef.current = 0;
            setCountdown(null);
            countdownActiveRef.current = false;
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            Alert.alert(t('Liveness unavailable'), msg);
        }
    }, [apiAccessToken, useLiveness, t]);

    useEffect(() => {
        if (!consentGateSatisfied) return;
        startLiveness();
    }, [consentGateSatisfied, startLiveness]);

    const handleGrantConsentBeforeEnroll = useCallback(async () => {
        if (mode !== 'enrolFace') {
            setHasPreEnrollConsent(true);
            return;
        }
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to enroll your face.'));
            return;
        }
        setIsGrantingConsent(true);
        try {
            await grantFaceRecognitionConsent(apiAccessToken);
            if (!isMountedRef.current) return;
            setHasPreEnrollConsent(true);
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            Alert.alert(t('Consent failed'), msg);
        } finally {
            if (isMountedRef.current) {
                setIsGrantingConsent(false);
            }
        }
    }, [apiAccessToken, mode, t]);

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

        const isProfileAngle =
            angle.id === 'left' ||
            angle.id === 'right' ||
            angle.id === 'left_profile' ||
            angle.id === 'right_profile';

        // On front camera previews, yaw sign may appear mirrored across devices.
        // Use absolute yaw for profile pre-gating; backend verify still enforces exact angle.
        const yawMatch = isProfileAngle
            ? Math.abs(yaw) >= Math.min(Math.abs(angle.yawMin), Math.abs(angle.yawMax)) &&
              Math.abs(yaw) <= Math.max(Math.abs(angle.yawMin), Math.abs(angle.yawMax))
            : yaw >= angle.yawMin && yaw <= angle.yawMax;

        const pitchMatch = pitch >= angle.pitchMin && pitch <= angle.pitchMax;
        return yawMatch && pitchMatch;
    }, [captureAngles]);

    const getDistanceMatch = useCallback((ratio: number, stepId: string | null) => {
        if (!stepId) return true;
        if (!Number.isFinite(ratio) || ratio <= 0) return false;
        const ranges: Record<string, { min: number; max: number }> = {
            // Wider overlap to improve capture acceptance across devices/camera FOVs.
            close: { min: 0.42, max: 0.9 },
            mid: { min: 0.28, max: 0.7 },
            far: { min: 0.15, max: 0.55 },
        };
        const range = ranges[stepId];
        if (!range) return true;
        return ratio >= range.min && ratio <= range.max;
    }, []);

    const capturePhoto = useCallback(async () => {
        if (!cameraRef.current || isCapturingRef.current || isTransitioningRef.current) {
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

            const beforeCount = capturedImages[capturedAngle.id]?.length ?? 0;
            const requiredCount = mode === 'enrolFace' ? templatesPerAngle : 1;

            let canProceed = true;
            if (mode === 'enrolFace') {
                if (!apiAccessToken) {
                    Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to enroll your face.'));
                    return;
                }

                try {
                    let verified: any = null;
                    if (useLiveness && livenessChallengeId) {
                        setAngleVerification(prev => ({
                            ...prev,
                            [capturedAngle.id]: {status: 'verifying'},
                        }));
                        verified = await submitFaceLivenessStep(apiAccessToken, {
                            challenge_id: livenessChallengeId,
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

                        if (canProceed) {
                            const nextCount = beforeCount + 1;
                            setCapturedImages(prev => {
                                const cur = prev[capturedAngle.id] ?? [];
                                return {
                                    ...prev,
                                    [capturedAngle.id]: [...cur, photoUri],
                                };
                            });
                            // Mark angle complete only when enough templates are collected.
                            if (nextCount < requiredCount) {
                                setAngleVerification(prev => ({
                                    ...prev,
                                    [capturedAngle.id]: {status: 'partial'},
                                }));
                            }
                        }
                    } else {
                        if (guidedAutoCapture) {
                            setAngleVerification(prev => ({
                                ...prev,
                                [capturedAngle.id]: {status: 'verifying'},
                            }));
                            const verified = await verifyFaceAngle(apiAccessToken, {
                                angle: capturedAngle.id as FaceAngleClass,
                                uri: photoUri,
                            });
                            if (!isMountedRef.current) return;

                            canProceed = !!verified?.accepted;
                            if (canProceed) {
                                const nextCount = beforeCount + 1;
                                setCapturedImages(prev => {
                                    const cur = prev[capturedAngle.id] ?? [];
                                    return {
                                        ...prev,
                                        [capturedAngle.id]: [...cur, photoUri],
                                    };
                                });
                                setAngleVerification(prev => ({
                                    ...prev,
                                    [capturedAngle.id]: nextCount < requiredCount ? {status: 'partial'} : {status: 'accepted'},
                                }));
                            } else {
                                const reason = String(verified?.reason ?? 'angle_mismatch');
                                setAngleVerification(prev => ({
                                    ...prev,
                                    [capturedAngle.id]: {status: 'rejected', reason},
                                }));
                                if (reason === 'no_face_detected_or_too_small') {
                                    Alert.alert(t('No face detected'), t('Move closer and hold still. We will try again.'));
                                }
                            }
                        } else {
                            // Manual approval for each photo (non-liveness).
                            setPendingPhotoUri(photoUri);
                            setPendingAngleId(capturedAngle.id);
                            setCountdown(null);
                            countdownActiveRef.current = false;
                            return;
                        }
                    }
                } catch (e: any) {
                    canProceed = false;
                    const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                    setAngleVerification(prev => ({
                        ...prev,
                        [capturedAngle.id]: {status: 'rejected', reason: msg},
                    }));
                    Alert.alert(t('Angle check failed'), msg);
                }
            }

            if (mode !== 'enrolFace') {
                setCapturedImages(prev => ({
                    ...prev,
                    [capturedAngle.id]: [photoUri],
                }));
            }

            // In enrol mode, stay on the same angle until we have enough templates.
            const afterCount = mode === 'enrolFace' && canProceed ? (beforeCount + 1) : beforeCount;
            const shouldAdvance = mode !== 'enrolFace' || afterCount >= requiredCount;

            if (mode === 'enrolFace' && canProceed && !shouldAdvance) {
                // Allow the frame processor to restart the countdown for the next template.
                stableMatchFramesRef.current = 0;
                setCountdown(null);
                countdownActiveRef.current = false;
                return;
            }

            if (canProceed && shouldAdvance && capturedAngleIndex < captureAngles.length - 1) {
                isTransitioningRef.current = true;
                setIsTransitioning(true);

                setTimeout(() => {
                    if (!isMountedRef.current) return;

                    setCurrentAngleIndex(capturedAngleIndex + 1);
                    setAngleMatched(false);
                    stableMatchFramesRef.current = 0;
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
            stableMatchFramesRef.current = 0;
            if (isMountedRef.current) {
                setIsCapturing(false);
            }
        }
    }, [apiAccessToken, captureAngles, capturedImages, guidedAutoCapture, livenessChallengeId, mode, templatesPerAngle, useLiveness, t]);

    const clearCountdown = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        countdownActiveRef.current = false;
        setCountdown(null);
    }, []);

    const handleRetakeAngle = useCallback((angleId: string) => {
        const status = mode === 'enrolFace' ? (angleVerification[angleId]?.status ?? 'empty') : 'empty';
        if (useLiveness && status === 'accepted') {
            Alert.alert(
                t('Restart required'),
                t('For liveness enrollment, retaking an accepted step requires restarting the whole flow. Restart now?'),
                [
                    { text: t('Cancel'), style: 'cancel' },
                    {
                        text: t('Restart'),
                        style: 'destructive',
                        onPress: () => {
                            clearCountdown();
                            countdownActiveRef.current = false;
                            setAngleMatched(false);
                            stableMatchFramesRef.current = 0;
                            setCurrentAngleIndex(0);
                            setCapturedImages({});
                            setAngleVerification(() => {
                                const init: Record<string, AngleVerifyState> = {};
                                for (const a of ENROLL_FACE_CAPTURE_ANGLES) {
                                    init[a.id] = { status: 'empty' };
                                }
                                return init;
                            });
                            setEnrollOrder(null);
                            setLivenessChallengeId(null);
                            setTimeout(() => startLiveness(), 0);
                        },
                    },
                ],
            );
            return;
        }

        clearCountdown();
        countdownActiveRef.current = false;
        setAngleMatched(false);
        stableMatchFramesRef.current = 0;
        setCapturedImages(prev => ({
            ...prev,
            [angleId]: [],
        }));
        if (mode === 'enrolFace') {
            setAngleVerification(prev => ({
                ...prev,
                [angleId]: {status: 'empty'},
            }));
        }
    }, [angleVerification, clearCountdown, mode, startLiveness, useLiveness, t]);

    const advanceAngle = useCallback((fromIndex: number) => {
        if (fromIndex >= captureAngles.length - 1) return;
        isTransitioningRef.current = true;
        setIsTransitioning(true);
        setTimeout(() => {
            if (!isMountedRef.current) return;
            setCurrentAngleIndex(fromIndex + 1);
            setAngleMatched(false);
            stableMatchFramesRef.current = 0;
            setCountdown(null);
            countdownActiveRef.current = false;
            setTimeout(() => {
                if (!isMountedRef.current) return;
                isTransitioningRef.current = false;
                setIsTransitioning(false);
            }, 500);
        }, 600);
    }, [captureAngles.length]);

    const handleApprovePhoto = useCallback(() => {
        if (!pendingPhotoUri || !pendingAngleId) return;
        if (mode === 'enrolFace' && !apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to enroll your face.'));
            return;
        }
        const requiredCount = mode === 'enrolFace' ? templatesPerAngle : 1;
        const before = capturedImages[pendingAngleId]?.length ?? 0;
        const nextCount = before + 1;

        const commitApproved = () => {
            setCapturedImages(prev => {
                const cur = prev[pendingAngleId] ?? [];
                return {
                    ...prev,
                    [pendingAngleId]: [...cur, pendingPhotoUri],
                };
            });
            if (mode === 'enrolFace') {
                setAngleVerification(prev => ({
                    ...prev,
                    [pendingAngleId]: nextCount < requiredCount ? {status: 'partial'} : {status: 'accepted'},
                }));
            }
            setPendingPhotoUri(null);
            setPendingAngleId(null);

            if (mode === 'enrolFace' && nextCount >= requiredCount) {
                const idx = captureAngles.findIndex(a => a.id === pendingAngleId);
                if (idx >= 0) {
                    advanceAngle(idx);
                }
            }
        };

        if (mode !== 'enrolFace') {
            commitApproved();
            return;
        }

        setIsApproving(true);
        verifyFaceAngle(apiAccessToken as string, {
            angle: pendingAngleId as FaceAngleClass,
            uri: pendingPhotoUri,
        })
            .then((verified) => {
                if (verified?.accepted) {
                    commitApproved();
                } else {
                    const reason = String(verified?.reason ?? '');
                    if (reason === 'no_face_detected_or_too_small') {
                        Alert.alert(t('No face detected'), t('Move closer and retake this photo.'));
                    } else if (reason === 'angle_mismatch') {
                        const expected = normalizeAngleId(String(verified?.expected_angle ?? pendingAngleId ?? ''));
                        const detected = normalizeAngleId(
                            verified?.detected_angle != null ? String(verified.detected_angle) : null,
                        );
                        const oppositeProfileMismatch =
                            (expected === 'left_profile' && detected === 'right_profile') ||
                            (expected === 'right_profile' && detected === 'left_profile');

                        if (oppositeProfileMismatch) {
                            Alert.alert(
                                t('Angle check failed'),
                                t(
                                    'Detected {{detected}} instead of {{expected}}. Front camera can feel mirrored: turn to the opposite side and retake.',
                                    {
                                        expected: angleLabel(expected),
                                        detected: angleLabel(detected),
                                    },
                                ),
                            );
                        } else {
                            Alert.alert(
                                t('Angle check failed'),
                                t('Expected {{expected}}, detected {{detected}}. Please retake this photo.', {
                                    expected: angleLabel(expected),
                                    detected: angleLabel(detected),
                                }),
                            );
                        }
                    } else {
                        Alert.alert(t('Angle check failed'), t('Please retake this photo.'));
                    }
                }
            })
            .catch((e: any) => {
                const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                Alert.alert(t('Angle check failed'), msg);
            })
            .finally(() => {
                setIsApproving(false);
            });
    }, [advanceAngle, apiAccessToken, captureAngles, capturedImages, mode, pendingAngleId, pendingPhotoUri, t, templatesPerAngle]);

    const handleRejectPhoto = useCallback(() => {
        setPendingPhotoUri(null);
        setPendingAngleId(null);
        stableMatchFramesRef.current = 0;
    }, []);

    const startCountdown = useCallback(() => {
        if (countdownActiveRef.current || isCapturingRef.current || hasCurrentImageRef.current || isTransitioningRef.current) {
            return;
        }

        const initialCount = mode === 'enrolFace' ? AUTO_COUNTDOWN_SECONDS_ENROLL : AUTO_COUNTDOWN_SECONDS_SAVE;
        countdownActiveRef.current = true;
        setCountdown(initialCount);
        let count = initialCount;

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
    }, [capturePhoto, clearCountdown, mode]);

    const handleFaceDetected = Worklets.createRunOnJS((
        detected: boolean,
        yaw: number,
        pitch: number,
        ratio: number
    ) => {
        if (!isMountedRef.current) return;

        setFaceDetected(detected);
        setFaceSizeRatio(ratio);

        if (isTransitioningRef.current || isCapturingRef.current || hasCurrentImageRef.current || isReviewing) {
            return;
        }

        if (detected) {
            const matched = checkAngleMatch(yaw, pitch, currentAngleIndexRef.current);
            setAngleMatched(matched);
            const distanceOk = getDistanceMatch(ratio, distanceStepIdRef.current);
            setDistanceMatched(distanceOk);

            if (matched && distanceOk) {
                stableMatchFramesRef.current += 1;
                const requiredStableFrames =
                    mode === 'enrolFace' ? AUTO_CAPTURE_STABLE_FRAMES_ENROLL : AUTO_CAPTURE_STABLE_FRAMES_SAVE;
                if (!countdownActiveRef.current && stableMatchFramesRef.current >= requiredStableFrames) {
                    startCountdown();
                }
            } else {
                stableMatchFramesRef.current = 0;
                clearCountdown();
            }
        } else {
            setAngleMatched(false);
            setDistanceMatched(false);
            stableMatchFramesRef.current = 0;
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
                const bounds = (face as any).bounds ?? {};
                const faceWidth = Number(bounds.width ?? 0);
                const frameWidth = Number((frame as any).width ?? 1);
                const ratio = frameWidth > 0 ? faceWidth / frameWidth : 0;
                handleFaceDetected(true, yaw, pitch, ratio);
            } else {
                handleFaceDetected(false, 0, 0, 0);
            }
        } catch (e) {
            // Silently handle frame processor errors
        }
    }, [detectFaces, handleFaceDetected]);

    const handleSaveFace = useCallback(async () => {
        if (mode === 'enrolFace') {
            if (!apiAccessToken) {
                Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to enroll your face.'));
                return;
            }

            const required = ['frontal', 'left_profile', 'right_profile', 'upward', 'downward'] as const;
            const missing = required.filter(k => (capturedImages[k]?.length ?? 0) < templatesPerAngle || angleVerification[k]?.status !== 'accepted');
            if (missing.length > 0) {
                Alert.alert(t('Missing angles'), `${t('Please capture')}: ${missing.join(', ')}`);
                const firstMissingIndex = captureAngles.findIndex(a => missing.includes(a.id as any));
                if (firstMissingIndex >= 0) {
                    setCurrentAngleIndex(firstMissingIndex);
                }
                return;
            }

            setIsSubmitting(true);
            try {
                await enrollFace(
                    apiAccessToken,
                    {
                        frontal: capturedImages.frontal,
                        left_profile: capturedImages.left_profile,
                        right_profile: capturedImages.right_profile,
                        upward: capturedImages.upward,
                        downward: capturedImages.downward,
                    },
                    { replace: enrollReplace },
                );

                if (afterEnroll?.screen) {
                    navigation.navigate(afterEnroll.screen, afterEnroll.params ?? {});
                } else {
                    navigation.navigate('AISearchScreen', {autoSearch: true});
                }
            } catch (e: any) {
                if (e instanceof ApiError && e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                    Alert.alert(t('Consent required'), t('Enable face recognition consent first, then try again.'));
                    return;
                }
                const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                Alert.alert(t('Enrollment failed'), msg);
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
    }, [apiAccessToken, afterEnroll, angleVerification, captureAngles, capturedImages, enrollReplace, mode, navigation, t, templatesPerAngle]);

    const handleCancel = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const getInstructionText = () => {
        if (mode === 'enrolFace') {
            if (isReviewing) {
                return t('Review this photo. Use it or retake.');
            }
            const verify = angleVerification[currentAngle?.id];
            if (verify?.status === 'verifying') {
                return t('Checking this angle…');
            }
            if (verify?.status === 'partial') {
                const have = capturedImages[currentAngle?.id]?.length ?? 0;
                const need = Math.max(0, templatesPerAngle - have);
                if (need <= 0) return t('Great! Moving on…');
                if (distanceStep) {
                    return `${t(distanceStep.instruction)} (${have + 1}/${templatesPerAngle})`;
                }
                return `${t('Nice — take')} ${need} ${t('more photo(s) for this angle.')}`;
            }

            if (verify?.status === 'rejected') {
                if (verify.reason === 'no_face_detected_or_too_small') {
                    return t('Face too small or not detected. Move closer and retake.');
                }
                if (verify.reason === 'angle_mismatch') {
                    return t('Angle mismatch. Tap Retake and try again.');
                }
                return t('This angle was not accepted. Tap Retake and try again.');
            }
        }

        if (isTransitioning) {
            return t('Great! Moving to the next angle...');
        }
        if (countdown !== null) {
            return t('Hold still...');
        }
        if (faceDetected && angleMatched && !distanceMatched && distanceStep) {
            return t(distanceStep.instruction);
        }
        if (angleMatched && distanceMatched) {
            return mode === 'enrolFace'
                ? t('Perfect! Hold still for auto capture.')
                : t('Perfect! Hold still...');
        }
        if (faceDetected) {
            if (distanceStep) {
                const have = capturedImages[currentAngle?.id]?.length ?? 0;
                return `${t(distanceStep.instruction)} (${Math.min(have + 1, templatesPerAngle)}/${templatesPerAngle})`;
            }
            return t(currentAngle.instruction);
        }
        return t('Position your face within the frame');
    };

    // Permission screen
    if (mode === 'enrolFace' && !consentGateSatisfied) {
        return (
            <View style={[styles.mainContainer, { backgroundColor: colors.backgroundColor, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
                <Text style={[styles.titleText, { color: colors.mainTextColor }]}>{t('Face recognition consent')}</Text>
                <SizeBox height={8} />
                <Text style={[styles.descriptionText, { color: colors.grayColor, textAlign: 'center' }]}>
                    {t('Before starting face setup, please confirm consent for face recognition.')}
                </Text>
                <SizeBox height={6} />
                <Text style={[styles.descriptionText, { color: colors.grayColor, textAlign: 'center' }]}>
                    {t('This avoids collecting photos first and only asking consent at the end.')}
                </Text>
                <SizeBox height={24} />
                <View style={{ width: '100%', gap: 12 }}>
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.primaryColor }, isGrantingConsent && styles.primaryButtonDisabled]}
                        onPress={handleGrantConsentBeforeEnroll}
                        disabled={isGrantingConsent}
                    >
                        {isGrantingConsent ? (
                            <ActivityIndicator color={colors.pureWhite} />
                        ) : (
                            <>
                                <Text style={[styles.primaryButtonText, { color: colors.pureWhite }]}>{t('Agree and continue')}</Text>
                                <ArrowRight size={24} color={colors.pureWhite} />
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.secondaryButton, { backgroundColor: colors.backgroundColor, borderColor: colors.lightGrayColor }]}
                        onPress={handleCancel}
                        disabled={isGrantingConsent}
                    >
                        <Text style={[styles.secondaryButtonText, { color: colors.grayColor }]}>{t('Not now')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!hasPermission) {
        return (
            <View style={[styles.mainContainer, { backgroundColor: colors.backgroundColor, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
                <Text style={[styles.titleText, { color: colors.mainTextColor }]}>{t('Camera permission required')}</Text>
                <SizeBox height={8} />
                <Text style={[styles.descriptionText, { color: colors.grayColor, textAlign: 'center' }]}>
                    {t('Please grant camera access to capture your face.')}
                </Text>
                <SizeBox height={24} />
                <View style={{ width: '100%', gap: 12 }}>
                    <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primaryColor }]} onPress={handleRequestPermission}>
                        <Text style={[styles.primaryButtonText, { color: colors.pureWhite }]}>{t('Grant Permission')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.backgroundColor, borderColor: colors.lightGrayColor }]} onPress={() => Linking.openSettings()}>
                        <Text style={[styles.secondaryButtonText, { color: colors.grayColor }]}>{t('Open Settings')}</Text>
                    </TouchableOpacity>
                </View>
                <SizeBox height={16} />
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.secondaryButtonText, { color: colors.grayColor, textDecorationLine: 'underline' }]}>{t('Go Back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={[styles.mainContainer, { backgroundColor: colors.backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={[styles.titleText, { color: colors.mainTextColor }]}>{t('No front camera found')}</Text>
            </View>
        );
    }

    const requiredForAngle = mode === 'enrolFace' ? templatesPerAngle : 1;
    const hasEnoughForAngle = currentImages.length >= requiredForAngle;
    const showCameraPreview = consentGateSatisfied && !hasEnoughForAngle && !isReviewing;
    const showCapturedPreview = (isReviewing && !!pendingPhotoUri) || (hasEnoughForAngle && !!currentImage);
    const currentVerify = mode === 'enrolFace' ? angleVerification[currentAngle?.id] : null;
    const canCaptureNow =
        !isReviewing &&
        !isSubmitting &&
        !isApproving &&
        !isCapturing &&
        countdown === null &&
        !isTransitioning &&
        faceDetected &&
        angleMatched &&
        (mode !== 'enrolFace' || distanceMatched);

    return (
        <View style={[styles.mainContainer, { backgroundColor: colors.backgroundColor }]}>
        <SizeBox height={insets.top + 10} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} style={[styles.backButton, { backgroundColor: colors.cardBackground }]}>
                    <ArrowLeft size={24} color={colors.mainTextColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.mainTextColor }]}>
                    {mode === 'enrolFace' ? t('Enroll Face') : t('Add Face')}
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
                                            : (status === 'verifying' || status === 'partial')
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
                                            {t(a.title)}
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
                                isActive={consentGateSatisfied}
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
                        {showCapturedPreview && (pendingPhotoUri || currentImage) && (
                            <FastImage
                                source={{ uri: String(pendingPhotoUri || currentImage) }}
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
                        {currentAngle?.title
                            ? `${t(currentAngle.title)}${distanceStep ? ` · ${t(distanceStep.label)}` : ''}`
                            : t('Capture Complete')}
                    </Text>
                    <SizeBox height={8} />
                    <Text style={[styles.descriptionText, { color: colors.grayColor }]}>
                        {getInstructionText()}
                    </Text>
                </View>

                <View style={{ flex: 1 }} />

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    {isReviewing ? (
                        <View style={styles.reviewRow}>
                            <TouchableOpacity
                                style={[styles.secondaryButton, styles.reviewButton, { backgroundColor: colors.backgroundColor, borderColor: colors.lightGrayColor }]}
                                activeOpacity={0.7}
                                onPress={handleRejectPhoto}
                                disabled={isSubmitting || isApproving}
                            >
                                <Text style={[styles.secondaryButtonText, { color: colors.grayColor }]}>
                                    {t('Retake')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    styles.reviewButton,
                                    { backgroundColor: colors.primaryColor },
                                    (isSubmitting || isApproving) && styles.primaryButtonDisabled,
                                ]}
                                activeOpacity={0.7}
                                onPress={handleApprovePhoto}
                                disabled={isSubmitting || isApproving}
                            >
                                <Text style={[styles.primaryButtonText, { color: colors.pureWhite }]}>
                                    {isApproving ? t('Checking…') : t('Use photo')}
                                </Text>
                                <ArrowRight size={24} color={colors.pureWhite} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    { backgroundColor: colors.primaryColor },
                                    ((allCaptured ? false : !canCaptureNow) || isSubmitting || isApproving) && styles.primaryButtonDisabled
                                ]}
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (allCaptured) {
                                        handleSaveFace();
                                        return;
                                    }
                                    if (canCaptureNow) {
                                        capturePhoto();
                                    }
                                }}
                                disabled={(allCaptured ? false : !canCaptureNow) || isSubmitting || isApproving}
                            >
                                <Text style={[styles.primaryButtonText, { color: colors.pureWhite }]}>
                                    {isSubmitting
                                        ? t('Saving…')
                                        : allCaptured
                                            ? t('Continue')
                                            : t('Capture')}
                                </Text>
                                <ArrowRight size={24} color={colors.pureWhite} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.secondaryButton, { backgroundColor: colors.backgroundColor, borderColor: colors.lightGrayColor }]}
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (currentAngle?.id && currentImages.length > 0) {
                                        handleRetakeAngle(currentAngle.id);
                                        return;
                                    }
                                    handleCancel();
                                }}
                                disabled={isSubmitting || isApproving || isCapturing || (currentVerify?.status === 'verifying')}
                            >
                                <Text style={[styles.secondaryButtonText, { color: colors.grayColor }]}>
                                    {currentImages.length > 0 ? t('Reset angle') : t('Cancel')}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
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
    reviewRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    reviewButton: {
        flex: 1,
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
