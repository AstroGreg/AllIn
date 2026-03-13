import { getApiBaseUrl as resolveApiBaseUrl } from '../constants/RuntimeConfig';
import { resolveCompetitionFocusId, type SportFocusId } from '../utils/profileSelections';

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

function normalizeCompetitionType(raw: any): SportFocusId | null {
  const value = String(raw ?? '').trim().toLowerCase();
  if (!value) return null;
  return resolveCompetitionFocusId({ type: value });
}

function normalizeOrganizerClub(row: any): string | null {
  if (!row || typeof row !== 'object') return null;
  const candidate = String(
    row?.organizing_club
      ?? row?.organizer_club
      ?? row?.organizer_name
      ?? row?.competition_organizing_club
      ?? row?.competition_organizer_club
      ?? row?.competition_organizer_name
      ?? row?.club_name
      ?? row?.club
      ?? '',
  ).trim();
  return candidate.length > 0 ? candidate : null;
}

function maskBearerToken(token?: string | null): string | null {
  const t = String(token || '').trim();
  if (!t) return null;
  if (t.length <= 20) return t;
  return `${t.slice(0, 12)}...${t.slice(-8)}`;
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
    accessToken?: string;
    headers?: Record<string, string>;
    body?: any;
  },
): Promise<T> {
  const url = `${resolveApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const requestHeaders: Record<string, string> = {
    ...(body instanceof FormData ? {} : {'Content-Type': 'application/json'}),
    ...(headers ?? {}),
  };
  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body == null ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch (e: any) {
    console.error('[apiRequest] Network error', {
      method,
      path,
      url,
      hasAccessToken: Boolean(accessToken),
      error: e?.message ?? String(e),
    });
    throw e;
  }

  const data = await parseJsonSafely(res);

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      console.error('[apiRequest] Auth error', {
        method,
        path,
        url,
        status: res.status,
        statusText: res.statusText,
        hasAccessToken: Boolean(accessToken),
        accessTokenMasked: maskBearerToken(accessToken),
        responseBody: data,
      });
    } else {
      console.error('[apiRequest] HTTP error', {
        method,
        path,
        url,
        status: res.status,
        statusText: res.statusText,
        responseBody: data,
      });
    }
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

export interface UserMe {
  user_id: string | null;
  email?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  nationality?: string | null;
  birthdate?: string | null;
  preferred_language?: string | null;
  theme_preference?: string | null;
  is_guest?: boolean;
  full_name?: string | null;
}

export interface UserMeResponse {
  ok: boolean;
  user: UserMe;
}

export interface AuthBootstrapResponse {
  ok: boolean;
  sub: string;
  profile_id: string;
  user: UserMe;
  profiles_count: number;
  has_profiles: boolean;
  needs_user_onboarding: boolean;
  missing_user_fields: string[];
}

export interface PrivacySummary {
  user_records: number;
  profile_records: number;
  uploaded_media: number;
  posts: number;
  groups_owned: number;
  group_memberships: number;
  follow_edges: number;
  face_templates: number;
  consent_records: number;
  appearances: number;
  timeline_entries: number;
  total_records: number;
  has_external_auth_identity: boolean;
}

export interface PrivacySummaryResponse {
  ok: boolean;
  summary: PrivacySummary;
  warnings?: string[];
}

export interface RightToBeForgottenResponse extends PrivacySummaryResponse {
  deleted: boolean;
  external_identity_deleted: boolean;
}

export interface UpdateUserMeInput {
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  nationality?: string | null;
  birthdate?: string | null;
  preferred_language?: string | null;
  theme_preference?: string | null;
  is_guest?: boolean;
}

export type AccountAvailabilityProvider = 'google' | 'apple' | 'email' | 'unknown';

export interface AccountAvailabilityField {
  value?: string | null;
  normalized?: string | null;
  valid: boolean;
  available: boolean;
  reason?: string | null;
  provider?: AccountAvailabilityProvider | null;
}

export interface AccountAvailabilityResponse {
  ok: boolean;
  username?: AccountAvailabilityField;
  email?: AccountAvailabilityField;
}

export async function getAuthBootstrap(accessToken: string): Promise<AuthBootstrapResponse> {
  return apiRequest<AuthBootstrapResponse>('/auth/bootstrap', {method: 'GET', accessToken});
}

export async function getPrivacySummary(accessToken: string): Promise<PrivacySummaryResponse> {
  return apiRequest<PrivacySummaryResponse>('/auth/privacy-summary', {method: 'GET', accessToken});
}

export async function deleteRightToBeForgotten(
  accessToken: string,
  body: {confirmation: string},
): Promise<RightToBeForgottenResponse> {
  return apiRequest<RightToBeForgottenResponse>('/auth/right-to-be-forgotten', {
    method: 'DELETE',
    accessToken,
    body,
  });
}

export async function checkAccountAvailability(
  accessToken: string,
  params: {username?: string | null; email?: string | null},
): Promise<AccountAvailabilityResponse> {
  const query = toQueryString({
    username: String(params.username ?? '').trim() || undefined,
    email: String(params.email ?? '').trim() || undefined,
  });
  return apiRequest<AccountAvailabilityResponse>(`/auth/availability${query}`, {method: 'GET', accessToken});
}

export async function getUserMe(accessToken: string): Promise<UserMeResponse> {
  return apiRequest<UserMeResponse>('/users/me', {method: 'GET', accessToken});
}

export async function updateUserMe(accessToken: string, body: UpdateUserMeInput): Promise<UserMeResponse> {
  return apiRequest<UserMeResponse>('/users/me', {method: 'PUT', accessToken, body});
}

export interface ProfileSummary {
  ok: boolean;
  profile_id: string;
  profile: {
    display_name?: string | null;
    username?: string | null;
    category?: string | null;
    support_role?: string | null;
    support_organization?: string | null;
    support_base_location?: string | null;
    support_athletes?: string[] | null;
    support_athlete_profile_ids?: string[] | null;
    support_club_codes?: string[] | null;
    support_group_ids?: string[] | null;
    support_focuses?: string[] | null;
    support_clubs?: ClubSummary[] | null;
    support_groups?: ProfileGroupMembership[] | null;
    bio?: string | null;
    website?: string | null;
    selected_events?: string[] | null;
    main_disciplines?: Record<string, string> | null;
    chest_numbers_by_year?: Record<string, number> | null;
    nationality?: string | null;
    track_field_club?: string | null;
    track_field_club_detail?: ClubSummary | null;
    running_club_group?: ProfileGroupMembership | null;
    track_field_main_event?: string | null;
    road_trail_main_event?: string | null;
    document_uploaded?: boolean | null;
    face_verified?: boolean | null;
    face_consent_granted?: boolean | null;
    avatar_url?: string | null;
    avatar_media_id?: string | null;
    avatar_media?: any;
    groups?: ProfileGroupMembership[] | null;
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

export async function followGroup(accessToken: string, groupId: string): Promise<{ok: boolean}> {
  const safeId = String(groupId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  return apiRequest<{ok: boolean}>(`/groups/${encodeURIComponent(safeId)}/follow`, {
    method: 'POST',
    accessToken,
  });
}

export async function unfollowGroup(accessToken: string, groupId: string): Promise<{ok: boolean}> {
  const safeId = String(groupId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  return apiRequest<{ok: boolean}>(`/groups/${encodeURIComponent(safeId)}/follow`, {
    method: 'DELETE',
    accessToken,
  });
}

export interface ProfileSearchResult {
  profile_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  selected_events?: string[] | null;
  main_disciplines?: Record<string, string> | null;
  track_field_club?: string | null;
  track_field_main_event?: string | null;
  road_trail_main_event?: string | null;
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
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  coaches?: string[] | null;
  focuses?: string[] | null;
  competition_focuses?: string[] | null;
  selected_events?: string[] | null;
  avatar_media_id?: string | null;
  owner_profile_id?: string;
  owner_name?: string | null;
  owner_avatar_url?: string | null;
  my_role?: string | null;
  member_count?: number;
  likes_count?: number;
  followers_count?: number;
  is_following?: boolean;
  is_official_club?: boolean;
  official_club_code?: string | null;
}

export interface ProfileGroupMembership {
  group_id: string;
  name?: string | null;
  bio?: string | null;
  location?: string | null;
  role?: string | null;
  avatar_media_id?: string | null;
  is_official_club?: boolean;
  official_club_code?: string | null;
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

export interface ClubSummary {
  club_id: string;
  code?: string | null;
  name?: string | null;
  city?: string | null;
  website?: string | null;
  federation?: string | null;
  source_url?: string | null;
  source_ref?: string | null;
  focuses?: string[] | null;
  is_official?: boolean;
  is_system?: boolean;
}

export interface ClubsResponse {
  ok: boolean;
  count: number;
  clubs: ClubSummary[];
}

export interface GroupMember {
  profile_id: string;
  role?: string | null;
  permission_role?: string | null;
  public_roles?: string[] | null;
  display_name?: string | null;
  avatar_url?: string | null;
  is_following?: boolean;
}

export interface GroupMembersResponse {
  ok: boolean;
  count: number;
  members: GroupMember[];
}

export interface GroupAssignedEvent {
  event_id: string;
  competition_id?: string;
  event_name?: string | null;
  event_location?: string | null;
  event_date?: string | null;
  competition_name?: string | null;
  competition_location?: string | null;
  competition_date?: string | null;
  organizing_club?: string | null;
  assigned_athletes_count?: number;
}

export interface GroupAssignedEventsResponse {
  ok: boolean;
  count: number;
  events: GroupAssignedEvent[];
}

export async function createGroup(
  accessToken: string,
  payload: {
    name: string;
    description?: string | null;
    bio?: string | null;
    location?: string | null;
    city?: string | null;
    base_location?: string | null;
    website?: string | null;
    coaches?: string[] | null;
    focuses?: string[] | null;
    competition_focuses?: string[] | null;
    selected_events?: string[] | null;
    avatar_media_id?: string | null;
  },
): Promise<{ok: boolean; group: GroupSummary}> {
  return apiRequest<{ok: boolean; group: GroupSummary}>(`/groups`, {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

export async function updateGroup(
  accessToken: string,
  groupId: string,
  payload: {
    name?: string | null;
    description?: string | null;
    bio?: string | null;
    location?: string | null;
    city?: string | null;
    base_location?: string | null;
    website?: string | null;
    coaches?: string[] | null;
    focuses?: string[] | null;
    competition_focuses?: string[] | null;
    selected_events?: string[] | null;
    avatar_media_id?: string | null;
  },
): Promise<{ok: boolean; group: GroupSummary}> {
  const safeId = String(groupId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  return apiRequest<{ok: boolean; group: GroupSummary}>(`/groups/${encodeURIComponent(safeId)}`, {
    method: 'PUT',
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

export async function searchClubs(
  accessToken: string,
  params: {q?: string; limit?: number; offset?: number; focuses?: string[]},
): Promise<ClubsResponse> {
  const qs = toQueryString({
    q: params.q ?? undefined,
    focuses: Array.isArray(params.focuses)
      ? Array.from(new Set(params.focuses.map((value) => String(value ?? '').trim()).filter(Boolean))).join(',')
      : undefined,
    limit: params.limit ?? undefined,
    offset: params.offset ?? undefined,
  });
  return apiRequest<ClubsResponse>(`/clubs/search${qs}`, {
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
  payload: {profile_id: string; role?: string; public_roles?: string[]},
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

export interface GroupMemberInvite {
  invite_id: string;
  group_id: string;
  profile_id: string;
  role?: string | null;
  public_roles?: string[] | null;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GroupInviteLink {
  id?: string;
  token: string;
  group_id: string;
  group_name?: string | null;
  group_bio?: string | null;
  group_location?: string | null;
  avatar_media_id?: string | null;
  permission_role: 'member' | 'admin';
  public_roles?: string[] | null;
  max_uses?: number | null;
  use_count?: number | null;
  expires_at?: string | null;
  revoked_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  status?: 'active' | 'revoked' | 'expired' | 'exhausted';
}

export async function inviteGroupMember(
  accessToken: string,
  groupId: string,
  payload: {profile_id: string; role?: string; public_roles?: string[]},
): Promise<{ok: boolean; invite: GroupMemberInvite}> {
  const safeId = String(groupId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  return apiRequest<{ok: boolean; invite: GroupMemberInvite}>(`/groups/${encodeURIComponent(safeId)}/invites`, {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

export async function listGroupInvites(
  accessToken: string,
  groupId: string,
  params?: {status?: string; limit?: number},
): Promise<{ok: boolean; count: number; invites: GroupMemberInvite[]}> {
  const safeId = String(groupId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  const qs = toQueryString({
    status: params?.status ?? undefined,
    limit: params?.limit ?? undefined,
  });
  return apiRequest<{ok: boolean; count: number; invites: GroupMemberInvite[]}>(`/groups/${encodeURIComponent(safeId)}/invites${qs}`, {
    method: 'GET',
    accessToken,
  });
}

export async function respondToGroupInvite(
  accessToken: string,
  inviteId: string,
  payload: {action: 'accept' | 'decline'},
): Promise<{ok: boolean; invite: GroupMemberInvite}> {
  const safeId = String(inviteId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing invite_id'});
  }
  return apiRequest<{ok: boolean; invite: GroupMemberInvite}>(`/groups/invites/${encodeURIComponent(safeId)}/respond`, {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

export async function createGroupInviteLink(
  accessToken: string,
  groupId: string,
  payload?: {
    role?: 'member' | 'admin';
    public_roles?: string[];
    max_uses?: number | null;
    expires_in_days?: number | null;
  },
): Promise<{ok: boolean; invite_link: GroupInviteLink}> {
  const safeId = String(groupId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  return apiRequest<{ok: boolean; invite_link: GroupInviteLink}>(`/groups/${encodeURIComponent(safeId)}/invite-links`, {
    method: 'POST',
    accessToken,
    body: payload ?? {},
  });
}

export async function getGroupInviteLink(
  token: string,
): Promise<{ok: boolean; invite_link: GroupInviteLink}> {
  const safeToken = String(token || '').trim();
  if (!safeToken) {
    throw new ApiError({status: 400, message: 'Missing invite token'});
  }
  return apiRequest<{ok: boolean; invite_link: GroupInviteLink}>(`/groups/invite-links/${encodeURIComponent(safeToken)}`, {
    method: 'GET',
  });
}

export async function redeemGroupInviteLink(
  accessToken: string,
  token: string,
): Promise<{ok: boolean; already_joined?: boolean; group_id: string; token: string; permission_role?: string; public_roles?: string[]}> {
  const safeToken = String(token || '').trim();
  if (!safeToken) {
    throw new ApiError({status: 400, message: 'Missing invite token'});
  }
  return apiRequest<{ok: boolean; already_joined?: boolean; group_id: string; token: string; permission_role?: string; public_roles?: string[]}>(
    `/groups/invite-links/${encodeURIComponent(safeToken)}/redeem`,
    {
      method: 'POST',
      accessToken,
      body: {},
    },
  );
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

export async function updateGroupMemberRole(
  accessToken: string,
  groupId: string,
  profileId: string,
  payload: {role: 'admin' | 'member'},
): Promise<{ok: boolean; member: {group_id: string; profile_id: string; role: string}}> {
  const safeGroup = String(groupId || '').trim();
  const safeProfile = String(profileId || '').trim();
  if (!safeGroup || !safeProfile) {
    throw new ApiError({status: 400, message: 'Missing ids'});
  }
  return apiRequest<{ok: boolean; member: {group_id: string; profile_id: string; role: string}}>(
    `/groups/${encodeURIComponent(safeGroup)}/members/${encodeURIComponent(safeProfile)}/role`,
    {
      method: 'PATCH',
      accessToken,
      body: payload,
    },
  );
}

export async function updateGroupMemberPublicRoles(
  accessToken: string,
  groupId: string,
  profileId: string,
  payload: {public_roles: string[]},
): Promise<{ok: boolean; group_id: string; profile_id: string; public_roles: string[]}> {
  const safeGroup = String(groupId || '').trim();
  const safeProfile = String(profileId || '').trim();
  if (!safeGroup || !safeProfile) {
    throw new ApiError({status: 400, message: 'Missing ids'});
  }
  return apiRequest<{ok: boolean; group_id: string; profile_id: string; public_roles: string[]}>(
    `/groups/${encodeURIComponent(safeGroup)}/members/${encodeURIComponent(safeProfile)}/public-roles`,
    {
      method: 'PUT',
      accessToken,
      body: payload,
    },
  );
}

export async function deleteGroup(
  accessToken: string,
  groupId: string,
): Promise<{ok: boolean}> {
  const safeGroup = String(groupId || '').trim();
  if (!safeGroup) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  return apiRequest<{ok: boolean}>(`/groups/${encodeURIComponent(safeGroup)}`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function getGroupAssignedEvents(
  accessToken: string,
  groupId: string,
): Promise<GroupAssignedEventsResponse> {
  const safeId = String(groupId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  const res = await apiRequest<any>(`/groups/${encodeURIComponent(safeId)}/competitions`, {
    method: 'GET',
    accessToken,
  });
  const competitions = Array.isArray(res?.competitions) ? res.competitions : [];
  const events = competitions.map((row: any) => ({
    event_id: String(row?.competition_id || row?.id || ''),
    competition_id: row?.competition_id ? String(row.competition_id) : undefined,
    event_name: row?.competition_name ?? null,
    event_location: row?.competition_location ?? null,
    event_date: row?.competition_date ?? null,
    competition_name: row?.competition_name ?? null,
    competition_location: row?.competition_location ?? null,
    competition_date: row?.competition_date ?? null,
    organizing_club: normalizeOrganizerClub(row),
    assigned_athletes_count: row?.assigned_athletes_count ?? 0,
  }));
  return {ok: Boolean(res?.ok), count: Number(res?.count ?? events.length), events};
}

export async function assignGroupMembersToEvent(
  accessToken: string,
  groupId: string,
  eventId: string,
  payload: {profile_ids: string[]},
): Promise<{ok: boolean; group_id: string; event_id: string; requested_count: number; inserted_count: number}> {
  const safeGroupId = String(groupId || '').trim();
  const safeEventId = String(eventId || '').trim();
  if (!safeGroupId || !safeEventId) {
    throw new ApiError({status: 400, message: 'Missing group_id or event_id'});
  }
  const res = await apiRequest<any>(
    `/groups/${encodeURIComponent(safeGroupId)}/competitions/${encodeURIComponent(safeEventId)}/assign`,
    {
      method: 'POST',
      accessToken,
      body: payload,
    },
  );
  return {
    ok: Boolean(res?.ok),
    group_id: String(res?.group_id || safeGroupId),
    event_id: String(res?.competition_id || safeEventId),
    requested_count: Number(res?.requested_count ?? 0),
    inserted_count: Number(res?.inserted_count ?? 0),
  };
}

export interface SubscribedEvent {
  event_id: string;
  competition_id?: string;
  event_name?: string | null;
  event_title?: string | null;
  event_location?: string | null;
  event_date?: string | null;
  competition_name?: string | null;
  competition_location?: string | null;
  competition_date?: string | null;
  competition_type?: string | null;
  organizing_club?: string | null;
  thumbnail_url?: string | null;
}

export interface SubscribedEventsResponse {
  ok: boolean;
  count: number;
  events: SubscribedEvent[];
}

export async function getSubscribedEvents(accessToken: string): Promise<SubscribedEventsResponse> {
  const res = await apiRequest<any>('/competitions/subscribed', {method: 'GET', accessToken});
  const competitions = Array.isArray(res?.competitions) ? res.competitions : [];
  const events = competitions.map((row: any) => ({
    event_id: String(row?.competition_id || row?.id || ''),
    competition_id: row?.competition_id ? String(row.competition_id) : undefined,
    event_name: row?.competition_name ?? null,
    event_title: row?.competition_name ?? null,
    event_location: row?.competition_location ?? null,
    event_date: row?.competition_date ?? null,
    competition_name: row?.competition_name ?? null,
    competition_location: row?.competition_location ?? null,
    competition_date: row?.competition_date ?? null,
    competition_type: normalizeCompetitionType(row?.competition_type),
    organizing_club: normalizeOrganizerClub(row),
    thumbnail_url: row?.thumbnail_url ?? null,
  }));
  return {ok: Boolean(res?.ok), count: Number(res?.count ?? events.length), events};
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

export type MediaIssueType = 'wrong_competition' | 'wrong_heat' | 'custom';

export interface MediaIssueRequest {
  request_id: string;
  media_id: string;
  event_id?: string | null;
  issue_type: MediaIssueType;
  custom_text?: string | null;
  status: 'pending' | 'resolved' | 'wont_fix';
  resolution_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MediaIssueRequestsResponse {
  ok: boolean;
  count: number;
  requests: MediaIssueRequest[];
}

export async function createMediaIssueRequest(
  accessToken: string,
  params: {
    media_id: string;
    issue_type: MediaIssueType;
    event_id?: string | null;
    custom_text?: string | null;
  },
): Promise<{ok: boolean; request: MediaIssueRequest}> {
  const mediaId = String(params.media_id || '').trim();
  if (!mediaId) {
    throw new ApiError({status: 400, message: 'Missing media_id'});
  }
  return apiRequest<{ok: boolean; request: MediaIssueRequest}>(`/media/${encodeURIComponent(mediaId)}/edit-requests`, {
    method: 'POST',
    accessToken,
    body: {
      issue_type: params.issue_type,
      event_id: params.event_id ?? undefined,
      custom_text: params.custom_text ?? undefined,
    },
  });
}

export async function getMyMediaIssueRequests(
  accessToken: string,
  params?: {status?: 'pending' | 'resolved' | 'wont_fix'; limit?: number; offset?: number},
): Promise<MediaIssueRequestsResponse> {
  const qs = toQueryString({
    status: params?.status ?? undefined,
    limit: params?.limit ?? undefined,
    offset: params?.offset ?? undefined,
  });
  return apiRequest<MediaIssueRequestsResponse>(`/hub/edit-requests${qs}`, {method: 'GET', accessToken});
}

export async function getMediaIssueRequests(
  accessToken: string,
  mediaId: string,
  params?: {status?: 'pending' | 'resolved' | 'wont_fix'; limit?: number; offset?: number},
): Promise<MediaIssueRequestsResponse> {
  const safeId = String(mediaId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing media_id'});
  }
  const qs = toQueryString({
    status: params?.status ?? undefined,
    limit: params?.limit ?? undefined,
    offset: params?.offset ?? undefined,
  });
  return apiRequest<MediaIssueRequestsResponse>(`/media/${encodeURIComponent(safeId)}/edit-requests${qs}`, {
    method: 'GET',
    accessToken,
  });
}

export async function updateMediaIssueRequest(
  accessToken: string,
  mediaId: string,
  requestId: string,
  params: {status: 'resolved' | 'wont_fix'; resolution_reason?: string | null},
): Promise<{ok: boolean; request: MediaIssueRequest}> {
  const safeMediaId = String(mediaId || '').trim();
  const safeRequestId = String(requestId || '').trim();
  if (!safeMediaId || !safeRequestId) {
    throw new ApiError({status: 400, message: 'Missing media_id or request_id'});
  }
  return apiRequest<{ok: boolean; request: MediaIssueRequest}>(
    `/media/${encodeURIComponent(safeMediaId)}/edit-requests/${encodeURIComponent(safeRequestId)}`,
    {
      method: 'PUT',
      accessToken,
      body: {
        status: params.status,
        resolution_reason: params.resolution_reason ?? undefined,
      },
    },
  );
}

export async function updateMedia(
  accessToken: string,
  mediaId: string,
  params: {event_id?: string | null},
): Promise<{ok: boolean; media: MediaViewAllItem}> {
  const safeId = String(mediaId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing media_id'});
  }
  return apiRequest<{ok: boolean; media: MediaViewAllItem}>(`/media/${encodeURIComponent(safeId)}`, {
    method: 'PUT',
    accessToken,
    body: {
      event_id: params.event_id ?? undefined,
    },
  });
}

export async function deleteMedia(
  accessToken: string,
  mediaId: string,
): Promise<{ok: boolean}> {
  const safeId = String(mediaId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing media_id'});
  }
  return apiRequest<{ok: boolean}>(`/media/${encodeURIComponent(safeId)}`, {
    method: 'DELETE',
    accessToken,
  });
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
  competition_focus?: string | null;
  discipline_key?: string | null;
  discipline_group?: string | null;
  sort_order?: number | null;
  media_count?: number | null;
  thumbnail_url?: string | null;
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
  const res = await apiRequest<any>(`/competitions/search${qs}`, {method: 'GET', accessToken});
  const competitions = Array.isArray(res?.competitions) ? res.competitions : [];
  const events = competitions.map((row: any) => ({
    event_id: String(row?.competition_id || row?.id || ''),
    competition_id: row?.competition_id ? String(row.competition_id) : undefined,
    event_name: row?.competition_name ?? null,
    event_title: row?.competition_name ?? null,
    event_location: row?.competition_location ?? null,
    event_date: row?.competition_date ?? null,
    competition_name: row?.competition_name ?? null,
    competition_location: row?.competition_location ?? null,
    competition_date: row?.competition_date ?? null,
    competition_type: normalizeCompetitionType(row?.competition_type),
    organizing_club: normalizeOrganizerClub(row),
    thumbnail_url: row?.thumbnail_url ?? null,
  }));
  return {ok: Boolean(res?.ok), count: Number(res?.count ?? events.length), events};
}

export async function getEventCompetitions(
  accessToken: string,
  eventId: string,
  options?: {onlyWithMedia?: boolean},
): Promise<EventCompetitionsResponse> {
  const safeId = String(eventId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing event_id'});
  }
  const query = toQueryString({
    only_with_media: options?.onlyWithMedia ? 'true' : undefined,
  });
  const res = await apiRequest<any>(`/competitions/${encodeURIComponent(safeId)}/disciplines${query}`, {
    method: 'GET',
    accessToken,
  });
  const disciplines = Array.isArray(res?.disciplines) ? res.disciplines : [];
  const competitions = disciplines.map((row: any) => ({
    id: String(row?.id || ''),
    event_id: String(row?.competition_id || safeId),
    competition_name: row?.discipline_name ?? null,
    competition_name_normalized: row?.discipline_name_normalized ?? null,
    competition_type: row?.discipline_type ?? null,
    competition_focus: row?.competition_focus ?? null,
    discipline_key: row?.discipline_key ?? null,
    discipline_group: row?.discipline_group ?? null,
    sort_order: row?.sort_order == null ? null : Number(row.sort_order),
    media_count: row?.media_count == null ? null : Number(row.media_count),
    thumbnail_url: row?.thumbnail_url ?? null,
  }));
  return {ok: Boolean(res?.ok), count: Number(res?.count ?? competitions.length), competitions};
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
  params: {
    q: string;
    event_id?: string | null;
    competition_id?: string | null;
    discipline_id?: string | null;
    checkpoint_id?: string | null;
    top?: number;
  },
): Promise<ObjectSearchResult[]> {
  const q = String(params.q || '').trim();
  if (!q) {
    throw new ApiError({status: 400, message: 'Missing query'});
  }
  const competitionId = String(params.competition_id ?? params.event_id ?? '').trim();
  const qs = toQueryString({
    q,
    competition_id: competitionId || undefined,
    discipline_id: params.discipline_id ?? undefined,
    checkpoint_id: params.checkpoint_id ?? undefined,
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

export async function searchCompetitionAi(
  accessToken: string,
  competitionId: string,
  params: {q: string; discipline_id?: string | null; checkpoint_id?: string | null; top?: number},
): Promise<ObjectSearchResult[]> {
  const safeId = String(competitionId || '').trim();
  const q = String(params.q || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing competition_id'});
  }
  if (!q) {
    throw new ApiError({status: 400, message: 'Missing query'});
  }
  const qs = toQueryString({
    q,
    discipline_id: params.discipline_id ?? undefined,
    checkpoint_id: params.checkpoint_id ?? undefined,
    top: params.top ?? undefined,
  });
  const res = await apiRequest<any>(`/competitions/${encodeURIComponent(safeId)}/ai/search${qs}`, {method: 'GET', accessToken});
  if (Array.isArray(res)) return res as ObjectSearchResult[];
  if (Array.isArray(res?.results)) return res.results as ObjectSearchResult[];
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
  uploader_profile_id?: string | null;
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
    feed_posts?: HomeOverviewBlog[];
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

export async function subscribeToEvent(
  accessToken: string,
  eventId: string,
  payload?: {
    discipline_ids?: string[];
    category_labels?: string[];
    chest_number?: string | null;
    face_recognition_enabled?: boolean;
  },
): Promise<{
  success: boolean;
  event_id: string;
  profile_id: string;
  discipline_ids: string[];
  category_labels: string[];
  chest_number: string | null;
  face_recognition_enabled: boolean;
}> {
  const safeId = String(eventId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing event_id'});
  }
  const res = await apiRequest<any>(`/competitions/${encodeURIComponent(safeId)}/subscribe`, {
    method: 'POST',
    accessToken,
    body: {
      discipline_ids: Array.isArray(payload?.discipline_ids) ? payload?.discipline_ids : [],
      category_labels: Array.isArray(payload?.category_labels) ? payload?.category_labels : [],
      chest_number: payload?.chest_number ?? null,
      face_recognition_enabled: Boolean(payload?.face_recognition_enabled),
    },
  });
  return {
    success: Boolean(res?.success),
    event_id: String(res?.competition_id || safeId),
    profile_id: String(res?.profile_id || ''),
    discipline_ids: Array.isArray(res?.discipline_ids) ? res.discipline_ids.map((value: unknown) => String(value)) : [],
    category_labels: Array.isArray(res?.category_labels) ? res.category_labels.map((value: unknown) => String(value)) : [],
    chest_number: res?.chest_number == null ? null : String(res.chest_number),
    face_recognition_enabled: Boolean(res?.face_recognition_enabled ?? false),
  };
}

export async function unsubscribeToEvent(accessToken: string, eventId: string): Promise<{success: boolean; event_id: string; profile_id: string}> {
  const safeId = String(eventId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing event_id'});
  }
  const res = await apiRequest<any>(`/competitions/${encodeURIComponent(safeId)}/subscribe`, {method: 'DELETE', accessToken});
  return {
    success: Boolean(res?.success),
    event_id: String(res?.competition_id || safeId),
    profile_id: String(res?.profile_id || ''),
  };
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
  competition_id?: string | null;
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

export async function getCompetitionPublicMedia(
  accessToken: string,
  competitionId: string,
  params?: {
    type?: 'image' | 'video';
    discipline_id?: string;
    checkpoint_id?: string;
    limit?: number;
    offset?: number;
  },
): Promise<MediaViewAllItem[]> {
  const safeId = String(competitionId || '').trim();
  if (!safeId) {
    throw new ApiError({status: 400, message: 'Missing competition_id'});
  }
  const qs = toQueryString({
    type: params?.type,
    discipline_id: params?.discipline_id,
    checkpoint_id: params?.checkpoint_id,
    limit: params?.limit,
    offset: params?.offset,
  });
  const res = await apiRequest<any>(`/competitions/${encodeURIComponent(safeId)}/media${qs}`, {
    method: 'GET',
    accessToken,
  });
  if (Array.isArray(res)) return res as MediaViewAllItem[];
  if (Array.isArray(res?.items)) return res.items as MediaViewAllItem[];
  return [];
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

export type DownloadsDashboardPeriodKey = 'week' | 'month' | 'all';

export interface DownloadsDashboardMetrics {
  downloads: number;
  views: number;
  revenue_cents: number;
}

export interface DownloadsDashboardTrend {
  direction: 'up' | 'down' | 'flat';
  delta_downloads: number;
  delta_views: number;
  delta_revenue_cents: number;
}

export interface DownloadsDashboardCompetition {
  event_id: string;
  event_name?: string | null;
  event_location?: string | null;
  event_date?: string | null;
  event_type?: string | null;
  uploads_count: number;
  cover_thumbnail_url?: string | null;
  metrics: Record<DownloadsDashboardPeriodKey, DownloadsDashboardMetrics>;
  trends: Record<DownloadsDashboardPeriodKey, DownloadsDashboardTrend>;
}

export interface DownloadsDashboardResponse {
  ok: boolean;
  profile_id: string;
  periods: Record<DownloadsDashboardPeriodKey, DownloadsDashboardMetrics>;
  competitions: DownloadsDashboardCompetition[];
}

export async function getDownloadsDashboard(accessToken: string): Promise<DownloadsDashboardResponse> {
  return apiRequest<DownloadsDashboardResponse>('/downloads/dashboard', {method: 'GET', accessToken});
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
  scope_key?: string | null;
  item_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export async function getProfileCollections(accessToken: string, profileId: string, params?: {limit?: number; scope_key?: string | null}): Promise<{ok: boolean; profile_id: string; collections: ProfileCollection[]}> {
  const safe = String(profileId || '').trim() || 'me';
  const qs = toQueryString({limit: params?.limit, scope_key: String(params?.scope_key ?? '').trim() || undefined});
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
  params?: {scope_key?: string | null},
): Promise<ProfileCollectionByTypeResponse> {
  const qs = toQueryString({type, scope_key: String(params?.scope_key ?? '').trim() || undefined});
  return apiRequest<ProfileCollectionByTypeResponse>(`/profiles/me/collections/by-type${qs}`, {method: 'GET', accessToken});
}

export async function addProfileCollectionItems(
  accessToken: string,
  params: {type: 'image' | 'video'; media_ids: string[]; scope_key?: string | null},
): Promise<{ok: boolean; added: number; skipped: number}> {
  return apiRequest(`/profiles/me/collections/by-type/items`, {
    method: 'POST',
    accessToken,
    body: {
      type: params.type,
      scope_key: String(params.scope_key ?? '').trim() || undefined,
      media_ids: params.media_ids,
    },
  });
}

export async function removeProfileCollectionItems(
  accessToken: string,
  params: {type: 'image' | 'video'; media_ids: string[]; scope_key?: string | null},
): Promise<{ok: boolean; removed: number}> {
  return apiRequest(`/profiles/me/collections/by-type/items`, {
    method: 'DELETE',
    accessToken,
    body: {
      type: params.type,
      scope_key: String(params.scope_key ?? '').trim() || undefined,
      media_ids: params.media_ids,
    },
  });
}

export async function setProfileCollectionFeatured(
  accessToken: string,
  params: {type: 'image' | 'video'; media_ids: string[]; scope_key?: string | null},
): Promise<{ok: boolean; featured_count: number}> {
  return apiRequest(`/profiles/me/collections/by-type/featured`, {
    method: 'PUT',
    accessToken,
    body: {
      type: params.type,
      scope_key: String(params.scope_key ?? '').trim() || undefined,
      media_ids: params.media_ids,
    },
  });
}

export async function updateProfileCollectionByType(
  accessToken: string,
  params: {type: 'image' | 'video'; name?: string; description?: string | null; scope_key?: string | null},
): Promise<{ok: boolean; collection: ProfileCollection}> {
  return apiRequest(`/profiles/me/collections/by-type`, {
    method: 'PATCH',
    accessToken,
    body: {
      type: params.type,
      scope_key: String(params.scope_key ?? '').trim() || undefined,
      name: params.name,
      description: params.description,
    },
  });
}

export interface GroupCollection {
  id: string;
  group_id: string;
  name: string;
  description?: string | null;
  cover_media_id?: string | null;
  cover_thumbnail_url?: string | null;
  collection_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GroupCollectionItem extends MediaViewAllItem {
  added_at?: string | null;
  featured_rank?: number | null;
}

export interface GroupCollectionByTypeResponse {
  ok: boolean;
  group_id: string;
  collection: GroupCollection;
  items: GroupCollectionItem[];
}

export async function getGroupCollectionByType(
  accessToken: string,
  groupId: string,
  type: 'image' | 'video',
): Promise<GroupCollectionByTypeResponse> {
  const safeGroup = String(groupId || '').trim();
  if (!safeGroup) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  const qs = toQueryString({type});
  return apiRequest<GroupCollectionByTypeResponse>(`/groups/${encodeURIComponent(safeGroup)}/collections/by-type${qs}`, {
    method: 'GET',
    accessToken,
  });
}

export async function setGroupCollectionFeatured(
  accessToken: string,
  params: {group_id: string; type: 'image' | 'video'; media_ids: string[]},
): Promise<{ok: boolean; featured_count: number}> {
  const safeGroup = String(params.group_id || '').trim();
  if (!safeGroup) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  return apiRequest<{ok: boolean; featured_count: number}>(`/groups/${encodeURIComponent(safeGroup)}/collections/by-type/featured`, {
    method: 'PUT',
    accessToken,
    body: {
      type: params.type,
      media_ids: params.media_ids,
    },
  });
}

export interface GroupCollectionCandidatesResponse {
  ok: boolean;
  group_id: string;
  count: number;
  items: Array<GroupCollectionItem & {in_collection?: boolean}>;
}

export async function getGroupCollectionCandidates(
  accessToken: string,
  groupId: string,
  type: 'image' | 'video',
): Promise<GroupCollectionCandidatesResponse> {
  const safeGroup = String(groupId || '').trim();
  if (!safeGroup) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  const qs = toQueryString({type});
  return apiRequest<GroupCollectionCandidatesResponse>(`/groups/${encodeURIComponent(safeGroup)}/collections/by-type/candidates${qs}`, {
    method: 'GET',
    accessToken,
  });
}

export async function addGroupCollectionItems(
  accessToken: string,
  params: {group_id: string; type: 'image' | 'video'; media_ids: string[]},
): Promise<{ok: boolean; added: number; skipped: number}> {
  const safeGroup = String(params.group_id || '').trim();
  if (!safeGroup) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  return apiRequest<{ok: boolean; added: number; skipped: number}>(`/groups/${encodeURIComponent(safeGroup)}/collections/by-type/items`, {
    method: 'POST',
    accessToken,
    body: {
      type: params.type,
      media_ids: params.media_ids,
    },
  });
}

export async function removeGroupCollectionItems(
  accessToken: string,
  params: {group_id: string; type: 'image' | 'video'; media_ids: string[]},
): Promise<{ok: boolean; removed: number}> {
  const safeGroup = String(params.group_id || '').trim();
  if (!safeGroup) {
    throw new ApiError({status: 400, message: 'Missing group_id'});
  }
  return apiRequest<{ok: boolean; removed: number}>(`/groups/${encodeURIComponent(safeGroup)}/collections/by-type/items`, {
    method: 'DELETE',
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
    username?: string | null;
    category?: string | null;
    support_role?: string | null;
    support_organization?: string | null;
    support_base_location?: string | null;
    support_athletes?: string[] | null;
    support_athlete_profile_ids?: string[] | null;
    support_club_codes?: string[] | null;
    support_group_ids?: string[] | null;
    support_focuses?: string[] | null;
    support_clubs?: ClubSummary[] | null;
    support_groups?: ProfileGroupMembership[] | null;
    bio?: string | null;
    website?: string | null;
    selected_events?: string[] | null;
    main_disciplines?: Record<string, string> | null;
    chest_numbers_by_year?: Record<string, number> | null;
    nationality?: string | null;
    track_field_club?: string | null;
    track_field_club_detail?: ClubSummary | null;
    running_club_group_id?: string | null;
    running_club_group?: ProfileGroupMembership | null;
    track_field_main_event?: string | null;
    road_trail_main_event?: string | null;
    document_uploaded?: boolean | null;
    face_verified?: boolean | null;
    avatar_url?: string | null;
    avatar_media_id?: string | null;
    avatar_media?: MediaViewAllItem | null;
    groups?: ProfileGroupMembership[] | null;
  };
  posts_count: number;
  followers_count: number;
}

export async function getProfileSummary(accessToken: string): Promise<ProfileSummaryResponse> {
  return apiRequest<ProfileSummaryResponse>('/profiles/me/summary', {method: 'GET', accessToken});
}

export async function updateProfileSummary(
  accessToken: string,
  params: {
    display_name?: string | null;
    category?: string | null;
    support_role?: string | null;
    supportRole?: string | null;
    support_organization?: string | null;
    supportOrganization?: string | null;
    support_base_location?: string | null;
    supportBaseLocation?: string | null;
    support_athletes?: string[] | null;
    supportAthletes?: string[] | null;
    support_athlete_profile_ids?: string[] | null;
    supportAthleteProfileIds?: string[] | null;
    support_club_codes?: string[] | null;
    supportClubCodes?: string[] | null;
    support_group_ids?: string[] | null;
    supportGroupIds?: string[] | null;
    support_focuses?: string[] | null;
    supportFocuses?: string[] | null;
    bio?: string | null;
    selected_events?: string[] | null;
    selectedEvents?: string[] | null;
    main_disciplines?: Record<string, string> | null;
    mainDisciplines?: Record<string, string> | null;
    chest_numbers_by_year?: Record<string, number> | null;
    chestNumbersByYear?: Record<string, number> | null;
    track_field_club?: string | null;
    trackFieldClub?: string | null;
    running_club_group_id?: string | null;
    runningClubGroupId?: string | null;
    track_field_main_event?: string | null;
    trackFieldMainEvent?: string | null;
    road_trail_main_event?: string | null;
    roadTrailMainEvent?: string | null;
    document_uploaded?: boolean | null;
    documentUploaded?: boolean | null;
    face_verified?: boolean | null;
    faceVerified?: boolean | null;
    website?: string | null;
    avatar_url?: string | null;
    avatar_media_id?: string | null;
  },
): Promise<ProfileSummaryResponse> {
  const body: any = {
    display_name: params.display_name ?? undefined,
    category: params.category ?? undefined,
    bio: params.bio ?? undefined,
    website: params.website ?? undefined,
    avatar_url: params.avatar_url ?? undefined,
    avatar_media_id: params.avatar_media_id ?? undefined,
  };
  if (Object.prototype.hasOwnProperty.call(params, 'support_role')) {
    body.support_role = params.support_role;
  } else if (Object.prototype.hasOwnProperty.call(params, 'supportRole')) {
    body.support_role = params.supportRole;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'support_organization')) {
    body.support_organization = params.support_organization;
  } else if (Object.prototype.hasOwnProperty.call(params, 'supportOrganization')) {
    body.support_organization = params.supportOrganization;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'support_base_location')) {
    body.support_base_location = params.support_base_location;
  } else if (Object.prototype.hasOwnProperty.call(params, 'supportBaseLocation')) {
    body.support_base_location = params.supportBaseLocation;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'support_athletes')) {
    body.support_athletes = params.support_athletes;
  } else if (Object.prototype.hasOwnProperty.call(params, 'supportAthletes')) {
    body.support_athletes = params.supportAthletes;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'support_athlete_profile_ids')) {
    body.support_athlete_profile_ids = params.support_athlete_profile_ids;
  } else if (Object.prototype.hasOwnProperty.call(params, 'supportAthleteProfileIds')) {
    body.support_athlete_profile_ids = params.supportAthleteProfileIds;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'support_club_codes')) {
    body.support_club_codes = params.support_club_codes;
  } else if (Object.prototype.hasOwnProperty.call(params, 'supportClubCodes')) {
    body.support_club_codes = params.supportClubCodes;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'support_group_ids')) {
    body.support_group_ids = params.support_group_ids;
  } else if (Object.prototype.hasOwnProperty.call(params, 'supportGroupIds')) {
    body.support_group_ids = params.supportGroupIds;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'support_focuses')) {
    body.support_focuses = params.support_focuses;
  } else if (Object.prototype.hasOwnProperty.call(params, 'supportFocuses')) {
    body.support_focuses = params.supportFocuses;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'selected_events')) {
    body.selected_events = params.selected_events;
  } else if (Object.prototype.hasOwnProperty.call(params, 'selectedEvents')) {
    body.selected_events = params.selectedEvents;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'main_disciplines')) {
    body.main_disciplines = params.main_disciplines;
  } else if (Object.prototype.hasOwnProperty.call(params, 'mainDisciplines')) {
    body.main_disciplines = params.mainDisciplines;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'chest_numbers_by_year')) {
    body.chest_numbers_by_year = params.chest_numbers_by_year;
  } else if (Object.prototype.hasOwnProperty.call(params, 'chestNumbersByYear')) {
    body.chest_numbers_by_year = params.chestNumbersByYear;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'track_field_club')) {
    body.track_field_club = params.track_field_club;
  } else if (Object.prototype.hasOwnProperty.call(params, 'trackFieldClub')) {
    body.track_field_club = params.trackFieldClub;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'running_club_group_id')) {
    body.running_club_group_id = params.running_club_group_id;
  } else if (Object.prototype.hasOwnProperty.call(params, 'runningClubGroupId')) {
    body.running_club_group_id = params.runningClubGroupId;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'track_field_main_event')) {
    body.track_field_main_event = params.track_field_main_event;
  } else if (Object.prototype.hasOwnProperty.call(params, 'trackFieldMainEvent')) {
    body.track_field_main_event = params.trackFieldMainEvent;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'road_trail_main_event')) {
    body.road_trail_main_event = params.road_trail_main_event;
  } else if (Object.prototype.hasOwnProperty.call(params, 'roadTrailMainEvent')) {
    body.road_trail_main_event = params.roadTrailMainEvent;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'document_uploaded')) {
    body.document_uploaded = params.document_uploaded;
  } else if (Object.prototype.hasOwnProperty.call(params, 'documentUploaded')) {
    body.document_uploaded = params.documentUploaded;
  }
  if (Object.prototype.hasOwnProperty.call(params, 'face_verified')) {
    body.face_verified = params.face_verified;
  } else if (Object.prototype.hasOwnProperty.call(params, 'faceVerified')) {
    body.face_verified = params.faceVerified;
  }
  return apiRequest<ProfileSummaryResponse>('/profiles/me', {
    method: 'PUT',
    accessToken,
    body,
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
    discipline_id?: string | null;
    competition_map_id?: string | null;
    checkpoint_id?: string | null;
    checkpoint_index?: number | null;
    post_id?: string | null;
    is_anonymous?: boolean;
    price_cents?: number;
    price_currency?: string;
    collection_scope_key?: string | null;
    skip_profile_collection?: boolean;
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
  if (params.discipline_id) form.append('discipline_id', String(params.discipline_id));
  if (params.competition_map_id) form.append('competition_map_id', String(params.competition_map_id));
  if (params.checkpoint_id) form.append('checkpoint_id', String(params.checkpoint_id));
  if (params.checkpoint_index != null) form.append('checkpoint_index', String(params.checkpoint_index));
  if (params.post_id) form.append('post_id', String(params.post_id));
  if (params.is_anonymous != null) form.append('is_anonymous', params.is_anonymous ? 'true' : 'false');
  if (params.price_cents != null) form.append('price_cents', String(Math.max(0, Number(params.price_cents) || 0)));
  if (params.price_currency) form.append('price_currency', String(params.price_currency));
  if (params.collection_scope_key) form.append('collection_scope_key', String(params.collection_scope_key));
  if (params.skip_profile_collection != null) form.append('skip_profile_collection', params.skip_profile_collection ? 'true' : 'false');
  if (params.is_anonymous) {
    form.append('strip_author_data', 'true');
    form.append('anonymous_mode', 'strict');
  }

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
    discipline_id?: string | null;
    competition_map_id?: string | null;
    checkpoint_id?: string | null;
    checkpoint_index?: number | null;
    post_id?: string | null;
    is_anonymous?: boolean;
    price_cents?: number;
    price_currency?: string;
    collection_scope_key?: string | null;
    skip_profile_collection?: boolean;
  },
): Promise<MediaUploadBatchResponse> {
  const form = new FormData();
  form.append('watermark_text', String(params.watermark_text || 'SpotMe'));
  for (let i = 0; i < params.files.length; i += 1) {
    const f = params.files[i];
    form.append('files', {
      uri: f.uri,
      name: f.name || `upload-${i + 1}`,
      type: f.type || 'application/octet-stream',
    } as any);
  }
  if (params.event_id) form.append('event_id', String(params.event_id));
  if (params.discipline_id) form.append('discipline_id', String(params.discipline_id));
  if (params.competition_map_id) form.append('competition_map_id', String(params.competition_map_id));
  if (params.checkpoint_id) form.append('checkpoint_id', String(params.checkpoint_id));
  if (params.checkpoint_index != null) form.append('checkpoint_index', String(params.checkpoint_index));
  if (params.post_id) form.append('post_id', String(params.post_id));
  if (params.is_anonymous != null) form.append('is_anonymous', params.is_anonymous ? 'true' : 'false');
  if (params.price_cents != null) form.append('price_cents', String(Math.max(0, Number(params.price_cents) || 0)));
  if (params.price_currency) form.append('price_currency', String(params.price_currency));
  if (params.collection_scope_key) form.append('collection_scope_key', String(params.collection_scope_key));
  if (params.skip_profile_collection != null) form.append('skip_profile_collection', params.skip_profile_collection ? 'true' : 'false');
  if (params.is_anonymous) {
    form.append('strip_author_data', 'true');
    form.append('anonymous_mode', 'strict');
  }

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
  post_type?: 'blog' | 'photo' | 'video' | null;
  title: string;
  summary?: string | null;
  description?: string | null;
  created_at?: string | null;
  reading_time_minutes?: number | null;
  likes_count: number;
  views_count: number;
  liked_by_me: boolean;
  author?: {profile_id: string; display_name: string; avatar_url?: string | null};
  tagged_profiles?: Array<{profile_id: string; display_name?: string | null}>;
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

export async function getPosts(
  accessToken: string,
  params?: {author_profile_id?: string | null; group_id?: string | null; limit?: number},
): Promise<{ok: boolean; posts: PostSummary[]}> {
  const qs = toQueryString({
    author_profile_id: params?.author_profile_id ?? undefined,
    group_id: params?.group_id ?? undefined,
    limit: params?.limit,
  });
  return apiRequest(`/posts${qs}`, {method: 'GET', accessToken});
}

export async function getPostById(accessToken: string, post_id: string): Promise<{ok: boolean; post: PostSummary; author?: {profile_id: string; display_name: string; avatar_url?: string | null}; media?: MediaViewAllItem[]}> {
  return apiRequest(`/posts/${encodeURIComponent(post_id)}`, {method: 'GET', accessToken});
}

export async function createPost(
  accessToken: string,
  params: {title: string; description: string; summary?: string | null; created_at?: string | null; event_id?: string | null; group_id?: string | null; post_type?: 'blog' | 'photo' | 'video' | null; tagged_profile_ids?: string[]},
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
      group_id: params.group_id ?? undefined,
      post_type: params.post_type ?? undefined,
      tagged_profile_ids: params.tagged_profile_ids ?? undefined,
    },
  });
}

export async function attachMediaToPost(
  accessToken: string,
  post_id: string,
  params: {media_ids: string[]},
): Promise<{ok: boolean; post_id: string; attached: number; skipped: number}> {
  return apiRequest(`/posts/${encodeURIComponent(post_id)}/media`, {
    method: 'POST',
    accessToken,
    body: {
      media_ids: params.media_ids,
    },
  });
}

export async function updatePost(
  accessToken: string,
  post_id: string,
  params: {title?: string | null; description?: string | null; summary?: string | null; created_at?: string | null; post_type?: 'blog' | 'photo' | 'video' | null; tagged_profile_ids?: string[]},
): Promise<{ok: boolean; post: PostSummary}> {
  return apiRequest(`/posts/${encodeURIComponent(post_id)}`, {
    method: 'PUT',
    accessToken,
    body: {
      title: params.title ?? undefined,
      description: params.description ?? undefined,
      summary: params.summary ?? undefined,
      created_at: params.created_at ?? undefined,
      post_type: params.post_type ?? undefined,
      tagged_profile_ids: params.tagged_profile_ids ?? undefined,
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
