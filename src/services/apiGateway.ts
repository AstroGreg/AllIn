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

export interface ProfileSummary {
  ok: boolean;
  profile_id: string;
  profile: {
    display_name?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    avatar_media_id?: string | null;
    avatar_media?: any;
  };
  posts_count?: number;
  followers_count?: number;
  is_following?: boolean;
}

export async function getProfileSummaryById(
  accessToken: string,
  profileId: string,
): Promise<ProfileSummary> {
  const safeId = String(profileId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing profile_id'});
  }
  return apiRequest<ProfileSummary>(`/profiles/${encodeURIComponent(safeId)}/summary`, {
    method: 'GET',
    accessToken,
  });
}

export async function followProfile(accessToken: string, profileId: string): Promise<{ok: boolean}> {
  const safeId = String(profileId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing profile_id'});
  }
  return apiRequest<{ok: boolean}>(`/profiles/${encodeURIComponent(safeId)}/follow`, {
    method: 'POST',
    accessToken,
  });
}

export async function unfollowProfile(accessToken: string, profileId: string): Promise<{ok: boolean}> {
  const safeId = String(profileId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing profile_id'});
  }
  return apiRequest<{ok: boolean}>(`/profiles/${encodeURIComponent(safeId)}/follow`, {
    method: 'DELETE',
    accessToken,
  });
}

export interface ProfileSearchResult {
  profile_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

export interface ProfileSearchResponse {
  ok: boolean;
  count: number;
  profiles: ProfileSearchResult[];
}

export async function searchProfiles(
  accessToken: string,
  params: {q?: string; limit?: number; offset?: number},
): Promise<ProfileSearchResponse> {
  const qs = toQueryString({
    q: params.q ?? undefined,
    limit: params.limit ?? undefined,
    offset: params.offset ?? undefined,
  });
  return apiRequest<ProfileSearchResponse>(`/profiles/search${qs}`, {method: 'GET', accessToken});
}

export interface GroupSummary {
  group_id: string;
  name: string;
  description?: string | null;
  avatar_media_id?: string | null;
  owner_profile_id?: string;
  owner_name?: string | null;
  owner_avatar_url?: string | null;
  my_role?: string | null;
  member_count?: number;
}

export interface GroupResponse {
  ok: boolean;
  group: GroupSummary;
}

export interface GroupsResponse {
  ok: boolean;
  count: number;
  groups: GroupSummary[];
}

export interface GroupMember {
  profile_id: string;
  role?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  is_following?: boolean;
}

export interface GroupMembersResponse {
  ok: boolean;
  count: number;
  members: GroupMember[];
}

export async function createGroup(
  accessToken: string,
  payload: {name: string; description?: string | null; avatar_media_id?: string | null},
): Promise<{ok: boolean; group: GroupSummary}> {
  return apiRequest<{ok: boolean; group: GroupSummary}>(`/groups`, {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

export async function getMyGroups(accessToken: string): Promise<GroupsResponse> {
  return apiRequest<GroupsResponse>(`/groups/mine`, {
    method: 'GET',
    accessToken,
  });
}

export async function searchGroups(
  accessToken: string,
  params: {q?: string; limit?: number; offset?: number},
): Promise<GroupsResponse> {
  const qs = toQueryString({
    q: params.q ?? undefined,
    limit: params.limit ?? undefined,
    offset: params.offset ?? undefined,
  });
  return apiRequest<GroupsResponse>(`/groups/search${qs}`, {
    method: 'GET',
    accessToken,
  });
}

export async function getGroup(accessToken: string, groupId: string): Promise<GroupResponse> {
  const safeId = String(groupId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  return apiRequest<GroupResponse>(`/groups/${encodeURIComponent(safeId)}`, {
    method: 'GET',
    accessToken,
  });
}

export async function getGroupMembers(
  accessToken: string,
  groupId: string,
  role?: string,
): Promise<GroupMembersResponse> {
  const safeId = String(groupId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  const qs = toQueryString({role: role ?? undefined});
  return apiRequest<GroupMembersResponse>(`/groups/${encodeURIComponent(safeId)}/members${qs}`, {
    method: 'GET',
    accessToken,
  });
}

export async function addGroupMember(
  accessToken: string,
  groupId: string,
  payload: {profile_id: string; role?: string},
): Promise<{ok: boolean}> {
  const safeId = String(groupId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  return apiRequest<{ok: boolean}>(`/groups/${encodeURIComponent(safeId)}/members`, {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

export async function removeGroupMember(
  accessToken: string,
  groupId: string,
  profileId: string,
): Promise<{ok: boolean}> {
  const safeGroup = String(groupId || '').trim();
  const safeProfile = String(profileId || '').trim();
  if (!safeGroup || !safeProfile) {
    throw new ApiError({status: 400, message: 'Missing ids'});
  }
  return apiRequest<{ok: boolean}>(`/groups/${encodeURIComponent(safeGroup)}/members/${encodeURIComponent(safeProfile)}`, {
    method: 'DELETE',
    accessToken,
  });
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

export interface HubAppearanceSummary {
  event_id: string;
  event_name?: string | null;
  event_location?: string | null;
  event_date?: string | null;
  photos_count?: number;
  videos_count?: number;
  match_types?: string[];
  thumbnail_url?: string | null;
}

export interface HubAppearancesResponse {
  ok: boolean;
  count: number;
  appearances: HubAppearanceSummary[];
}

export async function getHubAppearances(accessToken: string): Promise<HubAppearancesResponse> {
  return apiRequest<HubAppearancesResponse>('/hub/appearances', {method: 'GET', accessToken});
}

export interface HubAppearanceMediaResponse {
  ok: boolean;
  count: number;
  results: MediaViewAllItem[];
}

export async function getHubAppearanceMedia(
  accessToken: string,
  eventId: string,
): Promise<HubAppearanceMediaResponse> {
  const safeId = String(eventId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing event_id'});
  }
  return apiRequest<HubAppearanceMediaResponse>(`/hub/appearances/${encodeURIComponent(safeId)}/media`, {
    method: 'GET',
    accessToken,
  });
}

export interface HubUploadItem extends MediaViewAllItem {
  labels_yes?: number;
  labels_no?: number;
  labels_total?: number;
  event_name?: string | null;
  event_location?: string | null;
  event_date?: string | null;
}

export interface HubUploadsResponse {
  ok: boolean;
  count: number;
  results: HubUploadItem[];
}

export async function getHubUploads(accessToken: string): Promise<HubUploadsResponse> {
  return apiRequest<HubUploadsResponse>('/hub/uploads', {method: 'GET', accessToken});
}

export interface EventSearchResponse {
  ok: boolean;
  count: number;
  events: SubscribedEvent[];
}

export interface EventCompetition {
  id: string;
  event_id: string;
  competition_name?: string | null;
  competition_name_normalized?: string | null;
  competition_type?: string | null;
}

export interface EventCompetitionsResponse {
  ok: boolean;
  count: number;
  competitions: EventCompetition[];
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

export async function getEventCompetitions(
  accessToken: string,
  eventId: string,
): Promise<EventCompetitionsResponse> {
  const safeId = String(eventId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing event_id'});
  }
  return apiRequest<EventCompetitionsResponse>(`/events/${encodeURIComponent(safeId)}/competitions`, {
    method: 'GET',
    accessToken,
  });
}

export async function grantFaceRecognitionConsent(accessToken: string): Promise<{ok: boolean; message?: string}> {
  return apiRequest<{ok: boolean; message?: string}>('/consents/face_recognition/grant', {
    method: 'POST',
    accessToken,
    body: {},
  });
}

export interface FaceSearchResult {
    match_time_seconds?: number | null;
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
  return apiRequest<FaceSearchResponse>(`/ai/faces/search${qs}`, {method: 'GET', accessToken});
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
  const res = await apiRequest<any>(`/ai/search/object${qs}`, {method: 'GET', accessToken});
  if (Array.isArray(res)) {
    return res as ObjectSearchResult[];
  }
  if (Array.isArray(res?.results)) {
    return res.results as ObjectSearchResult[];
  }
  return [];
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
  likes_count?: number;
  views_count?: number;
  liked_by_me?: boolean;
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
    likes_count?: number;
    views_count?: number;
    liked_by_me?: boolean;
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

  return apiRequest('/ai/faces/enroll', {
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

  return apiRequest('/ai/faces/verify-angle', {
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
  return apiRequest<FaceLivenessStartResponse>(`/ai/faces/liveness/start${qs}`, {
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

  return apiRequest<FaceLivenessStepResponse>('/ai/faces/liveness/step', {
    method: 'POST',
    accessToken,
    body: form,
  });
}

export interface AiFeedbackLabelResponse {
  ok: boolean;
  label: any;
}

export interface AiFeedbackLabel {
  id?: string;
  profile_id?: string;
  media_id: string;
  event_id?: string | null;
  label: boolean;
  source?: string | null;
  meta?: any;
  created_at?: string;
  updated_at?: string;
  thumbnail_url?: string | null;
  preview_url?: string | null;
  original_url?: string | null;
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

export async function getAiFeedbackLabel(
  accessToken: string,
  params: {media_id: string; event_id?: string | null},
): Promise<AiFeedbackLabel | null> {
  const media_id = String(params.media_id || '').trim();
  if (!media_id) {
    throw new ApiError({status: 400, message: 'Missing media_id'});
  }
  const qs = toQueryString({
    media_id,
    event_id: params.event_id ?? undefined,
    limit: 1,
  });
  const res = await apiRequest<any>(`/ai/feedback/labels${qs}`, {method: 'GET', accessToken});
  const list = Array.isArray(res?.results) ? res.results : [];
  return list.length > 0 ? (list[0] as AiFeedbackLabel) : null;
}

export async function subscribeToEvent(accessToken: string, eventId: string): Promise<{success: boolean; event_id: string; profile_id: string}> {
  const safeId = String(eventId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing event_id'});
  }
  return apiRequest(`/events/${encodeURIComponent(safeId)}/subscribe`, {method: 'POST', accessToken, body: {}});
}

export async function unsubscribeToEvent(accessToken: string, eventId: string): Promise<{success: boolean; event_id: string; profile_id: string}> {
  const safeId = String(eventId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing event_id'});
  }
  return apiRequest(`/events/${encodeURIComponent(safeId)}/subscribe`, {method: 'DELETE', accessToken});
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
  likes_count?: number;
  views_count?: number;
  liked_by_me?: boolean;

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

export interface MediaProfitItem extends MediaViewAllItem {
  downloads_count: number;
  views_count: number;
  likes_count: number;
  price_cents: number;
  price_currency: string;
  profit_cents: number;
}

export interface DownloadsProfitResponse {
  ok: boolean;
  profile_id: string;
  count: number;
  items: MediaProfitItem[];
}

export interface UploadedCompetition {
  event_id: string;
  event_name?: string | null;
  event_location?: string | null;
  event_date?: string | null;
  event_type?: string | null;
  uploads_count: number;
  cover_thumbnail_url?: string | null;
}

export interface UploadedCompetitionsResponse {
  ok: boolean;
  profile_id: string;
  count: number;
  competitions: UploadedCompetition[];
}

export interface CompetitionMediaResponse {
  ok: boolean;
  profile_id: string;
  event_id: string;
  count: number;
  items: MediaViewAllItem[];
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

export async function getDownloadsProfit(accessToken: string, params?: {limit?: number}): Promise<DownloadsProfitResponse> {
  const qs = toQueryString({limit: params?.limit});
  return apiRequest<DownloadsProfitResponse>(`/downloads/profit${qs}`, {method: 'GET', accessToken});
}

export async function getUploadedCompetitions(
  accessToken: string,
  params?: {limit?: number; offset?: number},
): Promise<UploadedCompetitionsResponse> {
  const qs = toQueryString({limit: params?.limit, offset: params?.offset});
  return apiRequest<UploadedCompetitionsResponse>(`/downloads/competitions${qs}`, {method: 'GET', accessToken});
}

export async function getCompetitionMedia(
  accessToken: string,
  eventId: string,
  params?: {limit?: number},
): Promise<CompetitionMediaResponse> {
  const safeId = String(eventId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing event_id'});
  }
  const qs = toQueryString({limit: params?.limit});
  return apiRequest<CompetitionMediaResponse>(
    `/downloads/competitions/${encodeURIComponent(safeId)}/media${qs}`,
    {method: 'GET', accessToken},
  );
}

export interface DownloadsSummaryResponse {
  ok: boolean;
  profile_id: string;
  total_downloads: number;
  total_views: number;
  total_profit_cents?: number;
}

export async function getDownloadsSummary(accessToken: string): Promise<DownloadsSummaryResponse> {
  return apiRequest<DownloadsSummaryResponse>('/downloads/summary', {method: 'GET', accessToken});
}

// -----------------------------
// Profile Content (Timeline + Collections)
// -----------------------------

export interface ProfileTimelineMedia extends MediaViewAllItem {
  sort_order?: number;
}

export interface ProfileTimelineLinkedPost {
  id: string;
  title: string;
  created_at?: string | null;
}

export interface ProfileTimelineLinkedEvent {
  event_id: string;
  event_name?: string | null;
  event_location?: string | null;
  event_date?: string | null;
}

export interface ProfileTimelineEntry {
  id?: string;
  sort_order?: number;
  year: number;
  event_date?: string | null;
  title: string;
  description?: string | null;
  highlight?: string | null;
  cover_media_id?: string | null;
  cover_thumbnail_url?: string | null;
  media?: ProfileTimelineMedia[];
  media_ids?: string[];
  linked_post_ids?: string[];
  linked_event_ids?: string[];
  linked_posts?: ProfileTimelineLinkedPost[];
  linked_events?: ProfileTimelineLinkedEvent[];
  created_at?: string | null;
  updated_at?: string | null;
}

export async function getProfileTimeline(accessToken: string, profileId: string): Promise<{ok: boolean; profile_id: string; items: ProfileTimelineEntry[]}> {
  const safe = String(profileId || '').trim() || 'me';
  return apiRequest(`/profiles/${encodeURIComponent(safe)}/timeline`, {method: 'GET', accessToken});
}

export async function setMyProfileTimeline(accessToken: string, items: ProfileTimelineEntry[]): Promise<{ok: boolean; profile_id: string; count: number}> {
  return apiRequest('/profiles/me/timeline', {method: 'PUT', accessToken, body: {items}});
}

export interface ProfileCollection {
  id: string;
  name: string;
  description?: string | null;
  cover_media_id?: string | null;
  cover_thumbnail_url?: string | null;
  collection_type?: string | null;
  item_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export async function getProfileCollections(accessToken: string, profileId: string, params?: {limit?: number}): Promise<{ok: boolean; profile_id: string; collections: ProfileCollection[]}> {
  const safe = String(profileId || '').trim() || 'me';
  const qs = toQueryString({limit: params?.limit});
  return apiRequest(`/profiles/${encodeURIComponent(safe)}/collections${qs}`, {method: 'GET', accessToken});
}

export interface ProfileCollectionItem extends MediaViewAllItem {
  added_at?: string | null;
  featured_rank?: number | null;
}

export interface ProfileCollectionByTypeResponse {
  ok: boolean;
  profile_id: string;
  collection: ProfileCollection;
  items: ProfileCollectionItem[];
}

export async function getProfileCollectionByType(
  accessToken: string,
  type: 'image' | 'video',
): Promise<ProfileCollectionByTypeResponse> {
  const qs = toQueryString({type});
  return apiRequest<ProfileCollectionByTypeResponse>(`/profiles/me/collections/by-type${qs}`, {method: 'GET', accessToken});
}

export async function addProfileCollectionItems(
  accessToken: string,
  params: {type: 'image' | 'video'; media_ids: string[]},
): Promise<{ok: boolean; added: number; skipped: number}> {
  return apiRequest(`/profiles/me/collections/by-type/items`, {
    method: 'POST',
    accessToken,
    body: {
      type: params.type,
      media_ids: params.media_ids,
    },
  });
}

export async function removeProfileCollectionItems(
  accessToken: string,
  params: {type: 'image' | 'video'; media_ids: string[]},
): Promise<{ok: boolean; removed: number}> {
  return apiRequest(`/profiles/me/collections/by-type/items`, {
    method: 'DELETE',
    accessToken,
    body: {
      type: params.type,
      media_ids: params.media_ids,
    },
  });
}

export async function setProfileCollectionFeatured(
  accessToken: string,
  params: {type: 'image' | 'video'; media_ids: string[]},
): Promise<{ok: boolean; featured_count: number}> {
  return apiRequest(`/profiles/me/collections/by-type/featured`, {
    method: 'PUT',
    accessToken,
    body: {
      type: params.type,
      media_ids: params.media_ids,
    },
  });
}

export interface ProfileSummaryResponse {
  ok: boolean;
  profile_id: string;
  profile: {
    display_name?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    avatar_media_id?: string | null;
    avatar_media?: MediaViewAllItem | null;
  };
  posts_count: number;
  followers_count: number;
}

export async function getProfileSummary(accessToken: string): Promise<ProfileSummaryResponse> {
  return apiRequest<ProfileSummaryResponse>('/profiles/me/summary', {method: 'GET', accessToken});
}

export async function updateProfileSummary(
  accessToken: string,
  params: {display_name?: string | null; bio?: string | null; avatar_url?: string | null; avatar_media_id?: string | null},
): Promise<ProfileSummaryResponse> {
  return apiRequest<ProfileSummaryResponse>('/profiles/me', {
    method: 'PUT',
    accessToken,
    body: {
      display_name: params.display_name ?? undefined,
      bio: params.bio ?? undefined,
      avatar_url: params.avatar_url ?? undefined,
      avatar_media_id: params.avatar_media_id ?? undefined,
    },
  });
}


// -----------------------------
// Upload + Processing Status
// -----------------------------

export interface MediaUploadSingleResult {
  ok: boolean;
  index?: number;
  originalname?: string;
  media_id?: string;
  asset_id?: string;
  storage_key?: string;
  duplicate?: boolean;
  error?: string;
  [k: string]: any;
}

export interface MediaUploadBatchResponse {
  ok: boolean;
  count: number;
  uploaded: number;
  duplicates: number;
  succeeded: number;
  failed: number;
  results: MediaUploadSingleResult[];
  errors?: any[];
}

export async function uploadMediaBatch(
  accessToken: string,
  params: {
    files: Array<{uri: string; type?: string | null; name?: string | null}>;
    event_id?: string | null;
    post_id?: string | null;
    is_anonymous?: boolean;
  },
): Promise<MediaUploadBatchResponse> {
  const form = new FormData();
  for (let i = 0; i < params.files.length; i += 1) {
    const f = params.files[i];
    form.append('files', {
      uri: f.uri,
      name: f.name || `upload-${i + 1}`,
      type: f.type || 'application/octet-stream',
    } as any);
  }
  if (params.event_id) form.append('event_id', String(params.event_id));
  if (params.post_id) form.append('post_id', String(params.post_id));
  if (params.is_anonymous != null) form.append('is_anonymous', params.is_anonymous ? 'true' : 'false');

  return apiRequest<MediaUploadBatchResponse>('/media/upload', {
    method: 'POST',
    accessToken,
    body: form,
  });
}

export async function uploadMediaBatchWatermark(
  accessToken: string,
  params: {
    files: Array<{uri: string; type?: string | null; name?: string | null}>;
    watermark_text: string;
    event_id?: string | null;
    post_id?: string | null;
    is_anonymous?: boolean;
  },
): Promise<MediaUploadBatchResponse> {
  const form = new FormData();
  form.append('watermark_text', String(params.watermark_text || 'AllIN'));
  for (let i = 0; i < params.files.length; i += 1) {
    const f = params.files[i];
    form.append('files', {
      uri: f.uri,
      name: f.name || `upload-${i + 1}`,
      type: f.type || 'application/octet-stream',
    } as any);
  }
  if (params.event_id) form.append('event_id', String(params.event_id));
  if (params.post_id) form.append('post_id', String(params.post_id));
  if (params.is_anonymous != null) form.append('is_anonymous', params.is_anonymous ? 'true' : 'false');

  return apiRequest<MediaUploadBatchResponse>('/media/upload_watermark', {
    method: 'POST',
    accessToken,
    body: form,
  });
}

export interface MediaProcessingStatus {
  media_id: string;
  type: 'image' | 'video';
  created_at?: string | null;
  stage: string;
  progress: number;
  steps: {
    transforms_done: boolean;
    embeddings_done: boolean;
    bib_done: boolean;
    indexed_done: boolean;
  };
  assets?: {
    thumbnail_url?: string | null;
    preview_url?: string | null;
    original_url?: string | null;
    hls_manifest_path?: string | null;
  };
  last_error?: string | null;
}

export async function getMediaStatus(
  accessToken: string,
  media_ids: string[],
): Promise<{ok: boolean; results: MediaProcessingStatus[]}> {
  return apiRequest('/media/status', {
    method: 'POST',
    accessToken,
    body: {media_ids},
  });
}

// -----------------------------
// Likes + Views
// -----------------------------

export async function toggleMediaLike(accessToken: string, media_id: string): Promise<{ok: boolean; media_id: string; liked: boolean; likes_count: number}> {
  return apiRequest(`/media/${encodeURIComponent(media_id)}/like`, {method: 'POST', accessToken, body: {}});
}

export async function recordMediaView(accessToken: string, media_id: string): Promise<{ok: boolean; media_id: string; views_count: number}> {
  return apiRequest(`/media/${encodeURIComponent(media_id)}/view`, {method: 'POST', accessToken, body: {}});
}

export async function togglePostLike(accessToken: string, post_id: string): Promise<{ok: boolean; post_id: string; liked: boolean; likes_count: number}> {
  return apiRequest(`/posts/${encodeURIComponent(post_id)}/like`, {method: 'POST', accessToken, body: {}});
}

export async function recordPostView(accessToken: string, post_id: string): Promise<{ok: boolean; post_id: string; views_count: number}> {
  return apiRequest(`/posts/${encodeURIComponent(post_id)}/view`, {method: 'POST', accessToken, body: {}});
}

export interface PostSummary {
  id: string;
  title: string;
  summary?: string | null;
  description?: string | null;
  created_at?: string | null;
  reading_time_minutes?: number | null;
  likes_count: number;
  views_count: number;
  liked_by_me: boolean;
  author?: {profile_id: string; display_name: string; avatar_url?: string | null};
  cover_media?: {
    media_id: string;
    type: 'image' | 'video';
    thumbnail_url?: string | null;
    preview_url?: string | null;
    original_url?: string | null;
    full_url?: string | null;
    raw_url?: string | null;
  } | null;
}

export async function getPosts(accessToken: string, params?: {author_profile_id?: string | null; limit?: number}): Promise<{ok: boolean; posts: PostSummary[]}> {
  const qs = toQueryString({author_profile_id: params?.author_profile_id ?? undefined, limit: params?.limit});
  return apiRequest(`/posts${qs}`, {method: 'GET', accessToken});
}

export async function getPostById(accessToken: string, post_id: string): Promise<{ok: boolean; post: PostSummary; author?: {profile_id: string; display_name: string; avatar_url?: string | null}; media?: MediaViewAllItem[]}> {
  return apiRequest(`/posts/${encodeURIComponent(post_id)}`, {method: 'GET', accessToken});
}

export async function createPost(
  accessToken: string,
  params: {title: string; description: string; summary?: string | null; created_at?: string | null; event_id?: string | null},
): Promise<{ok: boolean; post: PostSummary}> {
  return apiRequest(`/posts`, {
    method: 'POST',
    accessToken,
    body: {
      title: params.title,
      description: params.description,
      summary: params.summary ?? undefined,
      created_at: params.created_at ?? undefined,
      event_id: params.event_id ?? undefined,
    },
  });
}

export async function updatePost(
  accessToken: string,
  post_id: string,
  params: {title?: string | null; description?: string | null; summary?: string | null; created_at?: string | null},
): Promise<{ok: boolean; post: PostSummary}> {
  return apiRequest(`/posts/${encodeURIComponent(post_id)}`, {
    method: 'PUT',
    accessToken,
    body: {
      title: params.title ?? undefined,
      description: params.description ?? undefined,
      summary: params.summary ?? undefined,
      created_at: params.created_at ?? undefined,
    },
  });
}

export async function deletePost(
  accessToken: string,
  post_id: string,
): Promise<{ok: boolean; post_id: string}> {
  return apiRequest(`/posts/${encodeURIComponent(post_id)}`, {method: 'DELETE', accessToken});
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  event_id?: string | null;
  post_id?: string | null;
  metadata?: Record<string, any>;
  read_at?: string | null;
  created_at?: string | null;
}

export interface NotificationsResponse {
  ok: boolean;
  count: number;
  unread_count: number;
  notifications: AppNotification[];
}

export async function getNotifications(
  accessToken: string,
  params?: {limit?: number; offset?: number; unread_only?: boolean},
): Promise<NotificationsResponse> {
  const qs = toQueryString({
    limit: params?.limit ?? undefined,
    offset: params?.offset ?? undefined,
    unread_only: params?.unread_only ? 'true' : undefined,
  });
  return apiRequest<NotificationsResponse>(`/notifications${qs}`, {
    method: 'GET',
    accessToken,
  });
}

export async function markNotificationRead(
  accessToken: string,
  id: string,
): Promise<{ok: boolean; id: string; read_at?: string | null}> {
  const safeId = String(id || '').trim();
  if (!safeId) throw new ApiError({status: 400, message: 'Missing notification id'});
  return apiRequest(`/notifications/${encodeURIComponent(safeId)}/read`, {
    method: 'POST',
    accessToken,
    body: {},
  });
}

export async function registerDeviceToken(
  accessToken: string,
  payload: {token: string; platform: 'ios' | 'android' | 'web'; enabled?: boolean},
): Promise<{ok: boolean}> {
  const token = String(payload?.token || '').trim();
  if (!token) throw new ApiError({status: 400, message: 'Missing token'});
  return apiRequest('/devices/token', {
    method: 'POST',
    accessToken,
    body: {
      token,
      platform: payload.platform,
      enabled: payload.enabled ?? true,
    },
  });
}
