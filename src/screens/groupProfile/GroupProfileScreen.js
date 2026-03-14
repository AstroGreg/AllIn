var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Linking, Alert, Modal } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { createStyles } from './GroupProfileStyles';
import { Location, Profile2User, User, Edit2, DocumentText, MedalStar, Gallery } from 'iconsax-react-nativejs';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import SportFocusIcon from '../../components/profile/SportFocusIcon';
import { deletePost, followProfile, getGroupCollectionByType, getGroup, getGroupAssignedEvents, getGroupMembers, getMediaById, getMyGroups, getPosts, getProfileSummary, updateGroup, uploadMediaBatch, unfollowProfile, } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { getSportFocusLabel, normalizeFocusId, normalizeSelectedEvents } from '../../utils/profileSelections';
const GroupProfileScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [activeTab, setActiveTab] = useState('news');
    const [groupId, setGroupId] = useState((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.groupId) !== null && _b !== void 0 ? _b : null);
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [groupNews, setGroupNews] = useState([]);
    const [groupCompetitions, setGroupCompetitions] = useState([]);
    const [photoCollection, setPhotoCollection] = useState({ collection: null, items: [] });
    const [videoCollection, setVideoCollection] = useState({ collection: null, items: [] });
    const [collectionsLoading, setCollectionsLoading] = useState(false);
    const [viewerProfileId, setViewerProfileId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [followBusyByProfile, setFollowBusyByProfile] = useState({});
    const [deletingPostById, setDeletingPostById] = useState({});
    const [groupIconUrl, setGroupIconUrl] = useState(null);
    const [isUpdatingGroupAvatar, setIsUpdatingGroupAvatar] = useState(false);
    const [showProfileSwitcherModal, setShowProfileSwitcherModal] = useState(false);
    const [myGroups, setMyGroups] = useState([]);
    const showBackButton = Boolean((_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.showBackButton) || String(((_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.origin) || '').toLowerCase() === 'search';
    const { apiAccessToken, userProfile } = useAuth();
    useEffect(() => {
        var _a, _b;
        const incomingGroupId = String((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.groupId) !== null && _b !== void 0 ? _b : '').trim();
        if (!incomingGroupId)
            return;
        if (incomingGroupId !== String(groupId !== null && groupId !== void 0 ? groupId : ''))
            setGroupId(incomingGroupId);
    }, [groupId, (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.groupId]);
    useEffect(() => {
        var _a, _b;
        const incomingTab = String((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.tab) !== null && _b !== void 0 ? _b : '').trim().toLowerCase();
        if (incomingTab === 'competitions')
            setActiveTab('competitions');
        if (incomingTab === 'athletes' || incomingTab === 'members')
            setActiveTab('members');
        if (incomingTab === 'collections')
            setActiveTab('collections');
    }, [(_f = route === null || route === void 0 ? void 0 : route.params) === null || _f === void 0 ? void 0 : _f.tab]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken)
            return () => { };
        getProfileSummary(apiAccessToken)
            .then((resp) => {
            if (mounted)
                setViewerProfileId((resp === null || resp === void 0 ? void 0 : resp.profile_id) ? String(resp.profile_id) : null);
        })
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken]);
    const loadBaseGroupData = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _p, _q, _r;
        if (!apiAccessToken)
            return;
        setLoading(true);
        try {
            let targetGroupId = groupId;
            if (!targetGroupId) {
                const mine = yield getMyGroups(apiAccessToken);
                targetGroupId = (_r = (_q = (_p = mine.groups) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.group_id) !== null && _r !== void 0 ? _r : null;
                setGroupId(targetGroupId);
            }
            if (!targetGroupId) {
                setGroup(null);
                setMembers([]);
                return;
            }
            const [groupResp, membersResp] = yield Promise.all([
                getGroup(apiAccessToken, targetGroupId),
                getGroupMembers(apiAccessToken, targetGroupId),
            ]);
            setGroup(groupResp.group);
            setMembers(membersResp.members || []);
        }
        catch (_s) {
            setGroup(null);
            setMembers([]);
        }
        finally {
            setLoading(false);
        }
    }), [apiAccessToken, groupId]);
    useEffect(() => {
        loadBaseGroupData();
    }, [loadBaseGroupData]);
    useFocusEffect(useCallback(() => {
        void loadBaseGroupData();
    }, [loadBaseGroupData]));
    const toAbsoluteUrl = useCallback((value) => {
        if (!value)
            return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://'))
            return raw;
        const base = getApiBaseUrl();
        if (!base)
            return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);
    const withAccessToken = useCallback((value) => {
        if (!value)
            return null;
        if (!apiAccessToken)
            return value;
        const raw = String(value);
        const lower = raw.toLowerCase();
        if (lower.includes('access_token=') ||
            lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp='))
            return value;
        const sep = raw.includes('?') ? '&' : '?';
        return `${raw}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken]);
    useEffect(() => {
        let mounted = true;
        const iconMediaId = String((group === null || group === void 0 ? void 0 : group.avatar_media_id) || '').trim();
        if (!apiAccessToken || !iconMediaId) {
            setGroupIconUrl(null);
            return () => {
                mounted = false;
            };
        }
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const iconMedia = yield getMediaById(apiAccessToken, iconMediaId);
                if (!mounted)
                    return;
                const iconRaw = (iconMedia === null || iconMedia === void 0 ? void 0 : iconMedia.thumbnail_url) || (iconMedia === null || iconMedia === void 0 ? void 0 : iconMedia.preview_url) || (iconMedia === null || iconMedia === void 0 ? void 0 : iconMedia.full_url) || (iconMedia === null || iconMedia === void 0 ? void 0 : iconMedia.raw_url) || (iconMedia === null || iconMedia === void 0 ? void 0 : iconMedia.original_url) || null;
                const iconAbsolute = toAbsoluteUrl(iconRaw ? String(iconRaw) : null);
                const icon = withAccessToken(iconAbsolute || null);
                setGroupIconUrl(icon || null);
            }
            catch (_a) {
                if (mounted) {
                    setGroupIconUrl(null);
                }
            }
        }))();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, group, toAbsoluteUrl, withAccessToken]);
    const canManageGroup = useMemo(() => {
        const role = String((group === null || group === void 0 ? void 0 : group.my_role) || '').toLowerCase();
        return role === 'owner' || role === 'admin';
    }, [group === null || group === void 0 ? void 0 : group.my_role]);
    const isGroupOwner = useMemo(() => {
        const role = String((group === null || group === void 0 ? void 0 : group.my_role) || '').toLowerCase();
        if (role === 'owner')
            return true;
        const ownerProfileId = String((group === null || group === void 0 ? void 0 : group.owner_profile_id) || '').trim();
        const viewerId = String(viewerProfileId || '').trim();
        return ownerProfileId.length > 0 && viewerId.length > 0 && ownerProfileId === viewerId;
    }, [group, viewerProfileId]);
    const hasGroupRelationship = useMemo(() => String((group === null || group === void 0 ? void 0 : group.my_role) || '').trim().length > 0, [group === null || group === void 0 ? void 0 : group.my_role]);
    const canOpenGroupSwitcher = hasGroupRelationship;
    const viewerSportFocuses = useMemo(() => { var _a; return normalizeSelectedEvents((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents) !== null && _a !== void 0 ? _a : []); }, [userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || !canOpenGroupSwitcher) {
            setMyGroups([]);
            return () => {
                mounted = false;
            };
        }
        getMyGroups(apiAccessToken)
            .then((resp) => {
            if (!mounted)
                return;
            const groups = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.groups)
                ? resp.groups
                    .map((item) => ({
                    id: String((item === null || item === void 0 ? void 0 : item.group_id) || '').trim(),
                    name: String((item === null || item === void 0 ? void 0 : item.name) || '').trim(),
                }))
                    .filter((item) => item.id.length > 0)
                : [];
            setMyGroups(groups);
        })
            .catch(() => {
            if (mounted)
                setMyGroups([]);
        });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, canOpenGroupSwitcher]);
    const groupName = (group === null || group === void 0 ? void 0 : group.name) || t('Group');
    const groupDescription = String((group === null || group === void 0 ? void 0 : group.location) ||
        (group === null || group === void 0 ? void 0 : group.base_location) ||
        (group === null || group === void 0 ? void 0 : group.city) ||
        (group === null || group === void 0 ? void 0 : group.bio) ||
        (group === null || group === void 0 ? void 0 : group.description) ||
        '').trim() || t('No description added yet.');
    const groupWebsite = String((_g = group === null || group === void 0 ? void 0 : group.website) !== null && _g !== void 0 ? _g : '').trim();
    const groupFocuses = useMemo(() => {
        const raw = [
            ...(Array.isArray(group === null || group === void 0 ? void 0 : group.focuses) ? group === null || group === void 0 ? void 0 : group.focuses : []),
            ...(Array.isArray(group === null || group === void 0 ? void 0 : group.competition_focuses) ? group === null || group === void 0 ? void 0 : group.competition_focuses : []),
            ...(Array.isArray(group === null || group === void 0 ? void 0 : group.selected_events) ? group === null || group === void 0 ? void 0 : group.selected_events : []),
        ]
            .map((entry) => String(entry || '').trim().toLowerCase())
            .filter(Boolean);
        const mapped = Array.from(new Set(raw.map((entry) => normalizeFocusId(entry)).filter(Boolean)));
        return mapped.length > 0 ? mapped : ['track-field'];
    }, [group]);
    const membersWithDisplayRoles = useMemo(() => members.map((member) => {
        const remoteRoles = Array.isArray(member.public_roles)
            ? member.public_roles
                .map((entry) => String(entry || '').toLowerCase())
                .filter((entry) => entry === 'athlete' || entry === 'coach' || entry === 'physio')
            : [];
        const backendRole = String(member.role || '').toLowerCase();
        const fallbackRoles = backendRole === 'athlete' || backendRole === 'coach' || backendRole === 'physio'
            ? [backendRole]
            : [];
        return Object.assign(Object.assign({}, member), { displayRoles: remoteRoles.length > 0 ? remoteRoles : fallbackRoles });
    }), [members]);
    const coaches = useMemo(() => membersWithDisplayRoles.filter((member) => Array.isArray(member.displayRoles) && member.displayRoles.includes('coach')), [membersWithDisplayRoles]);
    const displayedMemberCount = useMemo(() => {
        var _a;
        const loadedCount = Array.isArray(members) ? members.length : 0;
        if (loadedCount > 0)
            return loadedCount;
        return Number((_a = group === null || group === void 0 ? void 0 : group.member_count) !== null && _a !== void 0 ? _a : 0);
    }, [group === null || group === void 0 ? void 0 : group.member_count, members]);
    const manualCoachNames = useMemo(() => {
        var _a;
        const source = Array.isArray(group === null || group === void 0 ? void 0 : group.coaches) ? ((_a = group === null || group === void 0 ? void 0 : group.coaches) !== null && _a !== void 0 ? _a : []) : [];
        return source.map((entry) => String(entry || '').trim()).filter(Boolean);
    }, [group === null || group === void 0 ? void 0 : group.coaches]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || !(group === null || group === void 0 ? void 0 : group.group_id) || activeTab !== 'news') {
            setGroupNews([]);
            return () => {
                mounted = false;
            };
        }
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const resp = yield getPosts(apiAccessToken, {
                    group_id: String(group.group_id),
                    limit: 50,
                    include_original: false,
                });
                if (!mounted)
                    return;
                setGroupNews(Array.isArray(resp === null || resp === void 0 ? void 0 : resp.posts) ? resp.posts : []);
            }
            catch (_a) {
                if (mounted)
                    setGroupNews([]);
            }
        }))();
        return () => {
            mounted = false;
        };
    }, [activeTab, apiAccessToken, group === null || group === void 0 ? void 0 : group.group_id]);
    const loadCompetitions = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !(group === null || group === void 0 ? void 0 : group.group_id))
            return;
        try {
            const resp = yield getGroupAssignedEvents(apiAccessToken, String(group.group_id));
            setGroupCompetitions(Array.isArray(resp === null || resp === void 0 ? void 0 : resp.events) ? resp.events : []);
        }
        catch (_t) {
            setGroupCompetitions([]);
        }
    }), [apiAccessToken, group === null || group === void 0 ? void 0 : group.group_id]);
    const loadCollections = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _u, _v;
        if (!apiAccessToken || !(group === null || group === void 0 ? void 0 : group.group_id)) {
            setPhotoCollection({ collection: null, items: [] });
            setVideoCollection({ collection: null, items: [] });
            return;
        }
        setCollectionsLoading(true);
        try {
            const [photos, videos] = yield Promise.all([
                getGroupCollectionByType(apiAccessToken, String(group.group_id), 'image', { include_original: false }),
                getGroupCollectionByType(apiAccessToken, String(group.group_id), 'video', { include_original: false }),
            ]);
            setPhotoCollection({
                collection: (_u = photos === null || photos === void 0 ? void 0 : photos.collection) !== null && _u !== void 0 ? _u : null,
                items: Array.isArray(photos === null || photos === void 0 ? void 0 : photos.items) ? photos.items : [],
            });
            setVideoCollection({
                collection: (_v = videos === null || videos === void 0 ? void 0 : videos.collection) !== null && _v !== void 0 ? _v : null,
                items: Array.isArray(videos === null || videos === void 0 ? void 0 : videos.items) ? videos.items : [],
            });
        }
        catch (_w) {
            setPhotoCollection({ collection: null, items: [] });
            setVideoCollection({ collection: null, items: [] });
        }
        finally {
            setCollectionsLoading(false);
        }
    }), [apiAccessToken, group === null || group === void 0 ? void 0 : group.group_id]);
    useEffect(() => {
        if (activeTab === 'competitions')
            loadCompetitions();
    }, [activeTab, loadCompetitions, (_h = route === null || route === void 0 ? void 0 : route.params) === null || _h === void 0 ? void 0 : _h.refreshTs]);
    useEffect(() => {
        if (activeTab === 'collections')
            loadCollections();
    }, [activeTab, loadCollections, (_j = route === null || route === void 0 ? void 0 : route.params) === null || _j === void 0 ? void 0 : _j.refreshTs]);
    const handleToggleFollow = (member) => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !member.profile_id || !viewerProfileId)
            return;
        if (String(member.profile_id) === String(viewerProfileId))
            return;
        const targetProfileId = String(member.profile_id);
        if (followBusyByProfile[targetProfileId])
            return;
        setFollowBusyByProfile((prev) => (Object.assign(Object.assign({}, prev), { [targetProfileId]: true })));
        try {
            if (member.is_following) {
                yield unfollowProfile(apiAccessToken, targetProfileId);
                setMembers((prev) => prev.map((m) => (String(m.profile_id) === targetProfileId ? Object.assign(Object.assign({}, m), { is_following: false }) : m)));
            }
            else {
                yield followProfile(apiAccessToken, targetProfileId);
                setMembers((prev) => prev.map((m) => (String(m.profile_id) === targetProfileId ? Object.assign(Object.assign({}, m), { is_following: true }) : m)));
            }
        }
        catch (_x) {
            // ignore
        }
        finally {
            setFollowBusyByProfile((prev) => (Object.assign(Object.assign({}, prev), { [targetProfileId]: false })));
        }
    });
    const handleDeleteNewsPost = useCallback((postId) => __awaiter(void 0, void 0, void 0, function* () {
        const safePostId = String(postId || '').trim();
        if (!apiAccessToken || !safePostId || deletingPostById[safePostId])
            return;
        setDeletingPostById((prev) => (Object.assign(Object.assign({}, prev), { [safePostId]: true })));
        try {
            yield deletePost(apiAccessToken, safePostId);
            setGroupNews((prev) => prev.filter((post) => String(post.id) !== safePostId));
        }
        catch (_y) {
            // ignore
        }
        finally {
            setDeletingPostById((prev) => (Object.assign(Object.assign({}, prev), { [safePostId]: false })));
        }
    }), [apiAccessToken, deletingPostById]);
    const handleChangeGroupPicture = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _z, _0, _1;
        const safeGroupId = String((group === null || group === void 0 ? void 0 : group.group_id) || '').trim();
        if (!apiAccessToken || !safeGroupId || !isGroupOwner || isUpdatingGroupAvatar)
            return;
        const result = yield launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            presentationStyle: 'fullScreen',
            assetRepresentationMode: 'current',
        });
        const asset = (_z = result === null || result === void 0 ? void 0 : result.assets) === null || _z === void 0 ? void 0 : _z[0];
        if (!(asset === null || asset === void 0 ? void 0 : asset.uri))
            return;
        setIsUpdatingGroupAvatar(true);
        try {
            const uploadResp = yield uploadMediaBatch(apiAccessToken, {
                files: [
                    {
                        uri: asset.uri,
                        type: (_0 = asset.type) !== null && _0 !== void 0 ? _0 : 'image/jpeg',
                        name: (_1 = asset.fileName) !== null && _1 !== void 0 ? _1 : `group-avatar-${Date.now()}.jpg`,
                    },
                ],
                skip_profile_collection: true,
            });
            const firstResult = Array.isArray(uploadResp === null || uploadResp === void 0 ? void 0 : uploadResp.results) ? uploadResp.results.find((entry) => entry === null || entry === void 0 ? void 0 : entry.media_id) : null;
            const mediaId = (firstResult === null || firstResult === void 0 ? void 0 : firstResult.media_id) ? String(firstResult.media_id) : '';
            if (!mediaId) {
                throw new Error('Upload did not return media id');
            }
            const updated = yield updateGroup(apiAccessToken, safeGroupId, { avatar_media_id: mediaId });
            setGroup((prev) => {
                var _a;
                if (!prev)
                    return (_a = updated === null || updated === void 0 ? void 0 : updated.group) !== null && _a !== void 0 ? _a : prev;
                return (updated === null || updated === void 0 ? void 0 : updated.group) ? Object.assign(Object.assign({}, prev), updated.group) : prev;
            });
            try {
                const iconMedia = yield getMediaById(apiAccessToken, mediaId);
                const iconRaw = (iconMedia === null || iconMedia === void 0 ? void 0 : iconMedia.thumbnail_url) || (iconMedia === null || iconMedia === void 0 ? void 0 : iconMedia.preview_url) || (iconMedia === null || iconMedia === void 0 ? void 0 : iconMedia.full_url) || (iconMedia === null || iconMedia === void 0 ? void 0 : iconMedia.raw_url) || (iconMedia === null || iconMedia === void 0 ? void 0 : iconMedia.original_url) || null;
                const iconAbsolute = toAbsoluteUrl(iconRaw ? String(iconRaw) : null);
                const icon = withAccessToken(iconAbsolute || null);
                setGroupIconUrl(icon || null);
            }
            catch (_2) {
                // ignore follow-up preview refresh failure
            }
        }
        catch (_3) {
            Alert.alert(t('Error'), t('Could not update group picture.'));
        }
        finally {
            setIsUpdatingGroupAvatar(false);
        }
    }), [apiAccessToken, group === null || group === void 0 ? void 0 : group.group_id, isGroupOwner, isUpdatingGroupAvatar, t, toAbsoluteUrl, withAccessToken]);
    const openGroupWebsite = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        const raw = String(groupWebsite || '').trim();
        if (!raw)
            return;
        const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        try {
            yield Linking.openURL(normalized);
        }
        catch (_4) {
            Alert.alert(t('Error'), t('Could not open website.'));
        }
    }), [groupWebsite, t]);
    const localStyles = useMemo(() => StyleSheet.create({
        emptyState: {
            paddingVertical: 24,
            alignItems: 'center',
        },
        emptyText: {
            fontSize: 12,
            color: colors.subTextColor,
        },
        memberRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        memberInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            flex: 1,
        },
        avatar: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.btnBackgroundColor,
        },
        memberName: {
            fontSize: 14,
            color: colors.mainTextColor,
        },
        memberRole: {
            fontSize: 12,
            color: colors.subTextColor,
        },
        followButton: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: colors.primaryColor,
        },
        followButtonAlt: {
            backgroundColor: colors.btnBackgroundColor,
            borderWidth: 1,
            borderColor: colors.primaryColor,
        },
        followText: {
            fontSize: 12,
            color: colors.whiteColor,
        },
        followTextAlt: {
            color: colors.primaryColor,
        },
        eventListCard: {
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 13,
            marginBottom: 12,
            backgroundColor: colors.cardBackground,
        },
        eventListName: {
            fontSize: 13,
            color: colors.mainTextColor,
        },
        eventListMeta: {
            marginTop: 4,
            fontSize: 11,
            color: colors.subTextColor,
        },
        newsTopRow: {
            marginTop: 18,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        newsAddButton: {
            borderRadius: 20,
            backgroundColor: colors.primaryColor,
            paddingHorizontal: 16,
            paddingVertical: 9,
        },
        newsAddButtonText: {
            fontSize: 12,
            color: colors.whiteColor,
        },
        postDeleteButton: {
            marginTop: 10,
            alignSelf: 'flex-start',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.errorColor || '#E14B4B',
            paddingHorizontal: 10,
            paddingVertical: 6,
        },
        postDeleteButtonText: {
            fontSize: 11,
            color: colors.errorColor || '#E14B4B',
        },
        postCardPressable: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        postCardBody: {
            flex: 1,
        },
        postCardThumb: {
            width: 88,
            height: 88,
            borderRadius: 10,
            backgroundColor: colors.btnBackgroundColor,
        },
        postCardFooterRow: {
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
        },
        postTypeChip: {
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
            paddingHorizontal: 10,
            paddingVertical: 5,
        },
        postTypeChipText: {
            fontSize: 11,
            color: colors.primaryColor,
        },
        actionButton: {
            marginTop: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
            paddingVertical: 11,
            alignItems: 'center',
            justifyContent: 'center',
        },
        actionButtonText: {
            fontSize: 13,
            color: colors.primaryColor,
        },
        collectionsHeaderRow: {
            marginTop: 18,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        collectionsManageButton: {
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
            paddingHorizontal: 12,
            paddingVertical: 6,
        },
        collectionsManageButtonText: {
            fontSize: 11,
            color: colors.primaryColor,
        },
        collectionsManageActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        collectionsActionChip: {
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
            paddingHorizontal: 10,
            paddingVertical: 5,
        },
        collectionsActionChipText: {
            fontSize: 11,
            color: colors.primaryColor,
        },
        collectionsCard: {
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: colors.cardBackground,
        },
        collectionsCardTitle: {
            fontSize: 13,
            color: colors.mainTextColor,
        },
        collectionsGrid: {
            marginTop: 10,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'flex-start',
            alignContent: 'flex-start',
        },
        collectionImage: {
            width: 76,
            height: 108,
            borderRadius: 6,
            backgroundColor: colors.btnBackgroundColor,
        },
    }), [colors]);
    return (_jsxs(View, Object.assign({ style: styles.mainContainer, testID: "group-profile-screen" }, { children: [!loading && group ? (_jsx(View, { testID: "e2e-perf-ready-group-profile", style: { position: 'absolute', width: 1, height: 1, opacity: 0 } })) : null, _jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [showBackButton || !hasGroupRelationship ? (_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(Icons.BackArrow, { width: 20, height: 20 }) }))) : (_jsx(View, { style: { width: 44, height: 44 } })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: groupName })), canOpenGroupSwitcher ? (_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => setShowProfileSwitcherModal(true) }, { children: _jsx(User, { size: 24, color: colors.primaryColor, variant: "Linear" }) }))) : (_jsx(View, { style: { width: 44, height: 44 } }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [group ? (_jsxs(View, Object.assign({ style: styles.profileCard }, { children: [_jsxs(View, Object.assign({ style: styles.profileCardHeaderRow }, { children: [_jsx(Text, Object.assign({ style: styles.profileCardHeaderTitle }, { children: groupName })), canManageGroup ? (_jsx(TouchableOpacity, Object.assign({ style: styles.manageShortcutButton, onPress: () => navigation.navigate('GroupManageScreen', { groupId: group === null || group === void 0 ? void 0 : group.group_id }), testID: "group-profile-manage-button" }, { children: _jsx(Text, Object.assign({ style: styles.manageShortcutText }, { children: t('Manage') })) }))) : null] })), _jsx(View, Object.assign({ style: styles.profileInfoContainer }, { children: _jsxs(View, Object.assign({ style: styles.profileAvatarWrap }, { children: [groupIconUrl ? (_jsx(FastImage, { source: { uri: groupIconUrl }, style: styles.profileAvatar })) : (_jsx(View, Object.assign({ style: styles.profileAvatar }, { children: _jsx(Profile2User, { size: 40, color: colors.primaryColor, variant: "Linear" }) }))), isGroupOwner ? (_jsx(TouchableOpacity, Object.assign({ style: [
                                                styles.profileAvatarEditButton,
                                                isUpdatingGroupAvatar ? styles.profileAvatarEditButtonDisabled : null,
                                            ], onPress: handleChangeGroupPicture, disabled: isUpdatingGroupAvatar }, { children: isUpdatingGroupAvatar ? (_jsx(ActivityIndicator, { size: "small", color: colors.whiteColor })) : (_jsx(Edit2, { size: 14, color: "#FFFFFF", variant: "Linear" })) }))) : null] })) })), _jsxs(View, Object.assign({ style: styles.statsRow }, { children: [_jsxs(View, Object.assign({ style: styles.statItem }, { children: [_jsx(Text, Object.assign({ style: styles.statValue }, { children: displayedMemberCount })), _jsx(Text, Object.assign({ style: styles.statLabel }, { children: t('Members') }))] })), _jsx(View, { style: styles.statDivider }), _jsxs(View, Object.assign({ style: styles.statItem }, { children: [_jsx(Text, Object.assign({ style: styles.statValue }, { children: Number((_k = group === null || group === void 0 ? void 0 : group.likes_count) !== null && _k !== void 0 ? _k : 0) })), _jsx(Text, Object.assign({ style: styles.statLabel }, { children: t('likes') }))] })), _jsx(View, { style: styles.statDivider }), _jsxs(View, Object.assign({ style: styles.statItem }, { children: [_jsx(Text, Object.assign({ style: styles.statValue }, { children: Number((_l = group === null || group === void 0 ? void 0 : group.followers_count) !== null && _l !== void 0 ? _l : 0) })), _jsx(Text, Object.assign({ style: styles.statLabel }, { children: t('Followers') }))] }))] })), _jsxs(View, Object.assign({ style: styles.bioSection }, { children: [_jsx(Text, Object.assign({ style: styles.bioText }, { children: groupDescription })), _jsx(View, Object.assign({ style: styles.groupFocusSection }, { children: _jsx(View, Object.assign({ style: styles.groupFocusInlineBox }, { children: groupFocuses.map((focusId) => (_jsxs(View, Object.assign({ style: styles.groupFocusChip }, { children: [_jsx(SportFocusIcon, { focusId: focusId, size: 16, color: colors.primaryColor }), _jsx(Text, Object.assign({ style: styles.groupFocusChipText }, { children: getSportFocusLabel(focusId, t) }))] }), `focus-chip-${focusId}`))) })) })), (coaches.length > 0 || manualCoachNames.length > 0) ? (_jsxs(Text, Object.assign({ style: [styles.bioText, { marginTop: 10 }] }, { children: [t('Coaches'), ": ", Array.from(new Set([
                                                ...manualCoachNames,
                                                ...coaches.map((c) => String(c.display_name || '').trim()).filter(Boolean),
                                            ])).join(', ')] }))) : null, groupWebsite.length > 0 ? (_jsx(TouchableOpacity, Object.assign({ style: styles.websiteContainer, activeOpacity: 0.85, onPress: openGroupWebsite }, { children: _jsx(Text, Object.assign({ style: [styles.websiteText, { color: colors.primaryColor, textDecorationLine: 'underline' }], numberOfLines: 1 }, { children: groupWebsite })) }))) : null, _jsx(View, { style: styles.bioDivider })] }))] }))) : null, group ? (_jsx(View, Object.assign({ style: styles.toggleTabBar }, { children: [
                            { id: 'news', label: t('News'), icon: _jsx(DocumentText, { size: 16, color: activeTab === 'news' ? colors.primaryColor : colors.grayColor, variant: "Linear" }) },
                            { id: 'members', label: t('Members'), icon: _jsx(Profile2User, { size: 16, color: activeTab === 'members' ? colors.primaryColor : colors.grayColor, variant: "Linear" }) },
                            { id: 'competitions', label: t('Competitions'), icon: _jsx(MedalStar, { size: 16, color: activeTab === 'competitions' ? colors.primaryColor : colors.grayColor, variant: "Linear" }) },
                            { id: 'collections', label: t('Collections'), icon: _jsx(Gallery, { size: 16, color: activeTab === 'collections' ? colors.primaryColor : colors.grayColor, variant: "Linear" }) },
                        ].map((tab) => (_jsxs(TouchableOpacity, Object.assign({ style: [styles.toggleTab, activeTab === tab.id && styles.toggleTabActive], onPress: () => setActiveTab(tab.id) }, { children: [tab.icon, _jsx(Text, Object.assign({ style: activeTab === tab.id ? styles.toggleTabTextActive : styles.toggleTabText, numberOfLines: 1, ellipsizeMode: "tail" }, { children: tab.label }))] }), tab.id))) }))) : null, loading ? (_jsx(View, Object.assign({ style: localStyles.emptyState }, { children: _jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }) }))) : null, !loading && group && activeTab === 'members' ? (_jsx(View, { children: membersWithDisplayRoles.length === 0 ? (_jsx(View, Object.assign({ style: localStyles.emptyState }, { children: _jsx(Text, Object.assign({ style: localStyles.emptyText }, { children: t('No members yet') })) }))) : (membersWithDisplayRoles.map((member) => {
                            const avatarUrl = member.avatar_url ? toAbsoluteUrl(String(member.avatar_url)) : null;
                            const isSelf = viewerProfileId && String(member.profile_id) === String(viewerProfileId);
                            const permissionRole = String(member.permission_role || member.role || '').toLowerCase();
                            const badges = [
                                ...(permissionRole === 'owner' ? [t('Owner')] : []),
                                ...(permissionRole === 'admin' ? [t('Admin')] : []),
                                ...member.displayRoles.map((role) => t(role === 'coach' ? 'Coach' : role === 'physio' ? 'Physio' : 'Athlete')),
                            ];
                            return (_jsxs(View, Object.assign({ style: localStyles.memberRow }, { children: [_jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.85, style: localStyles.memberInfo, onPress: () => {
                                            const safeProfileId = String(member.profile_id || '').trim();
                                            if (!safeProfileId)
                                                return;
                                            if (viewerProfileId && safeProfileId === String(viewerProfileId)) {
                                                navigation.navigate('UserProfileScreen');
                                                return;
                                            }
                                            navigation.navigate('ViewUserProfileScreen', { profileId: safeProfileId });
                                        } }, { children: [avatarUrl ? _jsx(FastImage, { source: { uri: avatarUrl }, style: localStyles.avatar }) : _jsx(View, { style: localStyles.avatar }), _jsxs(View, { children: [_jsx(Text, Object.assign({ style: localStyles.memberName }, { children: member.display_name || t('Member') })), _jsx(View, Object.assign({ style: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 } }, { children: badges.length > 0 ? (badges.map((badge, index) => (_jsx(View, Object.assign({ style: {
                                                                borderWidth: 1,
                                                                borderColor: colors.primaryColor,
                                                                backgroundColor: colors.secondaryBlueColor,
                                                                borderRadius: 999,
                                                                paddingHorizontal: 8,
                                                                paddingVertical: 3,
                                                            } }, { children: _jsx(Text, Object.assign({ style: { color: colors.primaryColor, fontSize: 11 } }, { children: badge })) }), `${member.profile_id}-tag-${badge}-${index}`)))) : (_jsx(Text, Object.assign({ style: localStyles.memberRole }, { children: permissionRole === 'admin' ? t('Admin') : t('Member') }))) }))] })] })), !isSelf ? (_jsx(TouchableOpacity, Object.assign({ style: [localStyles.followButton, member.is_following && localStyles.followButtonAlt], disabled: Boolean(followBusyByProfile[String(member.profile_id)]), onPress: () => handleToggleFollow(member) }, { children: followBusyByProfile[String(member.profile_id)] ? (_jsx(ActivityIndicator, { size: "small", color: member.is_following ? colors.primaryColor : colors.whiteColor })) : (_jsx(Text, Object.assign({ style: [localStyles.followText, member.is_following && localStyles.followTextAlt] }, { children: member.is_following ? t('Following') : t('Follow') }))) }))) : null] }), String(member.profile_id)));
                        })) })) : null, !loading && group && activeTab === 'news' ? (_jsxs(View, { children: [_jsxs(View, Object.assign({ style: localStyles.newsTopRow }, { children: [_jsx(Text, Object.assign({ style: styles.bioTitle }, { children: t('News') })), canManageGroup ? (_jsx(TouchableOpacity, Object.assign({ style: localStyles.newsAddButton, onPress: () => navigation.navigate('ProfileBlogEditorScreen', { mode: 'add', groupId: String(group.group_id) }), testID: "group-profile-add-blog" }, { children: _jsx(Text, Object.assign({ style: localStyles.newsAddButtonText }, { children: t('Add blog') })) }))) : null] })), groupNews.length === 0 ? (_jsx(View, Object.assign({ style: localStyles.emptyState }, { children: _jsx(Text, Object.assign({ style: localStyles.emptyText }, { children: t('No news yet.') })) }))) : (groupNews.map((post) => (_jsx(View, Object.assign({ style: localStyles.eventListCard, testID: `group-post-card-${String(post.id)}` }, { children: _jsxs(TouchableOpacity, Object.assign({ style: localStyles.postCardPressable, activeOpacity: 0.85, onPress: () => navigation.navigate('ViewUserBlogDetailsScreen', { postId: String(post.id), postPreview: post }) }, { children: [(() => {
                                            var _a, _b, _c, _d, _e;
                                            const coverRaw = ((_a = post.cover_media) === null || _a === void 0 ? void 0 : _a.thumbnail_url) ||
                                                ((_b = post.cover_media) === null || _b === void 0 ? void 0 : _b.preview_url) ||
                                                ((_c = post.cover_media) === null || _c === void 0 ? void 0 : _c.full_url) ||
                                                ((_d = post.cover_media) === null || _d === void 0 ? void 0 : _d.raw_url) ||
                                                ((_e = post.cover_media) === null || _e === void 0 ? void 0 : _e.original_url) ||
                                                null;
                                            const coverAbsolute = coverRaw ? toAbsoluteUrl(String(coverRaw)) : null;
                                            const coverUrl = withAccessToken(coverAbsolute || undefined) || coverAbsolute;
                                            return coverUrl ? (_jsx(FastImage, { source: { uri: String(coverUrl) }, style: localStyles.postCardThumb, resizeMode: "cover" })) : (_jsx(View, { style: localStyles.postCardThumb }));
                                        })(), _jsxs(View, Object.assign({ style: localStyles.postCardBody }, { children: [_jsx(Text, Object.assign({ style: localStyles.eventListName }, { children: String(post.title || t('Blog')) })), post.created_at ? _jsx(Text, Object.assign({ style: localStyles.eventListMeta }, { children: String(post.created_at).slice(0, 10) })) : null, post.summary ? (_jsx(Text, Object.assign({ style: localStyles.eventListMeta, numberOfLines: 2 }, { children: String(post.summary) }))) : null, _jsxs(View, Object.assign({ style: localStyles.postCardFooterRow }, { children: [_jsx(View, Object.assign({ style: localStyles.postTypeChip }, { children: _jsx(Text, Object.assign({ style: localStyles.postTypeChipText }, { children: String(post.post_type || 'blog').toLowerCase() === 'video'
                                                                    ? t('Video')
                                                                    : String(post.post_type || 'blog').toLowerCase() === 'photo'
                                                                        ? t('Photo')
                                                                        : t('Blog') })) })), canManageGroup ? (_jsx(TouchableOpacity, Object.assign({ style: localStyles.postDeleteButton, onPress: () => handleDeleteNewsPost(String(post.id)), disabled: Boolean(deletingPostById[String(post.id)]), testID: `group-post-delete-${String(post.id)}` }, { children: deletingPostById[String(post.id)] ? (_jsx(ActivityIndicator, { size: "small", color: colors.errorColor || '#E14B4B' })) : (_jsx(Text, Object.assign({ style: localStyles.postDeleteButtonText }, { children: t('Delete') }))) }))) : null] }))] }))] })) }), String(post.id)))))] })) : null, !loading && group && activeTab === 'competitions' ? (_jsxs(View, { children: [canManageGroup ? (_jsx(TouchableOpacity, Object.assign({ style: localStyles.actionButton, onPress: () => navigation.navigate('GroupCompetitionSelectScreen', { groupId: String(group.group_id) }) }, { children: _jsx(Text, Object.assign({ style: localStyles.actionButtonText }, { children: t('Add athlete to competition') })) }))) : null, _jsx(View, Object.assign({ style: { marginTop: 12 } }, { children: groupCompetitions.length === 0 ? (_jsxs(View, Object.assign({ style: localStyles.emptyState }, { children: [_jsx(Location, { size: 20, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: localStyles.emptyText }, { children: t('No competitions yet') }))] }))) : (groupCompetitions.map((event) => {
                                    var _a;
                                    const eventName = String(event.event_name || t('Competition'));
                                    const formattedEventDate = event.event_date
                                        ? (() => {
                                            const dt = new Date(String(event.event_date));
                                            return Number.isNaN(dt.getTime())
                                                ? String(event.event_date).split('T')[0]
                                                : dt.toLocaleDateString();
                                        })()
                                        : null;
                                    const eventMetaParts = [event.event_location, formattedEventDate].filter(Boolean);
                                    return (_jsxs(TouchableOpacity, Object.assign({ style: localStyles.eventListCard, onPress: () => {
                                            const typeToken = `${eventName} ${String(event.event_location || '')}`.toLowerCase();
                                            navigation.navigate('CompetitionDetailsScreen', {
                                                id: String(event.event_id),
                                                event_id: String(event.event_id),
                                                eventId: String(event.event_id),
                                                name: eventName,
                                                location: event.event_location,
                                                date: event.event_date,
                                                organizingClub: event === null || event === void 0 ? void 0 : event.organizing_club,
                                                competitionType: /road|trail|marathon|veldloop|veldlopen|cross|5k|10k|half|ultra|city\s*run/.test(typeToken)
                                                    ? 'road'
                                                    : 'track',
                                            });
                                        } }, { children: [_jsx(Text, Object.assign({ style: localStyles.eventListName }, { children: eventName })), eventMetaParts.length > 0 ? (_jsx(Text, Object.assign({ style: localStyles.eventListMeta }, { children: eventMetaParts.join(' · ') }))) : null, _jsxs(Text, Object.assign({ style: localStyles.eventListMeta }, { children: [t('Assigned athletes'), ": ", Number((_a = event.assigned_athletes_count) !== null && _a !== void 0 ? _a : 0)] }))] }), String(event.event_id)));
                                })) }))] })) : null, !loading && group && activeTab === 'collections' ? (_jsxs(View, { children: [_jsxs(View, Object.assign({ style: localStyles.collectionsHeaderRow }, { children: [_jsx(Text, Object.assign({ style: styles.bioTitle }, { children: t('Photo collections') })), canManageGroup ? (_jsx(TouchableOpacity, Object.assign({ style: localStyles.collectionsManageButton, onPress: () => navigation.navigate('GroupCollectionsManageScreen', {
                                            groupId: String(group.group_id),
                                            type: 'image',
                                        }) }, { children: _jsx(Text, Object.assign({ style: localStyles.collectionsManageButtonText }, { children: t('Manage') })) }))) : null] })), collectionsLoading ? (_jsx(View, Object.assign({ style: localStyles.emptyState }, { children: _jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }) }))) : (_jsxs(View, Object.assign({ style: localStyles.collectionsCard }, { children: [_jsx(Text, Object.assign({ style: localStyles.collectionsCardTitle }, { children: ((_m = photoCollection.collection) === null || _m === void 0 ? void 0 : _m.name) || t('Photo collections') })), photoCollection.items.length === 0 ? (_jsx(View, Object.assign({ style: localStyles.emptyState }, { children: _jsx(Text, Object.assign({ style: localStyles.emptyText }, { children: t('No collections yet.') })) }))) : (_jsx(View, Object.assign({ style: localStyles.collectionsGrid }, { children: photoCollection.items.slice(0, 4).map((item) => {
                                            const thumb = toAbsoluteUrl(String(item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || item.original_url || ''));
                                            const thumbUrl = withAccessToken(thumb || undefined) || thumb;
                                            return (_jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.85, onPress: () => {
                                                    var _a;
                                                    return navigation.navigate('PhotoDetailScreen', {
                                                        eventTitle: ((_a = photoCollection.collection) === null || _a === void 0 ? void 0 : _a.name) || t('Collection'),
                                                        media: { id: item.media_id, type: 'photo' },
                                                    });
                                                } }, { children: thumbUrl ? (_jsx(FastImage, { source: { uri: String(thumbUrl) }, style: localStyles.collectionImage })) : (_jsx(View, { style: localStyles.collectionImage })) }), String(item.media_id)));
                                        }) })))] }))), _jsxs(View, Object.assign({ style: localStyles.collectionsHeaderRow }, { children: [_jsx(Text, Object.assign({ style: styles.bioTitle }, { children: t('Video collections') })), canManageGroup ? (_jsx(TouchableOpacity, Object.assign({ style: localStyles.collectionsManageButton, onPress: () => navigation.navigate('GroupCollectionsManageScreen', {
                                            groupId: String(group.group_id),
                                            type: 'video',
                                        }) }, { children: _jsx(Text, Object.assign({ style: localStyles.collectionsManageButtonText }, { children: t('Manage') })) }))) : null] })), collectionsLoading ? (_jsx(View, Object.assign({ style: localStyles.emptyState }, { children: _jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }) }))) : (_jsxs(View, Object.assign({ style: localStyles.collectionsCard }, { children: [_jsx(Text, Object.assign({ style: localStyles.collectionsCardTitle }, { children: ((_o = videoCollection.collection) === null || _o === void 0 ? void 0 : _o.name) || t('Video collections') })), videoCollection.items.length === 0 ? (_jsx(View, Object.assign({ style: localStyles.emptyState }, { children: _jsx(Text, Object.assign({ style: localStyles.emptyText }, { children: t('No collections yet.') })) }))) : (_jsx(View, Object.assign({ style: localStyles.collectionsGrid }, { children: videoCollection.items.slice(0, 4).map((item) => {
                                            const thumb = toAbsoluteUrl(String(item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || item.original_url || ''));
                                            const thumbUrl = withAccessToken(thumb || undefined) || thumb;
                                            return (_jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.85, onPress: () => {
                                                    var _a;
                                                    return navigation.navigate('PhotoDetailScreen', {
                                                        eventTitle: ((_a = videoCollection.collection) === null || _a === void 0 ? void 0 : _a.name) || t('Collection'),
                                                        media: { id: item.media_id, type: 'video' },
                                                    });
                                                } }, { children: thumbUrl ? (_jsx(FastImage, { source: { uri: String(thumbUrl) }, style: localStyles.collectionImage })) : (_jsx(View, { style: localStyles.collectionImage })) }), String(item.media_id)));
                                        }) })))] })))] })) : null, _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ visible: showProfileSwitcherModal, transparent: true, animationType: "fade", onRequestClose: () => setShowProfileSwitcherModal(false) }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.profileSwitcherBackdrop, activeOpacity: 1, onPress: () => setShowProfileSwitcherModal(false) }, { children: _jsxs(TouchableOpacity, Object.assign({ activeOpacity: 1, onPress: () => { }, style: styles.profileSwitcherSheet }, { children: [_jsx(View, { style: styles.profileSwitcherHandle }), _jsx(Text, Object.assign({ style: styles.profileSwitcherTitle }, { children: t('Switch profile') })), _jsx(SizeBox, { height: 8 }), viewerSportFocuses.map((focusId) => (_jsxs(TouchableOpacity, Object.assign({ style: styles.profileSwitcherRow, onPress: () => {
                                    setShowProfileSwitcherModal(false);
                                    navigation.navigate('BottomTabBar', {
                                        screen: 'Profile',
                                        params: {
                                            screen: 'UserProfileScreen',
                                            params: { forceProfileCategory: focusId },
                                        },
                                    });
                                } }, { children: [_jsx(View, Object.assign({ style: styles.profileSwitcherAvatar }, { children: _jsx(SportFocusIcon, { focusId: focusId, size: 20, color: colors.primaryColor }) })), _jsx(Text, Object.assign({ style: styles.profileSwitcherLabel }, { children: getSportFocusLabel(focusId, t) })), _jsx(Text, { style: styles.profileSwitcherCheck })] }), `switch-focus-${focusId}`))), myGroups.map((item) => (_jsxs(TouchableOpacity, Object.assign({ style: [
                                    styles.profileSwitcherRow,
                                    String(groupId || '') === item.id ? styles.profileSwitcherRowActive : null,
                                ], onPress: () => {
                                    setShowProfileSwitcherModal(false);
                                    if (String(groupId || '') !== item.id) {
                                        setGroupId(item.id);
                                        setActiveTab('news');
                                    }
                                } }, { children: [_jsx(View, Object.assign({ style: styles.profileSwitcherAvatar }, { children: _jsx(Icons.GroupColorful, { width: 18, height: 18 }) })), _jsx(Text, Object.assign({ style: styles.profileSwitcherLabel }, { children: item.name || t('Group') })), _jsx(Text, Object.assign({ style: styles.profileSwitcherCheck }, { children: String(groupId || '') === item.id ? '✓' : '' }))] }), `switch-group-${item.id}`))), _jsxs(TouchableOpacity, Object.assign({ style: [styles.profileSwitcherRow, styles.profileSwitcherAddRow], onPress: () => {
                                    setShowProfileSwitcherModal(false);
                                    navigation.navigate('CategorySelectionScreen', { fromAddFlow: true });
                                } }, { children: [_jsx(View, Object.assign({ style: styles.profileSwitcherAvatarAdd }, { children: _jsx(Text, Object.assign({ style: styles.profileSwitcherPlus }, { children: "+" })) })), _jsx(Text, Object.assign({ style: styles.profileSwitcherAddLabel }, { children: t('Add') })), _jsx(Text, { style: styles.profileSwitcherCheck })] })), _jsx(SizeBox, { height: Math.max(insets.bottom, 8) })] })) })) }))] })));
};
export default GroupProfileScreen;
