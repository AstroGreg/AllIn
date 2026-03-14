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
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { useEffect, useState, useCallback, useMemo } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from '../SearchStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import { useAuth } from '../../../context/AuthContext';
import { getCompetitionPublicMedia, getHubAppearanceMedia } from '../../../services/apiGateway';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const PAGE_SIZE = 60;
const AllPhotosOfEvents = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const eventName = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.eventName) || 'Event';
    const eventId = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.eventId;
    const competitionId = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.competitionId;
    const appearanceOnly = Boolean((_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.appearanceOnly);
    const disciplineId = (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.disciplineId;
    const checkpointId = (_g = (_f = route === null || route === void 0 ? void 0 : route.params) === null || _f === void 0 ? void 0 : _f.checkpointId) !== null && _g !== void 0 ? _g : (_j = (_h = route === null || route === void 0 ? void 0 : route.params) === null || _h === void 0 ? void 0 : _h.checkpoint) === null || _j === void 0 ? void 0 : _j.id;
    const division = (_k = route === null || route === void 0 ? void 0 : route.params) === null || _k === void 0 ? void 0 : _k.division;
    const gender = (_l = route === null || route === void 0 ? void 0 : route.params) === null || _l === void 0 ? void 0 : _l.gender;
    const { apiAccessToken } = useAuth();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const localStyles = useMemo(() => StyleSheet.create({
        gridWrap: {
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 20,
        },
        columnWrap: {
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        mediaTile: {
            borderRadius: 14,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.cardBackground,
        },
        mediaImage: {
            width: '100%',
        },
        mediaFallback: {
            width: '100%',
            backgroundColor: colors.secondaryColor,
        },
        mediaMeta: {
            paddingHorizontal: 10,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: colors.lightGrayColor,
        },
        mediaMetaPrimary: Object.assign(Object.assign({}, styles.subText), { color: colors.mainTextColor }),
        mediaMetaSecondary: Object.assign(Object.assign({}, styles.subText), { color: colors.subTextColor, marginTop: 4 }),
        headerWrap: {
            marginBottom: 16,
        },
        subtitle: Object.assign(Object.assign({}, styles.filterText), { marginTop: 6 }),
        helper: Object.assign(Object.assign({}, styles.subText), { marginTop: 6, color: colors.subTextColor }),
        emptyBox: {
            borderRadius: 12,
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor,
            backgroundColor: colors.cardBackground,
            paddingVertical: 24,
            paddingHorizontal: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
    }), [colors, styles.filterText, styles.subText]);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const targetCompetitionId = competitionId !== null && competitionId !== void 0 ? competitionId : eventId;
    const tileWidth = useMemo(() => Math.max(140, Math.floor((width - 52) / 2)), [width]);
    const tileHeight = useMemo(() => Math.round(tileWidth * 1.15), [tileWidth]);
    const helperCopy = useMemo(() => {
        if (checkpointId)
            return t('Shows photos tagged to this checkpoint.');
        if (disciplineId)
            return t('Shows photos tagged to this discipline.');
        return t('Includes all competition photos, including untagged uploads.');
    }, [checkpointId, disciplineId, t]);
    const emptyCopy = useMemo(() => {
        if (checkpointId)
            return t('No photos found for this checkpoint yet.');
        if (disciplineId)
            return t('No photos found for this discipline yet.');
        return t('No photos found for this competition yet.');
    }, [checkpointId, disciplineId, t]);
    const isSignedUrl = useCallback((value) => {
        if (!value)
            return false;
        const lower = String(value).toLowerCase();
        return (lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp='));
    }, []);
    const withAccessToken = useCallback((value) => {
        if (!value)
            return undefined;
        if (!apiAccessToken)
            return value;
        if (isSignedUrl(value))
            return value;
        if (value.includes('access_token='))
            return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);
    const isVideoMedia = useCallback((item) => {
        var _a;
        const mediaType = String((_a = item === null || item === void 0 ? void 0 : item.type) !== null && _a !== void 0 ? _a : '').toLowerCase();
        if (mediaType === 'video')
            return true;
        if (mediaType === 'image' || mediaType === 'photo')
            return false;
        if (item === null || item === void 0 ? void 0 : item.hls_manifest_path)
            return true;
        const hasVideoMime = Array.isArray(item === null || item === void 0 ? void 0 : item.assets)
            && item.assets.some((asset) => { var _a; return String((_a = asset === null || asset === void 0 ? void 0 : asset.mime_type) !== null && _a !== void 0 ? _a : '').toLowerCase().startsWith('video/'); });
        if (hasVideoMime)
            return true;
        const candidates = [item === null || item === void 0 ? void 0 : item.full_url, item === null || item === void 0 ? void 0 : item.original_url, item === null || item === void 0 ? void 0 : item.raw_url, item === null || item === void 0 ? void 0 : item.preview_url]
            .filter(Boolean)
            .map((value) => String(value));
        return candidates.some((value) => /\.(mp4|mov|m4v|webm|m3u8)(\?|$)/i.test(value));
    }, []);
    const formatDate = (value) => {
        if (!value)
            return '—';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime()))
            return value;
        return parsed.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };
    const mergeItems = useCallback((current, incoming) => {
        const seen = new Set();
        return [...current, ...incoming].filter((item) => {
            var _a;
            const key = String((_a = item === null || item === void 0 ? void 0 : item.media_id) !== null && _a !== void 0 ? _a : '');
            if (!key || seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }, []);
    const loadPage = useCallback((offset, append) => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken)
            return;
        if (append) {
            setIsFetchingMore(true);
        }
        else if (offset === 0 && items.length > 0) {
            setIsRefreshing(true);
        }
        else {
            setIsLoading(true);
        }
        try {
            let list = [];
            if (appearanceOnly && (eventId || competitionId)) {
                const res = yield getHubAppearanceMedia(apiAccessToken, String(eventId !== null && eventId !== void 0 ? eventId : competitionId), {
                    include_original: false,
                    limit: PAGE_SIZE,
                    offset,
                });
                list = Array.isArray(res === null || res === void 0 ? void 0 : res.results) ? res.results : [];
            }
            else if (targetCompetitionId) {
                const res = yield getCompetitionPublicMedia(apiAccessToken, String(targetCompetitionId), {
                    type: 'image',
                    discipline_id: disciplineId ? String(disciplineId) : undefined,
                    checkpoint_id: checkpointId ? String(checkpointId) : undefined,
                    limit: PAGE_SIZE,
                    offset,
                    include_original: false,
                });
                list = Array.isArray(res) ? res : [];
            }
            const filtered = list.filter((item) => !isVideoMedia(item));
            setItems((prev) => append ? mergeItems(prev, filtered) : filtered);
            setHasMore(filtered.length === PAGE_SIZE);
        }
        catch (_m) {
            if (!append) {
                setItems([]);
                setHasMore(false);
            }
        }
        finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsFetchingMore(false);
        }
    }), [apiAccessToken, appearanceOnly, checkpointId, competitionId, disciplineId, eventId, isVideoMedia, items.length, mergeItems, targetCompetitionId]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken)
            return () => { };
        const load = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield loadPage(0, false);
            }
            finally {
                if (!mounted)
                    return;
            }
        });
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, loadPage]);
    const data = useMemo(() => {
        return items.map((item) => {
            var _a, _b, _c;
            const candidate = item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || null;
            return {
                id: item.media_id,
                photoUrl: withAccessToken(candidate) || candidate || '',
                uploadedAt: (_a = item.created_at) !== null && _a !== void 0 ? _a : '',
                likes: Number((_b = item.likes_count) !== null && _b !== void 0 ? _b : 0),
                views: Number((_c = item.views_count) !== null && _c !== void 0 ? _c : 0),
                media: item,
            };
        });
    }, [items, withAccessToken]);
    return (_jsxs(View, Object.assign({ style: styles.mainContainer, testID: "all-photos-events-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(CustomHeader, { title: t('All Photos'), onBackPress: () => navigation.goBack(), isSetting: false }), _jsx(FlatList, { data: data, numColumns: 2, keyExtractor: (item) => String(item.id), columnWrapperStyle: localStyles.columnWrap, contentContainerStyle: [
                    localStyles.gridWrap,
                    { paddingBottom: insets.bottom > 0 ? insets.bottom + 30 : 30 },
                ], showsVerticalScrollIndicator: false, onRefresh: () => loadPage(0, false), refreshing: isRefreshing, onEndReachedThreshold: 0.35, onEndReached: () => {
                    if (isLoading || isRefreshing || isFetchingMore || !hasMore)
                        return;
                    loadPage(items.length, true);
                }, renderItem: ({ item }) => (_jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.9, style: [localStyles.mediaTile, { width: tileWidth }], onPress: () => navigation.navigate('PhotoDetailScreen', {
                        eventTitle: eventName,
                        media: {
                            id: item.media.media_id,
                            type: item.media.type,
                            eventId: item.media.event_id,
                            thumbnailUrl: item.media.thumbnail_url,
                            previewUrl: item.media.preview_url,
                            originalUrl: item.media.original_url,
                            fullUrl: item.media.full_url,
                            rawUrl: item.media.raw_url,
                            hlsManifestPath: item.media.hls_manifest_path,
                        },
                    }) }, { children: [item.photoUrl ? (_jsx(Image, { source: { uri: item.photoUrl }, style: [localStyles.mediaImage, { height: tileHeight }], resizeMode: "cover" })) : (_jsx(View, { style: [localStyles.mediaFallback, { height: tileHeight }] })), _jsxs(View, Object.assign({ style: localStyles.mediaMeta }, { children: [_jsxs(Text, Object.assign({ style: localStyles.mediaMetaPrimary, numberOfLines: 1 }, { children: [item.likes, " ", t('likes'), " \u2022 ", item.views, " ", t('views')] })), _jsxs(Text, Object.assign({ style: localStyles.mediaMetaSecondary, numberOfLines: 1 }, { children: [t('Uploaded'), " ", formatDate(item.uploadedAt)] }))] }))] }))), ListHeaderComponent: _jsxs(View, Object.assign({ style: localStyles.headerWrap }, { children: [_jsx(Text, Object.assign({ style: styles.titleText }, { children: eventName })), (division || gender) && (_jsx(Text, Object.assign({ style: localStyles.subtitle }, { children: [division, gender].filter(Boolean).join(' • ') }))), _jsx(Text, Object.assign({ style: localStyles.helper }, { children: helperCopy }))] })), ListEmptyComponent: _jsx(View, Object.assign({ style: localStyles.emptyBox }, { children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(ActivityIndicator, { color: colors.primaryColor }), _jsx(SizeBox, { height: 10 }), _jsx(Text, Object.assign({ style: styles.subText }, { children: t('Loading photos...') }))] })) : (_jsx(Text, Object.assign({ style: styles.subText }, { children: emptyCopy }))) })), ListFooterComponent: isFetchingMore ? (_jsx(View, Object.assign({ style: { paddingVertical: 16 } }, { children: _jsx(ActivityIndicator, { color: colors.primaryColor }) }))) : null })] })));
};
export default AllPhotosOfEvents;
