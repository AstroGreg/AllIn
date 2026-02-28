import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '../constants/AppConfig';
import { getAuthBootstrap, updateUserMe, type AuthBootstrapResponse, type UpdateUserMeInput } from '../services/apiGateway';

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
const AUTH0_REDIRECT_URI = requireConfig('AUTH0_REDIRECT_URI', AppConfig.AUTH0_REDIRECT_URI);



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
    birthDate?: string;
    location?: string;
    nationality?: string;

    // Category selection
    category?: 'find' | 'sell' | 'manage';

    // Events selection
    selectedEvents?: string[];

    // Athlete details
    chestNumbersByYear?: Record<string, string>;
    trackFieldClub?: string;
    trackFieldMainEvent?: string;
    roadTrailMainEvent?: string;
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

    // Verification
    documentUploaded?: boolean;
    faceVerified?: boolean;

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
    updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
    updateUserAccount: (input: UpdateUserMeInput) => Promise<AuthBootstrapResponse | null>;
    refreshAuthBootstrap: () => Promise<AuthBootstrapResponse | null>;
    getUserProfile: () => Promise<UserProfile | null>;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@auth_credentials';
const PROFILE_STORAGE_KEY = '@user_profile';

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

const triggerAuthBootstrap = async (accessToken: string): Promise<AuthBootstrapResponse | null> => {
    try {
        const payload = await getAuthBootstrap(accessToken);
        console.log('[Auth] Bootstrap succeeded:', payload?.needs_user_onboarding ? 'needs_onboarding' : 'ready');
        return payload;
    } catch (err: any) {
        console.log('[Auth] Bootstrap failed:', err?.message ?? err);
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [authBootstrap, setAuthBootstrap] = useState<AuthBootstrapResponse | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Check for stored credentials on app start
    useEffect(() => {
        checkStoredCredentials();
    }, []);

    const checkStoredCredentials = async () => {
        console.log('[Auth] Checking stored credentials...');
        try {
            const storedCredentials = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
            const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
            if (storedProfile) {
                console.log('[Auth] Found stored profile');
                setUserProfile(JSON.parse(storedProfile));
            }

            if (storedCredentials) {
                console.log('[Auth] Found stored credentials');
                const credentials = JSON.parse(storedCredentials);

                if (credentials.accessToken) {
                    logApiTokenDebug('stored-session', credentials.accessToken);
                    let userInfo: User | null = null;

                    // Try to decode ID token first
                    if (credentials.idToken) {
                        try {
                            const idTokenParts = credentials.idToken.split('.');
                            if (idTokenParts.length === 3) {
                                const payload = JSON.parse(atob(idTokenParts[1]));
                                // Check if token is expired
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
                                    throw new Error('Token expired');
                                }
                            }
                        } catch (decodeError: any) {
                            console.log('[Auth] Failed to decode ID token:', decodeError.message);
                            throw decodeError;
                        }
                    }

                    if (userInfo) {
                        setUser(userInfo);
                        setAccessToken(credentials.accessToken);
                        setIsAuthenticated(true);
                        const bootstrap = await triggerAuthBootstrap(credentials.accessToken);
                        setAuthBootstrap(bootstrap);
                    } else {
                        throw new Error('Could not validate session');
                    }
                }
            } else {
                console.log('[Auth] No stored credentials found');
            }
        } catch (err: any) {
            // Token expired or invalid, clear stored credentials
            console.log('[Auth] Token validation failed:', err.message);
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        } finally {
            setIsLoading(false);
        }
    };

    const storeCredentials = async (credentials: Credentials) => {
        try {
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(credentials));
        } catch (err) {
            console.error('Error storing credentials:', err);
        }
    };

    const updateUserProfile = async (profileData: Partial<UserProfile>) => {
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

            // Store locally
            await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
            setUserProfile(updatedProfile);

            // If authenticated, also update Auth0 user metadata
            const auth0 = getAuth0();
            if (accessToken && auth0) {
                try {
                    await auth0.auth.userInfo({ token: accessToken });
                    // Note: To update user_metadata in Auth0, you typically need to use the Management API
                    // which requires a separate access token. For simplicity, we're storing locally.
                    // In production, you'd call your backend to update Auth0 user_metadata.
                } catch (err) {
                    console.log('Could not sync profile to Auth0:', err);
                }
            }
        } catch (err) {
            console.error('Error updating user profile:', err);
            throw err;
        }
    };

    const getUserProfile = async (): Promise<UserProfile | null> => {
        try {
            const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
            if (storedProfile) {
                const profile = JSON.parse(storedProfile);
                setUserProfile(profile);
                return profile;
            }
            return null;
        } catch (err) {
            console.error('Error getting user profile:', err);
            return null;
        }
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
            const authorizeParams: Record<string, any> = {
                // If AUTH0_AUDIENCE is set, request an API access token with the permissions needed by the gateway.
                scope: 'openid profile email read:users write:media access:ai search:media list:media read:media',
                audience: AUTH0_AUDIENCE,
                redirectUrl: AUTH0_REDIRECT_URI,
                ...(connection && { connection }),
                // Force fresh login by adding prompt parameter
                additionalParameters: {
                    prompt: 'login',
                },
            };
            const credentials = await auth0.webAuth.authorize(authorizeParams);
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

                console.log('[Auth] User info:', userInfo?.email || 'No email');
                setUser(userInfo);
                setAccessToken(credentials.accessToken);
                setIsAuthenticated(true);
                await storeCredentials(credentials);
                const bootstrap = await triggerAuthBootstrap(credentials.accessToken);
                setAuthBootstrap(bootstrap);
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
            const authorizeParams: Record<string, any> = {
                scope: 'openid profile email read:users write:media access:ai search:media list:media read:media',
                audience: AUTH0_AUDIENCE,
                redirectUrl: AUTH0_REDIRECT_URI,
                ...(connection && { connection }),
                additionalParameters: {
                    screen_hint: 'signup',
                    prompt: 'login',
                },
            };
            const credentials = await auth0.webAuth.authorize(authorizeParams);
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

                console.log('[Auth] User info:', userInfo?.email || 'No email');
                setUser(userInfo);
                setAccessToken(credentials.accessToken);
                setIsAuthenticated(true);
                await storeCredentials(credentials);
                const bootstrap = await triggerAuthBootstrap(credentials.accessToken);
                setAuthBootstrap(bootstrap);
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
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
            await AsyncStorage.removeItem('@dev_api_token');
            setUser(null);
            setUserProfile(null);
            setAuthBootstrap(null);
            setAccessToken(null);
            setIsAuthenticated(false);
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
