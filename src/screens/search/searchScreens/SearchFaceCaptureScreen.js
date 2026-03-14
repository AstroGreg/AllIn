var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowRight, ArrowLeft } from 'iconsax-react-nativejs';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor, } from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import Fonts from '../../../constants/Fonts';
import { useAuth } from '../../../context/AuthContext';
import { ApiError, enrollFace, verifyFaceAngle, startFaceLivenessChallenge, submitFaceLivenessStep, grantFaceRecognitionConsent } from '../../../services/apiGateway';
import { useTranslation } from 'react-i18next';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAMERA_WIDTH = SCREEN_WIDTH - 54;
const CAMERA_HEIGHT = CAMERA_WIDTH * 1.27;
const AUTO_COUNTDOWN_SECONDS_SAVE = 3;
const AUTO_COUNTDOWN_SECONDS_ENROLL = 2;
const AUTO_CAPTURE_STABLE_FRAMES_SAVE = 3;
const AUTO_CAPTURE_STABLE_FRAMES_ENROLL = 6;
// Only 3 angles for search face capture
const SAVE_FACE_CAPTURE_ANGLES = [
    { id: 'front', title: 'Front', instruction: 'Look straight at the camera and hold still', yawMin: -15, yawMax: 15, pitchMin: -15, pitchMax: 15 },
    { id: 'left', title: 'Left Side', instruction: 'Turn your head to the left and hold still', yawMin: 10, yawMax: 55, pitchMin: -20, pitchMax: 20 },
    { id: 'right', title: 'Right Side', instruction: 'Turn your head to the right and hold still', yawMin: -55, yawMax: -10, pitchMin: -20, pitchMax: 20 },
];
// Enrollment uses five verified angles, one accepted capture per angle.
const ENROLL_FACE_CAPTURE_ANGLES = [
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
const normalizeAngleId = (value) => {
    const s = String(value !== null && value !== void 0 ? value : '').trim().toLowerCase();
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
const angleLabel = (angle) => {
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
const SearchFaceCaptureScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { t } = useTranslation();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { apiAccessToken } = useAuth();
    const mode = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.mode) === 'enrolFace' ? 'enrolFace' : 'saveFace';
    const useLiveness = mode === 'enrolFace' && ((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.useLiveness) === true;
    const enrollReplace = mode === 'enrolFace' ? (((_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.replace) !== false) : true;
    const guidedAutoCapture = mode === 'enrolFace' ? (((_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.guidedAutoCapture) !== false) : true;
    const requireConsentBeforeEnroll = mode === 'enrolFace' ? (((_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.requireConsentBeforeEnroll) !== false) : false;
    const afterEnroll = (_g = (_f = route === null || route === void 0 ? void 0 : route.params) === null || _f === void 0 ? void 0 : _f.afterEnroll) !== null && _g !== void 0 ? _g : null;
    const [isGrantingConsent, setIsGrantingConsent] = useState(false);
    const [hasPreEnrollConsent, setHasPreEnrollConsent] = useState(mode !== 'enrolFace' || !requireConsentBeforeEnroll);
    const [livenessChallengeId, setLivenessChallengeId] = useState(null);
    const [enrollOrder, setEnrollOrder] = useState(null);
    const captureAngles = useMemo(() => {
        if (mode !== 'enrolFace')
            return SAVE_FACE_CAPTURE_ANGLES;
        if (!enrollOrder)
            return ENROLL_FACE_CAPTURE_ANGLES;
        const byId = new Map(ENROLL_FACE_CAPTURE_ANGLES.map(a => [a.id, a]));
        const ordered = enrollOrder.map(id => byId.get(id)).filter(Boolean);
        // If the server order is missing any angle, fall back safely.
        return ordered.length === ENROLL_FACE_CAPTURE_ANGLES.length ? ordered : ENROLL_FACE_CAPTURE_ANGLES;
    }, [mode, enrollOrder]);
    const cameraRef = useRef(null);
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
    const [isCapturing, setIsCapturing] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [angleMatched, setAngleMatched] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [pendingPhotoUri, setPendingPhotoUri] = useState(null);
    const [pendingAngleId, setPendingAngleId] = useState(null);
    const [, setFaceSizeRatio] = useState(0);
    const [distanceMatched, setDistanceMatched] = useState(false);
    const [angleVerification, setAngleVerification] = useState(() => {
        if (mode !== 'enrolFace')
            return {};
        const init = {};
        for (const a of ENROLL_FACE_CAPTURE_ANGLES) {
            init[a.id] = { status: 'empty' };
        }
        return init;
    });
    const currentAngleIndexRef = useRef(currentAngleIndex);
    const isCapturingRef = useRef(false);
    const hasCurrentImageRef = useRef(false);
    const countdownActiveRef = useRef(false);
    const isTransitioningRef = useRef(false);
    const countdownRef = useRef(null);
    const isMountedRef = useRef(true);
    const distanceStepIdRef = useRef(null);
    const stableMatchFramesRef = useRef(0);
    useEffect(() => {
        currentAngleIndexRef.current = currentAngleIndex;
    }, [currentAngleIndex]);
    const getRequiredCapturesForAngle = useCallback((angleId) => {
        if (mode !== 'enrolFace')
            return 1;
        return angleId === 'frontal' ? ENROLL_DISTANCE_STEPS.length : 1;
    }, [mode]);
    const getDistanceStepForAngle = useCallback((angleId, currentCount = 0) => {
        if (mode !== 'enrolFace' || angleId !== 'frontal')
            return null;
        const index = Math.min(currentCount, ENROLL_DISTANCE_STEPS.length - 1);
        return ENROLL_DISTANCE_STEPS[index];
    }, [mode]);
    useEffect(() => {
        var _a, _b;
        const a = captureAngles[currentAngleIndex];
        const id = a === null || a === void 0 ? void 0 : a.id;
        const count = id ? ((_b = (_a = capturedImages[id]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) : 0;
        const required = getRequiredCapturesForAngle(id);
        hasCurrentImageRef.current = count >= required;
    }, [capturedImages, currentAngleIndex, captureAngles, getRequiredCapturesForAngle]);
    const currentAngle = captureAngles[currentAngleIndex];
    const currentImages = (_h = capturedImages[currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.id]) !== null && _h !== void 0 ? _h : [];
    const currentImage = currentImages.length > 0 ? currentImages[currentImages.length - 1] : undefined;
    const currentRequiredCount = getRequiredCapturesForAngle(currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.id);
    const distanceStep = getDistanceStepForAngle(currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.id, currentImages.length);
    const isReviewing = !!pendingPhotoUri;
    useEffect(() => {
        var _a;
        distanceStepIdRef.current = (_a = distanceStep === null || distanceStep === void 0 ? void 0 : distanceStep.id) !== null && _a !== void 0 ? _a : null;
    }, [distanceStep]);
    const verifiedCount = useMemo(() => {
        if (mode !== 'enrolFace')
            return 0;
        return captureAngles.filter(a => {
            var _a, _b, _c;
            const required = getRequiredCapturesForAngle(a.id);
            return ((_b = (_a = capturedImages[a.id]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) >= required && ((_c = angleVerification[a.id]) === null || _c === void 0 ? void 0 : _c.status) === 'accepted';
        }).length;
    }, [angleVerification, captureAngles, capturedImages, getRequiredCapturesForAngle, mode]);
    const completedCount = mode === 'enrolFace' ? verifiedCount : Object.values(capturedImages).filter(v => { var _a; return ((_a = v === null || v === void 0 ? void 0 : v.length) !== null && _a !== void 0 ? _a : 0) > 0; }).length;
    const allCaptured = completedCount === captureAngles.length;
    const progress = captureAngles.length > 0 ? completedCount / captureAngles.length : 0;
    const consentGateSatisfied = mode !== 'enrolFace' || hasPreEnrollConsent;
    const handleRequestPermission = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield Camera.requestCameraPermission();
            if (result === 'denied') {
                Alert.alert(t('Permission Denied'), t('Camera permission is required to capture your face.'), [
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
        if (!consentGateSatisfied)
            return;
        if (!hasPermission) {
            handleRequestPermission();
        }
    }, [consentGateSatisfied, hasPermission, handleRequestPermission]);
    const startLiveness = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _j, _k;
        if (!useLiveness)
            return;
        if (!apiAccessToken)
            return;
        try {
            const started = yield startFaceLivenessChallenge(apiAccessToken, { count: 5 });
            setLivenessChallengeId(started.challenge_id);
            // Server returns lower-case strings that match our ids.
            setEnrollOrder((_j = started.steps) !== null && _j !== void 0 ? _j : null);
            setCurrentAngleIndex(0);
            setAngleMatched(false);
            stableMatchFramesRef.current = 0;
            setCountdown(null);
            countdownActiveRef.current = false;
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_k = e === null || e === void 0 ? void 0 : e.message) !== null && _k !== void 0 ? _k : e);
            Alert.alert(t('Liveness unavailable'), msg);
        }
    }), [apiAccessToken, useLiveness, t]);
    useEffect(() => {
        if (!consentGateSatisfied)
            return;
        startLiveness();
    }, [consentGateSatisfied, startLiveness]);
    const handleGrantConsentBeforeEnroll = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _l;
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
            yield grantFaceRecognitionConsent(apiAccessToken);
            if (!isMountedRef.current)
                return;
            setHasPreEnrollConsent(true);
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_l = e === null || e === void 0 ? void 0 : e.message) !== null && _l !== void 0 ? _l : e);
            Alert.alert(t('Consent failed'), msg);
        }
        finally {
            if (isMountedRef.current) {
                setIsGrantingConsent(false);
            }
        }
    }), [apiAccessToken, mode, t]);
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
    const checkAngleMatch = useCallback((yaw, pitch, angleIndex) => {
        const angle = captureAngles[angleIndex];
        if (!angle)
            return false;
        const isProfileAngle = angle.id === 'left' ||
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
    const getDistanceMatch = useCallback((ratio, stepId) => {
        if (!stepId)
            return true;
        if (!Number.isFinite(ratio) || ratio <= 0)
            return false;
        const ranges = {
            // Wider overlap to improve capture acceptance across devices/camera FOVs.
            close: { min: 0.42, max: 0.9 },
            mid: { min: 0.28, max: 0.7 },
            far: { min: 0.15, max: 0.55 },
        };
        const range = ranges[stepId];
        if (!range)
            return true;
        return ratio >= range.min && ratio <= range.max;
    }, []);
    const capturePhoto = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _m, _o, _p, _q;
        if (!cameraRef.current || isCapturingRef.current || isTransitioningRef.current) {
            return;
        }
        isCapturingRef.current = true;
        setIsCapturing(true);
        try {
            const photo = yield cameraRef.current.takePhoto();
            setSubmitError(null);
            if (!isMountedRef.current)
                return;
            const photoUri = `file://${photo.path}`;
            const capturedAngleIndex = currentAngleIndexRef.current;
            const capturedAngle = captureAngles[capturedAngleIndex];
            if (!(capturedAngle === null || capturedAngle === void 0 ? void 0 : capturedAngle.id))
                return;
            const beforeCount = (_o = (_m = capturedImages[capturedAngle.id]) === null || _m === void 0 ? void 0 : _m.length) !== null && _o !== void 0 ? _o : 0;
            const requiredCount = getRequiredCapturesForAngle(capturedAngle.id);
            let canProceed = true;
            if (mode === 'enrolFace') {
                if (!apiAccessToken) {
                    Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to enroll your face.'));
                    return;
                }
                try {
                    let verified = null;
                    if (useLiveness && livenessChallengeId) {
                        setAngleVerification(prev => (Object.assign(Object.assign({}, prev), { [capturedAngle.id]: { status: 'verifying' } })));
                        verified = yield submitFaceLivenessStep(apiAccessToken, {
                            challenge_id: livenessChallengeId,
                            uri: photoUri,
                        });
                        if (!isMountedRef.current)
                            return;
                        canProceed = !!(verified === null || verified === void 0 ? void 0 : verified.accepted);
                        setAngleVerification(prev => {
                            var _a;
                            return (Object.assign(Object.assign({}, prev), { [capturedAngle.id]: canProceed
                                    ? { status: 'accepted' }
                                    : { status: 'rejected', reason: String((_a = verified === null || verified === void 0 ? void 0 : verified.reason) !== null && _a !== void 0 ? _a : 'angle_mismatch') } }));
                        });
                        if (canProceed) {
                            const nextCount = beforeCount + 1;
                            setCapturedImages(prev => {
                                var _a;
                                const cur = (_a = prev[capturedAngle.id]) !== null && _a !== void 0 ? _a : [];
                                return Object.assign(Object.assign({}, prev), { [capturedAngle.id]: [...cur, photoUri] });
                            });
                            // Mark angle complete only when enough templates are collected.
                            if (nextCount < requiredCount) {
                                setAngleVerification(prev => (Object.assign(Object.assign({}, prev), { [capturedAngle.id]: { status: 'partial' } })));
                            }
                        }
                    }
                    else {
                        if (guidedAutoCapture) {
                            setAngleVerification(prev => (Object.assign(Object.assign({}, prev), { [capturedAngle.id]: { status: 'verifying' } })));
                            const verified = yield verifyFaceAngle(apiAccessToken, {
                                angle: capturedAngle.id,
                                uri: photoUri,
                            });
                            if (!isMountedRef.current)
                                return;
                            canProceed = !!(verified === null || verified === void 0 ? void 0 : verified.accepted);
                            if (canProceed) {
                                const nextCount = beforeCount + 1;
                                setCapturedImages(prev => {
                                    var _a;
                                    const cur = (_a = prev[capturedAngle.id]) !== null && _a !== void 0 ? _a : [];
                                    return Object.assign(Object.assign({}, prev), { [capturedAngle.id]: [...cur, photoUri] });
                                });
                                setAngleVerification(prev => (Object.assign(Object.assign({}, prev), { [capturedAngle.id]: nextCount < requiredCount ? { status: 'partial' } : { status: 'accepted' } })));
                            }
                            else {
                                const reason = String((_p = verified === null || verified === void 0 ? void 0 : verified.reason) !== null && _p !== void 0 ? _p : 'angle_mismatch');
                                setAngleVerification(prev => (Object.assign(Object.assign({}, prev), { [capturedAngle.id]: { status: 'rejected', reason } })));
                                if (reason === 'no_face_detected_or_too_small') {
                                    Alert.alert(t('No face detected'), t('Move closer and hold still. We will try again.'));
                                }
                            }
                        }
                        else {
                            // Manual approval for each photo (non-liveness).
                            setPendingPhotoUri(photoUri);
                            setPendingAngleId(capturedAngle.id);
                            setCountdown(null);
                            countdownActiveRef.current = false;
                            return;
                        }
                    }
                }
                catch (e) {
                    canProceed = false;
                    const msg = e instanceof ApiError ? e.message : String((_q = e === null || e === void 0 ? void 0 : e.message) !== null && _q !== void 0 ? _q : e);
                    setAngleVerification(prev => (Object.assign(Object.assign({}, prev), { [capturedAngle.id]: { status: 'rejected', reason: msg } })));
                    Alert.alert(t('Angle check failed'), msg);
                }
            }
            if (mode !== 'enrolFace') {
                setCapturedImages(prev => (Object.assign(Object.assign({}, prev), { [capturedAngle.id]: [photoUri] })));
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
                    if (!isMountedRef.current)
                        return;
                    setCurrentAngleIndex(capturedAngleIndex + 1);
                    setAngleMatched(false);
                    stableMatchFramesRef.current = 0;
                    setCountdown(null);
                    countdownActiveRef.current = false;
                    setTimeout(() => {
                        if (!isMountedRef.current)
                            return;
                        isTransitioningRef.current = false;
                        setIsTransitioning(false);
                    }, 500);
                }, 1500);
            }
        }
        catch (error) {
            console.log('Capture error:', error);
        }
        finally {
            isCapturingRef.current = false;
            stableMatchFramesRef.current = 0;
            if (isMountedRef.current) {
                setIsCapturing(false);
            }
        }
    }), [apiAccessToken, captureAngles, capturedImages, getRequiredCapturesForAngle, guidedAutoCapture, livenessChallengeId, mode, useLiveness, t]);
    const clearCountdown = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        countdownActiveRef.current = false;
        setCountdown(null);
    }, []);
    const handleRetakeAngle = useCallback((angleId) => {
        var _a, _b;
        const status = mode === 'enrolFace' ? ((_b = (_a = angleVerification[angleId]) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : 'empty') : 'empty';
        if (useLiveness && status === 'accepted') {
            Alert.alert(t('Restart required'), t('For liveness enrollment, retaking an accepted step requires restarting the whole flow. Restart now?'), [
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
                            const init = {};
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
            ]);
            return;
        }
        clearCountdown();
        countdownActiveRef.current = false;
        setAngleMatched(false);
        stableMatchFramesRef.current = 0;
        setCapturedImages(prev => (Object.assign(Object.assign({}, prev), { [angleId]: [] })));
        if (mode === 'enrolFace') {
            setAngleVerification(prev => (Object.assign(Object.assign({}, prev), { [angleId]: { status: 'empty' } })));
        }
    }, [angleVerification, clearCountdown, mode, startLiveness, useLiveness, t]);
    const advanceAngle = useCallback((fromIndex) => {
        if (fromIndex >= captureAngles.length - 1)
            return;
        isTransitioningRef.current = true;
        setIsTransitioning(true);
        setTimeout(() => {
            if (!isMountedRef.current)
                return;
            setCurrentAngleIndex(fromIndex + 1);
            setAngleMatched(false);
            stableMatchFramesRef.current = 0;
            setCountdown(null);
            countdownActiveRef.current = false;
            setTimeout(() => {
                if (!isMountedRef.current)
                    return;
                isTransitioningRef.current = false;
                setIsTransitioning(false);
            }, 500);
        }, 600);
    }, [captureAngles.length]);
    const handleApprovePhoto = useCallback(() => {
        var _a, _b;
        if (!pendingPhotoUri || !pendingAngleId)
            return;
        if (mode === 'enrolFace' && !apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to enroll your face.'));
            return;
        }
        setSubmitError(null);
        const requiredCount = getRequiredCapturesForAngle(pendingAngleId);
        const before = (_b = (_a = capturedImages[pendingAngleId]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
        const nextCount = before + 1;
        const commitApproved = () => {
            setCapturedImages(prev => {
                var _a;
                const cur = (_a = prev[pendingAngleId]) !== null && _a !== void 0 ? _a : [];
                return Object.assign(Object.assign({}, prev), { [pendingAngleId]: [...cur, pendingPhotoUri] });
            });
            if (mode === 'enrolFace') {
                setAngleVerification(prev => (Object.assign(Object.assign({}, prev), { [pendingAngleId]: nextCount < requiredCount ? { status: 'partial' } : { status: 'accepted' } })));
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
        verifyFaceAngle(apiAccessToken, {
            angle: pendingAngleId,
            uri: pendingPhotoUri,
        })
            .then((verified) => {
            var _a, _b, _c;
            if (verified === null || verified === void 0 ? void 0 : verified.accepted) {
                commitApproved();
            }
            else {
                const reason = String((_a = verified === null || verified === void 0 ? void 0 : verified.reason) !== null && _a !== void 0 ? _a : '');
                if (reason === 'no_face_detected_or_too_small') {
                    Alert.alert(t('No face detected'), t('Move closer and retake this photo.'));
                }
                else if (reason === 'angle_mismatch') {
                    const expected = normalizeAngleId(String((_c = (_b = verified === null || verified === void 0 ? void 0 : verified.expected_angle) !== null && _b !== void 0 ? _b : pendingAngleId) !== null && _c !== void 0 ? _c : ''));
                    const detected = normalizeAngleId((verified === null || verified === void 0 ? void 0 : verified.detected_angle) != null ? String(verified.detected_angle) : null);
                    const oppositeProfileMismatch = (expected === 'left_profile' && detected === 'right_profile') ||
                        (expected === 'right_profile' && detected === 'left_profile');
                    if (oppositeProfileMismatch) {
                        Alert.alert(t('Angle check failed'), t('Detected {{detected}} instead of {{expected}}. Front camera can feel mirrored: turn to the opposite side and retake.', {
                            expected: angleLabel(expected),
                            detected: angleLabel(detected),
                        }));
                    }
                    else {
                        Alert.alert(t('Angle check failed'), t('Expected {{expected}}, detected {{detected}}. Please retake this photo.', {
                            expected: angleLabel(expected),
                            detected: angleLabel(detected),
                        }));
                    }
                }
                else {
                    Alert.alert(t('Angle check failed'), t('Please retake this photo.'));
                }
            }
        })
            .catch((e) => {
            var _a;
            const msg = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
            Alert.alert(t('Angle check failed'), msg);
        })
            .finally(() => {
            setIsApproving(false);
        });
    }, [advanceAngle, apiAccessToken, captureAngles, capturedImages, getRequiredCapturesForAngle, mode, pendingAngleId, pendingPhotoUri, t]);
    const handleRejectPhoto = useCallback(() => {
        setPendingPhotoUri(null);
        setPendingAngleId(null);
        setSubmitError(null);
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
            }
            else {
                clearCountdown();
                capturePhoto();
            }
        }, 1000);
    }, [capturePhoto, clearCountdown, mode]);
    const handleFaceDetected = Worklets.createRunOnJS((detected, yaw, pitch, ratio) => {
        if (!isMountedRef.current)
            return;
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
                const requiredStableFrames = mode === 'enrolFace' ? AUTO_CAPTURE_STABLE_FRAMES_ENROLL : AUTO_CAPTURE_STABLE_FRAMES_SAVE;
                if (!countdownActiveRef.current && stableMatchFramesRef.current >= requiredStableFrames) {
                    startCountdown();
                }
            }
            else {
                stableMatchFramesRef.current = 0;
                clearCountdown();
            }
        }
        else {
            setAngleMatched(false);
            setDistanceMatched(false);
            stableMatchFramesRef.current = 0;
            clearCountdown();
        }
    });
    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';
        var _a, _b, _c;
        try {
            const faces = detectFaces(frame);
            if (faces && faces.length > 0) {
                const face = faces[0];
                const yaw = face.yawAngle || 0;
                const pitch = face.pitchAngle || 0;
                const bounds = (_a = face.bounds) !== null && _a !== void 0 ? _a : {};
                const faceWidth = Number((_b = bounds.width) !== null && _b !== void 0 ? _b : 0);
                const frameWidth = Number((_c = frame.width) !== null && _c !== void 0 ? _c : 1);
                const ratio = frameWidth > 0 ? faceWidth / frameWidth : 0;
                handleFaceDetected(true, yaw, pitch, ratio);
            }
            else {
                handleFaceDetected(false, 0, 0, 0);
            }
        }
        catch (e) {
            // Silently handle frame processor errors
        }
    }, [detectFaces, handleFaceDetected]);
    const handleSaveFace = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _r;
        if (mode === 'enrolFace') {
            if (!apiAccessToken) {
                Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to enroll your face.'));
                return;
            }
            const required = ['frontal', 'left_profile', 'right_profile', 'upward', 'downward'];
            const missing = required.filter(k => {
                var _a, _b, _c;
                const requiredCount = getRequiredCapturesForAngle(k);
                return ((_b = (_a = capturedImages[k]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) < requiredCount || ((_c = angleVerification[k]) === null || _c === void 0 ? void 0 : _c.status) !== 'accepted';
            });
            if (missing.length > 0) {
                const msg = `${t('Please capture')}: ${missing.join(', ')}`;
                setSubmitError(msg);
                Alert.alert(t('Missing angles'), `${t('Please capture')}: ${missing.join(', ')}`);
                const firstMissingIndex = captureAngles.findIndex(a => missing.includes(a.id));
                if (firstMissingIndex >= 0) {
                    setCurrentAngleIndex(firstMissingIndex);
                }
                return;
            }
            setSubmitError(null);
            setIsSubmitting(true);
            try {
                const enrolled = yield enrollFace(apiAccessToken, {
                    frontal: capturedImages.frontal,
                    left_profile: capturedImages.left_profile,
                    right_profile: capturedImages.right_profile,
                    upward: capturedImages.upward,
                    downward: capturedImages.downward,
                }, { replace: enrollReplace });
                if (!(enrolled === null || enrolled === void 0 ? void 0 : enrolled.ok)) {
                    throw new Error(t('Face enrollment did not complete. Please try again.'));
                }
                Alert.alert(t('Face enrolled'), t('Your face scan was saved successfully.'), [
                    {
                        text: t('OK'),
                        onPress: () => {
                            var _a, _b;
                            if (afterEnroll === null || afterEnroll === void 0 ? void 0 : afterEnroll.screen) {
                                if (typeof navigation.replace === 'function') {
                                    navigation.replace(afterEnroll.screen, (_a = afterEnroll.params) !== null && _a !== void 0 ? _a : {});
                                }
                                else {
                                    navigation.navigate(afterEnroll.screen, (_b = afterEnroll.params) !== null && _b !== void 0 ? _b : {});
                                }
                                return;
                            }
                            if (typeof navigation.goBack === 'function') {
                                navigation.goBack();
                                return;
                            }
                            if (typeof navigation.replace === 'function') {
                                navigation.replace('AISearchScreen', { autoSearch: true });
                            }
                            else {
                                navigation.navigate('AISearchScreen', { autoSearch: true });
                            }
                        },
                    },
                ]);
            }
            catch (e) {
                if (e instanceof ApiError && e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                    setSubmitError(t('Enable face recognition consent first, then try again.'));
                    Alert.alert(t('Consent required'), t('Enable face recognition consent first, then try again.'));
                    return;
                }
                const msg = e instanceof ApiError ? e.message : String((_r = e === null || e === void 0 ? void 0 : e.message) !== null && _r !== void 0 ? _r : e);
                setSubmitError(msg);
                Alert.alert(t('Enrollment failed'), msg);
            }
            finally {
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
    }), [apiAccessToken, afterEnroll, angleVerification, captureAngles, capturedImages, enrollReplace, getRequiredCapturesForAngle, mode, navigation, t]);
    const handleCancel = useCallback(() => {
        navigation.goBack();
    }, [navigation]);
    const getInstructionText = () => {
        var _a, _b, _c, _d;
        if (mode === 'enrolFace') {
            if (isReviewing) {
                return t('Review this photo. Use it or retake.');
            }
            const verify = angleVerification[currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.id];
            if ((verify === null || verify === void 0 ? void 0 : verify.status) === 'verifying') {
                return t('Checking this angle…');
            }
            if ((verify === null || verify === void 0 ? void 0 : verify.status) === 'partial') {
                const have = (_b = (_a = capturedImages[currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.id]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
                const need = Math.max(0, currentRequiredCount - have);
                if (need <= 0)
                    return t('Great! Moving on…');
                if (distanceStep) {
                    return `${t(distanceStep.instruction)} (${have + 1}/${currentRequiredCount})`;
                }
                return `${t('Nice — take')} ${need} ${t('more photo(s) for this angle.')}`;
            }
            if ((verify === null || verify === void 0 ? void 0 : verify.status) === 'rejected') {
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
                const have = (_d = (_c = capturedImages[currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.id]) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0;
                return `${t(distanceStep.instruction)} (${Math.min(have + 1, currentRequiredCount)}/${currentRequiredCount})`;
            }
            return t(currentAngle.instruction);
        }
        return t('Position your face within the frame');
    };
    // Permission screen
    if (mode === 'enrolFace' && !consentGateSatisfied) {
        return (_jsxs(View, Object.assign({ style: [styles.mainContainer, { backgroundColor: colors.backgroundColor, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }] }, { children: [_jsx(Text, Object.assign({ style: [styles.titleText, { color: colors.mainTextColor }] }, { children: t('Face recognition consent') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: [styles.descriptionText, { color: colors.grayColor, textAlign: 'center' }] }, { children: t('Before starting face setup, please confirm consent for face recognition.') })), _jsx(SizeBox, { height: 6 }), _jsx(Text, Object.assign({ style: [styles.descriptionText, { color: colors.grayColor, textAlign: 'center' }] }, { children: t('This avoids collecting photos first and only asking consent at the end.') })), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: { width: '100%', gap: 12 } }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [styles.primaryButton, { backgroundColor: colors.primaryColor }, isGrantingConsent && styles.primaryButtonDisabled], onPress: handleGrantConsentBeforeEnroll, disabled: isGrantingConsent }, { children: isGrantingConsent ? (_jsx(ActivityIndicator, { color: colors.pureWhite })) : (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: [styles.primaryButtonText, { color: colors.pureWhite }] }, { children: t('Agree and continue') })), _jsx(ArrowRight, { size: 24, color: colors.pureWhite })] })) })), _jsx(TouchableOpacity, Object.assign({ style: [styles.secondaryButton, { backgroundColor: colors.backgroundColor, borderColor: colors.lightGrayColor }], onPress: handleCancel, disabled: isGrantingConsent }, { children: _jsx(Text, Object.assign({ style: [styles.secondaryButtonText, { color: colors.grayColor }] }, { children: t('Not now') })) }))] }))] })));
    }
    if (!hasPermission) {
        return (_jsxs(View, Object.assign({ style: [styles.mainContainer, { backgroundColor: colors.backgroundColor, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }] }, { children: [_jsx(Text, Object.assign({ style: [styles.titleText, { color: colors.mainTextColor }] }, { children: t('Camera permission required') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: [styles.descriptionText, { color: colors.grayColor, textAlign: 'center' }] }, { children: t('Please grant camera access to capture your face.') })), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: { width: '100%', gap: 12 } }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [styles.primaryButton, { backgroundColor: colors.primaryColor }], onPress: handleRequestPermission }, { children: _jsx(Text, Object.assign({ style: [styles.primaryButtonText, { color: colors.pureWhite }] }, { children: t('Grant Permission') })) })), _jsx(TouchableOpacity, Object.assign({ style: [styles.secondaryButton, { backgroundColor: colors.backgroundColor, borderColor: colors.lightGrayColor }], onPress: () => Linking.openSettings() }, { children: _jsx(Text, Object.assign({ style: [styles.secondaryButtonText, { color: colors.grayColor }] }, { children: t('Open Settings') })) }))] })), _jsx(SizeBox, { height: 16 }), _jsx(TouchableOpacity, Object.assign({ onPress: () => navigation.goBack() }, { children: _jsx(Text, Object.assign({ style: [styles.secondaryButtonText, { color: colors.grayColor, textDecorationLine: 'underline' }] }, { children: t('Go Back') })) }))] })));
    }
    if (!device) {
        return (_jsx(View, Object.assign({ style: [styles.mainContainer, { backgroundColor: colors.backgroundColor, justifyContent: 'center', alignItems: 'center' }] }, { children: _jsx(Text, Object.assign({ style: [styles.titleText, { color: colors.mainTextColor }] }, { children: t('No front camera found') })) })));
    }
    const requiredForAngle = currentRequiredCount;
    const hasEnoughForAngle = currentImages.length >= requiredForAngle;
    const showCameraPreview = consentGateSatisfied && !hasEnoughForAngle && !isReviewing;
    const showCapturedPreview = (isReviewing && !!pendingPhotoUri) || (hasEnoughForAngle && !!currentImage);
    const currentVerify = mode === 'enrolFace' ? angleVerification[currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.id] : null;
    const canCaptureNow = !isReviewing &&
        !isSubmitting &&
        !isApproving &&
        !isCapturing &&
        countdown === null &&
        !isTransitioning &&
        faceDetected &&
        angleMatched &&
        (mode !== 'enrolFace' || distanceMatched);
    return (_jsxs(View, Object.assign({ style: [styles.mainContainer, { backgroundColor: colors.backgroundColor }] }, { children: [_jsx(SizeBox, { height: insets.top + 10 }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ onPress: handleCancel, style: [styles.backButton, { backgroundColor: colors.cardBackground }] }, { children: _jsx(ArrowLeft, { size: 24, color: colors.mainTextColor }) })), _jsx(Text, Object.assign({ style: [styles.headerTitle, { color: colors.mainTextColor }] }, { children: mode === 'enrolFace' ? t('Enroll Face') : t('Add Face') })), _jsx(View, { style: { width: 40 } })] })), _jsxs(View, Object.assign({ style: styles.contentContainer }, { children: [mode === 'enrolFace' && (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: styles.angleSelectorRow }, { children: captureAngles.map((a, idx) => {
                                    var _a, _b;
                                    const status = (_b = (_a = angleVerification[a.id]) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : 'empty';
                                    const isSelected = idx === currentAngleIndex;
                                    const dotColor = status === 'accepted'
                                        ? '#22C55E'
                                        : status === 'rejected'
                                            ? '#EF4444'
                                            : (status === 'verifying' || status === 'partial')
                                                ? colors.primaryColor
                                                : colors.lightGrayColor;
                                    const disabled = isSubmitting || status === 'verifying';
                                    return (_jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.8, disabled: disabled, onPress: () => {
                                            clearCountdown();
                                            setAngleMatched(false);
                                            setCurrentAngleIndex(idx);
                                        }, style: [
                                            styles.angleChip,
                                            {
                                                backgroundColor: colors.cardBackground,
                                                borderColor: isSelected ? colors.primaryColor : colors.lightGrayColor,
                                            },
                                        ] }, { children: [_jsx(View, { style: [styles.angleStatusDot, { backgroundColor: dotColor }] }), _jsx(Text, Object.assign({ style: [styles.angleChipText, { color: colors.mainTextColor }] }, { children: t(a.title) }))] }), a.id));
                                }) })), _jsx(SizeBox, { height: 14 })] })), _jsxs(View, Object.assign({ style: [styles.cameraOuterContainer, { width: CAMERA_WIDTH, height: CAMERA_HEIGHT }] }, { children: [_jsx(View, { style: [styles.borderCorner, styles.borderCornerTopLeft, { borderColor: colors.primaryColor }] }), _jsx(View, { style: [styles.borderCorner, styles.borderCornerTopRight, { borderColor: colors.primaryColor }] }), _jsx(View, { style: [styles.borderCorner, styles.borderCornerBottomLeft, { borderColor: colors.primaryColor }] }), _jsx(View, { style: [styles.borderCorner, styles.borderCornerBottomRight, { borderColor: colors.primaryColor }] }), _jsx(View, { style: [styles.borderDash, styles.borderDashHorizontal, { backgroundColor: colors.primaryColor, top: 0, left: '30%' }] }), _jsx(View, { style: [styles.borderDash, styles.borderDashHorizontal, { backgroundColor: colors.primaryColor, top: 0, right: '30%' }] }), _jsx(View, { style: [styles.borderDash, styles.borderDashHorizontal, { backgroundColor: colors.primaryColor, bottom: 0, left: '30%' }] }), _jsx(View, { style: [styles.borderDash, styles.borderDashHorizontal, { backgroundColor: colors.primaryColor, bottom: 0, right: '30%' }] }), _jsx(View, { style: [styles.borderDash, styles.borderDashVertical, { backgroundColor: colors.primaryColor, left: 0, top: '30%' }] }), _jsx(View, { style: [styles.borderDash, styles.borderDashVertical, { backgroundColor: colors.primaryColor, left: 0, bottom: '30%' }] }), _jsx(View, { style: [styles.borderDash, styles.borderDashVertical, { backgroundColor: colors.primaryColor, right: 0, top: '30%' }] }), _jsx(View, { style: [styles.borderDash, styles.borderDashVertical, { backgroundColor: colors.primaryColor, right: 0, bottom: '30%' }] }), _jsxs(View, Object.assign({ style: [styles.cameraContainer, { backgroundColor: colors.secondaryColor }] }, { children: [_jsxs(View, Object.assign({ style: [styles.cameraWrapper, !showCameraPreview && { opacity: 0, position: 'absolute' }] }, { children: [_jsx(Camera, { ref: cameraRef, style: StyleSheet.absoluteFill, device: device, isActive: consentGateSatisfied, photo: true, frameProcessor: showCameraPreview ? frameProcessor : undefined }), showCameraPreview && (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: styles.faceGuideOverlay }, { children: _jsx(View, { style: [
                                                                styles.faceGuide,
                                                                { width: CAMERA_WIDTH * 0.55, height: CAMERA_HEIGHT * 0.65, borderRadius: CAMERA_WIDTH * 0.275 },
                                                                angleMatched && { borderColor: '#22C55E' },
                                                                faceDetected && !angleMatched && { borderColor: '#F59E0B' },
                                                                !faceDetected && { borderColor: colors.primaryColor }
                                                            ] }) })), countdown !== null && (_jsx(View, Object.assign({ style: styles.countdownOverlay }, { children: _jsx(Text, Object.assign({ style: styles.countdownText }, { children: countdown })) })))] }))] })), showCapturedPreview && (pendingPhotoUri || currentImage) && (_jsx(FastImage, { source: { uri: String(pendingPhotoUri || currentImage) }, style: styles.capturedImage, resizeMode: "cover" }))] }))] })), _jsx(SizeBox, { height: 30 }), _jsxs(View, Object.assign({ style: styles.progressBarContainer }, { children: [_jsx(View, Object.assign({ style: [styles.progressBarTrack, { backgroundColor: colors.lightGrayColor }] }, { children: _jsx(View, { style: [styles.progressBarFill, { backgroundColor: colors.primaryColor, width: `${progress * 100}%` }] }) })), _jsx(View, { style: [styles.progressIndicator, { backgroundColor: colors.primaryColor, left: `${progress * 100}%` }] })] })), _jsx(SizeBox, { height: 20 }), _jsxs(View, Object.assign({ style: styles.textSection }, { children: [_jsx(Text, Object.assign({ style: [styles.titleText, { color: colors.mainTextColor }] }, { children: (currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.title)
                                    ? `${t(currentAngle.title)}${distanceStep ? ` · ${t(distanceStep.label)}` : ''}`
                                    : t('Capture Complete') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: [styles.descriptionText, { color: colors.grayColor }] }, { children: getInstructionText() }))] })), _jsx(View, { style: { flex: 1 } }), _jsxs(View, Object.assign({ style: styles.buttonContainer }, { children: [submitError ? (_jsx(Text, Object.assign({ style: [styles.submitErrorText, { color: colors.errorColor || '#D14343' }] }, { children: submitError }))) : null, isReviewing ? (_jsxs(View, Object.assign({ style: styles.reviewRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [styles.secondaryButton, styles.reviewButton, { backgroundColor: colors.backgroundColor, borderColor: colors.lightGrayColor }], activeOpacity: 0.7, onPress: handleRejectPhoto, disabled: isSubmitting || isApproving }, { children: _jsx(Text, Object.assign({ style: [styles.secondaryButtonText, { color: colors.grayColor }] }, { children: t('Retake') })) })), _jsxs(TouchableOpacity, Object.assign({ style: [
                                            styles.primaryButton,
                                            styles.reviewButton,
                                            { backgroundColor: colors.primaryColor },
                                            (isSubmitting || isApproving) && styles.primaryButtonDisabled,
                                        ], activeOpacity: 0.7, onPress: handleApprovePhoto, disabled: isSubmitting || isApproving }, { children: [_jsx(Text, Object.assign({ style: [styles.primaryButtonText, { color: colors.pureWhite }] }, { children: isApproving ? t('Checking…') : t('Use photo') })), _jsx(ArrowRight, { size: 24, color: colors.pureWhite })] }))] }))) : (_jsxs(_Fragment, { children: [_jsxs(TouchableOpacity, Object.assign({ style: [
                                            styles.primaryButton,
                                            { backgroundColor: colors.primaryColor },
                                            ((allCaptured ? false : !canCaptureNow) || isSubmitting || isApproving) && styles.primaryButtonDisabled
                                        ], activeOpacity: 0.7, onPress: () => {
                                            if (allCaptured) {
                                                handleSaveFace();
                                                return;
                                            }
                                            if (canCaptureNow) {
                                                capturePhoto();
                                            }
                                        }, disabled: (allCaptured ? false : !canCaptureNow) || isSubmitting || isApproving }, { children: [_jsx(Text, Object.assign({ style: [styles.primaryButtonText, { color: colors.pureWhite }] }, { children: isSubmitting
                                                    ? t('Saving…')
                                                    : allCaptured
                                                        ? t('Continue')
                                                        : t('Capture') })), _jsx(ArrowRight, { size: 24, color: colors.pureWhite })] })), _jsx(TouchableOpacity, Object.assign({ style: [styles.secondaryButton, { backgroundColor: colors.backgroundColor, borderColor: colors.lightGrayColor }], activeOpacity: 0.7, onPress: () => {
                                            if ((currentAngle === null || currentAngle === void 0 ? void 0 : currentAngle.id) && currentImages.length > 0) {
                                                handleRetakeAngle(currentAngle.id);
                                                return;
                                            }
                                            handleCancel();
                                        }, disabled: isSubmitting || isApproving || isCapturing || ((currentVerify === null || currentVerify === void 0 ? void 0 : currentVerify.status) === 'verifying') }, { children: _jsx(Text, Object.assign({ style: [styles.secondaryButtonText, { color: colors.grayColor }] }, { children: currentImages.length > 0 ? t('Reset angle') : t('Cancel') })) }))] }))] })), _jsx(SizeBox, { height: insets.bottom + 20 })] }))] })));
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
    headerTitle: Object.assign({}, Fonts.semibold18),
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
    angleChipText: Object.assign(Object.assign({}, Fonts.medium12), { lineHeight: 16 }),
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
    faceGuideOverlay: Object.assign(Object.assign({}, StyleSheet.absoluteFillObject), { justifyContent: 'center', alignItems: 'center' }),
    faceGuide: {
        borderWidth: 3,
        borderStyle: 'dashed',
    },
    countdownOverlay: Object.assign(Object.assign({}, StyleSheet.absoluteFillObject), { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)' }),
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
    titleText: Object.assign(Object.assign({}, Fonts.medium16), { fontSize: 18, lineHeight: 26, textAlign: 'center' }),
    descriptionText: Object.assign(Object.assign({}, Fonts.regular14), { lineHeight: 22, textAlign: 'center' }),
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    submitErrorText: Object.assign(Object.assign({}, Fonts.regular13), { lineHeight: 20, textAlign: 'center' }),
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
    primaryButtonText: Object.assign(Object.assign({}, Fonts.medium16), { lineHeight: 24 }),
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
    secondaryButtonText: Object.assign(Object.assign({}, Fonts.medium16), { lineHeight: 24 }),
});
export default SearchFaceCaptureScreen;
