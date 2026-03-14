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
import { View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput, Alert } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, ArrowRight, Add, Minus } from 'iconsax-react-nativejs';
import Icons from '../../constants/Icons';
import SizeBox from '../../constants/SizeBox';
import { createStyles } from './EditVideoCollectionsStyles';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { getProfileCollectionByType, removeProfileCollectionItems, setProfileCollectionFeatured, updateProfileCollectionByType, uploadMediaBatch } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
const EditVideoCollectionsScreen = ({ navigation, route }) => {
    var _a, _b;
    const insets = useSafeAreaInsets();
    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const collectionScopeKey = useMemo(() => { var _a, _b; return String((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.collectionScopeKey) !== null && _b !== void 0 ? _b : 'default').trim() || 'default'; }, [(_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.collectionScopeKey]);
    const e2eFixtureFiles = useMemo(() => {
        var _a;
        return Array.isArray((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.e2eFixtureFiles)
            ? route.params.e2eFixtureFiles
                .map((entry) => ({
                uri: String((entry === null || entry === void 0 ? void 0 : entry.uri) || '').trim(),
                type: String((entry === null || entry === void 0 ? void 0 : entry.type) || 'video/mp4').trim(),
                name: String((entry === null || entry === void 0 ? void 0 : entry.name) || `video-${Date.now()}`).trim(),
            }))
                .filter((entry) => entry.uri.length > 0)
            : [];
    }, [(_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.e2eFixtureFiles]);
    const [selectionMode, setSelectionMode] = useState('none');
    const [selectedVideoIds, setSelectedVideoIds] = useState([]);
    const [collectionVideos, setCollectionVideos] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [collectionName, setCollectionName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const e2eFixturesAppliedRef = useRef(false);
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
        var _c, _d;
        if (!apiAccessToken) {
            setCollectionVideos([]);
            return;
        }
        try {
            const collection = yield getProfileCollectionByType(apiAccessToken, 'video', {
                scope_key: collectionScopeKey,
                include_original: false,
            });
            setCollectionVideos(Array.isArray(collection === null || collection === void 0 ? void 0 : collection.items) ? collection.items : []);
            setCollectionName(String((_d = (_c = collection === null || collection === void 0 ? void 0 : collection.collection) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : t('My Video Collections')));
        }
        catch (_e) {
            setCollectionVideos([]);
            setCollectionName(t('My Video Collections'));
        }
    }), [apiAccessToken, collectionScopeKey, t]);
    useFocusEffect(useCallback(() => {
        loadData();
    }, [loadData]));
    const featuredIds = useMemo(() => {
        return collectionVideos
            .filter((item) => item.featured_rank != null)
            .sort((a, b) => { var _a, _b; return Number((_a = a.featured_rank) !== null && _a !== void 0 ? _a : 0) - Number((_b = b.featured_rank) !== null && _b !== void 0 ? _b : 0); })
            .map((item) => String(item.media_id));
    }, [collectionVideos]);
    const handleSelectTop4 = () => {
        setSelectionMode('top4');
        setSelectedVideoIds(featuredIds);
    };
    const uploadFilesToCollection = useCallback((files) => __awaiter(void 0, void 0, void 0, function* () {
        var _f, _g;
        if (!apiAccessToken || files.length === 0)
            return;
        setIsUploading(true);
        try {
            yield uploadMediaBatch(apiAccessToken, {
                files,
                collection_scope_key: collectionScopeKey,
            });
            yield loadData();
        }
        catch (e) {
            Alert.alert(t('Upload failed'), String((_g = (_f = e === null || e === void 0 ? void 0 : e.message) !== null && _f !== void 0 ? _f : e) !== null && _g !== void 0 ? _g : t('Please try again.')));
        }
        finally {
            setIsUploading(false);
        }
    }), [apiAccessToken, collectionScopeKey, loadData, t]);
    useEffect(() => {
        if (e2eFixturesAppliedRef.current)
            return;
        if (e2eFixtureFiles.length === 0)
            return;
        e2eFixturesAppliedRef.current = true;
        void uploadFilesToCollection(e2eFixtureFiles);
    }, [e2eFixtureFiles, uploadFilesToCollection]);
    const handleAddVideos = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken)
            return;
        const res = yield launchImageLibrary({
            mediaType: 'video',
            selectionLimit: 6,
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
                type: (_a = asset.type) !== null && _a !== void 0 ? _a : 'video/mp4',
                name: (_b = asset.fileName) !== null && _b !== void 0 ? _b : `video-${Date.now()}`,
            });
        });
        if (files.length === 0)
            return;
        yield uploadFilesToCollection(files);
    });
    const handleDeleteVideos = () => {
        setSelectionMode('delete');
        setSelectedVideoIds([]);
    };
    const handleCancel = () => {
        setSelectionMode('none');
        setSelectedVideoIds([]);
    };
    const toggleVideoSelection = (videoId) => {
        if (selectionMode === 'none')
            return;
        setSelectedVideoIds((prev) => {
            const index = prev.indexOf(videoId);
            if (index !== -1) {
                return prev.filter((id) => id !== videoId);
            }
            if (selectionMode === 'top4' && prev.length >= 4) {
                return prev;
            }
            return [...prev, videoId];
        });
    };
    const handleConfirmDelete = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || selectedVideoIds.length === 0)
            return;
        yield removeProfileCollectionItems(apiAccessToken, {
            type: 'video',
            media_ids: selectedVideoIds,
            scope_key: collectionScopeKey,
        });
        yield loadData();
        setSelectionMode('none');
        setSelectedVideoIds([]);
    });
    const handleConfirmTop4 = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken)
            return;
        yield setProfileCollectionFeatured(apiAccessToken, {
            type: 'video',
            media_ids: selectedVideoIds,
            scope_key: collectionScopeKey,
        });
        yield loadData();
        setSelectionMode('none');
        setSelectedVideoIds([]);
    });
    const handleSaveCollectionName = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _h, _j;
        if (!apiAccessToken || isSavingName)
            return;
        const nextName = String(collectionName || '').trim();
        if (!nextName) {
            Alert.alert(t('Missing info'), t('Please enter a collection name.'));
            return;
        }
        setIsSavingName(true);
        try {
            yield updateProfileCollectionByType(apiAccessToken, {
                type: 'video',
                name: nextName,
                scope_key: collectionScopeKey,
            });
            yield loadData();
        }
        catch (e) {
            Alert.alert(t('Save failed'), String((_j = (_h = e === null || e === void 0 ? void 0 : e.message) !== null && _h !== void 0 ? _h : e) !== null && _j !== void 0 ? _j : t('Please try again')));
        }
        finally {
            setIsSavingName(false);
        }
    }), [apiAccessToken, collectionName, collectionScopeKey, isSavingName, loadData, t]);
    const getSelectionNumber = (videoId) => {
        const index = selectedVideoIds.indexOf(videoId);
        return index !== -1 ? index + 1 : null;
    };
    const getTitle = () => {
        switch (selectionMode) {
            case 'top4':
                return t('Select Top 4 Picks');
            case 'delete':
                return t('Select Videos to Delete');
            default:
                return t('My Video Collections');
        }
    };
    const isInSelectionMode = selectionMode !== 'none';
    const isDeleteMode = selectionMode === 'delete';
    return (_jsxs(View, Object.assign({ style: styles.mainContainer, testID: "edit-video-collections-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Edit Video Collections') })), _jsxs(TouchableOpacity, Object.assign({ style: styles.headerSwitchButton, onPress: () => navigation.navigate('EditPhotoCollectionsScreen') }, { children: [_jsx(Text, Object.assign({ style: styles.headerSwitchText }, { children: t('Photos') })), _jsx(ArrowRight, { size: 18, color: colors.primaryColor, variant: "Linear" })] }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: styles.titleRow }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: getTitle() })), isInSelectionMode ? (_jsx(TouchableOpacity, Object.assign({ style: styles.cancelButton, onPress: handleCancel }, { children: _jsx(Text, Object.assign({ style: styles.cancelButtonText }, { children: t('Cancel') })) }))) : (_jsx(TouchableOpacity, Object.assign({ style: styles.selectTopButton, onPress: handleSelectTop4 }, { children: _jsx(Text, Object.assign({ style: styles.selectTopButtonText }, { children: t('Select Top 4') })) })))] })), !isInSelectionMode && (_jsxs(View, Object.assign({ style: styles.renameRow }, { children: [_jsx(TextInput, { style: styles.renameInput, value: collectionName, onChangeText: setCollectionName, placeholder: t('Collection name'), placeholderTextColor: colors.subTextColor }), _jsx(TouchableOpacity, Object.assign({ style: [styles.renameSaveButton, isSavingName && styles.renameSaveButtonDisabled], onPress: handleSaveCollectionName, disabled: isSavingName }, { children: _jsx(Text, Object.assign({ style: styles.renameSaveText }, { children: isSavingName ? t('Saving...') : t('Save') })) }))] }))), !isInSelectionMode && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: styles.actionRow }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.addButton, onPress: handleAddVideos, disabled: isUploading }, { children: [_jsx(Text, Object.assign({ style: styles.addButtonText }, { children: isUploading ? t('Uploading...') : t('Add Videos') })), _jsx(Add, { size: 18, color: colors.pureWhite, variant: "Linear" })] })), _jsxs(TouchableOpacity, Object.assign({ style: styles.deleteButton, onPress: handleDeleteVideos }, { children: [_jsx(Text, Object.assign({ style: styles.deleteButtonText }, { children: t('Delete Videos') })), _jsx(Minus, { size: 18, color: "#FF0000", variant: "Linear" })] }))] }))] })), selectionMode === 'top4' && selectedVideoIds.length > 0 && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 16 }), _jsxs(TouchableOpacity, Object.assign({ style: styles.confirmTopButton, onPress: handleConfirmTop4 }, { children: [_jsxs(Text, Object.assign({ style: styles.confirmTopButtonText }, { children: [t('Confirm Top'), " ", selectedVideoIds.length] })), _jsx(Add, { size: 18, color: colors.pureWhite, variant: "Linear" })] }))] })), isDeleteMode && selectedVideoIds.length > 0 && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 16 }), _jsxs(TouchableOpacity, Object.assign({ style: styles.confirmDeleteButton, onPress: handleConfirmDelete }, { children: [_jsxs(Text, Object.assign({ style: styles.confirmDeleteButtonText }, { children: [t('Delete'), " ", selectedVideoIds.length, " ", t('Video'), selectedVideoIds.length > 1 ? 's' : ''] })), _jsx(Minus, { size: 18, color: colors.pureWhite, variant: "Linear" })] }))] })), _jsx(SizeBox, { height: isInSelectionMode ? 24 : 16 }), _jsx(View, Object.assign({ style: styles.videosContainer }, { children: _jsx(View, Object.assign({ style: styles.videosGrid }, { children: collectionVideos.map((video) => {
                                const mediaId = String(video.media_id);
                                const selectionNumber = getSelectionNumber(mediaId);
                                const isSelected = selectionNumber !== null;
                                const thumb = resolveThumbUrl(video);
                                return (_jsx(TouchableOpacity, Object.assign({ onPress: () => toggleVideoSelection(mediaId), activeOpacity: isInSelectionMode ? 0.7 : 1 }, { children: _jsxs(View, Object.assign({ style: [
                                            styles.videoImageContainer,
                                            { width: imageWidth },
                                            isSelected && (isDeleteMode
                                                ? styles.videoImageContainerSelectedDelete
                                                : styles.videoImageContainerSelected)
                                        ] }, { children: [thumb ? (_jsx(FastImage, { source: { uri: String(thumb) }, style: [styles.videoImage, { width: imageWidth - 2 }], resizeMode: "cover" })) : (_jsx(View, { style: [styles.videoImage, { width: imageWidth - 2, backgroundColor: colors.btnBackgroundColor }] })), _jsx(View, Object.assign({ style: styles.playIconContainer }, { children: _jsx(Icons.PlayCricle, { width: 20, height: 20 }) })), isSelected && (_jsx(View, Object.assign({ style: [
                                                    styles.selectionBadge,
                                                    isDeleteMode && styles.selectionBadgeDelete
                                                ] }, { children: _jsx(Text, Object.assign({ style: styles.selectionBadgeText }, { children: selectionNumber })) })))] })) }), mediaId));
                            }) })) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default EditVideoCollectionsScreen;
