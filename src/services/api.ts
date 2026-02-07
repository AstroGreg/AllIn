const API_BASE_URL = 'https://myjourney.coffee/api/v1';

interface FaceVerifyResponse {
    ok: boolean;
    accepted: boolean;
    expected_angle: string;
    detected_angle: string;
    reason: string;
}

interface FaceEnrolResponse {
    ok: boolean;
    [key: string]: any;
}

/**
 * Verify a face capture matches the expected angle.
 * POST /ai/face/verify
 */
export const verifyFaceAngle = async (
    accessToken: string,
    angle: 'frontal' | 'left_profile' | 'right_profile' | 'upward' | 'downward',
    fileUri: string,
): Promise<FaceVerifyResponse> => {
    const formData = new FormData();
    formData.append('angle', angle);
    formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: `${angle}.jpg`,
    } as any);

    const response = await fetch(`${API_BASE_URL}/ai/face/verify`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Face verification failed (${response.status})`);
    }

    return response.json();
};

/**
 * Grant GDPR consent for face recognition.
 * POST /consents/face_recognition/grant
 */
export const grantFaceRecognitionConsent = async (accessToken: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/consents/face_recognition/grant`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Consent grant failed (${response.status})`);
    }
};

/**
 * Enroll 5 face angles for face recognition.
 * POST /ai/enrol/face
 */
export const enrollFace = async (
    accessToken: string,
    images: {
        frontal: string;
        left_profile: string;
        right_profile: string;
        upward: string;
        downward: string;
    },
): Promise<FaceEnrolResponse> => {
    const formData = new FormData();
    formData.append('label', 'default');
    formData.append('replace', 'true');

    const angles = ['frontal', 'left_profile', 'right_profile', 'upward', 'downward'] as const;
    for (const angle of angles) {
        formData.append(angle, {
            uri: images[angle],
            type: 'image/jpeg',
            name: `${angle}.jpg`,
        } as any);
    }

    const response = await fetch(`${API_BASE_URL}/ai/enrol/face`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Face enrollment failed (${response.status})`);
    }

    return response.json();
};
