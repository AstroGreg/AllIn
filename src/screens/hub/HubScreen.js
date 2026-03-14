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
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Keyboard, InteractionManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, Calendar, Location, VideoSquare, } from 'iconsax-react-nativejs';
import { createStyles } from './HubScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { getHubAppearances, getHubUploads, getMediaViewAll } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next';
import E2EPerfReady from '../../components/e2e/E2EPerfReady';
import { isE2ELaunchEnabled } from '../../constants/E2EConfig';
const HUB_DEFAULT_INITIAL_LIMIT = 10;
const HUB_SEARCH_INITIAL_LIMIT = 20;
const SCROLL_LOAD_THRESHOLD_PX = 220;
const HubScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const { events } = useEvents();
    const perfStartedAtRef = useRef(Date.now());
    const [filterType, setFilterType] = useState('all');
    const [lastAppliedFilterType, setLastAppliedFilterType] = useState('appearance');
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [hiddenCardInfo, setHiddenCardInfo] = useState({});
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [infoCard, setInfoCard] = useState(null);
    const [neverShowAgain, setNeverShowAgain] = useState(false);
    const loadMoreLockedRef = useRef(false);
    const [appearanceCardsData, setAppearanceCardsData] = useState([]);
    const [uploadCardsData, setUploadCardsData] = useState([]);
    const [mediaByEvent, setMediaByEvent] = useState({});
    const [e2eManageUploadState, setE2EManageUploadState] = useState('idle');
    const resolveCompetitionType = useCallback((params) => {
        const token = `${(params === null || params === void 0 ? void 0 : params.type) || ''} ${(params === null || params === void 0 ? void 0 : params.name) || ''} ${(params === null || params === void 0 ? void 0 : params.location) || ''}`.toLowerCase();
        if (/road|trail|marathon|veldloop|veldlopen|cross|5k|10k|half|ultra|city\s*run/.test(token)) {
            return 'road';
        }
        return 'track';
    }, []);
    const getCompetitionTypeLabel = useCallback((type) => {
        if (String(type || '').toLowerCase() === 'road')
            return t('roadAndTrail');
        return t('trackAndField');
    }, [t]);
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
    const toAbsoluteUrl = useCallback((value) => {
        if (!value)
            return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://'))
            return raw;
        const base = getApiBaseUrl();
        if (!base)
            return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);
    const normalizeThumb = useCallback((value) => {
        if (!value)
            return null;
        const resolved = toAbsoluteUrl(String(value));
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken)
            return () => { };
        const load = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const res = yield getHubAppearances(apiAccessToken);
                if (!mounted)
                    return;
                const list = Array.isArray(res === null || res === void 0 ? void 0 : res.appearances) ? res.appearances : [];
                setAppearanceCardsData(list.map((item) => {
                    var _a, _b, _c, _d, _e;
                    return ({
                        id: item.event_id,
                        eventId: item.event_id,
                        title: item.event_name || t('competition'),
                        found: `${Number((_a = item.photos_count) !== null && _a !== void 0 ? _a : 0)} ${t('photos')} | ${Number((_b = item.videos_count) !== null && _b !== void 0 ? _b : 0)} ${t('videos')}`,
                        location: (_c = item.event_location) !== null && _c !== void 0 ? _c : '-',
                        date: formatDateOnly((_d = item.event_date) !== null && _d !== void 0 ? _d : '-'),
                        thumbnail: item.thumbnail_url ? { uri: item.thumbnail_url } : null,
                        matchTypes: (_e = item.match_types) !== null && _e !== void 0 ? _e : [],
                        competitionType: resolveCompetitionType({
                            type: item === null || item === void 0 ? void 0 : item.competition_type,
                            name: item.event_name,
                            location: item.event_location,
                        }),
                        organizingClub: String((item === null || item === void 0 ? void 0 : item.organizing_club)
                            || (item === null || item === void 0 ? void 0 : item.organizer_club)
                            || (item === null || item === void 0 ? void 0 : item.competition_organizer_name)
                            || '').trim(),
                        cardType: 'appearance',
                    });
                }));
            }
            catch (_a) {
                if (!mounted)
                    return;
                setAppearanceCardsData([]);
            }
        });
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, resolveCompetitionType, t]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken)
            return () => { };
        getMediaViewAll(apiAccessToken, { include_original: false })
            .then((items) => {
            if (!mounted)
                return;
            const map = {};
            items.forEach((media) => {
                const eventId = media.event_id ? String(media.event_id) : '';
                if (!eventId)
                    return;
                const entry = map[eventId] || { videoCount: 0, thumbUrl: undefined };
                if (!entry.thumbUrl) {
                    const candidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
                    entry.thumbUrl = normalizeThumb(candidate) || undefined;
                }
                if (String(media.type).toLowerCase() === 'video') {
                    entry.videoCount += 1;
                }
                map[eventId] = entry;
            });
            setMediaByEvent(map);
        })
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, normalizeThumb]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken)
            return () => { };
        const load = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const res = yield getHubUploads(apiAccessToken, { include_original: false });
                if (!mounted)
                    return;
                const list = Array.isArray(res === null || res === void 0 ? void 0 : res.results) ? res.results : [];
                setUploadCardsData(list.map((item) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    return ({
                        id: item.media_id,
                        mediaId: item.media_id,
                        eventId: (_a = item.event_id) !== null && _a !== void 0 ? _a : null,
                        title: String(item.type || '').toLowerCase() === 'video'
                            ? (item.title || item.event_name || t('upload'))
                            : (item.event_name || t('upload')),
                        location: (_b = item.event_location) !== null && _b !== void 0 ? _b : '-',
                        date: formatDateOnly((_c = item.event_date) !== null && _c !== void 0 ? _c : '-'),
                        likes: Number((_d = item.likes_count) !== null && _d !== void 0 ? _d : 0),
                        views: Number((_e = item.views_count) !== null && _e !== void 0 ? _e : 0),
                        labelsYes: Number((_f = item.labels_yes) !== null && _f !== void 0 ? _f : 0),
                        labelsNo: Number((_g = item.labels_no) !== null && _g !== void 0 ? _g : 0),
                        labelsTotal: Number((_h = item.labels_total) !== null && _h !== void 0 ? _h : 0),
                        type: String(item.type || 'image'),
                        postId: item.post_id ? String(item.post_id) : null,
                        thumbnail: item.thumbnail_url ? { uri: item.thumbnail_url } : null,
                        previewUrl: item.preview_url,
                        originalUrl: item.original_url,
                        fullUrl: item.full_url,
                        rawUrl: item.raw_url,
                        hlsManifestPath: item.hls_manifest_path,
                        cardType: 'upload',
                    });
                }));
            }
            catch (_a) {
                if (!mounted)
                    return;
                setUploadCardsData([]);
            }
        });
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, t]);
    const formatDateOnly = (value) => {
        if (!value || value === '-')
            return '-';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return value;
        }
        const day = String(parsed.getDate()).padStart(2, '0');
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const year = parsed.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const myCompetitions = useMemo(() => {
        return (events || []).map((event, index) => {
            var _a;
            const eventId = String(event.event_id);
            const mediaInfo = mediaByEvent[eventId];
            const title = event.event_name || event.event_title || t('competition');
            const location = String(event.event_location || '').trim();
            const date = formatDateOnly(event.event_date || '-');
            const videoCount = (_a = mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.videoCount) !== null && _a !== void 0 ? _a : 0;
            return {
                id: eventId || `${index}`,
                eventId,
                title,
                status: 'Subscribed',
                media: `${videoCount} ${t('videos')}`,
                location,
                date,
                thumbnail: (mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.thumbUrl) ? { uri: mediaInfo.thumbUrl } : null,
                competitionType: resolveCompetitionType({
                    type: event === null || event === void 0 ? void 0 : event.competition_type,
                    name: event.event_name || event.event_title,
                    location: event.event_location,
                }),
                organizingClub: String((event === null || event === void 0 ? void 0 : event.organizing_club) || '').trim(),
                cardType: 'subscription',
            };
        });
    }, [events, mediaByEvent, resolveCompetitionType, t]);
    const hubCards = useMemo(() => {
        return [...appearanceCardsData, ...myCompetitions, ...uploadCardsData];
    }, [appearanceCardsData, myCompetitions, uploadCardsData]);
    const perfReady = hubCards.length > 0;
    const filteredCards = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        let baseList = filterType === 'all'
            ? [...hubCards]
            : hubCards.filter((card) => card.cardType === filterType);
        if (filterType === 'all') {
            const priority = [
                lastAppliedFilterType,
                ...['appearance', 'subscription', 'upload']
                    .filter((entry) => entry !== lastAppliedFilterType),
            ];
            baseList = baseList.sort((a, b) => {
                const ai = priority.indexOf(a.cardType);
                const bi = priority.indexOf(b.cardType);
                return ai - bi;
            });
        }
        if (!normalizedQuery)
            return baseList;
        const matchesQuery = (value) => String(value !== null && value !== void 0 ? value : '').toLowerCase().includes(normalizedQuery);
        return baseList.filter((card) => {
            if (card.cardType === 'appearance') {
                return (matchesQuery(card.title) ||
                    matchesQuery(card.found) ||
                    matchesQuery(card.location) ||
                    matchesQuery(card.date) ||
                    matchesQuery(card.match));
            }
            if (card.cardType === 'subscription') {
                return (matchesQuery(card.title) ||
                    matchesQuery(card.status) ||
                    matchesQuery(card.media) ||
                    matchesQuery(card.location) ||
                    matchesQuery(card.date));
            }
            return (matchesQuery(card.title) ||
                matchesQuery(card.type) ||
                matchesQuery(card.comments) ||
                matchesQuery(card.location) ||
                matchesQuery(card.date));
        });
    }, [filterType, hubCards, lastAppliedFilterType, query]);
    const isSearchActive = query.trim().length > 0;
    const pageSize = isSearchActive ? HUB_SEARCH_INITIAL_LIMIT : HUB_DEFAULT_INITIAL_LIMIT;
    const visibleCards = filteredCards.slice(0, page * pageSize);
    const canLoadMore = visibleCards.length < filteredCards.length;
    useEffect(() => {
        loadMoreLockedRef.current = false;
        setPage(1);
    }, [filterType, query, pageSize]);
    const handleMainScroll = useCallback((event) => {
        const native = event === null || event === void 0 ? void 0 : event.nativeEvent;
        if (!native)
            return;
        const { contentOffset, contentSize, layoutMeasurement } = native;
        const distanceToBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
        if (distanceToBottom > SCROLL_LOAD_THRESHOLD_PX) {
            loadMoreLockedRef.current = false;
            return;
        }
        if (loadMoreLockedRef.current || !canLoadMore)
            return;
        loadMoreLockedRef.current = true;
        setPage((prev) => prev + 1);
    }, [canLoadMore]);
    useEffect(() => {
        const loadHidden = () => __awaiter(void 0, void 0, void 0, function* () {
            const entries = yield Promise.all(['appearance', 'subscription', 'upload'].map((type) => __awaiter(void 0, void 0, void 0, function* () {
                const value = yield AsyncStorage.getItem(`hub_card_info_hidden_${type}`);
                return [type, value === 'true'];
            })));
            setHiddenCardInfo(Object.fromEntries(entries));
        });
        loadHidden();
    }, []);
    const openUploadManage = (card) => {
        var _a, _b, _c, _d;
        const mediaId = String((_b = (_a = card.mediaId) !== null && _a !== void 0 ? _a : card.id) !== null && _b !== void 0 ? _b : '').trim();
        if (!mediaId)
            return;
        if (isE2ELaunchEnabled()) {
            setE2EManageUploadState(`opening:${mediaId}`);
        }
        Keyboard.dismiss();
        const thumbnailUri = ((_c = card.thumbnail) === null || _c === void 0 ? void 0 : _c.uri) ? String(card.thumbnail.uri) : undefined;
        const fallbackUri = card.previewUrl ||
            card.originalUrl ||
            card.fullUrl ||
            card.rawUrl ||
            undefined;
        const params = {
            mediaId,
            video: {
                media_id: mediaId,
                post_id: (_d = card.postId) !== null && _d !== void 0 ? _d : null,
                type: card.type,
                title: card.title,
                location: card.location,
                date: formatDateOnly(card.date),
                thumbnail: thumbnailUri ? { uri: thumbnailUri } : undefined,
                uri: fallbackUri,
            },
        };
        InteractionManager.runAfterInteractions(() => {
            if (isE2ELaunchEnabled()) {
                setE2EManageUploadState(`navigating:${mediaId}`);
            }
            navigation.navigate('VideoDetailsScreen', params);
        });
    };
    const openCardAction = (card) => {
        var _a, _b, _c;
        if (card.cardType === 'appearance') {
            navigation.navigate('AllPhotosOfEvents', {
                eventId: (_a = card.eventId) !== null && _a !== void 0 ? _a : card.id,
                eventName: card.title,
                appearanceOnly: true,
            });
            return;
        }
        if (card.cardType === 'subscription') {
            navigation.navigate('CompetitionDetailsScreen', {
                name: card.title,
                location: card.location,
                date: card.date,
                organizingClub: card.organizingClub,
                competitionType: (_b = card.competitionType) !== null && _b !== void 0 ? _b : 'track',
                eventId: (_c = card.eventId) !== null && _c !== void 0 ? _c : card.id,
            });
            return;
        }
        openUploadManage(card);
    };
    const handleCardPress = (card) => {
        if (isE2ELaunchEnabled()) {
            openCardAction(card);
            return;
        }
        const hideInfo = hiddenCardInfo[card.cardType];
        if (hideInfo) {
            openCardAction(card);
            return;
        }
        setInfoCard(card);
        setNeverShowAgain(false);
        setInfoModalVisible(true);
    };
    const handleInfoContinue = () => __awaiter(void 0, void 0, void 0, function* () {
        const nextCard = infoCard;
        if (nextCard && neverShowAgain) {
            yield AsyncStorage.setItem(`hub_card_info_hidden_${nextCard.cardType}`, 'true');
            setHiddenCardInfo((prev) => (Object.assign(Object.assign({}, prev), { [nextCard.cardType]: true })));
        }
        setInfoModalVisible(false);
        setInfoCard(null);
        if (nextCard) {
            requestAnimationFrame(() => {
                openCardAction(nextCard);
            });
        }
    });
    const getUploadTypeLabel = (type) => {
        const normalized = String(type || '').toLowerCase();
        if (normalized === 'video')
            return t('Video');
        if (normalized === 'image' || normalized === 'photo')
            return t('Photo');
        return t('media');
    };
    const renderHubCard = (card) => {
        var _a, _b, _c;
        if (card.cardType === 'appearance') {
            return (_jsx(TouchableOpacity, Object.assign({ style: Styles.hubCard, activeOpacity: 0.8, onPress: () => handleCardPress(card), testID: `hub-appearance-card-${String(card.id)}` }, { children: _jsxs(View, Object.assign({ style: Styles.hubCardRow }, { children: [card.thumbnail ? (_jsx(FastImage, { source: card.thumbnail, style: Styles.squareThumbnail, resizeMode: "cover" })) : (_jsx(View, { style: Styles.squareThumbnailPlaceholder })), _jsxs(View, Object.assign({ style: Styles.cardInfo }, { children: [_jsxs(View, Object.assign({ style: Styles.cardHeaderRow }, { children: [_jsx(Text, Object.assign({ style: Styles.cardTitle, numberOfLines: 2 }, { children: card.title })), _jsx(View, Object.assign({ style: Styles.typeBadge }, { children: _jsx(Text, Object.assign({ style: Styles.typeBadgeText }, { children: t('Appearance') })) }))] })), _jsx(Text, Object.assign({ style: Styles.cardSubtitle }, { children: card.found })), _jsxs(View, Object.assign({ style: Styles.detailValue }, { children: [_jsx(Location, { size: 14, color: colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.detailText, Styles.detailTextTruncate], numberOfLines: 1, ellipsizeMode: "tail" }, { children: card.location })), _jsx(View, { style: Styles.detailDot }), _jsx(Calendar, { size: 14, color: colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.detailText, numberOfLines: 1, ellipsizeMode: "tail" }, { children: formatDateOnly(card.date) }))] })), ((_a = card.matchTypes) === null || _a === void 0 ? void 0 : _a.length) ? (_jsx(View, Object.assign({ style: Styles.matchBadge }, { children: _jsx(Text, Object.assign({ style: Styles.matchBadgeText }, { children: card.matchTypes.includes('face') && card.matchTypes.includes('bib')
                                            ? t('Face + Chest')
                                            : card.matchTypes.includes('face')
                                                ? t('Face')
                                                : card.matchTypes.includes('bib')
                                                    ? t('Chest')
                                                    : t('Match') })) }))) : null] }))] })) }), `appearance-${card.id}`));
        }
        if (card.cardType === 'subscription') {
            return (_jsx(TouchableOpacity, Object.assign({ style: Styles.hubCard, activeOpacity: 0.8, onPress: () => handleCardPress(card), testID: `hub-subscription-card-${String(card.id)}` }, { children: _jsxs(View, Object.assign({ style: Styles.hubCardRow }, { children: [card.thumbnail ? (_jsx(FastImage, { source: card.thumbnail, style: Styles.squareThumbnail, resizeMode: "cover" })) : (_jsx(View, { style: Styles.squareThumbnailPlaceholder })), _jsxs(View, Object.assign({ style: Styles.cardInfo }, { children: [_jsxs(View, Object.assign({ style: Styles.cardHeaderRow }, { children: [_jsx(Text, Object.assign({ style: Styles.cardTitle, numberOfLines: 2 }, { children: card.title })), _jsx(View, Object.assign({ style: [Styles.statusBadge, card.status === 'Completed' ? Styles.statusDone : Styles.statusActive] }, { children: _jsx(Text, Object.assign({ style: [Styles.statusText, card.status !== 'Completed' && Styles.statusTextActive] }, { children: t(card.status) })) }))] })), _jsx(Text, Object.assign({ style: Styles.cardSubtitle, numberOfLines: 2 }, { children: [getCompetitionTypeLabel(card.competitionType), card.location, card.organizingClub]
                                        .filter((part) => String(part || '').trim().length > 0 && part !== '-')
                                        .join(' • ') || t('Subscribed competition') })), _jsxs(View, Object.assign({ style: Styles.detailValue }, { children: [_jsx(VideoSquare, { size: 14, color: colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.detailText }, { children: card.media })), card.location && card.location !== '-' ? (_jsxs(_Fragment, { children: [_jsx(View, { style: Styles.detailDot }), _jsx(Location, { size: 14, color: colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.detailText, Styles.detailTextTruncate], numberOfLines: 1, ellipsizeMode: "tail" }, { children: card.location }))] })) : null] })), _jsx(Text, Object.assign({ style: Styles.detailText }, { children: formatDateOnly(card.date) }))] }))] })) }), `event-${card.id}`));
        }
        return (_jsx(TouchableOpacity, Object.assign({ style: Styles.hubCard, activeOpacity: 0.8, onPress: () => handleCardPress(card), testID: `hub-upload-card-${String((_b = card.mediaId) !== null && _b !== void 0 ? _b : card.id)}` }, { children: _jsxs(View, Object.assign({ style: Styles.hubCardRow }, { children: [card.thumbnail ? (_jsx(FastImage, { source: card.thumbnail, style: Styles.squareThumbnail, resizeMode: "cover" })) : (_jsx(View, { style: Styles.squareThumbnailPlaceholder })), _jsxs(View, Object.assign({ style: Styles.cardInfo }, { children: [_jsxs(View, Object.assign({ style: Styles.cardHeaderRow }, { children: [_jsx(Text, Object.assign({ style: Styles.cardTitle, numberOfLines: 2 }, { children: card.title })), _jsx(View, Object.assign({ style: Styles.typeBadge }, { children: _jsx(Text, Object.assign({ style: Styles.typeBadgeText }, { children: t('upload') })) }))] })), _jsxs(Text, Object.assign({ style: Styles.cardSubtitle }, { children: [getUploadTypeLabel(card.type), " | ", card.labelsTotal > 0 ? `${card.labelsYes} ${t('yes')} | ${card.labelsNo} ${t('no')}` : t('No feedback yet')] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.feedbackButton, onPress: (e) => {
                                    if (e === null || e === void 0 ? void 0 : e.stopPropagation)
                                        e.stopPropagation();
                                    openUploadManage(card);
                                }, testID: `hub-manage-upload-${String((_c = card.mediaId) !== null && _c !== void 0 ? _c : card.id)}` }, { children: [_jsx(Text, Object.assign({ style: Styles.feedbackButtonText }, { children: t('Manage upload') })), _jsx(Icons.RightBtnIcon, { height: 16, width: 16 })] }))] }))] })) }), `upload-${card.id}`));
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "hub-screen" }, { children: [_jsx(E2EPerfReady, { screen: "hub", ready: perfReady, startedAtMs: perfStartedAtRef.current }), isE2ELaunchEnabled() ? (_jsx(Text, Object.assign({ testID: "hub-manage-upload-state", style: { position: 'absolute', left: -9999, top: -9999 } }, { children: e2eManageUploadState }))) : null, _jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 20, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Hub') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent, onScroll: handleMainScroll, scrollEventThrottle: 16, keyboardShouldPersistTaps: "always" }, { children: [_jsxs(View, Object.assign({ style: Styles.sectionBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Competitions') })), _jsx(Text, Object.assign({ style: Styles.sectionSubtitle }, { children: t('Appearances, subscriptions, and your uploads.') }))] })), _jsx(View, Object.assign({ style: Styles.filterRow }, { children: [
                            { key: 'all', label: 'All' },
                            { key: 'appearance', label: 'Appearances' },
                            { key: 'subscription', label: 'Subscribed' },
                            { key: 'upload', label: 'Uploads' },
                        ].map((option) => (_jsx(TouchableOpacity, Object.assign({ style: [
                                Styles.filterChip,
                                filterType === option.key && Styles.filterChipActive,
                            ], onPress: () => {
                                const next = option.key;
                                setFilterType(next);
                                if (next !== 'all') {
                                    setLastAppliedFilterType(next);
                                }
                            } }, { children: _jsx(Text, Object.assign({ style: [
                                    Styles.filterChipText,
                                    filterType === option.key && Styles.filterChipTextActive,
                                ] }, { children: t(option.label) })) }), option.key))) })), _jsx(View, Object.assign({ style: Styles.searchRow }, { children: _jsxs(View, Object.assign({ style: Styles.searchField }, { children: [_jsx(Icons.Search, { width: 16, height: 16 }), _jsx(TextInput, { testID: "hub-search-input", placeholder: t('Search competitions, appearances, uploads'), placeholderTextColor: colors.grayColor, value: query, onChangeText: (text) => {
                                        setQuery(text);
                                        if (isE2ELaunchEnabled()) {
                                            Keyboard.dismiss();
                                        }
                                    }, style: Styles.searchInput, returnKeyType: "search", blurOnSubmit: true, onSubmitEditing: () => Keyboard.dismiss(), autoCapitalize: "none", autoCorrect: false, showSoftInputOnFocus: !isE2ELaunchEnabled() })] })) })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.primaryButton, onPress: () => navigation.navigate('AvailableEventsScreen') }, { children: [_jsx(Text, Object.assign({ style: Styles.primaryButtonText }, { children: t('subscribeCompetition') })), _jsx(Icons.RightBtnIcon, { height: 18, width: 18 })] })), visibleCards.map(renderHubCard), _jsxs(View, Object.assign({ style: Styles.sectionBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Downloads') })), _jsx(Text, Object.assign({ style: Styles.sectionSubtitle }, { children: t('Your saved photos and videos.') }))] })), _jsx(TouchableOpacity, Object.assign({ style: Styles.downloadsCard, onPress: () => navigation.navigate('DownloadsDetailsScreen') }, { children: _jsxs(View, Object.assign({ style: Styles.downloadsInfo }, { children: [_jsx(Icons.Downloads, { height: 24, width: 24 }), _jsx(Text, Object.assign({ style: Styles.downloadsText }, { children: t('Total downloads') })), _jsx(Text, Object.assign({ style: Styles.downloadsNumber }, { children: '346,456' }))] })) })), _jsx(SizeBox, { height: 20 })] })), _jsx(Modal, Object.assign({ visible: infoModalVisible, transparent: true, animationType: "fade", onRequestClose: () => setInfoModalVisible(false) }, { children: _jsx(View, Object.assign({ style: Styles.infoBackdrop, testID: "hub-info-modal" }, { children: _jsxs(View, Object.assign({ style: Styles.infoCard }, { children: [_jsx(Text, Object.assign({ style: Styles.infoTitle }, { children: t('About this card') })), _jsxs(Text, Object.assign({ style: Styles.infoText }, { children: [(infoCard === null || infoCard === void 0 ? void 0 : infoCard.cardType) === 'appearance' && t('This card shows where we found you in photos or videos and how you matched.'), (infoCard === null || infoCard === void 0 ? void 0 : infoCard.cardType) === 'subscription' && t('This card is a competition you subscribed to. Tap to open it.'), (infoCard === null || infoCard === void 0 ? void 0 : infoCard.cardType) === 'upload' && t('This card is media you uploaded. Tap to manage details and comments.')] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.infoCheckRow, onPress: () => setNeverShowAgain((prev) => !prev) }, { children: [_jsx(View, Object.assign({ style: [Styles.infoCheckBox, neverShowAgain && Styles.infoCheckBoxActive] }, { children: neverShowAgain && _jsx(Text, Object.assign({ style: Styles.infoCheckMark }, { children: "\u2713" })) })), _jsx(Text, Object.assign({ style: Styles.infoCheckText }, { children: t('Never show again') }))] })), _jsxs(View, Object.assign({ style: Styles.infoButtonsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.infoCancelButton, onPress: () => setInfoModalVisible(false), testID: "hub-info-close" }, { children: _jsx(Text, Object.assign({ style: Styles.infoCancelText }, { children: t('Close') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.infoConfirmButton, onPress: handleInfoContinue, testID: "hub-info-continue" }, { children: _jsx(Text, Object.assign({ style: Styles.infoConfirmText }, { children: t('Continue') })) }))] }))] })) })) }))] })));
};
export default HubScreen;
