import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { createStyles } from '../ViewUserProfileStyles'
import SizeBox from '../../../constants/SizeBox'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Icons from '../../../constants/Icons'
import CustomButton from '../../../components/customButton/CustomButton'
import { useTheme } from '../../../context/ThemeContext'
import { useAuth } from '../../../context/AuthContext'
import { getProfileSummary, updateProfileSummary } from '../../../services/apiGateway'
import { getApiBaseUrl } from '../../../constants/RuntimeConfig'
import { useTranslation } from 'react-i18next'

const EditBioScreens = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken, user } = useAuth();
    const [bio, setBio] = useState('');
    const [profileSummary, setProfileSummary] = useState<any>(null);

    const isSignedUrl = useCallback((value?: string | null) => {
        if (!value) return false;
        const lower = String(value).toLowerCase();
        return (
            lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('token=') ||
            lower.includes('expires=')
        );
    }, []);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    const withAccessToken = useCallback((value?: string | null) => {
        if (!value) return undefined;
        if (!apiAccessToken) return value;
        if (isSignedUrl(value)) return value;
        if (value.includes('access_token=')) return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!apiAccessToken) return;
            try {
                const summary = await getProfileSummary(apiAccessToken);
                if (!mounted) return;
                setProfileSummary(summary);
                if (summary?.profile?.bio != null) {
                    setBio(String(summary.profile.bio || ''));
                }
            } catch {
                if (mounted) setProfileSummary(null);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken]);

    const handleSave = async () => {
        if (!apiAccessToken) return;
        try {
            const updated = await updateProfileSummary(apiAccessToken, { bio });
            setProfileSummary(updated);
            navigation.goBack();
        } catch {
            // keep user on screen if save fails
        }
    };

    const avatarUrl = profileSummary?.profile?.avatar_url
        ? withAccessToken(toAbsoluteUrl(String(profileSummary.profile.avatar_url)))
        : null;
    const displayName =
        profileSummary?.profile?.display_name ||
        user?.name ||
        user?.nickname ||
        user?.email ||
        t('Profile');
    const followersCount = profileSummary?.followers_count ?? 0;

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            <CustomHeader title={t('Profile')} onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <ScrollView showsVerticalScrollIndicator={false}>
                <SizeBox height={18} />
                <View style={styles.profileImgCont}>
                    {avatarUrl ? (
                        <FastImage source={{ uri: String(avatarUrl) }} style={styles.profileImg} />
                    ) : (
                        <View style={[styles.profileImg, { backgroundColor: colors.btnBackgroundColor }]} />
                    )}
                </View>
                <SizeBox height={12} />
                <Text style={[styles.userNameText, styles.textCenter]}>{String(displayName)}</Text>
                <SizeBox height={5} />
                <Text style={[styles.subText, styles.textCenter]}>{user?.email ? String(user.email) : ''}</Text>

                <SizeBox height={10} />
                <View style={[styles.followingCont, styles.center]}>
                    <Text style={styles.followersText}>
                        {`${followersCount} ${t('Followers')}`}
                    </Text>
                </View>

                <SizeBox height={24} />

                <View style={styles.container}>
                    <Text style={styles.titleText}>{t('Bio')}</Text>
                    <SizeBox height={8} />
                    <View style={styles.bioContainer}>
                        <View style={styles.iconRow}>
                            <View style={styles.icon}>
                                <Icons.Edit height={16} width={16} />
                            </View>
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('Write your bio...')}
                                placeholderTextColor={colors.subTextColor}
                                multiline
                                value={bio}
                                onChangeText={setBio}
                            />
                        </View>
                    </View>
                    <SizeBox height={16} />

                    <View style={[styles.row, styles.spaceBetween, { flex: 1 }]}>
                        <TouchableOpacity style={[styles.cancelBtn, { flex: 0.484 }]} activeOpacity={0.7} onPress={() => navigation.goBack()}>
                            <Text style={styles.eventBtnText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 0.484 }}>
                            <CustomButton title={t('Save')} onPress={handleSave} isSmall={true} />
                        </View>
                    </View>

                    <SizeBox height={16} />
                </View>
            </ScrollView>
        </View>
    )
}

export default EditBioScreens
