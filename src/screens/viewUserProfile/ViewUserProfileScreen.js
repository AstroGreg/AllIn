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
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Dimensions, Linking, Alert } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from '../userProfile/UserProfileStyles';
import { ArrowLeft2, Clock, DocumentText, Gallery } from 'iconsax-react-nativejs';
import ProfileTimeline from '../../components/profileTimeline/ProfileTimeline';
import { useAuth } from '../../context/AuthContext';
import { followProfile, getPosts, getProfileCollections, getProfileSummary, getProfileSummaryById, getProfileTimeline, unfollowProfile, } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next';
import ProfileNewsSection from '../../components/profileNews/ProfileNewsSection';
import SportFocusIcon from '../../components/profile/SportFocusIcon';
import SupportProfileSummary, { getSupportProfileBadgeLabel } from '../../components/profile/SupportProfileSummary';
import { focusUsesChestNumbers, getDisciplineLabel, getMainDisciplineForFocus, getProfileCollectionScopeKey, getSportFocusLabel, normalizeMainDisciplines, normalizeProfileModeId, normalizeSelectedEvents, } from '../../utils/profileSelections';
const ViewUserProfileScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const [profileTab, setProfileTab] = useState('timeline');
    const [activeTab, setActiveTab] = useState('photos');
    const [timelineItems, setTimelineItems] = useState([]);
    const [collections, setCollections] = useState([]);
    const [posts, setPosts] = useState([]);
    const [summary, setSummary] = useState(null);
    const [viewerProfileId, setViewerProfileId] = useState(null);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);
    const profileId = useMemo(() => {
        var _a, _b, _c, _d;
        const fromParams = (_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.profileId) !== null && _b !== void 0 ? _b : (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.profile_id;
        const user = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.user;
        const resolved = fromParams ||
            (user === null || user === void 0 ? void 0 : user.profile_id) ||
            (user === null || user === void 0 ? void 0 : user.profileId) ||
            (user === null || user === void 0 ? void 0 : user.id) ||
            (user === null || user === void 0 ? void 0 : user.user_id) ||
            null;
        return resolved ? String(resolved) : null;
    }, [(_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.profileId, (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.profile_id, (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.user]);
    const isInitialLoading = summary === null;
    const isSignedUrl = useCallback((value) => {
        if (!value)
            return false;
        const lower = String(value).toLowerCase();
        return (lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp='));
    }, []);
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
            return undefined;
        if (!apiAccessToken)
            return value;
        if (isSignedUrl(value))
            return value;
        if (value.includes('access_token='))
            return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);
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
    useEffect(() => {
        let mounted = true;
        const load = () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            if (!apiAccessToken || !profileId) {
                if (mounted) {
                    setTimelineItems([]);
                    setCollections([]);
                    setPosts([]);
                    setSummary(null);
                }
                return;
            }
            const [summaryResult, timelineResult, postsResult] = yield Promise.allSettled([
                getProfileSummaryById(apiAccessToken, String(profileId)),
                getProfileTimeline(apiAccessToken, String(profileId)),
                getPosts(apiAccessToken, {
                    author_profile_id: String(profileId),
                    limit: 50,
                    include_original: false,
                }),
            ]);
            const loadedSummary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
            if (mounted) {
                setSummary(loadedSummary);
            }
            if (timelineResult.status === 'fulfilled') {
                const items = Array.isArray((_a = timelineResult.value) === null || _a === void 0 ? void 0 : _a.items) ? timelineResult.value.items : [];
                const mapped = items.map((it) => {
                    var _a, _b, _c, _d, _e;
                    return ({
                        id: String(it.id),
                        year: String((_a = it === null || it === void 0 ? void 0 : it.year) !== null && _a !== void 0 ? _a : ''),
                        title: String((_b = it === null || it === void 0 ? void 0 : it.title) !== null && _b !== void 0 ? _b : ''),
                        description: (_c = it === null || it === void 0 ? void 0 : it.description) !== null && _c !== void 0 ? _c : '',
                        highlight: (_d = it === null || it === void 0 ? void 0 : it.highlight) !== null && _d !== void 0 ? _d : '',
                        photos: [],
                        linkedBlogs: [],
                        linkedCompetitions: [],
                        coverImage: (_e = it === null || it === void 0 ? void 0 : it.cover_thumbnail_url) !== null && _e !== void 0 ? _e : null,
                    });
                });
                if (mounted)
                    setTimelineItems(mapped);
            }
            else if (mounted) {
                setTimelineItems([]);
            }
            if (postsResult.status === 'fulfilled') {
                const rawPosts = Array.isArray((_b = postsResult.value) === null || _b === void 0 ? void 0 : _b.posts) ? postsResult.value.posts : [];
                const sortedPosts = [...rawPosts].sort((a, b) => {
                    var _a, _b, _c, _d, _e, _f;
                    const aTime = Date.parse(String((_a = a === null || a === void 0 ? void 0 : a.created_at) !== null && _a !== void 0 ? _a : ''));
                    const bTime = Date.parse(String((_b = b === null || b === void 0 ? void 0 : b.created_at) !== null && _b !== void 0 ? _b : ''));
                    const timeDiff = (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
                    if (timeDiff !== 0)
                        return timeDiff;
                    const titleDiff = String((_c = b === null || b === void 0 ? void 0 : b.title) !== null && _c !== void 0 ? _c : '').localeCompare(String((_d = a === null || a === void 0 ? void 0 : a.title) !== null && _d !== void 0 ? _d : ''), undefined, {
                        numeric: true,
                        sensitivity: 'base',
                    });
                    if (titleDiff !== 0)
                        return titleDiff;
                    return String((_e = b === null || b === void 0 ? void 0 : b.id) !== null && _e !== void 0 ? _e : '').localeCompare(String((_f = a === null || a === void 0 ? void 0 : a.id) !== null && _f !== void 0 ? _f : ''));
                });
                const mapped = sortedPosts.map((entry) => {
                    var _a;
                    const cover = (entry === null || entry === void 0 ? void 0 : entry.cover_media) || null;
                    const coverCandidate = (cover === null || cover === void 0 ? void 0 : cover.thumbnail_url) || (cover === null || cover === void 0 ? void 0 : cover.preview_url) || (cover === null || cover === void 0 ? void 0 : cover.full_url) || (cover === null || cover === void 0 ? void 0 : cover.raw_url) || null;
                    const resolved = coverCandidate ? toAbsoluteUrl(String(coverCandidate)) : null;
                    const coverImage = resolved ? (withAccessToken(resolved) || resolved) : null;
                    return Object.assign(Object.assign({}, entry), { coverImage, mediaId: String((_a = cover === null || cover === void 0 ? void 0 : cover.media_id) !== null && _a !== void 0 ? _a : '').trim() || null, mediaType: (cover === null || cover === void 0 ? void 0 : cover.type) === 'video' ? 'video' : ((cover === null || cover === void 0 ? void 0 : cover.media_id) ? 'image' : null) });
                });
                if (mounted)
                    setPosts(mapped);
            }
            else if (mounted) {
                setPosts([]);
            }
            try {
                const summaryProfile = (_c = loadedSummary === null || loadedSummary === void 0 ? void 0 : loadedSummary.profile) !== null && _c !== void 0 ? _c : {};
                const selectedEvents = normalizeSelectedEvents((_d = summaryProfile === null || summaryProfile === void 0 ? void 0 : summaryProfile.selected_events) !== null && _d !== void 0 ? _d : []);
                const supportFocuses = normalizeSelectedEvents((_e = summaryProfile === null || summaryProfile === void 0 ? void 0 : summaryProfile.support_focuses) !== null && _e !== void 0 ? _e : []);
                const supportExists = String((_f = summaryProfile === null || summaryProfile === void 0 ? void 0 : summaryProfile.support_role) !== null && _f !== void 0 ? _f : '').trim().length > 0 ||
                    supportFocuses.length > 0 ||
                    (Array.isArray(summaryProfile === null || summaryProfile === void 0 ? void 0 : summaryProfile.support_club_codes) && summaryProfile.support_club_codes.length > 0) ||
                    (Array.isArray(summaryProfile === null || summaryProfile === void 0 ? void 0 : summaryProfile.support_group_ids) && summaryProfile.support_group_ids.length > 0) ||
                    (Array.isArray(summaryProfile === null || summaryProfile === void 0 ? void 0 : summaryProfile.support_athlete_profile_ids) && summaryProfile.support_athlete_profile_ids.length > 0);
                const scopeFocus = (_g = selectedEvents[0]) !== null && _g !== void 0 ? _g : (supportExists ? 'support' : null);
                const c = yield getProfileCollections(apiAccessToken, String(profileId), {
                    limit: 50,
                    scope_key: scopeFocus ? getProfileCollectionScopeKey(scopeFocus) : 'default',
                });
                if (mounted)
                    setCollections(Array.isArray(c === null || c === void 0 ? void 0 : c.collections) ? c.collections : []);
            }
            catch (_h) {
                if (mounted)
                    setCollections([]);
            }
        });
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, profileId, toAbsoluteUrl, withAccessToken]);
    const targetProfileId = useMemo(() => {
        var _a, _b;
        const value = String((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile_id) !== null && _a !== void 0 ? _a : profileId) !== null && _b !== void 0 ? _b : '').trim();
        return value.length > 0 ? value : null;
    }, [profileId, summary === null || summary === void 0 ? void 0 : summary.profile_id]);
    const isOwnProfile = useMemo(() => {
        const viewerId = String(viewerProfileId || '').trim();
        const targetId = String(targetProfileId || '').trim();
        return viewerId.length > 0 && targetId.length > 0 && viewerId === targetId;
    }, [targetProfileId, viewerProfileId]);
    const followAllowed = useMemo(() => {
        if (!(summary === null || summary === void 0 ? void 0 : summary.profile_id) || !targetProfileId)
            return false;
        return !isOwnProfile;
    }, [isOwnProfile, summary === null || summary === void 0 ? void 0 : summary.profile_id, targetProfileId]);
    const handleToggleFollow = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !targetProfileId || !summary || isUpdatingFollow)
            return;
        setIsUpdatingFollow(true);
        try {
            if (summary === null || summary === void 0 ? void 0 : summary.is_following) {
                yield unfollowProfile(apiAccessToken, targetProfileId);
                setSummary((prev) => { var _a; return (prev ? Object.assign(Object.assign({}, prev), { is_following: false, followers_count: Math.max(0, ((_a = prev.followers_count) !== null && _a !== void 0 ? _a : 0) - 1) }) : prev); });
            }
            else {
                yield followProfile(apiAccessToken, targetProfileId);
                setSummary((prev) => { var _a; return (prev ? Object.assign(Object.assign({}, prev), { is_following: true, followers_count: ((_a = prev.followers_count) !== null && _a !== void 0 ? _a : 0) + 1 }) : prev); });
            }
        }
        finally {
            setIsUpdatingFollow(false);
        }
    });
    const profileImageUrl = useMemo(() => {
        var _a, _b, _c;
        const avatarMedia = (_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.avatar_media) !== null && _b !== void 0 ? _b : null;
        const avatarCandidate = (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.thumbnail_url) ||
            (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.preview_url) ||
            (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.full_url) ||
            (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.raw_url) ||
            (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.original_url) ||
            ((_c = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _c === void 0 ? void 0 : _c.avatar_url) ||
            null;
        if (!avatarCandidate)
            return null;
        const resolved = toAbsoluteUrl(String(avatarCandidate));
        return withAccessToken(resolved) || resolved;
    }, [summary === null || summary === void 0 ? void 0 : summary.profile, toAbsoluteUrl, withAccessToken]);
    const displayName = ((_d = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _d === void 0 ? void 0 : _d.display_name) || t('Profile');
    const displayHandle = useMemo(() => {
        var _a, _b;
        const raw = String((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.username) !== null && _b !== void 0 ? _b : '').trim().replace(/^@+/, '');
        if (!raw)
            return '';
        return raw.replace(/\s+/g, '');
    }, [(_e = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _e === void 0 ? void 0 : _e.username]);
    const bioText = useMemo(() => {
        var _a, _b;
        const raw = String((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.bio) !== null && _b !== void 0 ? _b : '').trim();
        if (!raw)
            return t('No bio added yet.');
        const normalizedRaw = raw.replace(/^@+/, '').trim().toLowerCase();
        const normalizedHandle = displayHandle.trim().toLowerCase();
        if (normalizedHandle.length > 0 && normalizedRaw === normalizedHandle) {
            return t('No bio added yet.');
        }
        return raw;
    }, [displayHandle, (_f = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _f === void 0 ? void 0 : _f.bio, t]);
    const selectedFocuses = useMemo(() => { var _a, _b; return normalizeSelectedEvents((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.selected_events) !== null && _b !== void 0 ? _b : []); }, [(_g = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _g === void 0 ? void 0 : _g.selected_events]);
    const hasSupportProfile = useMemo(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return (String((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.support_role) !== null && _b !== void 0 ? _b : '').trim().length > 0 ||
            (Array.isArray((_c = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _c === void 0 ? void 0 : _c.support_club_codes) && ((_d = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _d === void 0 ? void 0 : _d.support_club_codes.length) > 0) ||
            (Array.isArray((_e = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _e === void 0 ? void 0 : _e.support_group_ids) && ((_f = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _f === void 0 ? void 0 : _f.support_group_ids.length) > 0) ||
            (Array.isArray((_g = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _g === void 0 ? void 0 : _g.support_athlete_profile_ids) && ((_h = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _h === void 0 ? void 0 : _h.support_athlete_profile_ids.length) > 0) ||
            (Array.isArray((_j = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _j === void 0 ? void 0 : _j.support_focuses) && ((_k = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _k === void 0 ? void 0 : _k.support_focuses.length) > 0));
    }, [summary === null || summary === void 0 ? void 0 : summary.profile]);
    const activeFocus = useMemo(() => {
        var _a;
        const forced = normalizeProfileModeId((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.forceProfileCategory);
        if (forced === 'support' && hasSupportProfile)
            return 'support';
        if (forced && forced !== 'support' && selectedFocuses.includes(forced))
            return forced;
        if (selectedFocuses.length > 0)
            return selectedFocuses[0];
        if (hasSupportProfile)
            return 'support';
        return null;
    }, [hasSupportProfile, (_h = route === null || route === void 0 ? void 0 : route.params) === null || _h === void 0 ? void 0 : _h.forceProfileCategory, selectedFocuses]);
    const profileCategoryLabel = activeFocus ? (activeFocus === 'support' ? t('Support') : getSportFocusLabel(activeFocus, t)) : '';
    const currentYear = useMemo(() => String(new Date().getFullYear()), []);
    const currentChestNumber = useMemo(() => {
        var _a, _b, _c;
        const raw = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.chest_numbers_by_year;
        if (!raw || typeof raw !== 'object')
            return '';
        const byYear = raw;
        const thisYear = String((_b = byYear[currentYear]) !== null && _b !== void 0 ? _b : '').trim();
        if (thisYear)
            return thisYear;
        const latestYear = Object.keys(byYear)
            .filter((year) => /^\d{4}$/.test(String(year)))
            .sort((a, b) => Number(b) - Number(a))
            .find((year) => { var _a; return String((_a = byYear[year]) !== null && _a !== void 0 ? _a : '').trim().length > 0; });
        if (!latestYear)
            return '';
        return String((_c = byYear[latestYear]) !== null && _c !== void 0 ? _c : '').trim();
    }, [currentYear, summary === null || summary === void 0 ? void 0 : summary.profile]);
    const normalizeMembership = useCallback((entry) => {
        var _a, _b, _c, _d, _e;
        if (!entry || typeof entry !== 'object')
            return null;
        const groupId = String((_a = entry === null || entry === void 0 ? void 0 : entry.group_id) !== null && _a !== void 0 ? _a : '').trim();
        const name = String((_b = entry === null || entry === void 0 ? void 0 : entry.name) !== null && _b !== void 0 ? _b : '').trim();
        if (!groupId || !name)
            return null;
        const location = String((_c = entry === null || entry === void 0 ? void 0 : entry.location) !== null && _c !== void 0 ? _c : '').trim();
        const roleRaw = String((_d = entry === null || entry === void 0 ? void 0 : entry.role) !== null && _d !== void 0 ? _d : '').trim();
        const officialClubCode = String((_e = entry === null || entry === void 0 ? void 0 : entry.official_club_code) !== null && _e !== void 0 ? _e : '').trim();
        const isOfficialClub = Boolean(entry === null || entry === void 0 ? void 0 : entry.is_official_club) || officialClubCode.length > 0;
        return {
            group_id: groupId,
            name,
            location,
            role: roleRaw.length > 0 ? roleRaw : null,
            is_official_club: isOfficialClub,
            official_club_code: officialClubCode.length > 0 ? officialClubCode : null,
        };
    }, []);
    const profileMemberships = useMemo(() => {
        var _a, _b;
        const groups = Array.isArray((_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.groups)
            ? (_b = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _b === void 0 ? void 0 : _b.groups
            : [];
        return groups
            .map((entry) => normalizeMembership(entry))
            .filter((entry) => Boolean(entry))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }, [normalizeMembership, summary === null || summary === void 0 ? void 0 : summary.profile]);
    const communityMemberships = useMemo(() => profileMemberships.filter((entry) => !entry.is_official_club), [profileMemberships]);
    const officialMemberships = useMemo(() => profileMemberships.filter((entry) => entry.is_official_club), [profileMemberships]);
    const trackFieldMainEvent = useMemo(() => { var _a, _b; return String((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.track_field_main_event) !== null && _b !== void 0 ? _b : '').trim(); }, [summary === null || summary === void 0 ? void 0 : summary.profile]);
    const roadTrailMainEvent = useMemo(() => { var _a, _b; return String((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.road_trail_main_event) !== null && _b !== void 0 ? _b : '').trim(); }, [summary === null || summary === void 0 ? void 0 : summary.profile]);
    const nationality = useMemo(() => { var _a, _b; return String((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.nationality) !== null && _b !== void 0 ? _b : '').trim(); }, [summary === null || summary === void 0 ? void 0 : summary.profile]);
    const website = useMemo(() => { var _a, _b; return String((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.website) !== null && _b !== void 0 ? _b : '').trim(); }, [summary === null || summary === void 0 ? void 0 : summary.profile]);
    const supportRole = useMemo(() => { var _a, _b; return String((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.support_role) !== null && _b !== void 0 ? _b : '').trim(); }, [summary === null || summary === void 0 ? void 0 : summary.profile]);
    const supportProfileBadgeLabel = useMemo(() => getSupportProfileBadgeLabel(supportRole, t), [supportRole, t]);
    const supportFocuses = useMemo(() => { var _a, _b; return normalizeSelectedEvents((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.support_focuses) !== null && _b !== void 0 ? _b : []); }, [summary === null || summary === void 0 ? void 0 : summary.profile]);
    const supportClubs = useMemo(() => {
        var _a, _b;
        const hydrated = Array.isArray((_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.support_clubs)
            ? (_b = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _b === void 0 ? void 0 : _b.support_clubs
            : [];
        return hydrated
            .map((club) => {
            var _a, _b, _c, _d;
            const code = String((_a = club === null || club === void 0 ? void 0 : club.code) !== null && _a !== void 0 ? _a : '').trim().toUpperCase();
            const name = String((_b = club === null || club === void 0 ? void 0 : club.name) !== null && _b !== void 0 ? _b : '').trim();
            if (!code || !name)
                return null;
            return {
                id: code,
                title: name,
                subtitle: [String((_c = club === null || club === void 0 ? void 0 : club.city) !== null && _c !== void 0 ? _c : '').trim(), String((_d = club === null || club === void 0 ? void 0 : club.federation) !== null && _d !== void 0 ? _d : '').trim()].filter(Boolean).join(' · '),
            };
        })
            .filter(Boolean);
    }, [summary === null || summary === void 0 ? void 0 : summary.profile]);
    const supportGroups = useMemo(() => {
        var _a, _b;
        const hydrated = Array.isArray((_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.support_groups)
            ? (_b = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _b === void 0 ? void 0 : _b.support_groups
            : [];
        return hydrated
            .map((group) => {
            var _a, _b, _c, _d;
            const id = String((_a = group === null || group === void 0 ? void 0 : group.group_id) !== null && _a !== void 0 ? _a : '').trim();
            const name = String((_b = group === null || group === void 0 ? void 0 : group.name) !== null && _b !== void 0 ? _b : '').trim();
            if (!id || !name)
                return null;
            return {
                id,
                title: name,
                subtitle: [String((_c = group === null || group === void 0 ? void 0 : group.role) !== null && _c !== void 0 ? _c : '').trim(), String((_d = group === null || group === void 0 ? void 0 : group.location) !== null && _d !== void 0 ? _d : '').trim()].filter(Boolean).join(' · '),
            };
        })
            .filter(Boolean);
    }, [summary === null || summary === void 0 ? void 0 : summary.profile]);
    const directTrackFieldClub = useMemo(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const hydrated = (_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.track_field_club_detail) !== null && _b !== void 0 ? _b : null;
        const hydratedName = String((_c = hydrated === null || hydrated === void 0 ? void 0 : hydrated.name) !== null && _c !== void 0 ? _c : '').trim();
        const raw = String((_e = (_d = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _d === void 0 ? void 0 : _d.track_field_club) !== null && _e !== void 0 ? _e : '').trim();
        const title = hydratedName || raw;
        if (!title)
            return null;
        return {
            id: String((_f = hydrated === null || hydrated === void 0 ? void 0 : hydrated.code) !== null && _f !== void 0 ? _f : raw).trim() || title,
            title,
            subtitle: [String((_g = hydrated === null || hydrated === void 0 ? void 0 : hydrated.city) !== null && _g !== void 0 ? _g : '').trim(), String((_h = hydrated === null || hydrated === void 0 ? void 0 : hydrated.federation) !== null && _h !== void 0 ? _h : '').trim()].filter(Boolean).join(' · '),
        };
    }, [summary === null || summary === void 0 ? void 0 : summary.profile]);
    const runningClubGroup = useMemo(() => {
        var _a, _b, _c, _d, _e, _f;
        const hydrated = (_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.running_club_group) !== null && _b !== void 0 ? _b : null;
        const groupId = String((_c = hydrated === null || hydrated === void 0 ? void 0 : hydrated.group_id) !== null && _c !== void 0 ? _c : '').trim();
        const name = String((_d = hydrated === null || hydrated === void 0 ? void 0 : hydrated.name) !== null && _d !== void 0 ? _d : '').trim();
        if (!groupId || !name)
            return null;
        return {
            id: groupId,
            title: name,
            subtitle: [String((_e = hydrated === null || hydrated === void 0 ? void 0 : hydrated.role) !== null && _e !== void 0 ? _e : '').trim(), String((_f = hydrated === null || hydrated === void 0 ? void 0 : hydrated.location) !== null && _f !== void 0 ? _f : '').trim()].filter(Boolean).join(' · '),
        };
    }, [summary === null || summary === void 0 ? void 0 : summary.profile]);
    const mainDisciplines = useMemo(() => {
        var _a, _b;
        return normalizeMainDisciplines((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.main_disciplines) !== null && _b !== void 0 ? _b : {}, {
            trackFieldMainEvent,
            roadTrailMainEvent,
        });
    }, [roadTrailMainEvent, summary === null || summary === void 0 ? void 0 : summary.profile, trackFieldMainEvent]);
    const profileDistance = useMemo(() => {
        if (!activeFocus || activeFocus === 'support')
            return '';
        const disciplineKey = getMainDisciplineForFocus(mainDisciplines, activeFocus, {
            trackFieldMainEvent,
            roadTrailMainEvent,
        });
        if (!disciplineKey)
            return '';
        return getDisciplineLabel(activeFocus, disciplineKey, t);
    }, [activeFocus, mainDisciplines, roadTrailMainEvent, t, trackFieldMainEvent]);
    const athleteActiveFocus = useMemo(() => (activeFocus && activeFocus !== 'support' ? activeFocus : null), [activeFocus]);
    const formatMetaDisplayValue = useCallback((value) => {
        const trimmed = String(value || '').trim();
        if (trimmed.length <= 11)
            return trimmed;
        return `${trimmed.slice(0, 11)}...`;
    }, []);
    const visibleOfficialClubs = useMemo(() => {
        if (activeFocus === 'support')
            return supportClubs;
        const merged = new Map();
        const makeClubKey = (title, subtitle) => `${String(title || '').trim().toLowerCase()}|${String(subtitle || '').trim().toLowerCase()}`;
        officialMemberships.forEach((entry) => {
            var _a;
            const subtitle = [(_a = entry.role) !== null && _a !== void 0 ? _a : '', entry.location].filter(Boolean).join(' · ');
            merged.set(makeClubKey(entry.name, subtitle), {
                id: entry.group_id,
                title: entry.name,
                subtitle,
            });
        });
        if (directTrackFieldClub) {
            const key = makeClubKey(directTrackFieldClub.title, directTrackFieldClub.subtitle);
            if (!merged.has(key)) {
                merged.set(key, directTrackFieldClub);
            }
        }
        return Array.from(merged.values());
    }, [activeFocus, directTrackFieldClub, officialMemberships, supportClubs]);
    const visibleGroups = useMemo(() => {
        if (activeFocus === 'support')
            return supportGroups;
        const merged = new Map();
        communityMemberships.forEach((entry) => {
            var _a;
            merged.set(entry.group_id, {
                id: entry.group_id,
                title: entry.name,
                subtitle: [(_a = entry.role) !== null && _a !== void 0 ? _a : '', entry.location].filter(Boolean).join(' · '),
            });
        });
        if (runningClubGroup)
            merged.set(runningClubGroup.id, runningClubGroup);
        return Array.from(merged.values());
    }, [activeFocus, communityMemberships, runningClubGroup, supportGroups]);
    const singleOfficialClub = visibleOfficialClubs.length === 1 ? visibleOfficialClubs[0] : null;
    const singleCommunityGroup = visibleGroups.length === 1 ? visibleGroups[0] : null;
    const profileMetaItems = useMemo(() => {
        var _a, _b;
        const baseItems = activeFocus === 'support'
            ? []
            : [
                { key: 'nationality', value: nationality },
                { key: 'chest', value: athleteActiveFocus && focusUsesChestNumbers(athleteActiveFocus) ? currentChestNumber : '' },
                { key: 'distance', value: profileDistance },
            ];
        return [
            ...baseItems,
            { key: 'singleClub', value: (_a = singleOfficialClub === null || singleOfficialClub === void 0 ? void 0 : singleOfficialClub.title) !== null && _a !== void 0 ? _a : '' },
            { key: 'singleGroup', value: (_b = singleCommunityGroup === null || singleCommunityGroup === void 0 ? void 0 : singleCommunityGroup.title) !== null && _b !== void 0 ? _b : '' },
        ]
            .map((entry) => (Object.assign(Object.assign({}, entry), { value: formatMetaDisplayValue(String(entry.value || '').trim()) })))
            .filter((entry) => entry.value.length > 0);
    }, [
        activeFocus,
        athleteActiveFocus,
        currentChestNumber,
        formatMetaDisplayValue,
        nationality,
        profileDistance,
        singleCommunityGroup === null || singleCommunityGroup === void 0 ? void 0 : singleCommunityGroup.title,
        singleOfficialClub === null || singleOfficialClub === void 0 ? void 0 : singleOfficialClub.title,
    ]);
    const openProfileWebsite = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        const raw = String(website || '').trim();
        if (!raw)
            return;
        const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        try {
            yield Linking.openURL(normalized);
        }
        catch (_k) {
            Alert.alert(t('Error'), t('Could not open website.'));
        }
    }), [t, website]);
    const photoCollections = useMemo(() => collections.filter((c) => String(c.collection_type || '').toLowerCase() === 'image'), [collections]);
    const videoCollections = useMemo(() => collections.filter((c) => String(c.collection_type || '').toLowerCase() === 'video'), [collections]);
    const visibleCollections = useMemo(() => {
        const list = activeTab === 'photos' ? photoCollections : videoCollections;
        return list.slice(0, 4);
    }, [activeTab, photoCollections, videoCollections]);
    const activityItems = useMemo(() => {
        return posts.map((entry) => {
            var _a, _b;
            return ({
                id: String(entry.id),
                kind: String((_a = entry === null || entry === void 0 ? void 0 : entry.post_type) !== null && _a !== void 0 ? _a : '').trim().toLowerCase() === 'photo'
                    ? 'photo'
                    : String((_b = entry === null || entry === void 0 ? void 0 : entry.post_type) !== null && _b !== void 0 ? _b : '').trim().toLowerCase() === 'video'
                        ? 'video'
                        : 'blog',
                mediaId: (entry === null || entry === void 0 ? void 0 : entry.mediaId) ? String(entry.mediaId) : null,
                mediaType: (entry === null || entry === void 0 ? void 0 : entry.mediaType) === 'video' ? 'video' : (entry === null || entry === void 0 ? void 0 : entry.mediaType) === 'image' ? 'image' : null,
                title: String(entry.title || ''),
                date: entry.created_at ? String(entry.created_at).slice(0, 10) : '',
                description: String(entry.summary || entry.description || ''),
                coverImage: entry.coverImage ? String(entry.coverImage) : null,
            });
        });
    }, [posts]);
    const hasTimeline = timelineItems.length > 0;
    const hasCollections = collections.length > 0;
    const availableTabs = useMemo(() => {
        const tabs = ['activity'];
        if (hasTimeline)
            tabs.unshift('timeline');
        if (hasCollections)
            tabs.push('collections');
        return tabs;
    }, [hasCollections, hasTimeline]);
    useEffect(() => {
        if (!availableTabs.includes(profileTab)) {
            setProfileTab(availableTabs[0] || 'activity');
        }
    }, [availableTabs, profileTab]);
    const localStyles = useMemo(() => StyleSheet.create({
        profileLeftColumn: {
            width: 132,
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexShrink: 0,
        },
        profileIdentityUnderAvatar: {
            marginTop: 10,
            width: '100%',
            alignItems: 'center',
            gap: 4,
        },
        profileRightColumn: {
            flex: 1,
            alignItems: 'flex-end',
            justifyContent: 'center',
            minWidth: 0,
        },
        profileCategoryCompact: {
            alignItems: 'center',
            gap: 4,
            minWidth: 70,
        },
        profileCategoryCompactText: {
            fontSize: 12,
            color: colors.primaryColor,
        },
        followButton: {
            marginTop: 16,
            paddingVertical: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: (summary === null || summary === void 0 ? void 0 : summary.is_following) ? colors.btnBackgroundColor : colors.primaryColor,
        },
        followButtonText: {
            fontSize: 14,
            color: (summary === null || summary === void 0 ? void 0 : summary.is_following) ? colors.primaryColor : colors.whiteColor,
        },
    }), [colors, summary === null || summary === void 0 ? void 0 : summary.is_following]);
    if (isInitialLoading) {
        return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Profile') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(View, Object.assign({ style: Styles.emptyProfileContainer }, { children: [_jsx(ActivityIndicator, { size: "large", color: colors.primaryColor }), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: Styles.emptyProfileTitle }, { children: t('Loading...') }))] }))] })));
    }
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "view-user-profile-screen" }, { children: [!isInitialLoading ? (_jsx(View, { testID: "e2e-perf-ready-view-user-profile", style: { position: 'absolute', width: 1, height: 1, opacity: 0 } })) : null, _jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Profile') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: Styles.profileCard }, { children: [_jsxs(View, Object.assign({ style: Styles.profileTopRow }, { children: [_jsxs(View, Object.assign({ style: localStyles.profileLeftColumn }, { children: [_jsx(View, Object.assign({ style: Styles.profileImageContainer }, { children: _jsx(View, Object.assign({ style: Styles.profileImageInner }, { children: profileImageUrl ? (_jsx(FastImage, { source: { uri: profileImageUrl }, style: Styles.profileImage, resizeMode: "cover" })) : (_jsx(FastImage, { source: Images.profilePic, style: Styles.profileImage, resizeMode: "cover" })) })) })), _jsxs(View, Object.assign({ style: localStyles.profileIdentityUnderAvatar }, { children: [_jsx(Text, Object.assign({ style: [Styles.userName, { textAlign: 'center' }], numberOfLines: 2 }, { children: displayName })), displayHandle.length > 0 ? (_jsxs(Text, Object.assign({ style: [Styles.userHandleInline, { textAlign: 'center' }], numberOfLines: 1 }, { children: ["@", displayHandle] }))) : null] }))] })), _jsx(View, Object.assign({ style: localStyles.profileRightColumn }, { children: _jsxs(View, Object.assign({ style: Styles.statsContainerRight }, { children: [_jsxs(View, Object.assign({ style: Styles.statItem }, { children: [_jsx(Text, Object.assign({ style: Styles.statValue }, { children: (_j = summary === null || summary === void 0 ? void 0 : summary.followers_count) !== null && _j !== void 0 ? _j : 0 })), _jsx(Text, Object.assign({ style: Styles.statLabel }, { children: t('Followers') }))] })), _jsx(View, { style: Styles.statDivider }), profileCategoryLabel.length > 0 ? (_jsxs(View, Object.assign({ style: localStyles.profileCategoryCompact }, { children: [_jsx(SportFocusIcon, { focusId: activeFocus, size: 20, color: colors.primaryColor }), _jsx(Text, Object.assign({ style: localStyles.profileCategoryCompactText }, { children: activeFocus === 'support' ? supportProfileBadgeLabel : profileCategoryLabel }))] }))) : null] })) }))] })), followAllowed && (_jsx(TouchableOpacity, Object.assign({ style: localStyles.followButton, onPress: handleToggleFollow, disabled: isUpdatingFollow }, { children: isUpdatingFollow ? (_jsx(ActivityIndicator, { size: "small", color: (summary === null || summary === void 0 ? void 0 : summary.is_following) ? colors.primaryColor : colors.whiteColor })) : (_jsx(Text, Object.assign({ style: localStyles.followButtonText }, { children: (summary === null || summary === void 0 ? void 0 : summary.is_following) ? t('Following') : t('Follow') }))) }))), _jsxs(View, Object.assign({ style: Styles.bioSection }, { children: [_jsx(View, Object.assign({ style: Styles.bioHeader }, { children: _jsx(Text, Object.assign({ style: Styles.bioTitle }, { children: t('Bio') })) })), _jsx(Text, Object.assign({ style: Styles.bioText }, { children: bioText })), _jsx(View, { style: Styles.bioDivider })] })), activeFocus === 'support' ? (_jsx(View, Object.assign({ style: Styles.athleteMetaSection }, { children: _jsx(SupportProfileSummary, { role: supportRole, focuses: supportFocuses, t: t }) }))) : null, profileMetaItems.length > 0 && (_jsx(View, Object.assign({ style: Styles.athleteMetaSection }, { children: _jsx(View, Object.assign({ style: Styles.athleteMetaInlineBox }, { children: profileMetaItems.map((entry) => (_jsx(View, Object.assign({ style: Styles.athleteMetaPill }, { children: _jsx(Text, Object.assign({ style: Styles.athleteMetaPillText }, { children: entry.value })) }), entry.key))) })) }))), website.length > 0 ? (_jsx(View, Object.assign({ style: Styles.athleteMetaSection }, { children: _jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.8, onPress: openProfileWebsite }, { children: _jsx(Text, Object.assign({ style: [Styles.athleteMetaInlineValue, { color: colors.primaryColor, textDecorationLine: 'underline' }] }, { children: website })) })) }))) : null, visibleOfficialClubs.length > 1 ? (_jsxs(View, Object.assign({ style: Styles.membershipSection }, { children: [_jsx(Text, Object.assign({ style: Styles.membershipTitle }, { children: t('Official clubs') })), _jsx(View, Object.assign({ style: Styles.membershipWrap }, { children: visibleOfficialClubs.map((club) => (_jsxs(View, Object.assign({ style: Styles.membershipChip }, { children: [_jsx(Text, Object.assign({ style: Styles.membershipChipTitle, numberOfLines: 1 }, { children: club.title })), club.subtitle.length > 0 ? (_jsx(Text, Object.assign({ style: Styles.membershipChipMeta, numberOfLines: 1 }, { children: club.subtitle }))) : null] }), club.id))) }))] }))) : null, visibleGroups.length > 1 ? (_jsxs(View, Object.assign({ style: Styles.membershipSection }, { children: [_jsx(Text, Object.assign({ style: Styles.membershipTitle }, { children: t(activeFocus === 'support' ? 'Groups' : 'Community groups') })), _jsx(View, Object.assign({ style: Styles.membershipWrap }, { children: visibleGroups.map((group) => (_jsxs(TouchableOpacity, Object.assign({ style: Styles.membershipChip, activeOpacity: 0.85, onPress: () => navigation.navigate('GroupProfileScreen', { groupId: group.id, showBackButton: true }) }, { children: [_jsx(Text, Object.assign({ style: Styles.membershipChipTitle, numberOfLines: 1 }, { children: group.title })), group.subtitle.length > 0 ? (_jsx(Text, Object.assign({ style: Styles.membershipChipMeta, numberOfLines: 1 }, { children: group.subtitle }))) : null] }), group.id))) }))] }))) : null] })), _jsxs(View, Object.assign({ style: Styles.profileTabs }, { children: [hasTimeline && (_jsxs(TouchableOpacity, Object.assign({ style: [Styles.profileTab, profileTab === 'timeline' && Styles.profileTabActive], onPress: () => setProfileTab('timeline') }, { children: [_jsx(Clock, { size: 18, color: profileTab === 'timeline' ? colors.primaryColor : colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.profileTabText, profileTab === 'timeline' && Styles.profileTabTextActive] }, { children: t('Timeline') }))] }))), _jsxs(TouchableOpacity, Object.assign({ style: [Styles.profileTab, profileTab === 'activity' && Styles.profileTabActive], onPress: () => setProfileTab('activity') }, { children: [_jsx(DocumentText, { size: 18, color: profileTab === 'activity' ? colors.primaryColor : colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.profileTabText, profileTab === 'activity' && Styles.profileTabTextActive] }, { children: t('News') }))] })), hasCollections && (_jsxs(TouchableOpacity, Object.assign({ style: [Styles.profileTab, profileTab === 'collections' && Styles.profileTabActive], onPress: () => setProfileTab('collections') }, { children: [_jsx(Gallery, { size: 18, color: profileTab === 'collections' ? colors.primaryColor : colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.profileTabText, profileTab === 'collections' && Styles.profileTabTextActive] }, { children: t('Collections') }))] })))] })), profileTab === 'timeline' && (_jsx(ProfileTimeline, { title: t('Timeline'), items: timelineItems, onPressItem: (item) => navigation.navigate('ProfileTimelineDetailScreen', { item, ownerName: displayName }) })), profileTab === 'activity' && (_jsx(ProfileNewsSection, { styles: Styles, sectionTitle: t('News'), items: activityItems, emptyText: t('No news yet.'), blogLabel: t('Blog'), photoLabel: t('Photo'), videoLabel: t('Video'), onPressItem: (item) => {
                            if (item.kind === 'photo' && item.mediaId) {
                                navigation.navigate('PhotoDetailScreen', {
                                    eventTitle: item.title,
                                    media: { id: item.mediaId, type: 'image' },
                                });
                                return;
                            }
                            if (item.kind === 'video' && item.mediaId) {
                                navigation.navigate('VideoPlayingScreen', {
                                    video: {
                                        media_id: item.mediaId,
                                        title: item.title,
                                        thumbnail: item.coverImage ? { uri: String(item.coverImage) } : undefined,
                                        uri: '',
                                    },
                                });
                                return;
                            }
                            navigation.navigate('ViewUserBlogDetailsScreen', {
                                postId: item.id,
                                postPreview: {
                                    title: item.title,
                                    date: item.date,
                                    description: item.description,
                                    coverImage: item.coverImage,
                                },
                            });
                        } })), profileTab === 'collections' && (_jsxs(View, Object.assign({ style: Styles.collectionsSection }, { children: [_jsx(View, Object.assign({ style: Styles.sectionHeader }, { children: _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Collections') })) })), _jsxs(View, Object.assign({ style: Styles.toggleContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [Styles.toggleButton, activeTab === 'photos' && Styles.toggleButtonActive], onPress: () => setActiveTab('photos') }, { children: _jsx(Text, Object.assign({ style: activeTab === 'photos' ? Styles.toggleTextActive : Styles.toggleText }, { children: t('Photos') })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.toggleButton, activeTab === 'videos' && Styles.toggleButtonActive], onPress: () => setActiveTab('videos') }, { children: _jsx(Text, Object.assign({ style: activeTab === 'videos' ? Styles.toggleTextActive : Styles.toggleText }, { children: t('Videos') })) }))] })), activeTab === 'photos' ? (_jsx(View, Object.assign({ style: Styles.collectionsGrid }, { children: visibleCollections.map((c, idx) => {
                                    const thumb = c.cover_thumbnail_url ? toAbsoluteUrl(String(c.cover_thumbnail_url)) : null;
                                    const thumbUrl = thumb ? (withAccessToken(thumb) || thumb) : null;
                                    return (_jsx(TouchableOpacity, Object.assign({ onPress: () => {
                                            if (c.cover_media_id) {
                                                navigation.navigate('PhotoDetailScreen', {
                                                    eventTitle: c.name || t('Collection'),
                                                    media: { id: c.cover_media_id, type: 'photo' },
                                                });
                                            }
                                        } }, { children: thumbUrl ? (_jsx(FastImage, { source: { uri: String(thumbUrl) }, style: [Styles.collectionImage, { width: imageWidth }], resizeMode: "cover" })) : (_jsx(View, { style: [Styles.collectionImage, { width: imageWidth, backgroundColor: colors.btnBackgroundColor }] })) }), String(c.id || idx)));
                                }) }))) : (_jsx(View, Object.assign({ style: Styles.videosGrid }, { children: visibleCollections.map((c, idx) => {
                                    const thumb = c.cover_thumbnail_url ? toAbsoluteUrl(String(c.cover_thumbnail_url)) : null;
                                    const thumbUrl = thumb ? (withAccessToken(thumb) || thumb) : null;
                                    return (_jsxs(TouchableOpacity, Object.assign({ style: Styles.videoCard, onPress: () => {
                                            if (c.cover_media_id) {
                                                navigation.navigate('PhotoDetailScreen', {
                                                    eventTitle: c.name || t('Collection'),
                                                    media: { id: c.cover_media_id, type: 'video' },
                                                });
                                            }
                                        } }, { children: [_jsx(View, Object.assign({ style: Styles.videoThumbnailContainer }, { children: thumbUrl ? (_jsx(FastImage, { source: { uri: String(thumbUrl) }, style: Styles.videoThumbnail, resizeMode: "cover" })) : (_jsx(View, { style: [Styles.videoThumbnail, { backgroundColor: colors.btnBackgroundColor }] })) })), _jsx(Text, Object.assign({ style: Styles.videoCardTitle }, { children: c.name }))] }), String(c.id || idx)));
                                }) })))] }))), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default ViewUserProfileScreen;
