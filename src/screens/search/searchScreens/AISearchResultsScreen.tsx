import React, {useCallback, useMemo} from 'react';
import {Alert, ScrollView, Share, Text, TouchableOpacity, View} from 'react-native';
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
import {useTranslation} from 'react-i18next';

type RefineContext = {
  bib?: string;
  discipline?: string;
  checkpoint?: string;
  date?: string;
  competition?: string;
};

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
  createdAt?: string;
  confidencePercent?: number | null;
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const AISearchResultsScreen = ({navigation, route}: any) => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const {apiAccessToken} = useAuth();
  const {eventNameById} = useEvents();
  const rawResults = route?.params?.results;
  const results = useMemo(() => (Array.isArray(rawResults) ? rawResults : []), [rawResults]);
  const defaultMatchType = route?.params?.matchType ? String(route.params.matchType) : undefined;
  const refineContext = (route?.params?.refineContext ?? {}) as RefineContext;
  const parseConfidencePercent = useCallback((raw: any) => {
    const matchPercent = Number(raw?.match_percent);
    if (Number.isFinite(matchPercent)) return clampPercent(matchPercent);
    const confidence = Number(raw?.confidence);
    if (Number.isFinite(confidence)) return clampPercent(confidence <= 1 ? confidence * 100 : confidence);
    const score = Number(raw?.score);
    if (Number.isFinite(score)) return clampPercent(score <= 1 ? score * 100 : score);
    return null;
  }, []);

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
      createdAt: r.created_at ? String(r.created_at) : undefined,
      confidencePercent: parseConfidencePercent(r),
    }));
  }, [defaultMatchType, parseConfidencePercent, results]);

  const matchedCount = route?.params?.matchedCount ?? parsedResults.length;

  const sortedResults = useMemo(() => {
    return [...parsedResults].sort((a, b) => {
      const aConfidence = Number(a.confidencePercent ?? -1);
      const bConfidence = Number(b.confidencePercent ?? -1);
      if (aConfidence !== bConfidence) return bConfidence - aConfidence;
      return String(a.eventName || '').localeCompare(String(b.eventName || ''));
    });
  }, [parsedResults]);

  const refinePills = useMemo(() => {
    const pills: Array<{key: string; label: string}> = [];
    if (refineContext.bib) pills.push({key: 'bib', label: `${t('Chest number')}: ${refineContext.bib}`});
    if (refineContext.discipline) pills.push({key: 'discipline', label: `${t('discipline')}: ${refineContext.discipline}`});
    if (refineContext.checkpoint) pills.push({key: 'checkpoint', label: `${t('Checkpoint')}: ${refineContext.checkpoint}`});
    return pills;
  }, [refineContext.bib, refineContext.checkpoint, refineContext.discipline, t]);

  const matchLabel = useCallback(
    (matchType?: string) => {
      const key = String(matchType ?? '').toLowerCase();
      if (key === 'bib') return t('Chest number');
      if (key === 'context') return t('Context');
      if (key === 'face') return t('Face');
      if (key === 'combined') return t('Combined');
      return t('AI');
    },
    [t],
  );

  const confidenceLabel = useCallback(
    (item: ResultItem) => {
      if (String(item.matchType ?? '').toLowerCase() === 'bib') {
        return t('Chest number');
      }
      if (item.confidencePercent == null) return t('Needs review');
      const rounded = Math.round(item.confidencePercent);
      return `${rounded}% ${t('match')}`;
    },
    [t],
  );

  const downloadOne = useCallback(
    async (item: ResultItem) => {
      if (!apiAccessToken) {
        Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to download.'));
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
          // ignore analytics failures
        }

        await Share.share({message: url, url});
      } catch (e: any) {
        const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
        Alert.alert(t('Download failed'), msg);
      }
    },
    [apiAccessToken, t],
  );

  const openMedia = useCallback(
    (item: ResultItem) => {
      const url = item.previewUrl ?? item.originalUrl ?? item.imageUrl;
      if (!url) {
        Alert.alert(t('Missing URL'), t('No preview/original URL was provided for this result.'));
        return;
      }
      if (item.type === 'video') {
        navigation.navigate('VideoPlayingScreen', {
          mediaId: item.id,
          startAt: item.matchTimeSeconds ?? 0,
          video: {
            title: item.eventName || eventNameById(item.eventId),
            thumbnail: item.imageUrl,
            uri: item.originalUrl ?? item.previewUrl ?? item.imageUrl,
          },
        });
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
    },
    [eventNameById, navigation, t],
  );

  const renderResultCard = useCallback(
    (item: ResultItem) => (
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
        <TouchableOpacity style={styles.downloadButton} onPress={() => downloadOne(item)}>
          <Icons.DownloadBlue width={16} height={16} />
        </TouchableOpacity>
        <View style={styles.resultBody}>
          <Text style={styles.resultEventName} numberOfLines={1}>
            {item.eventName || eventNameById(item.eventId) || t('Competition')}
          </Text>
          <View style={styles.resultChipRow}>
            <View style={styles.sourceChip}>
              <Text style={styles.sourceChipText}>{matchLabel(item.matchType)}</Text>
            </View>
            <View style={styles.confidenceChip}>
              <Text style={styles.confidenceChipText}>{confidenceLabel(item)}</Text>
            </View>
          </View>
          <View>
            {item.bibNumber ? <Text style={styles.resultMeta}>{t('Chest number')}: {item.bibNumber}</Text> : null}
            {item.type === 'video' ? <Text style={styles.resultMeta}>{t('Video')}</Text> : null}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [confidenceLabel, downloadOne, eventNameById, matchLabel, openMedia, styles, t],
  );

  return (
    <View style={styles.mainContainer}>
      <SizeBox height={insets.top} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('AI results')}</Text>
        <View style={{width: 44, height: 44}} />
      </View>

      <View style={styles.refineBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.refinePillsRow}>
          {refinePills.length > 0 ? refinePills.map((pill) => (
            <View key={pill.key} style={styles.refinePill}>
              <Text style={styles.refinePillText}>{pill.label}</Text>
            </View>
          )) : null}
        </ScrollView>
        <TouchableOpacity style={styles.refineButton} onPress={() => navigation.goBack()}>
          <Text style={styles.refineButtonText}>{t('Refine')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}} showsVerticalScrollIndicator={false}>
        <SizeBox height={16} />

        <View style={styles.resultsHeader}>
          <View>
            <Text style={styles.resultsTitle}>{t('Possible matches')}</Text>
            <Text style={styles.resultsSubtitle}>{t('Possible matches are sorted by chance so the strongest candidates appear first.')}</Text>
          </View>
          <View style={styles.resultsBadge}>
            <Text style={styles.resultsBadgeText}>{matchedCount} {t('found')}</Text>
          </View>
        </View>

        <SizeBox height={18} />

        <View style={styles.section}>
          {sortedResults.length === 0 ? (
            <Text style={styles.emptySectionText}>{t('No possible matches to review.')}</Text>
          ) : (
            <View style={styles.grid}>{sortedResults.map(renderResultCard)}</View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AISearchResultsScreen;
