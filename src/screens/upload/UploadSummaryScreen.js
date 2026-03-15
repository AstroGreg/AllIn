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
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, ArrowRight, Ghost } from 'iconsax-react-nativejs';
import { createStyles } from './UploadSummaryScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import Icons from '../../constants/Icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
function normalizeLocalUri(uri) {
    if (!uri)
        return uri;
    if (!uri.startsWith('file://'))
        return uri;
    let path = uri.slice('file://'.length);
    const q = path.indexOf('?');
    if (q !== -1)
        path = path.slice(0, q);
    try {
        path = decodeURI(path);
    }
    catch (_a) { }
    return `file://${path}`;
}
const PHOTO_PRICE_CAP_CENTS = 100;
const VIDEO_PRICE_CAP_CENTS = 500;
function isVideoType(type) {
    return String(type || '').toLowerCase().includes('video');
}
function priceCapForType(type) {
    return isVideoType(type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS;
}
function clampPriceCents(rawValue, maxCents) {
    const normalized = rawValue.replace(',', '.').replace(/[^\d.]/g, '');
    if (!normalized)
        return 0;
    const numeric = Number(normalized);
    if (!Number.isFinite(numeric))
        return 0;
    const cents = Math.round(Math.max(0, numeric) * 100);
    return Math.min(maxCents, cents);
}
const UploadSummaryScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const competition = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.competition;
    const account = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.account;
    const anonymous = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.anonymous;
    const competitionType = (_e = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.competitionType) !== null && _e !== void 0 ? _e : competition === null || competition === void 0 ? void 0 : competition.competitionType;
    const watermarkText = String((_j = (_g = (_f = route === null || route === void 0 ? void 0 : route.params) === null || _f === void 0 ? void 0 : _f.watermarkText) !== null && _g !== void 0 ? _g : (_h = route === null || route === void 0 ? void 0 : route.params) === null || _h === void 0 ? void 0 : _h.watermark_text) !== null && _j !== void 0 ? _j : '').trim();
    const [categories, setCategories] = useState([]);
    const competitionId = useMemo(() => String((competition === null || competition === void 0 ? void 0 : competition.id) || (competition === null || competition === void 0 ? void 0 : competition.event_id) || (competition === null || competition === void 0 ? void 0 : competition.eventId) || 'competition'), [competition === null || competition === void 0 ? void 0 : competition.event_id, competition === null || competition === void 0 ? void 0 : competition.eventId, competition === null || competition === void 0 ? void 0 : competition.id]);
    const formatResolution = useCallback((item) => {
        const width = Number((item === null || item === void 0 ? void 0 : item.width) || 0);
        const height = Number((item === null || item === void 0 ? void 0 : item.height) || 0);
        if (width && height) {
            return `${width}×${height}`;
        }
        return 'Original';
    }, []);
    useFocusEffect(useCallback(() => {
        let mounted = true;
        const loadAssets = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const assetsRaw = yield AsyncStorage.getItem(`@upload_assets_${competitionId}`);
                const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
                if (!mounted)
                    return;
                if (!parsed || typeof parsed !== 'object') {
                    setCategories([]);
                    return;
                }
                const sections = Object.entries(parsed).map(([name, items]) => {
                    const list = Array.isArray(items) ? items : [];
                    const mapped = list.map((asset, index) => {
                        var _a, _b, _c;
                        return ({
                            maxPriceCents: priceCapForType(asset === null || asset === void 0 ? void 0 : asset.type),
                            priceCents: Math.min(priceCapForType(asset === null || asset === void 0 ? void 0 : asset.type), Math.max(0, Number((_a = asset === null || asset === void 0 ? void 0 : asset.price_cents) !== null && _a !== void 0 ? _a : (isVideoType(asset === null || asset === void 0 ? void 0 : asset.type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS)))),
                            id: index + 1,
                            uri: normalizeLocalUri(asset === null || asset === void 0 ? void 0 : asset.uri),
                            thumbnail: (asset === null || asset === void 0 ? void 0 : asset.uri) ? { uri: normalizeLocalUri(asset.uri) } : undefined,
                            price: `€${(Math.min(priceCapForType(asset === null || asset === void 0 ? void 0 : asset.type), Math.max(0, Number((_b = asset === null || asset === void 0 ? void 0 : asset.price_cents) !== null && _b !== void 0 ? _b : (isVideoType(asset === null || asset === void 0 ? void 0 : asset.type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS)))) / 100).toFixed(2)}`,
                            priceInput: (Math.min(priceCapForType(asset === null || asset === void 0 ? void 0 : asset.type), Math.max(0, Number((_c = asset === null || asset === void 0 ? void 0 : asset.price_cents) !== null && _c !== void 0 ? _c : (isVideoType(asset === null || asset === void 0 ? void 0 : asset.type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS)))) / 100).toFixed(2),
                            resolution: formatResolution(asset),
                            type: asset === null || asset === void 0 ? void 0 : asset.type,
                        });
                    });
                    return {
                        name,
                        items: mapped,
                    };
                });
                setCategories(sections);
            }
            catch (_a) {
                if (mounted)
                    setCategories([]);
            }
        });
        loadAssets();
        return () => {
            mounted = false;
        };
    }, [competitionId, formatResolution]));
    useEffect(() => {
        let mounted = true;
        const loadAssets = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const assetsRaw = yield AsyncStorage.getItem(`@upload_assets_${competitionId}`);
                const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
                if (!mounted)
                    return;
                if (!parsed || typeof parsed !== 'object') {
                    setCategories([]);
                    return;
                }
                const sections = Object.entries(parsed).map(([name, items]) => {
                    const list = Array.isArray(items) ? items : [];
                    const mapped = list.map((asset, index) => {
                        var _a, _b, _c;
                        return ({
                            maxPriceCents: priceCapForType(asset === null || asset === void 0 ? void 0 : asset.type),
                            priceCents: Math.min(priceCapForType(asset === null || asset === void 0 ? void 0 : asset.type), Math.max(0, Number((_a = asset === null || asset === void 0 ? void 0 : asset.price_cents) !== null && _a !== void 0 ? _a : (isVideoType(asset === null || asset === void 0 ? void 0 : asset.type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS)))),
                            id: index + 1,
                            uri: normalizeLocalUri(asset === null || asset === void 0 ? void 0 : asset.uri),
                            thumbnail: (asset === null || asset === void 0 ? void 0 : asset.uri) ? { uri: normalizeLocalUri(asset.uri) } : undefined,
                            price: `€${(Math.min(priceCapForType(asset === null || asset === void 0 ? void 0 : asset.type), Math.max(0, Number((_b = asset === null || asset === void 0 ? void 0 : asset.price_cents) !== null && _b !== void 0 ? _b : (isVideoType(asset === null || asset === void 0 ? void 0 : asset.type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS)))) / 100).toFixed(2)}`,
                            priceInput: (Math.min(priceCapForType(asset === null || asset === void 0 ? void 0 : asset.type), Math.max(0, Number((_c = asset === null || asset === void 0 ? void 0 : asset.price_cents) !== null && _c !== void 0 ? _c : (isVideoType(asset === null || asset === void 0 ? void 0 : asset.type) ? VIDEO_PRICE_CAP_CENTS : PHOTO_PRICE_CAP_CENTS)))) / 100).toFixed(2),
                            resolution: formatResolution(asset),
                            type: asset === null || asset === void 0 ? void 0 : asset.type,
                        });
                    });
                    return {
                        name,
                        items: mapped,
                    };
                });
                setCategories(sections);
            }
            catch (_a) {
                if (mounted)
                    setCategories([]);
            }
        });
        loadAssets();
        return () => {
            mounted = false;
        };
    }, [competitionId, formatResolution]);
    const handleConfirm = () => {
        const sessionId = `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        navigation.navigate('UploadProgressScreen', {
            competition,
            account,
            anonymous,
            competitionType,
            watermarkText,
            sessionId,
            autoStart: true,
        });
    };
    const persistPrice = useCallback((categoryName, itemIndex, cents) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const key = `@upload_assets_${competitionId}`;
            const assetsRaw = yield AsyncStorage.getItem(key);
            const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
            const list = Array.isArray(parsed === null || parsed === void 0 ? void 0 : parsed[categoryName]) ? [...parsed[categoryName]] : [];
            if (!list[itemIndex])
                return;
            list[itemIndex] = Object.assign(Object.assign({}, list[itemIndex]), { price_cents: cents, price_currency: 'EUR' });
            parsed[categoryName] = list;
            yield AsyncStorage.setItem(key, JSON.stringify(parsed));
        }
        catch (_k) {
            // ignore
        }
    }), [competitionId]);
    const handlePriceInputChange = useCallback((categoryName, itemId, value) => {
        setCategories((prev) => prev.map((section) => {
            if (section.name !== categoryName)
                return section;
            return Object.assign(Object.assign({}, section), { items: section.items.map((item) => {
                    if (item.id !== itemId)
                        return item;
                    const cents = clampPriceCents(value, item.maxPriceCents);
                    return Object.assign(Object.assign({}, item), { priceInput: value, priceCents: cents, price: `€${(cents / 100).toFixed(2)}` });
                }) });
        }));
    }, []);
    const handlePriceInputBlur = useCallback((categoryName, itemId) => {
        var _a;
        const section = categories.find((s) => s.name === categoryName);
        const idx = (_a = section === null || section === void 0 ? void 0 : section.items.findIndex((it) => it.id === itemId)) !== null && _a !== void 0 ? _a : -1;
        const current = idx >= 0 && section ? section.items[idx] : null;
        if (!current || idx < 0)
            return;
        const cents = clampPriceCents(current.priceInput, current.maxPriceCents);
        setCategories((prev) => prev.map((section) => {
            if (section.name !== categoryName)
                return section;
            const nextItems = section.items.map((item, _idx) => {
                if (item.id !== itemId)
                    return item;
                return Object.assign(Object.assign({}, item), { priceCents: cents, price: `€${(cents / 100).toFixed(2)}`, priceInput: (cents / 100).toFixed(2) });
            });
            return Object.assign(Object.assign({}, section), { items: nextItems });
        }));
        persistPrice(categoryName, idx, cents);
    }, [categories, persistPrice]);
    const renderUploadItem = (item, categoryName) => {
        const isVideo = String(item.type || '').toLowerCase().includes('video');
        return (_jsxs(View, Object.assign({ style: Styles.uploadItem, testID: `upload-summary-item-${categoryName}-${item.id}` }, { children: [_jsxs(View, Object.assign({ style: Styles.thumbnailContainer }, { children: [isVideo && item.uri ? (_jsx(Video, { source: { uri: item.uri }, style: Styles.thumbnail, resizeMode: "cover", paused: true, muted: true, repeat: false, controls: false, onError: () => { } })) : item.thumbnail ? (_jsx(FastImage, { source: item.thumbnail, style: Styles.thumbnail, resizeMode: "cover" })) : (_jsx(View, { style: Styles.thumbnailPlaceholder })), isVideo && (_jsx(View, Object.assign({ style: Styles.playButton }, { children: _jsx(Icons.PlayCricle, { width: 22, height: 22 }) })))] })), _jsxs(View, Object.assign({ style: Styles.itemInfo }, { children: [_jsxs(View, Object.assign({ style: Styles.priceInputRow }, { children: [_jsx(Text, Object.assign({ style: Styles.priceEuro }, { children: "\u20AC" })), _jsx(TextInput, { style: Styles.priceInput, value: item.priceInput, keyboardType: "decimal-pad", onChangeText: (value) => handlePriceInputChange(categoryName, item.id, value), onBlur: () => handlePriceInputBlur(categoryName, item.id) })] })), _jsxs(Text, Object.assign({ style: Styles.resolutionText }, { children: [item.resolution === 'Original' ? t('Original') : item.resolution, " ", '·', " ", t('max'), " \u20AC", (item.maxPriceCents / 100).toFixed(2)] }))] }))] }), item.id));
    };
    const renderCategory = (category, index) => (_jsxs(View, Object.assign({ style: Styles.categorySection }, { children: [_jsx(Text, Object.assign({ style: Styles.categoryTitle }, { children: category.name })), _jsx(SizeBox, { height: 16 }), _jsx(View, Object.assign({ style: Styles.itemsGrid }, { children: category.items.map((item) => renderUploadItem(item, category.name)) }))] }), index));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "upload-summary-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Upload Summary') })), anonymous ? (_jsx(View, Object.assign({ style: Styles.headerGhost }, { children: _jsx(Ghost, { size: 22, color: colors.primaryColor, variant: "Linear" }) }))) : (_jsx(View, { style: Styles.headerSpacer }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [categories.length === 0 && (_jsx(View, Object.assign({ style: Styles.emptyState }, { children: _jsx(Text, Object.assign({ style: Styles.emptyStateText }, { children: t('No uploads yet.') })) }))), categories.map(renderCategory), _jsx(SizeBox, { height: 30 }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.confirmButton, onPress: handleConfirm, testID: "upload-start-button" }, { children: [_jsx(Text, Object.assign({ style: Styles.confirmButtonText }, { children: t('Start upload') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default UploadSummaryScreen;
