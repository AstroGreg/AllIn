var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';
import { createStyles } from './CompetitionSummaryScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { ApiError, getProfileSummary, grantFaceRecognitionConsent, subscribeToEvent, updateProfileSummary, } from '../../services/apiGateway';
const normalizeChestByYear = (raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        return {};
    const out = {};
    for (const [year, chest] of Object.entries(raw)) {
        const safeYear = String(year !== null && year !== void 0 ? year : '').trim();
        const safeChest = String(chest !== null && chest !== void 0 ? chest : '').trim();
        if (!/^\d{4}$/.test(safeYear))
            continue;
        if (!/^\d+$/.test(safeChest))
            continue;
        out[safeYear] = safeChest;
    }
    return out;
};
const EventSummaryScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { t } = useTranslation();
    const { apiAccessToken, userProfile } = useAuth();
    const { refresh: refreshSubscribed } = useEvents();
    const subscription = ((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.subscription) !== null && _b !== void 0 ? _b : null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorText, setErrorText] = useState(null);
    const [warningText, setWarningText] = useState(null);
    const [showSuccessSheet, setShowSuccessSheet] = useState(false);
    const isSubscriptionFlow = Boolean(subscription === null || subscription === void 0 ? void 0 : subscription.eventId);
    const eventTitle = String((_f = (_c = subscription === null || subscription === void 0 ? void 0 : subscription.eventTitle) !== null && _c !== void 0 ? _c : (_e = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.title) !== null && _f !== void 0 ? _f : t('Competition'));
    const eventDate = String((_k = (_g = subscription === null || subscription === void 0 ? void 0 : subscription.eventDate) !== null && _g !== void 0 ? _g : (_j = (_h = route === null || route === void 0 ? void 0 : route.params) === null || _h === void 0 ? void 0 : _h.event) === null || _j === void 0 ? void 0 : _j.date) !== null && _k !== void 0 ? _k : '').trim();
    const eventLocation = String((_p = (_l = subscription === null || subscription === void 0 ? void 0 : subscription.eventLocation) !== null && _l !== void 0 ? _l : (_o = (_m = route === null || route === void 0 ? void 0 : route.params) === null || _m === void 0 ? void 0 : _m.event) === null || _o === void 0 ? void 0 : _o.location) !== null && _p !== void 0 ? _p : '').trim();
    const eventTypeLabel = String((_q = subscription === null || subscription === void 0 ? void 0 : subscription.eventTypeLabel) !== null && _q !== void 0 ? _q : '').trim();
    const organizingClub = String((_r = subscription === null || subscription === void 0 ? void 0 : subscription.organizingClub) !== null && _r !== void 0 ? _r : '').trim();
    const competitionYear = String((_s = subscription === null || subscription === void 0 ? void 0 : subscription.competitionYear) !== null && _s !== void 0 ? _s : new Date().getFullYear()).trim() || String(new Date().getFullYear());
    const hasFaceEnrollment = Boolean(subscription === null || subscription === void 0 ? void 0 : subscription.hasFaceEnrollment);
    const faceConsentGranted = Boolean(subscription === null || subscription === void 0 ? void 0 : subscription.faceConsentGranted);
    const wantsFaceRecognition = Boolean(subscription === null || subscription === void 0 ? void 0 : subscription.useFaceRecognition) && hasFaceEnrollment;
    const isTrackCompetition = Boolean(subscription === null || subscription === void 0 ? void 0 : subscription.isTrackCompetition);
    const chestNumber = String((_t = subscription === null || subscription === void 0 ? void 0 : subscription.chestNumber) !== null && _t !== void 0 ? _t : '').trim();
    const selectedDisciplineIds = Array.isArray(subscription === null || subscription === void 0 ? void 0 : subscription.disciplineIds) ? subscription.disciplineIds.map((value) => String(value).trim()).filter(Boolean) : [];
    const selectedDisciplineLabels = Array.isArray(subscription === null || subscription === void 0 ? void 0 : subscription.disciplineLabels) ? subscription.disciplineLabels.map((value) => String(value).trim()).filter(Boolean) : [];
    const selectedCategoryLabels = Array.isArray(subscription === null || subscription === void 0 ? void 0 : subscription.categoryLabels) ? subscription.categoryLabels.map((value) => String(value).trim()).filter(Boolean) : ['All'];
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
        rows.push({
            label: t('Chest number'),
            value: chestNumber ? `${competitionYear} · ${chestNumber}` : t('Not set'),
        });
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
        selectedCategoryLabels,
        selectedDisciplineLabels,
        t,
        wantsFaceRecognition,
    ]);
    const handleConfirm = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _u, _v, _w, _x, _y, _z;
        if (!apiAccessToken || !(subscription === null || subscription === void 0 ? void 0 : subscription.eventId) || isSubmitting)
            return;
        setIsSubmitting(true);
        setErrorText(null);
        setWarningText(null);
        try {
            yield subscribeToEvent(apiAccessToken, subscription.eventId, {
                discipline_ids: selectedDisciplineIds,
                category_labels: selectedCategoryLabels,
                chest_number: chestNumber || null,
                face_recognition_enabled: wantsFaceRecognition,
            });
            const warnings = [];
            if (/^\d+$/.test(chestNumber)) {
                try {
                    const summary = yield getProfileSummary(apiAccessToken);
                    const existing = normalizeChestByYear((_w = (_v = (_u = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _u === void 0 ? void 0 : _u.chest_numbers_by_year) !== null && _v !== void 0 ? _v : userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear) !== null && _w !== void 0 ? _w : {});
                    if (existing[competitionYear] !== chestNumber) {
                        yield updateProfileSummary(apiAccessToken, {
                            chestNumbersByYear: Object.assign(Object.assign({}, Object.fromEntries(Object.entries(existing).map(([year, value]) => [year, Number(value)]))), { [competitionYear]: Number(chestNumber) }),
                        });
                    }
                }
                catch (e) {
                    warnings.push(String((_x = e === null || e === void 0 ? void 0 : e.message) !== null && _x !== void 0 ? _x : t('Chest number could not be saved.')));
                }
            }
            if (wantsFaceRecognition && !faceConsentGranted) {
                try {
                    yield grantFaceRecognitionConsent(apiAccessToken);
                }
                catch (e) {
                    warnings.push(String((_y = e === null || e === void 0 ? void 0 : e.message) !== null && _y !== void 0 ? _y : t('Face recognition permission could not be updated.')));
                }
            }
            yield refreshSubscribed();
            setWarningText(warnings.join(' ').trim() || null);
            setShowSuccessSheet(true);
        }
        catch (e) {
            const message = e instanceof ApiError ? e.message : String((_z = e === null || e === void 0 ? void 0 : e.message) !== null && _z !== void 0 ? _z : e);
            setErrorText(message);
        }
        finally {
            setIsSubmitting(false);
        }
    }), [
        apiAccessToken,
        chestNumber,
        competitionYear,
        faceConsentGranted,
        isSubmitting,
        refreshSubscribed,
        subscription === null || subscription === void 0 ? void 0 : subscription.eventId,
        selectedCategoryLabels,
        selectedDisciplineIds,
        t,
        userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear,
        wantsFaceRecognition,
    ]);
    const closeSuccess = useCallback(() => {
        setShowSuccessSheet(false);
        navigation.goBack();
    }, [navigation]);
    if (!isSubscriptionFlow) {
        return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Summary') })), _jsx(View, { style: styles.headerSpacer })] })), _jsxs(View, Object.assign({ style: styles.emptyState }, { children: [_jsx(Text, Object.assign({ style: styles.emptyStateTitle }, { children: t('Summary') })), _jsx(Text, Object.assign({ style: styles.emptyStateBody }, { children: t('Nothing to review here yet.') }))] }))] })));
    }
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Summary') })), _jsx(View, { style: styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Event details') })), _jsx(SizeBox, { height: 16 }), _jsx(View, Object.assign({ style: styles.detailsCard }, { children: metaRows.map((row, index) => (_jsxs(View, { children: [index > 0 ? _jsx(View, { style: styles.divider }) : null, _jsxs(View, Object.assign({ style: styles.detailRow }, { children: [_jsx(Text, Object.assign({ style: styles.detailLabel }, { children: row.label })), _jsx(Text, Object.assign({ style: styles.detailValue }, { children: row.value }))] }))] }, `${row.label}-${index}`))) })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Personal details') })), _jsx(SizeBox, { height: 16 }), _jsx(View, Object.assign({ style: styles.detailsCard }, { children: subscriptionRows.map((row, index) => (_jsxs(View, { children: [index > 0 ? _jsx(View, { style: styles.divider }) : null, _jsxs(View, Object.assign({ style: styles.detailRow }, { children: [_jsx(Text, Object.assign({ style: styles.detailLabel }, { children: row.label })), _jsx(Text, Object.assign({ style: styles.detailValue }, { children: row.value }))] }))] }, `${row.label}-${index}`))) })), errorText ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: styles.errorText }, { children: errorText }))] })) : null, _jsx(SizeBox, { height: 40 }), _jsxs(View, Object.assign({ style: styles.bottomButtons }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.cancelButton, onPress: () => navigation.goBack() }, { children: _jsx(Text, Object.assign({ style: styles.cancelButtonText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: styles.confirmButton, onPress: handleConfirm, disabled: isSubmitting }, { children: isSubmitting ? (_jsx(ActivityIndicator, { color: colors.pureWhite })) : (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: styles.confirmButtonText }, { children: t('Subscribe') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] })) }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom : 20 })] })), _jsx(Modal, Object.assign({ visible: showSuccessSheet, transparent: true, animationType: "slide", onRequestClose: closeSuccess }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.feedbackOverlay, activeOpacity: 1, onPress: closeSuccess }, { children: _jsxs(TouchableOpacity, Object.assign({ style: styles.feedbackSheet, activeOpacity: 1 }, { children: [_jsx(Text, Object.assign({ style: styles.feedbackTitle }, { children: t('Subscribed') })), _jsx(Text, Object.assign({ style: styles.feedbackBody }, { children: t('Competition updates are enabled for this event.') })), warningText ? _jsx(Text, Object.assign({ style: styles.feedbackBody }, { children: warningText })) : null, _jsx(TouchableOpacity, Object.assign({ style: styles.feedbackPrimaryButton, onPress: closeSuccess }, { children: _jsx(Text, Object.assign({ style: styles.feedbackPrimaryButtonText }, { children: t('Done') })) }))] })) })) }))] })));
};
export default EventSummaryScreen;
