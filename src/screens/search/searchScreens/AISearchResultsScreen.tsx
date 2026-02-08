import React, {useCallback, useMemo, useState} from 'react';
import {Alert, Share, Text, TouchableOpacity, View, ScrollView} from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {ArrowLeft2, ArrowRight} from 'iconsax-react-nativejs';
import Icons from '../../../constants/Icons';
import {createStyles} from './AISearchResultsScreenStyles';
import {useAuth} from '../../../context/AuthContext';
import {ApiError, getMediaById, recordDownload} from '../../../services/apiGateway';

interface PhotoResult {
  id: string;
  imageUrl: string;
  eventId?: string;
  type?: 'image' | 'video';
  matchPercent?: number;
  previewUrl?: string;
  originalUrl?: string;
  matchType?: string;
  bibNumber?: string;
}

interface PhotoGroup {
  id: number;
  photos: PhotoResult[];
}

const AISearchResultsScreen = ({navigation, route}: any) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const {apiAccessToken} = useAuth();
  const results = Array.isArray(route?.params?.results) ? route.params.results : null;
  const defaultMatchType = route?.params?.matchType ? String(route.params.matchType) : undefined;

  const photoResults: PhotoResult[] = useMemo(() => {
    if (!results) return [];

    return results.map((r: any, idx: number) => ({
      id: String(r.media_id ?? r.id ?? idx),
      imageUrl: String(r.thumbnail_url ?? r.preview_url ?? r.original_url ?? ''),
      type: r.type === 'video' || r.type === 'image' ? r.type : undefined,
      previewUrl: r.preview_url ? String(r.preview_url) : undefined,
      originalUrl: r.original_url ? String(r.original_url) : undefined,
      eventId: r.event_id ? String(r.event_id) : undefined,
      matchPercent:
        typeof r.match_percent === 'number'
          ? r.match_percent
          : typeof r.confidence === 'number'
            ? r.confidence <= 1
              ? r.confidence * 100
              : r.confidence
            : undefined,
      matchType: r.match_type ? String(r.match_type) : r.bib_number ? 'bib' : defaultMatchType,
      bibNumber: r.bib_number ? String(r.bib_number) : undefined,
    }));
  }, [defaultMatchType, results]);

  const matchedCount = route?.params?.matchedCount ?? photoResults.length;

  const photoGroups: PhotoGroup[] = useMemo(() => {
    const groups: PhotoGroup[] = [];
    for (let i = 0; i < photoResults.length; i += 2) {
      groups.push({
        id: Math.floor(i / 2) + 1,
        photos: photoResults.slice(i, i + 2),
      });
    }
    return groups;
  }, [photoResults]);

  const downloadOne = useCallback(
    async (photo: PhotoResult) => {
      if (!apiAccessToken) {
        Alert.alert('Missing API token', 'Log in or set a Dev API token to download.');
        return;
      }

      const mediaId = String(photo.id || '').trim();
      if (!mediaId) return;

      const startUrl = (photo.originalUrl || photo.previewUrl || '').trim();

      try {
        let url = startUrl || null;
        if (!url) {
          const fresh = await getMediaById(apiAccessToken, mediaId);
          url = (fresh.original_url || fresh.full_url || fresh.raw_url || fresh.preview_url || fresh.thumbnail_url || null) as any;
          url = url ? String(url) : null;
        }

        if (!url) {
          Alert.alert('No download URL', 'The API did not provide a downloadable URL for this media.');
          return;
        }

        try {
          await recordDownload(apiAccessToken, {media_id: mediaId, event_id: photo.eventId});
        } catch {
          // ignore
        }

        await Share.share({message: url, url});
      } catch (e: any) {
        const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
        Alert.alert('Download failed', msg);
      }
    },
    [apiAccessToken],
  );

  const renderPhotoCard = (photo: PhotoResult) => (
    <View key={photo.id} style={styles.photoCard}>
      <FastImage
        source={{uri: photo.imageUrl}}
        style={styles.photoImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      <SizeBox height={10} />
      <View style={styles.photoInfo}>
        <View style={styles.photoLeftInfo}>
          <Text style={styles.priceText}>
            {photo.matchPercent != null ? `Match ${photo.matchPercent.toFixed(0)}%` : 'Match'}
          </Text>
          <SizeBox height={10} />
          <TouchableOpacity
            onPress={async () => {
              const url = photo.previewUrl ?? photo.originalUrl ?? photo.imageUrl;
              if (!url) {
                Alert.alert('Missing URL', 'No preview/original URL was provided for this result.');
                return;
              }
              navigation.navigate('PhotoDetailScreen', {
                eventTitle: photo.eventId ? `Event ${photo.eventId.slice(0, 8)}…` : 'Result',
                media: {
                  id: photo.id,
                  eventId: photo.eventId,
                  thumbnailUrl: photo.imageUrl,
                  previewUrl: photo.previewUrl,
                  originalUrl: photo.originalUrl,
                  type: photo.type,
                  matchPercent: photo.matchPercent,
                  matchType: photo.matchType,
                  bibNumber: photo.bibNumber,
                },
              });
            }}>
            <LinearGradient
              colors={['#155DFC', '#7F22FE']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View</Text>
              <ArrowRight size={13} color="#FFFFFF" variant="Linear" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={styles.photoRightInfo}>
          <Text style={styles.resolutionText}>
            {photo.eventId ? `${photo.eventId.slice(0, 8)}…` : ''}
          </Text>
          <SizeBox height={10} />
          <TouchableOpacity style={styles.downloadButton} onPress={() => downloadOne(photo)}>
            <Icons.DownloadBlue width={16} height={16} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderPhotoGroup = (group: PhotoGroup) => (
    <View key={group.id} style={styles.photoGroupWrapper}>
      <LinearGradient
        colors={['#155DFC', '#7F22FE']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.photoGroupGradientBorder}
      />
      <View style={styles.photoGroupCard}>
        <View style={styles.photoGroupRow}>
          {group.photos.map(renderPhotoCard)}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <SizeBox height={insets.top} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI</Text>
        <View style={{width: 44, height: 44}} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SizeBox height={16} />

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Searched results</Text>
          <View style={styles.resultsBadge}>
            <MaskedView
              maskElement={
                <Text style={styles.resultsBadgeText}>
                  {matchedCount} Results
                </Text>
              }>
              <LinearGradient
                colors={['#155DFC', '#7F22FE']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}>
                <Text style={styles.resultsBadgeTextHidden}>
                  {matchedCount} Results
                </Text>
              </LinearGradient>
            </MaskedView>
          </View>
        </View>

        <SizeBox height={24} />

        {/* Photo Groups */}
        {photoGroups.length === 0 ? (
          <Text style={styles.emptyText}>No results found.</Text>
        ) : (
          photoGroups.map(renderPhotoGroup)
        )}

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>
    </View>
  );
};

export default AISearchResultsScreen;
