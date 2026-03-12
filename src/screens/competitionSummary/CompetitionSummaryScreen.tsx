import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';
import { createStyles } from './CompetitionSummaryScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import {
    ApiError,
    getProfileSummary,
    grantFaceRecognitionConsent,
    subscribeToEvent,
    updateProfileSummary,
} from '../../services/apiGateway';

type SubscriptionReviewPayload = {
    eventId: string;
    eventTitle: string;
    eventDate?: string | null;
    eventLocation?: string | null;
    eventTypeLabel?: string | null;
    organizingClub?: string | null;
    competitionYear?: string | null;
    isTrackCompetition?: boolean;
    chestNumber?: string | null;
    useFaceRecognition?: boolean;
    hasFaceEnrollment?: boolean;
    faceConsentGranted?: boolean;
    disciplineIds?: string[];
    disciplineLabels?: string[];
    categoryLabels?: string[];
};

const normalizeChestByYear = (raw: any): Record<string, string> => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const out: Record<string, string> = {};
    for (const [year, chest] of Object.entries(raw as Record<string, unknown>)) {
        const safeYear = String(year ?? '').trim();
        const safeChest = String(chest ?? '').trim();
        if (!/^\d{4}$/.test(safeYear)) continue;
        if (!/^\d+$/.test(safeChest)) continue;
        out[safeYear] = safeChest;
    }
    return out;
};

const EventSummaryScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { t } = useTranslation();
    const { apiAccessToken, userProfile } = useAuth();
    const { refresh: refreshSubscribed } = useEvents();
    const subscription = (route?.params?.subscription ?? null) as SubscriptionReviewPayload | null;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [warningText, setWarningText] = useState<string | null>(null);
    const [showSuccessSheet, setShowSuccessSheet] = useState(false);

    const isSubscriptionFlow = Boolean(subscription?.eventId);
    const eventTitle = String(subscription?.eventTitle ?? route?.params?.event?.title ?? t('Competition'));
    const eventDate = String(subscription?.eventDate ?? route?.params?.event?.date ?? '').trim();
    const eventLocation = String(subscription?.eventLocation ?? route?.params?.event?.location ?? '').trim();
    const eventTypeLabel = String(subscription?.eventTypeLabel ?? '').trim();
    const organizingClub = String(subscription?.organizingClub ?? '').trim();
    const competitionYear =
        String(subscription?.competitionYear ?? new Date().getFullYear()).trim() || String(new Date().getFullYear());
    const hasFaceEnrollment = Boolean(subscription?.hasFaceEnrollment);
    const faceConsentGranted = Boolean(subscription?.faceConsentGranted);
    const wantsFaceRecognition = Boolean(subscription?.useFaceRecognition) && hasFaceEnrollment;
    const isTrackCompetition = Boolean(subscription?.isTrackCompetition);
    const chestNumber = String(subscription?.chestNumber ?? '').trim();
    const selectedDisciplineIds = Array.isArray(subscription?.disciplineIds) ? subscription!.disciplineIds!.map((value) => String(value).trim()).filter(Boolean) : [];
    const selectedDisciplineLabels = Array.isArray(subscription?.disciplineLabels) ? subscription!.disciplineLabels!.map((value) => String(value).trim()).filter(Boolean) : [];
    const selectedCategoryLabels = Array.isArray(subscription?.categoryLabels) ? subscription!.categoryLabels!.map((value) => String(value).trim()).filter(Boolean) : ['All'];

    const metaRows = useMemo(() => {
        return [
            { label: t('Event name'), value: eventTitle },
            { label: t('Date'), value: eventDate || '—' },
            { label: t('Location'), value: eventLocation || '—' },
            ...(eventTypeLabel ? [{ label: t('Event type'), value: eventTypeLabel }] : []),
            ...(organizingClub ? [{ label: t('Official club'), value: organizingClub }] : []),
        ];
    }, [eventDate, eventLocation, eventTitle, eventTypeLabel, organizingClub, t]);

    const subscriptionRows = useMemo(() => {
        const rows = [];
        if (isTrackCompetition) {
            rows.push({
                label: t('Chest number'),
                value: chestNumber ? `${competitionYear} · ${chestNumber}` : t('Not set'),
            });
        }
        rows.push({
            label: t('Disciplines'),
            value: selectedDisciplineLabels.length > 0 ? selectedDisciplineLabels.join(', ') : t('Not set'),
        });
        rows.push({
            label: t('Category'),
            value: selectedCategoryLabels.length > 0 ? selectedCategoryLabels.join(', ') : t('All'),
        });
        rows.push({
            label: t('Face'),
            value: !hasFaceEnrollment
                ? t('Face: enrollment required.')
                : !wantsFaceRecognition
                    ? t('Disabled')
                    : faceConsentGranted
                        ? t('Enabled')
                        : t('Face permission will be requested on confirm.'),
        });
        rows.push({
            label: t('Notifications'),
            value: t('This event only'),
        });
        return rows;
    }, [
        chestNumber,
        competitionYear,
        faceConsentGranted,
        hasFaceEnrollment,
        isTrackCompetition,
        selectedCategoryLabels,
        selectedDisciplineLabels,
        t,
        wantsFaceRecognition,
    ]);

    const handleConfirm = useCallback(async () => {
        if (!apiAccessToken || !subscription?.eventId || isSubmitting) return;
        setIsSubmitting(true);
        setErrorText(null);
        setWarningText(null);
        try {
            await subscribeToEvent(apiAccessToken, subscription.eventId, {
                discipline_ids: selectedDisciplineIds,
                category_labels: selectedCategoryLabels,
                chest_number: isTrackCompetition && chestNumber ? chestNumber : null,
                face_recognition_enabled: wantsFaceRecognition,
            });
            const warnings: string[] = [];

            if (isTrackCompetition && /^\d+$/.test(chestNumber)) {
                try {
                    const summary = await getProfileSummary(apiAccessToken);
                    const existing = normalizeChestByYear(
                        summary?.profile?.chest_numbers_by_year ?? userProfile?.chestNumbersByYear ?? {},
                    );
                    if (existing[competitionYear] !== chestNumber) {
                        await updateProfileSummary(apiAccessToken, {
                            chestNumbersByYear: {
                                ...Object.fromEntries(
                                    Object.entries(existing).map(([year, value]) => [year, Number(value)]),
                                ),
                                [competitionYear]: Number(chestNumber),
                            },
                        });
                    }
                } catch (e: any) {
                    warnings.push(String(e?.message ?? t('Chest number could not be saved.')));
                }
            }

            if (wantsFaceRecognition && !faceConsentGranted) {
                try {
                    await grantFaceRecognitionConsent(apiAccessToken);
                } catch (e: any) {
                    warnings.push(String(e?.message ?? t('Face recognition permission could not be updated.')));
                }
            }

            await refreshSubscribed();
            setWarningText(warnings.join(' ').trim() || null);
            setShowSuccessSheet(true);
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [
        apiAccessToken,
        chestNumber,
        competitionYear,
        faceConsentGranted,
        isSubmitting,
        isTrackCompetition,
        refreshSubscribed,
        subscription?.eventId,
        selectedCategoryLabels,
        selectedDisciplineIds,
        t,
        userProfile?.chestNumbersByYear,
        wantsFaceRecognition,
    ]);

    const closeSuccess = useCallback(() => {
        setShowSuccessSheet(false);
        navigation.goBack();
    }, [navigation]);

    if (!isSubscriptionFlow) {
        return (
            <View style={styles.mainContainer}>
                <SizeBox height={insets.top} />
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('Summary')}</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>{t('Summary')}</Text>
                    <Text style={styles.emptyStateBody}>{t('Nothing to review here yet.')}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Summary')}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>{t('Event details')}</Text>
                <SizeBox height={16} />

                <View style={styles.detailsCard}>
                    {metaRows.map((row, index) => (
                        <View key={`${row.label}-${index}`}>
                            {index > 0 ? <View style={styles.divider} /> : null}
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{row.label}</Text>
                                <Text style={styles.detailValue}>{row.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <SizeBox height={24} />

                <Text style={styles.sectionTitle}>{t('Personal details')}</Text>
                <SizeBox height={16} />

                <View style={styles.detailsCard}>
                    {subscriptionRows.map((row, index) => (
                        <View key={`${row.label}-${index}`}>
                            {index > 0 ? <View style={styles.divider} /> : null}
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{row.label}</Text>
                                <Text style={styles.detailValue}>{row.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {errorText ? (
                    <>
                        <SizeBox height={16} />
                        <Text style={styles.errorText}>{errorText}</Text>
                    </>
                ) : null}

                <SizeBox height={40} />

                <View style={styles.bottomButtons}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <ActivityIndicator color={colors.pureWhite} />
                        ) : (
                            <>
                                <Text style={styles.confirmButtonText}>{t('Subscribe')}</Text>
                                <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
            </ScrollView>

            <Modal
                visible={showSuccessSheet}
                transparent
                animationType="slide"
                onRequestClose={closeSuccess}
            >
                <TouchableOpacity style={styles.feedbackOverlay} activeOpacity={1} onPress={closeSuccess}>
                    <TouchableOpacity style={styles.feedbackSheet} activeOpacity={1}>
                        <Text style={styles.feedbackTitle}>{t('Subscribed')}</Text>
                        <Text style={styles.feedbackBody}>
                            {t('Competition updates are enabled for this event.')}
                        </Text>
                        {warningText ? <Text style={styles.feedbackBody}>{warningText}</Text> : null}
                        <TouchableOpacity style={styles.feedbackPrimaryButton} onPress={closeSuccess}>
                            <Text style={styles.feedbackPrimaryButtonText}>{t('Done')}</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default EventSummaryScreen;
