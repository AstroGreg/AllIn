import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    ArrowRight2,
    DocumentText,
    Profile2User,
    Refresh,
    SearchNormal1,
    VideoSquare,
} from 'iconsax-react-nativejs';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { AuthBootstrapResponse, AuthMeResponse, getAuthMe } from '../../../services/apiGateway';
import { createStyles } from '../MenuStyles';
import { useTranslation } from 'react-i18next';

interface ActionItem {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress: () => void;
}

const AdminPane = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const {
        apiAccessToken,
        authBootstrap,
        isAuthenticated,
        refreshAuthBootstrap,
        userProfile,
    } = useAuth();

    const [authMe, setAuthMe] = useState<AuthMeResponse | null>(null);
    const [bootstrapSnapshot, setBootstrapSnapshot] = useState<AuthBootstrapResponse | null>(authBootstrap);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const normalizedSelectedEvents = useMemo(() => {
        const source = userProfile?.selectedEvents;
        if (!Array.isArray(source)) {
            return [];
        }
        return source
            .map((entry: any) => String(
                typeof entry === 'string'
                    ? entry
                    : entry?.id ?? entry?.value ?? entry?.event_id ?? entry?.name ?? '',
            ).trim())
            .filter(Boolean);
    }, [userProfile?.selectedEvents]);

    const loadAdminData = useCallback(async (silent = false) => {
        if (!apiAccessToken) {
            setAuthMe(null);
            setBootstrapSnapshot(authBootstrap);
            setError(null);
            return;
        }

        if (silent) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            setError(null);
            const [meResponse, bootstrapResponse] = await Promise.all([
                getAuthMe(apiAccessToken),
                refreshAuthBootstrap(),
            ]);
            setAuthMe(meResponse);
            setBootstrapSnapshot(bootstrapResponse);
        } catch (err: any) {
            setError(err?.message ?? t('Failed to load admin data.'));
        } finally {
            if (silent) {
                setIsRefreshing(false);
            } else {
                setIsLoading(false);
            }
        }
    }, [apiAccessToken, authBootstrap, refreshAuthBootstrap, t]);

    useFocusEffect(
        useCallback(() => {
            loadAdminData();
        }, [loadAdminData]),
    );

    const openTabScreen = useCallback((tabName: string, screen: string) => {
        const parentNavigation = navigation.getParent?.();
        if (parentNavigation) {
            parentNavigation.navigate(tabName, { screen });
            return;
        }
        navigation.navigate(screen);
    }, [navigation]);

    const actionItems: ActionItem[] = useMemo(() => [
        {
            icon: <DocumentText size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('Hub'),
            subtitle: t('Operational dashboard and activity overview'),
            onPress: () => openTabScreen('Home', 'HubScreen'),
        },
        {
            icon: <Profile2User size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('Manage Profiles'),
            subtitle: t('Open the profile management flow'),
            onPress: () => navigation.navigate('ManageProfiles'),
        },
        {
            icon: <VideoSquare size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('Upload Activity'),
            subtitle: t('Review current and past uploads'),
            onPress: () => openTabScreen('Upload', 'UploadActivityScreen'),
        },
        {
            icon: <SearchNormal1 size={20} color={colors.primaryColor} variant="Linear" />,
            title: t('AI Search'),
            subtitle: t('Jump into the search/admin workflow'),
            onPress: () => navigation.navigate('AISearchScreen'),
        },
    ], [colors.primaryColor, navigation, openTabScreen, t]);

    const activeBootstrap = bootstrapSnapshot ?? authBootstrap;
    const userSummary = activeBootstrap?.user ?? null;

    const renderLabelValueRow = (label: string, value: string | number | null | undefined) => (
        <View style={Styles.helpRow}>
            <View style={{ flex: 1 }}>
                <Text style={Styles.helpLabel}>{label}</Text>
                <Text style={Styles.helpValue}>{value == null || value === '' ? t('Not available') : String(value)}</Text>
            </View>
        </View>
    );

    const renderChipSection = (title: string, items: string[]) => (
        <View style={Styles.helpCard}>
            <Text style={Styles.helpLabel}>{title}</Text>
            <SizeBox height={10} />
            {items.length ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {items.map((item) => (
                        <View
                            key={`${title}-${item}`}
                            style={{
                                borderWidth: 0.5,
                                borderColor: colors.lightGrayColor,
                                borderRadius: 999,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                backgroundColor: colors.cardBackground,
                            }}
                        >
                            <Text style={[Styles.titlesText, { fontSize: 12 }]}>{item}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={Styles.helpValue}>{t('Not available')}</Text>
            )}
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Admin Pane')}</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <View style={[Styles.helpCard, { gap: 12 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                            <Text style={Styles.helpLabel}>{t('Session status')}</Text>
                            <Text style={Styles.helpValue}>
                                {isAuthenticated ? t('Authenticated') : t('Not authenticated')}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[Styles.editActionButton, { minWidth: 108, flexDirection: 'row', gap: 6 }]}
                            onPress={() => loadAdminData(true)}
                            disabled={isRefreshing || isLoading}
                        >
                            {isRefreshing ? (
                                <ActivityIndicator size="small" color={colors.pureWhite} />
                            ) : (
                                <>
                                    <Refresh size={14} color={colors.pureWhite} variant="Linear" />
                                    <Text style={Styles.editActionText}>{t('Refresh')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text style={[Styles.titlesText, { color: colors.subTextColor, lineHeight: 20 }]}>
                        {t('This pane is app-side only for now. If you want real admin access control, the backend still needs an explicit role or permission gate.')}
                    </Text>
                </View>

                {error ? (
                    <>
                        <SizeBox height={16} />
                        <View style={[Styles.helpCard, { borderColor: colors.errorColor || '#D32F2F' }]}>
                            <Text style={[Styles.helpLabel, { color: colors.errorColor || '#D32F2F' }]}>{t('Load error')}</Text>
                            <SizeBox height={6} />
                            <Text style={Styles.helpValue}>{error}</Text>
                        </View>
                    </>
                ) : null}

                {isLoading ? (
                    <>
                        <SizeBox height={24} />
                        <View style={[Styles.helpCard, { alignItems: 'center', justifyContent: 'center', minHeight: 120 }]}>
                            <ActivityIndicator size="small" color={colors.primaryColor} />
                            <SizeBox height={12} />
                            <Text style={Styles.helpLabel}>{t('Loading admin data...')}</Text>
                        </View>
                    </>
                ) : null}

                {!isLoading && !isAuthenticated ? (
                    <>
                        <SizeBox height={24} />
                        <View style={Styles.helpCard}>
                            <Text style={Styles.helpLabel}>{t('Access')}</Text>
                            <SizeBox height={6} />
                            <Text style={Styles.helpValue}>{t('Sign in to use the admin pane.')}</Text>
                        </View>
                    </>
                ) : null}

                {!isLoading && isAuthenticated ? (
                    <>
                        <SizeBox height={24} />
                        <Text style={Styles.sectionTitle}>{t('Quick actions')}</Text>
                        <SizeBox height={16} />
                        {actionItems.map((item, index) => (
                            <React.Fragment key={item.title}>
                                <TouchableOpacity style={[Styles.accountSettingsCard, { height: 'auto', minHeight: 78 }]} onPress={item.onPress}>
                                    <View style={[Styles.accountSettingsLeft, { flex: 1, paddingRight: 16 }]}>
                                        <View style={Styles.accountSettingsIconContainer}>
                                            {item.icon}
                                        </View>
                                        <SizeBox width={16} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={Styles.accountSettingsTitle}>{item.title}</Text>
                                            <SizeBox height={4} />
                                            <Text style={[Styles.titlesText, { color: colors.subTextColor, fontSize: 12, lineHeight: 18 }]}>
                                                {item.subtitle}
                                            </Text>
                                        </View>
                                    </View>
                                    <ArrowRight2 size={22} color={colors.grayColor} variant="Linear" />
                                </TouchableOpacity>
                                {index < actionItems.length - 1 ? <SizeBox height={16} /> : null}
                            </React.Fragment>
                        ))}

                        <SizeBox height={24} />
                        <Text style={Styles.sectionTitle}>{t('Access summary')}</Text>
                        <SizeBox height={16} />
                        <View style={Styles.helpCard}>
                            {renderLabelValueRow(t('Profile ID'), authMe?.profile_id)}
                            <SizeBox height={12} />
                            <View style={Styles.helpDivider} />
                            <SizeBox height={12} />
                            {renderLabelValueRow(t('Auth subject'), authMe?.sub)}
                            <SizeBox height={12} />
                            <View style={Styles.helpDivider} />
                            <SizeBox height={12} />
                            {renderLabelValueRow(t('Remaining AI tokens'), authMe?.remaining_tokens)}
                            <SizeBox height={12} />
                            <View style={Styles.helpDivider} />
                            <SizeBox height={12} />
                            {renderLabelValueRow(t('Permissions count'), authMe?.permissions?.length ?? 0)}
                            <SizeBox height={12} />
                            <View style={Styles.helpDivider} />
                            <SizeBox height={12} />
                            {renderLabelValueRow(t('Event access count'), authMe?.event_ids?.length ?? 0)}
                        </View>

                        <SizeBox height={16} />
                        {renderChipSection(t('Permissions'), authMe?.permissions ?? [])}
                        <SizeBox height={16} />
                        {renderChipSection(t('Scopes'), authMe?.scopes ?? [])}
                        <SizeBox height={16} />
                        {renderChipSection(t('Event IDs'), authMe?.event_ids ?? [])}

                        <SizeBox height={24} />
                        <Text style={Styles.sectionTitle}>{t('Bootstrap summary')}</Text>
                        <SizeBox height={16} />
                        <View style={Styles.helpCard}>
                            {renderLabelValueRow(t('Profiles count'), activeBootstrap?.profiles_count)}
                            <SizeBox height={12} />
                            <View style={Styles.helpDivider} />
                            <SizeBox height={12} />
                            {renderLabelValueRow(t('Needs onboarding'), activeBootstrap?.needs_user_onboarding ? t('Yes') : t('No'))}
                            <SizeBox height={12} />
                            <View style={Styles.helpDivider} />
                            <SizeBox height={12} />
                            {renderLabelValueRow(t('Username'), userSummary?.username)}
                            <SizeBox height={12} />
                            <View style={Styles.helpDivider} />
                            <SizeBox height={12} />
                            {renderLabelValueRow(t('Email'), userSummary?.email)}
                            <SizeBox height={12} />
                            <View style={Styles.helpDivider} />
                            <SizeBox height={12} />
                            {renderLabelValueRow(t('Full name'), userSummary?.full_name)}
                        </View>

                        <SizeBox height={16} />
                        {renderChipSection(t('Missing fields'), activeBootstrap?.missing_user_fields ?? [])}
                        <SizeBox height={16} />
                        {renderChipSection(t('Selected events'), normalizedSelectedEvents)}
                    </>
                ) : null}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default AdminPane;
