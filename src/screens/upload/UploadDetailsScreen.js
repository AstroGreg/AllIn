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
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, InteractionManager } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createStyles } from './UploadDetailsStyles';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft2, Ghost } from 'iconsax-react-nativejs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
function fileUriToPath(uri) {
    if (!uri || !uri.startsWith('file://'))
        return uri;
    let path = uri.slice('file://'.length);
    const q = path.indexOf('?');
    if (q !== -1)
        path = path.slice(0, q);
    try {
        path = decodeURI(path);
    }
    catch (_a) { }
    return path;
}
function ensureFileScheme(pathOrUri) {
    if (!pathOrUri)
        return pathOrUri;
    if (pathOrUri.startsWith('file://'))
        return pathOrUri;
    return `file://${pathOrUri}`;
}
function normalizeFileUri(uri) {
    if (!uri)
        return uri;
    if (!uri.startsWith('file://'))
        return uri;
    return ensureFileScheme(fileUriToPath(uri));
}
function isVideoAssetType(type) {
    return String(type || '').toLowerCase().includes('video');
}
function defaultPriceCentsForType(type) {
    return isVideoAssetType(type) ? 500 : 100;
}
function deriveVideoTitleFromFileName(fileName) {
    const raw = String(fileName || '').trim();
    if (!raw)
        return '';
    const withoutExtension = raw.replace(/\.[^.]+$/, '');
    return withoutExtension.replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
}
const UploadDetailsScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [isPreparingAssets, setIsPreparingAssets] = useState(false);
    const [preparingAssetIndex, setPreparingAssetIndex] = useState(0);
    const [preparingAssetTotal, setPreparingAssetTotal] = useState(0);
    const [allPhotosPrice, setAllPhotosPrice] = useState('1.00');
    const [allVideosPrice, setAllVideosPrice] = useState('5.00');
    const competition = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.competition;
    const category = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.category;
    const account = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.account;
    const anonymous = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.anonymous;
    const competitionType = (_f = (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.competitionType) !== null && _f !== void 0 ? _f : competition === null || competition === void 0 ? void 0 : competition.competitionType;
    const selectedCompetitionMapId = String((_j = (_h = (_g = route === null || route === void 0 ? void 0 : route.params) === null || _g === void 0 ? void 0 : _g.competition_map_id) !== null && _h !== void 0 ? _h : category === null || category === void 0 ? void 0 : category.competition_map_id) !== null && _j !== void 0 ? _j : '').trim() || null;
    const selectedDisciplineId = String((_o = (_m = (_l = (_k = route === null || route === void 0 ? void 0 : route.params) === null || _k === void 0 ? void 0 : _k.discipline_id) !== null && _l !== void 0 ? _l : category === null || category === void 0 ? void 0 : category.id) !== null && _m !== void 0 ? _m : category === null || category === void 0 ? void 0 : category.discipline_id) !== null && _o !== void 0 ? _o : '').trim() || null;
    const selectedCheckpointId = String((_r = (_q = (_p = route === null || route === void 0 ? void 0 : route.params) === null || _p === void 0 ? void 0 : _p.checkpoint_id) !== null && _q !== void 0 ? _q : category === null || category === void 0 ? void 0 : category.checkpoint_id) !== null && _r !== void 0 ? _r : '').trim() || null;
    const selectedCheckpointLabel = String((_u = (_t = (_s = route === null || route === void 0 ? void 0 : route.params) === null || _s === void 0 ? void 0 : _s.checkpoint_label) !== null && _t !== void 0 ? _t : category === null || category === void 0 ? void 0 : category.checkpoint_label) !== null && _u !== void 0 ? _u : '').trim() || null;
    const e2eFixtureFiles = useMemo(() => { var _a; return Array.isArray((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.e2eFixtureFiles) ? route.params.e2eFixtureFiles : []; }, [(_v = route === null || route === void 0 ? void 0 : route.params) === null || _v === void 0 ? void 0 : _v.e2eFixtureFiles]);
    useEffect(() => {
        if (!Array.isArray(e2eFixtureFiles) || e2eFixtureFiles.length === 0)
            return;
        const mapped = e2eFixtureFiles
            .map((entry, index) => {
            const uri = normalizeFileUri(String((entry === null || entry === void 0 ? void 0 : entry.uri) || ''));
            if (!uri)
                return null;
            const type = String((entry === null || entry === void 0 ? void 0 : entry.type) || '').trim() || undefined;
            const fileName = String((entry === null || entry === void 0 ? void 0 : entry.fileName) || (entry === null || entry === void 0 ? void 0 : entry.name) || `e2e-upload-${index + 1}`).trim() || `e2e-upload-${index + 1}`;
            return {
                uri,
                type,
                fileName,
                title: isVideoAssetType(type) ? deriveVideoTitleFromFileName(fileName) : '',
                width: Number((entry === null || entry === void 0 ? void 0 : entry.width) || 0) || undefined,
                height: Number((entry === null || entry === void 0 ? void 0 : entry.height) || 0) || undefined,
                price_cents: defaultPriceCentsForType(type),
                price_currency: 'EUR',
            };
        })
            .filter(Boolean);
        if (mapped.length > 0) {
            setSelectedAssets(mapped);
        }
    }, [e2eFixtureFiles]);
    const handleFilePicker = () => __awaiter(void 0, void 0, void 0, function* () {
        const options = {
            mediaType: 'mixed',
            selectionLimit: 20,
            quality: 1,
            presentationStyle: 'fullScreen',
            assetRepresentationMode: 'current',
        };
        try {
            const result = yield launchImageLibrary(options);
            if (result.assets) {
                setIsPreparingAssets(true);
                setPreparingAssetIndex(0);
                setPreparingAssetTotal(result.assets.length);
                yield new Promise((resolve) => {
                    requestAnimationFrame(() => resolve());
                });
                // Copy to a persistent app directory immediately so the temp picker path
                // doesn't disappear before we upload (common on iOS for /tmp files).
                const destDir = `${RNFS.DocumentDirectoryPath}/allin_uploads`;
                try {
                    yield RNFS.mkdir(destDir);
                }
                catch (_w) { }
                const copied = [];
                for (let i = 0; i < result.assets.length; i += 1) {
                    setPreparingAssetIndex(i + 1);
                    const a = result.assets[i];
                    const uri = normalizeFileUri(String((a === null || a === void 0 ? void 0 : a.uri) || ''));
                    if (!uri)
                        continue;
                    const fileName = String((a === null || a === void 0 ? void 0 : a.fileName) || `upload-${Date.now()}-${i}`);
                    const safeName = fileName.replace(/[^\w.\-]+/g, '_');
                    const destPath = `${destDir}/${Date.now()}-${i}-${safeName}`;
                    // Only copy file:// uris; keep other schemes as-is (android content:// etc).
                    let finalUri = uri;
                    try {
                        if (uri.startsWith('file://')) {
                            yield RNFS.copyFile(fileUriToPath(uri), destPath);
                            finalUri = ensureFileScheme(destPath);
                        }
                    }
                    catch (_x) {
                        // Keep original URI if copy fails.
                        finalUri = normalizeFileUri(uri);
                    }
                    copied.push(Object.assign(Object.assign({}, a), { uri: finalUri, fileName: safeName, title: isVideoAssetType(a === null || a === void 0 ? void 0 : a.type) ? deriveVideoTitleFromFileName(safeName) : '', price_cents: defaultPriceCentsForType(a === null || a === void 0 ? void 0 : a.type), price_currency: 'EUR' }));
                }
                setSelectedAssets(copied);
                yield new Promise((resolve) => {
                    requestAnimationFrame(() => resolve());
                });
                yield new Promise((resolve) => {
                    InteractionManager.runAfterInteractions(() => resolve());
                });
            }
        }
        catch (error) {
            console.error('Error picking media:', error);
        }
        finally {
            setIsPreparingAssets(false);
            setPreparingAssetIndex(0);
            setPreparingAssetTotal(0);
        }
    });
    const parseEuroToCents = (value, maxCents) => {
        const normalized = String(value || '').replace(',', '.').trim();
        const parsed = Number.parseFloat(normalized);
        if (!Number.isFinite(parsed) || parsed < 0)
            return 0;
        return Math.min(Math.round(parsed * 100), maxCents);
    };
    const applyPriceToType = (type) => {
        setSelectedAssets((prev) => prev.map((asset) => {
            const isVideo = isVideoAssetType(asset === null || asset === void 0 ? void 0 : asset.type);
            if ((type === 'video') !== isVideo)
                return asset;
            const cents = type === 'video'
                ? parseEuroToCents(allVideosPrice, 500)
                : parseEuroToCents(allPhotosPrice, 100);
            return Object.assign(Object.assign({}, asset), { price_cents: cents, price_currency: 'EUR' });
        }));
    };
    const setVideoTitleAtIndex = (index, nextTitle) => {
        setSelectedAssets((prev) => prev.map((asset, assetIndex) => {
            if (assetIndex !== index)
                return asset;
            if (!isVideoAssetType(asset === null || asset === void 0 ? void 0 : asset.type))
                return asset;
            return Object.assign(Object.assign({}, asset), { title: nextTitle });
        }));
    };
    const handleUpload = () => __awaiter(void 0, void 0, void 0, function* () {
        if (selectedAssets.length === 0)
            return;
        const competitionId = String((competition === null || competition === void 0 ? void 0 : competition.id) || (competition === null || competition === void 0 ? void 0 : competition.event_id) || (competition === null || competition === void 0 ? void 0 : competition.eventId) || 'competition');
        const eventName = String((category === null || category === void 0 ? void 0 : category.name) || 'Unlabelled');
        try {
            const assetsKey = `@upload_assets_${competitionId}`;
            const existingAssetsRaw = yield AsyncStorage.getItem(assetsKey);
            const existingAssets = existingAssetsRaw ? JSON.parse(existingAssetsRaw) : {};
            const safeExisting = existingAssets && typeof existingAssets === 'object' ? existingAssets : {};
            const mappedAssets = selectedAssets.map((asset) => {
                var _a;
                return ({
                    uri: asset === null || asset === void 0 ? void 0 : asset.uri,
                    type: asset === null || asset === void 0 ? void 0 : asset.type,
                    fileName: asset === null || asset === void 0 ? void 0 : asset.fileName,
                    title: isVideoAssetType(asset === null || asset === void 0 ? void 0 : asset.type) ? String((asset === null || asset === void 0 ? void 0 : asset.title) || '').trim() : '',
                    width: asset === null || asset === void 0 ? void 0 : asset.width,
                    height: asset === null || asset === void 0 ? void 0 : asset.height,
                    price_cents: Number((_a = asset === null || asset === void 0 ? void 0 : asset.price_cents) !== null && _a !== void 0 ? _a : defaultPriceCentsForType(asset === null || asset === void 0 ? void 0 : asset.type)),
                    price_currency: String((asset === null || asset === void 0 ? void 0 : asset.price_currency) || 'EUR'),
                    discipline_id: selectedDisciplineId,
                    competition_map_id: selectedCompetitionMapId,
                    checkpoint_id: selectedCheckpointId,
                    checkpoint_label: selectedCheckpointLabel,
                });
            }).filter((asset) => asset.uri);
            // Overwrite the category selection instead of appending forever (keeps the UI clean).
            safeExisting[eventName] = mappedAssets;
            yield AsyncStorage.setItem(assetsKey, JSON.stringify(safeExisting));
        }
        catch (_y) {
            // ignore
        }
        navigation.navigate('UploadSummaryScreen', {
            competition,
            account,
            anonymous,
            competitionType,
            watermarkText: 'SpotMe',
        });
    });
    const selectedCount = selectedAssets.length;
    const buttonLabel = useMemo(() => (selectedCount > 0 ? t('Next') : t('Select files')), [selectedCount, t]);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "upload-details-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Upload') })), anonymous ? (_jsx(View, Object.assign({ style: Styles.headerGhost }, { children: _jsx(Ghost, { size: 22, color: colors.primaryColor, variant: "Linear" }) }))) : (_jsx(View, { style: Styles.headerSpacer }))] })), _jsxs(View, Object.assign({ style: Styles.container }, { children: [_jsx(Text, Object.assign({ style: Styles.titleText }, { children: t('Choose files') })), selectedCount > 0 && (_jsx(View, Object.assign({ style: Styles.selectedImagesContainer }, { children: _jsxs(Text, Object.assign({ style: Styles.subText }, { children: [t('Selected'), " ", selectedCount, " ", t('files')] })) }))), _jsx(SizeBox, { height: 12 }), _jsx(TouchableOpacity, Object.assign({ style: [Styles.uploadContainer, isPreparingAssets && Styles.uploadContainerDisabled], onPress: handleFilePicker, disabled: isPreparingAssets, testID: "upload-browse-files-button" }, { children: _jsx(Text, Object.assign({ style: Styles.uploadText }, { children: t('Browse files') })) })), selectedCount > 0 ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 14 }), _jsxs(View, Object.assign({ style: Styles.bulkPriceCard }, { children: [_jsx(Text, Object.assign({ style: Styles.bulkPriceTitle }, { children: t('Bulk price') })), _jsxs(View, Object.assign({ style: Styles.bulkPriceRow }, { children: [_jsx(TextInput, { style: Styles.bulkPriceInput, value: allPhotosPrice, onChangeText: setAllPhotosPrice, keyboardType: "decimal-pad", placeholder: "1.00", placeholderTextColor: colors.grayColor }), _jsx(TouchableOpacity, Object.assign({ style: Styles.bulkPriceButton, onPress: () => applyPriceToType('photo') }, { children: _jsx(Text, Object.assign({ style: Styles.bulkPriceButtonText }, { children: t('Set all photos') })) }))] })), _jsx(Text, Object.assign({ style: Styles.bulkPriceHint }, { children: t('Max €1.00 per photo') })), _jsxs(View, Object.assign({ style: Styles.bulkPriceRow }, { children: [_jsx(TextInput, { style: Styles.bulkPriceInput, value: allVideosPrice, onChangeText: setAllVideosPrice, keyboardType: "decimal-pad", placeholder: "5.00", placeholderTextColor: colors.grayColor }), _jsx(TouchableOpacity, Object.assign({ style: Styles.bulkPriceButton, onPress: () => applyPriceToType('video') }, { children: _jsx(Text, Object.assign({ style: Styles.bulkPriceButtonText }, { children: t('Set all videos') })) }))] })), _jsx(Text, Object.assign({ style: Styles.bulkPriceHint }, { children: t('Max €5.00 per video') }))] }))] })) : null, _jsx(SizeBox, { height: 20 }), selectedAssets.some((asset) => isVideoAssetType(asset === null || asset === void 0 ? void 0 : asset.type)) ? (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.bulkPriceCard }, { children: [_jsx(Text, Object.assign({ style: Styles.bulkPriceTitle }, { children: t('Video titles') })), selectedAssets.map((asset, index) => {
                                        if (!isVideoAssetType(asset === null || asset === void 0 ? void 0 : asset.type))
                                            return null;
                                        return (_jsxs(View, Object.assign({ style: Styles.videoTitleCard }, { children: [_jsx(Text, Object.assign({ style: Styles.videoTitleLabel, numberOfLines: 1 }, { children: (asset === null || asset === void 0 ? void 0 : asset.fileName) || t('Video') })), _jsx(TextInput, { style: Styles.bulkPriceInput, value: String((asset === null || asset === void 0 ? void 0 : asset.title) || ''), onChangeText: (value) => setVideoTitleAtIndex(index, value), placeholder: t('Give this video a title'), placeholderTextColor: colors.grayColor, testID: `upload-video-title-input-${index}` })] }), `${(asset === null || asset === void 0 ? void 0 : asset.fileName) || 'video'}-${index}`));
                                    })] })), _jsx(SizeBox, { height: 20 })] })) : null, _jsx(TouchableOpacity, Object.assign({ style: [
                            Styles.btnContianer,
                            { opacity: selectedCount > 0 && !isPreparingAssets ? 1 : 0.5 }
                        ], onPress: handleUpload, disabled: selectedCount === 0 || isPreparingAssets, testID: "upload-details-next-button" }, { children: _jsx(Text, Object.assign({ style: Styles.btnText }, { children: buttonLabel })) }))] })), isPreparingAssets ? (_jsx(View, Object.assign({ style: Styles.preparingOverlay }, { children: _jsxs(View, Object.assign({ style: Styles.preparingCard }, { children: [_jsx(ActivityIndicator, { size: "large", color: colors.primaryColor }), _jsx(SizeBox, { height: 14 }), _jsx(Text, Object.assign({ style: Styles.preparingTitle }, { children: t('Preparing files') })), _jsx(SizeBox, { height: 6 }), _jsx(Text, Object.assign({ style: Styles.preparingText }, { children: preparingAssetTotal > 0
                                ? `${preparingAssetIndex}/${preparingAssetTotal} ${t('files')}`
                                : t('Preparing selected media...') }))] })) }))) : null] })));
};
export default UploadDetailsScreen;
