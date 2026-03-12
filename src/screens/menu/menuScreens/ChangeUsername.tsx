import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, User } from 'iconsax-react-nativejs'
import { useAuth } from '../../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { checkAccountAvailability } from '../../../services/apiGateway'
import { validateUsernameInput } from '../../../utils/accountAvailability'

type AvailabilityState = {
    status: 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
    message: string;
    valid: boolean;
    available: boolean;
};

const neutralAvailabilityState = (): AvailabilityState => ({
    status: 'idle',
    message: '',
    valid: true,
    available: true,
});

const ChangeUsername = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { userProfile, user, authBootstrap, updateUserAccount, accessToken } = useAuth();
    const [newUsername, setNewUsername] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [availability, setAvailability] = useState<AvailabilityState>(neutralAvailabilityState);
    const looksLikeSystemIdentity = useCallback((value: any): boolean => {
        const normalized = String(value ?? '').trim().toLowerCase();
        if (!normalized) return false;
        if (normalized.includes('|')) return true;
        return /^(google-oauth2|auth0|apple)[._:-]/.test(normalized);
    }, []);
    const sanitizeUsername = useCallback((value: any): string => {
        const normalized = String(value ?? '').trim();
        if (!normalized || looksLikeSystemIdentity(normalized)) return '';
        return normalized;
    }, [looksLikeSystemIdentity]);

    const currentUsername =
        sanitizeUsername(userProfile?.username) ||
        sanitizeUsername(authBootstrap?.user?.username) ||
        sanitizeUsername(user?.nickname) ||
        'Not set';

    useEffect(() => {
        if (!isEditing) {
            setAvailability(neutralAvailabilityState());
            return;
        }
        const value = newUsername.trim();
        if (!value || value === currentUsername) {
            setAvailability(neutralAvailabilityState());
            return;
        }
        if (looksLikeSystemIdentity(value)) {
            setAvailability({
                status: 'invalid',
                message: t('Please choose a custom username.'),
                valid: false,
                available: false,
            });
            return;
        }
        const reason = validateUsernameInput(value);
        if (reason) {
            const message =
                reason === 'too_short'
                    ? t('Use at least 2 characters.')
                    : reason === 'too_long'
                        ? t('Use 32 characters or fewer.')
                        : reason === 'invalid_format'
                            ? t('Use only letters, numbers, dots, underscores, or hyphens.')
                            : t('Username is required.');
            setAvailability({
                status: 'invalid',
                message,
                valid: false,
                available: false,
            });
            return;
        }
        if (!accessToken) {
            setAvailability(neutralAvailabilityState());
            return;
        }

        let cancelled = false;
        setAvailability({
            status: 'checking',
            message: t('Checking username...'),
            valid: true,
            available: false,
        });

        const timer = setTimeout(async () => {
            try {
                const res = await checkAccountAvailability(accessToken, { username: value });
                if (cancelled) return;
                if (!res.username) {
                    setAvailability(neutralAvailabilityState());
                    return;
                }
                if (!res.username.valid) {
                    setAvailability({
                        status: 'invalid',
                        message: t('Please choose a valid username.'),
                        valid: false,
                        available: false,
                    });
                    return;
                }
                if (!res.username.available) {
                    setAvailability({
                        status: 'taken',
                        message: t('This username is already in use.'),
                        valid: true,
                        available: false,
                    });
                    return;
                }
                setAvailability({
                    status: 'available',
                    message: t('Username is available.'),
                    valid: true,
                    available: true,
                });
            } catch {
                if (!cancelled) {
                    setAvailability(neutralAvailabilityState());
                }
            }
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [accessToken, currentUsername, isEditing, looksLikeSystemIdentity, newUsername, t]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Change Username')}</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.changePasswordTitle}>{t('Change Username')}</Text>
                <SizeBox height={16} />

                <View style={Styles.currentValueCard}>
                    <View>
                        <Text style={Styles.currentValueLabel}>{t('Current username')}</Text>
                        <Text style={Styles.currentValueText}>{currentUsername}</Text>
                    </View>
                    <TouchableOpacity
                        style={Styles.editActionButton}
                        onPress={() => {
                            setNewUsername(currentUsername === 'Not set' ? '' : String(currentUsername));
                            setIsEditing(true);
                        }}
                    >
                        <Text style={Styles.editActionText}>{t('Edit')}</Text>
                    </TouchableOpacity>
                </View>

                {isEditing && (
                    <>
                        <SizeBox height={24} />
                        <View style={Styles.addCardInputGroup}>
                            <Text style={Styles.addCardLabel}>{t('Username')}</Text>
                            <SizeBox height={8} />
                            <View style={Styles.addCardInputContainer}>
                                <User size={16} color={colors.primaryColor} variant="Linear" />
                                <SizeBox width={10} />
                                <TextInput
                                    style={Styles.addCardInput}
                                    placeholder={t('Enter username')}
                                    placeholderTextColor={colors.grayColor}
                                    value={newUsername}
                                    onChangeText={setNewUsername}
                                />
                            </View>
                            {availability.status !== 'idle' ? (
                                <Text
                                    style={[
                                        Styles.inlineHelperText,
                                        availability.status === 'available'
                                            ? { color: colors.greenColor }
                                            : availability.status === 'checking'
                                                ? { color: colors.grayColor }
                                                : { color: colors.errorColor },
                                    ]}
                                >
                                    {availability.message}
                                </Text>
                            ) : null}
                        </View>

                        <View style={Styles.editActionsRow}>
                            <TouchableOpacity style={Styles.cancelButton} onPress={() => setIsEditing(false)}>
                                <Text style={Styles.cancelButtonText}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.saveButton}
                                onPress={async () => {
                                    if (!newUsername.trim()) return;
                                    const nextUsername = newUsername.trim();
                                    if (looksLikeSystemIdentity(nextUsername)) {
                                        Alert.alert(t('Invalid username'), t('Please choose a custom username.'));
                                        return;
                                    }
                                    if (!availability.valid || !availability.available || availability.status === 'checking') {
                                        Alert.alert(t('Invalid username'), availability.message || t('Please choose an available username.'));
                                        return;
                                    }
                                    try {
                                        await updateUserAccount({ username: nextUsername });
                                        setIsEditing(false);
                                    } catch {
                                        Alert.alert(t('Error'), t('Failed to save. Please try again.'));
                                    }
                                }}
                            >
                                <Text style={Styles.saveButtonText}>{t('Save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default ChangeUsername
