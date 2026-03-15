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
  getWorkerHealth,
  getMediaStatus,
  uploadMediaBatch,
  uploadMediaBatchWatermark,
  type MediaProcessingStatus,
} from '../../services/apiGateway';
import {
  calculateUploadProgressState,
  getUploadSession,
  upsertUploadSession,
  type UploadSession,
} from '../../services/uploadSessions';
import RNFS from 'react-native-fs';
import FastImage from 'react-native-fast-image';
import { formatUploadDisplayName, formatUploadStageLabel } from '../../utils/uploadPresentation';

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
  title?: string | null;
  category?: string | null;
  discipline_id?: string | null;
  competition_map_id?: string | null;
  checkpoint_id?: string | null;
  checkpoint_label?: string | null;
  price_cents?: number;
  price_currency?: string;
  status: 'pending' | 'uploading' | 'stored' | 'failed';
  media_id?: string | null;
  error?: string | null;
};

const BATCH_SIZE = 1;
const STATUS_POLL_MS = 5000;
const UPLOAD_FLOW_RESET_KEY = '@upload_flow_reset_required';

function isStatusComplete(status?: MediaProcessingStatus | null) {
  const stage = String(status?.stage || '').toLowerCase();
  if (stage === 'complete') return true;
  const steps = status?.steps;
  if (!steps) return false;
  const transformsDone = Boolean(steps.transforms_done);
  const embeddingsDone = Boolean(steps.embeddings_done);
  const bibDone = steps.bib_done === undefined ? true : Boolean(steps.bib_done);
  const indexedDone = steps.indexed_done === undefined ? true : Boolean(steps.indexed_done);
  return transformsDone && embeddingsDone && bibDone && indexedDone;
}

function deriveStatusStage(status?: MediaProcessingStatus | null) {
  const explicitStage = String(status?.stage || '').toLowerCase();
  if (explicitStage) return explicitStage;
  const steps = status?.steps;
  if (!steps) return 'processing';
  if (isStatusComplete(status)) return 'complete';
  if (steps.transforms_done) {
    return steps.embeddings_done || steps.bib_done || steps.indexed_done
      ? 'ai_processing'
      : 'transforms_done';
  }
  return 'uploaded';
}

function getUploadRequestErrorMessage(error: unknown, t: (value: string) => string) {
  if (error instanceof ApiError) {
    if (error.status === 401) return t('Please sign in again to upload.');
    if (error.status === 403) {
      const detailedMessage = String(error.message || '').trim();
      if (detailedMessage && !/^forbidden$/i.test(detailedMessage)) {
        return detailedMessage;
      }
      return t('Upload is not available for this account right now.');
    }
  }
  const message = String((error as any)?.message ?? error ?? '').trim();
  return message || t('Upload failed. Please try again.');
}

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
  const e2eMediaIds = useMemo(
    () => (Array.isArray(route?.params?.e2eMediaIds) ? route.params.e2eMediaIds.map((value: any) => String(value)).filter(Boolean) : []),
    [route?.params?.e2eMediaIds],
  );
  const e2ePhase = String(route?.params?.e2ePhase ?? '').trim().toLowerCase();

  const competitionId = useMemo(
    () => String(competition?.id || competition?.event_id || competition?.eventId || 'competition'),
    [competition?.event_id, competition?.eventId, competition?.id],
  );

  const sessionKey = useMemo(() => `@upload_activity_${competitionId}`, [competitionId]);
  const assetsKey = useMemo(() => `@upload_assets_${competitionId}`, [competitionId]);

  const [items, setItems] = useState<UploadItem[]>([]);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'blocked' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<{ready: number; total: number}>({ready: 0, total: 0});
  const [sessionSnapshot, setSessionSnapshot] = useState<UploadSession | null>(null);
  const pollTimerRef = useRef<any>(null);
  const mediaIdsRef = useRef<string[]>([]);
  const [statusById, setStatusById] = useState<Record<string, MediaProcessingStatus>>({});
  const sessionRef = useRef<UploadSession | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, []);

  const aggregatedMetrics = useMemo(() => {
    const statuses = Object.values(statusById);
    return statuses.reduce(
      (acc, status) => {
        acc.facesFound += Math.max(0, Number(status?.metrics?.face_count ?? 0));
        acc.chestNumbersFound += Math.max(0, Number(status?.metrics?.chest_number_count ?? 0));
        acc.aiComplete += status?.metrics?.ai_complete ? 1 : 0;
        acc.notificationsReady += status?.metrics?.notifications_done ? 1 : 0;
        acc.notificationsSent += Math.max(0, Number(status?.metrics?.notifications_sent ?? 0));
        acc.subscribersTotal += Math.max(0, Number(status?.metrics?.subscribers_total ?? 0));
        return acc;
      },
      {
        facesFound: 0,
        chestNumbersFound: 0,
        aiComplete: 0,
        notificationsReady: 0,
        notificationsSent: 0,
        subscribersTotal: 0,
      },
    );
  }, [statusById]);

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
    if (isMountedRef.current) {
      setSessionSnapshot(next);
    }
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
            title: asset?.title ? String(asset.title) : null,
            category: String(category),
            discipline_id: asset?.discipline_id ? String(asset.discipline_id) : null,
            competition_map_id: asset?.competition_map_id ? String(asset.competition_map_id) : null,
            checkpoint_id: asset?.checkpoint_id ? String(asset.checkpoint_id) : null,
            checkpoint_label: asset?.checkpoint_label ? String(asset.checkpoint_label) : null,
            price_cents: Number(asset?.price_cents ?? 0) || 0,
            price_currency: String(asset?.price_currency || 'EUR'),
            status: 'pending',
            media_id: null,
            error: null,
          });
        }
      }
    }
    if (isMountedRef.current) {
      setItems(flat);
    }
    await persistActivity({phase: 'uploading', total: flat.length, uploaded: 0, processing_ready: 0, processing_total: 0, watermarkText, anonymous});
    await persistSession({phase: 'uploading', total: flat.length, uploaded: 0, processing_ready: 0, processing_total: 0, media_ids: []});
    return flat;
  }, [anonymous, assetsKey, persistActivity, persistSession, watermarkText]);

  const uploadAll = useCallback(async () => {
    if (!apiAccessToken) {
      if (isMountedRef.current) {
        setError(t('Log in (or set a Dev API token) to upload.'));
      }
      return;
    }
    if (isMountedRef.current) {
      setError(null);
      setPhase('uploading');
    }

    try {
      const health = await getWorkerHealth(apiAccessToken);
      if (!health?.ok) {
        const msg = String(health?.message || t('Cloud system is not operational. Please try again shortly.'));
        if (isMountedRef.current) {
          setError(msg);
          setPhase('blocked');
        }
        await persistSession({phase: 'blocked', error: msg});
        await persistActivity({phase: 'blocked', error: msg});
        return;
      }
    } catch (e: any) {
      const msg = t('Could not verify cloud system. Please try again.');
      if (isMountedRef.current) {
        setError(msg);
        setPhase('blocked');
      }
      await persistSession({phase: 'blocked', error: msg});
      await persistActivity({phase: 'blocked', error: msg});
      return;
    }

    mediaIdsRef.current = [];
    if (isMountedRef.current) {
      setStatusById({});
      setProcessing({ready: 0, total: 0});
    }

    const flat = await loadAssets();
    if (flat.length === 0) {
      if (isMountedRef.current) {
        setError(t('No uploads yet.'));
        setPhase('idle');
      }
      return;
    }

    const event_id = competitionId;

    let uploadedCount = 0;
    const nextItems = [...flat];
    let lastUploadError: string | null = null;
    for (let i = 0; i < nextItems.length; i += BATCH_SIZE) {
      const batch = nextItems.slice(i, i + BATCH_SIZE);
      // mark uploading
      for (let j = 0; j < batch.length; j += 1) {
        nextItems[i + j] = {...nextItems[i + j], status: 'uploading'};
      }
      if (isMountedRef.current) {
        setItems([...nextItems]);
      }
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
            title: b.title || null,
          });
        }

        // If everything in the batch was missing, skip hitting the API.
        if (files.length === 0) {
          if (isMountedRef.current) {
            setItems([...nextItems]);
          }
          continue;
        }

        const resp = watermarkText
          ? await uploadMediaBatchWatermark(apiAccessToken, {
              files,
              watermark_text: watermarkText,
              event_id,
              discipline_id: String(batch[0]?.discipline_id || '').trim() || undefined,
              competition_map_id: String(batch[0]?.competition_map_id || '').trim() || undefined,
              checkpoint_id: String(batch[0]?.checkpoint_id || '').trim() || undefined,
              is_anonymous: anonymous,
              price_cents: Number(batch[0]?.price_cents ?? 0) || 0,
              price_currency: String(batch[0]?.price_currency || 'EUR'),
              skip_profile_collection: true,
            })
          : await uploadMediaBatch(apiAccessToken, {
              files,
              event_id,
              discipline_id: String(batch[0]?.discipline_id || '').trim() || undefined,
              competition_map_id: String(batch[0]?.competition_map_id || '').trim() || undefined,
              checkpoint_id: String(batch[0]?.checkpoint_id || '').trim() || undefined,
              is_anonymous: anonymous,
              price_cents: Number(batch[0]?.price_cents ?? 0) || 0,
              price_currency: String(batch[0]?.price_currency || 'EUR'),
              skip_profile_collection: true,
            });

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
            status: ok ? 'stored' : 'failed',
            media_id: ok ? (resolvedMediaId || null) : null,
            error: ok ? null : String(r?.error ?? 'upload failed'),
          };
          if (!ok) {
            lastUploadError = String(r?.error ?? t('Upload failed. Please try again.'));
          }
          if (ok) uploadedCount += 1;
        }
        if (isMountedRef.current) {
          setItems([...nextItems]);
        }
        await persistActivity({uploaded: uploadedCount, total: nextItems.length, phase: 'uploading'});
        await persistSession({uploaded: uploadedCount, total: nextItems.length, phase: 'uploading'});
      } catch (e: any) {
        const msg = getUploadRequestErrorMessage(e, t);
        lastUploadError = msg;
        // mark batch as failed
        for (let j = 0; j < batch.length; j += 1) {
          nextItems[i + j] = {...nextItems[i + j], status: 'failed', error: msg};
        }
        if (isMountedRef.current) {
          setItems([...nextItems]);
        }
        await persistActivity({uploaded: uploadedCount, total: nextItems.length, phase: 'uploading', error: msg});
        await persistSession({uploaded: uploadedCount, total: nextItems.length, phase: 'failed', error: msg});
      }
    }

    const mediaIds = [...mediaIdsRef.current];
    if (uploadedCount === 0) {
      const msg = lastUploadError || t('Upload failed. Please try again.');
      await persistActivity({
        media_ids: [],
        uploaded: 0,
        total: nextItems.length,
        phase: 'failed',
        processing_ready: 0,
        processing_total: 0,
        error: msg,
      });
      await persistSession({
        media_ids: [],
        uploaded: 0,
        total: nextItems.length,
        phase: 'failed',
        processing_ready: 0,
        processing_total: 0,
        error: msg,
      });
      if (isMountedRef.current) {
        setError(msg);
        setPhase('failed');
      }
      return;
    }

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
    await persistActivity({media_ids: mediaIds, phase: 'processing', processing_total: mediaIds.length, error: null});
    await persistSession({media_ids: mediaIds, phase: 'processing', processing_total: mediaIds.length, error: null});
    if (isMountedRef.current) {
      setError(null);
      setPhase('processing');
    }
  }, [anonymous, apiAccessToken, assetsKey, competitionId, loadAssets, persistActivity, persistSession, t, watermarkText]);

  useEffect(() => {
    // If we opened this screen from "activity", we only display/poll.
    // If we opened from the upload flow, we auto-start the upload.
    (async () => {
      const existing = await getUploadSession(sessionId);
      if (existing) {
        sessionRef.current = existing;
        if (!isMountedRef.current) return;
        setSessionSnapshot(existing);
        if (Array.isArray(existing.media_ids)) {
          mediaIdsRef.current = existing.media_ids;
        }
        setProcessing({
          ready: Number(existing.processing_ready ?? 0),
          total: Number(existing.processing_total ?? 0),
        });
        setError(existing.error ? String(existing.error) : null);
        if (existing.phase === 'processing') setPhase('processing');
        if (existing.phase === 'done') setPhase('done');
        if (existing.phase === 'blocked') setPhase('blocked');
        if (existing.phase === 'failed') setPhase('failed');
        if (!autoStart) return;
      }
      if (!autoStart && e2eMediaIds.length > 0) {
        mediaIdsRef.current = e2eMediaIds;
        if (isMountedRef.current) {
          setProcessing({ready: 0, total: e2eMediaIds.length});
          setPhase(e2ePhase === 'done' ? 'done' : e2ePhase === 'blocked' ? 'blocked' : 'processing');
        }
        return;
      }
      if (autoStart) uploadAll();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computeUploadProgress = useMemo(() => {
    const total = items.length > 0 ? items.length : Number(sessionSnapshot?.total ?? 0);
    const done = items.length > 0
      ? items.filter((x) => x.status === 'stored').length
      : Number(sessionSnapshot?.uploaded ?? 0);
    const failed = items.filter((x) => x.status === 'failed').length;
    return {total, done, failed};
  }, [items, sessionSnapshot?.total, sessionSnapshot?.uploaded]);

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
      if (!isMountedRef.current) return;
      setStatusById(map);
      const ready = list.filter((x) => isStatusComplete(x)).length;
      const facesFound = list.reduce((sum, item) => sum + Math.max(0, Number(item?.metrics?.face_count ?? 0)), 0);
      const chestNumbersFound = list.reduce((sum, item) => sum + Math.max(0, Number(item?.metrics?.chest_number_count ?? 0)), 0);
      const notificationsSent = list.reduce((sum, item) => sum + Math.max(0, Number(item?.metrics?.notifications_sent ?? 0)), 0);
      const subscribersTotal = list.reduce((sum, item) => sum + Math.max(0, Number(item?.metrics?.subscribers_total ?? 0)), 0);
      const currentStage = list.some((item) => deriveStatusStage(item) === 'notifying')
        ? 'notifying'
        : list.some((item) => deriveStatusStage(item) === 'ai_processing')
          ? 'ai_processing'
          : list.some((item) => deriveStatusStage(item) === 'transforms_done')
            ? 'transforms_done'
            : list.some((item) => deriveStatusStage(item) === 'uploaded')
              ? 'uploaded'
                : ready >= ids.length
                  ? 'complete'
                : 'processing';
      setProcessing({ready, total: ids.length});
      await persistActivity({
        processing_ready: ready,
        processing_total: ids.length,
        phase: ready >= ids.length ? 'done' : 'processing',
        current_stage: currentStage,
        faces_found: facesFound,
        chest_numbers_found: chestNumbersFound,
        notifications_sent: notificationsSent,
        subscribers_total: subscribersTotal,
      });
      if (ready >= ids.length) {
        if (!isMountedRef.current) return;
        setPhase('done');
        await persistActivity({phase: 'done'});
        await persistSession({
          phase: 'done',
          processing_ready: ready,
          processing_total: ids.length,
          current_stage: 'complete',
          faces_found: facesFound,
          chest_numbers_found: chestNumbersFound,
          notifications_sent: notificationsSent,
          subscribers_total: subscribersTotal,
        });
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
      if (ready < ids.length) {
        await persistSession({
          phase: 'processing',
          processing_ready: ready,
          processing_total: ids.length,
          current_stage: currentStage,
          faces_found: facesFound,
          chest_numbers_found: chestNumbersFound,
          notifications_sent: notificationsSent,
          subscribers_total: subscribersTotal,
        });
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
    if (phase === 'blocked') return t('Upload blocked');
    if (phase === 'failed') return t('Upload failed');
    if (phase === 'done') return t('Done');
    return t('Upload');
  }, [phase, t]);

  const progress = useMemo(() => {
    return calculateUploadProgressState({
      phase,
      total: computeUploadProgress.total,
      uploaded: computeUploadProgress.done,
      processing_ready: processing.ready,
      processing_total: processing.total,
    }).overallProgress;
  }, [computeUploadProgress.done, computeUploadProgress.total, phase, processing.ready, processing.total]);

  const subtitle = useMemo(() => {
    if (phase === 'blocked') return t('Uploads can only start when the cloud system is operational.');
    if (phase === 'failed') return t('Your files could not be uploaded. Please review the error and try again.');
    if (phase === 'processing') return t('We are processing media, running AI, and notifying competition subscribers.');
    if (phase === 'done') return t('Your uploads are ready.');
    return t('Uploading your files to storage now. Please keep this screen open while heavy files are prepared.');
  }, [phase, t]);

  const progressLabel = useMemo(() => {
    const state = calculateUploadProgressState({
      phase,
      total: computeUploadProgress.total,
      uploaded: computeUploadProgress.done,
      processing_ready: processing.ready,
      processing_total: processing.total,
    });
    if (phase === 'blocked') return t('Cloud system check failed');
    if (phase === 'failed') return t('Upload failed');
    if (phase === 'processing') {
      return `${state.processingReady}/${state.processingTotal} ${t('ready')} • ${aggregatedMetrics.notificationsSent}/${aggregatedMetrics.subscribersTotal} ${t('notifications sent')}`;
    }
    if (phase === 'done') return `${state.total}/${state.total} ${t('ready')}`;
    return `${state.uploaded}/${state.total} ${t('stored')}`;
  }, [aggregatedMetrics.notificationsSent, aggregatedMetrics.subscribersTotal, computeUploadProgress.done, computeUploadProgress.total, phase, processing.ready, processing.total, t]);

  const currentStageLabel = useMemo(() => {
    const stage = sessionSnapshot?.current_stage;
    if (phase === 'blocked') return t('Checking cloud system');
    if (phase === 'failed') return t('Upload failed');
    if (phase === 'done') return t('All processing completed');
    if (phase === 'processing') return formatUploadStageLabel(stage || 'ai_processing');
    if (phase === 'uploading') return t('Uploading to storage');
    return t('Preparing upload');
  }, [phase, sessionSnapshot?.current_stage, t]);

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
    <View style={styles.mainContainer} testID="upload-progress-screen">
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
            <Text style={styles.stageText} testID="upload-progress-stage">{currentStageLabel}</Text>

            {error ? <Text style={styles.errorText} testID="upload-progress-error">{error}</Text> : null}

            <View style={styles.metricsGrid} testID="upload-progress-metrics">
              <View style={styles.metricCard} testID="upload-progress-faces">
                <Text style={styles.metricValue} testID="upload-progress-faces-value">{aggregatedMetrics.facesFound}</Text>
                <Text style={styles.metricLabel}>{t('Faces found')}</Text>
              </View>
              <View style={styles.metricCard} testID="upload-progress-bibs">
                <Text style={styles.metricValue} testID="upload-progress-bibs-value">{aggregatedMetrics.chestNumbersFound}</Text>
                <Text style={styles.metricLabel}>{t('Chest numbers')}</Text>
              </View>
              <View style={styles.metricCard} testID="upload-progress-ai">
                <Text style={styles.metricValue} testID="upload-progress-ai-value">{aggregatedMetrics.aiComplete}/{processing.total || 0}</Text>
                <Text style={styles.metricLabel}>{t('AI complete')}</Text>
              </View>
              <View style={styles.metricCard} testID="upload-progress-notifications">
                <Text style={styles.metricValue} testID="upload-progress-notifications-value">{aggregatedMetrics.notificationsSent}/{aggregatedMetrics.subscribersTotal}</Text>
                <Text style={styles.metricLabel}>{t('Subscribers notified')}</Text>
              </View>
            </View>

            <View style={styles.list}>
              {items.slice(0, 6).map((it, idx) => {
                const st = it.media_id ? statusById[String(it.media_id)] : null;
                const thumb = st?.assets?.thumbnail_url ?? st?.assets?.preview_url ?? null;
                const label = st
                  ? formatUploadStageLabel(st.stage)
                  : it.status === 'stored'
                    ? t('Stored')
                    : it.status === 'failed'
                      ? t('Failed')
                      : it.status === 'uploading'
                        ? t('Uploading')
                        : t('Queued');
                return (
                  <View key={`${it.uri}-${idx}`} style={styles.row}>
                    {thumb ? (
                      <FastImage source={{uri: String(thumb)}} style={{width: 42, height: 42, borderRadius: 10, marginRight: 10}} />
                    ) : (
                      <View style={{width: 42, height: 42, borderRadius: 10, marginRight: 10, backgroundColor: colors.btnBackgroundColor}} />
                    )}
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {formatUploadDisplayName({
                          title: it.title,
                          fileName: it.fileName,
                          type: it.type,
                          fallbackIndex: idx + 1,
                        })}
                      </Text>
                      <Text style={styles.rowMeta} numberOfLines={1}>
                        {[
                          it.category || '',
                          st?.metrics?.face_count ? `${st.metrics.face_count} ${t('faces')}` : '',
                          st?.metrics?.chest_number_count ? `${st.metrics.chest_number_count} ${t('bibs')}` : '',
                        ].filter(Boolean).join(' • ')}
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
                onPress={() => (phase === 'done' ? goToUploadActivity() : phase === 'blocked' || phase === 'failed' ? uploadAll() : pollStatus())}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaPrimaryText}>
                  {phase === 'done' ? t('OK') : phase === 'blocked' || phase === 'failed' ? t('Retry') : t('Refresh')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default UploadProgressScreen;
