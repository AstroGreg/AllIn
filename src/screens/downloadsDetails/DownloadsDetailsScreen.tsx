import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SizeBox from '../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {ArrowDown2, ArrowLeft2, ArrowRight, ArrowUp2} from 'iconsax-react-nativejs';
import {useTheme} from '../../context/ThemeContext';
import {useAuth} from '../../context/AuthContext';
import {useEvents} from '../../context/EventsContext';
import {
  ApiError,
  getCompetitionMedia,
  getDownloads,
  getDownloadsDashboard,
  getDownloadsProfit,
  getUploadedCompetitions,
  type DownloadItem,
  type DownloadsDashboardCompetition,
  type DownloadsDashboardMetrics,
  type DownloadsDashboardPeriodKey,
  type DownloadsDashboardResponse,
  type MediaProfitItem,
  type MediaViewAllItem,
  type UploadedCompetition,
} from '../../services/apiGateway';
import {getApiBaseUrl} from '../../constants/RuntimeConfig';
import {createStyles} from './DownloadsDetailsStyles';
import {useFocusEffect} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {getSportFocusLabel, normalizeFocusId, resolveCompetitionFocusId} from '../../utils/profileSelections';

const COMPETITION_MEDIA_PAGE_SIZE = 60;

const PERIOD_OPTIONS: Array<{key: DownloadsDashboardPeriodKey; label: string}> = [
  {key: 'week', label: 'This week'},
  {key: 'month', label: 'This month'},
  {key: 'all', label: 'All time'},
];

type HeaderMode = 'dashboard' | 'history' | 'profit' | 'competitions' | 'competition-media';

const DownloadsDetailsScreen = ({navigation, route}: any) => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const Styles = createStyles(colors);
  const {apiAccessToken} = useAuth();
  const {eventNameById} = useEvents();

  const rawMode = String(route?.params?.mode ?? 'history');
  const mode: HeaderMode = rawMode === 'downloads'
    ? 'history'
    : rawMode === 'history'
      ? 'history'
      : rawMode === 'profit'
        ? 'profit'
        : rawMode === 'competitions'
          ? 'competitions'
          : rawMode === 'competition-media'
            ? 'competition-media'
            : 'history';
  const isDashboardView = mode === 'dashboard';
  const isHistoryView = mode === 'history';
  const isProfitView = mode === 'profit';
  const isCompetitionList = mode === 'competitions';
  const isCompetitionMedia = mode === 'competition-media';
  const tutorialMode = Boolean(route?.params?.tutorialMode);
  const tutorialStep = String(route?.params?.tutorialStep ?? '');
  const [tutorialDemoDownloaded, setTutorialDemoDownloaded] = useState(Boolean(route?.params?.tutorialDemoDownloaded));

  const [dashboard, setDashboard] = useState<DownloadsDashboardResponse | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<DownloadsDashboardPeriodKey>('month');
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [profitItems, setProfitItems] = useState<MediaProfitItem[]>([]);
  const [competitions, setCompetitions] = useState<UploadedCompetition[]>([]);
  const [competitionMediaItems, setCompetitionMediaItems] = useState<MediaViewAllItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompetitionMediaLoadingMore, setIsCompetitionMediaLoadingMore] = useState(false);
  const [hasMoreCompetitionMedia, setHasMoreCompetitionMedia] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [competitionSearch, setCompetitionSearch] = useState('');

  const tutorialPhotoUrl = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop';

  useFocusEffect(
    useCallback(() => {
      if (!tutorialMode) return;
      if (route?.params?.tutorialDemoDownloaded) {
        setTutorialDemoDownloaded(true);
      }
    }, [route?.params?.tutorialDemoDownloaded, tutorialMode]),
  );

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

  const formatMoney = useCallback((cents: number) => {
    const safe = Number(cents ?? 0);
    if (!Number.isFinite(safe)) return '€0.00';
    return `€${(safe / 100).toFixed(2)}`;
  }, []);

  const formatMetricValue = useCallback(
    (key: 'downloads' | 'views' | 'revenue', metrics?: DownloadsDashboardMetrics | null) => {
      if (!metrics) return key === 'revenue' ? '€0.00' : '0';
      if (key === 'revenue') return formatMoney(metrics.revenue_cents ?? 0);
      if (key === 'downloads') return String(Number(metrics.downloads ?? 0).toLocaleString());
      return String(Number(metrics.views ?? 0).toLocaleString());
    },
    [formatMoney],
  );

  const formatEventDate = useCallback((value?: string | null) => {
    if (!value) return '';
    const raw = String(value);
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return raw.slice(0, 10);
    return dt.toLocaleDateString();
  }, []);

  const formatCompetitionType = useCallback(
    (value?: string | null) => {
      const focusId = normalizeFocusId(value) ?? resolveCompetitionFocusId({type: value});
      return getSportFocusLabel(focusId, t);
    },
    [t],
  );

  const loadDashboard = useCallback(async () => {
    if (!apiAccessToken) {
      setDashboard(null);
      setErrorText(t('Log in (or set a Dev API token) to view downloads.'));
      return;
    }
    setIsLoading(true);
    setErrorText(null);
    try {
      const data = await getDownloadsDashboard(apiAccessToken);
      setDashboard(data);
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
      setDashboard(null);
      setErrorText(msg);
    } finally {
      setIsLoading(false);
    }
  }, [apiAccessToken, t]);

  const loadDownloads = useCallback(async () => {
    if (!apiAccessToken) {
      setDownloads([]);
      setErrorText(t('Log in (or set a Dev API token) to view downloads.'));
      return;
    }

    setIsLoading(true);
    setErrorText(null);
    try {
      const data = await getDownloads(apiAccessToken, {limit: 200});
      setDownloads(Array.isArray(data) ? data : []);
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
      setErrorText(msg);
    } finally {
      setIsLoading(false);
    }
  }, [apiAccessToken, t]);

  const loadProfit = useCallback(async () => {
    if (!apiAccessToken) {
      setProfitItems([]);
      return;
    }
    setIsLoading(true);
    setErrorText(null);
    try {
      const resp = await getDownloadsProfit(apiAccessToken, {limit: 200});
      const items = Array.isArray(resp?.items) ? resp.items : [];
      items.sort(
        (a, b) =>
          Number(b.downloads_count ?? 0) - Number(a.downloads_count ?? 0) ||
          Number(b.views_count ?? 0) - Number(a.views_count ?? 0),
      );
      setProfitItems(items);
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
      setProfitItems([]);
      setErrorText(msg);
    } finally {
      setIsLoading(false);
    }
  }, [apiAccessToken]);

  const loadCompetitions = useCallback(async () => {
    if (!apiAccessToken) {
      setCompetitions([]);
      return;
    }
    setIsLoading(true);
    setErrorText(null);
    try {
      const resp = await getUploadedCompetitions(apiAccessToken, {limit: 200});
      const items = Array.isArray(resp?.competitions) ? resp.competitions : [];
      setCompetitions(items);
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
      setCompetitions([]);
      setErrorText(msg);
    } finally {
      setIsLoading(false);
    }
  }, [apiAccessToken]);

  const mergeCompetitionMediaItems = useCallback((current: MediaViewAllItem[], incoming: MediaViewAllItem[]) => {
    const seen = new Set<string>();
    return [...current, ...incoming].filter((item) => {
      const key = String(item?.media_id ?? '');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const loadCompetitionMedia = useCallback(
    async (eventId?: string | null, opts?: {offset?: number; append?: boolean}) => {
      if (!apiAccessToken || !eventId) {
        setCompetitionMediaItems([]);
        setHasMoreCompetitionMedia(false);
        return;
      }
      const offset = Math.max(0, Number(opts?.offset ?? 0));
      const append = Boolean(opts?.append);
      if (append) {
        setIsCompetitionMediaLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setErrorText(null);
      try {
        const resp = await getCompetitionMedia(apiAccessToken, String(eventId), {
          limit: COMPETITION_MEDIA_PAGE_SIZE,
          offset,
          include_original: false,
        });
        const incoming = Array.isArray(resp?.items) ? resp.items : [];
        setCompetitionMediaItems((prev) => append ? mergeCompetitionMediaItems(prev, incoming) : incoming);
        setHasMoreCompetitionMedia(incoming.length === COMPETITION_MEDIA_PAGE_SIZE);
      } catch (e: any) {
        const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
        if (!append) {
          setCompetitionMediaItems([]);
          setHasMoreCompetitionMedia(false);
        }
        setErrorText(msg);
      } finally {
        setIsLoading(false);
        setIsCompetitionMediaLoadingMore(false);
      }
    },
    [apiAccessToken, mergeCompetitionMediaItems],
  );

  useFocusEffect(
    useCallback(() => {
      if (isDashboardView) {
        loadDashboard();
        return;
      }
      if (isHistoryView) {
        loadDownloads();
        return;
      }
      if (isProfitView) {
        loadProfit();
        return;
      }
      if (isCompetitionList) {
        loadCompetitions();
        return;
      }
      if (isCompetitionMedia) {
        const eventId = route?.params?.competition?.event_id ?? route?.params?.competitionId ?? null;
        loadCompetitionMedia(eventId, {offset: 0, append: false});
      }
    }, [
      isCompetitionList,
      isCompetitionMedia,
      isDashboardView,
      isHistoryView,
      isProfitView,
      loadCompetitionMedia,
      loadCompetitions,
      loadDashboard,
      loadDownloads,
      loadProfit,
      route?.params?.competition?.event_id,
      route?.params?.competitionId,
    ]),
  );

  const selectedCompetition = route?.params?.competition
    ?? competitions.find((item) => item.event_id === route?.params?.competitionId)
    ?? null;

  const selectedDashboardMetrics = dashboard?.periods?.[selectedPeriod] ?? null;
  const dashboardCompetitions = useMemo(() => {
    const query = competitionSearch.trim().toLowerCase();
    const list = dashboard?.competitions ?? [];
    if (!query) return list;
    return list.filter((item) => {
      const haystack = [item.event_name, item.event_location, item.event_type].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [competitionSearch, dashboard?.competitions]);

  const profitList = useMemo(() => {
    return profitItems.map((media) => {
      const eventName = media.event_id ? eventNameById(String(media.event_id)) : '';
      const title = eventName || t('Uploaded media');
      return {
        id: String(media.media_id),
        title,
        downloads: Number(media.downloads_count ?? 0) || 0,
        views: Number(media.views_count ?? 0) || 0,
        likes: Number(media.likes_count ?? 0) || 0,
        profit_cents: Number(media.profit_cents ?? 0) || 0,
        media,
      };
    });
  }, [eventNameById, profitItems, t]);

  const filteredCompetitions = useMemo(() => {
    const query = competitionSearch.trim().toLowerCase();
    if (!query) return competitions;
    return competitions.filter((item) => (item.event_name || '').toLowerCase().includes(query));
  }, [competitionSearch, competitions]);

  const headerTitle = isCompetitionList
    ? t('Competitions')
    : isCompetitionMedia
      ? selectedCompetition?.event_name || `${t('competition')} ${t('uploads')}`
      : isProfitView
        ? t('Download profit')
        : isHistoryView
          ? t('Download history')
          : t('Downloads');

  const headerCount = isDashboardView
    ? dashboardCompetitions.length
    : isCompetitionList
      ? filteredCompetitions.length
      : isCompetitionMedia
        ? competitionMediaItems.length
        : isProfitView
          ? profitList.length
          : downloads.length;

  const renderHistoryItem = useCallback(
    ({item}: {item: DownloadItem}) => {
      const media = item.media;
      const thumbCandidate = media.thumbnail_url || media.preview_url || media.original_url || null;
      const resolvedThumb = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
      const thumb = withAccessToken(resolvedThumb) || resolvedThumb;

      return (
        <TouchableOpacity
          style={Styles.card}
          activeOpacity={0.85}
          onPress={() => {
            navigation.navigate('PhotoDetailScreen', {
              eventTitle: eventNameById(media.event_id),
              media: {
                id: media.media_id,
                eventId: media.event_id,
                thumbnailUrl: media.thumbnail_url,
                previewUrl: media.preview_url,
                originalUrl: media.original_url,
                fullUrl: media.full_url,
                rawUrl: media.raw_url,
                hlsManifestPath: media.hls_manifest_path,
                type: media.type,
              },
            });
          }}
        >
          {thumb ? (
            <FastImage source={{uri: String(thumb)}} style={Styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={[Styles.cardImage, {backgroundColor: colors.btnBackgroundColor}]} />
          )}

          <View style={Styles.cardMetaRow}>
            <Text style={Styles.cardMetaText}>
              {media.type === 'video' ? t('Video') : t('Photo')} • {String(item.download.last_downloaded_at).slice(0, 10)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [
      Styles.card,
      Styles.cardImage,
      Styles.cardMetaRow,
      Styles.cardMetaText,
      colors.btnBackgroundColor,
      eventNameById,
      navigation,
      t,
      toAbsoluteUrl,
      withAccessToken,
    ],
  );

  const renderProfitItem = useCallback(
    ({item}: {item: {id: string; title: string; downloads: number; views: number; likes: number; profit_cents: number; media: MediaViewAllItem}}) => {
      const thumbCandidate = item.media.thumbnail_url || item.media.preview_url || item.media.original_url || item.media.full_url || item.media.raw_url || null;
      const resolvedThumb = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
      const thumb = withAccessToken(resolvedThumb) || resolvedThumb;

      return (
        <TouchableOpacity
          style={Styles.profitCard}
          activeOpacity={0.85}
          onPress={() => {
            if (item.media.type === 'video') {
              navigation.navigate('VideoPlayingScreen', {
                video: {
                  title: item.title,
                  media_id: item.media.media_id,
                  thumbnail: thumb ? {uri: String(thumb)} : undefined,
                  uri: item.media.preview_url ?? item.media.original_url ?? item.media.full_url ?? item.media.raw_url ?? '',
                },
              });
            } else {
              navigation.navigate('PhotoDetailScreen', {
                eventTitle: item.title,
                media: {
                  id: item.media.media_id,
                  eventId: item.media.event_id ?? null,
                  thumbnailUrl: item.media.thumbnail_url,
                  previewUrl: item.media.preview_url,
                  originalUrl: item.media.original_url,
                  fullUrl: item.media.full_url,
                  rawUrl: item.media.raw_url,
                  hlsManifestPath: item.media.hls_manifest_path,
                  type: item.media.type,
                },
              });
            }
          }}
        >
          <View style={Styles.profitTopRow}>
            {thumb ? (
              <FastImage source={{uri: String(thumb)}} style={Styles.profitThumb} resizeMode="cover" />
            ) : (
              <View style={Styles.profitThumbPlaceholder} />
            )}
            <View style={Styles.profitInfo}>
              <Text style={Styles.profitTitle}>{item.title}</Text>
              <View style={Styles.profitRow}>
                <Text style={Styles.profitMeta}>{item.downloads} {t('downloads')}</Text>
                <Text style={Styles.profitMeta}>
                  {item.views.toLocaleString()} {t('views')} • {item.likes.toLocaleString()} {t('likes')}
                </Text>
                <Text style={Styles.profitAmount}>{formatMoney(item.profit_cents)}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [
      Styles.profitAmount,
      Styles.profitCard,
      Styles.profitInfo,
      Styles.profitMeta,
      Styles.profitRow,
      Styles.profitThumb,
      Styles.profitThumbPlaceholder,
      Styles.profitTitle,
      Styles.profitTopRow,
      formatMoney,
      navigation,
      t,
      toAbsoluteUrl,
      withAccessToken,
    ],
  );

  const renderCompetitionItem = useCallback(
    ({item}: {item: UploadedCompetition}) => (
      <TouchableOpacity
        style={Styles.competitionRow}
        activeOpacity={0.85}
        onPress={() => {
          navigation.navigate('DownloadsDetailsScreen', {
            mode: 'competition-media',
            competition: item,
          });
        }}
      >
        <View style={Styles.competitionRowInfo}>
          <Text style={Styles.competitionRowTitle}>{item.event_name || t('competition')}</Text>
          <Text style={Styles.competitionRowMeta}>{Number(item.uploads_count ?? 0)} {t('uploads')} • {formatEventDate(item.event_date)}</Text>
          <Text style={Styles.competitionRowMetaSecondary}>{item.event_location ?? ''}</Text>
        </View>
        <View style={Styles.competitionBadge}>
          <Text style={Styles.competitionBadgeText}>{formatCompetitionType(item.event_type)}</Text>
        </View>
      </TouchableOpacity>
    ),
    [
      Styles.competitionBadge,
      Styles.competitionBadgeText,
      Styles.competitionRow,
      Styles.competitionRowInfo,
      Styles.competitionRowMeta,
      Styles.competitionRowMetaSecondary,
      Styles.competitionRowTitle,
      formatCompetitionType,
      formatEventDate,
      navigation,
      t,
    ],
  );

  const renderCompetitionMediaItem = useCallback(
    ({item}: {item: MediaViewAllItem}) => {
      const thumbCandidate = item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || null;
      const resolvedThumb = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
      const thumb = withAccessToken(resolvedThumb) || resolvedThumb;
      return (
        <TouchableOpacity
          style={Styles.mediaRow}
          activeOpacity={0.85}
          onPress={() => {
            if (item.type === 'video') {
              navigation.navigate('VideoPlayingScreen', {
                video: {
                  title: selectedCompetition?.event_name || t('competition'),
                  media_id: item.media_id,
                  thumbnail: thumb ? {uri: String(thumb)} : undefined,
                  uri: item.preview_url ?? item.original_url ?? item.full_url ?? item.raw_url ?? '',
                },
              });
            } else {
              navigation.navigate('PhotoDetailScreen', {
                eventTitle: selectedCompetition?.event_name || t('competition'),
                media: {
                  id: item.media_id,
                  eventId: item.event_id ?? selectedCompetition?.event_id ?? null,
                  thumbnailUrl: item.thumbnail_url,
                  previewUrl: item.preview_url,
                  originalUrl: item.original_url,
                  fullUrl: item.full_url,
                  rawUrl: item.raw_url,
                  hlsManifestPath: item.hls_manifest_path,
                  type: item.type,
                },
              });
            }
          }}
        >
          {thumb ? (
            <FastImage source={{uri: String(thumb)}} style={Styles.mediaThumb} resizeMode="cover" />
          ) : (
            <View style={Styles.mediaThumbPlaceholder} />
          )}
          <View style={Styles.mediaInfo}>
            <Text style={Styles.mediaTitle}>{selectedCompetition?.event_name || t('competition')}</Text>
            <Text style={Styles.mediaMeta}>{item.type === 'video' ? t('Video') : t('Photo')}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [
      Styles.mediaInfo,
      Styles.mediaMeta,
      Styles.mediaRow,
      Styles.mediaThumb,
      Styles.mediaThumbPlaceholder,
      Styles.mediaTitle,
      navigation,
      selectedCompetition?.event_name,
      selectedCompetition?.event_id,
      t,
      toAbsoluteUrl,
      withAccessToken,
    ],
  );

  const renderDashboardCompetition = useCallback(
    (item: DownloadsDashboardCompetition) => {
      const metrics = item.metrics?.[selectedPeriod] ?? {downloads: 0, views: 0, revenue_cents: 0};
      const trend = item.trends?.[selectedPeriod] ?? {direction: 'flat', delta_downloads: 0, delta_views: 0, delta_revenue_cents: 0};
      const trendColor = trend.direction === 'up' ? '#24A148' : trend.direction === 'down' ? '#D93025' : colors.subTextColor;
      const cover = withAccessToken(toAbsoluteUrl(item.cover_thumbnail_url)) || toAbsoluteUrl(item.cover_thumbnail_url);
      const trendIcon = trend.direction === 'up'
        ? <ArrowUp2 size={16} color={trendColor} variant="Linear" />
        : trend.direction === 'down'
          ? <ArrowDown2 size={16} color={trendColor} variant="Linear" />
          : <View style={Styles.trendFlatDot} />;
      const trendLabel = selectedPeriod === 'all'
        ? t('Stable all-time performance')
        : trend.direction === 'up'
          ? t('Up versus the previous period')
          : trend.direction === 'down'
            ? t('Down versus the previous period')
            : t('Holding steady versus the previous period');

      return (
        <View key={item.event_id} style={Styles.dashboardCompetitionCard}>
          <View style={Styles.dashboardCompetitionTopRow}>
            {cover ? (
              <FastImage source={{uri: String(cover)}} style={Styles.dashboardCompetitionThumb} resizeMode="cover" />
            ) : (
              <View style={Styles.dashboardCompetitionThumbPlaceholder} />
            )}
            <View style={Styles.dashboardCompetitionInfo}>
              <Text style={Styles.dashboardCompetitionTitle}>{item.event_name || t('competition')}</Text>
              <Text style={Styles.dashboardCompetitionMeta}>
                {[formatCompetitionType(item.event_type), formatEventDate(item.event_date), item.event_location]
                  .filter((part) => String(part || '').trim().length > 0)
                  .join(' • ')}
              </Text>
              <View style={Styles.trendRow}>
                {trendIcon}
                <Text style={[Styles.trendText, {color: trendColor}]}>{trendLabel}</Text>
              </View>
            </View>
          </View>

          <View style={Styles.dashboardCompetitionStatsRow}>
            <View style={Styles.dashboardMiniStat}>
              <Text style={Styles.dashboardMiniStatLabel}>{t('downloads')}</Text>
              <Text style={Styles.dashboardMiniStatValue}>{Number(metrics.downloads ?? 0).toLocaleString()}</Text>
            </View>
            <View style={Styles.dashboardMiniStat}>
              <Text style={Styles.dashboardMiniStatLabel}>{t('views')}</Text>
              <Text style={Styles.dashboardMiniStatValue}>{Number(metrics.views ?? 0).toLocaleString()}</Text>
            </View>
            <View style={Styles.dashboardMiniStat}>
              <Text style={Styles.dashboardMiniStatLabel}>{t('Revenue')}</Text>
              <Text style={Styles.dashboardMiniStatValue}>{formatMoney(metrics.revenue_cents ?? 0)}</Text>
            </View>
          </View>

          <View style={Styles.dashboardCompetitionFooter}>
            <Text style={Styles.dashboardCompetitionFootnote}>{Number(item.uploads_count ?? 0)} {t('uploads')}</Text>
            <TouchableOpacity
              style={Styles.dashboardOpenButton}
              onPress={() => {
                navigation.navigate('DownloadsDetailsScreen', {
                  mode: 'competition-media',
                  competition: {
                    event_id: item.event_id,
                    event_name: item.event_name,
                    event_location: item.event_location,
                    event_date: item.event_date,
                    event_type: item.event_type,
                    uploads_count: item.uploads_count,
                    cover_thumbnail_url: item.cover_thumbnail_url,
                  },
                });
              }}
            >
              <Text style={Styles.dashboardOpenButtonText}>{t('Open details')}</Text>
              <ArrowRight size={16} color={colors.primaryColor} variant="Linear" />
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [
      Styles.dashboardCompetitionCard,
      Styles.dashboardCompetitionFooter,
      Styles.dashboardCompetitionFootnote,
      Styles.dashboardCompetitionInfo,
      Styles.dashboardCompetitionMeta,
      Styles.dashboardCompetitionThumb,
      Styles.dashboardCompetitionThumbPlaceholder,
      Styles.dashboardCompetitionTitle,
      Styles.dashboardCompetitionTopRow,
      Styles.dashboardMiniStat,
      Styles.dashboardMiniStatLabel,
      Styles.dashboardMiniStatValue,
      Styles.dashboardCompetitionStatsRow,
      Styles.dashboardOpenButton,
      Styles.dashboardOpenButtonText,
      Styles.trendFlatDot,
      Styles.trendRow,
      Styles.trendText,
      colors.primaryColor,
      colors.subTextColor,
      formatCompetitionType,
      formatEventDate,
      formatMoney,
      navigation,
      selectedPeriod,
      t,
      toAbsoluteUrl,
      withAccessToken,
    ],
  );

  const dashboardRefreshControl = useMemo(
    () => <RefreshControl refreshing={isLoading} onRefresh={loadDashboard} tintColor={colors.primaryColor} />,
    [colors.primaryColor, isLoading, loadDashboard],
  );

  return (
    <View style={Styles.mainContainer}>
      <SizeBox height={insets.top} />

      <View style={Styles.header}>
        <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={Styles.headerTitle}>{headerTitle}</Text>
        <View style={Styles.headerCountBadge}>
          <Text style={Styles.headerCountText}>{String(headerCount)}</Text>
        </View>
      </View>

      {isDashboardView && (
        <ScrollView
          contentContainerStyle={[Styles.dashboardContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 40}]}
          refreshControl={dashboardRefreshControl}
          showsVerticalScrollIndicator={false}
        >
          <View style={Styles.dashboardHero}>
            <Text style={Styles.dashboardEyebrow}>{t('Revenue dashboard')}</Text>
            <Text style={Styles.dashboardTitle}>{t('Downloads, views, and revenue')}</Text>
            <Text style={Styles.dashboardSubtitle}>
              {t('Track what is performing now, then open a competition to inspect the media behind it.')}
            </Text>
          </View>

          <View style={Styles.periodToggleRow}>
            {PERIOD_OPTIONS.map((option) => {
              const isActive = option.key === selectedPeriod;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[Styles.periodToggle, isActive && Styles.periodToggleActive]}
                  onPress={() => setSelectedPeriod(option.key)}
                >
                  <Text style={[Styles.periodToggleText, isActive && Styles.periodToggleTextActive]}>
                    {t(option.label)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={Styles.kpiGrid}>
            <View style={Styles.kpiCard}>
              <Text style={Styles.kpiLabel}>{t('Downloads')}</Text>
              <Text style={Styles.kpiValue}>{formatMetricValue('downloads', selectedDashboardMetrics)}</Text>
            </View>
            <View style={Styles.kpiCard}>
              <Text style={Styles.kpiLabel}>{t('Views')}</Text>
              <Text style={Styles.kpiValue}>{formatMetricValue('views', selectedDashboardMetrics)}</Text>
            </View>
            <View style={Styles.kpiCard}>
              <Text style={Styles.kpiLabel}>{t('Revenue')}</Text>
              <Text style={Styles.kpiValue}>{formatMetricValue('revenue', selectedDashboardMetrics)}</Text>
            </View>
          </View>

          <View style={Styles.dashboardQuickLinks}>
            <TouchableOpacity
              style={Styles.dashboardQuickLink}
              onPress={() => navigation.navigate('DownloadsDetailsScreen', {mode: 'profit'})}
            >
              <Text style={Styles.dashboardQuickLinkTitle}>{t('Top media')}</Text>
              <Text style={Styles.dashboardQuickLinkSubtitle}>{t('See which uploads convert best')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={Styles.dashboardQuickLink}
              onPress={() => navigation.navigate('DownloadsDetailsScreen', {mode: 'history'})}
            >
              <Text style={Styles.dashboardQuickLinkTitle}>{t('Download history')}</Text>
              <Text style={Styles.dashboardQuickLinkSubtitle}>{t('Review every purchased photo or video')}</Text>
            </TouchableOpacity>
          </View>

          <View style={Styles.listHeader}>
            <Text style={Styles.sectionTitle}>{t('Competition performance')}</Text>
            <View style={Styles.searchBar}>
              <TextInput
                style={Styles.searchInput}
                placeholder={t('Search competition')}
                placeholderTextColor={colors.grayColor}
                value={competitionSearch}
                onChangeText={setCompetitionSearch}
              />
            </View>
          </View>

          {errorText ? <Text style={Styles.errorText}>{errorText}</Text> : null}
          {!isLoading && dashboardCompetitions.length === 0 ? (
            <Text style={Styles.emptyText}>{t('No uploaded competitions found yet.')}</Text>
          ) : null}
          {dashboardCompetitions.map(renderDashboardCompetition)}
        </ScrollView>
      )}

      {isCompetitionList && (
        <FlatList
          data={filteredCompetitions}
          keyExtractor={(item) => String(item.event_id)}
          contentContainerStyle={[Styles.listContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}]}
          ListHeaderComponent={
            <View style={Styles.listHeader}>
              <Text style={Styles.sectionTitle}>{t('Competitions')}</Text>
              <View style={Styles.searchBar}>
                <TextInput
                  style={Styles.searchInput}
                  placeholder={t('Search competition')}
                  placeholderTextColor={colors.grayColor}
                  value={competitionSearch}
                  onChangeText={setCompetitionSearch}
                />
              </View>
            </View>
          }
          ListEmptyComponent={<Text style={Styles.emptyText}>{t('No competitions found.')}</Text>}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadCompetitions} tintColor={colors.primaryColor} />}
          renderItem={renderCompetitionItem}
        />
      )}

      {isCompetitionMedia && (
        <FlatList
          data={competitionMediaItems}
          keyExtractor={(item) => String(item.media_id)}
          contentContainerStyle={[Styles.listContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}]}
          ListHeaderComponent={<Text style={Styles.sectionTitle}>{t('Your uploads')}</Text>}
          ListEmptyComponent={<Text style={Styles.emptyText}>{t('No uploads yet.')}</Text>}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => loadCompetitionMedia(selectedCompetition?.event_id ?? route?.params?.competitionId ?? null, {offset: 0, append: false})}
              tintColor={colors.primaryColor}
            />
          }
          onEndReachedThreshold={0.35}
          onEndReached={() => {
            if (isLoading || isCompetitionMediaLoadingMore || !hasMoreCompetitionMedia) return;
            loadCompetitionMedia(selectedCompetition?.event_id ?? route?.params?.competitionId ?? null, {
              offset: competitionMediaItems.length,
              append: true,
            });
          }}
          ListFooterComponent={
            isCompetitionMediaLoadingMore ? (
              <View style={{paddingVertical: 16}}>
                <ActivityIndicator color={colors.primaryColor} />
              </View>
            ) : null
          }
          renderItem={renderCompetitionMediaItem}
        />
      )}

      {isProfitView && (
        <FlatList
          data={profitList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[Styles.listContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}]}
          ListEmptyComponent={<Text style={Styles.emptyText}>{t('No uploads yet.')}</Text>}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadProfit} tintColor={colors.primaryColor} />}
          renderItem={renderProfitItem}
        />
      )}

      {isHistoryView && (
        <FlatList
          data={downloads}
          keyExtractor={(item) => String(item.download.download_id)}
          numColumns={2}
          columnWrapperStyle={Styles.gridRow}
          contentContainerStyle={[Styles.listContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}]}
          ListHeaderComponent={
            <View>
              {tutorialMode && (
                <View style={Styles.tutorialCard}>
                  <Text style={Styles.tutorialTitle}>
                    {tutorialStep === 'download-demo' ? t('Tutorial: Download demo photo') : t('Tutorial: My downloads')}
                  </Text>
                  <Text style={Styles.tutorialBody}>
                    {tutorialStep === 'download-demo'
                      ? t('Tap the button below to download the demo photo. Then continue to see where your downloaded files appear.')
                      : t('All photos and videos you download are listed here. You can always come back to this screen from Home.')}
                  </Text>
                  <FastImage
                    source={{uri: tutorialPhotoUrl}}
                    style={Styles.tutorialImage}
                  />
                  {tutorialStep === 'download-demo' ? (
                    <TouchableOpacity style={Styles.tutorialPrimaryButton} onPress={() => setTutorialDemoDownloaded(true)}>
                      <Text style={Styles.tutorialPrimaryButtonText}>
                        {tutorialDemoDownloaded ? t('Downloaded') : t('Download demo')}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
            </View>
          }
          ListEmptyComponent={<Text style={Styles.emptyText}>{t('No downloads yet.')}</Text>}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadDownloads} tintColor={colors.primaryColor} />}
          renderItem={renderHistoryItem}
        />
      )}

      {isLoading && !isDashboardView && !downloads.length && !profitList.length && !filteredCompetitions.length && !competitionMediaItems.length ? (
        <View style={Styles.loadingOverlay}>
          <ActivityIndicator color={colors.primaryColor} />
        </View>
      ) : null}
    </View>
  );
};

export default DownloadsDetailsScreen;
