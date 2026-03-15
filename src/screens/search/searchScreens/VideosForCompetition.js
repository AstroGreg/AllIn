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
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { createStyles } from '../SearchStyles';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icons from '../../../constants/Icons';
import { useAuth } from '../../../context/AuthContext';
import { getCompetitionPublicMedia, getHubAppearanceMedia } from '../../../services/apiGateway';
import { getHlsBaseUrl } from '../../../constants/RuntimeConfig';
import Images from '../../../constants/Images';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const PAGE_SIZE = 60;
const VideosForEvent = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const insets = useSafeAreaInsets();
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
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const targetCompetitionId = competitionId !== null && competitionId !== void 0 ? competitionId : eventId;
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
    const toHlsUrl = useCallback((value) => {
        if (!value)
            return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://'))
            return raw;
        const base = getHlsBaseUrl();
        if (!base)
            return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);
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
    const formatDuration = (value) => {
        const totalSeconds = Number.parseInt(String(value !== null && value !== void 0 ? value : '0'), 10);
        if (!Number.isFinite(totalSeconds) || totalSeconds <= 0)
            return '—';
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        if (hours > 0) {
            const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
            return `${hours}:${paddedMinutes}:${paddedSeconds}`;
        }
        return `${minutes}:${paddedSeconds}`;
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
        else {
            setIsLoading(true);
        }
        try {
            let list = [];
            if (appearanceOnly && targetCompetitionId) {
                const res = yield getHubAppearanceMedia(apiAccessToken, String(targetCompetitionId), {
                    include_original: false,
                    limit: PAGE_SIZE,
                    offset,
                });
                list = Array.isArray(res === null || res === void 0 ? void 0 : res.results) ? res.results : [];
            }
            else if (targetCompetitionId) {
                const res = yield getCompetitionPublicMedia(apiAccessToken, String(targetCompetitionId), {
                    type: 'video',
                    discipline_id: disciplineId ? String(disciplineId) : undefined,
                    checkpoint_id: checkpointId ? String(checkpointId) : undefined,
                    limit: PAGE_SIZE,
                    offset,
                    include_original: false,
                });
                list = Array.isArray(res) ? res : [];
            }
            const filtered = list.filter((item) => isVideoMedia(item));
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
            setIsFetchingMore(false);
        }
    }), [apiAccessToken, appearanceOnly, checkpointId, disciplineId, isVideoMedia, mergeItems, targetCompetitionId]);
    useEffect(() => {
        if (!apiAccessToken)
            return () => { };
        const load = () => __awaiter(void 0, void 0, void 0, function* () {
            yield loadPage(0, false);
        });
        load();
        return () => { };
    }, [apiAccessToken, loadPage]);
    const data = useMemo(() => {
        return items.map((item) => {
            var _a, _b;
            const thumbCandidate = item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || null;
            const resolvedThumb = withAccessToken(thumbCandidate) || thumbCandidate || '';
            const hls = item.hls_manifest_path ? toHlsUrl(item.hls_manifest_path) : null;
            const candidates = [item.full_url, item.original_url, item.raw_url, item.preview_url]
                .filter(Boolean)
                .map((value) => String(value));
            const mp4 = candidates.find((value) => /\.(mp4|mov|m4v)(\?|$)/i.test(value));
            const resolvedVideo = hls || mp4 || candidates[0] || null;
            return {
                id: item.media_id,
                event: eventName,
                videoUri: withAccessToken(resolvedVideo) || resolvedVideo,
                timer: String((_b = (_a = (item.assets || []).find((asset) => Number(asset.duration_seconds) > 0)) === null || _a === void 0 ? void 0 : _a.duration_seconds) !== null && _b !== void 0 ? _b : ''),
                thumbnail: resolvedThumb,
                media: item,
            };
        });
    }, [eventName, items, toHlsUrl, withAccessToken]);
    const renderItem = ({ item }) => {
        var _a;
        return (_jsxs(View, Object.assign({ style: [styles.borderBox, { marginBottom: 24 }] }, { children: [_jsx(Text, Object.assign({ style: styles.subText }, { children: item.event })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: [styles.row, styles.spaceBetween] }, { children: [_jsxs(Text, Object.assign({ style: styles.subText }, { children: [t('Author'), ": ", item.name] })), _jsxs(Text, Object.assign({ style: styles.subText }, { children: [formatDuration(item.timer), " ", t('Mins')] })), _jsxs(Text, Object.assign({ style: styles.subText }, { children: [Number((_a = item.media.views_count) !== null && _a !== void 0 ? _a : 0), " ", t('Views')] }))] })), _jsx(SizeBox, { height: 12 }), _jsxs(TouchableOpacity, Object.assign({ onPress: () => {
                        var _a;
                        return navigation.navigate('VideoPlayingScreen', {
                            mediaId: item.media.media_id,
                            video: {
                                title: eventName,
                                thumbnail: item.thumbnail ? { uri: item.thumbnail } : Images.photo7,
                                uri: (_a = item.videoUri) !== null && _a !== void 0 ? _a : '',
                            },
                        });
                    }, style: { position: 'relative' } }, { children: [_jsx(Image, { source: item.thumbnail ? { uri: item.thumbnail } : Images.photo7, style: { width: '100%', height: 150, borderRadius: 8 } }), _jsx(View, Object.assign({ style: { position: 'absolute', right: 12, bottom: 12 } }, { children: _jsx(Icons.PlayCricle, { height: 28, width: 28 }) }))] }))] })));
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(CustomHeader, { title: t('Video'), onBackPress: () => navigation.goBack(), onPressSetting: () => navigation.navigate('ProfileSettings') }), _jsx(FlatList, { data: data, renderItem: renderItem, keyExtractor: (item, index) => index.toString(), showsVerticalScrollIndicator: false, onEndReachedThreshold: 0.35, onEndReached: () => {
                    if (isLoading || isFetchingMore || !hasMore)
                        return;
                    loadPage(items.length, true);
                }, ListHeaderComponent: _jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: { marginHorizontal: 20 } }, { children: [_jsx(Text, Object.assign({ style: styles.titleText }, { children: eventName })), _jsx(SizeBox, { height: 2 }), _jsx(Text, Object.assign({ style: styles.filterText }, { children: [eventName, division, gender].filter(Boolean).join(' • ') })), _jsx(SizeBox, { height: 10 }), _jsx(View, { style: styles.separator })] })), _jsx(SizeBox, { height: 27 })] }), ListFooterComponent: isFetchingMore ? _jsx(SizeBox, { height: 20 }) : null })] })));
};
export default VideosForEvent;
