var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AppConfig } from '../constants/AppConfig';
import { getAuthBootstrap, getProfileSummary, updateProfileSummary, updateUserMe, } from '../services/apiGateway';
// Auth0 credentials
const requireConfig = (key, value) => {
    const out = String(value !== null && value !== void 0 ? value : '').trim();
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
    if (!match)
        return raw;
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
    var _a;
    const match = AUTH0_REDIRECT_URI.match(/^([a-z][a-z0-9+.-]*):\/\//i);
    return (_a = match === null || match === void 0 ? void 0 : match[1]) !== null && _a !== void 0 ? _a : null;
})();
const buildAuthorizeRequest = (mode, connection) => {
    const additionalParameters = {};
    if (!connection) {
        additionalParameters.prompt = 'login';
    }
    if (mode === 'signup') {
        additionalParameters.screen_hint = 'signup';
    }
    if (connection === 'google-oauth2') {
        additionalParameters.prompt = 'select_account';
    }
    const authorizeParams = Object.assign(Object.assign({ scope: 'openid profile email read:users write:media access:ai search:media list:media read:media', audience: AUTH0_AUDIENCE, redirectUrl: AUTH0_REDIRECT_URI }, (connection ? { connection } : {})), { additionalParameters });
    const authorizeOptions = Object.assign(Object.assign({}, (AUTH0_CUSTOM_SCHEME ? { customScheme: AUTH0_CUSTOM_SCHEME } : {})), (!connection ? { ephemeralSession: true } : {}));
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
const getAuth0 = (() => {
    let cached = undefined;
    return () => {
        var _a, _b;
        if (cached !== undefined)
            return cached;
        try {
            const mod = require('react-native-auth0');
            const Auth0Module = (_a = mod === null || mod === void 0 ? void 0 : mod.default) !== null && _a !== void 0 ? _a : mod;
            cached = new Auth0Module({
                domain: AUTH0_DOMAIN,
                clientId: AUTH0_CLIENT_ID,
            });
            return cached;
        }
        catch (err) {
            console.log('[Auth] Auth0 native module unavailable:', (_b = err === null || err === void 0 ? void 0 : err.message) !== null && _b !== void 0 ? _b : err);
            cached = null;
            return null;
        }
    };
})();
const AuthContext = createContext(undefined);
const AUTH_STORAGE_KEY = '@auth_credentials';
const decodeJwtPayload = (token) => {
    try {
        const raw = String(token || '').trim();
        if (!raw)
            return null;
        const parts = raw.split('.');
        if (parts.length !== 3)
            return null;
        return JSON.parse(atob(parts[1]));
    }
    catch (_a) {
        return null;
    }
};
const logApiTokenDebug = (label, token) => {
    var _a, _b, _c, _d, _e, _f;
    const payload = decodeJwtPayload(token);
    if (!payload) {
        console.log(`[Auth] ${label} access token payload: <unreadable>`);
        return;
    }
    console.log(`[Auth] ${label} access token claims`, {
        iss: (_a = payload.iss) !== null && _a !== void 0 ? _a : null,
        aud: (_b = payload.aud) !== null && _b !== void 0 ? _b : null,
        azp: (_c = payload.azp) !== null && _c !== void 0 ? _c : null,
        scope: (_d = payload.scope) !== null && _d !== void 0 ? _d : null,
        permissions: (_e = payload.permissions) !== null && _e !== void 0 ? _e : null,
        sub: (_f = payload.sub) !== null && _f !== void 0 ? _f : null,
    });
};
const asNonEmptyText = (value) => {
    const normalized = String(value !== null && value !== void 0 ? value : '').trim();
    return normalized.length > 0 ? normalized : null;
};
const normalizeNullableText = (value) => {
    if (value == null)
        return null;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : null;
};
const normalizeStringArrayForProfile = (raw) => {
    if (!Array.isArray(raw))
        return [];
    return Array.from(new Set(raw.map((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim()).filter(Boolean)));
};
const normalizeClubCodesForProfile = (raw) => {
    return normalizeStringArrayForProfile(raw).map((entry) => entry.toUpperCase());
};
const normalizeGroupMembershipForProfile = (raw) => {
    if (!Array.isArray(raw))
        return [];
    return raw.reduce((acc, entry) => {
        var _a, _b;
        if (!entry || typeof entry !== 'object')
            return acc;
        const groupId = String((_a = entry.group_id) !== null && _a !== void 0 ? _a : '').trim();
        const name = String((_b = entry.name) !== null && _b !== void 0 ? _b : '').trim();
        if (!groupId || !name)
            return acc;
        acc.push({
            group_id: groupId,
            name,
            bio: normalizeNullableText(entry.bio),
            location: normalizeNullableText(entry.location),
            role: normalizeNullableText(entry.role),
            avatar_media_id: normalizeNullableText(entry.avatar_media_id),
            is_official_club: Boolean(entry.is_official_club),
            official_club_code: normalizeNullableText(entry.official_club_code),
        });
        return acc;
    }, []);
};
const normalizeClubSummaryForProfile = (raw) => {
    if (!Array.isArray(raw))
        return [];
    return raw.reduce((acc, entry) => {
        var _a, _b, _c;
        if (!entry || typeof entry !== 'object')
            return acc;
        const clubId = String((_a = entry.club_id) !== null && _a !== void 0 ? _a : '').trim();
        const code = String((_b = entry.code) !== null && _b !== void 0 ? _b : '').trim();
        const name = String((_c = entry.name) !== null && _c !== void 0 ? _c : '').trim();
        if (!clubId || !code || !name)
            return acc;
        acc.push({
            club_id: clubId,
            code,
            name,
            city: normalizeNullableText(entry.city),
            website: normalizeNullableText(entry.website),
            federation: normalizeNullableText(entry.federation),
            source_url: normalizeNullableText(entry.source_url),
            source_ref: normalizeNullableText(entry.source_ref),
            focuses: normalizeStringArrayForProfile(entry.focuses),
            is_official: Boolean(entry.is_official),
            is_system: Boolean(entry.is_system),
        });
        return acc;
    }, []);
};
const normalizeSingleClubSummaryForProfile = (raw) => {
    var _a;
    return (_a = normalizeClubSummaryForProfile(raw ? [raw] : [])[0]) !== null && _a !== void 0 ? _a : null;
};
const normalizeSingleGroupMembershipForProfile = (raw) => {
    var _a;
    return (_a = normalizeGroupMembershipForProfile(raw ? [raw] : [])[0]) !== null && _a !== void 0 ? _a : null;
};
const hasSupportProfilePayload = (profile) => {
    var _a, _b, _c;
    return (String((_a = profile === null || profile === void 0 ? void 0 : profile.support_role) !== null && _a !== void 0 ? _a : '').trim().length > 0 ||
        String((_b = profile === null || profile === void 0 ? void 0 : profile.support_organization) !== null && _b !== void 0 ? _b : '').trim().length > 0 ||
        String((_c = profile === null || profile === void 0 ? void 0 : profile.support_base_location) !== null && _c !== void 0 ? _c : '').trim().length > 0 ||
        normalizeStringArrayForProfile(profile === null || profile === void 0 ? void 0 : profile.support_athletes).length > 0 ||
        normalizeStringArrayForProfile(profile === null || profile === void 0 ? void 0 : profile.support_athlete_profile_ids).length > 0 ||
        normalizeClubCodesForProfile(profile === null || profile === void 0 ? void 0 : profile.support_club_codes).length > 0 ||
        normalizeStringArrayForProfile(profile === null || profile === void 0 ? void 0 : profile.support_group_ids).length > 0 ||
        normalizeStringArrayForProfile(profile === null || profile === void 0 ? void 0 : profile.support_focuses).length > 0);
};
const deriveFrontendProfileCategory = (profile) => {
    var _a;
    const backendCategory = String((_a = profile === null || profile === void 0 ? void 0 : profile.category) !== null && _a !== void 0 ? _a : '').trim().toLowerCase();
    const hasSupportPayload = hasSupportProfilePayload(profile);
    if (backendCategory === 'club')
        return 'manage';
    if (backendCategory === 'photographer')
        return hasSupportPayload ? 'support' : 'sell';
    return 'find';
};
const mapOnboardingCategoryToBackend = (value) => {
    const normalized = String(value !== null && value !== void 0 ? value : '').trim().toLowerCase();
    if (!normalized)
        return null;
    if (normalized === 'find')
        return 'Athlete';
    if (normalized === 'manage')
        return 'club';
    if (normalized === 'support')
        return 'photographer';
    if (normalized === 'sell')
        return 'photographer';
    if (normalized === 'athlete')
        return 'Athlete';
    if (normalized === 'club')
        return 'club';
    if (normalized === 'photographer')
        return 'photographer';
    return null;
};
const looksLikeSystemIdentity = (value) => {
    const normalized = String(value !== null && value !== void 0 ? value : '').trim().toLowerCase();
    if (!normalized)
        return false;
    if (normalized.includes('|'))
        return true;
    return /^(google-oauth2|auth0|apple)[._:-]/.test(normalized);
};
const profilePatchFromBootstrap = (bootstrap) => {
    const account = bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.user;
    if (!account)
        return null;
    const patch = {};
    const usernameRaw = asNonEmptyText(account.username);
    const username = usernameRaw && !looksLikeSystemIdentity(usernameRaw) ? usernameRaw : null;
    const firstName = asNonEmptyText(account.first_name);
    const lastName = asNonEmptyText(account.last_name);
    const nationality = asNonEmptyText(account.nationality);
    const birthdate = asNonEmptyText(account.birthdate);
    if (username)
        patch.username = username;
    if (firstName)
        patch.firstName = firstName;
    if (lastName)
        patch.lastName = lastName;
    if (nationality)
        patch.nationality = nationality;
    if (birthdate)
        patch.birthDate = birthdate.slice(0, 10);
    return Object.keys(patch).length > 0 ? patch : null;
};
const normalizeChestNumbersForProfile = (raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        return {};
    const out = {};
    Object.entries(raw).forEach(([year, chest]) => {
        const safeYear = String(year !== null && year !== void 0 ? year : '').trim();
        if (!/^\d{4}$/.test(safeYear))
            return;
        const parsed = Number(chest);
        if (!Number.isInteger(parsed) || parsed < 0)
            return;
        out[safeYear] = String(parsed);
    });
    return out;
};
const normalizeMainDisciplinesForProfile = (raw, fallback) => {
    var _a, _b;
    const source = typeof raw === 'string'
        ? (() => {
            try {
                return JSON.parse(raw);
            }
            catch (_a) {
                return {};
            }
        })()
        : raw;
    const out = {};
    if (source && typeof source === 'object' && !Array.isArray(source)) {
        Object.entries(source).forEach(([key, value]) => {
            const safeKey = String(key !== null && key !== void 0 ? key : '').trim();
            const safeValue = String(value !== null && value !== void 0 ? value : '').trim();
            if (!safeKey || !safeValue)
                return;
            out[safeKey] = safeValue;
        });
    }
    const track = String((_a = fallback === null || fallback === void 0 ? void 0 : fallback.trackFieldMainEvent) !== null && _a !== void 0 ? _a : '').trim();
    const road = String((_b = fallback === null || fallback === void 0 ? void 0 : fallback.roadTrailMainEvent) !== null && _b !== void 0 ? _b : '').trim();
    if (track && !out['track-field'])
        out['track-field'] = track;
    if (road && !out['road-events'])
        out['road-events'] = road;
    return out;
};
const buildUserProfileFromSummary = (summary, bootstrap, fallback) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    const bootstrapPatch = (_a = profilePatchFromBootstrap(bootstrap)) !== null && _a !== void 0 ? _a : {};
    const profile = (_b = summary === null || summary === void 0 ? void 0 : summary.profile) !== null && _b !== void 0 ? _b : null;
    if (!profile && Object.keys(bootstrapPatch).length === 0 && !fallback)
        return null;
    const legacyAthleteSignals = String((_c = profile === null || profile === void 0 ? void 0 : profile.track_field_main_event) !== null && _c !== void 0 ? _c : '').trim().length > 0 ||
        String((_d = profile === null || profile === void 0 ? void 0 : profile.road_trail_main_event) !== null && _d !== void 0 ? _d : '').trim().length > 0 ||
        String((_e = profile === null || profile === void 0 ? void 0 : profile.track_field_club) !== null && _e !== void 0 ? _e : '').trim().length > 0 ||
        Object.keys(normalizeChestNumbersForProfile((_f = profile === null || profile === void 0 ? void 0 : profile.chest_numbers_by_year) !== null && _f !== void 0 ? _f : {})).length > 0 ||
        Object.keys(normalizeMainDisciplinesForProfile(profile === null || profile === void 0 ? void 0 : profile.main_disciplines, {
            trackFieldMainEvent: (_g = profile === null || profile === void 0 ? void 0 : profile.track_field_main_event) !== null && _g !== void 0 ? _g : null,
            roadTrailMainEvent: (_h = profile === null || profile === void 0 ? void 0 : profile.road_trail_main_event) !== null && _h !== void 0 ? _h : null,
        })).length > 0;
    const selectedEvents = normalizeStringArrayForProfile(profile === null || profile === void 0 ? void 0 : profile.selected_events);
    const supportFocuses = (() => {
        var _a;
        const explicit = normalizeStringArrayForProfile(profile === null || profile === void 0 ? void 0 : profile.support_focuses);
        if (explicit.length > 0)
            return explicit;
        if (String((_a = profile === null || profile === void 0 ? void 0 : profile.category) !== null && _a !== void 0 ? _a : '').trim().toLowerCase() === 'photographer' && !legacyAthleteSignals) {
            return selectedEvents;
        }
        return [];
    })();
    const next = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (fallback !== null && fallback !== void 0 ? fallback : {})), bootstrapPatch), ((profile === null || profile === void 0 ? void 0 : profile.username) ? { username: String(profile.username).trim() } : {})), ((profile === null || profile === void 0 ? void 0 : profile.category) ? { category: deriveFrontendProfileCategory(profile) } : {})), { selectedEvents, chestNumbersByYear: normalizeChestNumbersForProfile((_j = profile === null || profile === void 0 ? void 0 : profile.chest_numbers_by_year) !== null && _j !== void 0 ? _j : {}), trackFieldClub: String((_k = profile === null || profile === void 0 ? void 0 : profile.track_field_club) !== null && _k !== void 0 ? _k : '').trim(), runningClub: String((_l = profile === null || profile === void 0 ? void 0 : profile.track_field_club) !== null && _l !== void 0 ? _l : '').trim(), runningClubGroupId: String((_m = profile === null || profile === void 0 ? void 0 : profile.running_club_group_id) !== null && _m !== void 0 ? _m : '').trim(), trackFieldClubDetail: normalizeSingleClubSummaryForProfile(profile === null || profile === void 0 ? void 0 : profile.track_field_club_detail), runningClubGroup: normalizeSingleGroupMembershipForProfile(profile === null || profile === void 0 ? void 0 : profile.running_club_group), trackFieldMainEvent: String((_o = profile === null || profile === void 0 ? void 0 : profile.track_field_main_event) !== null && _o !== void 0 ? _o : '').trim(), roadTrailMainEvent: String((_p = profile === null || profile === void 0 ? void 0 : profile.road_trail_main_event) !== null && _p !== void 0 ? _p : '').trim(), mainDisciplines: normalizeMainDisciplinesForProfile(profile === null || profile === void 0 ? void 0 : profile.main_disciplines, {
            trackFieldMainEvent: (_q = profile === null || profile === void 0 ? void 0 : profile.track_field_main_event) !== null && _q !== void 0 ? _q : null,
            roadTrailMainEvent: (_r = profile === null || profile === void 0 ? void 0 : profile.road_trail_main_event) !== null && _r !== void 0 ? _r : null,
        }), website: String((_s = profile === null || profile === void 0 ? void 0 : profile.website) !== null && _s !== void 0 ? _s : '').trim(), supportRole: String((_t = profile === null || profile === void 0 ? void 0 : profile.support_role) !== null && _t !== void 0 ? _t : '').trim(), supportOrganization: String((_u = profile === null || profile === void 0 ? void 0 : profile.support_organization) !== null && _u !== void 0 ? _u : '').trim(), supportBaseLocation: String((_v = profile === null || profile === void 0 ? void 0 : profile.support_base_location) !== null && _v !== void 0 ? _v : '').trim(), supportAthletes: normalizeStringArrayForProfile(profile === null || profile === void 0 ? void 0 : profile.support_athletes), supportAthleteProfileIds: normalizeStringArrayForProfile(profile === null || profile === void 0 ? void 0 : profile.support_athlete_profile_ids), supportClubCodes: normalizeClubCodesForProfile(profile === null || profile === void 0 ? void 0 : profile.support_club_codes), supportGroupIds: normalizeStringArrayForProfile(profile === null || profile === void 0 ? void 0 : profile.support_group_ids), supportFocuses, supportClubs: normalizeClubSummaryForProfile(profile === null || profile === void 0 ? void 0 : profile.support_clubs), supportGroups: normalizeGroupMembershipForProfile(profile === null || profile === void 0 ? void 0 : profile.support_groups), documentUploaded: Boolean(profile === null || profile === void 0 ? void 0 : profile.document_uploaded), faceVerified: Boolean(profile === null || profile === void 0 ? void 0 : profile.face_verified), faceConsentGranted: Boolean(profile === null || profile === void 0 ? void 0 : profile.face_consent_granted), updatedAt: new Date().toISOString() });
    if (!next.createdAt) {
        next.createdAt = new Date().toISOString();
    }
    if (looksLikeSystemIdentity(next.username)) {
        delete next.username;
    }
    return next;
};
const triggerAuthBootstrap = (accessToken, options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const payload = yield getAuthBootstrap(accessToken);
        console.log('[Auth] Bootstrap succeeded:', (payload === null || payload === void 0 ? void 0 : payload.needs_user_onboarding) ? 'needs_onboarding' : 'ready');
        return payload;
    }
    catch (err) {
        console.log(`[Auth] Bootstrap failed${(options === null || options === void 0 ? void 0 : options.context) ? ` (${options.context})` : ''}:`, (_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : err);
        if (options === null || options === void 0 ? void 0 : options.throwOnFailure) {
            throw err;
        }
        return null;
    }
});
export const AuthProvider = ({ children, initialE2EAuth, }) => {
    var _a;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [authBootstrap, setAuthBootstrap] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [error, setError] = useState(null);
    const isE2EAuthBootstrapEnabled = Boolean(initialE2EAuth && ((_a = initialE2EAuth.enabled) !== null && _a !== void 0 ? _a : true));
    const clearAuthSessionState = useCallback((clearStoredCredentials) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        if (clearStoredCredentials) {
            try {
                yield AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            }
            catch (err) {
                console.log('[Auth] Could not clear stored credentials:', (_b = err === null || err === void 0 ? void 0 : err.message) !== null && _b !== void 0 ? _b : err);
            }
        }
        setUser(null);
        setUserProfile(null);
        setAuthBootstrap(null);
        setAccessToken(null);
        setIsAuthenticated(false);
    }), []);
    const syncProfileFromServer = useCallback((token, bootstrap) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        try {
            const summary = yield getProfileSummary(token);
            setUserProfile((prev) => {
                var _a;
                return ((_a = buildUserProfileFromSummary(summary, bootstrap, prev)) !== null && _a !== void 0 ? _a : buildUserProfileFromSummary(null, bootstrap, prev));
            });
        }
        catch (err) {
            console.log('[Auth] Could not sync profile summary from server:', (_c = err === null || err === void 0 ? void 0 : err.message) !== null && _c !== void 0 ? _c : err);
            const fallback = buildUserProfileFromSummary(null, bootstrap, null);
            setUserProfile(fallback);
        }
    }), []);
    const finalizeAuthenticatedSession = useCallback((credentials, userInfo, context, options) => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        const token = String((_d = credentials === null || credentials === void 0 ? void 0 : credentials.accessToken) !== null && _d !== void 0 ? _d : '').trim();
        if (!token) {
            throw new Error('Missing access token');
        }
        const allowBootstrapFailure = (options === null || options === void 0 ? void 0 : options.allowBootstrapFailure) === true;
        const bootstrap = yield triggerAuthBootstrap(token, {
            throwOnFailure: !allowBootstrapFailure,
            context,
        });
        if (!bootstrap && !allowBootstrapFailure) {
            throw new Error('Auth bootstrap failed');
        }
        console.log('[Auth] User info:', (userInfo === null || userInfo === void 0 ? void 0 : userInfo.email) || 'No email');
        yield storeCredentials(credentials);
        setUser(userInfo);
        setAccessToken(token);
        setIsAuthenticated(true);
        setAuthBootstrap(bootstrap);
        yield syncProfileFromServer(token, bootstrap);
        return bootstrap;
    }), [syncProfileFromServer]);
    const checkStoredCredentials = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _e;
        console.log('[Auth] Checking stored credentials...');
        try {
            const storedCredentials = yield AsyncStorage.getItem(AUTH_STORAGE_KEY);
            if (storedCredentials) {
                console.log('[Auth] Found stored credentials');
                const credentials = JSON.parse(storedCredentials);
                if (credentials.accessToken) {
                    logApiTokenDebug('stored-session', credentials.accessToken);
                    let userInfo = null;
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
                                    };
                                }
                                else {
                                    console.log('[Auth] ID token expired');
                                }
                            }
                        }
                        catch (decodeError) {
                            console.log('[Auth] Failed to decode ID token:', decodeError.message);
                        }
                    }
                    if (!userInfo) {
                        const auth0 = getAuth0();
                        if (auth0) {
                            try {
                                userInfo = yield auth0.auth.userInfo({ token: credentials.accessToken });
                            }
                            catch (userInfoError) {
                                console.log('[Auth] Could not fetch userInfo during restore:', (_e = userInfoError === null || userInfoError === void 0 ? void 0 : userInfoError.message) !== null && _e !== void 0 ? _e : userInfoError);
                            }
                        }
                    }
                    yield finalizeAuthenticatedSession(credentials, userInfo, 'restore', {
                        allowBootstrapFailure: true,
                    });
                }
            }
            else {
                console.log('[Auth] No stored credentials found');
            }
        }
        catch (err) {
            console.log('[Auth] Session restore failed:', err.message);
            yield clearAuthSessionState(true);
        }
        finally {
            setIsLoading(false);
        }
    }), [clearAuthSessionState, finalizeAuthenticatedSession]);
    // Check for stored credentials on app start
    useEffect(() => {
        var _a, _b, _c, _d, _e;
        if (!isE2EAuthBootstrapEnabled)
            return;
        setUser((_a = initialE2EAuth === null || initialE2EAuth === void 0 ? void 0 : initialE2EAuth.user) !== null && _a !== void 0 ? _a : null);
        setUserProfile((_b = initialE2EAuth === null || initialE2EAuth === void 0 ? void 0 : initialE2EAuth.userProfile) !== null && _b !== void 0 ? _b : null);
        setAuthBootstrap((_c = initialE2EAuth === null || initialE2EAuth === void 0 ? void 0 : initialE2EAuth.authBootstrap) !== null && _c !== void 0 ? _c : null);
        setAccessToken((_d = initialE2EAuth === null || initialE2EAuth === void 0 ? void 0 : initialE2EAuth.accessToken) !== null && _d !== void 0 ? _d : null);
        setIsAuthenticated((_e = initialE2EAuth === null || initialE2EAuth === void 0 ? void 0 : initialE2EAuth.authenticated) !== null && _e !== void 0 ? _e : true);
        setError(null);
        setIsLoading(false);
    }, [initialE2EAuth, isE2EAuthBootstrapEnabled]);
    useEffect(() => {
        if (isE2EAuthBootstrapEnabled)
            return;
        checkStoredCredentials();
    }, [checkStoredCredentials, isE2EAuthBootstrapEnabled]);
    const storeCredentials = (credentials) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(credentials));
        }
        catch (err) {
            console.error('Error storing credentials:', err);
        }
    });
    const updateUserProfile = (profileData, options) => __awaiter(void 0, void 0, void 0, function* () {
        var _f;
        try {
            const currentProfile = userProfile || {};
            const updatedProfile = Object.assign(Object.assign(Object.assign({}, currentProfile), profileData), { updatedAt: new Date().toISOString() });
            if (!updatedProfile.createdAt) {
                updatedProfile.createdAt = new Date().toISOString();
            }
            const hasOwn = (key) => Object.prototype.hasOwnProperty.call(profileData, key);
            if ((options === null || options === void 0 ? void 0 : options.persistLocally) === false) {
                setUserProfile(updatedProfile);
                return;
            }
            if (accessToken) {
                const userPatch = {};
                if (hasOwn('username'))
                    userPatch.username = normalizeNullableText(profileData.username);
                if (hasOwn('firstName'))
                    userPatch.first_name = normalizeNullableText(profileData.firstName);
                if (hasOwn('lastName'))
                    userPatch.last_name = normalizeNullableText(profileData.lastName);
                if (hasOwn('nationality'))
                    userPatch.nationality = normalizeNullableText(profileData.nationality);
                if (hasOwn('birthDate')) {
                    const rawBirthDate = normalizeNullableText(profileData.birthDate);
                    userPatch.birthdate = rawBirthDate ? rawBirthDate.slice(0, 10) : null;
                }
                if (Object.keys(userPatch).length > 0) {
                    yield updateUserMe(accessToken, userPatch);
                }
                const profilePatch = {};
                if (hasOwn('selectedEvents')) {
                    const selected = Array.isArray(profileData.selectedEvents)
                        ? profileData.selectedEvents
                            .map((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim())
                            .filter(Boolean)
                        : [];
                    profilePatch.selected_events = Array.from(new Set(selected));
                }
                if (hasOwn('mainDisciplines')) {
                    const normalized = {};
                    const raw = profileData.mainDisciplines;
                    if (raw && typeof raw === 'object') {
                        Object.entries(raw).forEach(([focus, discipline]) => {
                            const safeFocus = String(focus !== null && focus !== void 0 ? focus : '').trim();
                            const safeDiscipline = String(discipline !== null && discipline !== void 0 ? discipline : '').trim();
                            if (!safeFocus || !safeDiscipline)
                                return;
                            normalized[safeFocus] = safeDiscipline;
                        });
                    }
                    profilePatch.main_disciplines = normalized;
                }
                if (hasOwn('chestNumbersByYear')) {
                    const raw = profileData.chestNumbersByYear;
                    const normalized = {};
                    if (raw && typeof raw === 'object') {
                        Object.entries(raw).forEach(([year, chest]) => {
                            const safeYear = String(year || '').trim();
                            if (!/^\d{4}$/.test(safeYear))
                                return;
                            const parsed = Number(chest);
                            if (!Number.isInteger(parsed) || parsed < 0)
                                return;
                            normalized[safeYear] = parsed;
                        });
                    }
                    profilePatch.chest_numbers_by_year = normalized;
                }
                if (hasOwn('trackFieldClub')) {
                    profilePatch.track_field_club = normalizeNullableText(profileData.trackFieldClub);
                }
                else if (hasOwn('runningClub')) {
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
                            .map((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim())
                            .filter(Boolean)
                        : [];
                    profilePatch.support_athletes = Array.from(new Set(supportAthletes));
                }
                if (hasOwn('supportAthleteProfileIds')) {
                    const supportAthleteProfileIds = Array.isArray(profileData.supportAthleteProfileIds)
                        ? profileData.supportAthleteProfileIds
                            .map((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim())
                            .filter(Boolean)
                        : [];
                    profilePatch.support_athlete_profile_ids = Array.from(new Set(supportAthleteProfileIds));
                }
                if (hasOwn('supportClubCodes')) {
                    const supportClubCodes = Array.isArray(profileData.supportClubCodes)
                        ? profileData.supportClubCodes
                            .map((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim().toUpperCase())
                            .filter(Boolean)
                        : [];
                    profilePatch.support_club_codes = Array.from(new Set(supportClubCodes));
                }
                if (hasOwn('supportGroupIds')) {
                    const supportGroupIds = Array.isArray(profileData.supportGroupIds)
                        ? profileData.supportGroupIds
                            .map((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim())
                            .filter(Boolean)
                        : [];
                    profilePatch.support_group_ids = Array.from(new Set(supportGroupIds));
                }
                if (hasOwn('supportFocuses')) {
                    const supportFocuses = Array.isArray(profileData.supportFocuses)
                        ? profileData.supportFocuses
                            .map((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim())
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
                    yield updateProfileSummary(accessToken, profilePatch);
                }
                const summary = yield getProfileSummary(accessToken);
                const canonical = (_f = buildUserProfileFromSummary(summary, authBootstrap, updatedProfile)) !== null && _f !== void 0 ? _f : updatedProfile;
                setUserProfile(canonical);
                return;
            }
            setUserProfile(updatedProfile);
        }
        catch (err) {
            console.error('Error updating user profile:', err);
            throw err;
        }
    });
    const getUserProfile = () => __awaiter(void 0, void 0, void 0, function* () {
        return userProfile;
    });
    const login = (connection) => __awaiter(void 0, void 0, void 0, function* () {
        var _g, _h;
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
            const credentials = yield auth0.webAuth.authorize(authorizeParams, authorizeOptions);
            console.log('[Auth] Credentials received:', credentials ? 'Yes' : 'No');
            console.log('[Auth] Access token exists:', !!(credentials === null || credentials === void 0 ? void 0 : credentials.accessToken));
            if (credentials && credentials.accessToken) {
                console.log('[Auth] Access token received');
                logApiTokenDebug('login', credentials.accessToken);
                console.log('[Auth] ID token exists:', !!credentials.idToken);
                let userInfo = null;
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
                            };
                        }
                    }
                    catch (decodeError) {
                        console.log('[Auth] Failed to decode ID token:', decodeError);
                    }
                }
                // Fallback to userInfo API if ID token decode failed
                if (!userInfo) {
                    try {
                        console.log('[Auth] Fetching user info from API...');
                        userInfo = yield auth0.auth.userInfo({ token: credentials.accessToken });
                    }
                    catch (userInfoError) {
                        console.log('[Auth] userInfo API failed:', userInfoError.message);
                        // Continue without user info - we still have a valid session
                    }
                }
                yield finalizeAuthenticatedSession(credentials, userInfo, 'login');
                console.log('[Auth] Login successful!');
            }
            else {
                console.log('[Auth] No access token in credentials, login may have been cancelled');
                throw new Error('User cancelled the Auth');
            }
        }
        catch (err) {
            console.log('[Auth] Login error:', err.message, err.code, JSON.stringify(err));
            // Check for various cancellation messages
            const isCancelled = ((_g = err.message) === null || _g === void 0 ? void 0 : _g.includes('cancel')) ||
                ((_h = err.message) === null || _h === void 0 ? void 0 : _h.includes('Cancel')) ||
                err.message === 'User cancelled the Auth' ||
                err.code === 'a]0' ||
                err.code === 'CANCELLED';
            if (!isCancelled) {
                yield clearAuthSessionState(false);
                const errorMessage = err.message || 'Login failed. Please try again.';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
            else {
                console.log('[Auth] User cancelled login');
                throw new Error('User cancelled the Auth');
            }
        }
        finally {
            setIsLoading(false);
        }
    });
    const signup = (connection) => __awaiter(void 0, void 0, void 0, function* () {
        var _j, _k;
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
            const credentials = yield auth0.webAuth.authorize(authorizeParams, authorizeOptions);
            console.log('[Auth] Signup credentials received:', credentials ? 'Yes' : 'No');
            console.log('[Auth] Access token exists:', !!(credentials === null || credentials === void 0 ? void 0 : credentials.accessToken));
            if (credentials && credentials.accessToken) {
                console.log('[Auth] Access token received');
                logApiTokenDebug('signup', credentials.accessToken);
                console.log('[Auth] ID token exists:', !!credentials.idToken);
                let userInfo = null;
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
                            };
                        }
                    }
                    catch (decodeError) {
                        console.log('[Auth] Failed to decode ID token:', decodeError);
                    }
                }
                // Fallback to userInfo API if ID token decode failed
                if (!userInfo) {
                    try {
                        console.log('[Auth] Fetching user info from API...');
                        userInfo = yield auth0.auth.userInfo({ token: credentials.accessToken });
                    }
                    catch (userInfoError) {
                        console.log('[Auth] userInfo API failed:', userInfoError.message);
                    }
                }
                yield finalizeAuthenticatedSession(credentials, userInfo, 'signup');
                console.log('[Auth] Signup successful!');
            }
            else {
                console.log('[Auth] No access token in credentials, signup may have been cancelled');
                throw new Error('User cancelled the Auth');
            }
        }
        catch (err) {
            console.log('[Auth] Signup error:', err.message, err.code, JSON.stringify(err));
            // Check for various cancellation messages
            const isCancelled = ((_j = err.message) === null || _j === void 0 ? void 0 : _j.includes('cancel')) ||
                ((_k = err.message) === null || _k === void 0 ? void 0 : _k.includes('Cancel')) ||
                err.message === 'User cancelled the Auth' ||
                err.code === 'a0.session.user_cancelled' ||
                err.code === 'CANCELLED';
            if (!isCancelled) {
                yield clearAuthSessionState(false);
                const errorMessage = err.message || 'Signup failed. Please try again.';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
            else {
                console.log('[Auth] User cancelled signup');
                throw new Error('User cancelled the Auth');
            }
        }
        finally {
            setIsLoading(false);
        }
    });
    const logout = () => __awaiter(void 0, void 0, void 0, function* () {
        var _l, _m;
        setIsLoading(true);
        try {
            const auth0 = getAuth0();
            if ((_l = auth0 === null || auth0 === void 0 ? void 0 : auth0.webAuth) === null || _l === void 0 ? void 0 : _l.clearSession) {
                const { clearSessionParams, clearSessionOptions } = buildClearSessionRequest();
                try {
                    yield auth0.webAuth.clearSession(clearSessionParams, clearSessionOptions);
                    console.log('[Auth] Hosted Auth0 session cleared');
                }
                catch (clearSessionError) {
                    console.log('[Auth] Hosted Auth0 session clear skipped:', (_m = clearSessionError === null || clearSessionError === void 0 ? void 0 : clearSessionError.message) !== null && _m !== void 0 ? _m : clearSessionError);
                }
            }
            yield AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            yield AsyncStorage.removeItem('@dev_api_token');
            yield clearAuthSessionState(false);
        }
        catch (err) {
            console.error('Logout error:', err);
        }
        finally {
            setIsLoading(false);
        }
    });
    const apiAccessToken = accessToken;
    const refreshAuthBootstrap = () => __awaiter(void 0, void 0, void 0, function* () {
        var _o, _p;
        let token = accessToken;
        if (!token) {
            try {
                const storedCredentials = yield AsyncStorage.getItem(AUTH_STORAGE_KEY);
                if (storedCredentials) {
                    const parsed = JSON.parse(storedCredentials);
                    token = (_o = parsed === null || parsed === void 0 ? void 0 : parsed.accessToken) !== null && _o !== void 0 ? _o : null;
                }
            }
            catch (err) {
                console.log('[Auth] refreshAuthBootstrap could not read stored credentials:', (_p = err === null || err === void 0 ? void 0 : err.message) !== null && _p !== void 0 ? _p : err);
            }
        }
        if (!token)
            return null;
        const payload = yield triggerAuthBootstrap(token);
        setAuthBootstrap(payload);
        yield syncProfileFromServer(token, payload);
        return payload;
    });
    const updateUserAccount = (input) => __awaiter(void 0, void 0, void 0, function* () {
        if (!accessToken) {
            throw new Error('Not authenticated');
        }
        yield updateUserMe(accessToken, input);
        return refreshAuthBootstrap();
    });
    const clearError = () => {
        setError(null);
    };
    return (_jsx(AuthContext.Provider, Object.assign({ value: {
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
        } }, { children: children })));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
export default AuthContext;
