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
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Image, FlatList } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, ArrowRight, Ghost } from 'iconsax-react-nativejs';
import { createStyles } from './WatermarkScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import Video from 'react-native-video';
import { useFocusEffect } from '@react-navigation/native';
function normalizeLocalUri(uri) {
    if (!uri)
        return uri;
    if (!String(uri).startsWith('file://'))
        return uri;
    let path = String(uri).slice('file://'.length);
    const q = path.indexOf('?');
    if (q !== -1)
        path = path.slice(0, q);
    try {
        path = decodeURI(path);
    }
    catch (_a) { }
    return `file://${path}`;
}
const DEFAULT_WATERMARK_TEXT = 'SpotMe';
const WatermarkScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const competition = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.competition;
    const account = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.account;
    const anonymous = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.anonymous;
    const competitionType = (_e = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.competitionType) !== null && _e !== void 0 ? _e : competition === null || competition === void 0 ? void 0 : competition.competitionType;
    const [previewAssets, setPreviewAssets] = useState([]);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [previewSizeByUri, setPreviewSizeByUri] = useState({});
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [previewCardSize, setPreviewCardSize] = useState({ width: 0, height: 0 });
    const [previewModalSize, setPreviewModalSize] = useState({ width: 0, height: 0 });
    const previewCardListRef = useRef(null);
    const previewModalListRef = useRef(null);
    const previewCardPageWidth = Math.max(1, Number(previewCardSize.width || 0));
    const previewCardPageHeight = Math.max(1, Number(previewCardSize.height || 0));
    const previewModalPageWidth = Math.max(1, Number(previewModalSize.width || 0));
    const previewModalPageHeight = Math.max(1, Number(previewModalSize.height || 0));
    const watermarkLabel = DEFAULT_WATERMARK_TEXT;
    const watermarkRows = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);
    const competitionId = useMemo(() => String((competition === null || competition === void 0 ? void 0 : competition.id) || (competition === null || competition === void 0 ? void 0 : competition.event_id) || (competition === null || competition === void 0 ? void 0 : competition.eventId) || 'competition'), [competition === null || competition === void 0 ? void 0 : competition.event_id, competition === null || competition === void 0 ? void 0 : competition.eventId, competition === null || competition === void 0 ? void 0 : competition.id]);
    const getAssetSize = useCallback((asset) => {
        var _a, _b;
        const width = Number((_a = asset === null || asset === void 0 ? void 0 : asset.width) !== null && _a !== void 0 ? _a : 0);
        const height = Number((_b = asset === null || asset === void 0 ? void 0 : asset.height) !== null && _b !== void 0 ? _b : 0);
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
            return null;
        return { width, height };
    }, []);
    const mapPreviewAssets = useCallback((parsed) => {
        if (!parsed || typeof parsed !== 'object')
            return [];
        const allAssets = Object.values(parsed).flatMap((list) => (Array.isArray(list) ? list : []));
        return allAssets
            .map((asset) => {
            var _a, _b, _c, _d, _e;
            return ({
                uri: String((_b = normalizeLocalUri((_a = asset === null || asset === void 0 ? void 0 : asset.uri) !== null && _a !== void 0 ? _a : null)) !== null && _b !== void 0 ? _b : ''),
                type: (_c = asset === null || asset === void 0 ? void 0 : asset.type) !== null && _c !== void 0 ? _c : null,
                width: Number((_d = asset === null || asset === void 0 ? void 0 : asset.width) !== null && _d !== void 0 ? _d : 0) || undefined,
                height: Number((_e = asset === null || asset === void 0 ? void 0 : asset.height) !== null && _e !== void 0 ? _e : 0) || undefined,
            });
        })
            .filter((asset) => Boolean(asset.uri));
    }, []);
    const applyPreviewAssets = useCallback((assets) => {
        setPreviewAssets(assets);
        setPreviewIndex((prev) => {
            if (assets.length === 0)
                return 0;
            return Math.min(prev, assets.length - 1);
        });
        setPreviewSizeByUri((prev) => {
            let changed = false;
            let next = prev;
            assets.forEach((asset) => {
                const size = getAssetSize(asset);
                if (!size)
                    return;
                const existing = next[asset.uri];
                if (existing && existing.width === size.width && existing.height === size.height)
                    return;
                if (!changed) {
                    next = Object.assign({}, next);
                    changed = true;
                }
                next[asset.uri] = size;
            });
            return changed ? next : prev;
        });
    }, [getAssetSize]);
    const getSizeForAsset = useCallback((asset) => {
        var _a;
        if (!asset)
            return null;
        return (_a = previewSizeByUri[asset.uri]) !== null && _a !== void 0 ? _a : getAssetSize(asset);
    }, [getAssetSize, previewSizeByUri]);
    const isVideoAsset = useCallback((asset) => {
        if (!asset)
            return false;
        const uri = String(asset.uri || '').toLowerCase();
        const type = String(asset.type || '').toLowerCase();
        return (type.includes('video') ||
            uri.includes('.mp4') ||
            uri.includes('.mov') ||
            uri.includes('.m4v') ||
            uri.includes('video'));
    }, []);
    useEffect(() => {
        let mounted = true;
        const loadPreview = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const assetsRaw = yield AsyncStorage.getItem(`@upload_assets_${competitionId}`);
                const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
                const assets = mapPreviewAssets(parsed);
                if (mounted) {
                    applyPreviewAssets(assets);
                }
            }
            catch (_a) {
                if (mounted)
                    applyPreviewAssets([]);
            }
        });
        loadPreview();
        return () => {
            mounted = false;
        };
    }, [applyPreviewAssets, competitionId, mapPreviewAssets]);
    useFocusEffect(useCallback(() => {
        let mounted = true;
        const loadPreviewOnFocus = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const assetsRaw = yield AsyncStorage.getItem(`@upload_assets_${competitionId}`);
                const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
                const assets = mapPreviewAssets(parsed);
                if (mounted) {
                    applyPreviewAssets(assets);
                }
            }
            catch (_a) {
                if (mounted) {
                    applyPreviewAssets([]);
                }
            }
        });
        loadPreviewOnFocus();
        return () => {
            mounted = false;
        };
    }, [applyPreviewAssets, competitionId, mapPreviewAssets]));
    const computeContainFrame = useCallback((container, media) => {
        const containerWidth = Number((container === null || container === void 0 ? void 0 : container.width) || 0);
        const containerHeight = Number((container === null || container === void 0 ? void 0 : container.height) || 0);
        if (containerWidth <= 0 || containerHeight <= 0) {
            return { width: 0, height: 0 };
        }
        if (!media || media.width <= 0 || media.height <= 0) {
            return { width: containerWidth, height: containerHeight };
        }
        const mediaRatio = media.width / media.height;
        const containerRatio = containerWidth / containerHeight;
        if (mediaRatio > containerRatio) {
            return { width: containerWidth, height: containerWidth / mediaRatio };
        }
        return { width: containerHeight * mediaRatio, height: containerHeight };
    }, []);
    useEffect(() => {
        const current = previewAssets[previewIndex];
        if (!current || isVideoAsset(current))
            return;
        if (getSizeForAsset(current))
            return;
        Image.getSize(current.uri, (width, height) => {
            if (width > 0 && height > 0) {
                setPreviewSizeByUri((prev) => (Object.assign(Object.assign({}, prev), { [current.uri]: { width, height } })));
            }
        }, () => { });
    }, [getSizeForAsset, isVideoAsset, previewAssets, previewIndex]);
    useEffect(() => {
        var _a;
        if (previewModalVisible)
            return;
        if (!previewAssets.length)
            return;
        if (previewCardPageWidth <= 1)
            return;
        (_a = previewCardListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({
            offset: previewIndex * previewCardPageWidth,
            animated: false,
        });
    }, [previewAssets.length, previewCardPageWidth, previewIndex, previewModalVisible]);
    useEffect(() => {
        if (!previewModalVisible)
            return;
        if (!previewAssets.length)
            return;
        if (previewModalPageWidth <= 1)
            return;
        const timer = setTimeout(() => {
            var _a;
            (_a = previewModalListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({
                offset: previewIndex * previewModalPageWidth,
                animated: false,
            });
        }, 0);
        return () => clearTimeout(timer);
    }, [previewAssets.length, previewIndex, previewModalPageWidth, previewModalVisible]);
    const handleSave = () => {
        navigation.navigate('UploadSummaryScreen', {
            competition,
            account,
            anonymous,
            competitionType,
            watermarkText: DEFAULT_WATERMARK_TEXT,
        });
    };
    const handleSkip = () => {
        navigation.navigate('UploadSummaryScreen', {
            competition,
            account,
            anonymous,
            competitionType,
            watermarkText: '',
        });
    };
    const openPreviewModal = useCallback(() => {
        if (!previewAssets.length)
            return;
        setPreviewModalVisible(true);
    }, [previewAssets.length]);
    const getPreviewItemLayout = useCallback((_, index) => ({
        index,
        length: previewCardPageWidth,
        offset: previewCardPageWidth * index,
    }), [previewCardPageWidth]);
    const getModalItemLayout = useCallback((_, index) => ({
        index,
        length: previewModalPageWidth,
        offset: previewModalPageWidth * index,
    }), [previewModalPageWidth]);
    const handleCardMomentumEnd = useCallback((event) => {
        var _a, _b, _c;
        if (!previewAssets.length || previewCardPageWidth <= 1)
            return;
        const next = Math.round(Number((_c = (_b = (_a = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _a === void 0 ? void 0 : _a.contentOffset) === null || _b === void 0 ? void 0 : _b.x) !== null && _c !== void 0 ? _c : 0) / previewCardPageWidth);
        const safe = Math.max(0, Math.min(previewAssets.length - 1, next));
        if (safe !== previewIndex)
            setPreviewIndex(safe);
    }, [previewAssets.length, previewCardPageWidth, previewIndex]);
    const handleModalMomentumEnd = useCallback((event) => {
        var _a, _b, _c;
        if (!previewAssets.length || previewModalPageWidth <= 1)
            return;
        const next = Math.round(Number((_c = (_b = (_a = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _a === void 0 ? void 0 : _a.contentOffset) === null || _b === void 0 ? void 0 : _b.x) !== null && _c !== void 0 ? _c : 0) / previewModalPageWidth);
        const safe = Math.max(0, Math.min(previewAssets.length - 1, next));
        if (safe !== previewIndex)
            setPreviewIndex(safe);
    }, [previewAssets.length, previewIndex, previewModalPageWidth]);
    const renderPreviewItem = ({ item }) => {
        const size = getSizeForAsset(item);
        const frame = computeContainFrame(previewCardSize, size);
        const isVideo = isVideoAsset(item);
        return (_jsx(Pressable, Object.assign({ style: [Styles.previewPage, { width: previewCardPageWidth, height: previewCardPageHeight }], onPress: openPreviewModal }, { children: _jsxs(View, Object.assign({ style: [
                    Styles.previewMediaFrame,
                    {
                        width: frame.width > 0 ? frame.width : '100%',
                        height: frame.height > 0 ? frame.height : '100%',
                    },
                ], pointerEvents: "none" }, { children: [isVideo ? (_jsx(Video, { source: { uri: normalizeLocalUri(item.uri) }, style: Styles.previewImage, resizeMode: "contain", paused: true, muted: true, repeat: false, controls: false, onError: () => { }, onLoad: (event) => {
                            var _a, _b, _c, _d;
                            const width = Number((_b = (_a = event === null || event === void 0 ? void 0 : event.naturalSize) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0);
                            const height = Number((_d = (_c = event === null || event === void 0 ? void 0 : event.naturalSize) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
                            if (width > 0 && height > 0) {
                                setPreviewSizeByUri((prev) => (Object.assign(Object.assign({}, prev), { [item.uri]: { width, height } })));
                            }
                        } })) : (_jsx(FastImage, { source: { uri: normalizeLocalUri(item.uri) }, style: Styles.previewImage, resizeMode: "contain", onLoad: (event) => {
                            var _a, _b, _c, _d;
                            const width = Number((_b = (_a = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0);
                            const height = Number((_d = (_c = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
                            if (width > 0 && height > 0) {
                                setPreviewSizeByUri((prev) => (Object.assign(Object.assign({}, prev), { [item.uri]: { width, height } })));
                            }
                        } })), _jsx(View, Object.assign({ style: Styles.previewWatermarkOverlay, pointerEvents: "none" }, { children: watermarkRows.map((row) => (_jsx(Text, Object.assign({ style: Styles.previewWatermarkRow, numberOfLines: 1 }, { children: `${row % 2 === 0 ? '' : '   '}${(`${watermarkLabel}   `).repeat(8)}` }), `wm-row-${item.uri}-${row}`))) }))] })) })));
    };
    const renderModalPreviewItem = ({ item }) => {
        const size = getSizeForAsset(item);
        const frame = computeContainFrame(previewModalSize, size);
        const isVideo = isVideoAsset(item);
        return (_jsx(View, Object.assign({ style: [Styles.previewModalPage, { width: previewModalPageWidth, height: previewModalPageHeight }] }, { children: _jsxs(View, Object.assign({ style: [
                    Styles.previewMediaFrame,
                    Styles.previewModalFrame,
                    {
                        width: frame.width > 0 ? frame.width : '100%',
                        height: frame.height > 0 ? frame.height : '100%',
                    },
                ] }, { children: [isVideo ? (_jsx(Video, { source: { uri: normalizeLocalUri(item.uri) }, style: Styles.previewModalImage, resizeMode: "contain", paused: true, muted: true, repeat: false, controls: false, onLoad: (event) => {
                            var _a, _b, _c, _d;
                            const width = Number((_b = (_a = event === null || event === void 0 ? void 0 : event.naturalSize) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0);
                            const height = Number((_d = (_c = event === null || event === void 0 ? void 0 : event.naturalSize) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
                            if (width > 0 && height > 0) {
                                setPreviewSizeByUri((prev) => (Object.assign(Object.assign({}, prev), { [item.uri]: { width, height } })));
                            }
                        } })) : (_jsx(FastImage, { source: { uri: normalizeLocalUri(item.uri) }, style: Styles.previewModalImage, resizeMode: "contain", onLoad: (event) => {
                            var _a, _b, _c, _d;
                            const width = Number((_b = (_a = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0);
                            const height = Number((_d = (_c = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
                            if (width > 0 && height > 0) {
                                setPreviewSizeByUri((prev) => (Object.assign(Object.assign({}, prev), { [item.uri]: { width, height } })));
                            }
                        } })), _jsx(View, Object.assign({ style: Styles.previewModalWatermarkOverlay, pointerEvents: "none" }, { children: watermarkRows.map((row) => (_jsx(Text, Object.assign({ style: Styles.previewWatermarkRow, numberOfLines: 1 }, { children: `${row % 2 === 0 ? '' : '   '}${(`${watermarkLabel}   `).repeat(8)}` }), `wm-modal-row-${item.uri}-${row}`))) }))] })) })));
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Upload') })), anonymous ? (_jsx(View, Object.assign({ style: Styles.headerGhost }, { children: _jsx(Ghost, { size: 22, color: colors.primaryColor, variant: "Linear" }) }))) : (_jsx(View, { style: Styles.headerSpacer }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: Styles.sectionHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Add Watermark') })), _jsx(Text, Object.assign({ style: Styles.sectionSubtitle }, { children: t('This will appear on every uploaded photo/video.') }))] })), _jsx(SizeBox, { height: 12 }), _jsx(SizeBox, { height: 20 }), _jsxs(View, Object.assign({ style: Styles.previewCard }, { children: [_jsx(Text, Object.assign({ style: Styles.previewLabel }, { children: t('Preview') })), _jsx(View, Object.assign({ style: Styles.previewBox, onLayout: (event) => {
                                    const { width, height } = event.nativeEvent.layout;
                                    setPreviewCardSize({ width, height });
                                } }, { children: _jsx(FlatList, { ref: previewCardListRef, data: previewAssets, keyExtractor: (item, index) => `${item.uri}-${index}`, renderItem: renderPreviewItem, horizontal: true, pagingEnabled: true, showsHorizontalScrollIndicator: false, bounces: false, onMomentumScrollEnd: handleCardMomentumEnd, getItemLayout: previewCardPageWidth > 1 ? getPreviewItemLayout : undefined, scrollEnabled: previewAssets.length > 1, removeClippedSubviews: false }) })), previewAssets.length > 1 && (_jsx(View, Object.assign({ style: Styles.previewDotsRow }, { children: previewAssets.map((_, index) => (_jsx(View, { style: [Styles.previewDot, index === previewIndex && Styles.previewDotActive] }, `preview-dot-${index}`))) })))] })), _jsx(SizeBox, { height: 30 }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.previewButton, onPress: handleSave }, { children: [_jsx(Text, Object.assign({ style: Styles.previewButtonText }, { children: t('Next') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] })), _jsx(SizeBox, { height: 10 }), _jsx(TouchableOpacity, Object.assign({ style: Styles.skipButton, onPress: handleSkip }, { children: _jsx(Text, Object.assign({ style: Styles.skipButtonText }, { children: t('Skip') })) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ visible: previewModalVisible, transparent: true, animationType: "fade", onRequestClose: () => setPreviewModalVisible(false) }, { children: _jsxs(View, Object.assign({ style: Styles.previewModalOverlay }, { children: [_jsx(Pressable, { style: Styles.previewModalBackdrop, onPress: () => setPreviewModalVisible(false) }), _jsx(View, Object.assign({ style: Styles.previewModalContent, onLayout: (event) => {
                                const { width, height } = event.nativeEvent.layout;
                                setPreviewModalSize({ width, height });
                            } }, { children: _jsx(FlatList, { ref: previewModalListRef, data: previewAssets, keyExtractor: (item, index) => `${item.uri}-${index}`, renderItem: renderModalPreviewItem, horizontal: true, pagingEnabled: true, showsHorizontalScrollIndicator: false, bounces: false, onMomentumScrollEnd: handleModalMomentumEnd, getItemLayout: previewModalPageWidth > 1 ? getModalItemLayout : undefined, scrollEnabled: previewAssets.length > 1, removeClippedSubviews: false }) }))] })) }))] })));
};
export default WatermarkScreen;
