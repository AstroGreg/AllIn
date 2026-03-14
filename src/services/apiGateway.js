var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getApiBaseUrl as resolveApiBaseUrl } from '../constants/RuntimeConfig';
import { resolveCompetitionFocusId } from '../utils/profileSelections';
export class ApiError extends Error {
    constructor({ status, message, body }) {
        super(message);
        this.status = status;
        this.body = body;
    }
}
function toQueryString(params) {
    const usp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value == null)
            continue;
        if (Array.isArray(value)) {
            value.forEach(v => {
                if (v == null)
                    return;
                usp.append(key, String(v));
            });
        }
        else {
            usp.append(key, String(value));
        }
    }
    const s = usp.toString();
    return s ? `?${s}` : '';
}
function normalizeCompetitionType(raw) {
    const value = String(raw !== null && raw !== void 0 ? raw : '').trim().toLowerCase();
    if (!value)
        return null;
    return resolveCompetitionFocusId({ type: value });
}
function normalizeOrganizerClub(row) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!row || typeof row !== 'object')
        return null;
    const candidate = String((_h = (_g = (_f = (_e = (_d = (_c = (_b = (_a = row === null || row === void 0 ? void 0 : row.organizing_club) !== null && _a !== void 0 ? _a : row === null || row === void 0 ? void 0 : row.organizer_club) !== null && _b !== void 0 ? _b : row === null || row === void 0 ? void 0 : row.organizer_name) !== null && _c !== void 0 ? _c : row === null || row === void 0 ? void 0 : row.competition_organizing_club) !== null && _d !== void 0 ? _d : row === null || row === void 0 ? void 0 : row.competition_organizer_club) !== null && _e !== void 0 ? _e : row === null || row === void 0 ? void 0 : row.competition_organizer_name) !== null && _f !== void 0 ? _f : row === null || row === void 0 ? void 0 : row.club_name) !== null && _g !== void 0 ? _g : row === null || row === void 0 ? void 0 : row.club) !== null && _h !== void 0 ? _h : '').trim();
    return candidate.length > 0 ? candidate : null;
}
function maskBearerToken(token) {
    const t = String(token || '').trim();
    if (!t)
        return null;
    if (t.length <= 20)
        return t;
    return `${t.slice(0, 12)}...${t.slice(-8)}`;
}
function parseJsonSafely(res) {
    return __awaiter(this, void 0, void 0, function* () {
        const text = yield res.text();
        if (!text)
            return null;
        try {
            return JSON.parse(text);
        }
        catch (_a) {
            return { raw: text };
        }
    });
}
export function apiRequest(path, { method = 'GET', accessToken, headers, body, }) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${resolveApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
        const requestHeaders = Object.assign(Object.assign({}, (body instanceof FormData ? {} : { 'Content-Type': 'application/json' })), (headers !== null && headers !== void 0 ? headers : {}));
        if (accessToken) {
            requestHeaders.Authorization = `Bearer ${accessToken}`;
        }
        let res;
        try {
            res = yield fetch(url, {
                method,
                headers: requestHeaders,
                body: body == null ? undefined : body instanceof FormData ? body : JSON.stringify(body),
            });
        }
        catch (e) {
            console.error('[apiRequest] Network error', {
                method,
                path,
                url,
                hasAccessToken: Boolean(accessToken),
                error: (_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : String(e),
            });
            throw e;
        }
        const data = yield parseJsonSafely(res);
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
            }
            else {
                console.error('[apiRequest] HTTP error', {
                    method,
                    path,
                    url,
                    status: res.status,
                    statusText: res.statusText,
                    responseBody: data,
                });
            }
            const message = (data && (data.error || data.message || data.details)) ||
                `Request failed (${res.status})`;
            throw new ApiError({ status: res.status, message: String(message), body: data });
        }
        return data;
    });
}
export function getAuthMe(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/auth/me', { method: 'GET', accessToken });
    });
}
export function getAuthBootstrap(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/auth/bootstrap', { method: 'GET', accessToken });
    });
}
export function getPrivacySummary(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/auth/privacy-summary', { method: 'GET', accessToken });
    });
}
export function deleteRightToBeForgotten(accessToken, body) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/auth/right-to-be-forgotten', {
            method: 'DELETE',
            accessToken,
            body,
        });
    });
}
export function checkAccountAvailability(accessToken, params) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const query = toQueryString({
            username: String((_a = params.username) !== null && _a !== void 0 ? _a : '').trim() || undefined,
            email: String((_b = params.email) !== null && _b !== void 0 ? _b : '').trim() || undefined,
        });
        return apiRequest(`/auth/availability${query}`, { method: 'GET', accessToken });
    });
}
export function getUserMe(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/users/me', { method: 'GET', accessToken });
    });
}
export function updateUserMe(accessToken, body) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/users/me', { method: 'PUT', accessToken, body });
    });
}
export function getProfileSummaryById(accessToken, profileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(profileId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing profile_id' });
        }
        return apiRequest(`/profiles/${encodeURIComponent(safeId)}/summary`, {
            method: 'GET',
            accessToken,
        });
    });
}
export function followProfile(accessToken, profileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(profileId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing profile_id' });
        }
        return apiRequest(`/profiles/${encodeURIComponent(safeId)}/follow`, {
            method: 'POST',
            accessToken,
        });
    });
}
export function unfollowProfile(accessToken, profileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(profileId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing profile_id' });
        }
        return apiRequest(`/profiles/${encodeURIComponent(safeId)}/follow`, {
            method: 'DELETE',
            accessToken,
        });
    });
}
export function followGroup(accessToken, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(groupId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeId)}/follow`, {
            method: 'POST',
            accessToken,
        });
    });
}
export function unfollowGroup(accessToken, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(groupId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeId)}/follow`, {
            method: 'DELETE',
            accessToken,
        });
    });
}
export function searchProfiles(accessToken, params) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({
            q: (_a = params.q) !== null && _a !== void 0 ? _a : undefined,
            limit: (_b = params.limit) !== null && _b !== void 0 ? _b : undefined,
            offset: (_c = params.offset) !== null && _c !== void 0 ? _c : undefined,
        });
        return apiRequest(`/profiles/search${qs}`, { method: 'GET', accessToken });
    });
}
export function createGroup(accessToken, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/groups`, {
            method: 'POST',
            accessToken,
            body: payload,
        });
    });
}
export function updateGroup(accessToken, groupId, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(groupId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeId)}`, {
            method: 'PUT',
            accessToken,
            body: payload,
        });
    });
}
export function getMyGroups(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/groups/mine`, {
            method: 'GET',
            accessToken,
        });
    });
}
export function searchGroups(accessToken, params) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({
            q: (_a = params.q) !== null && _a !== void 0 ? _a : undefined,
            limit: (_b = params.limit) !== null && _b !== void 0 ? _b : undefined,
            offset: (_c = params.offset) !== null && _c !== void 0 ? _c : undefined,
        });
        return apiRequest(`/groups/search${qs}`, {
            method: 'GET',
            accessToken,
        });
    });
}
export function searchClubs(accessToken, params) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({
            q: (_a = params.q) !== null && _a !== void 0 ? _a : undefined,
            focuses: Array.isArray(params.focuses)
                ? Array.from(new Set(params.focuses.map((value) => String(value !== null && value !== void 0 ? value : '').trim()).filter(Boolean))).join(',')
                : undefined,
            limit: (_b = params.limit) !== null && _b !== void 0 ? _b : undefined,
            offset: (_c = params.offset) !== null && _c !== void 0 ? _c : undefined,
        });
        return apiRequest(`/clubs/search${qs}`, {
            method: 'GET',
            accessToken,
        });
    });
}
export function getGroup(accessToken, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(groupId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeId)}`, {
            method: 'GET',
            accessToken,
        });
    });
}
export function getGroupMembers(accessToken, groupId, role) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(groupId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        const qs = toQueryString({ role: role !== null && role !== void 0 ? role : undefined });
        return apiRequest(`/groups/${encodeURIComponent(safeId)}/members${qs}`, {
            method: 'GET',
            accessToken,
        });
    });
}
export function addGroupMember(accessToken, groupId, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(groupId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeId)}/members`, {
            method: 'POST',
            accessToken,
            body: payload,
        });
    });
}
export function inviteGroupMember(accessToken, groupId, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(groupId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeId)}/invites`, {
            method: 'POST',
            accessToken,
            body: payload,
        });
    });
}
export function listGroupInvites(accessToken, groupId, params) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(groupId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        const qs = toQueryString({
            status: (_a = params === null || params === void 0 ? void 0 : params.status) !== null && _a !== void 0 ? _a : undefined,
            limit: (_b = params === null || params === void 0 ? void 0 : params.limit) !== null && _b !== void 0 ? _b : undefined,
        });
        return apiRequest(`/groups/${encodeURIComponent(safeId)}/invites${qs}`, {
            method: 'GET',
            accessToken,
        });
    });
}
export function respondToGroupInvite(accessToken, inviteId, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(inviteId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing invite_id' });
        }
        return apiRequest(`/groups/invites/${encodeURIComponent(safeId)}/respond`, {
            method: 'POST',
            accessToken,
            body: payload,
        });
    });
}
export function createGroupInviteLink(accessToken, groupId, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(groupId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeId)}/invite-links`, {
            method: 'POST',
            accessToken,
            body: payload !== null && payload !== void 0 ? payload : {},
        });
    });
}
export function getGroupInviteLink(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeToken = String(token || '').trim();
        if (!safeToken) {
            throw new ApiError({ status: 400, message: 'Missing invite token' });
        }
        return apiRequest(`/groups/invite-links/${encodeURIComponent(safeToken)}`, {
            method: 'GET',
        });
    });
}
export function redeemGroupInviteLink(accessToken, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeToken = String(token || '').trim();
        if (!safeToken) {
            throw new ApiError({ status: 400, message: 'Missing invite token' });
        }
        return apiRequest(`/groups/invite-links/${encodeURIComponent(safeToken)}/redeem`, {
            method: 'POST',
            accessToken,
            body: {},
        });
    });
}
export function removeGroupMember(accessToken, groupId, profileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeGroup = String(groupId || '').trim();
        const safeProfile = String(profileId || '').trim();
        if (!safeGroup || !safeProfile) {
            throw new ApiError({ status: 400, message: 'Missing ids' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeGroup)}/members/${encodeURIComponent(safeProfile)}`, {
            method: 'DELETE',
            accessToken,
        });
    });
}
export function updateGroupMemberRole(accessToken, groupId, profileId, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeGroup = String(groupId || '').trim();
        const safeProfile = String(profileId || '').trim();
        if (!safeGroup || !safeProfile) {
            throw new ApiError({ status: 400, message: 'Missing ids' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeGroup)}/members/${encodeURIComponent(safeProfile)}/role`, {
            method: 'PATCH',
            accessToken,
            body: payload,
        });
    });
}
export function updateGroupMemberPublicRoles(accessToken, groupId, profileId, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeGroup = String(groupId || '').trim();
        const safeProfile = String(profileId || '').trim();
        if (!safeGroup || !safeProfile) {
            throw new ApiError({ status: 400, message: 'Missing ids' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeGroup)}/members/${encodeURIComponent(safeProfile)}/public-roles`, {
            method: 'PUT',
            accessToken,
            body: payload,
        });
    });
}
export function deleteGroup(accessToken, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeGroup = String(groupId || '').trim();
        if (!safeGroup) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeGroup)}`, {
            method: 'DELETE',
            accessToken,
        });
    });
}
export function getGroupAssignedEvents(accessToken, groupId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(groupId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        const res = yield apiRequest(`/groups/${encodeURIComponent(safeId)}/competitions`, {
            method: 'GET',
            accessToken,
        });
        const competitions = Array.isArray(res === null || res === void 0 ? void 0 : res.competitions) ? res.competitions : [];
        const events = competitions.map((row) => {
            var _a, _b, _c, _d, _e, _f, _g;
            return ({
                event_id: String((row === null || row === void 0 ? void 0 : row.competition_id) || (row === null || row === void 0 ? void 0 : row.id) || ''),
                competition_id: (row === null || row === void 0 ? void 0 : row.competition_id) ? String(row.competition_id) : undefined,
                event_name: (_a = row === null || row === void 0 ? void 0 : row.competition_name) !== null && _a !== void 0 ? _a : null,
                event_location: (_b = row === null || row === void 0 ? void 0 : row.competition_location) !== null && _b !== void 0 ? _b : null,
                event_date: (_c = row === null || row === void 0 ? void 0 : row.competition_date) !== null && _c !== void 0 ? _c : null,
                competition_name: (_d = row === null || row === void 0 ? void 0 : row.competition_name) !== null && _d !== void 0 ? _d : null,
                competition_location: (_e = row === null || row === void 0 ? void 0 : row.competition_location) !== null && _e !== void 0 ? _e : null,
                competition_date: (_f = row === null || row === void 0 ? void 0 : row.competition_date) !== null && _f !== void 0 ? _f : null,
                organizing_club: normalizeOrganizerClub(row),
                assigned_athletes_count: (_g = row === null || row === void 0 ? void 0 : row.assigned_athletes_count) !== null && _g !== void 0 ? _g : 0,
            });
        });
        return { ok: Boolean(res === null || res === void 0 ? void 0 : res.ok), count: Number((_a = res === null || res === void 0 ? void 0 : res.count) !== null && _a !== void 0 ? _a : events.length), events };
    });
}
export function assignGroupMembersToEvent(accessToken, groupId, eventId, payload) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const safeGroupId = String(groupId || '').trim();
        const safeEventId = String(eventId || '').trim();
        if (!safeGroupId || !safeEventId) {
            throw new ApiError({ status: 400, message: 'Missing group_id or event_id' });
        }
        const res = yield apiRequest(`/groups/${encodeURIComponent(safeGroupId)}/competitions/${encodeURIComponent(safeEventId)}/assign`, {
            method: 'POST',
            accessToken,
            body: payload,
        });
        return {
            ok: Boolean(res === null || res === void 0 ? void 0 : res.ok),
            group_id: String((res === null || res === void 0 ? void 0 : res.group_id) || safeGroupId),
            event_id: String((res === null || res === void 0 ? void 0 : res.competition_id) || safeEventId),
            requested_count: Number((_a = res === null || res === void 0 ? void 0 : res.requested_count) !== null && _a !== void 0 ? _a : 0),
            inserted_count: Number((_b = res === null || res === void 0 ? void 0 : res.inserted_count) !== null && _b !== void 0 ? _b : 0),
        };
    });
}
export function getSubscribedEvents(accessToken) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield apiRequest('/competitions/subscribed', { method: 'GET', accessToken });
        const competitions = Array.isArray(res === null || res === void 0 ? void 0 : res.competitions) ? res.competitions : [];
        const events = competitions.map((row) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return ({
                event_id: String((row === null || row === void 0 ? void 0 : row.competition_id) || (row === null || row === void 0 ? void 0 : row.id) || ''),
                competition_id: (row === null || row === void 0 ? void 0 : row.competition_id) ? String(row.competition_id) : undefined,
                event_name: (_a = row === null || row === void 0 ? void 0 : row.competition_name) !== null && _a !== void 0 ? _a : null,
                event_title: (_b = row === null || row === void 0 ? void 0 : row.competition_name) !== null && _b !== void 0 ? _b : null,
                event_location: (_c = row === null || row === void 0 ? void 0 : row.competition_location) !== null && _c !== void 0 ? _c : null,
                event_date: (_d = row === null || row === void 0 ? void 0 : row.competition_date) !== null && _d !== void 0 ? _d : null,
                competition_name: (_e = row === null || row === void 0 ? void 0 : row.competition_name) !== null && _e !== void 0 ? _e : null,
                competition_location: (_f = row === null || row === void 0 ? void 0 : row.competition_location) !== null && _f !== void 0 ? _f : null,
                competition_date: (_g = row === null || row === void 0 ? void 0 : row.competition_date) !== null && _g !== void 0 ? _g : null,
                competition_type: normalizeCompetitionType(row === null || row === void 0 ? void 0 : row.competition_type),
                organizing_club: normalizeOrganizerClub(row),
                thumbnail_url: (_h = row === null || row === void 0 ? void 0 : row.thumbnail_url) !== null && _h !== void 0 ? _h : null,
            });
        });
        return { ok: Boolean(res === null || res === void 0 ? void 0 : res.ok), count: Number((_a = res === null || res === void 0 ? void 0 : res.count) !== null && _a !== void 0 ? _a : events.length), events };
    });
}
export function getHubAppearances(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/hub/appearances', { method: 'GET', accessToken });
    });
}
export function getHubAppearanceMedia(accessToken, eventId, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(eventId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing event_id' });
        }
        const qs = toQueryString({
            include_original: params === null || params === void 0 ? void 0 : params.include_original,
            limit: params === null || params === void 0 ? void 0 : params.limit,
            offset: params === null || params === void 0 ? void 0 : params.offset,
        });
        return apiRequest(`/hub/appearances/${encodeURIComponent(safeId)}/media${qs}`, {
            method: 'GET',
            accessToken,
        });
    });
}
export function getHubUploads(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({ include_original: params === null || params === void 0 ? void 0 : params.include_original });
        return apiRequest(`/hub/uploads${qs}`, { method: 'GET', accessToken });
    });
}
export function createMediaIssueRequest(accessToken, params) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const mediaId = String(params.media_id || '').trim();
        if (!mediaId) {
            throw new ApiError({ status: 400, message: 'Missing media_id' });
        }
        return apiRequest(`/media/${encodeURIComponent(mediaId)}/edit-requests`, {
            method: 'POST',
            accessToken,
            body: {
                issue_type: params.issue_type,
                event_id: (_a = params.event_id) !== null && _a !== void 0 ? _a : undefined,
                custom_text: (_b = params.custom_text) !== null && _b !== void 0 ? _b : undefined,
            },
        });
    });
}
export function getMyMediaIssueRequests(accessToken, params) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({
            status: (_a = params === null || params === void 0 ? void 0 : params.status) !== null && _a !== void 0 ? _a : undefined,
            limit: (_b = params === null || params === void 0 ? void 0 : params.limit) !== null && _b !== void 0 ? _b : undefined,
            offset: (_c = params === null || params === void 0 ? void 0 : params.offset) !== null && _c !== void 0 ? _c : undefined,
        });
        return apiRequest(`/hub/edit-requests${qs}`, { method: 'GET', accessToken });
    });
}
export function getMediaIssueRequests(accessToken, mediaId, params) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(mediaId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing media_id' });
        }
        const qs = toQueryString({
            status: (_a = params === null || params === void 0 ? void 0 : params.status) !== null && _a !== void 0 ? _a : undefined,
            limit: (_b = params === null || params === void 0 ? void 0 : params.limit) !== null && _b !== void 0 ? _b : undefined,
            offset: (_c = params === null || params === void 0 ? void 0 : params.offset) !== null && _c !== void 0 ? _c : undefined,
        });
        return apiRequest(`/media/${encodeURIComponent(safeId)}/edit-requests${qs}`, {
            method: 'GET',
            accessToken,
        });
    });
}
export function updateMediaIssueRequest(accessToken, mediaId, requestId, params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const safeMediaId = String(mediaId || '').trim();
        const safeRequestId = String(requestId || '').trim();
        if (!safeMediaId || !safeRequestId) {
            throw new ApiError({ status: 400, message: 'Missing media_id or request_id' });
        }
        return apiRequest(`/media/${encodeURIComponent(safeMediaId)}/edit-requests/${encodeURIComponent(safeRequestId)}`, {
            method: 'PUT',
            accessToken,
            body: {
                status: params.status,
                resolution_reason: (_a = params.resolution_reason) !== null && _a !== void 0 ? _a : undefined,
            },
        });
    });
}
export function updateMedia(accessToken, mediaId, params) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(mediaId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing media_id' });
        }
        return apiRequest(`/media/${encodeURIComponent(safeId)}`, {
            method: 'PUT',
            accessToken,
            body: {
                event_id: (_a = params.event_id) !== null && _a !== void 0 ? _a : undefined,
                title: (_b = params.title) !== null && _b !== void 0 ? _b : undefined,
            },
        });
    });
}
export function deleteMedia(accessToken, mediaId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(mediaId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing media_id' });
        }
        return apiRequest(`/media/${encodeURIComponent(safeId)}`, {
            method: 'DELETE',
            accessToken,
        });
    });
}
export function searchEvents(accessToken, params) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({
            q: (_a = params.q) !== null && _a !== void 0 ? _a : undefined,
            limit: (_b = params.limit) !== null && _b !== void 0 ? _b : undefined,
            offset: (_c = params.offset) !== null && _c !== void 0 ? _c : undefined,
        });
        const res = yield apiRequest(`/competitions/search${qs}`, { method: 'GET', accessToken });
        const competitions = Array.isArray(res === null || res === void 0 ? void 0 : res.competitions) ? res.competitions : [];
        const events = competitions.map((row) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return ({
                event_id: String((row === null || row === void 0 ? void 0 : row.competition_id) || (row === null || row === void 0 ? void 0 : row.id) || ''),
                competition_id: (row === null || row === void 0 ? void 0 : row.competition_id) ? String(row.competition_id) : undefined,
                event_name: (_a = row === null || row === void 0 ? void 0 : row.competition_name) !== null && _a !== void 0 ? _a : null,
                event_title: (_b = row === null || row === void 0 ? void 0 : row.competition_name) !== null && _b !== void 0 ? _b : null,
                event_location: (_c = row === null || row === void 0 ? void 0 : row.competition_location) !== null && _c !== void 0 ? _c : null,
                event_date: (_d = row === null || row === void 0 ? void 0 : row.competition_date) !== null && _d !== void 0 ? _d : null,
                competition_name: (_e = row === null || row === void 0 ? void 0 : row.competition_name) !== null && _e !== void 0 ? _e : null,
                competition_location: (_f = row === null || row === void 0 ? void 0 : row.competition_location) !== null && _f !== void 0 ? _f : null,
                competition_date: (_g = row === null || row === void 0 ? void 0 : row.competition_date) !== null && _g !== void 0 ? _g : null,
                competition_type: normalizeCompetitionType(row === null || row === void 0 ? void 0 : row.competition_type),
                organizing_club: normalizeOrganizerClub(row),
                thumbnail_url: (_h = row === null || row === void 0 ? void 0 : row.thumbnail_url) !== null && _h !== void 0 ? _h : null,
            });
        });
        return { ok: Boolean(res === null || res === void 0 ? void 0 : res.ok), count: Number((_d = res === null || res === void 0 ? void 0 : res.count) !== null && _d !== void 0 ? _d : events.length), events };
    });
}
export function getEventCompetitions(accessToken, eventId, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(eventId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing event_id' });
        }
        const query = toQueryString({
            only_with_media: (options === null || options === void 0 ? void 0 : options.onlyWithMedia) ? 'true' : undefined,
        });
        const res = yield apiRequest(`/competitions/${encodeURIComponent(safeId)}/disciplines${query}`, {
            method: 'GET',
            accessToken,
        });
        const disciplines = Array.isArray(res === null || res === void 0 ? void 0 : res.disciplines) ? res.disciplines : [];
        const competitions = disciplines.map((row) => {
            var _a, _b, _c, _d, _e, _f, _g;
            return ({
                id: String((row === null || row === void 0 ? void 0 : row.id) || ''),
                event_id: String((row === null || row === void 0 ? void 0 : row.competition_id) || safeId),
                competition_name: (_a = row === null || row === void 0 ? void 0 : row.discipline_name) !== null && _a !== void 0 ? _a : null,
                competition_name_normalized: (_b = row === null || row === void 0 ? void 0 : row.discipline_name_normalized) !== null && _b !== void 0 ? _b : null,
                competition_type: (_c = row === null || row === void 0 ? void 0 : row.discipline_type) !== null && _c !== void 0 ? _c : null,
                competition_focus: (_d = row === null || row === void 0 ? void 0 : row.competition_focus) !== null && _d !== void 0 ? _d : null,
                discipline_key: (_e = row === null || row === void 0 ? void 0 : row.discipline_key) !== null && _e !== void 0 ? _e : null,
                discipline_group: (_f = row === null || row === void 0 ? void 0 : row.discipline_group) !== null && _f !== void 0 ? _f : null,
                sort_order: (row === null || row === void 0 ? void 0 : row.sort_order) == null ? null : Number(row.sort_order),
                media_count: (row === null || row === void 0 ? void 0 : row.media_count) == null ? null : Number(row.media_count),
                thumbnail_url: (_g = row === null || row === void 0 ? void 0 : row.thumbnail_url) !== null && _g !== void 0 ? _g : null,
            });
        });
        return { ok: Boolean(res === null || res === void 0 ? void 0 : res.ok), count: Number((_a = res === null || res === void 0 ? void 0 : res.count) !== null && _a !== void 0 ? _a : competitions.length), competitions };
    });
}
export function grantFaceRecognitionConsent(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/consents/face_recognition/grant', {
            method: 'POST',
            accessToken,
            body: {},
        });
    });
}
export function searchFaceByEnrollment(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({
            event_ids: params.event_ids,
            label: params.label,
            limit: params.limit,
            top: params.top,
            save: params.save ? 'true' : undefined,
        });
        return apiRequest(`/ai/faces/search${qs}`, { method: 'GET', accessToken });
    });
}
export function searchObject(accessToken, params) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        const q = String(params.q || '').trim();
        if (!q) {
            throw new ApiError({ status: 400, message: 'Missing query' });
        }
        const competitionId = String((_b = (_a = params.competition_id) !== null && _a !== void 0 ? _a : params.event_id) !== null && _b !== void 0 ? _b : '').trim();
        const qs = toQueryString({
            q,
            competition_id: competitionId || undefined,
            discipline_id: (_c = params.discipline_id) !== null && _c !== void 0 ? _c : undefined,
            checkpoint_id: (_d = params.checkpoint_id) !== null && _d !== void 0 ? _d : undefined,
            top: (_e = params.top) !== null && _e !== void 0 ? _e : undefined,
        });
        const res = yield apiRequest(`/ai/search/object${qs}`, { method: 'GET', accessToken });
        if (Array.isArray(res)) {
            return res;
        }
        if (Array.isArray(res === null || res === void 0 ? void 0 : res.results)) {
            return res.results;
        }
        return [];
    });
}
export function searchCompetitionAi(accessToken, competitionId, params) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(competitionId || '').trim();
        const q = String(params.q || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing competition_id' });
        }
        if (!q) {
            throw new ApiError({ status: 400, message: 'Missing query' });
        }
        const qs = toQueryString({
            q,
            discipline_id: (_a = params.discipline_id) !== null && _a !== void 0 ? _a : undefined,
            checkpoint_id: (_b = params.checkpoint_id) !== null && _b !== void 0 ? _b : undefined,
            top: (_c = params.top) !== null && _c !== void 0 ? _c : undefined,
        });
        const res = yield apiRequest(`/competitions/${encodeURIComponent(safeId)}/ai/search${qs}`, { method: 'GET', accessToken });
        if (Array.isArray(res))
            return res;
        if (Array.isArray(res === null || res === void 0 ? void 0 : res.results))
            return res.results;
        return [];
    });
}
export function searchMediaByBib(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const event_id = String(params.event_id || '').trim();
        const bib = String(params.bib || '').trim();
        if (!event_id || !bib) {
            throw new ApiError({ status: 400, message: 'event_id and bib are required' });
        }
        const qs = toQueryString({ event_id, bib, include_original: params.include_original });
        return apiRequest(`/media/search/bib${qs}`, { method: 'GET', accessToken });
    });
}
export function getHomeOverview(accessToken, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = encodeURIComponent(String(userId));
        return apiRequest(`/home/overview/${safeId}`, { method: 'GET', accessToken });
    });
}
export function enrollFace(accessToken, images, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const form = new FormData();
        if (params === null || params === void 0 ? void 0 : params.label)
            form.append('label', params.label);
        if ((params === null || params === void 0 ? void 0 : params.replace) != null)
            form.append('replace', params.replace ? 'true' : 'false');
        const parts = Object.entries(images);
        for (const [field, value] of parts) {
            const uris = Array.isArray(value) ? value : [value];
            for (let i = 0; i < uris.length; i++) {
                const uri = uris[i];
                if (!uri)
                    continue;
                form.append(field, {
                    uri,
                    name: `${field}-${i + 1}.jpg`,
                    type: 'image/jpeg',
                });
            }
        }
        return apiRequest('/ai/faces/enroll', {
            method: 'POST',
            accessToken,
            body: form,
        });
    });
}
export function verifyFaceAngle(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const form = new FormData();
        form.append('angle', params.angle);
        form.append('file', {
            uri: params.uri,
            name: `${params.angle}.jpg`,
            type: 'image/jpeg',
        });
        return apiRequest('/ai/faces/verify-angle', {
            method: 'POST',
            accessToken,
            body: form,
        });
    });
}
export function startFaceLivenessChallenge(accessToken, params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({
            count: (_a = params === null || params === void 0 ? void 0 : params.count) !== null && _a !== void 0 ? _a : undefined,
        });
        return apiRequest(`/ai/faces/liveness/start${qs}`, {
            method: 'POST',
            accessToken,
            body: {},
        });
    });
}
export function submitFaceLivenessStep(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const form = new FormData();
        form.append('challenge_id', params.challenge_id);
        form.append('file', {
            uri: params.uri,
            name: `liveness.jpg`,
            type: 'image/jpeg',
        });
        return apiRequest('/ai/faces/liveness/step', {
            method: 'POST',
            accessToken,
            body: form,
        });
    });
}
export function postAiFeedbackLabel(accessToken, params) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/ai/feedback/label', {
            method: 'POST',
            accessToken,
            body: {
                media_id: params.media_id,
                label: params.label,
                event_id: (_a = params.event_id) !== null && _a !== void 0 ? _a : undefined,
                meta: (_b = params.meta) !== null && _b !== void 0 ? _b : undefined,
                tags: (_c = params.tags) !== null && _c !== void 0 ? _c : undefined,
            },
        });
    });
}
export function getAiFeedbackLabel(accessToken, params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const media_id = String(params.media_id || '').trim();
        if (!media_id) {
            throw new ApiError({ status: 400, message: 'Missing media_id' });
        }
        const qs = toQueryString({
            media_id,
            event_id: (_a = params.event_id) !== null && _a !== void 0 ? _a : undefined,
            limit: 1,
        });
        const res = yield apiRequest(`/ai/feedback/labels${qs}`, { method: 'GET', accessToken });
        const list = Array.isArray(res === null || res === void 0 ? void 0 : res.results) ? res.results : [];
        return list.length > 0 ? list[0] : null;
    });
}
export function subscribeToEvent(accessToken, eventId, payload) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(eventId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing event_id' });
        }
        const res = yield apiRequest(`/competitions/${encodeURIComponent(safeId)}/subscribe`, {
            method: 'POST',
            accessToken,
            body: {
                discipline_ids: Array.isArray(payload === null || payload === void 0 ? void 0 : payload.discipline_ids) ? payload === null || payload === void 0 ? void 0 : payload.discipline_ids : [],
                category_labels: Array.isArray(payload === null || payload === void 0 ? void 0 : payload.category_labels) ? payload === null || payload === void 0 ? void 0 : payload.category_labels : [],
                chest_number: (_a = payload === null || payload === void 0 ? void 0 : payload.chest_number) !== null && _a !== void 0 ? _a : null,
                face_recognition_enabled: Boolean(payload === null || payload === void 0 ? void 0 : payload.face_recognition_enabled),
            },
        });
        return {
            success: Boolean(res === null || res === void 0 ? void 0 : res.success),
            event_id: String((res === null || res === void 0 ? void 0 : res.competition_id) || safeId),
            profile_id: String((res === null || res === void 0 ? void 0 : res.profile_id) || ''),
            discipline_ids: Array.isArray(res === null || res === void 0 ? void 0 : res.discipline_ids) ? res.discipline_ids.map((value) => String(value)) : [],
            category_labels: Array.isArray(res === null || res === void 0 ? void 0 : res.category_labels) ? res.category_labels.map((value) => String(value)) : [],
            chest_number: (res === null || res === void 0 ? void 0 : res.chest_number) == null ? null : String(res.chest_number),
            face_recognition_enabled: Boolean((_b = res === null || res === void 0 ? void 0 : res.face_recognition_enabled) !== null && _b !== void 0 ? _b : false),
        };
    });
}
export function unsubscribeToEvent(accessToken, eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(eventId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing event_id' });
        }
        const res = yield apiRequest(`/competitions/${encodeURIComponent(safeId)}/subscribe`, { method: 'DELETE', accessToken });
        return {
            success: Boolean(res === null || res === void 0 ? void 0 : res.success),
            event_id: String((res === null || res === void 0 ? void 0 : res.competition_id) || safeId),
            profile_id: String((res === null || res === void 0 ? void 0 : res.profile_id) || ''),
        };
    });
}
export function getMediaViewAll(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({ include_original: params === null || params === void 0 ? void 0 : params.include_original });
        return apiRequest(`/media/view_all${qs}`, { method: 'GET', accessToken });
    });
}
export function getCompetitionPublicMedia(accessToken, competitionId, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(competitionId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing competition_id' });
        }
        const qs = toQueryString({
            type: params === null || params === void 0 ? void 0 : params.type,
            discipline_id: params === null || params === void 0 ? void 0 : params.discipline_id,
            checkpoint_id: params === null || params === void 0 ? void 0 : params.checkpoint_id,
            limit: params === null || params === void 0 ? void 0 : params.limit,
            offset: params === null || params === void 0 ? void 0 : params.offset,
            include_original: params === null || params === void 0 ? void 0 : params.include_original,
        });
        const res = yield apiRequest(`/competitions/${encodeURIComponent(safeId)}/media${qs}`, {
            method: 'GET',
            accessToken,
        });
        if (Array.isArray(res))
            return res;
        if (Array.isArray(res === null || res === void 0 ? void 0 : res.items))
            return res.items;
        return [];
    });
}
export function getAllVideos(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const items = yield getMediaViewAll(accessToken);
        return items.filter((item) => String(item.type).toLowerCase() === 'video');
    });
}
export function getAllPhotos(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const items = yield getMediaViewAll(accessToken);
        return items.filter((item) => String(item.type).toLowerCase() === 'image');
    });
}
export function getMediaById(accessToken, mediaId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(mediaId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing media_id' });
        }
        return apiRequest(`/media/${encodeURIComponent(safeId)}`, { method: 'GET', accessToken });
    });
}
export function getCompetitionMaps(accessToken, params) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({
            event_id: (_a = params.event_id) !== null && _a !== void 0 ? _a : undefined,
            competition_id: (_b = params.competition_id) !== null && _b !== void 0 ? _b : undefined,
            limit: (_c = params.limit) !== null && _c !== void 0 ? _c : undefined,
            offset: (_d = params.offset) !== null && _d !== void 0 ? _d : undefined,
            include_checkpoints: params.include_checkpoints ? 'true' : undefined,
        });
        return apiRequest(`/maps${qs}`, { method: 'GET', accessToken });
    });
}
export function getCompetitionMapById(accessToken, mapId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(mapId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing map_id' });
        }
        return apiRequest(`/maps/${encodeURIComponent(safeId)}`, { method: 'GET', accessToken });
    });
}
export function recordDownload(accessToken, params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/downloads', {
            method: 'POST',
            accessToken,
            body: {
                media_id: params.media_id,
                event_id: (_a = params.event_id) !== null && _a !== void 0 ? _a : undefined,
            },
        });
    });
}
export function getDownloads(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({ limit: params === null || params === void 0 ? void 0 : params.limit });
        return apiRequest(`/downloads${qs}`, { method: 'GET', accessToken });
    });
}
export function getDownloadsProfit(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({ limit: params === null || params === void 0 ? void 0 : params.limit });
        return apiRequest(`/downloads/profit${qs}`, { method: 'GET', accessToken });
    });
}
export function getUploadedCompetitions(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({ limit: params === null || params === void 0 ? void 0 : params.limit, offset: params === null || params === void 0 ? void 0 : params.offset });
        return apiRequest(`/downloads/competitions${qs}`, { method: 'GET', accessToken });
    });
}
export function getCompetitionMedia(accessToken, eventId, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(eventId || '').trim();
        if (!safeId) {
            throw new ApiError({ status: 400, message: 'Missing event_id' });
        }
        const qs = toQueryString({
            limit: params === null || params === void 0 ? void 0 : params.limit,
            offset: params === null || params === void 0 ? void 0 : params.offset,
            include_original: params === null || params === void 0 ? void 0 : params.include_original,
        });
        return apiRequest(`/downloads/competitions/${encodeURIComponent(safeId)}/media${qs}`, { method: 'GET', accessToken });
    });
}
export function getDownloadsSummary(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/downloads/summary', { method: 'GET', accessToken });
    });
}
export function getDownloadsDashboard(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/downloads/dashboard', { method: 'GET', accessToken });
    });
}
export function getProfileTimeline(accessToken, profileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safe = String(profileId || '').trim() || 'me';
        return apiRequest(`/profiles/${encodeURIComponent(safe)}/timeline`, { method: 'GET', accessToken });
    });
}
export function setMyProfileTimeline(accessToken, items) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/profiles/me/timeline', { method: 'PUT', accessToken, body: { items } });
    });
}
export function getProfileCollections(accessToken, profileId, params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const safe = String(profileId || '').trim() || 'me';
        const qs = toQueryString({ limit: params === null || params === void 0 ? void 0 : params.limit, scope_key: String((_a = params === null || params === void 0 ? void 0 : params.scope_key) !== null && _a !== void 0 ? _a : '').trim() || undefined });
        return apiRequest(`/profiles/${encodeURIComponent(safe)}/collections${qs}`, { method: 'GET', accessToken });
    });
}
export function getProfileCollectionByType(accessToken, type, params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({
            type,
            scope_key: String((_a = params === null || params === void 0 ? void 0 : params.scope_key) !== null && _a !== void 0 ? _a : '').trim() || undefined,
            include_original: params === null || params === void 0 ? void 0 : params.include_original,
        });
        return apiRequest(`/profiles/me/collections/by-type${qs}`, { method: 'GET', accessToken });
    });
}
export function addProfileCollectionItems(accessToken, params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/profiles/me/collections/by-type/items`, {
            method: 'POST',
            accessToken,
            body: {
                type: params.type,
                scope_key: String((_a = params.scope_key) !== null && _a !== void 0 ? _a : '').trim() || undefined,
                media_ids: params.media_ids,
            },
        });
    });
}
export function removeProfileCollectionItems(accessToken, params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/profiles/me/collections/by-type/items`, {
            method: 'DELETE',
            accessToken,
            body: {
                type: params.type,
                scope_key: String((_a = params.scope_key) !== null && _a !== void 0 ? _a : '').trim() || undefined,
                media_ids: params.media_ids,
            },
        });
    });
}
export function setProfileCollectionFeatured(accessToken, params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/profiles/me/collections/by-type/featured`, {
            method: 'PUT',
            accessToken,
            body: {
                type: params.type,
                scope_key: String((_a = params.scope_key) !== null && _a !== void 0 ? _a : '').trim() || undefined,
                media_ids: params.media_ids,
            },
        });
    });
}
export function updateProfileCollectionByType(accessToken, params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/profiles/me/collections/by-type`, {
            method: 'PATCH',
            accessToken,
            body: {
                type: params.type,
                scope_key: String((_a = params.scope_key) !== null && _a !== void 0 ? _a : '').trim() || undefined,
                name: params.name,
                description: params.description,
            },
        });
    });
}
export function getGroupCollectionByType(accessToken, groupId, type, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeGroup = String(groupId || '').trim();
        if (!safeGroup) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        const qs = toQueryString({ type, include_original: params === null || params === void 0 ? void 0 : params.include_original });
        return apiRequest(`/groups/${encodeURIComponent(safeGroup)}/collections/by-type${qs}`, {
            method: 'GET',
            accessToken,
        });
    });
}
export function setGroupCollectionFeatured(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeGroup = String(params.group_id || '').trim();
        if (!safeGroup) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeGroup)}/collections/by-type/featured`, {
            method: 'PUT',
            accessToken,
            body: {
                type: params.type,
                media_ids: params.media_ids,
            },
        });
    });
}
export function getGroupCollectionCandidates(accessToken, groupId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeGroup = String(groupId || '').trim();
        if (!safeGroup) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        const qs = toQueryString({ type });
        return apiRequest(`/groups/${encodeURIComponent(safeGroup)}/collections/by-type/candidates${qs}`, {
            method: 'GET',
            accessToken,
        });
    });
}
export function addGroupCollectionItems(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeGroup = String(params.group_id || '').trim();
        if (!safeGroup) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeGroup)}/collections/by-type/items`, {
            method: 'POST',
            accessToken,
            body: {
                type: params.type,
                media_ids: params.media_ids,
            },
        });
    });
}
export function removeGroupCollectionItems(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeGroup = String(params.group_id || '').trim();
        if (!safeGroup) {
            throw new ApiError({ status: 400, message: 'Missing group_id' });
        }
        return apiRequest(`/groups/${encodeURIComponent(safeGroup)}/collections/by-type/items`, {
            method: 'DELETE',
            accessToken,
            body: {
                type: params.type,
                media_ids: params.media_ids,
            },
        });
    });
}
export function getProfileSummary(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/profiles/me/summary', { method: 'GET', accessToken });
    });
}
export function updateProfileSummary(accessToken, params) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        const body = {
            display_name: (_a = params.display_name) !== null && _a !== void 0 ? _a : undefined,
            category: (_b = params.category) !== null && _b !== void 0 ? _b : undefined,
            bio: (_c = params.bio) !== null && _c !== void 0 ? _c : undefined,
            website: (_d = params.website) !== null && _d !== void 0 ? _d : undefined,
            avatar_url: (_e = params.avatar_url) !== null && _e !== void 0 ? _e : undefined,
            avatar_media_id: (_f = params.avatar_media_id) !== null && _f !== void 0 ? _f : undefined,
        };
        if (Object.prototype.hasOwnProperty.call(params, 'support_role')) {
            body.support_role = params.support_role;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'supportRole')) {
            body.support_role = params.supportRole;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'support_organization')) {
            body.support_organization = params.support_organization;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'supportOrganization')) {
            body.support_organization = params.supportOrganization;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'support_base_location')) {
            body.support_base_location = params.support_base_location;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'supportBaseLocation')) {
            body.support_base_location = params.supportBaseLocation;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'support_athletes')) {
            body.support_athletes = params.support_athletes;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'supportAthletes')) {
            body.support_athletes = params.supportAthletes;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'support_athlete_profile_ids')) {
            body.support_athlete_profile_ids = params.support_athlete_profile_ids;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'supportAthleteProfileIds')) {
            body.support_athlete_profile_ids = params.supportAthleteProfileIds;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'support_club_codes')) {
            body.support_club_codes = params.support_club_codes;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'supportClubCodes')) {
            body.support_club_codes = params.supportClubCodes;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'support_group_ids')) {
            body.support_group_ids = params.support_group_ids;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'supportGroupIds')) {
            body.support_group_ids = params.supportGroupIds;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'support_focuses')) {
            body.support_focuses = params.support_focuses;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'supportFocuses')) {
            body.support_focuses = params.supportFocuses;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'selected_events')) {
            body.selected_events = params.selected_events;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'selectedEvents')) {
            body.selected_events = params.selectedEvents;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'main_disciplines')) {
            body.main_disciplines = params.main_disciplines;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'mainDisciplines')) {
            body.main_disciplines = params.mainDisciplines;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'chest_numbers_by_year')) {
            body.chest_numbers_by_year = params.chest_numbers_by_year;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'chestNumbersByYear')) {
            body.chest_numbers_by_year = params.chestNumbersByYear;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'track_field_club')) {
            body.track_field_club = params.track_field_club;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'trackFieldClub')) {
            body.track_field_club = params.trackFieldClub;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'running_club_group_id')) {
            body.running_club_group_id = params.running_club_group_id;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'runningClubGroupId')) {
            body.running_club_group_id = params.runningClubGroupId;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'track_field_main_event')) {
            body.track_field_main_event = params.track_field_main_event;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'trackFieldMainEvent')) {
            body.track_field_main_event = params.trackFieldMainEvent;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'road_trail_main_event')) {
            body.road_trail_main_event = params.road_trail_main_event;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'roadTrailMainEvent')) {
            body.road_trail_main_event = params.roadTrailMainEvent;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'document_uploaded')) {
            body.document_uploaded = params.document_uploaded;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'documentUploaded')) {
            body.document_uploaded = params.documentUploaded;
        }
        if (Object.prototype.hasOwnProperty.call(params, 'face_verified')) {
            body.face_verified = params.face_verified;
        }
        else if (Object.prototype.hasOwnProperty.call(params, 'faceVerified')) {
            body.face_verified = params.faceVerified;
        }
        return apiRequest('/profiles/me', {
            method: 'PUT',
            accessToken,
            body,
        });
    });
}
export function uploadMediaBatch(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const form = new FormData();
        for (let i = 0; i < params.files.length; i += 1) {
            const f = params.files[i];
            form.append('files', {
                uri: f.uri,
                name: f.name || `upload-${i + 1}`,
                type: f.type || 'application/octet-stream',
            });
        }
        const fileTitles = params.files.map((file) => String((file === null || file === void 0 ? void 0 : file.title) || '').trim());
        if (fileTitles.some((value) => value.length > 0)) {
            form.append('file_titles_json', JSON.stringify(fileTitles));
        }
        if (params.event_id)
            form.append('event_id', String(params.event_id));
        if (params.discipline_id)
            form.append('discipline_id', String(params.discipline_id));
        if (params.competition_map_id)
            form.append('competition_map_id', String(params.competition_map_id));
        if (params.checkpoint_id)
            form.append('checkpoint_id', String(params.checkpoint_id));
        if (params.checkpoint_index != null)
            form.append('checkpoint_index', String(params.checkpoint_index));
        if (params.post_id)
            form.append('post_id', String(params.post_id));
        if (params.is_anonymous != null)
            form.append('is_anonymous', params.is_anonymous ? 'true' : 'false');
        if (params.price_cents != null)
            form.append('price_cents', String(Math.max(0, Number(params.price_cents) || 0)));
        if (params.price_currency)
            form.append('price_currency', String(params.price_currency));
        if (params.collection_scope_key)
            form.append('collection_scope_key', String(params.collection_scope_key));
        if (params.skip_profile_collection != null)
            form.append('skip_profile_collection', params.skip_profile_collection ? 'true' : 'false');
        if (params.is_anonymous) {
            form.append('strip_author_data', 'true');
            form.append('anonymous_mode', 'strict');
        }
        return apiRequest('/media/upload', {
            method: 'POST',
            accessToken,
            body: form,
        });
    });
}
export function uploadMediaBatchWatermark(accessToken, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const form = new FormData();
        form.append('watermark_text', String(params.watermark_text || 'SpotMe'));
        for (let i = 0; i < params.files.length; i += 1) {
            const f = params.files[i];
            form.append('files', {
                uri: f.uri,
                name: f.name || `upload-${i + 1}`,
                type: f.type || 'application/octet-stream',
            });
        }
        const fileTitles = params.files.map((file) => String((file === null || file === void 0 ? void 0 : file.title) || '').trim());
        if (fileTitles.some((value) => value.length > 0)) {
            form.append('file_titles_json', JSON.stringify(fileTitles));
        }
        if (params.event_id)
            form.append('event_id', String(params.event_id));
        if (params.discipline_id)
            form.append('discipline_id', String(params.discipline_id));
        if (params.competition_map_id)
            form.append('competition_map_id', String(params.competition_map_id));
        if (params.checkpoint_id)
            form.append('checkpoint_id', String(params.checkpoint_id));
        if (params.checkpoint_index != null)
            form.append('checkpoint_index', String(params.checkpoint_index));
        if (params.post_id)
            form.append('post_id', String(params.post_id));
        if (params.is_anonymous != null)
            form.append('is_anonymous', params.is_anonymous ? 'true' : 'false');
        if (params.price_cents != null)
            form.append('price_cents', String(Math.max(0, Number(params.price_cents) || 0)));
        if (params.price_currency)
            form.append('price_currency', String(params.price_currency));
        if (params.collection_scope_key)
            form.append('collection_scope_key', String(params.collection_scope_key));
        if (params.skip_profile_collection != null)
            form.append('skip_profile_collection', params.skip_profile_collection ? 'true' : 'false');
        if (params.is_anonymous) {
            form.append('strip_author_data', 'true');
            form.append('anonymous_mode', 'strict');
        }
        return apiRequest('/media/upload_watermark', {
            method: 'POST',
            accessToken,
            body: form,
        });
    });
}
export function getMediaStatus(accessToken, media_ids) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest('/media/status', {
            method: 'POST',
            accessToken,
            body: { media_ids },
        });
    });
}
// -----------------------------
// Likes + Views
// -----------------------------
export function toggleMediaLike(accessToken, media_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/media/${encodeURIComponent(media_id)}/like`, { method: 'POST', accessToken, body: {} });
    });
}
export function recordMediaView(accessToken, media_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/media/${encodeURIComponent(media_id)}/view`, { method: 'POST', accessToken, body: {} });
    });
}
export function togglePostLike(accessToken, post_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/posts/${encodeURIComponent(post_id)}/like`, { method: 'POST', accessToken, body: {} });
    });
}
export function recordPostView(accessToken, post_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/posts/${encodeURIComponent(post_id)}/view`, { method: 'POST', accessToken, body: {} });
    });
}
export function getPosts(accessToken, params) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({
            author_profile_id: (_a = params === null || params === void 0 ? void 0 : params.author_profile_id) !== null && _a !== void 0 ? _a : undefined,
            group_id: (_b = params === null || params === void 0 ? void 0 : params.group_id) !== null && _b !== void 0 ? _b : undefined,
            limit: params === null || params === void 0 ? void 0 : params.limit,
            include_original: params === null || params === void 0 ? void 0 : params.include_original,
        });
        return apiRequest(`/posts${qs}`, { method: 'GET', accessToken });
    });
}
export function getPostById(accessToken, post_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/posts/${encodeURIComponent(post_id)}`, { method: 'GET', accessToken });
    });
}
export function createPost(accessToken, params) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/posts`, {
            method: 'POST',
            accessToken,
            body: {
                title: params.title,
                description: params.description,
                summary: (_a = params.summary) !== null && _a !== void 0 ? _a : undefined,
                created_at: (_b = params.created_at) !== null && _b !== void 0 ? _b : undefined,
                event_id: (_c = params.event_id) !== null && _c !== void 0 ? _c : undefined,
                group_id: (_d = params.group_id) !== null && _d !== void 0 ? _d : undefined,
                post_type: (_e = params.post_type) !== null && _e !== void 0 ? _e : undefined,
                tagged_profile_ids: (_f = params.tagged_profile_ids) !== null && _f !== void 0 ? _f : undefined,
            },
        });
    });
}
export function attachMediaToPost(accessToken, post_id, params) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/posts/${encodeURIComponent(post_id)}/media`, {
            method: 'POST',
            accessToken,
            body: {
                media_ids: params.media_ids,
            },
        });
    });
}
export function updatePost(accessToken, post_id, params) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/posts/${encodeURIComponent(post_id)}`, {
            method: 'PUT',
            accessToken,
            body: {
                title: (_a = params.title) !== null && _a !== void 0 ? _a : undefined,
                description: (_b = params.description) !== null && _b !== void 0 ? _b : undefined,
                summary: (_c = params.summary) !== null && _c !== void 0 ? _c : undefined,
                created_at: (_d = params.created_at) !== null && _d !== void 0 ? _d : undefined,
                post_type: (_e = params.post_type) !== null && _e !== void 0 ? _e : undefined,
                tagged_profile_ids: (_f = params.tagged_profile_ids) !== null && _f !== void 0 ? _f : undefined,
            },
        });
    });
}
export function deletePost(accessToken, post_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return apiRequest(`/posts/${encodeURIComponent(post_id)}`, { method: 'DELETE', accessToken });
    });
}
export function getNotifications(accessToken, params) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const qs = toQueryString({
            limit: (_a = params === null || params === void 0 ? void 0 : params.limit) !== null && _a !== void 0 ? _a : undefined,
            offset: (_b = params === null || params === void 0 ? void 0 : params.offset) !== null && _b !== void 0 ? _b : undefined,
            unread_only: (params === null || params === void 0 ? void 0 : params.unread_only) ? 'true' : undefined,
        });
        return apiRequest(`/notifications${qs}`, {
            method: 'GET',
            accessToken,
        });
    });
}
export function markNotificationRead(accessToken, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeId = String(id || '').trim();
        if (!safeId)
            throw new ApiError({ status: 400, message: 'Missing notification id' });
        return apiRequest(`/notifications/${encodeURIComponent(safeId)}/read`, {
            method: 'POST',
            accessToken,
            body: {},
        });
    });
}
export function registerDeviceToken(accessToken, payload) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const token = String((payload === null || payload === void 0 ? void 0 : payload.token) || '').trim();
        if (!token)
            throw new ApiError({ status: 400, message: 'Missing token' });
        return apiRequest('/devices/token', {
            method: 'POST',
            accessToken,
            body: {
                token,
                platform: payload.platform,
                enabled: (_a = payload.enabled) !== null && _a !== void 0 ? _a : true,
            },
        });
    });
}
