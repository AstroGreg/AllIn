import { getApiBaseUrl as resolveApiBaseUrl } from '../constants/RuntimeConfig';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiErrorShape {
  status: number;
  message: string;
  body?: any;
}

export class ApiError extends Error implements ApiErrorShape {
  status: number;
  body?: any;

  constructor({status, message, body}: ApiErrorShape) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function toQueryString(params: Record<string, any>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      value.forEach(v => {
        if (v == null) return;
        usp.append(key, String(v));
      });
    } else {
      usp.append(key, String(value));
    }
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

async function parseJsonSafely(res: Response): Promise<any | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return {raw: text};
  }
}

export async function apiRequest<T>(
  path: string,
  {
    method = 'GET',
    accessToken,
    headers,
    body,
  }: {
    method?: HttpMethod;
    accessToken: string;
    headers?: Record<string, string>;
    body?: any;
  },
): Promise<T> {
  const url = `${resolveApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    headers: {
      ...(body instanceof FormData ? {} : {'Content-Type': 'application/json'}),
      Authorization: `Bearer ${accessToken}`,
      ...(headers ?? {}),
    },
    body: body == null ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  const data = await parseJsonSafely(res);

  if (!res.ok) {
    const message =
      (data && (data.error || data.message || data.details)) ||
      `Request failed (${res.status})`;
    throw new ApiError({status: res.status, message: String(message), body: data});
  }

  return data as T;
}

// -----------------------------
// Typed endpoints used by app
// -----------------------------

export interface AuthMeResponse {
  ok: boolean;
  profile_id: string;
  sub: string;
  permissions: string[];
  scopes: string[];
  event_ids: string[];
  remaining_tokens: number;
}

export async function getAuthMe(accessToken: string): Promise<AuthMeResponse> {
  return apiRequest<AuthMeResponse>('/auth/me', {method: 'GET', accessToken});
}

export interface SubscribedEvent {
  event_id: string;
  event_name?: string | null;
  event_title?: string | null;
  event_location?: string | null;
  event_date?: string | null;
}

export interface SubscribedEventsResponse {
  ok: boolean;
  count: number;
  events: SubscribedEvent[];
}

export async function getSubscribedEvents(accessToken: string): Promise<SubscribedEventsResponse> {
  return apiRequest<SubscribedEventsResponse>('/events/subscribed', {method: 'GET', accessToken});
}

export interface EventSearchResponse {
  ok: boolean;
  count: number;
  events: SubscribedEvent[];
}

export async function searchEvents(
  accessToken: string,
  params: {q?: string; limit?: number; offset?: number},
): Promise<EventSearchResponse> {
  const qs = toQueryString({
    q: params.q ?? undefined,
    limit: params.limit ?? undefined,
    offset: params.offset ?? undefined,
  });
  return apiRequest<EventSearchResponse>(`/events/search${qs}`, {method: 'GET', accessToken});
}

export async function grantFaceRecognitionConsent(accessToken: string): Promise<{ok: boolean; message?: string}> {
  return apiRequest<{ok: boolean; message?: string}>('/consents/face_recognition/grant', {
    method: 'POST',
    accessToken,
    body: {},
  });
}

export interface FaceSearchResult {
  media_id: string;
  event_id?: string;
  captured_at?: string;
  thumbnail_url?: string;
  preview_url?: string;
  original_url?: string;
  score?: number;
  [k: string]: any;
}

export interface FaceSearchResponse {
  ok: boolean;
  token_state?: any;
  results: FaceSearchResult[];
}

export async function searchFaceByEnrollment(
  accessToken: string,
  params: {event_ids: string[]; label?: string; limit?: number; top?: number; save?: boolean},
): Promise<FaceSearchResponse> {
  const qs = toQueryString({
    event_ids: params.event_ids,
    label: params.label,
    limit: params.limit,
    top: params.top,
    save: params.save ? 'true' : undefined,
  });
  return apiRequest<FaceSearchResponse>(`/ai/search/face${qs}`, {method: 'GET', accessToken});
}

export interface ObjectSearchResult {
  media_id: string;
  confidence: number;
  query?: string;
  model?: string;
  created_at?: string;
  thumbnail_url?: string | null;
  preview_url?: string | null;
  original_url?: string | null;
  [k: string]: any;
}

export async function searchObject(
  accessToken: string,
  params: {q: string; event_id?: string | null; top?: number},
): Promise<ObjectSearchResult[]> {
  const q = String(params.q || '').trim();
  if (!q) {
    throw new ApiError({status: 400, message: 'Missing query'});
  }
  const qs = toQueryString({
    q,
    event_id: params.event_id ?? undefined,
    top: params.top ?? undefined,
  });
  return apiRequest<ObjectSearchResult[]>(`/ai/search/object${qs}`, {method: 'GET', accessToken});
}

export interface BibSearchResult {
  media_id: string;
  bib_number?: string;
  confidence: number;
  created_at?: string;
  thumbnail_url?: string | null;
  preview_url?: string | null;
  original_url?: string | null;
  full_url?: string | null;
  raw_url?: string | null;
  vp9_url?: string | null;
  av1_url?: string | null;
  hls_manifest_path?: string | null;
  [k: string]: any;
}

export interface BibSearchResponse {
  ok: boolean;
  token_state?: any;
  results: BibSearchResult[];
}

export async function searchMediaByBib(
  accessToken: string,
  params: {event_id: string; bib: string},
): Promise<BibSearchResponse> {
  const event_id = String(params.event_id || '').trim();
  const bib = String(params.bib || '').trim();
  if (!event_id || !bib) {
    throw new ApiError({status: 400, message: 'event_id and bib are required'});
  }
  const qs = toQueryString({event_id, bib});
  return apiRequest<BibSearchResponse>(`/media/search/bib${qs}`, {method: 'GET', accessToken});
}

export interface HomeOverviewMedia {
  media_id: string;
  event_id?: string | null;
  post_id?: string | null;
  type?: string;
  title?: string | null;
  created_at?: string | null;
  captured_at?: string | null;
  thumbnail_url?: string | null;
  preview_url?: string | null;
  original_url?: string | null;
  full_url?: string | null;
  raw_url?: string | null;
  hls_manifest_path?: string | null;
  [k: string]: any;
}

export interface HomeOverviewBlog {
  post: {
    id: string;
    title: string;
    summary?: string | null;
    description?: string | null;
    created_at?: string | null;
    reading_time_minutes?: number | null;
  };
  author: {
    profile_id: string;
    display_name: string;
    avatar_url?: string | null;
  };
  media?: HomeOverviewMedia | null;
}

export interface HomeOverviewResponse {
  ok: boolean;
  profile_id: string;
  overview: {
    video?: HomeOverviewMedia | null;
    photo?: HomeOverviewMedia | null;
    blog?: HomeOverviewBlog | null;
  };
}

export async function getHomeOverview(accessToken: string, userId: string): Promise<HomeOverviewResponse> {
  const safeId = encodeURIComponent(String(userId));
  return apiRequest<HomeOverviewResponse>(`/home/overview/${safeId}`, {method: 'GET', accessToken});
}

export async function enrollFace(
  accessToken: string,
  images: {
    frontal: string | string[];
    left_profile: string | string[];
    right_profile: string | string[];
    upward: string | string[];
    downward: string | string[];
  },
  params?: {label?: string; replace?: boolean},
): Promise<{ok: boolean; label?: string; enrolled?: any}> {
  const form = new FormData();
  if (params?.label) form.append('label', params.label);
  if (params?.replace != null) form.append('replace', params.replace ? 'true' : 'false');

  const parts: Array<[keyof typeof images, string | string[]]> = Object.entries(images) as any;
  for (const [field, value] of parts) {
    const uris = Array.isArray(value) ? value : [value];
    for (let i = 0; i < uris.length; i++) {
      const uri = uris[i];
      if (!uri) continue;
      form.append(field, {
        uri,
        name: `${field}-${i + 1}.jpg`,
        type: 'image/jpeg',
      } as any);
    }
  }

  return apiRequest('/ai/enrol/face', {
    method: 'POST',
    accessToken,
    body: form,
  });
}

export type FaceAngleClass = 'frontal' | 'left_profile' | 'right_profile' | 'upward' | 'downward';

export interface FaceVerifyResponse {
  ok: boolean;
  accepted: boolean;
  expected_angle: FaceAngleClass;
  detected_angle: FaceAngleClass | string | null;
  reason: string;
}

export async function verifyFaceAngle(
  accessToken: string,
  params: {angle: FaceAngleClass; uri: string},
): Promise<FaceVerifyResponse> {
  const form = new FormData();
  form.append('angle', params.angle);
  form.append('file', {
    uri: params.uri,
    name: `${params.angle}.jpg`,
    type: 'image/jpeg',
  } as any);

  return apiRequest('/ai/face/verify', {
    method: 'POST',
    accessToken,
    body: form,
  });
}


export interface FaceLivenessStartResponse {
  ok: boolean;
  challenge_id: string;
  steps: FaceAngleClass[];
  ttl_seconds?: number;
}

export async function startFaceLivenessChallenge(
  accessToken: string,
  params?: {count?: number},
): Promise<FaceLivenessStartResponse> {
  const qs = toQueryString({
    count: params?.count ?? undefined,
  });
  return apiRequest<FaceLivenessStartResponse>(`/ai/face/liveness/start${qs}`, {
    method: 'POST',
    accessToken,
    body: {},
  });
}

export interface FaceLivenessStepResponse {
  ok: boolean;
  accepted: boolean;
  completed?: boolean;
  reason?: string;
  expected_angle?: FaceAngleClass | string;
  detected_angle?: FaceAngleClass | string | null;
  step_index?: number;
  remaining?: number;
  next_expected_angle?: FaceAngleClass | string | null;
  [k: string]: any;
}

export async function submitFaceLivenessStep(
  accessToken: string,
  params: {challenge_id: string; uri: string},
): Promise<FaceLivenessStepResponse> {
  const form = new FormData();
  form.append('challenge_id', params.challenge_id);
  form.append('file', {
    uri: params.uri,
    name: `liveness.jpg`,
    type: 'image/jpeg',
  } as any);

  return apiRequest<FaceLivenessStepResponse>('/ai/face/liveness/step', {
    method: 'POST',
    accessToken,
    body: form,
  });
}

export interface AiFeedbackLabelResponse {
  ok: boolean;
  label: any;
}

export async function postAiFeedbackLabel(
  accessToken: string,
  params: {media_id: string; label: boolean; event_id?: string | null; meta?: any; tags?: string[]},
): Promise<AiFeedbackLabelResponse> {
  return apiRequest<AiFeedbackLabelResponse>('/ai/feedback/label', {
    method: 'POST',
    accessToken,
    body: {
      media_id: params.media_id,
      label: params.label,
      event_id: params.event_id ?? undefined,
      meta: params.meta ?? undefined,
      tags: params.tags ?? undefined,
    },
  });
}

export async function subscribeToEvent(accessToken: string, eventId: string): Promise<{success: boolean; event_id: string; profile_id: string}> {
  const safeId = String(eventId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing event_id'});
  }
  return apiRequest(`/events/${encodeURIComponent(safeId)}/subscribe`, {method: 'POST', accessToken, body: {}});
}

export interface MediaAsset {
  asset_id: string;
  variant: string;
  access_level: string;
  storage_key: string;
  mime_type?: string | null;
  file_size_bytes?: number | null;
  width?: number | null;
  height?: number | null;
  duration_seconds?: number | null;
  url?: string | null;
  url_type?: string | null;
}

export interface MediaViewAllItem {
  media_id: string;
  type: 'image' | 'video';
  uploader_profile_id?: string;
  event_id?: string | null;
  created_at?: string;

  thumbnail_url?: string | null;
  preview_url?: string | null;
  original_url?: string | null;

  full_url?: string | null;
  raw_url?: string | null;
  vp9_url?: string | null;
  av1_url?: string | null;
  hls_manifest_path?: string | null;

  assets?: MediaAsset[];
}

export async function getMediaViewAll(accessToken: string): Promise<MediaViewAllItem[]> {
  return apiRequest<MediaViewAllItem[]>('/media/view_all', {method: 'GET', accessToken});
}

export async function getAllVideos(accessToken: string): Promise<MediaViewAllItem[]> {
  const items = await getMediaViewAll(accessToken);
  return items.filter((item) => String(item.type).toLowerCase() === 'video');
}

export async function getAllPhotos(accessToken: string): Promise<MediaViewAllItem[]> {
  const items = await getMediaViewAll(accessToken);
  return items.filter((item) => String(item.type).toLowerCase() === 'image');
}

export async function getMediaById(accessToken: string, mediaId: string): Promise<MediaViewAllItem> {
  const safeId = String(mediaId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing media_id'});
  }
  return apiRequest<MediaViewAllItem>(`/media/${encodeURIComponent(safeId)}`, {method: 'GET', accessToken});
}

export interface CompetitionMapSummary {
  id: string;
  event_id: string;
  competition_id: string;
  name?: string | null;
  image_url?: string | null;
  mime_type?: string | null;
  file_size_bytes?: number | null;
  checksum_sha256?: string | null;
  created_at?: string | null;
  storage_key?: string | null;
  checkpoints?: CompetitionMapCheckpoint[];
}

export interface CompetitionMapCheckpoint {
  id: string;
  checkpoint_index: number;
  label?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  metadata_json?: any;
  created_at?: string | null;
}

export interface CompetitionMapsResponse {
  ok: boolean;
  count: number;
  maps: CompetitionMapSummary[];
}

export interface CompetitionMapResponse {
  ok: boolean;
  map: CompetitionMapSummary;
  checkpoints: CompetitionMapCheckpoint[];
}

export async function getCompetitionMaps(
  accessToken: string,
  params: {
    event_id?: string;
    competition_id?: string;
    limit?: number;
    offset?: number;
    include_checkpoints?: boolean;
  },
): Promise<CompetitionMapsResponse> {
  const qs = toQueryString({
    event_id: params.event_id ?? undefined,
    competition_id: params.competition_id ?? undefined,
    limit: params.limit ?? undefined,
    offset: params.offset ?? undefined,
    include_checkpoints: params.include_checkpoints ? 'true' : undefined,
  });
  return apiRequest<CompetitionMapsResponse>(`/maps${qs}`, {method: 'GET', accessToken});
}

export async function getCompetitionMapById(
  accessToken: string,
  mapId: string,
): Promise<CompetitionMapResponse> {
  const safeId = String(mapId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing map_id'});
  }
  return apiRequest<CompetitionMapResponse>(`/maps/${encodeURIComponent(safeId)}`, {method: 'GET', accessToken});
}

export interface DownloadRecord {
  download_id: string;
  profile_id: string;
  media_id: string;
  event_id?: string | null;
  download_count: number;
  last_downloaded_at: string;
  created_at: string;
}

export interface DownloadItem {
  download: DownloadRecord;
  media: MediaViewAllItem;
}

export async function recordDownload(
  accessToken: string,
  params: {media_id: string; event_id?: string | null},
): Promise<{ok: boolean; download: DownloadRecord}> {
  return apiRequest<{ok: boolean; download: DownloadRecord}>('/downloads', {
    method: 'POST',
    accessToken,
    body: {
      media_id: params.media_id,
      event_id: params.event_id ?? undefined,
    },
  });
}

export async function getDownloads(accessToken: string, params?: {limit?: number}): Promise<DownloadItem[]> {
  const qs = toQueryString({limit: params?.limit});
  return apiRequest<DownloadItem[]>(`/downloads${qs}`, {method: 'GET', accessToken});
}
