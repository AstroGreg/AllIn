import React, {useCallback, useMemo} from 'react';
import {Alert, Share, Text, TouchableOpacity, View, ScrollView} from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import {useEvents} from '../../../context/EventsContext';
import FastImage from 'react-native-fast-image';
import {ArrowLeft2} from 'iconsax-react-nativejs';
import Icons from '../../../constants/Icons';
import {createStyles} from './AISearchResultsScreenStyles';
import {useAuth} from '../../../context/AuthContext';
import {ApiError, getMediaById, recordDownload} from '../../../services/apiGateway';
import { useTranslation } from 'react-i18next'

interface ResultItem {
  matchTimeSeconds?: number;
  id: string;
  imageUrl: string;
  eventId?: string;
  eventName?: string;
  type?: 'image' | 'video';
  previewUrl?: string;
  originalUrl?: string;
  matchType?: string;
  bibNumber?: string;
}

interface ResultGroup {
  id: string;
  name: string;
  items: ResultItem[];
}

const AISearchResultsScreen = ({navigation, route}: any) => {
    const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const {apiAccessToken} = useAuth();
  const {eventNameById} = useEvents();
  const results = Array.isArray(route?.params?.results) ? route.params.results : [];
  const defaultMatchType = route?.params?.matchType ? String(route.params.matchType) : undefined;

  const parsedResults: ResultItem[] = useMemo(() => {
    return results.map((r: any, idx: number) => ({
      id: String(r.media_id ?? r.id ?? idx),
      imageUrl: String(r.thumbnail_url ?? r.preview_url ?? r.original_url ?? ''),
      type: r.type === 'video' || r.type === 'image' ? r.type : undefined,
      previewUrl: r.preview_url ? String(r.preview_url) : undefined,
      originalUrl: r.original_url ? String(r.original_url) : undefined,
      eventId: r.event_id ? String(r.event_id) : undefined,
      eventName: r.event_name ? String(r.event_name) : undefined,
      matchType: r.match_type ? String(r.match_type) : r.bib_number ? 'bib' : defaultMatchType,
      bibNumber: r.bib_number ? String(r.bib_number) : undefined,
      matchTimeSeconds: typeof r.match_time_seconds === 'number' ? r.match_time_seconds : undefined,
    }));
  }, [defaultMatchType, results]);

  const matchedCount = route?.params?.matchedCount ?? parsedResults.length;

  const groupedResults: ResultGroup[] = useMemo(() => {
    const map = new Map<string, ResultGroup>();
    parsedResults.forEach((item) => {
      const eventId = item.eventId ? String(item.eventId) : 'unknown';
      const name = item.eventName || eventNameById(item.eventId) || t('Competition');
      if (!map.has(eventId)) {
        map.set(eventId, {id: eventId, name, items: []});
      }
      map.get(eventId)!.items.push(item);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [eventNameById, parsedResults, t]);

  const matchLabel = useCallback((matchType?: string) => {
    const key = String(matchType ?? '').toLowerCase();
    if (key === 'bib') return t('Chest number');
    if (key === 'context') return t('Context');
    if (key === 'face') return t('Face');
    return t('AI');
  }, [t]);

  const downloadOne = useCallback(
    async (item: ResultItem) => {
      if (!apiAccessToken) {
        Alert.alert(t('Missing API token'), t('Log in to download.'));
        return;
      }

      const mediaId = String(item.id || '').trim();
      if (!mediaId) return;

      const startUrl = (item.originalUrl || item.previewUrl || '').trim();

      try {
        let url = startUrl || null;
        if (!url) {
          const fresh = await getMediaById(apiAccessToken, mediaId);
          url = (fresh.original_url || fresh.full_url || fresh.raw_url || fresh.preview_url || fresh.thumbnail_url || null) as any;
          url = url ? String(url) : null;
        }

        if (!url) {
          Alert.alert(t('No download URL'), t('The API did not provide a downloadable URL for this media.'));
          return;
        }

        try {
          await recordDownload(apiAccessToken, {media_id: mediaId, event_id: item.eventId});
        } catch {
          // ignore
        }

        await Share.share({message: url, url});
      } catch (e: any) {
        const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
        Alert.alert(t('Download failed'), msg);
      }
    },
    [apiAccessToken, t],
  );

  const openMedia = (item: ResultItem) => {
    const url = item.previewUrl ?? item.originalUrl ?? item.imageUrl;
    if (!url) {
      Alert.alert(t('Missing URL'), t('No preview/original URL was provided for this result.'));
      return;
    }
    navigation.navigate('PhotoDetailScreen', {
      startAt: item.matchTimeSeconds ?? 0,
      eventTitle: item.eventName || eventNameById(item.eventId),
      media: {
        id: item.id,
        eventId: item.eventId,
        thumbnailUrl: item.imageUrl,
        previewUrl: item.previewUrl,
        originalUrl: item.originalUrl,
        type: item.type,
        matchType: item.matchType,
        bibNumber: item.bibNumber,
      },
    });
  };

  return (
    <View style={styles.mainContainer}>
      <SizeBox height={insets.top} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('AI results')}</Text>
        <View style={{width: 44, height: 44}} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SizeBox height={16} />

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>{t('Results')}</Text>
          <View style={styles.resultsBadge}>
            <Text style={styles.resultsBadgeText}>{matchedCount} {t('found')}</Text>
          </View>
        </View>

        <SizeBox height={20} />

        {groupedResults.length === 0 ? (
          <Text style={styles.emptyText}>{t('No results found.')}</Text>
        ) : (
          groupedResults.map((group) => (
            <View key={group.id} style={styles.groupSection}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{group.name}</Text>
                <View style={styles.groupCountBadge}>
                  <Text style={styles.groupCountText}>{group.items.length}</Text>
                </View>
              </View>
              <View style={styles.groupGrid}>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.resultCard}
                    onPress={() => openMedia(item)}
                    activeOpacity={0.85}
                  >
                    <FastImage
                      source={{uri: item.imageUrl}}
                      style={styles.resultImage}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    <View style={styles.resultInfo}>
                      <View style={styles.matchChip}>
                        <Text style={styles.matchChipText}>{matchLabel(item.matchType)}</Text>
                      </View>
                      {item.type === 'video' && (
                        <Text style={styles.mediaType}>{t('Video')}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => downloadOne(item)}
                    >
                      <Icons.DownloadBlue width={16} height={16} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>
    </View>
  );
};

export default AISearchResultsScreen;
