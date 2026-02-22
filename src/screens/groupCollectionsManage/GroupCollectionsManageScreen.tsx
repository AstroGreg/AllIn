import { View, Text, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, ArrowRight, Add, Minus, TickCircle } from 'iconsax-react-nativejs';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import {
  addGroupCollectionItems,
  getGroupCollectionByType,
  removeGroupCollectionItems,
  setGroupCollectionFeatured,
  uploadMediaBatch,
  type GroupCollectionItem,
} from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
import { createStyles } from '../editPhotoCollections/EditPhotoCollectionsStyles';

type SelectionMode = 'none' | 'top4' | 'delete';

const GroupCollectionsManageScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);
  const { apiAccessToken } = useAuth();

  const groupId = String(route?.params?.groupId || '').trim();
  const type: 'image' | 'video' = String(route?.params?.type || '').toLowerCase() === 'video' ? 'video' : 'image';
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [collectionItems, setCollectionItems] = useState<GroupCollectionItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const withAccessToken = useCallback(
    (value?: string | null) => {
      if (!value) return undefined;
      if (!apiAccessToken) return value;
      if (isSignedUrl(value)) return value;
      if (value.includes('access_token=')) return value;
      const sep = value.includes('?') ? '&' : '?';
      return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    },
    [apiAccessToken, isSignedUrl],
  );

  const resolveThumbUrl = useCallback(
    (media: GroupCollectionItem) => {
      const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || media.original_url || null;
      const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
      return withAccessToken(resolved) || resolved;
    },
    [toAbsoluteUrl, withAccessToken],
  );

  const loadData = useCallback(async () => {
    if (!apiAccessToken || !groupId) {
      setCollectionItems([]);
      return;
    }
    try {
      const collection = await getGroupCollectionByType(apiAccessToken, groupId, type);
      setCollectionItems(Array.isArray(collection?.items) ? collection.items : []);
    } catch (e: any) {
      Alert.alert(t('Error'), String(e?.message ?? e ?? t('Could not load collection')));
      setCollectionItems([]);
    }
  }, [apiAccessToken, groupId, t, type]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const featuredIds = useMemo(() => {
    return collectionItems
      .filter((item) => item.featured_rank != null)
      .sort((a, b) => Number(a.featured_rank ?? 0) - Number(b.featured_rank ?? 0))
      .map((item) => String(item.media_id));
  }, [collectionItems]);

  const handleSelectTop4 = () => {
    setSelectionMode('top4');
    setSelectedMediaIds(featuredIds);
  };

  const handleAdd = async () => {
    if (!apiAccessToken || !groupId) return;
    const res = await launchImageLibrary({
      mediaType: type === 'video' ? 'video' : 'photo',
      selectionLimit: type === 'video' ? 6 : 12,
      quality: type === 'video' ? undefined : 0.9,
    });
    if (res.didCancel || !res.assets) return;
    const files = res.assets
      .filter((asset) => asset?.uri)
      .map((asset) => ({
        uri: String(asset.uri),
        type: asset.type ?? (type === 'video' ? 'video/mp4' : 'image/jpeg'),
        name: asset.fileName ?? `${type}-${Date.now()}`,
      }));
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const uploaded = await uploadMediaBatch(apiAccessToken, { files });
      const mediaIds = Array.isArray(uploaded?.results) ? uploaded.results.map((r: any) => r.media_id).filter(Boolean) : [];
      if (mediaIds.length > 0) {
        await addGroupCollectionItems(apiAccessToken, { group_id: groupId, type, media_ids: mediaIds });
      }
      await loadData();
    } catch (e: any) {
      Alert.alert(t('Upload failed'), String(e?.message ?? e ?? t('Please try again')));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    setSelectionMode('delete');
    setSelectedMediaIds([]);
  };

  const handleCancel = () => {
    setSelectionMode('none');
    setSelectedMediaIds([]);
  };

  const toggleSelection = (mediaId: string) => {
    if (selectionMode === 'none') return;
    setSelectedMediaIds((prev) => {
      const index = prev.indexOf(mediaId);
      if (index !== -1) return prev.filter((id) => id !== mediaId);
      if (selectionMode === 'top4' && prev.length >= 4) return prev;
      return [...prev, mediaId];
    });
  };

  const handleConfirmDelete = async () => {
    if (!apiAccessToken || !groupId || selectedMediaIds.length === 0) return;
    await removeGroupCollectionItems(apiAccessToken, { group_id: groupId, type, media_ids: selectedMediaIds });
    await loadData();
    setSelectionMode('none');
    setSelectedMediaIds([]);
  };

  const handleConfirmTop4 = async () => {
    if (!apiAccessToken || !groupId) return;
    await setGroupCollectionFeatured(apiAccessToken, { group_id: groupId, type, media_ids: selectedMediaIds });
    await loadData();
    setSelectionMode('none');
    setSelectedMediaIds([]);
  };

  const getSelectionNumber = (mediaId: string): number | null => {
    const index = selectedMediaIds.indexOf(mediaId);
    return index !== -1 ? index + 1 : null;
  };

  const getTitle = () => {
    if (selectionMode === 'top4') return t('Select Top 4 Picks');
    if (selectionMode === 'delete') return type === 'video' ? t('Select Videos to Delete') : t('Select Photos to Delete');
    return type === 'video' ? t('My Video Collections') : t('My Photo Collections');
  };

  const isInSelectionMode = selectionMode !== 'none';
  const isDeleteMode = selectionMode === 'delete';

  return (
    <View style={styles.mainContainer}>
      <SizeBox height={insets.top} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{type === 'video' ? t('Edit Video Collections') : t('Edit Photo Collections')}</Text>
        <TouchableOpacity
          style={styles.headerSwitchButton}
          onPress={() =>
            navigation.replace('GroupCollectionsManageScreen', {
              groupId,
              type: type === 'video' ? 'image' : 'video',
            })
          }
        >
          <Text style={styles.headerSwitchText}>{type === 'video' ? t('Photos') : t('Videos')}</Text>
          <ArrowRight size={18} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

        <SizeBox height={16} />

        {!isInSelectionMode && (
          <>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={isUploading}>
                <Add size={20} color={colors.whiteColor} variant="Linear" />
                <Text style={styles.addButtonText}>{isUploading ? t('Uploading...') : type === 'video' ? t('Add Videos') : t('Add Photos')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Minus size={20} color="#FF0000" variant="Linear" />
                <Text style={styles.deleteButtonText}>{type === 'video' ? t('Delete Videos') : t('Delete Photos')}</Text>
              </TouchableOpacity>
            </View>
            <SizeBox height={16} />
          </>
        )}

        {isDeleteMode && (
          <>
            <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleConfirmDelete}>
              <Minus size={18} color={colors.whiteColor} variant="Linear" />
              <Text style={styles.confirmDeleteButtonText}>{t('Confirm Delete')} ({selectedMediaIds.length})</Text>
            </TouchableOpacity>
            <SizeBox height={12} />
          </>
        )}

        {selectionMode === 'top4' && (
          <>
            <TouchableOpacity style={styles.confirmTopButton} onPress={handleConfirmTop4}>
              <TickCircle size={18} color={colors.whiteColor} variant="Bold" />
              <Text style={styles.confirmTopButtonText}>{t('Confirm Top')} {selectedMediaIds.length}</Text>
            </TouchableOpacity>
            <SizeBox height={12} />
          </>
        )}

        <View style={styles.photosContainer}>
          <View style={styles.photosGrid}>
            {collectionItems.map((item) => {
              const mediaId = String(item.media_id);
              const isSelected = selectedMediaIds.includes(mediaId);
              const selectionNumber = getSelectionNumber(mediaId);
              const thumb = resolveThumbUrl(item);
              return (
                <TouchableOpacity key={mediaId} activeOpacity={0.8} onPress={() => toggleSelection(mediaId)}>
                  <View
                    style={[
                      styles.photoImageContainer,
                      { width: imageWidth },
                      isSelected && (isDeleteMode ? styles.photoImageContainerSelectedDelete : styles.photoImageContainerSelected),
                    ]}
                  >
                    {thumb ? (
                      <FastImage source={{ uri: String(thumb) }} style={[styles.photoImage, { width: imageWidth - 2 }]} resizeMode="cover" />
                    ) : (
                      <View style={[styles.photoImage, { width: imageWidth - 2, backgroundColor: colors.btnBackgroundColor }]} />
                    )}
                    {selectionNumber !== null && (
                      <View style={[styles.selectionBadge, isDeleteMode && styles.selectionBadgeDelete]}>
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
  );
};

export default GroupCollectionsManageScreen;
