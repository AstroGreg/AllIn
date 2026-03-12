import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Notification, ShieldSecurity, Trash } from 'iconsax-react-nativejs';
import { createStyles } from './RightToBeForgottenStyles';
import { useTranslation } from 'react-i18next';
import { deleteRightToBeForgotten, getPrivacySummary, type PrivacySummary } from '../../../services/apiGateway';
import { useAuth } from '../../../context/AuthContext';

const RightToBeForgotten = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { apiAccessToken, logout } = useAuth();

    const [summary, setSummary] = useState<PrivacySummary | null>(null);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const loadSummary = useCallback(async () => {
        if (!apiAccessToken) {
            setError(t('privacyAuthRequired'));
            setSummary(null);
            setWarnings([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await getPrivacySummary(apiAccessToken);
            setSummary(response.summary ?? null);
            setWarnings(Array.isArray(response.warnings) ? response.warnings : []);
        } catch (err: any) {
            setError(String(err?.message ?? t('privacySummaryFailed')));
        } finally {
            setLoading(false);
        }
    }, [apiAccessToken, t]);

    useFocusEffect(
        useCallback(() => {
            void loadSummary();
        }, [loadSummary]),
    );

    const stats = useMemo(() => {
        if (!summary) return [];
        return [
            { key: 'records', label: t('privacyTotalRecords'), value: String(summary.total_records ?? 0) },
            { key: 'profiles', label: t('privacyProfiles'), value: String(summary.profile_records ?? 0) },
            { key: 'uploads', label: t('privacyUploads'), value: String(summary.uploaded_media ?? 0) },
            { key: 'faces', label: t('privacyFaces'), value: String(summary.face_templates ?? 0) },
        ];
    }, [summary, t]);

    const sections = useMemo(() => {
        if (!summary) return [];
        return [
            {
                key: 'identity',
                title: t('privacyIdentityTitle'),
                description: t('privacyIdentityDescription'),
                value: summary.user_records + summary.profile_records,
            },
            {
                key: 'face',
                title: t('privacyFaceTitle'),
                description: t('privacyFaceDescription'),
                value: summary.face_templates + summary.appearances + summary.consent_records,
            },
            {
                key: 'content',
                title: t('privacyContentTitle'),
                description: t('privacyContentDescription'),
                value: summary.uploaded_media + summary.posts + summary.timeline_entries,
            },
            {
                key: 'connections',
                title: t('privacyConnectionsTitle'),
                description: t('privacyConnectionsDescription'),
                value: summary.groups_owned + summary.group_memberships + summary.follow_edges,
            },
        ];
    }, [summary, t]);

    const canConfirmDelete = confirmText.trim().toUpperCase() === 'DELETE';

    const handleDelete = useCallback(async () => {
        if (!apiAccessToken || deleting || !canConfirmDelete) return;
        setDeleting(true);
        setError(null);
        try {
            await deleteRightToBeForgotten(apiAccessToken, { confirmation: 'DELETE' });
            setConfirmVisible(false);
            setConfirmText('');
            await logout();
            const rootNav = navigation.getParent?.()?.getParent?.() ?? navigation;
            rootNav.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'LoginScreen' }],
                }),
            );
        } catch (err: any) {
            setError(String(err?.message ?? t('privacyDeleteFailed')));
        } finally {
            setDeleting(false);
        }
    }, [apiAccessToken, canConfirmDelete, deleting, logout, navigation, t]);

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('rightToBeForgotten')}</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <View style={styles.infoIconContainer}>
                            <ShieldSecurity size={24} color={colors.primaryColor} variant="Linear" />
                        </View>
                        <Text style={styles.infoTitle}>{t('privacySensitiveDataTitle')}</Text>
                    </View>
                    <Text style={styles.infoDescription}>{t('privacySensitiveDataDescription')}</Text>
                </View>

                <SizeBox height={16} />

                {loading ? (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator color={colors.primaryColor} />
                        <Text style={styles.loadingText}>{t('privacyLoading')}</Text>
                    </View>
                ) : null}

                {error ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>{t('privacySummaryFailed')}</Text>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {stats.length > 0 ? (
                    <View style={styles.statsGrid}>
                        {stats.map((item) => (
                            <View key={item.key} style={styles.statCard}>
                                <Text style={styles.statValue}>{item.value}</Text>
                                <Text style={styles.statLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                ) : null}

                {sections.map((section) => (
                    <View key={section.key} style={styles.sectionCard}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <Text style={styles.sectionCount}>{section.value}</Text>
                        </View>
                        <Text style={styles.sectionDescription}>{section.description}</Text>
                    </View>
                ))}

                {warnings.map((warning, index) => (
                    <View key={`${warning}-${index}`} style={styles.warningCard}>
                        <Text style={styles.warningText}>{warning}</Text>
                    </View>
                ))}

                <TouchableOpacity style={styles.secondaryButton} onPress={() => void loadSummary()} disabled={loading || deleting}>
                    <Text style={styles.secondaryButtonText}>{t('privacyReloadSummary')}</Text>
                </TouchableOpacity>

                <SizeBox height={12} />

                <TouchableOpacity style={styles.dangerButton} onPress={() => setConfirmVisible(true)} disabled={loading || deleting || !summary}>
                    <Trash size={20} color={colors.pureWhite} variant="Linear" />
                    <Text style={styles.dangerButtonText}>{t('privacyDeleteButton')}</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{t('privacyDeleteConfirmTitle')}</Text>
                        <Text style={styles.modalDescription}>{t('privacyDeleteConfirmDescription')}</Text>
                        <Text style={styles.modalHint}>{t('privacyTypeDeleteHint')}</Text>
                        <TextInput
                            value={confirmText}
                            onChangeText={setConfirmText}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            placeholder="DELETE"
                            placeholderTextColor={colors.grayColor}
                            style={styles.confirmInput}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalSecondaryButton}
                                onPress={() => {
                                    if (deleting) return;
                                    setConfirmVisible(false);
                                    setConfirmText('');
                                }}
                            >
                                <Text style={styles.modalSecondaryButtonText}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalDangerButton, !canConfirmDelete && styles.modalDangerButtonDisabled]}
                                onPress={() => void handleDelete()}
                                disabled={!canConfirmDelete || deleting}
                            >
                                <Text style={styles.modalDangerButtonText}>{deleting ? t('privacyDeleting') : t('privacyDeletePermanently')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default RightToBeForgotten;
