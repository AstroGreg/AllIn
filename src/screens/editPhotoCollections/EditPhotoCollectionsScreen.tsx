import { View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput, Alert } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, ArrowRight, Add, Minus } from 'iconsax-react-nativejs'
import SizeBox from '../../constants/SizeBox'
import { createStyles } from './EditPhotoCollectionsStyles'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useFocusEffect } from '@react-navigation/native'
import { addProfileCollectionItems, getProfileCollectionByType, removeProfileCollectionItems, setProfileCollectionFeatured, updateProfileCollectionByType, uploadMediaBatch, type ProfileCollectionItem } from '../../services/apiGateway'
import { getApiBaseUrl } from '../../constants/RuntimeConfig'
import { useTranslation } from 'react-i18next'
import { launchImageLibrary } from 'react-native-image-picker'

type SelectionMode = 'none' | 'top4' | 'delete';

const EditPhotoCollectionsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken } = useAuth();

    const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');
    const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
    const [collectionPhotos, setCollectionPhotos] = useState<ProfileCollectionItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [collectionName, setCollectionName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    const isSignedUrl = useCallback((value?: string | null) => {
        if (!value) return false;
        const lower = String(value).toLowerCase();
        return (
            lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp=')
        );
    }, []);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    const withAccessToken = useCallback((value?: string | null) => {
        if (!value) return undefined;
        if (!apiAccessToken) return value;
        if (isSignedUrl(value)) return value;
        if (value.includes('access_token=')) return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);

    const resolveThumbUrl = useCallback((media: ProfileCollectionItem) => {
        const thumbCandidate =
            media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || media.original_url || null;
        const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);

    const loadData = useCallback(async () => {
        if (!apiAccessToken) {
            setCollectionPhotos([]);
            return;
        }
        try {
            const collection = await getProfileCollectionByType(apiAccessToken, 'image');
            setCollectionPhotos(Array.isArray(collection?.items) ? collection.items : []);
            setCollectionName(String(collection?.collection?.name ?? t('My Photo Collections')));
        } catch {
            setCollectionPhotos([]);
            setCollectionName(t('My Photo Collections'));
        }
    }, [apiAccessToken, t]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData]),
    );

    const featuredIds = useMemo(() => {
        return collectionPhotos
            .filter((item) => item.featured_rank != null)
            .sort((a, b) => Number(a.featured_rank ?? 0) - Number(b.featured_rank ?? 0))
            .map((item) => String(item.media_id));
    }, [collectionPhotos]);

    const handleSelectTop4 = () => {
        setSelectionMode('top4');
        setSelectedPhotoIds(featuredIds);
    };

    const handleAddPhotos = async () => {
        if (!apiAccessToken) return;
        const res = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 12,
            quality: 0.9,
        });
        if (res.didCancel || !res.assets) return;
        const files = res.assets
            .filter((asset) => asset?.uri)
            .map((asset) => ({
                uri: String(asset.uri),
                type: asset.type ?? 'image/jpeg',
                name: asset.fileName ?? `photo-${Date.now()}`,
            }));
        if (files.length === 0) return;
        setIsUploading(true);
        try {
            const uploaded = await uploadMediaBatch(apiAccessToken, { files });
            const mediaIds = Array.isArray(uploaded?.results)
                ? uploaded.results.map((r: any) => r.media_id).filter(Boolean)
                : [];
            if (mediaIds.length > 0) {
                await addProfileCollectionItems(apiAccessToken, { type: 'image', media_ids: mediaIds });
            }
            await loadData();
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeletePhotos = () => {
        setSelectionMode('delete');
        setSelectedPhotoIds([]);
    };

    const handleCancel = () => {
        setSelectionMode('none');
        setSelectedPhotoIds([]);
    };

    const togglePhotoSelection = (photoId: string) => {
        if (selectionMode === 'none') return;

        setSelectedPhotoIds((prev) => {
            const index = prev.indexOf(photoId);
            if (index !== -1) {
                return prev.filter((id) => id !== photoId);
            }
            if (selectionMode === 'top4' && prev.length >= 4) {
                return prev;
            }
            return [...prev, photoId];
        });
    };

    const handleConfirmDelete = async () => {
        if (!apiAccessToken || selectedPhotoIds.length === 0) return;
        await removeProfileCollectionItems(apiAccessToken, { type: 'image', media_ids: selectedPhotoIds });
        await loadData();
        setSelectionMode('none');
        setSelectedPhotoIds([]);
    };

    const handleConfirmTop4 = async () => {
        if (!apiAccessToken) return;
        await setProfileCollectionFeatured(apiAccessToken, { type: 'image', media_ids: selectedPhotoIds });
        await loadData();
        setSelectionMode('none');
        setSelectedPhotoIds([]);
    };

    const handleSaveCollectionName = useCallback(async () => {
        if (!apiAccessToken || isSavingName) return;
        const nextName = String(collectionName || '').trim();
        if (!nextName) {
            Alert.alert(t('Missing info'), t('Please enter a collection name.'));
            return;
        }
        setIsSavingName(true);
        try {
            await updateProfileCollectionByType(apiAccessToken, { type: 'image', name: nextName });
            await loadData();
        } catch (e: any) {
            Alert.alert(t('Save failed'), String(e?.message ?? e ?? t('Please try again')));
        } finally {
            setIsSavingName(false);
        }
    }, [apiAccessToken, collectionName, isSavingName, loadData, t]);

    const getSelectionNumber = (photoId: string): number | null => {
        const index = selectedPhotoIds.indexOf(photoId);
        return index !== -1 ? index + 1 : null;
    };

    const getTitle = () => {
        switch (selectionMode) {
            case 'top4':
                return t('Select Top 4 Picks');
            case 'delete':
                return t('Select Photos to Delete');
            default:
                return t('My Photo Collections');
        }
    };

    const isInSelectionMode = selectionMode !== 'none';
    const isDeleteMode = selectionMode === 'delete';

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Edit Photo Collections')}</Text>
                <TouchableOpacity
                    style={styles.headerSwitchButton}
                    onPress={() => navigation.navigate('EditVideoCollectionsScreen')}
                >
                    <Text style={styles.headerSwitchText}>{t('Videos')}</Text>
                    <ArrowRight size={18} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Title Row */}
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{getTitle()}</Text>
                    {isInSelectionMode ? (
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.selectTopButton} onPress={handleSelectTop4}>
                            <Text style={styles.selectTopButtonText}>{t('Select Top 4')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {!isInSelectionMode && (
                    <View style={styles.renameRow}>
                        <TextInput
                            style={styles.renameInput}
                            value={collectionName}
                            onChangeText={setCollectionName}
                            placeholder={t('Collection name')}
                            placeholderTextColor={colors.subTextColor}
                        />
                        <TouchableOpacity
                            style={[styles.renameSaveButton, isSavingName && styles.renameSaveButtonDisabled]}
                            onPress={handleSaveCollectionName}
                            disabled={isSavingName}
                        >
                            <Text style={styles.renameSaveText}>{isSavingName ? t('Saving...') : t('Save')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!isInSelectionMode && (
                    <>
                        <SizeBox height={16} />

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.addButton} onPress={handleAddPhotos} disabled={isUploading}>
                                <Text style={styles.addButtonText}>{isUploading ? t('Uploading...') : t('Add Photos')}</Text>
                                <Add size={18} color={colors.pureWhite} variant="Linear" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePhotos}>
                                <Text style={styles.deleteButtonText}>{t('Delete Photos')}</Text>
                                <Minus size={18} color="#FF0000" variant="Linear" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {selectionMode === 'top4' && selectedPhotoIds.length > 0 && (
                    <>
                        <SizeBox height={16} />
                        <TouchableOpacity style={styles.confirmTopButton} onPress={handleConfirmTop4}>
                            <Text style={styles.confirmTopButtonText}>
                                {t('Confirm Top')} {selectedPhotoIds.length}
                            </Text>
                            <Add size={18} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                {isDeleteMode && selectedPhotoIds.length > 0 && (
                    <>
                        <SizeBox height={16} />
                        <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleConfirmDelete}>
                            <Text style={styles.confirmDeleteButtonText}>
                                {t('Delete')} {selectedPhotoIds.length} {t('Photo')}{selectedPhotoIds.length > 1 ? 's' : ''}
                            </Text>
                            <Minus size={18} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                <SizeBox height={isInSelectionMode ? 24 : 16} />

                {/* Photos Grid */}
                <View style={styles.photosContainer}>
                    <View style={styles.photosGrid}>
                        {collectionPhotos.map((photo) => {
                            const mediaId = String(photo.media_id);
                            const selectionNumber = getSelectionNumber(mediaId);
                            const isSelected = selectionNumber !== null;
                            const thumb = resolveThumbUrl(photo);

                            return (
                                <TouchableOpacity
                                    key={mediaId}
                                    onPress={() => togglePhotoSelection(mediaId)}
                                    activeOpacity={isInSelectionMode ? 0.7 : 1}
                                >
                                    <View style={[
                                        styles.photoImageContainer,
                                        { width: imageWidth },
                                        isSelected && (isDeleteMode
                                            ? styles.photoImageContainerSelectedDelete
                                            : styles.photoImageContainerSelected)
                                    ]}>
                                        {thumb ? (
                                            <FastImage
                                                source={{ uri: String(thumb) }}
                                                style={[styles.photoImage, { width: imageWidth - 2 }]}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={[styles.photoImage, { width: imageWidth - 2, backgroundColor: colors.btnBackgroundColor }]} />
                                        )}
                                        {isSelected && (
                                            <View style={[
                                                styles.selectionBadge,
                                                isDeleteMode && styles.selectionBadgeDelete
                                            ]}>
                                                <Text style={styles.selectionBadgeText}>{selectionNumber}</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default EditPhotoCollectionsScreen
