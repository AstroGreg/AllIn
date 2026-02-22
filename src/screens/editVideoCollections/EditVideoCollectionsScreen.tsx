import { View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput, Alert } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, ArrowRight, Add, Minus } from 'iconsax-react-nativejs'
import Icons from '../../constants/Icons'
import SizeBox from '../../constants/SizeBox'
import { createStyles } from './EditVideoCollectionsStyles'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useFocusEffect } from '@react-navigation/native'
import { addProfileCollectionItems, getProfileCollectionByType, removeProfileCollectionItems, setProfileCollectionFeatured, updateProfileCollectionByType, uploadMediaBatch, type ProfileCollectionItem } from '../../services/apiGateway'
import { getApiBaseUrl } from '../../constants/RuntimeConfig'
import { useTranslation } from 'react-i18next'
import { launchImageLibrary } from 'react-native-image-picker'

type SelectionMode = 'none' | 'top4' | 'delete';

const EditVideoCollectionsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken } = useAuth();

    const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');
    const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
    const [collectionVideos, setCollectionVideos] = useState<ProfileCollectionItem[]>([]);
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
            lower.includes('token=') ||
            lower.includes('expires=')
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
            setCollectionVideos([]);
            return;
        }
        try {
            const collection = await getProfileCollectionByType(apiAccessToken, 'video');
            setCollectionVideos(Array.isArray(collection?.items) ? collection.items : []);
            setCollectionName(String(collection?.collection?.name ?? t('My Video Collections')));
        } catch {
            setCollectionVideos([]);
            setCollectionName(t('My Video Collections'));
        }
    }, [apiAccessToken, t]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData]),
    );

    const featuredIds = useMemo(() => {
        return collectionVideos
            .filter((item) => item.featured_rank != null)
            .sort((a, b) => Number(a.featured_rank ?? 0) - Number(b.featured_rank ?? 0))
            .map((item) => String(item.media_id));
    }, [collectionVideos]);

    const handleSelectTop4 = () => {
        setSelectionMode('top4');
        setSelectedVideoIds(featuredIds);
    };

    const handleAddVideos = async () => {
        if (!apiAccessToken) return;
        const res = await launchImageLibrary({
            mediaType: 'video',
            selectionLimit: 6,
        });
        if (res.didCancel || !res.assets) return;
        const files = res.assets
            .filter((asset) => asset?.uri)
            .map((asset) => ({
                uri: String(asset.uri),
                type: asset.type ?? 'video/mp4',
                name: asset.fileName ?? `video-${Date.now()}`,
            }));
        if (files.length === 0) return;
        setIsUploading(true);
        try {
            const uploaded = await uploadMediaBatch(apiAccessToken, { files });
            const mediaIds = Array.isArray(uploaded?.results)
                ? uploaded.results.map((r: any) => r.media_id).filter(Boolean)
                : [];
            if (mediaIds.length > 0) {
                await addProfileCollectionItems(apiAccessToken, { type: 'video', media_ids: mediaIds });
            }
            await loadData();
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteVideos = () => {
        setSelectionMode('delete');
        setSelectedVideoIds([]);
    };

    const handleCancel = () => {
        setSelectionMode('none');
        setSelectedVideoIds([]);
    };

    const toggleVideoSelection = (videoId: string) => {
        if (selectionMode === 'none') return;

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

    const handleConfirmDelete = async () => {
        if (!apiAccessToken || selectedVideoIds.length === 0) return;
        await removeProfileCollectionItems(apiAccessToken, { type: 'video', media_ids: selectedVideoIds });
        await loadData();
        setSelectionMode('none');
        setSelectedVideoIds([]);
    };

    const handleConfirmTop4 = async () => {
        if (!apiAccessToken) return;
        await setProfileCollectionFeatured(apiAccessToken, { type: 'video', media_ids: selectedVideoIds });
        await loadData();
        setSelectionMode('none');
        setSelectedVideoIds([]);
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
            await updateProfileCollectionByType(apiAccessToken, { type: 'video', name: nextName });
            await loadData();
        } catch (e: any) {
            Alert.alert(t('Save failed'), String(e?.message ?? e ?? t('Please try again')));
        } finally {
            setIsSavingName(false);
        }
    }, [apiAccessToken, collectionName, isSavingName, loadData, t]);

    const getSelectionNumber = (videoId: string): number | null => {
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

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Edit Video Collections')}</Text>
                <TouchableOpacity
                    style={styles.headerSwitchButton}
                    onPress={() => navigation.navigate('EditPhotoCollectionsScreen')}
                >
                    <Text style={styles.headerSwitchText}>{t('Photos')}</Text>
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
                            <TouchableOpacity style={styles.addButton} onPress={handleAddVideos} disabled={isUploading}>
                                <Text style={styles.addButtonText}>{isUploading ? t('Uploading...') : t('Add Videos')}</Text>
                                <Add size={18} color={colors.pureWhite} variant="Linear" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteVideos}>
                                <Text style={styles.deleteButtonText}>{t('Delete Videos')}</Text>
                                <Minus size={18} color="#FF0000" variant="Linear" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {selectionMode === 'top4' && selectedVideoIds.length > 0 && (
                    <>
                        <SizeBox height={16} />
                        <TouchableOpacity style={styles.confirmTopButton} onPress={handleConfirmTop4}>
                            <Text style={styles.confirmTopButtonText}>
                                {t('Confirm Top')} {selectedVideoIds.length}
                            </Text>
                            <Add size={18} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                {isDeleteMode && selectedVideoIds.length > 0 && (
                    <>
                        <SizeBox height={16} />
                        <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleConfirmDelete}>
                            <Text style={styles.confirmDeleteButtonText}>
                                {t('Delete')} {selectedVideoIds.length} {t('Video')}{selectedVideoIds.length > 1 ? 's' : ''}
                            </Text>
                            <Minus size={18} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                <SizeBox height={isInSelectionMode ? 24 : 16} />

                {/* Videos Grid */}
                <View style={styles.videosContainer}>
                    <View style={styles.videosGrid}>
                        {collectionVideos.map((video) => {
                            const mediaId = String(video.media_id);
                            const selectionNumber = getSelectionNumber(mediaId);
                            const isSelected = selectionNumber !== null;
                            const thumb = resolveThumbUrl(video);

                            return (
                                <TouchableOpacity
                                    key={mediaId}
                                    onPress={() => toggleVideoSelection(mediaId)}
                                    activeOpacity={isInSelectionMode ? 0.7 : 1}
                                >
                                    <View style={[
                                        styles.videoImageContainer,
                                        { width: imageWidth },
                                        isSelected && (isDeleteMode
                                            ? styles.videoImageContainerSelectedDelete
                                            : styles.videoImageContainerSelected)
                                    ]}>
                                        {thumb ? (
                                            <FastImage
                                                source={{ uri: String(thumb) }}
                                                style={[styles.videoImage, { width: imageWidth - 2 }]}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={[styles.videoImage, { width: imageWidth - 2, backgroundColor: colors.btnBackgroundColor }]} />
                                        )}
                                        {/* Play Icon */}
                                        <View style={styles.playIconContainer}>
                                            <Icons.PlayCricle width={20} height={20} />
                                        </View>
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

export default EditVideoCollectionsScreen
