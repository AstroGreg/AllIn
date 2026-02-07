import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import Auth0, { Credentials, User } from 'react-native-auth0';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth0 credentials
const AUTH0_DOMAIN = 'dev-lfzk0n81zjp0c3x3.us.auth0.com';
const AUTH0_CLIENT_ID = 'czlUtPo1WSw72XpcqHKSzO5MsuUzTV5P';

// Auth0 Management API audience — required for reading/writing user_metadata
// In Auth0 Dashboard: Applications > APIs > "Auth0 Management API" >
//   Machine to Machine Applications > enable your app >
//   grant scopes: read:current_user, update:current_user_metadata
const AUTH0_MANAGEMENT_AUDIENCE = `https://${AUTH0_DOMAIN}/api/v2/`;

// Platform-specific redirect URIs
const IOS_BUNDLE_ID = 'org.gregwenshell.AllIn';
const ANDROID_SCHEME = 'com.allin.auth0';

const AUTH0_REDIRECT_URI = Platform.select({
    ios: `${IOS_BUNDLE_ID}://${AUTH0_DOMAIN}/ios/${IOS_BUNDLE_ID}/callback`,
    android: `${ANDROID_SCHEME}://${AUTH0_DOMAIN}/android/com.allin/callback`,
}) as string;

const auth0 = new Auth0({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
});

// User profile data structure
export interface UserProfile {
    // Basic info from CreateProfileScreen
    username?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    location?: string;

    // Category selection
    category?: 'find' | 'sell' | 'manage';

    // Events selection
    selectedEvents?: string[];

    // Athlete details
    chestNumber?: string;
    website?: string;
    runningClub?: string;

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
    accessToken: string | null;
    login: (connection?: string) => Promise<void>;
    signup: (connection?: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
    getUserProfile: () => Promise<UserProfile | null>;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_STORAGE_KEY = '@user_profile';

const decodeUserFromIdToken = (idToken: string): User | null => {
    try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            return {
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
    } catch (err) {
        console.log('[Auth] Failed to decode ID token:', err);
    }
    return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Check for stored credentials on app start
    useEffect(() => {
        checkStoredCredentials();
    }, []);

    const loadUserMetadata = async (token: string, userId: string): Promise<UserProfile | null> => {
        try {
            const encodedId = encodeURIComponent(userId);
            const response = await fetch(
                `https://${AUTH0_DOMAIN}/api/v2/users/${encodedId}?fields=user_metadata&include_fields=true`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                const metadata = data.user_metadata;
                if (metadata) {
                    console.log('[Auth] Loaded user_metadata from Auth0');
                    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(metadata));
                    return metadata as UserProfile;
                }
            } else {
                const errBody = await response.text();
                console.log('[Auth] Failed to load user_metadata:', response.status, errBody);
            }
        } catch (err: any) {
            console.log('[Auth] Failed to load user_metadata:', err.message);
        }
        return null;
    };

    const checkStoredCredentials = async () => {
        console.log('[Auth] Checking stored credentials...');
        try {
            // Use the SDK's credentials manager — it handles token refresh automatically
            const hasCredentials = await auth0.credentialsManager.hasValidCredentials();
            console.log('[Auth] Has valid credentials:', hasCredentials);

            if (hasCredentials) {
                const credentials = await auth0.credentialsManager.getCredentials();
                console.log('[Auth] Retrieved credentials from manager');

                let userInfo = decodeUserFromIdToken(credentials.idToken);

                if (!userInfo) {
                    try {
                        userInfo = await auth0.auth.userInfo({ token: credentials.accessToken });
                    } catch (err) {
                        console.log('[Auth] userInfo API fallback failed:', err);
                    }
                }

                setUser(userInfo);
                setAccessToken(credentials.accessToken);
                setIsAuthenticated(true);
                console.log('[Auth] Session restored for:', userInfo?.email || 'unknown');

                // Load profile from Auth0 user_metadata
                if (userInfo?.sub) {
                    const metadata = await loadUserMetadata(credentials.accessToken, userInfo.sub);
                    if (metadata) {
                        setUserProfile(metadata);
                    } else {
                        // Fallback to local cache
                        const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
                        if (storedProfile) {
                            setUserProfile(JSON.parse(storedProfile));
                        }
                    }
                }
            } else {
                console.log('[Auth] No valid credentials found');
            }
        } catch (err: any) {
            console.log('[Auth] Credential check failed:', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserProfile = async (profileData: Partial<UserProfile>) => {
        const currentProfile = userProfile || {};
        const updatedProfile: UserProfile = {
            ...currentProfile,
            ...profileData,
            updatedAt: new Date().toISOString(),
        };

        if (!updatedProfile.createdAt) {
            updatedProfile.createdAt = new Date().toISOString();
        }

        // Update local state immediately
        setUserProfile(updatedProfile);
        // Cache locally as fallback
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));

        // Sync to Auth0 user_metadata via direct Management API call
        if (accessToken && user?.sub) {
            try {
                const userId = encodeURIComponent(user.sub);
                const response = await fetch(
                    `https://${AUTH0_DOMAIN}/api/v2/users/${userId}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({ user_metadata: updatedProfile }),
                    },
                );

                if (response.ok) {
                    console.log('[Auth] user_metadata updated in Auth0');
                } else {
                    const errBody = await response.text();
                    console.log('[Auth] Management API error:', response.status, errBody);
                }
            } catch (err: any) {
                console.log('[Auth] Failed to sync user_metadata:', err.message);
            }
        }
    };

    const getUserProfile = async (): Promise<UserProfile | null> => {
        // Try loading from Auth0 first
        if (accessToken && user?.sub) {
            const metadata = await loadUserMetadata(accessToken, user.sub);
            if (metadata) {
                setUserProfile(metadata);
                return metadata;
            }
        }

        // Fallback to local cache
        try {
            const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
            if (storedProfile) {
                const profile = JSON.parse(storedProfile);
                setUserProfile(profile);
                return profile;
            }
        } catch (err) {
            console.error('Error getting user profile:', err);
        }
        return null;
    };

    const login = async (connection?: string) => {
        setIsLoading(true);
        setError(null);
        console.log('[Auth] Starting login...', connection ? `with connection: ${connection}` : 'with Universal Login');
        try {
            const credentials = await auth0.webAuth.authorize({
                scope: 'openid profile email offline_access read:current_user update:current_user_metadata',
                audience: AUTH0_MANAGEMENT_AUDIENCE,
                redirectUrl: AUTH0_REDIRECT_URI,
                ...(connection && { connection }),
                additionalParameters: {
                    prompt: 'login',
                },
            });

            if (credentials && credentials.accessToken) {
                console.log('[Auth] Access token received');

                await auth0.credentialsManager.saveCredentials(credentials);

                let userInfo = decodeUserFromIdToken(credentials.idToken);

                if (!userInfo) {
                    try {
                        userInfo = await auth0.auth.userInfo({ token: credentials.accessToken });
                    } catch (userInfoError: any) {
                        console.log('[Auth] userInfo API failed:', userInfoError.message);
                    }
                }

                setUser(userInfo);
                setAccessToken(credentials.accessToken);
                setIsAuthenticated(true);

                // Load existing user_metadata if any
                if (userInfo?.sub) {
                    const metadata = await loadUserMetadata(credentials.accessToken, userInfo.sub);
                    if (metadata) {
                        setUserProfile(metadata);
                    }
                }

                console.log('[Auth] Login successful!');
            } else {
                throw new Error('User cancelled the Auth');
            }
        } catch (err: any) {
            console.log('[Auth] Login error:', err.message, err.code, JSON.stringify(err));
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
            const credentials = await auth0.webAuth.authorize({
                scope: 'openid profile email offline_access read:current_user update:current_user_metadata',
                audience: AUTH0_MANAGEMENT_AUDIENCE,
                redirectUrl: AUTH0_REDIRECT_URI,
                ...(connection && { connection }),
                additionalParameters: {
                    screen_hint: 'signup',
                    prompt: 'login',
                },
            });

            if (credentials && credentials.accessToken) {
                console.log('[Auth] Access token received');

                await auth0.credentialsManager.saveCredentials(credentials);

                let userInfo = decodeUserFromIdToken(credentials.idToken);

                if (!userInfo) {
                    try {
                        userInfo = await auth0.auth.userInfo({ token: credentials.accessToken });
                    } catch (userInfoError: any) {
                        console.log('[Auth] userInfo API failed:', userInfoError.message);
                    }
                }

                setUser(userInfo);
                setAccessToken(credentials.accessToken);
                setIsAuthenticated(true);
                console.log('[Auth] Signup successful!');
            } else {
                throw new Error('User cancelled the Auth');
            }
        } catch (err: any) {
            console.log('[Auth] Signup error:', err.message, err.code, JSON.stringify(err));
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
                throw new Error('User cancelled the Auth');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await auth0.credentialsManager.clearCredentials();
            await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
            setUser(null);
            setUserProfile(null);
            setAccessToken(null);
            setIsAuthenticated(false);
        } catch (err: any) {
            console.error('Logout error:', err);
        } finally {
            setIsLoading(false);
        }
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
                accessToken,
                login,
                signup,
                logout,
                updateUserProfile,
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
