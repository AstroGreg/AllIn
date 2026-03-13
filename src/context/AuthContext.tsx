import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AppConfig } from '../constants/AppConfig';
import {
    getAuthBootstrap,
    getProfileSummary,
    updateProfileSummary,
    updateUserMe,
    type AuthBootstrapResponse,
    type ClubSummary,
    type ProfileGroupMembership,
    type ProfileSummaryResponse,
    type UpdateUserMeInput,
} from '../services/apiGateway';

// Auth0 credentials
const requireConfig = (key: string, value: any) => {
    const out = String(value ?? '').trim();
    if (!out) {
        throw new Error(`[Config] Missing required env var: ${key}. Check react-native-config/.env loading.`);
    }
    return out;
};

const AUTH0_DOMAIN = requireConfig('AUTH0_DOMAIN', AppConfig.AUTH0_DOMAIN);
const AUTH0_CLIENT_ID = requireConfig('AUTH0_CLIENT_ID', AppConfig.AUTH0_CLIENT_ID);
const AUTH0_AUDIENCE = requireConfig('AUTH0_AUDIENCE', AppConfig.AUTH0_AUDIENCE);
const AUTH0_REDIRECT_URI_RAW = requireConfig('AUTH0_REDIRECT_URI', AppConfig.AUTH0_REDIRECT_URI);
const AUTH0_REDIRECT_URI = (() => {
    const raw = String(AUTH0_REDIRECT_URI_RAW).trim();
    const match = raw.match(/^([a-z][a-z0-9+.-]*):\/\/([^/]+)(?:\/.*)?$/i);
    if (!match) return raw;

    const scheme = match[1];
    const host = match[2];
    if (!scheme.toLowerCase().endsWith('.auth0')) {
        return raw;
    }

    const nativeAppId = scheme.replace(/\.auth0$/i, '');
    const platformPath = Platform.OS === 'android' ? 'android' : 'ios';
    return `${scheme}://${host}/${platformPath}/${nativeAppId}/callback`;
})();
const AUTH0_CUSTOM_SCHEME = (() => {
    const match = AUTH0_REDIRECT_URI.match(/^([a-z][a-z0-9+.-]*):\/\//i);
    return match?.[1] ?? null;
})();

type AuthFlowMode = 'login' | 'signup';

const buildAuthorizeRequest = (mode: AuthFlowMode, connection?: string) => {
    const additionalParameters: Record<string, string> = {};

    if (!connection) {
        additionalParameters.prompt = 'login';
    }
    if (mode === 'signup') {
        additionalParameters.screen_hint = 'signup';
    }
    if (connection === 'google-oauth2') {
        additionalParameters.prompt = 'select_account';
    }

    const authorizeParams: Record<string, any> = {
        scope: 'openid profile email read:users write:media access:ai search:media list:media read:media',
        audience: AUTH0_AUDIENCE,
        redirectUrl: AUTH0_REDIRECT_URI,
        ...(connection ? { connection } : {}),
        additionalParameters,
    };

    const authorizeOptions: Record<string, any> = {
        ...(AUTH0_CUSTOM_SCHEME ? { customScheme: AUTH0_CUSTOM_SCHEME } : {}),
        ...(!connection ? { ephemeralSession: true } : {}),
    };

    return {
        authorizeParams,
        authorizeOptions,
    };
};

const buildClearSessionRequest = () => ({
    clearSessionParams: {
        federated: false,
        returnToUrl: AUTH0_REDIRECT_URI,
    },
    clearSessionOptions: AUTH0_CUSTOM_SCHEME ? { customScheme: AUTH0_CUSTOM_SCHEME } : undefined,
});



type User = {
    sub?: string;
    name?: string;
    givenName?: string;
    familyName?: string;
    nickname?: string;
    email?: string;
    emailVerified?: boolean;
    picture?: string;
    [key: string]: any;
};

type Credentials = {
    accessToken?: string;
    idToken?: string;
    user?: any;
    [key: string]: any;
};

const getAuth0 = (() => {
    let cached: any | null | undefined = undefined;
    return () => {
        if (cached !== undefined) return cached;
        try {
            const mod = require('react-native-auth0');
            const Auth0Module = mod?.default ?? mod;
            cached = new Auth0Module({
                domain: AUTH0_DOMAIN,
                clientId: AUTH0_CLIENT_ID,
            });
            return cached;
        } catch (err: any) {
            console.log('[Auth] Auth0 native module unavailable:', err?.message ?? err);
            cached = null;
            return null;
        }
    };
})();

// User profile data structure
export interface UserProfile {
    // Basic info from CreateProfileScreen
    username?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    birthDate?: string;
    location?: string;
    nationality?: string;

    // Category selection
    category?: 'find' | 'sell' | 'manage' | 'support';

    // Events selection
    selectedEvents?: string[];

    // Athlete details
    chestNumbersByYear?: Record<string, string>;
    trackFieldClub?: string;
    trackFieldMainEvent?: string;
    roadTrailMainEvent?: string;
    mainDisciplines?: Record<string, string>;
    website?: string;
    runningClub?: string;
    runningClubGroupId?: string;

    // Group profile
    groupName?: string;
    coachName?: string;
    coachEmail?: string;
    athletes?: string[];

    // Photographer profile
    photographerName?: string;
    photographerWebsite?: string;

    // Support profile
    supportRole?: 'Coach' | 'Parent' | 'Fysiotherapist' | 'Fan' | string;
    supportOrganization?: string;
    supportBaseLocation?: string;
    supportAthletes?: string[];
    supportAthleteProfileIds?: string[];
    supportClubCodes?: string[];
    supportGroupIds?: string[];
    supportFocuses?: string[];
    supportClubs?: ClubSummary[];
    supportGroups?: ProfileGroupMembership[];
    trackFieldClubDetail?: ClubSummary | null;
    runningClubGroup?: ProfileGroupMembership | null;

    // Verification
    documentUploaded?: boolean;
    faceVerified?: boolean;
    faceConsentGranted?: boolean;

    // Timestamps
    createdAt?: string;
    updatedAt?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    userProfile: UserProfile | null;
    authBootstrap: AuthBootstrapResponse | null;
    accessToken: string | null;
    apiAccessToken: string | null;
    login: (connection?: string) => Promise<void>;
    signup: (connection?: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (profileData: Partial<UserProfile>, options?: { persistLocally?: boolean }) => Promise<void>;
    updateUserAccount: (input: UpdateUserMeInput) => Promise<AuthBootstrapResponse | null>;
    refreshAuthBootstrap: () => Promise<AuthBootstrapResponse | null>;
    getUserProfile: () => Promise<UserProfile | null>;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@auth_credentials';

type E2EAuthState = {
    enabled?: boolean;
    authenticated?: boolean;
    user?: User | null;
    userProfile?: UserProfile | null;
    authBootstrap?: AuthBootstrapResponse | null;
    accessToken?: string | null;
};

const decodeJwtPayload = (token?: string | null): any | null => {
    try {
        const raw = String(token || '').trim();
        if (!raw) return null;
        const parts = raw.split('.');
        if (parts.length !== 3) return null;
        return JSON.parse(atob(parts[1]));
    } catch {
        return null;
    }
};

const logApiTokenDebug = (label: string, token?: string | null) => {
    const payload = decodeJwtPayload(token);
    if (!payload) {
        console.log(`[Auth] ${label} access token payload: <unreadable>`);
        return;
    }
    console.log(`[Auth] ${label} access token claims`, {
        iss: payload.iss ?? null,
        aud: payload.aud ?? null,
        azp: payload.azp ?? null,
        scope: payload.scope ?? null,
        permissions: payload.permissions ?? null,
        sub: payload.sub ?? null,
    });
};

const asNonEmptyText = (value: any): string | null => {
    const normalized = String(value ?? '').trim();
    return normalized.length > 0 ? normalized : null;
};

const normalizeNullableText = (value: any): string | null => {
    if (value == null) return null;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : null;
};

const normalizeStringArrayForProfile = (raw: any): string[] => {
    if (!Array.isArray(raw)) return [];
    return Array.from(new Set(raw.map((entry) => String(entry ?? '').trim()).filter(Boolean)));
};

const normalizeClubCodesForProfile = (raw: any): string[] => {
    return normalizeStringArrayForProfile(raw).map((entry) => entry.toUpperCase());
};

const normalizeGroupMembershipForProfile = (raw: any): ProfileGroupMembership[] => {
    if (!Array.isArray(raw)) return [];
    return raw.reduce<ProfileGroupMembership[]>((acc, entry) => {
        if (!entry || typeof entry !== 'object') return acc;
        const groupId = String((entry as any).group_id ?? '').trim();
        const name = String((entry as any).name ?? '').trim();
        if (!groupId || !name) return acc;
        acc.push({
            group_id: groupId,
            name,
            bio: normalizeNullableText((entry as any).bio),
            location: normalizeNullableText((entry as any).location),
            role: normalizeNullableText((entry as any).role),
            avatar_media_id: normalizeNullableText((entry as any).avatar_media_id),
            is_official_club: Boolean((entry as any).is_official_club),
            official_club_code: normalizeNullableText((entry as any).official_club_code),
        });
        return acc;
    }, []);
};

const normalizeClubSummaryForProfile = (raw: any): ClubSummary[] => {
    if (!Array.isArray(raw)) return [];
    return raw.reduce<ClubSummary[]>((acc, entry) => {
        if (!entry || typeof entry !== 'object') return acc;
        const clubId = String((entry as any).club_id ?? '').trim();
        const code = String((entry as any).code ?? '').trim();
        const name = String((entry as any).name ?? '').trim();
        if (!clubId || !code || !name) return acc;
        acc.push({
            club_id: clubId,
            code,
            name,
            city: normalizeNullableText((entry as any).city),
            website: normalizeNullableText((entry as any).website),
            federation: normalizeNullableText((entry as any).federation),
            source_url: normalizeNullableText((entry as any).source_url),
            source_ref: normalizeNullableText((entry as any).source_ref),
            focuses: normalizeStringArrayForProfile((entry as any).focuses),
            is_official: Boolean((entry as any).is_official),
            is_system: Boolean((entry as any).is_system),
        });
        return acc;
    }, []);
};

const normalizeSingleClubSummaryForProfile = (raw: any): ClubSummary | null => {
    return normalizeClubSummaryForProfile(raw ? [raw] : [])[0] ?? null;
};

const normalizeSingleGroupMembershipForProfile = (raw: any): ProfileGroupMembership | null => {
    return normalizeGroupMembershipForProfile(raw ? [raw] : [])[0] ?? null;
};

const hasSupportProfilePayload = (profile: any): boolean => {
    return (
        String(profile?.support_role ?? '').trim().length > 0 ||
        String(profile?.support_organization ?? '').trim().length > 0 ||
        String(profile?.support_base_location ?? '').trim().length > 0 ||
        normalizeStringArrayForProfile(profile?.support_athletes).length > 0 ||
        normalizeStringArrayForProfile(profile?.support_athlete_profile_ids).length > 0 ||
        normalizeClubCodesForProfile(profile?.support_club_codes).length > 0 ||
        normalizeStringArrayForProfile(profile?.support_group_ids).length > 0 ||
        normalizeStringArrayForProfile(profile?.support_focuses).length > 0
    );
};

const deriveFrontendProfileCategory = (profile: any): UserProfile['category'] => {
    const backendCategory = String(profile?.category ?? '').trim().toLowerCase();
    const hasSupportPayload = hasSupportProfilePayload(profile);
    if (backendCategory === 'club') return 'manage';
    if (backendCategory === 'photographer') return hasSupportPayload ? 'support' : 'sell';
    return 'find';
};

const mapOnboardingCategoryToBackend = (value: any): string | null => {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (!normalized) return null;
    if (normalized === 'find') return 'Athlete';
    if (normalized === 'manage') return 'club';
    if (normalized === 'support') return 'photographer';
    if (normalized === 'sell') return 'photographer';
    if (normalized === 'athlete') return 'Athlete';
    if (normalized === 'club') return 'club';
    if (normalized === 'photographer') return 'photographer';
    return null;
};

const looksLikeSystemIdentity = (value: any): boolean => {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (!normalized) return false;
    if (normalized.includes('|')) return true;
    return /^(google-oauth2|auth0|apple)[._:-]/.test(normalized);
};

const profilePatchFromBootstrap = (bootstrap: AuthBootstrapResponse | null): Partial<UserProfile> | null => {
    const account = bootstrap?.user;
    if (!account) return null;

    const patch: Partial<UserProfile> = {};
    const usernameRaw = asNonEmptyText((account as any).username);
    const username = usernameRaw && !looksLikeSystemIdentity(usernameRaw) ? usernameRaw : null;
    const firstName = asNonEmptyText((account as any).first_name);
    const lastName = asNonEmptyText((account as any).last_name);
    const nationality = asNonEmptyText((account as any).nationality);
    const birthdate = asNonEmptyText((account as any).birthdate);

    if (username) patch.username = username;
    if (firstName) patch.firstName = firstName;
    if (lastName) patch.lastName = lastName;
    if (nationality) patch.nationality = nationality;
    if (birthdate) patch.birthDate = birthdate.slice(0, 10);

    return Object.keys(patch).length > 0 ? patch : null;
};

const normalizeChestNumbersForProfile = (raw: any): Record<string, string> => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const out: Record<string, string> = {};
    Object.entries(raw).forEach(([year, chest]) => {
        const safeYear = String(year ?? '').trim();
        if (!/^\d{4}$/.test(safeYear)) return;
        const parsed = Number(chest);
        if (!Number.isInteger(parsed) || parsed < 0) return;
        out[safeYear] = String(parsed);
    });
    return out;
};

const normalizeMainDisciplinesForProfile = (
    raw: any,
    fallback?: {trackFieldMainEvent?: string | null; roadTrailMainEvent?: string | null},
): Record<string, string> => {
    const source = typeof raw === 'string'
        ? (() => {
            try {
                return JSON.parse(raw);
            } catch {
                return {};
            }
        })()
        : raw;
    const out: Record<string, string> = {};
    if (source && typeof source === 'object' && !Array.isArray(source)) {
        Object.entries(source as Record<string, unknown>).forEach(([key, value]) => {
            const safeKey = String(key ?? '').trim();
            const safeValue = String(value ?? '').trim();
            if (!safeKey || !safeValue) return;
            out[safeKey] = safeValue;
        });
    }
    const track = String(fallback?.trackFieldMainEvent ?? '').trim();
    const road = String(fallback?.roadTrailMainEvent ?? '').trim();
    if (track && !out['track-field']) out['track-field'] = track;
    if (road && !out['road-events']) out['road-events'] = road;
    return out;
};

const buildUserProfileFromSummary = (
    summary: ProfileSummaryResponse | null,
    bootstrap: AuthBootstrapResponse | null,
    fallback?: Partial<UserProfile> | null,
): UserProfile | null => {
    const bootstrapPatch = profilePatchFromBootstrap(bootstrap) ?? {};
    const profile = summary?.profile ?? null;
    if (!profile && Object.keys(bootstrapPatch).length === 0 && !fallback) return null;

    const legacyAthleteSignals =
        String(profile?.track_field_main_event ?? '').trim().length > 0 ||
        String(profile?.road_trail_main_event ?? '').trim().length > 0 ||
        String(profile?.track_field_club ?? '').trim().length > 0 ||
        Object.keys(normalizeChestNumbersForProfile(profile?.chest_numbers_by_year ?? {})).length > 0 ||
        Object.keys(normalizeMainDisciplinesForProfile(profile?.main_disciplines, {
            trackFieldMainEvent: profile?.track_field_main_event ?? null,
            roadTrailMainEvent: profile?.road_trail_main_event ?? null,
        })).length > 0;
    const selectedEvents = normalizeStringArrayForProfile(profile?.selected_events);
    const supportFocuses = (() => {
        const explicit = normalizeStringArrayForProfile((profile as any)?.support_focuses);
        if (explicit.length > 0) return explicit;
        if (String(profile?.category ?? '').trim().toLowerCase() === 'photographer' && !legacyAthleteSignals) {
            return selectedEvents;
        }
        return [];
    })();

    const next: UserProfile = {
        ...(fallback ?? {}),
        ...bootstrapPatch,
        ...(profile?.username ? { username: String(profile.username).trim() } : {}),
        ...(profile?.category ? { category: deriveFrontendProfileCategory(profile) } : {}),
        selectedEvents,
        chestNumbersByYear: normalizeChestNumbersForProfile(profile?.chest_numbers_by_year ?? {}),
        trackFieldClub: String(profile?.track_field_club ?? '').trim(),
        runningClub: String(profile?.track_field_club ?? '').trim(),
        runningClubGroupId: String(profile?.running_club_group_id ?? '').trim(),
        trackFieldClubDetail: normalizeSingleClubSummaryForProfile((profile as any)?.track_field_club_detail),
        runningClubGroup: normalizeSingleGroupMembershipForProfile((profile as any)?.running_club_group),
        trackFieldMainEvent: String(profile?.track_field_main_event ?? '').trim(),
        roadTrailMainEvent: String(profile?.road_trail_main_event ?? '').trim(),
        mainDisciplines: normalizeMainDisciplinesForProfile(profile?.main_disciplines, {
            trackFieldMainEvent: profile?.track_field_main_event ?? null,
            roadTrailMainEvent: profile?.road_trail_main_event ?? null,
        }),
        website: String(profile?.website ?? '').trim(),
        supportRole: String(profile?.support_role ?? '').trim(),
        supportOrganization: String(profile?.support_organization ?? '').trim(),
        supportBaseLocation: String(profile?.support_base_location ?? '').trim(),
        supportAthletes: normalizeStringArrayForProfile(profile?.support_athletes),
        supportAthleteProfileIds: normalizeStringArrayForProfile(profile?.support_athlete_profile_ids),
        supportClubCodes: normalizeClubCodesForProfile((profile as any)?.support_club_codes),
        supportGroupIds: normalizeStringArrayForProfile((profile as any)?.support_group_ids),
        supportFocuses,
        supportClubs: normalizeClubSummaryForProfile((profile as any)?.support_clubs),
        supportGroups: normalizeGroupMembershipForProfile((profile as any)?.support_groups),
        documentUploaded: Boolean(profile?.document_uploaded),
        faceVerified: Boolean(profile?.face_verified),
        faceConsentGranted: Boolean((profile as any)?.face_consent_granted),
        updatedAt: new Date().toISOString(),
    };

    if (!next.createdAt) {
        next.createdAt = new Date().toISOString();
    }
    if (looksLikeSystemIdentity(next.username)) {
        delete next.username;
    }
    return next;
};

const triggerAuthBootstrap = async (
    accessToken: string,
    options?: { throwOnFailure?: boolean; context?: string },
): Promise<AuthBootstrapResponse | null> => {
    try {
        const payload = await getAuthBootstrap(accessToken);
        console.log('[Auth] Bootstrap succeeded:', payload?.needs_user_onboarding ? 'needs_onboarding' : 'ready');
        return payload;
    } catch (err: any) {
        console.log(
            `[Auth] Bootstrap failed${options?.context ? ` (${options.context})` : ''}:`,
            err?.message ?? err,
        );
        if (options?.throwOnFailure) {
            throw err;
        }
        return null;
    }
};

export const AuthProvider = ({
    children,
    initialE2EAuth,
}: {
    children: ReactNode;
    initialE2EAuth?: E2EAuthState | null;
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [authBootstrap, setAuthBootstrap] = useState<AuthBootstrapResponse | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const isE2EAuthBootstrapEnabled = Boolean(initialE2EAuth && (initialE2EAuth.enabled ?? true));

    const clearAuthSessionState = useCallback(async (clearStoredCredentials: boolean) => {
        if (clearStoredCredentials) {
            try {
                await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            } catch (err: any) {
                console.log('[Auth] Could not clear stored credentials:', err?.message ?? err);
            }
        }
        setUser(null);
        setUserProfile(null);
        setAuthBootstrap(null);
        setAccessToken(null);
        setIsAuthenticated(false);
    }, []);

    const syncProfileFromServer = useCallback(async (token: string, bootstrap: AuthBootstrapResponse | null) => {
        try {
            const summary = await getProfileSummary(token);
            setUserProfile((prev) => (
                buildUserProfileFromSummary(summary, bootstrap, prev) ??
                buildUserProfileFromSummary(null, bootstrap, prev)
            ));
        } catch (err: any) {
            console.log('[Auth] Could not sync profile summary from server:', err?.message ?? err);
            const fallback = buildUserProfileFromSummary(null, bootstrap, null);
            setUserProfile(fallback);
        }
    }, []);

    const finalizeAuthenticatedSession = useCallback(async (
        credentials: Credentials,
        userInfo: User | null,
        context: 'login' | 'signup' | 'restore',
        options?: { allowBootstrapFailure?: boolean },
    ) => {
        const token = String(credentials?.accessToken ?? '').trim();
        if (!token) {
            throw new Error('Missing access token');
        }

        const allowBootstrapFailure = options?.allowBootstrapFailure === true;
        const bootstrap = await triggerAuthBootstrap(token, {
            throwOnFailure: !allowBootstrapFailure,
            context,
        });

        if (!bootstrap && !allowBootstrapFailure) {
            throw new Error('Auth bootstrap failed');
        }

        console.log('[Auth] User info:', userInfo?.email || 'No email');
        await storeCredentials(credentials);
        setUser(userInfo);
        setAccessToken(token);
        setIsAuthenticated(true);
        setAuthBootstrap(bootstrap);
        await syncProfileFromServer(token, bootstrap);
        return bootstrap;
    }, [syncProfileFromServer]);

    const checkStoredCredentials = useCallback(async () => {
        console.log('[Auth] Checking stored credentials...');
        try {
            const storedCredentials = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

            if (storedCredentials) {
                console.log('[Auth] Found stored credentials');
                const credentials = JSON.parse(storedCredentials);

                if (credentials.accessToken) {
                    logApiTokenDebug('stored-session', credentials.accessToken);
                    let userInfo: User | null = null;

                    if (credentials.idToken) {
                        try {
                            const idTokenParts = credentials.idToken.split('.');
                            if (idTokenParts.length === 3) {
                                const payload = JSON.parse(atob(idTokenParts[1]));
                                if (payload.exp && payload.exp * 1000 > Date.now()) {
                                    console.log('[Auth] ID token valid, user:', payload.email);
                                    userInfo = {
                                        sub: payload.sub,
                                        name: payload.name,
                                        givenName: payload.given_name,
                                        familyName: payload.family_name,
                                        nickname: payload.nickname,
                                        email: payload.email,
                                        emailVerified: payload.email_verified,
                                        picture: payload.picture,
                                    } as User;
                                } else {
                                    console.log('[Auth] ID token expired');
                                }
                            }
                        } catch (decodeError: any) {
                            console.log('[Auth] Failed to decode ID token:', decodeError.message);
                        }
                    }

                    if (!userInfo) {
                        const auth0 = getAuth0();
                        if (auth0) {
                            try {
                                userInfo = await auth0.auth.userInfo({ token: credentials.accessToken });
                            } catch (userInfoError: any) {
                                console.log('[Auth] Could not fetch userInfo during restore:', userInfoError?.message ?? userInfoError);
                            }
                        }
                    }

                    await finalizeAuthenticatedSession(credentials, userInfo, 'restore', {
                        allowBootstrapFailure: true,
                    });
                }
            } else {
                console.log('[Auth] No stored credentials found');
            }
        } catch (err: any) {
            console.log('[Auth] Session restore failed:', err.message);
            await clearAuthSessionState(true);
        } finally {
            setIsLoading(false);
        }
    }, [clearAuthSessionState, finalizeAuthenticatedSession]);

    // Check for stored credentials on app start
    useEffect(() => {
        if (!isE2EAuthBootstrapEnabled) return;
        setUser(initialE2EAuth?.user ?? null);
        setUserProfile(initialE2EAuth?.userProfile ?? null);
        setAuthBootstrap(initialE2EAuth?.authBootstrap ?? null);
        setAccessToken(initialE2EAuth?.accessToken ?? null);
        setIsAuthenticated(initialE2EAuth?.authenticated ?? true);
        setError(null);
        setIsLoading(false);
    }, [initialE2EAuth, isE2EAuthBootstrapEnabled]);

    useEffect(() => {
        if (isE2EAuthBootstrapEnabled) return;
        checkStoredCredentials();
    }, [checkStoredCredentials, isE2EAuthBootstrapEnabled]);

    const storeCredentials = async (credentials: Credentials) => {
        try {
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(credentials));
        } catch (err) {
            console.error('Error storing credentials:', err);
        }
    };

    const updateUserProfile = async (
        profileData: Partial<UserProfile>,
        options?: { persistLocally?: boolean },
    ) => {
        try {
            const currentProfile = userProfile || {};
            const updatedProfile: UserProfile = {
                ...currentProfile,
                ...profileData,
                updatedAt: new Date().toISOString(),
            };

            if (!updatedProfile.createdAt) {
                updatedProfile.createdAt = new Date().toISOString();
            }

            const hasOwn = (key: keyof UserProfile) =>
                Object.prototype.hasOwnProperty.call(profileData, key);

            if (options?.persistLocally === false) {
                setUserProfile(updatedProfile);
                return;
            }

            if (accessToken) {
                const userPatch: UpdateUserMeInput = {};

                if (hasOwn('username')) userPatch.username = normalizeNullableText(profileData.username);
                if (hasOwn('firstName')) userPatch.first_name = normalizeNullableText(profileData.firstName);
                if (hasOwn('lastName')) userPatch.last_name = normalizeNullableText(profileData.lastName);
                if (hasOwn('nationality')) userPatch.nationality = normalizeNullableText(profileData.nationality);
                if (hasOwn('birthDate')) {
                    const rawBirthDate = normalizeNullableText(profileData.birthDate);
                    userPatch.birthdate = rawBirthDate ? rawBirthDate.slice(0, 10) : null;
                }

                if (Object.keys(userPatch).length > 0) {
                    await updateUserMe(accessToken, userPatch);
                }

                const profilePatch: any = {};

                if (hasOwn('selectedEvents')) {
                    const selected = Array.isArray(profileData.selectedEvents)
                        ? profileData.selectedEvents
                            .map((entry) => String(entry ?? '').trim())
                            .filter(Boolean)
                        : [];
                    profilePatch.selected_events = Array.from(new Set(selected));
                }
                if (hasOwn('mainDisciplines')) {
                    const normalized: Record<string, string> = {};
                    const raw = profileData.mainDisciplines;
                    if (raw && typeof raw === 'object') {
                        Object.entries(raw).forEach(([focus, discipline]) => {
                            const safeFocus = String(focus ?? '').trim();
                            const safeDiscipline = String(discipline ?? '').trim();
                            if (!safeFocus || !safeDiscipline) return;
                            normalized[safeFocus] = safeDiscipline;
                        });
                    }
                    profilePatch.main_disciplines = normalized;
                }
                if (hasOwn('chestNumbersByYear')) {
                    const raw = profileData.chestNumbersByYear;
                    const normalized: Record<string, number> = {};
                    if (raw && typeof raw === 'object') {
                        Object.entries(raw).forEach(([year, chest]) => {
                            const safeYear = String(year || '').trim();
                            if (!/^\d{4}$/.test(safeYear)) return;
                            const parsed = Number(chest);
                            if (!Number.isInteger(parsed) || parsed < 0) return;
                            normalized[safeYear] = parsed;
                        });
                    }
                    profilePatch.chest_numbers_by_year = normalized;
                }
                if (hasOwn('trackFieldClub')) {
                    profilePatch.track_field_club = normalizeNullableText(profileData.trackFieldClub);
                } else if (hasOwn('runningClub')) {
                    profilePatch.track_field_club = normalizeNullableText(profileData.runningClub);
                }
                if (hasOwn('runningClubGroupId')) {
                    profilePatch.running_club_group_id = normalizeNullableText(profileData.runningClubGroupId);
                }
                if (hasOwn('trackFieldMainEvent')) {
                    profilePatch.track_field_main_event = normalizeNullableText(profileData.trackFieldMainEvent);
                }
                if (hasOwn('roadTrailMainEvent')) {
                    profilePatch.road_trail_main_event = normalizeNullableText(profileData.roadTrailMainEvent);
                }
                if (hasOwn('website')) {
                    profilePatch.website = normalizeNullableText(profileData.website);
                }
                if (hasOwn('photographerWebsite') && !hasOwn('website')) {
                    profilePatch.website = normalizeNullableText(profileData.photographerWebsite);
                }
                if (hasOwn('supportRole')) {
                    profilePatch.support_role = normalizeNullableText(profileData.supportRole);
                }
                if (hasOwn('supportOrganization')) {
                    profilePatch.support_organization = normalizeNullableText(profileData.supportOrganization);
                }
                if (hasOwn('supportBaseLocation')) {
                    profilePatch.support_base_location = normalizeNullableText(profileData.supportBaseLocation);
                }
                if (hasOwn('supportAthletes')) {
                    const supportAthletes = Array.isArray(profileData.supportAthletes)
                        ? profileData.supportAthletes
                            .map((entry) => String(entry ?? '').trim())
                            .filter(Boolean)
                        : [];
                    profilePatch.support_athletes = Array.from(new Set(supportAthletes));
                }
                if (hasOwn('supportAthleteProfileIds')) {
                    const supportAthleteProfileIds = Array.isArray(profileData.supportAthleteProfileIds)
                        ? profileData.supportAthleteProfileIds
                            .map((entry) => String(entry ?? '').trim())
                            .filter(Boolean)
                        : [];
                    profilePatch.support_athlete_profile_ids = Array.from(new Set(supportAthleteProfileIds));
                }
                if (hasOwn('supportClubCodes')) {
                    const supportClubCodes = Array.isArray(profileData.supportClubCodes)
                        ? profileData.supportClubCodes
                            .map((entry) => String(entry ?? '').trim().toUpperCase())
                            .filter(Boolean)
                        : [];
                    profilePatch.support_club_codes = Array.from(new Set(supportClubCodes));
                }
                if (hasOwn('supportGroupIds')) {
                    const supportGroupIds = Array.isArray(profileData.supportGroupIds)
                        ? profileData.supportGroupIds
                            .map((entry) => String(entry ?? '').trim())
                            .filter(Boolean)
                        : [];
                    profilePatch.support_group_ids = Array.from(new Set(supportGroupIds));
                }
                if (hasOwn('supportFocuses')) {
                    const supportFocuses = Array.isArray(profileData.supportFocuses)
                        ? profileData.supportFocuses
                            .map((entry) => String(entry ?? '').trim())
                            .filter(Boolean)
                        : [];
                    profilePatch.support_focuses = Array.from(new Set(supportFocuses));
                }
                if (hasOwn('documentUploaded')) {
                    profilePatch.document_uploaded = Boolean(profileData.documentUploaded);
                }
                if (hasOwn('faceVerified')) {
                    profilePatch.face_verified = Boolean(profileData.faceVerified);
                }
                if (hasOwn('category')) {
                    const mappedCategory = mapOnboardingCategoryToBackend(profileData.category);
                    profilePatch.category = mappedCategory;
                }
                if (hasOwn('photographerName')) {
                    const photographerDisplayName = normalizeNullableText(profileData.photographerName);
                    if (photographerDisplayName) {
                        profilePatch.display_name = photographerDisplayName;
                    }
                }
                if (hasOwn('firstName') || hasOwn('lastName')) {
                    const displayName = `${normalizeNullableText(updatedProfile.firstName) || ''} ${normalizeNullableText(updatedProfile.lastName) || ''}`.trim();
                    if (displayName.length > 0) {
                        profilePatch.display_name = displayName;
                    }
                }

                if (Object.keys(profilePatch).length > 0) {
                    await updateProfileSummary(accessToken, profilePatch);
                }

                const summary = await getProfileSummary(accessToken);
                const canonical = buildUserProfileFromSummary(summary, authBootstrap, updatedProfile) ?? updatedProfile;
                setUserProfile(canonical);
                return;
            }

            setUserProfile(updatedProfile);
        } catch (err) {
            console.error('Error updating user profile:', err);
            throw err;
        }
    };

    const getUserProfile = async (): Promise<UserProfile | null> => {
        return userProfile;
    };

    const login = async (connection?: string) => {
        setIsLoading(true);
        setError(null);
        console.log('[Auth] Starting login...', connection ? `with connection: ${connection}` : 'with Universal Login');
        try {
            const auth0 = getAuth0();
            if (!auth0) {
                setError('Auth0 native module not available. Please reinstall pods and rebuild.');
                return;
            }
            console.log('[Auth] Calling auth0.webAuth.authorize...');
            const { authorizeParams, authorizeOptions } = buildAuthorizeRequest('login', connection);
            const credentials = await auth0.webAuth.authorize(authorizeParams, authorizeOptions);
            console.log('[Auth] Credentials received:', credentials ? 'Yes' : 'No');
            console.log('[Auth] Access token exists:', !!credentials?.accessToken);

            if (credentials && credentials.accessToken) {
                console.log('[Auth] Access token received');
                logApiTokenDebug('login', credentials.accessToken);
                console.log('[Auth] ID token exists:', !!credentials.idToken);

                let userInfo: User | null = null;

                // Try to get user info from ID token first (more reliable)
                if (credentials.idToken) {
                    try {
                        // Decode ID token to get user info (it's a JWT)
                        const idTokenParts = credentials.idToken.split('.');
                        if (idTokenParts.length === 3) {
                            const payload = JSON.parse(atob(idTokenParts[1]));
                            console.log('[Auth] Decoded ID token payload:', payload.email || payload.sub);
                            userInfo = {
                                sub: payload.sub,
                                name: payload.name,
                                givenName: payload.given_name,
                                familyName: payload.family_name,
                                nickname: payload.nickname,
                                email: payload.email,
                                emailVerified: payload.email_verified,
                                picture: payload.picture,
                            } as User;
                        }
                    } catch (decodeError) {
                        console.log('[Auth] Failed to decode ID token:', decodeError);
                    }
                }

                // Fallback to userInfo API if ID token decode failed
                if (!userInfo) {
                    try {
                        console.log('[Auth] Fetching user info from API...');
                        userInfo = await auth0.auth.userInfo({ token: credentials.accessToken });
                    } catch (userInfoError: any) {
                        console.log('[Auth] userInfo API failed:', userInfoError.message);
                        // Continue without user info - we still have a valid session
                    }
                }

                await finalizeAuthenticatedSession(credentials, userInfo, 'login');
                console.log('[Auth] Login successful!');
            } else {
                console.log('[Auth] No access token in credentials, login may have been cancelled');
                throw new Error('User cancelled the Auth');
            }
        } catch (err: any) {
            console.log('[Auth] Login error:', err.message, err.code, JSON.stringify(err));
            // Check for various cancellation messages
            const isCancelled = err.message?.includes('cancel') ||
                               err.message?.includes('Cancel') ||
                               err.message === 'User cancelled the Auth' ||
                               err.code === 'a]0' ||
                               err.code === 'CANCELLED';

            if (!isCancelled) {
                await clearAuthSessionState(false);
                const errorMessage = err.message || 'Login failed. Please try again.';
                setError(errorMessage);
                throw new Error(errorMessage);
            } else {
                console.log('[Auth] User cancelled login');
                throw new Error('User cancelled the Auth');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (connection?: string) => {
        setIsLoading(true);
        setError(null);
        console.log('[Auth] Starting signup...', connection ? `with connection: ${connection}` : 'with Universal Login');
        try {
            const auth0 = getAuth0();
            if (!auth0) {
                setError('Auth0 native module not available. Please reinstall pods and rebuild.');
                return;
            }
            console.log('[Auth] Calling auth0.webAuth.authorize for signup...');
            const { authorizeParams, authorizeOptions } = buildAuthorizeRequest('signup', connection);
            const credentials = await auth0.webAuth.authorize(authorizeParams, authorizeOptions);
            console.log('[Auth] Signup credentials received:', credentials ? 'Yes' : 'No');
            console.log('[Auth] Access token exists:', !!credentials?.accessToken);

            if (credentials && credentials.accessToken) {
                console.log('[Auth] Access token received');
                logApiTokenDebug('signup', credentials.accessToken);
                console.log('[Auth] ID token exists:', !!credentials.idToken);

                let userInfo: User | null = null;

                // Try to get user info from ID token first (more reliable)
                if (credentials.idToken) {
                    try {
                        const idTokenParts = credentials.idToken.split('.');
                        if (idTokenParts.length === 3) {
                            const payload = JSON.parse(atob(idTokenParts[1]));
                            console.log('[Auth] Decoded ID token payload:', payload.email || payload.sub);
                            userInfo = {
                                sub: payload.sub,
                                name: payload.name,
                                givenName: payload.given_name,
                                familyName: payload.family_name,
                                nickname: payload.nickname,
                                email: payload.email,
                                emailVerified: payload.email_verified,
                                picture: payload.picture,
                            } as User;
                        }
                    } catch (decodeError) {
                        console.log('[Auth] Failed to decode ID token:', decodeError);
                    }
                }

                // Fallback to userInfo API if ID token decode failed
                if (!userInfo) {
                    try {
                        console.log('[Auth] Fetching user info from API...');
                        userInfo = await auth0.auth.userInfo({ token: credentials.accessToken });
                    } catch (userInfoError: any) {
                        console.log('[Auth] userInfo API failed:', userInfoError.message);
                    }
                }

                await finalizeAuthenticatedSession(credentials, userInfo, 'signup');
                console.log('[Auth] Signup successful!');
            } else {
                console.log('[Auth] No access token in credentials, signup may have been cancelled');
                throw new Error('User cancelled the Auth');
            }
        } catch (err: any) {
            console.log('[Auth] Signup error:', err.message, err.code, JSON.stringify(err));
            // Check for various cancellation messages
            const isCancelled = err.message?.includes('cancel') ||
                               err.message?.includes('Cancel') ||
                               err.message === 'User cancelled the Auth' ||
                               err.code === 'a0.session.user_cancelled' ||
                               err.code === 'CANCELLED';

            if (!isCancelled) {
                await clearAuthSessionState(false);
                const errorMessage = err.message || 'Signup failed. Please try again.';
                setError(errorMessage);
                throw new Error(errorMessage);
            } else {
                console.log('[Auth] User cancelled signup');
                throw new Error('User cancelled the Auth');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            const auth0 = getAuth0();
            if (auth0?.webAuth?.clearSession) {
                const { clearSessionParams, clearSessionOptions } = buildClearSessionRequest();
                try {
                    await auth0.webAuth.clearSession(clearSessionParams, clearSessionOptions);
                    console.log('[Auth] Hosted Auth0 session cleared');
                } catch (clearSessionError: any) {
                    console.log('[Auth] Hosted Auth0 session clear skipped:', clearSessionError?.message ?? clearSessionError);
                }
            }
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            await AsyncStorage.removeItem('@dev_api_token');
            await clearAuthSessionState(false);
        } catch (err: any) {
            console.error('Logout error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const apiAccessToken = accessToken;

    const refreshAuthBootstrap = async (): Promise<AuthBootstrapResponse | null> => {
        let token = accessToken;
        if (!token) {
            try {
                const storedCredentials = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
                if (storedCredentials) {
                    const parsed = JSON.parse(storedCredentials);
                    token = parsed?.accessToken ?? null;
                }
            } catch (err: any) {
                console.log('[Auth] refreshAuthBootstrap could not read stored credentials:', err?.message ?? err);
            }
        }
        if (!token) return null;
        const payload = await triggerAuthBootstrap(token);
        setAuthBootstrap(payload);
        await syncProfileFromServer(token, payload);
        return payload;
    };

    const updateUserAccount = async (input: UpdateUserMeInput): Promise<AuthBootstrapResponse | null> => {
        if (!accessToken) {
            throw new Error('Not authenticated');
        }
        await updateUserMe(accessToken, input);
        return refreshAuthBootstrap();
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                userProfile,
                authBootstrap,
                accessToken,
                apiAccessToken,
                login,
                signup,
                logout,
                updateUserProfile,
                updateUserAccount,
                refreshAuthBootstrap,
                getUserProfile,
                error,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
