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
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, ArrowRight, Add, Minus, TickCircle } from 'iconsax-react-nativejs';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { addGroupCollectionItems, getGroupCollectionByType, removeGroupCollectionItems, setGroupCollectionFeatured, uploadMediaBatch, } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
import { createStyles } from '../editPhotoCollections/EditPhotoCollectionsStyles';
const GroupCollectionsManageScreen = ({ navigation, route }) => {
    var _a, _b, _c;
    const insets = useSafeAreaInsets();
    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const groupId = String(((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.groupId) || '').trim();
    const type = String(((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.type) || '').toLowerCase() === 'video' ? 'video' : 'image';
    const e2eFixtureFiles = useMemo(() => {
        var _a;
        return Array.isArray((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.e2eFixtureFiles)
            ? route.params.e2eFixtureFiles
                .map((entry) => ({
                uri: String((entry === null || entry === void 0 ? void 0 : entry.uri) || '').trim(),
                type: String((entry === null || entry === void 0 ? void 0 : entry.type) || (type === 'video' ? 'video/mp4' : 'image/jpeg')).trim(),
                name: String((entry === null || entry === void 0 ? void 0 : entry.name) || `${type}-${Date.now()}`).trim(),
            }))
                .filter((entry) => entry.uri.length > 0)
            : [];
    }, [(_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.e2eFixtureFiles, type]);
    const [selectionMode, setSelectionMode] = useState('none');
    const [selectedMediaIds, setSelectedMediaIds] = useState([]);
    const [collectionItems, setCollectionItems] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const e2eFixturesAppliedRef = useRef(false);
    const isSignedUrl = useCallback((value) => {
        if (!value)
            return false;
        const lower = String(value).toLowerCase();
        return (lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('token=') ||
            lower.includes('expires='));
    }, []);
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
    const resolveThumbUrl = useCallback((media) => {
        const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || media.original_url || null;
        const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);
    const loadData = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _d, _e;
        if (!apiAccessToken || !groupId) {
            setCollectionItems([]);
            return;
        }
        try {
            const collection = yield getGroupCollectionByType(apiAccessToken, groupId, type, {
                include_original: false,
            });
            setCollectionItems(Array.isArray(collection === null || collection === void 0 ? void 0 : collection.items) ? collection.items : []);
        }
        catch (e) {
            Alert.alert(t('Error'), String((_e = (_d = e === null || e === void 0 ? void 0 : e.message) !== null && _d !== void 0 ? _d : e) !== null && _e !== void 0 ? _e : t('Could not load collection')));
            setCollectionItems([]);
        }
    }), [apiAccessToken, groupId, t, type]);
    useFocusEffect(useCallback(() => {
        loadData();
    }, [loadData]));
    const featuredIds = useMemo(() => {
        return collectionItems
            .filter((item) => item.featured_rank != null)
            .sort((a, b) => { var _a, _b; return Number((_a = a.featured_rank) !== null && _a !== void 0 ? _a : 0) - Number((_b = b.featured_rank) !== null && _b !== void 0 ? _b : 0); })
            .map((item) => String(item.media_id));
    }, [collectionItems]);
    const handleSelectTop4 = () => {
        setSelectionMode('top4');
        setSelectedMediaIds(featuredIds);
    };
    const uploadFilesToCollection = useCallback((files) => __awaiter(void 0, void 0, void 0, function* () {
        var _f, _g;
        if (!apiAccessToken || !groupId || files.length === 0)
            return;
        setIsUploading(true);
        try {
            const uploaded = yield uploadMediaBatch(apiAccessToken, {
                files,
                skip_profile_collection: true,
            });
            const mediaIds = Array.isArray(uploaded === null || uploaded === void 0 ? void 0 : uploaded.results) ? uploaded.results.map((r) => r.media_id).filter(Boolean) : [];
            if (mediaIds.length > 0) {
                yield addGroupCollectionItems(apiAccessToken, { group_id: groupId, type, media_ids: mediaIds });
            }
            yield loadData();
        }
        catch (e) {
            Alert.alert(t('Upload failed'), String((_g = (_f = e === null || e === void 0 ? void 0 : e.message) !== null && _f !== void 0 ? _f : e) !== null && _g !== void 0 ? _g : t('Please try again')));
        }
        finally {
            setIsUploading(false);
        }
    }), [apiAccessToken, groupId, loadData, t, type]);
    useEffect(() => {
        if (e2eFixturesAppliedRef.current)
            return;
        if (e2eFixtureFiles.length === 0)
            return;
        e2eFixturesAppliedRef.current = true;
        void uploadFilesToCollection(e2eFixtureFiles);
    }, [e2eFixtureFiles, uploadFilesToCollection]);
    const handleAdd = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !groupId)
            return;
        const res = yield launchImageLibrary({
            mediaType: type === 'video' ? 'video' : 'photo',
            selectionLimit: type === 'video' ? 6 : 12,
            quality: type === 'video' ? undefined : 0.9,
            presentationStyle: 'fullScreen',
            assetRepresentationMode: 'current',
        });
        if (res.didCancel || !res.assets)
            return;
        const files = res.assets
            .filter((asset) => asset === null || asset === void 0 ? void 0 : asset.uri)
            .map((asset) => {
            var _a, _b;
            return ({
                uri: String(asset.uri),
                type: (_a = asset.type) !== null && _a !== void 0 ? _a : (type === 'video' ? 'video/mp4' : 'image/jpeg'),
                name: (_b = asset.fileName) !== null && _b !== void 0 ? _b : `${type}-${Date.now()}`,
            });
        });
        if (files.length === 0)
            return;
        yield uploadFilesToCollection(files);
    });
    const handleDelete = () => {
        setSelectionMode('delete');
        setSelectedMediaIds([]);
    };
    const handleCancel = () => {
        setSelectionMode('none');
        setSelectedMediaIds([]);
    };
    const toggleSelection = (mediaId) => {
        if (selectionMode === 'none')
            return;
        setSelectedMediaIds((prev) => {
            const index = prev.indexOf(mediaId);
            if (index !== -1)
                return prev.filter((id) => id !== mediaId);
            if (selectionMode === 'top4' && prev.length >= 4)
                return prev;
            return [...prev, mediaId];
        });
    };
    const handleConfirmDelete = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !groupId || selectedMediaIds.length === 0)
            return;
        yield removeGroupCollectionItems(apiAccessToken, { group_id: groupId, type, media_ids: selectedMediaIds });
        yield loadData();
        setSelectionMode('none');
        setSelectedMediaIds([]);
    });
    const handleConfirmTop4 = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !groupId)
            return;
        yield setGroupCollectionFeatured(apiAccessToken, { group_id: groupId, type, media_ids: selectedMediaIds });
        yield loadData();
        setSelectionMode('none');
        setSelectedMediaIds([]);
    });
    const getSelectionNumber = (mediaId) => {
        const index = selectedMediaIds.indexOf(mediaId);
        return index !== -1 ? index + 1 : null;
    };
    const getTitle = () => {
        if (selectionMode === 'top4')
            return t('Select Top 4 Picks');
        if (selectionMode === 'delete')
            return type === 'video' ? t('Select Videos to Delete') : t('Select Photos to Delete');
        return type === 'video' ? t('My Video Collections') : t('My Photo Collections');
    };
    const isInSelectionMode = selectionMode !== 'none';
    const isDeleteMode = selectionMode === 'delete';
    return (_jsxs(View, Object.assign({ style: styles.mainContainer, testID: `group-collections-manage-screen-${type}` }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: type === 'video' ? t('Edit Video Collections') : t('Edit Photo Collections') })), _jsxs(TouchableOpacity, Object.assign({ style: styles.headerSwitchButton, onPress: () => navigation.replace('GroupCollectionsManageScreen', {
                            groupId,
                            type: type === 'video' ? 'image' : 'video',
                        }) }, { children: [_jsx(Text, Object.assign({ style: styles.headerSwitchText }, { children: type === 'video' ? t('Photos') : t('Videos') })), _jsx(ArrowRight, { size: 18, color: colors.primaryColor, variant: "Linear" })] }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: styles.titleRow }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: getTitle() })), isInSelectionMode ? (_jsx(TouchableOpacity, Object.assign({ style: styles.cancelButton, onPress: handleCancel }, { children: _jsx(Text, Object.assign({ style: styles.cancelButtonText }, { children: t('Cancel') })) }))) : (_jsx(TouchableOpacity, Object.assign({ style: styles.selectTopButton, onPress: handleSelectTop4 }, { children: _jsx(Text, Object.assign({ style: styles.selectTopButtonText }, { children: t('Select Top 4') })) })))] })), _jsx(SizeBox, { height: 16 }), !isInSelectionMode && (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: styles.actionRow }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.addButton, onPress: handleAdd, disabled: isUploading, testID: `group-collections-add-${type}` }, { children: [_jsx(Add, { size: 20, color: colors.whiteColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.addButtonText }, { children: isUploading ? t('Uploading...') : type === 'video' ? t('Add Videos') : t('Add Photos') }))] })), _jsxs(TouchableOpacity, Object.assign({ style: styles.deleteButton, onPress: handleDelete }, { children: [_jsx(Minus, { size: 20, color: "#FF0000", variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.deleteButtonText }, { children: type === 'video' ? t('Delete Videos') : t('Delete Photos') }))] }))] })), _jsx(SizeBox, { height: 16 })] })), isDeleteMode && (_jsxs(_Fragment, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.confirmDeleteButton, onPress: handleConfirmDelete }, { children: [_jsx(Minus, { size: 18, color: colors.whiteColor, variant: "Linear" }), _jsxs(Text, Object.assign({ style: styles.confirmDeleteButtonText }, { children: [t('Confirm Delete'), " (", selectedMediaIds.length, ")"] }))] })), _jsx(SizeBox, { height: 12 })] })), selectionMode === 'top4' && (_jsxs(_Fragment, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.confirmTopButton, onPress: handleConfirmTop4 }, { children: [_jsx(TickCircle, { size: 18, color: colors.whiteColor, variant: "Bold" }), _jsxs(Text, Object.assign({ style: styles.confirmTopButtonText }, { children: [t('Confirm Top'), " ", selectedMediaIds.length] }))] })), _jsx(SizeBox, { height: 12 })] })), _jsx(View, Object.assign({ style: styles.photosContainer }, { children: _jsx(View, Object.assign({ style: styles.photosGrid }, { children: collectionItems.map((item) => {
                                const mediaId = String(item.media_id);
                                const isSelected = selectedMediaIds.includes(mediaId);
                                const selectionNumber = getSelectionNumber(mediaId);
                                const thumb = resolveThumbUrl(item);
                                return (_jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.8, onPress: () => toggleSelection(mediaId), testID: `group-collection-item-${mediaId}` }, { children: _jsxs(View, Object.assign({ style: [
                                            styles.photoImageContainer,
                                            { width: imageWidth },
                                            isSelected && (isDeleteMode ? styles.photoImageContainerSelectedDelete : styles.photoImageContainerSelected),
                                        ] }, { children: [thumb ? (_jsx(FastImage, { source: { uri: String(thumb) }, style: [styles.photoImage, { width: imageWidth - 2 }], resizeMode: "cover" })) : (_jsx(View, { style: [styles.photoImage, { width: imageWidth - 2, backgroundColor: colors.btnBackgroundColor }] })), selectionNumber !== null && (_jsx(View, Object.assign({ style: [styles.selectionBadge, isDeleteMode && styles.selectionBadgeDelete] }, { children: _jsx(Text, Object.assign({ style: styles.selectionBadgeText }, { children: selectionNumber })) })))] })) }), mediaId));
                            }) })) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default GroupCollectionsManageScreen;
