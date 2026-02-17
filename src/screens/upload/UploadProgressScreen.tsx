import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft2} from 'iconsax-react-nativejs';
import {useTheme} from '../../context/ThemeContext';
import {useAuth} from '../../context/AuthContext';
import {useTranslation} from 'react-i18next';
import SizeBox from '../../constants/SizeBox';
import {createStyles} from './UploadProgressScreenStyles';
import {
  ApiError,
  getMediaStatus,
  uploadMediaBatch,
  uploadMediaBatchWatermark,
  type MediaProcessingStatus,
} from '../../services/apiGateway';
import {getUploadSession, upsertUploadSession, type UploadSession} from '../../services/uploadSessions';
import RNFS from 'react-native-fs';
import FastImage from 'react-native-fast-image';

function fileUriToPath(uri: string) {
  if (!uri || !uri.startsWith('file://')) return uri;
  // RN/iOS may give us percent-encoded file URIs (spaces => %20). RNFS expects a real filesystem path.
  let path = uri.slice('file://'.length);
  // Defensive: strip querystring if present.
  const q = path.indexOf('?');
  if (q !== -1) path = path.slice(0, q);
  try {
    path = decodeURI(path);
  } catch {}
  return path;
}

function ensureFileScheme(pathOrUri: string) {
  if (!pathOrUri) return pathOrUri;
  if (pathOrUri.startsWith('file://')) return pathOrUri;
  return `file://${pathOrUri}`;
}

function normalizeFileUri(uri: string) {
  if (!uri) return uri;
  if (!uri.startsWith('file://')) return uri;
  return ensureFileScheme(fileUriToPath(uri));
}

async function salvageTmpFileIfNeeded(uri: string): Promise<string> {
  // If a previous app run stored an iOS /tmp URI, it may disappear.
  // Best-effort: if it still exists, copy it into a durable document path now.
  if (!uri || !uri.startsWith('file://')) return uri;
  const rawPath = fileUriToPath(uri);
  if (!rawPath.includes('/tmp/')) return uri;

  const exists = await RNFS.exists(rawPath);
  if (!exists) return uri;

  const destDir = `${RNFS.DocumentDirectoryPath}/allin_uploads`;
  try {
    await RNFS.mkdir(destDir);
  } catch {}

  const name = rawPath.split('/').pop() || `upload-${Date.now()}`;
  const safeName = name.replace(/[^\w.\-]+/g, '_');
  const destPath = `${destDir}/${Date.now()}-${safeName}`;
  try {
    await RNFS.copyFile(rawPath, destPath);
    return ensureFileScheme(destPath);
  } catch {
    return normalizeFileUri(uri);
  }
}

type UploadItem = {
  uri: string;
  type?: string | null;
  fileName?: string | null;
  category?: string | null;
  status: 'pending' | 'uploading' | 'uploaded' | 'failed';
  media_id?: string | null;
  error?: string | null;
};

const BATCH_SIZE = 5;
const STATUS_POLL_MS = 5000;
const UPLOAD_FLOW_RESET_KEY = '@upload_flow_reset_required';

const UploadProgressScreen = ({navigation, route}: any) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const {t} = useTranslation();
  const {apiAccessToken} = useAuth();

  const competition = route?.params?.competition;
  const anonymous = Boolean(route?.params?.anonymous);
  const watermarkText = String(route?.params?.watermarkText ?? route?.params?.watermark_text ?? '').trim();
  const sessionId: string = String(route?.params?.sessionId ?? '').trim() || `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const autoStart: boolean = route?.params?.autoStart !== false;

  const competitionId = useMemo(
    () => String(competition?.id || competition?.event_id || competition?.eventId || 'competition'),
    [competition?.event_id, competition?.eventId, competition?.id],
  );

  const sessionKey = useMemo(() => `@upload_activity_${competitionId}`, [competitionId]);
  const assetsKey = useMemo(() => `@upload_assets_${competitionId}`, [competitionId]);

  const [items, setItems] = useState<UploadItem[]>([]);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<{ready: number; total: number}>({ready: 0, total: 0});
  const pollTimerRef = useRef<any>(null);
  const mediaIdsRef = useRef<string[]>([]);
  const [statusById, setStatusById] = useState<Record<string, MediaProcessingStatus>>({});
  const sessionRef = useRef<UploadSession | null>(null);

  const persistSession = useCallback(async (patch: Partial<UploadSession>) => {
    const base: UploadSession = sessionRef.current ?? {
      id: sessionId,
      competitionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      anonymous,
      watermarkText,
      phase: 'uploading',
      total: 0,
      uploaded: 0,
      processing_ready: 0,
      processing_total: 0,
      media_ids: [],
      error: null,
    };
    const next: UploadSession = {
      ...base,
      ...patch,
      id: base.id,
      competitionId: base.competitionId,
      updatedAt: Date.now(),
    };
    sessionRef.current = next;
    await upsertUploadSession(next);
  }, [anonymous, competitionId, sessionId, watermarkText]);

  const persistActivity = useCallback(async (patch: any) => {
    try {
      const currentRaw = await AsyncStorage.getItem(sessionKey);
      const current = currentRaw ? JSON.parse(currentRaw) : {};
      await AsyncStorage.setItem(sessionKey, JSON.stringify({...current, ...patch, updatedAt: Date.now()}));
    } catch {
      // ignore
    }
  }, [sessionKey]);

  const loadAssets = useCallback(async () => {
    const raw = await AsyncStorage.getItem(assetsKey);
    const parsed = raw ? JSON.parse(raw) : {};
    const flat: UploadItem[] = [];
    if (parsed && typeof parsed === 'object') {
      for (const [category, list] of Object.entries(parsed)) {
        const arr = Array.isArray(list) ? list : [];
        for (const asset of arr as any[]) {
          if (!asset?.uri) continue;
          // Normalize percent-encoded file URIs (spaces => %20) and salvage older sessions that stored iOS /tmp URIs.
          let uri = normalizeFileUri(String(asset.uri));
          try {
            uri = await salvageTmpFileIfNeeded(uri);
          } catch {
            // ignore
          }
          flat.push({
            uri,
            type: asset?.type ?? null,
            fileName: asset?.fileName ?? null,
            category: String(category),
            status: 'pending',
            media_id: null,
            error: null,
          });
        }
      }
    }
    setItems(flat);
    await persistActivity({phase: 'uploading', total: flat.length, uploaded: 0, processing_ready: 0, processing_total: 0, watermarkText, anonymous});
    await persistSession({phase: 'uploading', total: flat.length, uploaded: 0, processing_ready: 0, processing_total: 0, media_ids: []});
    return flat;
  }, [anonymous, assetsKey, persistActivity, persistSession, watermarkText]);

  const uploadAll = useCallback(async () => {
    if (!apiAccessToken) {
      setError(t('Log in (or set a Dev API token) to upload.'));
      return;
    }
    setError(null);
    setPhase('uploading');

    const flat = await loadAssets();
    if (flat.length === 0) {
      setError(t('No uploads yet.'));
      setPhase('idle');
      return;
    }

    const event_id = competitionId;

    let uploadedCount = 0;
    const nextItems = [...flat];
    for (let i = 0; i < nextItems.length; i += BATCH_SIZE) {
      const batch = nextItems.slice(i, i + BATCH_SIZE);
      // mark uploading
      for (let j = 0; j < batch.length; j += 1) {
        nextItems[i + j] = {...nextItems[i + j], status: 'uploading'};
      }
      setItems([...nextItems]);
      try {
        const files = [];
        for (let j = 0; j < batch.length; j += 1) {
          const b = batch[j];
          let uri = normalizeFileUri(String(b.uri || ''));
          if (!uri) continue;

          // Verify local file exists (file:// only). If missing, mark failed with a helpful message.
          if (uri.startsWith('file://')) {
            const rawPath = fileUriToPath(uri);
            const exists = await RNFS.exists(rawPath);
            if (!exists) {
              nextItems[i + j] = {
                ...nextItems[i + j],
                status: 'failed',
                error: t('Selected file is no longer available. Please re-select it and try again.'),
              };
              continue;
            }
          }

          files.push({
            uri,
            type: b.type || undefined,
            name: b.fileName || `upload-${i + j + 1}`,
          });
        }

        // If everything in the batch was missing, skip hitting the API.
        if (files.length === 0) {
          setItems([...nextItems]);
          continue;
        }

        const resp = watermarkText
          ? await uploadMediaBatchWatermark(apiAccessToken, {
              files,
              watermark_text: watermarkText,
              event_id,
              is_anonymous: anonymous,
            })
          : await uploadMediaBatch(apiAccessToken, {files, event_id, is_anonymous: anonymous});

        const results = Array.isArray(resp?.results) ? resp.results : [];
        for (let j = 0; j < batch.length; j += 1) {
          const r = results[j] ?? null;
          const ok = Boolean(r?.ok);
          const resolvedMediaId = ok ? String(r?.media_id ?? r?.existing_media_id ?? '').trim() : '';
          if (ok && resolvedMediaId) {
            mediaIdsRef.current.push(resolvedMediaId);
          }
          nextItems[i + j] = {
            ...nextItems[i + j],
            status: ok ? 'uploaded' : 'failed',
            media_id: ok ? (resolvedMediaId || null) : null,
            error: ok ? null : String(r?.error ?? 'upload failed'),
          };
          if (ok) uploadedCount += 1;
        }
        setItems([...nextItems]);
        await persistActivity({uploaded: uploadedCount, total: nextItems.length, phase: 'uploading'});
        await persistSession({uploaded: uploadedCount, total: nextItems.length, phase: 'uploading'});
      } catch (e: any) {
        const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
        setError(msg);
        // mark batch as failed
        for (let j = 0; j < batch.length; j += 1) {
          nextItems[i + j] = {...nextItems[i + j], status: 'failed', error: msg};
        }
        setItems([...nextItems]);
        await persistActivity({uploaded: uploadedCount, total: nextItems.length, phase: 'uploading', error: msg});
        await persistSession({uploaded: uploadedCount, total: nextItems.length, phase: 'failed', error: msg});
      }
    }

    const mediaIds = [...mediaIdsRef.current];
    // Reset upload draft immediately after successful upload, without waiting for processing completion.
    if (uploadedCount > 0) {
      try {
        await AsyncStorage.multiRemove([
          assetsKey,
          `@upload_counts_${competitionId}`,
        ]);
        await AsyncStorage.setItem(UPLOAD_FLOW_RESET_KEY, '1');
      } catch {
        // ignore
      }
    }
    await persistActivity({media_ids: mediaIds, phase: 'processing', processing_total: mediaIds.length});
    await persistSession({media_ids: mediaIds, phase: 'processing', processing_total: mediaIds.length});
    setPhase('processing');
  }, [anonymous, apiAccessToken, assetsKey, competitionId, loadAssets, persistActivity, persistSession, t, watermarkText]);

  useEffect(() => {
    // If we opened this screen from "activity", we only display/poll.
    // If we opened from the upload flow, we auto-start the upload.
    (async () => {
      const existing = await getUploadSession(sessionId);
      if (existing) {
        sessionRef.current = existing;
        if (Array.isArray(existing.media_ids)) {
          mediaIdsRef.current = existing.media_ids;
        }
        if (existing.phase === 'processing') setPhase('processing');
        if (existing.phase === 'done') setPhase('done');
        if (!autoStart) return;
      }
      if (autoStart) uploadAll();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computeUploadProgress = useMemo(() => {
    const total = items.length;
    const done = items.filter((x) => x.status === 'uploaded').length;
    const failed = items.filter((x) => x.status === 'failed').length;
    return {total, done, failed};
  }, [items]);

  const pollStatus = useCallback(async () => {
    if (!apiAccessToken) return;
    const ids = mediaIdsRef.current;
    if (!ids || ids.length === 0) return;
    try {
      const resp = await getMediaStatus(apiAccessToken, ids);
      const list: MediaProcessingStatus[] = Array.isArray(resp?.results) ? resp.results : [];
      const map: Record<string, MediaProcessingStatus> = {};
      for (const s of list) {
        if (!s?.media_id) continue;
        map[String(s.media_id)] = s;
      }
      setStatusById(map);
      const ready = list.filter((x) => x?.steps?.transforms_done && x?.steps?.embeddings_done).length;
      setProcessing({ready, total: ids.length});
      await persistActivity({processing_ready: ready, processing_total: ids.length, phase: 'processing'});
      if (ready >= ids.length) {
        setPhase('done');
        await persistActivity({phase: 'done'});
        await persistSession({phase: 'done', processing_ready: ready, processing_total: ids.length});
        try {
          await AsyncStorage.multiRemove([
            assetsKey,
            `@upload_counts_${competitionId}`,
            `@upload_session_${competitionId}`,
          ]);
          await AsyncStorage.setItem(UPLOAD_FLOW_RESET_KEY, '1');
        } catch {
          // ignore
        }
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      }
    } catch {
      // ignore polling errors
    }
  }, [apiAccessToken, assetsKey, competitionId, persistActivity, persistSession]);

  useEffect(() => {
    if (phase !== 'processing') return;
    pollStatus();
    pollTimerRef.current = setInterval(pollStatus, STATUS_POLL_MS);
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [phase, pollStatus]);

  const headerTitle = useMemo(() => {
    if (phase === 'uploading') return t('Starting upload');
    if (phase === 'processing') return t('Processing');
    if (phase === 'done') return t('Done');
    return t('Upload');
  }, [phase, t]);

  const progress = useMemo(() => {
    if (phase === 'processing') {
      const denom = Math.max(1, processing.total);
      return Math.min(1, processing.ready / denom);
    }
    const denom = Math.max(1, computeUploadProgress.total);
    return Math.min(1, computeUploadProgress.done / denom);
  }, [computeUploadProgress.done, computeUploadProgress.total, phase, processing.ready, processing.total]);

  const subtitle = useMemo(() => {
    if (phase === 'processing') return t('We are enhancing your media and generating AI results.');
    if (phase === 'done') return t('Your uploads are ready.');
    return t('Uploading your files now. You can leave this screen, but uploads may pause in the background.');
  }, [phase, t]);

  const progressLabel = useMemo(() => {
    if (phase === 'processing') return `${processing.ready}/${processing.total} ${t('ready')}`;
    return `${computeUploadProgress.done}/${computeUploadProgress.total} ${t('uploaded')}`;
  }, [computeUploadProgress.done, computeUploadProgress.total, phase, processing.ready, processing.total, t]);

  const handleBack = () => {
    navigation.goBack();
  };

  const goToUploadStart = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'BottomTabBar',
          state: {index: 2, routes: [{name: 'Upload'}]},
        },
      ],
    });
  };

  const goToUploadActivity = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'UploadActivityScreen'}],
    });
  };

  return (
    <View style={styles.mainContainer}>
      <SizeBox height={insets.top} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleBack}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: insets.bottom + 24}}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.title}>{t('Upload activity')}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, {width: `${Math.round(progress * 100)}%`}]} />
            </View>
            <View style={styles.progressMetaRow}>
              <Text style={styles.progressMeta}>{progressLabel}</Text>
              <Text style={styles.progressMeta}>{Math.round(progress * 100)}%</Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.list}>
              {items.slice(0, 6).map((it, idx) => {
                const label =
                  it.status === 'uploaded' ? t('Uploaded') : it.status === 'failed' ? t('Failed') : t('Pending');
                const st = it.media_id ? statusById[String(it.media_id)] : null;
                const thumb = st?.assets?.thumbnail_url ?? st?.assets?.preview_url ?? null;
                return (
                  <View key={`${it.uri}-${idx}`} style={styles.row}>
                    {thumb ? (
                      <FastImage source={{uri: String(thumb)}} style={{width: 42, height: 42, borderRadius: 10, marginRight: 10}} />
                    ) : (
                      <View style={{width: 42, height: 42, borderRadius: 10, marginRight: 10, backgroundColor: colors.btnBackgroundColor}} />
                    )}
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {it.fileName || `File ${idx + 1}`}
                      </Text>
                      <Text style={styles.rowMeta} numberOfLines={1}>
                        {it.category || ''}
                      </Text>
                    </View>
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>{label}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.ctaRow}>
              <TouchableOpacity
                style={styles.ctaSecondary}
                onPress={goToUploadStart}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaSecondaryText}>{t('Back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ctaPrimary}
                onPress={() => (phase === 'done' ? goToUploadActivity() : pollStatus())}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaPrimaryText}>{phase === 'done' ? t('OK') : t('Refresh')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default UploadProgressScreen;
