var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Trash } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import SizeBox from '../../constants/SizeBox';
import { createStyles } from './UploadActivityScreenStyles';
import { calculateUploadProgressState, listUploadSessions, removeUploadSession, } from '../../services/uploadSessions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
const UploadActivityScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { t } = useTranslation();
    const [sessions, setSessions] = useState([]);
    const load = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield listUploadSessions();
        setSessions(data);
    }), []);
    useEffect(() => {
        load();
        const tmr = setInterval(load, 2500);
        return () => clearInterval(tmr);
    }, [load]);
    const open = useCallback((s) => {
        var _a;
        navigation.navigate('UploadProgressScreen', {
            competition: { id: s.competitionId },
            anonymous: s.anonymous,
            watermarkText: (_a = s.watermarkText) !== null && _a !== void 0 ? _a : '',
            sessionId: s.id,
            autoStart: false,
        });
    }, [navigation]);
    const labelFor = useCallback((s) => {
        if (s.phase === 'processing')
            return t('Processing');
        if (s.phase === 'done')
            return t('Done');
        if (s.phase === 'failed')
            return t('Failed');
        return t('Starting upload');
    }, [t]);
    const progressFor = useCallback((s) => {
        return calculateUploadProgressState(s).overallProgress;
    }, []);
    const metaFor = useCallback((s) => {
        const state = calculateUploadProgressState(s);
        if (s.phase === 'processing') {
            return `${state.processingReady}/${state.processingTotal} ${t('ready')} • ${state.uploaded}/${state.total} ${t('uploaded')}`;
        }
        if (s.phase === 'done') {
            return `${state.total}/${state.total} ${t('ready')}`;
        }
        return `${state.uploaded}/${state.total} ${t('uploaded')}`;
    }, [t]);
    const headerRight = useMemo(() => {
        const anyDone = sessions.some((s) => s.phase === 'done' || s.phase === 'failed');
        if (!anyDone)
            return _jsx(View, { style: styles.headerBtn });
        return (_jsx(TouchableOpacity, Object.assign({ style: styles.headerBtn, onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                const done = sessions.filter((s) => s.phase === 'done' || s.phase === 'failed');
                for (const s of done) {
                    yield removeUploadSession(s.id);
                }
                load();
            }), activeOpacity: 0.8 }, { children: _jsx(Trash, { size: 20, color: colors.primaryColor, variant: "Linear" }) })));
    }, [colors.primaryColor, load, sessions, styles.headerBtn]);
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerBtn, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Upload activity') })), headerRight] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: [styles.content, { paddingBottom: insets.bottom + 24 }] }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: [styles.card, { marginBottom: 16 }], activeOpacity: 0.9, onPress: () => {
                            Alert.alert(t('Reset local upload data?'), t('This clears upload drafts, upload sessions, and cached local upload files on this device.'), [
                                { text: t('Cancel'), style: 'cancel' },
                                {
                                    text: t('Reset'),
                                    style: 'destructive',
                                    onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                        try {
                                            const keys = yield AsyncStorage.getAllKeys();
                                            const toRemove = keys.filter((k) => k.startsWith('@upload_assets_') ||
                                                k.startsWith('@upload_counts_') ||
                                                k.startsWith('@upload_session_') ||
                                                k.startsWith('@upload_activity_') ||
                                                k === '@upload_sessions_v1');
                                            if (toRemove.length > 0)
                                                yield AsyncStorage.multiRemove(toRemove);
                                        }
                                        catch (_a) { }
                                        try {
                                            const dir = `${RNFS.DocumentDirectoryPath}/allin_uploads`;
                                            const exists = yield RNFS.exists(dir);
                                            if (exists) {
                                                yield RNFS.unlink(dir);
                                            }
                                        }
                                        catch (_b) { }
                                        load();
                                    }),
                                },
                            ]);
                        } }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: t('Reset') })), _jsx(Text, Object.assign({ style: styles.meta }, { children: t('Clear cached upload drafts and sessions') }))] })), sessions.length === 0 ? (_jsx(Text, Object.assign({ style: styles.emptyText }, { children: t('No uploads yet.') }))) : null, sessions.map((s) => {
                        const p = progressFor(s);
                        return (_jsxs(TouchableOpacity, Object.assign({ style: styles.card, activeOpacity: 0.85, onPress: () => open(s) }, { children: [_jsxs(View, Object.assign({ style: styles.rowTop }, { children: [_jsxs(View, Object.assign({ style: { flex: 1, paddingRight: 12 } }, { children: [_jsxs(Text, Object.assign({ style: styles.title, numberOfLines: 1 }, { children: [t('Upload'), " \u2022 ", String(s.competitionId).slice(0, 8)] })), _jsx(Text, Object.assign({ style: styles.meta, numberOfLines: 1 }, { children: metaFor(s) }))] })), _jsx(View, Object.assign({ style: styles.pill }, { children: _jsx(Text, Object.assign({ style: styles.pillText }, { children: labelFor(s) })) }))] })), _jsx(View, Object.assign({ style: styles.barTrack }, { children: _jsx(View, { style: [styles.barFill, { width: `${Math.round(p * 100)}%` }] }) })), _jsxs(View, Object.assign({ style: styles.actionsRow }, { children: [_jsx(Text, Object.assign({ style: styles.meta }, { children: new Date(s.updatedAt).toLocaleString() })), _jsx(TouchableOpacity, Object.assign({ onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                                yield removeUploadSession(s.id);
                                                load();
                                            }) }, { children: _jsx(Text, Object.assign({ style: styles.actionText }, { children: t('Delete') })) }))] }))] }), s.id));
                    })] }))] })));
};
export default UploadActivityScreen;
