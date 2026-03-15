import React, {useCallback, useMemo} from 'react';
import {Alert, FlatList, ScrollView, Share, Text, TouchableOpacity, View} from 'react-native';
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
      ...(Number.isFinite(Number(r.match_time_seconds))
        ? {matchTimeSeconds: Number(r.match_time_seconds)}
        : {}),
      id: String(r.media_id ?? r.id ?? idx),
      imageUrl: String(r.thumbnail_url ?? r.preview_url ?? r.original_url ?? ''),
      type: r.type === 'video' || r.type === 'image' ? r.type : undefined,
      previewUrl: r.preview_url ? String(r.preview_url) : undefined,
      originalUrl: r.original_url ? String(r.original_url) : undefined,
      eventId: r.event_id ? String(r.event_id) : undefined,
      eventName: r.event_name ? String(r.event_name) : undefined,
      matchType: r.match_type ? String(r.match_type) : r.bib_number ? 'bib' : defaultMatchType,
      bibNumber: r.bib_number ? String(r.bib_number) : undefined,
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
      const matchType = String(item.matchType ?? '').toLowerCase();
      if (matchType === 'bib') {
        return t('Chest number');
      }
      if (matchType === 'context') {
        return null;
      }
      if (item.confidencePercent == null) return t('Needs review');
      const rounded = Math.round(item.confidencePercent);
      return `${rounded}% ${t('match')}`;
    },
    [t],
  );

  const formatMatchTime = useCallback((value?: number) => {
    if (!Number.isFinite(value)) return null;
    const safe = Math.max(0, Math.floor(Number(value)));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  }, []);

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
    async (item: ResultItem) => {
      let resolvedThumbnail = item.imageUrl;
      let resolvedPreview = item.previewUrl;
      let resolvedOriginal = item.originalUrl;

      if (!resolvedThumbnail && !resolvedPreview && !resolvedOriginal) {
        if (!apiAccessToken) {
          Alert.alert(t('Missing URL'), t('No preview/original URL was provided for this result.'));
          return;
        }
        try {
          const fresh = await getMediaById(apiAccessToken, item.id);
          resolvedThumbnail = String(fresh.thumbnail_url ?? '') || resolvedThumbnail;
          resolvedPreview = String(fresh.preview_url ?? '') || resolvedPreview;
          resolvedOriginal = String(
            fresh.original_url ?? fresh.full_url ?? fresh.raw_url ?? '',
          ) || resolvedOriginal;
        } catch (e: any) {
          const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
          Alert.alert(t('Open failed'), msg);
          return;
        }
      }

      const url = resolvedPreview ?? resolvedOriginal ?? resolvedThumbnail;
      if (!url) {
        Alert.alert(t('Missing URL'), t('No preview/original URL was provided for this result.'));
        return;
      }
      if (item.type === 'video') {
        const requestedStartAt = item.matchTimeSeconds ?? 0;
        navigation.navigate('VideoPlayingScreen', {
          mediaId: item.id,
          startAt: requestedStartAt,
          matchTimeSeconds: requestedStartAt > 0 ? requestedStartAt : undefined,
          match_time_seconds: requestedStartAt > 0 ? requestedStartAt : undefined,
          video: {
            title: item.eventName || eventNameById(item.eventId),
            thumbnail: resolvedThumbnail,
            uri: resolvedOriginal ?? resolvedPreview ?? resolvedThumbnail,
            startAt: requestedStartAt > 0 ? requestedStartAt : undefined,
            matchTimeSeconds: requestedStartAt > 0 ? requestedStartAt : undefined,
            match_time_seconds: requestedStartAt > 0 ? requestedStartAt : undefined,
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
          thumbnailUrl: resolvedThumbnail,
          previewUrl: resolvedPreview,
          originalUrl: resolvedOriginal,
          type: item.type,
          matchType: item.matchType,
          bibNumber: item.bibNumber,
        },
      });
    },
    [apiAccessToken, eventNameById, navigation, t],
  );

  const renderResultCard = useCallback(
    (item: ResultItem) => (
      <TouchableOpacity
        key={item.id}
        style={styles.resultCard}
        onPress={() => openMedia(item)}
        activeOpacity={0.85}
        testID={`ai-search-result-${item.id}`}
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
            {confidenceLabel(item) ? (
              <View style={styles.confidenceChip}>
                <Text style={styles.confidenceChipText}>{confidenceLabel(item)}</Text>
              </View>
            ) : null}
          </View>
          <View>
            {item.bibNumber ? <Text style={styles.resultMeta}>{t('Chest number')}: {item.bibNumber}</Text> : null}
            {item.type === 'video' ? <Text style={styles.resultMeta}>{t('Video')}</Text> : null}
            {item.type === 'video' && item.matchTimeSeconds != null ? (
              <Text style={styles.resultMeta}>{t('Match time')}: {formatMatchTime(item.matchTimeSeconds)}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [confidenceLabel, downloadOne, eventNameById, formatMatchTime, matchLabel, openMedia, styles, t],
  );

  return (
    <View style={styles.mainContainer} testID="ai-search-results-screen">
      <SizeBox height={insets.top} />
      {sortedResults.length > 0 ? (
        <View testID="ai-search-results-ready" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
      ) : null}

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

      <FlatList
        data={sortedResults}
        keyExtractor={(item) => item.id}
        numColumns={2}
        style={styles.container}
        contentContainerStyle={[styles.listContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}]}
        columnWrapperStyle={sortedResults.length > 0 ? styles.gridRow : undefined}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={4}
        removeClippedSubviews
        renderItem={({item}) => renderResultCard(item)}
        ListHeaderComponent={(
          <>
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
          </>
        )}
        ListEmptyComponent={(
          <View style={styles.section}>
            <Text style={styles.emptySectionText}>{t('No possible matches to review.')}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default AISearchResultsScreen;
